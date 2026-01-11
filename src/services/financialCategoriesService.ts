import { supabase } from "@/lib/supabase";

export interface FinancialCategory {
    id: string;
    user_id: string;
    name: string;
    type:
    | 'Receitas (Entradas)'
    | 'Custos Diretos (Variáveis do Serviço)'
    | 'Despesas Operacionais (Fixas e Manutenção)'
    | 'Despesas Administrativas'
    | 'Despesas com Pessoal'
    | 'Financeiro/Fiscal';
    description?: string;
    created_at: string;
}

export const CATEGORY_TYPES = [
    'Receitas (Entradas)',
    'Custos Diretos (Variáveis do Serviço)',
    'Despesas Operacionais (Fixas e Manutenção)',
    'Despesas Administrativas',
    'Despesas com Pessoal',
    'Financeiro/Fiscal'
] as const;

export const DEFAULT_CATEGORIES: Pick<FinancialCategory, 'type' | 'name' | 'description'>[] = [
    // 1. Receitas (Entradas)
    { type: 'Receitas (Entradas)', name: 'Serviços Prestados', description: 'O core business (Polimento, Higienização, PPF, etc).' },
    { type: 'Receitas (Entradas)', name: 'Venda de Produtos (Revenda)', description: 'Shampoos, ceras ou cheirinhos vendidos ao cliente final.' },
    { type: 'Receitas (Entradas)', name: 'Outras Receitas', description: 'Venda de sucata, equipamentos velhos (antigo "Venda de ativo").' },

    // 2. Custos Diretos (Variáveis do Serviço)
    { type: 'Custos Diretos (Variáveis do Serviço)', name: 'Insumos Químicos', description: 'Compostos polidores, APC, ceras, vitrificadores.' },
    { type: 'Custos Diretos (Variáveis do Serviço)', name: 'Materiais de Consumo/Desgaste', description: 'Boinas, flanelas de microfibra, lixas, fitas.' },
    { type: 'Custos Diretos (Variáveis do Serviço)', name: 'EPIs e Uniformes', description: 'Luvas nitrílicas, máscaras, botas.' },
    { type: 'Custos Diretos (Variáveis do Serviço)', name: 'Terceirização Operacional', description: 'Martelinho de ouro ou pintor parceiro (se houver repasse).' },

    // 3. Despesas Operacionais (Fixas e Manutenção)
    { type: 'Despesas Operacionais (Fixas e Manutenção)', name: 'Aluguel e Condomínio', description: 'Despesa fixa do imóvel.' }, // Description inferred/added based on list context
    { type: 'Despesas Operacionais (Fixas e Manutenção)', name: 'Manutenção de Maquinário', description: 'Politrizes, compressores e extratoras quebram com frequência.' },
    { type: 'Despesas Operacionais (Fixas e Manutenção)', name: 'Manutenção Predial', description: 'Box de lavagem, calhas, elétrica (alta carga).' },
    { type: 'Despesas Operacionais (Fixas e Manutenção)', name: 'Água e Esgoto', description: 'Custo crítico para lavagens.' },
    { type: 'Despesas Operacionais (Fixas e Manutenção)', name: 'Energia Elétrica', description: 'Iluminação forte e máquinas ligadas o dia todo.' },

    // 4. Despesas Administrativas
    { type: 'Despesas Administrativas', name: 'Software e Sistemas', description: '(Precifix, CRM).' },
    { type: 'Despesas Administrativas', name: 'Marketing e Tráfego Pago', description: 'Separar o investimento em anúncios da gestão de redes sociais.' },
    { type: 'Despesas Administrativas', name: 'Material de Escritório/Limpeza', description: 'Papelaria, café, produtos de limpeza do chão (não do carro).' },
    { type: 'Despesas Administrativas', name: 'Telecomunicações', description: 'Internet e Celular.' },
    { type: 'Despesas Administrativas', name: 'Contabilidade e Legal', description: 'Honorários e taxas.' },
    { type: 'Despesas Administrativas', name: 'Taxas Bancárias/Maquininha', description: 'Antecipação e taxas de cartão.' },

    // 5. Despesas com Pessoal
    { type: 'Despesas com Pessoal', name: 'Salários Fixos', description: 'CLT ou fixo combinado.' },
    { type: 'Despesas com Pessoal', name: 'Comissões/Produção', description: 'O valor variável pago por carro feito (muito comum no setor).' },
    { type: 'Despesas com Pessoal', name: 'Benefícios', description: 'Vale transporte, alimentação.' },
    { type: 'Despesas com Pessoal', name: 'Pró-labore', description: 'Retirada dos sócios.' },

    // 6. Financeiro/Fiscal
    { type: 'Financeiro/Fiscal', name: 'Impostos sobre Nota Fiscal', description: 'Simples Nacional, ISS.' },
    { type: 'Financeiro/Fiscal', name: 'Investimentos/Obras', description: 'Reformas no estúdio' }
];

export const financialCategoriesService = {
    async getAll() {
        // Initialize defaults if empty check is implicit in logic below or we do explicit check?
        // Better to check and seed if mostly empty. But let's just fetch first.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
            // @ts-ignore
            .from('financial_categories')
            .select('*')
            .order('type')
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

        if (count === 0) {
            const displayCategories = DEFAULT_CATEGORIES.map(c => ({
                ...c,
                user_id: user.id
            }));

            const { error: insertError } = await supabase
                // @ts-ignore
                .from('financial_categories')
                .insert(displayCategories);

            if (insertError) throw insertError;
            return true; // Seeded
        }
        return false; // Already exists
    },

    async create(category: Pick<FinancialCategory, 'name' | 'type' | 'description'>) {
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
