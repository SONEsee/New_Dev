import axios from "@/helpers/axios";
import { MantananceModel } from "@/models";
export const useMentenance = defineStore("mantanance", {
  state() {
    return {
      fiter_asset_list: {
        fiter: {
          asset_list_id: "",
        },
        isLoading: false,
      },
      response_data_mantanacelist:
        null as MantananceModel.MantananceDataRespons | null,
      isLoading: false,
      form_creat_mantenance: {
        audit_year: Date(),
        audit_period: "",
        asset_list_id: "",
        audit_date: "",
        auditor_name: "",
        department_id: "",
        physical_status: "",
        condition_status: "",
        location_verified: "",
        actual_location: "",
        book_value: "",
        estimated_value: "",
        depreciation_rate: "",
        accumulated_depreciation: "",
        remaining_useful_life: "",
        serial_number_verified: "",
        tag_number_verified: "",
        insurance_coverage: "",
        maintenance_required: "",
        replacement_recommended: "",
        disposal_recommended: "",
        audit_findings: "",
        recommendations: "",
        photos_attached:"",
        documents_verified: "",
        follow_up_required: "",
        follow_up_date: "",
        audit_status: "",
        reviewer_name: "",
        review_date: "",
        approver_name: "",
        approval_date: "",
        remarks: "",
      },
    };
  },
  actions: {
    async getDataTotal() {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/asset_audit/`, {
          params: {
            ...this.fiter_asset_list.fiter,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_data_mantanacelist = res.data;
        }
      } catch (error: any) {
        console.error("Error fetching total data:", error);
        CallSwal({
          title: "Error",
          text: `ເກີດຂໍ້ຜິດພາດ: ${error.message}`,
          icon: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async createMantenance(cleanedData = null) {
      this.isLoading = true;
      try {
        const dataToSend = cleanedData || this.form_creat_mantenance;

        console.log("Sending to API:", dataToSend);

        const req = await axios.post(`/api/asset_audit/`, dataToSend, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (req.status === 201) {
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ສຳເລັດການບຳລຸງຮັກສາ",
            timer: 2000,
            showConfirmButton: false,
          });

          this.resetForm();
        }
      } catch (error: any) {
        console.error("API Error Details:", error.response?.data);

        CallSwal({
          title: "Error",
          text: `ເກີດຂໍ້ຜິດພາດ: ${
            error.response?.data?.detail || error.message
          }`,
          icon: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },

    resetForm() {
      this.form_creat_mantenance = {
        audit_year: new Date().getFullYear(),
        audit_period: "",
        asset_list_id: "",
        audit_date: "",
        auditor_name: "",
        department_id: "",
        physical_status: "",
        condition_status: "",
        location_verified: "N",
        actual_location: "",
        book_value: "",
        estimated_value: "",
        depreciation_rate: "",
        accumulated_depreciation: "",
        remaining_useful_life: "",
        serial_number_verified: "N",
        tag_number_verified: "N",
        insurance_coverage: "N",
        maintenance_required: "N",
        replacement_recommended: "N",
        disposal_recommended: "N",
        audit_findings: "",
        recommendations: "",
        // photos_attached: "",
        documents_verified: "N",
        follow_up_required: "N",
        follow_up_date: "",
        audit_status: "DRAFT",
        reviewer_name: "",
        review_date: "",
        approver_name: "",
        approval_date: "",
        remarks: "",
      };
    },
  },
});
