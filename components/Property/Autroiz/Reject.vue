<script setup lang="ts">
const mainStore = useFassetLidtDescription();
const datarespons = computed(() => {
  const data = mainStore.respons_data_driscription_main;

  let arrayData = [];
  if (Array.isArray(data)) {
    arrayData = data;
  } else if (data && typeof data === "object") {
    arrayData = [data];
  } else {
    return [];
  }

  return arrayData.filter((item) => item.Auth_Status === "R");
});
const formatNumber = (number: any) => {
  if (!number || isNaN(Number(number))) return "0 ກີບ";
  return (
    Number(number).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " ກີບ"
  );
};
const header = [
  { title: "ລະຫັດ", value: "aldm_id" },
  //   { title: "ລະຫັດຊັບສິນ", value: "asset_list_id_detail.asset_list_id" },
  { title: "ຊື່ຊັບສິນ", value: "asset_list_id_detail.asset_spec" },
  { title: "ມູນຄ່າຫັກ", value: "dpca_value" },
  { title: "ມູນຄ່າສະສົມ", value: "accumulated_dpca" },
  { title: "ມູນຄ່າຄົງເຫຼືອ", value: "remaining_value" },
  { title: "ລາຍລະອຽດ", value: "dpca_desc" },
  { title: "ເຫດຜົນທີ່ປະຕິເສດ", value: "detail" },
];
onMounted(() => {
  mainStore.getDataTotal();
});
const title = "ຂໍ້ມູນທີ່ຖືກປະຕິເສດ";
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <!-- <pre>{{ datarespons }}</pre> -->
    <v-data-table
      class=""
      :headers="header"
      :loading="mainStore.isLoading"
      :items="datarespons"
    >
      <template v-slot:header.aldm_id="{ column }">
        <b style="color: blue"> {{ column.title }}</b>
      </template>
      <template v-slot:header.asset_list_id_detail.asset_list_id="{ column }">
        <b style="color: blue"> {{ column.title }}</b>
      </template>
      <template v-slot:header.asset_list_id_detail.asset_spec="{ column }">
        <b style="color: blue"> {{ column.title }}</b>
      </template>
      <template v-slot:header.dpca_value="{ column }">
        <b style="color: blue"> {{ column.title }}</b>
      </template>
      <template v-slot:header.accumulated_dpca="{ column }">
        <b style="color: blue"> {{ column.title }}</b>
      </template>
      <template v-slot:header.remaining_value="{ column }">
        <b style="color: blue"> {{ column.title }}</b>
      </template>
      <template v-slot:header.dpca_desc="{ column }">
        <b style="color: blue"> {{ column.title }}</b>
      </template>
      <template v-slot:header.detail="{ column }">
        <b style="color: blue"> {{ column.title }}</b>
      </template>

      <template v-slot:item.dpca_value="{ item }">
        {{ formatNumber(item.dpca_value) }}
      </template>
      <template v-slot:item.accumulated_dpca="{ item }">
        {{ formatNumber(item.accumulated_dpca) }}
      </template>
      <template v-slot:item.remaining_value="{ item }">
        {{ formatNumber(item.remaining_value) }}
      </template>
    </v-data-table>
  </div>
</template>
