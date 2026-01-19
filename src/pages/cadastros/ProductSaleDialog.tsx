import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CircleCheckBig } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
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

    const { register, handleSubmit, formState: { errors }, setValue, trigger } = useForm<SaleParamsFormValues>({
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

    const handleSaveClick = async () => {
        const isValid = await trigger();

        if (!isValid) {
            const fieldLabels: Record<string, string> = {
                price: 'Preço de Custo',
                sale_price: 'Preço de Venda'
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
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[400px] w-full p-0 flex flex-col bg-white dark:bg-zinc-900 shadow-xl z-[100]" side="right" aria-describedby={undefined}>
                <SheetHeader className="h-16 px-6 shadow-md flex justify-center shrink-0 bg-yellow-500">
                    <SheetTitle className="text-zinc-900 text-center font-bold">
                        Configurar Venda
                    </SheetTitle>
                </SheetHeader>

                <div className="overflow-y-auto px-6 py-4">
                    <SheetDescription className="mb-4">
                        Defina os preços para disponibilizar <strong>{product?.name}</strong> para venda.
                    </SheetDescription>
                    <form id="sale-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço de Custo (R$)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register("price")}
                                className="bg-white dark:bg-zinc-800"
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
                                className="bg-white dark:bg-zinc-800"
                            />
                            {errors.sale_price && <span className="text-red-500 text-xs">{errors.sale_price.message}</span>}
                        </div>
                    </form>
                </div>

                <div className="p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.1)] bg-white dark:bg-zinc-900">
                    <Button
                        onClick={handleSaveClick}
                        disabled={isLoading}
                        className="w-full border-none bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all hover:scale-[1.02] flex items-center justify-between"
                    >
                        <span className="flex items-center">
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Salvar e Ativar Venda
                        </span>
                        <CircleCheckBig className="h-8 w-8 shrink-0" style={{ minWidth: '32px', minHeight: '32px' }} />
                    </Button>
                </div>            </SheetContent>
        </Sheet>
    );
}
