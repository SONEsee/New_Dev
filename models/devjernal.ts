export interface jurnalResponse {
    JRNLLog_id:       number;
    pre_main:         PreMain;
    Reference_No:     string;
    Reference_sub_No: string;
    comments:         null;
    Fcy_Amount:       string;
    Lcy_Amount:       string;
    fcy_dr:           string;
    fcy_cr:           string;
    lcy_dr:           string;
    lcy_cr:           string;
    Dr_cr:            DRCR;
    Account_no:       string;
    Ac_relatives:     ACRelatives;
    Value_date:       Date;
    Exch_rate:        string;
    Addl_text:        AddlText;
    Addl_sub_text:    string;
    Maker_DT_Stamp:   Date;
    Checker_DT_Stamp: Date | null;
    Auth_Status:      AuthStatus;
    module_id:        ModuleID;
    Ccy_cd:           CcyCD;
    Account:          number;
    Txn_code:         TxnCode;
    fin_cycle:        string;
    Period_code:      string;
    Maker_Id:         string;
    Checker_Id:       null | string;
}

export type ACRelatives = string | null;

export type AddlText = string | null;

export type AuthStatus = string;

export type CcyCD = string;

export type DRCR = string;

export type TxnCode = string;

export type ModuleID = string;

export interface PreMain {
    aldm_id:   number;
    dpca_desc: string;
}