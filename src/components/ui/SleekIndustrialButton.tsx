import type { LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

// Mapeamento de estilos refinados.
// Usamos cores para criar 'luz' nas bordas e ícones.
const colorStyles = {
    yellow: {
        rimLight: 'shadow-[inset_0_0_0_1px_rgba(234,179,8,0.3),0_0_10px_-2px_rgba(234,179,8,0.3)] group-hover:shadow-[inset_0_0_0_1px_rgba(234,179,8,0.8),0_0_15px_-2px_rgba(234,179,8,0.5)]',
        depthShadow: 'shadow-[0_4px_0_0_#422006]',
        iconColor: 'text-yellow-500 group-hover:text-yellow-400',
        iconGlow: 'group-hover:drop-shadow-[0_0_6px_rgba(234,179,8,0.7)]',
    },
    green: {
        rimLight: 'shadow-[inset_0_0_0_1px_rgba(22,163,74,0.3),0_0_10px_-2px_rgba(22,163,74,0.3)] group-hover:shadow-[inset_0_0_0_1px_rgba(22,163,74,0.8),0_0_15px_-2px_rgba(22,163,74,0.5)]',
        depthShadow: 'shadow-[0_4px_0_0_#052e16]',
        iconColor: 'text-green-500 group-hover:text-green-400',
        iconGlow: 'group-hover:drop-shadow-[0_0_6px_rgba(22,163,74,0.7)]',
    },
    red: {
        rimLight: 'shadow-[inset_0_0_0_1px_rgba(220,38,38,0.3),0_0_10px_-2px_rgba(220,38,38,0.3)] group-hover:shadow-[inset_0_0_0_1px_rgba(220,38,38,0.8),0_0_15px_-2px_rgba(220,38,38,0.5)]',
        depthShadow: 'shadow-[0_4px_0_0_#450a0a]',
        iconColor: 'text-red-500 group-hover:text-red-400',
        iconGlow: 'group-hover:drop-shadow-[0_0_6px_rgba(220,38,38,0.7)]',
    },
};

interface MicroRivetProps {
    className?: string;
}

// Micro-rebite super sutil apenas para textura nos cantos
const MicroRivet = ({ className }: MicroRivetProps) => (
    <div className={cn("absolute w-1 h-1 rounded-full bg-zinc-700 shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)] opacity-60", className)}></div>
);

interface SleekIndustrialButtonProps {
    color: 'yellow' | 'green' | 'red';
    icon: LucideIcon;
    label: string;
    onClick?: () => void;
    className?: string;
}

const SleekIndustrialButton = ({ color, icon: Icon, label, onClick, className }: SleekIndustrialButtonProps) => {
    const styles = colorStyles[color];

    return (
        <button
            onClick={onClick}
            className={cn(
                `relative group rounded-xl overflow-hidden
        /* Borda externa grossa e escura */
        border-[3px] border-zinc-950
        /* Estrutura de borda para profundidade (Bevel) */
        border border-zinc-800/80
        /* Sombra superior clara (luz) e sombra interna escura (profundidade) */
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),inset_0_0_20px_rgba(0,0,0,0.8)]
        
        /* Interação de clique: afunda fisicamente (Industrial Pattern) */
        active:translate-y-1 active:shadow-none
        transition-all duration-150 ease-out
        
        /* Layout unificado com botões padrão */
        px-4 py-2.5 flex flex-row items-center justify-center gap-3 min-w-[140px] h-12`,
                styles.depthShadow,
                className
            )}
            // Usamos estilo inline para o fundo sólido customizado
            style={{ backgroundColor: '#121214' }}
        >
            {/* Camada de Luz Colorida na Borda */}
            <div className={cn("absolute inset-0 rounded-[9px] transition-all duration-300", styles.rimLight)} />

            {/* Micro-rebites sutis nos cantos */}
            <MicroRivet className="top-2 left-2" />
            <MicroRivet className="top-2 right-2" />
            <MicroRivet className="bottom-2 left-2" />
            <MicroRivet className="bottom-2 right-2" />

            {/* Ícone e Texto - Layout Horizontal Unificado */}
            <div className="relative z-10 flex items-center gap-2.5">
                <div className={cn("transition-all duration-300 transform group-hover:-translate-y-0.5", styles.iconColor, styles.iconGlow)}>
                    <Icon size={20} strokeWidth={2} />
                </div>

                <span className="text-sm font-black uppercase tracking-tighter text-white transition-colors">
                    {label}
                </span>
            </div>

            {/* Textura metálica quase invisível para quebrar o liso */}
            <div className="absolute inset-0 bg-zinc-500 opacity-[0.03] bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVQYV2N89+7df0YGBgYGRkZGiML///8BACEsBvs4yS3WAAAAAElFTkSuQmCC')] pointer-events-none mix-blend-overlay"></div>
        </button>
    );
};

export default SleekIndustrialButton;
