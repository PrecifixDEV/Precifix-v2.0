import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { financialService } from "@/services/financialService";
import { PlannedTransactionList } from "@/components/financial/PlannedTransactionList";
import { ReceivableFormSheet } from "@/components/financial/ReceivableFormSheet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { TransactionPaymentDialog } from "@/components/financial/TransactionPaymentDialog";

const AccountsReceivable = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['receivable-payments', selectedMonth, selectedYear],
        queryFn: () => financialService.getReceivablePayments(selectedMonth, selectedYear)
    });

    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).sort((a, b) => b - a);
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR }),
    }));

    // Adapt payments to PlannedItem type
    const plannedItems = payments.map((p: any) => ({
        id: p.id,
        description: p.description,
        amount: p.amount_original,
        due_date: p.due_date,
        status: p.status,
        type: 'receivable' as const,
        category: p.category
    }));

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Contas a Receber</h1>
                    <p className="text-zinc-400">Gerencie suas previsões de entrada e recebimentos.</p>
                </div>
                <Button
                    onClick={() => setIsSheetOpen(true)}
                    className="w-full md:w-auto h-10 bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold uppercase tracking-wider shadow-md transition-all hover:scale-[1.02]"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Novo Recebível
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                        {months.map(m => (
                            <SelectItem key={m.value} value={m.value.toString()} className="capitalize">
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-[100px] bg-zinc-950 border-zinc-800">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                        {years.map(y => (
                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <PlannedTransactionList
                items={plannedItems}
                isLoading={isLoading}
                title="Movimentações Previstas"
                onPay={(item) => {
                    setSelectedItem(item);
                    setIsPaymentDialogOpen(true);
                }}
            />

            <ReceivableFormSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />

            <TransactionPaymentDialog
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
                item={selectedItem}
            />
        </div>
    );
};

export default AccountsReceivable;
