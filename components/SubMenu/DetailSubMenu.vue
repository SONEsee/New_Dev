<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from 'dayjs';
const route = useRoute();
const id = route.query.id as string | undefined;
const moduleStore = useMenuStore();

const moduleDetail = computed(() => {
  return moduleStore.respone_sub_menu_detail_data;
 
});
const title = "ລາຍລະອຽດເມນູຍອ່ຍ";


onMounted(() => {
  if (id) {
    moduleStore.getDetailSubMenu(id);
  } else {
    moduleStore.GetMenuSubMenu();
  }
});
</script>

<template>

 <v-container>
    <GlobalTextTitleLine :title="title" />
    
    <v-col cols="12">
        <v-row>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.sub_menu_name_la ?? 'N/A'"
                :title="'ຊື່ເມນູພາສາລາວ / Module Name (Lao)'" />
                
            </v-col>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.sub_menu_name_en ?? 'N/A'"
                :title="'ຊື່ເມນູພາສາລາວ / Module Name (en)'" />
                
            </v-col>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.sub_menu_icon ?? 'N/A'"
                :title="'ຊື່ໄອຄອນເມນູ'" />
                
            </v-col>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.sub_menu_id ?? 'N/A'"
                :title="'ລະຫັດເມນູ'" />
                
            </v-col>
           
            <v-col cols="12" md="6">
  <GlobalCardTitle 
    :text="moduleDetail?.created_by? dayjs(moduleDetail.created_by).format('DD/MM/YYYY') : 'N/A'"
    :title="'ສ້າງວັນເດືອນປີ'" 
  />
</v-col>
        </v-row>
    </v-col>
 </v-container>
</template>
