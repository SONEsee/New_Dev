<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// ສ້າງ Store ແລະ Route
const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();

// ຮັບ ID ຈາກ Route
const id = computed(() => route.query.id as string);

// ໂຕແປອ້າງອີງຟອມ
const valid = ref(false);
const form = ref();
const title = "ແກ້ໄຂຂໍ້ມູນເມນູຍ່ອຍ";
const errorMessage = ref('');

// ຂໍ້ມູນເມນູຫຼັກ
const menuItems = computed(() => {
  return menuStore.respone_main_menu_data || [];
});

// ຈັດການຟອມ
const request = computed({
  get: () => menuStore.create_form_submenu,
  set: (value) => {
    menuStore.create_form_submenu = value;
  }
});

// ໂຫຼດຂໍ້ມູນເບື້ອງຕົ້ນ
onMounted(async () => {
  // ດຶງຂໍ້ມູນເມນູຫຼັກ
  await menuStore.GetMainMenu();
  
  
  if (id.value) {
    await menuStore.getDetailSubMenu(id.value);
    
   
    if (menuStore.respone_sub_menu_detail_data) {
      const detail = menuStore.respone_sub_menu_detail_data;
      menuStore.create_form_submenu = {
        sub_menu_id: detail.sub_menu_id || '',
        sub_menu_name_la: detail.sub_menu_name_la || '',
        sub_menu_name_en: detail.sub_menu_name_en || '',
        sub_menu_order: detail.sub_menu_order || '',
        sub_menu_icon: detail.sub_menu_icon || '',
        is_active: detail.is_active ? 'true' : 'false',
        menu_id: detail.menu_id || '',
        sub_menu_urls: detail.sub_menu_urls || '',
        
      };
    }
  }
});

// ຟັງຊັ່ນອັບເດດເມນູຍ່ອຍ
const updateSubMenu = async () => {
  try {
    const { valid: isValid } = await form.value.validate();
    
    if (isValid && id.value) {
      errorMessage.value = '';
      
     
      const dataToUpdate = {
        sub_menu_id: request.value.sub_menu_id,
        sub_menu_name_la: request.value.sub_menu_name_la,
        sub_menu_name_en: request.value.sub_menu_name_en,
        sub_menu_order: request.value.sub_menu_order,
        sub_menu_icon: request.value.sub_menu_icon,
        is_active: request.value.is_active === 'true',
        menu_id: request.value.menu_id,
        sub_menu_urls: request.value.sub_menu_urls
      };

      // ເອີ້ນໃຊ້ຟັງຊັ່ນອັບເດດຈາກ Store
      const result = await menuStore.UpdateSubMenu(id.value, dataToUpdate);
      
      if (result) {
        // ນຳທາງໄປຫາລາຍການເມນູຍ່ອຍ
        router.push('/submenu');
      }
    }
  } catch (error) {
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ';
    console.error(error);
  }
};

// ຟັງຊັ່ນຍົກເລີກ
const cancelUpdate = () => {
  router.push('/submenu');
};
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />

    
    <v-alert 
      v-if="errorMessage" 
      type="error" 
      class="mb-4"
    >
      {{ errorMessage }}
    </v-alert>

    <v-form ref="form" @submit.prevent="updateSubMenu">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            density="compact"
            v-model="request.sub_menu_name_la"
            label="ຊື່ເມນູຍ່ອຍພາສາລາວ"
            variant="outlined"
            :rules="[v => !!v || 'ຊື່ເມນູຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="request.sub_menu_id"
            label="ID ເມນູຍ່ອຍ"
            variant="outlined"
            :rules="[v => !!v || 'ID ເມນູຕ້ອງບໍ່ຫວ່າງ']"
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
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            density="compact"
            v-model="request.sub_menu_name_en"
            label="ຊື່ເມນູຍ່ອຍພາສາອັງກິດ"
            variant="outlined"
            :rules="[v => !!v || 'ຊື່ເມນູຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="request.sub_menu_order"
            label="ລຳດັບເມນູຍ່ອຍ"
            variant="outlined"
            :rules="[v => !!v || 'ລຳດັບເມນູຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="request.sub_menu_urls"
            label="URL ເມນູຍ່ອຍ"
            variant="outlined"
            :rules="[v => !!v || 'URL ຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            density="compact"
            v-model="request.sub_menu_icon"
            label="ໄອຄອນ"
            variant="outlined"
            :rules="[v => !!v || 'ໄອຄອນຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-autocomplete
            :items="[
              { title: 'ເປີດໃຊ້ງານ', value: 'true' },
              { title: 'ປິດໃຊ້ງານ', value: 'false' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            v-model="request.is_active"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະ']"
            label="ເລືອກສະຖານະໃຊ້ງານ"
            variant="outlined"
            required
          />
        </v-col>
      </v-row>
      
      <!-- ປຸ່ມດຳເນີນການ -->
      <v-col cols="12" class="d-flex justify-center">
        <v-btn 
          type="submit" 
          color="primary" 
          class="mr-2"
        >
          ບັນທຶກ
        </v-btn>
        <v-btn 
          color="error" 
          @click="cancelUpdate"
        >
          ຍົກເລີກ
        </v-btn>
      </v-col>
    </v-form>
  </v-container>
</template>