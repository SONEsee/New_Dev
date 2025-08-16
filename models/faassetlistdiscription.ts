export interface FaAssetListDistcritionRespons {
  aldm_id: number;
  asset_list_id_detail: AssetListIDDetail;
  dpca_year: null;
  dpca_month: null;
  dpca_date: null;
  dpca_value: null;
  dpca_no_of_days: null;
  remaining_value: null;
  accumulated_dpca: null;
  dpca_desc: null;
  dpca_ac_yesno: string;
  dpca_ac_date: null;
  dpca_datetime: null;
  dpca_ac_by: null;
  Record_Status: string;
  Maker_DT_Stamp: Date;
  Checker_DT_Stamp: null;
  asset_list_id: string;
  Maker_Id: string;
  Checker_Id: null;
  Auth_Status:string;
}

export interface AssetListIDDetail {
  asset_list_id: string;
  asset_spec: string;
  asset_list_code: string;
  asset_serial_no: string;
  asset_tag: string;
  Auth_Status:string;
}

export interface DepreciationRespons {
  success: boolean;
  action: string;
  data: Data;
  timestamp: Date;
  Auth_Status:string;
}

export interface Data {
  success: boolean;
  target_period: TargetPeriod;
  summary: Summary;
  overdue_items: any[];
  due_items: AllItemsNeedingAttention[];
  up_to_date_items: any[];
  all_items_needing_attention: AllItemsNeedingAttention[];
  Auth_Status:string;
}

export interface AllItemsNeedingAttention {
  mapping_id: number;
  asset_id: string;
  asset_name: string;
  asset_value: number;
  current_month: number;
  total_months: number;
  due_date: string;
  due_end_date: string;
  days_count: number;
  expected_depreciation: number;
  last_depreciation_date: string;
  status_category: string;
  due_month_year: string;
  completion_percentage: number;
  status_message: string;
  Auth_Status:string;
}

export interface Summary {
  total_due: number;
  total_overdue: number;
  total_up_to_date: number;
  total_checked: number;
  Auth_Status:string;
}

export interface TargetPeriod {
  month: number;
  year: number;
  month_name_la: string;
  period: string;
  Auth_Status:string;
}

export interface ListFaDeptriptoinRespons {
  ald_id: number;
  asset_list_id_detail: AssetListIDDetail;
  dpca_value: string;
  dpca_no_of_days: number;
  remaining_value: string;
  accumulated_dpca: string;

  dpca_ac_yesno: DpcaACYesno;
  dpca_date: Date;
  dpca_datetime: Date;
  dpca_ac_by: null;
  Record_Status: RecordStatus;
  Maker_DT_Stamp: Date;
  Checker_DT_Stamp: null;
  asset_list_id: string;
  Maker_Id: string;
  Checker_Id: null;
  Auth_Status:string;
}

export enum RecordStatus {
  C = "C",
}

export interface AssetListIDDetail {
  asset_list_id: string;
  asset_spec: string;
  asset_list_code: string;
  asset_serial_no: string;
  asset_tag: string;
}

export enum DpcaACYesno {
  N = "N",
}

export interface HistoryFaDeptriptoinRespons {
    aldim_id:         number;
    dpca_month:       DpcaMonth;
    C_dpca:           string;
    dpca_value:       string;
    dpca_status:      DpcaStatus;
    Record_Status:    RecordStatus;
    Maker_DT_Stamp:   Date;
    Checker_DT_Stamp: Date;
    Maker_Id:         string;
    Checker_Id:       string;
     Auth_Status:string;
}



export enum DpcaMonth {
    The202507 = "2025-07",
}

export enum DpcaStatus {
    Success = "SUCCESS",
}
export interface ArrearsDeptriptoinRespons {
    success:   boolean;
    action:    string;
    data:      Data;
    timestamp: Date;
    Auth_Status:string;
}

export interface Data {
    success:       boolean;
    summary:       Summary;
    overdue_items_arrears: OverdueItem_arrears[];
    warning_items: any[];
}

export interface OverdueItem_arrears {
    mapping_id:             number;
    asset_id:               string;
    asset_name:             string;
    asset_value:            number;
    current_month:          number;
    total_months:           number;
    due_date:               string;
    due_end_date:           string;
    days_count:             number;
    expected_depreciation:  number;
    last_depreciation_date: string;
    due_month_year:         string;
    completion_percentage:  number;
   
    days_overdue:           number;
    overdue_months:         number;
    urgency_level:          string;
    urgency_message:        string;
    urgency_color:          string;
    Auth_Status:string;
}

export interface Summary {
    total_overdue:       number;
    total_warning:       number;
    total_overdue_value: number;
    breakdown:           Breakdown;
    generated_date:      string;
    urgency_legend:      UrgencyLegend;
    Auth_Status:string;
}

export interface Breakdown {
    critical: number;
    high:     number;
    medium:   number;
    low:      number;
    Auth_Status:string;
}

export interface UrgencyLegend {
    critical: string;
    high:     string;
    medium:   string;
    low:      string;
    warning:  string;
    Auth_Status:string;
}
