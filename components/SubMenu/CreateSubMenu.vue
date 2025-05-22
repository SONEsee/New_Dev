<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

// ສ້າງ Store ພຽງຄັ້ງດຽວ
const menuStore = useMenuStore();
const router = useRouter();

// ໂຕແປອ້າງອີງຟອມ
const valid = ref(false);
const form = ref();
const title = "ສ້າງຂໍ້ມູນເມນູຍ່ອຍ";
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

onMounted(() => {
  // ດຶງຂໍ້ມູນເມນູຫຼັກເພື່ອໃຊ້ໃນ Dropdown
  menuStore.GetMainMenu();
});

const submitSubMenu = async () => {
  try {
    const { valid: isValid } = await form.value.validate();
    
    if (isValid) {
      errorMessage.value = '';
      
      
      await menuStore.CreateSubMenu();
      
      
      router.push('/submenu');
    }
  } catch (error) {
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຮູ້ຈັກ';
    console.error(error);
  }
};


const cancelSubmit = () => {
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

    <v-form ref="form" @submit.prevent="submitSubMenu">
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
          @click="cancelSubmit"
        >
          ຍົກເລີກ
        </v-btn>
      </v-col>
    </v-form>
  </v-container>
</template>