import { useEffect, useState } from "react";
import { Plus, Trash2, Search, CarFront, LayoutGrid, Info, Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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
import { Printer, Filter, Grid3x3 } from "lucide-react";

import { ServiceFormDialog } from "./ServiceFormDialog";
import { servicesService } from "@/services/servicesService";
import type { Service, ServiceWithProductCount } from "@/services/servicesService";
import { SERVICE_ICONS } from "@/components/services/ServiceIconSelector";

export const Services = () => {
    const [services, setServices] = useState<ServiceWithProductCount[]>([]);
    const [filteredServices, setFilteredServices] = useState<ServiceWithProductCount[]>([]);
    const [mobileViewMode, setMobileViewMode] = useState<"standard" | "compact">("standard");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all">("all");
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [selectedServiceForProducts, setSelectedServiceForProducts] = useState<ServiceWithProductCount | null>(null);
    const [serviceProductsDetails, setServiceProductsDetails] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const [companyInfo, setCompanyInfo] = useState<{ name: string; logo: string | null; primaryColor: string }>({
        name: '',
        logo: null,
        primaryColor: '#000000'
    });

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
        try {
            const data = await servicesService.getServices();
            setServices(data || []);
            setFilteredServices(data || []);
        } catch (error) {
            console.error("Error loading services:", error);
            toast.error("Erro ao carregar serviços.");
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Serviços</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie os serviços oferecidos</p>
                </div>
                <Button onClick={handleCreate} size="icon" className="md:hidden h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-4">

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
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
                                    {/* Future filters */}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className={`relative flex-1 transition-all duration-300 ${isSearchFocused ? 'w-full' : 'w-auto'}`}>
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar serviços..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                />
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 ${isSearchFocused ? 'hidden md:flex' : 'flex'}`}>
                            {selectedServices.length > 0 && (
                                <div className="flex items-center gap-2 mr-2 animate-in fade-in slide-in-from-right-5">
                                    <Button variant="outline" size="icon" onClick={handleBulkPrint} title="Imprimir Selecionados">
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => setServiceToDelete({ id: 'bulk' } as any)} title="Excluir Selecionados">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Mobile View Toggle */}
                            <div className="bg-muted/50 p-1 rounded-lg flex items-center gap-1 md:hidden">
                                <Button
                                    variant={mobileViewMode === 'standard' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setMobileViewMode('standard')}
                                    title="Visualização Padrão"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={mobileViewMode === 'compact' ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setMobileViewMode('compact')}
                                    title="Visualização Compacta"
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button onClick={handleCreate} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 hidden md:flex">
                                <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredServices.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhum serviço encontrado.
                        </div>
                    ) : (
                        <>
                            {/* Mobile View - Grid (Standard or Compact) */}
                            <div className="md:hidden">
                                <div className={`grid gap-4 ${mobileViewMode === 'compact' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                    {filteredServices.map((service) => {
                                        const IconComponent = service.icon && SERVICE_ICONS[service.icon] ? SERVICE_ICONS[service.icon] : CarFront;

                                        if (mobileViewMode === 'compact') {
                                            return (
                                                <Card
                                                    key={service.id}
                                                    onClick={() => handleEdit(service)}
                                                    className="cursor-pointer hover:bg-muted/50 p-4 flex flex-col items-center justify-center gap-2 aspect-square group relative"
                                                >
                                                    {/* Mobile Edit/Delete on Press? Or just click to edit. Compact view is for quick look. */}
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                                                        <IconComponent className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-xs font-medium text-center line-clamp-2 leading-tight">{service.name}</span>
                                                </Card>
                                            );
                                        }

                                        return (
                                            <Card
                                                key={service.id}
                                                onClick={() => handleEdit(service)}
                                                className="group relative flex flex-col hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                                            >
                                                <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setServiceToDelete(service);
                                                        }}
                                                        className="h-8 w-8 text-destructive hover:bg-transparent hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <CardHeader className="items-center pb-2 pt-4">
                                                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                                                        <IconComponent className="w-7 h-7" />
                                                    </div>
                                                    <CardTitle className="text-center text-base">{service.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 text-center text-sm text-muted-foreground pb-6">
                                                    <p className="line-clamp-2 min-h-[2.5rem]">
                                                        {service.description || "Sem descrição"}
                                                    </p>
                                                    <div className="mt-4 flex justify-center gap-2 text-foreground font-medium text-xs">
                                                        <span className="bg-secondary/50 px-2 py-1 rounded">R$ {(service.base_price || 0).toFixed(2)}</span>
                                                        <span className="bg-secondary/50 px-2 py-1 rounded">{service.duration_minutes} min</span>
                                                    </div>
                                                    <div className="mt-2 flex justify-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleShowProducts(service);
                                                            }}
                                                            className="bg-secondary/50 px-2 py-1 rounded flex items-center gap-2 hover:bg-secondary/70 transition-colors text-foreground font-medium text-sm"
                                                        >
                                                            {service.service_products?.length || 0} {service.service_products?.length === 1 ? 'Produto' : 'Produtos'}
                                                            <Info className="h-3 w-3 text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Desktop View - Table */}
                            <div className="hidden md:block rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                        <TableRow>
                                            <TableHead className="w-[50px] text-center">
                                                <Checkbox
                                                    checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead className="w-[80px] text-center">Ícone</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-center">Produtos</TableHead>
                                            <TableHead className="text-center">Duração</TableHead>
                                            <TableHead className="text-right">Preço</TableHead>
                                            <TableHead className="w-[100px] text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredServices.map((service) => {
                                            const IconComponent = service.icon && SERVICE_ICONS[service.icon] ? SERVICE_ICONS[service.icon] : CarFront;
                                            return (
                                                <TableRow key={service.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            checked={selectedServices.includes(service.id)}
                                                            onCheckedChange={() => toggleSelect(service.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                                                            <IconComponent className="w-5 h-5" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{service.name}</TableCell>
                                                    <TableCell className="text-slate-500 max-w-[200px] truncate" title={service.description || ""}>
                                                        {service.description || "-"}
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
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleEdit(service)}
                                                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setServiceToDelete(service)}
                                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
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
        </div>
    );
};
