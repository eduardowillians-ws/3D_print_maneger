-- 🎯 MIGRAÇÃO: Adicionar campo volume de montagem na tabela impressoras
-- Execute este SQL no SQL Editor do Supabase

DO $$ 
BEGIN
    -- Verificar se a coluna volume já existe antes de adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'printers' AND column_name = 'volume') THEN
        ALTER TABLE public.printers ADD COLUMN volume TEXT;
    END IF;
END $$;

-- ✅ Migração concluída!