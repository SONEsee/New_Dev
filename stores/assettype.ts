import axios from "@/helpers/axios";
import { AssetTypeModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const assetTypeStore = defineStore("assetType", {
  state() {
    return {
      response_asset_type_data: null as AssetTypeModel.AssetType | null,
      response_asset_type_list: null as AssetTypeModel.AssetType[] | null,
      response_asset_type_detail: null as AssetTypeModel.AssetType | null,
      isLoading: false,
      form_create_asset_type: {
        type_code: "",
        type_name: "",
        description: "",
      },
      form_update_asset_type: {
        type_id: "" as string | number,
        type_code: "",
        type_name: "",
        description: "",
      },
    };
  },
  actions: {
   
    async GetAssetTypeList() {
      this.isLoading = true;
      try {
        const res = await axios.get<AssetTypeModel.AssetType[]>(
          `asset-type`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_asset_type_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching asset type list:", error);
      } finally {
        this.isLoading = false;
      }
    },

   
    async GetAssetTypeDetail(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get<AssetTypeModel.AssetType>(
          `asset-type/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_asset_type_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching asset type detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

   
    async CreateAssetType() {
      this.isLoading = true;
      try {
        const res = await axios.post<AssetTypeModel.AssetType>(
          `asset-type`,
          this.form_create_asset_type,
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
            text: "ສຳເລັດການເພີ່ມປະເພດຊັບສົມບັດ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/asset-type");
          }, 1500);

      
          this.form_create_asset_type = {
            type_code: "",
            type_name: "",
            description: "",
          };
        }
      } catch (error) {
        console.error("Error creating asset type:", error);
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

   
    async UpdateAssetType(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.put<AssetTypeModel.AssetType>(
          `asset-type/${id}`,
          this.form_update_asset_type,
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
            text: "ສຳເລັດການແກ້ໄຂປະເພດຊັບສົມບັດ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/asset-type");
          }, 1500);

        
          this.form_update_asset_type = {
            type_id: "" as string | number,
            type_code: "",
            type_name: "",
            description: "",
          };
        }
      } catch (error) {
        console.error("Error updating asset type:", error);
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

  
    async DeleteAssetType(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`asset-type/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບປະເພດຊັບສົມບັດ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
       
          await this.GetAssetTypeList();
        }
      } catch (error) {
        console.error("Error deleting asset type:", error);
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

    
    async UpdateAssetTypeStatus(id: string, status: string) {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `asset-type/${id}/status`,
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
        
          await this.GetAssetTypeList();
        }
      } catch (error) {
        console.error("Error updating asset type status:", error);
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
});