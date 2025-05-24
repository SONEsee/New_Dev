export interface CategoryRespons {
    categories: Category[];
    
}

export interface Category {
   div_id:           string;
    division_name_la: string;
    division_name_en: string;
    record_Status:    string;
    Maker_DT_Stamp:   string;
    Checker_DT_Stamp: null | string;
    Auth_Status:      string;
    Once_Auth:        string;
    Maker_Id:         null ;
    Checker_Id:       null;
}
export interface DetailDevisionsRespons {
    div_id:           string;
    division_name_la: string;
    division_name_en: string;
    record_Status:    string;
    Maker_DT_Stamp:   string;
    Checker_DT_Stamp: null;
    Auth_Status:      string;
    Once_Auth:        string;
    Maker_Id:         null | string;
    Checker_Id:       null | string;
}