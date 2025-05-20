<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

import { useMenuStore } from "@/stores/menu"; // adjust path as needed

const title = "ສ້າງຂໍ້ມູນເມນູຫຼັກ";

const valid = ref(false);
const form = ref();

const moduleStore = ModulesStore();
const menuStore = useMenuStore();

onMounted(() => {
  moduleStore.getModule();
});

const module = computed(() => {
  return moduleStore.response_data_module || [];
});

const request = computed(() => {
  return menuStore.create_form_mainmenu;
});

const Districtions = () => {
  valid.value = !valid.value;
};

const submitMainmenu = async () => {
  try {
    const { valid: isValid } = await form.value.validate();
    if (isValid) {
      await menuStore.CreateMainMenu();
      
    }
  } catch (error) {
    console.error("Menu creation failed:", error);
  }
};
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-col cols="12">
      <v-form ref="form" @submit.prevent="submitMainmenu">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              @click:append-inner="Districtions"
              density="compact"
              v-model="request.menu_name_la"
              label="ຊື່ເມນູພາສາລາວ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ເມນູພາສາລາວ']"
              required
            />
            <v-text-field
              density="compact"
              v-model="request.menu_id"
              label="ID ເມນູ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນ ID ເມນູ']"
              required
            />
            <v-autocomplete
              :items="module"
              item-title="module_name_la"
              item-value="module_Id"
              density="compact"
              v-model="request.module_Id"
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກເມນູສາຂາ']"
              label="ເລືອກເມນູສາຂາ"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              density="compact"
              v-model="request.menu_name_en"
              label="ຊື່ເມນູພາສາອັງກິດ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ເມນູພາສາອັງກິດ']"
              required
            />
            <v-text-field
              density="compact"
              v-model="request.menu_order"
              label="ລຳດັບເມນູ"
              type="number"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລຳດັບເມນູ']"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              density="compact"
              v-model="request.menu_icon"
              label="ໄອຄອນ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນໄອຄອນ']"
              required
            />
            <v-autocomplete
              :items="[
                { title: 'ເປິດ', value: 'Y' },
                { title: 'ປິດ', value: 'N' },
              ]"
              item-title="title"
              item-value="value"
              density="compact"
              v-model="request.is_active"
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະໃຊ້ງານ']"
              label="ເລືອກສະຖານະໃຊ້ງານ"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" class="d-flex justify-center">
            <v-btn type="submit" color="primary" class="mr-2"> ບັນທຶກ </v-btn>
            <v-btn color="error" @click="$router.push('/menu')">
              ຍົກເລີກ
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
  </v-container>
</template>
