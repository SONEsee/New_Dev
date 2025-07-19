export interface Welcome {
     transfer_id:          number;
    asset_list_id_detail: AssetListIDDetail;
    from_location_detail: LocationDetail;
    to_location_detail:   LocationDetail;
    transfer_date:        Date;
    transfer_reason:      string;
    transfer_cost:        null;
    condition_before:     null;
    condition_after:      null;
    transport_method:     string;
    requested_by:         null;
    approved_by:          null;
    received_by:          null;
    handover_date:        null;
    received_date:        null;
    status:               null;
    insurance_covered:    string;
    estimated_arrival:    null;
    actual_arrival:       null;
    notes:                null;
    Record_Status:        string;
    Maker_DT_Stamp:       Date;
    Checker_DT_Stamp:     Date;
    asset_list_id:        string;
    from_location_id:     number;
    to_location_id:       number;
    Maker_Id:             string;
    Checker_Id:           string;
}

export interface AssetListIDDetail {
    asset_list_id:   string;
    asset_spec:      string;
    asset_list_code: string;
    asset_serial_no: string;
    asset_tag:       string;
}

export interface LocationDetail {
    location_id:      number;
    location_code:    string;
    location_name_en: string;
    location_name_la: string;
}
