export interface MenuRespons {
    module_Id:      string;
    module_name_la: string;
    module_name_en: string;
    module_icon:    string;
    module_order:   string;
    is_active:      string;
    main_menus:     MainMenu[];
}

export interface MainMenu {
    menu_id:      string;
    menu_name_la: string;
    menu_name_en: string;
    menu_icon:    string;
    menu_order:   string;
    is_active:    string;
    sub_menus:    SubMenu[];
}

export interface SubMenu {
    sub_menu_id:      string;
    sub_menu_name_la: string;
    sub_menu_name_en: string;
    sub_menu_icon:    string;
    sub_menu_order:   string;
    sub_menu_urls:    string;
    is_active:        string;
    functions:        Function[];
}

export interface Function {
    function_id:    string;
    description_la: string;
    description_en: string;
    permissions:    Permissions;
}

export interface Permissions {
    new:    number;
    delete: number;
    edit:   number;
    auth:   number;
}
