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

  async updateStatus(id: string, status: ProductionStatus, progress?: number, startTime?: string): Promise<ApiResponseSingle<ProductionJob>> {
    const updates: Record<string, unknown> = { status };
    if (status === 'IMPRIMINDO' && startTime) {
      updates.start_time = startTime;
    } else if (status === 'IMPRIMINDO' && !startTime) {
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
  },

  async getAggregatedMaterials(monthIndex?: number, year?: string): Promise<{ material_name: string; total_weight: number; count: number }[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    let query = supabase
      .from('production_job_materials')
      .select('material_name, weight_g, jobs:job_id(created_at, user_id)');

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('jobs.created_at', startDate).lte('jobs.created_at', endDate);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let filteredData = data;
    if (userId) {
      filteredData = data.filter((d: any) => d.jobs?.user_id === userId);
    }

    if (monthIndex !== undefined && monthIndex >= 0) {
      filteredData = filteredData.filter((d: any) => {
        const createdAt = d.jobs?.created_at;
        if (!createdAt) return false;
        const date = new Date(createdAt);
        return date.getMonth() === monthIndex;
      });
    }

    const aggregated: Record<string, { material_name: string; total_weight: number; count: number }> = {};
    filteredData.forEach((item: any) => {
      const name = item.material_name || 'Sem nome';
      if (!aggregated[name]) {
        aggregated[name] = { material_name: name, total_weight: 0, count: 0 };
      }
      aggregated[name].total_weight += item.weight_g || 0;
      aggregated[name].count += 1;
    });

    return Object.values(aggregated).sort((a, b) => b.total_weight - a.total_weight);
  },

  async getTopClients(monthIndex?: number, year?: string, limit: number = 5): Promise<{ name: string; totalValue: number; count: number }[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    let query = supabase
      .from('quotes')
      .select('client_id, clients(name), total_value, created_at, user_id')
      .in('status', ['APROVADO', 'PAGO']);

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let filteredData = data;
    if (userId) {
      filteredData = data.filter((d: any) => d.user_id === userId);
    }

    if (monthIndex !== undefined && monthIndex >= 0) {
      filteredData = filteredData.filter((d: any) => {
        const date = new Date(d.created_at);
        return date.getMonth() === monthIndex;
      });
    }

    const aggregated: Record<string, { name: string; totalValue: number; count: number }> = {};
    filteredData.forEach((item: any) => {
      const clientName = item.clients?.name || 'Cliente Unknown';
      if (!aggregated[clientName]) {
        aggregated[clientName] = { name: clientName, totalValue: 0, count: 0 };
      }
      aggregated[clientName].totalValue += item.total_value || 0;
      aggregated[clientName].count += 1;
    });

    return Object.values(aggregated)
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit);
  },

  async getTopProducts(monthIndex?: number, year?: string, limit: number = 5): Promise<{ name: string; totalQuantity: number }[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    let query = supabase
      .from('production_jobs')
      .select('product_name, quantity, created_at, user_id');

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let filteredData = data;
    if (userId) {
      filteredData = data.filter((d: any) => d.user_id === userId);
    }

    if (monthIndex !== undefined && monthIndex >= 0) {
      filteredData = filteredData.filter((d: any) => {
        const date = new Date(d.created_at);
        return date.getMonth() === monthIndex;
      });
    }

    const aggregated: Record<string, { name: string; totalQuantity: number }> = {};
    filteredData.forEach((item: any) => {
      const name = item.product_name || 'Produto Unknown';
      if (!aggregated[name]) {
        aggregated[name] = { name, totalQuantity: 0 };
      }
      aggregated[name].totalQuantity += item.quantity || 1;
    });

    return Object.values(aggregated)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  },

  async getJobsWithEstimatedTime(monthIndex?: number, year?: string): Promise<{ quantity: number; estimatedHours: number }[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    let jobsQuery = supabase
      .from('production_jobs')
      .select('quantity, created_at, user_id');

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      jobsQuery = jobsQuery.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data: jobsData, error: jobsError } = await jobsQuery;
    if (jobsError || !jobsData) return [];

    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, name, print_time_hours, print_time_minutes, user_id');

    if (productsError || !productsData) return [];

    let filteredJobs = jobsData;
    if (userId) {
      filteredJobs = jobsData.filter((j: any) => j.user_id === userId);
    }

    if (monthIndex !== undefined && monthIndex >= 0) {
      filteredJobs = filteredJobs.filter((j: any) => {
        const date = new Date(j.created_at);
        return date.getMonth() === monthIndex;
      });
    }

    const productsMap: Record<string, { hours: number; minutes: number }> = {};
    productsData.forEach((p: any) => {
      if (userId && p.user_id !== userId) return;
      productsMap[p.name.toLowerCase()] = { hours: p.print_time_hours || 0, minutes: p.print_time_minutes || 0 };
    });

    return filteredJobs.map((job: any) => {
      const quantity = job.quantity || 1;
      const productInfo = productsMap[job.product_name?.toLowerCase()] || { hours: 2, minutes: 0 };
      const estimatedHours = (productInfo.hours + productInfo.minutes / 60) * quantity;
      return { quantity, estimatedHours };
    });
  }
};

export default productionApi;