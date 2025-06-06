export interface CerrencyResponse {
    success: boolean;
    message: string;
    data: UserDataRespons[];
    ccy_master_info: null;
}
export interface UserDataRespons {
    ccy_code:         string;
    Ccy_Name_la:      string;
    Ccy_Name_en:      string;
    Country:          string;
    Ccy_Decimals:     string;
    ALT_Ccy_Code:     string;
    Record_Status:    string;
    Maker_DT_Stamp:   string;
    Checker_DT_Stamp: null | string;
    Auth_Status:      string;
    Once_Auth:        string;
    Maker_Id:         string;
    Checker_Id:       null | string;
}