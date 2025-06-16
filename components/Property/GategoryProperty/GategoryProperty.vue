<script setup lang="ts">
const popertyStore = propertyStore();
const res = computed(() => {
  return popertyStore.respons_data_property_category || [];
});
onMounted(() => {
  popertyStore.GetPropertyCategoryById();
});

const header =computed(()=>{ [
  { title: "ລະຫັດ", value: "type_code" },
  { title: "ຊື່", value: "type_name" },
  { title: "ຄຳອະທິບາຍ", value: "description" },
  { title: "ເປີ່ຍແລ້ວ", value: "is_active" },
  { title: "ເວລາເພີ່ມ", value: "created_at" },
  { title: "ເວລາແກ້ໄຂ", value: "updated_at" }
];})
const mockData = [
  {
    type_id: 1,
    type_code: "T001",
    type_name: "ປະເພດທີ່ 1",
    description: "ນີ້ແມ່ນຄຳອະທິບາຍສຳລັບປະເພດທີ່ 1 ໃນພາສາລາວ.",
    is_active: true,
    created_at: new Date("2025-06-16T13:13:00+07:00"),
    updated_at: new Date("2025-06-16T13:13:00+07:00")
  },
  {
    type_id: 2,
    type_code: "T002",
    type_name: "ປະເພດທີ່ 2",
    description: "ຄຳອະທິບາຍສຳລັບປະເພດທີ່ 2, ລາຍລະອຽດເພີ່ມເຕີມ.",
    is_active: false,
    created_at: new Date("2025-06-15T09:00:00+07:00"),
    updated_at: new Date("2025-06-16T10:30:00+07:00")
  },
  {
    type_id: 3,
    type_code: "T003",
    type_name: "ປະເພດທີ່ 3",
    description: "ລາຍລະອຽດຂອງປະເພດທີ່ 3 ສຳລັບການນໍາໃຊ້ທົ່ວໄປ.",
    is_active: true,
    created_at: new Date("2025-06-14T14:45:00+07:00"),
    updated_at: new Date("2025-06-15T16:20:00+07:00")
  },
  {
    type_id: 4,
    type_code: "T004",
    type_name: "ປະເພດທີ່ 4",
    description: "ຄຳອະທິບາຍສຳລັບປະເພດທີ່ 4, ໃຊ້ໃນກໍລະນີພິເສດ.",
    is_active: true,
    created_at: new Date("2025-06-13T11:10:00+07:00"),
    updated_at: new Date("2025-06-14T12:00:00+07:00")
  },
  {
    type_id: 5,
    type_code: "T005",
    type_name: "ປະເພດທີ່ 5",
    description: "ປະເພດທີ່ 5 ມີຄຳອະທິບາຍສຳລັບການທົດສອບ.",
    is_active: false,
    created_at: new Date("2025-06-12T08:30:00+07:00"),
    updated_at: new Date("2025-06-13T09:15:00+07:00")
  }
];
const title = "ຈັດການປະເພດຊັບສິນ";
</script>
<template>
  <v-col cols="12">
    <div class="pa-3">
      <GlobalTextTitleLine :title="title"  />
      <v-data-table :items="mockData" :headers="header"> </v-data-table>
    </div>
  </v-col>
</template>
