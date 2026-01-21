import { useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Plus,
    MapPin,
    FileText,
    Car,
    ChevronRight,
    LayoutGrid,
    List as ListIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_CLIENTS = [
    {
        id: "1",
        name: "João Silva",
        document: "123.456.789-00",
        phone: "(11) 98765-4321",
        city: "São Paulo",
        state: "SP",
        status: "Ativo",
        vehicles: 2
    },
    {
        id: "2",
        name: "Maria Oliveira",
        document: "987.654.321-11",
        phone: "(21) 91234-5678",
        city: "Rio de Janeiro",
        state: "RJ",
        status: "Ativo",
        vehicles: 1
    },
    {
        id: "3",
        name: "Oficina do Gugu",
        document: "12.345.678/0001-99",
        phone: "(31) 3344-5566",
        city: "Belo Horizonte",
        state: "MG",
        status: "Inativo",
        vehicles: 5
    },
    {
        id: "4",
        name: "Ana Costa",
        document: "456.789.012-33",
        phone: "(41) 99887-7665",
        city: "Curitiba",
        state: "PR",
        status: "Ativo",
        vehicles: 0
    }
];

import { VisualClientSheet } from "./VisualClientSheet";
import { VisualNavbar } from "./VisualNavbar";

export const VisualTest = () => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-yellow-500/30 overflow-x-hidden">
            {/* Background decorative elements - Adjusted for mobile */}
            <div className="fixed top-[-5%] right-[-10%] w-[60%] h-[40%] bg-yellow-500/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-5%] left-[-5%] w-[50%] h-[30%] bg-zinc-800/20 blur-[60px] md:blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 px-4 py-6 md:px-8 md:py-10">
                {/* Header Section - Optimized for Mobile */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 md:w-8 h-1 bg-yellow-500 rounded-full" />
                            <span className="text-yellow-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">Sandbox Visual</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase italic">
                            CLIENTES <span className="text-zinc-600 not-italic uppercase">PRO</span>
                        </h1>
                        <p className="text-zinc-500 text-sm md:text-lg max-w-md">Interface industrial otimizada para fluxo rápido de trabalho.</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsSheetOpen(true)}
                            className="flex-1 md:flex-none bg-yellow-500 text-black hover:bg-yellow-400 transition-all font-black px-6 py-5 md:py-6 h-auto rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                        >
                            <Plus className="w-5 h-5 mr-2 stroke-[4px]" /> NOVO CLIENTE
                        </Button>
                    </div>
                </div>

                {/* Search and Filters Bar - Mobile Friendly */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8 bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-1.5 md:p-2 rounded-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                        <Input
                            placeholder="Buscar clientes..."
                            className="bg-transparent border-none h-12 md:h-14 pl-12 focus-visible:ring-0 text-white placeholder:text-zinc-700 outline-none text-base"
                        />
                    </div>

                    <div className="flex gap-2">
                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode("list")}
                                className={`h-10 w-10 md:h-12 md:w-12 rounded-lg transition-all ${viewMode === "list" ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-600 hover:text-white hover:bg-white/5"}`}
                            >
                                <ListIcon className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode("grid")}
                                className={`h-10 w-10 md:h-12 md:w-12 rounded-lg transition-all ${viewMode === "grid" ? "bg-yellow-500 text-black shadow-lg" : "text-zinc-600 hover:text-white hover:bg-white/5"}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </Button>
                        </div>

                        <Button variant="outline" className="flex-1 md:flex-none h-12 md:h-14 bg-black/40 border-white/5 hover:bg-white hover:text-black rounded-xl px-4 md:px-5 transition-all text-zinc-400 font-bold border-dashed border-2">
                            <Filter className="w-4 h-4 mr-2" /> FILTROS
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className={viewMode === "list" ? "space-y-3 md:space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"}>
                    {MOCK_CLIENTS.map((client) => (
                        <div
                            key={client.id}
                            className={`group relative overflow-hidden transition-all duration-300 active:scale-[0.98] md:active:scale-100
                                ${viewMode === "list"
                                    ? "flex items-center gap-3 md:gap-6 p-4 md:p-5 bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl hover:bg-white/[0.06] hover:border-yellow-500/30 shadow-xl"
                                    : "flex flex-col p-5 md:p-6 bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-3xl hover:bg-white/[0.06] hover:border-yellow-500/30 shadow-xl"
                                }`}
                        >
                            {/* Accent Glow */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-500/[0.03] blur-[30px] rounded-full group-hover:bg-yellow-500/[0.08] transition-colors" />

                            {/* Avatar / Icon */}
                            <div className={`${viewMode === "list" ? "shrink-0" : "mb-5 flex justify-between items-start"}`}>
                                <Avatar className={`border-2 border-zinc-900 ring-2 ring-white/5 ${viewMode === "list" ? "w-12 h-12 md:w-14 md:h-14" : "w-14 h-14 md:w-16 md:h-16 group-hover:rotate-3 transition-transform"}`}>
                                    <AvatarFallback className="bg-zinc-900 text-yellow-500 font-black text-lg md:text-xl border border-yellow-500/30">
                                        {client.name.substring(0, 1).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {viewMode === "grid" && (
                                    <Badge className="bg-yellow-500/10 text-yellow-500 border-none px-2 py-0.5 text-[10px] font-black uppercase">
                                        {client.status}
                                    </Badge>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className={`${viewMode === "list" ? "flex items-center justify-between gap-2" : "mb-4"}`}>
                                    <div className="min-w-0">
                                        <h3 className="text-base md:text-xl font-bold text-white group-hover:text-yellow-500 transition-colors truncate">
                                            {client.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-zinc-500 text-[10px] md:text-sm mt-0.5">
                                            <span className="flex items-center gap-1 font-mono">
                                                {client.document}
                                            </span>
                                            <span className="hidden md:inline w-1 h-1 bg-zinc-800 rounded-full" />
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-yellow-500/30" /> {client.city}/{client.state}
                                            </span>
                                        </div>
                                    </div>

                                    {viewMode === "list" && (
                                        <div className="hidden sm:flex items-center gap-6 md:gap-8 px-4 md:px-6">
                                            <div className="hidden lg:block">
                                                <span className="block text-zinc-600 text-[10px] font-black uppercase tracking-tight">Cidades</span>
                                                <span className="text-zinc-400 font-medium flex items-center gap-1.5 pt-1">
                                                    {client.city}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-zinc-600 text-[10px] font-black uppercase tracking-tight text-right w-full">Frota</span>
                                                <span className="text-white font-black text-base md:text-lg flex items-center justify-end gap-1.5 pt-0.5">
                                                    {client.vehicles} <Car className="w-4 h-4 text-zinc-700" />
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {viewMode === "grid" && (
                                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 mt-auto">
                                        <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                                            <span className="block text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Veículos</span>
                                            <span className="text-white font-black text-sm flex items-center gap-2">
                                                <Car className="w-3 h-3 text-yellow-500" /> {client.vehicles}
                                            </span>
                                        </div>
                                        <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                                            <span className="block text-zinc-600 text-[9px] font-black uppercase tracking-widest mb-1">Estado</span>
                                            <span className="text-white font-black text-sm">{client.state}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions - Mobile Optimized */}
                            <div className="flex items-center gap-1 ml-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 text-zinc-600 hover:text-white hover:bg-white/5">
                                    <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                                </Button>
                                {viewMode === "list" && (
                                    <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-zinc-900/50 rounded-xl border border-white/5 group-hover:bg-yellow-500 group-hover:text-black transition-all cursor-pointer group-hover:border-yellow-400 shadow-lg">
                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Bottom Float Info or Simple Footer */}
                <div className="mt-8 md:mt-12 p-6 md:p-8 bg-black/60 backdrop-blur-xl border border-yellow-500/10 rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-1">
                        <Badge className="bg-yellow-500/5 text-yellow-500/40 border-none text-[8px] font-black">SYSTEM_v2.0</Badge>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6 md:gap-10">
                            <div>
                                <span className="block text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Total Geral</span>
                                <span className="text-2xl md:text-3xl font-black text-white">4.280</span>
                            </div>
                            <div className="w-[1px] h-10 bg-zinc-800" />
                            <div>
                                <span className="block text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Ativos</span>
                                <span className="text-2xl md:text-3xl font-black text-yellow-500">3.890</span>
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <Button variant="outline" className="w-full md:w-auto text-zinc-500 border-white/5 hover:text-white hover:bg-white/5 rounded-xl font-bold uppercase text-xs tracking-wider h-12">
                                <FileText className="w-4 h-4 mr-2" /> Exportar Dados
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <VisualClientSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />

            <VisualNavbar />
        </div>
    );
};
