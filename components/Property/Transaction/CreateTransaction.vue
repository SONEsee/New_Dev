<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";


const transactionTypeStoreInstance = transactionTypeStore();
const router = useRouter();


const title = ref("ເພີ່ມປະເພດທຸລະກຳໃໝ່");
const loading = ref(false);
const form = ref();


const goBack = () => {
  router.go(-1);
};


const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງເພີ່ມປະເພດທຸລະກຳໃໝ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await transactionTypeStoreInstance.CreateTransactionType();
    }
  }
};


const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  maxLength50: (value: string) => {
    if (!value) return true;
    return value.length <= 50 || "ຄວາມຍາວບໍ່ເກີນ 50 ຕົວອັກສອນ";
  },
  maxLength100: (value: string) => {
    if (!value) return true;
    return value.length <= 100 || "ຄວາມຍາວບໍ່ເກີນ 100 ຕົວອັກສອນ";
  },
  english: (value: string) => {
    if (!value) return "ກະລຸນາປ້ອນຊື່ພາສາອັງກິດ";
    const pattern = /^[a-zA-Z0-9\s\-\_]+$/;
    return pattern.test(value) || "ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພາສາອັງກິດ, ຕົວເລກ, ແລະເຄື່ອງໝາຍ - _";
  },
};
</script>

<template>
  <section class="pa-6">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>

        

        <v-col cols="12" class="pt-12">
          <v-row>
            <v-col cols="12" md="6">
              <label>ຊື່ປະເພດທຸລະກຳ (ພາສາລາວ) <span class="text-error">*</span></label>
              <v-text-field
                v-model="transactionTypeStoreInstance.form_create_transaction_type.tranNameL"
                :rules="[rules.required, rules.maxLength100]"
                placeholder="ກະລຸນາປ້ອນຊື່ປະເພດທຸລະກຳພາສາລາວ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
              ></v-text-field>

              <label>ຊື່ປະເພດທຸລະກຳ (ພາສາອັງກິດ) <span class="text-error">*</span></label>
              <v-text-field
                v-model="transactionTypeStoreInstance.form_create_transaction_type.tranNameE"
                :rules="[rules.required, rules.english, rules.maxLength100]"
                placeholder="ກະລຸນາປ້ອນຊື່ປະເພດທຸລະກຳພາສາອັງກິດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <label>ຄຳອະທິບາຍ / Description</label>
              <v-textarea
                v-model="transactionTypeStoreInstance.form_create_transaction_type.description"
                placeholder="ກະລຸນາປ້ອນຄຳອະທິບາຍປະເພດທຸລະກຳ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="4"
                maxlength="500"
                counter
              ></v-textarea>

             
              <!-- <v-card variant="outlined" class="mt-4">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                  ຕົວຢ່າງປະເພດທຸລະກຳ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-chip class="ma-1" color="success" variant="outlined" size="small">ຮັບເງິນ - Receipt</v-chip>
                  <v-chip class="ma-1" color="error" variant="outlined" size="small">ຈ່າຍເງິນ - Payment</v-chip>
                  <v-chip class="ma-1" color="info" variant="outlined" size="small">ໂອນເງິນ - Transfer</v-chip>
                  <v-chip class="ma-1" color="warning" variant="outlined" size="small">ປັບຍອດ - Adjustment</v-chip>
                  <v-chip class="ma-1" color="primary" variant="outlined" size="small">ຖອນເງິນ - Withdrawal</v-chip>
                </v-card-text>
              </v-card> -->
            </v-col>
            <v-col cols="12" class="d-flex flex-wrap justify-center">
          <v-btn 
            color="error" 
            flat 
            @click="goBack"
            class="mr-2"
            
          >
            ຍົກເລີກ
          </v-btn>
          
          <v-btn color="primary" flat type="submit" :loading="transactionTypeStoreInstance.isLoading">
            ບັນທຶກ
          </v-btn>
        </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>