import axios from "@/helpers/axios";
import { FaAssetModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const faAssetStore = defineStore("faAsset", {
  state() {
    return {
      response_fa_asset_data: null as FaAssetModel.FaAsset | null,
      response_fa_asset_list: null as FaAssetModel.FaAsset[] | null,
      response_fa_asset_detail: null as FaAssetModel.FaAsset | null,
      response_asset_charts: null as any[] | null,
      response_locations: null as any[] | null,
      response_suppliers: null as any[] | null,
      isLoading: false,
      form_create_fa_asset: {
        asset_type_id: null as number | null,
        asset_serial_no: "",
        asset_list_code: "",
        asset_tag: "",
        asset_location_id: null as number | null,
        asset_spec: "",
        asset_date: null as Date | null,
        asset_currency: "LAK",
        asset_value: 0,
        warranty_end_date: null as Date | null,
        supplier_id: null as number | null,
        dpca_type: "",
        dpca_percentage: null as number | null,
        asset_useful_life: null as number | null,
        asset_salvage_value: 0,
        dpca_start_date: null as Date | null,
        dpca_end_date: null as Date | null,
        asset_accu_dpca_value: 0,
        asset_value_remain: 0,
        asset_latest_date_dpca: null as Date | null,
        asset_disposal_date: null as Date | null,
        asset_ac_yesno: "N" as "Y" | "N",
        asset_ac_date: null as Date | null,
        asset_ac_datetime: null as Date | null,
        aaset_ac_by: null as string | null,

        asset_status: "ACTIVE" as
          | "ACTIVE"
          | "INACTIVE"
          | "MAINTENANCE"
          | "DISPOSED",
        has_depreciation: "Y" as "Y" | "N",
      },
      form_update_fa_asset: {
        id: "" as string | number,
        asset_type_id: null as number | null,
        asset_serial_no: "",
        asset_list_code: "",
        asset_tag: "",
        asset_location_id: null as number | null,
        asset_spec: "",
        asset_date: null as Date | null,
        asset_currency: "LAK",
        asset_value: 0,
        warranty_end_date: null as Date | null,
        supplier_id: null as number | null,
        dpca_type: "",
        dpca_percentage: null as number | null,
        asset_useful_life: null as number | null,
        asset_salvage_value: 0,
        dpca_start_date: null as Date | null,
        dpca_end_date: null as Date | null,
        asset_accu_dpca_value: 0,
        asset_value_remain: 0,
        asset_latest_date_dpca: null as Date | null,
        asset_disposal_date: null as Date | null,
        asset_ac_yesno: "N" as "Y" | "N",
        asset_ac_date: null as Date | null,
        asset_ac_datetime: null as Date | null,
        aaset_ac_by: null as string | null,

        asset_status: "ACTIVE" as
          | "ACTIVE"
          | "INACTIVE"
          | "MAINTENANCE"
          | "DISPOSED",
        has_depreciation: "Y" as "Y" | "N",
      },
    };
  },
  actions: {
    async GetFaAssetList() {
      this.isLoading = true;
      try {
        const res = await axios.get<FaAssetModel.FaAsset[]>(
          `/api/asset_list/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_fa_asset_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching fa asset list:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetAssetCharts() {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/asset_charts/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_asset_charts = res.data;
        }
      } catch (error) {
        console.error("Error fetching asset charts:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetLocations() {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/locations/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_locations = res.data;
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetSuppliers() {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/suppliers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_suppliers = res.data;
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetFaAssetDetail(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get<FaAssetModel.FaAsset>(
          `/api/asset_list/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_fa_asset_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching fa asset detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async CreateFaAsset() {
      this.isLoading = true;
      try {
        const formData = {
          ...this.form_create_fa_asset,

          asset_date: this.form_create_fa_asset.asset_date
            ? new Date(this.form_create_fa_asset.asset_date)
                .toISOString()
                .split("T")[0]
            : null,
            asset_type_id: this.form_create_fa_asset.asset_type_id || null,
          warranty_end_date: this.form_create_fa_asset.warranty_end_date
            ? new Date(this.form_create_fa_asset.warranty_end_date)
                .toISOString()
                .split("T")[0]
            : null,
            asset_list_code: this.form_create_fa_asset.asset_list_code || "",
          dpca_start_date: this.form_create_fa_asset.dpca_start_date
            ? new Date(this.form_create_fa_asset.dpca_start_date)
                .toISOString()
                .split("T")[0]
            : null,
          dpca_end_date: this.form_create_fa_asset.dpca_end_date
            ? new Date(this.form_create_fa_asset.dpca_end_date)
                .toISOString()
                .split("T")[0]
            : null,
          asset_latest_date_dpca: this.form_create_fa_asset
            .asset_latest_date_dpca
            ? new Date(this.form_create_fa_asset.asset_latest_date_dpca)
                .toISOString()
                .split("T")[0]
            : null,
          asset_disposal_date: this.form_create_fa_asset.asset_disposal_date
            ? new Date(this.form_create_fa_asset.asset_disposal_date)
                .toISOString()
                .split("T")[0]
            : null,
          asset_ac_date: this.form_create_fa_asset.asset_ac_date
            ? new Date(this.form_create_fa_asset.asset_ac_date)
                .toISOString()
                .split("T")[0]
            : null,
          asset_ac_datetime: this.form_create_fa_asset.asset_ac_datetime
            ? new Date(
                this.form_create_fa_asset.asset_ac_datetime
              ).toISOString()
            : null,

          dpca_type: this.form_create_fa_asset.dpca_type || null,
          aaset_ac_by: this.form_create_fa_asset.aaset_ac_by || null,
        };

        console.log("Sending data:", formData);

        const res = await axios.post<FaAssetModel.FaAsset>(
          `/api/asset_list/`,
          formData,
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
            text: "ສຳເລັດການເພີ່ມຊັບສົມບັດ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/fa-assets");
          }, 1500);

          this.resetCreateForm();
        }
      } catch (error: any) {
        console.error("Error creating fa asset:", error);
        console.error("Error details:", error.response?.data); // Additional error info
        CallSwal({
          title: "ຜິດພາດ",
          text: error.response?.data?.message || "ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

    async UpdateFaAsset(id: string) {
      this.isLoading = true;
      try {
        const formData = {
          ...this.form_update_fa_asset,
          asset_date: this.form_update_fa_asset.asset_date
            ? new Date(this.form_update_fa_asset.asset_date)
                .toISOString()
                .split("T")[0]
            : null,
            asset_type_id: this.form_update_fa_asset.asset_type_id || null,
          warranty_end_date: this.form_update_fa_asset.warranty_end_date
            ? new Date(this.form_update_fa_asset.warranty_end_date)
                .toISOString()
                .split("T")[0]
            : null,
          dpca_start_date: this.form_update_fa_asset.dpca_start_date
            ? new Date(this.form_update_fa_asset.dpca_start_date)
                .toISOString()
                .split("T")[0]
            : null,
          dpca_end_date: this.form_update_fa_asset.dpca_end_date
            ? new Date(this.form_update_fa_asset.dpca_end_date)
                .toISOString()
                .split("T")[0]
            : null,
          asset_latest_date_dpca: this.form_update_fa_asset
            .asset_latest_date_dpca
            ? new Date(this.form_update_fa_asset.asset_latest_date_dpca)
                .toISOString()
                .split("T")[0]
            : null,
          asset_disposal_date: this.form_update_fa_asset.asset_disposal_date
            ? new Date(this.form_update_fa_asset.asset_disposal_date)
                .toISOString()
                .split("T")[0]
            : null,
          asset_ac_date: this.form_update_fa_asset.asset_ac_date
            ? new Date(this.form_update_fa_asset.asset_ac_date)
                .toISOString()
                .split("T")[0]
            : null,
            asset_list_code: this.form_update_fa_asset.asset_list_code || "",

          asset_ac_datetime: this.form_update_fa_asset.asset_ac_datetime
            ? new Date(
                this.form_update_fa_asset.asset_ac_datetime
              ).toISOString()
            : null,

          dpca_type: this.form_update_fa_asset.dpca_type || null,
          aaset_ac_by: this.form_update_fa_asset.aaset_ac_by || null,
        };

        const res = await axios.put<FaAssetModel.FaAsset>(
          `/api/asset_list/${id}/`,
          formData,
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
            text: "ສຳເລັດການແກ້ໄຂຊັບສົມບັດ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/fa-assets");
          }, 1500);

          this.resetUpdateForm();
        }
      } catch (error: any) {
        console.error("Error updating fa asset:", error);
        console.error("Error details:", error.response?.data);
        CallSwal({
          title: "ຜິດພາດ",
          text: error.response?.data?.message || "ມີຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

    async DeleteFaAsset(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`/api/asset_list/${id}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 204 || res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບຊັບສົມບັດ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });

          await this.GetFaAssetList();
        }
      } catch (error) {
        console.error("Error deleting fa asset:", error);
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

    async UpdateAssetStatus(
      id: string,
      status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "DISPOSED"
    ) {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `/api/asset_list/${id}/status`,
          { asset_status: status },
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

          await this.GetFaAssetList();
        }
      } catch (error) {
        console.error("Error updating asset status:", error);
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

    async CalculateDepreciation(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.post(
          `/api/asset_list/${id}/depreciation`,
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
            text: "ສຳເລັດການຄິດເສື່ອມລາຄາ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          await this.GetFaAssetList();
        }
      } catch (error) {
        console.error("Error calculating depreciation:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການຄິດເສື່ອມລາຄາ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Load data for form
    async LoadFormData(assetId: string) {
      this.isLoading = true;
      try {
        await this.GetFaAssetDetail(assetId);
        if (this.response_fa_asset_detail) {
          const asset = this.response_fa_asset_detail;
          this.form_update_fa_asset = {
           
            asset_serial_no: asset.asset_serial_no,
            asset_tag: asset.asset_tag,
            asset_type_id: asset.asset_type_id,
            asset_location_id: asset.asset_location_id,
            asset_spec: asset.asset_spec,
            asset_date: asset.asset_date,
            asset_currency: asset.asset_currency,
            asset_value: asset.asset_value,
            warranty_end_date: asset.warranty_end_date,
            supplier_id: asset.supplier_id,
            dpca_type: asset.dpca_type,
            dpca_percentage: asset.dpca_percentage,
            asset_useful_life: asset.asset_useful_life,
            asset_salvage_value: asset.asset_salvage_value,
            dpca_start_date: asset.dpca_start_date,
            dpca_end_date: asset.dpca_end_date,
            asset_accu_dpca_value: asset.asset_accu_dpca_value,
            asset_value_remain: asset.asset_value_remain,
            asset_latest_date_dpca: asset.asset_latest_date_dpca,
            asset_disposal_date: asset.asset_disposal_date,
            asset_ac_yesno: asset.asset_ac_yesno,
            asset_ac_date: asset.asset_ac_date,
            asset_ac_datetime: asset.asset_ac_datetime,
            aaset_ac_by: asset.aaset_ac_by,
            asset_list_code: asset.asset_list_code || "",
            asset_status: asset.asset_status || "ACTIVE",
            has_depreciation: asset.has_depreciation || "Y",
          };
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    resetCreateForm() {
      this.form_create_fa_asset = {
        asset_serial_no: "",
        asset_tag: "",
        asset_location_id: null,
        asset_spec: "",
        asset_date: null,
        asset_currency: "LAK",
        asset_value: 0,
        warranty_end_date: null,
        supplier_id: null,
        dpca_type: "",
        dpca_percentage: null,
        asset_useful_life: null,
        asset_salvage_value: 0,
        dpca_start_date: null,
        dpca_end_date: null,
        asset_accu_dpca_value: 0,
        asset_value_remain: 0,
        asset_latest_date_dpca: null,
        asset_disposal_date: null,
        asset_ac_yesno: "N",
        asset_ac_date: null,
        asset_ac_datetime: null,
        aaset_ac_by: null,
        asset_list_code: "",
        asset_status: "ACTIVE",
        has_depreciation: "Y",
      };
    },

    resetUpdateForm() {
      this.form_update_fa_asset = {
        id: "",
        asset_serial_no: "",
        asset_tag: "",
        asset_location_id: null,
        asset_spec: "",
        asset_date: null,
        asset_currency: "LAK",
        asset_value: 0,
        warranty_end_date: null,
        supplier_id: null,
        dpca_type: "",
        dpca_percentage: null,
        asset_useful_life: null,
        asset_salvage_value: 0,
        dpca_start_date: null,
        dpca_end_date: null,
        asset_accu_dpca_value: 0,
        asset_value_remain: 0,
        asset_latest_date_dpca: null,
        asset_disposal_date: null,
        asset_ac_yesno: "N",
        asset_ac_date: null,
        asset_ac_datetime: null,
        aaset_ac_by: null,
        // ເພີ່ມຂໍ້ມູນທີ່ຂາດ
        asset_status: "ACTIVE",
        has_depreciation: "Y",
      };
    },
  },

  getters: {
    assetsByStatus: (state) => {
      if (!state.response_fa_asset_list) return {};

      return state.response_fa_asset_list.reduce((acc, asset) => {
        if (!acc[asset.asset_status]) {
          acc[asset.asset_status] = [];
        }
        acc[asset.asset_status].push(asset);
        return acc;
      }, {} as Record<string, FaAssetModel.FaAsset[]>);
    },

    assetsNeedingMaintenance: (state) => {
      if (!state.response_fa_asset_list) return [];
      return state.response_fa_asset_list.filter(
        (asset) => asset.asset_status === "MAINTENANCE"
      );
    },

    assetsWithExpiredWarranty: (state) => {
      if (!state.response_fa_asset_list) return [];
      const today = new Date();
      return state.response_fa_asset_list.filter(
        (asset) =>
          asset.warranty_end_date && new Date(asset.warranty_end_date) < today
      );
    },

    totalAssetValue: (state) => {
      if (!state.response_fa_asset_list) return 0;
      return state.response_fa_asset_list.reduce(
        (sum, asset) => sum + (asset.asset_value || 0),
        0
      );
    },

    totalAccumulatedDepreciation: (state) => {
      if (!state.response_fa_asset_list) return 0;
      return state.response_fa_asset_list.reduce(
        (sum, asset) => sum + (asset.asset_accu_dpca_value || 0),
        0
      );
    },

    totalRemainingValue: (state) => {
      if (!state.response_fa_asset_list) return 0;
      return state.response_fa_asset_list.reduce(
        (sum, asset) => sum + (asset.asset_value_remain || 0),
        0
      );
    },

    assetsNeedingDepreciation: (state) => {
      if (!state.response_fa_asset_list) return [];
      const today = new Date();
      return state.response_fa_asset_list.filter((asset) => {
        if (!asset.dpca_start_date || !asset.dpca_end_date) return false;
        const startDate = new Date(asset.dpca_start_date);
        const endDate = new Date(asset.dpca_end_date);
        return startDate <= today && today <= endDate;
      });
    },

    assetsByLocation: (state) => {
      if (!state.response_fa_asset_list) return {};

      return state.response_fa_asset_list.reduce((acc, asset) => {
        const locationId = asset.asset_location_id || "unknown";
        if (!acc[locationId]) {
          acc[locationId] = [];
        }
        acc[locationId].push(asset);
        return acc;
      }, {} as Record<string | number, FaAssetModel.FaAsset[]>);
    },

    assetsBySupplier: (state) => {
      if (!state.response_fa_asset_list) return {};

      return state.response_fa_asset_list.reduce((acc, asset) => {
        const supplierId = asset.supplier_id || "unknown";
        if (!acc[supplierId]) {
          acc[supplierId] = [];
        }
        acc[supplierId].push(asset);
        return acc;
      }, {} as Record<string | number, FaAssetModel.FaAsset[]>);
    },
  },
});
