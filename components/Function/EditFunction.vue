<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "#build/dayjs.imports.mjs";
const form = ref();
const valid = ref(false);
const title = "ອັບເດດຟັງຊັ້ນ";
const route = useRoute();

const menuStore = useMenuStore();

const id = computed(() => route.query.id as string);

const res = computed(() => {
  return menuStore.respons_function_menu_detail_data || null;
});
const ret = computed(() => {
  const data = menuStore.response_sub_menu_data || null;

  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});
onMounted(() => {
  menuStore.GetMenuSubMenu();
});
const Dristricption = () => {
  valid.value = !valid.value;
};
const submitFunction = async () => {
  try {
    const { valid } = await form.value.validate();
    if (valid) {
      await menuStore.UpdateFunctionMenu(id.value);
    }
  } catch (error) {
    console.error("Menu creation failed:", error);
  }
};
onMounted(() => {
  if (id.value) {
    menuStore.getDetailFunctionMenu(id.value).then(() => {
      const detail = menuStore.respons_function_menu_detail_data;
      if (detail) {
        menuStore.update_form_function = {
          ...detail,
          function_order: Number(detail.function_order) || 0,
            created_by: detail.created_by || "",
            is_active: detail.is_active || "",
            function_id: detail.function_id || "",
            description_la: detail.description_la || "",
            description_en: detail.description_en || "",
            sub_menu_id: detail.sub_menu_id || "",
            eod_function: detail.eod_function || null,
            

        }
      }
    });
  }
});
</script>
<template>
  <GlobalTextTitleLine :title="title" />
  <v-col cols="12">
    <v-form ref="form" @submit.prevent="submitFunction">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            @click:append-inner="Dristricption"
            density="compact"
            v-model="menuStore.update_form_function.description_la"
            label="ຊື່ຟັງຊັ້ນພາສາລາວ"
            variant="outlined"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນພາສາລາວ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="menuStore.update_form_function.function_id"
            label="ID ເມນູ"
            variant="outlined"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນ ID ເມນູ']"
            required
          />
          <v-autocomplete
            :items="ret"
            item-title="sub_menu_name_la"
            item-value="sub_menu_id"
            density="compact"
            v-model="menuStore.update_form_function.sub_menu_id"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກເມນູຍອ່ຍ']"
            label="ເລືອກເມນູຍອ່ຍ"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            density="compact"
            v-model="menuStore.update_form_function.description_en"
            label="ຊື່ຟັງຊັ້ນພາສາອັງກິດ"
            variant="outlined"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນພາສາອັງກິດ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="menuStore.update_form_function.function_order"
            label="ລຳດັບ"
            type="number"
            variant="outlined"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລຳດັບ']"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            density="compact"
            v-model="menuStore.update_form_function.eod_function"
            label="ສ້າງໂດຍ"
            variant="outlined"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນສ້າງໂດຍ']"
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
            v-model="menuStore.update_form_function.is_active"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະໃຊ້ງານ']"
            label="ເລືອກສະຖານະໃຊ້ງານ"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" class="d-flex justify-center">
          <v-btn type="submit" color="primary" class="mr-2"> ບັນທຶກ </v-btn>
          <v-btn color="error" @click="$router.push('/menu')"> ຍົກເລີກ </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-col>
</template>
