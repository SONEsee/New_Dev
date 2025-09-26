import axios from "@/helpers/axios";
import { DrepecitionUpdateModel } from "~/models";
export const useDrepecitoinUpdat = defineStore("update_drepecatoin", {
  state() {
    return {
      response_data_drepecation_lis: null as DrepecitionUpdateModel.Data | null,
      isLoading: false,
      filter_data_drepection: {
        query: {
          action: "get_monthly_due",
        },
        isLoading: false,
      },
    };
  },
  actions: {
    async getDataDrepecation() {
      this.isLoading = true;
      try {
        const res = await axios.get<DrepecitionUpdateModel.DreprecitionRespons>(
          `/api/depreciation-with-journal/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
            params:{
                ...this.filter_data_drepection.query
            }
          }
        );if(res.status === 200){
            this.response_data_drepecation_lis = res.data.data
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜິດພາດ",
          text: `ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້ເນນືອງຈາກ ${error}`,
        });
      }
    },
  },
});
