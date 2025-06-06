<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";

const valid = ref(false);
const form = ref();
const router = useRouter();
const route = useRoute();
const glStore = useGlStore();

const id = route.query.id as string;
const glsub_id = route.query.glsub_id as string;

// ຂໍ້ມູນ GL ແມ່
const parentGlData = computed(() => {
  return glStore.respons_gl_sup && glStore.respons_gl_sup.length > 0
    ? glStore.respons_gl_sup[0]
    : null;
});


const data = computed(() => {
  return glStore.respons_gl_sup_filter;
});


const nextAvailableSubCode = computed(() => {
  const parentCode = parentGlData.value?.gl_code;
  if (!parentCode) return '';
  

  if (data.value && data.value.length > 0) {
    
    const existingCodes = data.value
      .map(item => item.glsub_code)
      .filter(code => code && code.startsWith(parentCode + '.'))
      .map(code => {
        const parts = code.split('.');
        return parts.length > 1 ? parseInt(parts[1]) : 0;
      })
      .filter(num => !isNaN(num));
    
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(...existingCodes);
      const nextNumber = maxNumber + 1;
      return `${parentCode}.${nextNumber.toString().padStart(7, '0')}`;
    }
  }
  
 
  return `${parentCode}.0000001`;
});


const availableSubCodes = computed(() => {
  if (!parentGlData.value) return [];

  const parentCode = parentGlData.value.gl_code;
  const availableCodes = [];

  
  for (let i = 1; i <= 1000; i++) {
    const subCode = `${parentCode}.${i.toString().padStart(7, "0")}`;
    availableCodes.push({
      glsub_code: subCode,
      display: `${subCode}`,
    });
  }

  return availableCodes;
});


const validateSubCode = (value: string) => {
  if (!value) return "ຈຳເປັນຕ້ອງລະບຸ";

  const parentCode = parentGlData.value?.gl_code;
  if (!parentCode) return "ບໍ່ພົບຂໍ້ມູນ GL ແມ່";

  const pattern = new RegExp(`^${parentCode}\\.\\d{7}$`);
  if (!pattern.test(value)) {
    return `ຮູບແບບບໍ່ຖືກຕ້ອງ: ຕ້ອງເປັນ ${parentCode}.0000001 (7 ຫຼັກ)`;
  }

  return true;
};


const rules = {
  required: (value: any) => !!value || "ຈຳເປັນຕ້ອງລະບຸ",
  maxLength250: (value: string) =>
    (value && value.length <= 250) || "ຄວາມຍາວບໍ່ເກີນ 250 ຕົວອັກສອນ",
  subCodeFormat: validateSubCode,
};


onMounted(() => {
  if (id) {
    glStore.glsup_filter_type.request.gl_code = id;
    glStore.glsup_filter_type_new.request.gl_code = glsub_id;
    glStore.getGlSupf();
    glStore.getDataGlfilter();
  }
});


watch(
  parentGlData,
  (newData) => {
    if (newData) {
  
      glStore.create_form_glsup.glcode = newData.gl_code;
    }
  },
  { immediate: true }
);


watch(
  data,
  (newData) => {
    if (newData && newData.length > 0 && newData[0].gl_code) {
      glStore.create_form_glsup.gl_code = newData[0].gl_code;
    } else if (glsub_id) {
      
      glStore.create_form_glsup.gl_code = glsub_id;
    }
  },
  { immediate: true }
);


watch(
  [nextAvailableSubCode, parentGlData],
  () => {
    if (nextAvailableSubCode.value) {
      glStore.create_form_glsup.glsub_code = nextAvailableSubCode.value;
    }
  },
  { immediate: true }
);


const submitTransaction = async () => {
  const { valid: isValid } = await form.value.validate();
  if (isValid) {
    try {
      await glStore.creatGlSup();
      console.log("ບັນທຶກສຳເລັດ");
    } catch (error) {
      console.error("ເກີດຂໍ້ຜິດພາດ:", error);
    }
  }
};


const goBack = () => {
  router.push("/gl/glsub/");
};


const title = computed(() => {
  if (parentGlData.value) {
    return `ສ້າງ GL SubMaster ຂອງ: ${parentGlData.value.gl_code} - ${parentGlData.value.gl_Desc_la}`;
  }
  return "ສ້າງ GL SubMaster";
});
</script>

<template>
  <v-col cols="12">
   
    <global-text-title-line :title="title" />
    
   
    <!-- <pre>{{ data }}</pre> -->
    
   
    <v-card v-if="parentGlData" class="mb-4" variant="outlined">
      <v-card-title class="text-h6 bg-blue-lighten-5">
        ຂໍ້ມູນ GL ແມ່
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-1">ລະຫັດ GL:</div>
            <div class="text-body-1 font-weight-bold">
              {{ parentGlData.gl_code }}
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-1">ຊື່ບັນຊີ (ລາວ):</div>
            <div class="text-body-1">{{ parentGlData.gl_Desc_la }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-1">ຊື່ບັນຊີ (ອັງກິດ):</div>
            <div class="text-body-1">{{ parentGlData.gl_Desc_en }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-1">ປະເພດບັນຊີ:</div>
            <div class="text-body-1">
              {{
                parentGlData.category === "1"
                  ? "ຊັບສິນ"
                  : parentGlData.category === "2"
                  ? "ໜີ້ສິນ"
                  : parentGlData.category === "3"
                  ? "ທືນ"
                  : parentGlData.category === "4"
                  ? "ລາຍຈ່າຍ"
                  : parentGlData.category === "5"
                  ? "ລາຍຮັບ"
                  : "ອື່ນໆ"
              }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

  
    <v-form ref="form" @submit.prevent="submitTransaction">
      <v-card variant="outlined">
        <v-card-title class="text-h6 bg-green-lighten-5">
          ສ້າງ GL SubMaster ໃໝ່
        </v-card-title>
        <v-card-text>
          <v-row>
          
            <v-col cols="12" md="6">
              <v-text-field
                v-model="glStore.create_form_glsup.glcode"
                density="compact"
                variant="outlined"
                label="ລະຫັດ GL ແມ່"
                readonly
                prepend-inner-icon="mdi-lock"
              />
            </v-col>

          
            <v-col cols="12" md="6">
              <v-text-field
                v-model="glStore.create_form_glsup.glsub_code"
                :rules="[validateSubCode]"
                density="compact"
                label="ລະຫັດ GL SubMaster (ອັດຕະໂນມັດ)"
                variant="outlined"
                required
                readonly
                persistent-hint
                :hint="`ລະຫັດຖັດໄປ: ${nextAvailableSubCode}`"
                prepend-inner-icon="mdi-auto-fix"
              />
              <!-- <v-alert
                type="success"
                variant="tonal"
                density="compact"
                class="mt-2"
                icon="mdi-check-circle"
              >
                ລະຫັດຖັດໄປທີ່ແນະນຳ: {{ nextAvailableSubCode }}
              </v-alert> -->
            </v-col>

           
            <v-col cols="12" md="6">
              <v-text-field
                v-model="glStore.create_form_glsup.glsub_Desc_la"
                :rules="[rules.required, rules.maxLength250]"
                density="compact"
                variant="outlined"
                label="ຊື່ບັນຊີຍ່ອຍ (ພາສາລາວ)"
                maxlength="250"
                required
                counter="250"
              />
            </v-col>

            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="glStore.create_form_glsup.glsub_Desc_en"
                :rules="[rules.maxLength250]"
                density="compact"
                variant="outlined"
                label="ຊື່ບັນຊີຍ່ອຍ (ພາສາອັງກິດ)"
                maxlength="250"
                counter="250"
              />
            </v-col>

            
            <v-col cols="12" md="6" v-show="false">
              <v-text-field
                v-model="glStore.create_form_glsup.gl_code"
                density="compact"
                variant="outlined"
                label="gl_master_id (ລະຫັດ GL ແມ່)"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

     
      <v-row class="mt-4">
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            type="submit"
            color="primary"
            class="mr-2"
            prepend-icon="mdi-content-save"
            :loading="glStore.isloading"
          >
            ບັນທຶກ
          </v-btn>
          <v-btn color="error" prepend-icon="mdi-cancel" @click="goBack">
            ຍົກເລີກ
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- ຂໍ້ມູນ Debug (ລຶບອອກໃນ production) -->
    <!-- <v-card v-if="parentGlData" class="mt-4" variant="outlined">
      <v-card-title class="text-subtitle-1">Debug Info</v-card-title>
      <v-card-text>
        <pre>{{
          {
            parentGlData,
            formData: glStore.create_form_glsup,
            nextAvailableSubCode,
            dataLength: data?.length || 0,
            availableSubCodes: availableSubCodes.slice(0, 3),
          }
        }}</pre>
      </v-card-text>
    </v-card> -->
  </v-col>
</template>