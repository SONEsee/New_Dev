<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from 'dayjs';
const route = useRoute();
const id = route.query.id as string | undefined;
const moduleStore = ModulesStore();

const moduleDetail = computed(() => {
  return moduleStore.respons_detail_module;
});
const title = "ລາຍລະອຽດຟັງຊັ້ນ";


onMounted(() => {
  if (id) {
    moduleStore.getModuleDetail(id);
  } else {
    moduleStore.getModule();
  }
});
</script>

<template>
 <v-container>
    <GlobalTextTitleLine :title="title" />
    
    <v-col cols="12">
        <v-row>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.module_name_la ?? 'N/A'"
                :title="'ຊື່ເມນູພາສາລາວ / Module Name (Lao)'" />
                
            </v-col>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.module_name_en ?? 'N/A'"
                :title="'ຊື່ເມນູພາສາລາວ / Module Name (en)'" />
                
            </v-col>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.module_icon ?? 'N/A'"
                :title="'ຊື່ໄອຄອນເມນູ'" />
                
            </v-col>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.module_Id ?? 'N/A'"
                :title="'ລະຫັດເມນູ'" />
                
            </v-col>
            <v-col cols="12" md="6">
                <GlobalCardTitle :text="moduleDetail?.modified_by?? 'N/A'"
                :title="'ສ້າງໂດຍ'" />
                
            </v-col>
            <v-col cols="12" md="6">
  <GlobalCardTitle 
    :text="moduleDetail?.created_date ? dayjs(moduleDetail.created_date).format('DD/MM/YYYY') : 'N/A'"
    :title="'ສ້າງໂດຍ'" 
  />
</v-col>
        </v-row>
    </v-col>
 </v-container>
</template>
