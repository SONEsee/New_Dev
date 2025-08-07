import axios from "@/helpers/axios";
export const useMentenance = defineStore("mantanance", {
  state() {
    return {
      isLoading: false,
      form_creat_mantenance: {
        audit_year: 0,
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
    async createMantenance() {
      this.isLoading = true;
      try {
        const req = await axios.post(``, this.form_creat_mantenance, {
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
        }
      } catch (error: any) {
        CallSwal({
          title: "Error",
          text: `ເກີດຂໍ້ຜິດພາດ${error.message}`,
          icon: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
});
