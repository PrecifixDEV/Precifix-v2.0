import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Landmark, Wallet, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { financialService } from "@/services/financialService";
import { BRAZILIAN_BANKS } from "@/constants/banks";
import { BankLogo } from "@/components/ui/bank-logo";
import { cn } from "@/lib/utils";

interface AccountFormDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function AccountFormDialog({ open, onOpenChange, trigger }: AccountFormDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // Form State
    const [name, setName] = useState("");
    const [type, setType] = useState<'bank' | 'cash' | 'wallet'>('bank');
    const [balance, setBalance] = useState("");
    const [selectedBankCode, setSelectedBankCode] = useState("");

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        if (!newOpen) {
            // Reset form
            setName("");
            setType("bank");
            setBalance("");
            setSelectedBankCode("");
        }
        onOpenChange?.(newOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) {
            toast.error("Digite o nome da conta");
            return;
        }

        if (type === 'bank' && !selectedBankCode) {
            toast.error("Selecione o banco");
            return;
        }

        setLoading(true);
        try {
            const numericBalance = parseFloat(balance.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
            const bankInfo = BRAZILIAN_BANKS.find(b => b.code === selectedBankCode);

            await financialService.createAccount({
                name,
                type,
                initial_balance: numericBalance,
                bank_code: type === 'bank' ? selectedBankCode : undefined,
                color: bankInfo?.color
            });

            toast.success("Conta criada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['commercial_accounts'] });
            handleOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar conta");
        } finally {
            setLoading(false);
        }
    };

    const handleBankSelect = (code: string) => {
        setSelectedBankCode(code);
        const bank = BRAZILIAN_BANKS.find(b => b.code === code);
        if (bank && !name) {
            setName(bank.name); // Auto-fill name if empty
        }
    };

    return (
        <Dialog open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nova Conta</DialogTitle>
                    <DialogDescription>
                        Cadastre uma nova conta bancária ou caixa físico.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Tipo de Conta</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div
                                onClick={() => setType('bank')}
                                className={cn(
                                    "cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-900",
                                    type === 'bank' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <Landmark className="h-5 w-5" />
                                <span className="text-sm font-medium">Conta Bancária</span>
                            </div>
                            <div
                                onClick={() => { setType('cash'); setSelectedBankCode('999'); setName('Caixa Físico'); }}
                                className={cn(
                                    "cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-900",
                                    type === 'cash' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 dark:border-slate-800"
                                )}
                            >
                                <Wallet className="h-5 w-5" />
                                <span className="text-sm font-medium">Caixa Físico</span>
                            </div>
                        </div>
                    </div>

                    {type === 'bank' && (
                        <div className="space-y-2">
                            <Label>Instituição Financeira</Label>
                            <Select value={selectedBankCode} onValueChange={handleBankSelect}>
                                <SelectTrigger className="h-14">
                                    <SelectValue placeholder="Selecione o banco" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {BRAZILIAN_BANKS.filter(b => b.code !== '999').map((bank) => (
                                        <SelectItem key={bank.code} value={bank.code} className="cursor-pointer py-3">
                                            <div className="flex items-center gap-3">
                                                <BankLogo bankCode={bank.code} />
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium">{bank.name}</span>
                                                    {bank.shortName && <span className="text-xs text-muted-foreground">{bank.shortName}</span>}
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Conta</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={type === 'bank' ? "Ex: Principal, Investimentos..." : "Ex: Caixinha do Café"}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="balance">Saldo Inicial</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                            <Input
                                id="balance"
                                value={balance}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9,]/g, '');
                                    setBalance(val);
                                }}
                                className="pl-9"
                                placeholder="0,00"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            O saldo atual será calculado a partir deste valor somado às transações.
                        </p>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Criar Conta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
