<script lang="ts" setup>
import axios from "@/helpers/axios";
import { CallSwal } from "#build/imports";
import { useRoute } from "vue-router";

const propertyStor = propertyStore();

const route = useRoute();
const type_id = route.query.type_id as string;

const title = ref("ແກ້ໄຂປະເພດຊັບສິນ");
const loading = ref(false);
const form = ref();

const update_form = ref({
  type_id: "" as string | number,
  type_code: "",
  type_name: "",
  description: "",
});

onMounted(() => {
  if (type_id) {
    loadPropertyDetail();
  }
});

const loadPropertyDetail = async () => {
  try {
    await propertyStor.GetPropertyDetail(type_id);
  } catch (error) {
    console.error("Error loading property detail:", error);
  }
};

watch(
  () => propertyStor.respons_detail_property_category,
  (newVal) => {
    if (newVal) {
      update_form.value.type_id = newVal.type_id || "";
      update_form.value.type_code = newVal.type_code || "";
      update_form.value.type_name = newVal.type_name || "";
      update_form.value.description = newVal.description || "";
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
    const res = await axios.put(`property/${type_id}`, update_form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.status === 200) {
      CallSwal({
        title: "ສຳເລັດ",
        text: "ສຳເລັດການແກ້ໄຂປະເພດຊັບສິນ",
        icon: "success",
        showCancelButton: false,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigateTo("/property/propertytype");
      }, 1500);
    }
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
                :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດປະເພດ']"
                placeholder="ກະລຸນາປ້ອນລະຫັດປະເພດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>

              <label>ຊື່ປະເພດ / Type Name</label>
              <v-text-field
                v-model="update_form.type_name"
                :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ປະເພດ']"
                placeholder="ກະລຸນາປ້ອນຊື່ປະເພດ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <label>ຄຳອະທິບາຍ / Description</label>
              <v-textarea
                v-model="update_form.description"
                placeholder="ກະລຸນາປ້ອນຄຳອະທິບາຍ"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                rows="3"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" class="d-flex flex-wrap justify-center">
          <v-btn color="primary" flat type="submit" :loading="loading">
            ບັນທຶກ
          </v-btn>
          <v-btn
            color="error"
            flat
            type="submit"
            :loading="loading"
            class="ml-3"
            @click="$router.go(-1)"
          >
            ຍົກເລີກ
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>
