
import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { servicesService, type ServiceProduct } from "@/services/servicesService";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ServiceAnalysisSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    service: any | null; // using any for now to avoid strict type issues with the joined data, but ideally ServiceWithProductCount
}

export const ServiceAnalysisSheet = ({ open, onOpenChange, service }: ServiceAnalysisSheetProps) => {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<ServiceProduct[]>([]);

    useEffect(() => {
        if (open && service?.id) {
            loadAnalysis();
        }
    }, [open, service]);

    const loadAnalysis = async () => {
        setLoading(true);
        try {
            const data = await servicesService.getServiceProducts(service.id);
            setProducts(data || []);
        } catch (error) {
            console.error("Error loading analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateProductCost = (item: ServiceProduct) => {
        const product = item.products;
        if (!product || !product.price || !product.container_size_ml) return 0;

        const pricePerMlConcentrate = product.price / product.container_size_ml;

        // Logic for Dilutable Products:
        // quantity = Solution Used (ml)
        // dilution_ratio = "1:X" (e.g., 1:100)
        // Concentrated Product Used = Solution Used / X
        if (item.dilution_ratio && item.dilution_ratio.includes(':')) {
            const parts = item.dilution_ratio.split(':');
            const dilutionFactor = parseFloat(parts[1]);

            if (!isNaN(dilutionFactor) && dilutionFactor > 0) {
                const concentrateUsed = item.quantity / dilutionFactor;
                return concentrateUsed * pricePerMlConcentrate;
            }
        }

        // Logic for Ready-to-use / Non-dilutable:
        // quantity = Consumed amount (ml/units) directly
        return pricePerMlConcentrate * item.quantity;
    };

    const totalProductCost = products.reduce((acc, item) => acc + calculateProductCost(item), 0);
    const servicePrice = service?.base_price || 0;
    const grossProfit = servicePrice - totalProductCost;
    const margin = servicePrice > 0 ? (grossProfit / servicePrice) * 100 : 0;

    const formatMoney = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="overflow-y-auto sm:max-w-xl w-full">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl">Análise de custos e Lucratividade</SheetTitle>
                    <SheetDescription>
                        Detalhamento financeiro do serviço {service?.name}
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        Preço Venda
                                    </div>
                                    <div className="text-2xl font-bold text-green-600">
                                        {formatMoney(servicePrice)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                        <TrendingDown className="h-4 w-4" />
                                        Custo Total
                                    </div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {formatMoney(totalProductCost)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
                            <CardContent className="pt-6 pb-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">Margem de Lucro</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-primary">
                                                {margin.toFixed(1)}%
                                            </span>
                                            <span className="text-sm font-medium text-muted-foreground">
                                                ({formatMoney(grossProfit)})
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-full ${margin > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        <TrendingUp className="h-6 w-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" /> Detalhamento de Custos
                            </h3>
                            <div className="rounded-md border">
                                <div className="divide-y">
                                    {products.map((item) => {
                                        const cost = calculateProductCost(item);
                                        const percentOfTotal = totalProductCost > 0 ? (cost / totalProductCost) * 100 : 0;

                                        let detailsText = `${item.quantity}ml utilizados`;
                                        if (item.dilution_ratio) {
                                            detailsText = `${item.quantity}ml solução (${item.dilution_ratio})`;
                                        }

                                        return (
                                            <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-sm">{item.products?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {detailsText} • {formatMoney(item.products?.price || 0)}/{item.products?.container_size_ml}ml
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-sm text-red-600">
                                                        - {formatMoney(cost)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {percentOfTotal.toFixed(1)}% do custo
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {products.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            Nenhum produto vinculado a este serviço.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
