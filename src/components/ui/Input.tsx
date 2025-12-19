import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    icon,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            block w-full rounded-lg border bg-slate-800/50 
            text-white placeholder-slate-500
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500
            disabled:bg-slate-900 disabled:text-slate-500
            ${icon ? 'pl-10' : 'pl-3'}
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-slate-700 hover:border-slate-600'}
            py-2.5 sm:text-sm
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'
