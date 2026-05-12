-- =====================================================
-- Migration: Hardening Security & Performance Optimization
-- Data: 2026-05-13
-- =====================================================

-- 1. ATIVAÇÃO CRÍTICA DE RLS (Row Level Security)
-- Garante que o banco de dados exija políticas de acesso para todas as operações
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. OTIMIZAÇÃO DE PERFORMANCE: Função de Estatísticas do Dashboard
-- Esta função processa os dados no servidor, retornando apenas o necessário para o frontend.
-- Resolve o gargalo de escalabilidade identificado no relatório.

CREATE OR REPLACE FUNCTION public.get_dashboard_summary(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de acesso aos dados, mas filtrando pelo p_user_id
SET search_path = public
AS $$
DECLARE
    result JSONB;
    v_receita DECIMAL;
    v_custos DECIMAL;
    v_lucro DECIMAL;
    v_quotes_pending INTEGER;
    v_quotes_approved INTEGER;
    v_active_prints INTEGER;
    v_total_printers INTEGER;
    v_active_printers INTEGER;
BEGIN
    -- Cálculo de Receita (Transações de entrada concluídas)
    SELECT COALESCE(SUM(value), 0) INTO v_receita
    FROM transactions
    WHERE user_id = p_user_id 
      AND type = 'INCOME' 
      AND status = 'CONCLUÍDO'
      AND date >= p_start_date AND date <= p_end_date;

    -- Cálculo de Custos (Transações de saída concluídas)
    SELECT COALESCE(SUM(value), 0) INTO v_custos
    FROM transactions
    WHERE user_id = p_user_id 
      AND type = 'EXPENSE' 
      AND status = 'CONCLUÍDO'
      AND date >= p_start_date AND date <= p_end_date;

    v_lucro := v_receita - v_custos;

    -- Orçamentos
    SELECT COUNT(*) INTO v_quotes_pending
    FROM quotes
    WHERE user_id = p_user_id AND status = 'PENDENTE'
      AND created_at >= p_start_date AND created_at <= p_end_date;

    SELECT COUNT(*) INTO v_quotes_approved
    FROM quotes
    WHERE user_id = p_user_id AND status = 'APROVADO'
      AND created_at >= p_start_date AND created_at <= p_end_date;

    -- Produção
    SELECT COUNT(*) INTO v_active_prints
    FROM production_jobs
    WHERE user_id = p_user_id AND status = 'IMPRIMINDO';

    -- Impressoras
    SELECT COUNT(*) INTO v_total_printers FROM printers WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO v_active_printers FROM printers WHERE user_id = p_user_id AND status = 'IMPRIMINDO';

    -- Montagem do JSON de resposta
    result := jsonb_build_object(
        'receita', v_receita,
        'custos', v_custos,
        'lucro', v_lucro,
        'orcamentos_pendentes', v_quotes_pending,
        'orcamentos_aprovados', v_quotes_approved,
        'impressoes_ativas', v_active_prints,
        'total_impressoras', v_total_printers,
        'impressoras_ativas', v_active_printers
    );

    RETURN result;
END;
$$;

-- 3. GARANTIR INTEGRIDADE DE USER_PROFILES
-- Se não existirem políticas para user_profiles, criá-las aqui (redundância de segurança)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can manage own profile') THEN
        CREATE POLICY "Users can manage own profile" ON public.user_profiles
            FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- 4. RECARREGAR SCHEMA
NOTIFY pgrst, 'reload schema';
