import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
    Loader2,
    TrendingDown,
    TrendingUp,
    DollarSign,
    CalendarRange,
    Search,
    PieChart,
    Plus,
    Info
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ResponsiveAddButton } from '@/components/ui/responsive-add-button';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { NewCostDialog } from '@/components/costs/NewCostDialog';
import { CostHistorySheet } from '@/components/costs/CostHistorySheet';
import { costService } from '@/services/costService';
import type { OperationalCost } from '@/types/costs';
import { formatMoney } from '@/utils/format';
import { format, subMonths, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export const ManageCosts = () => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [costToDelete, setCostToDelete] = useState<string | null>(null);
    const [historyCostId, setHistoryCostId] = useState<string | null>(null);

    // Date Filters
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    const [searchTerm, setSearchTerm] = useState("");

    // --- Queries ---

    // 1. Fetch Costs (All costs for the selected year roughly, or just all and filter client side for better UX on charts)
    // To be efficient for scale we should filter, but for < 1000 items client side is instant.
    // Let's fetch all for year to handle charts well.
    const { data: costs = [], isLoading } = useQuery({
        queryKey: ['operationalCosts', 'all'], // We might want to scope this later
        queryFn: async () => {
            const { data, error } = await supabase
                .from('operational_costs')
                .select('*')
                .order('expense_date', { ascending: false });

            if (error) throw error;
            return data as OperationalCost[];
        }
    });

    // Fetch configured categories to suggest even unused ones


    // --- Derived Data Processing ---

    const filteredCosts = useMemo(() => {
        return costs.filter(cost => {
            if (!cost.expense_date) return false;
            const date = parseISO(cost.expense_date);

            // Filter by Month/Year selection
            const matchesDate = date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;

            // Filter by Search
            const matchesSearch = searchTerm
                ? cost.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (cost.category && cost.category.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;

            return matchesDate && matchesSearch;
        });
    }, [costs, selectedMonth, selectedYear, searchTerm]);

    const lastMonthCosts = useMemo(() => {
        const lastMonthDate = subMonths(new Date(selectedYear, selectedMonth - 1), 1);
        return costs.filter(cost => {
            if (!cost.expense_date) return false;
            const date = parseISO(cost.expense_date);
            return isSameMonth(date, lastMonthDate);
        });
    }, [costs, selectedMonth, selectedYear]);

    // Totals
    const totalExpenses = filteredCosts.reduce((acc, curr) => acc + curr.value, 0);
    const totalLastMonth = lastMonthCosts.reduce((acc, curr) => acc + curr.value, 0);
    const percentChange = totalLastMonth > 0 ? ((totalExpenses - totalLastMonth) / totalLastMonth) * 100 : 0;

    // Group by Category (DRE Style)
    const costsByCategory = useMemo(() => {
        const grouped: Record<string, { total: number, items: OperationalCost[] }> = {};

        filteredCosts.forEach(cost => {
            const cat = cost.category || 'Outros';
            if (!grouped[cat]) {
                grouped[cat] = { total: 0, items: [] };
            }
            grouped[cat].total += cost.value;
            grouped[cat].items.push(cost);
        });

        // Convert to array and sort by total desc
        return Object.entries(grouped)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total);
    }, [filteredCosts]);

    // Chart Data: Monthly Evolution (Last 6 months)
    const evolutionData = useMemo(() => {
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(new Date(selectedYear, selectedMonth - 1), i);
            const monthLabel = format(d, 'MMM', { locale: ptBR });

            // Sum costs for this specific month
            const monthlyTotal = costs
                .filter(c => c.expense_date && isSameMonth(parseISO(c.expense_date), d))
                .reduce((acc, c) => acc + c.value, 0);

            data.push({ name: monthLabel.toUpperCase(), total: monthlyTotal });
        }
        return data;
    }, [costs, selectedMonth, selectedYear]);


    // Delete Handler
    const { mutate: deleteCost } = useMutation({
        mutationFn: async (id: string) => costService.deleteCost(id),
        onSuccess: () => {
            toast.success("Despesa removida");
            setCostToDelete(null);
            queryClient.invalidateQueries({ queryKey: ["operationalCosts"] });
        }
    });


    // --- UI Helpers ---
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR }),
    }));

    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).sort((a, b) => b - a);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent hidden md:block">
                            Gerenciar Despesas
                        </h1>
                        <p className="text-muted-foreground mt-1">Análise detalhada de custos e despesas operacionais.</p>
                    </div>

                    <ResponsiveAddButton
                        onClick={() => setIsDialogOpen(true)}
                        label="Nova Despesa"
                        className="shadow-lg shadow-primary/20 shrink-0"
                    />
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2">
                    <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                        <SelectTrigger className="w-[140px] bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => (
                                <SelectItem key={m.value} value={String(m.value)} className="capitalize">{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                        <SelectTrigger className="w-[100px] bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total do Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{formatMoney(totalExpenses)}</div>
                        <div className="flex items-center mt-2 text-sm">
                            {percentChange > 0 ? (
                                <span className="text-red-500 flex items-center font-medium">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    +{percentChange.toFixed(1)}%
                                </span>
                            ) : (
                                <span className="text-emerald-500 flex items-center font-medium">
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                    {percentChange.toFixed(1)}%
                                </span>
                            )}
                            <span className="text-muted-foreground ml-2">vs. mês anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Evolução Mensal</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[120px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={evolutionData}>
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                Total
                                                            </span>
                                                            <span className="font-bold text-muted-foreground">
                                                                {formatMoney(payload[0].value as number)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="currentColor"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Detailed List (DRE Style) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle>Detalhamento por Categoria</CardTitle>
                                <CardDescription>Despesas agrupadas por centro de custo</CardDescription>
                            </div>
                            <div className="relative w-full max-w-[200px]">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filtrar..."
                                    className="pl-8 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[600px] pr-4 pl-6 pb-6 pt-0">
                                {costsByCategory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                                        <PieChart className="h-12 w-12 mb-4" />
                                        <p>Nenhuma despesa encontrada neste período.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {costsByCategory.map((categoryGroup) => (
                                            <div key={categoryGroup.category} className="space-y-3">
                                                {/* Category Header */}
                                                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <CalendarRange className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{categoryGroup.category}</span>
                                                        <Badge variant="secondary" className="ml-2 text-xs font-normal">
                                                            {categoryGroup.items.length} itens
                                                        </Badge>
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">
                                                        {formatMoney(categoryGroup.total)}
                                                    </span>
                                                </div>

                                                {/* Items List */}
                                                <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-1">
                                                    {categoryGroup.items.map((cost) => (
                                                        <div
                                                            key={cost.id}
                                                            className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group text-sm"
                                                        >
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <span className="text-slate-400 font-mono text-xs shrink-0">
                                                                    {cost.expense_date ? format(parseISO(cost.expense_date), 'dd') : '--'}
                                                                </span>
                                                                <span className="truncate max-w-[200px] md:max-w-[300px] text-slate-600 dark:text-slate-300">
                                                                    {cost.description}
                                                                </span>
                                                                {cost.type === 'variable' && (
                                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 text-slate-400 border-slate-200">Var</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-slate-700 dark:text-slate-300 font-medium">
                                                                    {formatMoney(cost.value)}
                                                                </span>
                                                                <div className="flex items-center">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                        onClick={() => setHistoryCostId(cost.id)}
                                                                        title="Ver Histórico"
                                                                    >
                                                                        <Info className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-1"
                                                                        onClick={() => setCostToDelete(cost.id)}
                                                                    >
                                                                        <Plus className="h-3 w-3 rotate-45" /> {/* Delete Icon X */}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Distribution Chart */}
                <div className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Distribuição</CardTitle>
                            <CardDescription>Onde seu dinheiro está indo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={costsByCategory.slice(0, 5)}
                                        layout="vertical"
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                            <span className="font-bold text-muted-foreground">
                                                                {formatMoney(payload[0].value as number)}
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <Separator className="my-4" />
                            <div className="space-y-2">
                                {costsByCategory.slice(0, 5).map((item, index) => (
                                    <div key={item.category} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary/80" style={{ opacity: 1 - index * 0.15 }} />
                                            <span className="text-slate-600 dark:text-slate-300">{item.category}</span>
                                        </div>
                                        <span className="font-medium">{Math.round((item.total / totalExpenses) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-white">Dica Financeira</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-blue-50 text-sm">
                                Analise mensalmente suas <strong>despesas fixas</strong>. Uma redução de 10% nesses custos pode impactar significativamente seu lucro líquido anual.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <NewCostDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />

            <CostHistorySheet
                open={!!historyCostId}
                onOpenChange={(open) => !open && setHistoryCostId(null)}
                costId={historyCostId}
                allCosts={costs}
            />

            <AlertDialog open={!!costToDelete} onOpenChange={(open) => !open && setCostToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Despesa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir esta despesa?
                            <br /><br />
                            <strong>Atenção:</strong> A despesa e todas as contas associadas a ela serão apagadas permanentemente. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => costToDelete && deleteCost(costToDelete)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
                        >
                            Excluir Permanentemente
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ManageCosts;
