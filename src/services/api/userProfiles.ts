import { supabase } from '../../lib/supabase';
import { getUserId } from './baseQueries';

export const userProfilesApi = {
  async getProfile(): Promise<{ photo_url: string | null } | null> {
    const userId = await getUserId();
    
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('photo_url')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  },

  async savePhoto(base64Data: string): Promise<boolean> {
    const userId = await getUserId();
    
    if (!userId) return false;
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        photo_url: base64Data,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving photo:', error);
      return false;
    }
    
    return true;
  },

  async deletePhoto(): Promise<boolean> {
    const userId = await getUserId();
    
    if (!userId) return false;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ photo_url: null, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
    
    return true;
  }
};

export default userProfilesApi;
