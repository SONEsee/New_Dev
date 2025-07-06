export interface PropertyType {
    type_id:           number;
    mastercode_detail: MastercodeDetail;
    is_tangible:       string;
    type_code:         string;
    type_name_la:      string;
    type_name_en:      string;
    Record_Status:     string;
    Maker_DT_Stamp:    Date;
    Checker_DT_Stamp:  Date | null;
    Maker_Id:          string;
    Checker_Id:        null | string;

}
export interface MastercodeDetail {
    MC_code:      string;
    MC_name_la:   string;
    MC_name_en:   string;
    M_id_id:      number;
    chart_detail: ChartDetail;
}

export interface ChartDetail {
    coa_id:        number;
    asset_code:    string;
    asset_name_en: string;
    asset_name_la: string;
}