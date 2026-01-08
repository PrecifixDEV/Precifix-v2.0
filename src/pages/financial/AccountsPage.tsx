import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet, ArrowRightLeft, MoreHorizontal, Trash2, ArrowUpRight } from "lucide-react";
import { formatMoney } from "../../utils/format";
import { financialService } from "@/services/financialService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AccountFormDialog } from "@/components/financial/AccountFormDialog";
import { TransactionList } from "@/components/financial/TransactionList";
import { TransferDialog } from "@/components/financial/TransferDialog";
import { AddValueDialog } from "@/components/financial/AddValueDialog";
import { BankLogo } from "@/components/ui/bank-logo";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ConsolidatedBalanceCard } from "@/components/dashboard/ConsolidatedBalanceCard";
import { ResponsiveAddButton } from "@/components/ui/responsive-add-button";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import type { FinancialAccount } from "@/types/costs";

// --- Components ---

interface AccountCardProps {
    account: FinancialAccount;
    onDelete: (id: string, name: string) => void;
}

function AccountCard({ account, onDelete }: AccountCardProps) {
    return (
        <Card className="h-full border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col justify-between">
            {/* Colored Stripe */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: account.color || '#cbd5e1' }}
            />
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        {account.type === 'bank' && account.bank_code ? (
                            <BankLogo bankCode={account.bank_code} className="h-10 w-10" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Wallet className="h-5 w-5" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate w-[120px] sm:w-auto" title={account.name}>{account.name}</h3>
                            <p className="text-xs text-slate-500 capitalize">{account.type === 'bank' ? 'Conta Bancária' : 'Caixa Físico'}</p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 -mr-2 -mt-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 group-hover:bg-red-50" onClick={() => onDelete(account.id, account.name)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Remover
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 block truncate">
                        {formatMoney(Number(account.current_balance))}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}


export default function AccountsPage() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isAddValueOpen, setIsAddValueOpen] = useState(false);

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

    // Calculations
    const totalBalance = accounts?.reduce((acc, curr) => acc + Number(curr.current_balance), 0) || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Caixas e Bancos</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Gerencie suas contas bancárias e acompanhe o fluxo financeiro.
                    </p>
                </div>

                <ResponsiveAddButton
                    onClick={() => setIsCreateOpen(true)}
                    label="Nova Conta"
                    className="shrink-0"
                />
            </div>

            <AccountFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

            {/* Action Support Dialogs */}
            <TransferDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} accounts={accounts || []} />
            <AddValueDialog open={isAddValueOpen} onOpenChange={setIsAddValueOpen} accounts={accounts || []} />


            {/* Top Grid: Total & Actions */}
            {/* Fix: changed h-[200px] to lg:h-[200px] to allow auto height on mobile, preventing flattening */}
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:h-[200px] mb-8">
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
                        onClick={() => setIsAddValueOpen(true)}
                        className="flex-1 h-24 lg:h-full border border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-950 flex items-center justify-center transition-colors">
                            <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div className="text-center">
                            <span className="block font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-500">Adicionar</span>
                            <span className="block text-xs text-slate-400 hidden sm:block">Novo aporte</span>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Carousel Section */}
            <div className="space-y-4">
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
                                        <AccountCard account={account} onDelete={handleDeleteAccount} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex -left-4" />
                        <CarouselNext className="hidden md:flex -right-4" />
                    </Carousel>
                ) : (
                    <div
                        onClick={() => setIsCreateOpen(true)}
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
                />
            </div>
        </div>
    );
}
