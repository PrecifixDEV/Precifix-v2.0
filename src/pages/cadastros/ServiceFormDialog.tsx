import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerDescription,
} from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceIconSelector } from "@/components/services/ServiceIconSelector";
import { servicesService, type Service, type ServiceProductInput } from "@/services/servicesService";
import { productService, type Product } from "@/services/productService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, Check, ChevronsUpDown, RefreshCw, DollarSign, Percent, Clock, Package } from "lucide-react";
import { cn, minutesToHHMM, hhmmToMinutes } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { useMobile } from '@/hooks/useMobile';

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

interface ServiceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serviceToEdit?: Service | null;
    onSuccess: () => void;
}

const suggestIcon = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes("lavagem") || lower.includes("completa")) return "CarFront";
    if (lower.includes("polimento") || lower.includes("cristaliza")) return "Sparkles";
    if (lower.includes("higieniza") || lower.includes("interno")) return "SprayCan";
    if (lower.includes("motor")) return "Cog";
    if (lower.includes("enceramento") || lower.includes("cera")) return "Droplets";
    return "CarFront";
};

export const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
    open,
    onOpenChange,
    serviceToEdit,
    onSuccess,
}) => {
    const isMobile = useMobile();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [durationInput, setDurationInput] = useState("");
    const [showProductsSection, setShowProductsSection] = useState(false);

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

    // Watch form values for cost calculation
    const watchPrice = form.watch("price");
    const watchDuration = form.watch("duration_minutes");
    const watchLaborCost = form.watch("labor_cost_per_hour");
    const watchCommission = form.watch("commission_percent");
    const watchOtherCosts = form.watch("other_costs");

    // Fetch operational costs for hourly rate calculation
    const { data: operationalCosts } = useQuery({
        queryKey: ['operational_costs_monthly'],
        queryFn: async () => {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            const startStr = startOfMonth.toISOString().split('T')[0];

            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            const endStr = endOfMonth.toISOString().split('T')[0];

            const { data } = await supabase
                .from('operational_costs')
                .select('value')
                .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
                .gte('expense_date', startStr)
                .lt('expense_date', endStr);
            return data;
        },
        enabled: open
    });

    const { data: operationalHours } = useQuery({
        queryKey: ['operational_hours'],
        queryFn: async () => {
            const { data } = await supabase
                .from('operational_hours')
                .select('*')
                .eq('user_id', (await supabase.auth.getUser()).data.user!.id)
                .single();
            return data;
        },
        enabled: open
    });

    const calculateSystemHourlyRate = () => {
        if (!operationalCosts || !operationalHours) return 0;

        const totalMonthlyExpenses = operationalCosts.reduce((acc: number, cost: any) => acc + cost.value, 0);

        const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        let weeklyMinutes = 0;

        weekDays.forEach(day => {
            // @ts-ignore
            const start = operationalHours[`${day}_start`];
            // @ts-ignore
            const end = operationalHours[`${day}_end`];

            if (start && end && start !== '00:00' && end !== '00:00') {
                const [startH, startM] = (start as string).split(':').map(Number);
                const [endH, endM] = (end as string).split(':').map(Number);

                let startMinutes = startH * 60 + startM;
                let endMinutes = endH * 60 + endM;

                if (endMinutes < startMinutes) endMinutes += 24 * 60;

                let diffMinutes = endMinutes - startMinutes;
                const lunchMinutes = 60;
                let netMinutes = diffMinutes - lunchMinutes;
                if (netMinutes < 0) netMinutes = 0;

                weeklyMinutes += netMinutes;
            }
        });

        const monthlyHours = (weeklyMinutes * 4.345) / 60;
        if (monthlyHours === 0) return 0;

        return totalMonthlyExpenses / monthlyHours;
    };

    const handleLoadSystemHourlyRate = () => {
        const rate = calculateSystemHourlyRate();
        form.setValue("labor_cost_per_hour", Number(rate.toFixed(2)));
        toast.success(`Custo hora base atualizado: R$ ${rate.toFixed(2)}`);
    };

    // Load products
    useEffect(() => {
        if (open) {
            loadProducts();
        }
    }, [open]);

    // Load service data when editing
    useEffect(() => {
        if (open && serviceToEdit) {
            form.reset({
                name: serviceToEdit.name,
                description: serviceToEdit.description || "",
                price: serviceToEdit.base_price,
                duration_minutes: serviceToEdit.duration_minutes,
                icon: serviceToEdit.icon || "CarFront",
                commission_percent: serviceToEdit.commission_percent || 0,
                other_costs: serviceToEdit.other_costs || 0,
                labor_cost_per_hour: serviceToEdit.labor_cost_per_hour || 0,
            });
            setDurationInput(minutesToHHMM(serviceToEdit.duration_minutes));
            loadServiceProducts(serviceToEdit.id);
        } else if (open) {
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
            setShowProductsSection(false);
        }
    }, [open, serviceToEdit]);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Erro ao carregar produtos de consumo.");
        }
    };

    const loadServiceProducts = async (serviceId: string) => {
        try {
            const serviceProductsData = await servicesService.getServiceProducts(serviceId);
            if (serviceProductsData) {
                const mapped = serviceProductsData.map((sp) => sp.products);
                setSelectedProducts(mapped);
                if (mapped.length > 0) setShowProductsSection(true);
            }
        } catch (error) {
            console.error("Error loading service products:", error);
            toast.error("Erro ao carregar produtos do serviço.");
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue("name", name, { shouldValidate: true });
        const suggested = suggestIcon(name);
        form.setValue("icon", suggested);
    };

    const toggleProduct = (product: Product) => {
        const exists = selectedProducts.find(p => p.id === product.id);
        if (exists) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    // Calculate costs - ITEMIZED
    const price = Number(watchPrice) || 0;
    const laborCostTotal = (Number(watchDuration) / 60) * Number(watchLaborCost);
    const commissionCost = (price * Number(watchCommission)) / 100;
    const otherCostsValue = Number(watchOtherCosts) || 0;
    const totalServiceCost = laborCostTotal + commissionCost + otherCostsValue;
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
                icon: values.icon || "CarFront",
                commission_percent: values.commission_percent || 0,
                other_costs: values.other_costs || 0,
                labor_cost_per_hour: values.labor_cost_per_hour || 0,
            };

            const serviceProducts: ServiceProductInput[] = selectedProducts.map(p => ({
                product_id: p.id,
            }));

            if (serviceToEdit) {
                await servicesService.updateService(serviceToEdit.id, serviceData, serviceProducts);
                toast.success("Serviço atualizado com sucesso!");
            } else {
                await servicesService.createService(serviceData, serviceProducts);
                toast.success("Serviço criado com sucesso!");
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error saving service:", error);
            toast.error(error.message || "Erro ao salvar serviço.");
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Shared form content
    const formContent = (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Detalhes</TabsTrigger>
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

                        <FormField
                            control={form.control}
                            name="duration_minutes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duração Estimada</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-8 bg-white dark:bg-slate-800"
                                                placeholder="HH:MM"
                                                value={durationInput}
                                                onChange={(e) => {
                                                    setDurationInput(e.target.value);
                                                    const mins = hhmmToMinutes(e.target.value);
                                                    if (mins > 0) field.onChange(mins);
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Products Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-products-toggle" className="cursor-pointer">
                                    Produtos Utilizados (Referência)
                                </Label>
                                <Switch
                                    id="show-products-toggle"
                                    checked={showProductsSection}
                                    onCheckedChange={setShowProductsSection}
                                />
                            </div>

                            {showProductsSection && (
                                <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCombobox}
                                                className="w-full justify-between"
                                            >
                                                Selecionar produto...
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar produto..." />
                                                <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {products.map((product) => (
                                                            <CommandItem
                                                                key={product.id}
                                                                onSelect={() => {
                                                                    toggleProduct(product);
                                                                    setOpenCombobox(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedProducts.find(p => p.id === product.id) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {product.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {selectedProducts.length > 0 && (
                                        <div className="space-y-2">
                                            {selectedProducts.map((sp) => (
                                                <div key={sp.id} className="flex items-center justify-between p-2 border rounded bg-background">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                                            {sp.image_url ? (
                                                                <img src={sp.image_url} alt={sp.name} className="h-full w-full object-cover rounded" />
                                                            ) : (
                                                                <Package className="h-4 w-4 text-slate-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm truncate">{sp.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {sp.category || "Produto"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleProduct(sp)}
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        title="Remover Produto"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-xs text-muted-foreground">
                                        * Produtos são apenas referência. Custos gerenciados via despesas operacionais.
                                    </p>
                                </div>
                            )}
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
                                                    <p>{fieldState.error?.message || "Valor é obrigatório"}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
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
                                                <Input type="number" step="0.1" placeholder="0" {...field} className="pl-8 bg-white dark:bg-slate-800" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="labor_cost_per_hour"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Custo Operacional (R$/hora)</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input type="number" step="0.01" placeholder="0.00" {...field} className="pl-8 bg-white dark:bg-slate-800" />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleLoadSystemHourlyRate}
                                                disabled={!operationalCosts || !operationalHours}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Calcular
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
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
                                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} className="pl-8 bg-white dark:bg-slate-800" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ITEMIZED COST DISPLAY */}
                        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardContent className="pt-6 space-y-3">
                                <h3 className="font-semibold text-sm mb-3">Composição de Custos</h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Custo Operacional:</span>
                                        <span className="font-medium">{formatMoney(laborCostTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Comissões ({watchCommission}%):</span>
                                        <span className="font-medium">{formatMoney(commissionCost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Outros Custos:</span>
                                        <span className="font-medium">{formatMoney(otherCostsValue)}</span>
                                    </div>

                                    <div className="border-t pt-2 flex justify-between items-center font-bold text-red-600">
                                        <span>CUSTO TOTAL:</span>
                                        <span>{formatMoney(totalServiceCost)}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Preço Cobrado:</span>
                                        <span className="font-semibold text-lg">{formatMoney(price)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Lucro Líquido:</span>
                                        <span className={`font-bold text-lg ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {formatMoney(netProfit)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Margem:</span>
                                        <span className={`font-semibold ${marginPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {marginPercent.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );

    // Mobile: Drawer
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange} dismissible={true} shouldScaleBackground={true}>
                <DrawerContent className="max-h-[95vh]">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4 mt-2" />
                    <DrawerHeader>
                        <DrawerTitle>
                            {serviceToEdit ? "Editar Serviço" : "Novo Serviço"}
                        </DrawerTitle>
                        <DrawerDescription>
                            {serviceToEdit ? "Edite as informações do serviço" : "Preencha os dados para criar um novo serviço"}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-4">
                        {formContent}
                    </div>

                    <DrawerFooter className="pt-2 border-t">
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={loading || !isValid}
                            className={cn(
                                "w-full border-none",
                                !isValid ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                            )}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    // Desktop: Dialog
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-slate-900 dark:text-white">
                        {serviceToEdit ? "Editar Serviço" : "Novo Serviço"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        {serviceToEdit ? "Edite as informações do serviço" : "Preencha os dados para criar um novo serviço"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6">
                    {formContent}
                </div>

                <DialogFooter className="p-6 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={loading || !isValid}
                        className={cn(
                            "border-none",
                            !isValid ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                        )}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
