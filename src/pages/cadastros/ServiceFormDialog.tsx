import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceIconSelector } from "@/components/services/ServiceIconSelector";
import { servicesService, type Service, type ServiceProductInput } from "@/services/servicesService";
import { productService, type Product } from "@/services/productService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trash2, Droplets, Beaker, CarFront, Check, ChevronsUpDown, Search, Info, RefreshCw, DollarSign, Percent, BarChart3, Clock, Tag, Users } from "lucide-react";
import { cn, minutesToHHMM, hhmmToMinutes } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';

const serviceSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    price: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0, "O valor deve ser maior ou igual a zero")
    ),
    duration_minutes: z.number().min(1, "O tempo de execução deve ser de pelo menos 1 minuto"),
    icon: z.string().optional(),
    commission_percent: z.preprocess(
        (val) => (val === "" ? 0 : Number(val)),
        z.number().min(0, "A comissão deve ser maior ou igual a zero").max(100, "Máximo 100%")
    ).optional(),
    other_costs: z.preprocess(
        (val) => (val === "" ? 0 : Number(val)),
        z.number().min(0, "O custo deve ser maior ou igual a zero")
    ).optional(),
    labor_cost_per_hour: z.preprocess(
        (val) => (val === "" ? 0 : Number(val)),
        z.number().min(0, "O custo deve ser maior ou igual a zero")
    ).optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ProductWithQuantity extends Product {
    quantity: number;
    // New fields for dilution logic
    dilution_ratio: string | null;
    container_size_ml: number | null;
    concentrate_package_size_ml: number | null;
    use_dilution?: boolean;
}

interface ServiceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serviceToEdit?: Service | null;
    onSuccess: () => void;
}

// Simple heuristic to suggest icons based on service name
const suggestIcon = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("lavagem") || lower.includes("completa")) return "CarFront";
    if (lower.includes("polimento") || lower.includes("cristaliza")) return "Sparkles";
    if (lower.includes("higieniza") || lower.includes("interno")) return "SprayCan";
    if (lower.includes("motor")) return "Cog";
    if (lower.includes("enceramento") || lower.includes("cera")) return "Droplets";
    return "CarFront"; // Default
};

export const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
    open,
    onOpenChange,
    serviceToEdit,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<ProductWithQuantity[]>([]);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [durationInput, setDurationInput] = useState("");

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema) as any,
        mode: "onChange",
        defaultValues: {
            name: "",
            description: "",
            price: "" as any,
            duration_minutes: 60,
            icon: "CarFront",
            commission_percent: 0,
            other_costs: 0,
            labor_cost_per_hour: 0,
        },
    });

    const { isValid } = form.formState;

    // --- Pricing Logic Start ---
    const { data: operationalCosts } = useQuery({
        queryKey: ['operational_costs'],
        queryFn: async () => {
            const { data } = await supabase.from('operational_costs').select('*').eq('user_id', (await supabase.auth.getUser()).data.user!.id);
            return data;
        },
        enabled: open
    });

    const { data: operationalHours } = useQuery({
        queryKey: ['operational_hours'],
        queryFn: async () => {
            const { data } = await supabase.from('operational_hours').select('*').eq('user_id', (await supabase.auth.getUser()).data.user!.id).single();
            return data;
        },
        enabled: open
    });

    const calculateSystemHourlyRate = () => {
        if (!operationalCosts || !operationalHours) return 0;

        const totalMonthlyExpenses = operationalCosts.reduce((acc: number, cost: any) => {
            if (cost.is_recurring) return acc + cost.value;
            return acc;
        }, 0);

        const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let weeklyMinutes = 0;
        weekDays.forEach(day => {
            // @ts-ignore
            const start = operationalHours[`${day}_start`];
            // @ts-ignore
            const end = operationalHours[`${day}_end`];
            if (start && end) {
                weeklyMinutes += hhmmToMinutes(end as string) - hhmmToMinutes(start as string);
            }
        });

        const monthlyHours = (weeklyMinutes * 4.33) / 60;
        if (monthlyHours === 0) return 0;

        return totalMonthlyExpenses / monthlyHours;
    };

    const handleLoadSystemHourlyRate = () => {
        const rate = calculateSystemHourlyRate();
        form.setValue("labor_cost_per_hour", Number(rate.toFixed(2)));
        toast.success(`Custo hora base atualizado: R$ ${rate.toFixed(2)}`);
    };

    const watchPrice = form.watch("price");
    const watchDuration = form.watch("duration_minutes");
    const watchLaborCost = form.watch("labor_cost_per_hour");
    const watchCommission = form.watch("commission_percent");
    const watchOtherCosts = form.watch("other_costs");
    // --- Pricing Logic End ---

    useEffect(() => {
        if (open) {
            loadProducts();
            if (serviceToEdit) {
                form.reset({
                    name: serviceToEdit.name,
                    description: serviceToEdit.description || "",
                    price: serviceToEdit.base_price || 0,
                    duration_minutes: serviceToEdit.duration_minutes || 60,
                    icon: serviceToEdit.icon || "CarFront",
                    commission_percent: serviceToEdit.commission_percent || 0,
                    other_costs: serviceToEdit.other_costs || 0,
                    labor_cost_per_hour: serviceToEdit.labor_cost_per_hour || 0,
                });
                setDurationInput(minutesToHHMM(serviceToEdit.duration_minutes || 60));
                loadServiceProducts(serviceToEdit.id);
            } else {
                form.reset({
                    name: "",
                    description: "",
                    price: "" as any,
                    duration_minutes: 60,
                    icon: "CarFront",
                    commission_percent: 0,
                    other_costs: 0,
                    labor_cost_per_hour: 0,
                });
                setDurationInput("01:00");
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
                    concentrate_package_size_ml: sp.products.container_size_ml || 1000, // Preserve original package size
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
        form.setValue("name", name, { shouldValidate: true });
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
                concentrate_package_size_ml: product.container_size_ml, // Initialize with product package size
                use_dilution: !!product.is_dilutable
            }]);
        }
    };

    const updateProduct = (productId: string, updates: Partial<ProductWithQuantity>) => {
        setSelectedProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    };

    // Helper to calculate product cost securely
    const getProductCost = (p: ProductWithQuantity) => {
        if (p.use_dilution && p.dilution_ratio) {
            // Dilution Logic
            // Cost = Usage * CostPerMlDiluted
            // CostPerMlDiluted = CostPerMlConcentrate / Ratio
            let ratio = 1;
            if (p.dilution_ratio.includes(':')) {
                ratio = Number(p.dilution_ratio.split(':')[1]) || 1;
            } else {
                ratio = Number(p.dilution_ratio) || 1;
            }
            // Use original package size. p.container_size_ml might be the Dilution Container (e.g. 500ml)
            // so we use concentrate_package_size_ml or fallback
            const packageSize = p.concentrate_package_size_ml || 1000;
            const costPerMlConcentrate = p.price / packageSize;
            const costPerMlDiluted = costPerMlConcentrate / ratio;
            return p.quantity * costPerMlDiluted;
        } else {
            // Ready to use
            // If ready to use, container_size_ml IS the package size typically, 
            // but let's be safe and use concentrate_package_size_ml if set, or fallback.
            const packageSize = p.concentrate_package_size_ml || p.container_size_ml || 1000;
            const costPerMl = p.price / packageSize;
            return p.quantity * costPerMl;
        }
    };

    // Calculate total stats for Pricing Tab
    const price = Number(watchPrice) || 0;
    const laborCostTotal = (Number(watchDuration) / 60) * Number(watchLaborCost);
    const commissionCost = (price * Number(watchCommission)) / 100;
    const productsTotalCost = selectedProducts.reduce((acc, p) => acc + getProductCost(p), 0);
    const totalServiceCost = laborCostTotal + commissionCost + Number(watchOtherCosts) + productsTotalCost;
    const netProfit = price - totalServiceCost;
    const marginPercent = price > 0 ? (netProfit / price) * 100 : 0;


    const onSubmit = async (values: ServiceFormValues) => {
        setLoading(true);
        try {
            const serviceData = {
                name: values.name,
                description: values.description || null,
                base_price: values.price || 0,
                duration_minutes: values.duration_minutes,
                icon: values.icon || null,
                user_id: (await supabase.auth.getUser()).data.user!.id,
                commission_percent: values.commission_percent,
                other_costs: values.other_costs,
                labor_cost_per_hour: values.labor_cost_per_hour,
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
            <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">{serviceToEdit ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
                        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="details">Detalhes</TabsTrigger>
                                <TabsTrigger value="costs">Produtos Utilizados</TabsTrigger>
                                <TabsTrigger value="pricing">Precificação</TabsTrigger>
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
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel className="!text-foreground">Nome do Serviço *</FormLabel>
                                                    <TooltipProvider>
                                                        <Tooltip open={!!fieldState.error}>
                                                            <TooltipTrigger asChild>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Ex: Lavagem Simples"
                                                                        {...field}
                                                                        className="bg-white dark:bg-slate-800"
                                                                        onChange={(e) => {
                                                                            field.onChange(e);
                                                                            handleNameChange(e);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                                                <p>{fieldState.error?.message || "Nome é obrigatório"}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Descrição</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Detalhes do serviço..." {...field} className="bg-white dark:bg-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="pricing" className="space-y-4 flex-1 overflow-y-auto p-1">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="!text-foreground">Valor Cobrado (R$)</FormLabel>
                                                <TooltipProvider>
                                                    <Tooltip open={!!fieldState.error}>
                                                        <TooltipTrigger asChild>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} className="pl-8 bg-white dark:bg-slate-800" />
                                                                </div>
                                                            </FormControl>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                                            <p>{fieldState.error?.message || "Valor obrigatório"}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duration_minutes"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormLabel className="!text-foreground">Tempo de Execução</FormLabel>
                                                <TooltipProvider>
                                                    <Tooltip open={!!fieldState.error}>
                                                        <TooltipTrigger asChild>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="HH:MM"
                                                                        className="pl-8 bg-white dark:bg-slate-800"
                                                                        value={durationInput}
                                                                        onChange={(e) => {
                                                                            let val = e.target.value.replace(/[^0-9:]/g, "");
                                                                            if (val.length === 2 && !val.includes(":")) val += ":";
                                                                            if (val.length > 5) val = val.slice(0, 5);
                                                                            setDurationInput(val);
                                                                            const minutes = hhmmToMinutes(val);
                                                                            field.onChange(minutes);
                                                                        }}
                                                                        onBlur={() => {
                                                                            const minutes = hhmmToMinutes(durationInput);
                                                                            if (minutes > 0) {
                                                                                setDurationInput(minutesToHHMM(minutes));
                                                                                field.onChange(minutes);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                                            <p>{fieldState.error?.message || "Tempo obrigatório"}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                    <FormField
                                        control={form.control}
                                        name="labor_cost_per_hour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Custo Hora (R$)</FormLabel>
                                                    <Button type="button" variant="ghost" size="sm" onClick={handleLoadSystemHourlyRate} className="h-5 text-xs text-blue-500 px-2 py-0">
                                                        <RefreshCw className="w-3 h-3 mr-1" />
                                                        Do Sistema
                                                    </Button>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Users className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input type="number" step="0.01" {...field} className="pl-8 bg-white dark:bg-slate-800" />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="commission_percent"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Comissão (%)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Percent className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input type="number" step="0.1" {...field} className="pl-8 bg-white dark:bg-slate-800" />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="other_costs"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Outros Custos (R$)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Tag className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input type="number" step="0.01" {...field} className="pl-8 bg-white dark:bg-slate-800" />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="bg-muted/50 rounded-lg p-4 space-y-2 border mt-4">
                                    <h3 className="font-semibold text-sm flex items-center mb-2">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Análise de Lucratividade
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm text-center">
                                        <div className="bg-background rounded p-2 border">
                                            <p className="text-muted-foreground text-[10px] uppercase font-bold text-left">Custo Total</p>
                                            <p className="font-medium text-lg text-left">R$ {totalServiceCost.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-background rounded p-2 border">
                                            <p className="text-muted-foreground text-[10px] uppercase font-bold text-left">Lucro Líquido</p>
                                            <p className={cn("font-bold text-lg text-left", netProfit >= 0 ? "text-green-600" : "text-red-500")}>
                                                R$ {netProfit.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="bg-background rounded p-2 border">
                                            <p className="text-muted-foreground text-[10px] uppercase font-bold text-left">Margem</p>
                                            <p className={cn("font-bold text-lg text-left", marginPercent >= 20 ? "text-green-600" : "text-amber-500")}>
                                                {marginPercent.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground text-center pt-2">
                                        * Baseado no tempo de execução, comissão, custos extras e produtos.
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="costs" className="flex-1 flex flex-col gap-4 overflow-hidden p-1">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium leading-none">Produtos Consumidos</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Selecione os produtos do estoque que são gastos ao realizar este serviço.
                                        Isso ajuda a calcular o custo real.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                                    <div className="flex flex-col gap-2">
                                        <Label>Adicionar Produto</Label>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openCombobox}
                                                    className="w-full justify-between"
                                                >
                                                    Selecione um produto...
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar produto..." />
                                                    <CommandList>
                                                        <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                                        <CommandGroup>
                                                            {products.map((product) => {
                                                                const isSelected = selectedProducts.some(sp => sp.id === product.id);
                                                                return (
                                                                    <CommandItem
                                                                        key={product.id}
                                                                        value={product.name}
                                                                        onSelect={() => {
                                                                            if (!isSelected) {
                                                                                toggleProduct(product);
                                                                            }
                                                                            setOpenCombobox(false);
                                                                        }}
                                                                        className={isSelected ? "opacity-50 cursor-not-allowed" : ""}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                isSelected ? "opacity-100" : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {product.name}
                                                                    </CommandItem>
                                                                );
                                                            })}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="border rounded-md p-2 flex flex-col flex-1 overflow-hidden">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold">Selecionados ({selectedProducts.length})</span>
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                                        <Info className="h-4 w-4" />
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent>
                                                    <SheetHeader>
                                                        <SheetTitle>Custos e Diluição</SheetTitle>
                                                        <SheetDescription>
                                                            Como calcular os custos corretamente.
                                                        </SheetDescription>
                                                    </SheetHeader>
                                                    <div className="mt-6 space-y-6">
                                                        <div className="flex gap-4">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-400/50 bg-blue-100/10 text-blue-500">
                                                                <Droplets className="h-5 w-5" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-medium leading-none">Diluição (1:X)</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Ex: 1:100 = 10ml produto + 990ml água (Total 1L).
                                                                    <br />
                                                                    Cálculo: Custo por ML Diluído = (Preço / Tamanho Embalagem) / Ratio.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-purple-400/50 bg-purple-100/10 text-purple-500">
                                                                <Beaker className="h-5 w-5" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-medium leading-none">Recipiente de Diluição</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Apenas referência para o aplicador saber qual borrifador usar (ex: 500ml). Não afeta o cálculo se a "Qtd Usada" estiver correta.
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-green-400/50 bg-green-100/10 text-green-500">
                                                                <CarFront className="h-5 w-5" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-medium leading-none">Quantidade Usada (ml)</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Volume TOTAL da solução (água + produto) gasto no veículo.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                        </div>
                                        <ScrollArea className="flex-1">
                                            <div className="space-y-4">
                                                {selectedProducts.map(sp => (
                                                    <div key={sp.id} className="bg-muted/30 p-2 rounded-md border text-sm space-y-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <span className="font-medium truncate text-sm" title={sp.name}>{sp.name}</span>

                                                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                                    <Label htmlFor={`dilution-${sp.id}`} className={cn("text-[10px] uppercase font-bold tracking-wider cursor-pointer", !sp.use_dilution ? "text-primary" : "text-muted-foreground")}>Pronto Uso</Label>
                                                                    <Switch
                                                                        id={`dilution-${sp.id}`}
                                                                        checked={sp.use_dilution}
                                                                        onCheckedChange={(checked) => updateProduct(sp.id, { use_dilution: checked })}
                                                                        className="scale-75 data-[state=checked]:bg-blue-500"
                                                                    />
                                                                    <Label htmlFor={`dilution-${sp.id}`} className={cn("text-[10px] uppercase font-bold tracking-wider cursor-pointer", sp.use_dilution ? "text-blue-500" : "text-muted-foreground")}>Diluir</Label>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => toggleProduct(sp)}
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>

                                                        {sp.use_dilution ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                                <div className="relative flex items-center border border-blue-400/50 rounded-md bg-background focus-within:ring-1 focus-within:ring-blue-500 transition-colors h-8">
                                                                    <div className="pl-2 pr-1 text-blue-500 shrink-0">
                                                                        <Droplets className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <Input
                                                                        className="h-full border-0 focus-visible:ring-0 p-0 text-[10px] placeholder:text-[10px] placeholder:text-muted-foreground/70"
                                                                        placeholder="Proporção (ex: 1:10)"
                                                                        value={sp.dilution_ratio || ""}
                                                                        onChange={(e) => updateProduct(sp.id, { dilution_ratio: e.target.value })}
                                                                    />
                                                                </div>
                                                                <div className="relative flex items-center border border-purple-400/50 rounded-md bg-background focus-within:ring-1 focus-within:ring-purple-500 transition-colors h-8">
                                                                    <div className="pl-2 pr-1 text-purple-500 shrink-0">
                                                                        <Beaker className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        className="h-full border-0 focus-visible:ring-0 p-0 text-[10px] placeholder:text-[10px] placeholder:text-muted-foreground/70"
                                                                        placeholder="Recipiente Diluição (ml)"
                                                                        value={sp.container_size_ml || ""}
                                                                        onChange={(e) => updateProduct(sp.id, { container_size_ml: Number(e.target.value) })}
                                                                    />
                                                                </div>
                                                                <div className="relative flex items-center border border-green-400/50 rounded-md bg-background focus-within:ring-1 focus-within:ring-green-500 transition-colors h-8">
                                                                    <div className="pl-2 pr-1 text-green-500 shrink-0">
                                                                        <CarFront className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        className="h-full border-0 focus-visible:ring-0 p-0 text-[10px] placeholder:text-[10px] placeholder:text-muted-foreground/70"
                                                                        placeholder="Qtd Solução Usada (ml)"
                                                                        value={sp.quantity || ""}
                                                                        onChange={(e) => updateProduct(sp.id, { quantity: Number(e.target.value) })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 gap-2">
                                                                <div className="relative flex items-center border border-green-400/50 rounded-md bg-background focus-within:ring-1 focus-within:ring-green-500 transition-colors h-8 w-full sm:w-1/2">
                                                                    <div className="pl-2 pr-1 text-green-500 shrink-0">
                                                                        <CarFront className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <Input
                                                                        type="number"
                                                                        className="h-full border-0 focus-visible:ring-0 p-0 text-[10px] placeholder:text-[10px] placeholder:text-muted-foreground/70"
                                                                        placeholder="Qtd Usada (ml/un)"
                                                                        value={sp.quantity || ""}
                                                                        onChange={(e) => updateProduct(sp.id, { quantity: Number(e.target.value) })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {selectedProducts.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                                                        <Search className="w-8 h-8 mb-2 opacity-50" />
                                                        <p>Nenhum custo adicionado.</p>
                                                        <p className="text-xs">Utilize a busca acima para adicionar produtos.</p>
                                                    </div>
                                                )}
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
                            <Button type="submit" disabled={loading || !isValid} className={!isValid ? "opacity-50 cursor-not-allowed" : ""}>
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
