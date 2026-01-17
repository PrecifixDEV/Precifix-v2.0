import { Home, LayoutGrid, ClipboardList, User, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { SpeedDialMenu } from "./SpeedDialMenu";

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <SpeedDialMenu
                isOpen={isSpeedDialOpen}
                onClose={() => setIsSpeedDialOpen(false)}
            />

            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div className="relative w-full h-[80px] flex items-end justify-center">
                    {/* Background SVG com a Curva */}
                    <svg
                        viewBox="0 0 375 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                        className="absolute bottom-0 left-0 w-full h-[80px] drop-shadow-lg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0 20C0 10 10 0 20 0H132C137 0 142 5 145 9C151 18 160 25 173 25H202C215 25 224 18 230 9C233 5 238 0 243 0H355C366 0 375 9 375 20V80H0V20Z"
                            className="fill-slate-950"
                        />
                    </svg>

                    {/* Botão Central Flutuante (Speed Dial) */}
                    <div className="absolute -top-[15px] left-1/2 -translate-x-1/2">
                        <button
                            onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)}
                            className={`
                                flex h-16 w-16 items-center justify-center rounded-full 
                                bg-yellow-500 text-slate-950 shadow-xl ring-4 ring-slate-950 
                                transition-transform active:scale-95
                                ${isSpeedDialOpen ? "rotate-45" : ""}
                            `}
                        >
                            <Plus className="h-8 w-8" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Ícones do Menu */}
                    <div className="relative z-10 grid w-full grid-cols-5 items-end pb-4 px-2">
                        {/* Início */}
                        <button
                            onClick={() => navigate("/")}
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/")
                                    ? "text-yellow-500"
                                    : "text-slate-400 hover:text-yellow-500"
                                }`}
                        >
                            <Home className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Início</span>
                        </button>

                        {/* Menu */}
                        <button
                            onClick={() => navigate("/menu")}
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/menu")
                                    ? "text-yellow-500"
                                    : "text-slate-400 hover:text-yellow-500"
                                }`}
                        >
                            <LayoutGrid className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Menu</span>
                        </button>

                        {/* Espaçador Central */}
                        <div className="pointer-events-none" />

                        {/* Vendas */}
                        <button
                            onClick={() => navigate("/sales")}
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/sales")
                                    ? "text-yellow-500"
                                    : "text-slate-400 hover:text-yellow-500"
                                }`}
                        >
                            <ClipboardList className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Vendas</span>
                        </button>

                        {/* Perfil */}
                        <button
                            onClick={() => navigate("/profile")}
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/profile")
                                    ? "text-yellow-500"
                                    : "text-slate-400 hover:text-yellow-500"
                                }`}
                        >
                            <User className="h-6 w-6" />
                            <span className="text-[10px] font-medium">Perfil</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
