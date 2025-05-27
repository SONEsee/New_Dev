<script setup lang="ts">
const title = "ຈັດການຂໍ້ມູນຟັງຊັ້ນ";
const menuStore = useMenuStore();
const selecteSubMenu = ref<any | null>(null);
// const res = computed(() => {
//   const data = menuStore.response_sub_menu_data || null;

//   if (!data) return [];
//   if (Array.isArray(data)) return data;
//   return [data];
// });
const res = computed(() => {
  const data = menuStore.response_sub_menu_data || null;
  if (!data) return [];
  let result = Array.isArray(data) ? data : [data];
  return result.filter(item => {
    return item.status === 'active';
  });
});
const searchFunction = async () => {
  try {
    menuStore.query_function_filter.data.sub_menu_id =
      selecteSubMenu.value.sub_menu_id || null;
    await menuStore.GetFuntionMenu();
  } catch (error) {
    console.error("Failed to search function:", error);
  }
};
const clearFilters = () => {
  selecteSubMenu.value = null;
  menuStore.query_function_filter.data.sub_menu_id = null;
  menuStore.GetFuntionMenu();
};

const functionData = computed(() => {
  return menuStore.respons_function_menu_data || [];
});

const headers = [
  { title: "ລຳດັບຟັງຊັ້ນ", value: "function_order" },
  { title: "ລະຫັດຟັງຊັ້ນ", value: "function_id" },
  { title: "ຄຳອະທິບາຍ (ລາວ)", value: "description_la" },
  { title: "ຄຳອະທິບາຍ (ອັງກິດ)", value: "description_en" },
  // { title: "ລຳດັບ", value: "function_order" },
  { title: "ສະຖານະ", value: "is_active" },

  { title: "ຈັດການ", value: "actions" },
];

onMounted(() => {
menuStore.GetFuntionMenu(),
menuStore.GetMenuSubMenu()
});

const deleteFunction = async (item: any) => {
  try {
    await menuStore.DeleteFunctionMenu(item.function_id);
  } catch (error) {
    console.error("Failed to delete function:", error);
  }
};
</script>

<template>
  <v-container fluid>
    <GlobalTextTitleLine :title="title" />

    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="3">
          <div class="d-flex">
            <v-btn
              color="primary"
              class="mb-4"
              @click="goPath('/funtion/create')"
            >
              <v-icon icon="mdi-plus"></v-icon>
              ເພີ່ມຟັງຊັ້ນໃໝ່
            </v-btn>
          </div></v-col
        >
       <v-col cols="12" md="1"></v-col>
        <v-col cols="12" md="5" class="text-no-wrap">
          <v-autocomplete
            v-model="selecteSubMenu"
            density="compact"
            label="ເລືອກເມນູຍ່ອຍ"
            :items="res"
            item-value="sub_menu_id"
            item-title="sub_menu_name_la"
            variant="outlined"
            clearable
            placeholder="ເລືອກເມນູຍ່ອຍ"
            return-object
          >
            <template v-slot:selection="{ item }">
              {{ item.raw.sub_menu_name_la }}-{{ item.raw.sub_menu_id }}
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`ID: ${item.raw.sub_menu_id}`"
                :title="item.raw.sub_menu_name_la"
              />
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" md="3">
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="flat"
              @click="searchFunction"
              :loading="menuStore.isloading"
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

    <v-data-table
      :headers="headers"
      :items="functionData"
      :items-per-page="10"
      density="compact"
    >
      <template v-slot:item.is_active="{ value }">
        <v-chip :color="value === 'Y' ? 'success' : 'error'" size="small">
          {{ value === "Y" ? "ໃຊ້ງານ" : "ປິດໃຊ້ງານ" }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }" class="text-center">
        <v-btn
          color="primary"
          icon="mdi-eye"
          variant="text"
          @click="goPath(`/funtion/detail?id=${item.function_id}`)"
          size="small"
        ></v-btn>
        <v-btn
          icon
          variant="text"
          color="primary"
          @click="goPath(`/funtion/edit?id=${item.function_id}`)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon variant="text" color="error" @click="deleteFunction(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>
