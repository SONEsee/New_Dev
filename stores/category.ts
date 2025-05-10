import axios from "@/helpers/axios";
import { CategoryModel } from "~/models";
import { goPath } from "~/composables/global";
import { CallSwal } from "~/composables/global";
import { defineStore } from "pinia";
import { UseGlobalStore } from "./global";

interface Category {
  ID: number;
  id:               number;
    Div_Id:           string;
    Div_NameL:        string;
    Div_NameE:        string;
    Record_Status:    string;
    Maker_DT_Stamp:   Date;
    Checker_DT_Stamp: Date | null;
    Auth_Status:      string;
    Once_Auth:        string;
    Maker_Id:         number | null;
    Checker_Id:       null;
}
interface CategoryResponse {
  category: Category;
}

interface CategoryState {
  form_create_data: {
    Div_Id: string;
    Div_NameL: string;
    Div_NameE: string;
    Record_Status: string;
    Auth_Status: string;
    Once_Auth: string;
  };
  form_update_data: {
    Div_Id: string;
    Div_NameL: string;
    Div_NameE: string;
    Record_Status: string;
    Auth_Status: string;
    Once_Auth: string;
  };
  categories: Category[];
  response_detail_query_data: Category[];
  loading: boolean;
}

export const UseCategoryStore = defineStore("category", {
  state: (): CategoryState => ({
    form_create_data: {
      Div_Id: "",
      Div_NameL: "",
      Div_NameE: "",
      Record_Status: "",
      Auth_Status: "",
      Once_Auth: "",
    },
    form_update_data: {
      Div_Id: "",
      Div_NameL: "",
      Div_NameE: "",
      Record_Status: "A",
      Auth_Status: "A",
      Once_Auth: "N",
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

    // async GetDetailCategory(id: string | null) {
    //   this.loading = true;
    //   try {
    //     if (!id) {
    //       console.log("No ID provided");
    //       return;
    //     }
    //     const res = await axios.get<CategoryResponse>(`/categories/${id}`);
    //     console.log("API Response:", res.data);

    //     if (res.status === 200) {
    //       this.response_detail_query_data = [res.data.category];
    //     }
    //   } catch (error) {
    //     console.error("Error fetching category details:", error);
    //     await CallSwal({
    //       title: "ຜິດພາດ",
    //       text: "ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ",
    //       icon: "error",
    //       showConfirmButton: false,
    //       timer: 1500,
    //     });
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    async UpdateCategory(id: string | null) {
      this.loading = true;
      try {
        if (!id) {
          await CallSwal({
            title: "ຜິດພາດ",
            text: "ກະລຸນາລະບຸ ID ຂອງປະເພດ",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        if (!this.form_update_data.Div_Id.trim()) {
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
          `/categories/${id}`,
          this.form_update_data
        );

        if (status === 200) {
          const index = this.categories.findIndex(
            (cat) => cat.ID === this.form_update_data.Div_Id
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
        if (res.status === 200) {
          // ລຶບລາຍການຈາກ array ໂດຍບໍ່ຕ້ອງໂຫຼດຂໍ້ມູນໃໝ່
          this.categories = this.categories.filter(item => item.Div_Id !== Div_Id);
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
}
  },
});
