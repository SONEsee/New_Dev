import axios from "@/helpers/axios";
import { AssetTypeModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const AssetTypeStore = defineStore("AssetType", {
  state() {
    return {
      response_AssetType_data: null as AssetTypeModel.AssetType | null,
      response_AssetType_list: null as AssetTypeModel.AssetType[] | null,
      response_AssetType_detail: null as AssetTypeModel.AssetType | null,
      response_parent_AssetTypes: null as AssetTypeModel.AssetType[] | null,
      isLoading: false,
      form_create_AssetType: {
        AssetType_code: "",
        AssetType_name: "",
        AssetType_type: "",
        parent_AssetType_id: null as number | null,
        description: "",
      },
      form_update_AssetType: {
        AssetType_id: "" as string | number,
        AssetType_code: "",
        AssetType_name: "",
        AssetType_type: "",
        parent_AssetType_id: null as number | null,
        description: "",
      },
    };
  },
  actions: {
    // ດຶງລາຍການບັນຊີທັງໝົດ
    async GetAssetTypeList() {
      this.isLoading = true;
      try {
        const res = await axios.get<AssetTypeModel.AssetType[]>(
          `AssetType`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_AssetType_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching AssetType list:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // ດຶງລາຍການບັນຊີແມ່ (ສຳລັບເລືອກ parent AssetType)
    async GetParentAssetTypes() {
      this.isLoading = true;
      try {
        const res = await axios.get<AssetTypeModel.AssetType[]>(
          `AssetType/parents`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_parent_AssetTypes = res.data;
        }
      } catch (error) {
        console.error("Error fetching parent AssetTypes:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // ດຶງລາຍລະອຽດບັນຊີຕາມ ID
    async GetAssetTypeDetail(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get<AssetTypeModel.AssetType>(
          `AssetType/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_AssetType_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching AssetType detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // ສ້າງບັນຊີໃໝ່
    async CreateAssetType() {
      this.isLoading = true;
      try {
        const res = await axios.post<AssetTypeModel.AssetType>(
          `AssetType`,
          this.form_create_AssetType,
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
            text: "ສຳເລັດການເພີ່ມບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/AssetType");
          }, 1500);

          // Reset form
          this.form_create_AssetType = {
            AssetType_code: "",
            AssetType_name: "",
            AssetType_type: "",
            parent_AssetType_id: null,
            description: "",
          };
        }
      } catch (error) {
        console.error("Error creating AssetType:", error);
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

    // ອັບເດດບັນຊີ
    async UpdateAssetType(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.put<AssetTypeModel.AssetType>(
          `AssetType/${id}`,
          this.form_update_AssetType,
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
            text: "ສຳເລັດການແກ້ໄຂບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/AssetType");
          }, 1500);

          // Reset form
          this.form_update_AssetType = {
            AssetType_id: "" as string | number,
            AssetType_code: "",
            AssetType_name: "",
            AssetType_type: "",
            parent_AssetType_id: null,
            description: "",
          };
        }
      } catch (error) {
        console.error("Error updating AssetType:", error);
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

    // ລຶບບັນຊີ
    async DeleteAssetType(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`AssetType/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບບັນຊີ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          // Refresh data after delete
          await this.GetAssetTypeList();
        }
      } catch (error) {
        console.error("Error deleting AssetType:", error);
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

    // ອັບເດດສະຖານະບັນຊີ (RECORD_STAT: C-Closed, O-Open)
    async UpdateAssetTypeStatus(id: string, status: string) {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `AssetType/${id}/status`,
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
          // Refresh data
          await this.GetAssetTypeList();
        }
      } catch (error) {
        console.error("Error updating AssetType status:", error);
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
  },

  getters: {
    // ແບ່ງບັນຊີຕາມປະເພດ
    AssetTypesByType: (state) => {
      if (!state.response_AssetType_list) return {};
      
      return state.response_AssetType_list.reduce((acc, AssetType) => {
        if (!acc[AssetType.type_code]) {
          acc[AssetType.type_code] = [];
        }
        acc[AssetType.type_code].push(AssetType);
        return acc;
      }, {} as Record<string, AssetTypeModel.AssetType[]>);
    },

    // ບັນຊີຫຼັກ (ບໍ່ມີ parent)
    mainAssetTypes: (state) => {
      if (!state.response_AssetType_list) return [];
      return state.response_AssetType_list.filter(AssetType => !AssetType.type_id);
    },

    // ບັນຊີຍ່ອຍ (ມີ parent)
    subAssetTypes: (state) => {
      if (!state.response_AssetType_list) return [];
      return state.response_AssetType_list.filter(AssetType => AssetType.type_id);
    },
  },
});