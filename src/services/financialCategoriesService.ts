import { supabase } from "@/lib/supabase";

export type FinancialScope = 'INCOME' | 'EXPENSE';

export interface FinancialCategory {
    id: string;
    user_id: string;
    name: string;
    scope?: FinancialScope; // Only for root categories
    parent_id?: string | null; // If null, it's a Root Category (Group). If set, it's a Subcategory.
    description?: string;
    created_at: string;

    // Virtual field for UI convenience (optional, might not be returned by DB)
    children?: FinancialCategory[];
}

// Default Seed Data (Hierarchical)
export const DEFAULT_CATEGORIES_TREE = [
    {
        name: 'Receitas (Entradas)',
        scope: 'INCOME' as FinancialScope,
        subcategories: [
            { name: 'Serviços Prestados', description: 'Ex: Polimento, Higienização, PPF, etc.' },
            { name: 'Venda de Produtos (Revenda)', description: 'Ex: Shampoos, ceras ou cheirinhos vendidos ao cliente final.' },
            { name: 'Outras Receitas', description: 'Ex: Venda de sucata, equipamentos velhos.' }
        ]
    },
    {
        name: 'Custos Diretos (Variáveis)',
        scope: 'EXPENSE' as FinancialScope,
        subcategories: [
            { name: 'Insumos Químicos', description: 'Ex: Compostos polidores, APC, ceras, vitrificadores.' },
            { name: 'Materiais de Consumo/Desgaste', description: 'Ex: Boinas, flanelas de microfibra, lixas, fitas.' },
            { name: 'EPIs e Uniformes', description: 'Ex: Luvas nitrílicas, máscaras, botas.' },
            { name: 'Terceirização Operacional', description: 'Ex: Martelinho de ouro, pintor parceiro.' }
        ]
    },
    {
        name: 'Despesas Operacionais (Fixas)',
        scope: 'EXPENSE' as FinancialScope,
        subcategories: [
            { name: 'Aluguel e Condomínio', description: 'Despesa fixa do imóvel.' },
            { name: 'Manutenção de Maquinário', description: 'Ex: Politrizes, compressores e extratoras.' },
            { name: 'Manutenção Predial', description: 'Ex: Box de lavagem, calhas, elétrica.' },
            { name: 'Água e Esgoto', description: 'Companhias de Água e Esgoto.' },
            { name: 'Energia Elétrica', description: 'Companhias de Eletricidade.' }
        ]
    },
    {
        name: 'Despesas Administrativas',
        scope: 'EXPENSE' as FinancialScope,
        subcategories: [
            { name: 'Software e Sistemas', description: 'Ex: Precifix, CRM.' },
            { name: 'Marketing e Tráfego Pago', description: 'Ex: Anúncios da gestão de redes sociais.' },
            { name: 'Material de Escritório/Limpeza', description: 'Ex: Papelaria, café, produtos de limpeza do chão.' },
            { name: 'Telecomunicações', description: 'Ex: Internet e Celular.' },
            { name: 'Contabilidade e Legal', description: 'Ex: Honorários e taxas.' },
            { name: 'Taxas Bancárias/Maquininha', description: 'Ex: Antecipação e taxas de cartão.' }
        ]
    },
    {
        name: 'Despesas com Pessoal',
        scope: 'EXPENSE' as FinancialScope,
        subcategories: [
            { name: 'Salários Fixos', description: 'Ex: CLT ou fixo combinado.' },
            { name: 'Comissões/Produção', description: 'Ex: O valor variável pago por carro feito.' },
            { name: 'Benefícios', description: 'Ex: Vale transporte, alimentação.' },
            { name: 'Pró-labore', description: 'Retirada dos sócios.' }
        ]
    },
    {
        name: 'Financeiro/Fiscal',
        scope: 'EXPENSE' as FinancialScope,
        subcategories: [
            { name: 'Impostos sobre Nota Fiscal', description: 'Ex: Simples Nacional, ISS.' },
            { name: 'Investimentos/Obras', description: 'Ex: Reformas no estúdio' }
        ]
    }
];

export const financialCategoriesService = {
    async getAll() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            // @ts-ignore
            .from('financial_categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as FinancialCategory[];
    },

    async initializeDefaults() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Check if any categories exist
        const { count, error } = await supabase
            // @ts-ignore
            .from('financial_categories')
            .select('*', { count: 'exact', head: true });

        if (error) throw error;

        // Only seed if absolutely empty
        if (count === 0) {
            for (const group of DEFAULT_CATEGORIES_TREE) {
                // Create Parent
                const { data: parent, error: parentError } = await supabase
                    // @ts-ignore
                    .from('financial_categories')
                    .insert({
                        user_id: user.id,
                        name: group.name,
                        scope: group.scope,
                        description: 'Grupo Padrão',
                        parent_id: null
                    })
                    .select()
                    .single();

                if (parentError || !parent) {
                    console.error("Error creating parent category", parentError);
                    continue;
                }

                // Create Children
                const childrenData = group.subcategories.map(sub => ({
                    user_id: user.id,
                    name: sub.name,
                    description: sub.description,
                    parent_id: parent.id,
                    scope: null // Subcategories inherit scope logically, but column can be null
                }));

                const { error: childrenError } = await supabase
                    // @ts-ignore
                    .from('financial_categories')
                    .insert(childrenData);

                if (childrenError) console.error("Error creating subcategories", childrenError);
            }
            return true; // Seeded
        }
        return false; // Already exists
    },

    async create(category: Pick<FinancialCategory, 'name' | 'scope' | 'parent_id' | 'description'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            // @ts-ignore
            .from('financial_categories')
            .insert({ ...category, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data as FinancialCategory;
    },

    async update(id: string, updates: Partial<FinancialCategory>) {
        const { data, error } = await supabase
            // @ts-ignore
            .from('financial_categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as FinancialCategory;
    },

    async delete(id: string) {
        const { error } = await supabase
            // @ts-ignore
            .from('financial_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
