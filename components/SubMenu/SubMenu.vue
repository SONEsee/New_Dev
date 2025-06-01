<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch } from "vue";

const selecteMainMenu = ref<any | null>(null);


const SELECTED_MAINMENU_KEY = "selected_mainmenu_filter";

const loadSavedMainMenuSelection = () => {
  try {
    const saved = localStorage.getItem(SELECTED_MAINMENU_KEY);
    if (saved) {
      const parsedMainMenu = JSON.parse(saved);
      selecteMainMenu.value = parsedMainMenu;
    }
  } catch (error) {
    console.error("Failed to load saved main menu selection:", error);
  }
};

const saveMainMenuSelection = (mainMenu: any) => {
  try {
    if (mainMenu) {
      localStorage.setItem(SELECTED_MAINMENU_KEY, JSON.stringify(mainMenu));
    } else {
      localStorage.removeItem(SELECTED_MAINMENU_KEY);
    }
  } catch (error) {
    console.error("Failed to save main menu selection:", error);
  }
};

watch(
  selecteMainMenu,
  async (newValue) => {
    saveMainMenuSelection(newValue);
  
    try {
      subMenuStore.query_submenu_filter.data.menu_id = newValue?.menu_id || null;
      await subMenuStore.GetMenuSubMenu();
    } catch (error) {
      console.error("Failed to auto search submenu:", error);
    }
  },
  { deep: true }
);

const clearFilters = async () => {
  selecteMainMenu.value = null;
  subMenuStore.query_submenu_filter.data.menu_id = null;
  await subMenuStore.GetMenuSubMenu();
};

const subMenuStore = useMenuStore();
const res = computed(() => {
  const data = subMenuStore.response_sub_menu_data || null;

  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});

const menuItems = computed(() => {
  return subMenuStore.respone_main_menu_data || [];
});

const loadDataAndApplyFilter = async () => {
  try {
  
    await Promise.all([
      subMenuStore.GetMenuSubMenu(),
      subMenuStore.GetMainMenu(),
    ]);

    loadSavedMainMenuSelection();

    if (selecteMainMenu.value) {
      subMenuStore.query_submenu_filter.data.menu_id = selecteMainMenu.value.menu_id;
      await subMenuStore.GetMenuSubMenu();
    }
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
};

onMounted(async () => {
  await loadDataAndApplyFilter();
});

const onDeleteType = async (sub_menu_id: string) => {
  await subMenuStore.DeleteSubMenu(sub_menu_id);
  subMenuStore.GetMenuSubMenu();
};

const title = "ຂໍ້ມູນເມນູຍ່ອຍ";
const header = [
  { title: "ລະຫັດ", value: "sub_menu_id" },
  { title: "ຊື່ເມນູພາາລາວ", value: "sub_menu_name_la" },
  { title: "ຊື່ເມນູພາສາອັງກິດ", value: "sub_menu_name_en" },
  { title: "ລຳດັບ", value: "sub_menu_order" },
  { title: "ເມນູຫຼັກ", value: "menu_id", align: "center" },
  { title: "ສະຖານະການໃຊ້ງານ", value: "is_active" },
  { title: "ມື້ສ້າງຂໍ້ມູນ", value: "created_date" },
  { title: "ຈັດການ", value: "action" },
];

const goToCreateSubMenu = () => {

  if (selecteMainMenu.value && selecteMainMenu.value.menu_id) {
    goPath(`/submenu/create?menu_id=${selecteMainMenu.value.menu_id}`);
  } else {
   
    goPath('/submenu/create');
  }
};

const clearSavedSelection = () => {
  localStorage.removeItem(SELECTED_MAINMENU_KEY);
  selecteMainMenu.value = null;
  subMenuStore.query_submenu_filter.data.menu_id = null;
};


defineExpose({
  clearSavedSelection,
});
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="3">
          <div class="d-flex">
            <v-btn color="primary" @click="goToCreateSubMenu()"
              ><v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດ</v-btn
            >
          </div>
        </v-col>

        <v-col cols="12" md="7" class="text-no-wrap">
          <v-autocomplete
            v-model="selecteMainMenu"
            density="compact"
            label="ເລືອກເມນູຫຼັກ"
            :items="menuItems"
            item-value="menu_id"
            item-title="sub_menu_name_la"
            variant="outlined"
            clearable
            placeholder="ເລືອກເມນູຫຼັກ"
            return-object
            :loading="subMenuStore.isloading"
          >
            <template v-slot:selection="{ item }">
              {{ item.raw.menu_name_la }}-{{ item.raw.menu_id }}
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`ID: ${item.raw.menu_id}`"
                :title="item.raw.menu_name_la"
              />
            </template>
          </v-autocomplete>
        </v-col>
        
        <v-col cols="12" md="2">
          <v-btn 
            color="secondary" 
            variant="outlined" 
            @click="clearFilters"
            :loading="subMenuStore.isloading"
            block
          >
            <v-icon class="mr-2">mdi-filter-remove</v-icon>
            ເຄລຍການກັ່ນຕອງ
          </v-btn>
        </v-col>
      </v-row>
    </v-col>

    <v-data-table :headers="header" :items="res || []" class="elevation-1">
      <template v-slot:item.created_date="{ item }">
        {{ dayjs(item.created_date).format("DD/MM/YYYY") }}
      </template>
      <template v-slot:item.is_active="{ item }">
          <v-chip
          :color="item.is_active === 'Y' ? 'green' : 'red'"
          size="small"
          label
        >
          {{ item.is_active === "Y" ? "ໃຊ້ງານ" : "ບໍ່ໃຊ້ງານ" }}
        </v-chip>
      </template>
      <template v-slot:item.no="{ item, index }">
        {{ index + 1 }}
      </template>
      <template v-slot:item.menu_id="item" class="text-center">
        <div class="text-center">
          <h3>{{ item.item.menu?.menu_name_la || "No Data" }}</h3>

          <p>
            {{ item.item.menu?.menu_id || "ບໍ່ມີຂໍ້ມູນ" }}</p>
        </div>
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