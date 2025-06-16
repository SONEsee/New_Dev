<script setup lang="ts">
const popertyStore = propertyStore();
const res = computed(() => {
  return popertyStore.respons_data_property_category || [];
});
onMounted(() => {
  popertyStore.GetPropertyCategoryById();
});

const mockData = [
  {
    id: 1,
    type_code: "T001",
    type_name_la: "ປະເພດທີ່ 1",
    type_name_en: "Type 1",
    type_desc: "ຄຳອະທິບາຍປະເພດທີ່ 1",
    create_datetime: new Date("2025-06-16T10:00:00"),
    create_by: 101,
  },
  {
    id: 2,
    type_code: "T002",
    type_name_la: "ປະເພດທີ່ 2",
    type_name_en: "Type 2",
    type_desc: "ຄຳອະທິບາຍປະເພດທີ່ 2",
    create_datetime: new Date("2025-06-15T09:30:00"),
    create_by: 102,
  },
  {
    id: 3,
    type_code: "T003",
    type_name_la: "ປະເພດທີ່ 3",
    type_name_en: "Type 3",
    type_desc: "ຄຳອະທິບາຍປະເພດທີ່ 3",
    create_datetime: new Date("2025-06-14T14:20:00"),
    create_by: 103,
  },
  {
    id: 4,
    type_code: "T004",
    type_name_la: "ປະເພດທີ່ 4",
    type_name_en: "Type 4",
    type_desc: "ຄຳອະທິບາຍປະເພດທີ່ 4",
    create_datetime: new Date("2025-06-13T16:45:00"),
    create_by: 104,
  },
  {
    id: 5,
    type_code: "T005",
    type_name_la: "ປະເພດທີ່ 5",
    type_name_en: "Type 5",
    type_desc: "ຄຳອະທິບາຍປະເພດທີ່ 5",
    create_datetime: new Date("2025-06-12T08:15:00"),
    create_by: 105,
  },
];
const title = "ຈັດການປະເພດຊັບສິນ";
</script>
<template>
  <v-col cols="12">
    <div class="pa-3">
      <GlobalTextTitleLine :title="title" />
      <v-data-table :items="mockData"> </v-data-table>
    </div>
  </v-col>
</template>
