import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowDownLeft, ArrowUpRight, Search, FileText } from "lucide-react";
import type { FinancialTransaction } from "@/types/costs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "../../utils/format";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TransactionListProps {
    transactions: (FinancialTransaction & { commercial_accounts: { name: string } | null })[];
    isLoading: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
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
    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const date = transaction.transaction_date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, typeof transactions>);

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Extrato de Movimentações
                </CardTitle>
                <div className="relative w-64 md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar lançamentos..." className="pl-9 bg-slate-50 dark:bg-slate-900/50 border-none" />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {transactions.length === 0 ? (
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
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center border",
                                                    transaction.type === 'credit'
                                                        ? "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50"
                                                        : "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50"
                                                )}>
                                                    {transaction.type === 'credit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{transaction.description}</p>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <span>{transaction.category || 'Geral'}</span>
                                                        {transaction.commercial_accounts?.name && (
                                                            <>
                                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                                <span className="text-xs">{transaction.commercial_accounts.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={cn(
                                                    "font-bold block",
                                                    transaction.type === 'credit' ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-slate-100"
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
