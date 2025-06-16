<script setup lang="ts">
const title = "ສ້າງປະເພດຊັບສິນ";
const visible = ref(false);
const propStore = propertyStore();
const request = propStore.form_creat_property_category;
const form = ref();
const handleSubmit = () => {
  if (form.value) {
    form.value.validate().then((valid: any) => {
      if (valid) {
        CallSwal({
          icon: "warning",
          title: "ຕໍ່ api ກອ່ນ",
          text: "ຍັງໃຊ້ບໍ່ໄດ້",
            showConfirmButton: false,
        });
        console.log("Form is valid, submitting...",request);
      } else {
        console.log("Form is invalid, please check the fields.");
      }
    });
  }
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
              label="ລະຫັດຊັບສິນ"
              variant="outlined"
              density="compact"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
            v-model="request.type_name"
              label="ຊື່ຊັບສິນ"
              variant="outlined"
              density="compact"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
            v-model="request.description"
              label="ລາຍລະອຽດ"
              variant="outlined"
              density="compact"
              required
            />
          </v-col>
        </v-row>
        <div class="d-flex align-center justify-center">
          <v-btn type="submit" color="primary">ເພີ່ມ</v-btn>
          <v-btn
            type="submit"
            color="error"
            @click="goPath(`/property/propertytype`)"
            class="ml-3"
            >ຍົກເລິກ</v-btn
          >
        </div>
      </v-form>
    </v-col>
  </div>
</template>
