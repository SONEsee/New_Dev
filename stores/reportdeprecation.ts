import axios from "@/helpers/axios";
import { ReportDeprecationModel } from "~/models";
export const useReportDeprecationStore = defineStore("reportdeprecation", {
  state() {
    return {
      response_group_data: null as ReportDeprecationModel.Datum | null,
      from_filter_group: {
        asset_list_id: null,
        asset_type_id: null,
        asset_status: null,
        division_id: null,
        start_date: "",
        end_date: "",
        group_by: "asset",
      } as ReportDeprecationModel.FilterReportDeprecation,
      respons_data_hukhalouyhian: null as ReportDeprecationModel.Datum | null,
      from_filter_hukhalouyhian: {
        asset_list_id_id: null,
        asset_type_id: null,
        asset_status: null,
        start_date: "",
        end_date: "",
      },
      isLoading: false,
      response_data_report_deprecation:
        null as ReportDeprecationModel.Datum | null,
      form_filter_report_deprecaton: {
        asset_type_id: null,
        asset_status: null,
        start_date: "",
        end_date: "",
      } as ReportDeprecationModel.FilterReportDeprecation,
    };
  },
  actions: {
    async getGroupData() {
      this.isLoading = true;
      try {
        const res =
          await axios.get<ReportDeprecationModel.GroupDeprecationRespons>(
            `/api/asset-depreciation-report`,
            {
              params: {
                ...this.from_filter_group,
              },
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        if (res.status === 200) {
          this.response_group_data = res.data.data;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜຶດພາດ",
          text: "ບໍ່ສາມາດດືງຊໍ້ມູນໄດ້",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async getReportDeprecation() {
      this.isLoading = true;
      try {
        const req =
          await axios.get<ReportDeprecationModel.ReportDeprecationRespons>(
            `/api/assets`,

            {
              params: {
                ...this.form_filter_report_deprecaton,
              },
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        if (req.status === 200) {
          this.response_data_report_deprecation = req.data.data;
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
    async getHukhalouyhian() {
      this.isLoading = true;
      try {
        const req =
          await axios.post<ReportDeprecationModel.HukhaLouyHianRespons>(
            `/api/assets/depreciation/`,
            this.from_filter_hukhalouyhian,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        if (req.status === 200) {
          this.respons_data_hukhalouyhian = req.data.data;
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜຶດພາດ",
          text: "ບໍ່ສາມາດດືງຊໍ້ມູນໄດ້",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
});
