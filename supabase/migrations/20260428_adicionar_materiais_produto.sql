-- 🎯 MIGRAÇÃO: Adicionar materiais por produto (slots similares à produção)
-- Execute este SQL no SQL Editor do Supabase

-- 1. Criar tabela de materiais por produto (se não existir)
CREATE TABLE IF NOT EXISTS public.product_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    color TEXT,
    weight_g INTEGER DEFAULT 0,
    slot_position INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (se não estiver habilitado)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'product_materials') THEN
        ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 3. Policy (usar IF NOT EXISTS)
DROP POLICY IF EXISTS "Allow all for all" ON public.product_materials;
CREATE POLICY "Allow all for all" ON public.product_materials FOR ALL USING (true) WITH CHECK (true);

-- ✅ Migração concluída!