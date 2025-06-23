export interface Location {
  location_id: number; 
  location_code: string; 
  location_name_la: string; 
  location_name_en: string; 
  parent_location_id: number | null; 
  location_type: 'ອາຄານ' | 'ຊັ້ນ' | 'ຫ້ອງ' | 'ລານຫຼືສວນ' | 'ສາງເກັບເຄື່ອງ'; 
  address: string | null; 
  responsible_person: string | null;
  phone: string | null; 
  remarks: string | null; 
  Record_Status: 'C' | 'O';
}