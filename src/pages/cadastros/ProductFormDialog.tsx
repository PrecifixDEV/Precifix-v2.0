import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { productService, type Product } from '@/services/productService';
import { compressAndConvertToWebP } from '@/utils/imageUtils';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().optional(),
    description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
    price: z.union([z.string(), z.number()])
        .transform((v) => (v === "" ? undefined : Number(v)))
        .refine((v) => v !== undefined && !isNaN(v) && v >= 0, { message: "Preço deve ser positivo" }),
    stock_quantity: z.union([z.string(), z.number()])
        .transform((v) => (v === "" ? undefined : Number(v)))
        .refine((v) => v !== undefined && !isNaN(v) && v >= 0, { message: "Estoque deve ser positivo" }),
    size: z.string().optional(),
    is_dilutable: z.boolean().optional(),
    dilution_ratio: z.string().optional(),
    container_size_ml: z.union([z.string(), z.number()])
        .transform((v) => (v === "" ? undefined : Number(v)))
        .refine((v) => v !== undefined && !isNaN(v) && v > 0, { message: "Tamanho da embalagem é obrigatório" }),
    is_for_sale: z.boolean().optional(),
    sale_price: z.coerce.number().optional(),
}).superRefine((data, ctx) => {
    if (data.is_dilutable && !data.dilution_ratio) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Proporção da diluição é obrigatória para produtos diluíveis",
            path: ["dilution_ratio"],
        });
    }
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productToEdit?: Product | null;
    onSuccess: () => void;
}

export function ProductFormDialog({ open, onOpenChange, productToEdit, onSuccess }: ProductFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [dilutionType, setDilutionType] = useState<'ready' | 'dilution'>('ready');

    const { register, handleSubmit, formState: { errors, isValid }, reset, setValue, watch, setError } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        mode: "onChange",
        defaultValues: {
            name: '',
            code: '',
            description: '',
            price: '' as any,
            stock_quantity: '' as any,
            size: '',
            is_dilutable: false,
            dilution_ratio: '',
            container_size_ml: '' as any,
            is_for_sale: false,
            sale_price: 0,
        }
    });

    useEffect(() => {
        if (open) {
            if (productToEdit) {
                setValue('name', productToEdit.name);
                setValue('code', productToEdit.code || '');
                setValue('description', productToEdit.description || '');
                setValue('price', productToEdit.price);
                setValue('stock_quantity', productToEdit.stock_quantity);
                setValue('size', productToEdit.size || '');
                setValue('is_dilutable', productToEdit.is_dilutable || false);
                setValue('dilution_ratio', productToEdit.dilution_ratio || '');
                setValue('container_size_ml', productToEdit.container_size_ml || 0);
                setValue('is_for_sale', productToEdit.is_for_sale || false);
                setValue('sale_price', productToEdit.sale_price || 0);

                if (productToEdit.is_dilutable) {
                    setDilutionType('dilution');
                } else {
                    setDilutionType('ready');
                }

                setImagePreview(productToEdit.image_url);
            } else {
                reset({
                    name: '',
                    code: '',
                    description: '',
                    price: '' as any,
                    stock_quantity: '' as any,
                    size: '',
                    is_dilutable: false,
                    dilution_ratio: '',
                    container_size_ml: '' as any,
                    is_for_sale: false,
                    sale_price: 0,
                });
                setDilutionType('ready');
                setImagePreview(null);
            }
            setImageFile(null);
        }
    }, [open, productToEdit, reset, setValue]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering any parent click
        setImageFile(null);
        setImagePreview(null);
    };

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setIsLoading(true);
            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;

            if (!user) {
                throw new Error("Usuário não autenticado");
            }

            const excludeId = (productToEdit && productToEdit.id) ? productToEdit.id : undefined;
            // Skip code check if we are generating it or if it is empty for now (will be generated)
            const checkCode = data.code ? data.code : undefined;

            const availability = await productService.checkProductAvailability(data.name, checkCode, excludeId);

            let hasError = false;
            if (availability.nameExists) {
                setError('name', { type: 'manual', message: 'Já existe um produto com este nome.' });
                hasError = true;
            }

            if (hasError) {
                setIsLoading(false);
                return;
            }

            let finalCode = data.code;
            if (!finalCode) {
                finalCode = `PRD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;
            }

            let imageUrl = productToEdit?.image_url || null;

            if (imageFile) {
                try {
                    const compressedFile = await compressAndConvertToWebP(imageFile);
                    imageUrl = await productService.uploadProductImage(compressedFile);
                } catch (error) {
                    console.error("Erro na compressão:", error);
                    imageUrl = await productService.uploadProductImage(imageFile);
                }
            } else if (!imagePreview) {
                imageUrl = null;
            }

            const isDilutable = dilutionType === 'dilution';

            const productData = {
                user_id: user.id,
                name: data.name,
                code: finalCode || null,
                description: data.description || null,
                price: Number(data.price),
                stock_quantity: Number(data.stock_quantity),
                size: data.size || null,
                is_dilutable: isDilutable,
                dilution_ratio: isDilutable ? (data.dilution_ratio || null) : null,
                container_size_ml: isDilutable ? (Number(data.container_size_ml) || null) : Number(data.container_size_ml),
                image_url: imageUrl,
                is_for_sale: data.is_for_sale || false,
                sale_price: data.sale_price || 0,
            };

            if (productToEdit && productToEdit.id) {
                await productService.updateProduct(productToEdit.id, productData);
            } else {
                await productService.createProduct(productData);
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            alert("Erro ao salvar produto. Verifique se você está logado ou tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto w-[90vw] sm:w-full" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">
                        {productToEdit?.id ? 'Editar Produto' : productToEdit ? 'Clonando Produto Existente' : 'Novo Produto'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Image Upload */}
                    <div className="flex flex-col items-center justify-center p-4">
                        {imagePreview ? (
                            <div className="relative w-40 h-40 group">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-md border border-slate-200 dark:border-slate-700"
                                />

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <label
                                        htmlFor="image-upload"
                                        className="bg-black/60 hover:bg-black/80 text-white text-sm font-medium px-3 py-1.5 rounded cursor-pointer pointer-events-auto transition-colors"
                                    >
                                        Alterar
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-sm transition-colors z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    title="Remover imagem"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 pointer-events-none">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-sm">Clique para enviar imagem</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="!text-foreground">Nome do Produto *</Label>
                            <TooltipProvider>
                                <Tooltip open={!!errors.name}>
                                    <TooltipTrigger asChild>
                                        <Input
                                            id="name"
                                            {...register("name")}
                                            className="bg-white dark:bg-slate-800"
                                            placeholder="Ex: Cera de Carnaúba"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                        <p>{errors.name?.message}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        {/* Hidden Code Input Field - kept in state but not shown */}
                        <input type="hidden" {...register("code")} />
                    </div>

                    <div className="space-y-2">
                        <Label>Destinação do Produto</Label>
                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="usageType"
                                    checked={!watch("is_for_sale")}
                                    onChange={() => setValue("is_for_sale", false)}
                                    className="accent-yellow-500 w-4 h-4"
                                />
                                <span className="text-sm font-medium">Uso Próprio</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="usageType"
                                    checked={watch("is_for_sale")}
                                    onChange={() => setValue("is_for_sale", true)}
                                    className="accent-yellow-500 w-4 h-4"
                                />
                                <span className="text-sm font-medium">Revenda</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            className="bg-white dark:bg-slate-800 min-h-[60px] resize-y"
                            maxLength={500}
                            rows={2}
                            placeholder="Máximo 500 caracteres"
                        />
                        <div className="text-xs text-right text-muted-foreground">
                            {watch("description")?.length || 0}/500
                        </div>
                    </div>

                    <div className={cn("grid gap-4", watch("is_for_sale") ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
                        <div className="space-y-2">
                            <Label htmlFor="price" className="!text-foreground">Preço de Custo (R$) *</Label>
                            <TooltipProvider>
                                <Tooltip open={!!errors.price}>
                                    <TooltipTrigger asChild>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            {...register("price")}
                                            className="bg-white dark:bg-slate-800"
                                            placeholder="R$ 0,00"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                        <p>{errors.price?.message}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {watch("is_for_sale") && (
                            <div className="space-y-2">
                                <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
                                <Input id="sale_price" type="number" step="0.01" {...register("sale_price")} className="bg-white dark:bg-slate-800" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="stock_quantity" className="!text-foreground">Estoque *</Label>
                            <TooltipProvider>
                                <Tooltip open={!!errors.stock_quantity}>
                                    <TooltipTrigger asChild>
                                        <Input
                                            id="stock_quantity"
                                            type="number"
                                            {...register("stock_quantity")}
                                            className="bg-white dark:bg-slate-800"
                                            placeholder="Ex: 10"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                        <p>{errors.stock_quantity?.message}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="container_size_ml" className="!text-foreground">Tamanho da Embalagem (ml) *</Label>
                            <TooltipProvider>
                                <Tooltip open={!!errors.container_size_ml}>
                                    <TooltipTrigger asChild>
                                        <Input
                                            id="container_size_ml"
                                            type="number"
                                            placeholder="Ex: 5000"
                                            {...register("container_size_ml")}
                                            className="bg-white dark:bg-slate-800"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                        <p>{errors.container_size_ml?.message}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-xs text-slate-500">Volume total em ml (ex: 5L = 5000)</span>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Produto</Label>
                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="dilutionType"
                                        value="ready"
                                        checked={dilutionType === 'ready'}
                                        onChange={() => {
                                            setDilutionType('ready');
                                            setValue('is_dilutable', false);
                                            setValue('dilution_ratio', '');
                                            // Don't reset container size as it's now always required
                                        }}
                                        className="accent-yellow-500 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium whitespace-nowrap">Pronto Uso</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="dilutionType"
                                        value="dilution"
                                        checked={dilutionType === 'dilution'}
                                        onChange={() => {
                                            setDilutionType('dilution');
                                            setValue('is_dilutable', true);
                                        }}
                                        className="accent-yellow-500 w-4 h-4"
                                    />
                                    <span className="text-sm font-medium">Diluível</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {dilutionType === 'dilution' && (
                        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="dilution_ratio" className="!text-foreground">Proporção da Diluição *</Label>
                                <TooltipProvider>
                                    <Tooltip open={!!errors.dilution_ratio}>
                                        <TooltipTrigger asChild>
                                            <Input
                                                id="dilution_ratio"
                                                placeholder="Ex: 1:10"
                                                {...register("dilution_ratio")}
                                                className="bg-white dark:bg-slate-800"
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" align="start" className="bg-destructive text-destructive-foreground border-destructive">
                                            <p>{errors.dilution_ratio?.message}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <span className="text-xs text-slate-500">Ex: 1:10, 1:20, 1:100</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !isValid}
                            className={cn(
                                "border-none",
                                !isValid ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                            )}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {productToEdit && productToEdit.id ? 'Salvar Alterações' : 'Criar Produto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
