import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { financialService } from "@/services/financialService";
import { toast } from "sonner";
import { formatMoney } from "@/utils/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote } from "lucide-react";

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
            // Default to first account if available
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

            // Invalidate all relevant queries
            queryClient.invalidateQueries({ queryKey: ['payable-payments'] });
            queryClient.invalidateQueries({ queryKey: ['receivable-payments'] });
            queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });

            onOpenChange(false);
        } catch (error: any) {
            toast.error("Erro ao processar: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-zinc-100">
                        {item.type === 'payable' ? (
                            <>
                                <Banknote className="h-5 w-5 text-red-500" />
                                Confirmar Pagamento
                            </>
                        ) : (
                            <>
                                <Banknote className="h-5 w-5 text-emerald-500" />
                                Confirmar Recebimento
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {item.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Valor Total</span>
                        <span className="text-xl font-bold font-mono text-zinc-100">
                            {formatMoney(item.amount)}
                        </span>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="account">Conta Bancária</Label>
                        <Select value={accountId} onValueChange={setAccountId}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Selecione uma conta..." />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color || '#888' }} />
                                            {acc.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Data</Label>
                            <Input
                                id="date"
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Valor Pago</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
                                className="bg-zinc-900 border-zinc-800"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || !accountId}
                        className={item.type === 'payable' ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
                    >
                        {isLoading ? "Processando..." : "Confirmar e Registrar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
