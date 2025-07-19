export interface FaAssetListDistcritionRespons {
    aldm_id:              number;
    asset_list_id_detail: AssetListIDDetail;
    dpca_year:            null;
    dpca_month:           null;
    dpca_date:            null;
    dpca_value:           null;
    dpca_no_of_days:      null;
    remaining_value:      null;
    accumulated_dpca:     null;
    dpca_desc:            null;
    dpca_ac_yesno:        string;
    dpca_ac_date:         null;
    dpca_datetime:        null;
    dpca_ac_by:           null;
    Record_Status:        string;
    Maker_DT_Stamp:       Date;
    Checker_DT_Stamp:     null;
    asset_list_id:        string;
    Maker_Id:             string;
    Checker_Id:           null;
}

export interface AssetListIDDetail {
    asset_list_id:   string;
    asset_spec:      string;
    asset_list_code: string;
    asset_serial_no: string;
    asset_tag:       string;
}



export interface DepreciationRespons {
    success:   boolean;
    action:    string;
    data:      Data;
    timestamp: Date;
}

export interface Data {
    success:                     boolean;
    target_period:               TargetPeriod;
    summary:                     Summary;
    overdue_items:               any[];
    due_items:                   AllItemsNeedingAttention[];
    up_to_date_items:            any[];
    all_items_needing_attention: AllItemsNeedingAttention[];
}

export interface AllItemsNeedingAttention {
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
    status_category:        string;
    due_month_year:         string;
    completion_percentage:  number;
    status_message:         string;
}

export interface Summary {
    total_due:        number;
    total_overdue:    number;
    total_up_to_date: number;
    total_checked:    number;
}

export interface TargetPeriod {
    month:         number;
    year:          number;
    month_name_la: string;
    period:        string;
}
