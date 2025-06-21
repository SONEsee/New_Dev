<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";

const faAssetStoreInstance = faAssetStore();
const router = useRouter();

const title = ref("ເພີ່ມຊັບສົມບັດຄົງທີ່ໃໝ່");
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



const assetAcOptions = [
  { title: "ມີ", value: "Y" },
  { title: "ບໍ່ມີ", value: "N" },
];



const locations = ref([
  { id: 1, name: "ສຳນັກງານໃຫຍ່", code: "HQ" },
  { id: 2, name: "ສາຂາວຽງຈັນ", code: "VTE" },
  { id: 3, name: "ສາຂາຫຼວງພະບາງ", code: "LPB" },
  { id: 4, name: "ສາຂາຈຳປາສັກ", code: "CPS" },
  { id: 5, name: "ໂຮງງານ", code: "FAC" },
]);

const suppliers = ref([
  { id: 1, name: "ບໍລິສັດ ABC", code: "ABC" },
  { id: 2, name: "ບໍລິສັດ XYZ", code: "XYZ" },
  { id: 3, name: "ຜູ້ສະໜອງ DEF", code: "DEF" },
  { id: 4, name: "ຜູ້ຂາຍ GHI", code: "GHI" },
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
      text: `ທ່ານກຳລັງເພີ່ມຊັບສົມບັດຄົງທີ່ໃໝ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await faAssetStoreInstance.CreateFaAsset();
    }
  }
};

// Watch for depreciation calculation
watch(
  [
    () => faAssetStoreInstance.form_create_fa_asset.dpca_start_date,
    () => faAssetStoreInstance.form_create_fa_asset.asset_useful_life
  ],
  ([startDate, usefulLife]) => {
    if (startDate && usefulLife) {
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + usefulLife);
      faAssetStoreInstance.form_create_fa_asset.dpca_end_date = endDate.toISOString().split('T')[0];
    }
  }
);

// Watch for asset value remain calculation
watch(
  [
    () => faAssetStoreInstance.form_create_fa_asset.asset_value,
    () => faAssetStoreInstance.form_create_fa_asset.asset_accu_dpca_value
  ],
  ([assetValue, accuDpcaValue]) => {
    const value = assetValue || 0;
    const accumulated = accuDpcaValue || 0;
    faAssetStoreInstance.form_create_fa_asset.asset_value_remain = value - accumulated;
  }
);

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
  loading.value = true;
  try {
    await Promise.all([
      faAssetStoreInstance.GetAssetCharts(),
      faAssetStoreInstance.GetLocations(),
      faAssetStoreInstance.GetSuppliers(),
    ]);
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
            <!-- Basic Information Section -->
            <v-col cols="12">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                ຂໍ້ມູນພື້ນຖານ
              </h3>
            </v-col>

            <v-col cols="12" md="6">
              <label>ປ້າຍຊັບສິນ (Asset Tag) <span class="text-error">*</span></label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_tag"
                :rules="[rules.required, rules.assetTag, rules.maxLength50]"
                placeholder="ເຊັ່ນ: IT-001, MACH-2024-001"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="50"
                hint="ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ, - ແລະ _"
              ></v-text-field>

              <label>ເລກຊີຣີ (Serial Number)</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_serial_no"
                :rules="[rules.maxLength50]"
                placeholder="ເລກຊີຣີຂອງຊັບສົມບັດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="50"
              ></v-text-field>

              <label>ສະຖານທີ່ຕັ້ງ</label>
              <v-select
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_location_id"
                :items="locations"
                item-title="name"
                item-value="id"
                placeholder="ເລືອກສະຖານທີ່ຕັ້ງຊັບສົມບັດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                clearable
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="secondary" variant="outlined">
                        {{ item.raw.code }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>

              <label>ວັນທີ່ໄດ້ຮັບ/ຊື້ <span class="text-error">*</span></label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_date"
                :rules="[rules.required]"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>

              <label>ສະກຸນເງິນ <span class="text-error">*</span></label>
              <v-select
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_currency"
                :rules="[rules.requiredSelect]"
                :items="currencyOptions"
                item-title="title"
                item-value="value"
                placeholder="ເລືອກສະກຸນເງິນ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-select>

              <label>ມູນຄ່າຊັບສົມບັດ <span class="text-error">*</span></label>
              <v-text-field
                v-model.number="faAssetStoreInstance.form_create_fa_asset.asset_value"
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
              <label>ຜູ້ສະໜອງ/ຜູ້ຂາຍ</label>
              <v-select
                v-model="faAssetStoreInstance.form_create_fa_asset.supplier_id"
                :items="suppliers"
                item-title="name"
                item-value="id"
                placeholder="ເລືອກຜູ້ສະໜອງ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                clearable
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="warning" variant="outlined">
                        {{ item.raw.code }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>

              <label>ວັນໝົດອາຍຸການຮັບປະກັນ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.warranty_end_date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>

              <label>ລາຍລະອຽດຄຸນລັກສະນະ</label>
              <v-textarea
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_spec"
                :rules="[rules.maxLength500]"
                placeholder="ບັນລະອຽດຄຸນລັກສະນະຂອງຊັບສົມບັດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="3"
                maxlength="500"
                counter
              ></v-textarea>

              <label>ມູນຄ່າຊາກ</label>
              <v-text-field
                v-model.number="faAssetStoreInstance.form_create_fa_asset.asset_salvage_value"
                :rules="[rules.positiveNumber]"
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

              <label>ວັນທີ່ຈຳໜ່າຍ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_disposal_date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>
            </v-col>

            <!-- Depreciation Information -->
            <v-col cols="12" class="mt-6">
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-calculator</v-icon>
                ຂໍ້ມູນການເສື່ອມລາຄາ
              </h3>
            </v-col>

            <v-col cols="12" md="6">
              <label>ປະເພດການເສື່ອມລາຄາ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.dpca_type"
                placeholder="ເຊັ່ນ: SL, DB, UOP"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                hint="SL=ເສັ້ນກົງ, DB=ລົດລົງ, UOP=ຫົວໜ່ວຍຜະລິດ"
              ></v-text-field>

              <label>ອັດຕາເສື່ອມລາຄາ (%)</label>
              <v-text-field
                v-model.number="faAssetStoreInstance.form_create_fa_asset.dpca_percentage"
                :rules="[rules.percentage]"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                suffix="%"
              ></v-text-field>

              <label>ອາຍຸການໃຊ້ງານ (ປີ)</label>
              <v-text-field
                v-model.number="faAssetStoreInstance.form_create_fa_asset.asset_useful_life"
                :rules="[rules.positiveNumber]"
                type="number"
                min="1"
                placeholder="0"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                suffix="ປີ"
              ></v-text-field>

              <label>ວັນທີ່ເລີ່ມຄິດເສື່ອມລາຄາ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.dpca_start_date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <label>ວັນທີ່ສິ້ນສຸດການເສື່ອມລາຄາ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.dpca_end_date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                readonly
                hint="ຄິດໄລ່ອັດຕະໂນມັດຈາກວັນທີ່ເລີ່ມແລະອາຍຸການໃຊ້ງານ"
              ></v-text-field>

              <label>ມູນຄ່າເສື່ອມລາຄາສະສົມ</label>
              <v-text-field
                v-model.number="faAssetStoreInstance.form_create_fa_asset.asset_accu_dpca_value"
                :rules="[rules.positiveNumber]"
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

              <label>ມູນຄ່າຄົງເຫຼືອ</label>
              <v-text-field
                v-model.number="faAssetStoreInstance.form_create_fa_asset.asset_value_remain"
                type="number"
                step="0.01"
                placeholder="0.00"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                prefix="₭"
                readonly
                hint="ຄິດໄລ່ອັດຕະໂນມັດ: ມູນຄ່າຊັບສິນ - ເສື່ອມລາຄາສະສົມ"
              ></v-text-field>

              <label>ວັນທີ່ເສື່ອມລາຄາຄັ້ງສຸດທ້າຍ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_latest_date_dpca"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>
            </v-col>

            <!-- Asset Check Information -->
            <v-col cols="12" class="mt-6">
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-check-circle</v-icon>
                ຂໍ້ມູນການກວດສອບຊັບສິນ
              </h3>
            </v-col>

            <v-col cols="12" md="6">
              <label>ມີການກວດສອບບໍ່</label>
              <v-select
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_ac_yesno"
                :items="assetAcOptions"
                item-title="title"
                item-value="value"
                placeholder="ເລືອກການກວດສອບ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-select>

              <label>ວັນທີ່ກວດສອບ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_ac_date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <label>ເວລາກວດສອບ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.asset_ac_datetime"
                type="datetime-local"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>

              <!-- <label>ຜູ້ກວດສອບ</label>
              <v-text-field
                v-model="faAssetStoreInstance.form_create_fa_asset.aaset_ac_by"
                :rules="[rules.maxLength50]"
                placeholder="ຊື່ຜູ້ກວດສອບ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="50"
              ></v-text-field> -->
            </v-col>

            <!-- Information Card -->
            <v-col cols="12" class="mt-4">
              <v-card variant="outlined" color="info">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                  ຄຳແນະນຳ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ປ້າຍຊັບສິນ:</v-list-item-title>
                      <v-list-item-subtitle>ໃຊ້ຮູບແບບທີ່ເປັນມາດຕະຖານ ເຊັ່ນ: IT-2024-001, MACH-001</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ການເສື່ອມລາຄາ:</v-list-item-title>
                      <v-list-item-subtitle>SL = ເສັ້ນກົງ, DB = ລົດລົງ, UOP = ຫົວໜ່ວຍຜະລິດ</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ມູນຄ່າຊາກ:</v-list-item-title>
                      <v-list-item-subtitle>ປົກກະຕິຕັ້ງເປັນ 5-10% ຂອງມູນຄ່າຕົ້ນທຶນ</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Action Buttons -->
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
</style>