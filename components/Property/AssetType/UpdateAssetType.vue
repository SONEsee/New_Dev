<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRoute, useRouter } from "vue-router";


const assetTypeStoreInstance = assetTypeStore();
const route = useRoute();
const router = useRouter();

const type_id = route.query.type_id as string;


const title = ref("ແກ້ໄຂປະເພດຊັບສົມບັດ");
const loading = ref(false);
const form = ref();


const goBack = () => {
  router.go(-1);
};


onMounted(() => {
  if (type_id) {
    loadAssetTypeDetail();
  }
});


const loadAssetTypeDetail = async () => {
  try {
    await assetTypeStoreInstance.GetAssetTypeDetail(type_id);
  } catch (error) {
    console.error("Error loading asset type detail:", error);
  }
};


watch(
  () => assetTypeStoreInstance.response_asset_type_detail,
  (newVal) => {
    if (newVal) {
      assetTypeStoreInstance.form_update_asset_type.type_id = newVal.type_id || "";
      assetTypeStoreInstance.form_update_asset_type.type_code = newVal.type_code || "";
      assetTypeStoreInstance.form_update_asset_type.type_name = newVal.type_name || "";
      assetTypeStoreInstance.form_update_asset_type.description = newVal.description || "";
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
      text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນປະເພດຊັບສົມບັດ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await assetTypeStoreInstance.UpdateAssetType(type_id);
    }
  }
};


const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  maxLength10: (value: string) => {
    if (!value) return true;
    return value.length <= 10 || "ຄວາມຍາວບໍ່ເກີນ 10 ຕົວອັກສອນ";
  },
  maxLength100: (value: string) => {
    if (!value) return true;
    return value.length <= 100 || "ຄວາມຍາວບໍ່ເກີນ 100 ຕົວອັກສອນ";
  },
  typeCode: (value: string) => {
    if (!value) return "ກະລຸນາປ້ອນລະຫັດປະເພດ";
    const pattern = /^[A-Z0-9]+$/;
    return pattern.test(value) || "ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່ແລະຕົວເລກເທົ່ານັ້ນ";
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
            <v-col cols="12" md="6">
              <label>ລະຫັດປະເພດ / Type Code <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetTypeStoreInstance.form_update_asset_type.type_code"
                :rules="[rules.required, rules.typeCode, rules.maxLength10]"
                placeholder="ເຊັ່ນ: MACH, VEHI, COMP"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="10"
                style="text-transform: uppercase;"
                @input="assetTypeStoreInstance.form_update_asset_type.type_code = $event.target.value.toUpperCase()"
              ></v-text-field>

              <label>ຊື່ປະເພດຊັບສົມບັດ / Asset Type Name <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetTypeStoreInstance.form_update_asset_type.type_name"
                :rules="[rules.required, rules.maxLength100]"
                placeholder="ກະລຸນາປ້ອນຊື່ປະເພດຊັບສົມບັດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="100"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <label>ຄຳອະທິບາຍ / Description</label>
              <v-textarea
                v-model="assetTypeStoreInstance.form_update_asset_type.description"
                placeholder="ກະລຸນາປ້ອນຄຳອະທິບາຍປະເພດຊັບສົມບັດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="4"
                maxlength="500"
                counter
              ></v-textarea>

              
              <v-card variant="outlined" class="mt-4" v-if="assetTypeStoreInstance.response_asset_type_detail">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-information-outline</v-icon>
                  ຂໍ້ມູນເດີມ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ລະຫັດ ID:</v-list-item-title>
                      <v-list-item-subtitle>{{ assetTypeStoreInstance.response_asset_type_detail.type_id }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="text-subtitle-2">ສະຖານະ:</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip 
                          :color="assetTypeStoreInstance.response_asset_type_detail.RECORD_STAT === 'O' ? 'success' : 'error'"
                          size="small"
                          variant="flat"
                        >
                          {{ assetTypeStoreInstance.response_asset_type_detail.RECORD_STAT === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-col cols="12" class="d-flex flex-wrap justify-center mt-4">
          <v-btn color="primary" flat type="submit" :loading="assetTypeStoreInstance.isLoading" class="mr-2">
            ບັນທຶກ
          </v-btn> <v-btn 
            color="error" 
            flat 
            @click="goBack"
           
          >
           ຍົກເລີກ
          </v-btn>
          
         
        </v-col>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>