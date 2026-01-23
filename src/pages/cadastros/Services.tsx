import { useEffect, useState } from "react";
import { Trash2, Search, CarFront, Info, Pencil, MoreHorizontal, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
import { Printer, SlidersHorizontal, Plus } from "lucide-react";

import { ServiceFormDialog } from "./ServiceFormDialog";
import { ServiceAnalysisSheet } from "./ServiceAnalysisSheet";
import { servicesService } from "@/services/servicesService";
import type { Service, ServiceWithProductCount } from "@/services/servicesService";
import { SERVICE_ICONS } from "@/components/services/ServiceIconSelector";
import { TablePagination } from "@/components/ui/table-pagination";
import { Skeleton } from "@/components/ui/skeleton";

export const Services = () => {
    const [services, setServices] = useState<ServiceWithProductCount[]>([]);
    const [filteredServices, setFilteredServices] = useState<ServiceWithProductCount[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all">("all");
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [selectedServiceForProducts, setSelectedServiceForProducts] = useState<ServiceWithProductCount | null>(null);
    const [selectedServiceForAnalysis, setSelectedServiceForAnalysis] = useState<ServiceWithProductCount | null>(null);
    const [serviceProductsDetails, setServiceProductsDetails] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const [companyInfo, setCompanyInfo] = useState<{ name: string; logo: string | null; primaryColor: string }>({
        name: '',
        logo: null,
        primaryColor: '#000000'
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadServices();
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

    // ... existing useEffect for search ...

    // Updated Filter Logic
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = services.filter((s) => {
            const matchesSearch = s.name.toLowerCase().includes(term) ||
                (s.description && s.description.toLowerCase().includes(term));

            if (!matchesSearch) return false;

            // Future filters can be added here based on filterType
            if (filterType === 'all') return true;

            return true;
        });
        setFilteredServices(filtered);
    }, [searchTerm, services, filterType]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

    // Paginated services
    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedServices = filteredServices.slice(startIndex, endIndex);

    // Selection Helpers
    const toggleSelectAll = () => {
        if (selectedServices.length === filteredServices.length) {
            setSelectedServices([]);
        } else {
            setSelectedServices(filteredServices.map(s => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedServices.includes(id)) {
            setSelectedServices(selectedServices.filter(sid => sid !== id));
        } else {
            setSelectedServices([...selectedServices, id]);
        }
    };

    // Bulk Actions
    const confirmBulkDelete = async () => {
        try {
            await Promise.all(selectedServices.map(id => servicesService.deleteService(id)));

            setServices(services.filter(s => !selectedServices.includes(s.id)));
            setSelectedServices([]);
            setServiceToDelete(null);
            toast.success("Serviços excluídos com sucesso");
        } catch (error) {
            console.error("Erro ao excluir serviços:", error);
            toast.error("Erro ao excluir serviços");
        }
    };

    const handleBulkPrint = () => {
        const selected = services.filter(s => selectedServices.includes(s.id));
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Lista de Serviços</title>');
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

            printWindow.document.write('<div class="header"><h2 style="font-size: 18px; margin: 0;">Lista de Serviços</h2></div>');
            printWindow.document.write('<table><thead><tr><th>Serviço</th><th>Descrição</th><th>Duração</th><th>Preço</th></tr></thead><tbody>');
            selected.forEach(s => {
                const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.base_price || 0);
                printWindow.document.write(`<tr>
                    <td>${s.name}</td>
                    <td>${s.description || '-'}</td>
                    <td>${s.duration_minutes} min</td>
                    <td>${priceFormatted}</td>
                </tr>`);
            });
            printWindow.document.write('</tbody></table>');
            printWindow.document.write('<script>window.onload = function() { window.print(); window.close(); }</script>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
        }
    };

    const loadServices = async () => {
        setLoading(true);
        try {
            const data = await servicesService.getServices();
            setServices(data || []);
            setFilteredServices(data || []);
        } catch (error) {
            console.error("Error loading services:", error);
            toast.error("Erro ao carregar serviços.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: Service) => {
        setServiceToEdit(service);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;

        if (serviceToDelete.id === 'bulk') {
            await confirmBulkDelete();
            return;
        }

        try {
            await servicesService.deleteService(serviceToDelete.id);
            toast.success("Serviço excluído com sucesso!");
            loadServices();
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Erro ao excluir serviço.");
        } finally {
            setServiceToDelete(null);
        }
    };

    const handleCreate = () => {
        setServiceToEdit(null);
        setIsDialogOpen(true);
    };

    const handleDialogSuccess = () => {
        loadServices();
    };

    const handleShowProducts = async (service: ServiceWithProductCount) => {
        setSelectedServiceForProducts(service);
        setIsLoadingProducts(true);
        try {
            const products = await servicesService.getServiceProducts(service.id);
            setServiceProductsDetails(products || []);
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Erro ao carregar produtos do serviço.");
        } finally {
            setIsLoadingProducts(false);
        }
    };


    return (
        <div className="space-y-6 pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="hidden md:block">
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Serviços</h1>
                    <p className="text-zinc-400">Gerencie os serviços oferecidos</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="w-full md:w-auto h-10 bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold uppercase tracking-tight gap-2"
                >
                    <Plus className="h-5 w-5" />
                    NOVO SERVIÇO
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                        <Input
                            placeholder="Buscar serviços..."
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
                        {selectedServices.length > 0 && (
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
                                    onClick={() => setServiceToDelete({ id: 'bulk' } as any)}
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
                            checked={filteredServices.length > 0 && selectedServices.length === filteredServices.length}
                            onCheckedChange={toggleSelectAll}
                            className="h-5 w-5"
                        />
                        <span className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                            Selecionar Todos
                        </span>
                    </div>

                    {/* Mobile Bulk Actions */}
                    <div className="md:hidden flex items-center gap-2">
                        {selectedServices.length > 0 && (
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
                                    onClick={() => setServiceToDelete({ id: 'bulk' } as any)}
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
                            {/* Mobile Skeletons */}
                            <div className="md:hidden flex flex-col divide-zinc-800">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="px-6 py-4 flex flex-col border-b border-zinc-800 last:border-0 gap-3">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-5 w-5 rounded" />
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                        <div className="space-y-1 mt-2">
                                            <Skeleton className="h-3 w-1/4" />
                                            <Skeleton className="h-3 w-1/3" />
                                            <Skeleton className="h-3 w-1/5 mt-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Desktop Skeletons */}
                            <div className="hidden md:block rounded-md border border-zinc-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-zinc-800/50">
                                        <TableRow>
                                            <TableHead className="w-[50px] text-center"></TableHead>
                                            <TableHead className="w-[80px] text-center"></TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-center">Vendas</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                            <TableHead className="text-center">Produtos</TableHead>
                                            <TableHead className="text-center">Duração</TableHead>
                                            <TableHead className="text-right">Preço</TableHead>
                                            <TableHead className="w-[100px] text-right"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i} className="border-zinc-800">
                                                <TableCell className="text-center"><Skeleton className="h-5 w-5 mx-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-10 w-10 rounded-full mx-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-10 mx-auto rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24 mx-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                                <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    ) : filteredServices.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhum serviço encontrado.
                        </div>
                    ) : (
                        <>
                            {/* Mobile List View */}
                            <div className="md:hidden flex flex-col divide-zinc-800">
                                {paginatedServices.map((service) => {
                                    const IconComponent = service.icon && SERVICE_ICONS[service.icon] ? SERVICE_ICONS[service.icon] : CarFront;
                                    return (
                                        <div key={service.id} className="px-6 py-4 flex flex-col hover:bg-zinc-900/50 transition-colors border-b border-zinc-800 last:border-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <Checkbox
                                                        checked={selectedServices.includes(service.id)}
                                                        onCheckedChange={() => toggleSelect(service.id)}
                                                        className="h-5 w-5"
                                                    />

                                                    <div className="relative w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <IconComponent className="h-5 w-5" />
                                                    </div>

                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <h3 className="font-bold text-sm text-white line-clamp-2">
                                                            {service.name}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                                            {service.description || "Sem descrição"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-400">
                                                            <span className="sr-only">Abrir menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setSelectedServiceForAnalysis(service)}>
                                                            <TrendingUp className="mr-2 h-4 w-4" />
                                                            Análise
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleShowProducts(service)}>
                                                            <Info className="mr-2 h-4 w-4" />
                                                            Ver Produtos
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setServiceToDelete(service)}
                                                            className="text-red-500 focus:text-red-500 focus:bg-red-900/20"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="pl-0 text-xs text-muted-foreground">
                                                <div onClick={() => handleEdit(service)} className="cursor-pointer space-y-1">
                                                    <div className="font-medium text-zinc-200">
                                                        Preço: R$ {(service.base_price || 0).toFixed(2)}
                                                    </div>
                                                    <div>Duração: {service.duration_minutes} min</div>
                                                    <div
                                                        className="flex items-center gap-1 mt-1 font-medium text-muted-foreground hover:text-primary transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShowProducts(service);
                                                        }}
                                                    >
                                                        {service.service_products?.length || 0} {service.service_products?.length === 1 ? 'Produto' : 'Produtos'}
                                                        <Info className="h-3 w-3" />
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
                                                    checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                    className="h-5 w-5"
                                                />
                                            </TableHead>
                                            <TableHead className="w-[80px] text-center">Ícone</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-center">Qtd. Vendas</TableHead>
                                            <TableHead className="text-right">Total Vendido</TableHead>
                                            <TableHead className="text-center">Produtos</TableHead>
                                            <TableHead className="text-center">Duração</TableHead>
                                            <TableHead className="text-right">Preço</TableHead>
                                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedServices.map((service) => {
                                            const IconComponent = service.icon && SERVICE_ICONS[service.icon] ? SERVICE_ICONS[service.icon] : CarFront;
                                            return (
                                                <TableRow key={service.id} className="hover:bg-zinc-800/50 cursor-pointer" onClick={() => handleEdit(service)}>
                                                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                        <Checkbox
                                                            checked={selectedServices.includes(service.id)}
                                                            onCheckedChange={() => toggleSelect(service.id)}
                                                            className="h-5 w-5"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                                                            <IconComponent className="w-5 h-5" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{service.name}</TableCell>
                                                    <TableCell className="text-zinc-500 max-w-[200px] truncate" title={service.description || ""}>
                                                        {service.description || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-zinc-800 text-xs font-medium">
                                                            {service.total_sales_count || 0}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium text-zinc-300">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.total_sales_value || 0)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span>{service.service_products?.length || 0} {service.service_products?.length === 1 ? 'Produto' : 'Produtos'}</span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleShowProducts(service)}
                                                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                            >
                                                                <Info className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">{service.duration_minutes} min</TableCell>
                                                    <TableCell className="text-right">R$ {(service.base_price || 0).toFixed(2)}</TableCell>
                                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => handleEdit(service)}>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setSelectedServiceForAnalysis(service)}>
                                                                    <TrendingUp className="mr-2 h-4 w-4" />
                                                                    Análise
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleShowProducts(service)}>
                                                                    <Info className="mr-2 h-4 w-4" />
                                                                    Ver Produtos
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setServiceToDelete(service)}
                                                                    className="text-destructive focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Excluir
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination - Moved to end for proper mobile positioning */}
                            <TablePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={filteredServices.length}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={setItemsPerPage}
                            />
                        </>
                    )}

                </CardContent>
            </Card>

            <ServiceFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                serviceToEdit={serviceToEdit}
                onSuccess={handleDialogSuccess}
            />

            <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {serviceToDelete?.id === 'bulk' ? 'Excluir Serviços Selecionados' : 'Excluir Serviço'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {serviceToDelete?.id === 'bulk'
                                ? `Tem certeza que deseja excluir os ${selectedServices.length} serviços selecionados? Esta ação não pode ser desfeita.`
                                : `Tem certeza que deseja excluir o serviço "${serviceToDelete?.name}"? Esta ação não pode ser desfeita.`
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

            <Sheet open={!!selectedServiceForProducts} onOpenChange={(open) => !open && setSelectedServiceForProducts(null)}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Produtos Utilizados</SheetTitle>
                        <SheetDescription>
                            Lista de produtos vinculados ao serviço {selectedServiceForProducts?.name}.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        {isLoadingProducts ? (
                            <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                        ) : serviceProductsDetails.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">Nenhum produto vinculado.</div>
                        ) : (
                            <div className="space-y-4">
                                {serviceProductsDetails.map((sp) => (
                                    <div key={sp.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{sp.products?.name}</p>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                <p>Quantidade: {sp.quantity}</p>
                                                {sp.dilution_ratio && <p>Diluição: {sp.dilution_ratio}</p>}
                                                {sp.container_size_ml && <p>Recipiente: {sp.container_size_ml}ml</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <ServiceAnalysisSheet
                open={!!selectedServiceForAnalysis}
                onOpenChange={(open) => !open && setSelectedServiceForAnalysis(null)}
                service={selectedServiceForAnalysis}
            />
        </div>
    );
};
