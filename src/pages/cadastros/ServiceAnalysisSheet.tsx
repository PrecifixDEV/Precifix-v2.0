
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
    service: any | null;
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

    // Products are reference-only - no cost calculation needed
    // Costs managed via operational expenses
    const servicePrice = service?.base_price || 0;

    // Cost Calculations
    const laborCost = ((service?.labor_cost_per_hour || 0) / 60) * (service?.duration_minutes || 0);
    const commissionCost = (servicePrice * (service?.commission_percent || 0)) / 100;
    const otherCosts = service?.other_costs || 0;

    // Total Cost = Labor + Commission + Other (Products excluded - managed via operational expenses)
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
                            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardContent className="pt-6">
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Valor Cobrado</div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatMoney(servicePrice)}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                        </div>

                        {/* Sales Performance */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Performance de Vendas
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">Qtd. Vendas</p>
                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{service?.total_sales_count || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">Receita Total</p>
                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
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

                        {/* Products List (Simple - Reference Only) */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4" /> Produtos Utilizados (Referência)
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
                            <p className="text-xs text-muted-foreground mt-2">
                                * Produtos são apenas referência. Custos gerenciados via despesas operacionais.
                            </p>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};
