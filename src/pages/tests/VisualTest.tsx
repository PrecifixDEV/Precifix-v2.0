import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Trash2, ArrowRightLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SleekDatePicker } from "@/components/ui/sleek-date-picker";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { SleekDateRangePicker } from "@/components/ui/sleek-date-range-picker";
import SleekIndustrialButton from "@/components/ui/SleekIndustrialButton";

export function VisualTest() {
    const [singleDate, setSingleDate] = useState<Date | undefined>(new Date());
    const [rangeDate, setRangeDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: undefined
    });

    return (
        <div className="p-8 space-y-12 bg-background min-h-screen text-foreground pb-20">
            <section className="space-y-6">
                <h1 className="text-3xl font-black uppercase tracking-tighter border-b-2 border-primary pb-2 inline-block">
                    Visual Components Test
                </h1>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Responsive Date Picker */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold uppercase tracking-tight text-primary flex items-center gap-2">
                        <span className="w-8 h-px bg-primary/30" /> Responsive (Drawer)
                    </h2>
                    <div className="space-y-3 p-6 border border-zinc-900 rounded-lg bg-black">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] text-center mb-4">Teste de Seleção Única</p>
                        <div className="w-full">
                            <SleekDatePicker
                                date={singleDate}
                                onSelect={setSingleDate}
                                placeholder="Testar Data Única"
                            />
                        </div>
                    </div>
                </section>

                {/* Popover Date Picker (Old Way) */}
                <section className="space-y-6">
                    <h2 className="text-xl font-bold uppercase tracking-tight text-primary flex items-center gap-2">
                        <span className="w-8 h-px bg-primary/30" /> Legacy (Popover)
                    </h2>
                    <div className="space-y-3 p-4 border rounded-2xl bg-card">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] text-center mb-1">Calendário em Popover</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:text-white transition-all",
                                        !singleDate && "text-zinc-500"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-zinc-500" />
                                    {singleDate ? format(singleDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-card border rounded-2xl overflow-hidden shadow-2xl" align="start">
                                <Calendar
                                    mode="single"
                                    selected={singleDate}
                                    onSelect={setSingleDate}
                                    initialFocus
                                    className="p-4 pt-2"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </section>

                {/* Standalone Calendar (Direct View) */}
                <section className="space-y-6 md:col-span-2 flex flex-col items-center border-t border-zinc-900 pt-8 mt-4">
                    <h2 className="text-xl font-bold uppercase tracking-tight text-primary flex items-center gap-2">
                        <span className="w-8 h-px bg-primary/30" /> Real-time Demo (Static)
                    </h2>
                    <div className="p-4 pt-2 border rounded-2xl bg-card shadow-2xl">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] text-center mb-2">Visualização Direta do Componente</p>
                        <Calendar
                            mode="single"
                            selected={singleDate}
                            onSelect={setSingleDate}
                            className="p-0"
                        />
                    </div>
                </section>

                {/* Sleek Date Range Picker */}
                <section className="space-y-6 md:col-span-2 mt-8">
                    <h2 className="text-xl font-bold uppercase tracking-tight text-primary flex items-center gap-2">
                        <span className="w-8 h-px bg-primary/30" /> Sleek Date Range Picker (New)
                    </h2>
                    <div className="p-8 border border-zinc-900 rounded-2xl bg-black max-w-md mx-auto">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] text-center mb-6">
                            Seleção de Período com Limite de 31 Dias
                        </p>
                        <SleekDateRangePicker
                            date={rangeDate}
                            onSelect={setRangeDate}
                        />
                        {rangeDate?.from && (
                            <div className="mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-900 text-[10px] font-mono text-zinc-500 uppercase flex justify-between">
                                <span>Estado:</span>
                                <span>
                                    {format(rangeDate.from, "dd/MM")} - {rangeDate.to ? format(rangeDate.to, "dd/MM") : "???"}
                                </span>
                            </div>
                        )}
                    </div>
                </section>
            </div>

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
        </div >
    );
}
