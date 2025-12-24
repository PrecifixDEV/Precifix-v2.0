
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { OperationalCost } from '@/types/costs';

interface FixedCostsTableProps {
    costs: OperationalCost[];
    onEdit: (cost: OperationalCost) => void;
    onDelete: (id: string) => void;
}

export const FixedCostsTable = ({ costs, onEdit, onDelete }: FixedCostsTableProps) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Custos Fixos</h3>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-800">
                            <TableHead className="text-slate-700 dark:text-slate-300">Descrição</TableHead>
                            <TableHead className="text-right text-slate-700 dark:text-slate-300">Valor</TableHead>
                            <TableHead className="w-[80px] text-center text-slate-700 dark:text-slate-300">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {costs.length > 0 ? (
                            costs.map((cost) => (
                                <TableRow key={cost.id} className="border-slate-200 dark:border-slate-800">
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{cost.description}</TableCell>
                                    <TableCell className="text-right text-slate-900 dark:text-slate-100">R$ {cost.value.toFixed(2)}</TableCell>
                                    <TableCell className="flex justify-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(cost)} className="text-slate-500 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-slate-900 dark:text-white">Tem certeza?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o custo "{cost.description}".
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(cost.id)} className="bg-red-500 text-white hover:bg-red-600">
                                                        Excluir
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-slate-500 dark:text-slate-400">
                                    Nenhum custo fixo cadastrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
