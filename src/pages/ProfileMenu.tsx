import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
    User,
    Building2,
    CreditCard,
    Settings,
    LogOut,
    ChevronRight,
    Moon,
    Sun
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/contexts/ThemeContext'

export const ProfileMenu = () => {
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const [userProfile, setUserProfile] = useState<{ name: string; avatar_url: string | null } | null>(null)

    useEffect(() => {
        getProfile()
    }, [])

    const getProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, nickname, avatar_url')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    const displayName = data.nickname || data.first_name || 'Usuário'
                    setUserProfile({
                        name: displayName,
                        avatar_url: data.avatar_url
                    })
                } else {
                    // Fallback to metadata
                    setUserProfile({
                        name: user.user_metadata?.full_name?.split(' ')[0] || 'Usuário',
                        avatar_url: null
                    })
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const startMenuItems = [
        {
            label: 'Minha Empresa',
            icon: Building2,
            href: '/minha-empresa'
        },
        {
            label: 'Meu Plano',
            icon: CreditCard,
            href: '/subscription' // Placeholder route
        },
        {
            label: 'Configurações',
            icon: Settings,
            href: '/settings'
        }
    ]

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-white dark:bg-zinc-900 pt-8 pb-6 px-4 mb-4 shadow-sm border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-yellow-500 p-0.5 bg-white dark:bg-zinc-800">
                            {userProfile?.avatar_url ? (
                                <img
                                    src={userProfile.avatar_url}
                                    alt="Avatar"
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <User className="h-8 w-8 text-zinc-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                            {userProfile?.name || 'Carregando...'}
                        </h2>
                        <Link
                            to="/profile"
                            className="text-sm font-medium text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 flex items-center gap-1 transition-colors"
                        >
                            Ver meu Perfil
                            <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Menu List */}
            <div className="px-4 space-y-6">

                {/* Section 1: User & App */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    {startMenuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.href}
                            className={`flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${index !== startMenuItems.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                    <item.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                    {item.label}
                                </span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-zinc-400" />
                        </Link>
                    ))}
                </div>

                {/* Section 2: Appearance */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                {theme === 'dark' ? (
                                    <Moon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                ) : (
                                    <Sun className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                )}
                            </div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                Modo Escuro
                            </span>
                        </div>
                        <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={toggleTheme}
                            className="data-[state=checked]:bg-yellow-500"
                        />
                    </div>
                </div>

                {/* Section 3: Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 active:scale-95 transition-transform font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Sair da conta
                </button>

                <p className="text-center text-xs text-zinc-400 pt-4">
                    Versão 2.0.0
                </p>
            </div>
        </div>
    )
}
