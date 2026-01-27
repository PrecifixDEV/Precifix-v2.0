import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowRightLeft, ArrowUpRight, ArrowDownLeft } from "lucide-react";

import { financialService } from "@/services/financialService";
import { costService } from "@/services/costService";
import { Button } from "@/components/ui/button";

import { AccountFormDialog } from "@/components/financial/AccountFormDialog";
import { TransactionList } from "@/components/financial/TransactionList";
import { TransferDialog } from "@/components/financial/TransferDialog";
import { AddValueDialog } from "@/components/financial/AddValueDialog";

import { ConsolidatedBalanceCard } from "@/components/dashboard/ConsolidatedBalanceCard";

import { toast } from "sonner";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import { FinancialAccountCard } from "@/components/financial/FinancialAccountCard";
import { useNavigate } from "react-router-dom";
import type { FinancialAccount } from "@/types/costs";
import { formatMoney } from "@/utils/format";

export default function AccountsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isAddValueOpen, setIsAddValueOpen] = useState(false);

    const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');

    // Edit State
    const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);

    // Queries
    const { data: accounts, isLoading: loadingAccounts } = useQuery({
        queryKey: ['commercial_accounts'],
        queryFn: financialService.getAccounts
    });

    const { data: transactions, isLoading: loadingTransactions } = useQuery({
        queryKey: ['financial_transactions'],
        queryFn: async () => financialService.getTransactions()
    });

    const { data: payables = [] } = useQuery({
        queryKey: ['payable-summary'],
        queryFn: () => costService.getPayablePayments(new Date().getMonth() + 1, new Date().getFullYear())
    });

    const { data: receivables = [] } = useQuery({
        queryKey: ['receivable-summary'],
        queryFn: () => financialService.getReceivablePayments(new Date().getMonth() + 1, new Date().getFullYear())
    });

    const handleDeleteAccount = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover a conta "${name}"? Todo o histórico será perdido.`)) return;

        try {
            await financialService.deleteAccount(id);
            toast.success("Conta removida");
            queryClient.invalidateQueries({ queryKey: ['commercial_accounts'] });
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover conta");
        }
    };

    const handleCreateAccount = () => {
        setEditingAccount(null);
        setIsCreateOpen(true);
    };

    const handleEditAccount = (account: FinancialAccount) => {
        setEditingAccount(account);
        setIsCreateOpen(true);
    };

    const handleOpenTransaction = (type: 'credit' | 'debit') => {
        setTransactionType(type);
        setIsAddValueOpen(true);
    };

    // Calculations
    const totalBalance = accounts?.reduce((acc, curr) => acc + Number(curr.current_balance), 0) || 0;

    const totalToPay = payables
        .filter((p: any) => p.status !== 'paid')
        .reduce((acc: number, curr: any) => acc + curr.amount_original, 0);

    const totalToReceive = receivables
        .filter((p: any) => p.status !== 'paid')
        .reduce((acc: number, curr: any) => acc + curr.amount_original, 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white hidden md:block">Gestão Financeira</h1>
                    <p className="text-zinc-500 mt-1">
                        Acompanhe seu fluxo de caixa e compromissos.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        onClick={handleCreateAccount}
                        className="w-full md:w-auto h-10 bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-bold uppercase tracking-wider shadow-md transition-all hover:scale-[1.02]"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Nova Conta
                    </Button>
                </div>
            </div>

            <AccountFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                accountToEdit={editingAccount}
            />

            {/* Support Dialogs */}
            <TransferDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} accounts={accounts || []} />
            <AddValueDialog
                open={isAddValueOpen}
                onOpenChange={setIsAddValueOpen}
                accounts={accounts || []}
                type={transactionType}
            />

            {/* Dashboard Context Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
                {/* Main Balance */}
                <div className="lg:col-span-4 h-full">
                    <ConsolidatedBalanceCard totalBalance={totalBalance} accounts={accounts} />
                </div>

                {/* Auxiliary Summaries */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div
                        onClick={() => navigate('/accounts-payable')}
                        className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer group flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-all">
                                <ArrowDownLeft className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Pendentes a Pagar (Mês)</span>
                                <p className="text-2xl font-bold text-white font-mono tracking-tighter">
                                    {formatMoney(totalToPay)}
                                </p>
                            </div>
                        </div>
                        <ArrowRightLeft className="h-4 w-4 text-zinc-700 group-hover:text-red-500 transition-all" />
                    </div>

                    <div
                        onClick={() => navigate('/accounts-receivable')}
                        className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                                <ArrowUpRight className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Previstos a Receber (Mês)</span>
                                <p className="text-2xl font-bold text-white font-mono tracking-tighter">
                                    {formatMoney(totalToReceive)}
                                </p>
                            </div>
                        </div>
                        <ArrowRightLeft className="h-4 w-4 text-zinc-700 group-hover:text-emerald-500 transition-all" />
                    </div>
                </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap gap-4 print:hidden">
                <Button
                    variant="outline"
                    onClick={() => setIsTransferOpen(true)}
                    className="flex-1 min-w-[140px] h-14 bg-zinc-950 border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-xl gap-2 font-medium transition-all"
                >
                    <ArrowRightLeft className="h-4 w-4 opacity-50" />
                    Transferir
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleOpenTransaction('credit')}
                    className="flex-1 min-w-[140px] h-14 bg-zinc-950 border-zinc-800 hover:bg-emerald-500/5 hover:border-emerald-500/30 text-emerald-500/90 hover:text-emerald-400 rounded-xl gap-2 font-medium transition-all"
                >
                    <Plus className="h-4 w-4 opacity-50" />
                    Entrada Manual
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleOpenTransaction('debit')}
                    className="flex-1 min-w-[140px] h-14 bg-zinc-950 border-zinc-800 hover:bg-red-500/5 hover:border-red-500/30 text-red-500/90 hover:text-red-400 rounded-xl gap-2 font-medium transition-all"
                >
                    <Plus className="h-4 w-4 opacity-50" />
                    Saída Manual
                </Button>
            </div>

            {/* Accounts Slides - Using modern carousel */}
            <div className="space-y-4 print:hidden">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest pl-1">Minhas Contas</h2>
                </div>

                {loadingAccounts ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />)}
                    </div>
                ) : accounts && accounts.length > 0 ? (
                    <Carousel
                        opts={{ align: "start", loop: false }}
                        className="w-full relative px-1"
                    >
                        <CarouselContent className="-ml-4">
                            {accounts.map((account) => (
                                <CarouselItem key={account.id} className="pl-4 basis-[85%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                    <FinancialAccountCard
                                        account={account}
                                        onDelete={handleDeleteAccount}
                                        onDetail={(id) => navigate(`/accounts/${id}`)}
                                        onEdit={handleEditAccount}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden xl:flex -left-4 bg-zinc-950 border-zinc-800" />
                        <CarouselNext className="hidden xl:flex -right-4 bg-zinc-950 border-zinc-800" />
                    </Carousel>
                ) : (
                    <div
                        onClick={handleCreateAccount}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-2xl hover:bg-zinc-900/50 cursor-pointer transition-all text-zinc-400 hover:text-primary hover:border-primary/50 gap-2"
                    >
                        <Plus className="h-8 w-8" />
                        <span className="font-medium text-sm text-zinc-500">Adicionar primeira conta</span>
                    </div>
                )}
            </div>

            {/* Last Transactions Table/List */}
            <div className="pt-4">
                <TransactionList
                    transactions={transactions || []}
                    isLoading={loadingTransactions}
                    consolidatedBalance={totalBalance}
                    balanceLabel="Saldo Consolidado"
                />
            </div>
        </div>
    );
}
