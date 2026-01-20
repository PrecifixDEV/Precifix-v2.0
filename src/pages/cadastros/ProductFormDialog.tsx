import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Trash2, SprayCan, Brush, Zap, FileText, Tag, Image } from 'lucide-react';
import { toast } from 'sonner';
import { StandardSheet, StandardSheetToggle } from "@/components/ui/StandardSheet";
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { productService, type Product } from '@/services/productService';
import { compressAndConvertToWebP } from '@/utils/imageUtils';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().optional(),
    description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
    price: z.coerce.number().min(0.01, "Preço deve ser positivo"),
    stock_quantity: z.union([z.string(), z.number()])
        .transform((v) => (v === "" ? undefined : Number(v)))
        .refine((v) => v !== undefined && !isNaN(v) && v >= 0, { message: "Estoque deve ser positivo" }),
    size: z.string().optional(),
    is_dilutable: z.boolean().optional(),
    dilution_ratio: z.string().optional(),
    container_size_ml: z.union([z.string(), z.number()])
        .transform((v) => (v === "" ? undefined : Number(v)))
        .optional(),
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

type ProductType = 'liquid' | 'accessory' | 'machine';

export function ProductFormDialog({ open, onOpenChange, productToEdit, onSuccess }: ProductFormDialogProps) {
    const isMobile = useMobile();
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [productType, setProductType] = useState<ProductType>('liquid');

    // Toggle States for Optional Fields
    const [showDescription, setShowDescription] = useState(false);
    const [showResale, setShowResale] = useState(false);
    const [showPhoto, setShowPhoto] = useState(false);

    const dilutionFieldRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, setError, trigger } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        mode: "onChange",
        defaultValues: {
            name: '',
            code: '',
            description: '',
            price: 0,
            stock_quantity: '' as any,
            size: '',
            is_dilutable: false,
            dilution_ratio: '',
            container_size_ml: '' as any,
            is_for_sale: false,
            sale_price: 0,
        }
    });

    // Helper to sync local type state with form values
    const updateProductType = (type: ProductType) => {
        setProductType(type);
        if (type !== 'liquid') {
            setValue('is_dilutable', false);
            setValue('dilution_ratio', '');
            setValue('container_size_ml', undefined); // Clear container size for non-liquids
        }
    };

    useEffect(() => {
        if (open) {
            if (productToEdit) {
                setValue('name', productToEdit.name);
                setValue('code', productToEdit.code || '');
                setValue('description', productToEdit.description || '');
                setValue('price', productToEdit.price || 0);
                setValue('stock_quantity', productToEdit.stock_quantity || 0);
                setValue('size', productToEdit.size || '');
                setValue('is_dilutable', productToEdit.is_dilutable || false);
                setValue('dilution_ratio', productToEdit.dilution_ratio || '');
                setValue('container_size_ml', productToEdit.container_size_ml || 0);
                setValue('is_for_sale', productToEdit.is_for_sale || false);
                setValue('sale_price', productToEdit.sale_price || 0);

                setImagePreview(productToEdit.image_url);

                // Infer Type
                // If it has container_size_ml or is_dilutable, it's likely Liquid (unless we add strict type column later)
                // For now, heuristic:
                if (productToEdit.container_size_ml || productToEdit.is_dilutable) {
                    setProductType('liquid');
                } else {
                    // Default to accessory if no clear indicator
                    setProductType('accessory');
                }

                // Set Options Visibility based on existent data
                setShowDescription(!!productToEdit.description);
                setShowResale(!!productToEdit.is_for_sale);
                setShowPhoto(!!productToEdit.image_url);

            } else {
                reset({
                    name: '',
                    code: '',
                    description: '',
                    price: 0,
                    stock_quantity: '' as any,
                    size: '',
                    is_dilutable: false,
                    dilution_ratio: '',
                    container_size_ml: '' as any,
                    is_for_sale: false,
                    sale_price: 0,
                });
                setProductType('liquid');
                setImagePreview(null);
                setShowDescription(false);
                setShowResale(false);
                setShowPhoto(false);
            }
            setImageFile(null);
        }
    }, [open, productToEdit, reset, setValue]);

    // Auto-scroll to dilution field when it appears (mobile only)
    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'is_dilutable' && value.is_dilutable) {
                if (isMobile && dilutionFieldRef.current) {
                    setTimeout(() => {
                        dilutionFieldRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }, 100);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, isMobile]);

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
        e.stopPropagation();
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSaveClick = async () => {
        const isValid = await trigger();

        if (!isValid) {
            const fieldLabels: Record<string, string> = {
                name: 'Nome do Produto',
                price: 'Preço de Custo',
                stock_quantity: 'Estoque',
                container_size_ml: 'Tamanho da Embalagem',
                dilution_ratio: 'Proporção da Diluição'
            };

            const missingFields = Object.keys(errors)
                .map(key => fieldLabels[key] || key)
                .join(', ');

            toast.error('Preencha os campos obrigatórios', {
                description: missingFields,
                duration: 5000
            });
            return;
        }
        handleSubmit(onSubmit)();
    };

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setIsLoading(true);
            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;

            if (!user) throw new Error("Usuário não autenticado");

            const excludeId = (productToEdit && productToEdit.id) ? productToEdit.id : undefined;
            const checkCode = data.code ? data.code : undefined;

            const availability = await productService.checkProductAvailability(data.name, checkCode, excludeId);

            if (availability.nameExists) {
                setError('name', { type: 'manual', message: 'Já existe um produto com este nome.' });
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

            // Logic cleanup based on Product Type
            const isDilutable = productType === 'liquid' ? data.is_dilutable : false;
            const containerSize = productType === 'liquid' ? Number(data.container_size_ml) : null;

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
                container_size_ml: containerSize || null,
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
            alert("Erro ao salvar produto.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StandardSheet
            open={open}
            onOpenChange={onOpenChange}
            title={productToEdit?.id ? 'Editar Produto' : 'Novo Produto'}
            onSave={handleSaveClick}
            isLoading={isLoading}
            saveLabel={productToEdit && productToEdit.id ? 'Salvar Alterações' : 'Criar Produto'}
        >
            <div className="space-y-6">
                <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* 1. PRODUCT TYPE SELECTOR */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">O que deseja cadastrar?</Label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => updateProductType('liquid')}
                                className={cn(
                                    "flex items-center justify-center p-2 rounded-lg border-2 transition-all gap-2 h-12",
                                    productType === 'liquid'
                                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                                )}
                            >
                                <SprayCan className="w-5 h-5" />
                                <span className="text-xs font-bold">Produto</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => updateProductType('accessory')}
                                className={cn(
                                    "flex items-center justify-center p-2 rounded-lg border-2 transition-all gap-2 h-12",
                                    productType === 'accessory'
                                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                                )}
                            >
                                <Brush className="w-5 h-5" />
                                <span className="text-xs font-bold">Acessório</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => updateProductType('machine')}
                                className={cn(
                                    "flex items-center justify-center p-2 rounded-lg border-2 transition-all gap-2 h-12",
                                    productType === 'machine'
                                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                                )}
                            >
                                <Zap className="w-5 h-5" />
                                <span className="text-xs font-bold">Máquina</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. MANDATORY FIELDS */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Produto <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                {...register("name")}
                                className="bg-white dark:bg-zinc-950 border-input"
                                placeholder="Ex: Cera de Carnaúba"
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Qt. Pagou (R$) <span className="text-red-500">*</span></Label>
                                <CurrencyInput
                                    id="price"
                                    placeholder="0,00"
                                    value={watch('price')}
                                    onValueChange={(val) => setValue('price', val)}
                                    className="bg-white dark:bg-zinc-950 border-input"
                                />
                            </div>
                            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock_quantity">Estoque <span className="text-red-500">*</span></Label>
                            <Input
                                id="stock_quantity"
                                type="number"
                                {...register("stock_quantity")}
                                className="bg-white dark:bg-zinc-950 border-input"
                                placeholder="0"
                            />
                            {errors.stock_quantity && <p className="text-sm text-destructive">{errors.stock_quantity.message}</p>}
                        </div>
                    </div>
                    {/* 3. CONDITIONAL FIELDS (LIQUID ONLY) */}
                    {productType === 'liquid' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="container_size_ml">Tamanho da Embalagem (ml) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="container_size_ml"
                                    type="number"
                                    placeholder="Ex: 5000"
                                    {...register("container_size_ml")}
                                    className="bg-white dark:bg-zinc-950 border-input"
                                />
                                {errors.container_size_ml && <p className="text-sm text-destructive">{errors.container_size_ml.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Tipo de Uso</Label>
                                <div className="flex gap-4 pt-1">
                                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-1 border border-transparent has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-500/5">
                                        <input
                                            type="radio"
                                            name="dilutionType"
                                            checked={!watch("is_dilutable")}
                                            onChange={() => {
                                                setValue('is_dilutable', false);
                                                setValue('dilution_ratio', '');
                                            }}
                                            className="accent-yellow-500 w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Pronto Uso</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-1 border border-transparent has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-500/5">
                                        <input
                                            type="radio"
                                            name="dilutionType"
                                            checked={watch("is_dilutable")}
                                            onChange={() => setValue('is_dilutable', true)}
                                            className="accent-yellow-500 w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Diluível</span>
                                    </label>
                                </div>
                            </div>

                            {watch("is_dilutable") && (
                                <div ref={dilutionFieldRef} className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="dilution_ratio">Proporção (1:X) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="dilution_ratio"
                                        placeholder="Ex: 1:10"
                                        {...register("dilution_ratio")}
                                        className="bg-white dark:bg-zinc-950 border-input"
                                    />
                                    {errors.dilution_ratio && <p className="text-sm text-destructive">{errors.dilution_ratio.message}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="border-t border-zinc-200 dark:border-zinc-800 my-4" />



                    {/* 4. OPTIONAL FIELDS TOGGLES */}
                    <div className="space-y-4 pt-4">
                        <Label className="text-base text-muted-foreground">Campos opcionais</Label>
                        <div className="flex flex-wrap gap-2">
                            <StandardSheetToggle
                                label="Descrição"
                                active={showDescription}
                                onClick={() => setShowDescription(!showDescription)}
                                icon={<FileText className="h-4 w-4" />}
                            />
                            <StandardSheetToggle
                                label="Revenda"
                                active={showResale}
                                onClick={() => setShowResale(!showResale)}
                                icon={<Tag className="h-4 w-4" />}
                            />
                            <StandardSheetToggle
                                label="Foto"
                                active={showPhoto}
                                onClick={() => setShowPhoto(!showPhoto)}
                                icon={<Image className="h-4 w-4" />}
                            />
                        </div>
                    </div>

                    {/* 5. OPTIONAL SECTIONS RENDER */}
                    {showDescription && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="description">Descrição do Produto</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                className="bg-white dark:bg-zinc-950 min-h-[80px]"
                                placeholder="Detalhes adicionais..."
                                maxLength={500}
                            />
                            <div className="text-xs text-right text-muted-foreground">
                                {watch("description")?.length || 0}/500
                            </div>
                        </div>
                    )}

                    {showResale && (
                        <div className="space-y-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Disponível para Revenda?</Label>
                                    <p className="text-sm text-muted-foreground">Ative para vender este item diretamente</p>
                                </div>
                                <Switch
                                    checked={watch("is_for_sale")}
                                    onCheckedChange={(checked) => setValue("is_for_sale", checked)}
                                />
                            </div>
                            {watch("is_for_sale") && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
                                    <CurrencyInput
                                        id="sale_price"
                                        placeholder="0,00"
                                        value={watch('sale_price') || 0}
                                        onValueChange={(val) => setValue('sale_price', val)}
                                        className="bg-white dark:bg-zinc-950 border-input"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {showPhoto && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Imagem do Produto</Label>
                            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                {imagePreview ? (
                                    <div className="relative w-40 h-40 group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-md shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-sm z-10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <label
                                            htmlFor="file-upload-change"
                                            className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white text-xs px-2 py-1 rounded cursor-pointer z-10"
                                        >
                                            Alterar
                                        </label>
                                        <input
                                            id="file-upload-change"
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center w-full">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer flex flex-col items-center justify-center w-full h-full py-6 rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                        >
                                            <div className="mx-auto h-12 w-12 text-zinc-400">
                                                <Upload className="h-full w-full" />
                                            </div>
                                            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                <span>Enviar foto</span>
                                            </div>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                        <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP até 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </form >
            </div >
        </StandardSheet >
    );
}
