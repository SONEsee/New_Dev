export interface AccountMethod {
    mapping_id: number; 
  ref_id: number; 
  acc_type: 'ASSET' | 'DEPRECIATION' | 'DISPOSAL'; 
  asset_id: number | null; 
  debit_account_id: string; 
  credit_account_id: string;
  amount: number; 
  transaction_date: Date;
  description: string | null; 
  journal_entry_id: string | null; 
  record_stat: 'C' | 'O';
}