import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Package, MoreHorizontal, Copy, DollarSign, Store, Printer, Filter, ShoppingBag } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { ProductFormDialog } from './ProductFormDialog';


import { productService, type Product } from '@/services/productService';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { TablePagination } from '@/components/ui/table-pagination';
import { ActiveFilters } from '@/components/ui/active-filters';

export const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'for_sale' | 'zero_stock' | 'incomplete'>('all');
    const [companyInfo, setCompanyInfo] = useState<{ name: string; logo: string | null; primaryColor: string }>({
        name: '',
        logo: null,
        primaryColor: '#000000'
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 25;


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
            // If turning ON sale, just open the edit dialog (user handles details there)
            setProductToEdit(product);
            setIsDialogOpen(true);
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
        setProductToEdit(product);
        setIsDialogOpen(true);
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
            printWindow.document.write('<table><thead><tr><th>Nome</th><th>Tipo</th><th>Tamanho</th><th>Diluição</th><th>Estoque</th><th>Preço</th></tr></thead><tbody>');
            selected.forEach(p => {
                const dilutionInfo = p.is_dilutable ? (p.dilution_ratio || '-') : 'Pronto Uso';
                const containerInfo = p.container_size_ml ? `${p.container_size_ml}ml` : '-';

                let priceDisplay = formatCurrency(p.price || 0);
                if (p.is_for_sale) {
                    priceDisplay = `${formatCurrency(p.price || 0)} / ${formatCurrency(p.sale_price || 0)}`;
                }

                const typeDisplay = p.is_for_sale ? 'Revenda' : 'Uso Próprio';

                printWindow.document.write(`<tr>
                    <td>${p.name}</td>
                    <td>${typeDisplay}</td>
                    <td>${containerInfo}</td>
                    <td>${dilutionInfo}</td>
                    <td>${p.stock_quantity}</td>
                    <td>${priceDisplay}</td>
                </tr>`);
            });
            printWindow.document.write('</tbody></table>');
            printWindow.document.write('<script>window.onload = function() { window.print(); window.close(); }</script>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
        }
    };

    const handleBulkDelete = async () => {
        try {
            const promises = selectedProducts.map(id => productService.deleteProduct(id));
            await Promise.all(promises);
            toast.success(`${selectedProducts.length} produto(s) excluído(s) com sucesso!`);
            setSelectedProducts([]);
            fetchProducts();
        } catch (error) {
            console.error('Erro ao excluir produtos:', error);
            toast.error('Erro ao excluir produtos');
        } finally {
            setIsDeleteAlertOpen(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterType === 'for_sale') return product.is_for_sale;
        if (filterType === 'zero_stock') return product.stock_quantity === 0;
        if (filterType === 'incomplete') return !product.image_url || !product.description;

        return true;
    });

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

    // Paginated products
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white hidden md:block">Produtos</h1>
                <Button onClick={handleCreateNew} className="w-full md:w-auto">
                    Adicionar Novo Produto
                </Button>
            </div>

            {/* Search and Filters - Moved outside Card */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 md:max-w-sm">
                    {/* Mobile Select All */}
                    <div className="md:hidden flex items-center justify-center mr-1">
                        <Checkbox
                            checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                            onCheckedChange={toggleSelectAll}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" title="Filtrar" className={`bg-white dark:bg-zinc-900 ${filterType !== 'all' ? 'bg-yellow-500 hover:bg-yellow-600 text-zinc-900 border-yellow-500' : ''}`}>
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

                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400 z-10" />
                        <Input
                            placeholder="Buscar produto..."
                            className="pl-9 bg-white dark:bg-zinc-900 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Mobile Bulk Actions */}
                    <div className="md:hidden flex items-center gap-2">
                        {selectedProducts.length > 0 && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleBulkPrint}
                                    title="Imprimir Selecionados"
                                    className="bg-white dark:bg-zinc-900"
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
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Bulk Actions */}
                <div className="hidden md:flex items-center gap-2">
                    {selectedProducts.length > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleBulkPrint}
                                title="Imprimir Selecionados"
                                className="bg-white dark:bg-zinc-900"
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
                        </div>
                    )}
                </div>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">

                <CardContent className="p-0 md:p-6">
                    {/* Active Filters */}
                    {filterType !== 'all' && (
                        <ActiveFilters
                            filters={[
                                {
                                    label: filterType === 'for_sale' ? 'Produtos para Venda' :
                                        filterType === 'zero_stock' ? 'Produtos com Estoque Zerado' :
                                            filterType === 'incomplete' ? 'Produtos Cadastro Incompleto' : ''
                                }
                            ]}
                            onClearAll={() => setFilterType('all')}
                        />
                    )}

                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">
                                        <Checkbox
                                            checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="w-[80px]">Foto</TableHead>
                                    <TableHead>Nome do Produto</TableHead>
                                    <TableHead>Tipo</TableHead>
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
                                        <TableCell colSpan={8} className="h-24 text-center text-zinc-500">
                                            Nenhum produto encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedProducts.map((product) => (
                                        <TableRow key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer" onClick={() => handleEdit(product)}>
                                            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
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
                                                        className="w-10 h-10 rounded-md object-cover border border-zinc-200 dark:border-zinc-700"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-zinc-900 dark:text-white">
                                                {product.name}
                                            </TableCell>
                                            <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                {product.is_for_sale ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Revenda
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                                                        Uso Próprio
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                {product.container_size_ml ? `${product.container_size_ml}ml` : '-'}
                                            </TableCell>
                                            <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                {product.is_dilutable ? (product.dilution_ratio || '-') : 'Pronto Uso'}
                                            </TableCell>
                                            <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                {product.stock_quantity}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-zinc-900 dark:text-white">
                                                <div className="flex items-center justify-end gap-2 text-sm">
                                                    {product.is_for_sale ? (
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-zinc-500 text-xs">{formatCurrency(product.price || 0)}</span>
                                                                <span className="text-zinc-400">/</span>
                                                                <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(product.sale_price || 0)}</span>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 ml-1"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditSale(product);
                                                                    }}
                                                                    title="Alterar Preço de Venda"
                                                                >
                                                                    <ShoppingBag className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-600 dark:text-zinc-400">{formatCurrency(product.price || 0)}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
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

                    {/* Pagination */}
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredProducts.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />

                    {/* Mobile List View */}
                    <div className="md:hidden flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
                        {loading ? (
                            <div className="py-10 text-center text-zinc-500">
                                Carregando produtos...
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="py-10 text-center text-zinc-500">
                                Nenhum produto encontrado.
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="px-6 py-4 flex flex-col hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Checkbox
                                                checked={selectedProducts.includes(product.id)}
                                                onCheckedChange={() => toggleSelect(product.id)}
                                            />

                                            <div className="relative w-12 h-12 flex-shrink-0">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover rounded-md border border-zinc-200 dark:border-zinc-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                        <Package className="w-6 h-6 opacity-50" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1 min-w-0">
                                                <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                {product.is_for_sale ? (
                                                    <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                        Revenda
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                                                        Uso Próprio
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-zinc-400">
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
                                    </div>

                                    <div className="pl-0">
                                        <div onClick={() => handleEdit(product)} className="cursor-pointer">
                                            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                                {product.is_for_sale ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-zinc-500">Custo:</span>
                                                        <span className="text-zinc-500">{formatCurrency(product.price || 0)}</span>
                                                        <span className="text-zinc-400">/</span>
                                                        <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(product.sale_price || 0)}</span>
                                                    </div>
                                                ) : (
                                                    <div>Preço Custo: {formatCurrency(product.price || 0)}</div>
                                                )}

                                                <div className={(product.stock_quantity || 0) <= 0 ? 'text-red-500 font-medium' : ''}>
                                                    Estoque: {product.stock_quantity}
                                                </div>
                                                <div>Emb.: {product.container_size_ml ? `${product.container_size_ml}ml` : '-'}</div>
                                                <div>Diluição: {product.is_dilutable ? (product.dilution_ratio || '-') : 'Pronto Uso'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

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
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );

};
