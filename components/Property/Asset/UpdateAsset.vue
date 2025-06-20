<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter, useRoute } from "vue-router";

const locationStores = locationStore();
const assetStoreInstance = assetStore();
const proppertyStore = propertyStore();
const router = useRouter();
const route = useRoute();
const asset_id = route.query.asset_id ;
const asset_code = route.query.asset_code as string;


const request = computed({
  get: () => assetStoreInstance.form_update_asset,
  set: (value) => {
    assetStoreInstance.form_update_asset = value;
  },
});

const locations = computed(() => {
  return locationStores.response_location_list;
});

const details = computed(() => {
  return assetStoreInstance.response_asset_detail;
});

const title = ref("ແກ້ໄຂຊັບສິນ"); 
const loading = ref(false);
const form = ref();

const mockData1 = computed(() => {
  return proppertyStore.respons_data_property_category || [];
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
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງແກ້ໄຂຊັບສິນ "${request.value.asset_name_la}" ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
      await assetStoreInstance.UpdateAsset(asset_id);
    }
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
    const pattern = /^AST[0-9]{6}$/;
    return pattern.test(value) || "ຮູບແບບຕ້ອງເປັນ AST123456 (AST + 6 ຕົວເລກ)";
  },
  positiveNumber: (value: string | number) => {
    if (!value) return "ກະລຸນາປ້ອນມູນຄ່າ";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num > 0 || "ມູນຄ່າຕ້ອງມາກກວ່າ 0";
  },
};

onMounted(async () => {
  assetStoreInstance.req_filter_asset_code.query.asset_code = asset_code;
  await assetStoreInstance.GetAssetDetail();
  
 
  if (assetStoreInstance.response_asset_detail) {
    let detail;
    
    
    if (Array.isArray(assetStoreInstance.response_asset_detail)) {
      detail = assetStoreInstance.response_asset_detail[0] || {};
    } else {
      detail = assetStoreInstance.response_asset_detail || {};
    }
    
    assetStoreInstance.form_update_asset = {
      asset_code: detail.asset_code || "",
      asset_name_la: detail.asset_name_la || "",
      asset_name_en: detail.asset_name_en || "",
      asset_type_id: detail.asset_type_id || "",
    };
  }
  
  locationStores.GetLocationList();
  proppertyStore.GetPropertyCategoryById();
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
              <label>
                ລະຫັດຊັບສິນ / Asset Code
                <span class="text-error">*</span>
              </label>
              <v-text-field
                v-model="request.asset_code"
               
                placeholder="ເຊັ່ນ: AST001001, AST002001"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="20"
                
              ></v-text-field>

              <label>
                ຊື່ຊັບສິນ (ລາວ) / Asset Name (Lao)
                <span class="text-error">*</span>
              </label>
              <v-text-field
                v-model="request.asset_name_la"
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
              <label>
                ປະເພດຊັບສິນ / Asset Type
                <span class="text-error">*</span>
              </label>
              <v-select
                v-model="request.asset_type_id"
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
              <label>
                ຊື່ຊັບສິນ (ອັງກິດ) / Asset Name (English)
                <span class="text-error">*</span>
              </label>
              <v-text-field
                v-model="request.asset_name_en"
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
              <v-btn color="error" flat @click="goBack" class="mr-2">
                ຍົກເລີກ
              </v-btn>

              <v-btn
                color="primary"
                flat
                type="submit"
                :loading="assetStoreInstance.isLoading"
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