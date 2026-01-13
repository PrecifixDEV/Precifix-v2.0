
import { useState, useEffect } from "react";
import { productService, type Product } from "@/services/productService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calculator, Beaker, ArrowLeft, TrendingDown, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export const ProductCostCalculator = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Inputs
    const [quantityUsed, setQuantityUsed] = useState<string>(''); // in ml or units
    const [isDiluted, setIsDiluted] = useState(false);
    const [dilutionRatio, setDilutionRatio] = useState<string>(''); // e.g., "1:10"

    // Results
    const [costResult, setCostResult] = useState<{
        costPerUnit: number;
        costOfUsage: number;
        finalVolume?: number;
    } | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Erro ao carregar produtos");
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (productId: string) => {
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product || null);
        setCostResult(null);
        setQuantityUsed('');
        setDilutionRatio(product?.dilution_ratio || '');
        setIsDiluted(product?.is_dilutable || false);
    };

    const calculateCost = () => {
        if (!selectedProduct || !selectedProduct.price || !selectedProduct.container_size_ml) {
            toast.error("Produto inválido ou sem preço/tamanho cadastrado.");
            return;
        }

        const qty = parseFloat(quantityUsed);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Informe uma quantidade válida.");
            return;
        }

        const pricePerMlConcentrate = selectedProduct.price / selectedProduct.container_size_ml;
        let finalCost = 0;
        let costPerUnit = 0; // Cost per ML of the FINAL solution (or concentrate if pure)

        if (isDiluted && dilutionRatio.includes(':')) {
            const parts = dilutionRatio.split(':');
            const solventParts = parseFloat(parts[1]);

            if (isNaN(solventParts) || solventParts <= 0) {
                toast.error("Taxa de diluição inválida (ex: 1:10)");
                return;
            }

            // Logic: The user wants to prepare X ml of SOLUTION or used X ml of SOLUTION?
            // "Quanto foi gasto daquele produto" -> usually means "I used 500ml of Ready-to-Use solution, how much did that cost me?"

            // Total Parts = 1 + solventParts
            // Concentrate used = Quantity Solution / Total Parts? 
            // OR Dilution 1:10 means 1 part product + 10 parts water? Yes.
            // Factor = solventParts (if 1:10, factor is 10? No, usually ratio is 1 part solute : X parts solvent)

            // Formula for cost of Diluted Solution per ML:
            // 1 Unit of Concentrate makes (1 + solventParts) Units of Solution.
            // Cost of 1 Unit of Concentrate = pricePerMlConcentrate * 1
            // Cost of (1 + solventParts) Units of Solution = pricePerMlConcentrate * 1 (assuming water is free)
            // Cost per ML of Solution = pricePerMlConcentrate / (1 + solventParts)

            const dilutionFactor = 1 + solventParts;
            const pricePerMlSolution = pricePerMlConcentrate / dilutionFactor;

            finalCost = qty * pricePerMlSolution;
            costPerUnit = pricePerMlSolution;

        } else {
            // Pure usage cost
            finalCost = qty * pricePerMlConcentrate;
            costPerUnit = pricePerMlConcentrate;
        }

        setCostResult({
            costPerUnit: costPerUnit,
            costOfUsage: finalCost,
            finalVolume: qty
        });
    };

    const formatMoney = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatMoneyHighPrecision = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 4 }).format(val);
    };


    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-4">
                <Link to="/ferramentas/calculadora-diluicao">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calculator className="h-8 w-8 text-primary" />
                        Calculadora de Custos
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Descubra quanto custa cada ml ou aplicação dos seus produtos.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Beaker className="h-5 w-5 text-blue-500" /> Configurar Cálculo
                        </CardTitle>
                        <CardDescription>Selecione um produto do seu estoque para calcular.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Selecione o Produto</Label>
                            <Select onValueChange={handleProductSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Buscar produto..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(product => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedProduct && selectedProduct.price > 0 && selectedProduct.container_size_ml && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Preço Base: {formatMoney(selectedProduct.price)} / {selectedProduct.container_size_ml}ml
                                    ({formatMoneyHighPrecision(selectedProduct.price / selectedProduct.container_size_ml)}/ml)
                                </p>
                            )}
                        </div>

                        {selectedProduct && (
                            <>
                                <div className="flex items-center justify-between border p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="space-y-0.5">
                                        <Label>Produto Diluído?</Label>
                                        <p className="text-xs text-muted-foreground">O produto será misturado com água?</p>
                                    </div>
                                    <Switch
                                        checked={isDiluted}
                                        onCheckedChange={setIsDiluted}
                                    />
                                </div>

                                {isDiluted && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label>Proporção da Diluição (1:X)</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">1 :</span>
                                            <Input
                                                type="text"
                                                value={dilutionRatio.replace('1:', '')}
                                                onChange={(e) => setDilutionRatio(`1:${e.target.value}`)}
                                                placeholder="ex: 10"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Exemplo: 1:10 significa 1 parte de produto para 10 partes de água.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Quantidade Utilizada (ml)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={quantityUsed}
                                            onChange={(e) => setQuantityUsed(e.target.value)}
                                            placeholder={isDiluted ? "Volume total da solução pronta" : "Volume do produto puro"}
                                        />
                                        <span className="absolute right-3 top-2.5 text-sm text-slate-400">ml</span>
                                    </div>
                                </div>

                                <Button onClick={calculateCost} className="w-full h-12 text-lg">
                                    Calcular Custo
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Results Card */}
                <div className="space-y-6">
                    {costResult ? (
                        <Card className="bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-white">
                                <DollarSign className="w-48 h-48" />
                            </div>

                            <CardHeader>
                                <CardTitle className="text-xl">Resultado do Cálculo</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Custo da Aplicação</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-bold text-green-400">{formatMoneyHighPrecision(costResult.costOfUsage)}</span>
                                        <span className="text-slate-400">/ {quantityUsed}ml</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Custo por Litro (Pronto)</p>
                                        <p className="text-xl font-semibold">{formatMoney(costResult.costPerUnit * 1000)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs uppercase font-bold mb-1">Custo por ML</p>
                                        <p className="text-xl font-semibold">{formatMoneyHighPrecision(costResult.costPerUnit)}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 p-4 rounded-lg text-sm text-slate-300">
                                    <p>
                                        Você precisará usar <strong>{formatMoneyHighPrecision(costResult.costOfUsage)}</strong> de produto concentrado para realizar este serviço/aplicação.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-xl border-dashed border-2">
                            <TrendingDown className="h-12 w-12 mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">Aguardando Cálculo</h3>
                            <p className="max-w-xs">
                                Selecione um produto e informe os dados para ver a análise de custos detalhada aqui.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
