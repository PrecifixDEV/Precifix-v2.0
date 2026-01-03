import { useEffect, useState } from "react";
import { Plus, Trash2, Search, CarFront, LayoutGrid, List, Info, Pencil } from "lucide-react";
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

import { ServiceFormDialog } from "./ServiceFormDialog";
import { servicesService } from "@/services/servicesService";
import type { Service, ServiceWithProductCount } from "@/services/servicesService";
import { SERVICE_ICONS } from "@/components/services/ServiceIconSelector";

export const Services = () => {
    const [services, setServices] = useState<ServiceWithProductCount[]>([]);
    const [filteredServices, setFilteredServices] = useState<ServiceWithProductCount[]>([]);
    const [viewMode, setViewMode] = useState<"card" | "list">("card");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [selectedServiceForProducts, setSelectedServiceForProducts] = useState<ServiceWithProductCount | null>(null);
    const [serviceProductsDetails, setServiceProductsDetails] = useState<any[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        loadServices();
    }, []);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = services.filter(
            (s) =>
                s.name.toLowerCase().includes(term) ||
                (s.description && s.description.toLowerCase().includes(term))
        );
        setFilteredServices(filtered);
    }, [searchTerm, services]);

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
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Serviços</h1>
                <p className="text-slate-500 dark:text-slate-400">Gerencie os serviços oferecidos</p>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar serviços..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <div className="flex border rounded-md overflow-hidden bg-background">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode("card")}
                                    className={`h-9 w-9 rounded-none ${viewMode === "card" ? "bg-muted text-primary" : "text-muted-foreground"}`}
                                    title="Visualização em Grade"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                    className={`h-9 w-9 rounded-none ${viewMode === "list" ? "bg-muted text-primary" : "text-muted-foreground"}`}
                                    title="Visualização em Lista"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button onClick={handleCreate} className="flex-1 sm:flex-none">
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
                    ) : viewMode === "card" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredServices.map((service) => {
                                const IconComponent = service.icon && SERVICE_ICONS[service.icon] ? SERVICE_ICONS[service.icon] : CarFront;

                                return (
                                    <Card
                                        key={service.id}
                                        onClick={() => handleEdit(service)}
                                        className="group relative flex flex-col hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                                        <CardHeader className="items-center pb-2 pt-6">
                                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                                <IconComponent className="w-10 h-10" />
                                            </div>
                                            <CardTitle className="text-center text-lg">{service.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1 text-center text-sm text-muted-foreground pb-6">
                                            <p className="line-clamp-2 min-h-[2.5rem]">
                                                {service.description || "Sem descrição"}
                                            </p>
                                            <div className="mt-4 flex justify-center gap-4 text-foreground font-medium">
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
                    ) : (
                        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableRow>
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
                                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setServiceToDelete(service)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                        <AlertDialogTitle>Excluir Serviço</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o serviço "{serviceToDelete?.name}"?
                            Esta ação não pode ser desfeita.
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
