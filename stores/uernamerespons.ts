import axios from "@/helpers/axios";
import { UserNameDataModel } from "~/models";
export const userStoreList = defineStore("userlist", {
  state() {
    return {
      responst_username_list:
        null as UserNameDataModel.UserNameDataRespons | null,
      isLoading: false,
    };
  },
  actions: {
    async getUserData() {
      this.isLoading = true;
      try {
        const res = await axios.get<UserNameDataModel.UserNameDataRespons>(
          `users`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );if(res.status === 200){
            this.responst_username_list= res.data
        }
      } catch (error) {
        DefaultSwalError(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
