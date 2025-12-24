
import { BarChart3, CalendarDays, Clock } from 'lucide-react';

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
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Análise dos Custos</h3>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Total de Gastos no Mês (sem produtos):
                </p>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Despesas Fixas:</span>
                    <span className="font-medium text-slate-900 dark:text-white">R$ {sumFixedCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Despesas Variáveis:</span>
                    <span className="font-medium text-slate-900 dark:text-white">R$ {sumVariableCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white">Total Mensal:</span>
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500">R$ {totalMonthlyExpenses.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-green-500/20 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarDays className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">Custo Diário</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-500">R$ {dailyCost.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Baseado em {totalWorkingDaysInMonth} dias trabalhados/mês
                    </p>
                </div>

                <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-blue-500/20 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Custo por Hora</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">R$ {hourlyCost.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Considerando {averageDailyWorkingHours.toFixed(1)}h líquidas/dia
                    </p>
                </div>
            </div>
        </div>
    );
};
