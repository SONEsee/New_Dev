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
