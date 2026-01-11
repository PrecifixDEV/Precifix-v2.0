import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ArrowRightLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { financialService } from "@/services/financialService";
import { Button } from "@/components/ui/button";

import { AccountFormDialog } from "@/components/financial/AccountFormDialog";
import { TransactionList } from "@/components/financial/TransactionList";
import { TransferDialog } from "@/components/financial/TransferDialog";
import { AddValueDialog } from "@/components/financial/AddValueDialog";

import { ResponsiveAddButton } from "@/components/ui/responsive-add-button";
import { ConsolidatedBalanceCard } from "@/components/dashboard/ConsolidatedBalanceCard";
import { toast } from "sonner";
import Autoplay from "embla-carousel-autoplay";
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

export default function AccountsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isAddValueOpen, setIsAddValueOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');

    // Edit State
    const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);

    // Responsive check
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkDesktop = () => {
            if (typeof window !== "undefined") {
                setIsDesktop(window.innerWidth >= 768);
            }
        };
        checkDesktop();
        if (typeof window !== "undefined") {
            window.addEventListener('resize', checkDesktop);
            return () => window.removeEventListener('resize', checkDesktop);
        }
    }, []);

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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Caixas e Bancos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie suas contas bancárias e acompanhe o fluxo financeiro.
                    </p>
                </div>

                <ResponsiveAddButton
                    onClick={handleCreateAccount}
                    label="Nova Conta"
                    className="shrink-0"
                />
            </div>

            <AccountFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                accountToEdit={editingAccount}
            />

            {/* Action Support Dialogs */}
            <TransferDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} accounts={accounts || []} />
            <AddValueDialog
                open={isAddValueOpen}
                onOpenChange={setIsAddValueOpen}
                accounts={accounts || []}
                type={transactionType}
            />


            {/* Top Grid: Total & Actions */}
            {/* Fix: changed h-[200px] to lg:h-[200px] to allow auto height on mobile, preventing flattening */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:h-[200px] mb-8 print:hidden">
                <div className="w-full lg:w-1/2 h-full">
                    <ConsolidatedBalanceCard totalBalance={totalBalance} accounts={accounts} />
                </div>

                {/* Actions Buttons - Visually separated but next to balance */}
                <div className="w-full lg:w-1/2 flex flex-row items-center justify-start lg:justify-center gap-4 h-full">
                    <Button
                        variant="ghost"
                        onClick={() => setIsTransferOpen(true)}
                        className="flex-1 h-24 lg:h-full border border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-950 flex items-center justify-center transition-colors">
                            <ArrowRightLeft className="h-5 w-5 text-slate-500 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold text-slate-700 dark:text-slate-300 group-hover:text-primary">Transferir</span>
                            <span className="block text-xs text-slate-400 hidden sm:block">Entre contas</span>
                        </div>
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => handleOpenTransaction('credit')}
                        className="flex-1 h-24 lg:h-full border border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-950 flex items-center justify-center transition-colors">
                            <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-500">Entrada</span>
                            <span className="block text-xs text-slate-400 hidden sm:block">Nova Entrada de Valor</span>
                        </div>
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => handleOpenTransaction('debit')}
                        className="flex-1 h-24 lg:h-full border border-dashed border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-950 flex items-center justify-center transition-colors">
                            <ArrowDownRight className="h-5 w-5 text-slate-500 group-hover:text-red-500 transition-colors" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-500">Saída</span>
                            <span className="block text-xs text-slate-400 hidden sm:block">Nova Saída de Valor</span>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Carousel Section */}
            <div className="space-y-4 print:hidden">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Contas</h2>
                </div>

                {loadingAccounts ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
                    </div>
                ) : accounts && accounts.length > 0 ? (
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        plugins={
                            isDesktop
                                ? []
                                : [
                                    Autoplay({
                                        delay: 4000,
                                        stopOnInteraction: true,
                                    }),
                                ]
                        }
                        className="w-full"
                    >
                        <CarouselContent>
                            {accounts.map((account) => (
                                <CarouselItem key={account.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                                    <div className="p-1 h-full">
                                        <FinancialAccountCard
                                            account={account}
                                            onDelete={handleDeleteAccount}
                                            onDetail={(id) => navigate(`/accounts/${id}`)}
                                            onEdit={handleEditAccount}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-4" />
                        <CarouselNext className="hidden md:flex -right-4" />
                    </Carousel>
                ) : (
                    <div
                        onClick={handleCreateAccount}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all text-slate-400 hover:text-primary hover:border-primary/50 gap-2 min-h-[140px]"
                    >
                        <Plus className="h-8 w-8" />
                        <span className="font-medium text-sm">Adicionar primeira conta</span>
                    </div>
                )}
            </div>

            {/* Transactions Section */}
            <div className="mt-8">
                <TransactionList
                    transactions={transactions || []}
                    isLoading={loadingTransactions}
                    consolidatedBalance={totalBalance}
                />
            </div>
        </div>
    );
}
