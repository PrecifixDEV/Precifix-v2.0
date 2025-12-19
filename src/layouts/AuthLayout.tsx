import React from 'react'
import { Outlet } from 'react-router-dom'
import logo from '../assets/precifix-logo.png'
import background from '../assets/login-background.jpg'

export const AuthLayout: React.FC = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative bg-slate-900">
            {/* Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={background}
                    alt="Oficina"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
            </div>

            {/* Content Card with Glassmorphism */}
            <div className="relative z-10 w-full max-w-md p-6">
                <div className="bg-slate-950/40 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
                    <div className="flex flex-col items-center mb-8">
                        <img src={logo} alt="Precifix" className="h-12 lg:h-14 mb-4" />
                    </div>
                    <Outlet />
                </div>

                <p className="mt-8 text-center text-slate-500 text-xs">
                    © {new Date().getFullYear()} Precifix. Todos os direitos reservados.
                </p>
            </div>
        </div>
    )
}
