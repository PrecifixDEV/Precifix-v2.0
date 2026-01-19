import { BarChart3, CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CostAnalysisSummaryProps {
    sumFixedCosts: number;
    sumVariableCosts: number;
    totalMonthlyExpenses: number;
    dailyCost: number;
    hourlyCost: number;
    totalWorkingDaysInMonth: number;
    averageDailyWorkingHours: number;
}

export const CostAnalysisSummary = ({
    sumFixedCosts,
    sumVariableCosts,
    totalMonthlyExpenses,
    dailyCost,
    hourlyCost,
    totalWorkingDaysInMonth,
    averageDailyWorkingHours,
}: CostAnalysisSummaryProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-yellow-500" />
                    Análise dos Custos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        Total de Gastos no Mês (sem produtos):
                    </p>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Despesas Fixas:</span>
                        <span className="font-medium text-zinc-900 dark:text-white">R$ {sumFixedCosts.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400">Despesas Variáveis:</span>
                        <span className="font-medium text-zinc-900 dark:text-white">R$ {sumVariableCosts.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="font-bold text-zinc-900 dark:text-white">Total Mensal:</span>
                        <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500">R$ {totalMonthlyExpenses.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-green-500/20 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarDays className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Custo Diário</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-500">R$ {dailyCost.toFixed(2)}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Baseado em {totalWorkingDaysInMonth} dias trabalhados/mês
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-yellow-500/20 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Custo por Hora</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">R$ {hourlyCost.toFixed(2)}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Considerando {averageDailyWorkingHours.toFixed(1)}h líquidas/dia
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
