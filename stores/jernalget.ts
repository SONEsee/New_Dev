import axios from "@/helpers/axios";
import {JournalModels} from "~/models";
export const usejournalStore = defineStore("journal",{
    state(){
        return{
            isLoading: false,
            response_data_list_journal: null as JournalModels.Datum | null
        }
    },
    actions:{
        async getData(){
            this.isLoading = true;
            try {
                const res = await axios.get<JournalModels.DevJourNalRespons>(`/journal/credit-unauthorized/`,{
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:`Bearer ${localStorage.getItem("token")}`
                    }
                });if(res.status ===200){
                    this.response_data_list_journal = res.data.data;
                }
            } catch (error) {
                CallSwal({
                    icon: "error",
                    title:"ຜົດພາດ",
                    text:"ບໍ່ສາມາດດືງຂໍ້ມູນຂອງ Journal"
                })
                
            }finally{
                this.isLoading = false;
            }

        }
    }
})