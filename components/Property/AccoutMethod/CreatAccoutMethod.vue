<script setup lang="ts">
const form = ref();
const valid = ref(false);
const title = "ເພີ່ມຕັ້ງຄ່າບັນທຶກບັນຊີຊັບສົມບັດໃໝ່";
const assetStores = assetStore();
const accounStore = accountMethodStore();
const masterStettingStore = useMasterStore();
const assetListStore = faAssetStore();
const masterStore = useMasterStore();
const cat = computed(() => {
  return masterStettingStore.respone_data_cat;
});
const masterdatato = computed(() => {
  return masterStettingStore.resposne_status_setting;
});

const assetlist = computed(() => {
  const data = assetListStore.response_fa_asset_list;
  if (!data || !Array.isArray(data)) return [];

  return data.filter(
    (item) => item.Auth_Status === "A" && item.Auth_Status_ARC === "A"
  );
});

const filteredAssetList = computed(() => {
  if (!request.asset_id) {
    return [];
  }

  if (!assetlist.value || !Array.isArray(assetlist.value)) {
    return [];
  }

  return assetlist.value.filter((assetItem) => {
    if (!assetItem.asset_id_detail || !assetItem.asset_id_detail.coa_id) {
      return false;
    }

    return assetItem.asset_id_detail.coa_id === request.asset_id;
  });
});

const masterdata = computed(() => {
  return masterStore.respone_data_master;
});

const request = accounStore.form_create_account_method;

const debitAccount = ref("");
const creditAccount = ref("");

const formatNumber = (value: number | string): string => {
  if (!value) return "";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return "";

  return numValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;

  const cleanValue = value.replace(/,/g, "");
  const numValue = parseFloat(cleanValue);

  return isNaN(numValue) ? 0 : numValue;
};

const handleNumberInput = (event: Event, field: string) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  const numValue = parseFormattedNumber(value);

  (request as any)[field] = numValue;
};

const handleNumberBlur = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  if (value) {
    const numValue = parseFormattedNumber(value);
    target.value = formatNumber(numValue);
  }
};

const handleNumberFocus = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  if (value) {
    const numValue = parseFormattedNumber(value);
    target.value = numValue.toString();
  }
};

const updateAccounts = () => {
  if (request.asset_id && asset.value && masterdatato.value) {
    const selectedAsset = asset.value.find(
      (assetItem) => assetItem.coa_id === request.asset_id
    );

    if (selectedAsset && selectedAsset.asset_type_detail) {
      const typeCode = selectedAsset.asset_type_detail.type_code;

      const matchedCode = masterdatato.value.MasterCodes?.find(
        (code) => code.MC_code === typeCode
      );

      if (matchedCode && matchedCode.MC_detail) {
        const accounts = matchedCode.MC_detail.split("|");
        if (accounts.length >= 2) {
          debitAccount.value = accounts[0];
          creditAccount.value = accounts[1];

          if (request.ref_id && assetlist.value) {
            const selectedAssetList = assetlist.value.find(
              (item) => item.asset_list_id === request.ref_id
            );

            if (selectedAssetList) {
              const assetListCode = selectedAssetList.asset_list_code;

              if (assetListCode) {
                debitAccount.value = accounts[0] + "." + assetListCode;
                creditAccount.value = accounts[1] + "." + assetListCode;
              }

              if (selectedAssetList.asset_value_remainBegin !== undefined) {
                request.amount_start =
                  selectedAssetList.asset_value_remainBegin;
              }

              if (selectedAssetList.asset_value_remainLast !== undefined) {
                request.amount_end = selectedAssetList.asset_value_remainLast;
              }
              if (selectedAssetList.asset_value !== undefined) {
                request.amount = selectedAssetList.asset_value;
              }
            }
          }
        }
      }
    }
  }
};

watch(
  () => request.asset_id,
  (newAssetId, oldAssetId) => {
    if (newAssetId !== oldAssetId) {
      request.ref_id = null;

      debitAccount.value = "";
      creditAccount.value = "";
      request.amount_start = 0;
      request.amount = 0;
      request.amount_end = 0;
      request.acc_type = request.acc_type || "ASSET";
    }

    updateAccounts();
  }
);

watch(
  () => request.ref_id,
  () => {
    updateAccounts();
  }
);

const handleSubmit = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    request.credit_account_id = creditAccount.value;
    request.debit_account_id = debitAccount.value;

    console.log("ຂໍ້ມູນທີ່ຈະສົ່ງ:", request);

    try {
      await accounStore.CreateAccountMethod();
      console.log("✅ ບັນທຶກສຳເລັດ!");
    } catch (error) {
      console.error("❌ ຜິດພາດໃນການບັນທຶກ:", error);
    }
  }
};

const asset = computed(() => {
  return assetStores.response_asset_list;
});

onMounted(() => {
  assetStores.GetAssetList();
  masterStettingStore.getSetting();
  masterStettingStore.getCAT();
  assetListStore.GetFaAssetList();
  masterStore.getDataAsset();

  setTimeout(() => {
    updateAccounts();
  }, 1000);
});
</script>

<template>
  <!-- <v-row>
    <v-col cols="6">
      <pre>{{ assetlist }}</pre> 
    </v-col>
    <v-col cols="6">
    <pre>{{ request }}</pre>  
    </v-col>
  </v-row>
 <pre>{{ cat }}</pre> -->
  <div class="pa-2">
    <GlobalTextTitleLine :title="title" />
    <v-form ref="form" @submit.prevent="handleSubmit">
      <v-row>
        <v-col cols="12" md="6">
          <v-label class="mb-1">
            ລະຫັດປະເພດຊັບສົມບັດ <span class="text-error">*</span>
          </v-label>
          <v-autocomplete
            v-model="request.asset_id"
            density="compact"
            label="ລະຫັດປະເພດຊັບສົມບັດ"
            :items="asset || []"
            item-title="asset_name_la"
            item-value="coa_id"
            variant="outlined"
            clearable
          >
            <template v-slot:selection="{ item }">
              {{ item.raw.asset_name_la }} ({{ item.raw.asset_code }})
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="item.raw.asset_name_la"
                :subtitle="`ລະຫັດ: ${item.raw.asset_code}`"
              />
            </template> </v-autocomplete
        ></v-col>
        <v-col cols="12" md="6">
          <v-label class="mb-1">
            ຊັບສົມບັດ <span class="text-error">*</span>
          </v-label>
          <v-autocomplete
            v-model="request.ref_id"
            density="compact"
            variant="outlined"
            label="ຊັບສົມບັດ"
            placeholder="ເລືອກຊັບສົມບັດ"
            item-title="asset_spec"
            item-value="asset_list_id"
            :items="filteredAssetList"
            :disabled="!request.asset_id"
            clearable
            no-data-text="ບໍ່ມີຂໍ້ມູນຊັບສົມບັດທີ່ກ່ຽວຂ້ອງ "
          >
            <template v-slot:selection="{ item }">
              {{ item.raw.asset_spec }}
              <small class="text-grey ml-2">
                ({{ item.raw.asset_id_detail?.asset_code }})
              </small>
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="item.raw.asset_spec"
                :subtitle="`${item.raw.asset_id_detail?.asset_code} - ${item.raw.asset_list_id}`"
              >
                <template v-slot:append>
                  <v-chip size="small" color="primary" variant="outlined">
                    {{ item.raw.asset_id_detail?.asset_name_la }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>
          
          </v-col
        >
        <v-col cols="12" md="4">
          <v-label class="mb-1">
            ຍອດເງິນ <span class="text-error">*</span>
          </v-label>
          <v-text-field
            :model-value="formatNumber(request.amount || 0)"
            density="compact"
            variant="outlined"
            label="ຍອດເງິນ"
            placeholder="0.00"
            @input="handleNumberInput($event, 'amount')"
            @blur="handleNumberBlur"
            @focus="handleNumberFocus"
          />
          <v-label class="mb-1">
            ບັນຊີເຄດິດ (Cr) <span class="text-error">*</span>
          </v-label>
          <v-text-field
            v-model="creditAccount"
            density="compact"
            variant="outlined"
            label="ບັນຊີເຄດິດ (Cr)"
            placeholder="ບັນຊີເຄດິດ"
            readonly
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-label class="mb-1">
            ມູນຄ່າເລີ່ມຕົ້ນ <span class="text-error">*</span>
          </v-label>
          <v-text-field
            readonly
            :model-value="formatNumber(request.amount_start || 0)"
            density="compact"
            variant="outlined"
            label="ມູນຄ່າຕົ້ນ"
            placeholder="0.00"
            @input="handleNumberInput($event, 'amount_start')"
            @blur="handleNumberBlur"
            @focus="handleNumberFocus"
          />
          <v-label class="mb-1">
            ບັນຊີເດບິດ (Dr) <span class="text-error">*</span>
          </v-label>
          <v-text-field
            readonly
            v-model="debitAccount"
            density="compact"
            variant="outlined"
            label="ບັນຊີເດບິດ (Dr)"
            placeholder="ບັນຊີເດບິດ"
          />
        </v-col>

        <v-col cols="12" md="4">
          <!-- <v-label class="mb-1">
            ວັນທີເຮັດຖຸລະກຳ <span class="text-error">*</span>
          </v-label> -->
          <!-- <v-text-field
          :hidden="true"
            readonly
            v-model="request.transaction_date"
            density="compact"
            variant="outlined"
            label="ວັນທີເຮັດຖຸລະກຳ"
            placeholder="ວັນທີເຮັດຖຸລະກຳ"
            type="date"
          /> -->

          <v-label class="mb-1">
            ມູນຄ່າທ້າຍ <span class="text-error">*</span>
          </v-label>
          <v-text-field
            readonly
            :model-value="formatNumber(request.amount_end || 0)"
            density="compact"
            variant="outlined"
            label="ມູນຄ່າທ້າຍ"
            placeholder="0.00"
            @input="handleNumberInput($event, 'amount_end')"
            @blur="handleNumberBlur"
            @focus="handleNumberFocus"
          />
        </v-col>
        <v-col cols="8"
          ><v-label class="mb-1">
            ລາຍລະອຽດ <span class="text-error">*</span>
          </v-label>
          <v-textarea
            v-model="request.description"
            density="compact"
            variant="outlined"
            label="ລາຍລະອຽດ"
            placeholder="ລາຍລະອຽດ"
            readonly
        /></v-col>

        <v-col cols="12" class="d-flex flex-wrap justify-center">
          <v-btn
            color="error"
            variant="outlined"
            class="mr-2"
            @click="goPath(`/property/accountmethod/`)"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn color="primary" type="submit" prepend-icon="mdi-content-save">
            ບັນທຶກ
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<style scoped>
.text-grey {
  color: #666;
}

.bg-grey-lighten-4 {
  background-color: #f5f5f5;
}

.text-grey-darken-2 {
  color: #424242;
}
</style>

<!-- <script lang="ts" setup>
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

    await new Promise(resolve => setTimeout(resolve, 500)); 
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
</style> -->
