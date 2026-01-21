import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User,
    Phone,
    MapPin,
    FileText,
    Building2,
    CheckCircle2,
    TrendingUp
} from "lucide-react";

interface VisualClientSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const VisualClientSheet = ({ open, onOpenChange }: VisualClientSheetProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-[540px] p-0 bg-zinc-950 border-l border-white/5 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]"
            >
                {/* Stripe Header */}
                <div className="h-4 w-full bg-[#EAB308] relative overflow-hidden shrink-0">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                            backgroundSize: '40px 40px'
                        }}
                    />
                </div>

                <SheetHeader className="px-8 pt-8 pb-6 bg-zinc-900/50 backdrop-blur-xl border-b border-white/5 relative overflow-hidden">
                    {/* Decorative background number */}
                    <span className="absolute -right-4 -bottom-8 text-[120px] font-black text-white/[0.02] pointer-events-none select-none">
                        01
                    </span>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                            <User className="w-6 h-6 text-black stroke-[2.5px]" />
                        </div>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-3 uppercase font-black tracking-tighter text-[10px]">
                            Novo Registro
                        </Badge>
                    </div>
                    <SheetTitle className="text-3xl font-black text-white tracking-tight leading-none">
                        CADASTRAR <span className="text-zinc-600">CLIENTE</span>
                    </SheetTitle>
                    <SheetDescription className="text-zinc-500 text-sm mt-2 max-w-[300px]">
                        Preencha os dados básicos para iniciar um novo atendimento industrial.
                    </SheetDescription>
                </SheetHeader>

                {/* Form Body with Glassmorphism */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
                    {/* Section: Identificação */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-4 h-4 text-yellow-500" />
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Fluxo de Identificação</span>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-zinc-600" /> Nome Completo / Razão Social
                                </Label>
                                <Input
                                    placeholder="Ex: Auto Mecânica Industrial S.A."
                                    className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-zinc-800 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 transition-all text-base"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-zinc-600" /> CPF ou CNPJ
                                    </Label>
                                    <Input
                                        placeholder="00.000.000/0000-00"
                                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-zinc-800 focus-visible:ring-yellow-500/50 transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        <Building2 className="w-3.5 h-3.5 text-zinc-600" /> Inscrição Estadual
                                    </Label>
                                    <Input
                                        placeholder="Opcional"
                                        className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-zinc-800 focus-visible:ring-yellow-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Contato */}
                    <div className="space-y-6 pt-6 border-t border-white/5 relative">
                        <div className="flex items-center gap-2 mb-4">
                            <Phone className="w-4 h-4 text-yellow-500" />
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Canais de Contato</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">WhatsApp Principal</Label>
                                <Input
                                    placeholder="(00) 00000-0000"
                                    className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-zinc-800 focus-visible:ring-yellow-500/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">E-mail Corporativo</Label>
                                <Input
                                    placeholder="contato@empresa.com"
                                    className="bg-white/5 border-white/10 h-14 rounded-xl text-white placeholder:text-zinc-800 focus-visible:ring-yellow-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Localização */}
                    <div className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-4 h-4 text-yellow-500" />
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Base de Operação</span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Cidade</Label>
                                    <Input className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">UF</Label>
                                    <Input className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-800" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Endereço Completo</Label>
                                <Input className="bg-white/5 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-800" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer with Striped Button */}
                <SheetFooter className="p-6 bg-zinc-900 border-t border-white/5 flex-col gap-3 sm:flex-col shrink-0">
                    <Button
                        className="w-full h-16 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg rounded-2xl flex items-center justify-between px-8 shadow-[0_10px_30px_rgba(234,179,8,0.1)] group transition-all"
                        onClick={() => onOpenChange(false)}
                    >
                        <span>SALVAR REGISTRO</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-black/20 rounded-full group-hover:bg-black/40 transition-colors" />
                            <CheckCircle2 className="w-6 h-6 stroke-[3px]" />
                        </div>
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-2">
                        <Building2 className="w-3 h-3" /> Precifix Industrial OS v2.0
                    </div>
                </SheetFooter>

                {/* Bottom Stripe */}
                <div className="h-2 w-full bg-[#EAB308] relative overflow-hidden shrink-0">
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)',
                            backgroundSize: '20px 20px'
                        }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
};

// Simple Badge component if not available
const Badge = ({ children, className }: any) => (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
        {children}
    </div>
);
