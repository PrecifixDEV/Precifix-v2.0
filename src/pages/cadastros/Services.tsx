import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, CarFront } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import type { Service } from "@/services/servicesService";
import { SERVICE_ICONS } from "@/components/services/ServiceIconSelector";

export const Services = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Serviços</h1>
                <p className="text-slate-500 dark:text-slate-400">Gerencie os serviços oferecidos</p>
            </div>

            <div className="space-y-6">
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
                    <Button onClick={handleCreate} className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Novo Serviço
                    </Button>
                </div>

                {filteredServices.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        Nenhum serviço encontrado.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredServices.map((service) => {
                            const IconComponent = service.icon && SERVICE_ICONS[service.icon] ? SERVICE_ICONS[service.icon] : CarFront;

                            return (
                                <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader className="items-center pb-2">
                                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                            <IconComponent className="w-10 h-10" />
                                        </div>
                                        <CardTitle className="text-center text-lg">{service.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 text-center text-sm text-muted-foreground">
                                        <p className="line-clamp-2 min-h-[2.5rem]">
                                            {service.description || "Sem descrição"}
                                        </p>
                                        <div className="mt-4 flex justify-center gap-4 text-foreground font-medium">
                                            <span className="bg-secondary/50 px-2 py-1 rounded">R$ {service.price.toFixed(2)}</span>
                                            <span className="bg-secondary/50 px-2 py-1 rounded">{service.duration_minutes} min</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-center gap-2 pt-2 pb-6">
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
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

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
            </div>
        </div>
    );
};
