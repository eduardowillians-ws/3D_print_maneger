-- 🎯 MIGRAÇÃO: Adicionar campos de manutenção e histórico nas impressoras
-- Execute este SQL no SQL Editor do Supabase

-- 1. Adicionar campos de manutenção e histórico (IF NOT EXISTS não funciona para ADD COLUMN no PostgreSQL)
--Vamos verificar se as colunas existem antes de adicionar

DO $$ 
BEGIN
    -- last_calibration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'printers' AND column_name = 'last_calibration') THEN
        ALTER TABLE public.printers ADD COLUMN last_calibration TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- last_maintenance_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'printers' AND column_name = 'last_maintenance_date') THEN
        ALTER TABLE public.printers ADD COLUMN last_maintenance_date DATE;
    END IF;
    
    -- maintenance_notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'printers' AND column_name = 'maintenance_notes') THEN
        ALTER TABLE public.printers ADD COLUMN maintenance_notes TEXT;
    END IF;
    
    -- total_jobs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'printers' AND column_name = 'total_jobs') THEN
        ALTER TABLE public.printers ADD COLUMN total_jobs INTEGER DEFAULT 0;
    END IF;
    
    -- failed_jobs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'printers' AND column_name = 'failed_jobs') THEN
        ALTER TABLE public.printers ADD COLUMN failed_jobs INTEGER DEFAULT 0;
    END IF;
END $$;

-- ✅ Migração concluída!