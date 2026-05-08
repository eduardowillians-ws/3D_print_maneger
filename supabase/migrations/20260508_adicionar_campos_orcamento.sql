-- Adicionar campos à tabela quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS unit_price DECIMAL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS shipping DECIMAL DEFAULT 0;

-- Adicionar constraint de foreign key (opcional, executar separado se necessário)
-- ALTER TABLE quotes ADD CONSTRAINT quotes_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id);