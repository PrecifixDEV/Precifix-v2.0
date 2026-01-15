import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productService, type Product } from '@/services/productService';
import { toast } from 'sonner';

const saleParamsSchema = z.object({
    price: z.coerce.number().min(0, "Preço deve ser positivo"),
    sale_price: z.coerce.number().min(0, "Preço deve ser positivo"),
});

type SaleParamsFormValues = z.infer<typeof saleParamsSchema>;

interface ProductSaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onSuccess: () => void;
}

export function ProductSaleDialog({ open, onOpenChange, product, onSuccess }: ProductSaleDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<SaleParamsFormValues>({
        resolver: zodResolver(saleParamsSchema) as any,
        defaultValues: {
            price: 0,
            sale_price: 0,
        }
    });

    useEffect(() => {
        if (open && product) {
            setValue('price', product.price || 0);
            setValue('sale_price', product.sale_price || 0);
        }
    }, [open, product, setValue]);

    const onSubmit = async (data: SaleParamsFormValues) => {
        if (!product) return;

        try {
            setIsLoading(true);
            await productService.updateProduct(product.id, {
                is_for_sale: true,
                price: data.price, // Update cost price if changed
                sale_price: data.sale_price,
            });

            toast.success(`Protocolo de venda atualizado para ${product.name}`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao atualizar status de venda:", error);
            toast.error("Erro ao atualizar status de venda");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-white">
                        Configurar Venda
                    </DialogTitle>
                    <DialogDescription>
                        Defina os preços para disponibilizar <strong>{product?.name}</strong> para venda.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Preço de Custo (R$)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            {...register("price")}
                            className="bg-white dark:bg-slate-800"
                        />
                        {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sale_price">Preço de Venda (R$)</Label>
                        <Input
                            id="sale_price"
                            type="number"
                            step="0.01"
                            {...register("sale_price")}
                            className="bg-white dark:bg-slate-800"
                        />
                        {errors.sale_price && <span className="text-red-500 text-xs">{errors.sale_price.message}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white border-none">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar e Ativar Venda
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
