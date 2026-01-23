import type { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

// Mapeamento de cores para estilos específicos
const colorStyles = {
    yellow: {
        accentBorder: 'border-yellow-600/70',
        accentGlow: 'group-hover:shadow-[0_0_15px_-3px_rgba(234,179,8,0.6)]',
        iconColor: 'text-yellow-500',
        textColor: 'text-yellow-100',
    },
    green: {
        accentBorder: 'border-green-600/70',
        accentGlow: 'group-hover:shadow-[0_0_15px_-3px_rgba(22,163,74,0.6)]',
        iconColor: 'text-green-500',
        textColor: 'text-green-100',
    },
    red: {
        accentBorder: 'border-red-600/70',
        accentGlow: 'group-hover:shadow-[0_0_15px_-3px_rgba(220,38,38,0.6)]',
        iconColor: 'text-red-500',
        textColor: 'text-red-100',
    },
};

interface ScrewProps {
    className?: string;
}

// Componente de "Parafuso" para decorar os cantos
const Screw = ({ className }: ScrewProps) => (
    <div
        className={cn(
            "absolute w-2.5 h-2.5 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-700 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.6)] border border-zinc-800",
            className
        )}
    >
        <div className="absolute top-1/2 left-1/2 w-1.5 h-0.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-800 rotate-45"></div>
    </div>
);

interface IndustrialButtonProps {
    color: 'yellow' | 'green' | 'red';
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    className?: string;
}

const IndustrialButton = ({ color, icon: Icon, label, onClick, className }: IndustrialButtonProps) => {
    const styles = colorStyles[color];

    return (
        <button
            onClick={onClick}
            className={cn(
                `relative group overflow-hidden rounded-lg
        /* Base metálica escura com gradiente */
        bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900
        /* Borda externa grossa e escura */
        border-[3px] border-zinc-950
        /* Sombra 3D sólida para dar volume */
        shadow-[0_4px_0_0_#09090b,0_8px_10px_-2px_rgba(0,0,0,0.5)]
        /* Animação de clique físico */
        active:shadow-[0_1px_0_0_#09090b] active:translate-y-[3px]
        transition-all duration-150 ease-in-out
        /* Espaçamento e layout */
        p-4 flex flex-col items-center justify-center gap-2 min-w-[120px]`,
                className
            )}
        >
            {/* Camada de destaque colorido (borda interna e brilho) */}
            <div
                className={cn(
                    "absolute inset-0 rounded-md border-2 opacity-50 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay",
                    styles.accentBorder,
                    styles.accentGlow
                )}
            />

            {/* Parafusos nos cantos */}
            <Screw className="top-1 left-1" />
            <Screw className="top-1 right-1" />
            <Screw className="bottom-1 left-1" />
            <Screw className="bottom-1 right-1" />

            {/* Conteúdo do botão (Ícone e Texto) */}
            <div className="relative z-10 flex flex-col items-center">
                <div
                    className={cn(
                        "p-2 rounded-full bg-zinc-900/50 border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform",
                        styles.iconColor
                    )}
                >
                    <Icon size={24} strokeWidth={2} />
                </div>
                <span className={cn("text-xs font-bold uppercase tracking-wider text-shadow-sm mt-1", styles.textColor)}>
                    {label}
                </span>
            </div>

            {/* Textura sutil de metal escovado */}
            <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN89+7dSQAI0gKC4iQj1wAAAABJRU5ErkJggg==')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        </button>
    );
};

export default IndustrialButton;
