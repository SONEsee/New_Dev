<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRoute, useRouter } from "vue-router";

const locationStoreInstance = locationStore();
const route = useRoute();
const router = useRouter();

const location_id = route.query.id as string;

const title = ref("ແກ້ໄຂສະຖານທີ່");
const loading = ref(false);
const form = ref();

// Location Type Options
const locationTypeOptions = [
  { 
    title: "ອາຄານ", 
    value: "BUILDING", 
    description: "ອາຄານຫຼັກ ຫຼື ສາຂາ", 
    icon: "mdi-office-building",
    color: "primary"
  },
  { 
    title: "ຊັ້ນ", 
    value: "FLOOR", 
    description: "ຊັ້ນຂອງອາຄານ", 
    icon: "mdi-layers",
    color: "info"
  },
  { 
    title: "ຫ້ອງ", 
    value: "ROOM", 
    description: "ຫ້ອງຕ່າງໆ", 
    icon: "mdi-door",
    color: "success"
  },
  { 
    title: "ພື້ນທີ່", 
    value: "AREA", 
    description: "ພື້ນທີ່ທົ່ວໄປ", 
    icon: "mdi-map-marker-radius",
    color: "warning"
  },
  { 
    title: "ໂກດັງ", 
    value: "WAREHOUSE", 
    description: "ສະຖານທີ່ເກັບສິນຄ້າ", 
    icon: "mdi-warehouse",
    color: "error"
  },
];

// Record Status Options
const recordStatusOptions = [
  { title: "ເປີດໃຊ້ງານ", value: "O" },
  { title: "ປິດໃຊ້ງານ", value: "C" },
];

// Mock Data for parent locations
const parentLocations = ref([
  { id: 1, location_code: "HQ-001", location_name_la: "ສຳນັກງານໃຫຍ່", location_type: "BUILDING" },
  { id: 2, location_code: "HQ-F01", location_name_la: "ຊັ້ນທີ 1", location_type: "FLOOR" },
  { id: 4, location_code: "WH-001", location_name_la: "ໂກດັງທີ 1", location_type: "WAREHOUSE" },
  { id: 5, location_code: "BR-LPB", location_name_la: "ສາຂາຫຼວງພະບາງ", location_type: "BUILDING" },
]);

const goBack = () => {
  router.go(-1);
};

onMounted(() => {
  if (location_id) {
    loadLocationDetail();
  }
  loadReferenceData();
});

const loadLocationDetail = async () => {
  try {
    await locationStoreInstance.GetLocationDetail(location_id);
  } catch (error) {
    console.error("Error loading location detail:", error);
  }
};

const loadReferenceData = async () => {
  loading.value = true;
  try {
    await locationStoreInstance.GetParentLocations();
  } catch (error) {
    console.error("Error loading reference data:", error);
  } finally {
    loading.value = false;
  }
};

// Watch for data load and populate form
watch(
  () => locationStoreInstance.response_location_detail,
  (newVal) => {
    if (newVal) {
      locationStoreInstance.form_update_location.id = newVal.id;
      locationStoreInstance.form_update_location.location_code = newVal.location_code;
      locationStoreInstance.form_update_location.location_name_la = newVal.location_name_la;
      locationStoreInstance.form_update_location.location_name_en = newVal.location_name_en;
      locationStoreInstance.form_update_location.parent_location_id = newVal.parent_location_id;
      locationStoreInstance.form_update_location.location_type = newVal.location_type;
      locationStoreInstance.form_update_location.address = newVal.address || "";
      locationStoreInstance.form_update_location.responsible_person = newVal.responsible_person || "";
      locationStoreInstance.form_update_location.phone = newVal.phone || "";
      locationStoreInstance.form_update_location.remarks = newVal.remarks || "";
      locationStoreInstance.form_update_location.record_stat = newVal.record_stat;
    }
  },
  { immediate: true }
);

// Mock data for demonstration if no real data
const mockLocationDetail = computed(() => {
  if (locationStoreInstance.response_location_detail) {
    return locationStoreInstance.response_location_detail;
  }
  
  // Return mock data and populate form
  const mockData = {
    id: 1,
    location_code: "HQ-001",
    location_name_la: "ສຳນັກງານໃຫຍ່",
    location_name_en: "Head Office",
    parent_location_id: null,
    location_type: "BUILDING",
    address: "ນະຄອນຫຼວງວຽງຈັນ, ລາວ",
    responsible_person: "ທ່ານ ສົມສີ ວົງເວືອງ",
    phone: "021-123456",
    remarks: "ອາຄານສຳນັກງານຫຼັກ",
    record_stat: "O",
  };

  // Populate form with mock data
  if (!locationStoreInstance.form_update_location.id) {
    locationStoreInstance.form_update_location = { ...mockData };
  }

  return mockData;
});

const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນສະຖານທີ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await locationStoreInstance.UpdateLocation(location_id);
    }
  }
};

// Computed for filtering parent locations based on selected type
const filteredParentLocations = computed(() => {
  const selectedType = locationStoreInstance.form_update_location.location_type;
  if (!selectedType) return parentLocations.value;
  
  // Define logical parent-child relationships
  const parentTypeMap = {
    'BUILDING': [], // Buildings have no parents typically
    'FLOOR': ['BUILDING'], // Floors can be under buildings
    'ROOM': ['BUILDING', 'FLOOR'], // Rooms can be under buildings or floors
    'AREA': ['BUILDING', 'FLOOR'], // Areas can be under buildings or floors
    'WAREHOUSE': [], // Warehouses are typically standalone
  };
  
  const allowedParentTypes = parentTypeMap[selectedType] || [];
  // Exclude current location from parent options
  return parentLocations.value.filter(loc => 
    allowedParentTypes.includes(loc.location_type) && 
    loc.id !== parseInt(location_id)
  );
});

// Watch location type to clear parent if not applicable
watch(
  () => locationStoreInstance.form_update_location.location_type,
  (newType) => {
    if (newType && ['BUILDING', 'WAREHOUSE'].includes(newType)) {
      locationStoreInstance.form_update_location.parent_location_id = null;
    }
  }
);

const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  requiredSelect: (value: any) => !!value || "ກະລຸນາເລືອກຂໍ້ມູນ",
  maxLength20: (value: string) => {
    if (!value) return true;
    return value.length <= 20 || "ຄວາມຍາວບໍ່ເກີນ 20 ຕົວອັກສອນ";
  },
  maxLength255: (value: string) => {
    if (!value) return true;
    return value.length <= 255 || "ຄວາມຍາວບໍ່ເກີນ 255 ຕົວອັກສອນ";
  },
  maxLength100: (value: string) => {
    if (!value) return true;
    return value.length <= 100 || "ຄວາມຍາວບໍ່ເກີນ 100 ຕົວອັກສອນ";
  },
  maxLength500: (value: string) => {
    if (!value) return true;
    return value.length <= 500 || "ຄວາມຍາວບໍ່ເກີນ 500 ຕົວອັກສອນ";
  },
  locationCode: (value: string) => {
    if (!value) return "ກະລຸນາປ້ອນລະຫັດສະຖານທີ່";
    const pattern = /^[A-Z0-9\-_]+$/;
    return pattern.test(value) || "ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ, - ແລະ _";
  },
  phone: (value: string) => {
    if (!value) return true;
    const pattern = /^[0-9\-\+\(\)\s]+$/;
    return pattern.test(value) || "ຮູບແບບເບີໂທບໍ່ຖືກຕ້ອງ";
  },
};
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
            <!-- Location Type Selection -->
            <v-col cols="12">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-format-list-bulleted-type</v-icon>
                ປະເພດສະຖານທີ່
              </h3>
              
              <v-radio-group 
                v-model="locationStoreInstance.form_update_location.location_type"
                :rules="[rules.requiredSelect]"
                class="mb-6"
              >
                <v-row>
                  <v-col v-for="option in locationTypeOptions" :key="option.value" cols="12" md="4" lg="2">
                    <v-card 
                      variant="outlined" 
                      :color="locationStoreInstance.form_update_location.location_type === option.value ? option.color : ''"
                      class="pa-4 cursor-pointer h-100"
                      @click="locationStoreInstance.form_update_location.location_type = option.value"
                    >
                      <v-radio :value="option.value" class="d-none"></v-radio>
                      <div class="text-center">
                        <v-icon 
                          :color="locationStoreInstance.form_update_location.location_type === option.value ? 'white' : option.color" 
                          size="48" 
                          class="mb-2"
                        >
                          {{ option.icon }}
                        </v-icon>
                        <h4 
                          :class="locationStoreInstance.form_update_location.location_type === option.value ? 'text-white' : `text-${option.color}`"
                          class="text-h6 mb-2"
                        >
                          {{ option.title }}
                        </h4>
                        <p 
                          :class="locationStoreInstance.form_update_location.location_type === option.value ? 'text-white' : 'text-grey'"
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

            <!-- Basic Information -->
            <v-col cols="12">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                ຂໍ້ມູນພື້ນຖານ
              </h3>
            </v-col>

            <v-col cols="12" md="6">
              <label>ລະຫັດສະຖານທີ່ <span class="text-error">*</span></label>
              <v-text-field
                v-model="locationStoreInstance.form_update_location.location_code"
                :rules="[rules.required, rules.locationCode, rules.maxLength20]"
                placeholder="ເຊັ່ນ: HQ-001, WH-001"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="20"
                hint="ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ, - ແລະ _"
              ></v-text-field>

              <label>ຊື່ສະຖານທີ່ (ລາວ) <span class="text-error">*</span></label>
              <v-text-field
                v-model="locationStoreInstance.form_update_location.location_name_la"
                :rules="[rules.required, rules.maxLength255]"
                placeholder="ກະລຸນາປ້ອນຊື່ສະຖານທີ່ເປັນພາສາລາວ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="255"
              ></v-text-field>

              <label>ຊື່ສະຖານທີ່ (ອັງກິດ) <span class="text-error">*</span></label>
              <v-text-field
                v-model="locationStoreInstance.form_update_location.location_name_en"
                :rules="[rules.required, rules.maxLength255]"
                placeholder="ກະລຸນາປ້ອນຊື່ສະຖານທີ່ເປັນພາສາອັງກິດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="255"
              ></v-text-field>

              <label>ສະຖານທີ່ແມ່</label>
              <v-select
                v-model="locationStoreInstance.form_update_location.parent_location_id"
                :items="filteredParentLocations"
                item-title="location_name_la"
                item-value="id"
                placeholder="ເລືອກສະຖານທີ່ແມ່ (ຖ້າມີ)"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                clearable
                :disabled="['BUILDING', 'WAREHOUSE'].includes(locationStoreInstance.form_update_location.location_type)"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="secondary" variant="outlined">
                        {{ item.raw.location_code }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.location_name_la }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.location_type }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>

              <label>ສະຖານະເລຄອດ <span class="text-error">*</span></label>
              <v-select
                v-model="locationStoreInstance.form_update_location.record_stat"
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
            </v-col>

            <v-col cols="12" md="6">
              <label>ຜູ້ຮັບຜິດຊອບ</label>
              <v-text-field
                v-model="locationStoreInstance.form_update_location.responsible_person"
                :rules="[rules.maxLength100]"
                placeholder="ຊື່ຜູ້ຮັບຜິດຊອບສະຖານທີ່"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
                prepend-inner-icon="mdi-account"
              ></v-text-field>

              <label>ເບີໂທລະສັບ</label>
              <v-text-field
                v-model="locationStoreInstance.form_update_location.phone"
                :rules="[rules.phone]"
                placeholder="ເຊັ່ນ: 021-123456, +856 20 1234567"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                prepend-inner-icon="mdi-phone"
              ></v-text-field>

              <label>ທີ່ຢູ່</label>
              <v-textarea
                v-model="locationStoreInstance.form_update_location.address"
                placeholder="ທີ່ຢູ່ລະອຽດຂອງສະຖານທີ່"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="3"
                prepend-inner-icon="mdi-map-marker"
              ></v-textarea>

              <label>ໝາຍເຫດ</label>
              <v-textarea
                v-model="locationStoreInstance.form_update_location.remarks"
                :rules="[rules.maxLength500]"
                placeholder="ໝາຍເຫດເພີ່ມເຕີມ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="3"
                maxlength="500"
                counter
                prepend-inner-icon="mdi-note-text"
              ></v-textarea>
            </v-col>

            <!-- Current Data Information -->
            <v-col cols="12" class="mt-6" v-if="mockLocationDetail">
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-information-outline</v-icon>
                ຂໍ້ມູນປັດຈຸບັນ
              </h3>

              <v-row>
                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="text-subtitle-1 pb-2">
                      <v-icon class="mr-2" size="small">mdi-identifier</v-icon>
                      ຂໍ້ມູນປັດຈຸບັນ
                    </v-card-title>
                    <v-card-text class="pt-0">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title class="text-caption">ID</v-list-item-title>
                          <v-list-item-subtitle class="text-h6 text-primary">
                            {{ mockLocationDetail.id }}
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title class="text-caption">ລະຫັດເດີມ</v-list-item-title>
                          <v-list-item-subtitle class="text-body-1">
                            {{ mockLocationDetail.location_code }}
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title class="text-caption">ປະເພດເດີມ</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip size="small" color="info" variant="outlined">
                              {{ mockLocationDetail.location_type }}
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="text-subtitle-1 pb-2">
                      <v-icon class="mr-2" size="small">mdi-file-tree</v-icon>
                      ການເຊື່ອມໂຍງ
                    </v-card-title>
                    <v-card-text class="pt-0">
                      <div class="text-center">
                        <v-icon size="48" color="info" class="mb-3">mdi-link</v-icon>
                        <p class="text-body-2 mb-2">
                          ມີສະຖານທີ່ຍ່ອຍ: <span class="text-h6 text-info">3</span>
                        </p>
                        <p class="text-body-2 mb-2">
                          ມີຊັບສົມບັດ: <span class="text-h6 text-success">2</span>
                        </p>
                      </div>
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
                        color="warning" 
                        variant="tonal" 
                        density="compact"
                        class="mb-2"
                      >
                        <v-icon>mdi-alert</v-icon>
                        <span class="text-caption">ມີຂໍ້ມູນເຊື່ອມໂຍງ</span>
                      </v-alert>
                      
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title class="text-caption text-warning">
                            <v-icon size="small" class="mr-1">mdi-information</v-icon>
                            ການແກ້ໄຂປະເພດ
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption">ອາດມີຜົນກະທົບຕໍ່ໂຄງສ້າງ</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <!-- Preview Section -->
            <v-col cols="12" class="mt-6" v-if="locationStoreInstance.form_update_location.location_type">
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
                ຕົວຢ່າງຂໍ້ມູນຫຼັງແກ້ໄຂ
              </h3>

              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" color="success" class="h-100">
                      <v-card-title class="text-h6 pb-2">
                        <v-icon class="mr-2">mdi-map-marker</v-icon>
                        ຂໍ້ມູນສະຖານທີ່ໃໝ່
                      </v-card-title>
                      <v-card-text class="pt-0">
                        <v-list density="compact">
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ລະຫັດ:</v-list-item-title>
                            <v-list-item-subtitle class="text-h6 text-primary">
                              {{ locationStoreInstance.form_update_location.location_code || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ຊື່ (ລາວ):</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_update_location.location_name_la || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ຊື່ (ອັງກິດ):</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_update_location.location_name_en || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ປະເພດ:</v-list-item-title>
                            <v-list-item-subtitle>
                              <v-chip 
                                v-if="locationStoreInstance.form_update_location.location_type"
                                size="small" 
                                :color="locationTypeOptions.find(t => t.value === locationStoreInstance.form_update_location.location_type)?.color" 
                                variant="flat"
                              >
                                {{ locationTypeOptions.find(t => t.value === locationStoreInstance.form_update_location.location_type)?.title }}
                              </v-chip>
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-card variant="outlined" color="info" class="h-100">
                      <v-card-title class="text-h6 pb-2">
                        <v-icon class="mr-2">mdi-account-details</v-icon>
                        ຂໍ້ມູນຕິດຕໍ່ໃໝ່
                      </v-card-title>
                      <v-card-text class="pt-0">
                        <v-list density="compact">
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ຜູ້ຮັບຜິດຊອບ:</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_update_location.responsible_person || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ເບີໂທ:</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_update_location.phone || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ທີ່ຢູ່:</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_update_location.address || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ສະຖານະ:</v-list-item-title>
                            <v-list-item-subtitle>
                              <v-chip 
                                v-if="locationStoreInstance.form_update_location.record_stat"
                                size="small" 
                                :color="locationStoreInstance.form_update_location.record_stat === 'O' ? 'success' : 'error'" 
                                variant="flat"
                              >
                                {{ locationStoreInstance.form_update_location.record_stat === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                              </v-chip>
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <!-- Information Card -->
            <v-col cols="12" class="mt-4">
              <v-card variant="outlined" color="info">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                  ຄຳແນະນຳການແກ້ໄຂ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ການປ່ຽນປະເພດສະຖານທີ່:</v-list-item-title>
                      <v-list-item-subtitle>ຄວນພິຈາລະນາຢ່າງລະມັດລະວັງ ເພາະອາດມີຜົນກະທົບຕໍ່ສະຖານທີ່ຍ່ອຍ</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ການປ່ຽນລະຫັດ:</v-list-item-title>
                      <v-list-item-subtitle>ຖ້າມີຊັບສົມບັດເຊື່ອມໂຍງ ອາດຕ້ອງອັບເດດຂໍ້ມູນໃນໜ້າອື່ນ</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ການປ່ຽນສະຖານະ:</v-list-item-title>
                      <!-- <v-list-item-subtitle">ການປິດສະຖານທີ່ອາດມີຜົນກະທົບຕໍ່ການດຳເນີນງານ</v-list-item-subtitle> -->
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
                :disabled="locationStoreInstance.isLoading"
              >
                ກັບຄືນ
              </v-btn>
              
              <v-btn 
                color="primary" 
                type="submit" 
                :loading="locationStoreInstance.isLoading"
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
.cursor-pointer {
  cursor: pointer;
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

@media (max-width: 768px) {
  .d-flex.align-center {
    flex-direction: column;
    text-align: center;
  }
}
</style>