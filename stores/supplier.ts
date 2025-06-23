import axios from "@/helpers/axios";
import { SupplierModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";

export const supplierStore = defineStore("supplier", {
  state() {
    return {
      response_supplier_data: null as SupplierModel.Supplier | null,
      response_supplier_list: null as SupplierModel.Supplier[] | null,
      response_supplier_detail: null as SupplierModel.Supplier | null,
      isLoading: false,
      form_create_supplier: {
        supplier_code: "",
        supplier_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
      },
      form_update_supplier: {
        supplier_id: "" as string | number,
        supplier_code: "",
        supplier_name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
      },
    };
  },
  actions: {
   
    async GetSupplierList() {
      this.isLoading = true;
      try {
        const res = await axios.get<SupplierModel.Supplier[]>(
          `/api/asset_suppliers/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_supplier_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching supplier list:", error);
      } finally {
        this.isLoading = false;
      }
    },

    
    async GetSupplierDetail(id: number) {
      this.isLoading = true;
      try {
        const res = await axios.get<SupplierModel.Supplier>(
          `/api/asset_suppliers/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_supplier_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching supplier detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

 
    async CreateSupplier() {
      this.isLoading = true;
      try {
        const res = await axios.post<SupplierModel.Supplier>(
          `/api/asset_suppliers/`,
          this.form_create_supplier,
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
            text: "ສຳເລັດການເພີ່ມຜູ້ສະໜອງ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/property/supplier");
          }, 1500);

         
          this.form_create_supplier = {
            supplier_code: "",
            supplier_name: "",
            contact_person: "",
            phone: "",
            email: "",
            address: "",
          };
        }
      } catch (error) {
        console.error("Error creating supplier:", error);
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

  
    async UpdateSupplier(id: number) {
      this.isLoading = true;
      try {
        const res = await axios.put<SupplierModel.Supplier>(
          `/api/asset_suppliers/${id}/`,
          this.form_update_supplier,
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
            text: "ສຳເລັດການແກ້ໄຂຜູ້ສະໜອງ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/property/supplier");
          }, 1500);

         
          this.form_update_supplier = {
            supplier_id: "" as string | number,
            supplier_code: "",
            supplier_name: "",
            contact_person: "",
            phone: "",
            email: "",
            address: "",
          };
        }
      } catch (error) {
        console.error("Error updating supplier:", error);
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


    async DeleteSupplier(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`/api/asset_suppliers/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200 || res.status === 204) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບຜູ້ສະໜອງ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
            timer: 1500,
          });
         
          await this.GetSupplierList();
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
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

    
    async UpdateSupplierStatus(id: string, status: string) {
      this.isLoading = true;
      try {
        const res = await axios.patch(
          `supplier/${id}/status`,
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
          
          await this.GetSupplierList();
        }
      } catch (error) {
        console.error("Error updating supplier status:", error);
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