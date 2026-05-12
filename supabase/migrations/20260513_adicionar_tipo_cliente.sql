-- Adicionar coluna 'type' na tabela clients se não existir
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'B2B';

-- Atualizar tipos existentes para B2B se forem NULL
UPDATE public.clients SET type = 'B2B' WHERE type IS NULL;
