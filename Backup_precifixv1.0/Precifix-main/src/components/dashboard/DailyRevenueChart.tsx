import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart2, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, getDate, isSameDay, subYears, startOfYear, endOfYear, getMonth, getYear, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface DailyRevenueChartProps {
  selectedDate: Date;
}

interface ChartDataPoint {
  label: string; // Day number or Month name
  sortIndex: number; // For sorting (day or month index)
  currentRevenue: number;
  comparisonRevenue: number;
  fullDate?: string; // For keys
}

export const DailyRevenueChart = ({ selectedDate }: DailyRevenueChartProps) => {
  const { user } = useSession();
  const [comparisonType, setComparisonType] = React.useState<'daily' | 'monthly'>('daily');

  let startOfCurrentPeriod: Date;
  let endOfCurrentPeriod: Date;
  let startOfComparisonPeriod: Date;
  let endOfComparisonPeriod: Date;

  if (comparisonType === 'monthly') {
    startOfCurrentPeriod = startOfYear(selectedDate);
    endOfCurrentPeriod = endOfYear(selectedDate);
    startOfComparisonPeriod = startOfYear(subYears(selectedDate, 1));
    endOfComparisonPeriod = endOfYear(subYears(selectedDate, 1));
  } else {
    // Daily view (compares current month with previous month)
    startOfCurrentPeriod = startOfMonth(selectedDate);
    endOfCurrentPeriod = endOfMonth(selectedDate);
    startOfComparisonPeriod = startOfMonth(subMonths(selectedDate, 1));
    endOfComparisonPeriod = endOfMonth(subMonths(selectedDate, 1));
  }

  // Use format(date, 'yyyy-MM-dd') for database comparisons
  const currentStartStr = format(startOfCurrentPeriod, 'yyyy-MM-dd');
  const currentEndStr = format(endOfCurrentPeriod, 'yyyy-MM-dd');
  const comparisonStartStr = format(startOfComparisonPeriod, 'yyyy-MM-dd');
  const comparisonEndStr = format(endOfComparisonPeriod, 'yyyy-MM-dd');

  // Fetch current period sales
  const { data: currentPeriodSales, isLoading: isLoadingCurrentSales } = useQuery<any[]>({
    queryKey: ['dailyRevenueCurrentSales', user?.id, comparisonType, currentStartStr, currentEndStr],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('quotes')
        .select('total_price, service_date, quote_date')
        .eq('user_id', user.id)
        .eq('is_sale', true)
        .in('status', ['accepted', 'closed'])
        .gte('service_date', currentStartStr)
        .lte('service_date', currentEndStr);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch comparison period sales
  const { data: comparisonPeriodSales, isLoading: isLoadingComparisonSales } = useQuery<any[]>({
    queryKey: ['dailyRevenueComparisonSales', user?.id, comparisonType, comparisonStartStr, comparisonEndStr],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('quotes')
        .select('total_price, service_date, quote_date')
        .eq('user_id', user.id)
        .eq('is_sale', true)
        .in('status', ['accepted', 'closed'])
        .gte('service_date', comparisonStartStr)
        .lte('service_date', comparisonEndStr);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const chartData = React.useMemo(() => {
    const dataMap = new Map<number, ChartDataPoint>();

    if (comparisonType === 'monthly') {
      // Monthly view: Initialize with all months 0-11
      for (let i = 0; i < 12; i++) {
        dataMap.set(i, {
          label: format(new Date(2000, i, 1), 'MMM', { locale: ptBR }),
          sortIndex: i,
          currentRevenue: 0,
          comparisonRevenue: 0,
        });
      }

      currentPeriodSales?.forEach(sale => {
        const dateStr = sale.service_date || sale.quote_date;
        if (!dateStr) return;
        const [year, month, day] = dateStr.split('-').map(Number);
        const monthIndex = month - 1; // 0-11

        if (dataMap.has(monthIndex)) {
          dataMap.get(monthIndex)!.currentRevenue += sale.total_price;
        }
      });

      comparisonPeriodSales?.forEach(sale => {
        const dateStr = sale.service_date || sale.quote_date;
        if (!dateStr) return;
        const [year, month, day] = dateStr.split('-').map(Number);
        const monthIndex = month - 1; // 0-11

        if (dataMap.has(monthIndex)) {
          dataMap.get(monthIndex)!.comparisonRevenue += sale.total_price;
        }
      });

    } else {
      // Daily view: Initialize with days of current month
      const daysInCurrentMonth = eachDayOfInterval({ start: startOfCurrentPeriod, end: endOfCurrentPeriod });

      daysInCurrentMonth.forEach(day => {
        const dayOfMonth = getDate(day);
        dataMap.set(dayOfMonth, {
          label: dayOfMonth.toString(),
          sortIndex: dayOfMonth,
          currentRevenue: 0,
          comparisonRevenue: 0,
          fullDate: format(day, 'yyyy-MM-dd')
        });
      });

      currentPeriodSales?.forEach(sale => {
        const dateStr = sale.service_date || sale.quote_date;
        if (!dateStr) return;
        const [year, month, day] = dateStr.split('-').map(Number);

        if (dataMap.has(day)) {
          dataMap.get(day)!.currentRevenue += sale.total_price;
        }
      });

      comparisonPeriodSales?.forEach(sale => {
        const dateStr = sale.service_date || sale.quote_date;
        if (!dateStr) return;
        const [year, month, day] = dateStr.split('-').map(Number);

        if (dataMap.has(day)) {
          dataMap.get(day)!.comparisonRevenue += sale.total_price;
        }
      });
    }

    return Array.from(dataMap.values()).sort((a, b) => a.sortIndex - b.sortIndex);
  }, [currentPeriodSales, comparisonPeriodSales, comparisonType, startOfCurrentPeriod, endOfCurrentPeriod]);

  const getChartTitle = () => {
    if (comparisonType === 'monthly') return 'Faturamento Mensal';
    return 'Faturamento Diário';
  };

  const getDescription = () => {
    if (comparisonType === 'monthly') return 'Comparativo do faturamento mensal com o ano anterior.';
    return 'Comparativo do faturamento diário com o mês anterior.';
  };

  const getCurrentLabel = () => {
    if (comparisonType === 'monthly') return `Faturamento ${getYear(selectedDate)}`;
    return `Faturamento ${format(selectedDate, 'MMM yyyy', { locale: ptBR })}`;
  };

  const getComparisonLabel = () => {
    if (comparisonType === 'monthly') return `Faturamento ${getYear(selectedDate) - 1}`;
    return `Faturamento ${format(subMonths(selectedDate, 1), 'MMM yyyy', { locale: ptBR })}`;
  };

  if (isLoadingCurrentSales || isLoadingComparisonSales) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">{getChartTitle()}</CardTitle>
          </div>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 self-start sm:self-center">
            <BarChart2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground">{getChartTitle()}</CardTitle>
          </div>
          <RadioGroup
            defaultValue="daily"
            value={comparisonType}
            onValueChange={(value: 'daily' | 'monthly') => setComparisonType(value)}
            className="flex gap-4 self-start sm:self-center"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily-comparison" />
              <Label htmlFor="daily-comparison">Diário</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly-comparison" />
              <Label htmlFor="monthly-comparison">Mensal</Label>
            </div>
          </RadioGroup>
        </div>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="label"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip
              formatter={(value: number) => `R$${value.toFixed(2)}`}
              labelFormatter={(label) => comparisonType === 'monthly' ? label : `Dia ${label}`}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Bar dataKey="currentRevenue" name={getCurrentLabel()} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="comparisonRevenue"
              name={getComparisonLabel()}
              fill="hsl(var(--muted-foreground))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};