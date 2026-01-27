import { useState, useMemo } from "react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle, Clock, Filter, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "../../utils/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";
import { SleekDateRangePicker } from "@/components/ui/sleek-date-range-picker";
import { ActiveFilters } from "@/components/ui/active-filters";

interface PlannedItem {
    id: string;
    description: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue' | 'partially_paid' | 'cancelled';
    type: 'payable' | 'receivable';
    category?: string | null;
    payment_method?: string | null;
    client_name?: string | null;
    provider_name?: string | null;
}

interface PlannedTransactionListProps {
    items: PlannedItem[];
    isLoading: boolean;
    title: string;
    onPay?: (item: PlannedItem) => void;
    onDelete?: (id: string | PlannedItem) => void;
}

export function PlannedTransactionList({ items, isLoading, title, onPay, onDelete }: PlannedTransactionListProps) {
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const filteredItems = useMemo(() => {
        if (!items) return [];

        return items.filter(t => {
            // 1. Date Range
            if (dateRange?.from) {
                const itemDate = new Date(t.due_date + 'T00:00:00');
                const start = startOfDay(dateRange.from);
                const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
                if (!isWithinInterval(itemDate, { start, end })) return false;
            }

            // 2. Status Filter
            if (statusFilter !== 'all' && t.status !== statusFilter) return false;

            return true;
        });
    }, [items, statusFilter, dateRange]);

    const groupedItems = useMemo(() => {
        const groups = filteredItems.reduce((acc, item) => {
            const date = item.due_date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(item);
            return acc;
        }, {} as Record<string, PlannedItem[]>);

        return Object.keys(groups)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map(date => ({ date, items: groups[date] }));
    }, [filteredItems]);

    const hasActiveFilters = !!(statusFilter !== 'all' || dateRange?.from);

    const handleClearFilters = () => {
        setStatusFilter('all');
        setDateRange(undefined);
    };

    if (isLoading) {
        return <div className="p-8 text-center animate-pulse text-zinc-500">Carregando planejamentos...</div>;
    }

    return (
        <Card className="bg-zinc-950/50 border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-4 gap-4 bg-zinc-950/30">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-zinc-100">
                    <Clock className="h-5 w-5 text-zinc-500" />
                    {title}
                </CardTitle>

                <div className="flex items-center justify-end gap-2 w-full md:w-auto">
                    <SleekDateRangePicker
                        date={dateRange}
                        onSelect={setDateRange}
                        placeholder="Período de Vencimento"
                    />
                    {hasActiveFilters && (
                        <Button variant="ghost" size="icon" onClick={handleClearFilters} className="text-zinc-500">
                            <Filter className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            {hasActiveFilters && (
                <div className="px-6 py-2 border-b border-zinc-800 bg-zinc-950/20">
                    <ActiveFilters
                        filters={[
                            ...(dateRange?.from ? [{ label: 'Vencimento', value: `${format(dateRange.from, "dd/MM")}...` }] : []),
                            ...(statusFilter !== 'all' ? [{ label: 'Status', value: statusFilter }] : []),
                        ]}
                        onClearAll={handleClearFilters}
                    />
                </div>
            )}

            <CardContent className="p-0">
                {groupedItems.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">Nenhum item encontrado no período.</div>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {groupedItems.map((group) => (
                            <div key={group.date}>
                                <div className="bg-zinc-900/40 px-6 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest sticky top-0 backdrop-blur-md border-y border-zinc-800/50 flex justify-between items-center">
                                    <span>{format(new Date(group.date + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                                    <span className="text-zinc-600">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
                                </div>
                                <div className="divide-y divide-zinc-900/50">
                                    {group.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between px-6 py-4 group hover:bg-white/[0.02] transition-colors relative">
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 transition-all",
                                                    item.status === 'paid' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                        item.status === 'overdue' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                            "bg-zinc-900 text-zinc-500 border-zinc-800 group-hover:border-zinc-700"
                                                )}>
                                                    {item.status === 'paid' ? <CheckCircle2 className="h-5 w-5" /> :
                                                        item.status === 'overdue' ? <AlertCircle className="h-5 w-5" /> :
                                                            item.type === 'payable' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />
                                                    }
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={cn(
                                                        "font-medium truncate transition-colors",
                                                        item.status === 'paid' ? "text-zinc-500" : "text-zinc-100 group-hover:text-white"
                                                    )}>
                                                        {item.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                                                        <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 uppercase tracking-tighter text-[9px]">{item.category || 'Geral'}</span>
                                                        {item.client_name && <span className="truncate">/ {item.client_name}</span>}
                                                        {item.provider_name && <span className="truncate">/ {item.provider_name}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right flex flex-col items-end gap-1.5 relative z-10">
                                                <span className={cn(
                                                    "font-mono font-bold text-sm tabular-nums",
                                                    item.type === 'payable' ? "text-red-400" : "text-emerald-400",
                                                    item.status === 'paid' && "text-zinc-700 font-normal grayscale"
                                                )}>
                                                    {item.type === 'payable' ? '-' : '+'} {formatMoney(item.amount)}
                                                </span>
                                                <div className="flex gap-2">
                                                    {item.status !== 'paid' && onPay && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-7 px-3 text-[10px] bg-zinc-800 hover:bg-emerald-600 hover:text-white border-0 font-bold transition-all"
                                                            onClick={() => onPay(item)}
                                                        >
                                                            {item.type === 'payable' ? 'PAGAR' : 'RECEBER'}
                                                        </Button>
                                                    )}
                                                    {onDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all hover:bg-red-500/10"
                                                            onClick={() => onDelete(item)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status indicator line for overdue */}
                                            {item.status === 'overdue' && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-600/50" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
