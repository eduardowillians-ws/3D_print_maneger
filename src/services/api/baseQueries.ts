import { supabase } from '../../lib/supabase';
import { DbTable, ApiResponse, ApiResponseSingle, ApiError } from '../../types/database';

const createError = (message: string, details?: string): ApiError => ({
  message,
  details
});

export const baseQueries = {
  async getAll<T>(table: DbTable): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: createError(error.message, error.details) };
      }

      return { data: data as T[], error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: createError(error.message) };
    }
  },

  async getById<T>(table: DbTable, id: string): Promise<ApiResponseSingle<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: createError(error.message, error.details) };
      }

      return { data: data as T, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: createError(error.message) };
    }
  },

  async create<T>(table: DbTable, payload: Record<string, unknown>): Promise<ApiResponseSingle<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert(payload as never)
        .select()
        .single();

      if (error) {
        return { data: null, error: createError(error.message, error.details) };
      }

      return { data: data as T, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: createError(error.message) };
    }
  },

  async update<T>(table: DbTable, id: string, payload: Record<string, unknown>): Promise<ApiResponseSingle<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(payload as never)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: createError(error.message, error.details) };
      }

      return { data: data as T, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: createError(error.message) };
    }
  },

  async delete(table: DbTable, id: string): Promise<{ success: boolean; error: ApiError | null }> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: createError(error.message, error.details) };
      }

      return { success: true, error: null };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: createError(error.message) };
    }
  },

  async count(table: DbTable): Promise<{ count: number; error: ApiError | null }> {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        return { count: 0, error: createError(error.message, error.details) };
      }

      return { count: count || 0, error: null };
    } catch (err) {
      const error = err as Error;
      return { count: 0, error: createError(error.message) };
    }
  }
};

export default baseQueries;