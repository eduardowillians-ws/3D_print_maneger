import { baseQueries } from './baseQueries';
import { Printer, PrinterStatus, ApiResponse, ApiResponseSingle } from '../../types/database';
import { supabase } from '../../lib/supabase';

export const printersApi = {
  async getAll(): Promise<ApiResponse<Printer>> {
    return baseQueries.getAll<Printer>('printers');
  },

  async getById(id: string): Promise<ApiResponseSingle<Printer>> {
    return baseQueries.getById<Printer>('printers', id);
  },

  async create(printer: Partial<Printer>): Promise<ApiResponseSingle<Printer>> {
    return baseQueries.create<Printer>('printers', printer);
  },

  async update(id: string, printer: Partial<Printer>): Promise<ApiResponseSingle<Printer>> {
    return baseQueries.update<Printer>('printers', id, printer);
  },

  async delete(id: string) {
    return baseQueries.delete('printers', id);
  },

  async updateStatus(id: string, status: PrinterStatus): Promise<ApiResponseSingle<Printer>> {
    return baseQueries.update<Printer>('printers', id, { status });
  },

  async updateHours(id: string, currentHours: number): Promise<ApiResponseSingle<Printer>> {
    return baseQueries.update<Printer>('printers', id, { current_hours: currentHours });
  },

  async getByStatus(status: PrinterStatus): Promise<ApiResponse<Printer>> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], error: { message: 'Usuário não autenticado' } };
    }
    
    const { data, error } = await supabase
      .from('printers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error: { message: error.message } };
    }
    
    return { data: data as Printer[], error: null };
  },

  async getActive(): Promise<ApiResponse<Printer>> {
    const { data, error } = await baseQueries.getAll<Printer>('printers');
    if (error) return { data: null, error };
    return {
      data: data?.filter(p => p.status === 'IMPRIMINDO') || null,
      error: null
    };
  },

  async getStats(): Promise<{ total: number; active: number; idle: number; maintenance: number }> {
    const { data, error } = await baseQueries.getAll<Printer>('printers');
    if (error || !data) {
      return { total: 0, active: 0, idle: 0, maintenance: 0 };
    }
    return {
      total: data.length,
      active: data.filter(p => p.status === 'IMPRIMINDO').length,
      idle: data.filter(p => p.status === 'OCIOSA').length,
      maintenance: data.filter(p => p.status === 'MANUTENÇÃO').length
    };
  }
};

export default printersApi;