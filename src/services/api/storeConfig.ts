import { supabase } from '../../lib/supabase';
import { StoreConfig, ApiResponseSingle } from '../../types/database';

export const storeConfigApi = {
  async get(): Promise<ApiResponseSingle<StoreConfig>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: { message: 'Usuário não autenticado' } };

      const { data, error } = await supabase
        .from('store_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        return { data: null, error: { message: error.message, details: error.details } };
      }

      if (!data) {
        const { data: newData, error: createError } = await supabase
          .from('store_config')
          .insert({ user_id: user.id } as never)
          .select()
          .single();

        if (createError) return { data: null, error: { message: createError.message } };
        return { data: newData as StoreConfig, error: null };
      }

      return { data: data as StoreConfig, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async getPublic(userId: string): Promise<ApiResponseSingle<StoreConfig>> {
    try {
      const { data, error } = await supabase
        .from('store_config')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) return { data: null, error: { message: error.message, details: error.details } };
      return { data: data as StoreConfig, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async update(config: Partial<StoreConfig>): Promise<ApiResponseSingle<StoreConfig>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: { message: 'Usuário não autenticado' } };

      const { data, error } = await supabase
        .from('store_config')
        .upsert({ ...config, user_id: user.id, updated_at: new Date().toISOString() } as never, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) return { data: null, error: { message: error.message, details: error.details } };
      return { data: data as StoreConfig, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async uploadBanner(file: File): Promise<{ url: string | null; error: string | null }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Date.now()}.${fileExt}`;
      const filePath = `store-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-images')
        .upload(filePath, file);

      if (uploadError) return { url: null, error: uploadError.message };

      const { data } = supabase.storage
        .from('store-images')
        .getPublicUrl(filePath);

      return { url: data.publicUrl, error: null };
    } catch (err) {
      const error = err as Error;
      return { url: null, error: error.message };
    }
  }
};

export default storeConfigApi;
