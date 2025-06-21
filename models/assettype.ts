export interface AssetType{
  type_id: number; 
  type_code: string; 
  type_name: string; 
  description: string | null; 
  record_stat: 'C' | 'O'; 
}