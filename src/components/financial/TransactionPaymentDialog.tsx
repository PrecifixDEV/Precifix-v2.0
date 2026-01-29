import { useState, useEffect } from "react";
import { StandardDrawer } from "@/components/ui/StandardDrawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { financialService } from "@/services/financialService";
import { toast } from "sonner";
import { formatMoney } from "@/utils/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface TransactionPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: {
        id: string;
        description: string;
        amount: number;
        type: 'payable' | 'receivable';
    } | null;
}

export function TransactionPaymentDialog({ open, onOpenChange, item }: TransactionPaymentDialogProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [accountId, setAccountId] = useState<string>("");
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [amountPaid, setAmountPaid] = useState<number>(0);

    const { data: accounts = [] } = useQuery({
        queryKey: ['financial-accounts'],
        queryFn: () => financialService.getAccounts()
    });

    useEffect(() => {
        if (item) {
            setAmountPaid(item.amount);
            if (accounts.length > 0 && !accountId) {
                setAccountId(accounts[0].id);
            }
        }
    }, [item, accounts]);

    const handleConfirm = async () => {
        if (!item || !accountId) {
            toast.error("Selecione uma conta bancária.");
            return;
        }

        setIsLoading(true);
        try {
            await financialService.registerPayment({
                type: item.type,
                id: item.id,
                accountId,
                amountPaid,
                paymentDate,
            });

            toast.success(item.type === 'payable' ? "Pagamento registrado!" : "Recebimento registrado!");

            queryClient.invalidateQueries({ queryKey: ['payable-payments'] });
            queryClient.invalidateQueries({ queryKey: ['receivable-payments'] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });

            onOpenChange(false);
        } catch (error: any) {
            toast.error("Erro ao processar: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!item) return null;

    return (
        <StandardDrawer
            open={open}
            onOpenChange={onOpenChange}
            title={item.type === 'payable' ? "Confirmar Pagamento" : "Confirmar Recebimento"}
            onSave={handleConfirm}
            isLoading={isLoading}
            saveLabel="Confirmar Lançamento"
        >
            <div className="space-y-5">
                <p className="text-zinc-500 text-[11px] font-medium text-center -mt-2 mb-2">
                    {item.description}
                </p>

                <div className="p-4 rounded-xl bg-black border border-zinc-800/50 flex justify-between items-center shadow-inner">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Valor Previsto</span>
                    <span className="text-xl font-bold font-mono text-white">
                        {formatMoney(item.amount)}
                    </span>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Conta Financeira</Label>
                    <Select value={accountId} onValueChange={setAccountId}>
                        <SelectTrigger className="bg-black border-zinc-800 h-10 rounded-lg text-zinc-200">
                            <SelectValue placeholder="Selecione uma conta..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800">
                            {accounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: acc.color || '#888' }} />
                                        <span className="font-semibold text-sm">{acc.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Data</Label>
                        <Input
                            id="date"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="bg-black border-zinc-800 h-10 rounded-lg text-zinc-200 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Valor Pago</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
                            className="bg-black border-zinc-800 h-10 rounded-lg font-mono text-zinc-200 text-sm"
                        />
                    </div>
                </div>
            </div>
        </StandardDrawer>
    );
}
