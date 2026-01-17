import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, Beaker, Droplets, DollarSign } from "lucide-react";
import SprayBottle from "@/components/SprayBottle";
import { Link } from "react-router-dom";


export const DilutionCalculator = () => {
    // Inputs State
    const [productPart, setProductPart] = useState<number>(1);
    const [waterPart, setWaterPart] = useState<number>(1);
    const [containerSize, setContainerSize] = useState<number>(500);
    const [showResult, setShowResult] = useState<boolean>(false);

    // Results State (Snapshot of inputs at calculation time)
    const [resultProductAmount, setResultProductAmount] = useState<number>(0);
    const [resultWaterAmount, setResultWaterAmount] = useState<number>(0);
    const [resultContainerSize, setResultContainerSize] = useState<number>(0);
    const [resultProductPart, setResultProductPart] = useState<number>(1);
    const [resultWaterPart, setResultWaterPart] = useState<number>(1);

    const calculate = () => {
        // Validation
        if (productPart <= 0 || waterPart <= 0 || containerSize <= 0) {
            setResultProductAmount(0);
            setResultWaterAmount(0);
            setShowResult(false);
            return;
        }

        const totalParts = productPart + waterPart;
        const onePartVolume = containerSize / totalParts;

        // Update results
        setResultProductAmount(onePartVolume * productPart);
        setResultWaterAmount(onePartVolume * waterPart);
        setResultContainerSize(containerSize);
        setResultProductPart(productPart);
        setResultWaterPart(waterPart);
        setShowResult(true);
    };



    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calculator className="h-8 w-8 text-primary" />
                    Calculadora de Diluição
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Calcule a quantidade exata de produto e água necessária para realizar a diluição correta.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <Card className="border-primary/10 shadow-lg h-fit">
                    <CardHeader>
                        <CardTitle className="text-xl">Parâmetros da Diluição</CardTitle>
                        <CardDescription>Insira a proporção indicada no rótulo do produto.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Label className="flex items-center gap-2">
                                <Beaker className="h-4 w-4 text-primary" />
                                Proporção da Diluição
                            </Label>
                            <div className="flex items-center justify-start gap-2">
                                <div className="w-24">
                                    <Label htmlFor="product-part" className="sr-only">Parte Produto</Label>
                                    <Input
                                        id="product-part"
                                        type="number"
                                        min="1"
                                        value={productPart}
                                        onChange={(e) => setProductPart(Number(e.target.value))}
                                        className="text-right text-lg font-semibold h-12"
                                    />
                                    <span className="text-xs text-muted-foreground mt-1 block text-right">Produto</span>
                                </div>
                                <span className="text-2xl font-light text-muted-foreground pb-5">/</span>
                                <div className="w-24">
                                    <Label htmlFor="water-part" className="sr-only">Parte Água</Label>
                                    <Input
                                        id="water-part"
                                        type="number"
                                        min="1"
                                        value={waterPart}
                                        onChange={(e) => setWaterPart(Number(e.target.value))}
                                        className="text-left text-lg font-semibold h-12"
                                    />
                                    <span className="text-xs text-muted-foreground mt-1 block">Água</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="container-size">Tamanho do Recipiente / Borrifador (ml)</Label>
                            <div className="flex gap-2">
                                {[500, 1000, 2000, 5000].map((size) => (
                                    <Button
                                        key={size}
                                        variant={containerSize === size ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setContainerSize(size)}
                                        className="flex-1"
                                    >
                                        {size < 1000 ? `${size}ml` : `${size / 1000}L`}
                                    </Button>
                                ))}
                            </div>
                            <div className="relative">
                                <Input
                                    id="container-size"
                                    type="number"
                                    value={containerSize}
                                    onChange={(e) => setContainerSize(Number(e.target.value))}
                                    className="mt-2 text-lg font-semibold pr-12"
                                    placeholder="Outro volume"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none mt-1">ml</span>
                            </div>
                        </div>

                        <Button className="w-full mt-4 h-12 text-lg" onClick={calculate}>
                            <Calculator className="h-5 w-5 mr-2" />
                            Calcular
                        </Button>
                    </CardContent>
                </Card>

                {/* Results - Only visible after calculation */}
                {showResult && (
                    <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-2 flex flex-col justify-center animate-in fade-in slide-in-from-left-4 duration-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Resultado Final
                                {resultProductAmount > 0 && (
                                    <span className="ml-auto text-sm font-normal text-muted-foreground bg-white dark:bg-slate-800 px-3 py-1 rounded-full border">
                                        Proporção 1:{resultWaterPart / resultProductPart}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-4">
                                {/* Visual Bottle Representation - Resize */}
                                <div className="w-full md:w-1/3 flex justify-center h-64">
                                    <SprayBottle percentage={resultProductAmount > 0 ? (resultProductAmount / resultContainerSize) * 100 : 0} />
                                </div>

                                {/* Result Cards - Vertical Stack */}
                                <div className="w-full md:w-1/2 flex flex-col gap-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                <Beaker className="h-5 w-5 text-yellow-500" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Produto</span>
                                        </div>
                                        <span className="text-2xl font-bold text-yellow-500">{resultProductAmount.toFixed(0)}ml</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <Droplets className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">Água</span>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-500">{resultWaterAmount.toFixed(0)}ml</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border text-sm text-center">
                                Para um recipiente de <strong>{resultContainerSize}ml</strong>, misture <strong>{resultProductAmount.toFixed(0)}ml</strong> de produto com <strong>{resultWaterAmount.toFixed(0)}ml</strong> de água.
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

        </div>
    );
};
