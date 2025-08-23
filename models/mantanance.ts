export interface MantananceDataRespons {
    audit_id:                 number;
    asset_list_id_detail:     AssetListidDetail;
    division_id_detail:       DivisionidDetail | null;
    audit_year:               string;
    audit_period:             string;
    audit_date:               string;
    auditor_name:             string;
    physical_status:          string;
    condition_status:         string;
    location_verified:        string;
    actual_location:          string;
    book_value:               string;
    estimated_value:          string;
    depreciation_rate:        null | string;
    accumulated_depreciation: string;
    remaining_useful_life:    number;
    serial_number_verified:   string;
    tag_number_verified:      string;
    insurance_coverage:       string;
    maintenance_required:     string;
    replacement_recommended:  string;
    disposal_recommended:     string;
    audit_findings:           null | string;
    recommendations:          null | string;
    photos_attached:          null | string;
    documents_verified:       string;
    follow_up_required:       string;
    follow_up_date:           null;
    audit_status:             string;
    reviewer_name:            null | string;
    review_date:              null | string;
    approver_name:            null | string;
    approval_date:            null | string;
    remarks:                  null | string;
    Record_Status:            string;
    Maker_DT_Stamp:           string;
    Checker_DT_Stamp:         null | string;
    asset_list_id:            string;
    department_id:            null | string;
    Maker_Id:                 string;
    Checker_Id:               null | string;
}

export interface AssetListidDetail {
    asset_list_id:   string;
    asset_spec:      string;
    asset_list_code: string;
    asset_serial_no: string;
    asset_tag:       string;
}

export interface DivisionidDetail {
    div_id:           string;
    division_name_la: string;
    division_name_en: string;
    Record_Status:    string;
}
