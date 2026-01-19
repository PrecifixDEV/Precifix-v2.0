import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    Package,
    Users,
    Receipt
} from 'lucide-react'
import { Input } from '@/components/ui/input'


export const MobileMenu = () => {

    const [searchTerm, setSearchTerm] = useState('')

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
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">
            <div className="p-4 space-y-6">
                {/* Header / Search */}
                <div className="space-y-2">

                    <div className="relative">
                        <Input
                            placeholder="Buscar funcionalidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white dark:bg-zinc-900"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10 pointer-events-none" />
                    </div>
                </div>

                {/* Grid */}
                <div className="space-y-6">
                    {filteredMenu.map((section) => (
                        <div key={section.category} className="space-y-3">
                            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider px-1">
                                {section.category}
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className="flex flex-col items-start p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm active:scale-95 transition-transform"
                                    >
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-3">
                                            <item.icon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                                        </div>
                                        <span className="font-medium text-zinc-900 dark:text-white text-sm">
                                            {item.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Show message if no results */}
                    {filteredMenu.length === 0 && (
                        <div className="text-center py-8 text-zinc-500">
                            Nenhuma funcionalidade encontrada para "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
