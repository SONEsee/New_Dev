import axios from "@/helpers/axios";
export const useTransactionLogStore = defineStore("transactionLog", {
  state() {
    return {
        isLodaing: false,
      creat_form_transaction_log: {
        asset_list_id: "",
        transfer_date: "",
        from_location_id: "",
        to_location_id: "",
        transfer_reason: "",
        transfer_cost: 0,
        condition_before: "",
        condition_after: "",
        transport_method: "",
        requested_by: "",
        approved_by: "",
        received_by: "",
        handover_date: "",
        received_date: "",
        status: "",
        insurance_coverage: "",
        estimated_arrival: "",
        actual_arrival: "",
        notes: "",
      },
    };
  },
  actions:{
    async CreatTransactionLog(){
this.isLodaing = true;
try {
    const req = await axios.post(`/api/transfer-logs`,this.creat_form_transaction_log,{
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });if(req.status === 201){
CallSwal({
    title: "ສຳເລັດ",
    text: "ສໍາເລັດການສ້າງບັນທຶກການໂອນ",
    icon: "success",
    showCancelButton: false,
    showConfirmButton: false,
});setTimeout(()=>{
    goPath("/property/transfer_log/");
},1500);
    }
} catch (error) {
  console.error("Error creating transaction log:", error);
CallSwal({
    title: "ບໍ່ສຳເລັດ",
    text: "ການສ້າງບັນທຶກການໂອນ ບໍ່ສຳເລັດ",
    icon: "error",
    showCancelButton: false,
    showConfirmButton: false,
    });
    
}finally {
    this.isLodaing = false;
}
    }
  }
});
