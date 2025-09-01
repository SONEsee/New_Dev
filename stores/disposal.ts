import axios from "@/helpers/axios";
import { ReportDispalso } from "~/models";
export const useDispoalStore = defineStore("disposal", {
  state() {
    return {
       fiter_data_disposal:{
                query: {
                    disposal_type: "",
                    gain_loss: "",
                    asset_list_id: "",
                },
                isloading: false,
                error: null as string | null,
            },
      respons_data_dispalso: null as ReportDispalso.DisposalRespons | null,
      isLoading: false,
      from_create_disposal: {
        asset_list_id: null,
        disposal_date: null,
        disposal_type: null,
        disposal_by: null,
        disposal_purpose: null,
        disposal_value: null,
        disposal_proceeds: null,
        disposal_cost: null,
        gain_loss: null,
        buyer_name: null,
        disposal_reason: null,
        disposal_ac_yesno: null,
        disposal_ac_date: null,
        disposal_ac_datetime: null,
        disposal_ac_by: null,
      },
    };
  },
  actions: {
    async CreateDispalso() {
      this.isLoading = true;
      try {
        const req = await axios.post(
          `/api/asset_list_diposal/`,
          this.from_create_disposal,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (req.status === 200 || req.status === 201) {
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ສະສາງຊັບສົມບັດສໍາເລັດແລ້ວ",
            timer: 1500,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      } catch (error: any) {
        CallSwal({
          title: "ເກີດຂໍ້ຜິດພາດ",
          icon: "error",
          text: "ບໍ່ສາມາດສ້າງຂໍ້ມູນໄດ້" + error.message,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async getDispalso() {
      this.isLoading = true;
      try {
        const res = await axios.get<ReportDispalso.DisposalRespons>(
          `/api/asset_list_diposal/`,
          {
            params:{
              ...this.fiter_data_disposal.query
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_data_dispalso = res.data;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ເກີດຂໍ້ຜິດພາດ",
          text: `ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້ ${error}`,
        });
    }finally {
        this.isLoading = false;
    }
    }
    // async getDispalso(){
    //   this.isLoading = true;
    //   try {
    //     const res = await axios.get<ReportDispalso.DisposalRespons>(`/api/asset_list_diposal/`,{
    //        headers: {
    //           "Content-Type": "application/json",
    //           Authorization: `Bearer ${localStorage.getItem("token")}`,
    //         },
    //     });if(res.status===200){
    //       this.respons_data_dispalso = res.data
    //     }
    //   } catch (error) {
    //     CallSwal({
    //       icon:"error",
    //       title:"ເກີດຂໍ້ຜິດພາດ",
    //       text:`ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້ ${error}`
    //     })
    //   }finally{
    //     this.isLoading = false;
    //   }
    // }
  },
});
