import axios from "@/helpers/axios";
import { GlModel } from "~/models";
export const useGlStore = defineStore("gl", {
  state() {
    return {
      respons_data_gl: null as GlModel.GlResepose[] | null,
      isloading: false,
      error: null as string | null,
    };
  },
  actions: {
    async getGl() {
      this.isloading = true;
      this.error = null;
      try {
        const res = await axios.get<GlModel.GlResepose[]>(`api/gl-tree/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (res.status === 200) {
          this.respons_data_gl = res.data;
        }
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "An error occurred";
      } finally {
        this.isloading = false;
      }
    },
  },
});
