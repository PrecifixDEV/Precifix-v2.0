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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { productService, type Product } from '@/services/productService';
import { compressAndConvertToWebP } from '@/utils/imageUtils';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Preço deve ser positivo"),
    stock_quantity: z.coerce.number().min(0, "Estoque deve ser positivo"),
    size: z.string().optional(),
    is_dilutable: z.boolean().optional(),
    dilution_ratio: z.string().optional(),
    container_size_ml: z.coerce.number().optional(),
    is_for_sale: z.boolean().optional(),
    sale_price: z.coerce.number().optional(),
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

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, setError } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: '',
            code: '',
            description: '',
            price: 0,
            stock_quantity: 0,
            size: '',
            is_dilutable: false,
            dilution_ratio: '',
            container_size_ml: 0,
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
                setValue('price', productToEdit.price.toString() as any);
                setValue('stock_quantity', productToEdit.stock_quantity.toString() as any);
                setValue('size', productToEdit.size || '');
                setValue('is_dilutable', productToEdit.is_dilutable || false);
                setValue('dilution_ratio', productToEdit.dilution_ratio || '');
                setValue('container_size_ml', (productToEdit.container_size_ml || 0).toString() as any);
                setValue('is_for_sale', productToEdit.is_for_sale || false);
                setValue('sale_price', (productToEdit.sale_price || 0).toString() as any);

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
                    price: '0' as any,
                    stock_quantity: '0' as any,
                    size: '',
                    is_dilutable: false,
                    dilution_ratio: '',
                    container_size_ml: '0' as any,
                    is_for_sale: false,
                    sale_price: '0' as any,
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
            const availability = await productService.checkProductAvailability(data.name, data.code, excludeId);

            let hasError = false;
            if (availability.nameExists) {
                setError('name', { type: 'manual', message: 'Já existe um produto com este nome.' });
                hasError = true;
            }
            if (availability.codeExists) {
                setError('code', { type: 'manual', message: 'Já existe um produto com este código.' });
                hasError = true;
            }

            if (hasError) {
                setIsLoading(false);
                return;
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
                code: data.code || null,
                description: data.description || null,
                price: data.price,
                stock_quantity: data.stock_quantity,
                size: data.size || null,
                is_dilutable: isDilutable,
                dilution_ratio: isDilutable ? (data.dilution_ratio || null) : null,
                container_size_ml: isDilutable ? (data.container_size_ml || null) : null,
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
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">
                        {productToEdit && productToEdit.id ? 'Editar Produto' : 'Novo Produto'}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Produto *</Label>
                            <Input id="name" {...register("name")} className="bg-white dark:bg-slate-800" />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Código</Label>
                            <Input id="code" {...register("code")} className="bg-white dark:bg-slate-800" />
                            {errors.code && <span className="text-red-500 text-xs">{errors.code.message}</span>}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_for_sale"
                            checked={watch("is_for_sale")}
                            onCheckedChange={(checked) => setValue("is_for_sale", checked as boolean)}
                        />
                        <Label htmlFor="is_for_sale">Produto para Venda</Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" {...register("description")} className="bg-white dark:bg-slate-800" />
                    </div>

                    <div className={cn("grid gap-4", watch("is_for_sale") ? "grid-cols-3" : "grid-cols-2")}>
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço de Custo (R$) *</Label>
                            <Input id="price" type="number" step="0.01" {...register("price")} className="bg-white dark:bg-slate-800" />
                            {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
                        </div>

                        {watch("is_for_sale") && (
                            <div className="space-y-2">
                                <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
                                <Input id="sale_price" type="number" step="0.01" {...register("sale_price")} className="bg-white dark:bg-slate-800" />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="stock_quantity">Estoque *</Label>
                            <Input id="stock_quantity" type="number" {...register("stock_quantity")} className="bg-white dark:bg-slate-800" />
                            {errors.stock_quantity && <span className="text-red-500 text-xs">{errors.stock_quantity.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="size">Tamanho / Descrição</Label>
                            <Input id="size" placeholder="ex: 500ml ou 'Kit Completo'" {...register("size")} className="bg-white dark:bg-slate-800" />
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
                                            setValue('container_size_ml', 0);
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
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="dilution_ratio">Proporção da Diluição</Label>
                                <Input
                                    id="dilution_ratio"
                                    placeholder="Ex: 1:10"
                                    {...register("dilution_ratio")}
                                    className="bg-white dark:bg-slate-800"
                                />
                                <span className="text-xs text-slate-500">Ex: 1:10, 1:20, 1:100</span>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="container_size_ml">Tamanho da Embalagem (ml)</Label>
                                <Input
                                    id="container_size_ml"
                                    type="number"
                                    placeholder="Ex: 5000"
                                    {...register("container_size_ml")}
                                    className="bg-white dark:bg-slate-800"
                                />
                                <span className="text-xs text-slate-500">Volume total em ml (ex: 5L = 5000)</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 border-none">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {productToEdit && productToEdit.id ? 'Salvar Alterações' : 'Criar Produto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
