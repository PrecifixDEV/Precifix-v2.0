import { useState, useMemo } from "react";
import { format, isWithinInterval, startOfDay, endOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Receipt,
    SquareCheckBig,
    Clock,
    Filter,
    Trash2,
    Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "../../utils/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DateRange } from "react-day-picker";
import { SleekDateRangePicker } from "@/components/ui/sleek-date-range-picker";
import { ActiveFilters } from "@/components/ui/active-filters";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";

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
    dateRange?: DateRange;
    onDateRangeChange?: (range: DateRange | undefined) => void;
}

export function PlannedTransactionList({
    items,
    isLoading,
    title,
    onPay,
    onDelete,
    dateRange,
    onDateRangeChange
}: PlannedTransactionListProps) {
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
    const [searchTerm, setSearchTerm] = useState("");

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [draftStatusFilter, setDraftStatusFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
    const [draftSearchTerm, setDraftSearchTerm] = useState("");

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

            // 3. Search Term
            if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            return true;
        });
    }, [items, statusFilter, dateRange, searchTerm]);

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

    const hasActiveFilters = !!(statusFilter !== 'all' || dateRange?.from || searchTerm);

    const applyFilters = () => {
        setStatusFilter(draftStatusFilter);
        setSearchTerm(draftSearchTerm);
        setIsDrawerOpen(false);
    };

    const handleClearFilters = () => {
        setStatusFilter('all');
        onDateRangeChange?.(undefined);
        setSearchTerm("");
        setDraftStatusFilter('all');
        setDraftSearchTerm("");
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <Card className="border-zinc-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent className="py-12 text-center animate-pulse text-zinc-500">
                    Carregando planejamentos...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-zinc-800 shadow-sm print:border-none print:shadow-none bg-zinc-900">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-4 gap-4 print:hidden">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5 text-zinc-400" />
                    {title}
                </CardTitle>

                <div className="flex items-center justify-end gap-2 w-full md:w-auto">
                    {/* Date Picker */}
                    <SleekDateRangePicker
                        date={dateRange}
                        onSelect={(range) => onDateRangeChange?.(range)}
                        placeholder="Vencimento"
                        variant="icon"
                    />

                    {/* Filter Drawer */}
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button
                                variant={hasActiveFilters ? "default" : "outline"}
                                size="icon"
                                className={cn(
                                    "shrink-0 transition-all",
                                    hasActiveFilters ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-400" : "bg-zinc-900/50 border-none"
                                )}
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <div className="mx-auto w-full max-w-sm">
                                <DrawerHeader>
                                    <DrawerTitle>Filtrar Planejados</DrawerTitle>
                                </DrawerHeader>
                                <div className="p-4 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <select
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-sm"
                                            value={draftStatusFilter}
                                            onChange={(e) => setDraftStatusFilter(e.target.value as any)}
                                        >
                                            <option value="all">Todos</option>
                                            <option value="pending">Pendente</option>
                                            <option value="overdue">Vencido</option>
                                            <option value="paid">Pago</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Descrição</label>
                                        <Input
                                            placeholder="Buscar descrição..."
                                            value={draftSearchTerm}
                                            onChange={(e) => setDraftSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DrawerFooter className="flex-row gap-2">
                                    <Button onClick={applyFilters} className="flex-1">Aplicar</Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline" className="flex-1">Cancelar</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </div>
                        </DrawerContent>
                    </Drawer>

                    {/* Print Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-zinc-900/50 border-none shrink-0"
                        onClick={handlePrint}
                    >
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {hasActiveFilters && (
                <ActiveFilters
                    filters={[
                        ...(dateRange?.from ? [{ label: 'Período', value: `${format(dateRange.from, "dd/MM")} - ${dateRange.to ? format(dateRange.to, "dd/MM") : ""}` }] : []),
                        ...(statusFilter !== 'all' ? [{ label: 'Status', value: statusFilter }] : []),
                        ...(searchTerm ? [{ label: 'Busca', value: searchTerm }] : [])
                    ]}
                    onClearAll={handleClearFilters}
                />
            )}

            <CardContent className="p-0">
                {groupedItems.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">Nenhum item encontrado no período.</div>
                ) : (
                    <div className="divide-y divide-zinc-800">
                        {groupedItems.map((group) => (
                            <div key={group.date}>
                                <div className="bg-zinc-800/80 px-6 py-2 text-[10px] font-bold text-zinc-100 uppercase tracking-widest sticky top-0 backdrop-blur-md border-y border-zinc-700/50 flex justify-between items-center z-20">
                                    <span>{format(new Date(group.date + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                                    <span className="text-zinc-400">{group.items.length} {group.items.length === 1 ? 'item' : 'itens'}</span>
                                </div>
                                <div className="divide-y divide-zinc-900/50">
                                    {group.items.map((item) => {
                                        const today = startOfDay(new Date());
                                        const dueDate = startOfDay(new Date(item.due_date + 'T00:00:00'));
                                        const diffDays = differenceInDays(dueDate, today);

                                        let statusIcon = <Receipt className="h-5 w-5" />;
                                        let iconColorClass = "bg-zinc-900 text-zinc-500 border-zinc-800";

                                        if (item.status === 'paid') {
                                            statusIcon = <SquareCheckBig className="h-5 w-5" />;
                                            iconColorClass = "bg-emerald-950/20 text-emerald-500 border-emerald-500/30";
                                        } else if (item.status === 'overdue' || dueDate < today) {
                                            statusIcon = <Receipt className="h-5 w-5" />;
                                            iconColorClass = "bg-red-950/20 text-red-500 border-red-500/30";
                                        } else if (diffDays <= 7) {
                                            statusIcon = <Receipt className="h-5 w-5" />;
                                            iconColorClass = "bg-yellow-950/20 text-yellow-500 border-yellow-500/30";
                                        } else {
                                            statusIcon = <Receipt className="h-5 w-5" />;
                                            iconColorClass = "bg-blue-950/20 text-blue-400 border-blue-400/30";
                                        }

                                        return (
                                            <div key={item.id} className="flex items-center justify-between px-6 py-4 group hover:bg-white/[0.02] transition-colors relative">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 transition-all",
                                                        iconColorClass
                                                    )}>
                                                        {statusIcon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={cn(
                                                            "font-medium truncate transition-colors text-white",
                                                            item.status === 'paid' && "text-zinc-400"
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

                                                {(item.status === 'overdue' || (item.status !== 'paid' && dueDate < today)) && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-600/50" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
