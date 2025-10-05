import { jernalModel, JurnarlResponsModel } from "@/models";
import axios from "@/helpers/axios";
export const useJournalStor = defineStore("journal", {
  state() {
    return {
      isLoading: false,
      error: null as string | null,
      response_journal_list: null as jernalModel.jurnalResponse | null,
      response_journal_approve_depreciation:
        null as JurnarlResponsModel.Result | null,
      response_journal_approve_count:
        null as JurnarlResponsModel.Summary | null,
      filter_data_journal: {
        querys: {
          show_all: "true",
          Auth_Status: "U",
          delete_stat__ne: "D",
          ordering: "-Maker_DT_Stamp",
          module_id: "",
          Ccy_cd: null,
          

          fin_cycle: "",
        },
        isLoading: false,
      },
    };
  },
  actions: {
    async getDataJurnal() {
      this.isLoading = true;
      try {
        const res = await axios.get<JurnarlResponsModel.JurnarlRespons>(
          `/api/journal-log-ard/init-data/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              ...this.filter_data_journal.querys,
            },
          }
        );
        if (res.status === 200) {
          this.response_journal_approve_depreciation = res.data.results;
          this.response_journal_approve_count = res.data.summary;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ເກີດຂໍ້ຜິດພາດ",
          text: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້ jurnal ໄດ້",
        });
      }
    },
    async getDataCount() {
      this.isLoading = true;
      try {
        const res = await axios.get<JurnarlResponsModel.JurnarlRespons>(
          `/api/journal-log-ard/init-data/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
              ...this.filter_data_journal.querys,
            },
          }
        );
        if (res.status === 200) {
          this.response_journal_approve_count = res.data.summary;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ເກີດຂໍ້ຜິດພາດ",
          text: "ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້ jurnal ໄດ້",
        });
      }
    },

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
