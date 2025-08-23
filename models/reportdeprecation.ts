export interface ReportDeprecationRespons {
    success: boolean;
    data:    Datum;
    count:   number;
}
 export interface FilterReportDeprecation {
  asset_type_id: number | null;
  asset_status: string | null;
  start_date: string;
  end_date: string;
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
export interface HukhaLouyHianRespons {
    success: boolean;
    data:    Datum;
    totals:  Totals;
    message: string;
}

export interface Datum {
    aldm_id:                 number;
    asset_list_id_id:        string;
    dpca_year:               string;
    dpca_month:              string;
    dpca_date:               Date;
    dpca_desc:               string;
    dpca_value:              string;
    remaining_value:         string;
    dpca_month_dedc:         null;
    detail:                  null;
    dpca_no_of_days:         number;
    accumulated_dpca:        string;
    dpca_ac_yesno:           string;
    dpca_ac_date:            null;
    dpca_datetime:           Date;
    dpca_ac_by:              null;
    aldm_month_id_id:        number;
    Record_Status:           string;
    Auth_Status:             string;
    Checker_Id_id:           string;
    Checker_DT_Stamp:        string;
    Maker_Id_id:             string;
    Maker_DT_Stamp:          string;
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
    delete_Stat:             string;
    asset_ac_by_id:          string;
    supplier_id_id:          number;
    Auth_Status_ARC:         string;
}

export interface Totals {
    total_asset_value:          number;
    total_depreciation_value:   number;
    total_remaining_value:      number;
    total_monthly_depreciation: number;
    asset_count:                number;
}


export class Convert {
    public static toHukhaLouyHianRespons(json: string): HukhaLouyHianRespons {
        return JSON.parse(json);
    }

    public static hukhaLouyHianResponsToJson(value: HukhaLouyHianRespons): string {
        return JSON.stringify(value);
    }
}