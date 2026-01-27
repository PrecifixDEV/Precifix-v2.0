import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    LayoutDashboard,
    ShoppingCart,
    Calendar,
    Wallet,
    Menu as MenuIcon,
    X,
    LogOut,
    User,
    Bell,
    Settings,
    CreditCard,
    ChevronDown as ChevronDownIcon,
    Building2,
    FolderPlus,
    Wrench,
    Calculator,
    Loader2,
    DollarSign,
} from 'lucide-react'
import { SubscriptionTag } from '../components/SubscriptionTag'
import { Clock } from '../components/Clock'
import { supabase } from '../lib/supabase'
import { AppLayout } from '@/components/layout/AppLayout'
import { useMobile } from '../hooks/useMobile'

import logo from '../assets/precifix-logo.png'

export const MainLayout = () => {
    const isMobile = useMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [nickname, setNickname] = useState<string | null>(null)
    const [subscriptionData, setSubscriptionData] = useState<{ status: string | null, trialEndsAt: string | null }>({ status: null, trialEndsAt: null })
    const [isToolsOpen, setIsToolsOpen] = useState(false)

    const location = useLocation()
    const navigate = useNavigate()

    const fetchProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('subscription_status, trial_ends_at, nickname')
                .eq('id', userId)
                .single() as any

            if (data) {
                setSubscriptionData({
                    status: data.subscription_status,
                    trialEndsAt: data.trial_ends_at
                })
                setNickname(data.nickname)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    useEffect(() => {
        const handleProfileUpdate = () => {
            if (user?.id) {
                fetchProfile(user.id)
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) setUser(user)
                })
            }
        }

        window.addEventListener('profile-updated', handleProfileUpdate)

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    navigate('/login')
                } else {
                    setUser(session.user)
                    await fetchProfile(session.user.id)
                }
            } catch (error) {
                console.error("Session check failed", error)
                navigate('/login')
            } finally {
                setIsLoading(false)
            }
        }

        checkSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                navigate('/login')
                setUser(null)
            } else if (event === 'SIGNED_IN' || session) {
                setUser(session.user)
                if (event === 'SIGNED_IN') fetchProfile(session.user.id)
            }
        })

        return () => {
            subscription.unsubscribe()
            window.removeEventListener('profile-updated', handleProfileUpdate)
        }
    }, [navigate, user?.id])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const getFirstName = () => {
        if (nickname) return nickname
        const fullName = user?.user_metadata?.full_name || 'Usuário'
        return fullName.split(' ')[0]
    }

    const navigation = [
        { name: 'Painel Principal', href: '/', icon: LayoutDashboard },
        {
            name: 'Cadastros',
            icon: FolderPlus,
            children: [
                { name: 'Produtos', href: '/cadastros/produtos' },
                { name: 'Serviços', href: '/cadastros/servicos' },
                { name: 'Clientes', href: '/cadastros/clientes' },
                { name: 'Formas de Pagamento', href: '/cadastros/formas-pagamento' },
            ]
        },
        { name: 'Vendas', href: '/sales', icon: ShoppingCart },
        { name: 'Agenda', href: '/schedule', icon: Calendar },
        {
            name: 'Financeiro',
            icon: Wallet,
            children: [
                { name: 'Precificação', href: '/financial' },
                { name: 'Caixas e Bancos', href: '/accounts' },
                { name: 'Contas a Pagar', href: '/accounts-payable' },
                { name: 'Gerenciar Despesas', href: '/custos' }
            ]
        },
    ]

    const [openSubmenus, setOpenSubmenus] = useState<string[]>(['Cadastros'])

    const toggleSubmenu = (name: string) => {
        setOpenSubmenus(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        )
    }

    const isSubmenuActive = (children: any[]) => {
        return children.some(child => location.pathname === child.href)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isMobile) {
        return (
            <AppLayout>
                <Outlet />
            </AppLayout>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex transition-colors duration-200">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 
                bg-zinc-900 
                transform transition-transform duration-200 ease-in-out border-r border-zinc-800
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                print:hidden
            `}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 bg-zinc-900 border-b border-primary">
                        <Link to="/">
                            <img src={logo} alt="Precifix Logo" className="h-8 w-auto" />
                        </Link>
                        <button
                            className="ml-auto lg:hidden text-zinc-400"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            if (item.children) {
                                const isActive = isSubmenuActive(item.children)
                                const isOpen = openSubmenus.includes(item.name) || isActive

                                return (
                                    <div key={item.name} className="space-y-1">
                                        <button
                                            onClick={() => toggleSubmenu(item.name)}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                                ${isActive
                                                    ? 'text-white'
                                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className={`w-5 h-5 ${isActive ? 'text-yellow-500' : 'text-zinc-500'}`} />
                                                {item.name}
                                            </div>
                                            <ChevronDownIcon
                                                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        {isOpen && (
                                            <div className="pl-4 space-y-1">
                                                {item.children.map((child) => {
                                                    const isChildActive = location.pathname === child.href
                                                    return (
                                                        <Link
                                                            key={child.name}
                                                            to={child.href}
                                                            className={`
                                                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                                                ${isChildActive
                                                                    ? 'bg-zinc-800 text-white font-bold border-l-4 border-yellow-500 shadow-sm pl-[calc(0.75rem-4px)]'
                                                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                                                }
                                                            `}
                                                            onClick={() => setIsSidebarOpen(false)}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-zinc-800 text-white font-bold border-l-4 border-yellow-500 shadow-sm pl-[calc(0.75rem-4px)]'
                                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                        }
                                    `}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-yellow-500' : 'text-zinc-500'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-zinc-800">
                        <div className="mb-4">
                            <button
                                onClick={() => setIsToolsOpen(!isToolsOpen)}
                                className={`
                                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${isToolsOpen
                                        ? 'bg-zinc-800 text-white'
                                        : 'text-zinc-400 hover:bg-zinc-800'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Wrench className={`w-5 h-5 ${isToolsOpen ? 'text-yellow-500' : 'text-zinc-500'}`} />
                                    Ferramentas
                                </div>
                                <ChevronDownIcon
                                    className={`w-4 h-4 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {isToolsOpen && (
                                <div className="mt-2 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-4 gap-2">
                                        <Link
                                            to="/tools/dilution-calculator"
                                            className="flex items-center justify-center p-2 rounded-md bg-zinc-800 hover:bg-yellow-500/10 hover:text-yellow-500 border border-yellow-500/10 hover:border-yellow-500/30 transition-all shadow-sm group relative"
                                            onClick={() => setIsSidebarOpen(false)}
                                            title="Calculadora de Diluição"
                                        >
                                            <Calculator className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                        </Link>
                                        <Link
                                            to="/tools/product-cost"
                                            className="flex items-center justify-center p-2 rounded-md bg-zinc-800 hover:bg-yellow-500/10 hover:text-yellow-500 border border-yellow-500/10 hover:border-yellow-500/30 transition-all shadow-sm group relative"
                                            onClick={() => setIsSidebarOpen(false)}
                                            title="Calculadora de Custos"
                                        >
                                            <DollarSign className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-200 print:pl-0">
                <header className="h-16 bg-zinc-900 border-b border-primary shadow-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 print:hidden">
                    <button
                        className="lg:hidden p-2 text-zinc-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>

                    <div className="hidden lg:block"></div>

                    <Clock />

                    <div className="ml-auto flex items-center gap-6">
                        <SubscriptionTag
                            status={subscriptionData.status}
                            trialEndsAt={subscriptionData.trialEndsAt}
                        />

                        <button className="relative p-2 text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-zinc-900"></span>
                        </button>

                        <div className="h-6 w-px bg-zinc-800"></div>

                        <span className="text-sm font-semibold text-white hidden md:block">
                            Olá, {getFirstName()}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex rounded-full bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
                                    <span className="sr-only">Open user menu</span>
                                    {user?.user_metadata?.avatar_url ? (
                                        <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={user.user_metadata.avatar_url}
                                            alt=""
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center">
                                            <User className="h-6 w-6 text-zinc-400" />
                                        </div>
                                    )}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mr-4" align="end">
                                <div className="px-2 py-1.5 border-b border-border">
                                    <p className="text-sm font-bold text-foreground truncate">
                                        {user?.email}
                                    </p>
                                </div>

                                <DropdownMenuItem asChild>
                                    <Link
                                        to="/profile"
                                        className="w-full cursor-pointer flex items-center gap-2"
                                    >
                                        <User className="w-4 h-4" />
                                        Meu Perfil
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link
                                        to="/minha-empresa"
                                        className="w-full cursor-pointer flex items-center gap-2"
                                    >
                                        <Building2 className="w-4 h-4" />
                                        Minha Empresa
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link
                                        to="/settings"
                                        className="w-full cursor-pointer flex items-center gap-2"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Configurações
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <button className="w-full cursor-pointer flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Meu Plano
                                    </button>
                                </DropdownMenuItem>

                                <div className="h-px bg-border my-1" />

                                <DropdownMenuItem asChild className="text-red-500 focus:text-red-500">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full cursor-pointer flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sair
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
