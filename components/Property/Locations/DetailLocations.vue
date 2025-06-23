<script setup lang="ts">
import { useRoute } from 'vue-router';
const title = "ເບິງລາຍລະອຽດຂໍ້ມູນສະຖານທີ່";
const locationStores = locationStore();
const rout = useRoute();
const id = Number(rout.query.location) || 0;
const res = computed(()=>{
  return locationStores.response_location_detail;
})
onMounted(()=>{
  locationStores.GetLocationDetail(id)
})
</script>
<template>
  <v-col cols="12">
<global-text-title-line :title="title"/>
<!-- <pre>{{ res }}</pre> -->
<v-row>
  <v-col cols="12" md="6">
    <lazy-global-card-title :title="'ລະຫັດ'" :text="res?.location_code" />
    <lazy-global-card-title :title="'ຊື່ພາສາລາວ'" :text="res?.location_name_la" />
    <lazy-global-card-title :title="'ປະເພດສະຖານທີ່'" :text="res?.location_type" />
  </v-col>
  <v-col cols="12" md="6">
    <lazy-global-card-title :title="'ທີ່ຕັ້ງ'" :text="res?.parent_location_id" />
    <lazy-global-card-title :title="'ຊື່ພາສາອັງກິດ'" :text="res?.location_name_en" />
    <lazy-global-card-title :title="'ເບີ້ໂທ'" :text="res?.phone" />
  </v-col>
</v-row>
  </v-col>
</template>