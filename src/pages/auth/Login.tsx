import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { translateAuthError } from '../../utils/authErrors'

export const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            navigate('/')
        } catch (err: any) {
            setError(translateAuthError(err.message || 'Erro ao realizar login.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Precifix</h2>
                <p className="text-slate-400 text-sm">
                    Sistema de gestão facilitada para estética automotiva.
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <Input
                    label="Qual seu e-mail?"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5" />}
                    required
                />

                <div className="space-y-1">
                    <Input
                        label="Qual sua senha?"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock className="w-5 h-5" />}
                        endIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        onEndIconClick={() => setShowPassword(!showPassword)}
                        required
                    />
                    <div className="flex justify-end pt-1">
                        <Link
                            to="/forgot-password"
                            className="text-xs text-slate-400 hover:text-yellow-500 transition-colors"
                        >
                            Esqueceu sua senha?
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <Button type="submit" fullWidth isLoading={loading}>
                    ENTRAR NA PLATAFORMA
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    to="/register"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Não tem uma conta? <span className="text-yellow-500 font-medium ml-1">Crie uma</span>
                </Link>
            </div>
        </div>
    )
}
