import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { OperationalCost } from "@/types/costs";
import { format, isBefore, isSameDay, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Circle, CalendarClock } from "lucide-react";
import { formatMoney } from "@/utils/format";
import { cn } from "@/lib/utils";

interface CostHistorySheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    costId: string | null;
    allCosts: OperationalCost[];
}

export function CostHistorySheet({ open, onOpenChange, costId, allCosts }: CostHistorySheetProps) {
    if (!costId) return null;

    const selectedCost = allCosts.find(c => c.id === costId);
    if (!selectedCost) return null;

    // Determine history items
    let historyItems: OperationalCost[] = [];
    if (selectedCost.recurrence_group_id) {
        historyItems = allCosts.filter(c => c.recurrence_group_id === selectedCost.recurrence_group_id);
    } else {
        historyItems = [selectedCost];
    }

    // Sort by date (asc)
    historyItems.sort((a, b) => {
        if (!a.expense_date || !b.expense_date) return 0;
        return a.expense_date.localeCompare(b.expense_date);
    });

    const today = startOfDay(new Date());

    // Calculate totals
    const totalValue = historyItems.reduce((acc, c) => acc + c.value, 0);
    const totalPaid = historyItems
        .filter(c => c.expense_date && (isBefore(parseISO(c.expense_date), today) || isSameDay(parseISO(c.expense_date), today)))
        .reduce((acc, c) => acc + c.value, 0);
    const totalOpen = Math.max(0, totalValue - totalPaid);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[400px] w-full">
                <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <SheetTitle>Histórico da Despesa</SheetTitle>
                    <SheetDescription>
                        Acompanhe o status e histórico de pagamentos desta recorrência.
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Header Info */}
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg leading-tight">{selectedCost.description}</h3>
                        <p className="text-sm text-muted-foreground">{selectedCost.category}</p>
                        {selectedCost.is_recurring && (
                            <Badge variant="outline" className="mt-2 text-xs">
                                Recorrência: {
                                    selectedCost.recurrence_frequency === 'monthly' ? 'Mensal' :
                                        selectedCost.recurrence_frequency === 'daily' ? 'Diária' :
                                            selectedCost.recurrence_frequency === 'weekly' ? 'Semanal' :
                                                selectedCost.recurrence_frequency === 'yearly' ? 'Anual' : 'Personalizada'
                                }
                            </Badge>
                        )}
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase">Pago</span>
                            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatMoney(totalPaid)}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="text-xs text-slate-500 font-medium uppercase">Em Aberto</span>
                            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{formatMoney(totalOpen)}</div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                            <CalendarClock className="h-4 w-4" />
                            Linha do Tempo
                        </h4>

                        <ScrollArea className="h-[400px] -mr-4 pr-4">
                            <div className="space-y-0 relative border-l border-slate-200 dark:border-slate-800 ml-2.5 my-2">
                                {historyItems.map((item) => {
                                    const date = item.expense_date ? parseISO(item.expense_date) : new Date();
                                    const isPaid = isBefore(date, today) || isSameDay(date, today); // Simple logic: Past = Paid
                                    const isCurrent = item.id === costId;

                                    return (
                                        <div key={item.id} className={cn("relative pl-6 py-3 transition-colors rounded-r-md group", isCurrent && "bg-slate-50 dark:bg-slate-900/50")}>
                                            {/* Timeline Dot */}
                                            <div className={cn(
                                                "absolute -left-1.5 top-5 h-3 w-3 rounded-full border-2 bg-background z-10",
                                                isPaid
                                                    ? "border-emerald-500 bg-emerald-500"
                                                    : "border-slate-300 dark:border-slate-600"
                                            )} />

                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("text-sm font-medium", isPaid ? "text-slate-900 dark:text-slate-100" : "text-slate-500")}>
                                                            {format(date, "d 'de' MMMM, yyyy", { locale: ptBR })}
                                                        </span>
                                                        {isCurrent && <Badge variant="secondary" className="text-[10px] h-4 px-1">Atual</Badge>}
                                                    </div>
                                                    <div className={cn("text-xs flex items-center gap-1", isPaid ? "text-emerald-600" : "text-slate-400")}>
                                                        {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                                                        {isPaid ? "Pago" : "Em aberto"}
                                                    </div>
                                                </div>
                                                <div className="font-semibold text-sm">
                                                    {formatMoney(item.value)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
