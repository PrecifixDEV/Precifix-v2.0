import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FixedCostsTable } from '@/components/costs/FixedCostsTable';
import { VariableCostsTable } from '@/components/costs/VariableCostsTable';
import { OperationalHoursForm } from '@/components/costs/OperationalHoursForm';
import { CostAnalysisSummary } from '@/components/costs/CostAnalysisSummary';
import { CostFormDialog } from '@/components/costs/CostFormDialog';
import type { OperationalCost, OperationalHours } from '@/types/costs';
import { timeToMinutes } from '@/utils/cost-calculations';

export const ManageCosts = () => {
    const queryClient = useQueryClient();

    const [isCostFormOpen, setIsCostFormOpen] = useState(false);
    const [editingCost, setEditingCost] = useState<OperationalCost | undefined>(undefined);
    const [savingHours, setSavingHours] = useState(false);

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

    // Fetch Operational Hours
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
    const variableCosts = costs.filter(c => c.type === 'variable');

    const sumFixedCosts = fixedCosts.reduce((acc, curr) => acc + curr.value, 0);
    const sumVariableCosts = variableCosts.reduce((acc, curr) => acc + curr.value, 0);
    const totalMonthlyExpenses = sumFixedCosts + sumVariableCosts;

    // Initial Hours State for Form
    const [formHours, setFormHours] = useState<Partial<OperationalHours>>({});
    const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({
        monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
    });

    // Effect to populate form when data loads
    React.useEffect(() => {
        if (operationalHours) {
            setFormHours(operationalHours);
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const newSelectedDays: any = {};
            days.forEach(day => {
                // Assume selected if start time is present
                newSelectedDays[day] = !!operationalHours[`${day}_start` as keyof OperationalHours];
            });
            setSelectedDays(newSelectedDays);
        }
    }, [operationalHours]);

    // Calculations
    const calculateWorkingDaysAndHours = () => {
        if (!formHours) return { workingDays: 0, avgDailyHours: 0 };

        let totalWeeklyMinutes = 0;
        let daysCount = 0;

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            if (selectedDays[day]) {
                const start = formHours[`${day}_start` as keyof OperationalHours];
                const end = formHours[`${day}_end` as keyof OperationalHours];
                if (start && end) {
                    const startMins = timeToMinutes(start);
                    const endMins = timeToMinutes(end);
                    if (endMins > startMins) {
                        totalWeeklyMinutes += (endMins - startMins);
                        daysCount++;
                    }
                }
            }
        });

        // Approximate monthly calculation (4 weeks + a bit)
        // Precise: (Total Weekly / 7) * 30.44 days/month
        const avgDailyMinutes = daysCount > 0 ? totalWeeklyMinutes / daysCount : 0;
        // Let's estimate working days per month based on weekly pattern
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

    const saveHoursMutation = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            const payload: any = { ...formHours, user_id: user.id };

            // Upsert based on user_id (since we enforce 1 record per user)
            // Note: operational_hours ID might be missing on first create, so we rely on user_id check if possible 
            // OR we just use insert/update based on if we fetched data.

            let error;
            if (operationalHours?.id) {
                const { error: err } = await supabase
                    .from('operational_hours')
                    .update(payload)
                    .eq('id', operationalHours.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('operational_hours')
                    .insert(payload);
                error = err;
            }

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operationalHours'] });
            toast.success("Horários salvos com sucesso!");
        },
        onError: (err: any) => { // Added simple type here to suppress implicit any if needed
            toast.error(`Erro ao salvar horários: ${err.message}`);
        }
    });

    const handleSaveHours = async () => {
        setSavingHours(true);
        await saveHoursMutation.mutateAsync();
        setSavingHours(false);
    };

    const handleDayToggle = (day: string) => {
        setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
    };

    const handleHourChange = (day: string, type: 'start' | 'end', value: string) => {
        setFormHours(prev => ({
            ...prev,
            [`${day}_${type}`]: value
        }));
    };

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
                <Button onClick={() => { setEditingCost(undefined); setIsCostFormOpen(true); }} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Novo Custo
                </Button>
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

                <div className="space-y-8">
                    <OperationalHoursForm
                        operationalHours={formHours as any}
                        selectedDays={selectedDays}
                        onDayToggle={handleDayToggle}
                        onHourChange={handleHourChange}
                        onSaveHours={handleSaveHours}
                        isSaving={savingHours}
                    />
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
