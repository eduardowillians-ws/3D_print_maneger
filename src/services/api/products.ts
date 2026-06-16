import { baseQueries, getUserId } from './baseQueries';
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
    const userId = await getUserId();
    
    if (!userId) {
      return { data: [], error: { message: 'Usuário não autenticado' } };
    }
    
    if (!term || term.trim() === '') {
      return baseQueries.getAll<Product>('products');
    }
    
    const lowerTerm = term.toLowerCase();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .or(`name.ilike.%${lowerTerm}%,version.ilike.%${lowerTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: null, error: { message: error.message } };
    }
    
    return { data: data as Product[], error: null };
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
    const userId = await getUserId();

    let query = supabase
      .from('product_materials')
      .select('*, material:materials(id, name, color)')
      .eq('product_id', productId)
      .order('slot_position', { ascending: true });
    
    // Se tem user_id, filtrar para evitar 403
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar materials:', error);
    }
    
    // Se não encontrou via relação, tenta buscar direto
    if (!data || data.length === 0) {
      let directQuery = supabase
        .from('product_materials')
        .select('*')
        .eq('product_id', productId)
        .order('slot_position', { ascending: true });
      
      if (userId) {
        directQuery = directQuery.eq('user_id', userId);
      }
      
      const { data: directData, error: directError } = await directQuery;
      
      if (directError) {
        console.error('Erro direto:', directError);
        return { data: null, error: directError };
      }
      return { data: directData, error: null };
    }
    
    return { data, error };
  },

  async addMaterial(material: Partial<ProductMaterial>): Promise<ApiResponseSingle<ProductMaterial>> {
    // Incluir user_id na inserção
    const userId = await getUserId();
    
    const materialWithUser = {
      ...material,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('product_materials')
      .insert(materialWithUser)
      .select()
      .single();
    return { data, error };
  },

  async updateMaterial(id: string, material: Partial<ProductMaterial>): Promise<ApiResponseSingle<ProductMaterial>> {
    const userId = await getUserId();
    
    if (!userId) {
      return { data: null, error: { message: 'Usuário não autenticado' } };
    }
    
    const { data, error } = await supabase
      .from('product_materials')
      .update(material)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },

  async deleteMaterial(id: string) {
    const userId = await getUserId();
    
    if (!userId) {
      return { error: { message: 'Usuário não autenticado' } };
    }
    
    return supabase
      .from('product_materials')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
  }
};

export default productsApi;