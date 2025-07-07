import axios from "@/helpers/axios";
import { MasterModel } from "~/models";
export const useMasterStore = defineStore("master", {
  state() {
    return {
      respone_data_master: null as MasterModel.MasterRespons[] | null,
      respone_data_sub:null as MasterModel.Datum | null,
      resposne_status_puamsuepuamkrsang:null as MasterModel.MasterCode | null,
      isloading: false,
      error: null as string | null,
      res_pons_filter:{
        query:{
            gl_code: "",
        }
      }
    };
  },
  actions: {
    async getModelData() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterRespons[]>(
          `/api/master-types/tree/TOP/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respone_data_master = res.data;
          console.log("Master data fetched successfully:", this.respone_data_master);
          this.isloading = false;
        }
      } catch (error) {
        CallSwal({
          title: "Error",
          text: "ການດຶງຂໍ້ມູນຜິດພາດ.",
          icon: "error",
        });
        this.error = "Failed to fetch master data";
        console.error(error);
      }
    },
    async getSubData() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.Datum>(
          `/api/glsub-tree-all/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            params:{
                ...this.res_pons_filter.query
            }
          }
        );
        if (res.status === 200) {
          this.respone_data_sub = res.data
          console.log("Master data fetched successfully:", this.respone_data_master);
          this.isloading = false;
        }
      } catch (error) {
       
        this.error = "Failed to fetch master data";
        console.error(error);
      }
    },
    async getDataAsset(){
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterRespons[]>(
          `/api/master-types/tree/COA/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respone_data_master = res.data;
          console.log("Master data fetched successfully:", this.respone_data_master);
          this.isloading = false;
        }
      } catch (error) {
        CallSwal({
          title: "Error",
          text: "ການດຶງຂໍ້ມູນຜິດພາດ.",
          icon: "error",
        });
        this.error = "Failed to fetch master data";
        console.error(error);
      }
    },
    async getPuamsue(){
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterCode>(
          `/api/master-types/tree/AS/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.resposne_status_puamsuepuamkrsang = res.data;
          console.log("Master data fetched successfully:", this.respone_data_master);
          this.isloading = false;
        }
      } catch (error) {
        CallSwal({
          title: "Error",
          text: "ການດຶງຂໍ້ມູນຜິດພາດ.",
          icon: "error",
        });
        this.error = "Failed to fetch master data";
        console.error(error);
      }
    },
  },
});
