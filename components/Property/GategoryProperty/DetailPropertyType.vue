<script setup lang="ts">
import { useRoute } from "vue-router";
const propertStore = propertyStore();
const res = computed(() => {
  return propertStore.respons_detail_property_category ;
});
onMounted(() => {
  if (id) {
    propertStore.GetPropertyDetail(id);
  }
});
const rout = useRoute();
const id = String(rout.query.type_id) || "";
const title = "ລາຍລະອຽດປະເພດຂອງປະເພດຊັບສິນ";
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
            <GlobalCardTitle :title="'ຊື່ປະເພດຊັບສິນ'" :text="res?.type_name" />
          </v-col>
          <v-col cols="12" md="4">
            <GlobalCardTitle :title="'ລາຍລະອຽດປະເພດຊັບສິນ'" :text="res?.description" />
          </v-col>
          <v-col cols="12" md="4">
            <GlobalCardTitle :title="'ສະຖານະ'" :text="res?.is_active" />
          </v-col>
          <v-col cols="12" md="4">
            <GlobalCardTitle :title="'ມື້ສ້າງ'" :text="res?.created_at" />
          </v-col>
        </v-row>
      </v-col>
    </div>
  </v-col>
</template>
