<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useMenuStore } from "@/stores/menu";

const title = "ສ້າງຂໍ້ມູນເມນູຫຼັກ";

const valid = ref(false);
const form = ref();
const route = useRoute();
const module_id = route.query.module_id as string;
const moduleStore = ModulesStore();
const menuStore = useMenuStore();

const res = computed(() => {
  return moduleStore.respons_module_id || [];
});

onMounted(async () => {
  await moduleStore.getModule();
  await moduleStore.getModuleid(module_id);

  const preSelectedModuleId = route.query.module_id;

  if (preSelectedModuleId) {
    menuStore.create_form_mainmenu.module_Id = preSelectedModuleId as string;
  }
});

watch(res, (newRes) => {
  
  if (newRes && newRes.length > 0) {
    const resData = newRes[0];
    const nextId = resData.c_main + 1;
    const paddedId = nextId.toString().padStart(3, '0');
    menuStore.create_form_mainmenu.menu_id = `${resData.module_Id}-${paddedId}`;
    menuStore.create_form_mainmenu.menu_order = nextId;
  } else if (module_id) {
    // ຖ້າບໍ່ມີ response ແຕ່ມີ module_id ຈາກ URL parameter
    // ໃຊ້ຄ່າເລີ່ມຕົ້ນ 001
    menuStore.create_form_mainmenu.menu_id = `${module_id}-001`;
   menuStore.create_form_mainmenu.menu_order = menuStore.create_form_mainmenu.menu_order ?? 1;
  }
}, { immediate: true });

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

const defaultMenuId = computed(() => {
  return res.value && res.value.length > 0 ? res.value[0].module_Id : '';
});
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
              label="ID ເມນູ (ຕົວຢາງ: ລະຫັດໂມດູນ_ລຳດັບ)"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນ ID ເມນູ']"
              
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
              label="ລຳດັບເມນູ "
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
              label="ໄອຄອນ (ຕົວຢ່າງ: mdi-home)"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນໄອຄອນ(ຕົວຢ່າງ: mdi-home)']"
              required
            />
            <v-autocomplete
              :items="module"
              item-title="module_name_la"
              item-value="module_Id"
              density="compact"
              v-model="request.module_Id"
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກໂມດູນ']"
              label="ເລືອກໂມດູນ"
              variant="outlined"
              required
            >
           <template v-slot:selection="{ item }">
            {{ item.raw.module_name_la }}-{{ item.raw.module_Id }}
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :subtitle="`ID: ${item.raw.module_Id}`"
              :title="item.raw.module_name_la"
            />
          </template></v-autocomplete>
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