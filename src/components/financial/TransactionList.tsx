import { useState, useMemo } from "react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, FileText, X, Trash2, Filter, RotateCcw, Printer } from "lucide-react";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { financialService } from "@/services/financialService";
import { ActiveFilters } from "@/components/ui/active-filters";

interface TransactionListProps {
    transactions: (FinancialTransaction & { commercial_accounts: { name: string } | null })[];
    isLoading: boolean;
    consolidatedBalance?: number;
    balanceLabel?: string;
}

type SearchField = 'description' | 'amount' | 'category' | 'payment_method';
type TypeFilter = 'all' | 'credit' | 'debit';

export function TransactionList({ transactions, isLoading, consolidatedBalance, balanceLabel = "Saldo Consolidado" }: TransactionListProps) {
    // State for Search & Filters

    const [activeSearch, setActiveSearch] = useState<{ field: SearchField, term: string } | null>(null);
    const [searchField, setSearchField] = useState<SearchField>('description');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    // Filter Drawer State (Drafts)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [draftTypeFilter, setDraftTypeFilter] = useState<TypeFilter>('all');
    const [draftSearchField, setDraftSearchField] = useState<SearchField>('description');
    const [draftSearchTerm, setDraftSearchTerm] = useState("");
    // New Filter State for Deleted
    const [showDeletedOnly, setShowDeletedOnly] = useState(false);
    const [draftShowDeletedOnly, setDraftShowDeletedOnly] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const openFilterDrawer = () => {
        setDraftTypeFilter(typeFilter);
        setDraftSearchField(searchField);
        setDraftSearchTerm(activeSearch?.term || "");
        setDraftShowDeletedOnly(showDeletedOnly);
        setIsDrawerOpen(true);
    };

    const applyFilters = () => {
        setTypeFilter(draftTypeFilter);
        setSearchField(draftSearchField);
        setShowDeletedOnly(draftShowDeletedOnly);
        if (draftSearchTerm.trim()) {
            setActiveSearch({ field: draftSearchField, term: draftSearchTerm });
        } else {
            setActiveSearch(null);
        }
        setIsDrawerOpen(false);
    };


    // Filter Logic
    // Delete & Restore Logic
    const queryClient = useQueryClient();
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [transactionToRestore, setTransactionToRestore] = useState<string | null>(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    // Filter Logic
    const deleteMutation = useMutation({
        mutationFn: (id: string) => financialService.deleteTransaction(id),
        onSuccess: () => {
            toast.success("Movimentação excluída e saldo revertido.");
            queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
            queryClient.invalidateQueries({ queryKey: ['commercial_accounts'] });
            setTransactionToDelete(null);
        },
        onError: (error: Error) => {
            toast.error("Erro ao excluir movimentação");
            console.error(error);
        }
    });

    const restoreMutation = useMutation({
        mutationFn: (id: string) => financialService.restoreTransaction(id),
        onSuccess: () => {
            toast.success("Movimentação restaurada e saldo reaplicado.");
            queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
            queryClient.invalidateQueries({ queryKey: ['commercial_accounts'] });
            setTransactionToRestore(null);
        },
        onError: (error: Error) => {
            toast.error("Erro ao restaurar movimentação");
            console.error(error);
        }
    });

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTransactionToDelete(id);
    };

    const handleRestoreClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTransactionToRestore(id);
    }

    const confirmDelete = () => {
        if (transactionToDelete) {
            deleteMutation.mutate(transactionToDelete);
        }
    };

    const confirmRestore = () => {
        if (transactionToRestore) {
            restoreMutation.mutate(transactionToRestore);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];

        return transactions.filter(t => {
            // 0. Deleted/Active Filter
            // If showDeletedOnly is true, show ONLY deleted.
            // If showDeletedOnly is false, show ONLY active (not deleted).
            // This is "Ativos/Excluídos" mutual exclusion.
            if (showDeletedOnly) {
                if (!t.is_deleted) return false;
            } else {
                if (t.is_deleted) return false;
            }

            // 1. Date Range
            if (dateRange?.from) {
                const transactionDate = new Date(t.transaction_date + 'T00:00:00');
                const start = startOfDay(dateRange.from);
                const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

                if (!isWithinInterval(transactionDate, { start, end })) {
                    return false;
                }
            }

            // 2. Type Filter
            if (typeFilter !== 'all' && t.type !== typeFilter) return false;

            // 3. Active Search Filter
            if (!activeSearch) return true;

            const term = activeSearch.term.toLowerCase();
            switch (activeSearch.field) {
                case 'description':
                    return t.description.toLowerCase().includes(term);
                case 'category':
                    return (t.category || '').toLowerCase().includes(term);
                case 'payment_method':
                    return (t.payment_method || '').toLowerCase().includes(term);
                case 'amount':
                    return t.amount.toString().includes(term);
                default:
                    return t.description.toLowerCase().includes(term);
            }
        });
    }, [transactions, activeSearch, typeFilter, dateRange, showDeletedOnly]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTransactions, currentPage]);

    // Reset page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [activeSearch, typeFilter, dateRange, showDeletedOnly]);

    const groupedTransactions = paginatedTransactions.reduce((groups, transaction) => {
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
            case 'payment_method': return 'Forma de Pgto';
        }
    };



    const handleClearFilters = () => {
        setActiveSearch(null);
        setTypeFilter('all');
        setSearchField('description');
        setDateRange(undefined);
        setShowDeletedOnly(false); // Reset to Active
    };

    const hasActiveFilters = !!(activeSearch || typeFilter !== 'all' || dateRange?.from || showDeletedOnly);

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

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm print:border-none print:shadow-none">
            <div className="hidden print:block mb-8 space-y-4">
                {consolidatedBalance !== undefined && (
                    <div className="text-left border-b pb-4 border-slate-200">
                        <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">{balanceLabel}</p>
                        <h1 className="text-3xl font-bold text-slate-900">{formatMoney(consolidatedBalance)}</h1>
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Extrato de Movimentações</h2>
                    <div className="text-sm text-slate-500 mt-1 flex gap-4">
                        {dateRange?.from ? (
                            <span>Período: {format(dateRange.from, "dd/MM/yyyy")} - {dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : format(dateRange.from, "dd/MM/yyyy")}</span>
                        ) : <span>Período: Todo o histórico</span>}
                        {typeFilter !== 'all' && <span>Tipo: {typeFilter === 'credit' ? 'Entradas' : 'Saídas'}</span>}
                        {showDeletedOnly && <span className="text-red-600 font-bold">Lixeira (Excluídos)</span>}
                    </div>
                </div>
            </div>

            <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-4 gap-4 print:hidden">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Extrato de Movimentações
                </CardTitle>

                <div className="flex items-center justify-end gap-2 w-full md:w-auto">

                    {/* Date Picker (Outside) */}
                    <div className="hidden sm:block">
                        <DateRangePicker
                            date={dateRange}
                            setDate={setDateRange}
                            className="bg-slate-50 dark:bg-slate-900/50 border-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        />
                    </div>
                    <div className="sm:hidden w-[36px] overflow-hidden">
                        <DateRangePicker
                            date={dateRange}
                            setDate={setDateRange}
                            className="w-[36px] p-0 border-none"
                        />
                    </div>

                    {/* Filters Drawer Trigger */}
                    <Drawer open={isDrawerOpen} onOpenChange={(open) => {
                        if (open) openFilterDrawer();
                        else setIsDrawerOpen(false);
                    }}>
                        <DrawerTrigger asChild>
                            <Button
                                variant={hasActiveFilters ? "default" : "outline"}
                                size="icon"
                                className={cn(
                                    "shrink-0 transition-all relative",
                                    hasActiveFilters
                                        ? "bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-400"
                                        : "bg-slate-50 dark:bg-slate-900/50 border-none"
                                )}
                                title="Filtrar Extrato"
                            >
                                <Filter className="h-4 w-4" />
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-white" />
                                )}
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <div className="mx-auto w-full max-w-sm">
                                <DrawerHeader>
                                    <DrawerTitle>Filtrar Movimentações</DrawerTitle>
                                </DrawerHeader>
                                <div className="p-4 space-y-6">
                                    {/* 1. Status Filter (Active/Deleted) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status do Registro</label>
                                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <button
                                                className={cn(
                                                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                                    !draftShowDeletedOnly
                                                        ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                                                        : "text-slate-500 hover:text-slate-700"
                                                )}
                                                onClick={() => setDraftShowDeletedOnly(false)}
                                            >
                                                Ativos
                                            </button>
                                            <button
                                                className={cn(
                                                    "flex-1 py-1.5 text-sm font-medium rounded-md transition-all",
                                                    draftShowDeletedOnly
                                                        ? "bg-white dark:bg-slate-700 shadow-sm text-red-600"
                                                        : "text-slate-500 hover:text-slate-700"
                                                )}
                                                onClick={() => setDraftShowDeletedOnly(true)}
                                            >
                                                Excluídos
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. Type Toggles */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tipo de Movimentação</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setDraftTypeFilter(prev => prev === 'credit' ? 'all' : 'credit')}
                                                className={cn(
                                                    "w-full justify-start",
                                                    draftTypeFilter === 'credit' && "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                )}
                                            >
                                                <ArrowUpRight className="mr-2 h-4 w-4 text-emerald-500" />
                                                Entradas
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setDraftTypeFilter(prev => prev === 'debit' ? 'all' : 'debit')}
                                                className={cn(
                                                    "w-full justify-start",
                                                    draftTypeFilter === 'debit' && "bg-red-50 border-red-200 text-red-700"
                                                )}
                                            >
                                                <ArrowDownLeft className="mr-2 h-4 w-4 text-red-500" />
                                                Saídas
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 2. Search Field & Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Busca Detalhada</label>

                                        <div className="flex flex-col gap-3">
                                            <select
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                                value={draftSearchField}
                                                onChange={(e) => setDraftSearchField(e.target.value as SearchField)}
                                            >
                                                <option value="description">Descrição</option>
                                                <option value="amount">Valor</option>
                                                <option value="category">Categoria</option>
                                                <option value="payment_method">Forma Pagto.</option>
                                            </select>

                                            <Input
                                                placeholder={`Buscar por ${getSearchFieldLabel(draftSearchField).toLowerCase()}...`}
                                                value={draftSearchTerm}
                                                onChange={(e) => setDraftSearchTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                                className="w-full"
                                            />
                                        </div>
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
                        className="bg-slate-50 dark:bg-slate-900/50 border-none shrink-0"
                        onClick={handlePrint}
                        title="Imprimir Extrato"
                    >
                        <Printer className="h-4 w-4" />
                    </Button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Delete Mode Toggle - Green if Restore Mode, Red if Delete Mode */}
                    <Button
                        variant={isDeleteMode ? (showDeletedOnly ? "default" : "destructive") : "outline"}
                        size="icon"
                        className={cn(
                            "shrink-0 transition-all",
                            !isDeleteMode && (showDeletedOnly ? "bg-slate-50 border-none text-slate-500 hover:text-emerald-600" : "bg-slate-50 dark:bg-slate-900/50 border-none text-slate-500 hover:text-red-600"),
                            isDeleteMode && showDeletedOnly && "bg-emerald-600 hover:bg-emerald-700 text-white"
                        )}
                        onClick={() => setIsDeleteMode(!isDeleteMode)}
                        title={isDeleteMode ? "Sair do modo de edição" : (showDeletedOnly ? "Ativar modo de restauração" : "Ativar modo de exclusão")}
                    >
                        {showDeletedOnly ? (
                            isDeleteMode ? <X className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>

                </div>
            </CardHeader>

            {/* Active Filters */}
            {hasActiveFilters && (
                <ActiveFilters
                    filters={[
                        ...(dateRange?.from ? [{
                            label: 'Período',
                            value: `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to || dateRange.from, "dd/MM", { locale: ptBR })}`
                        }] : []),
                        ...(activeSearch ? [{
                            label: getSearchFieldLabel(activeSearch.field),
                            value: activeSearch.term
                        }] : []),
                        ...(showDeletedOnly ? [{ label: 'Lixeira (Excluídos)' }] : []),
                        ...(typeFilter !== 'all' ? [{
                            label: typeFilter === 'credit' ? 'Entradas' : 'Saídas'
                        }] : [])
                    ]}
                    onClearAll={handleClearFilters}
                />
            )}

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
                                        <div
                                            key={transaction.id}
                                            className={cn(
                                                "flex items-center justify-between px-6 py-4 print:py-1 transition-colors group relative border-b last:border-0",
                                                transaction.is_deleted
                                                    ? "bg-slate-100 dark:bg-slate-900/20 opacity-80"
                                                    : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                            )}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0 mr-4 print:gap-2">
                                                <div className={cn(
                                                    "h-10 w-10 print:h-6 print:w-6 print:text-[10px] rounded-full flex items-center justify-center border shrink-0 relative overflow-hidden",
                                                    transaction.type === 'credit'
                                                        ? "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                                        : "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50"
                                                )}>

                                                    {/* Default Icon */}
                                                    {transaction.type === 'credit' ? <ArrowUpRight className="h-5 w-5 print:h-3 print:w-3" /> : <ArrowDownLeft className="h-5 w-5 print:h-3 print:w-3" />}

                                                    {/* Delete Mode Overlay */}
                                                    {isDeleteMode && (
                                                        showDeletedOnly ? (
                                                            // Restore Button
                                                            <button
                                                                className="absolute inset-0 w-full h-full bg-emerald-500 text-white flex items-center justify-center animate-in fade-in zoom-in duration-200 z-10"
                                                                onClick={(e) => handleRestoreClick(transaction.id, e)}
                                                                title="Restaurar movimentação"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            // Delete Button
                                                            !transaction.is_deleted && (
                                                                <button
                                                                    className="absolute inset-0 w-full h-full bg-red-500 text-white flex items-center justify-center animate-in fade-in zoom-in duration-200 z-10"
                                                                    onClick={(e) => handleDeleteClick(transaction.id, e)}
                                                                    title="Excluir movimentação"
                                                                >
                                                                    <X className="h-5 w-5" />
                                                                </button>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={cn("font-medium text-slate-900 dark:text-slate-100 truncate pr-2", transaction.is_deleted && "line-through text-slate-500")}>{transaction.description}</p>
                                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 print:text-xs">
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
                                                    transaction.is_deleted
                                                        ? "text-slate-400 dark:text-slate-600"
                                                        : (transaction.type === 'credit' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")
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

            {/* Pagination */}
            {filteredTransactions.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between print:hidden">
                    {/* Left: Nav Buttons */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Primeira
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Anterior
                        </button>
                    </div>

                    {/* Center: Dropdown */}
                    <div className="flex items-center gap-2">
                        <select
                            value={currentPage}
                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                            className="h-8 w-16 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900"
                        >
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <option key={page} value={page}>{page}</option>
                            ))}
                        </select>
                    </div>

                    {/* Right: Nav Buttons & Info */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Próxima
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Última
                        </button>

                        <span className="ml-4 text-xs font-normal opacity-70">
                            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length}
                        </span>
                    </div>
                </div>
            )}

            <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Movimentação?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação irá marcar a movimentação como excluída e <strong>reverterá o saldo</strong> da conta vinculada.
                            O registro ficará oculto da lista principal e visível apenas no filtro de excluídos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Excluir e Reverter Saldo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!transactionToRestore} onOpenChange={(open) => !open && setTransactionToRestore(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restaurar Movimentação?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação irá reativar a movimentação e <strong>reaplicar o valor</strong> no saldo da conta vinculada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRestore} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Confirmar Restauração
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card >
    );
}
