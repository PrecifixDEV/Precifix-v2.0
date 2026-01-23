import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Trash2 } from "lucide-react";
import { ConfirmDrawer } from "@/components/ui/confirm-drawer";
import { useState } from "react";



interface StandardSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;
    // Optional fields toggles (buttons) to appear at the bottom
    optionalFieldsToggles?: ReactNode;
    // Footer / Action Props
    saveButton?: ReactNode; // Pass a custom button completely
    onSave?: () => void; // Or pass a handler to use default button
    saveLabel?: string;

    isLoading?: boolean;
    isSaveDisabled?: boolean;

    // Delete Props (Standardized)
    onDelete?: () => void;
    deleteLabel?: string;
    deleteConfirmTitle?: string;
    deleteConfirmDescription?: string;
}

export function StandardSheet({
    open,
    onOpenChange,
    title,
    children,
    optionalFieldsToggles,
    saveButton,
    onSave,
    saveLabel = "Salvar",
    isLoading = false,
    isSaveDisabled = false,
    onDelete,
    deleteLabel = "Excluir",
    deleteConfirmTitle = "Excluir Item",
    deleteConfirmDescription = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
}: StandardSheetProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (onDelete) {
            onDelete();
            setShowDeleteConfirm(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* Standardized Content Wrapper */}
            <SheetContent
                className="sm:max-w-[600px] w-full p-0 gap-0 flex flex-col bg-white dark:bg-zinc-900 shadow-xl z-[100] border-l border-zinc-200 dark:border-zinc-800"
                side="right"
                aria-describedby={undefined}
            >
                {/* Standardized Header */}
                <SheetHeader className="h-16 px-6 border-b border-zinc-800 flex justify-center shrink-0 bg-black">
                    <SheetTitle className="text-primary text-center font-bold text-xl uppercase tracking-tighter">
                        {title}
                    </SheetTitle>
                </SheetHeader>

                {/* Content Area */}
                <div className="overflow-y-auto px-6 py-6 flex-1 bg-white dark:bg-zinc-900">
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            {children}
                        </div>

                        {optionalFieldsToggles && (
                            <div className="mt-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800/50" />
                                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap">
                                        Informações Adicionais
                                    </span>
                                    <div className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-800/50" />
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {optionalFieldsToggles}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Standardized Sticky Footer */}
                <div className="p-4 bg-black shrink-0 border-t border-zinc-800">
                    {saveButton ? (
                        saveButton
                    ) : (
                        <div className="flex w-full gap-2">
                            <Button
                                variant="secondary-yellow"
                                onClick={onSave}
                                disabled={isLoading || isSaveDisabled}
                                className="flex-1 h-10 font-bold uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] flex items-center justify-between"
                            >
                                <span className="flex items-center">
                                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    {saveLabel}
                                </span>
                                <Check className="h-6 w-6 shrink-0" />
                            </Button>

                            {onDelete && (
                                <>
                                    <Button
                                        onClick={handleDeleteClick}
                                        disabled={isLoading}
                                        variant="outline-destructive"
                                        size="icon"
                                        className="rounded-lg w-10 h-10 shrink-0 shadow-md transition-all hover:scale-110"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>

                                    <ConfirmDrawer
                                        open={showDeleteConfirm}
                                        onOpenChange={setShowDeleteConfirm}
                                        title={deleteConfirmTitle}
                                        description={deleteConfirmDescription}
                                        onConfirm={handleConfirmDelete}
                                        confirmLabel={deleteLabel}
                                        variant="destructive"
                                        isLoading={isLoading}
                                    />
                                </>
                            )}
                        </div>
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
