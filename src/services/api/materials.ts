import { baseQueries } from './baseQueries';
import { Material, ApiResponse, ApiResponseSingle } from '../../types/database';

export const materialsApi = {
  async getAll(): Promise<ApiResponse<Material>> {
    return baseQueries.getAll<Material>('materials');
  },

  async getById(id: string): Promise<ApiResponseSingle<Material>> {
    return baseQueries.getById<Material>('materials', id);
  },

  async create(material: Partial<Material>): Promise<ApiResponseSingle<Material>> {
    return baseQueries.create<Material>('materials', material);
  },

  async update(id: string, material: Partial<Material>): Promise<ApiResponseSingle<Material>> {
    return baseQueries.update<Material>('materials', id, material);
  },

  async delete(id: string) {
    return baseQueries.delete('materials', id);
  },

  async getByType(type: string): Promise<ApiResponse<Material>> {
    const { data, error } = await baseQueries.getAll<Material>('materials');
    if (error) return { data: null, error };
    return { 
      data: data?.filter(m => m.type === type) || null, 
      error: null 
    };
  },

  async getLowStock(threshold: number = 200): Promise<ApiResponse<Material>> {
    const response = await baseQueries.getAll<Material>('materials');
    if (response.error || !response.data) return response;
    return {
      data: response.data.filter(m => m.weight_g < threshold),
      error: null
    };
  }
};

export default materialsApi;