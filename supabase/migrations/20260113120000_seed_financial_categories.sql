-- Function to seed default categories for a specific user
CREATE OR REPLACE FUNCTION public.seed_financial_categories(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Parent IDs
    income_parent_id UUID;
    var_cost_parent_id UUID;
    fixed_cost_parent_id UUID;
    admin_cost_parent_id UUID;
    personnel_cost_parent_id UUID;
    financial_cost_parent_id UUID;
BEGIN
    -- 1. Receitas (Entradas)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id)
    VALUES (target_user_id, 'Receitas (Entradas)', 'INCOME', 'Grupo Padrão', NULL)
    RETURNING id INTO income_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope) VALUES
    (target_user_id, 'Serviços Prestados', 'Ex: Polimento, Higienização, PPF, etc.', income_parent_id, NULL),
    (target_user_id, 'Venda de Produtos (Revenda)', 'Ex: Shampoos, ceras ou cheirinhos vendidos ao cliente final.', income_parent_id, NULL),
    (target_user_id, 'Outras Receitas', 'Ex: Venda de sucata, equipamentos velhos.', income_parent_id, NULL);

    -- 2. Custos Diretos (Variáveis)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id)
    VALUES (target_user_id, 'Custos Diretos (Variáveis)', 'EXPENSE', 'Grupo Padrão', NULL)
    RETURNING id INTO var_cost_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope) VALUES
    (target_user_id, 'Insumos Químicos', 'Ex: Compostos polidores, APC, ceras, vitrificadores.', var_cost_parent_id, NULL),
    (target_user_id, 'Materiais de Consumo/Desgaste', 'Ex: Boinas, flanelas de microfibra, lixas, fitas.', var_cost_parent_id, NULL),
    (target_user_id, 'EPIs e Uniformes', 'Ex: Luvas nitrílicas, máscaras, botas.', var_cost_parent_id, NULL),
    (target_user_id, 'Terceirização Operacional', 'Ex: Martelinho de ouro, pintor parceiro.', var_cost_parent_id, NULL);

    -- 3. Despesas Operacionais (Fixas)
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id)
    VALUES (target_user_id, 'Despesas Operacionais (Fixas)', 'EXPENSE', 'Grupo Padrão', NULL)
    RETURNING id INTO fixed_cost_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope) VALUES
    (target_user_id, 'Aluguel e Condomínio', 'Despesa fixa do imóvel.', fixed_cost_parent_id, NULL),
    (target_user_id, 'Manutenção de Maquinário', 'Ex: Politrizes, compressores e extratoras.', fixed_cost_parent_id, NULL),
    (target_user_id, 'Manutenção Predial', 'Ex: Box de lavagem, calhas, elétrica.', fixed_cost_parent_id, NULL),
    (target_user_id, 'Água e Esgoto', 'Companhias de Água e Esgoto.', fixed_cost_parent_id, NULL),
    (target_user_id, 'Energia Elétrica', 'Companhias de Eletricidade.', fixed_cost_parent_id, NULL);

    -- 4. Despesas Administrativas
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id)
    VALUES (target_user_id, 'Despesas Administrativas', 'EXPENSE', 'Grupo Padrão', NULL)
    RETURNING id INTO admin_cost_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope) VALUES
    (target_user_id, 'Software e Sistemas', 'Ex: Precifix, CRM.', admin_cost_parent_id, NULL),
    (target_user_id, 'Marketing e Tráfego Pago', 'Ex: Anúncios da gestão de redes sociais.', admin_cost_parent_id, NULL),
    (target_user_id, 'Material de Escritório/Limpeza', 'Ex: Papelaria, café, produtos de limpeza do chão.', admin_cost_parent_id, NULL),
    (target_user_id, 'Telecomunicações', 'Ex: Internet e Celular.', admin_cost_parent_id, NULL),
    (target_user_id, 'Contabilidade e Legal', 'Ex: Honorários e taxas.', admin_cost_parent_id, NULL),
    (target_user_id, 'Taxas Bancárias/Maquininha', 'Ex: Antecipação e taxas de cartão.', admin_cost_parent_id, NULL);

    -- 5. Despesas com Pessoal
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id)
    VALUES (target_user_id, 'Despesas com Pessoal', 'EXPENSE', 'Grupo Padrão', NULL)
    RETURNING id INTO personnel_cost_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope) VALUES
    (target_user_id, 'Salários Fixos', 'Ex: CLT ou fixo combinado.', personnel_cost_parent_id, NULL),
    (target_user_id, 'Comissões/Produção', 'Ex: O valor variável pago por carro feito.', personnel_cost_parent_id, NULL),
    (target_user_id, 'Benefícios', 'Ex: Vale transporte, alimentação.', personnel_cost_parent_id, NULL),
    (target_user_id, 'Pró-labore', 'Retirada dos sócios.', personnel_cost_parent_id, NULL);

    -- 6. Financeiro/Fiscal
    INSERT INTO public.financial_categories (user_id, name, scope, description, parent_id)
    VALUES (target_user_id, 'Financeiro/Fiscal', 'EXPENSE', 'Grupo Padrão', NULL)
    RETURNING id INTO financial_cost_parent_id;

    INSERT INTO public.financial_categories (user_id, name, description, parent_id, scope) VALUES
    (target_user_id, 'Impostos sobre Nota Fiscal', 'Ex: Simples Nacional, ISS.', financial_cost_parent_id, NULL),
    (target_user_id, 'Investimentos/Obras', 'Ex: Reformas no estúdio', financial_cost_parent_id, NULL);

END;
$$;

-- Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user_financial_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.seed_financial_categories(NEW.id);
    RETURN NEW;
END;
$$;

-- Trigger Definition
DROP TRIGGER IF EXISTS on_auth_user_created_seed_categories ON auth.users;
CREATE TRIGGER on_auth_user_created_seed_categories
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_financial_categories();

-- Backfill for existing users who have NO categories
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT u.id 
        FROM auth.users u
        LEFT JOIN public.financial_categories fc ON fc.user_id = u.id
        GROUP BY u.id
        HAVING COUNT(fc.id) = 0
    LOOP
        PERFORM public.seed_financial_categories(r.id);
    END LOOP;
END $$;
