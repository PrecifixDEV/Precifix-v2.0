import { supabase } from "@/lib/supabase";

export type FinancialScope = 'INCOME' | 'EXPENSE';

export interface FinancialCategory {
    id: string;
    user_id: string;
    name: string;
    scope?: FinancialScope; // Only for root categories
    parent_id?: string | null; // If null, it's a Root Category (Group). If set, it's a Subcategory.
    description?: string;
    is_operational?: boolean;
    created_at: string;

    // Virtual field for UI convenience (optional, might not be returned by DB)
    children?: FinancialCategory[];
}

// Default Seed Data (Hierarchical)
export const DEFAULT_CATEGORIES_TREE = [
    {
        name: 'Receitas (Entradas)',
        scope: 'INCOME' as FinancialScope,
        is_operational: true,
        subcategories: [
            { name: 'Serviços Prestados', description: 'Serviços de detalhamento, lavagem, etc.' },
            { name: 'Venda de Produtos (Revenda)', description: 'Ex: Shampoos, ceras ou cheirinhos vendidos ao cliente final.' },
            { name: 'Outras Entradas', description: 'Ex: Venda de sucata, equipamentos velhos.' }
        ]
    },
    {
        name: 'Produtos e Materiais',
        scope: 'EXPENSE' as FinancialScope,
        is_operational: true,
        subcategories: [
            { name: 'Produtos Químicos', description: 'Shampoos, Ceras, APC, etc.' },
            { name: 'Acessórios e Consumíveis', description: 'Boinas, Flanelas, Lixas, Fitas.' },
            { name: 'EPIs e Uniformes', description: 'Luvas, máscaras, camisetas da empresa.' },
            { name: 'Serviços de Terceiros', description: 'Funilaria, Pintura terceirizada, etc.' }
        ]
    },
    {
        name: 'Estrutura da Loja',
        scope: 'EXPENSE' as FinancialScope,
        is_operational: true,
        subcategories: [
            { name: 'Aluguel e Condomínio', description: 'Custos fixos do local.' },
            { name: 'Conta de Luz', description: '' },
            { name: 'Conta de Água', description: '' },
            { name: 'Manutenção Predial', description: 'Reparos na loja, lâmpadas, pintura.' }
        ]
    },
    {
        name: 'Equipe e Sócios',
        scope: 'EXPENSE' as FinancialScope,
        is_operational: true,
        subcategories: [
            { name: 'Salário Mensal (Fixo)', description: 'Salários fixos de funcionários.' },
            { name: 'Transporte e Alimentação', description: 'Vale transporte, vale refeição/alimentação.' },
            { name: 'Salário do Dono (Pró-labore)', description: 'Sua retirada fixa mensal.' },
            { name: 'Encargos Trabalhistas', description: 'FGTS, INSS, férias, 13º.' }
        ]
    },
    {
        name: 'Escritório e Marketing',
        scope: 'EXPENSE' as FinancialScope,
        is_operational: true,
        subcategories: [
            { name: 'Sistemas e Internet', description: 'Software de gestão, provedor de internet.' },
            { name: 'Anúncios e Propaganda', description: 'Ads, Panfletos, Gestão de tráfego.' },
            { name: 'Material de Escritório', description: 'Papel, caneta, tinta impressora.' },
            { name: 'Taxas Bancárias', description: 'Manutenção de conta, DOC/TED.' }
        ]
    },
    {
        name: 'Impostos e Investimentos',
        scope: 'EXPENSE' as FinancialScope,
        is_operational: true,
        subcategories: [
            { name: 'Impostos Mensais', description: 'DAS, Simples Nacional.' },
            { name: 'Compra de Equipamentos', description: 'Politrizes, Aspiradores (Investimento).' },
            { name: 'Empréstimos', description: 'Pagamento de parcelas de empréstimo.' }
        ]
    },
    {
        name: 'Comissões e Premiações',
        scope: 'EXPENSE' as FinancialScope,
        is_operational: false,
        subcategories: [
            { name: 'Comissões de Produção', description: 'Pago ao executor do serviço.' },
            { name: 'Comissões de Venda', description: 'Pago a quem vendeu.' },
            { name: 'Bônus e Metas', description: 'Premiações por desempenho.' }
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
                        parent_id: null,
                        is_operational: group.is_operational
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
                    scope: null, // Subcategories inherit scope logically, but column can be null
                    is_operational: group.is_operational // Children inherit operational status
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
