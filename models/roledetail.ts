export interface RoleDetailResponse {
    role_id:     string;
    function_id: string;
    New_Detail:  number;
    Del_Detail:  number;
    Edit_Detail: number;
    Auth_Detail: number;
    View_Detail: number;
}

export interface RoleDetailResponsItem {
    id:          number;
    fuu_details: FuuDetails;
    role_detail: RoleDetail;
    role_id:     string;
    sub_menu_id: string;
    New_Detail:  number;
    Del_Detail:  number;
    Edit_Detail: number;
    Auth_Detail: number;
    View_Detail: number;
}

export interface FuuDetails {
    sub_menu_id:      string;
    menu:             Menu;
    sub_menu_name_la: string;
    sub_menu_name_en: string;
    sub_menu_icon:    string;
    sub_menu_order:   string;
    sub_menu_urls:    string;
    is_active:        string;
    created_by:       null;
    created_date:     Date;
    modified_by:      string;
    modified_date:    Date;
    menu_id:          string;
}

export interface Menu {
    menu_id:      string;
    menu_name_la: string;
    menu_name_en: string;
}

export interface RoleDetail {
    role_id:       string;
    role_name_la:  string;
    role_name_en:  string;
    record_Status: string;
}
