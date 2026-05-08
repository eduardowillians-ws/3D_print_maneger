-- =====================================================
-- Migration: Adicionar user_id e políticas RLS
-- Data: 2026-05-09
-- =====================================================

-- 1. Adicionar coluna user_id em todas as tabelas
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.production_jobs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.product_materials ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.production_job_materials ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_printers_user_id ON public.printers(user_id);
CREATE INDEX IF NOT EXISTS idx_materials_user_id ON public.materials(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_production_jobs_user_id ON public.production_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- 3. Remover políticas antigas (Allow all)
DROP POLICY IF EXISTS "Allow all for all" ON public.printers;
DROP POLICY IF EXISTS "Allow all for all" ON public.materials;
DROP POLICY IF EXISTS "Allow all for all" ON public.products;
DROP POLICY IF EXISTS "Allow all for all" ON public.clients;
DROP POLICY IF EXISTS "Allow all for all" ON public.quotes;
DROP POLICY IF EXISTS "Allow all for all" ON public.production_jobs;
DROP POLICY IF EXISTS "Allow all for all" ON public.production_job_materials;
DROP POLICY IF EXISTS "Allow all for all" ON public.product_materials;
DROP POLICY IF EXISTS "Allow all for all" ON public.transactions;

-- 4. Criar políticas RLS para usuários autenticados
-- Printers
CREATE POLICY "Users can CRUD own printers" ON public.printers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Materials
CREATE POLICY "Users can CRUD own materials" ON public.materials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Products
CREATE POLICY "Users can CRUD own products" ON public.products FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Clients
CREATE POLICY "Users can CRUD own clients" ON public.clients FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Quotes
CREATE POLICY "Users can CRUD own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Production Jobs
CREATE POLICY "Users can CRUD own production jobs" ON public.production_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Product Materials
CREATE POLICY "Users can CRUD own product materials" ON public.product_materials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Production Job Materials
CREATE POLICY "Users can CRUD own production job materials" ON public.production_job_materials FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can CRUD own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Função trigger para definir user_id automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Triggers para auto-preencher user_id (para INSERT)
DROP TRIGGER IF EXISTS set_user_id_printers ON public.printers;
CREATE TRIGGER set_user_id_printers BEFORE INSERT ON public.printers FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_user_id_materials ON public.materials;
CREATE TRIGGER set_user_id_materials BEFORE INSERT ON public.materials FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_user_id_products ON public.products;
CREATE TRIGGER set_user_id_products BEFORE INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_user_id_clients ON public.clients;
CREATE TRIGGER set_user_id_clients BEFORE INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_user_id_quotes ON public.quotes;
CREATE TRIGGER set_user_id_quotes BEFORE INSERT ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_user_id_production_jobs ON public.production_jobs;
CREATE TRIGGER set_user_id_production_jobs BEFORE INSERT ON public.production_jobs FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS set_user_id_transactions ON public.transactions;
CREATE TRIGGER set_user_id_transactions BEFORE INSERT ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recarregar schema do PostgREST
NOTIFY pgrst, 'reload schema';