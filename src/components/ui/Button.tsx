import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    isLoading?: boolean
    fullWidth?: boolean
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 focus:ring-yellow-500',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
        outline: 'border border-slate-600 hover:bg-slate-800 text-slate-200 focus:ring-slate-500',
        ghost: 'hover:bg-slate-800 text-slate-400 hover:text-white focus:ring-slate-500'
    }

    const sizes = 'px-4 py-2.5 text-sm'
    const width = fullWidth ? 'w-full' : ''

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes} ${width} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </button>
    )
}
