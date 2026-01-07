import { cn } from "@/lib/utils";

interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradientColor?: string;
}

export function MagicCard({
    children,
    className,
    gradientColor = "from_45deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%", // Roxo padrão
    ...props
}: MagicCardProps) {
    return (
        // Container externo (borda)
        <div className={cn("relative overflow-hidden rounded-xl p-[1px] group", className)} {...props}>

            {/* O Gradiente que gira (Animation Layer) */}
            <span
                className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
                style={{
                    background: `conic-gradient(${gradientColor})`
                }}
            />

            {/* O Conteúdo (Mask Layer) - Fundo escuro para cobrir o centro */}
            <div className="relative h-full w-full rounded-xl bg-white dark:bg-slate-950 px-6 py-4 text-slate-950 dark:text-slate-100 backdrop-blur-3xl">
                {children}
            </div>
        </div>
    );
}
