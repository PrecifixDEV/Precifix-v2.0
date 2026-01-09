import { useState, useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { financialService } from "@/services/financialService";
import { FinancialAccountCard } from "@/components/financial/FinancialAccountCard";
import { TransactionList } from "@/components/financial/TransactionList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney } from "@/utils/format";
import { format, isSameMonth, isSameYear, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AccountDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Filters
    const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth()));
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));

    const { data: accounts } = useQuery({
        queryKey: ['commercial_accounts'],
        queryFn: financialService.getAccounts
    });

    const { data: transactions, isLoading: loadingTransactions } = useQuery({
        queryKey: ['financial_transactions', id],
        enabled: !!id,
        queryFn: () => financialService.getTransactions(id)
    });

    const account = accounts?.find(a => a.id === id);

    // Derived State
    const filteredTransactions = useMemo(() => {
        return transactions || [];
    }, [transactions]);

    const chartData = useMemo(() => {
        if (!transactions) return { income: 0, expense: 0, dailyData: [] };

        const targetDate = new Date(Number(selectedYear), Number(selectedMonth));
        const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth) + 1, 0).getDate();

        // Initialize daily map
        const dailyMap = new Map();
        for (let i = 1; i <= daysInMonth; i++) {
            dailyMap.set(i, { name: i, income: 0, expense: 0 });
        }

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            const tDate = parseISO(t.transaction_date);
            if (isSameMonth(tDate, targetDate) && isSameYear(tDate, targetDate)) {
                const day = tDate.getDate();
                const amount = Number(t.amount);
                const current = dailyMap.get(day);

                if (t.type === 'credit') {
                    current.income += amount;
                    totalIncome += amount;
                } else if (t.type === 'debit') {
                    current.expense += amount;
                    totalExpense += amount;
                }
            }
        });

        const dailyData = Array.from(dailyMap.values());
        return { income: totalIncome, expense: totalExpense, dailyData };
    }, [transactions, selectedMonth, selectedYear]);

    if (!account) return <div className="p-8">Conta não encontrada...</div>;

    const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: String(i),
        label: format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })
    }));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/accounts')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{account.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Detalhes e movimentações da conta</p>
                </div>
            </div>

            {/* Top Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account Card (1/3) */}
                <div className="lg:col-span-1 h-[220px]">
                    <FinancialAccountCard
                        account={account}
                        hideActions={true}
                    />
                </div>

                {/* Chart Card (2/3) */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 h-[220px] relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between py-4 pb-2 space-y-0 relative z-10">
                        <CardTitle className="text-base font-medium">Resumo do Período</CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[120px] h-8 text-xs bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value} className="capitalize">{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[80px] h-8 text-xs bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map(y => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    {/* Background Chart */}
                    <div className="absolute inset-0 top-16 z-0 opacity-25 pointer-events-none">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.dailyData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10b981"
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#ef4444"
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <CardContent className="h-[150px] flex items-center justify-center gap-3 sm:gap-8 md:gap-16 relative z-10">
                        {/* Simple Balance View */}
                        <div className="flex flex-col items-center gap-1 p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-100/50 dark:border-slate-800/50 min-w-[100px]">
                            <span className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">Entradas</span>
                            <span className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                + {formatMoney(chartData.income)}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-100/50 dark:border-slate-800/50 min-w-[100px]">
                            <span className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">Saídas</span>
                            <span className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                                - {formatMoney(chartData.expense)}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-1 p-3 sm:p-4 rounded-xl bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border border-slate-100/50 dark:border-slate-800/50 min-w-[100px]">
                            <span className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">Resultado</span>
                            <span className={`text-lg sm:text-xl font-bold ${chartData.income - chartData.expense >= 0 ? 'text-slate-700 dark:text-slate-200' : 'text-red-600'}`}>
                                {formatMoney(chartData.income - chartData.expense)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Section */}
            <div>
                <TransactionList
                    transactions={filteredTransactions || []}
                    isLoading={loadingTransactions}
                />
            </div>
        </div>
    );
}
