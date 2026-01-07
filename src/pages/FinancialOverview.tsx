import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, Clock, Calculator, ArrowRight, TrendingUp, Info, BarChart3, PiggyBank, CheckCircle2, Circle } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";

import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { OperationalHours } from "@/types/costs";

export const FinancialOverview = () => {
    const [loading, setLoading] = useState(true);


    // Data State
    const [totalCosts, setTotalCosts] = useState(0);

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

    // Investment Data
    const [investment, setInvestment] = useState({ initialValue: 0, returnMonths: 36 });
    const [workingCapital, setWorkingCapital] = useState({ goal: 0, months: 6 });

    // Toggles for Hourly Rate Composition
    const [includeInvestment, setIncludeInvestment] = useState(false);
    const [includeWorkingCapital, setIncludeWorkingCapital] = useState(false);

    // Derived State
    const [hourlyAddon, setHourlyAddon] = useState(0);
    const [workingCapitalAddon, setWorkingCapitalAddon] = useState(0);

    useEffect(() => {
        loadFinancialData();
    }, []);

    const loadFinancialData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;



            // Fetch profile for investment data
            const { data: profile } = await supabase
                .from('profiles')
                .select('initial_investment, investment_return_months, working_capital_goal, working_capital_months, include_investment, include_working_capital')
                .eq('id', user.id)
                .single();

            if (profile) {
                // @ts-ignore
                const initialInvestment = profile.initial_investment;
                // @ts-ignore
                const investmentReturnMonths = profile.investment_return_months;

                // @ts-ignore
                const wcGoal = profile.working_capital_goal;
                // @ts-ignore
                const wcMonths = profile.working_capital_months;

                // @ts-ignore
                const incInv = profile.include_investment;
                // @ts-ignore
                const incWC = profile.include_working_capital;

                setInvestment({
                    initialValue: initialInvestment || 0,
                    returnMonths: investmentReturnMonths || 36
                });

                setWorkingCapital({
                    goal: wcGoal || 0,
                    months: wcMonths || 6
                });

                setIncludeInvestment(incInv || false);
                setIncludeWorkingCapital(incWC || false);
            }

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

    // Calculate Investment ROI Add-on
    useEffect(() => {
        if (stats.monthlyHours > 0 && investment.returnMonths > 0) {
            const totalHours = stats.monthlyHours * investment.returnMonths;
            setHourlyAddon(investment.initialValue / totalHours);
        } else {
            setHourlyAddon(0);
        }
    }, [investment, stats.monthlyHours]);

    // Calculate Working Capital Add-on
    useEffect(() => {
        if (stats.monthlyHours > 0 && workingCapital.months > 0) {
            const totalHours = stats.monthlyHours * workingCapital.months;
            setWorkingCapitalAddon(workingCapital.goal / totalHours);
        } else {
            setWorkingCapitalAddon(0);
        }
    }, [workingCapital, stats.monthlyHours]);

    const updateInvestment = async (field: 'initialValue' | 'returnMonths', value: number) => {
        const newInvestment = { ...investment, [field]: value };
        setInvestment(newInvestment);

        // If currently included, uncheck it (and sync uncheck to DB)
        if (includeInvestment) {
            setIncludeInvestment(false);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from('profiles')
                        .update({ include_investment: false, updated_at: new Date().toISOString() })
                        .eq('id', user.id);
                }
            } catch (err) {
                console.error("Error unchecking investment", err);
            }
        }
    };

    const updateWorkingCapital = async (field: 'goal' | 'months', value: number) => {
        const newWC = { ...workingCapital, [field]: value };
        setWorkingCapital(newWC);

        // If currently included, uncheck it (and sync uncheck to DB)
        if (includeWorkingCapital) {
            setIncludeWorkingCapital(false);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase
                        .from('profiles')
                        .update({ include_working_capital: false, updated_at: new Date().toISOString() })
                        .eq('id', user.id);
                }
            } catch (err) {
                console.error("Error unchecking working capital", err);
            }
        }
    };

    const toggleInclude = async (type: 'investment' | 'workingCapital') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let updates: any = { updated_at: new Date().toISOString() };

            if (type === 'investment') {
                const newValue = !includeInvestment;
                setIncludeInvestment(newValue);
                updates.include_investment = newValue;
                // If turning ON, save the values too
                if (newValue) {
                    updates.initial_investment = investment.initialValue;
                    updates.investment_return_months = investment.returnMonths;
                }
            } else {
                const newValue = !includeWorkingCapital;
                setIncludeWorkingCapital(newValue);
                updates.include_working_capital = newValue;
                // If turning ON, save the values too
                if (newValue) {
                    updates.working_capital_goal = workingCapital.goal;
                    updates.working_capital_months = workingCapital.months;
                }
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            if ((type === 'investment' && !includeInvestment) || (type === 'workingCapital' && !includeWorkingCapital)) {
                toast.success("Valores salvos e adicionados ao cálculo!");
            }

        } catch (error) {
            console.error('Error updating toggle:', error);
            toast.error('Erro ao salvar preferência');
            // Revert on error
            if (type === 'investment') setIncludeInvestment(!includeInvestment);
            else setIncludeWorkingCapital(!includeWorkingCapital);
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MagicCard className="md:col-span-2 shadow-2xl" gradientColor="#22c55e 55%, transparent 100%">
                    <div className="space-y-6">
                        <div>
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                                <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400" />
                                Seu Custo Hora Calculado
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Este é o valor mínimo que você precisa cobrar por hora apenas para pagar os custos da empresa.
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row items-baseline gap-6">
                            <span className="text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {formatMoney(stats.hourlyRate + (includeInvestment ? hourlyAddon : 0) + (includeWorkingCapital ? workingCapitalAddon : 0))}
                            </span>
                            <div className="flex flex-col text-sm text-slate-500 dark:text-slate-400">
                                <span>/ hora trabalhada</span>
                                <span className="text-xs opacity-70">(100% produtividade)</span>
                            </div>
                        </div>

                        {(includeInvestment || includeWorkingCapital) && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-medium text-slate-500 mr-1 mt-1">Inclui:</span>
                                {includeInvestment && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20">
                                        + {formatMoney(hourlyAddon)} ROI
                                    </span>
                                )}
                                {includeWorkingCapital && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                                        + {formatMoney(workingCapitalAddon)} Cap. Giro
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </MagicCard>



                {/* Costs per Day Card (New) */}
                <Card className="border-blue-200/50 shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Custo por Dia de Trabalho
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold text-slate-800 dark:text-white">
                                {formatMoney(stats.hourlyRate * (stats.hoursPerDay || 0))}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {stats.daysWorkedPerWeek > 0 ? `${stats.hoursPerDay.toFixed(1)}h de trabalho/dia` : 'Sem jornada definida'}
                            </span>
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
            </div >

            {/* Business Investment ROI Section */}
            < div className="space-y-4" >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        Retorno do Investimento Inicial
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 bg-white dark:bg-slate-900 border-2 border-purple-100 dark:border-purple-900/50 shadow-lg relative overflow-hidden transition-all hover:border-purple-200 dark:hover:border-purple-800">
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-5 pointer-events-none text-purple-600 dark:text-purple-400">
                            <TrendingUp className="w-64 h-64" />
                        </div>

                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-1">Custo Adicional por Hora</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold text-purple-600 dark:text-purple-400 tracking-tight">
                                            + {formatMoney(hourlyAddon)}
                                        </span>
                                        <span className="text-sm text-slate-400">/ hora</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                                        Para recuperar seu investimento de <strong>{formatMoney(investment.initialValue)}</strong> em <strong>{investment.returnMonths} meses</strong>,
                                        você deve adicionar este valor ao seu custo hora base.
                                    </p>

                                    <div className="mt-4">
                                        <Button
                                            variant={includeInvestment ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => toggleInclude('investment')}
                                            className={includeInvestment ? "bg-purple-600 hover:bg-purple-700 text-white border-none" : "border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/20"}
                                        >
                                            {includeInvestment ? (
                                                <><CheckCircle2 className="w-4 h-4 mr-2" /> Adicionado ao Custo Total</>
                                            ) : (
                                                <><Circle className="w-4 h-4 mr-2" /> Adicionar ao Custo Total</>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Custo Hora Final Sugerido</p>
                                        <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{formatMoney(stats.hourlyRate + hourlyAddon)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Horas Totais Necessárias</p>
                                        <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">{(stats.monthlyHours * investment.returnMonths).toFixed(0)} horas</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-purple-500" /> Simule seu Retorno
                                </h4>

                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500 dark:text-slate-400">Investimento Inicial (R$)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={investment.initialValue || ''}
                                            onChange={(e) => updateInvestment('initialValue', Number(e.target.value))}
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 pl-9"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500 dark:text-slate-400">Tempo de Retorno (Meses)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={investment.returnMonths || ''}
                                            onChange={(e) => updateInvestment('returnMonths', Number(e.target.value))}
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 pl-9"
                                            placeholder="36"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Explainer Card for Investment */}
                    <Card className="bg-purple-50 dark:bg-slate-800/50 border-purple-100 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-base text-purple-700 dark:text-purple-400">Por que calcular isso?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                            <p>
                                Todo negócio tem um custo inicial (equipamentos, reforma, marketing, etc). É saudável que esse dinheiro retorne para o seu bolso ao longo do tempo.
                            </p>
                            <p>
                                Ao diluir esse valor nas suas horas de trabalho, você garante que cada serviço prestado contribui um pouquinho para pagar o investimento que você fez.
                            </p>
                            <div className="p-3 bg-white dark:bg-slate-900 rounded border text-xs">
                                <strong>Recomendação:</strong> 36 meses (3 anos) é um prazo comum para retorno de investimento em negócios de serviços.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div >

            {/* Working Capital Section */}
            < div className="space-y-4" >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 dark:text-white">
                        <PiggyBank className="h-5 w-5 text-emerald-600" />
                        Capital de Giro
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/50 shadow-lg relative overflow-hidden transition-all hover:border-emerald-200 dark:hover:border-emerald-800">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-5 pointer-events-none text-emerald-600 dark:text-emerald-400">
                            <PiggyBank className="w-64 h-64" />
                        </div>

                        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            <div className="space-y-6 flex-1">
                                <div>
                                    <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-1">Custo Adicional por Hora</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                                            + {formatMoney(workingCapitalAddon)}
                                        </span>
                                        <span className="text-sm text-slate-400">/ hora</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                                        Para acumular <strong>{formatMoney(workingCapital.goal)}</strong> em <strong>{workingCapital.months} meses</strong>,
                                        adicione este valor ao seu custo hora.
                                    </p>

                                    <div className="mt-4">
                                        <Button
                                            variant={includeWorkingCapital ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => toggleInclude('workingCapital')}
                                            className={includeWorkingCapital ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"}
                                        >
                                            {includeWorkingCapital ? (
                                                <><CheckCircle2 className="w-4 h-4 mr-2" /> Adicionado ao Custo Total</>
                                            ) : (
                                                <><Circle className="w-4 h-4 mr-2" /> Adicionar ao Custo Total</>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Horas Totais</p>
                                        <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">{(stats.monthlyHours * workingCapital.months).toFixed(0)} horas</p>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-emerald-500" /> Configurar Meta
                                </h4>

                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500 dark:text-slate-400">Meta Capital de Giro (R$)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={workingCapital.goal || ''}
                                            onChange={(e) => updateWorkingCapital('goal', Number(e.target.value))}
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 pl-9"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500 dark:text-slate-400">Prazo (Meses)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="number"
                                            value={workingCapital.months || ''}
                                            onChange={(e) => updateWorkingCapital('months', Number(e.target.value))}
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 pl-9"
                                            placeholder="12"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Explainer Card for Working Capital */}
                    <Card className="bg-emerald-50 dark:bg-slate-800/50 border-emerald-100 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-base text-emerald-700 dark:text-emerald-400">Capital de Giro</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-4">
                            <p>
                                Ter dinheiro em caixa é essencial para pagar as contas em dia, mesmo que o movimento caia.
                            </p>
                            <p>
                                Planeje acumular de <strong>6 meses a 1 ano</strong> dos seus custos fixos como reserva de segurança.
                            </p>
                            <div className="p-3 bg-white dark:bg-slate-900 rounded border text-xs">
                                <strong>Dica:</strong> Se seu custo fixo é R$ {formatMoney(totalCosts)}, comece mirando R$ {formatMoney(totalCosts * 3)} (3 meses).
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div >
            {/* Costs Detail */}
            < div className="space-y-4" >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-red-500" />
                        1. Detalhe dos Custos
                    </h2>
                    <Link to="/custos" className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs font-medium transition-colors">
                        Gerenciar <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                <Card className="bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/50 shadow-lg transition-all hover:border-red-200 dark:hover:border-red-800">
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
            </div >

            {/* Hours Detail */}
            < div className="space-y-4" >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        2. Detalhe do Tempo (Matemática)
                    </h2>
                    <Link to="/minha-empresa" className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs font-medium transition-colors">
                        Ajustar Horários <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                <Card className="bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/50 shadow-lg transition-all hover:border-blue-200 dark:hover:border-blue-800">
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
            </div >


        </div>
    );
};
