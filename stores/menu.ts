import axios from "@/helpers/axios";
import { MenuModel } from "~/models";

export const useMenuStore = defineStore("menu", {
  state() {
    return {
      create_form_mainmenu: {
        memu_id: "",
        menu_name_la: "",
        menu_name_en: "",
        menu_icon: "",
        menu_order: "",
        is_active: "",
        module_Id: "",
        created_by: "",
      },
      update_form_mainmenu: {
        memu_id: "",
        menu_name_la: "",
        menu_name_en: "",
        menu_icon: "",
        menu_order: "",
        is_active: "",
        created_by: "",
        module_Id: "",
      },
      user_id: "",
      respone_menu_data: null as MenuModel.MainMenu | null,
      respone_main_menu_data: null as MenuModel.MainMenu | null,
      respone_menu_detail_data: null as MenuModel.MainMenu | null,
      isloading: false,
    };
  },
  actions: {
    async Getmenu(users_code: string) {
      if (!users_code) {
        console.error("Cannot fetch menu: No user code provided");
        return;
      }

      this.isloading = true;
      try {
        const res = await axios.get<MenuModel.MainMenu>(
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
      try {
        const res = await axios.get<MenuModel.MainMenu>(`/api/main-menus/`, {
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
    async getDetailMainMenu(id:string){
      this.isloading = true;
      try {
        const res = await axios.get<MenuModel.MainMenu>(`/api/main-menus/${id}/`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        
        }) ;
        if(res.status===200){
          this.respone_menu_detail_data = res.data
        }
      } catch (error) {
        console.error("Error fetching main menu:", error)
      }finally{
        this.isloading = false;
      }
    }
  },
});
