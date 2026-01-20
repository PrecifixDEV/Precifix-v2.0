import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "./drawer";
import { Button } from "./button";

interface ConfirmDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive";
    isLoading?: boolean;
}

export function ConfirmDrawer({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "default",
    isLoading = false
}: ConfirmDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} dismissible={!isLoading}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                    <Button
                        onClick={onConfirm}
                        variant={variant}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? "Processando..." : confirmLabel}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" className="w-full">
                            {cancelLabel}
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
