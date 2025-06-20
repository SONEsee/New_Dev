<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";
const locationStores = locationStore();
const assetStoreInstance = assetStore();
const router = useRouter();
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


const assetTypes = [
  { title: "ເຄື່ອງຈັກ", value: "1" },
  { title: "ພາຫານະ", value: "2" },
  { title: "ອຸປະກອນ IT", value: "3" },
  { title: "ເຟີນິເຈີ", value: "4" },
  { title: "ອາຄານ", value: "5" },
];

// const locations = ref([
//   "ຫ້ອງການ A",
//   "ຫ້ອງການ B", 
//   "ຫ້ອງການ C",
//   "ໂຮງງານ 1",
//   "ໂຮງງານ 2",
//   "ລານຈອດລົດ",
//   "ຄັງເກັບຂອງ",
// ]);

const goBack = () => {
  router.go(-1);
};

const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງເພີ່ມຊັບສິນໃໝ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await assetStoreInstance.CreateAsset();
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
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return (num > 0) || "ມູນຄ່າຕ້ອງມາກກວ່າ 0";
  },
};

onMounted(async () => {
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
              <label>ລະຫັດຊັບສິນ / Asset Code <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetStoreInstance.form_create_asset.asset_code"
                
                placeholder="ເຊັ່ນ: AST001001, AST002001"
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
              <!-- <label>ມູນຄ່າຊັບສິນ / Asset Value (ກີບ) <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetStoreInstance.form_create_asset.value"
                :rules="[rules.required, rules.positiveNumber]"
                placeholder="ປ້ອນມູນຄ່າເປັນກີບ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                type="number"
                prefix="₭"
              ></v-text-field> -->

              <!-- <label>ສະຖານທີ່ / Location</label>
              <v-autocomplete
                v-model="assetStoreInstance.form_create_asset.location"
                :items="locations || []"
                placeholder="ເລືອກຫຼືປ້ອນສະຖານທີ່"
                density="compact"
                variant="outlined"
                hide-details="auto"
                item-title="location_name_la"
                item-value="location_id"
                class="pb-6"
                clearable
              ></v-autocomplete> -->

             

              <!-- <label>ວັນທີເລີ່ມໃຊ້ງານ / Start Date</label>
              <v-text-field
                v-model="assetStoreInstance.form_create_asset.start_date"
                type="date"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field> -->
 <!-- <label>ຄຳອະທິບາຍ / Description</label>
              <v-textarea
                v-model="assetStoreInstance.form_create_asset.description"
                placeholder="ກະລຸນາປ້ອນຄຳອະທິບາຍຊັບສິນ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="4"
                maxlength="500"
                counter
                :rules="[rules.maxLength200]"
              ></v-textarea> -->
              <!-- Example Card -->
              <!-- <v-card variant="outlined" class="mt-4">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                  ຕົວຢ່າງລະຫັດຊັບສິນ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ເຄື່ອງຈັກ:</v-list-item-title>
                      <v-list-item-subtitle>AST001001 - AST001999</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ພາຫານະ:</v-list-item-title>
                      <v-list-item-subtitle>AST002001 - AST002999</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ອຸປະກອນ IT:</v-list-item-title>
                      <v-list-item-subtitle>AST003001 - AST003999</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ເຟີນິເຈີ:</v-list-item-title>
                      <v-list-item-subtitle>AST004001 - AST004999</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ອາຄານ:</v-list-item-title>
                      <v-list-item-subtitle>AST005001 - AST005999</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card> -->
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