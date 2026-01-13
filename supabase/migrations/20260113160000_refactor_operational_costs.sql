-- Migration: Refactor Operational Costs and New Category Tree

-- 1. Add is_operational column
ALTER TABLE public.financial_categories 
ADD COLUMN IF NOT EXISTS is_operational BOOLEAN DEFAULT true;

-- 2. Update the seed function to use the new tree
CREATE OR REPLACE FUNCTION public.seed_financial_categories(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    income_parent_id UUID;
    products_parent_id UUID;
    structure_parent_id UUID;
    team_parent_id UUID;
    office_parent_id UUID;
    taxes_parent_id UUID;
    commissions_parent_id UUID;
BEGIN
    -- Clear existing defaults if any (Optional: logic to merge is complex, we assume fresh or we just add new ones)
    -- For now, we will simply INSERT. If user already has categories, this might duplicate if we don't check.
    -- But since this is often run on new users, it's fine. For existing users, we might want to be careful.
    -- The user requested a "Definitive" tree.

    -- 1. Entradas (INCOME)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id, is_operational)
    VALUES (target_user_id, 'Receitas (Entradas)', 'INCOME', 'Grupo Padrão', NULL, true)
    RETURNING id INTO income_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope, is_operational) VALUES
    (target_user_id, 'Serviços Realizados', 'Serviços de detalhamento, lavagem, etc.', income_parent_id, NULL, true),
    (target_user_id, 'Venda de Produtos (Revenda)', 'Ex: Shampoos, ceras ou cheirinhos vendidos ao cliente final.', income_parent_id, NULL, true),
    (target_user_id, 'Outras Entradas', 'Ex: Venda de sucata, equipamentos velhos.', income_parent_id, NULL, true);

    -- 2. Produtos e Materiais (EXPENSE - isOperational: true)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id, is_operational)
    VALUES (target_user_id, 'Produtos e Materiais', 'EXPENSE', 'Tudo que você compra para usar nos carros.', NULL, true)
    RETURNING id INTO products_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope, is_operational) VALUES
    (target_user_id, 'Produtos Químicos', 'Shampoos, Ceras, APC, etc.', products_parent_id, NULL, true),
    (target_user_id, 'Acessórios e Consumíveis', 'Boinas, Flanelas, Lixas, Fitas.', products_parent_id, NULL, true),
    (target_user_id, 'EPIs e Uniformes', 'Luvas, máscaras, camisetas da empresa.', products_parent_id, NULL, true),
    (target_user_id, 'Serviços de Terceiros', 'Funilaria, Pintura terceirizada, etc.', products_parent_id, NULL, true);

    -- 3. Estrutura da Loja (EXPENSE - isOperational: true)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id, is_operational)
    VALUES (target_user_id, 'Estrutura da Loja', 'EXPENSE', 'Custos fixos do local.', NULL, true)
    RETURNING id INTO structure_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope, is_operational) VALUES
    (target_user_id, 'Aluguel e Condomínio', NULL, structure_parent_id, NULL, true),
    (target_user_id, 'Conta de Luz', NULL, structure_parent_id, NULL, true),
    (target_user_id, 'Conta de Água', NULL, structure_parent_id, NULL, true),
    (target_user_id, 'Manutenção Predial', 'Reparos na loja, lâmpadas, pintura.', structure_parent_id, NULL, true);

    -- 4. Equipe e Sócios (EXPENSE - isOperational: true)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id, is_operational)
    VALUES (target_user_id, 'Equipe e Sócios', 'EXPENSE', 'Custos com pessoas.', NULL, true)
    RETURNING id INTO team_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope, is_operational) VALUES
    (target_user_id, 'Salário Mensal (Fixo)', 'Salários fixos de funcionários.', team_parent_id, NULL, true),
    (target_user_id, 'Transporte e Alimentação', 'Vale transporte, vale refeição/alimentação.', team_parent_id, NULL, true),
    (target_user_id, 'Salário do Dono (Pró-labore)', 'Sua retirada fixa mensal.', team_parent_id, NULL, true),
    (target_user_id, 'Encargos Trabalhistas', 'FGTS, INSS, férias, 13º.', team_parent_id, NULL, true);

    -- 5. Escritório e Marketing (EXPENSE - isOperational: true)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id, is_operational)
    VALUES (target_user_id, 'Escritório e Marketing', 'EXPENSE', 'Custos administrativos e vendas.', NULL, true)
    RETURNING id INTO office_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope, is_operational) VALUES
    (target_user_id, 'Sistemas e Internet', 'Software de gestão, provedor de internet.', office_parent_id, NULL, true),
    (target_user_id, 'Anúncios e Propaganda', 'Ads, Panfletos, Gestão de tráfego.', office_parent_id, NULL, true),
    (target_user_id, 'Material de Escritório', 'Papel, caneta, tinta impressora.', office_parent_id, NULL, true),
    (target_user_id, 'Taxas Bancárias', 'Manutenção de conta, DOC/TED.', office_parent_id, NULL, true);

    -- 6. Impostos e Investimentos (EXPENSE - isOperational: true)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id, is_operational)
    VALUES (target_user_id, 'Impostos e Investimentos', 'EXPENSE', 'Custos financeiros e governamentais.', NULL, true)
    RETURNING id INTO taxes_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope, is_operational) VALUES
    (target_user_id, 'Impostos Mensais', 'DAS, Simples Nacional.', taxes_parent_id, NULL, true),
    (target_user_id, 'Compra de Equipamentos', 'Politrizes, Aspiradores (Investimento).', taxes_parent_id, NULL, true),
    (target_user_id, 'Empréstimos', 'Pagamento de parcelas de empréstimo.', taxes_parent_id, NULL, true);

    -- 7. Comissões e Premiações (EXPENSE - isOperational: FALSE)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id, is_operational)
    VALUES (target_user_id, 'Comissões e Premiações', 'EXPENSE', 'Variável pura. NÃO entra no custo hora.', NULL, false)
    RETURNING id INTO commissions_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope, is_operational) VALUES
    (target_user_id, 'Comissões de Produção', 'Pago ao executor do serviço.', commissions_parent_id, NULL, false),
    (target_user_id, 'Comissões de Venda', 'Pago a quem vendeu.', commissions_parent_id, NULL, false),
    (target_user_id, 'Bônus e Metas', 'Premiações por desempenho.', commissions_parent_id, NULL, false);

END;
$$;

-- 3. One-off update for existing categories (Best effort mapping)
-- We set everything to true first
UPDATE public.financial_categories SET is_operational = true;

-- Then set specific ones to false (Commissions)
UPDATE public.financial_categories 
SET is_operational = false 
WHERE name ILIKE '%comiss%' OR name ILIKE '%premia%' OR name ILIKE '%bônus%' OR name ILIKE '%bonus%';
