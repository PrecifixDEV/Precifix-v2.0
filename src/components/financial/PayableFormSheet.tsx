import { useState, useEffect } from "react";
import { StandardSheet } from "@/components/ui/StandardSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { costService } from "@/services/costService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { OperationalCost } from "@/types/costs";

interface PayableFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payable?: OperationalCost | null;
}

export function PayableFormSheet({ open, onOpenChange, payable }: PayableFormSheetProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        value: "",
        category: "Geral",
        expense_date: new Date().toISOString().split('T')[0],
        type: "fixed" as "fixed" | "variable",
        observation: ""
    });

    useEffect(() => {
        if (payable) {
            setFormData({
                description: payable.description,
                value: payable.value.toString(),
                category: payable.category || "Geral",
                expense_date: payable.expense_date || new Date().toISOString().split('T')[0],
                type: payable.type || "fixed",
                observation: payable.observation || ""
            });
        }
    }, [payable, open]);

    const handleSave = async () => {
        if (!formData.description || !formData.value) {
            toast.error("Preencha os campos obrigatórios.");
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                ...formData,
                value: parseFloat(formData.value)
            };

            if (payable) {
                await costService.updateCost(payable.id, data);
                toast.success("Despesa atualizada!");
            } else {
                await costService.createCost(data);
                toast.success("Despesa criada com sucesso!");
            }

            queryClient.invalidateQueries({ queryKey: ['costs'] });
            queryClient.invalidateQueries({ queryKey: ['payable-payments'] });
            onOpenChange(false);
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StandardSheet
            open={open}
            onOpenChange={onOpenChange}
            title={payable ? "Editar Despesa" : "Nova Despesa"}
            onSave={handleSave}
            isLoading={isLoading}
            saveLabel={payable ? "Salvar Alterações" : "Criar Despesa"}
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Input
                        placeholder="Ex: Aluguel, Internet..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-zinc-950 border-zinc-800"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Valor *</Label>
                        <Input
                            type="number"
                            placeholder="0,00"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            className="bg-zinc-950 border-zinc-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Data de Vencimento</Label>
                        <Input
                            type="date"
                            value={formData.expense_date}
                            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                            className="bg-zinc-950 border-zinc-800"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="fixed">Fixo</SelectItem>
                                <SelectItem value="variable">Variável</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Input
                            placeholder="Ex: Infraestrutura"
                            value={formData.category || ""}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="bg-zinc-950 border-zinc-800"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                        placeholder="Detalhes adicionais..."
                        value={formData.observation}
                        onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
                        className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                    />
                </div>
            </div>
        </StandardSheet>
    );
}
