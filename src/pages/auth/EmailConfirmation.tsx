import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const EmailConfirmation = () => {
    const navigate = useNavigate()

    return (
        <div className="text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-yellow-500/10 p-4 rounded-full ring-1 ring-yellow-500/20">
                    <Mail className="w-10 h-10 text-yellow-500" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Verifique seu e-mail</h2>

            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Enviamos um link de confirmação para o seu endereço de e-mail.
                <br />
                Por favor, clique no link para ativar sua conta e começar a usar o Precifix.
            </p>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 mb-8 max-w-sm mx-auto">
                <p className="text-xs text-slate-500">
                    Não recebeu? Verifique sua pasta de Spam ou Lixo Eletrônico.
                </p>
            </div>

            <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/login')}
                className="group"
            >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar para o Login
            </Button>
        </div>
    )
}
