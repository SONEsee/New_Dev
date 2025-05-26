export interface GLMasterResponse {
  glid: number;
  gl_code: string | null;
  gl_Desc_la: string | null;
  gl_Desc_en: string | null;
  glType: string | null;
  category: string | null;
  retal: string | null;
  ccy_Res: string | null;
  Res_ccy: string | null;
  Allow_BackPeriodEntry: string | null;
  pl_Split_ReqD: string | null;
  Record_Status: string | null;
  Maker_DT_Stamp: Date | null;
  Checker_DT_Stamp: Date | null;
  Auth_Status: string | null;
  Once_Auth: string | null;
  Maker_Id: string | null;
  Checker_Id: string | null;
}