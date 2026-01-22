import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BankLogo } from "@/components/ui/bank-logo";
import { Wallet, ChevronDown } from "lucide-react";
import { formatMoney } from "@/utils/format";
import type { FinancialAccount } from "@/types/costs";

interface ConsolidatedBalanceCardProps {
    totalBalance: number;
    accounts?: FinancialAccount[];
}

export function ConsolidatedBalanceCard({ totalBalance, accounts }: ConsolidatedBalanceCardProps) {
    return (
        <Card className="w-full h-full flex flex-col justify-between border-zinc-200 dark:border-zinc-800 shadow-xl transition-all hover:border-yellow-500/50 hover:bg-yellow-50/50 dark:hover:bg-yellow-950/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Saldo Consolidado
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
                    {formatMoney(totalBalance)}
                </div>
            </CardContent>
            <CardFooter className="pt-0 mt-auto">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground h-auto py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-primary justify-between group border border-dashed border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all font-normal"
                        >
                            Ver detalhamento bancário
                            <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </Button>
                    </PopoverTrigger>
                    {/* Width variable matches the trigger width for the expansion illusion */}
                    <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="center"
                        side="bottom"
                        sideOffset={4}
                    >
                        <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                            {accounts?.map(acc => {
                                const balance = Number(acc.current_balance);
                                const isPositive = balance >= 0;
                                const isZero = balance === 0;

                                return (
                                    <div key={acc.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                        <div className="flex items-center gap-2">
                                            {acc.type === 'bank' && acc.bank_code ? (
                                                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-700 shadow-sm">
                                                    <BankLogo bankCode={acc.bank_code} className="h-5 w-5" showName={false} fullBleed />
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-sm">
                                                    <Wallet className="h-4 w-4" />
                                                </div>
                                            )}
                                            <span
                                                className="truncate max-w-[140px] font-medium transition-opacity"
                                                style={{ color: acc.color || undefined }}
                                            >
                                                {acc.name}
                                            </span>
                                        </div>
                                        <span className={`font-mono font-medium ${isZero ? 'text-zinc-500' : isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {!isZero ? (isPositive ? '+ ' : '- ') : ''}
                                            {formatMoney(Math.abs(balance))}
                                        </span>
                                    </div>
                                );
                            })}
                            {(!accounts || accounts.length === 0) && (
                                <p className="p-4 text-center text-xs text-muted-foreground italic">Nenhuma conta encontrada.</p>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </CardFooter>
        </Card>
    );
}
