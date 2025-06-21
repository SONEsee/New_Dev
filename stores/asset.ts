import axios from "@/helpers/axios";
import { AssetModels } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const assetStore = defineStore("asset", {
  state() {
    return {
      response_asset_data: null as AssetModels.AssetModel | null,
      response_asset_list: null as AssetModels.AssetModel[] | null,
      response_asset_detail: null as AssetModels.AssetModel | null,
      response_asset_types: null as AssetModels.AssetTypeModel[] | null,
      req_filter_asset_code:{
        query:{
            asset_code: "",
        },
        isloading: false,
      },
      isLoading: false,
      form_create_asset: {
        asset_code: "",
        asset_name_la: "",
        asset_name_en: "",
        asset_type_id: "",
        value: 0,
        location: "",
        description: "",
        start_date: "",
      },
      form_update_asset: {
        
        asset_code: "",
        asset_name_la: "",
        asset_name_en: "",
        asset_type_id: "",
       
      },
    };
  },
  actions: {
    async GetAssetList() {
      this.isLoading = true;
      try {
        const res = await axios.get<AssetModels.AssetModel[]>(`/api/chart_of_asset/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_asset_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching asset list:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetAssetTypes() {
      this.isLoading = true;
      try {
        const res = await axios.get<AssetModels.AssetTypeModel[]>(
          `/api/chart_of_asset/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_asset_types = res.data;
        }
      } catch (error) {
        console.error("Error fetching asset types:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetAssetDetail() {
      this.isLoading = true;
      try {
        const res = await axios.get<AssetModels.AssetModel>(
          `/api/chart_of_asset/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params:{
                ...this.req_filter_asset_code.query
            }
          }
        );
        if (res.status === 200) {
          this.response_asset_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching asset detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async CreateAsset() {
      this.isLoading = true;
      try {
        const res = await axios.post<AssetModels.AssetModel>(
          `/api/chart_of_asset/`,
          this.form_create_asset,
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
            text: "ສຳເລັດການເພີ່ມຊັບສິນ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/property/asset");
          }, 1500);

          this.form_create_asset = {
            asset_code: "",
            asset_name_la: "",
            asset_name_en: "",
            asset_type_id: "",
            value: 0,
            location: "",
            description: "",
            start_date: "",
          };
        }
      } catch (error) {
        console.error("Error creating asset:", error);
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

    async UpdateAsset(asset_id: string | number) {
      this.isLoading = true;
      try {
        const res = await axios.put<AssetModels.AssetModel>(
          `/api/chart_of_asset/${asset_id}/`,
          this.form_update_asset,
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
            text: "ສຳເລັດການແກ້ໄຂຊັບສິນ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/property/asset");
          }, 1500);

          this.form_update_asset = {
            
            asset_code: "",
            asset_name_la: "",
            asset_name_en: "",
            asset_type_id: "",
           
          };
        }
      } catch (error) {
        console.error("Error updating asset:", error);
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

    async DeleteAsset(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`/api/chart_of_asset/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200 || res.status === 204) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບຊັບສິນ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });

          await this.GetAssetList();
        }
      } catch (error) {
        console.error("Error deleting asset:", error);
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

    async UpdateAssetStatus(id: string, status: string) {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `/api/chart_of_asset/${id}/status`,
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

          await this.GetAssetList();
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

    async GetAssetHistory(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get(`/api/chart_of_asset/${id}/history`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          return res.data;
        }
      } catch (error) {
        console.error("Error fetching asset history:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async GetAssetMaintenance(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get(`asset/${id}/maintenance`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          return res.data;
        }
      } catch (error) {
        console.error("Error fetching asset maintenance:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async CreateAssetMaintenance(id: string, data: any) {
      this.isLoading = true;
      try {
        const res = await axios.post(`asset/${id}/maintenance`, data, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200 || res.status === 201) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການບັນທຶກການບຳລຸງຮັກສາ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          return res.data;
        }
      } catch (error) {
        console.error("Error creating asset maintenance:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການບັນທຶກການບຳລຸງຮັກສາ",
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
    assetsByType: (state) => {
      if (!state.response_asset_list) return {};

      return state.response_asset_list.reduce((acc, asset) => {
        if (!acc[asset.asset_type_id]) {
          acc[asset.asset_type_id] = [];
        }
        acc[asset.asset_type_id].push(asset);
        return acc;
      }, {} as Record<string, AssetModels.AssetModel[]>);
    },

    activeAssets: (state) => {
      if (!state.response_asset_list) return [];
      return state.response_asset_list.filter(
        (asset) => asset.Record_Status === "O"
      );
    },

    inactiveAssets: (state) => {
      if (!state.response_asset_list) return [];
      return state.response_asset_list.filter(
        (asset) => asset.Record_Status === "C"
      );
    },

    totalAssetValue: (state) => {
      if (!state.response_asset_list) return 0;
      return state.response_asset_list.reduce(
        (total, asset) => total + (asset.value || 0),
        0
      );
    },

    assetsByLocation: (state) => {
      if (!state.response_asset_list) return {};
      
      return state.response_asset_list.reduce((acc, asset) => {
        const location = asset.location || "ບໍ່ມີສະຖານທີ່";
        if (!acc[location]) {
          acc[location] = [];
        }
        acc[location].push(asset);
        return acc;
      }, {} as Record<string, AssetModels.AssetModel[]>);
    },

    assetStatistics: (state) => {
      if (!state.response_asset_list) {
        return {
          total: 0,
          active: 0,
          inactive: 0,
          totalValue: 0,
          byType: {},
        };
      }

      const total = state.response_asset_list.length;
      const active = state.response_asset_list.filter(a => a.Record_Status === "O").length;
      const inactive = state.response_asset_list.filter(a => a.Record_Status === "C").length;
      const totalValue = state.response_asset_list.reduce((sum, asset) => sum + (asset.value || 0), 0);
      
      const byType = state.response_asset_list.reduce((acc, asset) => {
        const typeId = asset.asset_type_id;
        if (!acc[typeId]) {
          acc[typeId] = { count: 0, value: 0 };
        }
        acc[typeId].count++;
        acc[typeId].value += asset.value || 0;
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      return {
        total,
        active,
        inactive,
        totalValue,
        byType,
      };
    },
  },
});