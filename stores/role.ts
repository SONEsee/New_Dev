// stores/role.ts
import axios from "@/helpers/axios";
import { CallSwal } from "~/composables/global";
import { RoleModel, RoleDetailModel } from "~/models";

function getRoleIdFromStorage(): string {
  try {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData.role?.role_id || "";
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }
  return "";
}

export const RoleStore = defineStore("role", {
  state() {
    return {
      responst_data_detail: null as RoleDetailModel.RoleDetailResponsItem | null,
      respons_data_role: null as RoleModel.RoleListRespons | null,
      isloading: false,
      filter_role_id: {
        query: {
          role_id: getRoleIdFromStorage(),
          sub_menu_id: "",
        },
        isloading: false,
        error: null as string | null,
      },
      // NEW: Track if permissions are loaded
      permissionsLoaded: false,
      // NEW: Track last loaded parameters to detect changes
      lastLoadedParams: {
        role_id: "",
        sub_menu_id: ""
      }
    };
  },
  
  getters: {
    // NEW: Check if permissions are ready to use
    isPermissionsReady: (state) => {
      return state.permissionsLoaded && 
             state.responst_data_detail !== null && 
             !state.isloading;
    },
    
    // NEW: Get current permissions safely
    currentPermissions: (state) => {
      return state.responst_data_detail?.[0] || null;
    }
  },
  
  actions: {
    // Update role_id from localStorage
    updateRoleIdFromStorage() {
      this.filter_role_id.query.role_id = getRoleIdFromStorage();
    },
    
    // NEW: Set sub_menu_id explicitly
    setSubMenuId(subMenuId: string) {
      this.filter_role_id.query.sub_menu_id = subMenuId;
      console.log('Sub menu ID set to:', subMenuId);
    },
    
    // NEW: Check if we need to reload (parameters changed)
    needsReload(roleId?: string, subMenuId?: string): boolean {
      const currentRoleId = roleId || this.filter_role_id.query.role_id;
      const currentSubMenuId = subMenuId || this.filter_role_id.query.sub_menu_id;
      
      return this.lastLoadedParams.role_id !== currentRoleId ||
             this.lastLoadedParams.sub_menu_id !== currentSubMenuId;
    },
    
    // UPDATED: GetRoleDetail with better error handling and state tracking
    async GetRoleDetail(forceReload = false) {
      // Update role_id from localStorage
      this.updateRoleIdFromStorage();
      
      const roleId = this.filter_role_id.query.role_id;
      const subMenuId = this.filter_role_id.query.sub_menu_id;
      
      // Validate required parameters
      if (!roleId) {
        console.error('Role ID is missing');
        this.filter_role_id.error = 'ບໍ່ພົບຂໍ້ມູນ Role ID';
        return;
      }
      
      if (!subMenuId) {
        console.error('Sub Menu ID is missing');
        this.filter_role_id.error = 'ບໍ່ພົບຂໍ້ມູນ Sub Menu ID';
        return;
      }
      
      // Skip if already loaded with same params (unless forced)
      if (!forceReload && !this.needsReload()) {
        console.log('Permissions already loaded with same params, skipping...');
        return;
      }
      
      this.isloading = true;
      this.filter_role_id.isloading = true;
      this.filter_role_id.error = null;
      
      console.log('Loading role details with params:', {
        role_id: roleId,
        sub_menu_id: subMenuId
      });
      
      try {
        const res = await axios.get<RoleDetailModel.RoleDetailResponsItem>(
          `api/role-details/`,
          {
            params: {
              role_id: roleId,
              sub_menu_id: subMenuId
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        if (res.status === 200) {
          this.responst_data_detail = res.data;
          this.permissionsLoaded = true;
          
          // Update last loaded params
          this.lastLoadedParams = {
            role_id: roleId,
            sub_menu_id: subMenuId
          };
          
          console.log('Role details loaded successfully:', res.data);
        }
      } catch (error: any) {
        console.error('Error loading role details:', error);
        this.filter_role_id.error = error.response?.data?.message || 
                                    'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດສິດການນຳໃຊ້';
        this.permissionsLoaded = false;
        
        CallSwal({
          icon: "error",
          title: "ເກີດຂໍ້ຜິດພາດ",
          text: this.filter_role_id.error,
        });
      } finally {
        this.isloading = false;
        this.filter_role_id.isloading = false;
      }
    },
    
    // NEW: Reset permissions state
    resetPermissions() {
      this.responst_data_detail = null;
      this.permissionsLoaded = false;
      this.filter_role_id.error = null;
      this.lastLoadedParams = { role_id: "", sub_menu_id: "" };
    },
    
    async GetRole() {
      this.isloading = true;
      try {
        const res = await axios.get<RoleModel.RoleListRespons>(`/api/roles/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200) {
          this.respons_data_role = res.data;
          console.log("Role List assigned:", this.respons_data_role);
        }
      } catch (error) {
        console.error(error);
        CallSwal({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching the role data.",
        });
      } finally {
        this.isloading = false;
      }
    },
  },
});