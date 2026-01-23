import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ResponsiveDatePicker } from '@/components/ui/responsive-date-picker';
import { format } from 'date-fns';
import type { MonthlyExpense } from '@/types/billing';

interface MonthlyExpenseFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    monthlyBillingId: string | undefined;
    expense?: MonthlyExpense; // Opcional para edição
}

export const MonthlyExpenseFormDialog = ({ isOpen, onClose, monthlyBillingId, expense }: MonthlyExpenseFormDialogProps) => {
    const queryClient = useQueryClient();

    const [description, setDescription] = useState(expense?.description || '');
    const [value, setValue] = useState(expense?.value.toFixed(2) || '');
    const [type, setType] = useState<'fixed' | 'variable'>(expense?.type || 'fixed');
    const [expenseDate, setExpenseDate] = useState<Date | undefined>(expense?.created_at ? new Date(expense.created_at) : undefined);

    useEffect(() => {
        if (expense) {
            setDescription(expense.description);
            setValue(expense.value.toFixed(2));
            setType(expense.type);
            setExpenseDate(expense.created_at ? new Date(expense.created_at) : undefined);
        } else {
            setDescription('');
            setValue('');
            setType('fixed');
            setExpenseDate(new Date());
        }
    }, [expense, isOpen]);

    const upsertMonthlyExpenseMutation = useMutation({
        mutationFn: async (newExpense: Omit<MonthlyExpense, 'updated_at' | 'source' | 'operational_cost_id' | 'id' | 'created_at'> & { id?: string, created_at?: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado.");
            if (!monthlyBillingId) throw new Error("ID de faturamento mensal não fornecido.");

            let expenseData;
            if (newExpense.id) {
                // Update existing expense
                const { data, error } = await supabase
                    .from('monthly_expenses')
                    .update({
                        description: newExpense.description,
                        value: newExpense.value,
                        type: newExpense.type,
                    })
                    .eq('id', newExpense.id)
                    .eq('monthly_billing_id', monthlyBillingId)
                    .select()
                    .single();
                if (error) throw error;
                expenseData = data;
            } else {
                // Insert new expense
                const { data, error } = await supabase
                    .from('monthly_expenses')
                    .insert({
                        monthly_billing_id: monthlyBillingId,
                        description: newExpense.description,
                        value: newExpense.value,
                        type: newExpense.type,
                        source: 'monthly_override', // Always 'monthly_override' for manually added expenses
                        operational_cost_id: null, // No operational_cost_id for manually added expenses
                    })
                    .select()
                    .single();
                if (error) throw error;
                expenseData = data;
            }
            return expenseData;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['monthlyExpenses', monthlyBillingId] });
            toast.success(expense ? "Despesa atualizada!" : "Despesa adicionada!", {
                description: `${data.description} foi ${expense ? 'atualizada' : 'adicionada'} com sucesso.`,
            });
            onClose();
        },
        onError: (err) => {
            toast.error(expense ? "Erro ao atualizar despesa" : "Erro ao adicionar despesa", {
                description: err.message,
            });
        },
    });

    const handleSubmit = () => {
        if (!description || !value) {
            toast.error("Campos obrigatórios", {
                description: "Descrição e Valor da despesa são obrigatórios.",
            });
            return;
        }
        if (isNaN(parseFloat(value)) || parseFloat(value) < 0) {
            toast.error("Valor inválido", {
                description: "O valor deve ser um número positivo.",
            });
            return;
        }

        if (!expenseDate) {
            toast.error("Data Obrigatória", {
                description: "Por favor, selecione a data da despesa.",
            });
            return;
        }

        if (!monthlyBillingId) {
            toast.error("Erro de Faturamento", {
                description: "Não foi possível identificar o período de faturamento. Tente recarregar a página.",
            });
            return;
        }

        upsertMonthlyExpenseMutation.mutate({
            id: expense?.id,
            monthly_billing_id: monthlyBillingId!, // Validated above
            description,
            value: parseFloat(value),
            type,
            created_at: expenseDate ? format(expenseDate, 'yyyy-MM-dd HH:mm:ss') : undefined, // Pass formatted date
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined}
                className="sm:max-w-[425px] bg-card"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{expense ? 'Editar Despesa Mensal' : 'Adicionar Nova Despesa Mensal'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição *</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-background"
                            readOnly={expense?.source === 'global'} // Desabilitar edição se for uma despesa global
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="value">Valor (R$) *</Label>
                        <Input id="value" type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expense-type" className="text-sm">Tipo de Despesa</Label>
                        <Select
                            value={type}
                            onValueChange={(value: 'fixed' | 'variable') => setType(value)}
                            disabled={expense?.source === 'global'} // Desabilitar edição se for uma despesa global
                        >
                            <SelectTrigger className="bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixo</SelectItem>
                                <SelectItem value="variable">Variável</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expense-date">Data da Despesa</Label>
                        <ResponsiveDatePicker
                            date={expenseDate}
                            onSelect={setExpenseDate}
                            label="Data da Despesa"
                            className="bg-background"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={upsertMonthlyExpenseMutation.isPending} className="bg-yellow-500 hover:bg-yellow-600 text-zinc-900">
                        {upsertMonthlyExpenseMutation.isPending ? (expense ? "Salvando..." : "Adicionando...") : (expense ? "Salvar Alterações" : "Adicionar Despesa")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
