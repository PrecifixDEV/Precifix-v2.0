import { useState } from "react";
import { Trash2, Search, Pencil, SlidersHorizontal, Car, Bike, Truck, Plus, Check, X, User, Phone, Mail, FileText, MapPin, Calendar, Edit, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { TablePagination } from "@/components/ui/table-pagination";
import { StandardSheet, StandardSheetToggle } from "@/components/ui/StandardSheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data for visual demonstration
const MOCK_CLIENTS = [
    {
        id: "1",
        name: "João Silva",
        document: "123.456.789-00",
        email: "joao@email.com",
        phone: "(11) 98765-4321",
        city: "São Paulo",
        state: "SP",
        vehicles: [
            { id: "v1", type: "carro", model: "Honda Civic", plate: "ABC-1234" },
            { id: "v2", type: "moto", model: "Honda CG 160", plate: "XYZ-5678" }
        ]
    },
    {
        id: "2",
        name: "Maria Santos",
        document: "987.654.321-00",
        email: "maria@email.com",
        phone: "(11) 91234-5678",
        city: "Campinas",
        state: "SP",
        vehicles: [
            { id: "v3", type: "carro", model: "Toyota Corolla", plate: "DEF-9012" }
        ]
    },
    {
        id: "3",
        name: "Pedro Oliveira",
        document: "456.789.123-00",
        email: "pedro@email.com",
        phone: "(11) 99876-5432",
        city: "Santos",
        state: "SP",
        vehicles: [
            { id: "v4", type: "caminhao", model: "Mercedes Actros", plate: "GHI-3456" },
            { id: "v5", type: "carro", model: "Fiat Uno", plate: "JKL-7890" }
        ]
    },
    {
        id: "4",
        name: "Ana Costa",
        document: "321.654.987-00",
        email: "ana@email.com",
        phone: "(11) 97654-3210",
        city: "Guarulhos",
        state: "SP",
        vehicles: []
    },
    {
        id: "5",
        name: "Carlos Mendes",
        document: "789.123.456-00",
        email: "carlos@email.com",
        phone: "(11) 96543-2109",
        city: "São Bernardo",
        state: "SP",
        vehicles: [
            { id: "v6", type: "moto", model: "Yamaha Fazer", plate: "MNO-1234" }
        ]
    }
];

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

export function Layout2Clients() {
    const [clients] = useState(MOCK_CLIENTS);
    const [filteredClients] = useState(MOCK_CLIENTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Sheet state
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Form fields
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    // Optional fields visibility
    const [showDocument, setShowDocument] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [showAddress, setShowAddress] = useState(false);
    const [showBirthDate, setShowBirthDate] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    // Optional fields values
    const [cpfCnpj, setCpfCnpj] = useState("");
    const [email, setEmail] = useState("");
    const [cep, setCep] = useState("");
    const [street, setStreet] = useState("");
    const [number, setNumber] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [notes, setNotes] = useState("");

    // Pagination
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Selection Helpers
    const toggleSelectAll = () => {
        if (selectedClients.length === filteredClients.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(filteredClients.map(c => c.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedClients.includes(id)) {
            setSelectedClients(selectedClients.filter(cid => cid !== id));
        } else {
            setSelectedClients([...selectedClients, id]);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-foreground p-4 md:p-8 space-y-8 pb-32">
            {/* Header */}
            <header className="space-y-4 border-b border-zinc-800 pb-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold uppercase tracking-tight text-white">
                            Clientes
                        </h1>
                    </div>
                    <Button
                        onClick={() => setIsSheetOpen(true)}
                        className="h-12 px-6 bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold uppercase tracking-tight shadow-[0_4px_0_0_#927c00] active:translate-y-1 active:shadow-none transition-all rounded-xl gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Novo Cliente
                    </Button>
                </div>
                <p className="text-zinc-400 max-w-2xl text-sm font-normal leading-relaxed">
                    Gerencie sua base de clientes com veículos vinculados e histórico completo.
                </p>
            </header>

            {/* Search and Filters */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10" />
                        <Input
                            placeholder="Pesquisar por nome, CPF, telefone ou cidade..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 pl-10 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-100 placeholder:text-zinc-600 rounded-xl font-normal"
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        title="Filtrar"
                        className="h-12 w-12 shrink-0 bg-zinc-900 border-2 border-zinc-800 text-white shadow-[0_4px_0_0_#18181b] active:translate-y-1 active:shadow-none transition-all rounded-xl"
                    >
                        <SlidersHorizontal className="h-5 w-5" />
                    </Button>

                    {/* Bulk Actions */}
                    {selectedClients.length > 0 && (
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-5">
                            <Button
                                variant="outline-destructive"
                                size="icon"
                                title="Excluir Selecionados"
                                className="h-12 w-12 rounded-xl bg-zinc-900 border-2 border-red-500/50 text-red-500 shadow-[0_4px_0_0_#450a0a] active:translate-y-1 active:shadow-none transition-all"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Select All */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={toggleSelectAll}>
                    <Checkbox
                        checked={filteredClients.length > 0 && selectedClients.length === filteredClients.length}
                        onCheckedChange={toggleSelectAll}
                        className="h-5 w-5"
                    />
                    <span className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                        Selecionar Todos ({filteredClients.length})
                    </span>
                </div>
            </div>

            {/* Table Card */}
            <Card className="bg-zinc-900 border-zinc-800 rounded-2xl shadow-2xl">
                <CardContent className="p-6">
                    <div className="rounded-xl border-2 border-zinc-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-800/50">
                                <TableRow className="border-zinc-700 hover:bg-transparent">
                                    <TableHead className="w-[50px] text-center">
                                        <Checkbox
                                            checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                            className="h-5 w-5"
                                        />
                                    </TableHead>
                                    <TableHead className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Nome</TableHead>
                                    <TableHead className="text-zinc-400 uppercase tracking-widest text-xs font-bold">CPF/CNPJ</TableHead>
                                    <TableHead className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Cidade/UF</TableHead>
                                    <TableHead className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Telefone</TableHead>
                                    <TableHead className="text-zinc-400 uppercase tracking-widest text-xs font-bold">Veículos</TableHead>
                                    <TableHead className="w-[120px] text-right text-zinc-400 uppercase tracking-widest text-xs font-bold">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedClients.map((client) => {
                                    const vehicleCounts = { carro: 0, moto: 0, caminhao: 0 };
                                    client.vehicles?.forEach(v => {
                                        const type = v.type as keyof typeof vehicleCounts || 'carro';
                                        if (vehicleCounts[type] !== undefined) vehicleCounts[type]++;
                                        else vehicleCounts['carro']++;
                                    });

                                    return (
                                        <TableRow
                                            key={client.id}
                                            className="border-zinc-800 hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                        >
                                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedClients.includes(client.id)}
                                                    onCheckedChange={() => toggleSelect(client.id)}
                                                    className="h-5 w-5"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-zinc-700">
                                                        <AvatarImage src={undefined} alt={client.name} />
                                                        <AvatarFallback className="bg-yellow-500 text-zinc-900 font-bold text-sm">
                                                            {getInitials(client.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-white font-bold text-base">{client.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-zinc-400 font-mono tabular-nums text-sm">{client.document || "-"}</TableCell>
                                            <TableCell className="text-zinc-300 text-sm">{client.city ? `${client.city}/${client.state}` : "-"}</TableCell>
                                            <TableCell className="text-zinc-300 font-mono tabular-nums text-sm">{client.phone || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {vehicleCounts.carro > 0 && (
                                                        <div className="flex items-center text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-lg border border-zinc-700 font-bold gap-1">
                                                            <Car className="w-3.5 h-3.5" />
                                                            <span className="font-mono tabular-nums">{vehicleCounts.carro}</span>
                                                        </div>
                                                    )}
                                                    {vehicleCounts.moto > 0 && (
                                                        <div className="flex items-center text-xs bg-orange-950/30 text-orange-400 px-2 py-1 rounded-lg border border-orange-900/30 font-bold gap-1">
                                                            <Bike className="w-3.5 h-3.5" />
                                                            <span className="font-mono tabular-nums">{vehicleCounts.moto}</span>
                                                        </div>
                                                    )}
                                                    {vehicleCounts.caminhao > 0 && (
                                                        <div className="flex items-center text-xs bg-green-950/30 text-green-400 px-2 py-1 rounded-lg border border-green-900/30 font-bold gap-1">
                                                            <Truck className="w-3.5 h-3.5" />
                                                            <span className="font-mono tabular-nums">{vehicleCounts.caminhao}</span>
                                                        </div>
                                                    )}
                                                    {client.vehicles?.length === 0 && <span className="text-zinc-600 text-sm">-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-10 w-10 rounded-xl bg-zinc-900 border-2 border-zinc-800 text-white shadow-[0_4px_0_0_#18181b] active:translate-y-1 active:shadow-none transition-all hover:border-yellow-500 hover:text-yellow-500"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline-destructive"
                                                        size="icon"
                                                        className="h-10 w-10 rounded-xl bg-zinc-900 border-2 border-red-500/50 text-red-500 shadow-[0_4px_0_0_#450a0a] active:translate-y-1 active:shadow-none transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredClients.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </CardContent>
            </Card>

            {/* Client Form Sheet */}
            <StandardSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                title="NOVO CLIENTE"
                onSave={() => console.log("Save client")}
                saveLabel="CADASTRAR CLIENTE"
                optionalFieldsToggles={
                    <>
                        <StandardSheetToggle
                            label="Documento"
                            active={showDocument}
                            onClick={() => setShowDocument(!showDocument)}
                            icon={<FileText className="h-4 w-4" />}
                        />
                        <StandardSheetToggle
                            label="Email"
                            active={showEmail}
                            onClick={() => setShowEmail(!showEmail)}
                            icon={<Mail className="h-4 w-4" />}
                        />
                        <StandardSheetToggle
                            label="Endereço"
                            active={showAddress}
                            onClick={() => setShowAddress(!showAddress)}
                            icon={<MapPin className="h-4 w-4" />}
                        />
                        <StandardSheetToggle
                            label="Nascimento"
                            active={showBirthDate}
                            onClick={() => setShowBirthDate(!showBirthDate)}
                            icon={<Calendar className="h-4 w-4" />}
                        />
                        <StandardSheetToggle
                            label="Observações"
                            active={showNotes}
                            onClick={() => setShowNotes(!showNotes)}
                            icon={<Edit className="h-4 w-4" />}
                        />
                    </>
                }
            >
                <div className="space-y-6">
                    {/* Mandatory Fields */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-9 h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl placeholder:text-zinc-600"
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    id="whatsapp"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    className="pl-9 h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl font-mono tabular-nums placeholder:text-zinc-600"
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="space-y-4">
                        {showDocument && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                                <Label>CPF / CNPJ</Label>
                                <Input
                                    value={cpfCnpj}
                                    onChange={(e) => setCpfCnpj(e.target.value)}
                                    className="h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl font-mono tabular-nums placeholder:text-zinc-600"
                                    placeholder="000.000.000-00"
                                    maxLength={18}
                                />
                            </div>
                        )}

                        {showEmail && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                                <Label>Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-9 h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl placeholder:text-zinc-600"
                                        placeholder="cliente@email.com"
                                    />
                                </div>
                            </div>
                        )}

                        {showAddress && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-3 p-6 bg-zinc-900/50 rounded-2xl border-2 border-zinc-800">
                                <div className="space-y-2">
                                    <Label>CEP</Label>
                                    <Input
                                        value={cep}
                                        onChange={(e) => setCep(e.target.value)}
                                        className="h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl font-mono tabular-nums placeholder:text-zinc-600"
                                        placeholder="00000-000"
                                        maxLength={9}
                                    />
                                </div>
                                <div className="grid grid-cols-[2fr_1fr] gap-3">
                                    <div className="space-y-2">
                                        <Label>Rua</Label>
                                        <Input
                                            value={street}
                                            onChange={(e) => setStreet(e.target.value)}
                                            className="h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Número</Label>
                                        <Input
                                            value={number}
                                            onChange={(e) => setNumber(e.target.value)}
                                            className="h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Bairro</Label>
                                    <Input
                                        value={neighborhood}
                                        onChange={(e) => setNeighborhood(e.target.value)}
                                        className="h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl placeholder:text-zinc-600"
                                    />
                                </div>
                                <div className="grid grid-cols-[2fr_1fr] gap-3">
                                    <div className="space-y-2">
                                        <Label>Cidade</Label>
                                        <Input
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>UF</Label>
                                        <Input
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="h-12 bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl uppercase placeholder:text-zinc-600"
                                            maxLength={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {showNotes && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                                <Label>Observações</Label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="bg-zinc-950 border-2 border-zinc-800 focus:border-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl min-h-[100px] placeholder:text-zinc-600"
                                    placeholder="Informações adicionais..."
                                />
                            </div>
                        )}
                    </div>
                </div>
            </StandardSheet>
        </div>
    );
}
