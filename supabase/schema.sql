-- 🏛️ PRINT PULSE 3D - SUPABASE DATABASE SCHEMA
-- Last Updated: 2026-04-27
-- Description: This file contains the complete structure of the SaaS platform.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- Impressoras: Gerencia o status e a telemetria das máquinas.
CREATE TABLE IF NOT EXISTS public.printers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'OCIOSA', -- OCIOSA, IMPRIMINDO, MANUTENÇÃO, OFFLINE
    target_hotend INTEGER DEFAULT 200,
    target_bed INTEGER DEFAULT 60,
    target_fan INTEGER DEFAULT 100,
    initial_hours FLOAT DEFAULT 0,
    current_hours FLOAT DEFAULT 0,
    last_calibration TIMESTAMP WITH TIME ZONE,
    last_maintenance_date DATE,
    maintenance_notes TEXT,
    total_jobs INTEGER DEFAULT 0,
    failed_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Materiais: Controle de estoque de filamentos e resinas.
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- PLA, PETG, ABS, TPU, RESIN
    color TEXT,
    weight_g INTEGER DEFAULT 1000,
    supplier TEXT,
    price_per_kg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Produtos: Catálogo de peças fabricáveis com cálculo de custos.
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    version TEXT DEFAULT 'v1.0',
    print_time_hours INTEGER DEFAULT 0,
    print_time_minutes INTEGER DEFAULT 0,
    material_weight_g INTEGER DEFAULT 0,
    margin_percent INTEGER DEFAULT 30,
    suggested_price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Materiais por Produto (até 4 slots - definido na produção)
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

-- Clientes: CRM para gestão de contatos e histórico.
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    type TEXT DEFAULT 'B2B', -- B2B, Prototipagem, Hobbyista, Educação, Outro
    tags TEXT[], -- ex: {'VIP', 'Recorrente'}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orçamentos: Gestão de vendas e aprovações.
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reference_code VARCHAR(20),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    total_value DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'PENDENTE', -- PENDENTE, ENVIADO, APROVADO, REJEITADO, ARQUIVADO
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Itens do Orçamento: Cada linha representa um produto/serviço dentro de um orçamento.
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Produção (Trabalhos): Fila de impressão e monitoramento de progresso.
CREATE TABLE IF NOT EXISTS public.production_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reference_code VARCHAR(20),
    printer_id UUID REFERENCES public.printers(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'FILA', -- FILA, IMPRIMINDO, CONCLUIDO, ARQUIVADO, FALHA
    progress INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Materiais por Trabalho de Produção (até 4 por job - AMS slots)
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

-- Financeiro (Transações): Controle de caixa e auditoria.
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reference_code VARCHAR(20),
    description TEXT NOT NULL,
    type TEXT NOT NULL, -- INCOME (Entrada), EXPENSE (Saída)
    category TEXT NOT NULL, -- Vendas, Insumos, Energia, Aluguel, etc.
    value DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDENTE',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Loja Virtual: Produtos da loja online (catálogo público).
CREATE TABLE IF NOT EXISTS public.store_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Loja Virtual: Configurações da loja (WhatsApp, banner, textos).
CREATE TABLE IF NOT EXISTS public.store_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT DEFAULT 'Minha Loja',
    store_description TEXT,
    whatsapp_number TEXT,
    banner_url TEXT,
    about_text TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. POLICIES (Row Level Security)
-- Note: These policies currently allow all access for development. 
-- In production, they should be restricted to authenticated users (auth.uid()).

ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_job_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for all" ON public.printers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.quote_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.production_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.production_job_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.product_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.store_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for all" ON public.store_config FOR ALL USING (true) WITH CHECK (true);
