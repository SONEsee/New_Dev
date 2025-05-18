import axios from "@/helpers/axios";
import { ModuleModel } from "@/models";
export const ModulesStore = defineStore("module", {
  state() {
    return {
      create_form_module: {
        module_name_la: "",
        module_name_en: "",
        module_icon: "",
        module_order: "",
        is_active: "",
        created_by: "",
      },
      response_data_module: null as ModuleModel.ModuleResponsItems[] | null,
      respons_detail_module: null as ModuleModel.ModuleDetailRespons| null,
      isLoading: false,
    };
  },
  actions: {
    async getModule() {
      this.isLoading = true;
      try {
        const res = await axios.get<ModuleModel.ModuleResponsItems[]>(
          `api/modules/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_data_module = res.data;
        }
      } catch (error) {
        console.error("Error fetching module data:", error);
      }
    },
    async getModuleDetail(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.get<ModuleModel.ModuleDetailRespons>(
          `api/modules/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_detail_module = res.data;
        }
      } catch (error) {
        console.error("Error fetching module detail:", error);
      }
    },
  },
});
