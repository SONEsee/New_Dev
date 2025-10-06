export interface JurnarlRespons {
    results:          Result;
    count:            number;
    summary:          Summary;
    transaction_type: string;
}

export interface Result {
    JRNLLog_id:       number;
    maker_name:       string;
    jrnl_log_ac:      JrnlLogAC;
    Reference_No:     string;
    Fcy_Amount:       string;
    Lcy_Amount:       string;
    Value_date:       Date;
    Exch_rate:        string;
    Addl_text:        string;
    Maker_DT_Stamp:   Date;
    Checker_DT_Stamp: null;
    Auth_Status:      string;
    entry_seq_no:     number;
    delete_stat:      null;
    module_id:        string;
    Ccy_cd:           string;
    Txn_code:         string;
    fin_cycle:        string;
    Period_code:      string;
    Maker_Id:         string;
    Checker_Id:       null;
}

export interface JrnlLogAC {
    JRNLLog_id:   number;
    Ac_relatives: string;
}

export interface Summary {
    total:      number;
    pending:    number;
    approved:   number;
    rejected:   number;
    correction: number;
}
