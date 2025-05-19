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
        module_Id: "",
      },
      update_form_module: {
        module_name_la: "",
        module_name_en: "",
        module_icon: "",
        module_order: "",
        is_active: "",
        created_by: "",
        module_Id: "",
      },
      response_data_module: null as ModuleModel.ModuleResponsItems[] | null,
      respons_detail_module: null as ModuleModel.ModuleDetailRespons | null,
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
    async createModule() {
      this.isLoading = true;
      try {
        const res = await axios.post<ModuleModel.ModuleResponsItems>(
          `api/modules/`,
          this.create_form_module,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 201) {
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ສໍາເລັດ",
          });
        }
      } catch (error) {
        console.error("Error creating module:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async updateModule(id: string) {
      this.isLoading = true;
      try {
        const notification = await CallSwal({
          icon: "warning",
          title: "ຄຳເຕືອນ",
          text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນທ່ານແນ່ໃຈແລ້ວບໍ່?`,
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ຍົກເລີກ",
        });
        if (notification.isConfirmed) {
          let req = {
            module_name_la: this.update_form_module.module_name_la,
            module_name_en: this.update_form_module.module_name_en,
            module_icon: this.update_form_module.module_icon,
            module_order: this.update_form_module.module_order,
            is_active: this.update_form_module.is_active,
            created_by: this.update_form_module.created_by,
            module_Id: this.update_form_module.module_Id,
          };
          const res = await axios.put<ModuleModel.ModuleResponsItems>(
            `api/modules/${id}/`,
            req,
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
              text: "ການແກ້ໄຂສຳເລັດ",
            });

            goPath("/module");
          }
        }
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜິດພາດ",
          text: "ການແກ້ໄຂບໍ່ສຳເລັດ",
        });
      }
    },
    async deleteModule(id: string) {
      this.isLoading = true;
      try {
        if(!id){
          CallSwal({
            icon: "error",
            title: "ຜິດພາດ",
            text: "ກະລຸນາເລືອກ ID ທີ່ຈະລຶບ",
          });
          return;
        }
        const notification = await CallSwal({
          icon: "warning",
          title: "ຄຳເຕືອນ",
          text: `ທ່ານກຳລັງລຶບຂໍ້ມູນ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ຍົກເລີກ",
        });
        if (notification.isConfirmed) {
          const res = await axios.delete(
            `api/modules/${id}/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (res.status === 204) {
            CallSwal({
              icon: "success",
              title: "ສຳເລັດ",
              text: "ການລຶບສຳເລັດ",
            });
            
          }
        }
      } catch (error) {

        CallSwal({
          icon: "error",
          title: "ຜິດພາດ",
          text: "ການລຶບບໍ່ສຳເລັດ",
        });
      }
  },
}
});
