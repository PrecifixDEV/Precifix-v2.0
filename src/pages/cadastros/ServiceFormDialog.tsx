import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Trash2, Droplets, Beaker, CarFront } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


import { supabase } from "@/lib/supabase";
import { ServiceIconSelector, suggestIcon } from "@/components/services/ServiceIconSelector";
import { servicesService, type ServiceProductInput } from "@/services/servicesService";
import type { Service } from "@/services/servicesService";
import { productService } from "@/services/productService";
import type { Product } from "@/services/productService";
import { toast } from "sonner";

const serviceSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
    duration_minutes: z.coerce.number().min(1, "Duração deve ser de pelo menos 1 minuto"),
    icon: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ProductWithQuantity extends Product {
    quantity: number;
    dilution_ratio: string | null;
    container_size_ml: number | null;
    use_dilution: boolean;
}

interface ServiceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serviceToEdit?: Service | null;
    onSuccess: () => void;
}

export const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
    open,
    onOpenChange,
    serviceToEdit,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<ProductWithQuantity[]>([]); // Changed type

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            duration_minutes: 60,
            icon: "CarFront",
        },
    });

    useEffect(() => {
        if (open) {
            loadProducts();
            if (serviceToEdit) {
                form.reset({
                    name: serviceToEdit.name,
                    description: serviceToEdit.description || "",
                    price: serviceToEdit.price,
                    duration_minutes: serviceToEdit.duration_minutes,
                    icon: serviceToEdit.icon || "CarFront",
                });
                loadServiceProducts(serviceToEdit.id);
            } else {
                form.reset({
                    name: "",
                    description: "",
                    price: 0,
                    duration_minutes: 60,
                    icon: "CarFront",
                });
                setSelectedProducts([]);
            }
        }
    }, [open, serviceToEdit, form]);

    const loadProducts = async () => {
        try {
            const allProducts = await productService.getProducts();
            // Filter products that are NOT for sale (consumables)
            if (allProducts) {
                setProducts(allProducts.filter(p => !p.is_for_sale));
            }
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Erro ao carregar produtos de consumo.");
        }
    };

    const loadServiceProducts = async (serviceId: string) => {
        try {
            const serviceProductsData = await servicesService.getServiceProducts(serviceId);
            if (serviceProductsData) {
                const mapped = serviceProductsData.map((sp) => ({
                    ...sp.products,
                    quantity: sp.quantity,
                    dilution_ratio: sp.dilution_ratio || sp.products.dilution_ratio || "",
                    container_size_ml: sp.container_size_ml || sp.products.container_size_ml || 0,
                    use_dilution: !!sp.dilution_ratio, // If it has a ratio saved, assume it uses dilution
                }));
                setSelectedProducts(mapped);
            }
        } catch (error) {
            console.error("Error loading service products:", error);
            toast.error("Erro ao carregar custos do serviço.");
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue("name", name);
        // Only auto-suggest if the user hasn't manually changed the icon yet?
        // actually user requirement says "Ao digitar... use suggestIcon para pré-selecionar"
        const suggested = suggestIcon(name);
        form.setValue("icon", suggested);
    };

    const toggleProduct = (product: Product) => {
        const exists = selectedProducts.find(p => p.id === product.id);
        if (exists) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, {
                ...product,
                quantity: 1,
                dilution_ratio: product.dilution_ratio,
                container_size_ml: product.container_size_ml,
                use_dilution: !!product.is_dilutable
            }]);
        }
    };

    const updateProduct = (productId: string, updates: Partial<ProductWithQuantity>) => {
        setSelectedProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    };

    const onSubmit = async (values: ServiceFormValues) => {
        setLoading(true);
        try {
            const serviceData = {
                name: values.name,
                description: values.description || null,
                price: values.price,
                duration_minutes: values.duration_minutes,
                icon: values.icon || null,
                user_id: (await supabase.auth.getUser()).data.user!.id,
            };

            const formattedProducts: ServiceProductInput[] = selectedProducts.map(p => ({
                product_id: p.id,
                quantity: p.quantity,
                dilution_ratio: p.use_dilution ? p.dilution_ratio : null,
                container_size_ml: p.use_dilution ? p.container_size_ml : null
            }));

            if (serviceToEdit) {
                await servicesService.updateService(serviceToEdit.id, serviceData, formattedProducts);
                toast.success("Serviço atualizado com sucesso!");
            } else {
                await servicesService.createService(serviceData, formattedProducts);
                toast.success("Serviço criado com sucesso!");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving service:", error);
            toast.error("Erro ao salvar serviço.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{serviceToEdit ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
                        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Detalhes</TabsTrigger>
                                <TabsTrigger value="costs">Custos & Produtos</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-4 flex-1 overflow-y-auto p-1">
                                <div className="flex gap-4 items-start">
                                    <FormField
                                        control={form.control}
                                        name="icon"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ícone</FormLabel>
                                                <div className="flex justify-center">
                                                    <FormControl>
                                                        <ServiceIconSelector
                                                            value={field.value || "CarFront"}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex-1 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nome do Serviço</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Ex: Lavagem Simples"
                                                            {...field}
                                                            onChange={(e) => {
                                                                field.onChange(e);
                                                                handleNameChange(e);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Preço (R$)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duration_minutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duração (min)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Detalhes do serviço..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="costs" className="flex-1 flex flex-col gap-4 overflow-hidden p-1">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium leading-none">Produtos Consumidos</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Selecione os produtos do estoque que são gastos ao realizar este serviço.
                                        Isso ajuda a calcular o custo real.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                                    <div className="border rounded-md p-2 flex flex-col">
                                        <span className="text-xs font-semibold mb-2">Disponíveis (Não Venda)</span>
                                        <ScrollArea className="flex-1 h-[200px]">
                                            <div className="space-y-1">
                                                {products.map(product => {
                                                    const isSelected = selectedProducts.some(sp => sp.id === product.id);
                                                    return (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            disabled={isSelected}
                                                            onClick={() => toggleProduct(product)}
                                                            className={`w-full text-left text-sm p-2 rounded hover:bg-muted flex justify-between items-center ${isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            <span className="truncate">{product.name}</span>
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    );
                                                })}
                                                {products.length === 0 && <p className="text-xs text-muted-foreground p-2">Nenhum produto de consumo cadastrado.</p>}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div className="border rounded-md p-2 flex flex-col">
                                        <span className="text-xs font-semibold mb-2">Selecionados</span>
                                        <ScrollArea className="flex-1 h-[200px]">
                                            <div className="space-y-4">
                                                {selectedProducts.map(sp => (
                                                    <div key={sp.id} className="bg-muted/30 p-3 rounded-md border text-sm space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex flex-col flex-1">
                                                                <span className="font-medium truncate">{sp.name}</span>
                                                                {sp.is_dilutable && (
                                                                    <div className="flex items-center gap-2 mt-2">
                                                                        <Label htmlFor={`dilution-${sp.id}`} className="text-[10px] text-muted-foreground uppercase tracking-wide">Pronto Uso</Label>
                                                                        <Switch
                                                                            id={`dilution-${sp.id}`}
                                                                            checked={sp.use_dilution}
                                                                            onCheckedChange={(checked) => updateProduct(sp.id, { use_dilution: checked })}
                                                                            className="scale-75 origin-left data-[state=checked]:bg-primary"
                                                                        />
                                                                        <Label htmlFor={`dilution-${sp.id}`} className="text-[10px] text-muted-foreground uppercase tracking-wide">Diluir</Label>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button type="button" onClick={() => toggleProduct(sp)} className="text-destructive hover:text-destructive/80 p-1">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {sp.use_dilution ? (
                                                            <div className="grid grid-cols-3 gap-2">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-1 justify-center">
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Droplets className="w-3 h-3 text-blue-500 cursor-help" />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Proporção da Diluição</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                        <span className="text-[10px] text-muted-foreground">Diluição</span>
                                                                    </div>
                                                                    <Input
                                                                        className="h-7 text-xs text-center px-1"
                                                                        placeholder="1:10"
                                                                        value={sp.dilution_ratio || ""}
                                                                        onChange={(e) => updateProduct(sp.id, { dilution_ratio: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-1 justify-center">
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Beaker className="w-3 h-3 text-purple-500 cursor-help" />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Tamanho do Recipiente (ml)</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                        <span className="text-[10px] text-muted-foreground">Recipiente</span>
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        className="h-7 text-xs text-center px-1"
                                                                        placeholder="ml"
                                                                        value={sp.container_size_ml || ""}
                                                                        onChange={(e) => updateProduct(sp.id, { container_size_ml: Number(e.target.value) })}
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-1 justify-center">
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <CarFront className="w-3 h-3 text-green-500 cursor-help" />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Quantidade Usada por Veículo (ml)</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                        <span className="text-[10px] text-muted-foreground">Por Carro</span>
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        className="h-7 text-xs text-center px-1"
                                                                        placeholder="ml"
                                                                        value={sp.quantity}
                                                                        onChange={(e) => updateProduct(sp.id, { quantity: Number(e.target.value) })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-1">
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <CarFront className="w-3 h-3 text-green-500 cursor-help" />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>Quantidade Usada por Veículo (ml)</TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                    <span className="text-xs text-muted-foreground">Quantidade Usada (ml)</span>
                                                                </div>
                                                                <Input
                                                                    type="number"
                                                                    className="h-8 w-full text-xs"
                                                                    value={sp.quantity}
                                                                    onChange={(e) => updateProduct(sp.id, { quantity: Number(e.target.value) })}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {selectedProducts.length === 0 && <p className="text-xs text-muted-foreground p-2">Nenhum custo adicionado.</p>}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
