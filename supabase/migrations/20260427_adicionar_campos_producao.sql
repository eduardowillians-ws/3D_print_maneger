-- 🎯 MIGRAÇÃO: Adicionar campos de quantidade e materiais na produção
-- Execute este SQL no SQL Editor do Supabase

-- 1. Adicionar campos na tabela production_jobs (se não existirem)
ALTER TABLE public.production_jobs 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Atualizar jobs existentes com quantity = 1
UPDATE public.production_jobs SET quantity = 1 WHERE quantity IS NULL;

-- 2. Criar tabela de materiais por trabalho (até 4 por job - AMS slots)
CREATE TABLE IF NOT EXISTS public.production_job_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.production_jobs(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
    material_name TEXT NOT NULL,
    color TEXT,
    weight_g INTEGER DEFAULT 0,
    slot_position INTEGER DEFAULT 1, -- 1, 2, 3 ou 4 (posição no AMS)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS na nova tabela
ALTER TABLE public.production_job_materials ENABLE ROW LEVEL SECURITY;

-- 4. Criar política de acesso
DROP POLICY IF EXISTS "Allow all for all" ON public.production_job_materials;
CREATE POLICY "Allow all for all" ON public.production_job_materials FOR ALL USING (true) WITH CHECK (true);

-- ✅ Migração concluída!