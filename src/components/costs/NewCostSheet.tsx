import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Repeat, Receipt } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { CategoryTreeSelect, type CategoryNode } from "@/components/ui/category-tree-select";
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
import { Separator } from "@/components/ui/separator";
import { SleekDatePicker } from "@/components/ui/sleek-date-picker";
import { Textarea } from "@/components/ui/textarea";
import { StandardSheet, StandardSheetToggle } from "@/components/ui/StandardSheet";

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

interface NewCostSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewCostSheet({ open, onOpenChange }: NewCostSheetProps) {
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
            queryClient.invalidateQueries({ queryKey: ["payable-payments"] });
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

    return (
        <StandardSheet
            open={open}
            onOpenChange={onOpenChange}
            title="Nova Despesa"
            onSave={form.handleSubmit(onSubmit)}
            saveLabel="Salvar Despesa"
            isLoading={isPending}
            optionalFieldsToggles={
                <>
                    <StandardSheetToggle
                        label="Recorrente"
                        active={isRecurring}
                        onClick={() => form.setValue("is_recurring", !isRecurring)}
                        icon={<Repeat className="w-4 h-4" />}
                    />
                    <StandardSheetToggle
                        label="Já Pago"
                        active={isPaid}
                        onClick={() => form.setValue("is_paid", !isPaid)}
                        icon={<Receipt className="w-4 h-4" />}
                    />
                </>
            }
        >
            <Form {...form}>
                <form className="space-y-6">
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Mercado, Aluguel" {...field} />
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
                            name="expense_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vencimento</FormLabel>
                                    <FormControl>
                                        <SleekDatePicker
                                            date={field.value}
                                            onSelect={field.onChange}
                                            placeholder="Data de Vencimento"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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

                    <FormField
                        control={form.control}
                        name="observation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Observações</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Opcional"
                                        className="resize-y min-h-[80px]"
                                        maxLength={500}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {isRecurring && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-4">
                                <Separator className="flex-1" />
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Configuração de Recorrência</span>
                                <Separator className="flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
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
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                                                <span>Repetir até</span>
                                                <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>
                                            </FormLabel>
                                            <SleekDatePicker
                                                date={field.value}
                                                onSelect={field.onChange}
                                                placeholder="Repetir até"
                                                disabled={(date) => date < new Date()}
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {isPaid && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-4">
                                <Separator className="flex-1" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-2">Dados do Pagamento</span>
                                <Separator className="flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 p-4 border border-emerald-100 dark:border-emerald-900/30 rounded-xl bg-emerald-50/30 dark:bg-emerald-900/5">
                                <FormField
                                    control={form.control}
                                    name="payment_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data Pagamento</FormLabel>
                                            <FormControl>
                                                <SleekDatePicker
                                                    date={field.value}
                                                    onSelect={field.onChange}
                                                    placeholder="Data do Pagamento"
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
                                                    <SelectTrigger>
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
                                                    <SelectTrigger className="bg-white dark:bg-zinc-950">
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
                        </div>
                    )}
                </form>
            </Form>
        </StandardSheet>
    );
}
