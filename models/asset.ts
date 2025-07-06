// Asset Models Interface

export interface AssetModel {
  coa_id: number;
  asset_type_detail: AssetTypeDetail;
  asset_code: string;
  asset_name_la: string;
  asset_name_en: string;
  Record_Status: string;
  Maker_DT_Stamp: Date;
  Checker_DT_Stamp: Date;
  asset_type_id: number;
  Maker_Id: string;
  Checker_Id: string;
}
export interface AssetTypeDetail {
  type_id: number;
  type_code: string;
  type_name_en: string;
  type_name_la: string;
}
export interface AssetTypeModel {
  coa_id: number;
  asset_type_detail: AssetTypeDetail;
  tangible_detail: TangibleDetail;
  asset_code: string;
  asset_name_la: string;
  asset_name_en: string;
  Record_Status: string;
  Maker_DT_Stamp: Date;
  Checker_DT_Stamp: Date;
  asset_type_id: number;
  Maker_Id: string;
  Checker_Id: string;
}
export interface TangibleDetail {
  MC_id: number;
  M_id: number;
  MC_code: string;
  MC_name_la: string;
  MC_name_en: string;
  MC_detail: string;
  Status: string;
  BOL_code: string;
  BOL_name: string;
}
export interface AssetHistoryModel {
  history_id: number;
  asset_id: number;
  asset: AssetModel;
  action_type:
    | "create"
    | "update"
    | "transfer"
    | "maintenance"
    | "disposal"
    | "depreciation";
  action_description: string;
  old_value?: any;
  new_value?: any;
  location_from?: string;
  location_to?: string;
  performed_by: number;
  performed_at: string | Date;
  notes?: string;
}

export interface AssetMaintenanceModel {
  maintenance_id: number;
  asset_id: number;
  asset: AssetModel;
  maintenance_type: "preventive" | "corrective" | "emergency" | "inspection";
  maintenance_date: string | Date;
  next_maintenance_date?: string | Date;
  description: string;
  cost: number;
  performed_by?: string;
  supplier?: string;
  parts_replaced?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  Record_Status: "O" | "C";
  created_at: string | Date;
  updated_at: string | Date;
  created_by?: number;
  updated_by?: number;
}

export interface AssetTransferModel {
  transfer_id: number;
  asset_id: number;
  asset: AssetModel;
  from_location: string;
  to_location: string;
  from_department?: string;
  to_department?: string;
  from_employee?: string;
  to_employee?: string;
  transfer_date: string | Date;
  reason: string;
  approved_by?: number;
  transferred_by: number;
  status: "pending" | "approved" | "completed" | "rejected";
  notes?: string;
  Record_Status: "O" | "C";
  created_at: string | Date;
  updated_at: string | Date;
}

export interface AssetDepreciationModel {
  depreciation_id: number;
  asset_id: number;
  asset: AssetModel;
  depreciation_date: string | Date;
  depreciation_method: "straight_line" | "declining_balance" | "sum_of_years";
  annual_rate: number;
  monthly_amount: number;
  accumulated_depreciation: number;
  book_value: number;
  useful_life_remaining: number;
  calculated_by: number;
  Record_Status: "O" | "C";
  created_at: string | Date;
  updated_at: string | Date;
}

export interface AssetLocationModel {
  location_id: number;
  location_code: string;
  location_name_la: string;
  location_name_en: string;
  building?: string;
  floor?: string;
  room?: string;
  department?: string;
  responsible_person?: string;
  contact_info?: string;
  description?: string;
  Record_Status: "O" | "C";
  Maker_DT_Stamp: string | Date;
  updated_at: string | Date;
}

export interface AssetStatisticsModel {
  total_assets: number;
  active_assets: number;
  inactive_assets: number;
  total_value: number;
  current_total_value: number;
  total_depreciation: number;
  by_type: {
    [key: string]: {
      count: number;
      value: number;
      current_value: number;
    };
  };
  by_location: {
    [key: string]: {
      count: number;
      value: number;
    };
  };
  by_condition: {
    [key: string]: number;
  };
  maintenance_due: number;
  warranty_expiring: number;
}

// Form interfaces for creating and updating assets
export interface CreateAssetForm {
  asset_code: string;
  asset_name_la: string;
  asset_name_en: string;
  asset_type_id: string;
  value: number;
  location?: string;
  description?: string;
  start_date?: string;
  purchase_date?: string;
  warranty_date?: string;
  supplier?: string;
  serial_number?: string;
  model?: string;
  condition?: string;
}

export interface UpdateAssetForm {
  asset_id: string | number;
  asset_code: string;
  asset_name_la: string;
  asset_name_en: string;
  asset_type_id: string;
  value: number;
  location?: string;
  description?: string;
  start_date?: string;
  purchase_date?: string;
  warranty_date?: string;
  supplier?: string;
  serial_number?: string;
  model?: string;
  condition?: string;
}

export interface CreateMaintenanceForm {
  asset_id: number;
  coa_id?: number;
  maintenance_type: string;
  maintenance_date: string;
  next_maintenance_date?: string;
  description: string;
  cost: number;
  performed_by?: string;
  supplier?: string;
  parts_replaced?: string;
  notes?: string;
}

export interface CreateTransferForm {
  coa_id?: number;
  asset_id: number;
  to_location: string;
  to_department?: string;
  to_employee?: string;
  transfer_date: string;
  reason: string;
  notes?: string;
}

// API Response interfaces
export interface AssetListResponse {
  coa_id?: number;
  data: AssetModel[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AssetDetailResponse {
  data: AssetModel;
  history: AssetHistoryModel[];
  maintenance: AssetMaintenanceModel[];
  depreciation: AssetDepreciationModel[];
}

export interface AssetTypeListResponse {
  data: AssetTypeModel[];
  total: number;
}

export interface AssetStatisticsResponse {
  data: AssetStatisticsModel;
}
