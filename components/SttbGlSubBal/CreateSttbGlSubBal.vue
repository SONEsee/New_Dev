<script setup lang="ts">
import { useGlStore } from "@/stores/gl";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const glStore = useGlStore();
const route = useRoute();

const gl_code = String(route.query.gl_code) || "";
const useglStore = useGlStore();

const res = computed(() => {
  return useglStore.respons_detail_gl;
});

const formData = reactive({
  gl_code: "",
  gl_Desc_la: "",
  gl_Desc_en: "",
  glType: "",
  category: "",
});

onMounted(() => {
  if (gl_code) {
    useglStore.getGlMasterDetail(gl_code);
  }
});

watch(
  res,
  (newRes) => {
    if (newRes) {
      formData.gl_code = newRes.gl_code || "";
      formData.gl_Desc_la = newRes.gl_Desc_la || "";
      formData.gl_Desc_en = newRes.gl_Desc_en || "";
      formData.glType = newRes.glType || "";
      formData.category = newRes.category || "";
    }
  },
  { immediate: true }
);

const title = "ຈັດການຂໍ້ມູນຍອດເຫຼືອບັນຊີຍ່ອຍ GL Sub Balance";
const valid = ref(false);
const form = ref();

const toggleDescription = () => {
  valid.value = !valid.value;
};

const submitTransaction = async () => {
  const { valid: isFormValid } = await form.value.validate();
  if (isFormValid) {
    try {
      const notification = await CallSwal({
        title: "ຄຳເຕືອນ",
        text: "ທ່ານຍັງບໍ່ທັນໄດ້ຕໍ່ api ໄປຕໍ່ໃຫ້ແລ້ວກອ່ນຄອ່ຍມາວ່າກັນ",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: true,
      });
      if (notification.isConfirmed) {
        setTimeout(() => {
          router.push("/glsubbalance");
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  }
};

const cancelForm = () => {
  router.push("/glsubbalance");
};
</script>

<template>
  <v-col cols="12">
    {{ res }}
    {{ res?.gl_Desc_la }}
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        {{ res?.gl_code ?? "ບໍ່ມີຂໍ້ມູນ" }}
        <v-form ref="form" v-model="valid" @submit.prevent="submitTransaction">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-if="res"
                v-model="formData.gl_code"
                @click:append-inner="toggleDescription"
                density="compact"
                variant="outlined"
                label="ລະຫັດ GL"
                maxlength="20"
                :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດ GL']"
                :loading="useglStore.isloading"
                required
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.gl_Desc_la"
                density="compact"
                variant="outlined"
                label="ຄຳອະທິບາຍ (ລາວ)"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.gl_Desc_en"
                density="compact"
                variant="outlined"
                label="ຄຳອະທິບາຍ (ອັງກິດ)"
                :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຄຳອະທິບາຍ']"
                required
              />{{ res?.gl_code }}
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="d-flex justify-center gap-2">
              <v-btn
                type="submit"
                color="primary"
                :loading="useglStore.isloading"
                text="ບັນທຶກ"
              />
              <v-btn color="error" text="ຍົກເລີກ" @click="cancelForm" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-col>
</template>
