import axios from "@/helpers/axios";
import { PropertyTypeModel } from "~/models";

export const propertyStore = defineStore("propertycategory", {
  state() {
    return {
      respons_data_property_category: [] as PropertyTypeModel.PropertyType[],
      isloading: false,
      respons_detail_property_category:
        null as PropertyTypeModel.PropertyType | null,
      
      form_creat_property_category: {
        type_code: "",
        type_name_la: "",
        type_name_en: "",
        is_tangible: "",
       
      },
      
      form_update_property_category: {
        type_id: "" as string | number,
        type_code: "",
        type_name_la: "",
        type_name_en: "",
        is_tangible: "",
        
      },
    };
  },
  actions: {
    async GetPropertyCategoryById() {
      this.isloading = true;
      try {
        const res = await axios.get<PropertyTypeModel.PropertyType[]>(
          `/api/asset_types/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          
          this.respons_data_property_category = res.data;
        }
      } catch (error) {
        console.error("Error fetching property category by ID:", error);
        this.respons_data_property_category = [];
      } finally {
        this.isloading = false;
      }
    },

    async CreatePropertyType() {
      this.isloading = true;
      try {
        const res = await axios.post<PropertyTypeModel.PropertyType>(
          `/api/asset_types/`,
          this.form_creat_property_category,
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
            text: "ສຳເລັດການເພີ່ມປະເພດຊັບສິນ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          
         
          this.form_creat_property_category = {
            type_code: "",
            type_name_la: "",
            type_name_en: "",
            is_tangible: "",
           
          };
          
          setTimeout(() => {
            goPath("/property/propertytype");
          }, 1500);
        }
      } catch (error) {
        console.error("Error creating property type:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການສ້າງຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isloading = false;
      }
    },

    async GetPropertyDetail(id: number) {
      this.isloading = true;
      try {
        const res = await axios.get<PropertyTypeModel.PropertyType>(
          `/api/asset_types/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_detail_property_category = res.data;
        }
      } catch (error) {
        console.error("Error fetching property detail:", error);
        this.respons_detail_property_category = null;
      } finally {
        this.isloading = false;
      }
    },

    async UpdatePropertyType(id: number) {
      this.isloading = true;
      try {
        const res = await axios.put<PropertyTypeModel.PropertyType>(
          `/api/asset_types/${id}/`,
          this.form_update_property_category,
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
            text: "ສຳເລັດການແກ້ໄຂປະເພດຊັບສິນ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          
         
          this.form_update_property_category = {
            type_id: "" as string | number,
            type_code: "",
            type_name_la: "",
            type_name_en: "",
            is_tangible: "",
            
          };
          
          setTimeout(() => {
            goPath("/property/propertytype");
          }, 1500);
        }
      } catch (error) {
        console.error("Error updating property type:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isloading = false;
      }
    },

    async DeletePropertyType(id: string) {
      this.isloading = true;
      try {
        const notification = await CallSwal({
          title: "ກຳລັງລຶບ",
          text: "ທ່ານຕ້ອງການລົບຂໍ້ມູນນີ້ແທ້ບໍ...?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ແນ່ໃຈ",
          cancelButtonText: "ຍົກເລີກ",
        });
        
        if (notification.isConfirmed) {
          const res = await axios.delete(`/api/asset_types/${id}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          
          if (res.status === 200 || res.status === 204) {
            CallSwal({
              title: "ສຳເລັດ",
              text: "ສຳເລັດການລຶບປະເພດຊັບສິນ",
              icon: "success",
              showCancelButton: false,
              showConfirmButton: false,
            });
           
            // Refresh data after delete
            await this.GetPropertyCategoryById();
          }
        }
      } catch (error) {
        console.error("Error deleting property type:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isloading = false;
      }
    },

    // Helper method to update form data for editing
    setUpdateForm(data: PropertyTypeModel.PropertyType) {
      this.form_update_property_category = {
        type_id: data.type_id || "",
        type_code: data.type_code || "",
        type_name_la: data.type_name_la || "",
        type_name_en: data.type_name_en || "",
        is_tangible: data.is_tangible || "",
        
      };
    },
  },
});