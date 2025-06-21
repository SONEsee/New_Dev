import axios from "@/helpers/axios";
import { AccountModels } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const accountStore = defineStore("account", {
  state() {
    return {
      response_account_data: null as AccountModels.AccountModel | null,
      response_account_list: null as AccountModels.AccountModel[] | null,
      response_account_detail: null as AccountModels.AccountModel | null,
      response_parent_accounts: null as AccountModels.AccountModel[] | null,
      isLoading: false,
      form_create_account: {
        account_code: "",
        account_name: "",
        account_type: "",
        parent_account_id: null as number | null,
        description: "",
      },
      form_update_account: {
        account_id: "" as string | number,
        account_code: "",
        account_name: "",
        account_type: "",
        parent_account_id: null as number | null,
        description: "",
      },
    };
  },
  actions: {
    async GetAccountList() {
      this.isLoading = true;
      try {
        const res = await axios.get<AccountModels.AccountModel[]>(`account`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_account_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching account list:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetParentAccounts() {
      this.isLoading = true;
      try {
        const res = await axios.get<AccountModels.AccountModel[]>(
          `account/parents`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_parent_accounts = res.data;
        }
      } catch (error) {
        console.error("Error fetching parent accounts:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetAccountDetail(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get<AccountModels.AccountModel>(
          `account/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_account_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching account detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async CreateAccount() {
      this.isLoading = true;
      try {
        const res = await axios.post<AccountModels.AccountModel>(
          `account`,
          this.form_create_account,
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
            text: "ສຳເລັດການເພີ່ມບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/account");
          }, 1500);

          this.form_create_account = {
            account_code: "",
            account_name: "",
            account_type: "",
            parent_account_id: null,
            description: "",
          };
        }
      } catch (error) {
        console.error("Error creating account:", error);
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

    async UpdateAccount(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.put<AccountModels.AccountModel>(
          `account/${id}`,
          this.form_update_account,
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
            text: "ສຳເລັດການແກ້ໄຂບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/account");
          }, 1500);

          this.form_update_account = {
            account_id: "" as string | number,
            account_code: "",
            account_name: "",
            account_type: "",
            parent_account_id: null,
            description: "",
          };
        }
      } catch (error) {
        console.error("Error updating account:", error);
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

    async DeleteAccount(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`account/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });

          await this.GetAccountList();
        }
      } catch (error) {
        console.error("Error deleting account:", error);
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

    async UpdateAccountStatus(id: string, status: string) {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `account/${id}/status`,
          { RECORD_STAT: status },
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

          await this.GetAccountList();
        }
      } catch (error) {
        console.error("Error updating account status:", error);
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

  getters: {
    accountsByType: (state) => {
      if (!state.response_account_list) return {};

      return state.response_account_list.reduce((acc, account) => {
        if (!acc[account.account_type]) {
          acc[account.account_type] = [];
        }
        acc[account.account_type].push(account);
        return acc;
      }, {} as Record<string, AccountModels.AccountModel[]>);
    },

    mainAccounts: (state) => {
      if (!state.response_account_list) return [];
      return state.response_account_list.filter(
        (account) => !account.parent_account_id
      );
    },

    subAccounts: (state) => {
      if (!state.response_account_list) return [];
      return state.response_account_list.filter(
        (account) => account.parent_account_id
      );
    },
  },
});
