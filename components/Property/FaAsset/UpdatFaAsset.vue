<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter, useRoute } from "vue-router";

const rout = useRoute();
const faAssetStoreInstance = faAssetStore();
const router = useRouter();
const id = rout.query.id_faasset as string;

const detaildata = computed(() => {
  return faAssetStoreInstance.response_fa_asset_detail;
});

const assetStoreInstance = assetStore();
const mockData = computed(() => {
  return assetStoreInstance.response_asset_list || [];
});

const assetcode = computed(() => {
  return faAssetStoreInstance.response_fa_asset_list;
});

const locationStoreInstance = locationStore();
const location = computed(() => {
  return locationStoreInstance.response_location_list || [];
});

const supplierStoreInstance = supplierStore();
const supplier = computed(() => {
  return supplierStoreInstance.response_supplier_list || [];
});

const title = ref("ແກ້ໄຂຊັບສິນພວມຊື້ພວມກໍ່ສ້າງ");
const loading = ref(false);
const form = ref();

const assetStatusOptions = [
  { title: "ເປີດໃຊ້ງານ", value: "ACTIVE" },
  { title: "ປິດໃຊ້ງານ", value: "INACTIVE" },
  { title: "ຊ່ອມແປງ", value: "MAINTENANCE" },
  { title: "ຖອນຈຳໜ່າຍ", value: "DISPOSED" },
];

const currencyOptions = [
  { title: "ກີບລາວ (LAK)", value: "LAK" },
  { title: "ດໍລ່າສະຫະລັດ (USD)", value: "USD" },
  { title: "ບາດໄທ (THB)", value: "THB" },
];

const doca_type = [
  { title: "ເສັ້ນຊື່", value: "SL" },
  { title: "ຍອດລົດລົງ", value: "DL" },
  { title: "ຕາມໜວຍພະລິດ", value: "PU" },
];

const assetAcOptions = [
  { title: "ມີ", value: "Y" },
  { title: "ບໍ່ມີ", value: "N" },
];

const hasDepreciationOptions = [
  { title: "ມີເສື່ອມລາຄາ", value: "Y" },
  { title: "ບໍ່ມີເສື່ອມລາຄາ", value: "N" },
];

const playtype = [
  { title: "ເງິນສົດ or Cash", value: "1101100" },
  { title: "ເງິນສົດຄັງຍ່ອຍ or Petty cash", value: "1101200" },
  { title: "ບັນຊີຝາກປະຢັດ Or Savings deposits ", value: "1121130" },
  {
    title: "ບັນຊີເງິນຝາກກະແສລາຍວັນ Or Current account deposits ",
    value: "1121110",
  },
];

const isAutoCalculating = ref(false);


const formatNumber = (value: any) => {
  if (!value && value !== 0) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "";

  if (num % 1 === 0) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  } else {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }
};

const parseFormattedNumber = (value: any) => {
  if (!value) return null;
  const cleanValue = value.toString().replace(/,/g, "");
  const num = parseFloat(cleanValue);
  return isNaN(num) ? null : num;
};


const formattedAssetValue = computed({
  get: () => formatNumber(faAssetStoreInstance.form_update_fa_asset.asset_value),
  set: (val) => {
    faAssetStoreInstance.form_update_fa_asset.asset_value = parseFormattedNumber(val);
  },
});

const formattedSalvageValue = computed({
  get: () => formatNumber(faAssetStoreInstance.form_update_fa_asset.asset_salvage_value),
  set: (val) => {
    faAssetStoreInstance.form_update_fa_asset.asset_salvage_value = parseFormattedNumber(val);
  },
});

const formattedAccuDpcaValue = computed({
  get: () => formatNumber(faAssetStoreInstance.form_update_fa_asset.asset_accu_dpca_value),
  set: (val) => {
    faAssetStoreInstance.form_update_fa_asset.asset_accu_dpca_value = parseFormattedNumber(val);
  },
});

const formattedAssetValueRemain = computed(() => {
  return formatNumber(faAssetStoreInstance.form_update_fa_asset.asset_value_remain);
});

const formattedAssetValueRemainBegin = computed(() => {
  return formatNumber(faAssetStoreInstance.form_update_fa_asset.asset_value_remainBegin);
});

const formattedAssetValueRemainMonth = computed(() => {
  const assetValue = faAssetStoreInstance.form_update_fa_asset.asset_value;
  const usefulLife = faAssetStoreInstance.form_update_fa_asset.asset_useful_life;

  if (assetValue && usefulLife && usefulLife > 0) {
    const monthlyValue = assetValue / (usefulLife * 12);
    const roundedValue = Math.round(monthlyValue * 100) / 100;

    faAssetStoreInstance.form_update_fa_asset.asset_value_remainMonth = roundedValue;
    return formatNumber(roundedValue);
  }

  faAssetStoreInstance.form_update_fa_asset.asset_value_remainMonth = 0;
  return formatNumber(0);
});

const formattedAssetValueRemainLast = computed(() => {
  return formatNumber(faAssetStoreInstance.form_update_fa_asset.asset_value_remainLast);
});


const generateNextAssetCode = () => {
  const assetCodes = assetcode.value || [];

  if (assetCodes.length === 0) {
    return "0001";
  }

  let maxNumber = 0;

  assetCodes.forEach((asset) => {
    if (asset.asset_list_code) {
      const codeNumber = parseInt(asset.asset_list_code);
      if (!isNaN(codeNumber) && codeNumber > maxNumber) {
        maxNumber = codeNumber;
      }
    }
  });

  const nextNumber = maxNumber + 1;
  return nextNumber.toString().padStart(4, "0");
};


const generateAssetListId = () => {
  const selectedAssetTypeId = faAssetStoreInstance.form_update_fa_asset.asset_type_id;
  const assetListCode = faAssetStoreInstance.form_update_fa_asset.asset_list_code;

  if (!selectedAssetTypeId || !assetListCode) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset.coa_id === selectedAssetTypeId
  );

  if (!selectedAsset) {
    return "";
  }

  const assetCode = selectedAsset.asset_code;

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const yearMonth = `${year}${month}`;

  return `${assetCode}-${yearMonth}-${assetListCode}`;
};


const generateSerialNumber = () => {
  const selectedAssetTypeId = faAssetStoreInstance.form_update_fa_asset.asset_type_id;
  const assetListCode = faAssetStoreInstance.form_update_fa_asset.asset_list_code;

  if (!selectedAssetTypeId || !assetListCode) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset.coa_id === selectedAssetTypeId
  );

  if (!selectedAsset) {
    return "";
  }

  const assetCode = selectedAsset.asset_code;

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const dateString = `${year}${month}${day}`;

  return `SN-${assetCode}-${dateString}-${assetListCode}`;
};


const generateSerialtag = () => {
  const selectedAssetTypeId = faAssetStoreInstance.form_update_fa_asset.asset_type_id;
  const assetListCode = faAssetStoreInstance.form_update_fa_asset.asset_list_code;

  if (!selectedAssetTypeId || !assetListCode) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset.coa_id === selectedAssetTypeId
  );

  if (!selectedAsset) {
    return "";
  }

  const assetCode = selectedAsset.asset_code;

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const dateString = `${year}${month}${day}`;

  return `BA-${assetCode}-${dateString}-${assetListCode}`;
};

const goBack = () => {
  router.go(-1);
};

const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງແກ້ໄຂຊັບສົມບັດຄົງທີ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
      await faAssetStoreInstance.UpdateFaAsset(id);
    }
  }
};


watch(
  [
    () => faAssetStoreInstance.form_update_fa_asset.asset_type_id,
    () => faAssetStoreInstance.form_update_fa_asset.asset_list_code,
  ],
  ([assetTypeId, assetListCode]) => {
    if (assetTypeId && assetListCode) {
      faAssetStoreInstance.form_update_fa_asset.asset_list_id = generateAssetListId();
      faAssetStoreInstance.form_update_fa_asset.asset_serial_no = generateSerialNumber();
      faAssetStoreInstance.form_update_fa_asset.asset_tag = generateSerialtag();
    }
  }
);


watch(
  [
    () => faAssetStoreInstance.form_update_fa_asset.dpca_start_date,
    () => faAssetStoreInstance.form_update_fa_asset.asset_useful_life,
  ],
  ([startDate, usefulLife]) => {
    if (startDate && usefulLife) {
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + usefulLife);
      faAssetStoreInstance.form_update_fa_asset.dpca_end_date = endDate
        .toISOString()
        .split("T")[0];
    }
  }
);


watch(
  [
    () => faAssetStoreInstance.form_update_fa_asset.asset_value,
    () => faAssetStoreInstance.form_update_fa_asset.asset_accu_dpca_value,
  ],
  ([assetValue, accuDpcaValue]) => {
    const value = assetValue || 0;
    const accumulated = accuDpcaValue || 0;
    faAssetStoreInstance.form_update_fa_asset.asset_value_remain = value - accumulated;
  }
);


watch(
  () => faAssetStoreInstance.response_fa_asset_detail,
  (req) => {
    if (req) {
      faAssetStoreInstance.form_update_fa_asset.aaset_ac_by = req.asset_ac_by;
      // faAssetStoreInstance.form_update_fa_asset.asset_list_id = req.asset_list_id;
      faAssetStoreInstance.form_update_fa_asset.asset_serial_no = req.asset_serial_no;
      faAssetStoreInstance.form_update_fa_asset.asset_list_code = req.asset_list_code;
      faAssetStoreInstance.form_update_fa_asset.asset_value_remainMonth = req.asset_value_remainMonth || 0;
      faAssetStoreInstance.form_update_fa_asset.asset_value_remainBegin = req.asset_value_remainBegin || 0;
      faAssetStoreInstance.form_update_fa_asset.asset_value_remainLast = req.asset_value_remainLast || 0;
      faAssetStoreInstance.form_update_fa_asset.acc_no = req.acc_no || "";
      faAssetStoreInstance.form_update_fa_asset.asset_tag = req.asset_tag || "";
      faAssetStoreInstance.form_update_fa_asset.asset_location_id = req.asset_location_id;
      faAssetStoreInstance.form_update_fa_asset.asset_spec = req.asset_spec || "";
      faAssetStoreInstance.form_update_fa_asset.asset_date = req.asset_date || "";
      faAssetStoreInstance.form_update_fa_asset.asset_currency = req.asset_currency || "LAK";
      faAssetStoreInstance.form_update_fa_asset.warranty_end_date = req.warranty_end_date;
      faAssetStoreInstance.form_update_fa_asset.supplier_id = req.supplier_id || 0;
      faAssetStoreInstance.form_update_fa_asset.dpca_type = req.dpca_type || "";
      faAssetStoreInstance.form_update_fa_asset.dpca_percentage = req.dpca_percentage;
      faAssetStoreInstance.form_update_fa_asset.asset_useful_life = req.asset_useful_life || 0;
      faAssetStoreInstance.form_update_fa_asset.asset_salvage_value = req.asset_salvage_value;
      faAssetStoreInstance.form_update_fa_asset.dpca_start_date = req.dpca_start_date;
      faAssetStoreInstance.form_update_fa_asset.dpca_end_date = req.dpca_end_date;
      faAssetStoreInstance.form_update_fa_asset.asset_accu_dpca_value = req.asset_accu_dpca_value;
      faAssetStoreInstance.form_update_fa_asset.asset_value_remain = req.asset_value_remain;
      faAssetStoreInstance.form_update_fa_asset.asset_latest_date_dpca = req.asset_latest_date_dpca;
      faAssetStoreInstance.form_update_fa_asset.asset_disposal_date = req.asset_disposal_date;
    }
  }
);


watch(
  () => faAssetStoreInstance.form_update_fa_asset.asset_useful_life,
  (newUsefulLife) => {
    if (isAutoCalculating.value) return;

    if (newUsefulLife && newUsefulLife > 0) {
      isAutoCalculating.value = true;
      const percentage = 100 / newUsefulLife;
      faAssetStoreInstance.form_update_fa_asset.dpca_percentage = Math.round(percentage * 100) / 100;

      nextTick(() => {
        isAutoCalculating.value = false;
      });
    }
  }
);

watch(
  [
    
  ]
)
watch(
  () => faAssetStoreInstance.form_update_fa_asset.dpca_percentage,
  (newPercentage) => {
    if (isAutoCalculating.value) return;

    if (newPercentage && newPercentage > 0) {
      isAutoCalculating.value = true;
      const usefulLife = 100 / newPercentage;
      faAssetStoreInstance.form_update_fa_asset.asset_useful_life = Math.round(usefulLife);

      nextTick(() => {
        isAutoCalculating.value = false;
      });
    }
  }
);

// Watch ສຳລັບອັບເດດ asset_list_code ເມື່ອຂໍ້ມູນໂຫຼດ (ປິດໄວ້ສຳລັບຟອມອັບເດດ)
// watch(assetcode, (newValue) => {
//   if (newValue && newValue.length >= 0) {
//     const newCode = generateNextAssetCode();
//     faAssetStoreInstance.form_update_fa_asset.asset_list_code = newCode;

//     if (faAssetStoreInstance.form_update_fa_asset.asset_type_id) {
//       faAssetStoreInstance.form_update_fa_asset.asset_list_id = generateAssetListId();
//       faAssetStoreInstance.form_update_fa_asset.asset_serial_no = generateSerialNumber();
//     }
//   }
// }, { immediate: true });

const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  requiredSelect: (value: any) => !!value || "ກະລຸນາເລືອກຂໍ້ມູນ",
  maxLength50: (value: string) => {
    if (!value) return true;
    return value.length <= 50 || "ຄວາມຍາວບໍ່ເກີນ 50 ຕົວອັກສອນ";
  },
  maxLength500: (value: string) => {
    if (!value) return true;
    return value.length <= 500 || "ຄວາມຍາວບໍ່ເກີນ 500 ຕົວອັກສອນ";
  },
  positiveNumber: (value: number) => {
    if (!value && value !== 0) return true;
    return value >= 0 || "ຄ່າຕ້ອງເປັນຕົວເລກບວກ";
  },
  percentage: (value: number) => {
    if (!value) return true;
    return (value >= 0 && value <= 100) || "ອັດຕາຕ້ອງຢູ່ລະຫວ່າງ 0-100%";
  },
  assetTag: (value: string) => {
    if (!value) return "ກະລຸນາປ້ອນປ້າຍຊັບສິນ";
    const pattern = /^[A-Z0-9\-_]+$/;
    return pattern.test(value) || "ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ, - ແລະ _";
  },
};

onMounted(async () => {
  faAssetStoreInstance.GetFaAssetDetail(id);
  assetStoreInstance.GetAssetList();
  faAssetStoreInstance.GetFaAssetList();
  loading.value = true;

  try {
    await Promise.all([
      supplierStoreInstance.GetSupplierList(),
      locationStoreInstance.GetLocationList(),
      faAssetStoreInstance.GetAssetCharts(),
      faAssetStoreInstance.GetLocations(),
      faAssetStoreInstance.GetSuppliers(),
    ]);

    console.log("Location data:", location.value);
    console.log("Supplier data:", supplier.value);
  } catch (error) {
    console.error("Error loading reference data:", error);
    CallSwal({
      title: "ຜິດພາດ",
      text: "ມີຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນອ້າງອີງ",
      icon: "error",
      confirmButtonText: "ຕົກລົງ",
    });
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

        <v-col cols="12" class="">
          <v-row>
            <v-col cols="12">
              <v-card
                variant="outlined"
                class=""
                style="border: 2px solid #4caf50"
              >
                <v-card-title class="text-h6 pb-2 bg-success">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="4">
                      <label
                        >ລາຍການປະເພດຊັບສົມບັດຍອ່ຍ
                        <span class="text-error">*</span></label
                      >
                      <v-select
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_type_id
                        "
                        :rules="[rules.requiredSelect]"
                        :items="mockData"
                        item-title="asset_name_la"
                        item-value="coa_id"
                        placeholder="ເລືອກຊັບສົມບັດ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      >
                        <template v-slot:selection="{ item }">
                          {{ item.raw.asset_name_la }} ({{
                            item.raw.asset_code
                          }})
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="`${item.raw.asset_name_la} (${item.raw.asset_code})`"
                          />
                        </template>
                      </v-select>

                      <label>
                        ລຳດັບ (Asset Code)
                        <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_list_code
                        "
                        :rules="[
                          rules.required,
                          rules.assetTag,
                          rules.maxLength50,
                        ]"
                        placeholder="ເຊັ່ນ: 0001,0002"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        maxlength="50"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prepend-inner-icon="mdi-auto-fix"
                      ></v-text-field>
                      <label
                        >ປ້າຍຊັບສິນ (Asset Tag)
                        <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset.asset_tag
                        "
                        :rules="[
                          rules.required,
                          rules.assetTag,
                          rules.maxLength50,
                        ]"
                        placeholder="ເຊັ່ນ: IT-001, MACH-2024-001"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        maxlength="50"
                        hint="ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ, - ແລະ _"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="4">
                      <label>ລະຫັດ <span class="text-error">*</span></label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_list_id
                        "
                        :rules="[rules.required, rules.maxLength50]"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        maxlength="50"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prepend-inner-icon="mdi-auto-fix"
                        placeholder="ເຊັ່ນ: FIX-001-202506-0002"
                      ></v-text-field>
                      <label>ເລກຊີຣີ (Serial Number)</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_serial_no
                        "
                        :rules="[rules.maxLength50]"
                        placeholder="ເຊັ່ນ: SN-FIX-001-20250623-0001"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        maxlength="50"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prepend-inner-icon="mdi-auto-fix"
                      ></v-text-field>
                      <label>ສະຖານທີ່ຕັ້ງ</label>
                      <v-select
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_location_id
                        "
                        :items="location"
                        item-title="location_name_la"
                        item-value="location_id"
                        placeholder="ເລືອກສະຖານທີ່ຕັ້ງຊັບສົມບັດ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        clearable
                        :disabled="!location.length"
                      >
                        <template v-slot:selection="{ item }">
                          {{ item.raw.location_name_la }} ({{
                            item.raw.location_code
                          }})
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="`${item.raw.location_name_la} (${item.raw.location_code})`"
                          />
                        </template>
                      </v-select>
                    </v-col>
                    <v-col cols="12" md="4">
                      <label>ລາຍລະອຽດຄຸນລັກສະນະ</label>
                      <v-textarea
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset.asset_spec
                        "
                        :rules="[rules.maxLength500]"
                        placeholder="ບັນລະອຽດຄຸນລັກສະນະຂອງຊັບສົມບັດ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        rows="3"
                        maxlength="500"
                        counter
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card
                variant="outlined"
                class=""
                style="border: 2px solid #ffc107"
              >
                <v-card-title class="text-h6 pb-2 bg-warning text-dark">
                  <v-icon class="mr-2">mdi-shield-check</v-icon>
                  ສະຖານະແລະການຮັບປະກັນ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="3">
                      <label
                        >ມູນຄ່າເລີ່ມຕົ້ນ
                        <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="formattedAssetValue"
                        :rules="[rules.required, rules.positiveNumber]"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field
                    ></v-col>
                    <v-col cols="12" md="3">
                      <label>ສະກຸນເງິນ</label>
                      <v-autocomplete
                        item-title="title"
                        item-value="value"
                        placeholder="ເລືອກສະກຸນເງິນ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        :items="currencyOptions"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label
                        >ມືຊື້ຊັບສົມບັດ <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset.asset_date
                        "
                        :rules="[rules.required]"
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label>ຜູ້ສະໜອງ/ຜູ້ຂາຍ</label>
                      <v-select
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset.supplier_id
                        "
                        :items="supplier"
                        item-title="supplier_name"
                        item-value="supplier_id"
                        placeholder="ເລືອກຜູ້ສະໜອງ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        clearable
                        :disabled="!supplier.length"
                      >
                        <template v-slot:selection="{ item }">
                          {{ item.raw.supplier_name }}({{
                            item.raw.supplier_code
                          }})
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="`${item.raw.supplier_name}(${item.raw.supplier_code})`"
                          />
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              v-show="
                faAssetStoreInstance.form_update_fa_asset.has_depreciation ===
                'Y'
              "
            >
              <v-card
                variant="outlined"
                class="mb-6"
                style="border: 2px solid #9c27b0"
              >
                <v-card-title class="text-h6 pb-2 bg-purple text-white">
                  <v-icon class="mr-2">mdi-calculator</v-icon>
                  ຂໍ້ມູນການເສື່ອມລາຄາ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="3">
                      <label>ວິທີຫັກຄ່າຫຼຸຍຫຽ້ນ</label>
                      <v-autocomplete
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset.dpca_type
                        "
                        placeholder="ເຊັ່ນ: SL, DB, UOP"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        hint="SL=ເສັ້ນກົງ, DB=ລົດລົງ, UOP=ຫົວໜ່ວຍຜະລິດ"
                        :items="doca_type"
                        item-title="title"
                        item-value="value"
                      ></v-autocomplete>
                      <label>ອາຍຸການໃຊ້ງານ (ປີ)</label>
                      <v-text-field
                        v-model.number="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_useful_life
                        "
                        :rules="[rules.positiveNumber]"
                        type="number"
                        min="1"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        suffix="ປີ"
                        hint="ປ້ອນອາຍຸການໃຊ້ງານເພື່ອຄິດໄລ່ອັດຕາອັດຕະໂນມັດ"
                      ></v-text-field>
                      <label>ອັດຕາຄ່າຫຼູຍຫຽ້ນລາຄາ (%)</label>
                      <v-text-field
                        v-model.number="
                          faAssetStoreInstance.form_update_fa_asset
                            .dpca_percentage
                        "
                        :rules="[rules.percentage]"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        suffix="%"
                        hint="ປ້ອນອັດຕາເພື່ອຄິດໄລ່ອາຍຸການໃຊ້ງານອັດຕະໂນມັດ"
                      ></v-text-field>
                      <label>ວັນທີ່ເລີ່ມຄິດລາຄາຫຼູ້ຍຫຽ້ນ</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .dpca_start_date
                        "
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label>ປະເພດການຊຳລະ</label>
                      <v-autocomplete
                        v-model.number="
                          faAssetStoreInstance.form_update_fa_asset.type_of_pay
                        "
                        :items="playtype"
                        item-value="value"
                        item-title="title"
                        step="0.01"
                        placeholder="0.00"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-autocomplete>
                      <label>ມູນຄ່າຕໍ່ເດືອນ</label>
                      <v-text-field
                        :value="formattedAssetValueRemainMonth"
                        placeholder="ເຊັ່ນ: 1,000,000"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field>
                      <label>ມູນຄ່າຄົງເຫຼືອ</label>
                      <v-text-field
                        :value="formattedAssetValueRemain"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        prefix="₭"
                        readonly
                        hint="ຄິດໄລ່ອັດຕະໂນມັດ: ມູນຄ່າຊັບສິນ - ເສື່ອມລາຄາສະສົມ"
                        class="formatted-number-input"
                      ></v-text-field>

                      <label>ວັນທີ່ສິ້ນສຸດການລາຄາຫຼູຍຫຽ້ນ</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .dpca_end_date
                        "
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        readonly
                        hint="ຄິດໄລ່ອັດຕະໂນມັດຈາກວັນທີ່ເລີ່ມແລະອາຍຸການໃຊ້ງານ"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label>ເລກບັນຊີ</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset.acc_no
                        "
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      >
                      </v-text-field>
                      <label>ມູນຄ່າຕັ້ນ</label>
                      <v-text-field
                        :value="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_value_remainBegin
                        "
                        placeholder="ມູນຄ່າຕົ້ນ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        readonly
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field>
                      <label>ມູນຄ່າຫຼູ້ຍຫຽ້ນລາຄາສະສົມ</label>
                      <v-text-field
                        v-model="formattedAccuDpcaValue"
                        :rules="[rules.positiveNumber]"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        prefix="₭"
                        readonly
                        class="formatted-number-input"
                      ></v-text-field>

                      <label>ວັນທີ່ຖອນຈຳໜ່າຍຊັບສົມບັດ</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_disposal_date
                        "
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label>ມູນຄ່າຊາກ</label>
                      <v-text-field
                        v-model="formattedSalvageValue"
                        :rules="[rules.positiveNumber]"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field>
                      <label>ມູນຄ່າທ້າຍ</label>
                      <v-text-field
                        :value="formattedAssetValueRemainLast"
                        placeholder="ເຊັ່ນ: 1,000,000"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field>
                      <label>ວັນທີ່ເສື່ອມລາຄາຄັ້ງລາສຸດ</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_update_fa_asset
                            .asset_latest_date_dpca
                        "
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" class="d-flex flex-wrap justify-center mt-6">
              <v-btn
                color="error"
                variant="outlined"
                @click="goBack"
                class="mr-2"
                :disabled="faAssetStoreInstance.isLoading"
              >
                ຍົກເລີກ
              </v-btn>

              <v-btn
                color="primary"
                type="submit"
                :loading="faAssetStoreInstance.isLoading"
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
.v-text-field input[type="number"] {
  -moz-appearance: textfield;
}

.v-text-field input[type="number"]::-webkit-outer-spin-button,
.v-text-field input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.formatted-number-input .v-field__input {
  text-align: right;
  font-family: "Roboto Mono", monospace;
  font-weight: 500;
}

.formatted-number-input .v-field__input input {
  text-align: right;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 4px;
  display: block;
}

.pb-4 {
  margin-bottom: 16px;
}

.bg-success {
  background-color: #eceeec !important;
}

.bg-warning {
  background-color: #dad2bc !important;
}

.bg-purple {
  background-color: #ccaed1 !important;
}

.bg-purple-lighten-2 {
  background-color: #ce93d8 !important;
}

.text-white {
  color: white !important;
}

.text-dark {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
