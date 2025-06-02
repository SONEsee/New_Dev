export interface GlResponse {
  gl_code: string;
  gl_Desc_la: string | null;
  gl_Desc_en: string;
  detail: GlMasterDetailResponse[];
  children: GlResponse[];
}

export interface GlMasterDetailResponse {
  glid: number;
  gl_code: string;
  gl_Desc_la: string | null;
  gl_Desc_en: string;
  glType: string;
  category: string; 
  retal: string | null;
  ccy_Res: string | null;
  Res_ccy: string | null;
  Allow_BackPeriodEntry: string | null;
  pl_Split_ReqD: string | null;
  Record_Status: string | null;
  Maker_DT_Stamp: string | null;
  Checker_DT_Stamp: string | null;
  Auth_Status: string | null;
  Once_Auth: string | null;
  Maker_Id: string | null;
  Checker_Id: string | null;
}