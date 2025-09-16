export interface DevJourNalRespons {
    success: boolean;
    count:   number;
    data:    Datum;
}

export interface Datum {
    JRNLLog_id:   number;
    Reference_No: string;
    Fcy_Amount:   string;
    Lcy_Amount:   string;
    Dr_cr:        "C";
    Auth_Status:  "U";
    Value_date:   Date;
    Ac_relatives: string;
}
