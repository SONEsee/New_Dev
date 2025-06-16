import axios from "@/helpers/axios";
import { PropertyTypeModel } from "~/models";
export const propertyStore = defineStore("propertycategory", {
  state() {
    return {
      respons_data_property_category:
        null as PropertyTypeModel.PropertyType | null,
      isloading: false,
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
        );if(res.status === 200) {
          this.respons_data_property_category = res.data;
        }
      } catch (error) {
        console.error("Error fetching property category by ID:", error);
      } finally {
        this.isloading = false;
      }
    },
  },
});
