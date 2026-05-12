import { supabase } from '../../lib/supabase';
import { ApiError } from '../../types/database';

export const authService = {
  async updatePassword(newPassword: string): Promise<{ success: boolean; error: ApiError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: { message: 'Usuário não autenticado' } };
      }

      if (newPassword.length < 6) {
        return { success: false, error: { message: 'A senha deve ter pelo menos 6 caracteres' } };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: { message: error.message } };
      }

      return { success: true, error: null };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: { message: error.message } };
    }
  },

  async validateCurrentPassword(currentPassword: string): Promise<{ valid: boolean; error: ApiError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.email) {
        return { valid: false, error: { message: 'Usuário não autenticado' } };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });

      if (error) {
        return { valid: false, error: null };
      }

      return { valid: true, error: null };
    } catch (err) {
      return { valid: false, error: { message: 'Erro ao validar senha' } };
    }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

export default authService;
