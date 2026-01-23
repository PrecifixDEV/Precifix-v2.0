import { Button } from "@/components/ui/button";
import { Trash2, ArrowRightLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import IndustrialButton from "@/components/ui/IndustrialButton";
import SleekIndustrialButton from "@/components/ui/SleekIndustrialButton";

export function VisualTest() {
    return (
        <div className="p-8 space-y-8 bg-background min-h-screen text-foreground">
            <section className="space-y-4">
                <h2 className="text-xl font-bold">Button Variants Test</h2>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Default (Primary)</p>
                        <Button>Botão Primário</Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Secondary Yellow (New)</p>
                        <Button variant="secondary-yellow">Botão Secundário</Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Secondary (Gray)</p>
                        <Button variant="secondary">Cinza Padrão</Button>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Sizes Test</h2>
                <div className="flex flex-wrap gap-4 items-end">
                    <Button variant="secondary-yellow" size="sm">Pequeno</Button>
                    <Button variant="secondary-yellow">Padrão</Button>
                    <Button variant="secondary-yellow" size="lg">Grande</Button>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Industrial Buttons Style 1 (Classic Metal)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                    <IndustrialButton
                        color="yellow"
                        icon={ArrowRightLeft}
                        label="Transferir"
                    />
                    <IndustrialButton
                        color="green"
                        icon={ArrowUpRight}
                        label="Receber"
                    />
                    <IndustrialButton
                        color="red"
                        icon={ArrowDownRight}
                        label="Pagar"
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Industrial Buttons Style 2 (Sleek Dark)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                    <SleekIndustrialButton
                        color="yellow"
                        icon={ArrowRightLeft}
                        label="Transferir"
                    />
                    <SleekIndustrialButton
                        color="green"
                        icon={ArrowUpRight}
                        label="Receber"
                    />
                    <SleekIndustrialButton
                        color="red"
                        icon={ArrowDownRight}
                        label="Pagar"
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Destructive Variants Test</h2>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Destructive (Default)</p>
                        <Button variant="destructive">Apagar Item</Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Outline Destructive (New)</p>
                        <Button variant="outline-destructive">Apagar Item</Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Icon Destructive</p>
                        <Button variant="outline-destructive" size="icon" className="w-10 h-10">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">States Test</h2>
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Disabled</p>
                        <Button variant="secondary-yellow" disabled>Desativado</Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
