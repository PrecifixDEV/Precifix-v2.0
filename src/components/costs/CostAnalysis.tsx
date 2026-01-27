import { useMemo, useState } from 'react';
import {
    TrendingDown,
    TrendingUp,
    DollarSign,
    CalendarRange,
    Search,
    PieChart,
    Info,
    Plus
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
    BarChart,
    Bar,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
    XAxis,
    YAxis,
} from 'recharts';

import type { OperationalCost } from '@/types/costs';
import { formatMoney } from '@/utils/format';
import { format, subMonths, isSameMonth, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';

interface CostAnalysisProps {
    costs: OperationalCost[];
    selectedDate: DateRange | undefined;
    onViewHistory: (id: string) => void;
    onDelete: (id: string) => void;
}

export function CostAnalysis({ costs, selectedDate, onViewHistory, onDelete }: CostAnalysisProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // --- Derived Data Processing ---
    const filteredCosts = useMemo(() => {
        return costs.filter(cost => {
            if (!cost.expense_date) return false;
            const date = parseISO(cost.expense_date);

            // Filter by Date Range selection
            const matchesDate = selectedDate?.from && selectedDate?.to
                ? isWithinInterval(date, {
                    start: startOfDay(selectedDate.from),
                    end: endOfDay(selectedDate.to)
                })
                : true;

            // Filter by Search
            const matchesSearch = searchTerm
                ? cost.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (cost.category && cost.category.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;

            return matchesDate && matchesSearch;
        });
    }, [costs, selectedDate, searchTerm]);

    const lastMonthCosts = useMemo(() => {
        if (!selectedDate?.from) return [];
        const lastMonthDate = subMonths(selectedDate.from, 1);
        return costs.filter(cost => {
            if (!cost.expense_date) return false;
            const date = parseISO(cost.expense_date);
            return isWithinInterval(date, {
                start: startOfMonth(lastMonthDate),
                end: endOfMonth(lastMonthDate)
            });
        });
    }, [costs, selectedDate]);

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

        return Object.entries(grouped)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total);
    }, [filteredCosts]);

    // Chart Data: Monthly Evolution (Last 6 months based on range start)
    const evolutionData = useMemo(() => {
        const data = [];
        const baseDate = selectedDate?.from || new Date();
        for (let i = 5; i >= 0; i--) {
            const d = subMonths(baseDate, i);
            const monthLabel = format(d, 'MMM', { locale: ptBR });

            const monthlyTotal = costs
                .filter(c => c.expense_date && isSameMonth(parseISO(c.expense_date), d))
                .reduce((acc, c) => acc + c.value, 0);

            data.push({ name: monthLabel.toUpperCase(), total: monthlyTotal });
        }
        return data;
    }, [costs, selectedDate]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-zinc-800 relative overflow-hidden bg-zinc-900/50">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSign className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Selecionado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{formatMoney(totalExpenses)}</div>
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
                            <span className="text-muted-foreground ml-2 text-xs uppercase tracking-tighter opacity-70">vs. período anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 relative overflow-hidden md:col-span-2 bg-zinc-900/50">
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
                                                <div className="rounded-lg border bg-zinc-900 p-2 shadow-sm border-zinc-800">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                                Total
                                                            </span>
                                                            <span className="font-bold text-yellow-500">
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
                                    className="fill-yellow-500"
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
                    <Card className="h-full border-zinc-800 bg-zinc-900/30">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-lg">Detalhamento por Categoria</CardTitle>
                                <CardDescription className="text-xs">Custos agrupados por centro de saída</CardDescription>
                            </div>
                            <div className="relative w-full max-w-[200px]">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-8 h-9 bg-zinc-950 border-zinc-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px] pr-4 pl-6 pb-6 pt-0">
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
                                                <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-yellow-900/30 flex items-center justify-center text-yellow-500">
                                                            <CalendarRange className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-semibold text-zinc-200">{categoryGroup.category}</span>
                                                        <Badge variant="secondary" className="ml-2 text-[10px] font-normal bg-zinc-800 text-zinc-400">
                                                            {categoryGroup.items.length} itens
                                                        </Badge>
                                                    </div>
                                                    <span className="font-bold text-zinc-100">
                                                        {formatMoney(categoryGroup.total)}
                                                    </span>
                                                </div>

                                                {/* Items List */}
                                                <div className="pl-4 border-l-2 border-zinc-800 ml-4 space-y-1">
                                                    {categoryGroup.items.map((cost) => (
                                                        <div
                                                            key={cost.id}
                                                            className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-800/50 transition-colors group text-sm"
                                                        >
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <span className="text-zinc-500 font-mono text-[10px] shrink-0">
                                                                    {cost.expense_date ? format(parseISO(cost.expense_date), 'dd') : '--'}
                                                                </span>
                                                                <span className="truncate max-w-[200px] md:max-w-[300px] text-zinc-300">
                                                                    {cost.description}
                                                                </span>
                                                                {cost.type === 'variable' && (
                                                                    <Badge variant="outline" className="text-[10px] h-4 px-1 text-zinc-500 border-zinc-800">Var</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-white font-medium">
                                                                    {formatMoney(cost.value)}
                                                                </span>
                                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-zinc-400 hover:text-yellow-500 hover:bg-yellow-500/10"
                                                                        onClick={() => onViewHistory(cost.id)}
                                                                        title="Ver Histórico"
                                                                    >
                                                                        <Info className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                                                                        onClick={() => onDelete(cost.id)}
                                                                    >
                                                                        <Plus className="h-3.5 w-3.5 rotate-45" />
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
                    <Card className="border-zinc-800 bg-zinc-900/30">
                        <CardHeader>
                            <CardTitle className="text-lg">Distribuição</CardTitle>
                            <CardDescription className="text-xs">Representatividade por categoria</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={costsByCategory.slice(0, 5)}
                                        layout="vertical"
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="category" type="category" width={80} tick={{ fontSize: 10, fill: '#71717a' }} />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-zinc-900 p-2 shadow-sm border-zinc-800">
                                                            <span className="font-bold text-yellow-500">
                                                                {formatMoney(payload[0].value as number)}
                                                            </span>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Area type="monotone" dataKey="total" stroke="#eab308" fill="#eab308" fillOpacity={0.2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <Separator className="my-4 bg-zinc-800" />
                            <div className="space-y-2">
                                {costsByCategory.slice(0, 5).map((item, index) => (
                                    <div key={item.category} className="flex items-center justify-between text-[11px] uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" style={{ opacity: 1 - index * 0.15 }} />
                                            <span className="text-zinc-400">{item.category}</span>
                                        </div>
                                        <span className="font-bold text-zinc-200">{Math.round((item.total / totalExpenses) * 100)}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-white border-zinc-700 shadow-lg border-l-4 border-l-yellow-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-sm uppercase tracking-widest flex items-center gap-2">
                                <Info className="h-4 w-4 text-yellow-500" />
                                Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-zinc-300 text-xs leading-relaxed">
                                Analise mensalmente suas <strong>despesas fixas</strong>. Uma redução de 10% nesses custos impacta diretamente seu lucro líquido anual.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
