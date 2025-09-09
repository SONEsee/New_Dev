import axios from "@/helpers/axios";
import { DateEODModel } from "~/models";
export const useDateStore = defineStore("date",{
    state(){
        return{
isLoading: false,
response_data_eod: null as DateEODModel.Data | null,
        }
    },
    actions:{
        async GetEOD(){
            this.isLoading = true;
            try {
                const res = await axios.get<DateEODModel.DateEODRespons>(`/latest-eod/`,{
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });if(res.status === 200){
                    this.response_data_eod = res.data.data
                }
            } catch (error) {
                CallSwal({
                    title: "Error",
                    text: "ການດຶງຂໍ້ມູນຜິດພາດ.",
                    icon: "error",
                })
            }finally{
                this.isLoading = false;
            }
        }
    }
})