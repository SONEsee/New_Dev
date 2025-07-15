import { AssetListDrisTionModel } from "~/models/";
import axios from "@/helpers/axios";

export const useFassetLidtDescription = defineStore("fassetlistdecription", {
  state() {
    return {
        respons_data_driscription_main: null as AssetListDrisTionModel.FaAssetListDistcritionRespons | null,
        isLoading: false ,
    };

  },
  actions:{
    async getMainData(){
        this.isLoading = true;
        try {
            const res = await axios.get<AssetListDrisTionModel.FaAssetListDistcritionRespons>(`/api/asset_list_dpca_main/`,{
                headers:{
                    "Content-Type": "application/json",                    
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                }
            });if(res.status === 200){
                this.respons_data_driscription_main = res.data;
               
            }
        } catch (error) {
            console.error("Error fetching main data:", error);
             CallSwal({
                    icon: "error",
                    title: "ຜິດພາດ",
                    text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້.",
                })
        }finally{
            this.isLoading = false;
        }
    }
  }
});
