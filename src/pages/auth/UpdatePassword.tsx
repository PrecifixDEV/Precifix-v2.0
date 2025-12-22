import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { translateAuthError } from '../../utils/authErrors'

export const UpdatePassword = () => {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            // Log out user or redirect to dashboard? 
            // Usually good practice to keep them logged in and go to dashboard.
            navigate('/')

        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar senha.')
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
                <Input
                    label="Nova senha"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5" />}
                    required
                />

                <Input
                    label="Confirme a nova senha"
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5" />}
                    required
                />

                {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <Button type="submit" fullWidth isLoading={loading}>
                    ALTERAR SENHA
                </Button>
            </form>
        </div>
    )
}
