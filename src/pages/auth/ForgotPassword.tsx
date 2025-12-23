import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { translateAuthError } from '../../utils/authErrors'

export const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:5173/update-password',
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: any) {
            setError(translateAuthError(err.message || 'Erro ao enviar e-mail de recuperação.'))
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-500/10 p-4 rounded-full ring-1 ring-green-500/20">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4">E-mail enviado!</h2>

                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
                </p>

                <Button
                    variant="default"
                    fullWidth
                    onClick={() => setSuccess(false)}
                    className="mb-4 bg-slate-800 hover:bg-slate-700 text-white border-slate-700 from-neutral-500"
                >
                    Tentar outro e-mail
                </Button>

                <Link to="/login" className="text-sm text-slate-500 hover:text-white transition-colors">
                    Voltar para o Login
                </Link>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <Link to="/login" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Link>
                <h2 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h2>
                <p className="text-slate-400 text-sm">
                    Informe seu e-mail para receber as instruções de recuperação.
                </p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
                <Input
                    label="E-mail cadastrado"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5 text-white" />}
                    className="text-white"
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
                    fullWidth
                    isLoading={loading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold"
                >
                    ENVIAR INSTRUÇÕES
                </Button>
            </form>
        </div>
    )
}
