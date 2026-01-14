import { useMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
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
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
}: TablePaginationProps) {
    const isMobile = useMobile();

    // Hide pagination if total items <= itemsPerPage
    if (totalItems <= itemsPerPage) {
        return null;
    }

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const handleFirst = () => onPageChange(1);
    const handlePrevious = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const handleLast = () => onPageChange(totalPages);

    // Mobile version: Only arrows
    if (isMobile) {
        return (
            <div className="flex items-center justify-between gap-2 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                    {startItem} - {endItem} de {totalItems}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // Desktop version: Full controls
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
                {startItem} - {endItem} de {totalItems}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFirst}
                    disabled={currentPage === 1}
                    className="hidden sm:flex"
                >
                    <ChevronsLeft className="h-4 w-4 mr-1" />
                    Primeira
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                </Button>

                <Select
                    value={currentPage.toString()}
                    onValueChange={(value) => onPageChange(parseInt(value, 10))}
                >
                    <SelectTrigger className="w-[70px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <SelectItem key={page} value={page.toString()}>
                                {page}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLast}
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex"
                >
                    Última
                    <ChevronsRight className="h-4 w-4 ml-1" />
                </Button>
            </div>
        </div>
    );
}
