<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";

const subMenuStore = useMenuStore();
const res = computed(() => {
  const data = subMenuStore.response_sub_menu_data  || null;

  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});
onMounted(() => {
  subMenuStore.GetMenuSubMenu();
});
const onDeleteType = async (sub_menu_id: string) => {
  await subMenuStore.DeleteSubMenu(sub_menu_id);
  subMenuStore.GetMenuSubMenu();
};
const title = "ຂໍ້ມູນຟັງຊັ້ນຫຼັກຂອງລະບົບ";
const header = [
  { title: "ຊື່ເມນູພາສາລາວ", value: "sub_menu_name_la" },
  { title: "ຊື່ເມນູພາສາອັງກິດ", value: "sub_menu_name_en" },
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
        <v-btn color="primary" @click="goPath('/submenu/create')"
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
          @click="goPath(`/submenu/detail?id=${item.sub_menu_id}`)"
        />
        <v-btn
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/submenu/edit?id=${item.sub_menu_id}`)"
        />
        <v-btn
          small
          flat
          class="text-error"
          icon="mdi-delete-outline"
          @click="onDeleteType(item.sub_menu_id)"
        />
      </template>
    </v-data-table>
  </v-container>
</template>
