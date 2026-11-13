export type TransactionType = 'masuk' | 'keluar';

export type AccountType = 'usaha' | 'pribadi';

export type PaymentMethod = 'Tunai' | 'Transfer Bank' | 'QRIS' | 'E-wallet';

export interface TransactionItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: TransactionType;
  amount: number; // Integer Rupiah
  account: AccountType;
  category: string;
  description: string;
  payment_method: PaymentMethod;
  product_id?: number | null;
  product_name?: string | null;
  product_qty?: number | null;
  debt_id?: string | null;
  created_at: string;
}

export type DebtType = 'piutang' | 'utang'; // piutang = orang berutang ke saya; utang = saya berutang

export type DebtStatus = 'belum_lunas' | 'sebagian' | 'lunas' | 'terlambat';

export interface DebtPayment {
  id: string;
  debt_id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  note?: string;
  transaction_id?: string;
}

export interface DebtItem {
  id: string;
  type: DebtType;
  person_name: string;
  phone?: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  due_date: string; // YYYY-MM-DD
  status: DebtStatus;
  note?: string;
  payments: DebtPayment[];
  created_at: string;
}

export interface FinanceSettings {
  initial_business_cash: number;
  reminder_time: string;
  reminder_active: boolean;
  categories_masuk: string[];
  categories_keluar: string[];
}

export interface FinanceSummary {
  uang_masuk_usaha: number;
  uang_keluar_usaha: number;
  laba_usaha: number;
  saldo_kas_usaha: number;
  uang_masuk_pribadi: number;
  uang_keluar_pribadi: number;
  saldo_kas_pribadi: number;
  uang_masuk_diff_percent: number;
  uang_keluar_diff_percent: number;
  laba_diff_percent: number;
  total_piutang_belum_lunas: number;
  total_utang_belum_lunas: number;
  piutang_jatuh_tempo_count: number;
  utang_jatuh_tempo_count: number;
  streak_recording_days: number;
  days_without_recording: number;
  expense_composition: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  income_vs_expense_timeline: {
    labels: string[];
    masuk: number[];
    keluar: number[];
  };
}

export interface CashFlowReport {
  period_label: string;
  saldo_awal: number;
  total_masuk: number;
  masuk_by_category: { category: string; amount: number; percentage: number }[];
  total_keluar: number;
  keluar_by_category: { category: string; amount: number; percentage: number }[];
  saldo_akhir: number;
}

export interface ProfitLossReport {
  period_label: string;
  total_pendapatan: number;
  pendapatan_by_category: { category: string; amount: number }[];
  total_beban: number;
  beban_by_category: { category: string; amount: number; percentage: number }[];
  laba_bersih: number;
  margin_persen: number;
}
