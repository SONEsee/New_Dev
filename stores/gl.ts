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
        gategory: "",
        // category_type: "",
        retal: "",
        ccy_Res: "",
        Res_ccy: "",
        Allow_BackPeriodEntry: "",
        pl_Split_ReqD: "",
      },
      respons_data_gl: null as GlModel.GlResepose[] | null,
      respons_detail_gl: null as GlModel.GlMasterDetailResepose | null,
      glmaster_filer_gl_code: {
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
        const res = await axios.get<GlModel.GlResepose[]>(`api/gl-tree/`, {
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        gategory: "",
        // category_type: "",
        retal: "",
        ccy_Res: "",
        Res_ccy: "",
        Allow_BackPeriodEntry: "",
        pl_Split_ReqD: "",
      };
    },
    async getGlMasterDetail(gl_code:number) {
      this.isloading = true;
      this.glmaster_filer_gl_code.isloading = true;
      try {
        const res = await axios.get<GlModel.GlMasterDetailResepose>(
          `api/gl-master/?gl_code=${gl_code}`,
          {
          
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        this.glmaster_filer_gl_code.isloading = false;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
