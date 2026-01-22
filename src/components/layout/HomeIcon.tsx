interface HomeIconProps {
    size?: number;
    active?: boolean;
    className?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: string | number;
}

export function HomeIcon({
    size = 24,
    active = false,
    className = "",
    fill,
    stroke,
    strokeWidth
}: HomeIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {active ? (
                // Ícone ATIVO (Estilo Spotify - Fill Amarelo, Stroke Preto)
                <path
                    d="M12.5 3.24L20.66 10.74V20.5H15.16V14.5H9.83997V20.5H4.33997V10.74L12.5 3.24ZM11.602 2.263L2.33997 10.778V21.5H10.84V15.5H14.16V21.5H22.66V10.778L13.398 2.263C12.895 1.801 12.105 1.801 11.602 2.263Z"
                    fill={fill || "#EAB308"}
                    stroke={stroke || "#000000"}
                    strokeWidth={strokeWidth || "0.5"}
                />
            ) : (
                // Ícone INATIVO (Estilo Spotify - Apenas Contorno)
                <path
                    d="M11.602 2.263L2.33997 10.778V21.5H10.84V15.5H14.16V21.5H22.66V10.778L13.398 2.263C12.895 1.801 12.105 1.801 11.602 2.263ZM13.4 21.5V14.5H10.6V21.5H4.33997V11L12.5 4.5L20.66 11V21.5H14.16L13.4 21.5Z"
                    fill={fill || "currentColor"}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    className="opacity-70"
                />
            )}
        </svg>
    );
}
