import axios from "@/helpers/axios";
import { TansectionTypeModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const transactionTypeStore = defineStore("transactionType", {
  state() {
    return {
      response_transaction_type_data: null as TansectionTypeModel.TansectionTypeModel | null,
      response_transaction_type_list: null as TansectionTypeModel.TansectionTypeModel[] | null,
      response_transaction_type_detail: null as TansectionTypeModel.TansectionTypeModel | null,
      isLoading: false,
      form_create_transaction_type: {
        tranNameL: "",
        tranNameE: "",
        description: "",
      },
      form_update_transaction_type: {
        tranID: "" as string | number,
        tranNameL: "",
        tranNameE: "",
        description: "",
      },
    };
  },
  actions: {
   
    async GetTransactionTypeList() {
      this.isLoading = true;
      try {
        const res = await axios.get<TansectionTypeModel.TansectionTypeModel[]>(
          `transaction-type`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_transaction_type_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching transaction type list:", error);
      } finally {
        this.isLoading = false;
      }
    },

   
    async GetTransactionTypeDetail(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get<TansectionTypeModel.TansectionTypeModel>(
          `transaction-type/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_transaction_type_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching transaction type detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

   
    async CreateTransactionType() {
      this.isLoading = true;
      try {
        const res = await axios.post<TansectionTypeModel.TansectionTypeModel>(
          `transaction-type`,
          this.form_create_transaction_type,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200 || res.status === 201) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການເພີ່ມປະເພດທຸລະກຳ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/transaction-type");
          }, 1500);

        
          this.form_create_transaction_type = {
            tranNameL: "",
            tranNameE: "",
            description: "",
          };
        }
      } catch (error) {
        console.error("Error creating transaction type:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

   
    async UpdateTransactionType(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.put<TansectionTypeModel.TansectionTypeModel>(
          `transaction-type/${id}`,
          this.form_update_transaction_type,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການແກ້ໄຂປະເພດທຸລະກຳ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/transaction-type");
          }, 1500);

       
          this.form_update_transaction_type = {
            tranID: "" as string | number,
            tranNameL: "",
            tranNameE: "",
            description: "",
          };
        }
      } catch (error) {
        console.error("Error updating transaction type:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

  
    async DeleteTransactionType(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`transaction-type/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບປະເພດທຸລະກຳ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          
          await this.GetTransactionTypeList();
        }
      } catch (error) {
        console.error("Error deleting transaction type:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

    
    async UpdateTransactionTypeStatus(id: string, status: string) {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `transaction-type/${id}/status`,
          { record_stat: status },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການອັບເດດສະຖານະ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
         
          await this.GetTransactionTypeList();
        }
      } catch (error) {
        console.error("Error updating transaction type status:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
});