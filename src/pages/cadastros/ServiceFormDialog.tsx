import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ServiceIconSelector } from "@/components/services/ServiceIconSelector";
import { servicesService, type Service } from "@/services/servicesService";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, DollarSign, Percent, Clock, Tag, Users, FileText, Coins } from "lucide-react";
import { minutesToHHMM, hhmmToMinutes } from "@/lib/utils";
import { suggestIcon } from "@/components/services/ServiceIconSelector";
import { StandardSheet, StandardSheetToggle } from "@/components/ui/StandardSheet";
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

// suggestIcon is now imported from ServiceIconSelector

export const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
    open,
    onOpenChange,
    serviceToEdit,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [durationInput, setDurationInput] = useState("");

    // Toggle States for Optional Fields
    const [showDescription, setShowDescription] = useState(false);
    const [showCommission, setShowCommission] = useState(false);
    // Costs are now mandatory

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

                // Set toggles based on existing data
                setShowDescription(!!serviceToEdit.description);
                setShowCommission(!!serviceToEdit.commission_percent);
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

        // Only suggest icon if the current one is the default
        const currentIcon = form.getValues("icon");
        if (!currentIcon || currentIcon === "CarFront") {
            const suggested = suggestIcon(name);
            form.setValue("icon", suggested);
        }
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
        <StandardSheet
            open={open}
            onOpenChange={onOpenChange}
            title={serviceToEdit ? "EDITAR SERVIÇO" : "NOVO SERVIÇO"}
            onSave={form.handleSubmit(onSubmit)}
            isLoading={loading}
            isSaveDisabled={!isValid}
            saveLabel={serviceToEdit ? 'SALVAR ALTERAÇÕES' : 'CRIAR SERVIÇO'}
            optionalFieldsToggles={
                <>
                    <StandardSheetToggle
                        label="Descrição"
                        active={showDescription}
                        onClick={() => setShowDescription(!showDescription)}
                        icon={<FileText className="h-4 w-4" />}
                    />
                    <StandardSheetToggle
                        label="Comissão"
                        active={showCommission}
                        onClick={() => setShowCommission(!showCommission)}
                        icon={<Percent className="h-4 w-4" />}
                    />
                </>
            }
        >
            <Form {...form}>
                <form id="service-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex gap-4 items-start pb-4 border-b border-zinc-100 dark:border-zinc-800">
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
                        <div className="flex-1">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="!text-foreground">Nome do Serviço <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Lavagem Simples"
                                                {...field}
                                                className="bg-white dark:bg-zinc-950 border-input"
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
                                    <FormLabel className="!text-foreground">Valor Cobrado (R$)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} className="pl-9 bg-white dark:bg-zinc-950 border-input" />
                                        </div>
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
                                    <FormLabel className="!text-foreground">Tempo Estimado</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                            <Input
                                                type="text"
                                                placeholder="HH:MM"
                                                className="pl-9 bg-white dark:bg-zinc-950 border-input font-mono"
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Optional Fields Content (MOVED TO TOP) */}
                    {showDescription && (
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="animate-in fade-in slide-in-from-top-2 pt-2">
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalhes do serviço..."
                                            {...field}
                                            className="bg-white dark:bg-zinc-950 min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {showCommission && (
                        <FormField
                            control={form.control}
                            name="commission_percent"
                            render={({ field }) => (
                                <FormItem className="animate-in fade-in slide-in-from-top-2 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-base">Comissão por Execução</Label>
                                        <Percent className="h-4 w-4 text-zinc-400" />
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
                                            <Input type="number" step="0.1" {...field} className="pl-8 bg-white dark:bg-zinc-950 border-input" placeholder="0.0" />
                                        </div>
                                    </FormControl>
                                    <p className="text-[10px] text-zinc-500 mt-2 italic">Valor em porcentagem pago ao funcionário por serviço.</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Cálculo de Custos</Label>
                            <Coins className="h-4 w-4 text-yellow-500" />
                        </div>

                        <FormField
                            control={form.control}
                            name="labor_cost_per_hour"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <Label>Custo de Hora (R$)</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={handleLoadSystemHourlyRate} className="h-5 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-zinc-800 px-2 py-0">
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Usar média do sistema
                                        </Button>
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                            <Input type="number" step="0.01" {...field} className="pl-9 bg-white dark:bg-zinc-950 border-input" />
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
                                    <Label>Custos de Produtos / Outros (R$)</Label>
                                    <FormControl>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                            <Input type="number" step="0.01" {...field} className="pl-9 bg-white dark:bg-zinc-950 border-input" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        </StandardSheet>
    );
};
