import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

import { costService } from "@/services/costService";

const costSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    value: z.string().min(1, "Valor é obrigatório"),
    type: z.enum(["fixed", "variable"]),
    expense_date: z.date(),
    category: z.string().min(1, "Categoria é obrigatória"),
    is_recurring: z.boolean().default(false),
    recurrence_frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    recurrence_end_date: z.date().optional(),
});

type CostFormValues = z.infer<typeof costSchema>;

interface NewCostDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories?: string[]; // Pass known categories for autocomplete if needed
}

export function NewCostDrawer({ open, onOpenChange, categories = [] }: NewCostDrawerProps) {
    const queryClient = useQueryClient();

    const form = useForm<CostFormValues>({
        resolver: zodResolver(costSchema) as any,
        defaultValues: {
            description: "",
            value: "",
            type: "fixed",
            expense_date: new Date(),
            category: "",
            is_recurring: false,
            recurrence_frequency: "monthly",
            recurrence_end_date: undefined,
        },
    });

    const isRecurring = form.watch("is_recurring");

    // Reset form when opening
    useEffect(() => {
        if (open) {
            form.reset({
                description: "",
                value: "",
                type: "fixed",
                expense_date: new Date(),
                category: "",
                is_recurring: false,
                recurrence_frequency: "monthly",
            });
        }
    }, [open, form]);

    const { mutate: saveCost, isPending } = useMutation({
        mutationFn: async (values: CostFormValues) => {
            const formattedValue = parseFloat(values.value.replace(',', '.'));

            await costService.saveCost({
                description: values.description,
                value: isNaN(formattedValue) ? 0 : formattedValue,
                type: values.type,
                expense_date: format(values.expense_date, "yyyy-MM-dd"), // Format ensuring local YYYY-MM-DD
                category: values.category, // Pass category
                is_recurring: values.is_recurring,
                recurrence_frequency: values.is_recurring ? values.recurrence_frequency : undefined,
                recurrence_end_date: values.is_recurring && values.recurrence_end_date ? format(values.recurrence_end_date, "yyyy-MM-dd") : undefined,
            } as any); // Type cast due to category missing in strict type if not updated yet
        },
        onSuccess: () => {
            toast.success("Despesa salva com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["operationalCosts"] });
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error("Erro ao salvar despesa");
            console.error(error);
        },
    });

    const onSubmit = (data: CostFormValues) => {
        saveCost(data);
    };

    // Pre-defined categories + any custom ones could be managed here
    const suggestionCategories = Array.from(new Set([...(categories || []), "Aluguel", "Energia", "Água", "Internet", "Salários", "Marketing", "Manutenção", "Impostos"]));

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh]">
                <div className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                        <DrawerTitle>Nova Despesa</DrawerTitle>
                        <DrawerDescription>
                            Adicione uma nova despesa ou custo operacional.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 overflow-y-auto max-h-[60vh]">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Aluguel do Galpão" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="value"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Valor (R$)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="0,00"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="fixed">Fixo</SelectItem>
                                                        <SelectItem value="variable">Variável</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="expense_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Data da Despesa</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "dd/MM/yyyy")
                                                                ) : (
                                                                    <span>Selecione a data</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            locale={ptBR}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categoria</FormLabel>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Digite ou selecione..."
                                                        {...field}
                                                        list="categories-list"
                                                    />
                                                    <datalist id="categories-list">
                                                        {suggestionCategories.map(cat => (
                                                            <option key={cat} value={cat} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator className="my-2" />

                                <FormField
                                    control={form.control}
                                    name="is_recurring"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel>Despesa Recorrente?</FormLabel>
                                                <div className="text-[0.8rem] text-muted-foreground">
                                                    Criar automaticamente para o futuro.
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                {isRecurring && (
                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                        <FormField
                                            control={form.control}
                                            name="recurrence_frequency"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Frequência</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="weekly">Semanal</SelectItem>
                                                            <SelectItem value="monthly">Mensal</SelectItem>
                                                            <SelectItem value="yearly">Anual</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="recurrence_end_date"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Repetir até</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "dd/MM/yyyy")
                                                                    ) : (
                                                                        <span>Selecione a data</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date()}
                                                                locale={ptBR}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                            </form>
                        </Form>
                    </div>

                    <DrawerFooter className="flex-row justify-end gap-2 pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline" className="flex-1">Cancelar</Button>
                        </DrawerClose>
                        <Button
                            className="flex-1"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Despesa
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
