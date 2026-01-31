import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Check,
    X,
    Search,
    Plus,
    Edit,
    Trash2,
    ChevronRight,
    DollarSign,
    TrendingUp,
    Users,
    Package
} from "lucide-react";

export function Layout2() {
    const [inputValue, setInputValue] = useState("");
    const [textareaValue, setTextareaValue] = useState("");

    return (
        <div className="min-h-screen bg-zinc-900 text-white">
            {/* Header */}
            <div className="bg-black border-b border-zinc-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold text-yellow-500 tracking-tight uppercase">
                        Precifix Style Guide v2.0
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Design System Unificado - Prova de Conceito
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">

                {/* Typography Section */}
                <section className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight">Tipografia</h2>
                        <p className="text-zinc-400 mt-2">
                            Sistema de hierarquia tipográfica com Inter (UI) e números tabulares para alinhamento perfeito
                        </p>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Hierarquia de Texto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">H1 - 2.5rem (40px)</p>
                                <h1 className="text-[2.5rem] font-bold tracking-tight leading-tight">
                                    Título Principal
                                </h1>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">H2 - 2rem (32px)</p>
                                <h2 className="text-[2rem] font-bold tracking-tight leading-tight">
                                    Título Secundário
                                </h2>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">H3 - 1.5rem (24px)</p>
                                <h3 className="text-[1.5rem] font-semibold leading-tight">
                                    Título Terciário
                                </h3>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Body - 1rem (16px)</p>
                                <p className="text-base font-normal leading-relaxed">
                                    Texto de corpo padrão para conteúdo principal. Legível e confortável para leitura prolongada.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Small - 0.875rem (14px)</p>
                                <p className="text-sm font-normal text-zinc-300">
                                    Texto secundário para informações complementares
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Caption - 0.75rem (12px)</p>
                                <p className="text-xs font-normal text-zinc-400">
                                    Legendas, labels e metadados
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Numbers - Tabular (Alinhamento Perfeito)</p>
                                <div className="space-y-1 font-mono tabular-nums">
                                    <p className="text-2xl font-bold">R$ 1.234,56</p>
                                    <p className="text-2xl font-bold">R$ 9.876,54</p>
                                    <p className="text-2xl font-bold">R$ 5.555,00</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Spacing Section */}
                <section className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight">Espaçamento</h2>
                        <p className="text-zinc-400 mt-2">
                            Sistema baseado em escala de 4px para consistência visual
                        </p>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardContent className="pt-6 space-y-4">
                            {[
                                { name: "4px", class: "w-1", value: "0.25rem" },
                                { name: "8px", class: "w-2", value: "0.5rem" },
                                { name: "12px", class: "w-3", value: "0.75rem" },
                                { name: "16px", class: "w-4", value: "1rem" },
                                { name: "24px", class: "w-6", value: "1.5rem" },
                                { name: "32px", class: "w-8", value: "2rem" },
                                { name: "48px", class: "w-12", value: "3rem" },
                                { name: "64px", class: "w-16", value: "4rem" },
                            ].map((space) => (
                                <div key={space.name} className="flex items-center gap-4">
                                    <div className={`${space.class} h-8 bg-yellow-500 rounded`} />
                                    <span className="text-sm font-mono text-zinc-400 w-20">{space.name}</span>
                                    <span className="text-xs text-zinc-500">{space.value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>

                {/* Colors Section */}
                <section className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight">Paleta de Cores</h2>
                        <p className="text-zinc-400 mt-2">
                            Cores do tema Industrial - Mantidas do tailwind.config.js
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="bg-yellow-500 border-yellow-600">
                            <CardContent className="pt-6">
                                <p className="text-zinc-900 font-bold text-lg">Primary</p>
                                <p className="text-zinc-900 text-sm font-mono">yellow-500</p>
                                <p className="text-zinc-900 text-xs font-mono mt-1">#eab308</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black border-zinc-800">
                            <CardContent className="pt-6">
                                <p className="text-white font-bold text-lg">Navigation</p>
                                <p className="text-zinc-400 text-sm font-mono">black</p>
                                <p className="text-zinc-400 text-xs font-mono mt-1">#000000</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardContent className="pt-6">
                                <p className="text-white font-bold text-lg">Background</p>
                                <p className="text-zinc-400 text-sm font-mono">zinc-900</p>
                                <p className="text-zinc-400 text-xs font-mono mt-1">#18181b</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-950 border-zinc-800">
                            <CardContent className="pt-6">
                                <p className="text-white font-bold text-lg">Surface</p>
                                <p className="text-zinc-400 text-sm font-mono">zinc-950</p>
                                <p className="text-zinc-400 text-xs font-mono mt-1">#09090b</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-800 border-zinc-700">
                            <CardContent className="pt-6">
                                <p className="text-white font-bold text-lg">Border</p>
                                <p className="text-zinc-400 text-sm font-mono">zinc-800</p>
                                <p className="text-zinc-400 text-xs font-mono mt-1">#27272a</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-green-600 border-green-700">
                            <CardContent className="pt-6">
                                <p className="text-white font-bold text-lg">Success</p>
                                <p className="text-white text-sm font-mono">green-600</p>
                                <p className="text-white text-xs font-mono mt-1">#16a34a</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Buttons Section */}
                <section className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight">Botões</h2>
                        <p className="text-zinc-400 mt-2">
                            Variações de botões com estados hover e focus
                        </p>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-3">
                                <p className="text-sm text-zinc-400 font-semibold">Primary (Yellow)</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all">
                                        <Check className="w-4 h-4" />
                                        Salvar
                                    </Button>
                                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all" size="lg">
                                        Large Button
                                    </Button>
                                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all" size="sm">
                                        Small
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-zinc-400 font-semibold">Secondary Yellow (Outline)</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="secondary-yellow" className="shadow-[0_4px_0_0_rgba(234,179,8,0.3)] active:translate-y-1 active:shadow-none transition-all">
                                        <Plus className="w-4 h-4" />
                                        Adicionar
                                    </Button>
                                    <Button variant="secondary-yellow" size="lg" className="shadow-[0_4px_0_0_rgba(234,179,8,0.3)] active:translate-y-1 active:shadow-none transition-all">
                                        Large Outline
                                    </Button>
                                    <Button variant="secondary-yellow" size="sm" className="shadow-[0_4px_0_0_rgba(234,179,8,0.3)] active:translate-y-1 active:shadow-none transition-all">
                                        Small
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-zinc-400 font-semibold">Success (Green)</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-[0_4px_0_0_#14532d] active:translate-y-1 active:shadow-none transition-all">
                                        <Check className="w-4 h-4" />
                                        Confirmar
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-zinc-400 font-semibold">Destructive (Red)</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="destructive" className="shadow-[0_4px_0_0_#7f1d1d] active:translate-y-1 active:shadow-none transition-all">
                                        <Trash2 className="w-4 h-4" />
                                        Excluir
                                    </Button>
                                    <Button variant="outline-destructive" className="shadow-[0_4px_0_0_#450a0a] active:translate-y-1 active:shadow-none transition-all">
                                        <X className="w-4 h-4" />
                                        Cancelar
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-zinc-400 font-semibold">Ghost & Outline</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button variant="ghost" className="shadow-[0_2px_0_0_#18181b] active:translate-y-0.5 active:shadow-none transition-all">
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </Button>
                                    <Button variant="outline" className="shadow-[0_4px_0_0_#18181b] active:translate-y-1 active:shadow-none transition-all">
                                        Outline
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-zinc-400 font-semibold">Icon Buttons</p>
                                <div className="flex flex-wrap gap-3">
                                    <Button size="icon" className="bg-yellow-500 hover:bg-yellow-600 text-zinc-900 shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all">
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="shadow-[0_4px_0_0_#18181b] active:translate-y-1 active:shadow-none transition-all">
                                        <Search className="w-5 h-5" />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="shadow-[0_4px_0_0_#7f1d1d] active:translate-y-1 active:shadow-none transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Inputs Section */}
                <section className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight">Campos de Entrada</h2>
                        <p className="text-zinc-400 mt-2">
                            Inputs com altura consistente (h-10) e estados visuais claros
                        </p>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-300">Nome do Produto</Label>
                                    <Input
                                        placeholder="Digite o nome..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="h-10 bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-300">Preço</Label>
                                    <Input
                                        type="text"
                                        placeholder="R$ 0,00"
                                        className="h-10 bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 font-mono tabular-nums"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-300">Com Ícone</Label>
                                    <Input
                                        icon={<Search className="w-4 h-4" />}
                                        placeholder="Buscar..."
                                        className="h-10 bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-300">Desabilitado</Label>
                                    <Input
                                        placeholder="Campo desabilitado"
                                        disabled
                                        className="h-10 bg-zinc-900 border-zinc-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-zinc-300">Observações</Label>
                                <Textarea
                                    placeholder="Digite suas observações..."
                                    value={textareaValue}
                                    onChange={(e) => setTextareaValue(e.target.value)}
                                    className="min-h-[100px] bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Cards Section */}
                <section className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight">Cards</h2>
                        <p className="text-zinc-400 mt-2">
                            Variações de cards com padding consistente (p-6) e border-radius unificado
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Simple Card */}
                        <Card className="bg-zinc-950 border-zinc-800 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Card Simples</CardTitle>
                                <CardDescription>Descrição do card</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-400">
                                    Conteúdo do card com informações relevantes.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Stat Card */}
                        <Card className="bg-zinc-950 border-zinc-800 rounded-2xl">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-zinc-400 font-medium">Vendas Hoje</p>
                                        <p className="text-3xl font-bold tabular-nums mt-2">R$ 12.450,00</p>
                                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            +12% vs ontem
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                                        <DollarSign className="w-6 h-6 text-yellow-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Interactive Card */}
                        <Card className="bg-zinc-950 border-zinc-800 rounded-2xl hover:border-yellow-500 transition-colors cursor-pointer group">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-zinc-400 font-medium">Clientes Ativos</p>
                                        <p className="text-3xl font-bold tabular-nums mt-2">1.234</p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                                        <Users className="w-6 h-6 text-yellow-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* List Card */}
                        <Card className="bg-zinc-950 border-zinc-800 rounded-2xl md:col-span-2 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Produtos em Destaque</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { name: "Shampoo Premium", price: "R$ 45,90", stock: 23 },
                                        { name: "Condicionador Hidratante", price: "R$ 38,50", stock: 15 },
                                        { name: "Máscara Capilar", price: "R$ 67,00", stock: 8 },
                                    ].map((product, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-yellow-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{product.name}</p>
                                                    <p className="text-xs text-zinc-500">Estoque: {product.stock} un.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold tabular-nums">{product.price}</p>
                                                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-yellow-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Form Example */}
                <section className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight">Formulário Completo</h2>
                        <p className="text-zinc-400 mt-2">
                            Exemplo de formulário com layout consistente e espaçamento adequado
                        </p>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800 rounded-2xl">
                        <CardHeader className="bg-black border-b border-zinc-800">
                            <CardTitle className="text-xl font-bold text-yellow-500 uppercase tracking-tight">
                                Novo Produto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-zinc-300">Nome do Produto *</Label>
                                        <Input
                                            placeholder="Ex: Shampoo Hidratante"
                                            className="h-10 bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-zinc-300">Categoria</Label>
                                        <Input
                                            placeholder="Selecione..."
                                            className="h-10 bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-zinc-300">Preço de Venda *</Label>
                                        <Input
                                            type="text"
                                            placeholder="R$ 0,00"
                                            className="h-10 bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 font-mono tabular-nums"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-zinc-300">Estoque Atual</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="h-10 bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 font-mono tabular-nums"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-zinc-300">Descrição</Label>
                                    <Textarea
                                        placeholder="Descreva o produto..."
                                        className="min-h-[100px] bg-zinc-900 border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-zinc-800">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 shadow-[0_4px_0_0_#18181b] active:translate-y-1 active:shadow-none transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                        Salvar Produto
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </section>

                {/* Border Radius Section */}
                <section className="space-y-6">
                    <div className="border-l-4 border-yellow-500 pl-4">
                        <h2 className="text-3xl font-bold tracking-tight">Border Radius</h2>
                        <p className="text-zinc-400 mt-2">
                            Escala unificada de arredondamento para consistência visual
                        </p>
                    </div>

                    <Card className="bg-zinc-950 border-zinc-800">
                        <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <div className="w-full h-20 bg-yellow-500 rounded-lg" />
                                <p className="text-sm font-mono text-zinc-400">rounded-lg (8px)</p>
                                <p className="text-xs text-zinc-500">Inputs, Buttons</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-20 bg-yellow-500 rounded-xl" />
                                <p className="text-sm font-mono text-zinc-400">rounded-xl (12px)</p>
                                <p className="text-xs text-zinc-500">Cards pequenos</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-20 bg-yellow-500 rounded-2xl" />
                                <p className="text-sm font-mono text-zinc-400">rounded-2xl (16px)</p>
                                <p className="text-xs text-zinc-500">Cards principais</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-20 bg-yellow-500 rounded-3xl" />
                                <p className="text-sm font-mono text-zinc-400">rounded-3xl (24px)</p>
                                <p className="text-xs text-zinc-500">Sheets, Drawers</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Footer */}
                <div className="border-t border-zinc-800 pt-8 pb-4">
                    <p className="text-center text-sm text-zinc-500">
                        Precifix Style Guide v2.0 - Design System Unificado
                    </p>
                    <p className="text-center text-xs text-zinc-600 mt-1">
                        Desenvolvido com foco em consistência, acessibilidade e profissionalismo
                    </p>
                </div>
            </div>
        </div>
    );
}
