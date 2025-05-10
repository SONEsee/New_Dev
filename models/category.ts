export interface CategoryRespons {
    categories: Category[];
}

export interface Category {
     id:               number;
    Div_Id:           string;
    Div_NameL:        string;
    Div_NameE:        string;
    Record_Status:    string;
    Maker_DT_Stamp:   Date;
    Checker_DT_Stamp: Date | null;
    Auth_Status:      string;
    Once_Auth:        string;
    Maker_Id:         number | null;
    Checker_Id:       null;
}