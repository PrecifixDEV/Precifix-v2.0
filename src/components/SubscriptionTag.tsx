import { useEffect, useState } from 'react'

interface SubscriptionTagProps {
    status: string | null
    trialEndsAt: string | null
}

export const SubscriptionTag = ({ status, trialEndsAt }: SubscriptionTagProps) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (status !== 'trial' || !trialEndsAt) return

        const calculateTimeLeft = () => {
            const now = new Date()
            const end = new Date(trialEndsAt)
            const diff = end.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeLeft('Expirado')
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

            // Format: "2 dias 5 horas" or just "5 horas" if 0 days
            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h`)
            } else {
                setTimeLeft(`${hours}h`)
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 60000) // Update every minute

        return () => clearInterval(timer)
    }, [status, trialEndsAt])

    if (status === 'trial') {
        return (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-sm">
                <span>TRIAL</span>
                <span className="opacity-75">|</span>
                <span>{timeLeft}</span>
            </div>
        )
    }

    if (status === 'active' || status === 'pro') {
        return (
            <div className="px-3 py-1 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 text-xs font-bold rounded-full shadow-sm">
                PRO
            </div>
        )
    }

    return null
}
