import { baseQueries } from './baseQueries';
import { Product, ProductMaterial, ApiResponse, ApiResponseSingle } from '../../types/database';
import { supabase } from '../../lib/supabase';

export const productsApi = {
  async getAll(): Promise<ApiResponse<Product>> {
    return baseQueries.getAll<Product>('products');
  },

  async getById(id: string): Promise<ApiResponseSingle<Product>> {
    return baseQueries.getById<Product>('products', id);
  },

  async create(product: Partial<Product>): Promise<ApiResponseSingle<Product>> {
    return baseQueries.create<Product>('products', product);
  },

  async update(id: string, product: Partial<Product>): Promise<ApiResponseSingle<Product>> {
    return baseQueries.update<Product>('products', id, product);
  },

  async delete(id: string) {
    return baseQueries.delete('products', id);
  },

  async search(term: string): Promise<ApiResponse<Product>> {
    const { data, error } = await baseQueries.getAll<Product>('products');
    if (error) return { data: null, error };
    const lowerTerm = term.toLowerCase();
    return {
      data: data?.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) ||
        p.version.toLowerCase().includes(lowerTerm)
      ) || null,
      error: null
    };
  },

  async getStats(): Promise<{ total: number; avgTime: number; avgPrice: number }> {
    const { data, error } = await baseQueries.getAll<Product>('products');
    if (error || !data) {
      return { total: 0, avgTime: 0, avgPrice: 0 };
    }
    const totalTime = data.reduce((acc, p) => acc + (p.print_time_hours * 60 + p.print_time_minutes), 0);
    const totalPrice = data.reduce((acc, p) => acc + Number(p.suggested_price), 0);
    return {
      total: data.length,
      avgTime: data.length ? Math.round(totalTime / data.length) : 0,
      avgPrice: data.length ? Number((totalPrice / data.length).toFixed(2)) : 0
    };
  },

  // Materials por produto - com dados do material via relação
  async getMaterialsByProduct(productId: string): Promise<ApiResponse<ProductMaterial>> {
    const { data, error } = await supabase
      .from('product_materials')
      .select('*, material:materials(id, name, color)')
      .eq('product_id', productId)
      .order('slot_position', { ascending: true });
    
    // Se não encontrar via relação, tenta buscar direto
    if (!data || data.length === 0) {
      const { data: directData, error: directError } = await supabase
        .from('product_materials')
        .select('*')
        .eq('product_id', productId)
        .order('slot_position', { ascending: true });
      
      if (directError) return { data: null, error: directError };
      return { data: directData, error: null };
    }
    
    return { data, error };
  },

  async addMaterial(material: Partial<ProductMaterial>): Promise<ApiResponseSingle<ProductMaterial>> {
    const { data, error } = await supabase
      .from('product_materials')
      .insert(material)
      .select()
      .single();
    return { data, error };
  },

  async updateMaterial(id: string, material: Partial<ProductMaterial>): Promise<ApiResponseSingle<ProductMaterial>> {
    const { data, error } = await supabase
      .from('product_materials')
      .update(material)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  async deleteMaterial(id: string) {
    return supabase.from('product_materials').delete().eq('id', id);
  }
};

export default productsApi;