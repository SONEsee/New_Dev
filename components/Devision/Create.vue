<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UseCategoryStore } from "~/stores/category";
import { CallSwal } from "~/composables/global";
const title = "ເພີ່ມຂໍ້ມູນພະແນກ";
const categoryStore = UseCategoryStore();

const form = ref<any>(null);

const rules = {
  name: [
    (v: string) => !!v || "ກະລຸນາປ້ອນຊື່ປະເພດ",
    (v: string) => v.length >= 2 || "ຊື່ປະເພດຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ",
  ],
};

const onSubmit = async () => {
  if (!categoryStore.form_create_data.div_id) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ປອ້ນຂໍ້ມູນ",
      text: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ",
    });
    return;
  }

  const isValid = await form.value.validate();
  if (isValid) {
    await categoryStore.CreateCategory();
  }
};
</script>

<template>
  <v-section style="height: 100vh" class="d-flex align-center justify-center">
    <v-card class="pa-4">
      <GlobalTextTitleLine :title="title" />
      <v-form
        ref="form"
        @submit.prevent="onSubmit"
        style="width: 90vh"
        class="text-center"
      >
        <v-col cols="12">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.div_id"
                :rules="[(v) => !!v || 'ກະລຸນາປອ້ນ ID!']"
                label="ເພິ່ມ ID"
                variant="outlined"
                required
            /></v-col>
            <v-col cols="12" md="6">
              <v-text-field
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.division_name_la"
                :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ພາສາລາວ!']"
                label="ເພີ່ມຊື່ພາສາລາວ"
                variant="outlined"
                required
            /></v-col>
            <v-col cols="12" md="6">
              <v-text-field
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.division_name_en"
                :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ພາສາອັງກິດ!']"
                label="ຊື່ພາສາອັງກິດ"
                variant="outlined"
                required
            /></v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                :items="[
                  { title: 'ເປິດ', value: 'O' },
                  { title: 'ປິດ', value: 'C' },
                ]"
                item-title="title"
                item-value="value"
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.record_Status"
                :rules="[(v) => !!v || 'ສະຖານະໃຊ້ງານ!']"
                label="ເລືອກສະຖານະໃຊ້ງານ"
                variant="outlined"
                required
            /></v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                :items="[
                  { title: 'Authorized', value: 'A' },
                  { title: 'Unauthorized', value: 'U' },
                ]"
                item-title="title"
                item-value="value"
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.Auth_Status"
                :rules="[(v) => !!v || 'ສະຖານະອະນຸມັດ!']"
                label="ເລືອກສະຖານະອະນຸມັດ"
                variant="outlined"
                required
            /></v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                :items="[
                  { title: 'Yes ', value: 'Y' },
                  { title: 'No', value: 'N' },
                ]"
                item-title="title"
                item-value="value"
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.Once_Auth"
                :rules="[(v) => !!v || 'ສະຖານະເຄີຍຖືກອະນຸມັດ !']"
                label="ເລືອກສະຖານະເຄີຍຖືກອະນຸມັດ "
                variant="outlined"
                required
            /></v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="12" md="6"></v-col>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="12" md="6">
                  <v-btn
                    style="width: 80%"
                    type="submit"
                    color="primary"
                    class="mt-4"
                   
                    text="ບັນທຶກ"
                  />
                   
                 
                </v-col>
                <v-col cols="12" md="6">
                  <v-btn
                    style="width: 80%"
                    @click="goPath('/devision')"
                    color="error"
                    class="mt-4"
                    
                  >
                    ຍົກເລີກ
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-form>
    </v-card></v-section
  >
</template>
