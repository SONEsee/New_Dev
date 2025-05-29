<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useRoute } from "vue-router";

const valid = ref(false);
const form = ref();
const router = useRouter();
const glStore = useGlStore();
const request = glStore.create_form_gl;
const route = useRoute();
// const id = route.query.id as number || 0;
const gl_code = Number(route.query.gl_code) || 0;
const useglStore = useGlStore();
const res =  computed(()=>{
  return useglStore.respons_detail_gl || [];
})
onMounted(()=>{
  useglStore.getGlMasterDetail(gl_code)
})



const rules = {
  required: (value: any) => !!value || "ຈຳເປັນຕ້ອງລະບຸ",
  glCodeLength: (value: string) =>
    (value && value.length <= 3) || "ລະຫັດ GL ຕ້ອງບໍ່ເກີນ 3 ຕົວເລກ",
  maxLength250: (value: string) =>
    (value && value.length <= 250) || "ຄວາມຍາວບໍ່ເກີນ 250 ຕົວອັກສອນ",
};

const toggleDescription = () => {
  valid.value = !valid.value;
};

const submitTransaction = async () => {
  const { valid: isValid } = await form.value.validate();
  if (isValid) {
    try {
      await glStore.createGl();

      console.log("ບັນທຶກສຳເລັດ");
    } catch (error) {
      console.error("ເກີດຂໍ້ຜິດພາດ:", error);
    }
  }
};

const goPath = (path: string) => {
  router.push(path);
};
const title="ເພີ່ມຂໍ້ມູນບັນຊີ GL Master";
</script>

<template>
  <v-col cols="12">
  
    <global-text-title-line :title="title" />
    <v-form ref="form" @submit.prevent="submitTransaction">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="request.gl_code"
            :rules="[rules.required, rules.glCodeLength]"
            density="compact"
            variant="outlined"
            label="ລະຫັດ GL (ສູງສຸດ 3 ຕົວເລກ)"
            type="text"
            maxlength="3"
            required
          />
          <v-text-field
            v-model="request.gl_Desc_la"
            :rules="[rules.required, rules.maxLength250]"
            density="compact"
            variant="outlined"
            label="ຊື່ເລກບັນຊີ(ພາສາລາວ)"
            maxlength="250"
            required
          />
          <v-autocomplete
            v-model="request.glType"
            :rules="[rules.required]"
            :items="[
              { title: 'ຂັ້ນທີ 1', value: '1' },
              { title: 'ຂັ້ນທີ 2', value: '2' },
              { title: 'ຂັ້ນທີ 3', value: '3' },
              { title: 'ຂັ້ນທີ 4', value: '4' },
              { title: 'ຂັ້ນທີ 5', value: '5' },
              { title: 'ຂັ້ນທີ 6', value: '6' },
              { title: 'ຂັ້ນທີ 7', value: '7' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            label="ເລືອກຂັ້ນບັນຊີ (1-7)"
            variant="outlined"
            required
          />
          <v-autocomplete
            v-model="request.pl_Split_ReqD"
            :rules="[rules.required]"
            :items="[
              { title: 'Y = Yes (ຕ້ອງການແບ່ງ P&L)', value: 'Y' },
              { title: 'N = No (ບໍ່ຕ້ອງການແບ່ງ P&L)', value: 'N' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            label="ກຳນົດການຕີມູນຄ່າແບບ2ຮູບແບບ, ພາຍໃນມື້ ແລະ ທ້າຍມື້"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="request.gategory"
            :rules="[rules.required]"
            :items="[
              { title: '1 = ຊັບສິນ', value: '1' },
              { title: '2 = ໜີ້ສິນ', value: '2' },
              { title: '3 = ທືນ', value: '3' },
              { title: '4 = ລາຍຈ່າຍ', value: '4' },
              { title: '5 = ລາຍຮັບ', value: '5' },
              { title: '6 = ນອກຝັງ', value: '6' },
              { title: '7 = ບັນຊີເງົາ', value: '7' },
              { title: '8 = ບັນຊີນອກພັງ', value: '8' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            label="ເລືອກປະເພດບັນຊີ"
            variant="outlined"
            required
          />
          <v-text-field
            v-model="request.gl_Desc_en"
            :rules="[rules.maxLength250]"
            density="compact"
            variant="outlined"
            label="ຊື່ເລກບັນຊີ(ພາສາອັງກິດ)"
            maxlength="250"
          />
      
          <v-autocomplete
            v-model="request.retal"
            :rules="[rules.required]"
            :items="[
              { title: 'Y = Yes (ມີການຕີມູນຄ່າ)', value: 'Y' },
              { title: 'N = No (ບໍ່ມີການຕີມູນຄ່າ)', value: 'N' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            label="ການຕີມູນຄ່າທາງດ້ານບັນຊີ"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="request.ccy_Res"
            :rules="[rules.required]"
            :items="[
              { title: 'S = Single Currency (ສະກຸນດຽວ)', value: 'S' },
              {
                title: 'F = All Foreign Currencies (ສະກຸນຕ່າງປະເທດທັງໝົດ)',
                value: 'F',
              },
              { title: 'A = All Currencies (ທຸກສະກຸນ)', value: 'A' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            label="ສາມາດໃຊ້ສະກຸນເງິນ"
            variant="outlined"
            required
          />
          <v-text-field
            v-model="request.Res_ccy"
            density="compact"
            variant="outlined"
            label="ລະຫັດສະກຸນເງິນ (ສໍາລັບ Single Currency)"
            maxlength="20"
            placeholder="ເຊັ່ນ: LAK, USD, THB"
          />
          <v-autocomplete
            v-model="request.Allow_BackPeriodEntry"
            :rules="[rules.required]"
            :items="[
              { title: 'Y = Yes (ສາມາດລົງຍ້ອນຫຼັງໄດ້)', value: 'Y' },
              { title: 'N = No (ບໍ່ສາມາດລົງຍ້ອນຫຼັງ)', value: 'N' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            label="ເລືອກໃຫ້ສາມາດລົງຍ້ອນຫຼັງໄດ້ສໍາລັບບັນຊີນີ້"
            variant="outlined"
            required
          />
        </v-col>
      </v-row>

      <v-col cols="12" class="d-flex justify-center">
        <v-btn
          type="submit"
          color="primary"
          class="d-flex justify-center mr-2"
          text="ບັນທຶກ"
          :loading="glStore.isloading"
        />
        <v-btn
          color="error"
          class="d-flex justify-center"
          text="ຍົກເລີກ"
          @click="goPath('/glmaster')"
        />
      </v-col>
    </v-form>
  </v-col>
</template>
