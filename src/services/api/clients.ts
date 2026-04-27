import { baseQueries } from './baseQueries';
import { Client, ApiResponse, ApiResponseSingle } from '../../types/database';

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
    const { data, error } = await baseQueries.getAll<Client>('clients');
    if (error) return { data: null, error };
    const lowerTerm = term.toLowerCase();
    return {
      data: data?.filter(c => 
        c.name.toLowerCase().includes(lowerTerm) ||
        c.email?.toLowerCase().includes(lowerTerm) ||
        c.phone?.includes(term)
      ) || null,
      error: null
    };
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