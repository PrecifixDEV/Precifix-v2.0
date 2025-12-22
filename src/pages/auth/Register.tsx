import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Building2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { translateAuthError } from '../../utils/authErrors'

export const Register = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        fullName: '',
        shopName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não conferem.')
            setLoading(false)
            return
        }

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        shop_name: formData.shopName
                    },
                    emailRedirectTo: 'http://localhost:5173/'
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // Redirect user to confirmation page
                navigate('/email-confirmation')
            }
        } catch (err: any) {
            setError(translateAuthError(err.message || 'Erro ao criar conta.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Criar Nova Conta</h2>
                <p className="text-slate-400 text-sm">
                    Preencha seus dados para começar a usar a plataforma.
                </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                <Input
                    label="Qual seu nome completo?"
                    name="fullName"
                    placeholder="Ex: João da Silva"
                    value={formData.fullName}
                    onChange={handleChange}
                    icon={<User className="w-5 h-5" />}
                    required
                />

                <Input
                    label="Qual nome da sua empresa?"
                    name="shopName"
                    placeholder="Ex: Lava Jato do João"
                    value={formData.shopName}
                    onChange={handleChange}
                    icon={<Building2 className="w-5 h-5" />}
                />

                <Input
                    label="Qual seu e-mail?"
                    name="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<Mail className="w-5 h-5" />}
                    required
                />

                <Input
                    label="Crie sua senha"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha#123"
                    value={formData.password}
                    onChange={handleChange}
                    icon={<Lock className="w-5 h-5" />}
                    endIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    onEndIconClick={() => setShowPassword(!showPassword)}
                    required
                />

                <Input
                    label="Confirme a senha criada"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Senha#123"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={<Lock className="w-5 h-5" />}
                    endIcon={showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    required
                />

                {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <Button type="submit" fullWidth isLoading={loading} className="mt-2">
                    CRIAR CONTA E GANHAR 7 DIAS GRÁTIS
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    to="/login"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <span className="mr-2">👤</span>
                    Já tem conta? <span className="text-white hover:underline">Entrar</span>
                </Link>
            </div>
        </div>
    )
}
