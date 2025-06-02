<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";

const valid = ref(false);
const form = ref();
const router = useRouter();
const glStore = useGlStore();
const route = useRoute();

const gl_code = String(route.query.gl_code) || "";
const glType = String(route.query.glType) || "";
const useglStore = useGlStore();

const request = reactive({
  gl_code: "",
  gl_Desc_la: "",
  gl_Desc_en: "",
  glType: "",
  category: "",
  retal: "",
  ccy_Res: "",
  Res_ccy: "",
  Allow_BackPeriodEntry: "",
  pl_Split_ReqD: "",
});

const res = computed(() => {
  return useglStore.respons_detail_gl || [];
});

// const req = computed(() => {
//   const existingData = useglStore.respons_fiter_gl || [];

//   if (existingData.length === 0) return [];

//   const firstCode = existingData[0].gl_code;
//   const prefix = firstCode.slice(0, -1);

//   const allPossible = [];
//   for (let i = 0; i <= 9; i++) {
//     allPossible.push(prefix + i);
//   }

//   const existingCodes = existingData.map((item) => item.gl_code);
//   const availableCodes = allPossible.filter(
//     (code) => !existingCodes.includes(code)
//   );

//   return availableCodes.map((code) => ({
//     gl_code: code,
//   }));
// });
const req = computed(() => {
  const existingData = useglStore.respons_fiter_gl || [];
  
  
  if (existingData.length === 0) {
    const parentCode = currentData.value?.gl_code;
    if (!parentCode) return [];
    
   
    const allPossible = [];
    for (let i = 0; i <= 9; i++) {
      allPossible.push(parentCode + i);
    }
    
    return allPossible.map((code) => ({
      gl_code: code,
    }));
  }


  const firstCode = existingData[0].gl_code;
  const prefix = firstCode.slice(0, -1);

  const allPossible = [];
  for (let i = 0; i <= 9; i++) {
    allPossible.push(prefix + i);
  }

  const existingCodes = existingData.map((item) => item.gl_code);
  const availableCodes = allPossible.filter(
    (code) => !existingCodes.includes(code)
  );

  return availableCodes.map((code) => ({
    gl_code: code,
  }));
});
const currentData = computed(() => {
  return res.value.length > 0 ? res.value[0] : null;
});

onMounted(() => {
  if (gl_code) {
    useglStore.glfilter_gl_code.request.gl_code = gl_code;
    useglStore.glfilter_gl_code.request.glType = String(parseInt(glType) + 1);
    useglStore.getGlMasterDetail2();
    useglStore.getGlMasterDetail(gl_code);
  }
});


watch([req, currentData], ([newReq, newCurrentData]) => {
  console.log('=== COMBINED WATCH ===');
  console.log('Available codes:', newReq);
  console.log('Current data:', newCurrentData);
  
 
  if (newCurrentData) {
    request.gl_Desc_la = newCurrentData.gl_Desc_la || "";
    request.gl_Desc_en = newCurrentData.gl_Desc_en || "";

    const currentGlType = parseInt(newCurrentData.glType) || 0;
    const nextGlType = Math.min(currentGlType + 1, 7);
    request.glType = nextGlType.toString();

    request.category = newCurrentData.category || "";
    request.retal = newCurrentData.retal || "";
    request.ccy_Res = newCurrentData.ccy_Res || "";
    request.Res_ccy = newCurrentData.Res_ccy || "";
    request.Allow_BackPeriodEntry = newCurrentData.Allow_BackPeriodEntry || "";
    request.pl_Split_ReqD = newCurrentData.pl_Split_ReqD || "";
  }
  
 
  if (newReq && newReq.length > 0) {
    console.log('Setting gl_code to:', newReq[0].gl_code);
    request.gl_code = newReq[0].gl_code;
  }
}, { immediate: true });

const glCodeConfig = computed(() => {
  const existingGlCode = currentData.value?.gl_code || "";
  const currentLength = existingGlCode.length;

  const maxLength = currentLength > 0 ? currentLength + 1 : 3;
  const label = `ລະຫັດ GL (ສູງສຸດ ${maxLength} ຕົວເລກ)`;

  return {
    maxLength,
    label,
  };
});

const rules = {
  required: (value: any) => !!value || "ຈຳເປັນຕ້ອງລະບຸ",
  glCodeLength: (value: string) => {
    const maxLen = glCodeConfig.value.maxLength;
    return (
      (value && value.length <= maxLen) ||
      `ລະຫັດ GL ຕ້ອງບໍ່ເກີນ ${maxLen} ຕົວເລກ`
    );
  },
  maxLength250: (value: string) =>
    (value && value.length <= 250) || "ຄວາມຍາວບໍ່ເກີນ 250 ຕົວອັກສອນ",
};

const submitTransaction = async () => {
  const { valid: isValid } = await form.value.validate();
  if (isValid) {
    try {
      Object.assign(glStore.create_form_gl, request);

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

const title = computed(() => {
  if (gl_code && currentData.value) {
    return `ສ້າງບັນຊີລູກຂອງ GL: ${currentData.value.gl_code} - ${currentData.value.gl_Desc_la}`;
  }
  return "ເພີ່ມຂໍ້ມູນບັນຊີ GL Master";
});
</script>

<template>
  <v-col cols="12">
    <global-text-title-line :title="title" />
    <v-form ref="form" @submit.prevent="submitTransaction">
      <v-row>
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="request.gl_code"
            :rules="[rules.required]"
            :items="req"
            item-title="gl_code"
            item-value="gl_code"
            density="compact"
            label="ເລືອກລະຫັດ GL ສໍາລັບເພີ່ມ"
            variant="outlined"
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
          readonly
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
          readonly
            v-model="request.category"
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