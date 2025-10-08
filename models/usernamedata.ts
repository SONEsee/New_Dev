export interface UserNameDataRespons {
    user_id:          string;
    password:         string;
    last_login:       null | string;
    is_superuser:     boolean;
    user_name:        string;
    user_password:    string;
    user_email:       string;
    user_mobile:      string;
    profile_picture:  null | string;
    User_Status:      string;
    pwd_changed_on:   null;
    InsertDate:       string;
    UpdateDate:       string;
    Maker_DT_Stamp:   null | string;
    Checker_DT_Stamp: null | string;
    Auth_Status:      string;
    Once_Auth:        null | string;
    div_id:           string;
    Role_ID:          string;
    Maker_Id:         null | string;
    Checker_Id:       null | string;
    groups:           any[];
    user_permissions: any[];
}
