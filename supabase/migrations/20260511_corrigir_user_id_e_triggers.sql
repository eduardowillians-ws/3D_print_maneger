-- =====================================================
-- Migration: Corrigir user_id e triggers em product_materials
-- Data: 2026-05-11
-- =====================================================

-- 1. Criar triggers para product_materials (faltando na migração anterior)
DROP TRIGGER IF EXISTS set_user_id_product_materials ON public.product_materials;
CREATE TRIGGER set_user_id_product_materials BEFORE INSERT ON public.product_materials FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_user_id_production_job_materials ON public.production_job_materials;
CREATE TRIGGER set_user_id_production_job_materials BEFORE INSERT ON public.production_job_materials FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Para dados existentes SEM user_id, associar ao primeiro usuário existente
-- Isso permite que dados antigos apareçam para pelo menos um usuário
-- Execute apenas se existir um usuário sem dados
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Buscar primeiro usuário
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  -- Se existir usuário e houver dados sem user_id
  IF first_user_id IS NOT NULL THEN
    -- Atualizar dados existentes para associar ao primeiro usuário
    UPDATE public.printers SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    UPDATE public.materials SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    UPDATE public.products SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    UPDATE public.clients SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    UPDATE public.quotes SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    UPDATE public.production_jobs SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    UPDATE public.product_materials SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    UPDATE public.production_job_materials SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    UPDATE public.transactions SET user_id = COALESCE(user_id, first_user_id) WHERE user_id IS NULL;
    
    RAISE NOTICE 'Dados existentes atualizados para primeiro usuário';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Garantir que PostgREST recarregue o schema
NOTIFY pgrst, 'reload schema';