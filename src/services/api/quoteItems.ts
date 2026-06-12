import { supabase } from '../../lib/supabase';
import { QuoteItem, ApiResponse } from '../../types/database';

export const quoteItemsApi = {
  async getByQuoteId(quoteId: string): Promise<ApiResponse<QuoteItem>> {
    try {
      const { data, error } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: { message: error.message, details: error.details } };
      }

      return { data: data as QuoteItem[], error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async create(item: Partial<QuoteItem>): Promise<{ data: QuoteItem | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('quote_items')
        .insert(item as never)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message, details: error.details } };
      }

      return { data: data as QuoteItem, error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  },

  async deleteByQuoteId(quoteId: string) {
    try {
      const { error } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', quoteId);

      if (error) {
        return { success: false, error: { message: error.message, details: error.details } };
      }

      return { success: true, error: null };
    } catch (err) {
      const error = err as Error;
      return { success: false, error: { message: error.message } };
    }
  },

  async createMany(items: Partial<QuoteItem>[]) {
    try {
      const { data, error } = await supabase
        .from('quote_items')
        .insert(items as never[])
        .select();

      if (error) {
        return { data: null, error: { message: error.message, details: error.details } };
      }

      return { data: data as QuoteItem[], error: null };
    } catch (err) {
      const error = err as Error;
      return { data: null, error: { message: error.message } };
    }
  }
};

export default quoteItemsApi;
