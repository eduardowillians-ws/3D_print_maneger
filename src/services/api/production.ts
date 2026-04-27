import { baseQueries } from './baseQueries';
import { ProductionJob, ProductionJobMaterial, ProductionStatus, ApiResponse, ApiResponseSingle } from '../../types/database';
import { supabase } from '../../lib/supabase';

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

  async createWithMaterials(job: Partial<ProductionJob>, materials: Partial<ProductionJobMaterial>[]): Promise<ApiResponseSingle<ProductionJob>> {
    const { data: jobData, error: jobError } = await baseQueries.create<ProductionJob>('production_jobs', job);
    if (jobError || !jobData) {
      return { data: null, error: jobError };
    }
    
    if (materials.length > 0) {
      const materialsWithJobId = materials.map(m => ({
        ...m,
        job_id: jobData.id
      }));
      const { error: materialsError } = await supabase
        .from('production_job_materials')
        .insert(materialsWithJobId);
      
      if (materialsError) {
        console.error('Error creating job materials:', materialsError);
      }
    }
    
    return { data: jobData, error: null };
  },

  async update(id: string, job: Partial<ProductionJob>): Promise<ApiResponseSingle<ProductionJob>> {
    return baseQueries.update<ProductionJob>('production_jobs', id, job);
  },

  async delete(id: string) {
    await supabase.from('production_job_materials').delete().eq('job_id', id);
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
  },

  async getMaterialsByJob(jobId: string): Promise<ApiResponse<ProductionJobMaterial>> {
    const { data, error } = await supabase
      .from('production_job_materials')
      .select('*')
      .eq('job_id', jobId)
      .order('slot_position', { ascending: true });
    return { data, error };
  },

  async addMaterial(material: Partial<ProductionJobMaterial>): Promise<ApiResponseSingle<ProductionJobMaterial>> {
    const { data, error } = await supabase
      .from('production_job_materials')
      .insert(material)
      .select()
      .single();
    return { data, error };
  },

  async updateMaterial(id: string, material: Partial<ProductionJobMaterial>): Promise<ApiResponseSingle<ProductionJobMaterial>> {
    const { data, error } = await supabase
      .from('production_job_materials')
      .update(material)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteMaterial(id: string) {
    return supabase.from('production_job_materials').delete().eq('id', id);
  }
};

export default productionApi;