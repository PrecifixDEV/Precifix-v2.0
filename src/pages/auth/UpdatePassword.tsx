import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Check, X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { translateAuthError } from '../../utils/authErrors'

export const UpdatePassword = () => {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPasswordRules, setShowPasswordRules] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const hasMinLength = password.length >= 6
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const isPasswordValid = hasMinLength && hasUpperCase && hasNumber

    // Check if we have a session (user is logged in via the magic link)
    // If not, redirect to login, as they can't change password without being authenticated
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // Potential edge case: The link expired or was invalid. 
                // For now, redirect to login, but could show a "Link Expired" message.
                navigate('/login')
            }
        })
    }, [navigate])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError('As senhas não conferem.')
            setLoading(false)
            return
        }

        if (!isPasswordValid) {
            setError('A senha não atende aos requisitos de segurança.')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            // Log out user or redirect to dashboard? 
            // Usually good practice to keep them logged in and go to dashboard.
            navigate('/')

        } catch (err: any) {
            setError(translateAuthError(err.message || 'Erro ao atualizar senha.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Criar Nova Senha</h2>
                <p className="text-slate-400 text-sm">
                    Sua nova senha deve ser diferente das anteriores por segurança.
                </p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div className="relative">
                    <Input
                        label="Nova senha"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setShowPasswordRules(true)}
                        onBlur={() => setShowPasswordRules(false)}
                        icon={<Lock className="w-5 h-5 text-white" />}
                        endIcon={showPassword ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
                        onEndIconClick={() => setShowPassword(!showPassword)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                        labelClassName="text-white"
                        required
                    />

                    {showPasswordRules && (
                        <div className="absolute left-0 bottom-full mb-2 w-full bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl z-10">
                            <p className="text-xs text-slate-400 mb-2 font-medium">Sua senha deve conter:</p>
                            <ul className="space-y-1">
                                <li className={`text-xs flex items-center gap-2 ${hasMinLength ? 'text-green-500' : 'text-slate-500'}`}>
                                    {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    Mínimo de 6 caracteres
                                </li>
                                <li className={`text-xs flex items-center gap-2 ${hasUpperCase ? 'text-green-500' : 'text-slate-500'}`}>
                                    {hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    Pelo menos uma letra maiúscula
                                </li>
                                <li className={`text-xs flex items-center gap-2 ${hasNumber ? 'text-green-500' : 'text-slate-500'}`}>
                                    {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    Pelo menos um número
                                </li>
                            </ul>
                            {/* Seta do balão */}
                            <div className="absolute left-4 -bottom-1.5 w-3 h-3 bg-slate-800 border-b border-l border-slate-700 transform -rotate-45"></div>
                        </div>
                    )}
                </div>

                <Input
                    label="Confirme a nova senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5 text-white" />}
                    endIcon={showConfirmPassword ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
                    onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
                    labelClassName="text-white"
                    required
                />

                {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    ALTERAR SENHA
                </Button>
            </form>
        </div>
    )
}
