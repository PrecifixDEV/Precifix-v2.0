import { Home, LayoutGrid, ClipboardList, User, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SpeedDialMenu } from "./SpeedDialMenu";
import { motion } from "framer-motion";

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

    // Fechar menu ao navegar
    useEffect(() => {
        setIsSpeedDialOpen(false);
    }, [location.pathname]);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: "/", label: "Início", icon: Home },
        { path: "/menu", label: "Menu", icon: LayoutGrid },
        { path: null, label: "", icon: null }, // Spacer
        { path: "/sales", label: "Vendas", icon: ClipboardList },
        { path: "/profile-menu", label: "Perfil", icon: User },
    ];

    return (
        <>
            <SpeedDialMenu
                isOpen={isSpeedDialOpen}
                onClose={() => setIsSpeedDialOpen(false)}
            />

            <div className="w-full relative z-50">
                <div
                    className="relative w-full h-[80px] flex items-end justify-center"
                    onClick={() => isSpeedDialOpen && setIsSpeedDialOpen(false)}
                >
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
                            className="fill-black"
                        />
                    </svg>

                    {/* Botão Central Flutuante (Speed Dial) */}
                    <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 z-50">
                        <motion.button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSpeedDialOpen(!isSpeedDialOpen);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                                rotate: isSpeedDialOpen ? 45 : 0,
                                backgroundColor: isSpeedDialOpen ? "#71717a" : "#EAB308", // zinc-500 approx : yellow-500
                                color: isSpeedDialOpen ? "#ffffff" : "#000000"
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`
                                flex h-16 w-16 items-center justify-center rounded-full 
                                shadow-xl ring-4 ring-black 
                            `}
                        >
                            <Plus className="h-8 w-8" strokeWidth={2.5} />
                        </motion.button>
                    </div>

                    {/* Ícones do Menu */}
                    <div className="relative z-10 grid w-full grid-cols-5 items-end pb-4 px-2">
                        {navItems.map((item, index) => {
                            if (!item.path) return <div key={index} className="pointer-events-none" />;

                            const Icon = item.icon!;
                            const active = isActive(item.path);

                            return (
                                <motion.button
                                    key={item.path}
                                    onClick={() => navigate(item.path!)}
                                    whileTap={{ scale: 0.9 }}
                                    className={`relative flex flex-col items-center gap-1 transition-colors ${active ? "text-yellow-500" : "text-zinc-400 hover:text-yellow-500"
                                        }`}
                                >
                                    <motion.div
                                        animate={{ scale: active ? 1.2 : 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Icon
                                            className={`h-6 w-6 transition-all duration-300 ${active ? "opacity-100" : "opacity-70"}`}
                                            fill={active ? "#EAB308" : "transparent"}
                                            stroke={active ? "#000000" : "currentColor"}
                                            strokeWidth={active ? 1.2 : 1.2}
                                        />
                                    </motion.div>
                                    <span className={`text-[10px] font-bold transition-colors ${active ? "text-yellow-500" : "text-zinc-400"}`}>
                                        {item.label}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
