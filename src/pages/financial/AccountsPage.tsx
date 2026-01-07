import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Wallet, ArrowRightLeft, MoreHorizontal, Trash2 } from "lucide-react";
import { formatMoney } from "../../utils/format";
import { financialService } from "@/services/financialService";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { Card, CardContent } from "@/components/ui/card";
import { AccountFormDialog } from "@/components/financial/AccountFormDialog";
import { TransactionList } from "@/components/financial/TransactionList";
import { BankLogo } from "@/components/ui/bank-logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AccountsPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Queries
    const { data: accounts, isLoading: loadingAccounts } = useQuery({
        queryKey: ['commercial_accounts'],
        queryFn: financialService.getAccounts
    });

    const { data: transactions, isLoading: loadingTransactions } = useQuery({
        queryKey: ['financial_transactions'],
        queryFn: async () => financialService.getTransactions()
    });

    const handleDeleteAccount = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover a conta "${name}"? Todo o histórico será perdido.`)) return;

        try {
            await financialService.deleteAccount(id);
            toast.success("Conta removida");
            queryClient.invalidateQueries({ queryKey: ['commercial_accounts'] });
        } catch (error) {
            toast.error("Erro ao remover conta");
        }
    };

    // Calculations
    const totalBalance = accounts?.reduce((acc, curr) => acc + Number(curr.current_balance), 0) || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Caixas e Bancos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie suas contas bancárias e acompanhe o fluxo financeiro.
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Add Transaction Button could go here too */}
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-4 w-4" /> Nova Conta
                    </Button>
                </div>
            </div>

            <AccountFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {/* Total Balance Magic Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <MagicCard className="lg:col-span-1 shadow-xl" gradientColor="#3b82f6 55%, transparent 100%">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white/80">
                            <Wallet className="h-5 w-5" />
                            <span className="font-medium">Saldo Total Consolidado</span>
                        </div>
                        <div>
                            <span className="text-4xl font-bold text-white tracking-tight">
                                {formatMoney(totalBalance)}
                            </span>
                            <p className="text-sm text-blue-200 mt-1">Soma de todas as contas</p>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex gap-2">
                            <Button variant="secondary" size="sm" className="w-full text-xs h-8 bg-white/10 hover:bg-white/20 text-white border-0">
                                <ArrowRightLeft className="mr-2 h-3 w-3" /> Transferir
                            </Button>
                        </div>
                    </div>
                </MagicCard>

                {/* Account List */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loadingAccounts ? (
                        [1, 2].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)
                    ) : (
                        accounts?.map(account => (
                            <Card key={account.id} className="border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group relative overflow-hidden">
                                {/* Colored Stripe */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-1"
                                    style={{ backgroundColor: account.color || '#cbd5e1' }}
                                />

                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            {account.type === 'bank' && account.bank_code ? (
                                                <BankLogo bankCode={account.bank_code} className="h-12 w-12" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <Wallet className="h-6 w-6" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{account.name}</h3>
                                                <p className="text-xs text-slate-500 capitalize">{account.type === 'bank' ? 'Conta Bancária' : 'Caixa Físico'}</p>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600 group-hover:bg-red-50" onClick={() => handleDeleteAccount(account.id, account.name)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Remover
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="mt-6">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 block">
                                            {formatMoney(Number(account.current_balance))}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}

                    {/* Empty State / Add Placehodler */}
                    {accounts?.length === 0 && !loadingAccounts && (
                        <div
                            onClick={() => setIsCreateOpen(true)}
                            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all text-slate-400 hover:text-primary hover:border-primary/50 gap-2 h-full min-h-[140px]"
                        >
                            <Plus className="h-8 w-8" />
                            <span className="font-medium text-sm">Adicionar primeira conta</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions Section */}
            <div className="mt-8">
                <TransactionList
                    transactions={transactions || []}
                    isLoading={loadingTransactions}
                />
            </div>
        </div>
    );
}
