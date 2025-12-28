import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload } from 'lucide-react';
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
import { productService, type Product } from '@/services/productService';
import { supabase } from '@/lib/supabase';

const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Preço deve ser positivo"),
    stock_quantity: z.coerce.number().min(0, "Estoque deve ser positivo"),
    size: z.string().optional(),
    dilution: z.string().optional(),
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
    const [dilutionType, setDilutionType] = useState<'ready' | 'dilution'>('dilution');

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: '',
            code: '',
            description: '',
            price: 0,
            stock_quantity: 0,
            size: '',
            dilution: '',
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
                setValue('dilution', productToEdit.dilution || '');

                if (productToEdit.dilution === 'Pronto Uso') {
                    setDilutionType('ready');
                } else {
                    setDilutionType('dilution');
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
                    dilution: '',
                });
                setDilutionType('dilution'); // Default to dilution for new products, or maybe 'ready'? User decides.
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

    const onSubmit = async (data: ProductFormValues) => {
        try {
            setIsLoading(true);
            const userResponse = await supabase.auth.getUser();
            const user = userResponse.data.user;

            if (!user) {
                throw new Error("Usuário não autenticado");
            }

            let imageUrl = productToEdit?.image_url || null;

            if (imageFile) {
                imageUrl = await productService.uploadProductImage(imageFile);
            }

            const productData = {
                user_id: user.id,
                name: data.name,
                code: data.code || null,
                description: data.description || null,
                price: data.price,
                stock_quantity: data.stock_quantity,
                size: data.size || null,
                dilution: dilutionType === 'ready' ? 'Pronto Uso' : (data.dilution || null),
                image_url: imageUrl,
            };

            if (productToEdit) {
                await productService.updateProduct(productToEdit.id, productData);
            } else {
                await productService.createProduct(productData);
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao salvar produto:", error);
            // Ideally use a toast here
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
                        {productToEdit ? 'Editar Produto' : 'Novo Produto'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Image Upload */}
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                        />
                        {imagePreview ? (
                            <div className="relative w-32 h-32">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-md text-white font-medium">
                                    Alterar
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-sm">Clique para enviar imagem</span>
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
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Input id="description" {...register("description")} className="bg-white dark:bg-slate-800" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço (R$) *</Label>
                            <Input id="price" type="number" step="0.01" {...register("price")} className="bg-white dark:bg-slate-800" />
                            {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock_quantity">Estoque *</Label>
                            <Input id="stock_quantity" type="number" {...register("stock_quantity")} className="bg-white dark:bg-slate-800" />
                            {errors.stock_quantity && <span className="text-red-500 text-xs">{errors.stock_quantity.message}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="size">Tamanho (ex: 500ml)</Label>
                            <Input id="size" {...register("size")} className="bg-white dark:bg-slate-800" />
                            {(() => {
                                const sizeValue = watch("size");
                                const sizeNum = parseFloat(sizeValue || '0');
                                if (!isNaN(sizeNum) && sizeNum >= 1000) {
                                    const liters = sizeNum / 1000;
                                    return (
                                        <span className="text-xs text-slate-500 block pt-1">
                                            {liters.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {liters === 1 ? 'litro' : 'litros'}
                                        </span>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between h-5">
                                <Label className="mb-0">Tipo de Diluição</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="dilutionType"
                                            value="ready"
                                            checked={dilutionType === 'ready'}
                                            onChange={() => {
                                                setDilutionType('ready');
                                                setValue('dilution', 'Pronto Uso');
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
                                                setValue('dilution', '');
                                            }}
                                            className="accent-yellow-500 w-4 h-4"
                                        />
                                        <span className="text-sm font-medium">Diluível</span>
                                    </label>
                                </div>
                            </div>

                            {dilutionType === 'dilution' ? (
                                <Input
                                    id="dilution"
                                    placeholder="Ex: 1:10"
                                    {...register("dilution")}
                                    className="bg-white dark:bg-slate-800"
                                />
                            ) : (
                                <div className="h-10"></div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 border-none">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {productToEdit ? 'Salvar Alterações' : 'Criar Produto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
