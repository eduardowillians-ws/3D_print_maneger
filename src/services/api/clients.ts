import { baseQueries } from './baseQueries';
import { Client, ApiResponse, ApiResponseSingle } from '../../types/database';
import { supabase } from '../../lib/supabase';

export const clientsApi = {
  async getAll(): Promise<ApiResponse<Client>> {
    return baseQueries.getAll<Client>('clients');
  },

  async getById(id: string): Promise<ApiResponseSingle<Client>> {
    return baseQueries.getById<Client>('clients', id);
  },

  async create(client: Partial<Client>): Promise<ApiResponseSingle<Client>> {
    return baseQueries.create<Client>('clients', client);
  },

  async update(id: string, client: Partial<Client>): Promise<ApiResponseSingle<Client>> {
    return baseQueries.update<Client>('clients', id, client);
  },

  async delete(id: string) {
    return baseQueries.delete('clients', id);
  },

  async search(term: string): Promise<ApiResponse<Client>> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], error: { message: 'Usuário não autenticado' } };
    }
    
    if (!term || term.trim() === '') {
      return baseQueries.getAll<Client>('clients');
    }
    
    const lowerTerm = term.toLowerCase();
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .or(`name.ilike.%${lowerTerm}%,email.ilike.%${lowerTerm}%,phone.ilike.%${term}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error: { message: error.message } };
    }
    
    return { data: data as Client[], error: null };
  },

  async getActive(): Promise<ApiResponse<Client>> {
    const { data, error } = await baseQueries.getAll<Client>('clients');
    if (error) return { data: null, error };
    return { data: data || [], error: null };
  },

  async getStats(): Promise<{ total: number; active: number; inactive: number }> {
    const { data, error } = await baseQueries.getAll<Client>('clients');
    if (error || !data) {
      return { total: 0, active: 0, inactive: 0 };
    }
    return {
      total: data.length,
      active: data.length,
      inactive: 0
    };
  }
};

export default clientsApi;