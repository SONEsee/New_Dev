import axios from "@/helpers/axios";
import { AccountsModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const accountMethodStore = defineStore("accountMethod", {
  state() {
    return {
      response_account_method_data:
        null as AccountsModel.AccoutMethodRespons | null,
      response_account_method_list: null as
        | AccountsModel.AccoutMethodRespons[]
        | null,
      response_account_method_detail:
        null as AccountsModel.AccoutMethodRespons | null,
      response_accounts: null as any[] | null,
      response_assets: null as any[] | null,
      isLoading: false,
      form_create_account_method: {
        mapping_id: null as number | null,
        ref_id: "" as string | null,
        acc_type: "ASSET" as "ASSET" | "DEPRECIATION" | "DISPOSAL" | "",
        asset_id:  null as number | null,
        debit_account_id: "",
        credit_account_id: "",
        amount: 0,
        amount_start: 0,
        amount_end: 0,

        transaction_date: null as Date | null,
        description: "",
        journal_entry_id: "",
        record_stat: "O" as "C" | "O",
      },
      form_update_account_method: {
        mapping_id: null as number | null,
        ref_id: "" as string | null,
        acc_type: "ASSET" as "ASSET" | "DEPRECIATION" | "DISPOSAL" | "",
        asset_id: null as number | null,
        debit_account_id: "",
        credit_account_id: "",
        amount: "",
        amount_start: "",
        amount_end: "",

        transaction_date: null as Date | string | null,
        description: "",
        journal_entry_id: "",
      },
    };
  },
  actions: {
    async GetAccountMethodList() {
      this.isLoading = true;
      try {
        const res = await axios.get<AccountsModel.AccoutMethodRespons[]>(
          `/api/asset_account/`,
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

    async GetAccountMethodDetail(id: number) {
      this.isLoading = true;
      try {
        const res = await axios.get<AccountsModel.AccoutMethodRespons>(
          `/api/asset_account/${id}`,
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
        const res = await axios.post<AccountsModel.AccoutMethodRespons>(
          `/api/asset_account/`,
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
            goPath("/property/accountmethod/");
          }, 1500);

          this.resetCreateForm();
        }
      } catch (error: any) {
        if (error.response && error.response.status === 501) {
          CallSwal({
            title: "ແຈ້ງເຕືອນ",
            text: "ເລກບັນຊີນີ້ຖືກໃຊ້ແລ້ວ, ກະລຸນາເລືອກເລກບັນຊີໃໝ່",
            icon: "warning",
            showCancelButton: false,
            confirmButtonText: "ຕົກລົງ",
          });
          return;
        }
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

    async UpdateAccountMethod(id: number) {
      this.isLoading = true;
      try {
        const res = await axios.patch<AccountsModel.AccoutMethodRespons>(
          `/api/asset_account/${id}/`,
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
            goPath("/property/accountmethod/");
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
        const res = await axios.delete(`/api/asset_account/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 204) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບວິທີການບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            this.GetAccountMethodList();
            goPath("/property/accountmethod/");
          }, 1500);
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

    async UpdateAccountMethodStatus(id: number) {
      this.isLoading = true;
      try {
        const res = await axios.post(
          `/api/asset_account/${id}/set_open/`,
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
            timer: 1000,
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
    async UpdateAccountMethodStatusof(id: number) {
      this.isLoading = true;
      try {
        const res = await axios.post(
          `/api/asset_account/${id}/set_close/`,
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
            timer: 1000,
          });
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

    // async GenerateJournalEntry(id: string) {
    //   this.isLoading = true;
    //   try {
    //     const res = await axios.post(
    //       `account-methods/${id}/generate-journal`,
    //       {},
    //       {
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: `Bearer ${localStorage.getItem("token")}`,
    //         },
    //       }
    //     );
    //     if (res.status === 200) {
    //       CallSwal({
    //         title: "ສຳເລັດ",
    //         text: "ສຳເລັດການສ້າງ Journal Entry",
    //         icon: "success",
    //         showCancelButton: false,
    //         showConfirmButton: false,
    //       });

    //     }
    //   } catch (error) {
    //     console.error("Error generating journal entry:", error);
    //     CallSwal({
    //       title: "ຜິດພາດ",
    //       text: "ມີຂໍ້ຜິດພາດໃນການສ້າງ Journal Entry",
    //       icon: "error",
    //       showCancelButton: false,
    //       confirmButtonText: "ຕົກລົງ",
    //     });
    //   } finally {
    //     this.isLoading = false;
    //   }
    // },

    resetCreateForm() {
      this.form_create_account_method = {
        mapping_id: null,
        ref_id: "",
        acc_type: "",
        asset_id: null,
        debit_account_id: "",
        credit_account_id: "",
        amount: 0,
        transaction_date: null,
        description: "",
        journal_entry_id: "",
        amount_start: 0,
        amount_end: 0,

        record_stat: "O",
      };
    },

    resetUpdateForm() {
      this.form_update_account_method = {
        mapping_id: null,
        description: "",
        ref_id: null,
        acc_type: "",
        asset_id: null,
        debit_account_id: "",
        credit_account_id: "",

        amount: "",
        transaction_date: null,
        journal_entry_id: "",
        amount_start: "",
        amount_end: "",
      };
    },
  },

  getters: {
    accountMethodsByType: (state:any) => {
      if (!state.response_account_method_list) return {};

      return state.response_account_method_list.reduce((acc:any, method:any) => {
        if (!acc[method.acc_type]) {
          acc[method.acc_type] = [];
        }
        acc[method.acc_type].push(method);
        return acc;
      }, {} as Record<string, AccountsModel.AccoutMethodRespons[]>);
    },

    accountMethodsByStatus: (state) => {
      if (!state.response_account_method_list) return {};

      return state.response_account_method_list.reduce((acc, method) => {
        if (!acc[method.Record_Status]) {
          acc[method.Record_Status] = [];
        }
        acc[method.Record_Status].push(method);
        return acc;
      }, {} as Record<string, AccountsModel.AccoutMethodRespons[]>);
    },

    activeAccountMethods: (state) => {
      if (!state.response_account_method_list) return [];
      return state.response_account_method_list.filter(
        (method) => method.Record_Status === "O"
      );
    },

    accountMethodsWithJournal: (state) => {
      if (!state.response_account_method_list) return [];
      return state.response_account_method_list.filter(
        (method) => method.journal_entry_id
      );
    },

    accountMethodsWithoutJournal: (state) => {
      if (!state.response_account_method_list) return [];
      return state.response_account_method_list.filter(
        (method) => !method.journal_entry_id
      );
    },

    // totalAmountByType: (state) => {
    //   if (!state.response_account_method_list) return {};

    //   return state.response_account_method_list.reduce((acc, method) => {
    //     if (!acc[method.acc_type]) {
    //       acc[method.acc_type] = 0;
    //     }
    //     acc[method.acc_type] += method.amount;
    //     return acc;
    //   }, {} as Record<string, number>);
    // },

    // totalAmount: (state) => {
    //   if (!state.response_account_method_list) return 0;
    //   return state.response_account_method_list.reduce((sum, method) => sum + method.amount, 0);
    // },

    assetRelatedMethods: (state) => {
      if (!state.response_account_method_list) return [];
      return state.response_account_method_list.filter(
        (method) => method.asset_id
      );
    },
  },
});
