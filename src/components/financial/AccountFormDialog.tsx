import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Landmark, Wallet, Plus, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { financialService } from "@/services/financialService";
import { BRAZILIAN_BANKS } from "@/constants/banks";
import { BankLogo } from "@/components/ui/bank-logo";
import { cn } from "@/lib/utils";
import type { FinancialAccount } from "@/types/costs";

interface AccountFormDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
    accountToEdit?: FinancialAccount | null;
}

export function AccountFormDialog({ open, onOpenChange, trigger, accountToEdit }: AccountFormDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // Form State
    const [name, setName] = useState("");
    const [type, setType] = useState<'bank' | 'cash' | 'wallet'>('bank');
    const [balance, setBalance] = useState("");
    const [selectedBankCode, setSelectedBankCode] = useState("");
    const [customBankName, setCustomBankName] = useState("");

    const isEditing = !!accountToEdit;

    // Effect to handle open/edit state changes
    useEffect(() => {
        const visible = open !== undefined ? open : isOpen;

        if (visible && accountToEdit) {
            // Populate for Edit
            setName(accountToEdit.name);
            setType(accountToEdit.type as any);
            setBalance(String(accountToEdit.initial_balance).replace('.', ',')); // Display Initial
            // Determine Bank Code
            if (accountToEdit.type === 'bank') {
                // Logic to find if it's a known bank or custom
                const knownBank = BRAZILIAN_BANKS.find(b => b.code === accountToEdit.bank_code);
                if (knownBank) {
                    setSelectedBankCode(accountToEdit.bank_code || "");
                } else {
                    setSelectedBankCode('OTHER');
                    setCustomBankName(accountToEdit.bank_code || "");
                }
            } else {
                setSelectedBankCode("999"); // Cash
            }
        } else if (visible && !accountToEdit) {
            // Reset for Create (if not already handled by onOpenChange)
            // Check if we need to clear (e.g. if we just closed edit and opened create)
            if (!name) { // Simple check to avoid clearing if user is typing
                // Already cleared by handleOpenChange mostly
            }
        }
    }, [open, isOpen, accountToEdit]);


    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        if (!newOpen) {
            // Reset form delayed to avoid flicker
            setTimeout(() => {
                setName("");
                setType("bank");
                setBalance("");
                setSelectedBankCode("");
                setCustomBankName("");
            }, 300);
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

        if (type === 'bank' && selectedBankCode === 'OTHER' && !customBankName) {
            toast.error("Digite o nome do banco");
            return;
        }

        setLoading(true);
        try {
            const numericBalance = parseFloat(balance.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
            const bankInfo = BRAZILIAN_BANKS.find(b => b.code === selectedBankCode);
            const bankName = type === 'bank' ? (selectedBankCode === 'OTHER' ? customBankName : selectedBankCode) : undefined;
            const color = selectedBankCode === 'OTHER' ? '#64748b' : bankInfo?.color;

            if (isEditing && accountToEdit) {
                await financialService.updateAccount(accountToEdit.id, {
                    name,
                    type,
                    bank_code: bankName,
                    color
                    // We do NOT update initial_balance or current_balance here to avoid data corruption
                });
                toast.success("Conta atualizada!");
            } else {
                await financialService.createAccount({
                    name,
                    type,
                    initial_balance: numericBalance,
                    bank_code: bankName,
                    color
                });
                toast.success("Conta criada com sucesso!");
            }

            queryClient.invalidateQueries({ queryKey: ['commercial_accounts'] });
            handleOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error(isEditing ? "Erro ao atualizar conta" : "Erro ao criar conta");
        } finally {
            setLoading(false);
        }
    };

    const handleBankSelect = (code: string) => {
        setSelectedBankCode(code);
        if (code === 'OTHER') {
            if (!isEditing) setName("");
            return;
        }
        const bank = BRAZILIAN_BANKS.find(b => b.code === code);
        if (bank && !name && !isEditing) {
            setName(bank.name); // Auto-fill name only if new
        }
    };

    return (
        <Dialog open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Conta" : "Nova Conta"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Atualize as informações da conta." : "Cadastre uma nova conta bancária ou caixa físico."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Tipo de Conta</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div
                                onClick={() => setType('bank')}
                                className={cn(
                                    "cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900",
                                    type === 'bank' ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 dark:border-zinc-800",
                                    isEditing && "opacity-50 cursor-not-allowed" // Disable changing type logic for simplicity? User only asked for Name.
                                )}
                            // Allow type change but might be weird if transactions exist? Let's allow.
                            >
                                <Landmark className="h-5 w-5" />
                                <span className="text-sm font-medium">Conta Bancária</span>
                            </div>
                            <div
                                onClick={() => { setType('cash'); setSelectedBankCode('999'); if (!isEditing) setName('Caixa Físico'); }}
                                className={cn(
                                    "cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900",
                                    type === 'cash' ? "border-primary bg-primary/5 text-primary" : "border-zinc-200 dark:border-zinc-800"
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

                            {selectedBankCode === 'OTHER' && (
                                <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label htmlFor="custom-bank">Nome do Banco</Label>
                                    <Input
                                        id="custom-bank"
                                        value={customBankName}
                                        onChange={(e) => {
                                            setCustomBankName(e.target.value);
                                            if (!name && !isEditing) setName(e.target.value);
                                        }}
                                        placeholder="Ex: Banco Regional"
                                    />
                                </div>
                            )}
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
                                disabled={isEditing} // Block balance edit
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isEditing
                                ? "O saldo inicial não pode ser alterado após a criação."
                                : "O saldo atual será calculado a partir deste valor somado às transações."}
                        </p>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />)}
                            {isEditing ? "Salvar Alterações" : "Criar Conta"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
