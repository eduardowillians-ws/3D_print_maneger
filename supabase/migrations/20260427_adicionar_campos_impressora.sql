-- 🎯 MIGRAÇÃO: Adicionar campos de manutenção e histórico nas impressoras
-- Execute este SQL no SQL Editor do Supabase

-- 1. Adicionar campos de manutenção e histórico
ALTER TABLE public.printers 
ADD COLUMN IF NOT EXISTS last_calibration TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_print_time_hours FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_print_time_hours FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_jobs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_jobs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_notes TEXT,
ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;

-- Atualizar campos existentes
UPDATE public.printers SET total_print_time_hours = current_hours WHERE total_print_time_hours = 0;

-- ✅ Migração concluída!

-- =====================================================
-- NOTAS PARA IMPLEMENTAÇÃO FUTURA:
-- =====================================================
-- 
-- 1. TELEMETRIA EM TEMPO REAL:
--    Para obter temperaturas e status em tempo real, 
--    será necessária integração com API externa:
--    
--    - Klipper/Moonraker (impressoras com Klipper)
--    - Octoprint API (impressoras com OctoPrint)
--    - MQTT/WebSocket para streaming de dados
--    
--    A estrutura atual suporta esses dados mas 
--    requer desenvolvimento adicional de middleware.
--
-- 2. CAMPOS ADICIONAIS POSSÍVEIS:
--    - current_temperature (temperatura atual do bico)
--    - current_bed_temperature (temperatura atual da mesa)
--    - current_fan_speed (velocidade atual do fan)
--    - nozzle_hours (horas de uso do bico)
--    - bed_hours (horas de uso da mesa)
--    - last_error (último erro registrado)