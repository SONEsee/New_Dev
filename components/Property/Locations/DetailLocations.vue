<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const locationStoreInstance = locationStore();
const route = useRoute();
const router = useRouter();

const location_id = route.query.id as string;

const title = ref("ລາຍລະອຽດສະຖານທີ່");
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

const editLocation = () => {
  router.push(`/fa-locations/edit?id=${location_id}`);
};

onMounted(() => {
  if (location_id) {
    loadLocationDetail();
  }
  initializeRole();
});

const loadLocationDetail = async () => {
  loading.value = true;
  try {
    await locationStoreInstance.GetLocationDetail(location_id);
  } catch (error) {
    console.error("Error loading location detail:", error);
  } finally {
    loading.value = false;
  }
};

const locationData = computed(() => {
  return locationStoreInstance.response_location_detail;
});

const getLocationTypeText = (type: string) => {
  const types = {
    BUILDING: "ອາຄານ",
    FLOOR: "ຊັ້ນ",
    ROOM: "ຫ້ອງ",
    AREA: "ພື້ນທີ່",
    WAREHOUSE: "ໂກດັງ",
  };
  return types[type as keyof typeof types] || type;
};

const getLocationTypeColor = (type: string) => {
  const colors = {
    BUILDING: "primary",
    FLOOR: "info",
    ROOM: "success",
    AREA: "warning",
    WAREHOUSE: "error",
  };
  return colors[type as keyof typeof colors] || "grey";
};

const getLocationTypeIcon = (type: string) => {
  const icons = {
    BUILDING: "mdi-office-building",
    FLOOR: "mdi-layers",
    ROOM: "mdi-door",
    AREA: "mdi-map-marker-radius",
    WAREHOUSE: "mdi-warehouse",
  };
  return icons[type as keyof typeof icons] || "mdi-map-marker";
};

const getStatusText = (status: string) => {
  return status === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ';
};

const getStatusColor = (status: string) => {
  return status === 'O' ? 'success' : 'error';
};

const getStatusIcon = (status: string) => {
  return status === 'O' ? 'mdi-check-circle' : 'mdi-close-circle';
};


const mockLocationData = computed(() => {
  if (locationData.value) return locationDat
  return {
    id: 1,
    location_code: "HQ-001",
    location_name_la: "ສຳນັກງານໃຫຍ່",
    location_name_en: "Head Office",
    parent_location_id: null,
    parent_location: null,
    location_type: "BUILDING",
    address: "ນະຄອນຫຼວງວຽງຈັນ, ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ",
    responsible_person: "ທ່ານ ສົມສີ ວົງເວືອງ",
    phone: "021-123456",
    remarks: "ອາຄານສຳນັກງານຫຼັກຂອງບໍລິສັດ ມີ 5 ຊັ້ນ",
    record_stat: "O",
  };
});


const subLocations = ref([
  { id: 2, location_code: "HQ-F01", location_name_la: "ຊັ້ນທີ 1", location_type: "FLOOR" },
  { id: 3, location_code: "HQ-F02", location_name_la: "ຊັ້ນທີ 2", location_type: "FLOOR" },
  { id: 6, location_code: "AREA-P01", location_name_la: "ພື້ນທີ່ຈອດລົດ", location_type: "AREA" },
]);


const assetsInLocation = ref([
  { id: 1, asset_tag: "IT-001", asset_name: "ຄອມພິວເຕີ Dell", asset_value: 15000000 },
  { id: 4, asset_tag: "BUILD-001", asset_name: "ອາຄານສຳນັກງານ", asset_value: 500000000 },
]);
</script>

<template>
  <section class="pa-6">
    <v-row>
      <v-col cols="12">
        <GlobalTextTitleLine :title="title" />
      </v-col>

     
     

      <v-col cols="12" class="pt-6">
       
        <v-card v-if="loading" class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4 text-grey-darken-1">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </v-card-text>
        </v-card>

       
        <v-card v-else-if="mockLocationData" class="elevation-2 rounded-lg">
          <!-- Header -->
          <v-card-title class="bg-primary text-white pa-6">
            <div class="d-flex align-center w-100">
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-2">
                  <v-icon class="mr-3" size="32">{{ getLocationTypeIcon(mockLocationData.location_type) }}</v-icon>
                  <div>
                    <div class="text-h4 mb-1">{{ mockLocationData.location_name_la }}</div>
                    <div class="text-h6 opacity-90">{{ mockLocationData.location_name_en }}</div>
                  </div>
                </div>
              </div>
              <div class="text-right">
                <v-chip 
                  :color="getLocationTypeColor(mockLocationData.location_type)"
                  variant="flat"
                  size="large"
                  class="mb-3"
                >
                  <v-icon start>{{ getLocationTypeIcon(mockLocationData.location_type) }}</v-icon>
                  {{ getLocationTypeText(mockLocationData.location_type) }}
                </v-chip>
                <div class="text-h5">{{ mockLocationData.location_code }}</div>
                <div class="text-subtitle-1 opacity-90">ລະຫັດສະຖານທີ່</div>
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
                          ID
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-h6 text-black">
                          {{ mockLocationData.id }}
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ຜູ້ຮັບຜິດຊອບ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          <div v-if="mockLocationData.responsible_person" class="d-flex align-center">
                            <v-icon size="small" class="mr-2" color="primary">mdi-account</v-icon>
                            {{ mockLocationData.responsible_person }}
                          </div>
                          <span v-else class="text-grey">-</span>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ເບີໂທລະສັບ
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-1">
                          <div v-if="mockLocationData.phone" class="d-flex align-center">
                            <v-icon size="small" class="mr-2" color="info">mdi-phone</v-icon>
                            <a :href="`tel:${mockLocationData.phone}`" class="text-info">{{ mockLocationData.phone }}</a>
                          </div>
                          <span v-else class="text-grey">-</span>
                        </v-list-item-subtitle>
                      </v-list-item>

                      <v-list-item class="mt-3" v-if="mockLocationData.parent_location">
                        <v-list-item-title class="text-subtitle-2 text-grey-darken-1 mb-1">
                          ສະຖານທີ່ແມ່
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <v-card variant="outlined" class="pa-3">
                            <div class="d-flex align-center">
                              <v-chip size="small" color="secondary" variant="outlined" class="mr-2">
                                {{ mockLocationData.parent_location.location_code }}
                              </v-chip>
                              <span class="text-body-1">{{ mockLocationData.parent_location.location_name_la }}</span>
                            </div>
                          </v-card>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>

                <!-- Address -->
                <div v-if="mockLocationData.address" class="mt-6">
                  <h4 class="text-subtitle-1 mb-2 d-flex align-center">
                    <v-icon class="mr-2" size="small">mdi-map-marker</v-icon>
                    ທີ່ຢູ່
                  </h4>
                  <v-card variant="outlined" class="pa-3">
                    <p class="text-body-2 mb-0">{{ mockLocationData.address }}</p>
                  </v-card>
                </div>

                <!-- Remarks -->
                <div v-if="mockLocationData.remarks" class="mt-6">
                  <h4 class="text-subtitle-1 mb-2 d-flex align-center">
                    <v-icon class="mr-2" size="small">mdi-note-text</v-icon>
                    ໝາຍເຫດ
                  </h4>
                  <v-card variant="outlined" class="pa-3">
                    <p class="text-body-2 mb-0">{{ mockLocationData.remarks }}</p>
                  </v-card>
                </div>
              </v-col>

              <!-- Sidebar Information -->
              <v-col cols="12" lg="4">
                <!-- Sub-locations -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-file-tree</v-icon>
                    ສະຖານທີ່ຍ່ອຍ
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <div v-if="subLocations.length > 0">
                      <v-list density="compact">
                        <v-list-item v-for="subLoc in subLocations" :key="subLoc.id">
                          <template #prepend>
                            <v-icon 
                              :color="getLocationTypeColor(subLoc.location_type)" 
                              size="small"
                            >
                              {{ getLocationTypeIcon(subLoc.location_type) }}
                            </v-icon>
                          </template>
                          <v-list-item-title class="text-subtitle-2">
                            {{ subLoc.location_name_la }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ subLoc.location_code }}
                          </v-list-item-subtitle>
                          <template #append>
                            <v-btn 
                              size="small" 
                              variant="text" 
                              icon="mdi-arrow-right"
                              @click="goPath(`/fa-locations/detail?id=${subLoc.id}`)"
                            ></v-btn>
                          </template>
                        </v-list-item>
                      </v-list>
                    </div>
                    <div v-else class="text-center pa-4">
                      <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-file-tree-outline</v-icon>
                      <p class="text-grey text-caption">ບໍ່ມີສະຖານທີ່ຍ່ອຍ</p>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Assets in this location -->
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6 pb-2 d-flex align-center">
                    <v-icon class="mr-2">mdi-treasure-chest</v-icon>
                    ຊັບສົມບັດໃນສະຖານທີ່
                  </v-card-title>
                  <v-card-text class="pt-0">
                    <div v-if="assetsInLocation.length > 0">
                      <v-list density="compact">
                        <v-list-item v-for="asset in assetsInLocation" :key="asset.id">
                          <template #prepend>
                            <v-icon color="success" size="small">mdi-treasure-chest</v-icon>
                          </template>
                          <v-list-item-title class="text-subtitle-2">
                            {{ asset.asset_name }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ asset.asset_tag }} - {{ asset.asset_value.toLocaleString() }} LAK
                          </v-list-item-subtitle>
                          <template #append>
                            <v-btn 
                              size="small" 
                              variant="text" 
                              icon="mdi-arrow-right"
                              @click="goPath(`/fa-assets/detail?asset_id=${asset.id}`)"
                            ></v-btn>
                          </template>
                        </v-list-item>
                      </v-list>
                    </div>
                    <div v-else class="text-center pa-4">
                      <v-icon size="48" color="grey-lighten-2" class="mb-2">mdi-treasure-chest-outline</v-icon>
                      <p class="text-grey text-caption">ບໍ່ມີຊັບສົມບັດ</p>
                    </div>
                  </v-card-text>
                </v-card>

                
              </v-col>

              <v-col cols="12" class="mt-6">
                <v-divider class="mb-4"></v-divider>
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-chart-bar</v-icon>
                  ສະຖິຕິສະຖານທີ່
                </h3>
                
                <v-row>
                  <v-col cols="12" md="3">
                    <v-card variant="outlined" class="text-center pa-4">
                      <v-icon size="32" color="info" class="mb-2">mdi-file-tree</v-icon>
                      <div class="text-h4 text-info">{{ subLocations.length }}</div>
                      <div class="text-caption">ສະຖານທີ່ຍ່ອຍ</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card variant="outlined" class="text-center pa-4">
                      <v-icon size="32" color="success" class="mb-2">mdi-treasure-chest</v-icon>
                      <div class="text-h4 text-success">{{ assetsInLocation.length }}</div>
                      <div class="text-caption">ຊັບສົມບັດ</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card variant="outlined" class="text-center pa-4">
                      <v-icon size="32" color="warning" class="mb-2">mdi-currency-usd</v-icon>
                      <div class="text-h4 text-warning">
                        {{ (assetsInLocation.reduce((sum, asset) => sum + asset.asset_value, 0) / 1000000).toFixed(1) }}M
                      </div>
                      <div class="text-caption">ມູນຄ່າລາວ (ລ້ານ)</div>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-card variant="outlined" class="text-center pa-4">
                      <v-icon size="32" color="primary" class="mb-2">mdi-account-group</v-icon>
                      <div class="text-h4 text-primary">1</div>
                      <div class="text-caption">ຜູ້ຮັບຜິດຊອບ</div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>

          
              <v-col cols="12" class="mt-6" v-if="mockLocationData.parent_location">
                <v-divider class="mb-4"></v-divider>
                <h3 class="text-h6 mb-4 d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-file-tree</v-icon>
                  ໂຄງສ້າງສະຖານທີ່
                </h3>
                
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center justify-center">
                    
                    <div class="text-center mx-4">
                      <v-card variant="outlined" color="secondary" class="pa-3" width="200">
                        <v-icon color="secondary" size="32" class="mb-2">mdi-office-building</v-icon>
                        <div class="text-subtitle-2 font-weight-bold">ສະຖານທີ່ແມ່</div>
                        <v-chip size="small" color="secondary" variant="flat" class="my-2">
                          {{ mockLocationData.parent_location.location_code }}
                        </v-chip>
                        <div class="text-caption">{{ mockLocationData.parent_location.location_name_la }}</div>
                      </v-card>
                    </div>

                    <!-- Arrow -->
                    <div class="text-center">
                      <v-icon size="48" color="primary">mdi-arrow-right-bold</v-icon>
                    </div>

                    <!-- Current Location -->
                    <div class="text-center mx-4">
                      <v-card variant="outlined" :color="getLocationTypeColor(mockLocationData.location_type)" class="pa-3" width="200">
                        <v-icon :color="getLocationTypeColor(mockLocationData.location_type)" size="32" class="mb-2">
                          {{ getLocationTypeIcon(mockLocationData.location_type) }}
                        </v-icon>
                        <div class="text-subtitle-2 font-weight-bold">ສະຖານທີ່ປັດຈຸບັນ</div>
                        <v-chip size="small" :color="getLocationTypeColor(mockLocationData.location_type)" variant="flat" class="my-2">
                          {{ mockLocationData.location_code }}
                        </v-chip>
                        <div class="text-caption">{{ mockLocationData.location_name_la }}</div>
                      </v-card>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- No Data State -->
        <v-card v-else class="elevation-2 rounded-lg">
          <v-card-text class="text-center pa-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">
              mdi-map-marker-off
            </v-icon>
            <p class="text-h6 text-grey-lighten-1 mb-0">
              ບໍ່ພົບຂໍ້ມູນສະຖານທີ່
            </p>
            <p class="text-body-2 text-grey-lighten-1 mt-2">
              ກະລຸນາກວດສອບລະຫັດສະຖານທີ່ແລະລອງໃໝ່
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

.v-card-title {
  word-break: break-word;
}

.d-flex.gap-2 > * {
  margin-right: 8px;
}

.d-flex.gap-2 > *:last-child {
  margin-right: 0;
}

.flex-wrap {
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .d-flex.align-center.justify-center {
    flex-direction: column;
    align-items: center;
  }
  
  .d-flex.align-center.justify-center > div {
    margin: 8px 0;
  }
  
  .d-flex.align-center.justify-center .text-center {
    transform: rotate(90deg);
  }
}
</style>