import { supabase } from '../../lib/supabase';
import { DbTable, ApiResponse, ApiResponseSingle, ApiError } from '../../types/database';

const createError = (message: string, details?: string): ApiError => ({
  message,
  details
});

let cachedUserId: string | null = null;

export async function getUserId(): Promise<string | null> {
  if (cachedUserId) return cachedUserId;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    cachedUserId = user.id;
  }
  return user?.id ?? null;
}

export function clearUserCache() {
  cachedUserId = null;
}

export const baseQueries = {
  async getAll<T>(table: DbTable): Promise<ApiResponse<T>> {
    try {
      const userId = await getUserId();
      
      if (!userId) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
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
      const userId = await getUserId();
      
      if (!userId) {
        return { data: null, error: createError('Usuário não autenticado') };
      }

      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
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
      const userId = await getUserId();
      
      if (!userId) {
        return { data: null, error: createError('Usuário não autenticado') };
      }

      const payloadWithUser = { ...payload, user_id: userId };

      const { data, error } = await supabase
        .from(table)
        .insert(payloadWithUser as never)
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
      const userId = await getUserId();
      
      if (!userId) {
        return { data: null, error: createError('Usuário não autenticado') };
      }

      const { data, error } = await supabase
        .from(table)
        .update(payload as never)
        .eq('id', id)
        .eq('user_id', userId)
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
      const userId = await getUserId();
      
      if (!userId) {
        return { success: false, error: createError('Usuário não autenticado') };
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

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
      const userId = await getUserId();
      
      if (!userId) {
        return { count: 0, error: null };
      }

      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        return { count: 0, error: createError(error.message, error.details) };
      }

      return { count: count || 0, error: null };
    } catch (err) {
      const error = err as Error;
      return { count: 0, error: createError(error.message) };
    }
  },

  async getAllByField<T>(table: DbTable, field: string, value: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(field, value)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: createError(error.message, error.details) };
      }

      return { data: data as T[], error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: createError(error.message) };
    }
  },

  async deleteByField(table: DbTable, field: string, value: string): Promise<{ success: boolean; error: ApiError | null }> {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(field, value);

      if (error) {
        return { success: false, error: createError(error.message, error.details) };
      }

      return { success: true, error: null };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: createError(error.message) };
    }
  }
};

export default baseQueries;