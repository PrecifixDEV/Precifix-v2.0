import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { OperationalCost } from '@/types/costs';

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

    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState<'fixed' | 'variable'>('fixed');
    const [expenseDate, setExpenseDate] = useState<Date | undefined>(undefined);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceFrequency, setRecurrenceFrequency] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
    const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>(undefined);
    const [isExpenseDateOpen, setIsExpenseDateOpen] = useState(false);
    const [isRecurrenceEndDateOpen, setIsRecurrenceEndDateOpen] = useState(false);

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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado.");

            const payload = {
                description: newCost.description,
                value: newCost.value,
                type: newCost.type,
                expense_date: newCost.expense_date,
                is_recurring: newCost.is_recurring,
                recurrence_frequency: newCost.recurrence_frequency,
                recurrence_end_date: newCost.recurrence_end_date,
                user_id: user.id
            };

            if (newCost.id) {
                const { data, error } = await supabase
                    .from('operational_costs')
                    .update(payload)
                    .eq('id', newCost.id)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            } else {
                const { data, error } = await supabase
                    .from('operational_costs')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;
                return data;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['operationalCosts'] });
            onClose();
            onCostSaved?.(data as unknown as OperationalCost);
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
                        <Popover open={isExpenseDateOpen} onOpenChange={setIsExpenseDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-white dark:bg-slate-800",
                                        !expenseDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {expenseDate ? format(expenseDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={expenseDate}
                                    onSelect={(date: Date | undefined) => {
                                        setExpenseDate(date);
                                        setIsExpenseDateOpen(false);
                                    }}
                                    initialFocus
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
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
                                <Popover open={isRecurrenceEndDateOpen} onOpenChange={setIsRecurrenceEndDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-white dark:bg-slate-800",
                                                !recurrenceEndDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {recurrenceEndDate ? format(recurrenceEndDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={recurrenceEndDate}
                                            onSelect={(date: Date | undefined) => {
                                                setRecurrenceEndDate(date);
                                                setIsRecurrenceEndDateOpen(false);
                                            }}
                                            initialFocus
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </>
                    )}

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={upsertCostMutation.isPending} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        {upsertCostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {cost ? "Salvar Alterações" : "Adicionar Custo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
