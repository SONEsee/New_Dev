

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
                <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                ຂໍ້ມູນພື້ນຖານ
              </h3>
            </v-col>

            <v-col cols="12" md="6">
              <label>ລະຫັດຊັບສົມບັດ <span class="text-error">*</span></label>
              <v-select
                v-model="faAssetStoreInstance.form_update_fa_asset.asset_id"
                :rules="[rules.requiredSelect]"
                :items="assetCharts"
                item-title="name"
                item-value="id"
                placeholder="ກະລຸນາເລືອກປະເພດຊັບສົມບັດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="primary" variant="outlined">
                        {{ item.raw.code }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>

              <label>ປ້າຍຊັບສິນ (Asset Tag) <span class="text-error">*</span></label>
              <v-text-field
                v-model="faAssetStoreInstance.form_update_fa_asset.asset_tag"
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
                v-model="faAssetStoreInstance.form_update_fa_asset.asset_serial_no"
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
                v-model="faAssetStoreInstance.form_update_fa_asset.asset_location_id"
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
                v-model="faAssetStoreInstance.form_update_fa_asset.asset_date"
                :rules="[rules.required]"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>

              <label>ສະຖານະຊັບສົມບັດ <span class="text-error">*</span></label>
              <v-select
                v-model="faAssetStoreInstance.form_update_fa_asset.asset_status"
                :rules="[rules.requiredSelect]"
                :items="assetStatusOptions"
                item-title="title"
                item-value="value"
                placeholder="ເລືອກສະຖານະຊັບສົມບັດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-select>
            </v-col>

            <v-col cols="12" md="6">
              <label>ສະກຸນເງິນ <span class="text-error">*</span></label>
              <v-select
                v-model="faAssetStoreInstance.form_update_fa_asset.asset_currency"
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
                v-model.number="faAssetStoreInstance.form_update_fa_asset.asset_value"
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

              <label>ຜູ້ສະໜອງ/ຜູ້ຂາຍ</label>
              <v-select
                v-model="faAssetStoreInstance.form_update_fa_asset.supplier_id"
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
                v-model="faAssetStoreInstance.form_update_fa_asset.warranty_end_date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>

              <label>ລາຍລະອຽດຄຸນລັກສະນະ</label>
              <v-textarea
                v-model="faAssetStoreInstance.form_update_fa_asset.asset_spec"
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
              <label>ມີການຄິດເສື່ອມລາຄາບໍ່ <span class="text-error">*</span></label>
              <v-select
                v-model="faAssetStoreInstance.form_update_fa_asset.has_depreciation"
                :rules="[rules.requiredSelect]"
                :items="depreciationOptions"
                item-title="title"
                item-value="value"
                placeholder="ເລືອກການຄິດເສື່ອມລາຄາ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-select>

              <div v-if="faAssetStoreInstance.form_update_fa_asset.has_depreciation === 'Y'">
                <label>ວິທີຄິດເສື່ອມລາຄາ</label>
                <v-select
                  v-model="faAssetStoreInstance.form_update_fa_asset.dpca_type"
                  :items="depreciationTypeOptions"
                  item-title="title"
                  item-value="value"
                  placeholder="ເລືອກວິທີຄິດເສື່ອມລາຄາ"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  class="pb-6"
                ></v-select>

                <label>ອັດຕາເສື່ອມລາຄາ (%)</label>
                <v-text-field
                  v-model.number="faAssetStoreInstance.form_update_fa_asset.dpca_percentage"
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
                  v-model.number="faAssetStoreInstance.form_update_fa_asset.asset_useful_life"
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
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <label>ມູນຄ່າຊາກ</label>
              <v-text-field
                v-model.number="faAssetStoreInstance.form_update_fa_asset.asset_salvage_value"
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

              <div v-if="faAssetStoreInstance.form_update_fa_asset.has_depreciation === 'Y'">
                <label>ວັນທີ່ເລີ່ມຄິດເສື່ອມລາຄາ</label>
                <v-text-field
                  v-model="faAssetStoreInstance.form_update_fa_asset.dpca_start_date"
                  type="date"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  class="pb-6"
                ></v-text-field>

                <label>ວັນທີ່ສິ້ນສຸດການເສື່ອມລາຄາ</label>
                <v-text-field
                  v-model="faAssetStoreInstance.form_update_fa_asset.dpca_end_date"
                  type="date"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  class="pb-6"
                  readonly
                  hint="ຄິດໄລ່ອັດຕະໂນມັດຈາກວັນທີ່ເລີ່ມແລະອາຍຸການໃຊ້ງານ"
                ></v-text-field>
              </div>
            </v-col>

            <!-- Current Asset Information -->
            <v-col cols="12" class="mt-6" v-if="faAssetStoreInstance.response_fa_asset_detail">
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-information-outline</v-icon>
                ຂໍ້ມູນປັດຈຸບັນ
              </h3>

              <v-row>
                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="text-subtitle-1 pb-2">
                      <v-icon class="mr-2" size="small">mdi-currency-usd</v-icon>
                      ມູນຄ່າທາງການເງິນ
                    </v-card-title>
                    <v-card-text class="pt-0">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title class="text-caption">ມູນຄ່າຕົ້ນທຶນ</v-list-item-title>
                          <v-list-item-subtitle class="text-h6 text-primary">
                            {{ faAssetStoreInstance.response_fa_asset_detail.asset_value?.toLocaleString() }} {{ faAssetStoreInstance.response_fa_asset_detail.asset_currency }}
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title class="text-caption">ຄ່າເສື່ອມລາຄາສະສົມ</v-list-item-title>
                          <v-list-item-subtitle class="text-body-1 text-warning">
                            {{ faAssetStoreInstance.response_fa_asset_detail.asset_accu_dpca_value?.toLocaleString() }} {{ faAssetStoreInstance.response_fa_asset_detail.asset_currency }}
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title class="text-caption">ມູນຄ່າຍັງເຫຼືອ</v-list-item-title>
                          <v-list-item-subtitle class="text-h6 text-success">
                            {{ faAssetStoreInstance.response_fa_asset_detail.asset_value_remain?.toLocaleString() }} {{ faAssetStoreInstance.response_fa_asset_detail.asset_currency }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="text-subtitle-1 pb-2">
                      <v-icon class="mr-2" size="small">mdi-clock-outline</v-icon>
                      ຂໍ້ມູນເສື່ອມລາຄາ
                    </v-card-title>
                    <v-card-text class="pt-0">
                      <v-list density="compact">
                        <v-list-item v-if="faAssetStoreInstance.response_fa_asset_detail.dpca_start_date">
                          <v-list-item-title class="text-caption">ເລີ່ມເສື່ອມລາຄາ</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDate(faAssetStoreInstance.response_fa_asset_detail.dpca_start_date) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="faAssetStoreInstance.response_fa_asset_detail.asset_latest_date_dpca">
                          <v-list-item-title class="text-caption">ເສື່ອມລາຄາຄັ້ງສຸດທ້າຍ</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDate(faAssetStoreInstance.response_fa_asset_detail.asset_latest_date_dpca) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="faAssetStoreInstance.response_fa_asset_detail.dpca_end_date">
                          <v-list-item-title class="text-caption">ສິ້ນສຸດເສື່ອມລາຄາ</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDate(faAssetStoreInstance.response_fa_asset_detail.dpca_end_date) }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="text-subtitle-1 pb-2">
                      <v-icon class="mr-2" size="small">mdi-alert-circle</v-icon>
                      ຄຳເຕືອນ
                    </v-card-title>
                    <v-card-text class="pt-0">
                      <v-alert 
                        v-if="faAssetStoreInstance.response_fa_asset_detail.asset_accu_dpca_value > 0"
                        color="warning" 
                        variant="tonal" 
                        density="compact"
                        class="mb-2"
                      >
                        <v-icon>mdi-alert</v-icon>
                        <span class="text-caption">ຊັບສົມບັດນີ້ມີການເສື່ອມລາຄາແລ້ວ</span>
                      </v-alert>
                      
                      <v-alert 
                        v-if="faAssetStoreInstance.response_fa_asset_detail.asset_disposal_date"
                        color="error" 
                        variant="tonal" 
                        density="compact"
                        class="mb-2"
                      >
                        <v-icon>mdi-delete</v-icon>
                        <span class="text-caption">ຊັບສົມບັດຖືກຖອນຈຳໜ່າຍແລ້ວ</span>
                      </v-alert>

                      <v-list density="compact" v-if="!faAssetStoreInstance.response_fa_asset_detail.asset_accu_dpca_value && !faAssetStoreInstance.response_fa_asset_detail.asset_disposal_date">
                        <v-list-item>
                          <v-list-item-title class="text-caption text-success">
                            <v-icon size="small" class="mr-1">mdi-check</v-icon>
                            ຊັບສົມບັດໃໝ່
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption">ຍັງບໍ່ມີການເສື່ອມລາຄາ</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

         
            <v-col cols="12" class="mt-4">
              <v-card variant="outlined" color="info">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                  ຄຳແນະນຳການແກ້ໄຂ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ການແກ້ໄຂມູນຄ່າ:</v-list-item-title>
                      <v-list-item-subtitle>ຖ້າຊັບສົມບັດມີການເສື່ອມລາຄາແລ້ວ ການແກ້ໄຂມູນຄ່າອາດມີຜົນກະທົບ</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ການປ່ຽນວິທີເສື່ອມລາຄາ:</v-list-item-title>
                      <v-list-item-subtitle>ຄວນປຶກສາກັບແຜນກບັນຊີກ່ອນປ່ຽນວິທີຄິດເສື່ອມລາຄາ</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ການປ່ຽນສະຖານະ:</v-list-item-title>
                      <v-list-item-subtitle>ການປ່ຽນເປັນ "ຖອນຈຳໜ່າຍ" ຈະຢຸດການເສື່ອມລາຄາ</v-list-item-subtitle>
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
                :disabled="faAssetStoreInstance.isLoading"
              >
                ກັບຄືນ
              </v-btn>
              
              <v-btn 
                color="primary" 
                type="submit" 
                :loading="faAssetStoreInstance.isLoading"
                prepend-icon="mdi-content-save"
              >
                ບັນທຶກການແກ້ໄຂ
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

.h-100 {
  height: 100%;
}

.text-caption {
  font-size: 12px !important;
}
</style><script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRoute, useRouter } from "vue-router";

const faAssetStoreInstance = faAssetStore();
const route = useRoute();
const router = useRouter();

const asset_id = route.query.id_faasset as string;

const title = ref("ແກ້ໄຂຊັບສົມບັດຄົງທີ່");
const loading = ref(false);
const form = ref();


const assetStatusOptions = [
  { title: "ເປີດໃຊ້ງານ", value: "ACTIVE" },
  { title: "ປິດໃຊ້ງານ", value: "INACTIVE" },
  { title: "ຊ່ອມແປງ", value: "MAINTENANCE" },
  { title: "ຖອນຈຳໜ່າຍ", value: "DISPOSED" },
];

// Currency Options
const currencyOptions = [
  { title: "ກີບລາວ (LAK)", value: "LAK" },
  { title: "ດໍລ່າສະຫະລັດ (USD)", value: "USD" },
  { title: "ບາດໄທ (THB)", value: "THB" },
];


const depreciationOptions = [
  { title: "ມີ", value: "Y" },
  { title: "ບໍ່ມີ", value: "N" },
];


const depreciationTypeOptions = [
  { title: "ເສັ້ນກົງ", value: "Straight-line" },
  { title: "ລົດລົງ", value: "Declining" },
  { title: "ຫົວໜ່ວຍຜະລິດ", value: "ProductionUnit" },
];


const assetCharts = ref([
  { id: 1, name: "ອາຄານ", code: "BUILD" },
  { id: 2, name: "ເຄື່ອງຈັກ", code: "MACH" },
  { id: 3, name: "ຍານພາຫະນະ", code: "VEH" },
  { id: 4, name: "ເຄື່ອງໃຊ້ສຳນັກງານ", code: "OFF" },
  { id: 5, name: "ເຄື່ອງຄອມພິວເຕີ", code: "IT" },
]);

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

onMounted(() => {
  if (asset_id) {
    loadAssetDetail();
  }
  loadReferenceData();
});

const loadAssetDetail = async () => {
  try {
    await faAssetStoreInstance.GetFaAssetDetail(asset_id);
  } catch (error) {
    console.error("Error loading asset detail:", error);
  }
};

const loadReferenceData = async () => {
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
};

// Watch for data load and populate form
watch(
  () => faAssetStoreInstance.response_fa_asset_detail,
  (newVal) => {
    if (newVal) {
      faAssetStoreInstance.form_update_fa_asset.id = newVal.id;
      faAssetStoreInstance.form_update_fa_asset.asset_id = newVal.asset_id;
      faAssetStoreInstance.form_update_fa_asset.asset_serial_no = newVal.asset_serial_no || "";
      faAssetStoreInstance.form_update_fa_asset.asset_tag = newVal.asset_tag;
      faAssetStoreInstance.form_update_fa_asset.asset_location_id = newVal.asset_location_id;
      faAssetStoreInstance.form_update_fa_asset.asset_spec = newVal.asset_spec || "";
      faAssetStoreInstance.form_update_fa_asset.asset_date = newVal.asset_date;
      faAssetStoreInstance.form_update_fa_asset.asset_currency = newVal.asset_currency;
      faAssetStoreInstance.form_update_fa_asset.asset_value = newVal.asset_value;
      faAssetStoreInstance.form_update_fa_asset.asset_status = newVal.asset_status;
      faAssetStoreInstance.form_update_fa_asset.warranty_end_date = newVal.warranty_end_date;
      faAssetStoreInstance.form_update_fa_asset.supplier_id = newVal.supplier_id;
      faAssetStoreInstance.form_update_fa_asset.has_depreciation = newVal.has_depreciation;
      faAssetStoreInstance.form_update_fa_asset.dpca_type = newVal.dpca_type;
      faAssetStoreInstance.form_update_fa_asset.dpca_percentage = newVal.dpca_percentage;
      faAssetStoreInstance.form_update_fa_asset.asset_useful_life = newVal.asset_useful_life;
      faAssetStoreInstance.form_update_fa_asset.asset_salvage_value = newVal.asset_salvage_value;
      faAssetStoreInstance.form_update_fa_asset.dpca_start_date = newVal.dpca_start_date;
      faAssetStoreInstance.form_update_fa_asset.dpca_end_date = newVal.dpca_end_date;
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
      text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນຊັບສົມບັດຄົງທີ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await faAssetStoreInstance.UpdateFaAsset(asset_id);
    }
  }
};

// Watch depreciation setting to show/hide related fields
watch(
  () => faAssetStoreInstance.form_update_fa_asset.has_depreciation,
  (newVal) => {
    if (newVal === 'N') {
      faAssetStoreInstance.form_update_fa_asset.dpca_type = null;
      faAssetStoreInstance.form_update_fa_asset.dpca_percentage = null;
      faAssetStoreInstance.form_update_fa_asset.asset_useful_life = null;
      faAssetStoreInstance.form_update_fa_asset.dpca_start_date = null;
      faAssetStoreInstance.form_update_fa_asset.dpca_end_date = null;
    }
  }
);

// Auto calculate end date when start date and useful life are set
watch(
  [
    () => faAssetStoreInstance.form_update_fa_asset.dpca_start_date,
    () => faAssetStoreInstance.form_update_fa_asset.asset_useful_life
  ],
  ([startDate, usefulLife]) => {
    if (startDate && usefulLife) {
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + usefulLife);
      faAssetStoreInstance.form_update_fa_asset.dpca_end_date = endDate;
    }
  }
);

const formatDate = (date: Date | string | null) => {
  if (!date) return "";
  return new Date(date).toISOString().split('T')[0];
};

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
</script>