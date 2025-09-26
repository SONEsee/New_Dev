<script setup lang="ts">
const form = ref();
const valid = ref(false);
const title = "ເພີ່ມຕັ້ງຄ່າບັນທຶກບັນຊີຊັບສົມບັດໃໝ່";
const assetStores = assetStore();
const accounStore = accountMethodStore();
const masterStettingStore = useMasterStore();
const assetListStore = faAssetStore();
const masterStore = useMasterStore();
const route = useRoute();

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
const StardDate = (apdc_start_date: any) => {
  if (!apdc_start_date || !Array.isArray(assetlist.value)) return "_";
  const itemData = assetlist.value.find(
    (item) => item.asset_list_id === apdc_start_date
  );
  return itemData ? itemData.dpca_start_date : "_";
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
        (code: any) => code.MC_code === typeCode
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
                  selectedAssetList.asset_value_remainBegin ;
              }

              if (selectedAssetList.asset_value_remainLast !== undefined) {
                request.amount_end = selectedAssetList.asset_value_remainLast;
              }
              if (selectedAssetList.asset_value !== undefined) {
                request.amount = selectedAssetList.asset_value_remainMonth;
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
// watch(
//   () => route.query.asset_id,
//   (newValue) => {
//     if (newValue) {
//       accounStore.form_create_account_method.asset_id = Number(newValue);
//     }
//   },
//   { immediate: true }
// );

watch(
  () => route.query.asset_id,
  (newValue) => {
    if (newValue) {
      request.asset_id = Number(newValue);
    }
  },
  { immediate: true }
);
onMounted(() => {
  request.transaction_date = new Date().toISOString().split("T")[0] as any;
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
  </v-row>-->
 <!-- <pre>{{ masterdatato }}</pre>  -->
  <div class="pa-2">
    <GlobalTextTitleLine :title="title" />
    <v-form ref="form" @submit.prevent="handleSubmit">
      <v-row no-gutters>
        <v-col cols="12" md="4">
          <v-label class="mb-1">
            ລະຫັດປະເພດຊັບສົມບັດ <span class="text-error">*</span>
          </v-label>
          <v-autocomplete
            :loading="assetStores.isLoading"
            class="pa-1"
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
                :title="`${item.raw.asset_name_la} (${item.raw.asset_code})`"
              />
            </template> </v-autocomplete
        ></v-col>
        <v-col cols="12" md="8">
          <v-label class="mb-1">
            ຊັບສົມບັດ <span class="text-error">*</span>
          </v-label>
          <v-autocomplete
            :loading="assetListStore.isLoading"
            class="pa-1"
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
        </v-col>
        <v-col cols="12" md="4">
          <v-label class="mb-1">
            ຄ່າລຸ້ຍຫ້ຽນຕໍ່ເດືອນ <span class="text-error">*</span>
          </v-label>
          <v-text-field
            readonly
            class="pa-1"
            :model-value="formatNumber(request.amount || 0)"
            density="compact"
            variant="outlined"
            label="ຄ່າລຸ້ຍຫ້ຽນຕໍ່ເດືອນ"
            placeholder="0.00"
            @input="handleNumberInput($event, 'amount')"
            @blur="handleNumberBlur"
            @focus="handleNumberFocus"
          />
          <v-label class="mb-1">
            ບັນຊີເດບິດ (Dr) <span class="text-error">*</span>
          </v-label>
          <v-text-field
            class="pa-1"
            readonly
            v-model="debitAccount"
            density="compact"
            variant="outlined"
            label="ບັນຊີເດບິດ (Dr)"
            placeholder="ບັນຊີເດບິດ"
          />
        </v-col>

        <v-col cols="12" md="4" class="">
          <v-label class="mb-1">
            ຄ່າຫຼູຍຫ້ຽນຂອງເດືອນເລີ່ມຕົ້ນ <span class="text-error">*</span>
          </v-label>
          <v-text-field
            class="pa-1"
            readonly
            :model-value="formatNumber(request.amount_start || 0)"
            density="compact"
            variant="outlined"
            label="ຄ່າຫຼູຍຫ້ຽນຂອງເດືອນເລີ່ມຕົ້ນ"
            placeholder="0.00"
            @input="handleNumberInput($event, 'amount_start')"
            @blur="handleNumberBlur"
            @focus="handleNumberFocus"
          />
          
          <v-label class="mb-1">
            ບັນຊີເຄດິດ (Cr) <span class="text-error">*</span>
          </v-label>
          <v-text-field
            class="pa-1"
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
            ມູນຄ່າຫຼູຍຫ້ຽນຂອງເດືອນສຸດທ້າຍ <span class="text-error">*</span>
          </v-label>
          <v-text-field
            class="pa-1"
            readonly
            :model-value="formatNumber(request.amount_end || 0)"
            density="compact"
            variant="outlined"
            label="ມູນຄ່າຫຼູຍຫ້ຽນຂອງເດືອນສຸດທ້າຍ"
            placeholder="0.00"
            @input="handleNumberInput($event, 'amount_end')"
            @blur="handleNumberBlur"
            @focus="handleNumberFocus"
          />

          <GlobalCardTitle
            :title="'ວັນທີ່ເລີ່ມຫັກ'"
            :text="StardDate(request.ref_id)"
          />

          <v-label class="mb-1" style="display: none">
            ວັນທີເຮັດຖຸລະກຳ <span class="text-error">*</span>
          </v-label>
          <v-text-field
            style="display: none"
            readonly
            v-model="request.transaction_date"
            density="compact"
            variant="outlined"
            label="ວັນທີເຮັດຖຸລະກຳ"
            placeholder="ວັນທີເຮັດຖຸລະກຳ"
            type="date"
          />
        </v-col>
        <v-col cols="8"
          ><v-label class="mb-1">
            ລາຍລະອຽດ <span class="text-error">*</span>
          </v-label>
          <v-textarea
            class="pa-1"
            v-model="request.description"
            density="compact"
            variant="outlined"
            label="ລາຍລະອຽດ"
            placeholder="ລາຍລະອຽດ"
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
.v-col {
  padding: 0 !important;
}
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
