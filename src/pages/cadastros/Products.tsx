import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, MoreHorizontal, Copy, DollarSign, Store, Printer, Filter, ShoppingBag, LayoutGrid, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProductFormDialog } from './ProductFormDialog';
import { ProductSaleDialog } from './ProductSaleDialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { productService, type Product } from '@/services/productService';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
    const [productForSale, setProductForSale] = useState<Product | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'for_sale' | 'zero_stock' | 'incomplete'>('all');
    const [viewMode, setViewMode] = useState<'standard' | 'compact'>('standard');
    const [companyInfo, setCompanyInfo] = useState<{ name: string; logo: string | null; primaryColor: string }>({
        name: '',
        logo: null,
        primaryColor: '#000000'
    });
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('company_name, company_logo_url, company_colors')
                .eq('id', user.id)
                .single();

            if (data) {
                const colors = data.company_colors as any;
                setCompanyInfo({
                    name: data.company_name || 'Minha Empresa',
                    logo: data.company_logo_url,
                    primaryColor: colors?.primary || '#000000'
                });
            }
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setProductToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este produto?")) {
            try {
                await productService.deleteProduct(id);
                fetchProducts();
            } catch (error) {
                console.error("Erro ao excluir produto:", error);
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map(p => p.id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter(pid => pid !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    const handleClone = (product: Product) => {
        // We want to edit a "new" product that has the same data as the cloned one.
        // We'll pass the product to the dialog, but we'll need a way to tell the dialog "this is a clone, don't update the original ID".
        // For now, let's pass it as productToEdit but with a special flag we'll add to the dialog props, 
        // OR we can pass a modified object that doesn't have an ID? 
        // Product type usually requires ID. 
        // Let's modify the state:
        setProductToEdit({ ...product, id: '' }); // Passing empty ID to signify new? Or better, let's handle this in the Dialog.
        setIsDialogOpen(true);
    };

    const handleToggleForSale = async (product: Product) => {
        if (!product.is_for_sale) {
            setProductForSale(product);
            setIsSaleDialogOpen(true);
        } else {
            try {
                const updatedProduct = { ...product, is_for_sale: false };
                await productService.updateProduct(product.id, { is_for_sale: false });

                setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
                toast.success('Produto marcado para Uso Próprio');
            } catch (error) {
                console.error("Erro ao atualizar status do produto:", error);
                toast.error("Erro ao atualizar status do produto");
            }
        }
    };

    const handleEditSale = (product: Product) => {
        setProductForSale(product);
        setIsSaleDialogOpen(true);
    };

    const handleBulkPrint = () => {
        const selected = products.filter(p => selectedProducts.includes(p.id));
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Lista de Produtos</title>');
            printWindow.document.write('<style>');
            printWindow.document.write('body { font-family: sans-serif; padding: 20px; }');
            printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
            printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
            printWindow.document.write('th { background-color: #f2f2f2; }');
            printWindow.document.write('.header { text-align: center; margin-bottom: 20px; }');
            printWindow.document.write('</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('</head><body>');

            // Header with Company Info
            printWindow.document.write(`
                <div style="padding: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    ${companyInfo.logo ? `<img src="${companyInfo.logo}" style="height: 50px; margin-right: 15px; object-fit: contain;" />` : ''}
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: black;">${companyInfo.name}</h1>
                </div>
            `);

            printWindow.document.write('<div class="header"><h2 style="font-size: 18px; margin: 0;">Lista de Produtos</h2></div>');
            printWindow.document.write('<table><thead><tr><th style="width: 50px;">Img</th><th>Produto</th><th>Código</th><th>Preço Custo</th><th>Preço Venda</th><th>Estoque</th></tr></thead><tbody>');
            selected.forEach(p => {
                const salePrice = p.sale_price || 0;
                const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price);
                const salePriceFormatted = p.is_for_sale ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salePrice) : '-';
                printWindow.document.write(`<tr>
                    <td style="padding: 4px; width: 50px; text-align: center; vertical-align: middle;">
                        ${p.image_url ? `<img src="${p.image_url}" style="width: 42px; height: 42px; object-fit: cover; display: block; margin: 0 auto;" />` : '<div style="width: 42px; height: 42px; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #ccc;">-</div>'}
                    </td>
                    <td>${p.name}</td>
                    <td>${p.code || '-'}</td>
                    <td>${priceFormatted}</td>
                    <td>${salePriceFormatted}</td>
                    <td>${p.stock_quantity}</td>
                </tr>`);
            });
            printWindow.document.write('</tbody></table>');
            printWindow.document.write('<script>window.onload = function() { window.print(); window.close(); }</script>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
        }
    };

    const confirmBulkDelete = async () => {
        try {
            await productService.deleteProducts(selectedProducts);
            setProducts(products.filter(p => !selectedProducts.includes(p.id)));
            setSelectedProducts([]);
            setIsDeleteAlertOpen(false);
            toast.success("Produtos excluídos com sucesso");
        } catch (error) {
            console.error("Erro ao excluir produtos:", error);
            toast.error("Erro ao excluir produtos");
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterType === 'for_sale') return product.is_for_sale;
        if (filterType === 'zero_stock') return product.stock_quantity <= 0;
        if (filterType === 'incomplete') return !product.code || !product.image_url;

        return true;
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Produtos</h1>
                <Button onClick={handleCreateNew} size="icon" className="md:hidden h-8 w-8 rounded-full">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" title="Filtrar" className={filterType !== 'all' ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900 border-yellow-500' : ''}>
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel>Filtrar:</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setFilterType('all')}
                                        className={filterType === 'all' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 font-medium' : ''}
                                    >
                                        Todos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setFilterType('for_sale')}
                                        className={filterType === 'for_sale' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 font-medium' : ''}
                                    >
                                        Produtos para Venda
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setFilterType('zero_stock')}
                                        className={filterType === 'zero_stock' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 font-medium' : ''}
                                    >
                                        Produtos com Estoque Zerado
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setFilterType('incomplete')}
                                        className={filterType === 'incomplete' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 font-medium' : ''}
                                    >
                                        Produtos Cadastro Incompleto
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <Input
                                    placeholder="Buscar produto..."
                                    className="pl-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                />
                            </div>
                        </div>

                        {/* Mobile View Toggle */}
                        <div className={cn(
                            "md:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-md transition-all duration-200",
                            isSearchFocused ? "hidden" : "flex"
                        )}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8", viewMode === 'standard' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-transparent")}
                                onClick={() => setViewMode('standard')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("h-8 w-8", viewMode === 'compact' ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-transparent")}
                                onClick={() => setViewMode('compact')}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            {selectedProducts.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleBulkPrint}
                                        title="Imprimir Selecionados"
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => setIsDeleteAlertOpen(true)}
                                        title="Excluir Selecionados"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            <Button
                                onClick={handleCreateNew}
                                className="hidden md:flex items-center bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Produto
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">
                                        <Checkbox
                                            checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="w-[80px]">Foto</TableHead>
                                    <TableHead>Nome do Produto</TableHead>
                                    <TableHead>Tamanho</TableHead>
                                    <TableHead>Diluição</TableHead>
                                    <TableHead>Estoque</TableHead>
                                    <TableHead className="text-right">Preço</TableHead>
                                    <TableHead className="w-[100px] text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            Carregando produtos...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                            Nenhum produto encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <TableRow
                                            key={product.id}
                                            className={cn(
                                                "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                                                product.is_for_sale && "bg-green-50 hover:bg-green-100 dark:bg-green-900/40 dark:hover:bg-green-900/50"
                                            )}
                                        >
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={selectedProducts.includes(product.id)}
                                                    onCheckedChange={() => toggleSelect(product.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900 dark:text-white">
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-400">
                                                {product.container_size_ml ? `${product.container_size_ml}ml` : '-'}
                                            </TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-400">
                                                {product.is_dilutable ? (product.dilution_ratio || '-') : 'Pronto Uso'}
                                            </TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-400">
                                                {product.stock_quantity}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-900 dark:text-white">
                                                <div className="flex items-center justify-end gap-2">
                                                    {product.is_for_sale ? (
                                                        <>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="cursor-help decoration-dotted underline underline-offset-4 decoration-slate-400">
                                                                            {formatCurrency(product.price)}
                                                                        </span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Preço de Venda: {formatCurrency(product.sale_price || 0)}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditSale(product);
                                                                }}
                                                                title="Alterar Preço de Venda"
                                                            >
                                                                <ShoppingBag className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        formatCurrency(product.price)
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                            <Edit2 className="mr-2 h-4 w-4" />
                                                            Alterar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleClone(product)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Clonar Produto
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleForSale(product)}>
                                                            {product.is_for_sale ? (
                                                                <>
                                                                    <Store className="mr-2 h-4 w-4 opacity-50" />
                                                                    Marcar Uso Próprio
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                                                    Produto para Venda
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(product.id)}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Apagar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card Grid View */}
                    <div className={cn(
                        "md:hidden grid gap-4",
                        viewMode === 'compact' ? "grid-cols-4 gap-1" : "grid-cols-2 sm:grid-cols-3"
                    )}>
                        {loading ? (
                            <div className="col-span-full h-24 flex items-center justify-center text-slate-500">
                                Carregando produtos...
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="col-span-full h-24 flex items-center justify-center text-slate-500">
                                Nenhum produto encontrado.
                            </div>
                        ) : (
                            filteredProducts.map((product) => {
                                const ActionsMenu = (
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(product); }}>
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Alterar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleClone(product); }}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Clonar Produto
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleForSale(product); }}>
                                            {product.is_for_sale ? (
                                                <>
                                                    <Store className="mr-2 h-4 w-4 opacity-50" />
                                                    Marcar Uso Próprio
                                                </>
                                            ) : (
                                                <>
                                                    <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                                    Produto para Venda
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Apagar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                );

                                if (viewMode === 'compact') {
                                    return (
                                        <DropdownMenu key={product.id}>
                                            <DropdownMenuTrigger asChild>
                                                <div
                                                    className="aspect-square w-full relative bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden rounded-sm"
                                                >
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Package className="w-6 h-6 opacity-50" />
                                                        </div>
                                                    )}
                                                </div>
                                            </DropdownMenuTrigger>
                                            {ActionsMenu}
                                        </DropdownMenu>
                                    );
                                }

                                return (
                                    <Card
                                        key={product.id}
                                        onClick={() => handleEdit(product)}
                                        className="group relative flex flex-col hover:bg-muted/50 transition-colors duration-200 cursor-pointer overflow-hidden border-slate-200 dark:border-slate-800"
                                    >
                                        <div className="absolute top-2 right-2 z-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 bg-white/50 backdrop-blur-sm hover:bg-white/80 dark:bg-black/50 dark:hover:bg-black/80 rounded-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="sr-only">Abrir menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(product); }}>
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Alterar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleClone(product); }}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Clonar Produto
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleForSale(product); }}>
                                                        {product.is_for_sale ? (
                                                            <>
                                                                <Store className="mr-2 h-4 w-4 opacity-50" />
                                                                Marcar Uso Próprio
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                                                                Produto para Venda
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Apagar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="aspect-square w-full relative bg-slate-100 dark:bg-slate-800">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <Package className="w-10 h-10 opacity-50" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 text-center">
                                            <h3 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                                                {product.name}
                                            </h3>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>

            <ProductSaleDialog
                open={isSaleDialogOpen}
                onOpenChange={setIsSaleDialogOpen}
                product={productForSale}
                onSuccess={fetchProducts}
            />

            <ProductFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                productToEdit={productToEdit}
                onSuccess={fetchProducts}
            />

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Produtos Selecionados?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Aviso: serão excluídos todos os produtos selecionados e eles serão removidos de todos os serviços cadastrados. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
                            className="bg-red-600 hover:bg-red-700 text-white border-none"
                        >
                            Excluir Todos
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
