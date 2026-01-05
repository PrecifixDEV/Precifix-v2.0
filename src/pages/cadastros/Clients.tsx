import { useEffect, useState } from "react";
import { Plus, Trash2, Search, User, Pencil, Printer, Filter, Car, Bike, Truck, Info, MoreVertical } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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

export const Clients = () => {
    const [clients, setClients] = useState<ClientWithVehicles[]>([]);
    const [filteredClients, setFilteredClients] = useState<ClientWithVehicles[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all">("all");
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<ClientWithVehicles | null>(null);
    const [clientToDelete, setClientToDelete] = useState<ClientWithVehicles | null>(null);
    const [clientToView, setClientToView] = useState<ClientWithVehicles | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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
        try {
            const data = await clientsService.getClients();
            setClients(data || []);
            setFilteredClients(data || []);
        } catch (error) {
            console.error("Error loading clients:", error);
            toast.error("Erro ao carregar clientes.");
        }
    };

    const handleEdit = (client: ClientWithVehicles) => {
        setClientToEdit(client);
        setIsDialogOpen(true);
    };

    const handleView = (client: ClientWithVehicles) => {
        setClientToView(client);
        setIsSheetOpen(true);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clientes</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie seus clientes</p>
                </div>
                <Button onClick={handleCreate} size="icon" className="md:hidden h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <div className="md:hidden flex items-center justify-center mr-1">
                                <Checkbox
                                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" title="Filtrar" className={filterType !== 'all' ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900 border-yellow-500' : ''}>
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel>Filtrar:</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setFilterType('all')} className={filterType === 'all' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 font-medium' : ''}>
                                        Todos
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className={`relative flex-1 transition-all duration-300 ${isSearchFocused ? 'w-full' : 'w-auto'}`}>
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar clientes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                />
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 ${isSearchFocused ? 'hidden md:flex' : 'flex'}`}>
                            {selectedClients.length > 0 && (
                                <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-5">
                                    <Button variant="outline" size="icon" onClick={handleBulkPrint} title="Imprimir Selecionados">
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => setClientToDelete({ id: 'bulk' } as any)} title="Excluir Selecionados">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <Button onClick={handleCreate} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 hidden md:flex">
                                <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    {filteredClients.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhum cliente encontrado.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View - List */}
                            <div className="md:hidden flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredClients.map((client) => {
                                    const vehicleCounts = { carro: 0, moto: 0, caminhao: 0 };
                                    client.vehicles?.forEach(v => {
                                        const type = v.type as keyof typeof vehicleCounts || 'carro';
                                        if (vehicleCounts[type] !== undefined) vehicleCounts[type]++;
                                        else vehicleCounts['carro']++;
                                    });

                                    return (
                                        <div key={client.id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <Checkbox
                                                checked={selectedClients.includes(client.id)}
                                                onCheckedChange={() => toggleSelect(client.id)}
                                                className="mt-1"
                                            />
                                            <div className="flex-1 grid grid-cols-1 gap-1 text-sm">
                                                <div className="font-bold text-base">{client.name}</div>
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
                                                    className="flex items-center gap-1 mt-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1 -ml-1 rounded transition-colors"
                                                    onClick={() => handleView(client)}
                                                >
                                                    <span className="font-bold mr-1">Veículos:</span>
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {vehicleCounts.carro > 0 && (
                                                            <div className="flex items-center text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                                <Car className="w-3 h-3 mr-1" /> {vehicleCounts.carro}
                                                            </div>
                                                        )}
                                                        {vehicleCounts.moto > 0 && (
                                                            <div className="flex items-center text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                                                <Bike className="w-3 h-3 mr-1" /> {vehicleCounts.moto}
                                                            </div>
                                                        )}
                                                        {vehicleCounts.caminhao > 0 && (
                                                            <div className="flex items-center text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                                <Truck className="w-3 h-3 mr-1" /> {vehicleCounts.caminhao}
                                                            </div>
                                                        )}
                                                        {client.vehicles?.length === 0 && <span className="text-muted-foreground">-</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleView(client)}>
                                                        <Info className="mr-2 h-4 w-4" /> Detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(client)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setClientToDelete(client)} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop View - Table */}
                            <div className="hidden md:block rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                        <TableRow>
                                            <TableHead className="w-[50px] text-center">
                                                <Checkbox
                                                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                                                    onCheckedChange={toggleSelectAll}
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
                                        {filteredClients.map((client) => (
                                            <TableRow key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <TableCell className="text-center">
                                                    <Checkbox
                                                        checked={selectedClients.includes(client.id)}
                                                        onCheckedChange={() => toggleSelect(client.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{client.name}</TableCell>
                                                <TableCell className="text-slate-500">{client.document || "-"}</TableCell>
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
                                                                    {counts.carro > 0 && <div className="flex items-center text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded"><Car className="w-3 h-3 mr-1" /> {counts.carro}</div>}
                                                                    {counts.moto > 0 && <div className="flex items-center text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded"><Bike className="w-3 h-3 mr-1" /> {counts.moto}</div>}
                                                                    {counts.caminhao > 0 && <div className="flex items-center text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded"><Truck className="w-3 h-3 mr-1" /> {counts.caminhao}</div>}
                                                                    {client.vehicles?.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleView(client)} className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleEdit(client)}
                                                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
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

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Detalhes do Cliente</SheetTitle>
                        <SheetDescription>Informações completas e veículos cadastrados.</SheetDescription>
                    </SheetHeader>

                    {clientToView && (
                        <div className="space-y-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{clientToView.name}</h3>
                                        <p className="text-sm text-muted-foreground">{clientToView.email || "Sem email"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs font-medium uppercase">Telefone</p>
                                        <p>{clientToView.phone || "-"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs font-medium uppercase">CPF/CNPJ</p>
                                        <p>{clientToView.document || "-"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs font-medium uppercase">Cidade/UF</p>
                                        <p>{clientToView.city ? `${clientToView.city}/${clientToView.state}` : "-"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs font-medium uppercase">Endereço</p>
                                        <p className="truncate" title={clientToView.address || ""}>{clientToView.address ? `${clientToView.address}, ${clientToView.number}` : "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Vehicles */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold flex items-center gap-2">
                                        <Car className="w-4 h-4" /> Veículos Cadastrados
                                    </h4>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        {clientToView.vehicles?.length || 0} Total
                                    </span>
                                </div>

                                {clientToView.vehicles && clientToView.vehicles.length > 0 ? (
                                    <div className="grid gap-3">
                                        {clientToView.vehicles.map(v => (
                                            <div key={v.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-start gap-3">
                                                <div className="mt-1 p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                                    {v.type === 'moto' ? <Bike className="w-4 h-4 text-slate-600 dark:text-slate-400" /> :
                                                        v.type === 'caminhao' ? <Truck className="w-4 h-4 text-slate-600 dark:text-slate-400" /> :
                                                            <Car className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-medium text-sm truncate">{v.model}</h5>
                                                    <p className="text-xs text-muted-foreground">{v.brand} • {v.year}</p>
                                                    <div className="flex gap-2 mt-1.5">
                                                        <span className="text-[10px] bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border font-mono uppercase">{v.plate || 'S/ Placa'}</span>
                                                        {v.color && <span className="text-[10px] bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border">{v.color}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
                                        <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Nenhum veículo cadastrado.</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Stats or Actions */}
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="w-full" onClick={() => {
                                    handleEdit(clientToView);
                                    setIsSheetOpen(false);
                                }}>
                                    <Pencil className="w-4 h-4 mr-2" /> Editar Cliente
                                </Button>
                                {/* Future: View History or Financials */}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
