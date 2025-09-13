<script setup lang="ts">
const title = "ຊຳລະສະສາງຊັບສົມບັດ";
const dispalsoStore = useDispoalStore();
const faasetStore = faAssetStore();
const masterType = useMasterStore();
const employee = useEmployeeStore();
const form = ref();
const rout = useRoute();
const type = rout.query.type as string;

const gdaData = computed(() => {
  const data = masterType.respons_data_gda;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const gdlData = computed(() => {
  const data = masterType.respons_data_lda;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const formatNumber = (value: string | number) => {
  if (!value) return "";
  const num = parseFloat(value.toString().replace(/,/g, ""));
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("en-US").format(num);
};

const parseNumber = (value: string) => {
  if (!value) return "";
  return value.replace(/,/g, "");
};

const dpsData = computed(() => {
  const data = masterType.respons_data_status_dps;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const masterData = computed(() => {
  const data = masterType.respons_data_status_nuw1;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const employees = computed(() => {
  const data = employee.respose_data_employee;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    return [data];
  }

  return [];
});

const typeData = computed(() => {
  const data = masterType.respons_data_status_nuw;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const request = dispalsoStore.from_create_disposal;

const dataList = computed(() => {
  const data = faasetStore.response_fa_asset_list;
  let asset = [];
  if (Array.isArray(data)) {
    return (asset = data);
  } else if (data && typeof data === "object") {
    return (asset = [data]);
  } else {
    return [];
  }
  return asset.filter(
    (item) =>
      item.asset.asset_status !== "UC" ||
      item.Auth_Status === "A" ||
      item.Auth_Status_ARC === "A" ||
      item.asset.asset_status !== "DS"
  );
});

// ເພີ່ມ computed ສຳລັບກຳນົດປະເພດຊັບສິນ
const selectedAssetType = computed(() => {
  if (!request.asset_list_id || !Array.isArray(dataList.value)) {
    return null;
  }

  const selectedAsset = dataList.value.find(
    (item) => item.asset_list_id === request.asset_list_id
  );

  return selectedAsset?.asset_id_detail?.asset_type_detail?.is_tangible || null;
});

// ເພີ່ມ computed ສຳລັບດຶງບັນຊີກຳໄລທີ່ຖືກຕ້ອງ
const getGainAccount = computed(() => {
  const assetType = selectedAssetType.value;

  if (!assetType) return null;

  if (assetType === "1") {
    // ຊັບສິນບໍ່ມີຕົວຕົນ (Intangible)
    return gdaData.value.find((item) => item.MC_code === "GDI");
  } else if (assetType === "2") {
    // ຊັບສິນມີຕົວຕົນ (Tangible)
    return gdaData.value.find((item) => item.MC_code === "GDT");
  }

  return null;
});

// ເພີ່ມ computed ສຳລັບດຶງບັນຊີຂາດທຶນທີ່ຖືກຕ້ອງ
const getLossAccount = computed(() => {
  const assetType = selectedAssetType.value;

  if (!assetType) return null;

  if (assetType === "1") {
    // ຊັບສິນບໍ່ມີຕົວຕົນ (Intangible)
    return gdlData.value.find((item) => item.MC_code === "LDI");
  } else if (assetType === "2") {
    // ຊັບສິນມີຕົວຕົນ (Tangible)
    return gdlData.value.find((item) => item.MC_code === "LDT");
  }

  return null;
});

const getComparisonValue = computed(() => {
  if (!request.asset_list_id || !Array.isArray(dataList.value)) {
    return 0;
  }

  const selectedAsset = dataList.value.find(
    (item) => item.asset_list_id === request.asset_list_id
  );

  if (!selectedAsset) return 0;

  if (type === "expired") {
    return parseFloat(selectedAsset.asset_salvage_value || "0");
  } else {
    const assetValue = parseFloat(selectedAsset.asset_value || "0");
    const accuDpca = parseFloat(selectedAsset.asset_accu_dpca_value || "0");
    return assetValue - accuDpca;
  }
});

const disposalStatusOptions = computed(() => {
  if (!Array.isArray(dpsData.value) || dpsData.value.length === 0) {
    return [];
  }

  const filteredData = dpsData.value.filter((item) => {
    if (type === "expired") {
      return ["DPS01", "DPS02", "DPS03", "DPS04"].includes(item.MC_code);
    } else {
      return ["DPS05", "DPS06", "DPS07", "DPS08"].includes(item.MC_code);
    }
  });

  return filteredData.map((item) => ({
    title: item.MC_name_la,
    value: item.MC_code,
    detail: item.MC_detail,
    bol_code: item.BOL_code,
  }));
});

const calculateGainLoss = computed(() => {
  const proceeds = parseFloat(parseNumber(request.disposal_proceeds) || "0");
  const comparisonValue = getComparisonValue.value;

  if (!request.asset_list_id || proceeds === 0) {
    return {
      status: "",
      label: "ກະລຸນາເລືອກຊັບສິນ ແລະ ໃສ່ລາຍຮັບຈາກການຂາຍ",
      color: "info",
      account: null,
    };
  }

  const gainAccount = getGainAccount.value;
  const lossAccount = getLossAccount.value;

  if (type === "expired") {
    if (proceeds > comparisonValue) {
      return {
        status: "DPS02",
        label: "ຊັບສົມບັດຄົງທີ່ຄົບອາຍຸ ແລະຂາຍໄດ້ກຳໄລ",
        color: "success",
        account: gainAccount,
      };
    } else if (proceeds === comparisonValue) {
      return {
        status: "DPS01",
        label: "ຊັບສົມບັດຄົງທີ່ ຄົບອາຍຸ ແລະ ຂາຍໄດ້ເທົ່າທຶນ",
        color: "warning",
        account: null,
      };
    } else {
      return {
        status: "DPS03",
        label: "ຊັບສົມບັດຄົງທີ່ຄົບອາຍຸ ແລະ ຂາຍຂາດທຶນ",
        color: "error",
        account: lossAccount,
      };
    }
  } else {
    if (proceeds > comparisonValue) {
      return {
        status: "DPS06",
        label: "ສະສາງບໍ່ຄົບກຳນົດມີກຳໄລ",
        color: "success",
        account: gainAccount,
      };
    } else if (proceeds === comparisonValue) {
      return {
        status: "DPS05",
        label: "ສະສາງບໍ່ຄົບກຳນົດເທົ່າທຶນ",
        color: "warning",
        account: null,
      };
    } else {
      return {
        status: "DPS07",
        label: "ສະສາງບໍ່ຄົບກຳນົດຂາດທຶນ",
        color: "error",
        account: lossAccount,
      };
    }
  }
});

const handleNonSaleDisposal = () => {
  if (type === "expired") {
    request.gain_loss = "DPS04";
  } else {
    request.gain_loss = "DPS08";
  }

  request.disposal_proceeds = "";
};
const handleDisposalCostInput = (event: any) => {
  const value = event.target.value;
  const rawValue = parseNumber(value);
  request.disposal_cost = rawValue;
  event.target.value = formatNumber(rawValue);
};

const handleDisposalValueInput = (event: any) => {
  const value = event.target.value;
  const rawValue = parseNumber(value);
  request.disposal_value = rawValue;
  event.target.value = formatNumber(rawValue);
};

const handleDisposalProceedsInput = (event: any) => {
  const value = event.target.value;
  const rawValue = parseNumber(value);
  request.disposal_proceeds = rawValue;
  event.target.value = formatNumber(rawValue);
};

watch(
  [() => request.disposal_proceeds, () => request.asset_list_id],
  () => {
    if (request.asset_list_id) {
      if (
        request.disposal_proceeds &&
        parseFloat(parseNumber(request.disposal_proceeds)) > 0
      ) {
        const result = calculateGainLoss.value;
        if (result.status) {
          request.gain_loss = result.status;
        }
      } else {
        request.gain_loss = "";
      }
    }
  },
  { immediate: true }
);

// ປັບປຸງ handelSubmit function
const handelSubmit = async () => {
  try {
    const isValid = form.value.validate();
    if (isValid) {
      const notification = await CallSwal({
        icon: "warning",
        title: "ຄຳເຕືອນ",
        text: `ທ່ານກຳລັງຈະເພີ່ມລາຍການສ່າງ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
        showCancelButton: true,
        confirmButtonText: "ຕົກລົງ",
        cancelButtonText: "ຍົກເລີກ",
      });

      if (notification.isConfirmed) {
        const selecAcount = dpsData.value.find(
          (item) => item.MC_code === request.gain_loss
        );
        if (selecAcount) {
          dispalsoStore.from_create_disposal.dps_account =
            selecAcount.MC_detail;
          console.log(
            "dps_account:",
            dispalsoStore.from_create_disposal.dps_account
          );
        }

        
        const calculationResult = calculateGainLoss.value;
        if (calculationResult.account ) {
          dispalsoStore.from_create_disposal.gain_loss_account  =
            calculationResult.account.MC_detail;
          console.log(
            "Gain/Loss Account:",
            calculationResult.account.MC_detail
          );
          console.log(
            "Asset Type:",
            selectedAssetType.value === "1" ? "Intangible" : "Tangible"
          );
        }

        const selectedAsset = dataList.value.find(
          (item) => item.asset_list_id === request.asset_list_id
        );

        if (selectedAsset) {
          dispalsoStore.from_create_disposal.asset_list_code =
            selectedAsset.asset_list_code;
          console.log(
            "Asset:",
            dispalsoStore.from_create_disposal.asset_list_code
          );
        }

        await dispalsoStore.CreateDispalso();
      }
    }
  } catch (error) {
    CallSwal({
      icon: "error",
      title: "ຂໍ້ຜິດພາດ",
      text: "ກະລຸນາເລືອກຊັບສົມບັດກ່ອນ",
    });
  }
};

watch(
  () => rout.query.asset_list_id,
  (newValue) => {
    if (newValue) {
      request.asset_list_id = newValue as any;
    }
  },
  { immediate: true }
);

const nameAsset = (nameAsset: any) => {
  if (!nameAsset || !nameAsset.asset_spec || !nameAsset.asset_spec)
    return "ທັງໝົດ";
  return `${nameAsset.asset_spec}(${nameAsset.asset_list_id})`;
};

onMounted(() => {
  masterType.getDT();
  faasetStore.GetFaAssetList();
  employee.GetEmployee();
  masterType.getEP();
  masterType.getDPS();
  masterType.getLDA();
  masterType.getGDA();
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
<pre>
  {{ gdaData }}
</pre>
<pre>
  {{ gdlData }}
</pre>
    <v-form ref="form" @submit.prevent="handelSubmit">
      <v-row>
         <v-col cols="12">
          <div class="d-flex justify-end aling-end">
            <p>
              ສະຖານະ:
              <v-chip v-if="type === 'not_expired'" color="error">
                ບໍ່ຄົບກຳນົດການໃຊ້ງານ</v-chip
              >
              <v-chip v-if="type === 'expired'" color="success">
                ຄົບກຳນົດການໃຊ້ງານ</v-chip
              >
            </p>
          </div>
        </v-col>
<!--
        <v-col cols="12" v-if="request.asset_list_id">
          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <h6 class="text-h6 mb-2">ຂໍ້ມູນຊັບສິນທີ່ເລືອກ</h6>
                  <p class="text-caption mb-1">
                    ປະເພດຊັບສິນ:
                    <v-chip
                      :color="selectedAssetType === '1' ? 'blue' : 'green'"
                      size="small"
                      variant="outlined"
                    >
                      {{
                        selectedAssetType === "1"
                          ? "ບໍ່ມີຕົວຕົນ (Intangible)"
                          : "ມີຕົວຕົນ (Tangible)"
                      }}
                    </v-chip>
                  </p>
                  <p class="text-caption mb-1">
                    ບັນຊີກຳໄລ:
                    <span class="font-weight-bold text-success">
                      {{ getGainAccount?.MC_detail || "N/A" }}
                    </span>
                    <span class="text-grey">
                      ({{ getGainAccount?.MC_name_la }})
                    </span>
                  </p>
                  <p class="text-caption">
                    ບັນຊີຂາດທຶນ:
                    <span class="font-weight-bold text-error">
                      {{ getLossAccount?.MC_detail || "N/A" }}
                    </span>
                    <span class="text-grey">
                      ({{ getLossAccount?.MC_name_la }})
                    </span>
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col> -->

        <v-col cols="12" md="3">
          <v-autocomplete
            :loading="faasetStore.isLoading"
            v-model="request.asset_list_id"
            label="ລາຍການຊັບສີນ"
            :items="dataList"
            :item-title="nameAsset"
            item-value="asset_list_id"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.asset_spec}(${item.raw.asset_list_id})`"
              ></v-list-item>
            </template>
          </v-autocomplete>

          <v-autocomplete
            v-model="request.disposal_type"
            label="ປະເພດການຊຳລະສະສາງ"
            :items="typeData"
            item-title="MC_name_la"
            item-value="MC_code"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.MC_name_la}(${item.raw.MC_code})`"
              ></v-list-item>
            </template>
          </v-autocomplete>

          <v-text-field
            variant="outlined"
            density="compact"
            :model-value="formatNumber(request.disposal_cost)"
            @input="handleDisposalCostInput"
            label="ຄ່າໃຊ້ຈ່າຍໃນການຖອນ"
            type="text"
          >
          </v-text-field>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_purpose"
            label="ຈຸດປະສົງການຖອນ"
          >
          </v-text-field>

          <v-text-field
            :model-value="formatNumber(request.disposal_value)"
            @input="handleDisposalValueInput"
            label="ມູນຄ່າການຖອນ"
            variant="outlined"
            density="compact"
            type="text"
          >
          </v-text-field>

          <v-autocomplete
            v-model="request.gain_loss"
            label="ສະຖານະການຖອນ"
            :items="disposalStatusOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="item.raw.title"
                :subtitle="`Code: ${item.raw.value} | BOL: ${item.raw.bol_code}`"
              ></v-list-item>
            </template>
          </v-autocomplete>

          <div class="mt-2">
            <v-btn
              v-if="type === 'expired'"
              @click="handleNonSaleDisposal"
              variant="outlined"
              color="warning"
              size="small"
              block
            >
              ສະສາງແບບບໍ່ໄດ້ຂາຍອອກ
            </v-btn>
            <v-btn
              v-if="type === 'not_expired'"
              @click="handleNonSaleDisposal"
              variant="outlined"
              color="warning"
              size="small"
              block
            >
              ສະສາງໂດຍບໍ່ໄດ້ຂາຍ (ເປ້ເພ/ຖິ້ມ)
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.disposal_reason"
            label="ເຫດຜົນການຖອນ"
          >
          </v-text-field>

          <v-autocomplete
            v-model="request.disposal_by"
            label="ຜູ້ຖອນ"
            :items="employees"
            item-title="employee_name_la"
            item-value="employee_id"
            variant="outlined"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.employee_name_la}(${item.raw.employee_id})`"
              ></v-list-item>
            </template>
          </v-autocomplete>

          <v-text-field
            type="date"
            variant="outlined"
            density="compact"
            v-model="request.disposal_date"
            label="ວັນທີ່ຖອນ"
          >
          </v-text-field>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            variant="outlined"
            density="compact"
            v-model="request.buyer_name"
            label="ຊື່ຜູ້ຊື້ (ກໍລະນີຂາຍ)"
          >
          </v-text-field>

          <v-text-field
            variant="outlined"
            density="compact"
            :model-value="formatNumber(request.disposal_proceeds)"
            @input="handleDisposalProceedsInput"
            label="ລາຍຮັບຈາກການຂາຍ"
            type="text"
          >
          </v-text-field>

          <div v-if="request.asset_list_id" class="mt-2">
            <v-card variant="outlined" density="compact">
              <v-card-text class="py-2">
                <div class="text-caption mb-1">
                  <strong>ຂໍ້ມູນການຄິດໄລ່:</strong>
                </div>
                <div class="text-caption">
                  ມູນຄ່າທີ່ໃຊ້ທຽບ:
                  <span class="font-weight-bold text-primary">
                    {{
                      new Intl.NumberFormat("en-US").format(getComparisonValue)
                    }}
                    LAK
                  </span>
                  <span class="text-grey" style="font-size: 10px">
                    {{
                      type === "expired" ? "(ມູນຄ່າຊາກ)" : "(ມູນຄ່າຄົງເຫຼືອ)"
                    }}
                  </span>
                </div>
                <div class="text-caption">
                  ລາຍຮັບຈາກການຂາຍ:
                  <span class="font-weight-bold text-secondary">
                    {{
                      new Intl.NumberFormat("en-US").format(
                        parseFloat(
                          parseNumber(request.disposal_proceeds) || "0"
                        )
                      )
                    }}
                    LAK
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- ປັບປຸງສ່ວນ alert ເພື່ອສະແດງບັນຊີທີ່ຈະໃຊ້ -->
          <v-alert
            v-if="
              request.asset_list_id &&
              request.disposal_proceeds &&
              parseFloat(parseNumber(request.disposal_proceeds)) > 0
            "
            :color="calculateGainLoss.color"
            variant="tonal"
            density="compact"
            class="mt-2"
          >
            <div class="text-caption">
              <strong>ສະຖານະການຄິດໄລ່:</strong><br />
              {{ calculateGainLoss.label }}
              <br />
              <span v-if="calculateGainLoss.account" class="font-weight-bold">
                ບັນຊີທີ່ໃຊ້: {{ calculateGainLoss.account.MC_detail }}
                <br />
                <span class="text-grey">{{
                  calculateGainLoss.account.MC_name_la
                }}</span>
              </span>
            </div>
          </v-alert>
        </v-col>
      </v-row>

      <v-col cols="12">
        <div class="d-flex justify-center">
          <v-btn type="submit" color="primary">ບັນທຶກ</v-btn>
          <v-btn
            type="button"
            color="error"
            class="ml-2"
            @click="goPath(`/property/dispalso/`)"
          >
            ຍົກເລີກ
          </v-btn>
        </div>
      </v-col>
    </v-form>
  </div>
</template>
