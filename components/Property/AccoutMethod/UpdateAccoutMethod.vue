<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { formats } from "numeral";
import { useRoute } from "vue-router";
const masterStore = useMasterStore();
const masterAccount  = computed(()=>{
  const data = masterStore.resposne_status_setting_update;
  if(Array.isArray(data)){
    return data;
  }
  if(data && typeof data === "object"){
    return [data];
  }
  return [];
})
const getMasterAccountByCode = (mcCode: string) => {
  return masterAccount.value.find(item => item.MC_code === mcCode);
};

// ຟັງຊັນສຳລັບແຍກເລກບັນຊີ DR ແລະ CR ຈາກ MC_detail
const parseAccountNumbers = (mcDetail: string) => {
  if (!mcDetail) return { debitAccount: '', creditAccount: '' };
  
  const accounts = mcDetail.split('|');
  return {
    debitAccount: accounts[0] || '',
    creditAccount: accounts[1] || ''
  };
};
const route = useRoute();
const valid = ref();
const form = ref();
const id = Number(route.query.mapping_id) || 0;
const selectedAssetId = ref((route.query.mapping_id as string) || null);
const DisplayGl = (item: any) => {
  if (!item || !item.asset_spec || !item.asset_list_id) return "ທັງໝົດ";
  return `${item.asset_spec} (${item.asset_list_id})`;
};
const accountMethodStoreInstance = accountMethodStore();
const assetListStore = faAssetStore();

const totaldata = computed(() => {
  const data = assetListStore.response_fa_asset_list;
  if (!data || !Array.isArray(data)) return [];

  return data.filter(
    (item) => item.Auth_Status === "A" && item.Auth_Status_ARC === "A"
  );
});

const dataupdate = computed(() => {
  return assetListStore.response_fa_asset_detail;
});

const request = accountMethodStoreInstance.form_update_account_method;

const detail = computed(() => {
  return accountMethodStoreInstance.response_account_method_detail;
});

const extractLastNumber = (assetListId: string): string => {
  if (!assetListId) return "0000000";

  const parts = assetListId.split("-");
  const lastPart = parts[parts.length - 1];

  return lastPart || "0000000";
};

const debitAccountNumber = computed(() => {
  // ຖ້າບໍ່ມີ asset_list_id ໃຫ້ໃຊ້ຄ່າເກົ່າ
  if (!dataupdate.value?.asset_list_id && detail.value?.credit_account_id) {
    return detail.value.credit_account_id;
  }

  if (dataupdate.value?.asset_list_id) {
    // ດຶງ asset_code ຈາກ totaldata
    const selectedAsset = totaldata.value.find(
      item => item.asset_list_id === selectedAssetId.value
    );
    
    if (selectedAsset?.asset_id_detail?.asset_type_detail?.type_code) {
      const typeCode = selectedAsset.asset_id_detail.asset_type_detail.type_code;
      const masterAcc = getMasterAccountByCode(typeCode);
      
      if (masterAcc?.MC_detail) {
        const { debitAccount } = parseAccountNumbers(masterAcc.MC_detail);
        const lastNumber = extractLastNumber(dataupdate.value.asset_list_id);
        return `${debitAccount}.${lastNumber}`;
      } else {
        // ຖ້າຫາບໍ່ເຈີ masterAccount ໃຫ້ alert ເຕືອນ
        CallSwal({
          icon: "warning",
          title: "ຂໍ້ຜິດພາດ",
          text: `ບໍ່ພົບການຕັ້ງຄ່າບັນຊີສຳລັບປະເພດ: ${typeCode}`,
        });
        return "";
      }
    } else {
      // ຖ້າບໍ່ມີ type_code
      CallSwal({
        icon: "error",
        title: "ຂໍ້ຜິດພາດ",
        text: "ບໍ່ສາມາດກຳນົດປະເພດຊັບສົມບັດໄດ້",
      });
      return "";
    }
  }

  return "";
});
const creditAccountNumber = computed(() => {
  // ຖ້າບໍ່ມີ asset_list_id ໃຫ້ໃຊ້ຄ່າເກົ່າ
  if (!dataupdate.value?.asset_list_id && detail.value?.debit_account_id) {
    return detail.value.debit_account_id;
  }

  if (dataupdate.value?.asset_list_id) {
    // ດຶງ asset_code ຈາກ totaldata
    const selectedAsset = totaldata.value.find(
      item => item.asset_list_id === selectedAssetId.value
    );
    
    if (selectedAsset?.asset_id_detail?.asset_type_detail?.type_code) {
      const typeCode = selectedAsset.asset_id_detail.asset_type_detail.type_code;
      const masterAcc = getMasterAccountByCode(typeCode);
      
      if (masterAcc?.MC_detail) {
        const { creditAccount } = parseAccountNumbers(masterAcc.MC_detail);
        const lastNumber = extractLastNumber(dataupdate.value.asset_list_id);
        return `${creditAccount}.${lastNumber}`;
      } else {
        // ຖ້າຫາບໍ່ເຈີ masterAccount ໃຫ້ alert ເຕືອນ
        CallSwal({
          icon: "warning",
          title: "ຂໍ້ຜິດພາດ",
          text: `ບໍ່ພົບການຕັ້ງຄ່າບັນຊີສຳລັບປະເພດ: ${typeCode}`,
        });
        return "";
      }
    } else {
      // ຖ້າບໍ່ມີ type_code
      CallSwal({
        icon: "error",
        title: "ຂໍ້ຜິດພາດ",
        text: "ບໍ່ສາມາດກຳນົດປະເພດຊັບສົມບັດໄດ້",
      });
      return "";
    }
  }

  return "";
});

watch(selectedAssetId, async (newAssetId: any) => {
  if (newAssetId) {
    try {
      await assetListStore.GetFaAssetDetail(newAssetId);
      await accountMethodStoreInstance.GetAccountMethodDetail(newAssetId);
    } catch (error) {
      console.error("Error loading asset details:", error);
      CallSwal({
        icon: "error",
        title: "ຂໍ້ຜິດພາດ",
        text: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້",
      });
    }
  }
});
watch(
  () => route.query.asset_id,
  async (newValue) => {
    if (newValue) {
      selectedAssetId.value = newValue as string;
    }
  },
  { immediate: true }
);
watch(
  [
    () => accountMethodStoreInstance.response_account_method_detail,
    () => dataupdate.value,
  ],
  ([req, assetData]) => {
    if (req) {
      request.description = req.description;

      request.ref_id = assetData?.asset_list_id || req.ref_id;
      request.amount = assetData?.asset_value_remainMonth || req.amount ;
      request.amount_start = req.amount_start;
      request.amount_end = req.amount_end;
      request.debit_account_id = debitAccountNumber.value;
      request.credit_account_id = creditAccountNumber.value;
      request.transaction_date = assetData?.Maker_DT_Stamp
        ? dayjs(assetData.Maker_DT_Stamp).format("YYYY-MM-DD")
        : "";
    }
  },
  { immediate: true }
);

const handelSuvmit = async () => {
  if (!selectedAssetId.value) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ກະລຸນາເລືອກຊັບສົມບັດກ່ອນ",
    });
    return;
  }

  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຕອງການຢືນຢັນ",
      text: "ທ່ານຕ້ອງການອັບເດດຂໍ້ມູນນີ້ ຫຼື ບໍ່?",
      showCancelButton: true,
      confirmButtonText: "ຢືນຢັນ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "primary",
      cancelButtonColor: "error",
    });
    if (notification.isConfirmed) {
      try {
        await accountMethodStoreInstance.UpdateAccountMethod(id);
        CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ອັບເດດຂໍ້ມູນສຳເລັດແລ້ວ",
          timer: 2000,
        });
      } catch (error) {
        CallSwal({
          icon: "error",
          title: "ຜິດພາດ",
          text: "ບໍ່ສາມາດອັບເດດຂໍ້ມູນໄດ້",
        });
      }
    }
  }
};

onMounted(async () => {
  try {
    await masterStore.getSettingupdate();
    await assetListStore.GetFaAssetList();

    if (selectedAssetId.value) {
      await assetListStore.GetFaAssetDetail(selectedAssetId.value);
      await accountMethodStoreInstance.GetAccountMethodDetail(id);
    }
  } catch (error) {
    console.error("Error on mounted:", error);
  }
});

const title = "ລາຍລະອຽດການຕັ້ງຄ່າທືກບັນຊີຊັບສົມບັດ";
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <!-- <v-row>
    <v-col cols="6"><pre>{{ masterAccount }}</pre></v-col>
    <v-col cols="6"><pre>{{ totaldata }}</pre></v-col>
    </v-row> -->
    <v-card class="mb-4" variant="outlined">
      <v-card-title class="text-h6 pb-2 bg-primary">
        <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
        ເລືອກຊັບສົມບັດ
      </v-card-title>
      <v-card-text class="pt-4">
        <v-autocomplete
          v-model="selectedAssetId"
          :items="totaldata"
          :item-title="DisplayGl"
          item-value="asset_list_id"
          variant="outlined"
          density="compact"
          label="ຄົ້ນຫາ ແລະ ເລືອກຊັບສົມບັດ"
          clearable
          :loading="!totaldata.length"
          prepend-inner-icon="mdi-magnify"
        >
          <template v-slot:item="{ item, props }">
            <v-list-item
              v-bind="props"
              :title="`${item.raw.asset_spec}(${item.raw.asset_list_id})`"
            ></v-list-item>
          </template>
          <template #no-data>
            <v-list-item>
              <v-list-item-title>ບໍ່ພົບຂໍ້ມູນຊັບສົມບັດ</v-list-item-title>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>
    </v-card>

    <v-form ref="form" @submit.prevent="handelSuvmit">
      <div v-if="selectedAssetId && detail">
        <v-card variant="outlined">
          <v-card-title class="text-h6 pb-2 bg-success">
            <v-icon class="mr-2">mdi-information</v-icon>
            ຂໍ້ມູນລາຍລະອຽດບັນຊີ
          </v-card-title>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="3">
                <v-label class="mb-1">ປະເພດຊັບສົມບັດ</v-label>
                <v-text-field
                  :model-value="dataupdate?.asset_list_id || detail?.ref_id"
                  variant="outlined"
                  density="compact"
                  readonly
                />

                <v-label class="mb-1">ປະເພດທຸລະກຳ</v-label>
                <v-text-field
                  :model-value="detail?.acc_type"
                  variant="outlined"
                  density="compact"
                  readonly
                />

                <v-label class="mb-1">
                  ລາຍລະອຽດ <span class="text-error">*</span>
                </v-label>
                <v-text-field
                  v-model="request.description"
                  variant="outlined"
                  density="compact"
                  class="formatted-number-input"
                  :rules="[(v) => !!v || 'ກະລຸນາໃສ່ລາຍລະອຽດ']"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-label class="mb-1">ເລກບັນຊີ DR</v-label>
                <v-text-field
                  :model-value="debitAccountNumber"
                  variant="outlined"
                  density="compact"
                  readonly
                />

                <v-label class="mb-1">ມູນຄ່າຕໍ່ເດືອນ</v-label>
                <v-text-field
                
                  v-model="request.amount"
                  variant="outlined"
                  density="compact"
                
                  class="formatted-number-input"
                />
                <GlobalCardTitle
                  :text="dataupdate?.dpca_start_date ?? ''"
                  title="ວັນທີ່ເລີ່ມຫັກ"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-label class="mb-1">ເລກບັນຊີ CR</v-label>
                <v-text-field
                  :model-value="creditAccountNumber"
                  variant="outlined"
                  density="compact"
                  readonly
                />

                <v-label class="mb-1">ມູນຄ່າຕົ້ນ</v-label>
                <v-text-field
                  v-model="request.amount_start"
                  variant="outlined"
                  density="compact"
                  class="formatted-number-input"
                />
                <GlobalCardTitle
                  :text="
                    dataupdate?.asset_useful_life != null
                      ? Number(dataupdate.asset_useful_life) * 12 + 'ເດືອນ'
                      : ''
                  "
                  title="ອາຍຸໃນການໃຊ້ງານ"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-label class="mb-1">ວັນທີ່ເລີ່ມຖຸລະກຳ</v-label>
                <v-text-field
                  :model-value="
                    dayjs(dataupdate?.Maker_DT_Stamp).format('DD/MM/YYYY')
                  "
                  :v-model="request.transaction_date"
                  variant="outlined"
                  density="compact"
                />

                <v-label class="mb-1">ມູນຄ່າທ້າຍ</v-label>
                <v-text-field
                  v-model="request.amount_end"
                  variant="outlined"
                  density="compact"
                  class="formatted-number-input"
                />
                <GlobalCardTitle
                  :text="
                    dataupdate?.dpca_end_date || ''
                  "
                  title="ງວດສຸດທ້າຍ"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <div class="d-flex justify-center align-center mt-6">
          <v-btn
            type="submit"
            color="primary"
            class="mr-4"
            :loading="accountMethodStoreInstance.isLoading"
            prepend-icon="mdi-content-save"
          >
            ບັນທືກ
          </v-btn>
          <v-btn
            @click="goPath('/property/accountmethod/')"
            color="error"
            variant="outlined"
            prepend-icon="mdi-close"
          >
            ຍົກເລີກ
          </v-btn>
        </div>
      </div>

      <div v-else class="text-center pa-16">
        <v-icon size="80" color="grey-lighten-2"
          >mdi-package-variant-closed</v-icon
        >
        <h3 class="text-h5 text-grey-lighten-1 mt-4 mb-2">
          ກະລຸນາເລືອກຊັບສົມບັດ
        </h3>
        <p class="text-body-1 text-grey">
          ເລືອກຊັບສົມບັດຈາກລາຍການຂ້າງເທິງເພື່ອເບິ່ງ ແລະ ແກ້ໄຂລາຍລະອຽດ
        </p>
      </div>
    </v-form>
  </div>
</template>

<style scoped>
.formatted-number-input .v-field__input {
  text-align: right;
  font-family: "Roboto Mono", monospace;
  font-weight: 500;
}

.formatted-number-input .v-field__input input {
  text-align: right;
}

.bg-success {
  background-color: #e8f5e8 !important;
}

.bg-info {
  background-color: #e3f2fd !important;
}
</style>
