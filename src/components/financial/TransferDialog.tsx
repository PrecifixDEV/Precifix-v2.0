import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BankLogo } from "@/components/ui/bank-logo";
import { ArrowRight, Wallet, CheckCircle2, Loader2 } from "lucide-react";
import { financialService } from "@/services/financialService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { FinancialAccount } from "@/types/costs";
import { cn } from "@/lib/utils";

interface TransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: FinancialAccount[];
}

export function TransferDialog({ open, onOpenChange, accounts }: TransferDialogProps) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);

    // State
    const [fromAccount, setFromAccount] = useState<string>("");
    const [toAccount, setToAccount] = useState<string>("");
    const [amount, setAmount] = useState<string>("");

    const handleTransfer = async () => {
        if (!fromAccount || !toAccount || !amount) {
            toast.error("Preencha todos os campos");
            return;
        }
        if (fromAccount === toAccount) {
            toast.error("A conta de origem e destino não podem ser a mesma");
            return;
        }

        const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Valor inválido");
            return;
        }

        // Find source account to check balance (optional but good UI)
        const sourceAcc = accounts.find(a => a.id === fromAccount);
        if (sourceAcc && Number(sourceAcc.current_balance) < numAmount) {
            if (!confirm("Saldo insuficiente na conta de origem. Deseja continuar mesmo assim (saldo ficará negativo)?")) return;
        }

        try {
            setLoading(true);
            await financialService.transferFunds(fromAccount, toAccount, numAmount);
            await queryClient.invalidateQueries({ queryKey: ['commercial_accounts'] });
            await queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
            setStep('success'); // Show success animation

            // Close after delay
            setTimeout(() => {
                handleClose();
            }, 3000);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao realizar transferência");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after transition
        setTimeout(() => {
            setStep('form');
            setFromAccount("");
            setToAccount("");
            setAmount("");
        }, 300);
    };

    const getAccountIcon = (accountId: string) => {
        const acc = accounts.find(a => a.id === accountId);
        if (!acc) return null;

        if (acc.type === 'bank' && acc.bank_code) {
            return (
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm">
                    <BankLogo bankCode={acc.bank_code} className="h-8 w-8" showName={false} fullBleed />
                </div>
            )
        }
        return (
            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-800">
                <Wallet className="h-6 w-6" />
            </div>
        )
    };

    const fromAccData = accounts.find(a => a.id === fromAccount);
    const toAccData = accounts.find(a => a.id === toAccount);

    // Format currency input
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        value = (Number(value) / 100).toFixed(2);
        value = value.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setAmount(value);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">Transferência entre Contas</DialogTitle>
                        </DialogHeader>

                        {/* Visual Transfer Flow */}
                        <div className="flex items-center justify-center gap-4 py-6">
                            {/* FROM */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={cn("transition-all duration-300 transform", fromAccount ? "scale-100" : "scale-90 opacity-50 grayscale")}>
                                    {fromAccount ? getAccountIcon(fromAccount) : (
                                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                                            <span className="text-xs text-slate-400">De</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-medium max-w-[80px] truncate text-center min-h-[16px]">
                                    {fromAccData?.name || "Origem"}
                                </span>
                            </div>

                            {/* ARROW */}
                            <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                                <ArrowRight className="h-6 w-6" />
                            </div>

                            {/* TO */}
                            <div className="flex flex-col items-center gap-2">
                                <div className={cn("transition-all duration-300 transform", toAccount ? "scale-100" : "scale-90 opacity-50 grayscale")}>
                                    {toAccount ? getAccountIcon(toAccount) : (
                                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                                            <span className="text-xs text-slate-400">Para</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-medium max-w-[80px] truncate text-center min-h-[16px]">
                                    {toAccData?.name || "Destino"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 px-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>De:</Label>
                                    <Select value={fromAccount} onValueChange={setFromAccount}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id} disabled={acc.id === toAccount}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Para:</Label>
                                    <Select value={toAccount} onValueChange={setToAccount}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id} disabled={acc.id === fromAccount}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-center block">Valor a transferir</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                                    <Input
                                        value={amount}
                                        onChange={handleAmountChange}
                                        placeholder="0,00"
                                        className="text-center text-lg font-bold pl-8"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-4 sm:justify-center">
                            <Button
                                onClick={handleTransfer}
                                disabled={!fromAccount || !toAccount || !amount || loading}
                                className="w-full sm:w-auto min-w-[150px]"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Transferência"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-center">Transferência Realizada!</h2>
                        <p className="text-center text-muted-foreground text-sm px-4">
                            Valor de <strong className="text-slate-900 dark:text-slate-100">R$ {amount}</strong> transferido com sucesso.
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                            <span>{fromAccData?.name}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span>{toAccData?.name}</span>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
