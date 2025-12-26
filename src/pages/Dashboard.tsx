import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '../lib/supabase'
import { Calendar, CheckCircle, Car, AlertTriangle } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
// import { ErpTester } from '@/components/ErpTester'


// Mock data for charts
const dailyRevenueData = [
    { date: '01', amount: 250 },
    { date: '02', amount: 1800 },
    { date: '03', amount: 0 },
    { date: '04', amount: 450 },
    { date: '05', amount: 900 },
    { date: '06', amount: 120 },
]

const servicePopularityData = [
    { name: 'Lavagem Técnica', count: 15, fill: 'var(--color-wash)' },
    { name: 'Polimento', count: 8, fill: 'var(--color-polish)' },
    { name: 'Higienização', count: 12, fill: 'var(--color-clean)' },
    { name: 'Vitrificação', count: 4, fill: 'var(--color-glass)' },
]

// Chart Config
const chartConfig = {
    amount: {
        label: "Faturamento",
        color: "#d97706", // amber-600
    },
    wash: {
        label: "Lavagem Técnica",
        color: "#0ea5e9", // sky-500
    },
    polish: {
        label: "Polimento",
        color: "#6366f1", // indigo-500
    },
    clean: {
        label: "Higienização",
        color: "#8b5cf6", // violet-500
    },
    glass: {
        label: "Vitrificação",
        color: "#ec4899", // pink-500
    },
} satisfies ChartConfig

export const Dashboard = () => {
    // State for dashboard metrics
    const [stats, setStats] = useState({
        revenue: 0,
        netRevenue: 0,
        completedServices: 0,
        carsServiced: 0
    })

    const [showProfileAlert, setShowProfileAlert] = useState(false)

    // Current Date Info
    const today = new Date()
    const currentMonth = today.toLocaleString('pt-BR', { month: 'long' })
    const currentYear = today.getFullYear()

    useEffect(() => {
        fetchDashboardData()
        checkProfileCompleteness()
    }, [])

    const checkProfileCompleteness = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (!profile || !profile.document_number || !profile.company_name) {
                setShowProfileAlert(true)
            }
        } catch (error) {
            console.error('Check profile error:', error)
        }
    }

    const fetchDashboardData = async () => {
        try {
            // 1. Get Completed Service Orders (status = completed or paid)
            const { data: serviceOrders, error: ordersError } = await supabase
                .from('service_orders')
                .select('*')
                .in('status', ['completed', 'paid'])

            if (ordersError) throw ordersError

            // 2. Calculate Revenue
            const revenue = serviceOrders?.reduce((acc, order) => acc + (order.final_amount || 0), 0) || 0

            // 3. Get Expenses (to calc net revenue) - For now just counting total
            const { data: expenses, error: expensesError } = await supabase
                .from('expenses')
                .select('amount')

            if (expensesError) throw expensesError

            const totalExpenses = expenses?.reduce((acc, expense) => acc + (expense.amount || 0), 0) || 0

            // 4. Unique Cars
            const uniqueCars = new Set(serviceOrders?.map(o => o.vehicle_id)).size

            setStats({
                revenue,
                netRevenue: revenue - totalExpenses,
                completedServices: serviceOrders?.length || 0,
                carsServiced: uniqueCars
            })

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    const valueFormatter = (number: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Warning Alert if Profile incomplete */}
            {showProfileAlert && (
                <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-800 border border-yellow-500/50 border-l-4 border-l-yellow-500 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Perfil Incompleto
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                                    Complete seu cadastro (CNPJ/CPF, Endereço, Empresa) para liberar todos os recursos.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/profile"
                            className="whitespace-nowrap bg-yellow-500 text-slate-900 font-medium px-4 py-2 rounded-lg text-sm shadow-sm hover:none active:bg-yellow-600 transition-none"
                        >
                            Completar Perfil
                        </Link>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-slate-900 dark:text-white text-2xl font-bold">Painel Principal</h1>
                    <p className="text-slate-400 capitalize">
                        {currentMonth} {currentYear}
                    </p>
                </div>

                {/* DB Tester */}
                {/* <ErpTester /> */}

                {/* Date Filter Mockup */}
                <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors">
                        &lt;
                    </button>
                    <span className="text-sm font-medium text-white px-2 capitalize">{currentMonth}</span>
                    <button className="px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors">
                        &gt;
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-sm dark:shadow-none">
                    <CardContent className="p-6">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Faturamento do Mês</p>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{valueFormatter(stats.revenue)}</div>
                        <div className="h-1 w-12 bg-green-500 rounded mt-4"></div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm dark:shadow-none">
                    <CardContent className="p-6">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Receita Líquida</p>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{valueFormatter(stats.netRevenue)}</div>
                        <div className="h-1 w-12 bg-blue-500 rounded mt-4"></div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm dark:shadow-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Serviços Concluídos</p>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.completedServices}</div>
                            </div>
                            <CheckCircle className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm dark:shadow-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Carros Atendidos</p>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.carsServiced}</div>
                            </div>
                            <Car className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Revenue Chart */}
                <Card className="lg:col-span-2 shadow-sm dark:shadow-none">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Faturamento Diário</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-72">
                            <BarChart data={dailyRevenueData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis
                                    tickFormatter={(val) => `R$ ${val}`}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Popular Services Donut */}
                <Card className="shadow-sm dark:shadow-none flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Serviços Mais Populares</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                            <PieChart>
                                <Pie
                                    data={servicePopularityData}
                                    dataKey="count"
                                    nameKey="name"
                                    innerRadius={60}
                                />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <ChartLegend
                                    content={<ChartLegendContent nameKey="name" />}
                                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                                />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row - Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm dark:shadow-none">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">Próximos Agendamentos</h3>
                        </div>
                        <div className="text-center py-12 text-slate-500 text-sm">
                            Nenhum agendamento para hoje.
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm dark:shadow-none">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">Resumo de Agendamentos</h3>
                        </div>
                        <div className="text-center py-12 text-slate-500 text-sm">
                            Nenhum dado disponível.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
