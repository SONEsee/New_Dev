<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter, useRoute } from "vue-router";
import { ref, computed, onMounted, watch } from "vue";

const locationStores = locationStore();
const assetStoreInstance = assetStore();
const proppertyStore = propertyStore();
const router = useRouter();
const route = useRoute();

const asset_id = route.query.asset_type_id;
const asset_type_id = route.query.asset_type_id as string;

// Computed properties
const count = computed(() => {
  return assetStoreInstance.response_asset_list || [];
});

const locations = computed(() => {
  return locationStores.response_location_list || [];
});

const mockData1 = computed(() => {
  return proppertyStore.respons_data_property_category || [];
});

const selectedAssetType = computed(() => {
  if (!mockData1.value || !asset_type_id) return null;
  const found = mockData1.value.find(item => String(item.type_id) === String(asset_type_id));
  console.log('selectedAssetType found:', found);
  return found;
});

// Form state
const title = ref("ເພີ່ມຊັບສິນໃໝ່");
const loading = ref(false);
const form = ref();

// Functions for asset code generation
const extractSequenceNumber = (assetCode) => {
  // Extract number from asset_code like "FIX-000003" -> 3
  const match = assetCode.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
};

const generateNewAssetCode = (assetData, typeCode) => {
  if (!assetData || assetData.length === 0) {
    // If no data, start from 000001
    return `${typeCode}-000001`;
  }

  // Find the highest sequence number
  const maxSequence = assetData.reduce((max, item) => {
    const sequence = extractSequenceNumber(item.asset_code);
    return sequence > max ? sequence : max;
  }, 0);

  // Add 1 and format to 6 digits
  const nextSequence = (maxSequence + 1).toString().padStart(6, '0');
  return `${typeCode}-${nextSequence}`;
};

// Navigation
const goBack = () => {
  router.go(-1);
};

// Form submission
const submitForm = async () => {
  try {
    console.log('Form data before validation:', assetStoreInstance.form_create_asset);
    
    const { valid: isValid } = await form.value.validate();
    
    if (isValid) {
      console.log('Form is valid, showing confirmation');
      
      const notification = await CallSwal({
        icon: "warning",
        title: "ຄຳເຕືອນ",
        text: `ທ່ານກຳລັງເພີ່ມຊັບສິນໃໝ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
        showCancelButton: true,
        confirmButtonText: "ຕົກລົງ",
        cancelButtonText: "ຍົກເລີກ",
      });
      
      if (notification.isConfirmed) {
        console.log('User confirmed, creating asset...');
        console.log('Data to send:', assetStoreInstance.form_create_asset);
        
        await assetStoreInstance.CreateAsset();
        
        console.log('Asset creation completed');
      }
    } else {
      console.log('Form validation failed');
    }
  } catch (error) {
    console.error("Asset creation failed:", error);
  }
};

// Validation rules
const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  maxLength20: (value: string) => {
    if (!value) return true;
    return value.length <= 20 || "ຄວາມຍາວບໍ່ເກີນ 20 ຕົວອັກສອນ";
  },
  maxLength100: (value: string) => {
    if (!value) return true;
    return value.length <= 100 || "ຄວາມຍາວບໍ່ເກີນ 100 ຕົວອັກສອນ";
  },
  maxLength200: (value: string) => {
    if (!value) return true;
    return value.length <= 200 || "ຄວາມຍາວບໍ່ເກີນ 200 ຕົວອັກສອນ";
  },
  assetCode: (value: string) => {
    if (!value) return "ກະລຸນາປ້ອນລະຫັດຊັບສິນ";
    const pattern = /^[A-Z]{3}-\d{6}$/;
    return pattern.test(value) || "ຮູບແບບຕ້ອງເປັນ ABC-123456 (3 ຕົວອັກສອນ-6 ຕົວເລກ)";
  },
  positiveNumber: (value: string | number) => {
    if (!value) return "ກະລຸນາປ້ອນມູນຄ່າ";
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num > 0) || "ມູນຄ່າຕ້ອງມາກກວ່າ 0";
  },
};

// Watchers
// Generate asset code when count data or selected type changes
watch([count, selectedAssetType], ([assetData, selectedType]) => {
  console.log('Asset data:', assetData);
  console.log('Selected type:', selectedType);
  
  if (selectedType && selectedType.type_code) {
    const newAssetCode = generateNewAssetCode(assetData, selectedType.type_code);
    assetStoreInstance.form_create_asset.asset_code = newAssetCode;
    console.log('Generated asset code:', newAssetCode);
  }
}, { immediate: true });

// Set asset type ID
watch([mockData1, () => asset_type_id], ([data, typeId]) => {
  if (data && data.length > 0 && typeId) {
    console.log('Setting asset_type_id:', typeId);
    console.log('Available mockData1:', data.map(item => ({ id: item.type_id, name: item.type_name_la })));
  
    const typeIdNumber = typeof typeId === 'string' ? parseInt(typeId) : typeId;
    assetStoreInstance.form_create_asset.asset_type_id = typeIdNumber;
  }
}, { immediate: true });

// Lifecycle
onMounted(async () => {
  // Set filter for asset list
  assetStoreInstance.respons_filter_asset_type_id.query.asset_type_id = asset_id;
  
  // Load data
  await assetStoreInstance.GetAssetList();
  await locationStores.GetLocationList();
  await proppertyStore.GetPropertyCategoryById();
  
  // Load assets by type if type_id exists
  if (asset_type_id) {
    await assetStoreInstance.GetAssetByTypeId(asset_type_id);
  }
});
</script>

<template>
  <section class="pa-6">
    <!-- Debug info -->
    <div class="mb-4">
      <small class="text-grey">Debug: Asset Count = {{ count.length }}</small>
    </div>

    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>

        <v-col cols="12" class="pt-12">
          <v-row>
            <!-- Left Column -->
            <v-col cols="12" md="6">
              <label>ລະຫັດຊັບສິນ / Asset Code <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetStoreInstance.form_create_asset.asset_code"
                :rules="[rules.required, rules.assetCode]"
                placeholder="ເຊັ່ນ: FIX-000001, BLD-000001"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="20"
                readonly
              ></v-text-field>

              <label>ຊື່ຊັບສິນ (ລາວ) / Asset Name (Lao) <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetStoreInstance.form_create_asset.asset_name_la"
                :rules="[rules.required, rules.maxLength100]"
                placeholder="ກະລຸນາປ້ອນຊື່ຊັບສິນເປັນພາສາລາວ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
              ></v-text-field>
            </v-col>

            <!-- Right Column -->
            <v-col cols="12" md="6">
              <label>ປະເພດຊັບສິນ / Asset Type <span class="text-error">*</span></label>
              <v-autocomplete
                v-model="assetStoreInstance.form_create_asset.asset_type_id"
                :rules="[rules.required]"
                :items="mockData1"
                item-title="type_name_la"
                item-value="type_id"
                placeholder="ກະລຸນາເລືອກປະເພດຊັບສິນ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                readonly
              >
                <template v-slot:selection="{ item }">
                  <span v-if="selectedAssetType">
                    {{ selectedAssetType.type_name_la }} ({{ selectedAssetType.type_code }})
                  </span>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="`${item.title} (${item.raw.type_code})`"
                  />
                </template>
              </v-autocomplete>

              <label>ຊື່ຊັບສິນ (ອັງກິດ) / Asset Name (English) <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetStoreInstance.form_create_asset.asset_name_en"
                :rules="[rules.required, rules.maxLength100]"
                placeholder="Please enter asset name in English"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
              ></v-text-field>
            </v-col>
            
            <!-- Buttons -->
            <v-col cols="12" class="d-flex flex-wrap justify-center">
              <v-btn 
                color="error" 
                flat 
                @click="goBack"
                class="mr-2"
              >
                ຍົກເລີກ
              </v-btn>
              
              <v-btn color="primary" flat type="submit" :loading="assetStoreInstance.isLoading">
                ບັນທຶກ
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>