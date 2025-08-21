import axios from "@/helpers/axios";
import { ReportDeprecationModel } from "~/models";
export const useReportDeprecationStore = defineStore("reportdeprecation", {
  state() {
    return {
      isLoading: false,
      response_data_report_deprecation:
        null as ReportDeprecationModel.Datum | null,
      form_filter_report_deprecaton: {
        asset_type_id: null,
        asset_status:  null,
        start_date: "",
        end_date: "",
      }as ReportDeprecationModel.FilterReportDeprecation,
    };
  },
  actions: {
    async getReportDeprecation() {
      this.isLoading = true;
      try {
        const req = await axios.post<ReportDeprecationModel.ReportDeprecationRespons>(
          `/api/assets/`,
          this.form_filter_report_deprecaton,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );if(req.status ===200){
            this.response_data_report_deprecation = req.data.data
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "Error",
          text: "Failed to fetch report deprecation data.",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
});
