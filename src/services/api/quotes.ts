import { baseQueries } from './baseQueries';
import { Quote, QuoteStatus, ApiResponse, ApiResponseSingle } from '../../types/database';

export const quotesApi = {
  async getAll(): Promise<ApiResponse<Quote>> {
    return baseQueries.getAll<Quote>('quotes');
  },

  async getById(id: string): Promise<ApiResponseSingle<Quote>> {
    return baseQueries.getById<Quote>('quotes', id);
  },

  async create(quote: Partial<Quote>): Promise<ApiResponseSingle<Quote>> {
    return baseQueries.create<Quote>('quotes', quote);
  },

  async update(id: string, quote: Partial<Quote>): Promise<ApiResponseSingle<Quote>> {
    return baseQueries.update<Quote>('quotes', id, quote);
  },

  async delete(id: string) {
    return baseQueries.delete('quotes', id);
  },

  async updateStatus(id: string, status: QuoteStatus): Promise<ApiResponseSingle<Quote>> {
    return baseQueries.update<Quote>('quotes', id, { status });
  },

  async getByStatus(status: QuoteStatus): Promise<ApiResponse<Quote>> {
    const { data, error } = await baseQueries.getAll<Quote>('quotes');
    if (error) return { data: null, error };
    return {
      data: data?.filter(q => q.status === status) || null,
      error: null
    };
  },

  async getStats(): Promise<{ total: number; pending: number; approved: number; revenue: number }> {
    const { data, error } = await baseQueries.getAll<Quote>('quotes');
    if (error || !data) {
      return { total: 0, pending: 0, approved: 0, revenue: 0 };
    }
    return {
      total: data.length,
      pending: data.filter(q => q.status === 'PENDENTE').length,
      approved: data.filter(q => q.status === 'APROVADO' || q.status === 'PAGO').length,
      revenue: data.filter(q => q.status === 'APROVADO' || q.status === 'PAGO').reduce((acc, q) => acc + Number(q.total_value), 0)
    };
  }
};

export default quotesApi;