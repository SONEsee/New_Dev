import axios from "@/helpers/axios";
import { CategoryModel } from "~/models";
import { goPath } from "~/composables/global";
import { CallSwal } from "~/composables/global";
import { defineStore } from "pinia";
import { UseGlobalStore } from "./global";

interface Category {
  div_id: string;
  division_name_la: string;
  division_name_en: string;
  record_Status: string;
  Maker_DT_Stamp: string;
  Checker_DT_Stamp: null | string;
  Auth_Status: string;
  Once_Auth: string;
  Maker_Id: null;
  Checker_Id: null;
}
interface CategoryResponse {
  category: Category;
}

interface CategoryState {
  form_create_data: {
    div_id: string;
    division_name_la: string;
    division_name_en: string;
    // record_Status: string;
    // Maker_Id: string;
    // Checker_Id: string;
    // Auth_Status: string;
    // Once_Auth: string;
  };
  form_update_data: {
    div_id: string;
    division_name_la: string;
    division_name_en: string;
    // record_Status: string;
    // Maker_Id: string;
    // Checker_Id: string;
    // Auth_Status: string;
    // Once_Auth: string;
  };
  categories: Category[];
  response_detail_query_data: Category[];
  loading: boolean;
}

export const UseCategoryStore = defineStore("category", {
  state: (): CategoryState => ({
    form_create_data: {
      div_id: "",
      division_name_la: "",
      division_name_en: "",
      // record_Status: "",
      // Maker_Id: "",
      // Checker_Id: "",
      // Auth_Status: "",
      // Once_Auth: "",
    },
    form_update_data: {
      div_id: "",
      division_name_la: "",
      division_name_en: "",
      // record_Status: "",
      // Maker_Id: "",
      // Checker_Id: "",
      // Auth_Status: "",
      // Once_Auth: "",
    },
    response_detail_query_data: [],
    categories: [],
    loading: false,
  }),

  actions: {
    async GetListData() {
      this.loading = true;
      try {
        const { data, status } = await axios.get<Category[]>(
          `/api/divisions/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (status === 200) {
          this.categories = data;
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        await CallSwal({
          title: "ຜິດພາດ",
          text: "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
        this.loading = false;
      }
    },
    async GetDataDetail(div_id: string | null) {
      this.loading = true;
      try {
        if (!div_id) {
          await CallSwal({
            title: "ຜິດພາດ",
            text: "ກະລຸນາລະບຸ ID ຂອງປະເພດ",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        const { data, status } = await axios.get<
          CategoryModel.Category[]
        >(`/api/divisions/${div_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (status === 200) {
          this.response_detail_query_data = data;
        }
      } catch (error) {
        console.error("Error fetching category details:", error);
        await CallSwal({
          title: "ຜິດພາດ",
          text: "ເກີດຂໍ້ຜິດພາດໃນການເອົາເນື້ອໃນ",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
        this.loading = false;
      }
    },

    async CreateCategory() {
      this.loading = true;
      try {
        if (!this.form_create_data) {
          await CallSwal({
            title: "ຜິດພາດ",
            text: "ກະລຸນາປ້ອນຊື່ປະເພດ",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        const { data, status } = await axios.post<Category>(
          `/api/divisions/`,
          this.form_create_data
          
        );
        if (status === 201) {
          this.categories.push(data);
          await CallSwal({
            title: "ສຳເລັດ",
            text: "ປະເພດຖືກສ້າງສຳເລັດແລ້ວ",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          goPath("/devision");
        }
      } catch (error) {
        console.error("Error creating category:", error);
        await CallSwal({
          title: "ຜິດພາດ",
          text: "ເກີດຂໍ້ຜິດພາດໃນການສ້າງປະເພດ",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
        this.loading = false;
      }
    },

    async UpdateCategory(div_id: string | null) {
      this.loading = true;
      try {
        if (!div_id) {
          await CallSwal({
            title: "ຜິດພາດ",
            text: "ກະລຸນາລະບຸ ID ຂອງປະເພດ",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        if (!this.form_update_data.div_id.trim()) {
          await CallSwal({
            title: "ຜິດພາດ",
            text: "ກະລຸນາປ້ອນຊື່ປະເພດ",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        const { data, status } = await axios.put<Category>(
          `/categories/${div_id}`,
          this.form_update_data
        );

        if (status === 200) {
          const index = this.categories.findIndex(
            (cat) => cat.div_id === this.form_update_data.div_id
          );
          if (index !== -1) {
            this.categories[index] = data;
          }
          this.response_detail_query_data = [data];

          await CallSwal({
            title: "ສຳເລັດ",
            text: "ປະເພດຖືກອັບເດດສຳເລັດແລ້ວ",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          goPath("/category");
        }
      } catch (error) {
        console.error("Error updating category:", error);
        await CallSwal({
          title: "ຜິດພາດ",
          text: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດປະເພດ",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
      } finally {
        this.loading = false;
      }
    },
    async DeleteCategory(Div_Id: string | null) {
      const globalStore = UseGlobalStore();
      try {
        if (!Div_Id) {
          console.error("No Div_Id provided for deletion");
          return null;
        }

        const notification = await CallSwal({
          icon: "warning",
          title: "ຄຳເຕືອນ",
          text: `ທ່ານກຳລັງລົບຂໍ້ມູນປະເພດທ່ານແນ່ໃຈແລ້ວບໍ່?`,
          showCancelButton: true,
          confirmButtonText: "ຕົກລົງ",
          cancelButtonText: "ຍົກເລີກ",
        });

        if (notification.isConfirmed) {
          this.loading = true;
          globalStore.loading_overlay = true;

          try {
            const res = await axios.delete(`/api/divisions/${Div_Id}`);
            if (res.status === 204) {
              
              this.categories = this.categories.filter(
                (item) => item.div_id !== Div_Id
              );
              return Div_Id;
            }
          } finally {
            globalStore.loading_overlay = false;
            this.loading = false;
          }
        }
        return null;
      } catch (error) {
        console.error("Error deleting category:", error);
        await CallSwal({
          title: "ຜິດພາດ",
          text: "ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ",
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });
        return null;
      }
    },
  },
});
