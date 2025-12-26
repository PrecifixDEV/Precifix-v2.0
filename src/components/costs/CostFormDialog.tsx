import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { OperationalCost } from '@/types/costs';
import { costService } from '@/services/costService';
import { DatePickerWithInput } from '@/components/ui/date-picker-with-input';

interface CostFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    cost?: OperationalCost;
    defaultDescription?: string;
    defaultType?: 'fixed' | 'variable';
    onCostSaved?: (savedCost: OperationalCost) => void;
}

export const CostFormDialog = ({ isOpen, onClose, cost, defaultDescription, defaultType, onCostSaved }: CostFormDialogProps) => {
    const queryClient = useQueryClient();
    console.log('CostFormDialog mounted, costService:', costService);

    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState<'fixed' | 'variable'>('fixed');
    const [expenseDate, setExpenseDate] = useState<Date | undefined>(undefined);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);


    useEffect(() => {
        if (cost) {
            // The instruction provided a malformed line `reset(cost as unknown as OperationalCost);cription);`
            // Assuming the intent was to ensure 'cost' is treated as OperationalCost and then set the description.
            // If 'reset' is a function from a form library (e.g., react-hook-form), it needs to be imported and defined.
            // As 'reset' is not defined in the current context, and the instruction snippet was malformed,
            // I'm interpreting this as an attempt to ensure type safety for 'cost' and then proceed with existing logic.
            // If 'reset' was intended to be a function, please provide its definition or import.
            const typedCost = cost as OperationalCost; // Explicitly cast for clarity if needed elsewhere
            setDescription(typedCost.description);
            setValue(typedCost.value.toFixed(2));
            setType(typedCost.type);
            if (typedCost.expense_date) {
                // Parse date reliably as "YYYY-MM-DD"
                const [year, month, day] = typedCost.expense_date.split('-').map(Number);
                setExpenseDate(new Date(year, month - 1, day));
            } else {
                setExpenseDate(undefined);
            }
            setIsRecurring(cost.is_recurring || false);
            setRecurrenceFrequency(cost.recurrence_frequency || 'none');
            if (cost.recurrence_end_date) {
                const [year, month, day] = cost.recurrence_end_date.split('-').map(Number);
                setRecurrenceEndDate(new Date(year, month - 1, day));
            } else {
                setRecurrenceEndDate(undefined);
            }
        } else {
            setDescription(defaultDescription || '');
            setValue('');
            setType(defaultType || 'fixed');
            setExpenseDate(new Date()); // Default to today
            setIsRecurring(false);
            setRecurrenceFrequency('none');
            setRecurrenceEndDate(undefined);
        }
    }, [cost, isOpen, defaultDescription, defaultType]);

    const upsertCostMutation = useMutation({
        mutationFn: async (newCost: any) => {
            return await costService.saveCost(newCost);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['operationalCosts'] });
            onClose();
            // data is an array for insert, or single object for update
            // For callback, if array, maybe just pass first one or void, depending on usage.
            // onCostSaved signature expects single object.
            const savedItem = Array.isArray(data) ? data[0] : data;
            onCostSaved?.(savedItem as unknown as OperationalCost);
        },
        onError: (err) => {
            console.error(err);
            alert("Erro ao salvar custo: " + err.message);
        },
    });

    const handleSubmit = async () => {
        if (!description || !value || !expenseDate) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        upsertCostMutation.mutate({
            id: cost?.id,
            description,
            value: parseFloat(value),
            type: type,
            expense_date: format(expenseDate, 'yyyy-MM-dd'),
            is_recurring: isRecurring,
            recurrence_frequency: isRecurring ? recurrenceFrequency : undefined,
            recurrence_end_date: isRecurring && recurrenceEndDate ? format(recurrenceEndDate, 'yyyy-MM-dd') : undefined,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">{cost ? 'Editar Custo' : 'Adicionar Novo Custo'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição *</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white dark:bg-slate-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="value">Valor (R$) *</Label>
                        <Input id="value" type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="bg-white dark:bg-slate-800" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cost-type">Tipo de Custo</Label>
                        <Select
                            value={type}
                            onValueChange={(value: 'fixed' | 'variable') => setType(value)}
                        >
                            <SelectTrigger className="bg-white dark:bg-slate-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixo</SelectItem>
                                <SelectItem value="variable">Variável</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Data da Despesa *</Label>
                        <DatePickerWithInput
                            date={expenseDate}
                            setDate={setExpenseDate}
                            placeholder="Selecione uma data"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is-recurring"
                            checked={isRecurring}
                            onCheckedChange={(checked: boolean | 'indeterminate') => setIsRecurring(checked === true)}
                        />
                        <Label htmlFor="is-recurring">Recorrente?</Label>
                    </div>

                    {isRecurring && (
                        <>
                            <div className="space-y-2">
                                <Label>Frequência</Label>
                                <Select
                                    value={recurrenceFrequency}
                                    onValueChange={(value: any) => setRecurrenceFrequency(value)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Diária</SelectItem>
                                        <SelectItem value="weekly">Semanal</SelectItem>
                                        <SelectItem value="monthly">Mensal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Data Final</Label>
                                <DatePickerWithInput
                                    date={recurrenceEndDate}
                                    setDate={setRecurrenceEndDate}
                                    placeholder="Selecione uma data"
                                />
                            </div>
                        </>
                    )}

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={upsertCostMutation.isPending} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                        {upsertCostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {cost ? "Salvar Alterações" : "Adicionar Custo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
