
export interface UserLoginResponse {
  message: string;
  access: string; 
  refresh: string; 
  user: any;  
}

export interface User {
  avatar:   string;
  fullname: string;
  id:       number;
  username: string;
}
export interface Items {
    id:               number;
     user_id:          string;
    user_name:        string;
    user_email:       string;
    user_mobile:      string;
    profile_image:    File | null | string;
    User_Status:      string;
    pwd_changed_on:   null;
    division:       Division | null;
    role:             Role | null;
    InsertDate:       Date;
    UpdateDate:       Date;
    Maker_Id:         null;
    Maker_DT_Stamp:   null;
    Checker_Id:       null;
    Checker_DT_Stamp: null;
    Auth_Status:      string;
    Once_Auth:        null;
}
export interface UserListRespons {
  Item: Items[];
  detail: DetailUsertRespons | null;
  role: Role | null;
}
export interface Role {
    role_id:       string;
    role_name_la:  string;
    role_name_en:  string;
    record_Status: string;
}
export interface DetailUsertRespons {
    user_id:          string;
    user_name:        string;
    user_email:       string;
    user_mobile:      string;
    User_Status:      string;
    pwd_changed_on:   null;
    division:       Division | null;
    role:           Role;
    InsertDate:       Date;
    UpdateDate:       Date;
    Maker_Id:         null;
    Maker_DT_Stamp:   null;
    Checker_Id:       null;
    Checker_DT_Stamp: null;
    Auth_Status:      string;
    Once_Auth:        null;
    
}

export interface Role {
    role_id:       string;
    role_name_la:  string;
    role_name_en:  string;
    record_Status: string;
}
export interface Division {
    div_id:           string;
    division_name_la: string;
    division_name_en: string;
    record_Status:    string;
}

export interface Role {
    role_id:       string;
    role_name_la:  string;
    role_name_en:  string;
    record_Status: string;
}