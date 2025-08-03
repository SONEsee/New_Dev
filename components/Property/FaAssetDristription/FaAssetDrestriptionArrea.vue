<script setup lang="ts">
const mainStore = useFassetLidtDescription();

const selectedItems = ref([]);

const res = computed(() => {
  const data = mainStore.response_data_get_overdue?.data.overdue_items;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const headers = [
  { title: "ລະຫັດຊັບສິນ", key: "asset_id" },
  { title: "ຊື່ຊັບສິນ", key: "asset_name" },
  { title: "ມູນຄ່າ", key: "asset_value" },
  { title: "ຄືບໜ້າ", key: "completion_percentage" },
  { title: "ງວດທີ່ຈະຫັກ", key: "due_end_date" },
  //   { title: "ຄ່າເສື່ອມທີ່ຄວນຫັກ", key: "expected_depreciation" },
  { title: "ຄ້າງ (ມື້)", key: "days_overdue" },
  { title: "ປະຫວັດ", key: "action" },
  //   { title: "ສະຖານະ", key: "urgency_message" },
];

const formatNumber = (num: any) => {
  return new Intl.NumberFormat("en-US").format(num);
};

const processBulkItems = async () => {
  mainStore.requres_data_post.mapping_ids = selectedItems.value;

  console.log("Bulk process data:", mainStore.requres_data_post);

  await mainStore.postArreat();

  selectedItems.value = [];
};
const title = "ຫັກຄ່າຫຼູຍຫ້ຽນຍອ້ນຫຼັງ"
onMounted(() => {
  mainStore.getArrears();
});
</script>

<template>
  <div
    v-if="selectedItems.length > 0"
    class="mb-4 pa-3"
    style="background-color: #e3f2fd; border-radius: 8px"
  >
  
    <div class="d-flex align-center justify-space-between">
      <span>
        📋 ເລືອກແລ້ວ: <strong>{{ selectedItems.length }}</strong> ລາຍການ
      </span>
      <div>
        <v-btn
          color="primary"
          size="small"
          class="mr-2"
          @click="processBulkItems"
        >
          ຫັກຄ່າຫຼູ້ຍຫຽ້ນ ({{ selectedItems.length }})
        </v-btn>
        <v-btn
          color="secondary"
          size="small"
          variant="outlined"
          @click="selectedItems = []"
        >
          ຍົກເລີກ
        </v-btn>
      </div>
    </div>
  </div>

  <div v-if="selectedItems.length > 0" class="mb-2">
    <GlobalTextTitleLine :title="title" />
    <small style="color: #666">
      Selected mapping_ids: {{ selectedItems }}
    </small>
  </div>

  <!-- <pre>{{ res }}</pre> -->

  <v-data-table
    v-model="selectedItems"
    :items="res"
    :headers="headers"
    show-select
    item-value="mapping_id"
  >
    <template v-slot:header.asset_id="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.asset_name="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.asset_value="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.completion_percentage="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.due_end_date="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.days_overdue="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:header.action="{ column }">
      <b style="color: blue">{{ column.title }}</b>
    </template>
    <template v-slot:item.asset_value="{ item }">
      {{ formatNumber(item.asset_value) }} ກີບ
    </template>
    <template v-slot:item.action="{ item }">
      <v-btn
        @click="
          goPath(
            `/property/faassetdetription/history?id_assetlist=${item.asset_id}`
          )
        "
        color="primary"
        >ປະຫວັດ</v-btn
      >
    </template>

    <template v-slot:item.completion_percentage="{ item }">
      {{ item.current_month }}/{{ item.total_months }} ({{
        Math.round(item.completion_percentage)
      }}%)
    </template>

    <template v-slot:item.expected_depreciation="{ item }">
      <strong style="color: #f44336">
        {{ formatNumber(item.expected_depreciation) }} ກີບ
      </strong>
    </template>

    <template v-slot:item.days_overdue="{ item }">
      <v-chip
        :color="item.urgency_level === 'critical' ? 'error' : 'warning'"
        size="small"
      >
        {{ item.days_overdue }} ມື້
      </v-chip>
    </template>

    <template v-slot:item.urgency_message="{ item }">
      <v-chip
        :color="item.urgency_level === 'critical' ? 'error' : 'warning'"
        size="small"
      >
        {{ item.urgency_message }}
      </v-chip>
    </template>
  </v-data-table>
</template>
