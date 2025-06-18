<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter } from "vue-router";

// Initialize store and router
const assetTypeStoreInstance = assetTypeStore();
const router = useRouter();

// Reactive data
const title = ref("ເພີ່ມປະເພດຊັບສົມບັດໃໝ່");
const loading = ref(false);
const form = ref();

// Go back function
const goBack = () => {
  router.go(-1);
};

// Submit form function
const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງເພີ່ມປະເພດຊັບສົມບັດໃໝ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      await assetTypeStoreInstance.CreateAssetType();
    }
  }
};

// Validation rules
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

        <v-col cols="12" class="d-flex flex-wrap justify-space-between">
          <v-btn 
            color="secondary" 
            flat 
            @click="goBack"
            prepend-icon="mdi-arrow-left"
          >
            ກັບຄືນ
          </v-btn>
          
          <v-btn color="primary" flat type="submit" :loading="assetTypeStoreInstance.isLoading">
            ບັນທຶກ
          </v-btn>
        </v-col>

        <v-col cols="12" class="pt-12">
          <v-row>
            <v-col cols="12" md="6">
              <label>ລະຫັດປະເພດ / Type Code <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetTypeStoreInstance.form_create_asset_type.type_code"
                :rules="[rules.required, rules.typeCode, rules.maxLength10]"
                placeholder="ເຊັ່ນ: MACH, VEHI, COMP"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                maxlength="10"
                style="text-transform: uppercase;"
                @input="assetTypeStoreInstance.form_create_asset_type.type_code = $event.target.value.toUpperCase()"
              ></v-text-field>

              <label>ຊື່ປະເພດຊັບສົມບັດ / Asset Type Name <span class="text-error">*</span></label>
              <v-text-field
                v-model="assetTypeStoreInstance.form_create_asset_type.type_name"
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
                v-model="assetTypeStoreInstance.form_create_asset_type.description"
                placeholder="ກະລຸນາປ້ອນຄຳອະທິບາຍປະເພດຊັບສົມບັດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="4"
                maxlength="500"
                counter
              ></v-textarea>

             
              <v-card variant="outlined" class="mt-4">
                <v-card-title class="text-h6 pb-2">
                  <v-icon class="mr-2">mdi-lightbulb-outline</v-icon>
                  ຕົວຢ່າງລະຫັດປະເພດ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-chip class="ma-1" color="primary" variant="outlined" size="small">MACH - ເຄື່ອງຈັກ</v-chip>
                  <v-chip class="ma-1" color="primary" variant="outlined" size="small">VEHI - ຍານພາຫະນະ</v-chip>
                  <v-chip class="ma-1" color="primary" variant="outlined" size="small">COMP - ຄອມພິວເຕີ</v-chip>
                  <v-chip class="ma-1" color="primary" variant="outlined" size="small">FURN - ເຄື່ອງເຟີນີເຈີ</v-chip>
                  <v-chip class="ma-1" color="primary" variant="outlined" size="small">BUIL - ອາຄານ</v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>