import axios from "@/helpers/axios";
import { CurrencyModel } from "~/models";
export const useCerrencyStore = defineStore("cerrency", {
  state() {
    return {
      respons_cerrency_data: null as CurrencyModel.CurrencyResponse | null,
      isloading: false,
    };
  },
  actions: {
    async getDataCerrency() {
      this.isloading = true;
      try {
        const res = await axios.get<CurrencyModel.CurrencyResponse>(
          `api/currencies/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_cerrency_data = res.data;
        }
      } catch (error) {
        this.isloading = false;

        console.error(error);
      }
    },
  },
});
