export interface MasterRespons {
    MasterType:  MasterType;
    MasterCodes: MasterCode[];
}

export interface MasterCode {
    MC_id:      number;
    M_id:       number;
    MC_code:    string;
    MC_name_la: string;
    MC_name_en: string;
    MC_detail:  string;
    Status:     string;
    BOL_code:   string;
    BOL_name:   string;
}

export interface MasterType {
    M_id:      number;
    M_code:    string;
    M_name_la: string;
    M_name_en: string;
    M_detail:  string;
    Status:    string;
}

export interface SubRespons {
    success:        boolean;
    message:        string;
    gl_master_info: GlMasterInfo;
    data:           Datum[];
}

export interface Datum {
    glsub_id:         number;
    glsub_code:       string;
    glsub_Desc_la:    string;
    glsub_Desc_en:    string;
    Record_Status:    string;
    Maker_DT_Stamp:   Date;
    Checker_DT_Stamp: null;
    Auth_Status:      string;
    Once_Auth:        string;
    gl_code:          number;
    Maker_Id:         string;
    Checker_Id:       null;
}

export interface GlMasterInfo {
    glid:          number;
    gl_code:       string;
    gl_Desc_en:    string;
    gl_Desc_la:    string;
    glType:        string;
    category:      string;
    retal:         string;
    ccy_Res:       string;
    Res_ccy:       string;
    Record_Status: string;
    Auth_Status:   string;
}


export interface AccsetTypeRespons {
    MasterType:  MasterType;
    MasterCodes: MasterCode[];
}

export interface MasterCode {
    MC_id:      number;
    M_id:       number;
    MC_code:    string;
    MC_name_la: string;
    MC_name_en: string;
    MC_detail:  string;
    Status:     string;
    BOL_code:   string;
    BOL_name:   string;
}

export interface MasterType {
    M_id:      number;
    M_code:    string;
    M_name_la: string;
    M_name_en: string;
    M_detail:  string;
    Status:    string;
}
