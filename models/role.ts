export interface RoleListRespons{
    Item: Role[];
}
export interface Role {
    role_id:          string;
    role_name_la:     string;
    role_name_en:     string;
    record_Status:    string;
    Maker_DT_Stamp:   Date;
    Checker_DT_Stamp: Date;
    Auth_Status:      string;
    Once_Auth:        string;
    Maker_Id:         null;
    Checker_Id:       null;
}
