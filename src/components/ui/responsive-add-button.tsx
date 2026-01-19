import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResponsiveAddButtonProps {
    onClick: () => void;
    label: string;
    className?: string;
}

export function ResponsiveAddButton({ onClick, label, className }: ResponsiveAddButtonProps) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                // Mobile Styles (Default)
                "bg-yellow-500 hover:bg-yellow-600 text-zinc-900 shadow-md transition-all", // Using text-zinc-900 for better theme consistency than pure black
                "h-12 w-12 rounded-full p-0 flex items-center justify-center", // Ensure centering
                // Desktop Styles (md)
                "md:h-10 md:w-auto md:rounded-md md:px-4 md:py-2",
                className
            )}
        >
            <Plus className="h-6 w-6 md:mr-2 md:h-4 md:w-4" />
            <span className="hidden md:inline font-medium">{label}</span>
        </Button>
    );
}
