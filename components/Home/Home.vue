<template>
  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="9">
        <v-row>
          <v-col cols="12" md="4">
            <v-row>
              <v-col cols="12" md="6">
                <v-btn
                  color="#4CAF50"
                  flat
                  class="rounded-lg"
                  style="font-size: small"
                >
                  ສະແດງຍອດຂາຍ
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <div class="d-flex justify-end align-center">
                  <v-btn
                    icon="mdi-cart-percent"
                    size="40"
                    color="#4CAF50"
                  ></v-btn>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              density="compact"
              label="ກັ່ນຕອງຕາມປະເພດ"
              :items="types"
              v-model="selectedType"
              variant="outlined"
            ></v-select>
          </v-col>
          <v-col cols="12" md="5">
            <v-text-field
              density="compact"
              label="ຄົ້ນຫາດ້ວຍບາໂຄດ"
              v-model="searchBarcode"
              @keyup.enter="selectByBarcode"
              variant="outlined"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3" v-for="item in filteredData" :key="item.id">
            <v-card flat class="rounded-lg">
              <v-chip class="ma-2" label>{{ item.reorder_level }}</v-chip>
              <v-container class="d-flex justify-center">
                <v-img
                  :src="`${URL}/${item.product_image}`"
                  width="150"
                  height="150"
                  class="d-flex justify-center"
                  min-height="10vh"
                  min-width="100%"
                  :alt="item.product_name"
                ></v-img>
              </v-container>
              <p style="font-size: small">ຊື່ສິນຄ້າ: {{ item.product_name }}</p>
              <p style="font-size: small">ປະເພດ: {{ item.Category.Name }}</p>
              <p style="font-size: small">ລາຄາ: {{ item.price }} LAK</p>
              <v-btn @click="selectItem(item)" color="green">ເລືອກ</v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-row>
            <v-col cols="12">
              <v-container>
                <h3>ລາຍການທີ່ເລືອກ</h3>
                <v-list>
                  <v-list-item v-for="item in selectedItems" :key="item.id">
                    <v-list-item-content>
                      <v-list-item-title>{{
                        item.product_name
                      }}</v-list-item-title>
                      <v-list-item-subtitle>
                        ຈຳນວນ: {{ item.quantity }} | ລາຄາ:
                        {{ item.price * item.quantity }} LAK
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-btn
                      @click="increaseQuantity(item)"
                      small
                      flat
                      class="text-info"
                      icon="mdi-plus-circle-outline"
                    />
                    <v-btn
                      @click="decreaseQuantity(item)"
                      icon="mdi-minus-circle-outline"
                      small
                      flat
                      class="text-error"
                    />
                  </v-list-item>
                </v-list>
                <p>VAT: {{ vat }} LAK</p>
                <p>ລາຄາລວມ: {{ totalPriceWithVat }} LAK</p>
                <v-text-field
                  class="mt-2"
                  density="compact"
                  label="ຈຳນວນເງິນທີ່ຊຳລະ"
                  v-model="paymentAmount"
                  @input="calculateChange"
                  variant="outlined"
                ></v-text-field>
                <v-container fluid>
                  <!-- <p>Selected Button: {{ radios }}</p> -->
                  <v-radio-group inline v-model="radios">
                    <v-radio label="ເງິນສົດ" value="ເງິນສົດ"></v-radio>
                    <v-radio label="ເງິນໂອນ" value="ເງິນໂອນ"></v-radio>
                  </v-radio-group>
                </v-container>
                <p :style="{ color: changeColor }">
                  {{ changeMessage }}
                </p>
                <v-btn
                  @click="generateBill"
                  density="compact"
                  color="primary"
                  small
                  style="font-size: small"
                  >ຂາຍ</v-btn
                >
                <v-btn
                  density="compact"
                  @click="resetPayment"
                  color="secondary"
                  class="ml-2"
                  small
                  style="font-size: smaller"
                  >ລ້າງຂໍ້ມູນ</v-btn
                >
              </v-container></v-col
            >
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-col>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import { useProductStore } from "@/stores/product";
import { UseSaleStore } from "~/stores/sale";
import { CallSwal } from "~/composables/global";
const radios = ref("ເງິນສົດ");
const product = useProductStore();

const URL = "http://127.0.0.1:8080";
const user = localStorage.getItem("user");
const username = user ? JSON.parse(user).username : "";
const selectedItems = ref<any[]>([]);
const selectedType = ref("");
const searchBarcode = ref("");
const paymentAmount = ref<number | string>(0);
const currencyCode = "LAK";
const change = ref(0);

onMounted(() => {
  product.Getdata();
});

const data = computed(() => product.response_query_data?.Items || []);

const types = computed(() => [
  ...new Set(data.value.map((item) => item.Category?.Name || "ບໍ່ມີປະເພດ")),
]);

const filteredData = computed(() => {
  let filtered = data.value;
  if (selectedType.value) {
    filtered = filtered.filter(
      (item) => item.Category?.Name === selectedType.value
    );
  }
  if (searchBarcode.value) {
    filtered = filtered.filter((item) =>
      item.barcode.includes(searchBarcode.value)
    );
  }
  return filtered;
});

const totalPrice = ref(0);
const vat = ref(0);
const totalPriceWithVat = ref(0);

const calculateTotalPrice = () => {
  totalPrice.value = selectedItems.value.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  vat.value = totalPrice.value * 0.1;
  totalPriceWithVat.value = totalPrice.value + vat.value;
  calculateChange();
};

const calculateChange = () => {
  const payment =
    typeof paymentAmount.value === "string"
      ? parseFloat(paymentAmount.value) || 0
      : paymentAmount.value;
  if (payment >= totalPriceWithVat.value) {
    change.value = payment - totalPriceWithVat.value;
  } else {
    change.value = payment - totalPriceWithVat.value;
  }
};

const changeMessage = computed(() => {
  if (change.value > 0) {
    return `ເງິນທອນ: ${change.value} ${currencyCode}`;
  } else if (change.value < 0) {
    return `ຈຳນວນເງິນທີ່ຍັງບໍ່ຄົບ: ${Math.abs(change.value)} ${currencyCode}`;
  } else {
    return `ເງິນທອນ: 0 ${currencyCode}`;
  }
});

const changeColor = computed(() => {
  if (change.value > 0) return "green";
  if (change.value < 0) return "red";
  return "black";
});

const selectItem = (item: any) => {
  const existingItem = selectedItems.value.find(
    (selected) => selected.id === item.id
  );
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    selectedItems.value.push({ ...item, quantity: 1 });
  }
  calculateTotalPrice();
};

const increaseQuantity = (item: any) => {
  const existingItem = selectedItems.value.find(
    (selected) => selected.id === item.id
  );
  if (existingItem) {
    existingItem.quantity += 1;
    calculateTotalPrice();
  }
};

const decreaseQuantity = (item: any) => {
  const existingItem = selectedItems.value.find(
    (selected) => selected.id === item.id
  );
  if (existingItem && existingItem.quantity > 1) {
    existingItem.quantity -= 1;
    calculateTotalPrice();
  } else if (existingItem && existingItem.quantity === 1) {
    selectedItems.value = selectedItems.value.filter(
      (selected) => selected.id !== item.id
    );
    calculateTotalPrice();
  }
};

const selectByBarcode = () => {
  const item = data.value.find((item) => item.barcode === searchBarcode.value);
  if (item) {
    selectItem(item);
    searchBarcode.value = "";
  } else {
    Swal.fire({
      icon: "error",
      title: "ບໍ່ພົບ",
      text: "ບໍ່ມີສິນຄ້າທີ່ມີບາໂຄດນີ້",
    });
  }
};
const generateBill = async () => {
  if (selectedItems.value.length === 0) {
    await CallSwal({
      icon: "error",
      title: "ບໍ່ມີສິນຄ້າ",
      text: "ກະລຸນາເລືອກສິນຄ້າກ່ອນ",
    });
    return;
  }

  const payment =
    typeof paymentAmount.value === "string"
      ? parseFloat(paymentAmount.value) || 0
      : paymentAmount.value;

  if (payment < totalPriceWithVat.value || payment === 0) {
    await CallSwal({
      icon: "error",
      title: "ເງິນບໍ່ພຽງພໍ",
      text:
        payment === 0
          ? "ກະລຸນາປ່ຽນເງິນທີ່ຊຳລະ"
          : `ຈຳນວນເງິນທີ່ຍັງບໍ່ຄົບ: ${Math.abs(change.value)} ${currencyCode}`,
    });
    return;
  }

  const saleConfirmation = await CallSwal({
    icon: "question",
    title: "ຢືນຢັນການຂາຍ",
    text: "ທ່ານຕ້ອງການຢືນຢັນການຂາຍນີ້ບໍ່?",
    showCancelButton: true,
    confirmButtonText: "ຢືນຢັນ",
    cancelButtonText: "ຍົກເລີກ",
  });
  if (saleConfirmation.isConfirmed) {
    const saleData = {
      items: selectedItems.value.map((item) => ({
        product_id: String(item.id),
        quantity: item.quantity,
      })),
      payment_amount: payment,
      payment_method: radios.value,
      customer_name: username,
      cashier_name: "N/A",
    };
    UseSaleStore().form_create_sale = saleData;
    if (!saleConfirmation.isConfirmed) {
      return;
    }
    await UseSaleStore().CreateSale();
  } else {
    return;
  }

  const billConfirmation = await CallSwal({
    icon: "question",
    title: "ຕ້ອງການບິນບໍ່?",
    text: "ທ່ານຕ້ອງການສະແດງ ແລະ ພິມບິນຂາຍບໍ່?",
    showCancelButton: true,
    confirmButtonText: "ຕ້ອງການ",
    cancelButtonText: "ບໍ່ຕ້ອງການ",
  });

  if (!billConfirmation.isConfirmed) {
    return;
  }

  let billContent = `
    <style>
      .bill-container { font-family: 'NotoSansLao', sans-serif; text-align: left; }
      .bill-header { text-align: center; margin-bottom: 20px; }
      .bill-items { width: 100%; border-collapse: collapse; }
      .bill-items th, .bill-items td { border: 1px solid #ddd; padding: 8px; }
      .bill-items th { background-color: #f2f2f2; text-align: center; }
      .bill-footer { margin-top: 20px; text-align: right; }
    </style>
    <div class="bill-container">
      <div class="bill-header"><h3>ບິນຂາຍ</h3></div>
      <table class="bill-items">
        <thead>
          <tr>
            <th>ຊື່ສິນຄ້າ</th>
            <th>ຈຳນວນ</th>
            <th>ລາຄາ</th>
          </tr>
        </thead>
        <tbody>
  `;

  selectedItems.value.forEach((item) => {
    billContent += `
      <tr style="font-family: 'NotoSansLao', sans-serif;;">
        <td>${item.product_name}</td>
        <td>${item.quantity}</td>
        <td>${(
          item.price * item.quantity
        ).toLocaleString()} ${currencyCode}</td>
      </tr>
    `;
  });

  billContent += `
        </tbody>
      </table>
      <div class="bill-footer" style="font-family: 'NotoSansLao', sans-serif;">
        <p>VAT: ${vat.value.toLocaleString()} ${currencyCode}</p>
        <p>ລາຄາລວມ: ${totalPriceWithVat.value.toLocaleString()} ${currencyCode}</p>
        <p>ຈຳນວນເງິນທີ່ຊຳລະ: ${payment.toLocaleString()} ${currencyCode}</p>
        <p>ເງິນທອນ: ${change.value.toLocaleString()} ${currencyCode}</p>
      </div>
    </div>
  `;

  const printConfirmation = await CallSwal({
    title: "ບິນຂາຍ",
    html: billContent,
    showCancelButton: true,
    confirmButtonText: "ພິມ",
    cancelButtonText: "ປິດ",
    width: 600,
    padding: "3em",
    background: "#fff",
    backdrop: "rgba(0,0,123,0.4) left top no-repeat",
  });

  if (printConfirmation.isConfirmed) {
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(
        ' <html><head><title>ບິນຂາຍ</title><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao&display=swap" rel="stylesheet"></head><body style=\'font-family: "Noto Sans Lao", sans-serif;\'>'
      );
      printWindow.document.write(billContent);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    } else {
      await CallSwal({
        icon: "error",
        title: "ບໍ່ສາມາດເປີດບິນພິມໄດ້",
        text: "ກະລຸນາກວດສອບວ່າ popup blocker ໄດ້ຖືກປິດແລ້ວ ແລະ ລອງໃຫມ່",
      });
    }
  }
};

const resetPayment = () => {
  selectedItems.value = [];
  paymentAmount.value = 0;
  change.value = 0;
  calculateTotalPrice();
};

calculateTotalPrice();
</script>
