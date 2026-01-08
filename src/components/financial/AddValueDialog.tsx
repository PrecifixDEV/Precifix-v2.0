import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BankLogo } from "@/components/ui/bank-logo";
import { Wallet, CheckCircle2, Loader2, ArrowUpRight } from "lucide-react";
import { financialService } from "@/services/financialService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { FinancialAccount } from "@/types/costs";

interface AddValueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: FinancialAccount[];
}

export function AddValueDialog({ open, onOpenChange, accounts }: AddValueDialogProps) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);

    // State
    const [accountId, setAccountId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("");

    const handleConfirm = async () => {
        if (!accountId || !amount || !paymentMethod) {
            toast.error("Preencha todos os campos");
            return;
        }

        const numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error("Valor inválido");
            return;
        }

        try {
            setLoading(true);

            // Create Transaction
            await financialService.createTransaction({
                description: `Entrada: ${paymentMethod}`,
                amount: numAmount,
                type: 'credit',
                transaction_date: new Date().toISOString(),
                account_id: accountId,
            });

            await queryClient.invalidateQueries({ queryKey: ['commercial_accounts'] });
            await queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
            setStep('success');

            setTimeout(() => {
                handleClose();
            }, 3000);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao adicionar valor");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setStep('form');
            setAccountId("");
            setAmount("");
            setPaymentMethod("");
        }, 300);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        value = (Number(value) / 100).toFixed(2);
        value = value.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setAmount(value);
    };

    const selectedAcc = accounts.find(a => a.id === accountId);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">Adicionar Valor</DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col items-center py-4 space-y-6">
                            {/* Bank Selector (Visual) */}
                            <div className="w-full space-y-2 text-center">
                                <Label>Destino</Label>
                                <div className="flex justify-center">
                                    {selectedAcc ? (
                                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                            {selectedAcc.type === 'bank' && selectedAcc.bank_code ? (
                                                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700 shadow-md mb-2">
                                                    <BankLogo bankCode={selectedAcc.bank_code} className="h-10 w-10" showName={false} fullBleed />
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-md border border-emerald-200 dark:border-emerald-800 mb-2">
                                                    <Wallet className="h-8 w-8" />
                                                </div>
                                            )}
                                            <span className="font-medium text-sm">{selectedAcc.name}</span>
                                            <Button variant="link" size="sm" onClick={() => setAccountId("")} className="h-auto p-0 text-xs text-muted-foreground">Alterar</Button>
                                        </div>
                                    ) : (
                                        <Select value={accountId} onValueChange={setAccountId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecione a conta" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="w-full space-y-4">
                                <div className="space-y-1">
                                    <Label>Forma de Pagamento</Label>
                                    <Input
                                        placeholder="Ex: PIX, Dinheiro, Cartão"
                                        value={paymentMethod}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label>Valor do aporte</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                                        <Input
                                            value={amount}
                                            onChange={handleAmountChange}
                                            placeholder="0,00"
                                            className="text-lg font-bold pl-8"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-center">
                            <Button
                                onClick={handleConfirm}
                                disabled={!accountId || !amount || !paymentMethod || loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <>
                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                        Confirmar Entrada
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-center">Valor Adicionado!</h2>
                        <p className="text-center text-muted-foreground text-sm px-4">
                            Entrada de <strong className="text-slate-900 dark:text-slate-100">R$ {amount}</strong> registrada com sucesso.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
