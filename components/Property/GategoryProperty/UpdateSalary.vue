<script lang="ts" setup>
import axios from "@/helpers/axios";
import { CallSwal } from "#build/imports";
import { useRoute } from "vue-router";

const propertyStor = propertyStore();
const route = useRoute();
const id = Number(route.query.type_id) || 0;
const update_form = propertyStor.form_update_property_category
const title = ref("ແກ້ໄຂປະເພດຊັບສິນ");
const loading = ref(false);
const form = ref();



const rules = {
  required: (value: any) => !!value || "ກະລຸນາໃສ່ຂໍ້ມູນ",
};

onMounted(() => {
  propertyStor.GetPropertyDetail(id);

});




watch(
  () => propertyStor.respons_detail_property_category,
  (newVal) => {
    if (newVal) {
      update_form.type_id = newVal.type_id || "";
      update_form.type_code = newVal.type_code || "";
      update_form.type_name_la = newVal.type_name_la || "";
      update_form.type_name_en = newVal.type_name_en || "";
      update_form.is_tangible = newVal.is_tangible || "";
      
    }
  },
  { immediate: true }
);

const submitForm = async () => {
  if (!form.value) return;
  
  const validation = await form.value.validate();
  if (validation.valid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນປະເພດຊັບສິນ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
      await updatePropertyType();
    }
  }
};

const updatePropertyType = async () => {
  loading.value = true;
  try {
   await propertyStor.UpdatePropertyType(id)
  } catch (error) {
    console.error("Error updating property type:", error);
    CallSwal({
      title: "ຜິດພາດ",
      text: "ມີຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ",
      icon: "error",
      showCancelButton: false,
      confirmButtonText: "ຕົກລົງ",
    });
  } finally {
    loading.value = false;
  }
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
              <label>ລະຫັດປະເພດ / Type Code</label>
              <v-text-field
                v-model="update_form.type_code"
                :rules="[rules.required]"
                placeholder="ກະລຸນາປ້ອນລະຫັດປະເພດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              />

              <label>ຊື່ປະເພດ (ລາວ) / Type Name (Lao)</label>
              <v-text-field
                v-model="update_form.type_name_la"
                :rules="[rules.required]"
                placeholder="ກະລຸນາປ້ອນຊື່ປະເພດພາສາລາວ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              />

              <label>ຊື່ປະເພດ (ອັງກິດ) / Type Name (English)</label>
              <v-text-field
                v-model="update_form.type_name_en"
                :rules="[rules.required]"
                placeholder="ກະລຸນາປ້ອນຊື່ປະເພດພາສາອັງກິດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              />
            </v-col>

            <v-col cols="12" md="6">
              <label>ປະເພດຊັບສິນ / Asset Type</label>
              <v-select
                v-model="update_form.is_tangible"
                :rules="[rules.required]"
                placeholder="ເລືອກປະເພດຊັບສິນ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                :items="[
                  { title: 'ຊັບສິນທີ່ແທ້ຈິງ', value: 'Y' },
                  { title: 'ຊັບສິນທີ່ບໍ່ແທ້ຈິງ', value: 'N' }
                ]"
                item-title="title"
                item-value="value"
              />

              <!-- <label>ຄຳອະທິບາຍ / Description</label>
              <v-textarea
                v-model="update_form.description"
                placeholder="ກະລຸນາປ້ອນຄຳອະທິບາຍ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="6"
              /> -->
            </v-col>
          </v-row>
        </v-col>
        
        <v-col cols="12" class="d-flex flex-wrap justify-center">
          <v-btn 
            color="primary" 
            flat 
            type="submit" 
            :loading="loading"
            :disabled="loading"
          >
            ບັນທຶກ
          </v-btn>
          <v-btn
            color="error"
            flat
            class="ml-3"
            @click="$router.go(-1)"
            :disabled="loading"
          >
            ຍົກເລີກ
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>