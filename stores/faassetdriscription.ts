import { AssetListDrisTionModel } from "~/models/";
import axios from "@/helpers/axios";

export const useFassetLidtDescription = defineStore("fassetlistdecription", {
  state() {
    return {
      requres_data_post: {
  action: "bulk_process",
  mapping_ids: []
},
      response_data_get_overdue:
        null as AssetListDrisTionModel.ArrearsDeptriptoinRespons | null,
      respons_data_driscription_main:
        null as AssetListDrisTionModel.FaAssetListDistcritionRespons | null,
      isLoading: false,
      resposne_data_driscription:
        null as AssetListDrisTionModel.ListFaDeptriptoinRespons | null,
      respons_data_calculated:
        null as AssetListDrisTionModel.DepreciationRespons | null,
      getdata: {
        action: "get_monthly_due",
      },
      postdata: {
        action: "bulk_process_all",
      },
      filter_data_assetlist: {
        assetlist: {
          asset_list_id: "",
        },
        isLoading: false,
      },
      fillter_data_aldm_month_id: {
        aldm_month_id: {
          aldm_month_id: 0,
        },
        isLoading: false,
      },
      response_history_data:
        null as AssetListDrisTionModel.HistoryFaDeptriptoinRespons | null,
        filter_data_arrea:{
          arrea:{
            action:"get_overdue"
          },
          isLoading:false,
        }
    };
  },
  actions: {
    async postArreat() {
  this.isLoading = true;
  try {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: "ທ່ານຕ້ອງການຫັກຄ່າເສື່ອມຫຼາຍລາຍການທີ່ເລືອກນີ້ແທ້ບໍ",
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      const req = await axios.post(`/api/depreciation/`, this.requres_data_post, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}` 
        }
      });
      
      if (req.status === 200) {
        CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ທ່ານສຳເລັດການຫັກຄ່າເສື່ອມແລ້ວ",
          timer: 1000,
        });
        this.getArrears()
        
       
        this.getArrears();
      }
    }
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ລົ້ມເຫຼວ",
      text: "ບໍ່ສາມາດຫັກຄ່າເສື່ອມໄດ້"
    });
  } finally {
    this.isLoading = false; // ປິດ loading ໃນທຸກກໍລະນີ
  }
},
    async getArrears() {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/overdue/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer${localStorage.getItem("access")}`,
          },
          params:{
            ...this.filter_data_arrea.arrea
          }
        });
        if (res.status === 200) {
          this.response_data_get_overdue = res.data
        }
      } catch (error) {
        console.log(error);
        CallSwal({
          icon: "error",
          title: "ຜຶດພາດ",
          text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async getDataFilter() {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/asset_list_dpca_main/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          params: {
            ...this.fillter_data_aldm_month_id.aldm_month_id,
          },
        });
        if (res.status === 200) {
          this.respons_data_driscription_main = res.data;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜຶດພາດ",
          text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async getDataHistory() {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/asset_list_dpca_inmain/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (res.status === 200) {
          this.response_history_data = res.data;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜິດພາດ",
          text: "ບໍ່ສາມາດດືງຂໍ້ມູນຳໄດ້",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async getData() {
      this.isLoading = true;
      try {
        const res = await axios.get(`api/asset_list_dpca/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (res.status === 200) {
          this.resposne_data_driscription = res.data;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜຶດພາດ",
          text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້",
        });
      } finally {
      }
    },
    async getDetailDataMain() {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/asset_list_dpca_main/`, {
          params: {
            ...this.filter_data_assetlist.assetlist,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (res.status === 200) {
          this.respons_data_driscription_main = res.data;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜຶດພາດ",
          text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້",
        });
        console.error("ຂໍ້ຜີດພາດ", error);
      }
    },
    async getMainData() {
      this.isLoading = true;
      try {
        const res =
          await axios.get<AssetListDrisTionModel.FaAssetListDistcritionRespons>(
            `/api/asset_list_dpca_main/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access")}`,
              },
            }
          );

        if (res.status === 200) {
          this.respons_data_driscription_main = res.data;
        }
      } catch (error) {
        console.error("Error fetching main data:", error);
        CallSwal({
          icon: "error",
          title: "ຜິດພາດ",
          text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້.",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async getdataCalculated() {
      this.isLoading = true;
      try {
        const res =
          await axios.post<AssetListDrisTionModel.DepreciationRespons>(
            `/api/depreciation/`,
            this.getdata,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        if (res.status === 200) {
          this.respons_data_calculated = res.data;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async Caculater() {
      this.isLoading = true;
      try {
        const res =
          await axios.post<AssetListDrisTionModel.DepreciationRespons>(
            `/api/depreciation/`,
            this.postdata,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        if (res.status === 200) {
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ທ່ານໄດ້ສຳເລັດການຫັກຄ່າຫຼູຍຫຽ້ນແລ້ວ",
            timer: 1000,
          });
          setTimeout(() => {
            goPath(`/property/faassetdetription/`);
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
