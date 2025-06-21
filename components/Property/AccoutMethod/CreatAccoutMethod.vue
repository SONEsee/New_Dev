<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";

const accountMethodStoreInstance = accountMethodStore();
const router = useRouter();

const title = ref("ເພີ່ມຕັ້ງຄ່າບັນທຶກບັນຊີຊັບສົມບັດໃໝ່");
const loading = ref(false);
const form = ref();


const accTypeOptions = [
  { title: "ຊັບສົມບັດ", value: "ASSET", description: "ການຊື້/ໄດ້ຮັບຊັບສົມບັດ", icon: "mdi-treasure-chest" },
  { title: "ເສື່ອມລາຄາ", value: "DEPRECIATION", description: "ການຄິດເສື່ອມລາຄາ", icon: "mdi-trending-down" },
  { title: "ຖອນຈຳໜ່າຍ", value: "DISPOSAL", description: "ການຂາຍ/ຖອນຊັບສົມບັດ", icon: "mdi-delete" },
];


const recordStatusOptions = [
  { title: "ເປີດໃຊ້ງານ", value: "O" },
  { title: "ປິດໃຊ້ງານ", value: "C" },
];


const accounts = ref([
  { id: "1441001", name: "ຊັບສົມບັດຄົງທີ່ - ເຄື່ອງຈັກ", type: "ASSET" },
  { id: "1442001", name: "ຄ່າເສື່ອມລາຄາສະສົມ - ເຄື່ອງຈັກ", type: "DEPRECIATION" },
  { id: "5551001", name: "ຄ່າເສື່ອມລາຄາ - ເຄື່ອງຈັກ", type: "EXPENSE" },
  { id: "1101100", name: "ເງິນສົດໃນມື", type: "CASH" },
  { id: "4551001", name: "ກຳໄລຈາກການຂາຍຊັບສົມບັດ", type: "INCOME" },
  { id: "5551002", name: "ຂາດທຶນຈາກການຂາຍຊັບສົມບັດ", type: "EXPENSE" },
  { id: "1100000", name: "ຊັບສິນຫມູນວຽນ", type: "ASSET" },
  { id: "2100000", name: "ໜີ້ສິນຫມູນວຽນ", type: "LIABILITY" },
]);

const assets = ref([
  { id: 1, asset_tag: "IT-001", asset_name: "ຄອມພິວເຕີ Dell", asset_value: 15000000 },
  { id: 2, asset_tag: "MACH-001", asset_name: "ເຄື່ອງຈັກຜະລິດ", asset_value: 50000000 },
  { id: 3, asset_tag: "VEH-001", asset_name: "ລົດໃຫ້ບໍລິການ", asset_value: 200000000 },
  { id: 4, asset_tag: "BUILD-001", asset_name: "ອາຄານສຳນັກງານ", asset_value: 500000000 },
]);

const goBack = () => {
  router.go(-1);
};

const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງເພີ່ມວິທີການບັນຊີໃໝ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await accountMethodStoreInstance.CreateAccountMethod();
    }
  }
};


const filteredDebitAccounts = computed(() => {
  const accType = accountMethodStoreInstance.form_create_account_method.acc_type;
  if (!accType) return accounts.value;
  

  const debitAccountTypes = {
    'ASSET': ['ASSET'],
    'DEPRECIATION': ['EXPENSE'],
    'DISPOSAL': ['CASH', 'ASSET', 'EXPENSE']
  };
  
  const allowedTypes = debitAccountTypes[accType] || [];
  return accounts.value.filter(acc => allowedTypes.includes(acc.type));
});

const filteredCreditAccounts = computed(() => {
  const accType = accountMethodStoreInstance.form_create_account_method.acc_type;
  if (!accType) return accounts.value;
  

  const creditAccountTypes = {
    'ASSET': ['CASH', 'LIABILITY'],
    'DEPRECIATION': ['DEPRECIATION'],
    'DISPOSAL': ['ASSET', 'INCOME', 'EXPENSE']
  };
  
  const allowedTypes = creditAccountTypes[accType] || [];
  return accounts.value.filter(acc => allowedTypes.includes(acc.type));
});


watch(
  () => accountMethodStoreInstance.form_create_account_method.acc_type,
  (newType) => {
    if (newType) {
 
      accountMethodStoreInstance.form_create_account_method.debit_account_id = "";
      accountMethodStoreInstance.form_create_account_method.credit_account_id = "";
      

      const suggestions = {
        'ASSET': { 
          debit: "1441001", 
          credit: "1101100",
          description: "ການຊື້ຊັບສົມບັດຄົງທີ່ດ້ວຍເງິນສົດ"
        },
        'DEPRECIATION': { 
          debit: "5551001", 
          credit: "1442001",
          description: "ການຄິດເສື່ອມລາຄາປະຈຳເດືອນ"
        },
        'DISPOSAL': { 
          debit: "1101100", 
          credit: "1441001",
          description: "ການຂາຍຊັບສົມບັດຄົງທີ່"
        }
      };
      
      const suggestion = suggestions[newType];
      if (suggestion) {
        accountMethodStoreInstance.form_create_account_method.debit_account_id = suggestion.debit;
        accountMethodStoreInstance.form_create_account_method.credit_account_id = suggestion.credit;
        accountMethodStoreInstance.form_create_account_method.description = suggestion.description;
      }
    }
  }
);

const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  requiredSelect: (value: any) => !!value || "ກະລຸນາເລືອກຂໍ້ມູນ",
  positiveNumber: (value: number) => {
    if (!value && value !== 0) return "ກະລຸນາປ້ອນຍອດເງິນ";
    return value > 0 || "ຍອດເງິນຕ້ອງມາກກວ່າ 0";
  },
  maxLength500: (value: string) => {
    if (!value) return true;
    return value.length <= 500 || "ຄວາມຍາວບໍ່ເກີນ 500 ຕົວອັກສອນ";
  },
  accountDifferent: (value: string) => {
    const debitAccount = accountMethodStoreInstance.form_create_account_method.debit_account_id;
    if (!value || !debitAccount) return true;
    return value !== debitAccount || "ບັນຊີເດບິດແລະເຄຣດິດຕ້ອງຕ່າງກັນ";
  },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("lo-LA").format(value);
};

onMounted(async () => {

  loading.value = true;
  try {

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
  } catch (error) {
    console.error("Error loading reference data:", error);
  } finally {
    loading.value = false;
  }
});
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
          
            <v-col cols="12">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-format-list-bulleted-type</v-icon>
                ປະເພດທຸລະກຳ
              </h3>
              
              <v-radio-group 
                v-model="accountMethodStoreInstance.form_create_account_method.acc_type"
                :rules="[rules.requiredSelect]"
                class="mb-6"
              >
                <v-row>
                  <v-col v-for="option in accTypeOptions" :key="option.value" cols="12" md="4">
                    <v-card 
                      variant="outlined" 
                      :color="accountMethodStoreInstance.form_create_account_method.acc_type === option.value ? 'primary' : ''"
                      class="pa-4 cursor-pointer"
                      @click="accountMethodStoreInstance.form_create_account_method.acc_type = option.value"
                    >
                      <v-radio :value="option.value" class="d-none"></v-radio>
                      <div class="text-center">
                        <v-icon 
                          :color="accountMethodStoreInstance.form_create_account_method.acc_type === option.value ? 'white' : 'primary'" 
                          size="48" 
                          class="mb-2"
                        >
                          {{ option.icon }}
                        </v-icon>
                        <h4 
                          :class="accountMethodStoreInstance.form_create_account_method.acc_type === option.value ? 'text-white' : 'text-primary'"
                          class="text-h6 mb-2"
                        >
                          {{ option.title }}
                        </h4>
                        <p 
                          :class="accountMethodStoreInstance.form_create_account_method.acc_type === option.value ? 'text-white' : 'text-grey'"
                          class="text-caption mb-0"
                        >
                          {{ option.description }}
                        </p>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-radio-group>
            </v-col>

          
            <v-col cols="12">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                ຂໍ້ມູນພື້ນຖານ
              </h3>
            </v-col>

            <v-col cols="12" md="6">
              <label>Reference ID <span class="text-error">*</span></label>
              <v-text-field
                v-model.number="accountMethodStoreInstance.form_create_account_method.ref_id"
                :rules="[rules.required]"
                type="number"
                placeholder="ລະຫັດອ້າງອີງ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                hint="ລະຫັດອ້າງອີງເອກະສານ ຫຼື ທຸລະກຳ"
              ></v-text-field>

              <label>Asset ID</label>
              <v-select
                v-model="accountMethodStoreInstance.form_create_account_method.asset_id"
                :items="assets"
                item-title="asset_tag"
                item-value="id"
                placeholder="ເລືອກຊັບສົມບັດ (ຖ້າກ່ຽວຂ້ອງ)"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                clearable
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="primary" variant="outlined">
                        {{ item.raw.asset_tag }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.asset_name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ formatCurrency(item.raw.asset_value) }} LAK</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>

              <label>ວັນທີ່ທຸລະກຳ <span class="text-error">*</span></label>
              <v-text-field
                v-model="accountMethodStoreInstance.form_create_account_method.transaction_date"
                :rules="[rules.required]"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>

              <label>ຍອດເງິນ <span class="text-error">*</span></label>
              <v-text-field
                v-model.number="accountMethodStoreInstance.form_create_account_method.amount"
                :rules="[rules.required, rules.positiveNumber]"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                prefix="₭"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <label>ບັນຊີເດບິດ (Dr) <span class="text-error">*</span></label>
              <v-select
                v-model="accountMethodStoreInstance.form_create_account_method.debit_account_id"
                :rules="[rules.requiredSelect]"
                :items="filteredDebitAccounts"
                item-title="name"
                item-value="id"
                placeholder="ເລືອກບັນຊີເດບິດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="error" variant="outlined">
                        {{ item.raw.id }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.type }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>

              <label>ບັນຊີເຄຣດິດ (Cr) <span class="text-error">*</span></label>
              <v-select
                v-model="accountMethodStoreInstance.form_create_account_method.credit_account_id"
                :rules="[rules.requiredSelect, rules.accountDifferent]"
                :items="filteredCreditAccounts"
                item-title="name"
                item-value="id"
                placeholder="ເລືອກບັນຊີເຄຣດິດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="success" variant="outlined">
                        {{ item.raw.id }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.type }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>

              <label>ສະຖານະເລຄອດ <span class="text-error">*</span></label>
              <v-select
                v-model="accountMethodStoreInstance.form_create_account_method.record_stat"
                :rules="[rules.requiredSelect]"
                :items="recordStatusOptions"
                item-title="title"
                item-value="value"
                placeholder="ເລືອກສະຖານະ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-select>

              <label>ຄຳອະທິບາຍ</label>
              <v-textarea
                v-model="accountMethodStoreInstance.form_create_account_method.description"
                :rules="[rules.maxLength500]"
                placeholder="ອະທິບາຍເພີ່ມເຕີມກ່ຽວກັບທຸລະກຳ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="3"
                maxlength="500"
                counter
              ></v-textarea>
            </v-col>

          
            <v-col cols="12" class="mt-6" v-if="accountMethodStoreInstance.form_create_account_method.acc_type">
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
                ຕົວຢ່າງລາຍການບັນຊີ
              </h3>

              <v-card variant="outlined" class="pa-4">
                <div class="d-flex align-center justify-space-around flex-wrap">
                  
                  <div class="text-center ma-2">
                    <v-card variant="outlined" color="error" class="pa-3" width="250">
                      <v-icon color="error" size="32" class="mb-2">mdi-minus-circle</v-icon>
                      <div class="text-subtitle-2 font-weight-bold">ບັນຊີເດບິດ</div>
                      <v-chip 
                        v-if="accountMethodStoreInstance.form_create_account_method.debit_account_id"
                        size="small" 
                        color="error" 
                        variant="flat" 
                        class="my-2"
                      >
                        {{ accountMethodStoreInstance.form_create_account_method.debit_account_id }}
                      </v-chip>
                      <div class="text-caption">
                        {{ accounts.find(acc => acc.id === accountMethodStoreInstance.form_create_account_method.debit_account_id)?.name || '-' }}
                      </div>
                      <div class="text-h6 text-error mt-2">
                        {{ accountMethodStoreInstance.form_create_account_method.amount ? formatCurrency(accountMethodStoreInstance.form_create_account_method.amount) : '0' }} LAK
                      </div>
                    </v-card>
                  </div>

              
                  <div class="text-center">
                    <v-icon size="48" color="primary">mdi-equal</v-icon>
                    <div class="text-caption text-primary mt-1">ເທົ່າກັບ</div>
                  </div>

                
                  <div class="text-center ma-2">
                    <v-card variant="outlined" color="success" class="pa-3" width="250">
                      <v-icon color="success" size="32" class="mb-2">mdi-plus-circle</v-icon>
                      <div class="text-subtitle-2 font-weight-bold">ບັນຊີເຄຣດິດ</div>
                      <v-chip 
                        v-if="accountMethodStoreInstance.form_create_account_method.credit_account_id"
                        size="small" 
                        color="success" 
                        variant="flat" 
                        class="my-2"
                      >
                        {{ accountMethodStoreInstance.form_create_account_method.credit_account_id }}
                      </v-chip>
                      <div class="text-caption">
                        {{ accounts.find(acc => acc.id === accountMethodStoreInstance.form_create_account_method.credit_account_id)?.name || '-' }}
                      </div>
                      <div class="text-h6 text-success mt-2">
                        {{ accountMethodStoreInstance.form_create_account_method.amount ? formatCurrency(accountMethodStoreInstance.form_create_account_method.amount) : '0' }} LAK
                      </div>
                    </v-card>
                  </div>
                </div>

            
                <v-divider class="my-4"></v-divider>
                <div class="text-center">
                  <div class="text-h6 mb-2">Journal Entry</div>
                  <v-simple-table density="compact">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">ບັນຊີ</th>
                          <th class="text-center">ເດບິດ (Dr)</th>
                          <th class="text-center">ເຄຣດິດ (Cr)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="accountMethodStoreInstance.form_create_account_method.debit_account_id">
                          <td>
                            <div class="font-weight-medium">
                              {{ accounts.find(acc => acc.id === accountMethodStoreInstance.form_create_account_method.debit_account_id)?.name || '-' }}
                            </div>
                            <div class="text-caption text-grey">
                              {{ accountMethodStoreInstance.form_create_account_method.debit_account_id }}
                            </div>
                          </td>
                          <td class="text-center text-error">
                            {{ accountMethodStoreInstance.form_create_account_method.amount ? formatCurrency(accountMethodStoreInstance.form_create_account_method.amount) : '0' }}
                          </td>
                          <td class="text-center">-</td>
                        </tr>
                        <tr v-if="accountMethodStoreInstance.form_create_account_method.credit_account_id">
                          <td>
                            <div class="font-weight-medium">
                              {{ accounts.find(acc => acc.id === accountMethodStoreInstance.form_create_account_method.credit_account_id)?.name || '-' }}
                            </div>
                            <div class="text-caption text-grey">
                              {{ accountMethodStoreInstance.form_create_account_method.credit_account_id }}
                            </div>
                          </td>
                          <td class="text-center">-</td>
                          <td class="text-center text-success">
                            {{ accountMethodStoreInstance.form_create_account_method.amount ? formatCurrency(accountMethodStoreInstance.form_create_account_method.amount) : '0' }}
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                  
                  <div class="text-caption mt-2 text-grey" v-if="accountMethodStoreInstance.form_create_account_method.description">
                    ຄຳອະທິບາຍ: {{ accountMethodStoreInstance.form_create_account_method.description }}
                  </div>
                </div>
              </v-card>
            </v-col>

           
            <v-col cols="12" class="mt-4">
              <v-card variant="outlined" color="info">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                  ຄຳແນະນຳ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ບັນຊີເດບິດ:</v-list-item-title>
                      <v-list-item-subtitle>ບັນຊີທີ່ໄດ້ຮັບປະໂຫຍດ ຫຼື ເພີ່ມຂຶ້ນ</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ບັນຊີເຄຣດິດ:</v-list-item-title>
                      <v-list-item-subtitle>ບັນຊີທີ່ໃຫ້ປະໂຫຍດ ຫຼື ລົດລົງ</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ກົດ Debit = Credit:</v-list-item-title>
                      <v-list-item-subtitle>ຍອດເດບິດຕ້ອງເທົ່າກັບຍອດເຄຣດິດ</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

          
            <v-col cols="12" class="d-flex flex-wrap justify-center mt-6">
              <v-btn 
                color="error" 
                variant="outlined"
                @click="goBack"
                class="mr-2"
                :disabled="accountMethodStoreInstance.isLoading"
              >
                ຍົກເລີກ
              </v-btn>
              
              <v-btn 
                color="primary" 
                type="submit" 
                :loading="accountMethodStoreInstance.isLoading"
                prepend-icon="mdi-content-save"
              >
                ບັນທຶກ
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.v-text-field input[type="number"] {
  -moz-appearance: textfield;
}

.v-text-field input[type="number"]::-webkit-outer-spin-button,
.v-text-field input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 4px;
  display: block;
}

.pb-6 {
  margin-bottom: 16px;
}

.flex-wrap {
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .d-flex.justify-space-around.flex-wrap {
    flex-direction: column;
    align-items: center;
  }
  
  .d-flex.justify-space-around.flex-wrap > div {
    margin: 8px 0;
  }
}
</style>