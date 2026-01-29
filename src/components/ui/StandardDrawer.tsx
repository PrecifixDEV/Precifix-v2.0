"use client"

import type { ReactNode } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandardDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: ReactNode;

    // Action Props
    onSave?: () => void;
    saveLabel?: string;
    isLoading?: boolean;
    isSaveDisabled?: boolean;

    // Cancel Props
    onCancel?: () => void;
    cancelLabel?: string;

    // Optional Customization
    maxWidth?: string;
}

/**
 * StandardDrawer component for consistent "Industrial" theme bottom drawers.
 * Following the requested pattern: Gray background, Black fields inside, Yellow action buttons.
 */
export function StandardDrawer({
    open,
    onOpenChange,
    title,
    children,
    onSave,
    saveLabel = "Confirmar",
    isLoading = false,
    isSaveDisabled = false,
    onCancel,
    cancelLabel = "Cancelar",
    maxWidth = "max-w-md"
}: StandardDrawerProps) {

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="bg-zinc-950 border-t border-zinc-800 outline-none">
                <div className={cn("mx-auto w-full flex flex-col h-auto max-h-[96vh]", maxWidth)}>
                    {/* Drag handle indicator */}
                    <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-zinc-800 shrink-0" />

                    {/* Header - Sync with StandardSheet */}
                    <DrawerHeader className="h-16 px-6 border-b border-zinc-800 flex justify-center items-center shrink-0 bg-black select-none mt-2">
                        <DrawerTitle className="text-primary text-center font-bold text-xl uppercase tracking-tighter">
                            {title}
                        </DrawerTitle>
                    </DrawerHeader>

                    {/* Content Area - Dark Gray Background */}
                    <div className="overflow-y-auto px-6 py-6 flex-1 bg-zinc-950">
                        {children}
                    </div>

                    {/* Footer - Black Background */}
                    <div className="p-4 bg-black shrink-0 border-t border-zinc-800 flex flex-col gap-3 pb-8">
                        <div className="flex w-full gap-3">
                            {/* Cancel Button - Black with gray stroke */}
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="flex-1 h-10 bg-black border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 font-bold uppercase tracking-wider transition-all"
                            >
                                {cancelLabel}
                            </Button>

                            {/* Save Button - Solid Yellow */}
                            <Button
                                onClick={onSave}
                                disabled={isLoading || isSaveDisabled}
                                className="flex-[1.5] h-10 bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] flex items-center justify-between px-5"
                            >
                                <span className="flex items-center">
                                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin text-zinc-900" />}
                                    {saveLabel}
                                </span>
                                <Check className="h-6 w-6 shrink-0 opacity-80" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
