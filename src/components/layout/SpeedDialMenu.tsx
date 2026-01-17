import { ShoppingCart, Calendar, FileText } from "lucide-react";

interface SpeedDialMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SpeedDialMenu({ isOpen, onClose }: SpeedDialMenuProps) {
    if (!isOpen) return null;

    const actions = [
        {
            label: "Nova Venda",
            icon: ShoppingCart,
            href: "/sales/new",
            color: "bg-green-500",
        },
        {
            label: "Novo Orçamento",
            icon: FileText,
            href: "/quotes/new",
            color: "bg-blue-500",
        },
        {
            label: "Novo Agendamento",
            icon: Calendar,
            href: "/schedule/new",
            color: "bg-purple-500",
        },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Floating Cards */}
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-300">
                {actions.map((action, index) => (
                    <a
                        key={action.label}
                        href={action.href}
                        className={`
                            flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl
                            ${action.color} text-white
                            transform transition-all duration-200
                            hover:scale-105 active:scale-95
                            animate-in slide-in-from-bottom-2
                        `}
                        style={{
                            animationDelay: `${index * 50}ms`,
                        }}
                        onClick={onClose}
                    >
                        <action.icon className="w-6 h-6" />
                        <span className="font-semibold text-lg whitespace-nowrap">
                            {action.label}
                        </span>
                    </a>
                ))}
            </div>
        </>
    );
}
