import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FixedCostsTable } from '@/components/costs/FixedCostsTable';
import { VariableCostsTable } from '@/components/costs/VariableCostsTable';
import { CostAnalysisSummary } from '@/components/costs/CostAnalysisSummary';
import { CostFormDialog } from '@/components/costs/CostFormDialog';
import type { OperationalCost, OperationalHours } from '@/types/costs';
import { timeToMinutes } from '@/utils/cost-calculations';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ManageCosts = () => {
    const queryClient = useQueryClient();

    const currentMonth_initial = new Date().getMonth() + 1;
    const currentYear_initial = new Date().getFullYear();

    const [isCostFormOpen, setIsCostFormOpen] = useState(false);
    const [editingCost, setEditingCost] = useState<OperationalCost | undefined>(undefined);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth_initial);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear_initial);

    // Generate recent years (e.g., current year +/- 2)
    const years = Array.from({ length: 5 }, (_, i) => currentYear_initial - 2 + i).sort((a, b) => b - a);

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR }),
    }));

    // Fetch Costs
    const { data: costs = [], isLoading: isLoadingCosts, error: errorCosts } = useQuery({
        queryKey: ['operationalCosts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('operational_costs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as OperationalCost[];
        },
    });

    // Fetch Operational Hours for Summary Calculation ONLY
    const { data: operationalHours, isLoading: isLoadingHours, error: errorHours } = useQuery({
        queryKey: ['operationalHours'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const { data, error } = await supabase
                .from('operational_hours')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data as OperationalHours | null;
        },
    });

    // Derived State
    const fixedCosts = costs.filter(c => c.type === 'fixed');

    // Filter Variable Costs by Month/Year
    const variableCosts = costs.filter(c => {
        if (c.type !== 'variable') return false;
        if (!c.expense_date) return false;

        try {
            const date = parseISO(c.expense_date);
            return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
        } catch (e) {
            return false;
        }
    });

    const sumFixedCosts = fixedCosts.reduce((acc, curr) => acc + curr.value, 0);
    const sumVariableCosts = variableCosts.reduce((acc, curr) => acc + curr.value, 0);
    const totalMonthlyExpenses = sumFixedCosts + sumVariableCosts;


    // Calculations for Summary
    const calculateWorkingDaysAndHours = () => {
        if (!operationalHours) return { workingDays: 0, avgDailyHours: 0 };

        let totalWeeklyMinutes = 0;
        let daysCount = 0;

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            const start = operationalHours[`${day}_start` as keyof OperationalHours];
            const end = operationalHours[`${day}_end` as keyof OperationalHours];

            // Only count if both start and end exist (implying the day is active/selected)
            if (start && end) {
                const startMins = timeToMinutes(start as string);
                const endMins = timeToMinutes(end as string);
                if (endMins > startMins) {
                    totalWeeklyMinutes += (endMins - startMins);
                    daysCount++;
                }
            }
        });

        // Approximate monthly calculation (4 weeks + a bit)
        const avgDailyMinutes = daysCount > 0 ? totalWeeklyMinutes / daysCount : 0;
        const workingDaysPerWeek = daysCount;
        const workingDaysPerMonth = workingDaysPerWeek * 4.33; // Average weeks in a month

        return {
            workingDays: Math.round(workingDaysPerMonth),
            avgDailyHours: avgDailyMinutes / 60
        };
    };

    const { workingDays, avgDailyHours } = calculateWorkingDaysAndHours();

    // Costs Calculations
    const dailyCost = workingDays > 0 ? totalMonthlyExpenses / workingDays : 0;
    const totalMonthlyHours = workingDays * avgDailyHours;
    const hourlyCost = totalMonthlyHours > 0 ? totalMonthlyExpenses / totalMonthlyHours : 0;

    // Handlers
    const handleEditCost = (cost: OperationalCost) => {
        setEditingCost(cost);
        setIsCostFormOpen(true);
    };

    const deleteCostMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('operational_costs').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operationalCosts'] });
            toast.success("Custo excluído com sucesso");
        },
        onError: (err) => {
            toast.error(`Erro ao excluir: ${err.message}`);
        }
    });


    if (isLoadingCosts || isLoadingHours) {
        return <div className="flex justify-center items-center h-full pt-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (errorCosts || errorHours) {
        return (
            <div className="p-8 text-center text-red-500">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <h2 className="text-xl font-bold">Erro ao carregar dados</h2>
                <p>{(errorCosts as any)?.message || (errorHours as any)?.message}</p>
                <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries()}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-5xl pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Gerenciar Custos</h1>
                    <p className="text-slate-500 dark:text-slate-400">Controle suas despesas fixas, variáveis e horário de funcionamento.</p>
                </div>
                <Button onClick={() => { setEditingCost(undefined); setIsCostFormOpen(true); }} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900">
                    <Plus className="mr-2 h-4 w-4" /> Novo Custo
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                    <label htmlFor="select-month" className="text-sm font-medium text-foreground">Mês</label>
                    <Select
                        value={selectedMonth.toString()}
                        onValueChange={(value) => setSelectedMonth(parseInt(value, 10))}
                    >
                        <SelectTrigger id="select-month" className="bg-background">
                            <SelectValue placeholder="Selecione o mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month) => (
                                <SelectItem key={month.value} value={month.value.toString()}>
                                    <span className="capitalize">{month.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 space-y-2">
                    <label htmlFor="select-year" className="text-sm font-medium text-foreground">Ano</label>
                    <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
                    >
                        <SelectTrigger id="select-year" className="bg-background">
                            <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <FixedCostsTable
                        costs={fixedCosts}
                        onEdit={handleEditCost}
                        onDelete={(id) => deleteCostMutation.mutate(id)}
                    />
                    <VariableCostsTable
                        costs={variableCosts}
                        onEdit={handleEditCost}
                        onDelete={(id) => deleteCostMutation.mutate(id)}
                    />
                </div>

                {/* Hours Form removed, kept summary */}
                <div className="space-y-8">
                    <CostAnalysisSummary
                        sumFixedCosts={sumFixedCosts}
                        sumVariableCosts={sumVariableCosts}
                        totalMonthlyExpenses={totalMonthlyExpenses}
                        dailyCost={dailyCost}
                        hourlyCost={hourlyCost}
                        totalWorkingDaysInMonth={workingDays}
                        averageDailyWorkingHours={avgDailyHours}
                    />
                </div>
            </div>

            <CostFormDialog
                isOpen={isCostFormOpen}
                onClose={() => setIsCostFormOpen(false)}
                cost={editingCost}
            />
        </div>
    );
};

export default ManageCosts;
