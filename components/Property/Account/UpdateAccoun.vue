<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRoute, useRouter } from "vue-router";


const accountStoreInstance = accountStore();
const route = useRoute();
const router = useRouter();

const account_id = route.query.account_id as string;


const title = ref("ແກ້ໄຂບັນຊີ");
const loading = ref(false);
const form = ref();


const accountTypes = [
  { title: "ຊັບສິນ", value: "Asset" },
  { title: "ໜີ້ສິນ", value: "Liability" },
  { title: "ທຶນ", value: "Equity" },
  { title: "ລາຍຮັບ", value: "Revenue" },
  { title: "ຄ່າໃຊ້ຈ່າຍ", value: "Expense" },
];


const parentAccounts = ref([
  { account_id: 1, account_code: "1000000", account_name: "ຊັບສິນ", account_type: "Asset" },
  { account_id: 2, account_code: "1100000", account_name: "ຊັບສິນຫມູນວຽນ", account_type: "Asset" },
  { account_id: 5, account_code: "2000000", account_name: "ໜີ້ສິນ", account_type: "Liability" },
  { account_id: 6, account_code: "3000000", account_name: "ທຶນ", account_type: "Equity" },
  { account_id: 7, account_code: "4000000", account_name: "ລາຍຮັບ", account_type: "Revenue" },
  { account_id: 8, account_code: "5000000", account_name: "ຄ່າໃຊ້ຈ່າຍ", account_type: "Expense" },
]);


const filteredParentAccounts = computed(() => {
  if (!accountStoreInstance.form_update_account.account_type) {
    return parentAccounts.value;
  }
  return parentAccounts.value.filter(
    account => 
      account.account_type === accountStoreInstance.form_update_account.account_type &&
      account.account_id !== parseInt(account_id)
  );
});


const goBack = () => {
  router.go(-1);
};


onMounted(() => {
  if (account_id) {
    loadAccountDetail();
  }
});


const loadAccountDetail = async () => {
  try {
    await accountStoreInstance.GetAccountDetail(account_id);
  } catch (error) {
    console.error("Error loading account detail:", error);
  }
};


watch(
  () => accountStoreInstance.response_account_detail,
  (newVal) => {
    if (newVal) {
      accountStoreInstance.form_update_account.account_id = newVal.account_id || "";
      accountStoreInstance.form_update_account.account_code = newVal.account_code || "";
      accountStoreInstance.form_update_account.account_name = newVal.account_name || "";
      accountStoreInstance.form_update_account.account_type = newVal.account_type || "";
      accountStoreInstance.form_update_account.parent_account_id = newVal.parent_account_id || null;
      accountStoreInstance.form_update_account.description = newVal.description || "";
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
      text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນບັນຊີ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await accountStoreInstance.UpdateAccount(account_id);
    }
  }
};


watch(
  () => accountStoreInstance.form_update_account.account_type,
  () => {
    accountStoreInstance.form_update_account.parent_account_id = null;
  }
);


const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  maxLength10: (value: string) => {
    if (!value) return true;
    return value.length <= 10 || "ຄວາມຍາວບໍ່ເກີນ 10 ຕົວອັກສອນ";
  },
  maxLength100: (value: string) => {
    if (!value) return true;
    return value.length <= 100 || "ຄວາມຍາວບໍ່ເກີນ 100 ຕົວອັກສອນ";
  },
  accountCode: (value: string) => {
    if (!value) return "ກະລຸນາປ້ອນລະຫັດບັນຊີ";
    const pattern = /^[0-9]+$/;
    return pattern.test(value) || "ໃຊ້ໄດ້ແຕ່ຕົວເລກເທົ່ານັ້ນ";
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
              <label>ລະຫັດບັນຊີ / Account Code <span class="text-error">*</span></label>
              <v-text-field
                v-model="accountStoreInstance.form_update_account.account_code"
                :rules="[rules.required, rules.accountCode, rules.maxLength10]"
                placeholder="ເຊັ່ນ: 1441001, 1101100"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="10"
                hint="ໃຊ້ໄດ້ແຕ່ຕົວເລກເທົ່ານັ້ນ"
              ></v-text-field>

              <label>ຊື່ບັນຊີ / Account Name <span class="text-error">*</span></label>
              <v-text-field
                v-model="accountStoreInstance.form_update_account.account_name"
                :rules="[rules.required, rules.maxLength100]"
                placeholder="ກະລຸນາປ້ອນຊື່ບັນຊີ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
              ></v-text-field>

              <label>ປະເພດບັນຊີ / Account Type <span class="text-error">*</span></label>
              <v-select
                v-model="accountStoreInstance.form_update_account.account_type"
                :rules="[rules.required]"
                :items="accountTypes"
                item-title="title"
                item-value="value"
                placeholder="ກະລຸນາເລືອກປະເພດບັນຊີ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <label>ບັນຊີແມ່ / Parent Account</label>
              <v-autocomplete
                v-model="accountStoreInstance.form_update_account.parent_account_id"
                :items="filteredParentAccounts"
                item-title="account_name"
                item-value="account_id"
                placeholder="ເລືອກບັນຊີແມ່ (ຖ້າເປັນບັນຊີຍ່ອຍ)"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                clearable
                no-filter
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="primary" variant="outlined">
                        {{ item.raw.account_code }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.account_name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.account_type }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-autocomplete>

              <label>ຄຳອະທິບາຍ / Description</label>
              <v-textarea
                v-model="accountStoreInstance.form_update_account.description"
                placeholder="ກະລຸນາປ້ອນຄຳອະທິບາຍບັນຊີ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="4"
                maxlength="500"
                counter
              ></v-textarea>

           
              <v-card variant="outlined" class="mt-4" v-if="accountStoreInstance.response_account_detail">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-information-outline</v-icon>
                  ຂໍ້ມູນເດີມ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">Account ID:</v-list-item-title>
                      <v-list-item-subtitle>{{ accountStoreInstance.response_account_detail.account_id }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ສະຖານະ:</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip 
                          :color="accountStoreInstance.response_account_detail.record_stat === 'O' ? 'success' : 'error'"
                          size="small"
                          variant="flat"
                        >
                          {{ accountStoreInstance.response_account_detail.record_stat === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="accountStoreInstance.response_account_detail">
                      <v-list-item-title class="text-subtitle-2">ບັນຊີແມ່ເດີມ:</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ accountStoreInstance.response_account_detail.account_code}} - 
                        {{ accountStoreInstance.response_account_detail.account_name }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
          <v-col cols="12" class="d-flex flex-wrap justify-center">
          <v-btn 
            color="error" 
            flat 
            @click="goBack"
            class="mr-2"
            :loading="accountStoreInstance.isLoading"
          
          >
            ກັບຄືນ
          </v-btn>
          
          <v-btn color="primary" flat type="submit" :loading="accountStoreInstance.isLoading">
            ບັນທຶກ
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>