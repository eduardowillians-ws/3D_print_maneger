-- 🎯 MIGRAÇÃO: Adicionar campos de especificação do filamento na tabela materiais
-- Execute este SQL no SQL Editor do Supabase

DO $$ 
BEGIN
    -- temp_extrusion_fi (Faixa Inferior de Temperatura de Extrusão)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'temp_extrusion_fi') THEN
        ALTER TABLE public.materials ADD COLUMN temp_extrusion_fi INTEGER DEFAULT 230;
    END IF;
    
    -- temp_extrusion_fs (Faixa Superior de Temperatura de Extrusão)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'temp_extrusion_fs') THEN
        ALTER TABLE public.materials ADD COLUMN temp_extrusion_fs INTEGER DEFAULT 260;
    END IF;
    
    -- temp_bed_fi (Faixa Inferior de Temperatura da Mesa)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'temp_bed_fi') THEN
        ALTER TABLE public.materials ADD COLUMN temp_bed_fi INTEGER DEFAULT 70;
    END IF;
    
    -- temp_bed_fs (Faixa Superior de Temperatura da Mesa)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'temp_bed_fs') THEN
        ALTER TABLE public.materials ADD COLUMN temp_bed_fs INTEGER DEFAULT 80;
    END IF;
    
    -- thickness (Espessura do filamento)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'thickness') THEN
        ALTER TABLE public.materials ADD COLUMN thickness TEXT DEFAULT '1.75';
    END IF;
END $$;

-- ✅ Migração concluída!