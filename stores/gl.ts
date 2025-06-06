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

import axios from "@/helpers/axios";
import { GlModel } from "~/models";

export const useGlStore = defineStore("gl", {
  state() {
    return {
      create_form_glsup: {
        glcode: "",
        glsub_code: "",
        glsub_Desc_la: null as string | null,
        glsub_Desc_en: "",
        gl_code_id: "",
        gl_code: "",
      },
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
      respons_gl_sup: null as GlModel.GlSupResepose | null,
      respons_gl_sup_filter: null as GlModel.GlSupResepose | null,
      tree_gl_sup_response: null as GlModel.TreeGlSupResepose | null,

      glsup_filter_type: {
        request: {
          gl_code: "",
        },
        isloading: false,
      },
      glsup_filter_type_new: {
        request: {
          gl_code: "",
        },
        isloading: false,
      },
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
    async getTreeGlSup(gl_code:number) {
        this.isloading = true;
        try {
            const res = await axios.get<GlModel.TreeGlSupResepose>(`/api/glsub-tree/${gl_code}`, {
                headers:{
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                }
            });
            if(res.status ===200){
                this.tree_gl_sup_response = res.data;
            }
        } catch (error) {
            this.error =
                error instanceof Error ? error.message : "An error occurred";
            throw error;
            
        }finally{
            this.isloading = false;
        }
    },
    async getDataGlfilter() {
      this.isloading = true;
      this.glfilter_gl_code.isloading = true;
      try {
        const res = await axios.get<GlModel.GlSupResepose>(`api/gl-sub/`, {
          params: {
            ...this.glsup_filter_type_new.request,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (res.status === 200) {
          this.respons_gl_sup_filter = res.data;
        }
      } catch (error) {
        console.error("Error fetching GL filter data:", error);
        this.error =
          error instanceof Error ? error.message : "An error occurred";
      } finally {
        this.isloading = false;
        this.glfilter_gl_code.isloading = false;
      }
    },
    async creatGlSup() {
      this.isloading = true;
      const res = await axios.post(`api/gl-sub/`, this.create_form_glsup, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      if (res.status === 201 || res.status === 200) {
        CallSwal({
          title: "ສຳເລັດ",
          text: "ສ້າງບັນທຶກ GL ສຳເລັດ",
          icon: "success",
        });
        setTimeout(() => {
          goPath("/gl/glsub/");
        }, 1500);

        return res.data;
      }
    },

    async getGlSupf() {
      this.isloading = true;
      this.glsup_filter_type.isloading = true;
      try {
        const res = await axios.get<GlModel.GlSupResepose>(
          `/api/gl-master/?glType=5`,
          {
            params: {
              ...this.glsup_filter_type.request,
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_gl_sup = res.data;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "An error occurred";
        throw error;
      } finally {
        this.isloading = false;
      }
    },
    async getGlsup() {
      this.isloading = true;
      try {
        const res = await axios.get<GlModel.GlSupResepose>(
          `api/gl-master/?glType=5`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_gl_sup = res.data;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "An error occurred";
        throw error;
      } finally {
        this.isloading = false;
      }
    },
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
            Authorization: `Bearer ${localStorage.getItem("access")}`,
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
        const res = await axios.get<GlModel.GlMasterDetailResponse>(
          `api/gl-tree/`,
          {
            params: {
              ...this.glfilter_gl_code.request,
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );

        if (res.status === 200) {
          this.respons_fiter_gl = res.data;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "An error occurred";
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
