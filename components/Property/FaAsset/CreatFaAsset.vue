<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";

const locationStoreInstance = locationStore();
const location = computed(() => {
  return locationStoreInstance.response_location_list || [];
});

const supplierStoreInstance = supplierStore();
const supplier = computed(() => {
  return supplierStoreInstance.response_supplier_list || [];
});

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

const hasDepreciationOptions = [
  { title: "ມີເສື່ອມລາຄາ", value: "Y" },
  { title: "ບໍ່ມີເສື່ອມລາຄາ", value: "N" },
];

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
      supplierStoreInstance.GetSupplierList(),
      locationStoreInstance.GetLocationList(),
      faAssetStoreInstance.GetAssetCharts(),
      faAssetStoreInstance.GetLocations(),
      faAssetStoreInstance.GetSuppliers(),
    ]);
    
    console.log('Location data:', location.value);
    console.log('Supplier data:', supplier.value);
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

        <v-col cols="12" class="pt-12">
          <v-row>
            
            <!-- ກຸ່ມຂໍ້ມູນພື້ນຖານ (ສີຂຽວ) -->
            <v-col cols="12">
              <v-card variant="outlined" class="mb-6" style="border: 2px solid #4CAF50;">
                <v-card-title class="text-h6 pb-2 bg-success text-white">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <label>ປ້າຍຊັບສິນ (Asset Tag) <span class="text-error">*</span></label>
                      <v-text-field
                        v-model="faAssetStoreInstance.form_create_fa_asset.asset_tag"
                        :rules="[rules.required, rules.assetTag, rules.maxLength50]"
                        placeholder="ເຊັ່ນ: IT-001, MACH-2024-001"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
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
                        class="pb-4"
                        maxlength="50"
                      ></v-text-field>

                      <label>ສະຖານທີ່ຕັ້ງ</label>
                      <v-select
                        v-model="faAssetStoreInstance.form_create_fa_asset.asset_location_id"
                        :items="location"
                        item-title="location_name_la"
                        item-value="location_id"
                        placeholder="ເລືອກສະຖານທີ່ຕັ້ງຊັບສົມບັດ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
                        clearable
                        :disabled="!location.length"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template #prepend v-if="item.raw.code">
                              <v-chip size="x-small" color="secondary" variant="outlined">
                                {{ item.raw.code }}
                              </v-chip>
                            </template>
                            <v-list-item-title>{{ item.raw.location_name_la || item.raw.name }}</v-list-item-title>
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
                        class="pb-4"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
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
                        class="pb-4"
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
                        class="pb-4"
                        prefix="₭"
                      ></v-text-field>

                      <label>ລາຍລະອຽດຄຸນລັກສະນະ</label>
                      <v-textarea
                        v-model="faAssetStoreInstance.form_create_fa_asset.asset_spec"
                        :rules="[rules.maxLength500]"
                        placeholder="ບັນລະອຽດຄຸນລັກສະນະຂອງຊັບສົມບັດ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
                        rows="3"
                        maxlength="500"
                        counter
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- ກຸ່ມສະຖານະແລະການຮັບປະກັນ (ສີບົວ) -->
            <v-col cols="12">
              <v-card variant="outlined" class="mb-6" style="border: 2px solid #FFC107;">
                <v-card-title class="text-h6 pb-2 bg-warning text-dark">
                  <v-icon class="mr-2">mdi-shield-check</v-icon>
                  ສະຖານະແລະການຮັບປະກັນ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <label>ຜູ້ສະໜອງ/ຜູ້ຂາຍ</label>
                      <v-select
                        v-model="faAssetStoreInstance.form_create_fa_asset.supplier_id"
                        :items="supplier"
                        item-title="supplier_name"
                        item-value="supplier_id"
                        placeholder="ເລືອກຜູ້ສະໜອງ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
                        clearable
                        :disabled="!supplier.length"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template #prepend v-if="item.raw.code">
                              <v-chip size="x-small" color="warning" variant="outlined">
                                {{ item.raw.code }}
                              </v-chip>
                            </template>
                            <v-list-item-title>{{ item.raw.supplier_name || item.raw.name }}</v-list-item-title>
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
                        class="pb-4"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <label>ມີການເສື່ອມລາຄາບໍ່</label>
                      <v-select
                        v-model="faAssetStoreInstance.form_create_fa_asset.has_depreciation"
                        :items="hasDepreciationOptions"
                        item-title="title"
                        item-value="value"
                        placeholder="ເລືອກການເສື່ອມລາຄາ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- ກຸ່ມການຄິດເສື່ອມລາຄາ (ສີມ່ວງ) -->
            <v-col cols="12" v-show="faAssetStoreInstance.form_create_fa_asset.has_depreciation === 'Y'">
              <v-card variant="outlined" class="mb-6" style="border: 2px solid #9C27B0;">
                <v-card-title class="text-h6 pb-2 bg-purple text-white">
                  <v-icon class="mr-2">mdi-calculator</v-icon>
                  ຂໍ້ມູນການເສື່ອມລາຄາ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="6">
                      <label>ປະເພດການເສື່ອມລາຄາ</label>
                      <v-text-field
                        v-model="faAssetStoreInstance.form_create_fa_asset.dpca_type"
                        placeholder="ເຊັ່ນ: SL, DB, UOP"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
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
                        class="pb-4"
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
                        class="pb-4"
                        suffix="ປີ"
                      ></v-text-field>

                      <label>ວັນທີ່ເລີ່ມຄິດເສື່ອມລາຄາ</label>
                      <v-text-field
                        v-model="faAssetStoreInstance.form_create_fa_asset.dpca_start_date"
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
                      ></v-text-field>

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
                        class="pb-4"
                        prefix="₭"
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
                        class="pb-4"
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
                        class="pb-4"
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
                        class="pb-4"
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
                        class="pb-4"
                      ></v-text-field>

                      <label>ວັນທີ່ຈຳໜ່າຍ</label>
                      <v-text-field
                        v-model="faAssetStoreInstance.form_create_fa_asset.asset_disposal_date"
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- ກຸ່ມການກວດສອບຊັບສິນ (ສີມ່ວງອ່ອນ) -->
            <v-col cols="12">
              <v-card variant="outlined" class="mb-6" style="border: 2px solid #CE93D8;">
                <v-card-title class="text-h6 pb-2 bg-purple-lighten-2 text-white">
                  <v-icon class="mr-2">mdi-check-circle</v-icon>
                  ຂໍ້ມູນການກວດສອບຊັບສິນ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
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
                        class="pb-4"
                      ></v-select>

                      <label>ວັນທີ່ກວດສອບ</label>
                      <v-text-field
                        v-model="faAssetStoreInstance.form_create_fa_asset.asset_ac_date"
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
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
                        class="pb-4"
                      ></v-text-field>

                      <label>ຜູ້ກວດສອບ</label>
                      <v-text-field
                        v-model="faAssetStoreInstance.form_create_fa_asset.aaset_ac_by"
                        placeholder="ຊື່ຜູ້ກວດສອບ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        class="pb-4"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- ຄຳແນະນຳ -->
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

            <!-- ປຸ່ມບັນທຶກ -->
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

.pb-4 {
  margin-bottom: 16px;
}

/* ສີສຳລັບກຸ່ມຕ່າງໆ */
.bg-success {
  background-color: #4CAF50 !important;
}

.bg-warning {
  background-color: #FFC107 !important;
}

.bg-purple {
  background-color: #9C27B0 !important;
}

.bg-purple-lighten-2 {
  background-color: #CE93D8 !important;
}

/* ຮັບປະກັນວ່າ text ສີຂາວເທົ່ານັ້ນ */
.text-white {
  color: white !important;
}

.text-dark {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>