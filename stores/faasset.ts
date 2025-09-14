import axios from "@/helpers/axios";
import { FaAssetModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const faAssetStore = defineStore("faAsset", {
  state() {
    return {
      filter_data_assetlist_id:{
        filter:{
          asset_type_id:"",
          Auth_Status:"U",
          asset_status:""
        },
        isLoading:false,
      },
      filter_data_assetlist_id1:{
        filter:{
          asset_type_id:"",
          Auth_Status:"",
          asset_status:"",
          useful_life_status:""
        },
        isLoading:false,
      },
      response_fa_asset_data: null as FaAssetModel.FaAsset | null,
      response_fa_asset_list: null as FaAssetModel.FaAsset[] | null,
      response_fa_asset_detail: null as FaAssetModel.FaAsset | null,
      response_asset_charts: null as any[] | null,
      response_locations: null as any[] | null,
      response_suppliers: null as any[] | null,
      isLoading: false,

      form_create_realizthe_property: {
        asset_value_remainBegin: "",
        asset_value_remainLast: "",
        accu_dpca_value_total: 0,
        asset_value_remain: 0,
        asset_accu_dpca_value: 0 as number | null,
        dpca_start_date: null as Date | null,
        dpca_end_date: null as Date | null | string,
        asset_disposal_date: null as Date | null,
        asset_latest_date_dpca: null as Date | null,
        // acc_no: "",
        asset_status: "AC",
      },
      form_create_fa_asset: {
        asset_type_id: null as number | null,
        asset_list_id: "",
        asset_value_remainMonth: 0,
        asset_value_remainBegin: 0,
        asset_value_remainLast: 0,
        type_of_pay: "",
        acc_no: "",
        asset_serial_no: "",
        MC_detail: "",
        MC_name_la: "",
        asset_list_code: "",
        asset_tag: "",
        asset_location_id: null as number | null,
        asset_spec: "",
        asset_date: null as Date | null,
        asset_currency: "LAK",
        asset_value: 0 as number | null,
        warranty_end_date: null as Date | null,
        supplier_id: null as number | null,
        dpca_type: "",
        dpca_percentage: null as number | null,
        asset_useful_life: null as number | null,
        asset_salvage_value: 0 as number | null,
        dpca_start_date: null as Date | null,
        dpca_end_date: null as Date | null | string,
        asset_accu_dpca_value: 0 as number | null,
        asset_value_remain: 0,
        asset_latest_date_dpca: null as Date | null,
        asset_disposal_date: null as Date | null,
        asset_ac_yesno: "N" as "Y" | "N",
        asset_ac_date: null as Date | null,
        asset_ac_datetime: null as Date | null,
        aaset_ac_by: null as string | null,

        asset_status: "UC" as "UC" | "AC" | "IA" | "MT" | "DS" | "DM",
        has_depreciation: "Y" as "Y" | "N",
      },
      creat_form_jornal: {
        Reference_No: "",
        Ccy_cd: "",
        Txn_code: "UNC",
        Value_date: new Date(),
        Addl_text: "",
        fin_cycle: "",
        module_id: "AS",
        Period_code: "",
        entries: [
          {
            Account: null as number | null,
            Account_no: "",
            Amount: null as number | null,
            Dr_cr: "D",
            Addl_sub_text: "",
            Ac_relatives: "",
          },
          {
            Account: null as number | null,
            Account_no: "",
            Amount: null as number | null,
            Dr_cr: "C",
            Addl_sub_text: "",
            Ac_relatives: "",
          },
        ],
      },
      filterBarcode: {
        request: {
          asset_tag: "",
        },
        isLoading: true,
      },
      form_update_fa_asset: {
        asset_spec: "",
        asset_value: 0,
        asset_currency: "",
        asset_date: "",
        supplier_id: 0,
        asset_salvage_value: 0,
        asset_useful_life: 0,
        asset_value_remainMonth: 0,
        dpca_percentage: 0,
        dpca_type: "",
        type_of_pay: "",
        asset_location_id: null as number | null,
      },
    };
  },

  actions: {
    async getDataBarcode() {
      this.filterBarcode.isLoading = true;
      this.isLoading = true;
      try {
        const res = await axios.get<FaAssetModel.FaAsset>(`/api/asset_list/`, {
          params: {
            ...this.filterBarcode.request,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_fa_asset_detail = res.data;
        }
      } catch (error: any) {
        CallSwal({
          title: "Error",
          icon: "error",
          text: error.message,
        });
      } finally {
        this.filterBarcode.isLoading = false;
        this.isLoading = false;
      }
    },
    async Update(id: string) {
      this.isLoading = true;
      try {
        const formData = {
          ...this.form_create_realizthe_property,

          asset_accu_dpca_value:
            this.form_create_realizthe_property.asset_accu_dpca_value || 0,

          dpca_start_date: this.form_create_realizthe_property.dpca_start_date
            ? new Date(this.form_create_realizthe_property.dpca_start_date)
                .toISOString()
                .split("T")[0]
            : null,
          dpca_end_date: this.form_create_realizthe_property.dpca_end_date
            ? new Date(this.form_create_realizthe_property.dpca_end_date)
                .toISOString()
                .split("T")[0]
            : null,
          asset_latest_date_dpca: this.form_create_realizthe_property
            .asset_latest_date_dpca
            ? new Date(
                this.form_create_realizthe_property.asset_latest_date_dpca
              )
                .toISOString()
                .split("T")[0]
            : null,
          asset_disposal_date: this.form_create_realizthe_property
            .asset_disposal_date
            ? new Date(this.form_create_realizthe_property.asset_disposal_date)
                .toISOString()
                .split("T")[0]
            : null,

          // acc_no: this.form_create_realizthe_property.acc_no || "",
          asset_value_remainLast:
            this.form_create_realizthe_property.asset_value_remainLast || "",
          asset_value_remainBegin:
            this.form_create_realizthe_property.asset_value_remainBegin || "",

          asset_value_remain:
            this.form_create_realizthe_property.accu_dpca_value_total || 0,

          accu_dpca_value_total:
            this.form_create_realizthe_property.accu_dpca_value_total || 0,
        };

        const res = await axios.patch<FaAssetModel.FaAsset>(
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
            goPath("/property/realizetheproperty");
          }, 1500);
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
    async CreateJournal(showSuccessMessage = false) {
      this.isLoading = true;
      try {
        const formData = {
          ...this.creat_form_jornal,
          Value_date: new Date().toISOString(),
          entries: this.creat_form_jornal.entries.map((entry) => ({
            ...entry,
            Account: entry.Account || null,
            Amount: entry.Amount || 0,
          })),
        };

        console.log("Sending journal data:", formData);

        const res = await axios.post(`/api/process-journal/`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.status === 200 || res.status === 201) {
          if (showSuccessMessage) {
            CallSwal({
              title: "ສຳເລັດ",
              text: "ສຳເລັດການສ້າງ Journal Entry",
              icon: "success",
              showCancelButton: false,
              showConfirmButton: false,
            });
          }

          this.resetJournalForm();
          return res.data;
        }
      } catch (error: any) {
        console.error("Error creating journal:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: error.response?.data?.message || "ມີຂໍ້ຜິດພາດໃນການສ້າງ Journal",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async CreateJournalto(showSuccessMessage = false) {
      this.isLoading = true;
      try {
        const formData = {
          ...this.creat_form_jornal,
          // Value_date: this.creat_form_jornal.Value_date
          //   ? new Date(this.creat_form_jornal.Value_date).toISOString()
          //   : null,
          Value_date: new Date().toISOString(),
          entries: this.creat_form_jornal.entries.map((entry) => ({
            ...entry,
            Account: entry.Account || null,
            Amount: entry.Amount || 0,
            Ac_relatives: entry.Ac_relatives || "",
          })),
        };

        const res = await axios.post(`journal/process-v2/`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.status === 200 || res.status === 201) {
          if (showSuccessMessage) {
            CallSwal({
              title: "ສຳເລັດ",
              text: "ສຳເລັດການສ້າງ Journal Entry",
              icon: "success",
              showCancelButton: false,
              showConfirmButton: false,
            });
          }

          this.resetJournalForm();
          return res.data;
        }
      } catch (error: any) {
        console.error("Error creating journal:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: error.response?.data?.message || "ມີຂໍ້ຜິດພາດໃນການສ້າງ Journal",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    async CreateFaAsset(showSuccessMessage = false) {
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
          asset_list_id: this.form_create_fa_asset.asset_list_id || "",
          asset_value_remainLast:
            this.form_create_fa_asset.asset_value_remainLast || 0,
          asset_value_remainBegin:
            this.form_create_fa_asset.asset_value_remainBegin || 0,
          asset_value_remainMonth:
            this.form_create_fa_asset.asset_value_remainMonth || 0,
          acc_no: this.form_create_fa_asset.acc_no || "",
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
          if (showSuccessMessage) {
            CallSwal({
              title: "ສຳເລັດ",
              text: "ສຳເລັດການເພີ່ມຊັບສົມບັດ",
              icon: "success",
              showCancelButton: false,
              showConfirmButton: false,
            });
          }
          return res.data;
        }
      } catch (error: any) {
        console.error("Error creating fa asset:", error);
        console.error("Error details:", error.response?.data);
        CallSwal({
          title: "ຜິດພາດ",
          text: error.response?.data?.message || "ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    resetJournalForm() {
      this.creat_form_jornal = {
        Reference_No: "",
        Ccy_cd: "",
        Txn_code: "UNC",
        Value_date: new Date(),
        Addl_text: "",
        fin_cycle: "",
        module_id: "AS",
        Period_code: "",
        entries: [
          {
            Account: null,
            Account_no: "",
            Amount: null,
            Dr_cr: "D",
            Addl_sub_text: "",
            Ac_relatives: "",
          },
          {
            Account: null,
            Account_no: "",
            Amount: null,
            Dr_cr: "C",
            Addl_sub_text: "",
            Ac_relatives: "",
          },
        ],
      };
    },

    addJournalEntry() {
      this.creat_form_jornal.entries.push({
        Account: null,
        Account_no: "",
        Amount: null,
        Dr_cr: "D",
        Addl_sub_text: "",
        Ac_relatives: "",
      });
    },

    removeJournalEntry(index: number) {
      if (this.creat_form_jornal.entries.length > 2) {
        this.creat_form_jornal.entries.splice(index, 1);
      }
    },
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
    async GetFaAssetList1() {
      this.isLoading = true;
      try {
        const res = await axios.get<FaAssetModel.FaAsset[]>(
          `/api/asset_list/`,
          {
            params:{
              ...this.filter_data_assetlist_id.filter
            },
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
    async GetFaAssetList2() {
      this.isLoading = true;
      try {
        const res = await axios.get<FaAssetModel.FaAsset[]>(
          `/api/asset_list/`,
          {
            params:{
              ...this.filter_data_assetlist_id1.filter
            },
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

    // async CreateFaAsset() {
    //   this.isLoading = true;
    //   try {
    //     const formData = {
    //       ...this.form_create_fa_asset,

    //       asset_date: this.form_create_fa_asset.asset_date
    //         ? new Date(this.form_create_fa_asset.asset_date)
    //             .toISOString()
    //             .split("T")[0]
    //         : null,
    //       asset_type_id: this.form_create_fa_asset.asset_type_id || null,
    //       asset_list_id: this.form_create_fa_asset.asset_list_id || "",
    //       asset_value_remainLast:
    //         this.form_create_fa_asset.asset_value_remainLast || 0,
    //       asset_value_remainBegin:
    //         this.form_create_fa_asset.asset_value_remainBegin || 0,
    //       asset_value_remainMonth:
    //         this.form_create_fa_asset.asset_value_remainMonth || 0,
    //       acc_no: this.form_create_fa_asset.acc_no || "",
    //       warranty_end_date: this.form_create_fa_asset.warranty_end_date
    //         ? new Date(this.form_create_fa_asset.warranty_end_date)
    //             .toISOString()
    //             .split("T")[0]
    //         : null,
    //       asset_list_code: this.form_create_fa_asset.asset_list_code || "",
    //       dpca_start_date: this.form_create_fa_asset.dpca_start_date
    //         ? new Date(this.form_create_fa_asset.dpca_start_date)
    //             .toISOString()
    //             .split("T")[0]
    //         : null,
    //       dpca_end_date: this.form_create_fa_asset.dpca_end_date
    //         ? new Date(this.form_create_fa_asset.dpca_end_date)
    //             .toISOString()
    //             .split("T")[0]
    //         : null,
    //       asset_latest_date_dpca: this.form_create_fa_asset
    //         .asset_latest_date_dpca
    //         ? new Date(this.form_create_fa_asset.asset_latest_date_dpca)
    //             .toISOString()
    //             .split("T")[0]
    //         : null,
    //       asset_disposal_date: this.form_create_fa_asset.asset_disposal_date
    //         ? new Date(this.form_create_fa_asset.asset_disposal_date)
    //             .toISOString()
    //             .split("T")[0]
    //         : null,
    //       asset_ac_date: this.form_create_fa_asset.asset_ac_date
    //         ? new Date(this.form_create_fa_asset.asset_ac_date)
    //             .toISOString()
    //             .split("T")[0]
    //         : null,
    //       asset_ac_datetime: this.form_create_fa_asset.asset_ac_datetime
    //         ? new Date(
    //             this.form_create_fa_asset.asset_ac_datetime
    //           ).toISOString()
    //         : null,

    //       dpca_type: this.form_create_fa_asset.dpca_type || null,
    //       aaset_ac_by: this.form_create_fa_asset.aaset_ac_by || null,
    //     };

    //     console.log("Sending data:", formData);

    //     const res = await axios.post<FaAssetModel.FaAsset>(
    //       `/api/asset_list/`,
    //       formData,
    //       {
    //         headers: {
    //           "Content-Type": "application/json",
    //           Authorization: `Bearer ${localStorage.getItem("token")}`,
    //         },
    //       }
    //     );
    //     if (res.status === 200 || res.status === 201) {
    //       CallSwal({
    //         title: "ສຳເລັດ",
    //         text: "ສຳເລັດການເພີ່ມຊັບສົມບັດ",
    //         icon: "success",
    //         showCancelButton: false,
    //         showConfirmButton: false,
    //       });
    //       // setTimeout(() => {
    //       //   goPath("/property/faasset");
    //       // }, 1500);
    //     }
    //   } catch (error: any) {
    //     console.error("Error creating fa asset:", error);
    //     console.error("Error details:", error.response?.data);
    //     CallSwal({
    //       title: "ຜິດພາດ",
    //       text: error.response?.data?.message || "ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ",
    //       icon: "error",
    //       showCancelButton: false,
    //       confirmButtonText: "ຕົກລົງ",
    //     });
    //   } finally {
    //     this.isLoading = false;
    //   }
    // },

    async UpdateFaAsset(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.patch<FaAssetModel.FaAsset>(
          `/api/asset_list/${id}/`,
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
            goPath("/property/faasset/");
          }, 1500);
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
            timer: 1000,
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
  },
});
