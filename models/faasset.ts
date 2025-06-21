export interface FaAsset{
  asset_id:               number;
    asset_serial_no:        string;
    asset_tag:              string;
    asset_location_id:      number;
    asset_spec:             string;
    asset_date:             Date;
    asset_currency:         string;
    asset_value:            number;
    warranty_end_date:      Date;
    supplier_id:            number;
    dpca_type:              string;
    dpca_percentage:        number;
    asset_useful_life:      number;
    asset_salvage_value:    number;
    dpca_start_date:        Date;
    dpca_end_date:          Date;
    asset_accu_dpca_value:  number;
    asset_value_remain:     number;
    asset_latest_date_dpca: null;
    asset_disposal_date:    null;
    asset_ac_yesno:         string;
    asset_ac_date:          null;
    asset_ac_datetime:      null;
    aaset_ac_by:            null;
      asset_list_id:         number;
      has_depreciation:       string;
    asset_status:           string;
    asset_chart: FaAssetList[];
    location:FaAssetResponse[]
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