import { Home, LayoutGrid, ClipboardList, User, Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SpeedDialMenu } from "./SpeedDialMenu";
import { motion } from "framer-motion";

export function BottomNav2() {
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
        {
            path: null,
            label: "Criar",
            icon: Plus,
            onClick: () => setIsSpeedDialOpen(!isSpeedDialOpen)
        },
        { path: "/sales", label: "Vendas", icon: ClipboardList },
        { path: "/profile-menu", label: "Perfil", icon: User },
    ];

    return (
        <>
            <SpeedDialMenu
                isOpen={isSpeedDialOpen}
                onClose={() => setIsSpeedDialOpen(false)}
            />

            <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-white/10 h-16 shadow-2xl">
                <div className="mx-auto max-w-md h-full grid grid-cols-5">
                    {navItems.map((item, index) => {
                        const Icon = item.icon!;
                        const active = item.path ? isActive(item.path) : isSpeedDialOpen;
                        const isPlus = item.label === "Criar";

                        return (
                            <motion.button
                                key={index}
                                onClick={() => item.onClick ? item.onClick() : navigate(item.path!)}
                                whileTap={isPlus ? {} : { scale: 0.95 }}
                                className={`flex flex-col items-center justify-center transition-all duration-300 ${active ? "text-yellow-500" : "text-white opacity-70 hover:opacity-100"
                                    }`}
                            >
                                <motion.div
                                    animate={isPlus ? {
                                        rotate: isSpeedDialOpen ? 45 : 0,
                                        backgroundColor: isSpeedDialOpen ? "#52525b" : "rgba(0,0,0,0)",
                                        color: isSpeedDialOpen ? "#EAB308" : "inherit",
                                        y: isSpeedDialOpen ? -20 : 0
                                    } : {}}
                                    className={isPlus ? "w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-300" : ""}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Icon
                                        className={isPlus ? "h-7 w-7" : "h-6 w-6"}
                                        strokeWidth={isPlus ? 3.5 : (active ? 2.5 : 2)}
                                    />
                                </motion.div>
                                {!isPlus && (
                                    <span className={`text-[10px] font-bold ${active ? "text-yellow-500" : "text-white"}`}>
                                        {item.label}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
