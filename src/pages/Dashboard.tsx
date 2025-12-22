import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Metric, Text, BarChart, DonutChart, Title, Subtitle } from '@tremor/react'
import { supabase } from '../lib/supabase'
import { Calendar, CheckCircle, Car, AlertTriangle } from 'lucide-react'

// Mock data for charts (until we have real data populated)
const dailyRevenue = [
    { date: '01', 'Faturamento': 250 },
    { date: '02', 'Faturamento': 1800 },
    { date: '03', 'Faturamento': 0 },
    { date: '04', 'Faturamento': 450 },
    { date: '05', 'Faturamento': 900 },
    { date: '06', 'Faturamento': 120 },
    // ... add more days as needed
]

const servicePopularity = [
    { name: 'Lavagem Técnica', count: 15 },
    { name: 'Polimento', count: 8 },
    { name: 'Higienização', count: 12 },
    { name: 'Vitrificação', count: 4 },
]

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

            if (!profile || !profile.document_number || !profile.address || !profile.company_name) {
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
                            className="whitespace-nowrap bg-yellow-500 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm hover:none active:bg-yellow-600 transition-none"
                        >
                            Completar Perfil
                        </Link>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Title className="text-slate-900 dark:text-white text-2xl font-bold">Painel Principal</Title>
                    <Subtitle className="text-slate-400 capitalize">
                        {currentMonth} {currentYear}
                    </Subtitle>
                </div>

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
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 shadow-sm dark:shadow-none">
                    <Text className="text-slate-500 dark:text-slate-400">Faturamento do Mês</Text>
                    <Metric className="text-slate-900 dark:text-white mt-2">{valueFormatter(stats.revenue)}</Metric>
                    <div className="h-1 w-12 bg-green-500 rounded mt-4"></div>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 shadow-sm dark:shadow-none">
                    <Text className="text-slate-500 dark:text-slate-400">Receita Líquida</Text>
                    <Metric className="text-slate-900 dark:text-white mt-2">{valueFormatter(stats.netRevenue)}</Metric>
                    <div className="h-1 w-12 bg-blue-500 rounded mt-4"></div>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <Text className="text-slate-500 dark:text-slate-400">Serviços Concluídos</Text>
                            <Metric className="text-slate-900 dark:text-white mt-2">{stats.completedServices}</Metric>
                        </div>
                        <CheckCircle className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                    </div>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <Text className="text-slate-500 dark:text-slate-400">Carros Atendidos</Text>
                            <Metric className="text-slate-900 dark:text-white mt-2">{stats.carsServiced}</Metric>
                        </div>
                        <Car className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                    </div>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Revenue Chart */}
                <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                        <Title className="text-slate-900 dark:text-white">Faturamento Diário</Title>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-500">
                                <span className="w-2 h-2 rounded-full bg-yellow-600 dark:bg-yellow-500"></span>
                                Diário
                            </span>
                        </div>
                    </div>
                    <BarChart
                        className="mt-6 h-72"
                        data={dailyRevenue}
                        index="date"
                        categories={["Faturamento"]}
                        colors={["yellow"]}
                        valueFormatter={valueFormatter}
                        yAxisWidth={80}
                        showLegend={false}
                        showAnimation={true}
                    />
                </Card>

                {/* Popular Services Donut */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 shadow-sm dark:shadow-none flex flex-col">
                    <Title className="text-slate-900 dark:text-white mb-4">Serviços Mais Populares</Title>
                    <DonutChart
                        className="mt-4 h-48"
                        data={servicePopularity}
                        category="count"
                        index="name"
                        valueFormatter={(val) => `${val} serviços`}
                        colors={["cyan", "blue", "indigo", "violet"]}
                        showAnimation={true}
                    />
                    <div className="mt-8 flex-1">
                        <ul className="space-y-2">
                            {servicePopularity.map((service, index) => (
                                <li key={index} className="flex justify-between text-sm">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full bg-${["cyan", "blue", "indigo", "violet"][index]}-500`}></span>
                                        {service.name}
                                    </span>
                                    <span className="text-slate-900 dark:text-white font-medium">{service.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            </div>

            {/* Bottom Row - Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                        <Title className="text-slate-900 dark:text-white">Próximos Agendamentos</Title>
                    </div>
                    <div className="text-center py-12 text-slate-500 text-sm">
                        Nenhum agendamento para hoje.
                    </div>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ring-0 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                        <Title className="text-slate-900 dark:text-white">Resumo de Agendamentos</Title>
                    </div>
                    <div className="text-center py-12 text-slate-500 text-sm">
                        Nenhum dado disponível.
                    </div>
                </Card>
            </div>
        </div>
    )
}
