export interface GlResepose {
    gl_code:    string;
    gl_Desc_la: null | string;
    gl_Desc_en: string;
    children:   GlResepose[];
}
export interface GlMasterDetailResepose {
    glid:                  number;
    gl_code:               string;
    gl_Desc_la:            string;
    gl_Desc_en:            string;
    glType:                string;
    category:              string;
    retal:                 null;
    ccy_Res:               null;
    Res_ccy:               null;
    Allow_BackPeriodEntry: null;
    pl_Split_ReqD:         null;
    Record_Status:         null;
    Maker_DT_Stamp:        null;
    Checker_DT_Stamp:      null;
    Auth_Status:           null;
    Once_Auth:             null;
    Maker_Id:              null;
    Checker_Id:            null;
}
