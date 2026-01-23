import { useMobile } from "@/hooks/useMobile";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (count: number) => void;
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: TablePaginationProps) {
    const isMobile = useMobile();

    // Always calculate range even if totalItems is 0
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handleFirst = () => onPageChange(1);
    const handlePrevious = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const handleLast = () => onPageChange(totalPages || 1);

    const NavIcon = ({
        icon: Icon,
        onClick,
        disabled,
        className = ""
    }: {
        icon: any,
        onClick: () => void,
        disabled: boolean,
        className?: string
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`transition-all duration-200 p-2 rounded-md active:scale-90 ${disabled
                ? "text-zinc-500 cursor-not-allowed"
                : "text-white hover:text-white/80 hover:bg-white/5"
                } ${className}`}
        >
            <Icon className="h-5 w-5" strokeWidth={2.5} />
        </button>
    );

    const Separator = () => (
        <span className="text-zinc-800 mx-1 select-none">|</span>
    );

    if (isMobile) {
        return (
            <div className="flex flex-col items-center gap-4 pt-2 pb-2 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl mb-1 mx-4">
                <div className="flex items-center gap-1">
                    <NavIcon icon={ChevronsLeft} onClick={handleFirst} disabled={currentPage === 1 || totalItems === 0} />
                    <Separator />
                    <NavIcon icon={ChevronLeft} onClick={handlePrevious} disabled={currentPage === 1 || totalItems === 0} />

                    <div className="mx-2">
                        <Select
                            value={currentPage.toString()}
                            onValueChange={(value) => onPageChange(parseInt(value, 10))}
                        >
                            <SelectTrigger className="w-[80px] h-9 font-bold bg-zinc-800 border-zinc-700 text-white rounded-lg shadow-inner">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="min-w-[80px]">
                                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                                    <SelectItem key={page} value={page.toString()} className="font-medium" hideIndicator>
                                        {page}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <NavIcon icon={ChevronRight} onClick={handleNext} disabled={currentPage === totalPages || totalItems === 0} />
                    <Separator />
                    <NavIcon icon={ChevronsRight} onClick={handleLast} disabled={currentPage === totalPages || totalItems === 0} />
                </div>
            </div>
        );
    }

    // Desktop version
    return (
        <div className="flex items-center justify-between gap-4 py-3 px-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Mostrando <span className="font-bold text-zinc-100">{startItem}-{endItem}</span> de {totalItems}
                </div>

                {onItemsPerPageChange && (
                    <div className="flex items-center gap-3 border-l border-zinc-800 pl-4 ml-2">
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Por página:</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => onItemsPerPageChange(parseInt(value, 10))}
                        >
                            <SelectTrigger className="w-[80px] h-8 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="min-w-[80px]">
                                {[10, 25, 50, 100].map((size) => (
                                    <SelectItem key={size} value={size.toString()} hideIndicator>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1">
                <div className="flex items-center">
                    <NavIcon icon={ChevronsLeft} onClick={handleFirst} disabled={currentPage === 1 || totalItems === 0} />
                    <Separator />
                    <NavIcon icon={ChevronLeft} onClick={handlePrevious} disabled={currentPage === 1 || totalItems === 0} />
                </div>

                <div className="mx-4">
                    <Select
                        value={currentPage.toString()}
                        onValueChange={(value) => onPageChange(parseInt(value, 10))}
                    >
                        <SelectTrigger className="w-[80px] h-9 font-bold border-zinc-800 bg-zinc-950 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="min-w-[80px]">
                            {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                                <SelectItem key={page} value={page.toString()} className="font-bold" hideIndicator>
                                    {page}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center">
                    <NavIcon icon={ChevronRight} onClick={handleNext} disabled={currentPage === totalPages || totalItems === 0} />
                    <Separator />
                    <NavIcon icon={ChevronsRight} onClick={handleLast} disabled={currentPage === totalPages || totalItems === 0} />
                </div>
            </div>
        </div>
    );
}
