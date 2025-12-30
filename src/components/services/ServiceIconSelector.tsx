import React, { useState } from "react";
import {
    CarFront,
    Droplet,
    Shield,
    Zap,
    Armchair,
    SprayCan,
    Disc,
    Wrench,
    PaintBucket,
    Search,
    Brush,
    Hammer,
    Gauge,
    Sparkles,
    Wind,
    Eraser,
    Sun,
    Sofa,
    Palette,
    Paintbrush,
    Bike,
    LoaderPinwheel,
    Leaf,
    Gem,
    Droplets,
    Crown,
    CloudRain,
    Bug,
    Volume2,
    Van,
    Umbrella,
    Truck,
    Star
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mapping of icon names to components
export const SERVICE_ICONS: Record<string, LucideIcon> = {
    CarFront,
    Droplet,
    Shield,
    Zap,
    Armchair,
    SprayCan,
    Disc,
    Wrench,
    PaintBucket,
    Search,
    Brush,
    Hammer,
    Gauge,
    Sparkles,
    Eraser,
    Sun,
    Sofa,
    Palette,
    Paintbrush,
    Bike,
    LoaderPinwheel,
    Leaf,
    Gem,
    Droplets,
    Crown,
    CloudRain,
    Bug,
    Volume2,
    Van,
    Umbrella,
    Truck,
    Star,
    Wind
};

export const suggestIcon = (name: string): string => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes("lavagem") || lowerName.includes("lavar") || lowerName.includes("água")) return "Droplets"; // Changed to Droplets
    if (lowerName.includes("polimento") || lowerName.includes("brilho") || lowerName.includes("espelhamento")) return "Sparkles";
    if (lowerName.includes("vitrificação") || lowerName.includes("proteção") || lowerName.includes("blindagem") || lowerName.includes("cera")) return "Shield";
    if (lowerName.includes("higienização") || lowerName.includes("interno") || lowerName.includes("banco") || lowerName.includes("couro")) return "Armchair";
    if (lowerName.includes("sofá") || lowerName.includes("estofado")) return "Sofa";
    if (lowerName.includes("pintura") || lowerName.includes("retoque")) return "SprayCan";
    if (lowerName.includes("cor") || lowerName.includes("micro")) return "Palette";
    if (lowerName.includes("roda") || lowerName.includes("pneu")) return "Disc";
    if (lowerName.includes("motor")) return "Zap";
    if (lowerName.includes("detalhamento") || lowerName.includes("inspeção")) return "Search";
    if (lowerName.includes("martelinho") || lowerName.includes("amassado")) return "Hammer";
    if (lowerName.includes("revitalização") || lowerName.includes("restauração")) return "Brush";
    if (lowerName.includes("aspirar") || lowerName.includes("aspiracao")) return "Wind";
    if (lowerName.includes("moto") || lowerName.includes("triciclo")) return "Bike";
    if (lowerName.includes("truque") || lowerName.includes("caminhão")) return "Truck";
    if (lowerName.includes("van") || lowerName.includes("furgão")) return "Van";
    if (lowerName.includes("chuva") || lowerName.includes("ácida")) return "CloudRain";
    if (lowerName.includes("eco") || lowerName.includes("natural")) return "Leaf";
    if (lowerName.includes("som") || lowerName.includes("audio")) return "Volume2";

    return "CarFront"; // Default
};

interface ServiceIconSelectorProps {
    value: string | null;
    onChange: (iconName: string) => void;
}

export const ServiceIconSelector: React.FC<ServiceIconSelectorProps> = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const SelectedIcon = value && SERVICE_ICONS[value] ? SERVICE_ICONS[value] : CarFront;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-12 h-12 p-0 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
                    type="button"
                >
                    <SelectedIcon className="w-6 h-6 text-primary" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="start">
                <div className="grid grid-cols-5 gap-2">
                    {Object.entries(SERVICE_ICONS).map(([name, Icon]) => (
                        <Button
                            key={name}
                            type="button"
                            variant="ghost"
                            className={cn(
                                "h-12 w-12 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors",
                                value === name && "bg-primary/20 text-primary ring-2 ring-primary/30"
                            )}
                            onClick={() => {
                                onChange(name);
                                setOpen(false);
                            }}
                        >
                            <Icon className="w-6 h-6" />
                        </Button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};
