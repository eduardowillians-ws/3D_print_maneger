import { baseQueries } from './baseQueries';
import { Transaction, TransactionType, TransactionStatus, ApiResponse, ApiResponseSingle } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { generateTransactionCode } from '../../utils/referenceCodes';

export const transactionsApi = {
  async getAll(): Promise<ApiResponse<Transaction>> {
    return baseQueries.getAll<Transaction>('transactions');
  },

  async getById(id: string): Promise<ApiResponseSingle<Transaction>> {
    return baseQueries.getById<Transaction>('transactions', id);
  },

  async create(transaction: Partial<Transaction>): Promise<ApiResponseSingle<Transaction>> {
    // Gerar código de referência sequencial
    const reference_code = await generateTransactionCode();
    return baseQueries.create<Transaction>('transactions', { ...transaction, reference_code });
  },

  async update(id: string, transaction: Partial<Transaction>): Promise<ApiResponseSingle<Transaction>> {
    return baseQueries.update<Transaction>('transactions', id, transaction);
  },

  async delete(id: string) {
    return baseQueries.delete('transactions', id);
  },

  async updateStatus(id: string, status: TransactionStatus): Promise<ApiResponseSingle<Transaction>> {
    return baseQueries.update<Transaction>('transactions', id, { status });
  },

  async getByType(type: TransactionType): Promise<ApiResponse<Transaction>> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], error: { message: 'Usuário não autenticado' } };
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('date', { ascending: false });
    
    if (error) {
      return { data: null, error: { message: error.message } };
    }
    
    return { data: data as Transaction[], error: null };
  },

  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Transaction>> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: [], error: { message: 'Usuário não autenticado' } };
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) {
      return { data: null, error: { message: error.message } };
    }
    
    return { data: data as Transaction[], error: null };
  },

  async getStats(): Promise<{ totalIncome: number; totalExpense: number; balance: number; transactionCount: number }> {
    const { data, error } = await baseQueries.getAll<Transaction>('transactions');
    if (error || !data) {
      return { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 };
    }
    const totalIncome = data.filter(t => t.type === 'INCOME' && t.status !== 'ESTORNADO').reduce((acc, t) => acc + Number(t.value), 0);
    const totalExpense = data.filter(t => t.type === 'EXPENSE' && t.status !== 'ESTORNADO').reduce((acc, t) => acc + Number(t.value), 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: data.length
    };
  }
};

export default transactionsApi;