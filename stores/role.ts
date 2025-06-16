// import axios from "@/helpers/axios";
// import { CallSwal } from "~/composables/global";
// import { RoleModel, RoleDetailModel } from "~/models";
// export const RoleStore = defineStore("role", {
//   state() {
//     return {

//       responst_data_detail: null as RoleDetailModel.RoleDetailRespons | null,
//       respons_data_role: null as RoleModel.RoleListRespons | null,
//       isloading: false,
//       filter_role_id: {
//         query: {
//           role_id: "",
//         },
//         isloading: false,
//         error: null as string | null,
//       },
//     };
//   },
//   actions: {
//     async GetRoleDetail() {
//       this.isloading = true;
//       try {
//         const res = await axios.get<RoleDetailModel.RoleDetailRespons>(
//           `api/role-details/`,
//           {
//             params: {
//               ...this.filter_role_id.query,
//             },
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${localStorage.getItem("token")}`,
//             },
//           }
//         );
//         if(res.status ===200){
//             this.responst_data_detail = res.data
//         }
//       } catch (error) {
//         console.error(error);
//         CallSwal({
//           icon: "error",
//           title: "Error",
//           text: "An error occurred while fetching the role detail data.",
//         });
//       } finally {
//         this.isloading = false;
//       }
//     },
//     async GetRole() {
//       this.isloading = true;
//       try {
//         const res = await axios.get<RoleModel.RoleListRespons>(`/api/roles/`, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         if (res.status === 200) {
//           this.respons_data_role = res.data;
//           console.log("Role List assigned:", this.respons_data_role);
//         }
//       } catch (error) {
//         console.error(error);
//         CallSwal({
//           icon: "error",
//           title: "Error",
//           text: "An error occurred while fetching the role data.",
//         });
//       }
//     },
//   },
// });
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
      responst_data_detail:
        null as RoleDetailModel.RoleDetailResponsItem | null,
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
    };
  },
  actions: {
   
    updateRoleIdFromStorage() {
      this.filter_role_id.query.role_id = getRoleIdFromStorage();
    },

    async GetRoleDetail() {
      // Update role_id ຈາກ localStorage ກ່ອນ API call
      this.updateRoleIdFromStorage();

      this.isloading = true;
      try {
        const res = await axios.get<RoleDetailModel.RoleDetailResponsItem>(
          `api/role-details/`,
          {
            params: {
              ...this.filter_role_id.query,
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.responst_data_detail = res.data;
        }
      } catch (error) {
        console.error(error);
        CallSwal({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching the role detail data.",
        });
      } finally {
        this.isloading = false;
      }
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
      }
    },
  },
});
