v-text-field<script setup lang="ts">
import { useGlStore } from "@/stores/gl";
import { useRoute } from "vue-router";

const router = useRouter();
const glStore = useGlStore();
const request = glStore.create_form_gl;
const route = useRoute();
// const id = route.query.id as number || 0;
const gl_code = Number(route.query.gl_code) || 0;
const useglStore = useGlStore();
const res = computed(() => {
  return useglStore.respons_detail_gl || [];
});
// onMounted(() => {
//   useglStore.getGlMasterDetail(gl_code);
// });
onMounted( async ()=>{
  await useglStore.getGlMasterDetail(gl_code);
  
})
import axios from "@/helpers/axios";
const title = "ຈັດການຂໍ້ມູນຍອດເຫຼືອບັນຊີຍ່ອຍ GL Sub Balance";
const valid = ref(false);
const form = ref();
const Destription = () => {
  valid.value = !valid.value;
};
const Submittarnsacto = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    try {
      const notification = await CallSwal({
        title: "ຄຳເຕືອນ",
        text: "ທ່ານຍັງບໍ່ທັນໄດ້ຕໍ່ api ໄປຕໍ່ໃຫ້ແລ້ວກອ່ນຄອ່ຍມາວ່າກັນ",
        icon: "warning",
        showCancelButton: false,
        showConfirmButton: true,
      });
      if (notification.isConfirmed) {
        setTimeout(() => {
          goPath("/glsubbalance");
        }, 1500);
      }
    } catch (error) {}
  }
};
</script>
<template>
  <v-col cols="12">
    <pre>{{ res }}</pre>

    <v-form ref="form" @click.prevent="Submittarnsacto">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-for="item in res"
            v-model="item.gl_code"
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ລະຫັດ GL"
            maxlength="20"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດ GL']"
            required
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-for="item in res"
            v-model="item.gl_Desc_la"
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ລະຫັດ GL"
            maxlength="20"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດ GL']"
            required
          >
          </v-text-field> </v-col
      ></v-row>
      <v-col cols="12" class="d-flex justify-center">
        <v-btn
          type="submit"
          color="primary"
          class="d-flex justify-center mr-2"
          text="ບັນທຶກ"
        />
        <v-btn
          color="error"
          class="d-flex justify-center"
          text="ຍົກເລີກ"
          @click="goPath('/glsubbalance')"
        />
      </v-col>
    </v-form>
  </v-col>
</template>
