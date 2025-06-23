<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";

const locationStoreInstance = locationStore();
const router = useRouter();

const title = ref("ເພີ່ມສະຖານທີ່ໃໝ່");
const loading = ref(false);
const form = ref();


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


const recordStatusOptions = [
  { title: "ເປີດໃຊ້ງານ", value: "O" },
  { title: "ປິດໃຊ້ງານ", value: "C" },
];


const parentLocations = ref([
  { id: 1, location_code: "HQ-001", location_name_la: "ສຳນັກງານໃຫຍ່", location_type: "BUILDING" },
  
]);
const parentLocationstype = ref([
  { id: 1, location_code: "HQ-001", location_name_la: "ສຳນັກງານໃຫຍ່", location_type: "BUILDING" },
  { id: 2, location_code: "HQ-F01", location_name_la: "ຊັ້ນທີ 1", location_type: "FLOOR" },
  { id: 4, location_code: "WH-001", location_name_la: "ໂກດັງທີ 1", location_type: "WAREHOUSE" },
  { id: 5, location_code: "BR-LPB", location_name_la: "ສາຂາຫຼວງພະບາງ", location_type: "BUILDING" },
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
      text: `ທ່ານກຳລັງເພີ່ມສະຖານທີ່ໃໝ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await locationStoreInstance.CreateLocation();
    }
  }
};





const generateLocationCode = () => {
  const type = locationStoreInstance.form_create_location.location_type;
  const parent = parentLocations.value.find(p => 
    p.id === locationStoreInstance.form_create_location.parent_location_id
  );
  
  if (!type) return "";
  
  const prefixes = {
    'BUILDING': 'BUILD',
    'FLOOR': 'F',
    'ROOM': 'R',
    'AREA': 'AREA',
    'WAREHOUSE': 'WH',
  };
  
  const prefix = prefixes[type];
  const timestamp = Date.now().toString().slice(-3);
  
  if (parent) {
    return `${parent.location_code}-${prefix}${timestamp}`;
  } else {
    return `${prefix}-${timestamp}`;
  }
};


watch(
  [
    () => locationStoreInstance.form_create_location.location_type,
    () => locationStoreInstance.form_create_location.parent_location_id
  ],
  () => {
    if (!locationStoreInstance.form_create_location.location_code) {
      locationStoreInstance.form_create_location.location_code = generateLocationCode();
    }
  }
);


watch(
  () => locationStoreInstance.form_create_location.location_type,
  (newType) => {
    if (newType && ['BUILDING', 'WAREHOUSE'].includes(newType)) {
      locationStoreInstance.form_create_location.parent_location_id = null;
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

onMounted(async () => {

  loading.value = true;
  try {
    await Promise.all([
      locationStoreInstance.GetParentLocations(),
    ]);
  } catch (error) {
    console.error("Error loading reference data:", error);
  } finally {
    loading.value = false;
  }
});
const locationTypes = ref([
  { title: "ອາຄານ", value: "ອາຄານ", color: "primary" },
  { title: "ຊັ້ນ", value: "ຊັ້ນ", color: "info" },
  { title: "ຫ້ອງ", value: "ຫ້ອງ", color: "success" },
  { title: "ລານຫຼືສວນ", value: "ສານຫຼືສວນ", color: "warning" },
  { title: "ສາງເກັບເຄື່ອງ", value: "ສາງເກັບເຄື່ອງ", color: "error" }
])
</script>

<template>
  <section class="pa-6">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>

        <v-col cols="12" >
          <v-row>
        
            

          
           

            <v-col cols="12" md="">
              <label>ລະຫັດສະຖານທີ່ <span class="text-error">*</span></label>
              <v-text-field
                v-model="locationStoreInstance.form_create_location.location_code"
                
                placeholder="ເຊັ່ນ: HQ-001, WH-001"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class=""
                maxlength="20"
                hint="ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ, - ແລະ _"
              ></v-text-field>

              <label>ຊື່ສະຖານທີ່ (ລາວ) <span class="text-error">*</span></label>
              <v-text-field
                v-model="locationStoreInstance.form_create_location.location_name_la"
                :rules="[rules.required, rules.maxLength255]"
                placeholder="ກະລຸນາປ້ອນຊື່ສະຖານທີ່ເປັນພາສາລາວ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class=""
                maxlength="255"
              ></v-text-field>

              <label>ຊື່ສະຖານທີ່ (ອັງກິດ) <span class="text-error">*</span></label>
              <v-text-field
                v-model="locationStoreInstance.form_create_location.location_name_en"
                :rules="[rules.required, rules.maxLength255]"
                placeholder="ກະລຸນາປ້ອນຊື່ສະຖານທີ່ເປັນພາສາອັງກິດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class=""
                maxlength="255"
              ></v-text-field>

              <label>ສະຖານທີ່ແມ່</label>
              <v-select
                v-model="locationStoreInstance.form_create_location.parent_location_id"
                :items="parentLocations"
                item-title="location_name_la"
                item-value="id"
                placeholder="ເລືອກສະຖານທີ່ແມ່ (ຖ້າມີ)"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class=""
                clearable
                
              >
                <!-- <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="secondary" variant="outlined">
                        {{ item.raw.location_code }}
                      </v-chip>
                    </template>
                    <v-list-item-title>{{ item.raw.location_name_la }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.location_type }}</v-list-item-subtitle>
                  </v-list-item>
                </template> -->
              </v-select>


              <label>ປະເພດສະຖານທີ່</label>
              <v-select
                v-model="locationStoreInstance.form_create_location.location_type"
                :items="locationTypes"
                item-title="title"
                item-value="value"
                placeholder="ເລືອກປະເພດສະຖານທີ່"
                density="compact"
                variant="outlined"
                hide-details="auto"
               
               
                
              >
                <!-- <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-chip size="x-small" color="secondary" variant="outlined">
                        {{ item.raw.value }}
                      </v-chip>
                    </template>
                   
                   
                  </v-list-item>
                </template> -->
              </v-select>

             
            </v-col>

            <v-col cols="12" md="6">
              <label>ຜູ້ຮັບຜິດຊອບ</label>
              <v-text-field
                v-model="locationStoreInstance.form_create_location.responsible_person"
                :rules="[rules.maxLength100]"
                placeholder="ຊື່ຜູ້ຮັບຜິດຊອບສະຖານທີ່"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class=""
                maxlength="100"
                prepend-inner-icon="mdi-account"
              ></v-text-field>

              <label>ເບີໂທລະສັບ</label>
              <v-text-field
                v-model="locationStoreInstance.form_create_location.phone"
                :rules="[rules.phone]"
                placeholder="ເຊັ່ນ: 021-123456, +856 20 1234567"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class=""
                prepend-inner-icon="mdi-phone"
              ></v-text-field>

              <label>ທີ່ຢູ່</label>
              <v-textarea
                v-model="locationStoreInstance.form_create_location.address"
                placeholder="ທີ່ຢູ່ລະອຽດຂອງສະຖານທີ່"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class=""
                rows="3"
                prepend-inner-icon="mdi-map-marker"
              ></v-textarea>

              <label>ໝາຍເຫດ</label>
              <v-textarea
                v-model="locationStoreInstance.form_create_location.remarks"
                :rules="[rules.maxLength500]"
                placeholder="ໝາຍເຫດເພີ່ມເຕີມ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class=""
                rows="3"
                maxlength="500"
                counter
                prepend-inner-icon="mdi-note-text"
              ></v-textarea>
            </v-col>

            
            <!-- <v-col cols="12" class="" v-if="locationStoreInstance.form_create_location.location_type">
              <v-divider class="mb-4"></v-divider>
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
                ຕົວຢ່າງຂໍ້ມູນສະຖານທີ່
              </h3>

              <v-card variant="outlined" class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" color="info" class="h-100">
                      <v-card-title class="text-h6 pb-2">
                        <v-icon class="mr-2">mdi-map-marker</v-icon>
                        ຂໍ້ມູນສະຖານທີ່
                      </v-card-title>
                      <v-card-text class="pt-0">
                        <v-list density="compact">
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ລະຫັດ:</v-list-item-title>
                            <v-list-item-subtitle class="text-h6 text-primary">
                              {{ locationStoreInstance.form_create_location.location_code || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ຊື່ (ລາວ):</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_create_location.location_name_la || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ຊື່ (ອັງກິດ):</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_create_location.location_name_en || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ປະເພດ:</v-list-item-title>
                            <v-list-item-subtitle>
                              <v-chip 
                                v-if="locationStoreInstance.form_create_location.location_type"
                                size="small" 
                                :color="locationTypeOptions.find(t => t.value === locationStoreInstance.form_create_location.location_type)?.color" 
                                variant="flat"
                              >
                                {{ locationTypeOptions.find(t => t.value === locationStoreInstance.form_create_location.location_type)?.title }}
                              </v-chip>
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-card variant="outlined" color="success" class="h-100">
                      <v-card-title class="text-h6 pb-2">
                        <v-icon class="mr-2">mdi-account-details</v-icon>
                        ຂໍ້ມູນຕິດຕໍ່
                      </v-card-title>
                      <v-card-text class="pt-0">
                        <v-list density="compact">
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ຜູ້ຮັບຜິດຊອບ:</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_create_location.responsible_person || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ເບີໂທ:</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_create_location.phone || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ທີ່ຢູ່:</v-list-item-title>
                            <v-list-item-subtitle>
                              {{ locationStoreInstance.form_create_location.address || '-' }}
                            </v-list-item-subtitle>
                          </v-list-item>
                          <v-list-item>
                            <v-list-item-title class="text-subtitle-2">ສະຖານະ:</v-list-item-title>
                            <v-list-item-subtitle>
                              <v-chip 
                                v-if="locationStoreInstance.form_create_location.record_stat"
                                size="small" 
                                :color="locationStoreInstance.form_create_location.record_stat === 'O' ? 'success' : 'error'" 
                                variant="flat"
                              >
                                {{ locationStoreInstance.form_create_location.record_stat === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                              </v-chip>
                            </v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>

                
              </v-card>
            </v-col> -->

            
            <v-col cols="12" class="d-flex flex-wrap justify-center ">
              <v-btn 
                color="error" 
                variant="outlined"
                @click="goBack"
                class="mr-2"
                :disabled="locationStoreInstance.isLoading"
              >
                ຍົກເລີກ
              </v-btn>
              
              <v-btn 
                color="primary" 
                type="submit" 
                :loading="locationStoreInstance.isLoading"
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

@media (max-width: 768px) {
  .d-flex.align-center {
    flex-direction: column;
    text-align: center;
  }
  
  .d-flex.align-center .mx-4 {
    margin: 16px 0 !important;
    transform: rotate(90deg);
  }
}
</style>