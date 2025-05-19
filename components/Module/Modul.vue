<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";

const moduleStore = ModulesStore();
const res = computed(() => {
  const data = moduleStore.response_data_module;

  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});
onMounted(() => {
  moduleStore.getModule();
});
const onDeleteType = async (module_Id: string) => {
  await moduleStore.deleteModule(module_Id);
  moduleStore.getModule();
};
const title = "ຂໍ້ມູນຟັງຊັ້ນຫຼັກຂອງລະບົບ";
const header = [
  { title: "ຊື່ເມນູພາສາລາວ", value: "module_name_la" },
  { title: "ຊື່ເມນູພາສາອັງກິດ", value: "module_name_en" },
  { title: "ສະຖານະການໃຊ້ງານ", value: "is_active" },
  { title: "ມື້ສ້າງຂໍ້ມູນ", value: "created_date" },
  { title: "ຈັດການ", value: "action" },
];
</script>
<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-col cols="12">
      <div class="d-flex justify-end">
        <v-btn color="primary" @click="goPath('/module/create')"
          ><v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດ</v-btn
        >
      </div>
    </v-col>

    <v-data-table :headers="header" :items="res || []" class="elevation-1">
      <template v-slot:item.created_date="{ item }">
        {{ dayjs(item.created_date).format("DD/MM/YYYY") }}
      </template>
      <template v-slot:item.is_active="{ item }">
        <v-chip :color="item.is_active ? 'green' : 'red'">
          {{ item.is_active ? "ໃຊ້ງານ" : "ບໍ່ໃຊ້ງານ" }}</v-chip
        >
      </template>
      <template v-slot:item.action="{ item }">
        <v-btn
          small
          flat
          class="text-primary"
          icon="mdi-eye-outline"
          @click="goPath(`/module/detail?id=${item.module_Id}`)"
        />
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/module/edit?id=${item.module_Id}`)"
        />
        <v-btn
          small
          flat
          class="text-error"
          icon="mdi-delete-outline"
          @click="onDeleteType(item.module_Id)"
        />
      </template>
    </v-data-table>
  </v-container>
</template>
