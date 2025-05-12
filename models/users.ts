
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
    User_Id:          string;
    User_Name:        string;
    User_Email:       string;
    User_Mobile:      null | string;
    Div_Id:           null;
    User_Status:      boolean | string;
    profile_image: File | null | string;
    Maker_Id:         null;
    Maker_DT_Stamp:   null;
    Checker_Id:       null;
    Checker_DT_Stamp: null;
    Auth_Status:      null | string;
    Once_Auth:        null | string;
    Role_ID:          null;
    InsertDate:       Date;
    UpdateDate:       Date;
}
export interface UserListRespons {
  Item: Items[];
}