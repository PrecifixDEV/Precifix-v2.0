import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    type FinancialCategory,
    type FinancialScope,
    financialCategoriesService
} from "@/services/financialCategoriesService";
import { Button } from "@/components/ui/button";
import {
    Card,
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
import { Loader2, Plus, Pencil, Trash2, AlertCircle, ChevronRight, ChevronDown, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Schema for Add/Edit
const categorySchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    scope: z.enum(['INCOME', 'EXPENSE']).optional(), // Required for root
    parent_id: z.string().nullable().optional(),   // Required for child
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function FinancialCategories() {
    const queryClient = useQueryClient();

    // UI State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
    const [parentForNewSub, setParentForNewSub] = useState<FinancialCategory | null>(null); // If set, we are creating a subcategory under this parent
    const [activeTab, setActiveTab] = useState<FinancialScope>('EXPENSE');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Fetch Categories
    const { data: categories = [], isLoading, isError } = useQuery({
        queryKey: ['financialCategories'],
        queryFn: async () => {
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
            handleCloseDialog();
        },
        onError: () => toast.error("Erro ao criar categoria."),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<FinancialCategory> }) =>
            financialCategoriesService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financialCategories'] });
            toast.success("Categoria atualizada com sucesso!");
            handleCloseDialog();
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
            description: "",
            scope: 'EXPENSE',
            parent_id: null
        },
    });

    // Reset/Setup Form
    useEffect(() => {
        if (isDialogOpen) {
            if (editingCategory) {
                // Editing existing
                form.reset({
                    name: editingCategory.name,
                    description: editingCategory.description || "",
                    scope: editingCategory.scope,
                    parent_id: editingCategory.parent_id || null,
                });
            } else if (parentForNewSub) {
                // Creating new Subcategory
                form.reset({
                    name: "",
                    description: "",
                    scope: undefined, // Subcategories don't strictly need scope in form if logic handles it, or inherit
                    parent_id: parentForNewSub.id
                });
            } else {
                // Creating new Root Category
                form.reset({
                    name: "",
                    description: "",
                    scope: activeTab, // Default to current tab
                    parent_id: null
                });
            }
        }
    }, [isDialogOpen, editingCategory, parentForNewSub, activeTab, form]);

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setParentForNewSub(null);
        form.reset();
    };

    const onSubmit = (values: CategoryFormValues) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, updates: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const handleEdit = (category: FinancialCategory) => {
        setEditingCategory(category);
        setParentForNewSub(null);
        setIsDialogOpen(true);
    };

    const handleCreateRoot = () => {
        setEditingCategory(null);
        setParentForNewSub(null);
        setIsDialogOpen(true);
    };

    const handleCreateSub = (parent: FinancialCategory) => {
        setEditingCategory(null);
        setParentForNewSub(parent);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Tem certeza que deseja excluir "${name}"? Se for uma categoria principal, todas as subcategorias também podem ser afetadas.`)) {
            deleteMutation.mutate(id);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Calculate Tree
    const categoryTree = useMemo(() => {
        const roots = categories.filter(c => !c.parent_id);
        const children = categories.filter(c => c.parent_id);

        const tree = roots.map(root => ({
            ...root,
            children: children.filter(c => c.parent_id === root.id)
        }));

        return {
            INCOME: tree.filter(n => n.scope === 'INCOME'),
            EXPENSE: tree.filter(n => n.scope === 'EXPENSE')
        };
    }, [categories]);


    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (isError) return <div className="p-8 text-red-500 flex items-center gap-2"><AlertCircle /> Erro ao carregar categorias.</div>;

    const currentList = activeTab === 'INCOME' ? categoryTree.INCOME : categoryTree.EXPENSE;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categorias Financeiras</h1>
                    <p className="text-muted-foreground">
                        Organize suas receitas e despesas em categorias e subcategorias.
                    </p>
                </div>
                <Button onClick={handleCreateRoot}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Categoria Principal
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FinancialScope)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="INCOME">Receitas (Entradas)</TabsTrigger>
                    <TabsTrigger value="EXPENSE">Despesas (Saídas)</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0 space-y-4">
                    {currentList.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                            Nenhuma categoria cadastrada neste grupo.
                        </div>
                    ) : (
                        currentList.map((root) => (
                            <Card key={root.id} className="overflow-hidden">
                                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => toggleExpand(root.id)}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0"
                                        // onClick handled by parent div
                                        >
                                            {expandedCategories[root.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Button>
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                {root.name}
                                                <span className="text-xs font-normal text-muted-foreground bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                    {root.children?.length || 0}
                                                </span>
                                            </h3>
                                            {root.description && <p className="text-sm text-muted-foreground">{root.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => handleCreateSub(root)} className="hidden sm:flex" title="Adicionar Subcategoria">
                                            <FolderPlus className="mr-2 h-4 w-4 text-emerald-600" />
                                            Subcategoria
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleCreateSub(root)} className="sm:hidden" title="Adicionar Subcategoria">
                                            <FolderPlus className="h-4 w-4 text-emerald-600" />
                                        </Button>
                                        <Separator orientation="vertical" className="h-6 mx-1" />
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(root)}>
                                            <Pencil className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(root.id, root.name)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>

                                {expandedCategories[root.id] && (
                                    <div className="border-t bg-white dark:bg-card">
                                        {root.children && root.children.length > 0 ? (
                                            <div className="divide-y">
                                                {root.children.map((child) => (
                                                    <div key={child.id} className="flex items-center justify-between p-3 pl-12 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        <div>
                                                            <p className="font-medium">{child.name}</p>
                                                            {child.description && <p className="text-xs text-muted-foreground">{child.description}</p>}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(child)}>
                                                                <Pencil className="h-3 w-3 text-muted-foreground" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(child.id, child.name)}>
                                                                <Trash2 className="h-3 w-3 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 pl-12 text-sm text-muted-foreground italic">
                                                Nenhuma subcategoria.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Editar Categoria" : (parentForNewSub ? `Nova Subcategoria em ${parentForNewSub.name}` : "Nova Categoria Principal")}
                        </DialogTitle>
                        <DialogDescription>
                            Preencha os dados abaixo.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Serviços, Aluguel..." {...field} />
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
                                            <Input placeholder="Breve descrição" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Scope is only relevant if creating a root category (no parent) and not editing */}
                            {!parentForNewSub && !editingCategory?.parent_id && (
                                <FormField
                                    control={form.control}
                                    name="scope"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                    <Button
                                                        type="button"
                                                        variant={field.value === 'INCOME' ? 'default' : 'ghost'}
                                                        onClick={() => field.onChange('INCOME')}
                                                        className="flex-1"
                                                    >
                                                        Receita
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={field.value === 'EXPENSE' ? 'default' : 'ghost'}
                                                        onClick={() => field.onChange('EXPENSE')}
                                                        className="flex-1"
                                                    >
                                                        Despesa
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

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
        </div>
    );
}
