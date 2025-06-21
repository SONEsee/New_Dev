<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRoute, useRouter } from "vue-router";


const transactionTypeStoreInstance = transactionTypeStore();
const route = useRoute();
const router = useRouter();

const tranID = route.query.tranID as string;


const title = ref("ແກ້ໄຂປະເພດທຸລະກຳ");
const loading = ref(false);
const form = ref();


const goBack = () => {
  router.go(-1);
};


onMounted(() => {
  if (tranID) {
    loadTransactionTypeDetail();
  }
});


const loadTransactionTypeDetail = async () => {
  try {
    await transactionTypeStoreInstance.GetTransactionTypeDetail(tranID);
  } catch (error) {
    console.error("Error loading transaction type detail:", error);
  }
};


watch(
  () => transactionTypeStoreInstance.response_transaction_type_detail,
  (newVal) => {
    if (newVal) {
      transactionTypeStoreInstance.form_update_transaction_type.tranID = newVal.tranID || "";
      transactionTypeStoreInstance.form_update_transaction_type.tranNameL = newVal.tranNameL || "";
      transactionTypeStoreInstance.form_update_transaction_type.tranNameE = newVal.tranNameE || "";
      transactionTypeStoreInstance.form_update_transaction_type.description = newVal.description || "";
    }
  },
  { immediate: true }
);


const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນປະເພດທຸລະກຳ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await transactionTypeStoreInstance.UpdateTransactionType(tranID);
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
                v-model="transactionTypeStoreInstance.form_update_transaction_type.tranNameL"
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
                v-model="transactionTypeStoreInstance.form_update_transaction_type.tranNameE"
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
                v-model="transactionTypeStoreInstance.form_update_transaction_type.description"
                placeholder="ກະລຸນາປ້ອນຄຳອະທິບາຍປະເພດທຸລະກຳ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="4"
                maxlength="500"
                counter
              ></v-textarea>

             
              <v-card variant="outlined" class="mt-4" v-if="transactionTypeStoreInstance.response_transaction_type_detail">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-information-outline</v-icon>
                  ຂໍ້ມູນເດີມ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ລະຫັດ ID:</v-list-item-title>
                      <v-list-item-subtitle>{{ transactionTypeStoreInstance.response_transaction_type_detail.tranID }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ສະຖານະ:</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip 
                          :color="transactionTypeStoreInstance.response_transaction_type_detail.record_stat === 'O' ? 'success' : 'error'"
                          size="small"
                          variant="flat"
                        >
                          {{ transactionTypeStoreInstance.response_transaction_type_detail.record_stat === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
              
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