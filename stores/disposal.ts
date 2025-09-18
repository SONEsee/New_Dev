import { Reject } from './../.nuxt/components.d';
import axios from "@/helpers/axios";
import { ReportDispalso } from "~/models";
export const useDispoalStore = defineStore("disposal", {
  state() {
    return {
      approve_disposal: {
        asset_list_ids: [] as string[],
        action: "approve",
      },
      reject_disposal: {
        asset_list_ids: [] as string[],
        action: "reject",
      },
      fiter_data_disposal: {
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
        disposal_value: "",
        disposal_proceeds: "",
        disposal_cost: "",
        gain_loss: "",
        asset_list_code: "",
        dps_account: "",
        buyer_name: null,
        disposal_reason: null,
        disposal_ac_yesno: null,
        disposal_ac_date: null,
        disposal_ac_datetime: null,
        disposal_ac_by: null,
        gain_loss_account: "",
        account_tupe_of_play: "",
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
            params: {
              ...this.fiter_data_disposal.query,
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
      } finally {
        this.isLoading = false;
      }
    },
    async approveDisposal() {
      this.isLoading = true;
      try {
        const notificaton = await CallSwal({
          icon: "warning",
          title: "ຢືນຢັນ",
          text: "ທ່ານຕ້ອງການອະນຸມັດ ຫຼື ບໍ່?",
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ຍົກເລີກ",
        });if(notificaton.isConfirmed){
           const req = await axios.post(
          `/api/asset_list_diposal/bulk-approve-journals/`,
          this.approve_disposal,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );if(req.status === 200 || req.status === 201){
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ອະນຸມັດຊັບສົມບັດສໍາເລັດແລ້ວ",
            timer: 1500,
            showCancelButton: false,
            showConfirmButton: false,
          });setTimeout(() => {
            goPath("/property/dispalso/approve")
          }, 1000);;
        }
        }
        // const req = await axios.post(
        //   `/api/asset_list_diposal/bulk-approve-journals/`,
        //   this.approve_disposal,
        //   {
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: `Bearer ${localStorage.getItem("token")}`,
        //     },
        //   }
        // );if(req.status === 200 || req.status === 201){
        //   CallSwal({
        //     icon: "success",
        //     title: "ສຳເລັດ",
        //     text: "ອະນຸມັດຊັບສົມບັດສໍາເລັດແລ້ວ",
        //     timer: 1500,
        //     showCancelButton: false,
        //     showConfirmButton: false,
        //   });
        // }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ເກີດຂໍ້ຜິດພາດ",
          text: `ບໍ່ສາມາດອະນຸມັດໄດ້ເພາະວ່າ: ${error}`,
        });
      } finally {
        this.isLoading = false;
      }
    },
    async RejectDisposal() {
      this.isLoading = true;
      try {
        const req = await axios.post(
          `/api/asset_list_diposal/bulk-approve-journals/`,
          this.reject_disposal,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );if(req.status === 200 || req.status === 201){
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ອະນຸມັດຊັບສົມບັດສໍາເລັດແລ້ວ",
            timer: 1500,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ເກີດຂໍ້ຜິດພາດ",
          text: `ບໍ່ສາມາດອະນຸມັດໄດ້ເພາະວ່າ: ${error}`,
        });
      } finally {
        this.isLoading = false;
      }
    },
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
