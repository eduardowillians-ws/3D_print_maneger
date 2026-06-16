import { supabase } from '../lib/supabase';
import { getUserId } from '../services/api/baseQueries';

type CodePrefix = 'ORC' | 'PRO' | 'FIN';

/**
 * Gera o próximo código de referência sequencial para uma entidade
 * @param table - Nome da tabela no banco de dados
 * @param prefix - Prefixo do código (ORC, PRO, FIN)
 * @returns Próximo código sequencial formatado
 */
export async function generateReferenceCode(
  table: 'quotes' | 'production_jobs' | 'transactions',
  prefix: CodePrefix
): Promise<string> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  // Buscar o último registro do usuário para esta tabela
  const { data, error } = await supabase
    .from(table)
    .select('reference_code')
    .eq('user_id', userId)
    .not('reference_code', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is OK
    console.error('Erro ao buscar último código:', error);
  }

  let nextNumber = 1;

  if (data?.reference_code) {
    // Extrair o número do código existente (ex: ORC0015 -> 15)
    const match = data.reference_code.match(/\d+/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }

  // Formatar com 4 dígitos (ex: 0001, 0015, 1234)
  const formattedNumber = nextNumber.toString().padStart(4, '0');
  return `${prefix}${formattedNumber}`;
}

/**
 * Gera código de referência para orçamentos
 */
export async function generateQuoteCode(): Promise<string> {
  return generateReferenceCode('quotes', 'ORC');
}

/**
 * Gera código de referência para produções
 */
export async function generateProductionCode(): Promise<string> {
  return generateReferenceCode('production_jobs', 'PRO');
}

/**
 * Gera código de referência para transações financeiras
 */
export async function generateTransactionCode(): Promise<string> {
  return generateReferenceCode('transactions', 'FIN');
}
