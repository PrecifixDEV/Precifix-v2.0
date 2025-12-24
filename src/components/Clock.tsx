import { useState, useEffect } from 'react'

export const Clock = () => {
    const [date, setDate] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="text-sm font-mono text-slate-500 dark:text-slate-400 hidden lg:block">
            {date.toLocaleString('pt-BR')}
        </div>
    )
}
