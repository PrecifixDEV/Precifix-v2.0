import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Search,
    LayoutDashboard,
    ShoppingCart,
    Calendar,
    Wallet,
    Wrench,
    User,
    Settings,
    Building2,
    Calculator,
    CreditCard,
    LogOut,
    Package,
    Users,
    Receipt
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export const MobileMenu = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const menuItems = [
        {
            category: 'Cadastros',
            items: [
                { name: 'Produtos', href: '/cadastros/produtos', icon: Package },
                { name: 'Serviços', href: '/cadastros/servicos', icon: Wrench },
                { name: 'Clientes', href: '/cadastros/clientes', icon: Users },
                { name: 'Formas de Pagamento', href: '/cadastros/formas-pagamento', icon: CreditCard },
            ]
        },
        {
            category: 'Financeiro',
            items: [
                { name: 'Visão Geral', href: '/financial', icon: Wallet },
                { name: 'Caixas e Bancos', href: '/accounts', icon: Building2 }, // Using Building2 as generic bank icon
                { name: 'Contas a Pagar', href: '/accounts-payable', icon: Receipt },
                { name: 'Gerenciar Despesas', href: '/custos', icon: Wallet },
            ]
        },
        {
            category: 'Ferramentas',
            items: [
                { name: 'Calculadora de Diluição', href: '/tools/dilution-calculator', icon: Calculator },
                { name: 'Calculadora de Custos', href: '/tools/product-cost', icon: Calculator },
            ]
        },
        {
            category: 'Geral',
            items: [
                { name: 'Painel Principal', href: '/', icon: LayoutDashboard },
                { name: 'Vendas', href: '/sales', icon: ShoppingCart },
                { name: 'Agenda', href: '/schedule', icon: Calendar },
                { name: 'Minha Empresa', href: '/minha-empresa', icon: Building2 },
                { name: 'Meu Perfil', href: '/profile', icon: User },
                { name: 'Configurações', href: '/settings/categories', icon: Settings },
            ]
        }
    ]

    const filteredMenu = menuItems.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.items.length > 0)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            <div className="p-4 space-y-6">
                {/* Header / Search */}
                <div className="space-y-2">

                    <div className="relative">
                        <Input
                            placeholder="Buscar funcionalidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white dark:bg-slate-900"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                    </div>
                </div>

                {/* Grid */}
                <div className="space-y-6">
                    {filteredMenu.map((section) => (
                        <div key={section.category} className="space-y-3">
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">
                                {section.category}
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="flex flex-col items-start p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
                                    >
                                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mb-3">
                                            <item.icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                                            {item.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Show message if no results */}
                    {filteredMenu.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            Nenhuma funcionalidade encontrada para "{searchTerm}"
                        </div>
                    )}

                    {/* Logout Button (Only show when not searching or if explicitly looking for logout) */}
                    {(searchTerm === '' || 'sair logout'.includes(searchTerm.toLowerCase())) && (
                        <div className="pt-4">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-4 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 active:scale-95 transition-transform font-medium"
                            >
                                <LogOut className="w-5 h-5" />
                                Sair da conta
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
