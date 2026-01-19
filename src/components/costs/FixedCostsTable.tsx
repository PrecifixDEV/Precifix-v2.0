import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OperationalCost } from '@/types/costs';

interface FixedCostsTableProps {
    costs: OperationalCost[];
    onEdit: (cost: OperationalCost) => void;
    onDelete: (id: string, deleteAll: boolean) => void;
}

export const FixedCostsTable = ({ costs, onEdit, onDelete }: FixedCostsTableProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Custos Fixos</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-zinc-700 dark:text-zinc-300">Descrição</TableHead>
                            <TableHead className="text-center text-zinc-700 dark:text-zinc-300">Dia</TableHead>
                            <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Valor</TableHead>
                            <TableHead className="w-[80px] text-center text-zinc-700 dark:text-zinc-300">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {costs.length > 0 ? (
                            costs.map((cost) => (
                                <TableRow key={cost.id}>
                                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {cost.description}
                                        {cost.is_recurring && <span className="ml-2 text-xs text-muted-foreground">(Recorrente)</span>}
                                    </TableCell>
                                    <TableCell className="text-center text-zinc-900 dark:text-zinc-100">
                                        {cost.expense_date ? cost.expense_date.split('-')[2] : '-'}
                                    </TableCell>
                                    <TableCell className="text-right text-zinc-900 dark:text-zinc-100">R$ {cost.value.toFixed(2)}</TableCell>
                                    <TableCell className="flex justify-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(cost)} className="text-zinc-500 hover:text-yellow-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-zinc-900 dark:text-white">
                                                        {cost.is_recurring ? "Excluir Despesa Recorrente?" : "Tem certeza?"}
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-zinc-500 dark:text-zinc-400">
                                                        {cost.is_recurring
                                                            ? `Esta é uma despesa recorrente. A exclusão removerá TODOS os registros futuros e passados vinculados a ela no Contas a Pagar. Deseja continuar?`
                                                            : `Esta ação não pode ser desfeita. Isso excluirá permanentemente o custo "${cost.description}".`
                                                        }
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(cost.id, !!cost.is_recurring)} className="bg-red-500 text-white hover:bg-red-600">
                                                        Excluir {cost.is_recurring ? "Tudo" : ""}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500 dark:text-zinc-400">
                                    Nenhum custo fixo cadastrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
