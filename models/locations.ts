export interface Location {
  location_id: number; 
  location_code: string; 
  location_name_la: string; 
  location_name_en: string; 
  parent_location_id: number | null; 
  location_type: 'BUILDING' | 'FLOOR' | 'ROOM' | 'AREA' | 'WAREHOUSE'; 
  address: string | null; 
  responsible_person: string | null;
  phone: string | null; 
  remarks: string | null; 
  record_stat: 'C' | 'O';
}