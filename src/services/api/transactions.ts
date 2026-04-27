import { baseQueries } from './baseQueries';
import { Transaction, TransactionType, TransactionStatus, ApiResponse, ApiResponseSingle } from '../../types/database';

export const transactionsApi = {
  async getAll(): Promise<ApiResponse<Transaction>> {
    return baseQueries.getAll<Transaction>('transactions');
  },

  async getById(id: string): Promise<ApiResponseSingle<Transaction>> {
    return baseQueries.getById<Transaction>('transactions', id);
  },

  async create(transaction: Partial<Transaction>): Promise<ApiResponseSingle<Transaction>> {
    return baseQueries.create<Transaction>('transactions', transaction);
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
    const { data, error } = await baseQueries.getAll<Transaction>('transactions');
    if (error) return { data: null, error };
    return {
      data: data?.filter(t => t.type === type) || null,
      error: null
    };
  },

  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Transaction>> {
    const { data, error } = await baseQueries.getAll<Transaction>('transactions');
    if (error) return { data: null, error };
    return {
      data: data?.filter(t => t.date >= startDate && t.date <= endDate) || null,
      error: null
    };
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