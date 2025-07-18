import { AssetListDrisTionModel } from "~/models/";
import axios from "@/helpers/axios";

export const useFassetLidtDescription = defineStore("fassetlistdecription", {
  state() {
    return {
      respons_data_driscription_main:
        null as AssetListDrisTionModel.FaAssetListDistcritionRespons | null,
      isLoading: false,
      respons_data_calculated:
        null as AssetListDrisTionModel.DepreciationRespons | null,
      getdata: {
        action: "get_monthly_due",
      },
      postdata: {
        action: "bulk_process_all",
      },
    };
  },
  actions: {
    async getMainData() {
      this.isLoading = true;
      try {
        const res =
          await axios.get<AssetListDrisTionModel.FaAssetListDistcritionRespons>(
            `/api/asset_list_dpca_main/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access")}`,
              },
            }
          );

        if (res.status === 200) {
          this.respons_data_driscription_main = res.data;
        }
      } catch (error) {
        console.error("Error fetching main data:", error);
        CallSwal({
          icon: "error",
          title: "ຜິດພາດ",
          text: "ບໍ່ສາມາດດືງຂໍ້ມູນໄດ້.",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async getdataCalculated() {
      this.isLoading = true;
      try {
        const res =
          await axios.post<AssetListDrisTionModel.DepreciationRespons>(
            `/api/depreciation/`,
            this.getdata,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        if (res.status === 200) {
          this.respons_data_calculated = res.data;
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async Caculater() {
      this.isLoading = true;
      try {
        const res =
          await axios.post<AssetListDrisTionModel.DepreciationRespons>(
            `/api/depreciation/`,
            this.postdata,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        if (res.status === 200) {
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text:"ທ່ານໄດ້ສຳເລັດການຫັກຄ່າຫຼູຍຫຽ້ນແລ້ວ",
            timer:1000
          });setTimeout(() => {
            goPath(`/property/faassetdetription/`)
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

      } finally {
        this.isLoading = false;
      }
    },
  },
});
