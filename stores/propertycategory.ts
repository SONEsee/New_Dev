import axios from "@/helpers/axios";
import { PropertyTypeModel } from "~/models";

export const propertyStore = defineStore("propertycategory", {
  state() {
    return {
      respons_data_property_category:
        null as PropertyTypeModel.PropertyType | null,
      isloading: false,
      respons_detail_property_category:
        null as PropertyTypeModel.PropertyType | null,
      form_creat_property_category: {
        type_code: "",
        type_name: "",
        description: "",
      },
      
      form_update_property_category: {
        type_id: "" as string | number,
        type_code: "",
        type_name: "",
        description: "",
      },
    };
  },
  actions: {
    async GetPropertyCategoryById() {
      this.isloading = true;
      try {
        const res = await axios.get<PropertyTypeModel.PropertyType>(
          `property`,
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
      } finally {
        this.isloading = false;
      }
    },

    async CreatePropertyType() {
      this.isloading = true;
      try {
        const res = await axios.post<PropertyTypeModel.PropertyType>(
          `property`,
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
            text: "ສໍາເລັດການເພີ່ມປະເພດຊັບສິນ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/property/propertytype");
          }, 1500);
        }
      } catch (error) {
        console.error("Error creating property type:", error);
      } finally {
        this.isloading = false;
      }
    },

    async GetPropertyDetail(id: string) {
      this.isloading = true;
      try {
        const res = await axios.get<PropertyTypeModel.PropertyType>(
          `property/${id}`,
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
      } finally {
        this.isloading = false;
      }
    },

    
    async UpdatePropertyType(id: string) {
      this.isloading = true;
      try {
        const res = await axios.put<PropertyTypeModel.PropertyType>(
          `property/${id}`,
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
          setTimeout(() => {
            goPath("/property/propertytype");
          }, 1500);
          
        
          this.form_update_property_category = {
            type_id: "" as string | number,
            type_code: "",
            type_name: "",
            description: "",
          };
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
          text: "ທ່ານຕອ້ງການລົບຂໍ້ມູນນີ້ແທ້ບໍ...?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ແນ່ໃຈ",
          cancelButtonText: "ຍົກເລີກ",
        });if(notification.isConfirmed) {
          const res = await axios.delete(`property/${id}`, {
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
         
          await this.GetPropertyCategoryById();
        }}
        
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
  },
});