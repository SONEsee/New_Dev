export interface DeviceResponse {
  error: null;
  items: Items;
  status: number;
  timestamp: string;
}

export interface Items {
  id: string;
  pos_no: string;
  imei: string;
  created_at: Date;
  updated_at: Date;
  created_by_user_id: string;
  create_username: string;
  create_fullname: string;
  create_nickname: string;
  status: number;
  device_locations: DeviceLocation[];
  device_transactions: any[];
}

export interface DeviceLocation {
  id: string;
  latitude: number;
  longitude: number;
  device_id: string;
  created_at: Date;
  updated_at: Date;
}
export interface DeviceDetailResponse {
  error: null;
  items: Items;
  status: number;
  timestamp: string;
}

export interface Items {
  list_data: ListDatum[];
  pagination: Pagination;
}

export interface ListDatum {
  id: string;
  agency_id: string;
  pos_no: string;
  imei: string;
  created_at: Date;
  updated_at: Date;
  created_by_user_id: string;
  status: number;
  device_status: number;
  device_id: DeviceID;
  user: User;
}

export enum DeviceID {
  NA = "N/A",
}

export interface User {
  id: string;
  agent_code: DeviceID;
  fullname: Fullname;
  nick_name: DeviceID;
}

export enum Fullname {
  Admin32Lottery = "admin@sone",
}

export interface Pagination {
  current_page: number;
  limit: number;
  total_count: number;
  total_page: number;
}
export interface DeviceDetailidResponse {
  items: {
    id: string;
    pos_no: string;
    imei: string;
    created_at: Date;
    updated_at: Date;
    created_by_user_id: string;
    create_username: string;
    create_fullname: string;
    create_nickname: string;
    pagination: {
      current_page: number;
      total_pages: number;
    };
  };
}
