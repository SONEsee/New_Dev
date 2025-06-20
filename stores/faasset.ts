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
        asset_id: null as number | null,
        asset_serial_no: "",
        asset_tag: "",
        asset_location_id: null as number | null,
        asset_spec: "",
        asset_date: null as Date | null,
        asset_currency: "LAK",
        asset_value: 0,
        asset_status: "ACTIVE" as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DISPOSED',
        warranty_end_date: null as Date | null,
        supplier_id: null as number | null,
        has_depreciation: "Y" as 'Y' | 'N',
        dpca_type: null as 'Straight-line' | 'Declining' | 'ProductionUnit' | null,
        dpca_percentage: null as number | null,
        asset_useful_life: null as number | null,
        asset_salvage_value: 0,
        dpca_start_date: null as Date | null,
        dpca_end_date: null as Date | null,
      },
      form_update_fa_asset: {
        id: "" as string | number,
        asset_id: null as number | null,
        asset_serial_no: "",
        asset_tag: "",
        asset_location_id: null as number | null,
        asset_spec: "",
        asset_date: null as Date | null,
        asset_currency: "LAK",
        asset_value: 0,
        asset_status: "ACTIVE" as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DISPOSED',
        warranty_end_date: null as Date | null,
        supplier_id: null as number | null,
        has_depreciation: "Y" as 'Y' | 'N',
        dpca_type: null as 'Straight-line' | 'Declining' | 'ProductionUnit' | null,
        dpca_percentage: null as number | null,
        asset_useful_life: null as number | null,
        asset_salvage_value: 0,
        dpca_start_date: null as Date | null,
        dpca_end_date: null as Date | null,
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
        const res = await axios.get(`/api/asset_list/`, {
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
        const res = await axios.get(`/api/asset_list/`, {
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
        const res = await axios.get(`fa-suppliers`, {
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
          `fa-assets/${id}`,
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
        const res = await axios.post<FaAssetModel.FaAsset>(
          `/api/asset_list/`,
          this.form_create_fa_asset,
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
      } catch (error) {
        console.error("Error creating fa asset:", error);
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

 
    async UpdateFaAsset(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.put<FaAssetModel.FaAsset>(
          `fa-assets/${id}`,
          this.form_update_fa_asset,
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

          // Reset form
          this.resetUpdateForm();
        }
      } catch (error) {
        console.error("Error updating fa asset:", error);
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

   
    async DeleteFaAsset(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`fa-assets/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
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

  
    async UpdateAssetStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DISPOSED') {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `fa-assets/${id}/status`,
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
          `fa-assets/${id}/depreciation`,
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

  
    resetCreateForm() {
      this.form_create_fa_asset = {
        asset_id: null,
        asset_serial_no: "",
        asset_tag: "",
        asset_location_id: null,
        asset_spec: "",
        asset_date: null,
        asset_currency: "LAK",
        asset_value: 0,
        asset_status: "ACTIVE",
        warranty_end_date: null,
        supplier_id: null,
        has_depreciation: "Y",
        dpca_type: null,
        dpca_percentage: null,
        asset_useful_life: null,
        asset_salvage_value: 0,
        dpca_start_date: null,
        dpca_end_date: null,
      };
    },

    resetUpdateForm() {
      this.form_update_fa_asset = {
        id: "" as string | number,
        asset_id: null,
        asset_serial_no: "",
        asset_tag: "",
        asset_location_id: null,
        asset_spec: "",
        asset_date: null,
        asset_currency: "LAK",
        asset_value: 0,
        asset_status: "ACTIVE",
        warranty_end_date: null,
        supplier_id: null,
        has_depreciation: "Y",
        dpca_type: null,
        dpca_percentage: null,
        asset_useful_life: null,
        asset_salvage_value: 0,
        dpca_start_date: null,
        dpca_end_date: null,
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
      return state.response_fa_asset_list.filter(asset => asset.asset_status === 'MAINTENANCE');
    },

   
    assetsWithExpiredWarranty: (state) => {
      if (!state.response_fa_asset_list) return [];
      const today = new Date();
      return state.response_fa_asset_list.filter(asset => 
        asset.warranty_end_date && new Date(asset.warranty_end_date) < today
      );
    },

  
    totalAssetValue: (state) => {
      if (!state.response_fa_asset_list) return 0;
      return state.response_fa_asset_list.reduce((sum, asset) => sum + asset.asset_value, 0);
    },

    
    totalRemainingValue: (state) => {
      if (!state.response_fa_asset_list) return 0;
      return state.response_fa_asset_list.reduce((sum, asset) => sum + asset.asset_value_remain, 0);
    },
  },
});