import axios from "@/helpers/axios";
import { MenuModel } from "~/models";

export const useMenuStore = defineStore("menu", {
  state() {
    return {
       
      user_id: "", 
      respone_menu_data: null as MenuModel.MainMenu | null,
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
        const res = await axios.get<MenuModel.MenuRespons>(`/api/users/${users_code}/sidebar/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        if (res.status === 200) {
          this.respone_menu_data = res.data;
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        this.isloading = false;
      }
    }
  }
});