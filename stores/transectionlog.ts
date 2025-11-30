import axios from "@/helpers/axios";
import { TansectionTypeModel } from "~/models";
export const useTransactionLogStore = defineStore("transactionLog", {
  state() {
    return {

      isLodaing: false,
      responst_transaction_log: null as TansectionTypeModel.TansectionTypeModel | null,
      filter_asset_list:{
        query:{
          asset_list_id:"",
        },
        isLodaing_filter: false,
      },
      creat_form_transaction_log: {
        asset_list_id: "",
        transfer_date: "",
        from_location_id: "",
        to_location_id: "",
        transfer_reason: "",
        transfer_cost: null,
        condition_before: "",
        condition_after: "",
        transport_method: "",
        requested_by: "",
        approved_by: "",
        received_by: "",
        handover_date: "",
        received_date: "",
        status: "",
        insurance_covered: "", 
        estimated_arrival: "",
        actual_arrival: "",
        notes: "",
        division:"",
      },
    
    
    parseEmployeeId(employeeId:any) {
      if (!employeeId) return null;
      
    
      if (typeof employeeId === 'number') return employeeId;
      
     
      if (/^\d+$/.test(employeeId)) {
        return parseInt(employeeId);
      }
      
      
      const match = employeeId.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
      
     
      console.warn(`Cannot parse employee ID: ${employeeId}`);
      return null;
    },
    };
  },
  actions: {
    async getDatadetail(){
      this.isLodaing = true;
      try {
        const res = await axios.get<TansectionTypeModel.TansectionTypeModel>(`/api/asset_transfer/`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          params:{
            asset_list_id: this.filter_asset_list.query.asset_list_id,
          }
       
        } );if(res.status ===200){
          this.responst_transaction_log = res.data;
          
        }
      } catch (error) {
        console.error("Error fetching transaction log details:", error);
        
      }
    },
    async CreatTransactionLog() {
      this.isLodaing = true;
      
      try {
       
        const requestData = this.prepareRequestData();
        
        console.log("Sending request data:", requestData);
        
        const req = await axios.post(`/api/asset_transfer/`, requestData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (req.status === 201) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສໍາເລັດການສ້າງບັນທຶກການໂອນ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          
          setTimeout(() => {
            goBack();
          }, 1500);
        }
      } catch (error: any) {
        console.error("Error creating transaction log:", error);
        
      
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
          console.error("Response headers:", error.response.headers);
          
         
          let errorMessage = "ການສ້າງບັນທຶກການໂອນ ບໍ່ສຳເລັດ";
          if (error.response.data && typeof error.response.data === 'object') {
            errorMessage += "\n" + JSON.stringify(error.response.data, null, 2);
          }
          
          CallSwal({
            title: "ບໍ່ສຳເລັດ",
            text: errorMessage,
            icon: "error",
            showCancelButton: false,
            showConfirmButton: false,
          });
        } else {
          CallSwal({
            title: "ບໍ່ສຳເລັດ",
            text: "ການສ້າງບັນທຶກການໂອນ ບໍ່ສຳເລັດ",
            icon: "error",
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      } finally {
        this.isLodaing = false;
      }
    },
    
   
    prepareRequestData() {
      const form = this.creat_form_transaction_log;
      
     
      const cleanedData = {
        asset_list_id: form.asset_list_id || null,
        transfer_date: form.transfer_date || null,
        from_location_id: form.from_location_id ? parseInt(form.from_location_id) : null,
        to_location_id: form.to_location_id ? parseInt(form.to_location_id) : null,
        transfer_reason: form.transfer_reason || null,
        transfer_cost: form.transfer_cost ? parseFloat(form.transfer_cost) : null,
        condition_before: form.condition_before || null,
        condition_after: form.condition_after || null,
        transport_method: form.transport_method || null,
        requested_by: form.requested_by ? this.parseEmployeeId(form.requested_by) : null,
        approved_by: form.approved_by ? this.parseEmployeeId(form.approved_by) : null,
        received_by: form.received_by ? this.parseEmployeeId(form.received_by) : null,
        handover_date: form.handover_date || null,
        received_date: form.received_date || null,
        status: form.status || null,
        division:form.division || null,
        insurance_covered: form.insurance_covered || "N", 
        estimated_arrival: form.estimated_arrival || null,
        actual_arrival: form.actual_arrival || null,
        notes: form.notes || null,
        
       
        Record_Status: "C",
        Maker_Id: this.getCurrentUserId(),
      };

      
      
      return cleanedData;
    },
    
   
    getCurrentUserId() {
     
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id || user.user_id || user.emp_id || "02"; 
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
      return "02";
    },
    
   
    validateForm() {
      const form = this.creat_form_transaction_log;
      const errors = [];
      
      if (!form.asset_list_id) errors.push("ລະຫັດຊັບສິນຈຳເປັນ");
      if (!form.transfer_date) errors.push("ວັນທີ່ໂອນຍ້າຍຈຳເປັນ");
      if (!form.from_location_id) errors.push("ສະຖານທີ່ເກົ່າຈຳເປັນ");
      if (!form.to_location_id) errors.push("ສະຖານທີ່ໃໝ່ຈຳເປັນ");
      if (!form.transfer_reason) errors.push("ເຫດຜົນການໂອນຍ້າຍຈຳເປັນ");
      
      if (errors.length > 0) {
        CallSwal({
          title: "ຂໍ້ມູນບໍ່ສົມບູນ",
          text: errors.join("\n"),
          icon: "warning",
          showCancelButton: false,
          showConfirmButton: true,
        });
        return false;
      }
      
      return true;
    }
  }
});