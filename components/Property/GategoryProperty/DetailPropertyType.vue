<script setup lang="ts">
import { useRoute } from "vue-router";
const propertStore = propertyStore();
const res = computed(() => {
  return propertStore.respons_detail_property_category ;
});

const rout = useRoute();
const id = Number(rout.query.type_id) || 0;
const title = "ລາຍລະອຽດປະເພດຂອງປະເພດຊັບສິນ";
onMounted(() => {
  if (id) {
    propertStore.GetPropertyDetail(id);
  }
});
</script>
<template>
  <v-col cols="12">
    <div class="pa-2">
      <GlobalTextTitleLine :title="title" />
     
      <v-col cols="12">
        <v-row>
          <v-col cols="12" md="4">
            <GlobalCardTitle :title="'ລະຫັດປະເພດຊັບສິນ'" :text="res?.type_code" />
          </v-col>
          <v-col cols="12" md="4">
            <GlobalCardTitle :title="'ຊື່ປະເພດຊັບສິນ'" :text="res?.type_name_la" />
          </v-col>
          <v-col cols="12" md="4">
            <GlobalCardTitle :title="'ລາຍລະອຽດປະເພດຊັບສິນ'" :text="res?.type_name_en" />
          </v-col>
          <v-col cols="12" md="4">
            <GlobalCardTitle :title="'ສະຖານະ'" :text="res?.Record_Status" />
          </v-col>
          <v-col cols="12" md="4">
            <GlobalCardTitle :title="'ມື້ສ້າງ'" :text="res?.Maker_DT_Stamp" />
          </v-col>
        </v-row>
      </v-col>
    </div>
  </v-col>
</template>
