import axios from "@/helpers/axios";
import { EmployeeModel } from "~/models";
export const useEmployeeStore = defineStore("employee",{
    state(){
        return{
            respose_data_employee: null as EmployeeModel.EmployeeRespons | null,
            isloading: false,
           
        }
    },
    actions:{
        async GetEmployee(){
            this.isloading = true;
            try {
                const res = await axios.get<EmployeeModel.EmployeeRespons>(`/api/employees`,{
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });if(res.status === 200){
                    this.respose_data_employee =res.data
                }
            } catch (error) {
                console.error("Error fetching employee data:", error);
                
            }
        }
    }
})