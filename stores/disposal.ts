import axios from "@/helpers/axios";
export const useDispoalStore = defineStore("disposal", {
  state() {
    return {
      isLoading: false,
      from_create_disposal: {
        asset_list_id: "",
        disposal_date: "",
        disposal_type: "",
        disposal_by: "",
        disposal_purpose: "",
        disposal_value: "",
        disposal_proceeds: "",
        disposal_cost: "",
        gain_loss: "",
        buyer_name: "",
        disposal_reason: "",
        disposal_ac_yesno: "",
        disposal_ac_date: "",
        disposal_ac_datetime: "",
        disposal_ac_by: "",
      },
    };
  },
  actions:{
    async CreateDispalso(){
        this.isLoading = true;
        try {
            const req  = await axios.post(`/api/asset_list_diposal/` ,this.from_create_disposal,{
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });if(req.status === 200 || req.status === 201){
                CallSwal({
                    icon: "success",
                    title:"ສຳເລັດ",
                    text:"ສະສາງຊັບສົມບັດສໍາເລັດແລ້ວ",
                    timer:1500,
                    showCancelButton:false,
                    showConfirmButton:false
                })
            }
        } catch (error: any) {
            CallSwal({
                title: "ເກີດຂໍ້ຜິດພາດ",
                icon: "error",
                text: "ບໍ່ສາມາດສ້າງຂໍ້ມູນໄດ້" + error.message,
            })
        }finally{
            this.isLoading = false;
        }
    }
  }
});
