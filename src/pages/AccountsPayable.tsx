import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { costService } from "@/services/costService";
import { supabase } from "@/lib/supabase";
import { PlannedTransactionList } from "@/components/financial/PlannedTransactionList";
import { TransactionPaymentDialog } from "@/components/financial/TransactionPaymentDialog";
import { CostAnalysis } from "@/components/costs/CostAnalysis";
import { NewCostSheet } from "@/components/costs/NewCostSheet";
import { CostHistorySheet } from "@/components/costs/CostHistorySheet";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, ListTodo } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { DateRange } from 'react-day-picker';
import type { OperationalCost } from '@/types/costs';

export const AccountsPayable = () => {
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });

    // States for Management & History
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [historyCostId, setHistoryCostId] = useState<string | null>(null);
    const [costToDelete, setCostToDelete] = useState<string | null>(null);

    // --- Queries ---

    // 1. Fetch Planned Payments for Management Tab
    // Let's use the month/year from selectedDate.from for the management query.
    const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
        queryKey: ['payable-payments', selectedDate?.from?.toISOString(), selectedDate?.to?.toISOString()],
        queryFn: () => {
            if (selectedDate?.from && selectedDate?.to) {
                return costService.getPayablePayments(
                    format(selectedDate.from, 'yyyy-MM-dd'),
                    format(selectedDate.to, 'yyyy-MM-dd')
                );
            }

            const month = selectedDate?.from ? selectedDate.from.getMonth() + 1 : new Date().getMonth() + 1;
            const year = selectedDate?.from ? selectedDate.from.getFullYear() : new Date().getFullYear();
            return costService.getPayablePayments(month, year);
        }
    });

    // 2. Fetch All Costs for Analysis Tab
    const { data: allCosts = [] } = useQuery({
        queryKey: ['operationalCosts', 'all'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('operational_costs')
                .select('*')
                .order('expense_date', { ascending: false });

            if (error) throw error;
            return data as OperationalCost[];
        }
    });

    // --- Mutations ---
    const { mutate: deleteCost } = useMutation({
        mutationFn: async (id: string) => costService.deleteCost(id),
        onSuccess: () => {
            toast.success("Despesa removida");
            setCostToDelete(null);
            queryClient.invalidateQueries({ queryKey: ["operationalCosts"] });
            queryClient.invalidateQueries({ queryKey: ["payable-payments"] });
        },
        onError: (error: any) => {
            toast.error("Erro ao excluir: " + error.message);
        }
    });

    // --- Mappings ---
    const plannedItems = useMemo(() => payments.map((p: any) => ({
        id: p.id,
        description: p.description,
        amount: p.amount_original,
        due_date: p.due_date,
        status: p.status,
        type: 'payable' as const,
        category: p.category
    })), [payments]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1 hidden md:block">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Finanças a Pagar</h1>
                    <p className="text-zinc-400">Controle pagamentos individuais e analise seus custos fixos e variáveis.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="w-full md:w-auto h-10 bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold uppercase tracking-wider shadow-md transition-all hover:scale-[1.02]"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        NOVA DESPESA
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="management" className="space-y-6">
                <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 h-12 flex w-full md:w-auto md:inline-flex">
                    <TabsTrigger
                        value="management"
                        className="flex-1 md:flex-initial data-[state=active]:bg-zinc-800 data-[state=active]:text-yellow-500 px-3 md:px-6 font-medium gap-2 transition-all"
                    >
                        <ListTodo className="h-4 w-4 shrink-0" />
                        <span className="truncate">Gestão</span>
                        <span className="hidden sm:inline">de Pagamentos</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="analysis"
                        className="flex-1 md:flex-initial data-[state=active]:bg-zinc-800 data-[state=active]:text-yellow-500 px-3 md:px-6 font-medium gap-2 transition-all"
                    >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        <span className="truncate">Análise</span>
                        <span className="hidden sm:inline">de Custos</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="management" className="m-0 focus-visible:outline-none">
                    <PlannedTransactionList
                        items={plannedItems}
                        isLoading={isLoadingPayments}
                        title={`Compromissos de ${selectedDate?.from ? format(selectedDate.from, 'MMMM', { locale: ptBR }) : '...'}`}
                        onPay={(item) => {
                            setSelectedItem(item);
                            setIsPaymentDialogOpen(true);
                        }}
                        dateRange={selectedDate}
                        onDateRangeChange={setSelectedDate}
                    />
                </TabsContent>

                <TabsContent value="analysis" className="m-0 focus-visible:outline-none">
                    <CostAnalysis
                        costs={allCosts}
                        selectedDate={selectedDate}
                        onViewHistory={setHistoryCostId}
                        onDelete={setCostToDelete}
                    />
                </TabsContent>
            </Tabs>

            {/* Dialogs & Sheets */}
            <NewCostSheet
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
            />

            <CostHistorySheet
                open={!!historyCostId}
                onOpenChange={(open) => !open && setHistoryCostId(null)}
                costId={historyCostId}
                allCosts={allCosts}
            />

            <TransactionPaymentDialog
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
                item={selectedItem}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!costToDelete} onOpenChange={(open) => !open && setCostToDelete(null)}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Excluir Despesa?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Tem certeza que deseja excluir esta despesa?
                            <br /><br />
                            <span className="text-red-400 font-medium">Atenção:</span> A despesa e todas as contas associadas a ela serão apagadas permanentemente. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => costToDelete && deleteCost(costToDelete)}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                        >
                            Excluir Permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AccountsPayable;
