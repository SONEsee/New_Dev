<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
const selecteMainMenu = ref<any | null>(null);
const searchSubMenu = async ()=>{
  try {
    subMenuStore.query_submenu_filter.data.menu_id=
    selecteMainMenu.value.menu_id || null;
    await subMenuStore.GetMenuSubMenu();
  } catch (error) {
    console.error("Failed to search submenu:", error);
    
  }
};

const clearFilters = ()=>{
selecteMainMenu.value = null;
subMenuStore.query_submenu_filter.data.menu_id = null;
subMenuStore.GetMenuSubMenu();
}
const subMenuStore = useMenuStore();
const res = computed(() => {
  const data = subMenuStore.response_sub_menu_data  || null;

  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});
const menuItems = computed(() => {
  return subMenuStore.respone_main_menu_data || [];
});
onMounted(async () => {
  try {
    await Promise.all([
      subMenuStore.GetMenuSubMenu(),
      subMenuStore.GetMainMenu()
    ]);
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
});
const onDeleteType = async (sub_menu_id: string) => {
  await subMenuStore.DeleteSubMenu(sub_menu_id);
  subMenuStore.GetMenuSubMenu();
};
const title = "ຂໍ້ມູນເມນູຍ່ອຍ";
const header = [
  { title: "ລຳດັບເມນູຍອ່ຍ", value: "sub_menu_order" },
  { title: "ຊື່ເມນູພາາລາວ", value: "sub_menu_name_la" },
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
      <v-row>
        <v-col cols="12" md="3">
           <div class="d-flex ">
        <v-btn color="primary" @click="goPath('/submenu/create')"
          ><v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດ</v-btn
        >
      </div>
        </v-col>
        
        <v-col cols="12" md="3"></v-col>
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="selecteMainMenu"
            density="compact"
            label="ເລືອກເມນູຫຼັກ"
            :items="menuItems"
            item-value="menu_id"
            item-title="menu_name_la"
            variant="outlined"
            clearable
            placeholder="ເລືອກເມນູຫຼັກເພື່ອກັ່ນຕອງຂໍ້ມູນ"
            return-object
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="3">
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="flat"
              @click="searchSubMenu"
              :loading="subMenuStore.isloading"
            >
              <v-icon class="mr-2">mdi-magnify</v-icon>
              ຄົ້ນຫາ
            </v-btn>
            <v-btn color="secondary" variant="outlined" @click="clearFilters">
              <v-icon class="mr-2">mdi-filter-remove</v-icon>
              ລຶບຕົວກັ່ນ
            </v-btn>
          </div>
        </v-col>
      </v-row>
     

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
