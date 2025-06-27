<script setup lang="ts">
const title = "ສ້າງປະເພດຊັບສິນ";
const visible = ref(false);
const propStore = propertyStore();
const request = propStore.form_creat_property_category;
const form = ref();
const loading = ref(false);

const handleSubmit = async () => {
  if (form.value) {
    const validation = await form.value.validate();
    if (validation.valid) {
      const notification = await CallSwal({
        icon: "warning",
        title: "ຢືນຢັນ",
        text: "ທ່ານຕ້ອງການສ້າງປະເພດຊັບສິນນີ້ບໍ?",
        showCancelButton: true,
        confirmButtonText: "ຕົກລົງ",
        cancelButtonText: "ຍົກເລີກ",
      });

      if (notification.isConfirmed) {
        loading.value = true;
        try {
          await propStore.CreatePropertyType();
        } catch (error) {
          console.error("Error creating property type:", error);
        } finally {
          loading.value = false;
        }
      }
    } else {
      console.log("Form is invalid, please check the fields.");
    }
  }
};

const rules = {
  required: (value: any) => !!value || "ກະລຸນາໃສ່ຂໍ້ມູນ",
};
</script>

<template>
  <div class="pa-2">
    <v-col cols="12">
      <GlobalTextTitleLine :title="title" />
      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="request.type_code"
              label="ລະຫັດປະເພດຊັບສິນ"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="request.type_name_la"
              label="ຊື່ປະເພດຊັບສິນ (ລາວ)"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="request.type_name_en"
              label="ຊື່ປະເພດຊັບສິນ (ອັງກິດ)"
              variant="outlined"
              density="compact"
              :rules="[rules.required]"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="request.is_tangible"
              label="ປະເພດຊັບສິນ"
              variant="outlined"
              density="compact"
              :items="[
                { title: 'ມີໂຕຕົນ', value: '2' },
                { title: 'ບໍ່ມີໂຕຕົນ', value: '1' }
              ]"
              item-title="title"
              item-value="value"
              :rules="[rules.required]"
              required
            />
          </v-col>
        
        </v-row>
        <div class="d-flex align-center justify-center mt-4">
          <v-btn 
            type="submit" 
            color="primary" 
            :loading="loading"
            :disabled="loading"
          >
            ເພີ່ມ
          </v-btn>
          <v-btn
            color="error"
            @click="goPath(`/property/propertytype`)"
            class="ml-3"
            :disabled="loading"
          >
            ຍົກເລີກ
          </v-btn>
        </div>
      </v-form>
    </v-col>
  </div>
</template>