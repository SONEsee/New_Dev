export interface FaAsset{
    asset_list_id:           string;
    asset_id_detail:         AssetIDDetail;
    location_detail:         LocationDetail;
    supplier_detail:         SupplierDetail;
    asset_list_code:         string;
    asset_serial_no:         string;
    asset_tag:               string;
    asset_spec:              string;
    asset_date:              Date;
    asset_currency:          string;
    asset_value:             string;
    asset_status:            string;
    warranty_end_date:       null;
    has_depreciation:        string;
    dpca_type:               string;
    dpca_percentage:         string;
    asset_useful_life:       number;
    asset_salvage_value:     string;
    dpca_start_date:         null;
    dpca_end_date:           null;
    asset_accu_dpca_value:   string;
    asset_value_remain:      string;
    asset_value_remainMonth: null;
    asset_value_remainBegin: null;
    asset_value_remainLast:  null;
    acc_no:                  null;
    type_of_pay:             null;
    asset_latest_date_dpca:  null;
    asset_disposal_date:     null;
    asset_ac_yesno:          string;
    asset_ac_date:           null;
    asset_ac_datetime:       Date;
    Record_Status:           string;
    Maker_DT_Stamp:          Date;
    Checker_DT_Stamp:        null;
    asset_type_id:           number;
    asset_location_id:       number;
    supplier_id:             number;
    asset_ac_by:             string;
    Maker_Id:                string;
    Checker_Id:              null;
}
export interface FaAssetList {
 asset_id: number;
 asset_code: string;
 asset_name: string;
}

export interface FaAssetResponse {
 location_name: string;
 location_code: string;
}

export interface AssetIDDetail {
    coa_id:        number;
    asset_code:    string;
    asset_name_en: string;
    asset_name_la: string;
}

export interface LocationDetail {
    location_id:      number;
    location_code:    string;
    location_name_en: string;
    location_name_la: string;
}

export interface SupplierDetail {
    supplier_id:   number;
    supplier_code: string;
    supplier_name: string;
}
