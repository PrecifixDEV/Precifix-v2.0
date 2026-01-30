import { useState } from "react";
import {
    Plus,
    Minus,
    Check,
    Trash2,
    ArrowRightLeft,
    ArrowUpRight,
    ArrowDownRight,
    Bell,
    AlertCircle,
    X,
} from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SleekIndustrialButton from "@/components/ui/SleekIndustrialButton";
import { StandardSheet, StandardSheetToggle } from "@/components/ui/StandardSheet";
import { StandardDrawer } from "@/components/ui/StandardDrawer";
import { ActiveFilters } from "@/components/ui/active-filters";
import { TablePagination } from "@/components/ui/table-pagination";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { SleekDatePicker } from "@/components/ui/sleek-date-picker";
import { SleekDateRangePicker } from "@/components/ui/sleek-date-range-picker";
import { Search, Filter } from "lucide-react";

export function LayoutElements() {
    // States for interactive components demos
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showOptional, setShowOptional] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [range, setRange] = useState<DateRange | undefined>();
    const [isSwitchActive, setIsSwitchActive] = useState(false);
    const [selectValue, setSelectValue] = useState("");

    // Demo filters
    const [filters, setFilters] = useState([
        { label: "Status", value: "Ativo" },
        { label: "Categoria", value: "Limpeza" }
    ]);

    const handleClearFilters = () => {
        setFilters([]);
        toast.info("Filtros limpos");
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-foreground p-4 md:p-8 space-y-12 pb-32 font-sans">
            {/* Header Section */}
            <header className="space-y-4 border-b border-zinc-800 pb-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-2 bg-yellow-500 rounded-full" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white">
                        Precifix Design System
                    </h1>
                </div>
                <p className="text-zinc-400 max-w-2xl text-sm font-medium leading-relaxed uppercase tracking-wider">
                    Documentação visual dos padrões e componentes industriais aplicados em toda a plataforma.
                    Clique nos elementos para testar suas interações.
                </p>
            </header>

            {/* NEW Color Hierarchy Section */}
            <section className="space-y-8">
                <SectionHeader title="Hierarquia de Cores Industrial" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Level 1 */}
                    <div className="flex flex-col gap-3">
                        <div className="h-32 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-zinc-500 font-bold text-xs tracking-widest uppercase text-center px-4">Level 1: Fundo da Página (Zinc 950)</span>
                        </div>
                        <p className="text-sm text-zinc-100 font-sans leading-relaxed">O nível mais profundo, próximo ao preto absoluto. Usado no background principal do app.</p>
                    </div>

                    {/* Level 2 */}
                    <div className="flex flex-col gap-3">
                        <div className="h-32 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-zinc-400 font-bold text-xs tracking-widest uppercase text-center px-4">Level 2: Cards & Overlays (Zinc 900)</span>
                        </div>
                        <p className="text-sm text-zinc-100 font-sans leading-relaxed">O tom padrão para Cards, Sheets e Drawers. É o nível principal de informação.</p>
                    </div>

                    {/* Level 3 */}
                    <div className="flex flex-col gap-3">
                        <div className="h-32 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-zinc-300 font-bold text-xs tracking-widest uppercase text-center px-4">Level 3: Janelas Superiores (Zinc 800)</span>
                        </div>
                        <p className="text-sm text-zinc-100 font-sans leading-relaxed">Usado para elementos que flutuam sobre outros cards, como Calendários e Dropdowns.</p>
                    </div>
                </div>
            </section>

            {/* Typography Section */}
            <section className="space-y-8">
                <SectionHeader title="Tipografia & Padrão de Leitura" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.3em] mb-2">Display (Barlow)</p>
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Título Principal Industrial</h1>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.3em] mb-2">Corpo do Texto (Inter Branco)</p>
                            <p className="text-white font-sans text-sm leading-relaxed">
                                A tipografia Inter Branca é o padrão absoluto para leitura e corpo de texto no Precifix.
                                Ela garante contraste máximo sobre os fundos escuros e uma leitura confortável e moderna.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.3em] mb-2">Technical Mono (JetBrains)</p>
                            <p className="font-mono text-sm text-zinc-400">ID_REF: #94820-K9 / SERIAL_0294</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.3em] mb-2">Contrast Label</p>
                            <Label className="text-zinc-500 uppercase tracking-widest text-[11px] font-bold">Standard Label Field</Label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Industrial Buttons Section */}
            <section className="space-y-8">
                <SectionHeader title="Botões Industriais (Sleek Dark Modern)" />

                <div className="space-y-10">
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-100 font-sans leading-relaxed">
                            Versão premium unificada com botões mestres: ícones horizontais e tipografia bold.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <SleekIndustrialButton color="yellow" icon={ArrowRightLeft} label="Transferir" />
                            <SleekIndustrialButton color="green" icon={ArrowUpRight} label="Receber" />
                            <SleekIndustrialButton color="red" icon={ArrowDownRight} label="Pagar" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Standard Action Buttons Section */}
            <section className="space-y-8">
                <SectionHeader title="Ações e Variantes de Botão" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main Actions */}
                    <div className="p-8 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-6 shadow-2xl">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] text-center">Botões de Ação Principal</p>
                        <div className="space-y-3">
                            <Button variant="secondary-yellow" className="w-full h-12 text-zinc-950 font-black uppercase tracking-tighter text-lg shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all">
                                Executar Ação Mestre
                                <Check className="ml-2 h-6 w-6" />
                            </Button>
                            <div className="flex gap-3">
                                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-10 shadow-[0_4px_0_0_#14532d] active:translate-y-1 active:shadow-none transition-all rounded-xl">
                                    Salvar Alterações
                                </Button>
                                <Button variant="outline" className="flex-1 border-zinc-800 bg-black text-zinc-400 hover:text-white h-10 shadow-[0_4px_0_0_#18181b] active:translate-y-1 active:shadow-none transition-all uppercase font-bold text-xs tracking-widest rounded-xl">
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Secondary & Destructive */}
                    <div className="p-8 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-6 shadow-2xl">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] text-center">Estados e Riscos</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button variant="outline-destructive" className="h-10 px-6 font-bold uppercase tracking-widest text-[11px] rounded-xl">
                                Excluir Registro
                                <Trash2 className="ml-2 h-4 w-4" />
                            </Button>
                            <Button variant="outline-destructive" size="icon" className="h-10 w-10 rounded-xl bg-zinc-900 border-2 border-red-500/50 text-red-500 shadow-[0_4px_0_0_#450a0a] active:translate-y-1 active:shadow-none transition-all">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                            <Button disabled className="h-10 px-6 font-bold uppercase tracking-widest text-[11px] opacity-50 grayscale rounded-xl">
                                Ação Desativada
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW Standard Button Proposals Section */}
            <section className="space-y-8">
                <SectionHeader title="Proposta de Novos Botões Padrão" />
                <div className="p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* 1. Botão Principal (Confirmação/Criação) */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em]">Botão Principal (h-12)</p>
                            <Button className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-display font-bold uppercase tracking-tight text-lg shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all rounded-xl gap-3 [&_svg]:!size-5">
                                Confirmar Cadastro
                                <Check className="ml-2" />
                            </Button>
                            <p className="text-sm text-zinc-100 font-sans leading-relaxed">Uso: Ações definitivas, salvar novo registro, finalizar processo.</p>
                        </div>

                        {/* 2. Botão Secundário (Ação Alternativa Amarela) */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em]">Botão Secundário (Outline Yellow)</p>
                            <Button variant="outline" className="w-full h-12 bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-display font-bold uppercase tracking-tight text-lg shadow-[0_4px_0_0_rgba(234,179,8,0.3)] active:translate-y-1 active:shadow-none transition-all rounded-xl gap-3 [&_svg]:!size-5">
                                Adicionar Outro
                                <Plus className="ml-2" />
                            </Button>
                            <p className="text-sm text-zinc-100 font-sans leading-relaxed">Uso: Quando já existe um botão principal na tela, mas esta ação ainda é importante.</p>
                        </div>

                        {/* 3. Botão de Cancelamento (Gray Outline) */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Botão de Cancelamento (Gray)</p>
                            <Button variant="outline" className="w-full h-12 bg-transparent border-2 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50 font-display font-bold uppercase tracking-tight text-lg shadow-[0_4px_0_0_#000000] active:translate-y-1 active:shadow-none transition-all rounded-xl gap-3 [&_svg]:!size-5">
                                Cancelar / Voltar
                                <X className="ml-2" />
                            </Button>
                            <p className="text-sm text-zinc-100 font-sans leading-relaxed">Uso: Sair sem salvar, fechar formulários, desistir da ação atual.</p>
                        </div>
                    </div>

                    {/* 4. Botão Interno (White Outline) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-zinc-800">
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Botão Interno (White)</p>
                            <Button variant="outline-white" className="w-full h-12 font-display font-bold uppercase tracking-tight text-lg shadow-[0_4px_0_0_#000000] active:translate-y-1 active:shadow-none transition-all rounded-xl gap-3 [&_svg]:!size-5">
                                Detalhes Técnicos
                                <ArrowUpRight className="ml-2" />
                            </Button>
                            <p className="text-sm text-zinc-100 font-sans leading-relaxed">Uso: Ações internas importantes que precisam de destaque sobre fundo escuro.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW Inputs & Form Elements Section */}
            <section className="space-y-8">
                <SectionHeader title="Inputs & Elementos de Formulário" />
                <div className="p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {/* 1. Combobox / Select */}
                        {/* 1. Combobox / Select */}
                        <div className="space-y-4">
                            <Label className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Seleção Industrial (Select/Combobox)</Label>
                            <Select value={selectValue} onValueChange={setSelectValue}>
                                <SelectTrigger className="w-full h-12 !bg-transparent dark:!bg-transparent border-2 border-zinc-800 text-zinc-100 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all rounded-xl !font-sans font-medium">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                    <SelectItem value="prod">Produtos de Limpeza</SelectItem>
                                    <SelectItem value="serv">Serviços de Manutenção</SelectItem>
                                    <SelectItem value="equip">Equipamentos</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-base text-zinc-100 font-sans leading-relaxed">Padrão p/ listas de opções fixas ou dinâmicas.</p>
                        </div>

                        {/* 2. Calendário Industrial */}
                        <div className="space-y-4">
                            <Label className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Seletor de Data (SleekDatePicker)</Label>
                            <SleekDatePicker
                                date={date}
                                onSelect={setDate}
                                placeholder="Selecione a data de execução"
                                className="!bg-transparent dark:!bg-transparent border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all h-12 !font-sans font-medium rounded-xl"
                            />
                            <p className="text-base text-zinc-100 font-sans leading-relaxed">Drawer no mobile, popover elegante no desktop.</p>
                        </div>

                        {/* 2.1 Seletor de Período (PickRange) */}
                        <div className="space-y-4">
                            <Label className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Seletor de Período (PickRange)</Label>
                            <SleekDateRangePicker
                                date={range}
                                onSelect={setRange}
                                placeholder="Selecionar intervalo"
                                className="!bg-transparent dark:!bg-transparent border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all h-12 !font-sans font-medium rounded-xl"
                            />
                            <p className="text-base text-zinc-100 font-sans leading-relaxed">Gestão de períodos com estabilidade industrial.</p>
                        </div>

                        {/* 3. Busca & Filtro */}
                        <div className="space-y-4">
                            <Label className="text-zinc-500 uppercase tracking-widest text-xs font-bold">Barra de Busca Industrial</Label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white transition-colors" />
                                <Input
                                    placeholder="Pesquisar ativos ou ordens..."
                                    className="h-12 pl-10 !bg-transparent dark:!bg-transparent border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-100 placeholder:text-zinc-600 rounded-xl !font-sans font-medium"
                                />
                            </div>
                            <p className="text-base text-zinc-100 font-sans leading-relaxed">Fundo preto sólido com transição de foco amarela.</p>
                        </div>

                        {/* 4. Switch & Toggle */}
                        <div className="space-y-4">
                            <Label className="text-zinc-500 uppercase tracking-widest text-sm font-bold">Interruptores de Estado (Switch)</Label>
                            <div className="flex items-center gap-4 bg-transparent p-4 rounded-xl border-2 border-zinc-800">
                                <Switch
                                    checked={isSwitchActive}
                                    onCheckedChange={setIsSwitchActive}
                                />
                                <div className="space-y-0.5">
                                    <p className="text-base font-bold text-zinc-100 uppercase tracking-tight font-sans">Status Operacional</p>
                                    <p className="text-sm text-zinc-500 uppercase font-bold tracking-tighter font-sans">
                                        {isSwitchActive ? 'Ativado' : 'Desativado'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-base text-zinc-100 font-sans leading-relaxed">Uso: Ativar/desativar funções ou estados binários.</p>
                        </div>

                        {/* 5. Icon Buttons Group */}
                        <div className="space-y-4">
                            <Label className="text-zinc-400 uppercase tracking-widest text-[11px] font-bold">Botões de Ação com Ícone</Label>
                            <div className="flex gap-4">
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-zinc-900 border-2 border-zinc-800 text-white shadow-[0_4px_0_0_#000000] active:translate-y-1 active:shadow-none transition-all group [&_svg]:!size-5">
                                    <Filter className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-zinc-900 border-2 border-red-500/50 text-red-500 shadow-[0_4px_0_0_#450a0a] active:translate-y-1 active:shadow-none transition-all group [&_svg]:!size-5">
                                    <Trash2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-zinc-900 border-2 border-yellow-500/50 text-yellow-500 shadow-[0_4px_0_0_#422006] active:translate-y-1 active:shadow-none transition-all group [&_svg]:!size-5">
                                    <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                </Button>
                            </div>
                            <p className="text-sm text-zinc-100 font-sans leading-relaxed">Botões quadrados com cantos arredondados (xl) p/ ferramentas.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Overlays Section */}
            <section className="space-y-8">
                <SectionHeader title="Overlays & Formulários Laterais" />
                <div className="flex flex-wrap gap-6 justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Padrão p/ Edição Mobile First</p>
                        <Button
                            onClick={() => setIsSheetOpen(true)}
                            className="h-14 px-8 bg-zinc-900 border-2 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all rounded-xl font-black uppercase text-lg tracking-tighter"
                        >
                            Ver Standard Sheet
                        </Button>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Padrão p/ Seleções Rápidas</p>
                        <Button
                            onClick={() => setIsDrawerOpen(true)}
                            className="h-14 px-8 bg-zinc-900 border-2 border-zinc-800 text-white hover:border-white transition-all rounded-xl font-black uppercase text-lg tracking-tighter"
                        >
                            Ver Standard Drawer
                        </Button>
                    </div>
                </div>
            </section>

            {/* Feedback Section */}
            <section className="space-y-8">
                <SectionHeader title="Feedback & Toasts" />
                <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                        onClick={() => toast.success("Dados salvos com sucesso!", {
                            description: "Sincronizado com servidores industriais.",
                            icon: <Check className="h-5 w-5 text-green-500" />
                        })}
                        variant="outline"
                        className="bg-black border-zinc-800 text-green-500 hover:bg-green-500/10 font-bold rounded-xl"
                    >
                        Success Toast
                    </Button>
                    <Button
                        onClick={() => toast.error("Falha na conexão", {
                            description: "Erro técnico: 0x84920",
                            icon: <AlertCircle className="h-5 w-5 text-red-500" />
                        })}
                        variant="outline"
                        className="bg-black border-zinc-800 text-red-500 hover:bg-red-500/10 font-bold rounded-xl"
                    >
                        Error Toast
                    </Button>
                    <Button
                        onClick={() => toast.info("Novo agendamento", {
                            description: "Cliente enviou mensagem.",
                            icon: <Bell className="h-5 w-5 text-blue-500" />
                        })}
                        variant="outline"
                        className="bg-black border-zinc-800 text-blue-500 hover:bg-blue-500/10 font-bold rounded-xl"
                    >
                        Info Toast
                    </Button>
                </div>
            </section>

            <section className="space-y-4">
                <SectionHeader title="Datagrids & Listagens" />
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                    <ActiveFilters
                        filters={filters}
                        onClearAll={handleClearFilters}
                    />
                    <div className="h-40 flex items-center justify-center border-b border-zinc-900 p-8">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-1 bg-yellow-500 mx-auto" />
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Área da Tabela (Mock)</p>
                        </div>
                    </div>
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={10}
                        totalItems={250}
                        itemsPerPage={25}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </section>

            {/* Components Implementation */}

            {/* 1. Standard Sheet Demo */}
            <StandardSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                title="NOVO CADASTRO INDUSTRIAL"
                // Implementando o padrão de botões industriais no footer
                saveButton={
                    <div className="flex w-full gap-4 items-center">
                        <Button
                            className="flex-1 h-12 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-display font-bold uppercase tracking-tight text-lg shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all rounded-xl"
                            onClick={() => {
                                toast.success("Item salvo!");
                                setIsSheetOpen(false);
                            }}
                        >
                            Salvar Cadastro
                            <Check className="ml-2 h-6 w-6 shrink-0" />
                        </Button>
                        <Button
                            variant="outline-destructive"
                            size="icon"
                            className="h-12 w-12 shrink-0 rounded-xl bg-zinc-900 border-2 border-red-500/50 text-red-500 shadow-[0_4px_0_0_#450a0a] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center [&_svg]:!size-5"
                            onClick={() => toast.error("Item excluído")}
                        >
                            <Trash2 />
                        </Button>
                    </div>
                }
                optionalFieldsToggles={
                    <>
                        <StandardSheetToggle
                            label="Informações Extras"
                            active={showOptional}
                            onClick={() => setShowOptional(!showOptional)}
                            icon={showOptional ? <Minus size={14} /> : <Plus size={14} />}
                        />
                        <StandardSheetToggle
                            label="Anexar Fotos"
                            active={false}
                            onClick={() => toast.info("Função de fotos")}
                        />
                    </>
                }
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-white text-sm font-bold">Nome do Ativo <span className="text-red-500">*</span></Label>
                        <Input placeholder="Ex: Motor V8 Turbo" className="!bg-transparent dark:!bg-transparent border-2 border-zinc-800 placeholder:text-zinc-500 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 transition-all !font-sans font-medium rounded-xl text-zinc-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-white text-sm font-bold">Peso (kg)</Label>
                            <Input type="number" placeholder="0.00" className="!bg-transparent dark:!bg-transparent border-2 border-zinc-800 placeholder:text-zinc-500 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 transition-all !font-sans font-medium rounded-xl text-zinc-100" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-white text-sm font-bold">Status <span className="text-red-500">*</span></Label>
                            <Select defaultValue="op">
                                <SelectTrigger className="w-full h-12 !bg-transparent dark:!bg-transparent border-2 border-zinc-800 text-zinc-100 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all rounded-xl !font-sans font-medium">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                    <SelectItem value="op">OPERACIONAL</SelectItem>
                                    <SelectItem value="man">MANUTENÇÃO</SelectItem>
                                    <SelectItem value="ina">INATIVO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {showOptional && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <Label className="text-white text-sm font-bold">Observações Técnicas</Label>
                                <textarea className="w-full !bg-transparent dark:!bg-transparent border-2 border-zinc-800 placeholder:text-zinc-500 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl p-3 text-zinc-100 text-sm min-h-[100px] transition-all !font-sans font-medium outline-none resize-none" placeholder="Detalhes de manutenção..." />
                            </div>
                        </div>
                    )}
                </div>
            </StandardSheet>

            {/* 2. Standard Drawer Demo */}
            <StandardDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                title="Selecione o Operador"
                onSave={() => setIsDrawerOpen(false)}
            >
                <div className="space-y-3">
                    {[
                        { name: "Carlos Silva", role: "Mestre Soldador", status: "online" },
                        { name: "Roberto Menezes", role: "Técnico Hidráulico", status: "away" },
                        { name: "Ana Paula", role: "Engenheira Mecânica", status: "online" }
                    ].map((user, i) => (
                        <button
                            key={i}
                            className="w-full p-4 rounded-xl border border-zinc-900 bg-zinc-950 hover:border-yellow-500/50 hover:bg-zinc-900 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3 text-left">
                                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-white group-hover:text-yellow-500 transition-colors">{user.name}</p>
                                    <p className="text-[10px] uppercase font-bold text-zinc-600">{user.role}</p>
                                </div>
                            </div>
                            <div className={`h-2 w-2 rounded-full ${user.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-700'}`} />
                        </button>
                    ))}
                </div>
            </StandardDrawer>
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold uppercase tracking-tight text-primary whitespace-nowrap">
                {title}
            </h2>
            <div className="h-px bg-zinc-800 flex-1" />
        </div>
    );
}
