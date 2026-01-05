import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, DollarSign, Clock, Calculator, ArrowRight, Save, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import type { OperationalHours } from "@/types/costs";

export const FinancialOverview = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data State
    const [totalCosts, setTotalCosts] = useState(0);
    const [hoursData, setHoursData] = useState<OperationalHours | null>(null);
    const [costCount, setCostCount] = useState(0);

    // Calculated Stats
    const [stats, setStats] = useState({
        daysWorkedPerWeek: 0,
        hoursPerDay: 0, // Average or text
        totalWeeklyHours: 0,
        monthlyHours: 0,
        hourlyRate: 0
    });

    const [activeDaysList, setActiveDaysList] = useState<string[]>([]);

    // Detailed breakdown string
    const [hoursBreakdown, setHoursBreakdown] = useState<any[]>([]);

    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Costs
            const { data: costs, error: costsError } = await supabase
                .from('operational_costs')
                .select('value, type');

            if (costsError) throw costsError;

            // Simple sum for now (Recurring + Fixed + Variable average if implemented later)
            // Assuming all active costs count towards the monthly total. 
            // If expense_date usage is complex, we might refine this later. 
            // For now: sum of all records (assuming they represent monthly snapshot or we just sum all registered costs as "Fixed Monthly").
            // Actually, `operational_costs` might contain transaction history. 
            // If it's a history table, we shouldn't sum ALL. 
            // Let's check `ManageCosts.tsx` logic. It usually has "Recurring" costs.
            // If the table mixes one-off expenses, we need to be careful.
            // Let's assume for this "Base Calculation" we want "Recurring Fixed Costs".
            // If we blindly sum everything, one-off expenses from 2023 will break it.
            // Filter by `is_recurring = true` OR recent expenses?
            // The user said: "Pegue todos os custos do gerenciar custos".
            // "Gerenciar Custos" seems to be the place where we list expenses.
            // Let's filter by `is_recurring` to be safe for a "Base Rate", OR fetch expenses for the CURRENT MONTH.
            // Requirement: "Pegue todos os custos ... e divida".
            // Interpretation: The Monthly Expenses. 
            // Let's try to sum "Recurring Costs" + "Average Variable Costs".
            // For MVP: Sum of ALL costs in the current month?
            // Let's fetch costs with `is_recurring: true` AND costs within current month.

            // Re-reading: "Pegue todos os custos do gerenciar custos".
            // I will take distinct recurring costs + one-time costs of this month.
            // Ideally, we sum everything that hits the cashflow this month.

            // Let's simplify: Sum all UNIQUE recurring costs + Non-recurring costs of THIS MONTH.
            // But `costService` generates rows for recurring costs too.
            // So we just search for costs where `expense_date` is within current month.

            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            const startStr = startOfMonth.toISOString().split('T')[0];

            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            const endStr = endOfMonth.toISOString().split('T')[0];

            const { data: monthlyCosts, error: monthlyError } = await supabase
                .from('operational_costs')
                .select('value')
                .gte('expense_date', startStr)
                .lt('expense_date', endStr);

            if (monthlyError) throw monthlyError;

            const totalMonthly = monthlyCosts?.reduce((acc, curr) => acc + curr.value, 0) || 0;
            setTotalCosts(totalMonthly);
            setCostCount(monthlyCosts?.length || 0);

            // 2. Fetch Hours
            const { data: hours, error: hoursError } = await supabase
                .from('operational_hours')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (hoursError) throw hoursError;

            if (hours) {
                setHoursData(hours as OperationalHours);
                calculateHours(hours as OperationalHours, totalMonthly);
            }

        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados financeiros");
        } finally {
            setLoading(false);
        }
    };

    const calculateHours = (data: OperationalHours, totalCostValue: number) => {
        const days = [
            { key: 'monday', label: 'Segunda' },
            { key: 'tuesday', label: 'Terça' },
            { key: 'wednesday', label: 'Quarta' },
            { key: 'thursday', label: 'Quinta' },
            { key: 'friday', label: 'Sexta' },
            { key: 'saturday', label: 'Sábado' },
            { key: 'sunday', label: 'Domingo' }
        ];

        let totalWeeklyMinutes = 0;
        let activeDaysCount = 0;
        let breakdown = [];
        let activeDays = [];

        for (const day of days) {
            const start = data[`${day.key}_start` as keyof OperationalHours];
            const end = data[`${day.key}_end` as keyof OperationalHours];

            if (start && end && start !== '00:00' && end !== '00:00') {
                activeDaysCount++;
                activeDays.push(day.label);

                // Calc Logic
                const [startH, startM] = (start as string).split(':').map(Number);
                const [endH, endM] = (end as string).split(':').map(Number);

                let startMinutes = startH * 60 + startM;
                let endMinutes = endH * 60 + endM;

                if (endMinutes < startMinutes) endMinutes += 24 * 60; // Cross midnight handle

                let diffMinutes = endMinutes - startMinutes;

                // Subtract Lunch (60 mins)
                const lunchMinutes = 60;
                let netMinutes = diffMinutes - lunchMinutes;

                if (netMinutes < 0) netMinutes = 0; // Safety

                totalWeeklyMinutes += netMinutes;

                breakdown.push({
                    day: day.label,
                    start: start,
                    end: end,
                    rawHours: (diffMinutes / 60).toFixed(1),
                    netHours: (netMinutes / 60).toFixed(1)
                });
            }
        }

        const totalWeeklyHours = totalWeeklyMinutes / 60;
        // 4.345 weeks per month average
        const WEEKS_PER_MONTH = 4.345;
        const monthlyHours = totalWeeklyHours * WEEKS_PER_MONTH;

        let rate = 0;
        if (monthlyHours > 0) {
            rate = totalCostValue / monthlyHours;
        }

        setStats({
            daysWorkedPerWeek: activeDaysCount,
            totalWeeklyHours: totalWeeklyHours,
            hoursPerDay: activeDaysCount > 0 ? totalWeeklyHours / activeDaysCount : 0,
            monthlyHours: monthlyHours,
            hourlyRate: rate
        });

        setHoursBreakdown(breakdown);
        setActiveDaysList(activeDays);
    };

    const handleUpdateSystemRate = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // Update in services default or just profile?
            // Usually we update 'labor_cost_per_hour' in services, but that's per service.
            // Here we probably want to update a global setting users can reference.
            // For now, let's just toast because we might not have a Global Setting table yet 
            // or we might want to update ALL services.

            // The prompt asks to "Pegue todos os custos... Para descobrirmos o valor".
            // It doesn't explicitly asking to SAVE to DB, but the UI should probably allow it.
            // Let's assume we save it to `profiles` if we have a field, or just toast.
            // The `ServiceFormDialog` uses `calculateSystemHourlyRate` locally or fetches?
            // `ServiceFormDialog` currently calculates dynamically or allows manual.

            // Let's just give feedback for now as per "Demonstrando o cálculo".
            toast.success("Custo Hora calculado! Use este valor ao precificar seus serviços.");

        } catch (error) {
            toast.error("Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    };

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="h-8 w-8 text-primary" />
                    Custo Hora da Empresa
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Entenda quanto custa cada hora da sua empresa funcionando, baseada nos seus custos fixos e horário de trabalho.
                </p>
            </div>

            {/* Main Highlight Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-primary/20 shadow-md bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Seu Custo Hora Calculado
                        </CardTitle>
                        <CardDescription>
                            Este é o valor mínimo que você precisa cobrar por hora apenas para pagar os custos da empresa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-baseline gap-6 mt-2">
                            <span className="text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {formatMoney(stats.hourlyRate)}
                            </span>
                            <div className="flex flex-col text-sm text-slate-500">
                                <span>/ hora trabalhada</span>
                                <span className="text-xs opacity-70">(100% produtividade)</span>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <Button onClick={handleUpdateSystemRate} className="gap-2">
                                <Save className="h-4 w-4" />
                                Usar como Referência
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Box */}
                <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-muted-foreground">Resumo do Mês</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Custos Totais</span>
                            <span className="text-base font-bold text-red-500">{formatMoney(totalCosts)}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-px"></div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Horas Produtivas</span>
                                <span className="text-[10px] text-muted-foreground">4.345 semanas/mês</span>
                            </div>
                            <span className="text-base font-bold text-blue-500">{stats.monthlyHours.toFixed(1)}h</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-px"></div>
                        <div className="pt-2">
                            <div className="p-3 bg-yellow-100/50 dark:bg-yellow-900/10 rounded-lg text-xs leading-relaxed text-yellow-700 dark:text-yellow-500 flex gap-2">
                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>
                                    Cálculo: {formatMoney(totalCosts)} ÷ {stats.monthlyHours.toFixed(1)}h = <strong>{formatMoney(stats.hourlyRate)}</strong>
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Costs Detail */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-red-500" />
                            1. Detalhe dos Custos
                        </h2>
                        <Link to="/custos" className="text-sm text-primary hover:underline flex items-center gap-1">
                            Gerenciar <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">
                                Soma de todas as despesas lançadas com data de vencimento neste mês.
                            </p>
                            <div className="rounded-md border p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center py-8">
                                <span className="text-3xl font-light text-slate-700 dark:text-slate-300">
                                    {formatMoney(totalCosts)}
                                </span>
                                <span className="text-xs text-muted-foreground mt-2">
                                    {costCount} despesa(s) identificada(s) este mês
                                </span>
                            </div>
                            <div className="mt-4 text-xs text-center text-muted-foreground">
                                * Certifique-se de que todas as contas (Água, Luz, Aluguel, Internet) estejam lançadas para maior precisão.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Hours Detail */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            2. Detalhe do Tempo (Matemática)
                        </h2>
                        <Link to="/minha-empresa" className="text-sm text-primary hover:underline flex items-center gap-1">
                            Ajustar Horários <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Dias Trabalhados:</span>
                                <div className="flex flex-wrap gap-1">
                                    {activeDaysList.map(day => (
                                        <span key={day} className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] uppercase font-bold">
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-md border divide-y overflow-hidden text-sm">
                                <div className="bg-muted px-4 py-2 font-medium grid grid-cols-4 gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                                    <span className="col-span-1">Dia</span>
                                    <span className="col-span-1 text-center">Horário</span>
                                    <span className="col-span-1 text-center">Almoço</span>
                                    <span className="col-span-1 text-right">Produtivo</span>
                                </div>
                                {hoursBreakdown.map((item) => (
                                    <div key={item.day} className="px-4 py-2 grid grid-cols-4 gap-2 items-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <span className="font-medium col-span-1">{item.day}</span>
                                        <span className="text-xs text-center text-muted-foreground col-span-1">{item.start} - {item.end}</span>
                                        <span className="text-xs text-center text-red-400 col-span-1">-1h</span>
                                        <span className="text-right font-mono font-medium col-span-1">{item.netHours}h</span>
                                    </div>
                                ))}
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 px-4 py-3 grid grid-cols-4 gap-2 font-bold text-blue-700 dark:text-blue-400">
                                    <span className="col-span-3">Total por Semana</span>
                                    <span className="text-right">{stats.totalWeeklyHours.toFixed(1)}h</span>
                                </div>
                            </div>

                            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs space-y-1">
                                <div className="flex justify-between">
                                    <span>Horas Semanais:</span>
                                    <span className="font-mono">{stats.totalWeeklyHours.toFixed(2)}h</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Média Semanas/Mês:</span>
                                    <span className="font-mono">x 4.345</span>
                                </div>
                                <div className="border-t border-slate-300 dark:border-slate-600 my-1 pt-1 flex justify-between font-bold text-slate-900 dark:text-white">
                                    <span>Total Mensal:</span>
                                    <span className="font-mono">{stats.monthlyHours.toFixed(1)}h</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
