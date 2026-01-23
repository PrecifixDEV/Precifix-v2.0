import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Car, Wrench } from "lucide-react";

interface AgendaListViewProps {
    currentDate: Date;
}

export function AgendaListView({ currentDate }: AgendaListViewProps) {
    // Mock agenda items
    const items = [
        {
            id: "1",
            time: "09:00",
            client: "João Silva",
            vehicle: "Corolla - XYZ-1234",
            service: "Lavagem Detalhada + Cera",
            status: "Aprovado",
            statusColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        },
        {
            id: "2",
            time: "10:30",
            client: "Maria Oliveira",
            vehicle: "BMW 320i - ABC-5678",
            service: "Polimento Técnico",
            status: "Pendente",
            statusColor: "bg-amber-500/10 text-amber-500 border-amber-500/20"
        },
        {
            id: "3",
            time: "14:00",
            client: "Carlos Souza",
            vehicle: "Civic - QWE-9012",
            service: "Higienização Interna",
            status: "Cancelado",
            statusColor: "bg-red-500/10 text-red-500 border-red-500/20"
        }
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-2 py-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">
                    {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
            </div>

            <div className="space-y-3">
                {items.map((item) => (
                    <Card key={item.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Time & Status */}
                                <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-2 min-w-[100px]">
                                    <div className="flex items-center gap-2 text-primary font-black text-xl tracking-tighter">
                                        <Clock className="h-4 w-4" />
                                        {item.time}
                                    </div>
                                    <Badge className={item.statusColor}>{item.status}</Badge>
                                </div>

                                <div className="h-px md:h-12 w-full md:w-px bg-zinc-800" />

                                {/* Info */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                            <User className="h-3 w-3" />
                                            Cliente
                                        </div>
                                        <div className="font-bold">{item.client}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                            <Car className="h-3 w-3" />
                                            Veículo
                                        </div>
                                        <div className="font-bold">{item.vehicle}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                            <Wrench className="h-3 w-3" />
                                            Serviço
                                        </div>
                                        <div className="font-bold text-primary">{item.service}</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
