export interface ModuleRequest {
    items: ModuleResponsItems;
    detail: ModuleDetailRespons;
}
export interface ModuleResponsItems {
    module_Id:      string;
    module_name_la: string;
    module_name_en: string;
    module_icon:    string;
    module_order:   string;
    is_active:      string;
    created_by:     null;
    created_date:   string;
    modified_by:    null;
    modified_date:  null;
}
export interface ModuleDetailRespons {
    module_Id:      string;
    module_name_la: string;
    module_name_en: string;
    module_icon:    string;
    module_order:   string;
    is_active:      string;
    created_by:     null;
    created_date:   string;
    modified_by:    null;
    modified_date:  null;
}
