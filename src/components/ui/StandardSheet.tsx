import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";



interface StandardSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
    // Footer / Action Props
    saveButton?: ReactNode; // Pass a custom button completely
    onSave?: () => void; // Or pass a handler to use default button
    saveLabel?: string;
    isLoading?: boolean;
    isSaveDisabled?: boolean;
}

export function StandardSheet({
    open,
    onOpenChange,
    title,
    children,
    saveButton,
    onSave,
    saveLabel = "Salvar",
    isLoading = false,
    isSaveDisabled = false
}: StandardSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* Standardized Content Wrapper */}
            <SheetContent
                className="sm:max-w-[600px] w-full p-0 flex flex-col bg-white dark:bg-zinc-900 shadow-xl z-[100] border-l border-zinc-200 dark:border-zinc-800"
                side="right"
                aria-describedby={undefined}
            >
                {/* Standardized Header */}
                <SheetHeader className="h-16 px-6 shadow-md flex justify-center shrink-0 bg-yellow-500">
                    <SheetTitle className="text-zinc-900 text-center font-bold text-lg">
                        {title}
                    </SheetTitle>
                </SheetHeader>

                {/* Content Area */}
                <div className="overflow-y-auto px-6 py-6 flex-1 bg-white dark:bg-zinc-900">
                    {children}
                </div>

                {/* Standardized Sticky Footer */}
                <div className="p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.1)] bg-white dark:bg-zinc-900 shrink-0 border-t border-zinc-200 dark:border-zinc-800">
                    {saveButton ? (
                        saveButton
                    ) : (
                        <Button
                            onClick={onSave}
                            disabled={isLoading || isSaveDisabled}
                            className="w-full border-none bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all hover:scale-[1.02] flex items-center justify-between"
                        >
                            <span className="flex items-center">
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {saveLabel}
                            </span>
                            <Check className="h-7 w-7 shrink-0" style={{ minWidth: '28px', minHeight: '28px' }} />
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface StandardSheetToggleProps {
    label: string;
    active: boolean;
    onClick: () => void;
    icon?: ReactNode; // New Prop for Icon
}

export function StandardSheetToggle({ label, active, onClick, icon }: StandardSheetToggleProps) {
    return (
        <Button
            type="button"
            variant={active ? "secondary" : "outline"}
            size="sm"
            onClick={onClick}
            className="gap-2 h-9"
        >
            {icon ? icon : null}
            {label}
        </Button>
    );
}
