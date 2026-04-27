import { baseQueries } from './baseQueries';
import { ProductionJob, ProductionStatus, ApiResponse, ApiResponseSingle } from '../../types/database';

export const productionApi = {
  async getAll(): Promise<ApiResponse<ProductionJob>> {
    return baseQueries.getAll<ProductionJob>('production_jobs');
  },

  async getById(id: string): Promise<ApiResponseSingle<ProductionJob>> {
    return baseQueries.getById<ProductionJob>('production_jobs', id);
  },

  async create(job: Partial<ProductionJob>): Promise<ApiResponseSingle<ProductionJob>> {
    return baseQueries.create<ProductionJob>('production_jobs', job);
  },

  async update(id: string, job: Partial<ProductionJob>): Promise<ApiResponseSingle<ProductionJob>> {
    return baseQueries.update<ProductionJob>('production_jobs', id, job);
  },

  async delete(id: string) {
    return baseQueries.delete('production_jobs', id);
  },

  async updateStatus(id: string, status: ProductionStatus, progress?: number): Promise<ApiResponseSingle<ProductionJob>> {
    const updates: Record<string, unknown> = { status };
    if (status === 'IMPRIMINDO') {
      updates.start_time = new Date().toISOString();
    }
    if (status === 'CONCLUIDO') {
      updates.end_time = new Date().toISOString();
      updates.progress = 100;
    }
    if (progress !== undefined) {
      updates.progress = progress;
    }
    return baseQueries.update<ProductionJob>('production_jobs', id, updates);
  },

  async getByStatus(status: ProductionStatus): Promise<ApiResponse<ProductionJob>> {
    const { data, error } = await baseQueries.getAll<ProductionJob>('production_jobs');
    if (error) return { data: null, error };
    return {
      data: data?.filter(j => j.status === status) || null,
      error: null
    };
  },

  async getActive(): Promise<ApiResponse<ProductionJob>> {
    const { data, error } = await baseQueries.getAll<ProductionJob>('production_jobs');
    if (error) return { data: null, error };
    return {
      data: data?.filter(j => j.status === 'IMPRIMINDO') || null,
      error: null
    };
  },

  async getStats(): Promise<{ total: number; active: number; completed: number; archived: number }> {
    const { data, error } = await baseQueries.getAll<ProductionJob>('production_jobs');
    if (error || !data) {
      return { total: 0, active: 0, completed: 0, archived: 0 };
    }
    return {
      total: data.length,
      active: data.filter(j => j.status === 'IMPRIMINDO').length,
      completed: data.filter(j => j.status === 'CONCLUIDO').length,
      archived: data.filter(j => j.status === 'ARQUIVADO').length
    };
  }
};

export default productionApi;