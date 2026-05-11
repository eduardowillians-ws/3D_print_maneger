-- =====================================================
-- Migration: Migrar dados existentes para usuário marcelo@gmail.com
-- UID: 704b8f0b-091f-41fb-b8be-9ec231d8d222
-- Data: 2026-05-09
-- =====================================================

DO $$
DECLARE
    target_id UUID := '704b8f0b-091f-41fb-b8be-9ec231d8d222';
BEGIN
    -- Migrar impressoras
    UPDATE public.printers SET user_id = target_id WHERE user_id IS NULL;
    RAISE NOTICE 'Printers: OK';

    -- Migrar materiais
    UPDATE public.materials SET user_id = target_id WHERE user_id IS NULL;
    RAISE NOTICE 'Materials: OK';

    -- Migrar produtos
    UPDATE public.products SET user_id = target_id WHERE user_id IS NULL;
    RAISE NOTICE 'Products: OK';

    -- Migrar clientes
    UPDATE public.clients SET user_id = target_id WHERE user_id IS NULL;
    RAISE NOTICE 'Clients: OK';

    -- Migrar orçamentos
    UPDATE public.quotes SET user_id = target_id WHERE user_id IS NULL;
    RAISE NOTICE 'Quotes: OK';

    -- Migrar jobs de produção
    UPDATE public.production_jobs SET user_id = target_id WHERE user_id IS NULL;
    RAISE NOTICE 'Production Jobs: OK';

    -- Migrar transações
    UPDATE public.transactions SET user_id = target_id WHERE user_id IS NULL;
    RAISE NOTICE 'Transactions: OK';

    RAISE NOTICE 'Migração concluída! Todos os dados agora pertencem a marcelo@gmail.com';
END $$;

-- Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';