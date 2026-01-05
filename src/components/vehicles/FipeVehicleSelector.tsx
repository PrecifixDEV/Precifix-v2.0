import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fipeService, type FipeBrand, type FipeModel, type FipeYear, type FipeVehicle, type VehicleType } from "@/services/fipeService";

interface FipeVehicleSelectorProps {
    onVehicleSelected: (vehicle: FipeVehicle) => void;
}

export function FipeVehicleSelector({ onVehicleSelected }: FipeVehicleSelectorProps) {
    const [type, setType] = useState<VehicleType>('carros');
    const [brands, setBrands] = useState<FipeBrand[]>([]);
    const [models, setModels] = useState<FipeModel[]>([]);
    const [years, setYears] = useState<FipeYear[]>([]);

    const [selectedBrand, setSelectedBrand] = useState<string>("");
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>("");

    const [loadingBrands, setLoadingBrands] = useState(false);
    const [loadingModels, setLoadingModels] = useState(false);
    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [openBrand, setOpenBrand] = useState(false);
    const [openModel, setOpenModel] = useState(false);

    useEffect(() => {
        loadBrands();
    }, [type]);

    const loadBrands = async () => {
        try {
            setLoadingBrands(true);
            setBrands([]);
            setSelectedBrand("");
            setSelectedModel("");
            setSelectedYear("");
            const data = await fipeService.getBrands(type);
            setBrands(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar marcas.");
        } finally {
            setLoadingBrands(false);
        }
    };

    const handleBrandSelect = async (brandId: string) => {
        setSelectedBrand(brandId);
        setSelectedModel("");
        setSelectedYear("");
        setOpenBrand(false);
        try {
            setLoadingModels(true);
            const data = await fipeService.getModels(type, brandId);
            setModels(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar modelos.");
        } finally {
            setLoadingModels(false);
        }
    };

    const handleModelSelect = async (modelId: string) => {
        setSelectedModel(modelId);
        setSelectedYear("");
        setOpenModel(false);
        try {
            setLoadingYears(true);
            const data = await fipeService.getYears(type, selectedBrand, modelId);
            setYears(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar anos.");
        } finally {
            setLoadingYears(false);
        }
    };

    const handleYearSelect = async (yearId: string) => {
        setSelectedYear(yearId);
        try {
            setLoadingDetails(true);
            const details = await fipeService.getVehicleDetails(type, selectedBrand, selectedModel, yearId);
            onVehicleSelected(details);
            toast.success("Veículo carregado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar detalhes do veículo.");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleClear = () => {
        setSelectedBrand("");
        setSelectedModel("");
        setSelectedYear("");
        setModels([]);
        setYears([]);
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Consulta Tabela FIPE</Label>
                <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 text-xs text-muted-foreground hover:text-destructive">
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <Select value={type} onValueChange={(val: VehicleType) => setType(val)}>
                        <SelectTrigger className="bg-white dark:bg-slate-800">
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="carros">Carros</SelectItem>
                            <SelectItem value="motos">Motos</SelectItem>
                            <SelectItem value="caminhoes">Caminhões</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Brand Selector */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Marca</Label>
                    <Popover open={openBrand} onOpenChange={setOpenBrand}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openBrand}
                                className="w-full justify-between bg-white dark:bg-slate-800"
                                disabled={loadingBrands}
                            >
                                {selectedBrand
                                    ? brands.find((brand) => brand.codigo === selectedBrand)?.nome
                                    : "Selecione a marca..."}
                                {loadingBrands ? (
                                    <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                                ) : (
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar marca..." />
                                <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                                    <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
                                    <CommandGroup>
                                        {brands.map((brand) => (
                                            <CommandItem
                                                key={brand.codigo}
                                                value={brand.nome}
                                                onSelect={() => handleBrandSelect(brand.codigo)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedBrand === brand.codigo ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {brand.nome}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Model Selector */}
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Modelo</Label>
                    <Popover open={openModel} onOpenChange={setOpenModel}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openModel}
                                className="w-full justify-between bg-white dark:bg-slate-800"
                                disabled={!selectedBrand || loadingModels}
                            >
                                {selectedModel
                                    ? models.find((model) => model.codigo === selectedModel)?.nome
                                    : "Selecione o modelo..."}
                                {loadingModels ? (
                                    <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                                ) : (
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar modelo..." />
                                <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                                    <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
                                    <CommandGroup>
                                        {models.map((model) => (
                                            <CommandItem
                                                key={model.codigo}
                                                value={model.nome}
                                                onSelect={() => handleModelSelect(model.codigo)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedModel === model.codigo ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {model.nome}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Year Selector */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Ano</Label>
                    <Select value={selectedYear} onValueChange={handleYearSelect} disabled={!selectedModel || loadingYears}>
                        <SelectTrigger className="bg-white dark:bg-slate-800">
                            <SelectValue placeholder="Selecione o ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((year) => (
                                <SelectItem key={year.codigo} value={year.codigo}>
                                    {year.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-end">
                    {loadingDetails && (
                        <div className="text-xs text-muted-foreground flex items-center animate-pulse">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Carregando detalhes...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
