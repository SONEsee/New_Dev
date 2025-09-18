import { jernalModel } from "@/models";
import axios from "@/helpers/axios";
export const useJournalStor = defineStore("journal", {
  state() {
    return {
      isLoading: false,
      error: null as string | null,
      response_journal_list: null as jernalModel.jurnalResponse | null,
    };
  },
  actions: {
    async getJurnallist() {
      this.isLoading = true;
      try {
        const res = await axios.get<jernalModel.jurnalResponse>(
          `/api/jrnl-logs-with-asset`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_journal_list = res.data;
        }
      } catch (error) {
        CallSwal({
          title: "ເກີດຂໍ້ຜິດພາດ",
          text: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້",
          icon: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async getJurnallDispal() {
      this.isLoading = true;
      try {
        const res = await axios.get<jernalModel.jurnalResponse>(
          `/api/jrnl-logs-with-dps/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_journal_list = res.data;
        }
      } catch (error) {
        CallSwal({
          title: "ເກີດຂໍ້ຜິດພາດ",
          text: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້",
          icon: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
});
