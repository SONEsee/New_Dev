export interface DreprecitionRespons {
    success:         boolean;
    action:          string;
    data:            Data;  // ປ່ຽນຈາກ Data[] ເປັນ Data (object ດຽວ)
    journal_enabled: boolean;
    timestamp:       string;
}

export interface Data {
    success:               boolean;
    current_business_date: string;
    target_period:         TargetPeriod;
    summary:               Summary;
    overdue_items:         DepreciationItem[];  
    due_items:             DepreciationItem[]; 
    up_to_date_items:      DepreciationItem[];  
    all_items_needing_attention: DepreciationItem[];  
}

export interface DepreciationItem {  
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
    total_due:                     number;
    total_overdue:                 number;
    total_up_to_date:              number;
    total_checked:                 number;
    total_items_need_depreciation: number;
    total_depreciation_amount:     number;
}

export interface TargetPeriod {
    month:         number;
    year:          number;
    month_name_la: string;
    period:        string;
}
