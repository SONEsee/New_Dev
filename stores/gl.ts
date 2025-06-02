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
  category: string; // Fixed: was missing in create_form_gl
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

import axios from "@/helpers/axios";
import { GlModel } from "~/models";

export const useGlStore = defineStore("gl", {
  state() {
    return {
      create_form_gl: {
        gl_code: "",
        gl_Desc_la: null as string | null,
        gl_Desc_en: "",
        glType: "",
        category: "",
        retal: "",
        ccy_Res: "",
        Res_ccy: "",
        Allow_BackPeriodEntry: "",
        pl_Split_ReqD: "",
      },
      respons_data_gl: null as GlModel.GlResponse[] | null,
      respons_detail_gl: null as GlModel.GlMasterDetailResponse | null,
      respons_fiter_gl: null as GlModel.GlMasterDetailResponse | null,
      glfilter_gl_code: {
        request: {
          gl_code: "",
          glType: "",
        },
        isloading: false,
      },
      glmaster_filter_gl_code: {
        request: {
          gl_code: "",
        },
        isloading: false,
      },
      isloading: false,
      error: null as string | null,
    };
  },
  actions: {
    async getGl() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<GlModel.GlResponse[]>(`api/gl-tree/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (res.status === 200) {
          this.respons_data_gl = res.data;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "An error occurred";
        throw error;
      } finally {
        this.isloading = false;
      }
    },

    async createGl() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.post(`api/gl-master/`, this.create_form_gl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`, // Fixed: consistent token key
          },
        });

        if (res.status === 200 || res.status === 201) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສ້າງບັນທຶກ GL ສຳເລັດ",
            icon: "success",
          });
          setTimeout(() => {
            goPath("/gl");
          }, 1500);

          this.resetCreateForm();
          return res.data;
        }
      } catch (error) {
        CallSwal({
          title: "Error",
          text: error instanceof Error ? error.message : "An error occurred",
          icon: "error",
        });
        this.error =
          error instanceof Error ? error.message : "An error occurred";
        throw error;
      } finally {
        this.isloading = false;
      }
    },

    resetCreateForm() {
      this.create_form_gl = {
        gl_code: "",
        gl_Desc_la: null,
        gl_Desc_en: "",
        glType: "",
        category: "", 
        retal: "",
        ccy_Res: "",
        Res_ccy: "",
        Allow_BackPeriodEntry: "",
        pl_Split_ReqD: "",
      };
    },

    async getGlMasterDetail(gl_code: string) {
      this.isloading = true;
      this.glmaster_filter_gl_code.isloading = true;
      try {
        const res = await axios.get<GlModel.GlMasterDetailResponse>(
          `api/gl-master/?gl_code=${gl_code}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_detail_gl = res.data;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "An error occurred";
        throw error;
      } finally {
        this.isloading = false;
        this.glmaster_filter_gl_code.isloading = false;
      }
    },
    async getGlMasterDetail2() {
  this.glfilter_gl_code.isloading = true;
  this.isloading = true;
  
  try {
    const res = await axios.get<GlModel.GlMasterDetailResponse>(`api/gl-tree/`, {
      params: {
        ...this.glfilter_gl_code.request
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      }
    });
    
    if (res.status === 200) {
      this.respons_fiter_gl = res.data;
    }
  } catch (error) {
    this.error = error instanceof Error ? error.message : "An error occurred";
    throw error;
  } finally {
    this.isloading = false;
    this.glfilter_gl_code.isloading = false;
  }
},
    clearError() {
      this.error = null;
    },
  },
});
