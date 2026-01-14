import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActiveFilter {
    label: string;
    value?: string;
}

interface ActiveFiltersProps {
    filters: ActiveFilter[];
    onClearAll: () => void;
}

export function ActiveFilters({ filters, onClearAll }: ActiveFiltersProps) {
    if (!filters || filters.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm text-muted-foreground">Filtros:</span>
            {filters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                    {filter.label}
                    {filter.value && `: ${filter.value}`}
                </Badge>
            ))}
            <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-7 text-xs text-muted-foreground hover:text-foreground ml-auto"
            >
                <X className="h-3 w-3 mr-1" />
                <span className="hidden md:inline">Limpar Filtros</span>
            </Button>
        </div>
    );
}
