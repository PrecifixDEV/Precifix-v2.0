
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Search, Filter } from "lucide-react";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { TablePagination } from "@/components/ui/table-pagination";
import type { OperationalCostPayment } from "@/types/billing";
import type { OperationalCost } from "@/types/costs";

interface AccountsPayableTableProps {
    month: number;
    year: number;
}

// "Virtual" Payment Type for UI merging
interface VirtualPayment {
    id: string; // Real ID if exists, or generated string for virtual
    isVirtual: boolean;
    operational_cost_id: string | null;
    description: string;
    due_date: Date;
    amount: number;
    amount_paid: number | null;
    status: 'pending' | 'paid' | 'overdue' | 'open' | 'partially_paid'; // Added partially_paid
    original_cost?: OperationalCost;
    payment_record?: OperationalCostPayment;
}

export const AccountsPayableTable = ({ month, year }: AccountsPayableTableProps) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Dialog State
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<VirtualPayment | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch User
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const { data } = await supabase.auth.getUser();
            return data.user;
        }
    });

    // Fetch Global Operational Costs (Definitions)
    const { data: operationalCosts, isLoading: isLoadingCosts } = useQuery<OperationalCost[]>({
        queryKey: ['operationalCosts', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('operational_costs')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            // Cast the 'type' field from Supabase string to Union type
            return (data || []).map(item => ({
                ...item,
                type: item.type as 'fixed' | 'variable',
                recurrence_frequency: item.recurrence_frequency as OperationalCost['recurrence_frequency']
            })) as OperationalCost[];
        },
        enabled: !!user,
    });

    // Fetch Actual Payments for the selected Month/Year
    const { data: payments, isLoading: isLoadingPayments } = useQuery<OperationalCostPayment[]>({
        queryKey: ['operationalCostPayments', user?.id, month, year],
        queryFn: async () => {
            if (!user) return [];
            // Construct date range for the month
            const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
            // Last day of month
            const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('operational_cost_payments')
                .select('*')
                .eq('user_id', user.id)
                .gte('due_date', startDate)
                .lte('due_date', endDate);

            if (error) throw error;
            // Explicitly cast the 'status' field from Supabase string to Union type
            return (data || []).map(item => ({
                ...item,
                status: item.status as 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid'
            }));
        },
        enabled: !!user,
    });

    // Mutation to Register Payment (Turn virtual into real or update real)
    const payMutation = useMutation({
        mutationFn: async (paymentData: {
            operational_cost_id: string | null;
            description: string;
            due_date: string;
            amount_original: number;
            amount_paid: number;
            status: 'paid' | 'partially_paid';
            id?: string
        }) => {
            if (!user) throw new Error("User not found");

            const payload = {
                user_id: user.id,
                operational_cost_id: paymentData.operational_cost_id,
                description: paymentData.description,
                due_date: paymentData.due_date,
                amount_original: paymentData.amount_original,
                amount_paid: paymentData.amount_paid,
                payment_date: new Date().toISOString(),
                status: paymentData.status
            };

            if (paymentData.id) {
                // Update existing
                const { data, error } = await supabase
                    .from('operational_cost_payments')
                    .update(payload)
                    .eq('id', paymentData.id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                // Insert new (from virtual)
                const { data, error } = await supabase
                    .from('operational_cost_payments')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operationalCostPayments'] });
            toast.success("Pagamento registrado com sucesso!");
            setIsPaymentDialogOpen(false);
        },
        onError: (err) => {
            toast.error("Erro ao registrar pagamento: " + err.message);
        }
    });

    // Merge Logic
    const mergedData = useMemo(() => {
        if (!operationalCosts || !user) return [];

        const virtualList: VirtualPayment[] = [];
        const today = startOfDay(new Date());

        // Helper to check if a date matches the selected month/year
        const isInSelectedMonth = (dateStr: string | null | undefined) => {
            if (!dateStr) return false;
            const date = parseISO(dateStr);
            // getMonth is 0-indexed (0=Jan), but our prop 'month' is 1-indexed (1=Jan)
            return date.getMonth() + 1 === month && date.getFullYear() === year;
        };

        // 1. Iterate over all costs (instances) that match the selected month
        if (Array.isArray(operationalCosts)) {
            operationalCosts.forEach((cost: OperationalCost) => {
                // If it's a recurring expense instance or a one-time expense,
                // it should have an expense_date that places it in this month.
                if (isInSelectedMonth(cost.expense_date)) {
                    // Check if there is already a payment record for this specific cost instance
                    const existingPayment = payments?.find((p: OperationalCostPayment) => p.operational_cost_id === cost.id);

                    if (!existingPayment) {
                        // It's an open cost (not yet paid/registered in payments table)
                        let dueDate = cost.expense_date ? parseISO(cost.expense_date) : new Date(year, month - 1, 1);

                        let status: VirtualPayment['status'] = 'open';
                        if (isBefore(dueDate, today)) {
                            status = 'overdue';
                        }

                        virtualList.push({
                            id: `virtual-${cost.id}`,
                            isVirtual: true,
                            operational_cost_id: cost.id,
                            description: cost.description,
                            due_date: dueDate,
                            amount: cost.value,
                            amount_paid: null,
                            status: status,
                            original_cost: cost
                        });
                    }
                }
            });
        }

        // 2. Add Actual Payments
        // We include ALL payments found for this month (fetched by the query)
        // This covers cases where a payment exists but maybe the cost definition is somehow missing or distinct 
        // (though in theory every payment should match a cost if we only create payments from costs).
        // However, we want to avoid duplicates if we already processed a cost that has a payment.

        // Actually, simpler approach:
        // The payments query ('operationalCostPayments') already fetches payments for this month.
        // So we just mapped them.
        // We only need to check operationalCosts to find *unpaid* ones.
        // If a cost has a payment, `payments` query has it. We don't add it from `operationalCosts` loop.
        // If a cost has NO payment, we add it from `operationalCosts` loop as virtual.

        const realPaymentsList: VirtualPayment[] = (payments || []).map((p: OperationalCostPayment) => {
            const dueDate = parseISO(p.due_date);
            let status: VirtualPayment['status'] = p.status as any;
            if (status === 'pending' && isBefore(dueDate, today)) {
                status = 'overdue';
            }
            return {
                id: p.id,
                isVirtual: false,
                operational_cost_id: p.operational_cost_id,
                description: p.description,
                due_date: dueDate,
                amount: p.amount_original,
                amount_paid: p.amount_paid,
                status: status,
                payment_record: p
            };
        });

        // Combine: Real Payments + Virtual (Unpaid) Costs
        return [...realPaymentsList, ...virtualList].sort((a, b) => a.due_date.getTime() - b.due_date.getTime());

    }, [operationalCosts, payments, month, year, user]);

    // Filtering
    const filteredData = mergedData.filter(item => {
        const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'paid' && item.status === 'paid') ||
            (statusFilter === 'partially_paid' && item.status === 'partially_paid') ||
            (statusFilter === 'pending' && (item.status === 'pending' || item.status === 'open')) ||
            (statusFilter === 'overdue' && item.status === 'overdue');

        return matchesSearch && matchesStatus;
    });

    // Reset pagination when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, month, year]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openPaymentDialog = (item: VirtualPayment) => {
        setSelectedPayment(item);
        // Default amount is the amount paid if exists, otherwise the original amount
        setPaymentAmount(item.amount_paid ? item.amount_paid.toFixed(2) : item.amount.toFixed(2));
        setIsPaymentDialogOpen(true);
    };

    const handleConfirmPayment = () => {
        if (!selectedPayment) return;

        const paidValue = parseFloat(paymentAmount.replace(',', '.'));
        if (isNaN(paidValue) || paidValue < 0) {
            toast.error("Valor inválido");
            return;
        }

        const dateStr = format(selectedPayment.due_date, 'yyyy-MM-dd');

        // Determine status
        // If paidValue < amount -> partially_paid
        // If paidValue >= amount -> paid (we assume >= is full payment)
        // Note: Floating point comparison should be careful, but good enough for this check.
        const status = paidValue < selectedPayment.amount ? 'partially_paid' : 'paid';

        payMutation.mutate({
            id: selectedPayment.isVirtual ? undefined : selectedPayment.id,
            operational_cost_id: selectedPayment.operational_cost_id,
            description: selectedPayment.description,
            due_date: dateStr,
            amount_original: selectedPayment.amount,
            amount_paid: paidValue,
            status: status
        });
    };

    if (isLoadingCosts || isLoadingPayments) {
        return <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        placeholder="Buscar despesa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="paid">Paga</SelectItem>
                            <SelectItem value="partially_paid">Pago Parcial</SelectItem>
                            <SelectItem value="pending">Em aberto</SelectItem>
                            <SelectItem value="overdue">Atrasada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border bg-background shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-zinc-100 dark:bg-zinc-800">
                        <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Valor Original</TableHead>
                            <TableHead>Valor Pago</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell>
                                        {format(item.due_date, "dd/MM/yyyy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>R$ {item.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {item.amount_paid ? `R$ ${item.amount_paid.toFixed(2)}` : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.status === 'paid' || item.status === 'partially_paid' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => openPaymentDialog(item)}
                                                disabled={payMutation.isPending}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Editar
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => openPaymentDialog(item)}
                                                disabled={payMutation.isPending}
                                            >
                                                Pagar
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Nenhuma conta encontrada para este período.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
            />

            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Registrar Pagamento</DialogTitle>
                        <DialogDescription>
                            Confirme os dados do pagamento abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">
                                    Descrição
                                </Label>
                                <Input
                                    value={selectedPayment.description}
                                    disabled
                                    className="col-span-3 bg-muted"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">
                                    Vencimento
                                </Label>
                                <Input
                                    value={format(selectedPayment.due_date, "dd/MM/yyyy")}
                                    disabled
                                    className="col-span-3 bg-muted"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Valor Pago
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-yellow-500 hover:bg-yellow-600 text-foreground"
                            onClick={handleConfirmPayment}
                            disabled={payMutation.isPending}
                        >
                            {payMutation.isPending ? "Confirmando..." : "Confirmar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'paid':
            return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Paga</Badge>;
        case 'partially_paid':
            return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">Pago Parcial</Badge>;
        case 'overdue':
            return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Atrasada</Badge>;
        case 'pending':
        case 'open':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Em aberto</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};
