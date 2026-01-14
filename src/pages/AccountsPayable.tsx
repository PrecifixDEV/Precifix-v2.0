import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AccountsPayableTable } from '@/components/billing/AccountsPayableTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewCostDialog } from '@/components/costs/NewCostDialog';
import { ResponsiveAddButton } from '@/components/ui/responsive-add-button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AccountsPayable = () => {
    const currentMonth_initial = new Date().getMonth() + 1;
    const currentYear_initial = new Date().getFullYear();

    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth_initial);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear_initial);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Generate recent years (e.g., current year +/- 2)
    const years = Array.from({ length: 5 }, (_, i) => currentYear_initial - 2 + i).sort((a, b) => b - a);

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: format(new Date(2000, i, 1), 'MMMM', { locale: ptBR }),
    }));

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contas a Pagar</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Visualize e gerencie seus pagamentos mensais.
                    </p>
                </div>
                <ResponsiveAddButton
                    onClick={() => setIsDialogOpen(true)}
                    label="Nova Despesa"
                    className="shadow-lg shadow-primary/20 shrink-0"
                />
            </div>

            {/* Month/Year Selectors - Outside Card */}
            <div className="flex items-center gap-2">
                <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value, 10))}
                >
                    <SelectTrigger className="w-[140px] bg-background">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map((month) => (
                            <SelectItem key={month.value} value={month.value.toString()}>
                                <span className="capitalize">{month.label}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
                >
                    <SelectTrigger className="w-[100px] bg-background">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-[var(--shadow-elegant)]">
                <CardContent className="pt-6">
                    <AccountsPayableTable
                        month={selectedMonth}
                        year={selectedYear}
                    />
                </CardContent>
            </Card>

            <NewCostDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    );
};

export default AccountsPayable;
