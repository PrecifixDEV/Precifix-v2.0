import { useState, useRef, useEffect } from "react";
import {
    Home,
    Menu,
    ShoppingCart,
    User,
    type LucideIcon
} from "lucide-react";

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "menu", label: "Menu", icon: Menu },
    { id: "sales", label: "Vendas", icon: ShoppingCart },
    { id: "profile", label: "Perfil", icon: User },
];

export const VisualNavbar = () => {
    const [activeTab, setActiveTab] = useState("home");
    const [underlineStyle, setUnderlineStyle] = useState({});
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const activeElement = navRef.current?.querySelector(`[data-id="${activeTab}"]`) as HTMLElement;
        if (activeElement) {
            setUnderlineStyle({
                width: activeElement.offsetWidth,
                transform: `translateX(${activeElement.offsetLeft}px)`,
            });
        }
    }, [activeTab]);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-fit px-2 py-1.5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div ref={navRef} className="relative flex items-center gap-1">
                {/* Animated Indicator Pill */}
                <div
                    className="absolute h-full bg-yellow-500 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={underlineStyle}
                />

                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            data-id={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`relative z-10 flex items-center gap-2 px-5 py-3 rounded-xl transition-colors duration-300
                                ${isActive ? 'text-black font-black' : 'text-zinc-500 hover:text-white'}
                            `}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
                            <span className={`text-sm tracking-tight overflow-hidden transition-all duration-300 ${isActive ? 'max-w-[80px] opacity-100 ml-1' : 'max-w-0 opacity-0'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Visual support stripes (extremely subtle) */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-yellow-500/20 rounded-full blur-sm" />
        </div>
    );
};
