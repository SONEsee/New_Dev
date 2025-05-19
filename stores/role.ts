import axios from "@/helpers/axios";
import { CallSwal } from "~/composables/global";
import { RoleModel } from "~/models";
export const RoleStore = defineStore("role", {
    state(){
        return{
            respons_data_role: null as RoleModel.RoleListRespons | null,
            isloading: false,

        }
    },
    actions:{
        async GetRole(){
            this.isloading = true;
            try {
                const res = await axios.get<RoleModel.RoleListRespons>(`/api/roles/`,{
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if(res.status ===200){
                    this.respons_data_role=res.data;
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
        }
    }
});