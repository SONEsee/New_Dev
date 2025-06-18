export interface AccountModel {
 account_id: number; 
  account_code: string; 
  account_name: string; 
  account_type: string; 
  parent_account_id: number | null; 
  description: string | null; 
  record_stat: 'C' | 'O';
}