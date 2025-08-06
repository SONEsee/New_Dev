<script setup lang="ts">
import { useRoute } from "vue-router";
const mainStore = useFassetLidtDescription();
const route = useRoute();
const id = Number(route.query.deptription_id);
console.log("data", id);
const datafilter = computed(() => {
  const data = mainStore.respons_data_driscription_main;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
});
const title = "ຈັດການຂໍ້ມູນການຄ່າຫຼູຍຫ້ຽນ";

const header = [
  { title: "ລະຫັດຊັບສົມບັດ", key: "asset_list_id" },
  { title: "ຊື່ຊັບສົມບັດ", key: "asset_list_id_detail" },
  { title: "ລາຍລະອຽດ", key: "dpca_desc" },
  { title: "ມູນຄ່າສະສົມ", key: "accumulated_dpca" },
  { title: "ມູນຄ່າຄົງເຫຼືອ", key: "remaining_value" },
  { title: "ປະຫວັດ", key: "detail" },
];
const formatNumber = (number: any) => {
  if (!number || isNaN(Number(number))) return "0 ກີບ";
  return (
    Number(number).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " ກີບ"
  );
};
const mainrespons = computed(() => {
  const data = mainStore.respons_data_driscription_main;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    return [data];
  }

  return [];
});
const reslist = computed(() => {
  const data = mainStore.resposne_data_driscription;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [];
  }
});
onMounted(() => {
  mainStore.fillter_data_aldm_month_id.aldm_month_id.aldm_month_id = id;
  // mainStore.getMainData();
  mainStore.getDataFilter();
  mainStore.getData();
});
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <v-data-table :items="datafilter" :headers="header">
      <!-- <pre>{{ datafilter }}</pre>  -->
      <template v-slot:header.asset_list_id_detail="{ column }">
        <b class="text-primary"> {{ column.title }}</b>
      </template>
      <template v-slot:header.asset_list_id="{ column }">
        <b class="text-primary"> {{ column.title }}</b>
      </template>
      <template v-slot:header.dpca_desc="{ column }">
        <b class="text-primary"> {{ column.title }}</b>
      </template>
      <template v-slot:header.accumulated_dpca="{ column }">
        <b class="text-primary"> {{ column.title }}</b>
      </template>
      <template v-slot:header.remaining_value="{ column }">
        <b class="text-primary"> {{ column.title }}</b>
      </template>
      <template v-slot:header.detail="{ column }">
        <b class="text-primary"> {{ column.title }}</b>
      </template>

      <template v-slot:item.asset_list_id_detail="{ item }">
        {{ item.asset_list_id_detail.asset_spec }}
      </template>
      <template v-slot:item.accumulated_dpca="{ item }">
        {{ formatNumber(item.accumulated_dpca) }}
      </template>
      <template v-slot:item.remaining_value="{ item }">
        {{ formatNumber(item.remaining_value) }}
      </template>
      <template v-slot:item.detail="{ item }">
        <v-btn
          flat
          @click="
            goPath(
              `/property/faassetdetription/history?id_assetlist=${item.asset_list_id}`
            )
          "
        >
          <v-icon icon="mdi-history"></v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
