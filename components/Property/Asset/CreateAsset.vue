<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter, useRoute } from "vue-router";
import { ref, computed, onMounted, watch } from "vue";

const locationStores = locationStore();
const assetStoreInstance = assetStore();
const router = useRouter();
const route = useRoute();

// ດຶງ asset_type_id ແລະ asset_type_name ຈາກ URL parameter
const asset_type_id = route.query.asset_type_id as string;
const asset_type_name = route.query.asset_type_name as string;

const locations= computed(()=>{
    return locationStores.response_location_list
})
const title = ref("ເພີ່ມຊັບສິນໃໝ່");
const loading = ref(false);
const form = ref();
const proppertyStore = propertyStore();

const mockData1 =  computed(()=>{
  return proppertyStore.respons_data_property_category || []
})

// ສຳລັບເກັບຂໍ້ມູນ response ທີ່ໃຊ້ສ້າງ asset_code
const assetResponse = computed(() => {
  return assetStoreInstance.response_asset_by_type || [];
});

const assetTypes = [
  { title: "ເຄື່ອງຈັກ", value: "1" },
  { title: "ພາຫານະ", value: "2" },
  { title: "ອຸປະກອນ IT", value: "3" },
  { title: "ເຟີນິເຈີ", value: "4" },
  { title: "ອາຄານ", value: "5" },
];

const goBack = () => {
  router.go(-1);
};

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
    const pattern = /^[A-Z]{3}[0-9]{6}$/;
    return pattern.test(value) || "ຮູບແບບຕ້ອງເປັນ ABC123456 (3 ຕົວອັກສອນ + 6 ຕົວເລກ)";
  },
  positiveNumber: (value: string | number) => {
    if (!value) return "ກະລຸນາປ້ອນມູນຄ່າ";
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num > 0) || "ມູນຄ່າຕ້ອງມາກກວ່າ 0";
  },
};

// Watch ສຳລັບສ້າງ asset_code ອັດຕະໂນມັດ (ໃຊ້ asset_type_id ຈາກ URL)
watch(assetResponse, (newRes) => {
  if (asset_type_name) {
    if (newRes && newRes.length > 0) {
      const resData = newRes[0];
      const nextId = resData.count + 1;
      const paddedId = nextId.toString().padStart(6, '0');
      assetStoreInstance.form_create_asset.asset_code = `${asset_type_name}${paddedId}`;
    } else {
      // ຖ້າບໍ່ມີ response ແຕ່ມີ asset_type_id ຈາກ URL parameter
      // ໃຊ້ຄ່າເລີ່ມຕົ້ນ 000001
      assetStoreInstance.form_create_asset.asset_code = `${asset_type_name}000001`;
    }
  }
}, { immediate: true });

onMounted(async () => {
  await locationStores.GetLocationList();
  await proppertyStore.GetPropertyCategoryById();
  
  // Set asset_type_id ຈາກ URL parameter ກ່ອນ
  if (asset_type_id) {
    assetStoreInstance.form_create_asset.asset_type_id = asset_type_id;
  }
  
  // ດຶງຂໍ້ມູນຊັບສິນທີ່ມີຢູ່ແລ້ວຕາມ asset_type_id ເພື່ອສ້າງລະຫັດໃໝ່
  if (asset_type_id) {
    await assetStoreInstance.GetAssetByTypeId(asset_type_id);
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
            <v-col cols="12" md="6">
              <label>ລະຫັດຊັບສິນ / Asset Code <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetStoreInstance.form_create_asset.asset_code"
                :rules="[rules.required, rules.assetCode]"
                placeholder="ເຊັ່ນ: FIX000001, MOB000001"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="20"
                
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

            <v-col cols="12" md="6">
              <label>ປະເພດຊັບສິນ / Asset Type <span class="text-error">*</span></label>
              <v-select
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
              ></v-select>
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