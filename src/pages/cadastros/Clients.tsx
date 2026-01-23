import { useEffect, useState } from "react";
import { Trash2, Search, Pencil, Printer, SlidersHorizontal, Car, Bike, Truck, MoreVertical, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,

} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

import { ClientFormDialog } from "./ClientFormDialog";
import { clientsService } from "@/services/clientsService";
import type { ClientWithVehicles } from "@/services/clientsService";
import { TablePagination } from "@/components/ui/table-pagination";
import { Skeleton } from "@/components/ui/skeleton";

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

export const Clients = () => {
    const [clients, setClients] = useState<ClientWithVehicles[]>([]);
    const [filteredClients, setFilteredClients] = useState<ClientWithVehicles[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all">("all");
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<ClientWithVehicles | null>(null);
    const [clientToDelete, setClientToDelete] = useState<ClientWithVehicles | null>(null);


    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [companyInfo, setCompanyInfo] = useState<{ name: string; logo: string | null; primaryColor: string }>({
        name: '',
        logo: null,
        primaryColor: '#000000'
    });

    useEffect(() => {
        loadClients();
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('company_name, company_logo_url, company_colors')
                .eq('id', user.id)
                .single();

            if (data) {
                const colors = data.company_colors as any;
                setCompanyInfo({
                    name: data.company_name || 'Minha Empresa',
                    logo: data.company_logo_url,
                    primaryColor: colors?.primary || '#000000'
                });
            }
        }
    };

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = clients.filter((c) => {
            const matchesSearch = c.name.toLowerCase().includes(term) ||
                (c.email && c.email.toLowerCase().includes(term)) ||
                (c.phone && c.phone.includes(term)) ||
                (c.city && c.city.toLowerCase().includes(term));

            if (!matchesSearch) return false;
            if (filterType === 'all') return true;

            return true;
        });
        setFilteredClients(filtered);
    }, [searchTerm, clients, filterType]);

    // Paginated clients
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

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

    // Bulk Actions
    const confirmBulkDelete = async () => {
        try {
            await Promise.all(selectedClients.map(id => clientsService.deleteClient(id)));
            setClients(clients.filter(c => !selectedClients.includes(c.id)));
            setSelectedClients([]);
            setClientToDelete(null);
            toast.success("Clientes excluídos com sucesso");
        } catch (error) {
            console.error("Erro ao excluir clientes:", error);
            toast.error("Erro ao excluir clientes");
        }
    };

    const handleBulkPrint = () => {
        const selected = clients.filter(c => selectedClients.includes(c.id));
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Lista de Clientes</title>');
            printWindow.document.write('<style>');
            printWindow.document.write('body { font-family: sans-serif; padding: 20px; }');
            printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
            printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
            printWindow.document.write('th { background-color: #f2f2f2; }');
            printWindow.document.write('.header { text-align: center; margin-bottom: 20px; }');
            printWindow.document.write('</style>');
            printWindow.document.write('</head><body>');

            // Header with Company Info
            printWindow.document.write(`
                <div style="padding: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    ${companyInfo.logo ? `<img src="${companyInfo.logo}" style="height: 50px; margin-right: 15px; object-fit: contain;" />` : ''}
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: black;">${companyInfo.name}</h1>
                </div>
            `);

            printWindow.document.write('<div class="header"><h2 style="font-size: 18px; margin: 0;">Lista de Clientes</h2></div>');
            printWindow.document.write('<table><thead><tr><th>Nome</th><th>CPF/CNPJ</th><th>Cidade/UF</th><th>Telefone</th><th>Veículos</th></tr></thead><tbody>');
            selected.forEach(c => {
                const vehicleSummary = c.vehicles?.length
                    ? c.vehicles.map(v => `${v.model} (${v.plate || 'S/ Placa'})`).join(', ')
                    : '-';

                printWindow.document.write(`<tr>
                    <td>${c.name}</td>
                    <td>${c.document || '-'}</td>
                    <td>${c.city ? `${c.city}/${c.state}` : '-'}</td>
                    <td>${c.phone || '-'}</td>
                    <td>${vehicleSummary}</td>
                </tr>`);
            });
            printWindow.document.write('</tbody></table>');
            printWindow.document.write('<script>window.onload = function() { window.print(); window.close(); }</script>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
        }
    };

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await clientsService.getClients();
            setClients(data || []);
            setFilteredClients(data || []);
        } catch (error) {
            console.error("Error loading clients:", error);
            toast.error("Erro ao carregar clientes.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (client: ClientWithVehicles) => {
        setClientToEdit(client);
        setIsDialogOpen(true);
    };



    const handleDelete = async () => {
        if (!clientToDelete) return;

        if (clientToDelete.id === 'bulk') {
            await confirmBulkDelete();
            return;
        }

        try {
            await clientsService.deleteClient(clientToDelete.id);
            toast.success("Cliente excluído com sucesso!");
            loadClients();
        } catch (error) {
            console.error("Error deleting client:", error);
            toast.error("Erro ao excluir cliente.");
        } finally {
            setClientToDelete(null);
        }
    };

    const handleCreate = () => {
        setClientToEdit(null);
        setIsDialogOpen(true);
    };

    const handleDialogSuccess = () => {
        loadClients();
    };

    return (
        <div className="space-y-6 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="hidden md:block">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Clientes</h1>
                    <p className="text-zinc-400">Gerencie seus clientes</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="w-full md:w-auto h-10 bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold uppercase tracking-tight gap-2"
                >
                    <Plus className="h-5 w-5" />
                    NOVO CLIENTE
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                        <Input
                            placeholder="Buscar clientes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 pl-10 bg-zinc-900 border-zinc-800 text-sm placeholder:text-zinc-400 w-full"
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                title="Filtrar"
                                className={`h-10 w-10 shrink-0 bg-zinc-900 border-zinc-800 transition-colors ${filterType !== 'all' ? 'bg-yellow-500 hover:bg-yellow-600 text-zinc-900 border-yellow-500' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <SlidersHorizontal className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="uppercase tracking-tighter font-bold">Filtrar por:</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setFilterType('all')}
                                className={filterType === 'all' ? 'bg-yellow-500 dark:bg-yellow-500 text-zinc-900 dark:text-zinc-900 font-bold' : ''}
                            >
                                TODOS
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Desktop Bulk Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        {selectedClients.length > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleBulkPrint}
                                    title="Imprimir Selecionados"
                                    className="h-10 w-10 bg-zinc-900 border-zinc-800"
                                >
                                    <Printer className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setClientToDelete({ id: 'bulk' } as any)}
                                    title="Excluir Selecionados"
                                    className="h-10 w-10"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between w-full h-10">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={toggleSelectAll}>
                        <Checkbox
                            checked={filteredClients.length > 0 && selectedClients.length === filteredClients.length}
                            onCheckedChange={toggleSelectAll}
                            className="h-5 w-5"
                        />
                        <span className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                            Selecionar Todos
                        </span>
                    </div>

                    {/* Mobile Bulk Actions */}
                    <div className="md:hidden flex items-center gap-2">
                        {selectedClients.length > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleBulkPrint}
                                    title="Imprimir Selecionados"
                                    className="h-10 w-10 bg-zinc-900 border-zinc-800"
                                >
                                    <Printer className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => setClientToDelete({ id: 'bulk' } as any)}
                                    title="Excluir Selecionados"
                                    className="h-10 w-10"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Card className="border-zinc-800 bg-zinc-900">
                <CardContent className="p-0 md:p-6">
                    {loading ? (
                        <>
                            {/* Mobile View Skeleton */}
                            <div className="md:hidden flex flex-col divide-zinc-800">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="px-6 py-4 flex flex-col border-b border-zinc-800 last:border-0 gap-3">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-5 w-5 rounded" />
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 pl-0">
                                            <Skeleton className="h-3 w-1/2" />
                                            <Skeleton className="h-3 w-1/3" />
                                            <Skeleton className="h-3 w-1/4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Desktop View Skeleton */}
                            <div className="hidden md:block rounded-md border border-zinc-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-zinc-800/50">
                                        <TableRow>
                                            <TableHead className="w-[50px] text-center"></TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>CPF/CNPJ</TableHead>
                                            <TableHead>Cidade/UF</TableHead>
                                            <TableHead>Telefone</TableHead>
                                            <TableHead>Veículos</TableHead>
                                            <TableHead className="w-[100px] text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i} className="border-zinc-800">
                                                <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                        <Skeleton className="h-4 w-32" />
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 text-xs">
                                                        <Skeleton className="h-6 w-12 rounded" />
                                                        <Skeleton className="h-6 w-12 rounded" />
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-8 w-16 ml-auto rounded-md" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhum cliente encontrado.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View - List */}
                            <div className="md:hidden flex flex-col divide-zinc-800">
                                {paginatedClients.map((client) => {
                                    const vehicleCounts = { carro: 0, moto: 0, caminhao: 0 };
                                    client.vehicles?.forEach(v => {
                                        const type = v.type as keyof typeof vehicleCounts || 'carro';
                                        if (vehicleCounts[type] !== undefined) vehicleCounts[type]++;
                                        else vehicleCounts['carro']++;
                                    });

                                    return (
                                        <div key={client.id}>
                                            <div
                                                className="px-6 py-4 hover:bg-zinc-900/50 transition-colors border-b border-zinc-800 last:border-0 cursor-pointer"
                                                onClick={() => handleEdit(client)}
                                            >
                                                <div className="flex items-center justify-between gap-3 mb-2">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                checked={selectedClients.includes(client.id)}
                                                                onCheckedChange={() => toggleSelect(client.id)}
                                                                className="h-5 w-5"
                                                            />
                                                        </div>

                                                        {/* Avatar for Mobile List */}
                                                        <Avatar className="h-10 w-10 border border-zinc-700">
                                                            <AvatarImage src={undefined} alt={client.name} />
                                                            <AvatarFallback className="bg-yellow-400 text-black font-bold">
                                                                {getInitials(client.name)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="font-bold text-base truncate">{client.name}</div>
                                                    </div>

                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">

                                                                <DropdownMenuItem onClick={() => handleEdit(client)}>
                                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setClientToDelete(client)} className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-1 text-sm pl-0">
                                                    <div>
                                                        <span className="font-semibold text-xs text-muted-foreground uppercase mr-1">CPF/CNPJ:</span>
                                                        <span>{client.document || "-"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-xs text-muted-foreground uppercase mr-1">Cidade/UF:</span>
                                                        <span>{client.city ? `${client.city}/${client.state}` : "-"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-xs text-muted-foreground uppercase mr-1">Telefone:</span>
                                                        <span>{client.phone || "-"}</span>
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-1 mt-1 hover:bg-zinc-800 p-1 -ml-1 rounded transition-colors"
                                                    >
                                                        <span className="font-bold mr-1">Veículos:</span>
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {vehicleCounts.carro > 0 && (
                                                                <div className="flex items-center text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                                                                    <Car className="w-3 h-3 mr-1" /> {vehicleCounts.carro}
                                                                </div>
                                                            )}
                                                            {vehicleCounts.moto > 0 && (
                                                                <div className="flex items-center text-[10px] bg-orange-950/30 text-orange-400 px-1.5 py-0.5 rounded border border-orange-900/30">
                                                                    <Bike className="w-3 h-3 mr-1" /> {vehicleCounts.moto}
                                                                </div>
                                                            )}
                                                            {vehicleCounts.caminhao > 0 && (
                                                                <div className="flex items-center text-[10px] bg-green-950/30 text-green-400 px-1.5 py-0.5 rounded border border-green-900/30">
                                                                    <Truck className="w-3 h-3 mr-1" /> {vehicleCounts.caminhao}
                                                                </div>
                                                            )}
                                                            {client.vehicles?.length === 0 && <span className="text-muted-foreground">-</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop View - Table */}
                            <div className="hidden md:block rounded-md border border-zinc-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-zinc-800/50">
                                        <TableRow>
                                            <TableHead className="w-[50px] text-center">
                                                <Checkbox
                                                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                    className="h-5 w-5"
                                                />
                                            </TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>CPF/CNPJ</TableHead>
                                            <TableHead>Cidade/UF</TableHead>
                                            <TableHead>Telefone</TableHead>
                                            <TableHead>Veículos</TableHead>
                                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedClients.map((client) => (
                                            <TableRow
                                                key={client.id}
                                                className="hover:bg-zinc-800/50 cursor-pointer"
                                                onClick={() => handleEdit(client)}
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
                                                        {/* Avatar for Desktop Table */}
                                                        <Avatar className="h-8 w-8 border border-zinc-700">
                                                            <AvatarImage src={undefined} alt={client.name} />
                                                            <AvatarFallback className="bg-yellow-400 text-black font-bold text-xs">
                                                                {getInitials(client.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {client.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-zinc-500">{client.document || "-"}</TableCell>
                                                <TableCell>{client.city ? `${client.city}/${client.state}` : "-"}</TableCell>
                                                <TableCell>{client.phone || "-"}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const counts = { carro: 0, moto: 0, caminhao: 0 };
                                                            client.vehicles?.forEach(v => {
                                                                const type = v.type as keyof typeof counts || 'carro';
                                                                if (counts[type] !== undefined) counts[type]++;
                                                                else counts['carro']++; // Fallback
                                                            });
                                                            return (
                                                                <>
                                                                    {counts.carro > 0 && <div className="flex items-center text-xs bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700"><Car className="w-3 h-3 mr-1" /> {counts.carro}</div>}
                                                                    {counts.moto > 0 && <div className="flex items-center text-xs bg-orange-950/30 text-orange-400 px-1.5 py-0.5 rounded border border-orange-900/30"><Bike className="w-3 h-3 mr-1" /> {counts.moto}</div>}
                                                                    {counts.caminhao > 0 && <div className="flex items-center text-xs bg-green-950/30 text-green-400 px-1.5 py-0.5 rounded border border-green-900/30"><Truck className="w-3 h-3 mr-1" /> {counts.caminhao}</div>}
                                                                    {client.vehicles?.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1">

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(client)}
                                                            className="h-8 w-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setClientToDelete(client)}
                                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}

                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredClients.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </CardContent>
            </Card>

            <ClientFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                clientToEdit={clientToEdit}
                onSuccess={handleDialogSuccess}
            />

            <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {clientToDelete?.id === 'bulk' ? 'Excluir Clientes Selecionados' : 'Excluir Cliente'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {clientToDelete?.id === 'bulk'
                                ? `Tem certeza que deseja excluir os ${selectedClients.length} clientes selecionados? Esta ação não pode ser desfeita.`
                                : `Tem certeza que deseja excluir o cliente "${clientToDelete?.name}"? Esta ação não pode ser desfeita.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


        </div >
    );
};
