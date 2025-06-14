<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const menuStore = useMenuStore();

const id = computed(() => {
  const queryId = route.query.id;

  return Array.isArray(queryId) ? queryId[0] : queryId || "";
});

const title = "ລາຍລະອຽດຂໍ້ມູນເມນູຫຼັກ";

const res = computed(() => {
  return menuStore.response_main_detail_data || null;
});

onMounted(() => {
  if (id.value) {
    menuStore.DetailMainMenu(id.value);
  }
});

interface MenuData {
  menu_name_la?: string;
  menu_name_en?: string;
  menu_icon?: string;
  is_active?: string | number;
  menu_order?: number;
  menu_id?: string | number;
}
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
   
    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="4">
          <GlobalCardTitle
            :text="res?.menu_name_la ?? 'N/A'"
            :title="'ຊື່ເມນູພາສາລາວ'"
          />
        </v-col>
        <v-col cols="12" md="4">
          <GlobalCardTitle
            :text="res?.menu_name_en ?? 'N/A'"
            :title="'ຊື່ເມນູພາສາອັງກິດ'"
          />
        </v-col>
        <v-col cols="12" md="4">
          <GlobalCardTitle
            :text="res?.menu_icon ?? 'N/A'"
            :title="'ໄອຄອນເມນູ'"
          />
        </v-col>
       <v-col cols="12" md="4">
  <GlobalCardTitle
    :text="res?.is_active === 'Y' ? 'ເປີດໃຊ້ງານ' : res?.is_active === 'N' ? 'ປິດໃຊ້ງານ' : 'N/A'"
    :title="'ສະຖານະໃຊ້ງານ'"
  />
</v-col>
        <v-col cols="12" md="4">
          <GlobalCardTitle
            :text="res?.menu_order ?? 'N/A'"
            :title="'ລຳດັບເມນູ'"
          />
        </v-col>
        <v-col cols="12" md="4">
          <GlobalCardTitle :text="res?.menu_id ?? 'N/A'" :title="'ID ເມນູ'" />
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>
