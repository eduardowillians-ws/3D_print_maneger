-- Adicionar coluna de estoque mínimo na tabela materials se não existir
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS min_stock_g INTEGER DEFAULT 200;
