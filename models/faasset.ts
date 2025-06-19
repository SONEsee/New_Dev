export interface FaAsset{
id: number; 
  asset_id: number; 
  asset_serial_no: string | null; 
  asset_tag: string; 
  asset_location_id: number | null; 
  asset_spec: string | null; 
  asset_date: Date; 
  asset_currency: string; 
  asset_value: number; 
  asset_status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DISPOSED'; 
  warranty_end_date: Date | null; 
  supplier_id: number | null; 
  has_depreciation: 'Y' | 'N'; 
  dpca_type: 'Straight-line' | 'Declining' | 'ProductionUnit' | null; 
  dpca_percentage: number | null; 
  asset_useful_life: number | null;
  asset_salvage_value: number;
  dpca_start_date: Date | null; 
  dpca_end_date: Date | null; 
  asset_accu_dpca_value: number; 
  asset_value_remain: number; 
  asset_latest_date_dpca: Date | null;
  asset_disposal_date: Date | null; 
  asset_ac_date: Date | null; 
  asset_ac_datetime: Date | null; 
  asset_ac_by: number | null; 
  Record_Status:    null;
}