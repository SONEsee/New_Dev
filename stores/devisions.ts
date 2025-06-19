import axios from "@/helpers/axios";
import { CategoryModel } from "~/models";
import { goPath } from "~/composables/global";
import { CallSwal } from "~/composables/global";
export const DevisionStore = defineStore("devision", {
  state() {
    return {
      form_update_data: {
        div_id: "",
        division_name_la: "",
        division_name_en: "",
        record_Status: "",
        Maker_Id: "" as string | null,
        Checker_Id: "" as string | null,
        Auth_Status: "",
        Once_Auth: "",
      },

      respons_detail_query_data:
        null as CategoryModel.DetailDevisionsRespons | null,
      isloading: false,
    };
  },
  actions: {
    
    async GetDataDetail(id: string) {
      this.isloading = true;
      try {
        const res = await axios.get<CategoryModel.DetailDevisionsRespons>(
          `/api/divisions/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_detail_query_data = res.data;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async UpdateDevision(id: string) {
      this.isloading = true;
      try {
        const res = await axios.put<CategoryModel.DetailDevisionsRespons>(
          `/api/divisions/${id}/`,
          this.form_update_data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.respons_detail_query_data = res.data;
          await CallSwal({
            title: "ສຳເລັດ",
            text: "ອັບເດດສໍາເລັດ",
            icon: "success",
          });
          goPath("/devision");
        }
      } catch (error) {
        await CallSwal({
          title: "ຜິດພາດ",
          text: "ການອັບເດດບໍ່ສຳເລັດ",
          icon: "error",
        });
        console.error(error);
      }
    },
  },
});
