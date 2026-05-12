-- =====================================================
-- Migration: Correções de Segurança
-- Data: 2026-05-12
-- =====================================================

-- 1. CORREÇÃO CRÍTICA: SECURITY DEFINER → SECURITY INVOKER
-- O SECURITY DEFINER permite que a função execute com privilégios do dono
-- SECURITY INVOKER (padrão) executa com privilégios do usuário chamador
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- 2. Adicionar filtro user_id nas tabelas que não tinham (product_materials, production_job_materials)
-- Garantir que as políticas cubram todas as operações

-- Product Materials - adicionar índice se não existir
CREATE INDEX IF NOT EXISTS idx_product_materials_user_id ON public.product_materials(user_id);

-- Production Job Materials - adicionar índice se não existir  
CREATE INDEX IF NOT EXISTS idx_production_job_materials_user_id ON public.production_job_materials(user_id);

-- 3. Adicionar políticas específicas para product_materials se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can CRUD own product materials' AND tablename = 'product_materials') THEN
    CREATE POLICY "Users can CRUD own product materials" ON public.product_materials 
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 4. Adicionar políticas específicas para production_job_materials se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can CRUD own production job materials' AND tablename = 'production_job_materials') THEN
    CREATE POLICY "Users can CRUD own production job materials" ON public.production_job_materials 
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Recarregar schema
NOTIFY pgrst, 'reload schema';
