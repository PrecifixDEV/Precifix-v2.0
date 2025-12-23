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
    Wrench,
    ShoppingCart,
    Users,
    Calendar,
    Wallet,
    Menu as MenuIcon,
    X,
    LogOut,
    User,
    Moon,
    Sun,
    Bell,
    Settings,
    CreditCard
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../contexts/ThemeContext'

import logo from '../assets/precifix-logo.png'

export const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const { theme, toggleTheme } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                navigate('/login')
            } else {
                setUser(session.user)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                navigate('/login')
            } else {
                setUser(session.user)
            }
        })

        return () => subscription.unsubscribe()
    }, [navigate])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    // Get first name for greeting
    const getFirstName = () => {
        const fullName = user?.user_metadata?.full_name || 'Usuário'
        return fullName.split(' ')[0]
    }

    const navigation = [
        { name: 'Painel Principal', href: '/', icon: LayoutDashboard },
        { name: 'Serviços', href: '/services', icon: Wrench },
        { name: 'Vendas', href: '/sales', icon: ShoppingCart },
        { name: 'Clientes', href: '/clients', icon: Users },
        { name: 'Agenda', href: '/schedule', icon: Calendar },
        { name: 'Financeiro', href: '/financial', icon: Wallet },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 
                bg-white dark:bg-slate-900 
                transform transition-transform duration-200 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo area */}
                    {/* Logo area */}
                    <div className="h-16 flex items-center px-6">
                        <Link to="/">
                            <img src={logo} alt="Precifix Logo" className="h-8 w-auto" />
                        </Link>
                        <button
                            className="ml-auto lg:hidden text-slate-400"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-l-4 border-yellow-500 shadow-sm pl-[calc(0.75rem-4px)]'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                        }
                                    `}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-yellow-500' : 'text-slate-500'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white dark:bg-slate-900 shadow-md flex items-center justify-between px-4 lg:px-8 relative z-10">
                    <button
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>

                    {/* Spacer for when mobile menu is hidden */}
                    <div className="hidden lg:block"></div>

                    {/* Right Header Section */}
                    <div className="ml-auto flex items-center gap-6">
                        {/* Notifications */}
                        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                        </button>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

                        {/* User Greeting */}
                        <span className="text-sm font-semibold text-slate-900 dark:text-white hidden md:block">
                            Olá, {getFirstName()}
                        </span>


                        {/* User Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex rounded-full bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900">
                                    <span className="sr-only">Open user menu</span>
                                    {user?.user_metadata?.avatar_url ? (
                                        <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={user.user_metadata.avatar_url}
                                            alt=""
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                            <User className="h-6 w-6 text-slate-500 dark:text-slate-400" />
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
                                    <button className="w-full cursor-pointer flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        Configurações
                                    </button>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full cursor-pointer flex items-center gap-2"
                                    >
                                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                                    </button>
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

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
