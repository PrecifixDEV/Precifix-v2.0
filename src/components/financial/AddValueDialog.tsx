import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BankLogo } from "@/components/ui/bank-logo";
import { Wallet, CheckCircle2, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { financialService } from "@/services/financialService";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FinancialAccount } from "@/types/costs";
import { cn } from "@/lib/utils";
import { CategoryTreeSelect } from "@/components/ui/category-tree-select";
import { financialCategoriesService, type FinancialCategory } from "@/services/financialCategoriesService";
import { paymentMethodsService } from "@/services/paymentMethodsService";
import { SleekDatePicker } from "@/components/ui/sleek-date-picker";

interface AddValueDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: FinancialAccount[];
    type?: 'credit' | 'debit'; // Default to credit (Entrada)
}

export function AddValueDialog({ open, onOpenChange, accounts, type = 'credit' }: AddValueDialogProps) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);

    // Form State
    const [accountId, setAccountId] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());

    const isCredit = type === 'credit';
    const title = isCredit ? "Nova Entrada de Valor" : "Nova Saída de Valor";
    const actionLabel = isCredit ? "Confirmar Entrada" : "Confirmar Saída";
    const ThemeIcon = isCredit ? ArrowUpRight : ArrowDownRight;
    const themeColor = isCredit ? "text-emerald-600" : "text-red-600";
    const themeBg = isCredit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700";

    // --- Data Fetching ---
    const { data: configuredCategories } = useQuery({
        queryKey: ['financial_categories'],
        queryFn: financialCategoriesService.getAll,
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    const { data: paymentMethods } = useQuery({
        queryKey: ['payment_methods'],
        queryFn: paymentMethodsService.getAll,
        staleTime: 1000 * 60 * 60 // 1 hour
    });

    // --- Derived Data ---
    const categoryTree = useMemo(() => {
        const cats = (configuredCategories || []) as FinancialCategory[];
        if (!cats.length) return [];

        // Filter by Scope (INCOME for credit, EXPENSE for debit)
        const targetScope = isCredit ? 'INCOME' : 'EXPENSE';
        const scopedCats = cats.filter(c => c.scope === targetScope);

        // Roots are those without parent_id (or parent not in filtered list? No, parent should match scope usually)
        // Adjust: Ensure parents have correct scope too.
        const roots = scopedCats.filter(c => !c.parent_id);

        return roots.map(root => {
            const children = scopedCats.filter(c => c.parent_id === root.id);
            return {
                id: root.id,
                label: root.name,
                subcategories: children.map(child => ({
                    id: child.id,
                    label: child.name
                })).sort((a, b) => a.label.localeCompare(b.label))
            };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }, [configuredCategories, isCredit]);

    const handleConfirm = async () => {
        if (!accountId || !amount || !paymentMethod || !description || !category || !transactionDate) {
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
                description: description,
                category: category,
                payment_method: paymentMethod,
                amount: numAmount,
                type: type,
                transaction_date: transactionDate.toISOString(),
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
            toast.error("Erro ao registrar transação");
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
            setDescription("");
            setCategory("");
            setTransactionDate(new Date());
        }, 300);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        value = (Number(value) / 100).toFixed(2);
        value = value.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        setAmount(value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 70) {
            setDescription(value);
        }
    };

    const selectedAcc = accounts.find(a => a.id === accountId);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
                {step === 'form' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-center pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-2">
                                <ThemeIcon className={cn("h-5 w-5", themeColor)} />
                                {title}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col py-4 space-y-5">
                            {/* Bank Selector (Visual) */}
                            <div className="w-full space-y-2 text-center">
                                <Label>Conta de {isCredit ? 'Destino' : 'Origem'}</Label>
                                <div className="flex justify-center">
                                    {selectedAcc ? (
                                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                            {selectedAcc.type === 'bank' && selectedAcc.bank_code ? (
                                                <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-700 shadow-md mb-2">
                                                    <BankLogo bankCode={selectedAcc.bank_code} className="h-8 w-8" showName={false} fullBleed />
                                                </div>
                                            ) : (
                                                <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-md border border-emerald-200 dark:border-emerald-800 mb-2">
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
                                    <Label>Descrição <span className="text-xs text-muted-foreground ml-1">({description.length}/70)</span></Label>
                                    <Input
                                        placeholder="Ex: Pagamento Fornecedor X"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Categoria</Label>
                                        <CategoryTreeSelect
                                            data={categoryTree}
                                            value={category}
                                            onSelect={setCategory}
                                            placeholder="Selecione..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Data da Transação</Label>
                                        <SleekDatePicker
                                            date={transactionDate}
                                            onSelect={setTransactionDate}
                                            placeholder="Data da Transação"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Forma de Pagamento</Label>
                                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentMethods?.map(pm => (
                                                    <SelectItem key={pm.id} value={pm.name}>{pm.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1 relative">
                                        <Label className="block text-zinc-500">Valor</Label>
                                        <div className="relative">
                                            <span className={cn("absolute left-3 top-1/2 -translate-y-1/2 font-bold text-lg", themeColor)}>R$</span>
                                            <Input
                                                value={amount}
                                                onChange={handleAmountChange}
                                                placeholder="0,00"
                                                className={cn("text-lg font-bold pl-10 h-10", themeColor)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="sm:justify-center">
                            <Button
                                onClick={handleConfirm}
                                disabled={!accountId || !amount || !paymentMethod || !description || !category || !transactionDate || loading}
                                className={cn("w-full text-white transition-colors", themeBg)}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                    <>
                                        <ThemeIcon className="mr-2 h-4 w-4" />
                                        {actionLabel}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className={cn("h-16 w-16 rounded-full flex items-center justify-center mb-2", isCredit ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30")}>
                            <CheckCircle2 className={cn("h-8 w-8", isCredit ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500")} />
                        </div>
                        <h2 className="text-xl font-bold text-center">{isCredit ? "Entrada Registrada!" : "Saída Registrada!"}</h2>
                        <p className="text-center text-muted-foreground text-sm px-4">
                            {isCredit ? "Entrada" : "Saída"} de <strong className="text-zinc-900 dark:text-zinc-100">R$ {amount}</strong> registrada com sucesso.
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
