import { useState } from "react";
import {
    Calendar as CalendarIcon,
    List,
    LayoutGrid,
    Plus,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgendaCalendarView } from "../components/agenda/AgendaCalendarView";
import { AgendaListView } from "../components/agenda/AgendaListView";

export function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Stats Mocks (Will be real later)
    const stats = [
        { label: "Total", value: "28", amount: "R$ 9.885,00", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Concluídos", value: "19", amount: "R$ 8.305,00", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Pendentes", value: "4", amount: "R$ 950,00", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Cancelados", value: "5", amount: "R$ 630,00", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    ];

    return (
        <div className="space-y-6">
            {/* Header: Navigation & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-zinc-400">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="px-4 text-sm font-bold uppercase tracking-wider min-w-[140px] text-center">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-zinc-400">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button className="bg-primary hover:bg-primary/90 text-black font-bold gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Agendamento
                    </Button>
                </div>
            </div>

            {/* Compact Legend Bar - As per reference image */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-3">
                    {stats.slice(1).map((stat) => (
                        <div key={stat.label} className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full border-2", stat.color.replace('text-', 'border-'))} />
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                                {stat.value} {stat.label.toLowerCase()}
                            </span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-purple-500" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                            0 importantes
                        </span>
                    </div>
                </div>
            </div>

            {/* Agenda Summary Block - Concentrated for space */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-zinc-100 italic">Resumo da agenda</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                                {stat.label} ({stat.value})
                                <div className="h-3 w-3 rounded-full border border-zinc-700 flex items-center justify-center text-[8px] font-black">i</div>
                            </div>
                            <div className={cn("text-lg font-black tracking-tight", stat.color)}>
                                {stat.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* View Tabs */}
            <Tabs defaultValue="calendar" className="w-full">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-px">
                    <TabsList className="bg-zinc-900 border border-zinc-800 h-10 p-1">
                        <TabsTrigger value="calendar" className="gap-2 text-[10px] uppercase font-bold tracking-widest px-4">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Calendário
                        </TabsTrigger>
                        <TabsTrigger value="list" className="gap-2 text-[10px] uppercase font-bold tracking-widest px-4">
                            <List className="h-3.5 w-3.5" />
                            Lista
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="gap-2 text-[10px] uppercase font-bold tracking-widest px-4">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Solicitações
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="calendar" className="mt-0 focus-visible:outline-none">
                    <AgendaCalendarView currentDate={currentDate} />
                </TabsContent>

                <TabsContent value="list" className="mt-0 focus-visible:outline-none">
                    <AgendaListView currentDate={currentDate} />
                </TabsContent>

                <TabsContent value="requests" className="mt-0 focus-visible:outline-none">
                    <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                        <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Nenhuma solicitação pendente</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
