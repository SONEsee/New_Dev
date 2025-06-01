import axios from "@/helpers/axios";
import { MenuModel } from "~/models";


export const useMenuStore = defineStore("menu", {
  state() {
    return {
      create_form_mainmenu: {
        menu_id: "",
        menu_name_la: "",
        menu_name_en: "",
        menu_icon: "",
        menu_order: "",
        // is_active: "",
        module_Id: "",
        created_by: "",
      },
      update_form_mainmenu: {
        menu_id: "",
        menu_name_la: "",
        menu_name_en: "",
        menu_icon: "",
        menu_order: "",
        is_active: "",
        module_Id: "",
      },
      create_form_submenu: {
        sub_menu_id: "",
        sub_menu_name_la: "",
        sub_menu_name_en: "",
        sub_menu_order: "",
        sub_menu_icon: "",
        // is_active: "",
        menu_id: "",
        sub_menu_urls: "",
      },
      update_form_submenu: {
        sub_menu_id: "",
        sub_menu_name_la: "",
        sub_menu_name_en: "",
        sub_menu_order: "",
        sub_menu_icon: "",
        is_active: "",
        menu_id: "",
        sub_menu_urls: "",
      },
      create_form_function: {
        function_id: "",
        description_la: "",
        description_en: "",
        // eod_function: null,
        function_order: 0,
        is_active: "",
        // created_by: "",
        sub_menu_id: "",
      },
      update_form_function: {
        function_id: "",
        description_la: "",
        description_en: "",
        eod_function: null,
        function_order: 0,
        is_active: "",
        created_by: "",
        sub_menu_id: "",
      },
      user_id: "",
      respone_menu_data: null as MenuModel.MainMenu[] | null,
      respone_main_menu_data: null as MenuModel.MainMenu | null,
      response_main_detail_data: null as MenuModel.MainMenu | null,
      response_sub_menu_data: null as MenuModel.SubMenu | null,
      respone_sub_menu_detail_data: null as MenuModel.SubMenu | null,
      respons_function_menu_data: null as MenuModel.Function | null,
      respons_function_menu_detail_data: null as MenuModel.Function | null,
      respons_menu_id: null as MenuModel.MenuIDCountRespons | null,
      isloading: false,
      query_menu_filter: {
        data: {
          module_Id: null as string | null,
        },
        isloading: false,
      },
      query_submenu_filter: {
        data: {
          menu_id: null as string | null,
        },
        isloading: false,
      },
      query_function_filter: {
        data: {
          sub_menu_id: null as string | null,
        },
        isloading: false,
      },
    };
  },
  actions: {
    async getMenuIDCount(menu_id: string) {
this.isloading = true;
try {
  const res= await axios.get<MenuModel.MenuIDCountRespons>(`api/count-sub-menus/?menu_id=${menu_id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if(res.status ===200){
    this.respons_menu_id = res.data
  }
} catch (error) {
  console.error("Error fetching menu ID count:", error);
  
}finally{
  this.isloading = false;
}
    },
    async Getmenu(users_code: string) {
      if (!users_code) {
        console.error("Cannot fetch menu: No user code provided");
        return;
      }

      this.isloading = true;
      try {
        const res = await axios.get<MenuModel.MainMenu[]>(
          `/api/users/${users_code}/sidebar/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.status === 200) {
          this.respone_menu_data = res.data;
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        this.isloading = false;
      }
    },
    async GetMainMenu() {
      this.isloading = true;
      this.query_menu_filter.isloading = true;
      try {
        const res = await axios.get<MenuModel.MainMenu>(`/api/main-menus/`, {
          params: {
            ...this.query_menu_filter.data,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.status === 200) {
          this.respone_main_menu_data = res.data;
        }
      } catch (error) {
        console.error("Error fetching main menu:", error);
      } finally {
        this.isloading = false;
      }
    },
    async CreateMainMenu() {
      this.isloading = true;
      try {
        const req = await axios.post<MenuModel.MainMenu>(
          `api/main-menus/`,
          this.create_form_mainmenu,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (req.status === 201) {
          this.respone_main_menu_data = req.data;
          this.create_form_mainmenu = {
            menu_id: "",
            menu_name_la: "",
            menu_name_en: "",
            menu_icon: "",
            menu_order: "",
            // is_active: "",
            module_Id: "",
            created_by: "",
          };
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການສ້າງຂໍ້ມູນເມນູຫຼັກ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton:false,
          })
          setTimeout(() => {
            goPath("/menu");
          }, 1500);
        }
      } catch (error) {
        CallSwal({
          title: "ບໍ່ສຳເລັດ",
          text: "ບໍ່ສາມາດສ້າງຂໍ້ມູນເມນູ " + error,
          icon: "error",
        });
      }
    },
    async DetailMainMenu(id: string) {
      this.isloading = true;
      try {
        const res = await axios.get<MenuModel.MainMenu>(
          `/api/main-menus/${id}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_main_detail_data = res.data;
        }
      } catch (error) {
        console.error("Error fetching main menu details:", error);
      } finally {
        this.isloading = false;
      }
    },
    async UpdateMainMenu(id: string) {
      this.isloading = true;
      try {
        const notification = await CallSwal({
          title: "ຄຳເຕືອນ",
          text: "ທ່ານຕ້ອງການແກ້ໄຂຂໍ້ມູນເມນູຫຼືບໍ່?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ບໍ່ແກ້ໄຂ",
        });
        if (notification.isConfirmed) {
          let req = {
            menu_id: this.update_form_mainmenu.menu_id,
            menu_name_la: this.update_form_mainmenu.menu_name_la,
            menu_name_en: this.update_form_mainmenu.menu_name_en,
            menu_icon: this.update_form_mainmenu.menu_icon,
            menu_order: this.update_form_mainmenu.menu_order,
            is_active: this.update_form_mainmenu.is_active,
            module_Id: this.update_form_mainmenu.module_Id,
          };
          const res = await axios.put<MenuModel.MainMenu>(
            `api/main-menus/${id}/`,
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
              title: "ສຳເລັດ",
              text: "ສຳເລັດການແກ້ໄຂເມນູ",
              icon: "success",
              showCancelButton: false,
            });
            goPath("/menu");
          }
        }
      } catch (error) {
        CallSwal({
          title: "ບໍ່ສຳເລັດ",
          text: "ບໍ່ສາມາດແກ້ໄຂເມນູ " + error,
          icon: "error",
        });
      }
    },
    async DeleteMenu(id: string) {
      this.isloading = true;
      try {
        if (!id) {
          CallSwal({
            title: "ບໍ່ສຳເລັດ",
            text: "ບໍ່ມີ ID ທີ່ທ່ານຕອ້ງການລົບ",
            icon: "error",
          });
          return;
        }
        const notification = await CallSwal({
          title: "ທ່ານຕອ້ງການລົບເມນູບໍ່?",
          text: "ທ່ານຕອ້ງການລົບເມນູບໍ່?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ບໍ່ລົບ",
        });
        if (notification.isConfirmed) {
          const res = await axios.delete<MenuModel.MainMenu>(
            `/api/main-menus/${id}/`,
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
              text: "ສຳເລັດການລົບເມນູ",
              icon: "success",
              showCancelButton: false,
            });
            goPath("/menu");
          }
        }
      } catch (error) {
        console.error("Error deleting menu:", error);
      } finally {
        this.isloading = false;
      }
    },
    async GetMenuSubMenu() {
      this.isloading = true;
      this.query_submenu_filter.isloading = true;
      try {
        const res = await axios.get<MenuModel.SubMenu>(`api/sub-menus`, {
          params: {
            ...this.query_submenu_filter.data,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.response_sub_menu_data = res.data;
        }
      } catch (error) {
        console.error("Error fetching sub menu:", error);
      } finally {
        this.isloading = false;
      }
    },
    async getDetailSubMenu(id: string) {
      this.isloading = true;
      try {
        const res = await axios.get<MenuModel.SubMenu>(`api/sub-menus/${id}/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.respone_sub_menu_detail_data = res.data;
        }
      } catch (error) {
        console.error("Error fetching sub menu details:", error);
      } finally {
        this.isloading = false;
      }
    },
    async CreateSubMenu() {
      this.isloading = true;
      try {
        const req = await axios.post<MenuModel.SubMenu>(
          `api/sub-menus/`,
          this.create_form_submenu,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (req.status === 201) {
          this.response_sub_menu_data = req.data;
          this.create_form_submenu = {
            sub_menu_id: "",
            sub_menu_name_la: "",
            sub_menu_name_en: "",
            sub_menu_order: "",
            sub_menu_icon: "",
            // is_active: "",

            menu_id: "",
            sub_menu_urls: "",
          };
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການສ້າງເຂົ້າໃໝ່",
            icon: "success",
            showCancelButton: false,
          });
        }
      } catch (error) {
        CallSwal({
          title: "ບໍ່ສຳເລັດ",
          text: "ບໍ່ສາມາດແກ້ໄຂເມນູ " + error,
          icon: "error",
        });
      }
    },

    async UpdateSubMenu(id: string, data: any) {
      this.isloading = true;
      try {
        const notification = await CallSwal({
          title: "ຄຳເຕືອນ",
          text: "ທ່ານຕ້ອງການແກ້ໄຂຂໍ້ມູນເມນູຍ່ອຍຫຼືບໍ່?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ບໍ່ແກ້ໄຂ",
        });

        if (notification.isConfirmed) {
          const res = await axios.put<MenuModel.SubMenu>(
            `api/sub-menus/${id}/`,
            data,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (res.status === 200) {
            this.update_form_submenu = {
              sub_menu_id: "",
              sub_menu_name_la: "",
              sub_menu_name_en: "",
              sub_menu_order: "",
              sub_menu_icon: "",
              is_active: "",
              menu_id: "",
              sub_menu_urls: "",
            };

            CallSwal({
              title: "ສຳເລັດ",
              text: "ສຳເລັດການແກ້ໄຂເມນູຍ່ອຍ",
              icon: "success",
              showConfirmButton:false,
              showCancelButton: false,
            });
            setTimeout(() => {
              goPath("/submenu");
            }, 1500);

            return true;
          }
        }
        return false;
      } catch (error) {
        CallSwal({
          title: "ບໍ່ສຳເລັດ",
          text: "ບໍ່ສາມາດແກ້ໄຂເມນູຍ່ອຍ " + error,
          icon: "error",
        });
        return false;
      } finally {
        this.isloading = false;
      }
    },
    async DeleteSubMenu(id: string) {
      this.isloading = true;
      try {
        if (!id) {
          CallSwal({
            title: "ບໍ່ສຳເລັດ",
            text: "ບໍ່ມີ ID ທີ່ທ່ານຕອ້ງການລົບ",
            icon: "error",
          });
          return;
        }
        const notification = await CallSwal({
          title: "ທ່ານຕອ້ງການລົບເມນູບໍ່?",
          text: "ທ່ານຕອ້ງການລົບເມນູບໍ່?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ບໍ່ລົບ",
        });
        if (notification.isConfirmed) {
          const res = await axios.delete<MenuModel.MainMenu>(
            `/api/sub-menus/${id}/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (res.status === 204) {
            CallSwal({
              title: "Success",
              text: "Successfully deleted the submenu.",
              icon: "success",
              showCancelButton: false,
            });
            goPath("/submenu");
          }
        }
      } catch (error) {}
    },
    async GetFuntionMenu() {
      this.isloading = true;
      this.query_function_filter.isloading = true;
      try {
        const res = await axios.get<MenuModel.Function>(`api/functions/`, {
          params: {
            ...this.query_function_filter.data,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.respons_function_menu_data = res.data;
          console.log(this.respons_function_menu_data);
        }
      } catch (error) {
        console.error("Error fetching function menu:", error);
      } finally {
        this.isloading = false;
      }
    },
    async CreateFunctionMenu() {
      this.isloading = true;
      try {
        const req = await axios.post<MenuModel.Function>(
          `api/functions/`,
          this.create_form_function,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (req.status === 201) {
          this.respons_function_menu_data = req.data;
          this.create_form_function = {
            function_id: "",
            description_la: "",
            description_en: "",
            // eod_function: null,
            function_order: 0,
            is_active: "",
            // created_by: "",
            sub_menu_id: "",
          };
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການສ້າງເຂົ້າໃໝ່",
            icon: "success",
            showCancelButton: false,
          });
          setTimeout(() => {
            goPath("/funtion");
          }, 1500);
        }
      } catch (error) {
        CallSwal({
          title: "ບໍ່ສຳເລັດ",
          text: "ບໍ່ສາມາດແກ້ໄຂເມນູ " + error,
          icon: "error",
        });
      }
    },
    async getDetailFunctionMenu(id: string) {
      this.isloading = true;
      try {
        const res = await axios.get<MenuModel.Function>(
          `api/functions/${id}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_function_menu_detail_data = res.data;
        }
      } catch (error) {
        console.error("Error fetching function menu details:", error);
      } finally {
        this.isloading = false;
      }
    },
    async UpdateFunctionMenu(id: string) {
      this.isloading = true;
      try {
        const notification = await CallSwal({
          title: "ຄຳເຕືອນ",
          text: "ທ່ານຕ້ອງການແກ້ໄຂຂໍ້ມູນເມນູຫຼືບໍ່?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ບໍ່ແກ້ໄຂ",
        });
        if (notification.isConfirmed) {
          let req = {
            function_id: this.update_form_function.function_id,
            description_la: this.update_form_function.description_la,
            description_en: this.update_form_function.description_en,
            eod_function: null,
            function_order: this.update_form_function.function_order,
            is_active: this.update_form_function.is_active,
            created_by: "",
            sub_menu_id: this.update_form_function.sub_menu_id,
          };
          const res = await axios.put<MenuModel.Function>(
            `api/functions/${id}/`,
            req,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (res.status === 200) {
            this.create_form_function = {
              function_id: "",
              description_la: "",
              description_en: "",
              // eod_function: null,
              function_order: 0,
              is_active: "",
              // created_by: "",
              sub_menu_id: "",
            };
            CallSwal({
              title: "ສຳເລັດ",
              text: "ສຳເລັດການແກ້ໄຂເມນູ",
              icon: "success",
              showCancelButton: false,
            });
            setTimeout(() => {
              goPath("/funtion");
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Error updating function menu:", error);
      } finally {
        this.isloading = false;
      }
    },
    async DeleteFunctionMenu(id: string) {
      this.isloading = true;
      try {
        if (!id) {
          CallSwal({
            title: "ບໍ່ສຳເລັດ",
            text: "ບໍ່ມີ ID ທີ່ທ່ານຕອ້ງການລົບ",
            icon: "error",
          });
          return;
        }
        const notification = await CallSwal({
          title: "ທ່ານຕອ້ງການລົບເມນູບໍ່?",
          text: "ທ່ານຕອ້ງການລົບເມນູບໍ່?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ບໍ່ລົບ",
        });
        if (notification.isConfirmed) {
          const res = await axios.delete<MenuModel.MainMenu>(
            `/api/functions/${id}/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (res.status === 204) {
            CallSwal({
              title: "ສຳເລັດ",
              text: "ສຳເລັດການລົບຂໍ້ມູນ.",
              icon: "success",
              showCancelButton: false,
            });
            goPath("/funtion");
          }
        }
      } catch (error) {
      } finally {
        this.isloading = false;
      }
    },
  },
});
