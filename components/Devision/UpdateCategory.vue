<script setup lang="ts">
import { validate } from "numeral";
import { computed, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const store = DevisionStore();
const route = useRoute();
const router = useRouter();
const id = route.query.id as string;


onMounted(() => {
  if (id) {
    store.GetDataDetail(id);
  } else {
   
    router.push('/devisions');
  }
});


const response_data = computed(() => {
  return store.respons_detail_query_data;
});


watch(response_data, (newVal) => {
  if (newVal) {
    store.form_update_data.div_id = newVal.div_id || '';
    store.form_update_data.division_name_la = newVal.division_name_la || '';
    store.form_update_data.division_name_en = newVal.division_name_en || '';
    store.form_update_data.record_Status = newVal.record_Status || '';
    store.form_update_data.Maker_Id = newVal.Maker_Id || '';
    store.form_update_data.Checker_Id = newVal.Checker_Id || '';
    store.form_update_data.Auth_Status = newVal.Auth_Status || '';
    store.form_update_data.Once_Auth = newVal.Once_Auth || '';
  }
}, { immediate: true });

const form = ref<any>(null);
const valid = ref(false);
const loading = computed(() => store.isloading);

const onSubmit = async () => {
  try {
    
    if (!form.value) {
      console.error("Form reference is null");
      return;
    }
    
    const isValid = await form.value.validate();
    if (isValid.valid) {
      console.log("Form is valid, submitting data...");
      
      if (response_data.value) {
        store.form_update_data.div_id = response_data.value.div_id;
        store.form_update_data.division_name_la = response_data.value.division_name_la;
        store.form_update_data.division_name_en = response_data.value.division_name_en;
        store.form_update_data.record_Status = response_data.value.record_Status;
        store.form_update_data.Maker_Id = response_data.value.Maker_Id;
        store.form_update_data.Checker_Id = response_data.value.Checker_Id;
        store.form_update_data.Auth_Status = response_data.value.Auth_Status;
        store.form_update_data.Once_Auth = response_data.value.Once_Auth;
      }
      
      
      await store.UpdateDevision(id);
    }
  } catch (error) {
    console.error("Error during submission:", error);
  }
};

const onCancel = () => {
  
  router.push('/devisions');
};

const title = ref("ອັບເດດຂໍ້ມູນພະແນກ / Update Division");
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-form ref="form" @submit.prevent="onSubmit">
      <v-col cols="12">
        <v-row>
          <v-col cols="12" md="6">
            <template v-if="response_data">
              <v-text-field
                :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນລະຫັດພະແນກ']"
                v-model="response_data.div_id"
                label="ລະຫັດພະແນກ / Division ID"
                density="compact"
                variant="outlined"
                hide-details="auto"
                readonly
                class="pb-6"
              ></v-text-field>
            </template>
          </v-col>
          <v-col cols="12" md="6">
            <template v-if="response_data">
              <v-text-field
                :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນຊື່ພະແນກພາສາລາວ']"
                v-model="response_data.division_name_la"
                label="ຊື່ພະແນກພາສາລາວ / Division Name (Lao)"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>
            </template>
          </v-col>
          <v-col cols="12" md="6">
            <template v-if="response_data">
              <v-text-field
                :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນຊື່ພະແນກພາສາອັງກິດ']"
                v-model="response_data.division_name_en"
                label="ຊື່ພະແນກພາສາອັງກິດ / Division Name (English)"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
              ></v-text-field>
            </template>
          </v-col>
          <v-col cols="12" md="6">
            <template v-if="response_data">
              <v-text-field
                v-model="response_data.Maker_Id"
                label="ລະຫັດຜູ້ບັນທຶກ / Maker ID"
                density="compact"
                variant="outlined"
                hide-details="auto"
                class="pb-6"
                readonly
              ></v-text-field>
            </template>
          </v-col>
          <v-col cols="12" md="6">
            <template v-if="response_data">
              <v-autocomplete
                v-model="response_data.Once_Auth"
                label="ສະຖານະອະນຸມັດ / Once Auth"
                :items="[
                  { title: 'ອະນຸມັດ (A)', value: 'A' },
                  { title: 'ກຳລັງດຳເນີນການ (P)', value: 'P' },
                  { title: 'ບໍ່ອະນຸມັດ (N)', value: 'N' },
                  { title: 'ອະນຸມັດ (Y)', value: 'Y' }
                ]"
                variant="outlined"
                density="compact"
                item-title="title"
                item-value="value"
                :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະການອະນຸມັດ']"
              ></v-autocomplete>
            </template>
          </v-col>
          <v-col cols="12" md="6">
            <template v-if="response_data">
              <v-autocomplete
                v-model="response_data.record_Status"
                label="ສະຖານະ / Status"
                :items="[
                  { title: 'ເປີດໃຊ້ງານ (A)', value: 'A' },
                  { title: 'ປິດໃຊ້ງານ (C)', value: 'C' },
                  { title: 'ເປີດໃຊ້ງານ (O)', value: 'O' }
                ]"
                variant="outlined"
                density="compact"
                item-title="title"
                item-value="value"
                :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະການໃຊ້ງານ']"
              ></v-autocomplete>
            </template>
          </v-col>
        </v-row>
      </v-col>
      <div class="d-flex justify-center align-center">
        <v-btn type="submit" color="primary" text="ບັນທຶກ"/>
        <v-btn type="button" color="error" text="ຍົກເລີກ" class="ml-6" @click="onCancel" />
      </div>
    </v-form>
  </v-container>
</template>