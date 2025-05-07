import axios from "@/helpers/axios";
import { UseGlobalStore } from "./global";
import { CallSwal } from "~/composables/global";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";

export const UseSaleStore = defineStore("sale", {
  state() {
    return {
      form_create_sale: {
        items: [{ product_id: "", quantity: 0 }],
        payment_amount: 0,
        payment_method: "",
        customer_name: "",
        cashier_name: "",
      },
      loading: false,

    };
  },
  actions:{
    async CreateSale() {
      this.loading = true;
      try {
        
        console.log("ຂໍ້ມູນທີ່ສົ່ງໄປ:", this.form_create_sale);
        
        const { data, status } = await axios.post(`/api/sales/`, this.form_create_sale);
        
        if (status === 200) {
          CallSwal({
            icon: "success",
            title: "ສຳເລັດ",
            text: "ການຂາຍສຳເລັດແລ້ວ",
            showConfirmButton: false,
          });
        }
      } catch (error) {
        console.error("ລາຍລະອຽດຂໍ້ຜິດພາດ:", error.response?.data);
        
        CallSwal({
          icon: "error",
          title: "ມີຂໍ້ຜິດພາດ",
          text: error.response?.data?.message || "ບໍ່ສາມາດສ້າງການຂາຍໄດ້",
        });
      } finally {
        this.loading = false;
      }
    }
  }
});
