import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ServiceIconSelector } from "@/components/services/ServiceIconSelector";
import { servicesService, type Service } from "@/services/servicesService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, DollarSign, Percent, Clock, Tag, Users } from "lucide-react";
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
            const { data } = await supabase.from('operational_hours').select('*').eq('user_id', (await supabase.auth.getUser()).data.user!.id).single();
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
    // --- Pricing Logic End ---

    useEffect(() => {
        if (open) {
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
            }
        }
    }, [open, serviceToEdit, form]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        form.setValue("name", name, { shouldValidate: true });
        const suggested = suggestIcon(name);
        form.setValue("icon", suggested);
    };

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

            if (serviceToEdit) {
                await servicesService.updateService(serviceToEdit.id, serviceData, []);
                toast.success("Serviço atualizado com sucesso!");
            } else {
                await servicesService.createService(serviceData, []);
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
            <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">{serviceToEdit ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
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

                        <DialogFooter className="flex-row justify-end gap-2 pt-2 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !isValid}
                                className={cn(
                                    "border-none",
                                    !isValid ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                                )}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {serviceToEdit ? 'Salvar Alterações' : 'Criar Serviço'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
