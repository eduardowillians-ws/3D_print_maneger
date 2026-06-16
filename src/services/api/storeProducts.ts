import { supabase } from '../../lib/supabase';
import { StoreProduct, ApiResponse, ApiResponseSingle } from '../../types/database';
import { getUserId } from './baseQueries';

export const storeProductsApi = {
  async getAll(): Promise<ApiResponse<StoreProduct>> {
    try {
      const userId = await getUserId();
      if (!userId) return { data: [], error: null };

      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) return { data: null, error: { message: error.message, details: error.details } };
      return { data: data as StoreProduct[], error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async getPublic(): Promise<ApiResponse<StoreProduct>> {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) return { data: null, error: { message: error.message, details: error.details } };
      return { data: data as StoreProduct[], error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async getById(id: string): Promise<ApiResponseSingle<StoreProduct>> {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return { data: null, error: { message: error.message, details: error.details } };
      return { data: data as StoreProduct, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async create(product: Partial<StoreProduct>): Promise<ApiResponseSingle<StoreProduct>> {
    try {
      const userId = await getUserId();
      if (!userId) return { data: null, error: { message: 'Usuário não autenticado' } };

      const { data, error } = await supabase
        .from('store_products')
        .insert({ ...product, user_id: userId } as never)
        .select()
        .single();

      if (error) return { data: null, error: { message: error.message, details: error.details } };
      return { data: data as StoreProduct, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async update(id: string, product: Partial<StoreProduct>): Promise<ApiResponseSingle<StoreProduct>> {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .update(product as never)
        .eq('id', id)
        .select()
        .single();

      if (error) return { data: null, error: { message: error.message, details: error.details } };
      return { data: data as StoreProduct, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('store_products')
        .delete()
        .eq('id', id);

      if (error) return { success: false, error: { message: error.message, details: error.details } };
      return { success: true, error: null };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: { message: error.message } };
    }
  },

  async compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        const maxWidth = 600;
        const maxHeight = 600;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height / width) * maxWidth;
            width = maxWidth;
          } else {
            width = (width / height) * maxHeight;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.6);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  async imageToBase64(file: File): Promise<string> {
    const compressed = await this.compressImage(file);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressed);
    });
  }
};

export default storeProductsApi;
