import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from "@/components/SessionContextProvider";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MonthlyExpense } from '@/types/billing';

interface MonthlyExpenseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyBillingId: string | undefined;
  expense?: MonthlyExpense; // Opcional para edição
}

export const MonthlyExpenseFormDialog = ({ isOpen, onClose, monthlyBillingId, expense }: MonthlyExpenseFormDialogProps) => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [description, setDescription] = useState(expense?.description || '');
  const [value, setValue] = useState(expense?.value.toFixed(2) || '');
  const [type, setType] = useState<'fixed' | 'variable'>(expense?.type || 'fixed');
  const [expenseDate, setExpenseDate] = useState<Date | undefined>(expense?.created_at ? new Date(expense.created_at) : undefined);
  const [isExpenseDateOpen, setIsExpenseDateOpen] = useState(false);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setValue(expense.value.toFixed(2));
      setType(expense.type);
      setExpenseDate(new Date(expense.created_at));
    } else {
      setDescription('');
      setValue('');
      setType('fixed');
      setExpenseDate(new Date());
    }
  }, [expense, isOpen]);

  const upsertMonthlyExpenseMutation = useMutation({
    mutationFn: async (newExpense: Omit<MonthlyExpense, 'updated_at' | 'source' | 'operational_cost_id'> & { id?: string, created_at?: string }) => {
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
      toast({
        title: expense ? "Despesa atualizada!" : "Despesa adicionada!",
        description: `${data.description} foi ${expense ? 'atualizada' : 'adicionada'} com sucesso.`,
      });
      onClose();
    },
    onError: (err) => {
      toast({
        title: expense ? "Erro ao atualizar despesa" : "Erro ao adicionar despesa",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!description || !value) {
      toast({
        title: "Campos obrigatórios",
        description: "Descrição e Valor da despesa são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    if (isNaN(parseFloat(value)) || parseFloat(value) < 0) {
      toast({
        title: "Valor inválido",
        description: "O valor deve ser um número positivo.",
        variant: "destructive",
      });
      return;
    }

    if (!expenseDate) {
      toast({
        title: "Data Obrigatória",
        description: "Por favor, selecione a data da despesa.",
        variant: "destructive",
      });
      return;
    }

    if (!monthlyBillingId) {
      toast({
        title: "Erro de Faturamento",
        description: "Não foi possível identificar o período de faturamento. Tente recarregar a página.",
        variant: "destructive"
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
      <DialogContent
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
            <Popover modal={true} open={isExpenseDateOpen} onOpenChange={setIsExpenseDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background",
                    !expenseDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expenseDate ? format(expenseDate, "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" side="bottom">
                <Calendar
                  mode="single"
                  selected={expenseDate}
                  onSelect={(date) => {
                    setExpenseDate(date);
                    setIsExpenseDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={upsertMonthlyExpenseMutation.isPending}>
            {upsertMonthlyExpenseMutation.isPending ? (expense ? "Salvando..." : "Adicionando...") : (expense ? "Salvar Alterações" : "Adicionar Despesa")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};