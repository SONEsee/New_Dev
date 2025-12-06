<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMenuStore } from "@/stores/menu";

const title = "ສ້າງຂໍ້ມູນເມນູຍ່ອຍ";

const valid = ref(false);
const form = ref();
const route = useRoute();
const router = useRouter();
const menu_id = route.query.menu_id as string;
const menuStore = useMenuStore();
const errorMessage = ref("");

const response = computed(() => {
  return menuStore.respons_menu_id || [];
});

onMounted(async () => {
  await menuStore.GetMainMenu();
  if (menu_id) {
    await menuStore.getMenuIDCount(menu_id);
  }

  const preSelectedMenuId = route.query.menu_id;

  if (preSelectedMenuId) {
    menuStore.create_form_submenu.menu_id = preSelectedMenuId as string;
  }
});

// Watch for changes in response and auto-populate fields
watch(response, (newResponse) => {
  // ຖ້າມີຂໍ້ມູນ response ແລະ count_menu
  if (newResponse && newResponse.length > 0) {
    const responseData = newResponse[0];
    // Auto-populate sub_menu_id with format: menu_id-count_menu+1 (with zero padding)
    const nextId = responseData.count_menu + 1;
    const paddedId = nextId.toString().padStart(3, '0');
    menuStore.create_form_submenu.sub_menu_id = `${responseData.menu_id}-${paddedId}`;
    // Auto-populate sub_menu_order with count_menu + 1
    menuStore.create_form_submenu.sub_menu_order = nextId;
  } else if (menu_id) {
    
    menuStore.create_form_submenu.sub_menu_id = `${menu_id}-001`;
    menuStore.create_form_submenu.sub_menu_order = 1;
  }
}, { immediate: true });

const menuItems = computed(() => {
  return menuStore.respone_main_menu_data || [];
});

const request = computed({
  get: () => menuStore.create_form_submenu,
  set: (value) => {
    menuStore.create_form_submenu = value;
  },
});

const Districtions = () => {
  valid.value = !valid.value;
};

const submitSubMenu = async () => {
  try {
    const { valid: isValid } = await form.value.validate();

    if (isValid) {
      errorMessage.value = "";
      await menuStore.CreateSubMenu();
      router.push("/submenu");
    }
  } catch (error) {
    errorMessage.value = "ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຮູ້ຈັກ";
    console.error(error);
  }
};

const cancelSubmit = () => {
  router.push("/submenu");
};
</script>


<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    
    
    <v-alert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-form ref="form" @submit.prevent="submitSubMenu">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            @click:append-inner="Districtions"
            density="compact"
            v-model="request.sub_menu_name_la"
            label="ຊື່ເມນູຍ່ອຍພາສາລາວ"
            variant="outlined"
            :rules="[(v) => !!v || 'ຊື່ເມນູຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="request.sub_menu_id"
            label="ID ເມນູຍ່ອຍ"
            variant="outlined"
            :rules="[(v) => !!v || 'ID ເມນູຕ້ອງບໍ່ຫວ່າງ']"
           
            required
          />
             <v-autocomplete
            :items="menuItems"
            item-title="menu_name_la"
            item-value="menu_id"
            density="compact"
            v-model="request.menu_id"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກເມນູຫຼັກ']"
            label="ເລືອກເມນູຫຼັກ"
            variant="outlined"
            required
          >
           <template v-slot:selection="{ item }">
              {{ item.raw.menu_name_la }}-{{ item.raw.menu_id }}
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`ID: ${item.raw.menu_id}`"
                :title="item.raw.menu_name_la"
              />
            </template>
        </v-autocomplete>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            density="compact"
            v-model="request.sub_menu_name_en"
            label="ຊື່ເມນູຍ່ອຍພາສາອັງກິດ"
            variant="outlined"
            :rules="[(v) => !!v || 'ຊື່ເມນູຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="request.sub_menu_order"
            label="ລຳດັບເມນູຍ່ອຍ"
            type="number"
            variant="outlined"
            :rules="[(v) => !!v || 'ລຳດັບເມນູຕ້ອງບໍ່ຫວ່າງ']"
            
            required
          />
       
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            density="compact"
            v-model="request.sub_menu_icon"
            label="ໄອຄອນ"
            variant="outlined"
            :rules="[(v) => !!v || 'ໄອຄອນຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="request.sub_menu_urls"
            label="URL ເມນູຍ່ອຍ"
            variant="outlined"
            :rules="[(v) => !!v || 'URL ຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
        </v-col>
      </v-row>

      <v-col cols="12" class="d-flex justify-center">
        <v-btn type="submit" color="primary" class="mr-2"> ບັນທຶກ </v-btn>
        <v-btn color="error" @click="goBack()"> ຍົກເລີກ </v-btn>
      </v-col>
    </v-form>
  </v-container>
</template>