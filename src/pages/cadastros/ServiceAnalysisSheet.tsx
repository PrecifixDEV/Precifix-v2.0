
import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { servicesService, type ServiceProduct } from "@/services/servicesService";
import { Loader2, TrendingUp, DollarSign, Package } from "lucide-react";
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

    const calculateProductCost = () => {
        // Product cost calculation removed as quantity and dilution_ratio fields
        // are no longer part of the service_products table
        return 0;
    };

    const totalProductCost = products.reduce((acc) => acc + calculateProductCost(), 0);
    const servicePrice = service?.base_price || 0;

    // Cost Calculations
    const laborCost = ((service?.labor_cost_per_hour || 0) / 60) * (service?.duration_minutes || 0);
    const commissionCost = (servicePrice * (service?.commission_percent || 0)) / 100;
    const otherCosts = service?.other_costs || 0;

    // Initial Request: "Total cost explicitly including calculated hourly cost"
    // Note: Product costs are usually operational and included in hourly rate, but user wants them listed? 
    // "Detail commission costs and any other associated costs."
    // User requested "simple list of ... products", implying maybe they don't want the complex cost calc for products shown individually, 
    // BUT they asked for "Total Cost".
    // Usually Total Cost = Labor + Commission + Other + Products (if products are NOT part of hourly rate calculation).
    // The previous code had a disclaimer: "If you launch purchase as expense, it's already in Hourly Cost".
    // Assuming for this "Unit Analysis", we sum everything to show "Cost of providing this specific service".

    // Updated Requirement: Product costs are NOT part of the service cost calculation for margin purposes.
    // They are operational overhead managed elsewhere. Storing them here is for "Recommended Usage" only.

    // Total Cost = Labor + Commission + Other (Excludes Products)
    const totalCost = laborCost + commissionCost + otherCosts;
    const netProfit = servicePrice - totalCost;
    const marginPercent = servicePrice > 0 ? (netProfit / servicePrice) * 100 : 0;

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
                    <SheetTitle className="text-xl">Análise de Serviço</SheetTitle>
                    <SheetDescription>
                        {service?.name}
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* Header Info */}
                        <div className="text-xs text-muted-foreground">
                            Criado em: {service?.created_at ? new Date(service.created_at).toLocaleDateString('pt-BR') : '-'}
                        </div>

                        {/* Financial Overview */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Valor Cobrado</div>
                                    <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                                        {formatMoney(servicePrice)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Lucro Líquido</div>
                                    <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {formatMoney(netProfit)}
                                    </div>
                                    <div className={`text-xs font-medium ${marginPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        Margem: {marginPercent.toFixed(1)}%
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Costs */}
                        <div className="space-y-3 border rounded-lg p-4">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" /> Composição de Custos
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Custo Operacional (Hora):</span>
                                    <span>{formatMoney(laborCost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Comissões:</span>
                                    <span>{formatMoney(commissionCost)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Outros Custos:</span>
                                    <span>{formatMoney(otherCosts)}</span>
                                </div>

                                <div className="border-t pt-2 flex justify-between items-center font-bold text-red-600">
                                    <span>Custo Total do Serviço:</span>
                                    <span>{formatMoney(totalCost)}</span>
                                </div>
                            </div>

                            {/* Product Cost Info Block */}
                            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-md border border-yellow-100 dark:border-yellow-900/20 text-xs">
                                <div className="flex justify-between items-center text-yellow-700 dark:text-yellow-400 font-medium mb-1">
                                    <span>Estimativa de Produtos:</span>
                                    <span>{formatMoney(totalProductCost)}</span>
                                </div>
                                <p className="text-yellow-600/80 dark:text-yellow-500/80 leading-snug">
                                    * Este valor não é descontado do lucro aqui, pois os produtos devem ser lançados como despesas operacionais da empresa.
                                </p>
                            </div>
                        </div>

                        {/* Sales Performance */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900/20 rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Performance de Vendas
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-zinc-700 dark:text-zinc-300">Qtd. Vendas</p>
                                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{service?.total_sales_count || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-700 dark:text-zinc-300">Receita Total</p>
                                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                        {formatMoney(service?.total_sales_value || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold mb-2 text-sm">Descrição Completa</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {service?.description || "Sem descrição."}
                            </p>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Products List (Simple) */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4" /> Produtos Utilizados
                            </h3>
                            {products.length > 0 ? (
                                <ul className="space-y-2">
                                    {products.map((item) => (
                                        <li key={item.id} className="text-sm text-muted-foreground flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                            {item.products?.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Nenhum produto vinculado.</p>
                            )}
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
