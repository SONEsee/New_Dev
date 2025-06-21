import axios from "@/helpers/axios";
import { AccountsModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const accountMethodStore = defineStore("accountMethod", {
  state() {
    return {
      response_account_method_data: null as AccountsModel.AccountMethod | null,
      response_account_method_list: null as AccountsModel.AccountMethod[] | null,
      response_account_method_detail: null as AccountsModel.AccountMethod | null,
      response_accounts: null as any[] | null,
      response_assets: null as any[] | null,
      isLoading: false,
      form_create_account_method: {
        ref_id: null as number | null,
        acc_type: "" as 'ASSET' | 'DEPRECIATION' | 'DISPOSAL' | "",
        asset_id: null as number | null,
        debit_account_id: "",
        credit_account_id: "",
        amount: 0,
        transaction_date: null as Date | null,
        description: "",
        journal_entry_id: "",
        record_stat: "O" as 'C' | 'O',
      },
      form_update_account_method: {
        mapping_id: "" as string | number,
        ref_id: null as number | null,
        acc_type: "" as 'ASSET' | 'DEPRECIATION' | 'DISPOSAL' | "",
        asset_id: null as number | null,
        debit_account_id: "",
        credit_account_id: "",
        amount: 0,
        transaction_date: null as Date | null,
        description: "",
        journal_entry_id: "",
        record_stat: "O" as 'C' | 'O',
      },
    };
  },
  actions: {
    
    async GetAccountMethodList() {
      this.isLoading = true;
      try {
        const res = await axios.get<AccountsModel.AccountMethod[]>(
          `account-methods`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_account_method_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching account method list:", error);
      } finally {
        this.isLoading = false;
      }
    },

    
    async GetAccounts() {
      this.isLoading = true;
      try {
        const res = await axios.get(`accounts`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_accounts = res.data;
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        this.isLoading = false;
      }
    },

    
    async GetAssets() {
      this.isLoading = true;
      try {
        const res = await axios.get(`fa-assets`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_assets = res.data;
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        this.isLoading = false;
      }
    },

 
    async GetAccountMethodDetail(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get<AccountsModel.AccountMethod>(
          `account-methods/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_account_method_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching account method detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

   
    async CreateAccountMethod() {
      this.isLoading = true;
      try {
        const res = await axios.post<AccountsModel.AccountMethod>(
          `account-methods`,
          this.form_create_account_method,
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
            text: "ສຳເລັດການເພີ່ມວິທີການບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/account-methods");
          }, 1500);

         
          this.resetCreateForm();
        }
      } catch (error) {
        console.error("Error creating account method:", error);
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

    
    async UpdateAccountMethod(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.put<AccountsModel.AccountMethod>(
          `account-methods/${id}`,
          this.form_update_account_method,
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
            text: "ສຳເລັດການແກ້ໄຂວິທີການບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/account-methods");
          }, 1500);

         
          this.resetUpdateForm();
        }
      } catch (error) {
        console.error("Error updating account method:", error);
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

   
    async DeleteAccountMethod(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`account-methods/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບວິທີການບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          
          await this.GetAccountMethodList();
        }
      } catch (error) {
        console.error("Error deleting account method:", error);
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


    async UpdateAccountMethodStatus(id: string, status: 'C' | 'O') {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `account-methods/${id}/status`,
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
          // Refresh list
          await this.GetAccountMethodList();
        }
      } catch (error) {
        console.error("Error updating account method status:", error);
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

   
    async GenerateJournalEntry(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.post(
          `account-methods/${id}/generate-journal`,
          {},
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
            text: "ສຳເລັດການສ້າງ Journal Entry",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
         
          await this.GetAccountMethodDetail(id);
        }
      } catch (error) {
        console.error("Error generating journal entry:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການສ້າງ Journal Entry",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

   
    resetCreateForm() {
      this.form_create_account_method = {
        ref_id: null,
        acc_type: "",
        asset_id: null,
        debit_account_id: "",
        credit_account_id: "",
        amount: 0,
        transaction_date: null,
        description: "",
        journal_entry_id: "",
        record_stat: "O",
      };
    },

    
    resetUpdateForm() {
      this.form_update_account_method = {
        mapping_id: "",
        ref_id: null,
        acc_type: "",
        asset_id: null,
        debit_account_id: "",
        credit_account_id: "",
        amount: 0,
        transaction_date: null,
        description: "",
        journal_entry_id: "",
        record_stat: "O",
      };
    },
  },

  getters: {
   
    accountMethodsByType: (state) => {
      if (!state.response_account_method_list) return {};
      
      return state.response_account_method_list.reduce((acc, method) => {
        if (!acc[method.acc_type]) {
          acc[method.acc_type] = [];
        }
        acc[method.acc_type].push(method);
        return acc;
      }, {} as Record<string, AccountsModel.AccountMethod[]>);
    },

   
    accountMethodsByStatus: (state) => {
      if (!state.response_account_method_list) return {};
      
      return state.response_account_method_list.reduce((acc, method) => {
        if (!acc[method.record_stat]) {
          acc[method.record_stat] = [];
        }
        acc[method.record_stat].push(method);
        return acc;
      }, {} as Record<string, AccountsModel.AccountMethod[]>);
    },

  
    activeAccountMethods: (state) => {
      if (!state.response_account_method_list) return [];
      return state.response_account_method_list.filter(method => method.record_stat === 'O');
    },

   
    accountMethodsWithJournal: (state) => {
      if (!state.response_account_method_list) return [];
      return state.response_account_method_list.filter(method => method.journal_entry_id);
    },


    accountMethodsWithoutJournal: (state) => {
      if (!state.response_account_method_list) return [];
      return state.response_account_method_list.filter(method => !method.journal_entry_id);
    },

  
    totalAmountByType: (state) => {
      if (!state.response_account_method_list) return {};
      
      return state.response_account_method_list.reduce((acc, method) => {
        if (!acc[method.acc_type]) {
          acc[method.acc_type] = 0;
        }
        acc[method.acc_type] += method.amount;
        return acc;
      }, {} as Record<string, number>);
    },

 
    totalAmount: (state) => {
      if (!state.response_account_method_list) return 0;
      return state.response_account_method_list.reduce((sum, method) => sum + method.amount, 0);
    },

  
    assetRelatedMethods: (state) => {
      if (!state.response_account_method_list) return [];
      return state.response_account_method_list.filter(method => method.asset_id);
    },
  },
});