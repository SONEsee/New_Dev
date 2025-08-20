export interface ReportDeprecationRespons {
    success: boolean;
    data:    Datum[];
    count:   number;
}

export interface Datum {
    asset_list_id:           string;
    asset_list_code:         string;
    asset_type_id_id:        number;
    asset_serial_no:         string;
    asset_tag:               string;
    asset_location_id_id:    number;
    asset_spec:              string;
    has_depreciation:        string;
    dpca_type:               string;
    dpca_percentage:         string;
    asset_useful_life:       number;
    asset_value:             string;
    asset_salvage_value:     string;
    accu_dpca_value_total:   string;
    asset_accu_dpca_value:   string;
    asset_value_remain:      string;
    asset_value_remainMonth: string;
    asset_value_remainBegin: string;
    asset_value_remainLast:  string;
    asset_currency:          string;
    asset_date:              string;
    warranty_end_date:       null;
    dpca_start_date:         string;
    dpca_end_date:           string;
    asset_latest_date_dpca:  string;
    asset_disposal_date:     null;
    asset_ac_date:           null;
    asset_ac_datetime:       string;
    asset_status:            string;
    asset_ac_yesno:          string;
    C_dpac:                  string;
    type_of_pay:             string;
    acc_no:                  string;
    Record_Status:           string;
    delete_Stat:             string;
    asset_ac_by_id:          string;
    supplier_id_id:          number;
    Auth_Status_ARC:         string;
    Auth_Status:             string;
    Checker_DT_Stamp:        string;
    Checker_Id_id:           string;
    Maker_DT_Stamp:          string;
    Maker_Id_id:             string;
}
