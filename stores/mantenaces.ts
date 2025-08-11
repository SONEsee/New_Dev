import axios from "@/helpers/axios";

export const useMentenance = defineStore("mantanance", {
  state() {
    return {
      isLoading: false,
      form_creat_mantenance: {
        audit_year: new Date().getFullYear(),
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
        photos_attached: "",
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
        // Prepare form data for submission
        const formData = { ...this.form_creat_mantenance };
        
        // Convert empty strings to appropriate values
        Object.keys(formData).forEach((key: string) => {
          const typedKey = key as keyof typeof formData;
          if (formData[typedKey] === "") {
            // For numeric fields, set to 0 or null
            if (['audit_year', 'book_value', 'estimated_value', 'depreciation_rate', 
                 'accumulated_depreciation', 'remaining_useful_life'].includes(key)) {
              (formData as any)[typedKey] = formData[typedKey] === "" ? 0 : Number(formData[typedKey]);
            }
          }
        });

        const req = await axios.post(
          `/api/AnnualAssetAudit/`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (req.status === 201) {
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ບັນທຶກຂໍ້ມູນການບຳລຸງຮັກສາສຳເລັດແລ້ວ",
            timer: 2000,
            showConfirmButton: false,
          });
          
          // Reset form after successful submission
          this.resetForm();
        }
      } catch (error: any) {
        console.error("API Error:", error);
        CallSwal({
          title: "Error",
          text: `ເກີດຂໍ້ຜິດພາດ: ${error.response?.data?.message || error.message}`,
          icon: "error",
        });
      } finally {
        this.isLoading = false;
      }
    },

    resetForm() {
      Object.keys(this.form_creat_mantenance).forEach((key: string) => {
        const typedKey = key as keyof typeof this.form_creat_mantenance;
        if (key === 'audit_year') {
          (this.form_creat_mantenance as any)[typedKey] = new Date().getFullYear();
        } else if (typeof this.form_creat_mantenance[typedKey] === 'number') {
          (this.form_creat_mantenance as any)[typedKey] = 0;
        } else {
          (this.form_creat_mantenance as any)[typedKey] = "";
        }
      });
    },

    // Optional: Get existing maintenance records
    async getMaintanceList(params = {}) {
      this.isLoading = true;
      try {
        const req = await axios.get(`/api/AnnualAssetAudit/`, {
          params,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return req.data;
      } catch (error: any) {
        console.error("Error fetching maintenance list:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Optional: Update existing maintenance record
    async updateMaintenance(id: number | string, data: any) {
      this.isLoading = true;
      try {
        const req = await axios.put(
          `http://192.168.45.54:8000/api/AnnualAssetAudit/${id}/`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        if (req.status === 200) {
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ອັບເດດຂໍ້ມູນສຳເລັດແລ້ວ",
            timer: 2000,
            showConfirmButton: false,
          });
        }
        
        return req.data;
      } catch (error: any) {
        console.error("Update Error:", error);
        CallSwal({
          title: "Error",
          text: `ເກີດຂໍ້ຜິດພາດ: ${error.response?.data?.message || error.message}`,
          icon: "error",
        });
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  },
});