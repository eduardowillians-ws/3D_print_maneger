export type PrinterStatus = 'OCIOSA' | 'IMPRIMINDO' | 'MANUTENÇÃO' | 'OFFLINE';

export interface Printer {
  id: string;
  name: string;
  status: PrinterStatus;
  target_hotend: number;
  target_bed: number;
  target_fan: number;
  initial_hours: number;
  current_hours: number;
  last_calibration?: string;
  last_maintenance_date?: string;
  maintenance_notes?: string;
  total_jobs?: number;
  failed_jobs?: number;
  created_at: string;
}

export type MaterialType = 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'RESIN';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  color: string | null;
  weight_g: number;
  supplier: string | null;
  price_per_kg: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  version: string;
  print_time_hours: number;
  print_time_minutes: number;
  material_weight_g: number;
  margin_percent: number;
  suggested_price: number;
  created_at: string;
}

export interface ProductMaterial {
  id: string;
  product_id: string;
  material_id: string;
  material_name: string;
  color: string | null;
  weight_g: number;
  slot_position: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tags: string[] | null;
  created_at: string;
}

export type QuoteStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'PAGO';

export interface Quote {
  id: string;
  client_id: string | null;
  description: string;
  total_value: number;
  status: QuoteStatus;
  expiry_date: string | null;
  created_at: string;
}

export type ProductionStatus = 'FILA' | 'IMPRIMINDO' | 'CONCLUIDO' | 'ARQUIVADO' | 'FALHA';

export interface ProductionJob {
  id: string;
  printer_id: string | null;
  product_id: string | null;
  product_name: string;
  quantity: number;
  status: ProductionStatus;
  progress: number;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  target_hotend?: number;
  target_bed?: number;
  speed_percentage?: number;
  quantity_good?: number;
  quantity_bad?: number;
  quality_checked?: boolean;
  quality_notes?: string;
}

export interface ProductionJobMaterial {
  id: string;
  job_id: string;
  material_id: string;
  material_name: string;
  color: string | null;
  weight_g: number;
  slot_position: number;
  created_at: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDENTE' | 'CONCLUÍDO' | 'ESTORNADO';

export interface Transaction {
  id: string;
  description: string;
  type: TransactionType;
  category: string;
  value: number;
  status: TransactionStatus;
  date: string;
  created_at: string;
}

export type DbTable = 'printers' | 'materials' | 'products' | 'clients' | 'quotes' | 'production_jobs' | 'transactions';

export interface ApiError {
  message: string;
  details?: string;
}

export interface ApiResponse<T> {
  data: T[] | null;
  error: ApiError | null;
}

export interface ApiResponseSingle<T> {
  data: T | null;
  error: ApiError | null;
}