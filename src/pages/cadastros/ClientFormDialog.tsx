import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Car, ArrowRight, Save, Bike, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { clientsService } from "@/services/clientsService";
import type { Client, NewClient, Vehicle } from "@/services/clientsService";
import { FipeVehicleSelector } from "@/components/vehicles/FipeVehicleSelector";
import type { FipeVehicle } from "@/services/fipeService";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    document: z.string().min(11, "CPF/CNPJ inválido").refine(val => {
        const digits = val.replace(/\D/g, '');
        return digits.length === 11 || digits.length === 14;
    }, "Documento inválido"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    phone: z.string().min(10, "Telefone inválido"),
    zip_code: z.string().optional(),
    address: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
});

interface ClientFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientToEdit?: Client | null;
    onSuccess: () => void;
}

export function ClientFormDialog({
    open,
    onOpenChange,
    clientToEdit,
    onSuccess,
}: ClientFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);

    // Internal state for "Edit Mode" after creation
    const [activeClient, setActiveClient] = useState<Client | null>(null);
    const [activeTab, setActiveTab] = useState("details");

    // Vehicle Form State
    const [isAddingVehicle, setIsAddingVehicle] = useState(false);
    const [newVehiclePlate, setNewVehiclePlate] = useState("");
    const [newVehicleColor, setNewVehicleColor] = useState("");
    const [fipeData, setFipeData] = useState<FipeVehicle | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            document: "",
            email: "",
            phone: "",
            zip_code: "",
            address: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
        },
    });

    const { isValid, errors } = form.formState;

    useEffect(() => {
        if (open) {
            setIsAddingVehicle(false);
            setFipeData(null);
            setNewVehiclePlate("");
            setNewVehicleColor("");
            setActiveTab("details");

            // Prioritize clientToEdit, otherwise clear activeClient
            if (clientToEdit) {
                setActiveClient(clientToEdit);
                form.reset({
                    name: clientToEdit.name,
                    document: clientToEdit.document || "",
                    email: clientToEdit.email || "",
                    phone: clientToEdit.phone || "",
                    zip_code: clientToEdit.zip_code || "",
                    address: clientToEdit.address || "",
                    number: clientToEdit.number || "",
                    complement: clientToEdit.complement || "",
                    neighborhood: clientToEdit.neighborhood || "",
                    city: clientToEdit.city || "",
                    state: clientToEdit.state || "",
                });
                loadVehicles(clientToEdit.id);
            } else {
                setActiveClient(null);
                form.reset({
                    name: "",
                    document: "",
                    email: "",
                    phone: "",
                    zip_code: "",
                    address: "",
                    number: "",
                    complement: "",
                    neighborhood: "",
                    city: "",
                    state: "",
                });
                setVehicles([]);
            }
        }
    }, [open, clientToEdit, form]);

    const loadVehicles = async (clientId: string) => {
        try {
            setLoadingVehicles(true);
            const data = await clientsService.getVehicles(clientId);
            setVehicles(data || []);
        } catch (error) {
            console.error("Error loading vehicles:", error);
            toast.error("Erro ao carregar veículos.");
        } finally {
            setLoadingVehicles(false);
        }
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 14) v = v.slice(0, 14);

        if (v.length > 11) {
            v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        } else {
            v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        }
        onChange(v);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);

        let formatted = v;
        if (v.length > 10) {
            formatted = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (v.length > 6) {
            formatted = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
        } else if (v.length > 2) {
            formatted = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else {
            formatted = v;
        }
        onChange(formatted);
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, "");
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    form.setValue("address", data.logradouro);
                    form.setValue("neighborhood", data.bairro);
                    form.setValue("city", data.localidade);
                    form.setValue("state", data.uf);
                    form.setFocus("number");
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const clientData: NewClient = {
                ...values,
                user_id: user.id,
            };

            let savedClient: Client;

            if (activeClient) {
                savedClient = await clientsService.updateClient(activeClient.id, clientData);
                toast.success("Cliente atualizado!");
            } else {
                savedClient = await clientsService.createClient(clientData);
                toast.success("Cliente criado!");
            }

            // Update state to reflect saved client
            setActiveClient(savedClient);
            onSuccess(); // Refresh parent list

            // Switch to Vehicles tab automatically
            setActiveTab("vehicles");
            // If it's a new client, maybe auto-open "Add Vehicle"?
            // User requested: "ao invés de fechar a janela... abrir a aba veículos"

        } catch (error) {
            console.error("Erro ao salvar cliente:", error);
            toast.error("Erro ao salvar cliente.");
        } finally {
            setIsLoading(false);
        }
    };

    const onFipeSelected = (vehicle: FipeVehicle) => {
        setFipeData(vehicle);
    };

    const handleAddVehicle = async () => {
        if (!activeClient || !fipeData) return;

        try {
            setIsLoading(true);
            const payload = {
                client_id: activeClient.id,
                brand: fipeData.Marca,
                model: fipeData.Modelo,
                year: fipeData.AnoModelo,
                plate: newVehiclePlate || null,
                color: newVehicleColor || null,
                type: fipeData.TipoVeiculo === 1 ? 'carro' : fipeData.TipoVeiculo === 2 ? 'moto' : 'caminhao',
            };
            console.log("Saving vehicle payload:", payload);

            await clientsService.addVehicle(payload);

            toast.success("Veículo adicionado!");
            setIsAddingVehicle(false);
            setFipeData(null);
            setNewVehiclePlate("");
            setNewVehicleColor("");
            loadVehicles(activeClient.id);
        } catch (error) {
            console.error("Erro ao adicionar veículo detailed:", error);
            // @ts-ignore
            if (error.message) toast.error(`Erro: ${error.message}`);
            // @ts-ignore
            if (error.details) console.error("Error details:", error.details);
            // @ts-ignore
            if (error.hint) console.error("Error hint:", error.hint);

            toast.error("Erro ao adicionar veículo. Verifique o console.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteVehicle = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este veículo?")) return;
        try {
            await clientsService.deleteVehicle(id);
            toast.success("Veículo removido.");
            if (activeClient) loadVehicles(activeClient.id);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover veículo.");
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-slate-900 dark:text-white">
                        {activeClient ? "Editar Cliente" : "Novo Cliente"}
                    </DialogTitle>
                    <DialogDescription>
                        Passo 1: Dados Pessoais &nbsp; &rarr; &nbsp; Passo 2: Veículos
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Dados do Cliente</TabsTrigger>
                            <TabsTrigger
                                value="vehicles"
                                disabled={!activeClient}
                                className={!activeClient ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                Veículos
                                {!activeClient && <span className="ml-2 text-[10px] text-muted-foreground">(Salve primeiro)</span>}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="details" className="flex-1 overflow-y-auto p-6 pt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="!text-foreground">Nome *</FormLabel>
                                                <TooltipProvider>
                                                    <Tooltip open={!!errors.name}>
                                                        <TooltipTrigger asChild>
                                                            <FormControl>
                                                                <Input placeholder="Nome do cliente" {...field} className="bg-white dark:bg-slate-800" />
                                                            </FormControl>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                                            <p>{errors.name?.message}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="document"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="!text-foreground">CPF / CNPJ *</FormLabel>
                                                <TooltipProvider>
                                                    <Tooltip open={!!errors.document}>
                                                        <TooltipTrigger asChild>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="000.000.000-00"
                                                                    {...field}
                                                                    className="bg-white dark:bg-slate-800"
                                                                    onChange={(e) => handleDocumentChange(e, field.onChange)}
                                                                    maxLength={18}
                                                                />
                                                            </FormControl>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                                            <p>{errors.document?.message}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email@exemplo.com" {...field} className="bg-white dark:bg-slate-800" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="!text-foreground">Telefone *</FormLabel>
                                                <TooltipProvider>
                                                    <Tooltip open={!!errors.phone}>
                                                        <TooltipTrigger asChild>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="(00) 00000-0000"
                                                                    {...field}
                                                                    className="bg-white dark:bg-slate-800"
                                                                    onChange={(e) => handlePhoneChange(e, field.onChange)}
                                                                    maxLength={15}
                                                                />
                                                            </FormControl>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                                            <p>{errors.phone?.message}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-semibold mb-3">Endereço</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="zip_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>CEP</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="00000-000"
                                                            {...field}
                                                            onBlur={handleCepBlur}
                                                            className="bg-white dark:bg-slate-800"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Endereço</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Rua, Av..." {...field} className="bg-white dark:bg-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Número</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="123" {...field} className="bg-white dark:bg-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="complement"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Complemento</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Apto, Sala..." {...field} className="bg-white dark:bg-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="neighborhood"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bairro</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Bairro" {...field} className="bg-white dark:bg-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cidade</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Cidade" {...field} className="bg-white dark:bg-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estado</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="UF" maxLength={2} {...field} className="bg-white dark:bg-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                                    <Button type="button" variant="outline" onClick={handleClose}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !isValid}
                                        className={cn(
                                            "text-slate-900 duration-200",
                                            !isValid ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 shadow-md hover:shadow-lg"
                                        )}
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Salvar e Cadastrar Veículo
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="vehicles" className="flex-1 overflow-y-auto p-6 pt-4 space-y-4 flex flex-col">
                        <div className="flex-1 space-y-4">
                            {!isAddingVehicle ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">Veículos Cadastrados</h3>
                                        <Button size="sm" onClick={() => setIsAddingVehicle(true)} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 shadow-sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Adicionar Veículo
                                        </Button>
                                    </div>

                                    {loadingVehicles ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : vehicles.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                                            <Car className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                            <p>Nenhum veículo cadastrado.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {vehicles.map(vehicle => (
                                                <Card key={vehicle.id} className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                    <CardContent className="p-4 flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                                                                {vehicle.type === 'moto' ? <Bike className="w-5 h-5 text-slate-600 dark:text-slate-400" /> :
                                                                    vehicle.type === 'caminhao' ? <Truck className="w-5 h-5 text-slate-600 dark:text-slate-400" /> :
                                                                        <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-sm">{vehicle.model}</h4>
                                                                <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-1">
                                                                    <span className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border">{vehicle.brand}</span>
                                                                    <span className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border">{vehicle.year}</span>
                                                                    <span className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border font-mono uppercase">{vehicle.plate || 'S/ Placa'}</span>
                                                                    {vehicle.color && <span className="bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border">{vehicle.color}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteVehicle(vehicle.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-sm">Adicionar Novo Veículo</h3>
                                        <Button variant="ghost" size="sm" onClick={() => setIsAddingVehicle(false)}>
                                            Cancelar
                                        </Button>
                                    </div>

                                    <FipeVehicleSelector onVehicleSelected={onFipeSelected} />

                                    {fipeData && (
                                        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                                    <Car className="w-6 h-6 text-slate-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-lg leading-tight">{fipeData.Modelo}</h4>
                                                    <p className="text-sm text-muted-foreground">{fipeData.Marca} &bull; {fipeData.AnoModelo} &bull; {fipeData.Combustivel}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Placa (Opcional)</Label>
                                                    <Input
                                                        placeholder="ABC-1234"
                                                        value={newVehiclePlate}
                                                        onChange={(e) => setNewVehiclePlate(e.target.value.toUpperCase())}
                                                        maxLength={8}
                                                        className="bg-white dark:bg-slate-800 font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Cor (Opcional)</Label>
                                                    <Input
                                                        placeholder="Ex: Prata"
                                                        value={newVehicleColor}
                                                        onChange={(e) => setNewVehicleColor(e.target.value)}
                                                        className="bg-white dark:bg-slate-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2 flex justify-end">
                                                <Button onClick={handleAddVehicle} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto shadow-sm">
                                                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                    Salvar Veículo
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons for Vehicle Tab */}
                        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button type="button" onClick={handleClose} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
                                Salvar Cliente
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
