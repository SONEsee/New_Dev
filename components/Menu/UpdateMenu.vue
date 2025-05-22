<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMenuStore } from "@/stores/menu";

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();
const moduleStore = ModulesStore();

const form = ref();
const valid = ref(false);

const title = "ອັບເດດຂໍ້ມູນເມນູຫຼັກ";

const id = computed(() => {
  const queryId = route.query.id;
  return Array.isArray(queryId) ? queryId[0] : queryId || "";
});

const modules = computed(() => {
  return moduleStore.response_data_module || [];
});

const toggleField = () => {
  valid.value = !valid.value;
};

onMounted(async () => {
  // Fetch modules for module selection
  await moduleStore.getModule()

  // Fetch menu details if ID exists
  if (id.value) {
    try {
      await menuStore.DetailMainMenu(id.value)
      
      // Carefully populate ALL fields
      if (menuStore.response_main_detail_data) {
        const details = menuStore.response_main_detail_data
        menuStore.update_form_mainmenu = {
          menu_id: details.menu_id || "", // Ensure this matches what backend expects
          menu_name_la: details.menu_name_la || "",
          menu_name_en: details.menu_name_en || "",
          menu_icon: details.menu_icon || "",
          menu_order: details.menu_order || "",
          is_active: details.is_active || "",
          module_Id: details.module_Id || "",
        }
      }
    } catch (error) {
      console.error('Failed to fetch menu details:', error)
    }
  }
})

const updateSubmit = async () => {
  try {
    const { valid: isValid } = await form.value.validate();

    if (isValid && id.value) {
      await menuStore.UpdateMainMenu(id.value);

      router.push("/menu");
    }
  } catch (error) {
    console.error("Menu update failed:", error);
  }
};

const cancelUpdate = () => {
  router.push("/menu");
};
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-col cols="12">
      <v-form ref="form" @submit.prevent="updateSubmit">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              @click:append-inner="toggleField"
              density="compact"
              v-model="menuStore.update_form_mainmenu.menu_name_la"
              label="ຊື່ເມນູພາສາລາວ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ເມນູພາສາລາວ']"
              required
            />
            <v-text-field
              density="compact"
              v-model="menuStore.update_form_mainmenu.menu_id"
              label="ID ເມນູ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນ ID ເມນູ']"
              required
            />
            <v-autocomplete
              :items="modules"
              item-title="module_name_la"
              item-value="module_Id"
              density="compact"
              v-model="menuStore.update_form_mainmenu.module_Id"
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກເມນູສາຂາ']"
              label="ເລືອກເມນູສາຂາ"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              density="compact"
              v-model="menuStore.update_form_mainmenu.menu_name_en"
              label="ຊື່ເມນູພາສາອັງກິດ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ເມນູພາສາອັງກິດ']"
              required
            />
            <v-text-field
              density="compact"
              v-model="menuStore.update_form_mainmenu.menu_order"
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
              v-model="menuStore.update_form_mainmenu.menu_icon"
              label="ໄອຄອນ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນໄອຄອນ']"
              required
            />
            <v-autocomplete
              :items="[
                { title: 'ເປີດໃຊ້ງານ', value: 'Y' },
                { title: 'ປິດໃຊ້ງານ', value: 'N' },
              ]"
              item-title="title"
              item-value="value"
              density="compact"
              v-model="menuStore.update_form_mainmenu.is_active"
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະໃຊ້ງານ']"
              label="ເລືອກສະຖານະໃຊ້ງານ"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" class="d-flex justify-center">
            <v-btn type="submit" color="primary" class="mr-2"> ບັນທຶກ </v-btn>
            <v-btn color="error" @click="cancelUpdate"> ຍົກເລີກ </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
  </v-container>
</template>
