import axios from "@/helpers/axios";
import { MasterModel } from "~/models";
export const useMasterStore = defineStore("master", {
  state() {
    return {
      respone_data_master: null as MasterModel.MasterRespons[] | null,
      respone_data_cat: null as MasterModel.MasterRespons[] | null,
      respone_data_sub:null as MasterModel.Datum | null,
      resposne_status_puamsuepuamkrsang:null as MasterModel.MasterCode | null,
      respons_data_status_nuw :null as MasterModel.MasterCode | null,
      respons_data_lda :null as MasterModel.MasterCode | null,
      respons_data_gda: null as MasterModel.MasterCode | null,
      respons_data_type_of_play: null as MasterModel.MasterCode | null,
      respons_data_status_dps :null as MasterModel.MasterCode | null,
      respons_data_status_nuw1 :null as MasterModel.MasterCode | null,
      resposne_status_setting:null as MasterModel.MasterCode | null,
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
    async getTypeOfplay(){
      this.isloading = true;
      try {
        const res = await axios.get<MasterModel.MasterRespons>(`/api/master-types/tree/TOP/`,{
          headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${localStorage.getItem("access_token")}`
          }
        });if(res.status ===200){
          this.respons_data_type_of_play = res.data.MasterCodes;
        }
      } catch (error) {
        CallSwal({
          icon:"error",
          title: "ຜຶດພາດ",
          text: "ບໍ່ສາມາດດືງຂໍມູນປະເພດການຈ່າຍໄດ້."
        })
      }finally{
        this.isloading = false;
      }
    },
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
    async getStatus(){
      this.isloading = true;
      try {
          const res = await axios.get<MasterModel.MasterRespons[]>(`/api/master-types/tree/A/`,{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });if(res.status === 200){
        this.respone_data_master = res.data
      }
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    
    },
  
    async getCAT() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterRespons[]>(
          `/api/master-types/tree/CAT/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respone_data_cat = res.data;
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
    async getDT() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterRespons>(
          `/api/master-types/tree/DT/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_data_status_nuw = res.data.MasterCodes ;
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
   async getGDA(){
      this.isloading = true;
      try {
        const res = await axios.get<MasterModel.MasterRespons>(`api/master-types/tree/GDA/`,{
          headers:{
            "Content-Type":"application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        });if(res.status === 200){
          this.respons_data_gda = res.data.MasterCodes;
        }
      } catch (error) {
        CallSwal({
          title: "Error",
          text: "ການດຶງຂໍ້ມູນຜິດພາດ.",
          icon: "error",
        })
      }finally{
        this.isloading = false;
      }
    },
   async getLDA(){
      this.isloading = true;
      try {
        const res = await axios.get<MasterModel.MasterRespons>(`api/master-types/tree/LDA/`,{
          headers:{
            "Content-Type":"application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        });if(res.status === 200){
          this.respons_data_lda = res.data.MasterCodes;
        }
      } catch (error) {
        CallSwal({
          title: "Error",
          text: "ການດຶງຂໍ້ມູນຜິດພາດ.",
          icon: "error",
        })
      }finally{
        this.isloading = false;
      }
    },
    async getEP() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterRespons>(
          `/api/master-types/tree/EP/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_data_status_nuw1 = res.data.MasterCodes ;
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
    async getTMN() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<{ MasterCodes: MasterModel.MasterRespons }>(
          `/api/master-types/tree/TMN/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.resposne_status_puamsuepuamkrsang = res.data.MasterCodes ;
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
        const res = await axios.get<MasterModel.SubRespons>(
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
          this.respone_data_sub = res.data.data
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
    async getPuamsue1(){
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterRespons>(
          `/api/master-types/tree/AS/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_data_status_nuw = res.data.MasterCodes;
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
    async getDPS(){
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterRespons>(
          `/api/master-types/tree/DPS/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_data_status_dps = res.data.MasterCodes;
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
    async getSetting(){
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<MasterModel.MasterCode>(
          `/api/master-types/tree/AAS/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.resposne_status_setting = res.data;
         
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
