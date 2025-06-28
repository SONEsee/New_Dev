export interface AccoutMethodRespons {
    mapping_id:        number;
    ref_id:            number;
    acc_type:          string;
    debit_account_id:  string;
    credit_account_id: string;
    amount:            string;
    transaction_date:  Date;
    description:       string;
    journal_entry_id:  string;
    Record_Status:     string;
    Maker_DT_Stamp:    Date;
    Checker_DT_Stamp:  null;
    asset_id:          null;
    Maker_Id:          string;
    Checker_Id:        null;
}
