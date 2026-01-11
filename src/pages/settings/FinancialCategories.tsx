import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    CATEGORY_TYPES,
    type FinancialCategory,
    financialCategoriesService
} from "@/services/financialCategoriesService";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Schema for Add/Edit
const categorySchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    type: z.enum(CATEGORY_TYPES), // Uses the tuple from service
    description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function FinancialCategories() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);

    // Fetch Categories
    const { data: categories = [], isLoading, isError } = useQuery({
        queryKey: ['financialCategories'],
        queryFn: async () => {
            // Try to initialize defaults first if needed (this handles the "first run" logic)
            await financialCategoriesService.initializeDefaults();
            return financialCategoriesService.getAll();
        },
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: financialCategoriesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financialCategories'] });
            toast.success("Categoria criada com sucesso!");
            setIsDialogOpen(false);
            form.reset();
        },
        onError: () => toast.error("Erro ao criar categoria."),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<FinancialCategory> }) =>
            financialCategoriesService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financialCategories'] });
            toast.success("Categoria atualizada com sucesso!");
            setIsDialogOpen(false);
            setEditingCategory(null);
            form.reset();
        },
        onError: () => toast.error("Erro ao atualizar categoria."),
    });

    const deleteMutation = useMutation({
        mutationFn: financialCategoriesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financialCategories'] });
            toast.success("Categoria removida.");
        },
        onError: () => toast.error("Erro ao remover categoria."),
    });

    // Form
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            type: CATEGORY_TYPES[0],
            description: "",
        },
    });

    // Reset form when dialog opens/closes or editing changes
    useEffect(() => {
        if (editingCategory) {
            form.reset({
                name: editingCategory.name,
                type: editingCategory.type,
                description: editingCategory.description || "",
            });
        } else {
            form.reset({
                name: "",
                type: CATEGORY_TYPES[0],
                description: "",
            });
        }
    }, [editingCategory, form, isDialogOpen]);

    const onSubmit = (values: CategoryFormValues) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, updates: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const handleEdit = (category: FinancialCategory) => {
        setEditingCategory(category);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (isError) return <div className="p-8 text-red-500 flex items-center gap-2"><AlertCircle /> Erro ao carregar categorias.</div>;

    // Group categories by type
    const categoriesByType = CATEGORY_TYPES.reduce((acc, type) => {
        acc[type] = categories.filter(c => c.type === type);
        return acc;
    }, {} as Record<string, FinancialCategory[]>);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorias Financeiras</h1>
                    <p className="text-muted-foreground">
                        Gerencie as categorias de receitas e despesas da sua empresa.
                    </p>
                </div>
                <Button onClick={() => { setEditingCategory(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Categoria
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                        <DialogDescription>
                            Preencha os dados da categoria abaixo.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Grupo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o grupo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CATEGORY_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Categoria</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Venda de Produtos" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Breve descrição ou tooltip" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {createMutation.isPending || updateMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Tabs defaultValue={CATEGORY_TYPES[0]} className="w-full">
                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0 mb-4">
                    {CATEGORY_TYPES.map((type) => (
                        <TabsTrigger
                            key={type}
                            value={type}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-all"
                        >
                            {type.split(" (")[0]} {/* Abbreviate title for tab */}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {CATEGORY_TYPES.map((type) => (
                    <TabsContent key={type} value={type}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{type}</CardTitle>
                                <CardDescription>Gerencie as itens deste grupo.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {categoriesByType[type]?.length === 0 ? (
                                    <p className="text-muted-foreground text-sm italic py-4">Nenhuma categoria encontrada neste grupo.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {categoriesByType[type]?.map((category) => (
                                            <div
                                                key={category.id}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="space-y-1">
                                                    <p className="font-medium">{category.name}</p>
                                                    {category.description && (
                                                        <p className="text-xs text-muted-foreground">{category.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id, category.name)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
