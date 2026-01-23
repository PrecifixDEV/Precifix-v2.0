import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";
import { useMobile } from "@/hooks/useMobile";
import { Button } from "@/components/ui/button";
import { CategoryTreeSelect, type CategoryNode } from "@/components/ui/category-tree-select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
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
import { CurrencyInput } from "@/components/ui/currency-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ResponsiveDatePicker } from "@/components/ui/responsive-date-picker";
import { Textarea } from "@/components/ui/textarea";

import { costService } from "@/services/costService";
import { financialCategoriesService, type FinancialCategory } from "@/services/financialCategoriesService";
import { paymentMethodsService } from "@/services/paymentMethodsService";
import { financialService } from "@/services/financialService";

const costSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória"),
    observation: z.string().max(500, "Máximo de 500 caracteres").optional(),
    value: z.coerce.number().min(0.01, "Valor é obrigatório"),
    expense_date: z.date(),
    category: z.string().min(1, "Categoria é obrigatória"),
    is_recurring: z.boolean().default(false),
    recurrence_frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    recurrence_end_date: z.date().optional(),
    is_paid: z.boolean().default(false),
    payment_date: z.date().optional(),
    payment_method: z.string().optional(),
    account_id: z.string().optional(),
}).refine((data) => {
    if (data.is_paid) {
        return !!data.payment_method && !!data.account_id && !!data.payment_date;
    }
    return true;
}, {
    message: "Preencha os dados do pagamento",
    path: ["account_id"],
});

type CostFormValues = z.infer<typeof costSchema>;

interface NewCostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewCostDialog({ open, onOpenChange }: NewCostDialogProps) {
    const isMobile = useMobile();
    const queryClient = useQueryClient();

    // --- Data Fetching ---
    const { data: configuredCategories } = useQuery({
        queryKey: ['financial_categories'],
        queryFn: financialCategoriesService.getAll,
        staleTime: 1000 * 60 * 5
    });

    const { data: paymentMethods } = useQuery({
        queryKey: ['payment_methods'],
        queryFn: paymentMethodsService.getAll,
        staleTime: 1000 * 60 * 30
    });

    const { data: accounts } = useQuery({
        queryKey: ['commercial_accounts'],
        queryFn: financialService.getAccounts,
        staleTime: 1000 * 60 * 5
    });

    const categoryTree = useMemo<CategoryNode[]>(() => {
        const cats = (configuredCategories || []) as FinancialCategory[];
        if (!cats.length) return [];
        const roots = cats.filter(c => !c.parent_id && c.scope === 'EXPENSE');
        return roots.map(root => {
            const children = cats.filter(c => c.parent_id === root.id);
            return {
                id: root.id,
                label: root.name,
                subcategories: children.map(child => ({
                    id: child.id,
                    label: child.name
                })).sort((a, b) => a.label.localeCompare(b.label))
            };
        }).sort((a, b) => a.label.localeCompare(b.label));
    }, [configuredCategories]);

    const form = useForm<CostFormValues>({
        resolver: zodResolver(costSchema) as any,
        defaultValues: {
            description: "",
            observation: "",
            value: 0,
            expense_date: new Date(),
            category: "",
            is_recurring: false,
            recurrence_frequency: "monthly",
            recurrence_end_date: undefined,
            is_paid: false,
            payment_date: new Date(),
            payment_method: "",
            account_id: "",
        },
    });

    const isRecurring = form.watch("is_recurring");
    const isPaid = form.watch("is_paid");

    // Reset form when opening
    useEffect(() => {
        if (open) {
            form.reset({
                description: "",
                observation: "",
                value: 0,
                expense_date: new Date(),
                category: "",
                is_recurring: false,
                recurrence_frequency: "monthly",
                is_paid: false,
                payment_date: new Date(),
                payment_method: "",
                account_id: "",
            });
        }
    }, [open, form]);

    const { mutate: saveCost, isPending } = useMutation({
        mutationFn: async (values: CostFormValues) => {
            const numValue = values.value;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const savedCosts = await costService.saveCost({
                description: values.description,
                observation: values.observation,
                value: numValue,
                type: 'variable',
                expense_date: format(values.expense_date, "yyyy-MM-dd"),
                category: values.category,
                is_recurring: values.is_recurring,
                recurrence_frequency: values.is_recurring ? values.recurrence_frequency : undefined,
                recurrence_end_date: values.is_recurring && values.recurrence_end_date ? format(values.recurrence_end_date, "yyyy-MM-dd") : undefined,
            } as any);

            if (values.is_paid && savedCosts && Array.isArray(savedCosts) && savedCosts.length > 0) {
                const cost = savedCosts[0];

                await financialService.createTransaction({
                    description: `Pgto: ${values.description}`,
                    category: values.category,
                    payment_method: values.payment_method,
                    amount: numValue,
                    type: 'debit',
                    transaction_date: values.payment_date ? values.payment_date.toISOString() : new Date().toISOString(),
                    account_id: values.account_id || null,
                    related_entity_type: 'operational_cost',
                    related_entity_id: cost.id,
                });

                const { error: paymentError } = await supabase.from('operational_cost_payments').insert({
                    user_id: user?.id,
                    operational_cost_id: cost.id,
                    description: values.description,
                    due_date: format(values.expense_date, 'yyyy-MM-dd'),
                    amount_original: numValue,
                    amount_paid: numValue,
                    payment_date: values.payment_date ? values.payment_date.toISOString() : new Date().toISOString(),
                    status: 'paid'
                });

                if (paymentError) {
                    console.error("Error creating payment record:", paymentError);
                    toast.error("Erro ao registrar status de pagamento.");
                }
            }
        },
        onSuccess: () => {
            toast.success("Despesa salva com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["operationalCosts"] });
            queryClient.invalidateQueries({ queryKey: ["financial_transactions"] });
            queryClient.invalidateQueries({ queryKey: ["operationalCostPayments"] });
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

    // Shared form content
    const formContent = (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <div className="flex gap-3">
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Mercado, Aluguel" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="expense_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col w-[150px]">
                                <FormLabel>Vencimento</FormLabel>
                                <FormControl>
                                    <ResponsiveDatePicker
                                        date={field.value}
                                        onSelect={field.onChange}
                                        label="Data de Vencimento"
                                        className="h-9"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor (R$)</FormLabel>
                                <FormControl>
                                    <CurrencyInput
                                        placeholder="0,00"
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    />
                                </FormControl>
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
                                <CategoryTreeSelect
                                    data={categoryTree}
                                    value={field.value}
                                    onSelect={field.onChange}
                                    placeholder="Selecione..."
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="observation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Opcional"
                                    className="resize-y min-h-[60px]"
                                    maxLength={500}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator className="my-2" />

                <FormField
                    control={form.control}
                    name="is_recurring"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm bg-zinc-50 dark:bg-zinc-900/50">
                            <FormLabel className="text-base">Despesa Recorrente?</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={(val) => {
                                        field.onChange(val);
                                    }}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {isRecurring && (
                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 p-3 border rounded-md border-t-0 rounded-t-none -mt-3 bg-zinc-50 dark:bg-zinc-900/50 mb-2">
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
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="recurrence_end_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Repetir até (Opcional)</FormLabel>
                                    <ResponsiveDatePicker
                                        date={field.value}
                                        onSelect={field.onChange}
                                        label="Repetir até"
                                        placeholder="Indefinido"
                                        disabled={(date) => date < new Date()}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="space-y-3">
                    <FormField
                        control={form.control}
                        name="is_paid"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 shadow-sm bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800">
                                <FormLabel className="text-base text-emerald-700 dark:text-emerald-400">
                                    {isRecurring ? "Primeira fatura paga?" : "Já está pago?"}
                                </FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {isPaid && (
                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 p-3 border border-emerald-100 dark:border-emerald-800 rounded-md bg-emerald-50/50 dark:bg-emerald-900/5 -mt-2">
                            <FormField
                                control={form.control}
                                name="payment_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Data Pagamento</FormLabel>
                                        <FormControl>
                                            <ResponsiveDatePicker
                                                date={field.value}
                                                onSelect={field.onChange}
                                                label="Data do Pagamento"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meio Pgto</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {paymentMethods?.map(pm => (
                                                    <SelectItem key={pm.id} value={pm.name}>{pm.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="account_id"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Conta de Origem</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-background">
                                                    <SelectValue placeholder="Selecione a conta" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts?.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </div>
            </form>
        </Form>
    );

    // Mobile: Drawer
    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange} dismissible={true}>
                <DrawerContent className="max-h-[95vh]">
                    <DrawerHeader>
                        <DrawerTitle>Nova Despesa</DrawerTitle>
                        <DrawerDescription>
                            Lançamento de contas a pagar ou despesas avulsas.
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto px-4">
                        {formContent}
                    </div>

                    <DrawerFooter className="pt-2 border-t">
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Despesa
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
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Nova Despesa</DialogTitle>
                    <DialogDescription>
                        Lançamento de contas a pagar ou despesas avulsas.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-1">
                    {formContent}
                </div>

                <DialogFooter className="flex-row justify-end gap-2 pt-2 border-t mt-auto p-4 bg-zinc-50 dark:bg-zinc-900/50">
                    <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none bg-background">Cancelar</Button>
                    <Button
                        className="flex-1 sm:flex-none"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Despesa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
