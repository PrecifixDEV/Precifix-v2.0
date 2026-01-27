import { useState, useEffect } from "react";
import { StandardSheet } from "@/components/ui/StandardSheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { financialService } from "@/services/financialService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { FinancialReceivable } from "@/types/costs";

interface ReceivableFormSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receivable?: FinancialReceivable | null;
}

export function ReceivableFormSheet({ open, onOpenChange, receivable }: ReceivableFormSheetProps) {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        value: "",
        category: "Geral",
        expense_date: new Date().toISOString().split('T')[0],
        type: "other",
        observation: ""
    });

    useEffect(() => {
        if (receivable) {
            setFormData({
                description: receivable.description,
                value: receivable.value.toString(),
                category: receivable.category || "Geral",
                expense_date: receivable.expense_date || new Date().toISOString().split('T')[0],
                type: receivable.type || "other",
                observation: receivable.observation || ""
            });
        } else {
            setFormData({
                description: "",
                value: "",
                category: "Geral",
                expense_date: new Date().toISOString().split('T')[0],
                type: "other",
                observation: ""
            });
        }
    }, [receivable, open]);

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

            if (receivable) {
                // Update logic (to be added to financialService if needed)
                toast.info("Funcionalidade de edição em breve.");
            } else {
                await financialService.createReceivable(data);
                toast.success("Recebível criado com sucesso!");
            }

            queryClient.invalidateQueries({ queryKey: ['receivables'] });
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
            title={receivable ? "Editar Recebível" : "Novo Recebível"}
            onSave={handleSave}
            isLoading={isLoading}
            saveLabel={receivable ? "Salvar Alterações" : "Criar Recebível"}
        >
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Input
                        placeholder="Ex: Consultoria Mensal"
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

                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                    >
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="Geral">Geral</SelectItem>
                            <SelectItem value="Serviços">Serviços</SelectItem>
                            <SelectItem value="Produtos">Produtos</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                    </Select>
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
