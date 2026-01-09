import { useState, useMemo } from "react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, Search, FileText, Filter, DollarSign, Tag, Landmark, CreditCard, Check, X } from "lucide-react";
import type { FinancialTransaction } from "@/types/costs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "../../utils/format";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionListProps {
    transactions: (FinancialTransaction & { commercial_accounts: { name: string } | null })[];
    isLoading: boolean;
}

type SearchField = 'description' | 'amount' | 'category' | 'bank' | 'payment_method';
type TypeFilter = 'all' | 'credit' | 'debit';

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchField, setSearchField] = useState<SearchField>('description');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];

        return transactions.filter(t => {
            // 0. Date Range Filter
            if (dateRange?.from) {
                const transactionDate = new Date(t.transaction_date + 'T00:00:00'); // Assuming YYYY-MM-DD
                const start = startOfDay(dateRange.from);
                const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

                if (!isWithinInterval(transactionDate, { start, end })) {
                    return false;
                }
            }

            // 1. Type Filter
            if (typeFilter !== 'all' && t.type !== typeFilter) return false;

            // 2. Search Filter
            if (!searchTerm) return true;

            const term = searchTerm.toLowerCase();

            switch (searchField) {
                case 'description':
                    return t.description.toLowerCase().includes(term);
                case 'category':
                    return (t.category || '').toLowerCase().includes(term);
                case 'payment_method':
                    return (t.payment_method || '').toLowerCase().includes(term);
                case 'bank':
                    return (t.commercial_accounts?.name || '').toLowerCase().includes(term);
                case 'amount':
                    // Allow simple number search
                    return t.amount.toString().includes(term);
                default:
                    return t.description.toLowerCase().includes(term);
            }
        });
    }, [transactions, searchTerm, searchField, typeFilter, dateRange]);


    if (isLoading) {
        return (
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-medium">Extrato de Movimentações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between animate-pulse">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                            <div className="flex-1 ml-4 space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
        const date = transaction.transaction_date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, typeof transactions>);

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const getSearchFieldLabel = (field: SearchField) => {
        switch (field) {
            case 'description': return 'Descrição';
            case 'amount': return 'Valor';
            case 'category': return 'Categoria';
            case 'bank': return 'Banco';
            case 'payment_method': return 'Forma de Pgto';
        }
    };

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 gap-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Extrato de Movimentações
                </CardTitle>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className={cn(
                        "relative transition-all duration-300 ease-in-out",
                        isSearchFocused ? "w-full md:w-[240px] md:flex-none" : "flex-1 md:w-[240px] md:flex-none"
                    )}>
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                            placeholder={`Buscar por ${getSearchFieldLabel(searchField).toLowerCase()}...`}
                            className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-none w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                    </div>

                    {/* Controls container - hides on mobile when search is focused */}
                    <div className={cn(
                        "flex items-center gap-2 flex-wrap sm:flex-nowrap",
                        isSearchFocused ? "hidden md:flex" : "flex"
                    )}>
                        {/* Date Range Picker */}
                        <DateRangePicker date={dateRange} setDate={setDateRange} className="w-[180px] sm:w-[240px]" />

                        {/* Field Filter Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0 bg-slate-50 dark:bg-slate-900/50 border-none" title="Filtrar por">
                                    <Filter className="h-4 w-4 text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setSearchField('description')}>
                                    <FileText className="mr-2 h-4 w-4" /> Descrição
                                    {searchField === 'description' && <Check className="ml-auto h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchField('amount')}>
                                    <DollarSign className="mr-2 h-4 w-4" /> Valor
                                    {searchField === 'amount' && <Check className="ml-auto h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchField('category')}>
                                    <Tag className="mr-2 h-4 w-4" /> Categoria
                                    {searchField === 'category' && <Check className="ml-auto h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchField('bank')}>
                                    <Landmark className="mr-2 h-4 w-4" /> Banco
                                    {searchField === 'bank' && <Check className="ml-auto h-4 w-4" />}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSearchField('payment_method')}>
                                    <CreditCard className="mr-2 h-4 w-4" /> Forma de Pagamento
                                    {searchField === 'payment_method' && <Check className="ml-auto h-4 w-4" />}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Type Toggles */}
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-8 px-2 hover:bg-white dark:hover:bg-slate-800 transition-all",
                                    typeFilter === 'credit' && "bg-white dark:bg-slate-800 text-emerald-600 shadow-sm"
                                )}
                                onClick={() => setTypeFilter(prev => prev === 'credit' ? 'all' : 'credit')}
                                title="Apenas Entradas"
                            >
                                <ArrowUpRight className={cn("h-4 w-4", typeFilter === 'credit' ? "text-emerald-600" : "text-slate-500")} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-8 px-2 hover:bg-white dark:hover:bg-slate-800 transition-all",
                                    typeFilter === 'debit' && "bg-white dark:bg-slate-800 text-red-600 shadow-sm"
                                )}
                                onClick={() => setTypeFilter(prev => prev === 'debit' ? 'all' : 'debit')}
                                title="Apenas Saídas"
                            >
                                <ArrowDownLeft className={cn("h-4 w-4", typeFilter === 'debit' ? "text-red-600" : "text-slate-500")} />
                            </Button>
                        </div>

                        {/* Clear Filters Button */}
                        {(searchTerm || typeFilter !== 'all' || dateRange) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => {
                                    setSearchTerm('');
                                    setTypeFilter('all');
                                    setSearchField('description');
                                    setDateRange(undefined);
                                }}
                                title="Limpar Filtros"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Nenhuma movimentação encontrada.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sortedDates.map((date) => (
                            <div key={date}>
                                <div className="bg-slate-50/50 dark:bg-slate-900/30 px-6 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider sticky top-0 backdrop-blur-sm">
                                    {format(new Date(date + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR })}
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {groupedTransactions[date].map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                            <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center border shrink-0",
                                                    transaction.type === 'credit'
                                                        ? "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                                        : "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50"
                                                )}>
                                                    {transaction.type === 'credit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate pr-2">{transaction.description}</p>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                                                        <span className="text-xs whitespace-nowrap">{transaction.category || 'Geral'}</span>
                                                        {transaction.commercial_accounts?.name && (
                                                            <>
                                                                <span className="text-xs hidden sm:inline">•</span>
                                                                <span className="text-xs whitespace-nowrap">{transaction.commercial_accounts.name}</span>
                                                            </>
                                                        )}
                                                        {transaction.payment_method && (
                                                            <>
                                                                <span className="text-xs opacity-50">|</span>
                                                                <span className="text-xs whitespace-nowrap">{transaction.payment_method}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={cn(
                                                    "font-bold block whitespace-nowrap",
                                                    transaction.type === 'credit'
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {transaction.type === 'credit' ? '+' : '-'} {formatMoney(Number(transaction.amount))}
                                                </span>
                                                {transaction.related_entity_type && (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 mt-1 font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {transaction.related_entity_type === 'service_order' ? 'Venda' : 'Despesa'}
                                                    </Badge>
                                                )}
                                            </div>
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
