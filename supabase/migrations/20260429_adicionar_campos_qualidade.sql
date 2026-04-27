-- 🎯 MIGRAÇÃO: Adicionar campos de produção e qualidade
-- Execute este SQL no SQL Editor do Supabase

-- 1. Adicionar campos de parâmetros e qualidade na production_jobs
ALTER TABLE public.production_jobs ADD COLUMN IF NOT EXISTS target_hotend INTEGER DEFAULT 200;
ALTER TABLE public.production_jobs ADD COLUMN IF NOT EXISTS target_bed INTEGER DEFAULT 60;
ALTER TABLE public.production_jobs ADD COLUMN IF NOT EXISTS speed_percentage INTEGER DEFAULT 100;
ALTER TABLE public.production_jobs ADD COLUMN IF NOT EXISTS quantity_good INTEGER DEFAULT 0;
ALTER TABLE public.production_jobs ADD COLUMN IF NOT EXISTS quantity_bad INTEGER DEFAULT 0;
ALTER TABLE public.production_jobs ADD COLUMN IF NOT EXISTS quality_checked BOOLEAN DEFAULT FALSE;
ALTER TABLE public.production_jobs ADD COLUMN IF NOT EXISTS quality_notes TEXT;

-- ✅ Migração concluída!