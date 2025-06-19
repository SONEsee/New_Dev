<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const faAssetStoreInstance = faAssetStore();
const route = useRoute();
const router = useRouter();

const asset_id = route.query.asset_id as string;

const title = ref("ລາຍລະອຽດຊັບສົມບັດຄົງທີ່");
const loading = ref(false);

const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canRecordStatus,
  canAuthorize,
  hasPermission,
  initializeRole,
} = useRolePermissions();

const goBack = () => {
  router.go(-1);
};

const editAsset = () => {
  router.push(`/fa-assets/edit/?asset_id=${asset_id}`);
};

onMounted(() => {
  if (asset_id) {
    loadAssetDetail();
  }
  initializeRole();
});

const loadAssetDetail = async () => {
  loading.value = true;
  try {
    await faAssetStoreInstance.GetFaAssetDetail(asset_id);
  } catch (error) {
    console.error("Error loading asset detail:", error);
  } finally {
    loading.value = false;
  }
};

const assetData = computed(() => {
  return faAssetStoreInstance.response_fa_asset_detail;
});

const formatDate = (date: Date | string | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatDateOnly = (date: Date | string | null) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("lo-LA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

const formatCurrency = (value: number, currency: string = "LAK") => {
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

const getStatusText = (status: string) => {
  const statusMap = {
    'ACTIVE': 'ເປີດໃຊ້ງານ',
    'INACTIVE': 'ປິດໃຊ້ງານ',
    'MAINTENANCE': 'ຊ່ອມແປງ',
    'DISPOSED': 'ຖອນຈຳໜ່າຍ'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusColor = (status: string) => {
  const colorMap = {
    'ACTIVE': 'success',
    'INACTIVE': 'warning',
    'MAINTENANCE': 'info',
    'DISPOSED': 'error'
  };
  return colorMap[status as keyof typeof colorMap] || 'grey';
};

const getStatusIcon = (status: string) => {
  const iconMap = {
    'ACTIVE': 'mdi-check-circle',
    'INACTIVE': 'mdi-pause-circle',
    'MAINTENANCE': 'mdi-wrench',
    'DISPOSED': 'mdi-delete'
  };
  return iconMap[status as keyof typeof iconMap] || 'mdi-help-circle';
};

const getDepreciationTypeText = (type: string | null) => {
  if (!type) return "-";
  const typeMap = {
    'Straight-line': 'ເສັ້ນກົງ',
    'Declining': 'ລົດລົງ',
    'ProductionUnit': 'ຫົວໜ່ວຍຜະລິດ'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getCurrencyText = (currency: string) => {
  const currencyMap = {
    'LAK': 'ກີບລາວ',
    'USD': 'ດໍລ່າສະຫະລັດ',
    'THB': 'ບາດໄທ'
  };
  return currencyMap[currency as keyof typeof currencyMap] || currency;
};

const isWarrantyExpired = computed(() => {
  if (!assetData.value?.warranty_end_date) return false;
  return new Date(assetData.value.warranty_end_date) < new Date();
});

const depreciationProgress = computed(() => {
  if (!assetData.value) return 0;
  const { asset_value, asset_accu_dpca_value } = assetData.value;
  if (asset_value === 0) return 0;
  return Math.min(100, (asset_accu_dpca_value / asset_value) * 100);
});

const bookValuePercentage = computed(() => {
  if (!assetData.value) return 0;
  const { asset_value, asset_value_remain } = assetData.value;
  if (asset_value === 0) return 0;
  return Math.min(100, (asset_value_remain / asset_value) * 100);
});
</script>

<template>
  <section class="pa-6">
    <v-row>
      <v-col cols="12">
        <GlobalTextTitleLine :title="title" />
      </v-col>

      <!-- Action Buttons -->
      <v-col cols="12" class="pb-0">
        <div class="d-flex justify-space-between align-center">
          <v-btn color="grey" variant="outlined" @click="goBack" prepend-icon="mdi-arrow-left">
            ກັບຄືນ
          </v-btn>
          <!-- <div v-if="assetData && !loading" class="d-flex gap-2">
            <v-btn v-if="canEdit" color="primary" @click="editAsset" prepend-icon="mdi-pencil">
              ແກ້ໄຂ
            </v-btn>
            <v-btn color="info" variant="outlined" prepend-icon="mdi-calculator">
              ຄິດເສື່ອມລາຄາ
            </v-btn>
          </div> -->
        </div>
      </v-col>

      <v-col cols="12" class="pt-6">
        <!-- Loading State -->
        <v-card v-if="loading" class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4 text-grey-darken-1">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </v-card-text>
        </v-card>

        <!-- Asset Detail Content -->
        <v-card v-else-if="assetData" class="elevation-2 rounded-lg">
          <!-- Header -->
          <v-card-title class="bg-primary text-white pa-6">
            <div class="d-flex align-center w-100">
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-3" size="32">mdi-treasure-chest</v-icon>
                  <div>
                    <div class="text-h4 mb-1">{{ assetData.asset_tag }}</div>
                    <div class="text-h6 opacity-90">ID: {{ assetData.id }}</div>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <v-chip 
                  :color="getStatusColor(assetData.asset_status)"
                  variant="flat"
                  size="large"
                  class="mb-3"
                >
                  <v-icon start>{{ getStatusIcon(assetData.asset_status) }}</v-icon>
                  {{ getStatusText(assetData.asset_status) }}
                </v-chip>
                <div class="text-h5">{{ formatCurrency(assetData.asset_value_remain, assetData.asset_currency) }}</div>
                <div class="text-subtitle-1 opacity-90">ມູນຄ່າຍັງເຫຼືອ</div>
              </div>
            </div>
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-row>
              <!-- Basic Information -->
              <v-col cols="12" lg="8">
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                  ຂໍ້ມູນພື້ນຖານ
                </h3>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ລະຫັດຊັບສົມບັດ (Asset ID)
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-black">
                          {{ assetData.asset_id }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ເລກຊີຣີ (Serial Number)
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          <v-chip v-if="assetData.asset_serial_no" color="secondary" variant="outlined" size="small">
                            {{ assetData.asset_serial_no }}
                          </v-chip>
                          <span v-else class="text-grey">-</span>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ປ້າຍຊັບສິນ (Asset Tag)
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-primary">
                          {{ assetData.asset_tag }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ວັນທີ່ໄດ້ຮັບ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          {{ formatDateOnly(assetData.asset_date) }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ສະກຸນເງິນ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          <v-chip color="info" variant="outlined" size="small">
                            {{ assetData.asset_currency }} - {{ getCurrencyText(assetData.asset_currency) }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ສະຖານທີ່ຕັ້ງ (Location ID)
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          {{ assetData.asset_location_id || '-' }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ຜູ້ສະໜອງ (Supplier ID)
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          {{ assetData.supplier_id || '-' }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ວັນໝົດອາຍຸການຮັບປະກັນ
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <div v-if="assetData.warranty_end_date" class="d-flex align-center">
                            <span :class="isWarrantyExpired ? 'text-error' : 'text-success'">
                              {{ formatDateOnly(assetData.warranty_end_date) }}
                            </span>
                            <v-chip 
                              v-if="isWarrantyExpired" 
                              color="error" 
                              size="x-small" 
                              variant="flat" 
                              class="ml-2"
                            >
                              ໝົດອາຍຸ
                            </v-chip>
                          </div>
                          <span v-else class="text-grey">-</span>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3" v-if="assetData.asset_disposal_date">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ວັນທີ່ຖອນຈຳໜ່າຍ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-error">
                          {{ formatDateOnly(assetData.asset_disposal_date) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>

                <!-- Specification -->
                <div v-if="assetData.asset_spec" class="mt-6">
                  <h4 class="text-subtitle-1 mb-2 d-flex align-center">
                    <v-icon class="mr-2" size="small">mdi-text-long</v-icon>
                    ລາຍລະອຽດຄຸນລັກສະນະ
                  </h4>
                  <v-card variant="outlined" class="pa-3">
                    <p class="text-body-2 mb-0">{{ assetData.asset_spec }}</p>
                  </v-card>
                </div>
              </v-col>

              <!-- Financial Information Sidebar -->
              <v-col cols="12" lg="4">
                <!-- Value Summary -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-currency-usd</v-icon>
                    ມູນຄ່າຊັບສົມບັດ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ມູນຄ່າຕົ້ນທຶນ</v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-primary">
                          {{ formatCurrency(assetData.asset_value, assetData.asset_currency) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ຄ່າເສື່ອມລາຄາສະສົມ</v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-warning">
                          {{ formatCurrency(assetData.asset_accu_dpca_value, assetData.asset_currency) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ມູນຄ່າຍັງເຫຼືອ</v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-success">
                          {{ formatCurrency(assetData.asset_value_remain, assetData.asset_currency) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ມູນຄ່າຊາກ</v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          {{ formatCurrency(assetData.asset_salvage_value, assetData.asset_currency) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <!-- Depreciation Progress -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-chart-line</v-icon>
                    ຄວາມຄືບໜ້າເສື່ອມລາຄາ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <div class="mb-3">
                      <div class="d-flex justify-space-between text-caption mb-1">
                        <span>ເສື່ອມລາຄາແລ້ວ</span>
                        <span>{{ Math.round(depreciationProgress) }}%</span>
                      </div>
                      <v-progress-linear 
                        :model-value="depreciationProgress" 
                        color="warning" 
                        height="8"
                        rounded
                      ></v-progress-linear>
                    </div>
                    
                    <div>
                      <div class="d-flex justify-space-between text-caption mb-1">
                        <span>ມູນຄ່າຍັງເຫຼືອ</span>
                        <span>{{ Math.round(bookValuePercentage) }}%</span>
                      </div>
                      <v-progress-linear 
                        :model-value="bookValuePercentage" 
                        color="success" 
                        height="8"
                        rounded
                      ></v-progress-linear>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Depreciation Details -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-calculator</v-icon>
                    ລາຍລະອຽດເສື່ອມລາຄາ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2">ມີການຄິດເສື່ອມລາຄາ</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip 
                            :color="assetData.has_depreciation === 'Y' ? 'success' : 'grey'" 
                            size="small" 
                            variant="flat"
                          >
                            {{ assetData.has_depreciation === 'Y' ? 'ມີ' : 'ບໍ່ມີ' }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                      
                      <div v-if="assetData.has_depreciation === 'Y'">
                        <v-list-item>
                          <v-list-item-title class="text-subtitle-2">ວິທີຄິດເສື່ອມລາຄາ</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ getDepreciationTypeText(assetData.dpca_type) }}
                          </v-list-item-subtitle>
                        </v-list-item>
                        
                        <v-list-item v-if="assetData.dpca_percentage">
                          <v-list-item-title class="text-subtitle-2">ອັດຕາເສື່ອມລາຄາ</v-list-item-title>
                          <v-list-item-subtitle>{{ assetData.dpca_percentage }}%</v-list-item-subtitle>
                        </v-list-item>
                        
                        <v-list-item v-if="assetData.asset_useful_life">
                          <v-list-item-title class="text-subtitle-2">ອາຍຸການໃຊ້ງານ</v-list-item-title>
                          <v-list-item-subtitle>{{ assetData.asset_useful_life }} ປີ</v-list-item-subtitle>
                        </v-list-item>
                        
                        <v-list-item v-if="assetData.dpca_start_date">
                          <v-list-item-title class="text-subtitle-2">ເລີ່ມຄິດເສື່ອມລາຄາ</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDateOnly(assetData.dpca_start_date) }}</v-list-item-subtitle>
                        </v-list-item>
                        
                        <v-list-item v-if="assetData.dpca_end_date">
                          <v-list-item-title class="text-subtitle-2">ສິ້ນສຸດເສື່ອມລາຄາ</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDateOnly(assetData.dpca_end_date) }}</v-list-item-subtitle>
                        </v-list-item>
                        
                        <v-list-item v-if="assetData.asset_latest_date_dpca">
                          <v-list-item-title class="text-subtitle-2">ເສື່ອມລາຄາຄັ້ງສຸດທ້າຍ</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDateOnly(assetData.asset_latest_date_dpca) }}</v-list-item-subtitle>
                        </v-list-item>
                      </div>
                    </v-list>
                  </v-card-text>
                </v-card>

                <!-- Quick Actions -->
                <v-card variant="outlined">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                    ດຳເນີນການດ່ວນ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <div class="d-flex flex-column gap-2">
                      <v-btn 
                        v-if="canAdd"
                        block 
                        color="warning" 
                        variant="outlined" 
                        prepend-icon="mdi-wrench"
                      >
                        ບັນທຶກການບຳລຸງ
                      </v-btn>
                      <v-btn 
                        block 
                        color="info" 
                        variant="outlined"
                        prepend-icon="mdi-history"
                      >
                        ປະຫວັດການເຄື່ອນໄຫວ
                      </v-btn>
                      <v-btn 
                        v-if="assetData.has_depreciation === 'Y'"
                        block 
                        color="success" 
                        variant="outlined"
                        prepend-icon="mdi-calculator"
                      >
                        ຄິດເສື່ອມລາຄາ
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Accounting Information -->
              <v-col cols="12" class="mt-6">
                <v-divider class="mb-4"></v-divider>
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-book-open-page-variant</v-icon>
                  ຂໍ້ມູນການບັນຊີ
                </h3>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ສະຖານະບັນທຶກບັນຊີ
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip 
                            :color="assetData.asset_ac_yesno === 'Y' ? 'success' : 'warning'" 
                            size="small" 
                            variant="flat"
                          >
                            {{ assetData.asset_ac_yesno === 'Y' ? 'ບັນທຶກແລ້ວ' : 'ຍັງບໍ່ບັນທຶກ' }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="assetData.asset_ac_date" class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ວັນທີ່ບັນທຶກບັນຊີ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          {{ formatDateOnly(assetData.asset_ac_date) }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="assetData.asset_ac_datetime" class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ວັນເວລາບັນທຶກບັນຊີ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          {{ formatDate(assetData.asset_ac_datetime) }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item v-if="assetData.asset_ac_by" class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ຜູ້ບັນທຶກບັນຊີ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          User ID: {{ assetData.asset_ac_by }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ສະຖານະເລຄອດ (Record Status)
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip 
                            color="grey" 
                            size="small" 
                            variant="outlined"
                          >
                            {{ assetData.Record_Status || 'N/A' }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Activity Timeline -->
              <v-col cols="12" class="mt-6">
                <v-divider class="mb-4"></v-divider>
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
                  ປະຫວັດການເຮັດວຽກ
                </h3>
                
                <v-timeline density="compact" direction="horizontal" class="mt-4">
                  <v-timeline-item
                    dot-color="success"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">ວັນທີ່ໄດ້ຮັບ</div>
                    </template>
                    <div class="text-body-2">
                      {{ formatDateOnly(assetData.asset_date) }}
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    v-if="assetData.dpca_start_date"
                    dot-color="info"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">ເລີ່ມເສື່ອມລາຄາ</div>
                    </template>
                    <div class="text-body-2">
                      {{ formatDateOnly(assetData.dpca_start_date) }}
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    v-if="assetData.asset_latest_date_dpca"
                    dot-color="warning"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">ເສື່ອມລາຄາຄັ້ງສຸດທ້າຍ</div>
                    </template>
                    <div class="text-body-2">
                      {{ formatDateOnly(assetData.asset_latest_date_dpca) }}
                    </div>
                  </v-timeline-item>

                  <v-timeline-item
                    v-if="assetData.asset_disposal_date"
                    dot-color="error"
                    size="small"
                  >
                    <template v-slot:opposite>
                      <div class="text-caption">ຖອນຈຳໜ່າຍ</div>
                    </template>
                    <div class="text-body-2">
                      {{ formatDateOnly(assetData.asset_disposal_date) }}
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- No Data State -->
        <v-card v-else class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">
              mdi-treasure-chest-outline
            </v-icon>
            <p class="text-h6 text-grey-lighten-1 mb-0">
              ບໍ່ພົບຂໍ້ມູນຊັບສົມບັດ
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ກະລຸນາກວດສອບລະຫັດຊັບສົມບັດແລະລອງໃໝ່
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-timeline-item {
  min-height: 60px;
}

.v-card-title {
  word-break: break-word;
}

.d-flex.gap-2 > * {
  margin-right: 8px;
}

.d-flex.gap-2 > *:last-child {
  margin-right: 0;
}
</style>