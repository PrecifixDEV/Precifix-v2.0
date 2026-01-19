import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Wallet, ExternalLink, Edit } from "lucide-react";
import { BankLogo } from "@/components/ui/bank-logo";
import { formatMoney } from "../../utils/format";
import type { FinancialAccount } from "@/types/costs";

interface FinancialAccountCardProps {
    account: FinancialAccount;
    onDelete?: (id: string, name: string) => void;
    onDetail?: (id: string) => void;
    onEdit?: (account: FinancialAccount) => void;
    hideActions?: boolean;
}

export function FinancialAccountCard({ account, onDelete, onDetail, onEdit, hideActions = false }: FinancialAccountCardProps) {
    return (
        <Card className="h-full border-zinc-200 dark:border-zinc-800 hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col justify-between">
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
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate w-[120px] sm:w-auto" title={account.name}>{account.name}</h3>
                            <p className="text-xs text-zinc-500 capitalize">{account.type === 'bank' ? 'Conta Bancária' : 'Caixa Físico'}</p>
                        </div>
                    </div>

                    {!hideActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 -mr-2 -mt-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(account)}>
                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                    </DropdownMenuItem>
                                )}
                                {onDetail && (
                                    <DropdownMenuItem onClick={() => onDetail(account.id)}>
                                        <ExternalLink className="mr-2 h-4 w-4" /> Detalhar
                                    </DropdownMenuItem>
                                )}
                                {(onEdit || onDetail) && onDelete && <DropdownMenuSeparator />}
                                {onDelete && (
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600 group-hover:bg-red-50" onClick={() => onDelete(account.id, account.name)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Remover
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div>
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                        {formatMoney(Number(account.current_balance))}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
