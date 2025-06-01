<script setup lang="ts">
import { ref, computed, onMounted, watch, onActivated } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { useMenuStore } from "@/stores/menu";

const moduleStore = ModulesStore();
const selectedModule = ref<any | null>(null);

// Keys for localStorage
const SELECTED_MODULE_KEY = "selected_module_filter";

// Load saved module selection from localStorage
const loadSavedModuleSelection = () => {
  try {
    const saved = localStorage.getItem(SELECTED_MODULE_KEY);
    if (saved) {
      const parsedModule = JSON.parse(saved);
      selectedModule.value = parsedModule;
    }
  } catch (error) {
    console.error("Failed to load saved module selection:", error);
  }
};

// Save module selection to localStorage
const saveModuleSelection = (module: any) => {
  try {
    if (module) {
      localStorage.setItem(SELECTED_MODULE_KEY, JSON.stringify(module));
    } else {
      localStorage.removeItem(SELECTED_MODULE_KEY);
    }
  } catch (error) {
    console.error("Failed to save module selection:", error);
  }
};

// Auto search when selectedModule changes
watch(
  selectedModule,
  async (newValue) => {
    saveModuleSelection(newValue);
    
    // Auto search when module selection changes
    try {
      menuStore.query_menu_filter.data.module_Id = newValue?.module_Id || null;
      await menuStore.GetMainMenu();
    } catch (error) {
      console.error("Failed to auto search menu:", error);
    }
  },
  { deep: true }
);

const clearFilters = async () => {
  selectedModule.value = null;
  menuStore.query_menu_filter.data.module_Id = null;
  await menuStore.GetMainMenu();
};

const loadDataAndApplyFilter = async () => {
  // Load modules first
  await moduleStore.getModule();

  // Load saved selection after modules are loaded
  loadSavedModuleSelection();

  // Apply filter if there's a saved selection
  if (selectedModule.value) {
    menuStore.query_menu_filter.data.module_Id = selectedModule.value.module_Id;
  } else {
    // ຖ້າບໍ່ມີການເລືອກ, reset filter
    menuStore.query_menu_filter.data.module_Id = null;
  }

  // Get menu data
  await menuStore.GetMainMenu();
};

onMounted(async () => {
  await loadDataAndApplyFilter();
});

// ເພີ່ມ onActivated ສຳລັບເວລາ component ຖືກ activate ໃໝ່
onActivated(async () => {
  await loadDataAndApplyFilter();
});

const module = computed(() => {
  return moduleStore.response_data_module || [];
});
const title = "ຂໍ້ມູນເມນູຫຼັກ";

const router = useRouter();
const menuStore = useMenuStore();

const menuItems = computed(() => {
  return menuStore.respone_main_menu_data || [];
});

const headers = [
  { title: "ລະຫັດ", key: "menu_id", sortable: true },
  { title: "ຊື່ເມນູພາສາລາວ", key: "menu_name_la", sortable: true },
  { title: "ຊື່ເມນູພາສາອັງກິດ", key: "menu_name_en", sortable: true },
  { title: "ລຳດັບ", key: "menu_order", sortable: true },
  { title: "ໂມດູນ", key: "module", sortable: true, align: "center" },
  { title: "ສະຖານະການໃຊ້ງານ", key: "is_active", sortable: true },
  { title: "ຈັດການ", key: "action", sortable: false, align: "center" },
];

const page = ref(1);
const itemsPerPage = ref(10);
const loading = computed(() => menuStore.isloading);

const goToCreateMenu = () => {
  // ຖ້າມີການເລືອກໂມດູນ, ສົ່ງ module_Id ໄປໜ້າສ້າງ
  if (selectedModule.value && selectedModule.value.module_Id) {
    router.push({
      path: "/menu/create",
      query: {
        module_id: selectedModule.value.module_Id,
      },
    });
  } else {
    // ຖ້າບໍ່ມີການເລືອກໂມດູນ, ໄປແບບປົກກະຕິ
    router.push("/menu/create");
  }
};

const onDeleteMenu = async (menuId: string) => {
  try {
    await menuStore.DeleteMenu(menuId);
    await menuStore.GetMainMenu();
  } catch (error) {
    console.error("Failed to delete menu:", error);
  }
};

const viewMenuDetails = (menuId: string) => {
  router.push(`/menu/detail?id=${menuId}`);
};

const editMenu = (menuId: string) => {
  router.push(`/menu/edit?id=${menuId}`);
};

const clearSavedSelection = () => {
  localStorage.removeItem(SELECTED_MODULE_KEY);
  selectedModule.value = null;
  menuStore.query_menu_filter.data.module_Id = null;
};

// Export functions for logout
defineExpose({
  clearSavedSelection,
});
</script>

<template class="">
  <GlobalTextTitleLine :title="title" />

  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="3">
        <div class="d-flex mb-2">
          <v-btn color="primary" @click="goToCreateMenu">
            <v-icon icon="mdi-plus" start></v-icon>
            ເພີ່ມຂໍ້ມູນເມນູ
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="3"></v-col>
      <v-col cols="12" md="4" class="text-no-wrap">
        <v-autocomplete
          v-model="selectedModule"
          density="compact"
          label="ເລືອກໂມດູນ"
          :items="module"
          item-value="module_Id"
          item-title="module_name_la"
          variant="outlined"
          clearable
          placeholder="ເລືອກໂມດູນ"
          return-object
          :loading="menuStore.isloading"
        >
          <template v-slot:selection="{ item }">
            {{ item.raw.module_name_la }}-{{ item.raw.module_Id }}
          </template>

          <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :subtitle="`ID: ${item.raw.module_Id}`"
              :title="item.raw.module_name_la"
            />
          </template>
        </v-autocomplete>
      </v-col>

      <v-col cols="12" md="2">
        <v-btn 
          color="secondary" 
          variant="outlined" 
          @click="clearFilters"
          :loading="menuStore.isloading"
          block
        >
          <v-icon class="mr-2">mdi-filter-remove</v-icon>
          ເຄລຍການກັ່ນຕອງ
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :items="menuItems"
      :headers="headers"
      :loading="loading"
      :items-per-page="itemsPerPage"
      class="elevation-1 text-no-wrap"
    >
      <template v-slot:item.created_date="{ item }">
        {{ dayjs(item.created_date).format("DD/MM/YYYY") }}
      </template>

      <template v-slot:item.module_name_la="{ item }">
        {{ item.module.module_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
      </template>

      <template v-slot:item.module="{ item }">
        <div class="text-center">
          <p>
            {{ item.module?.module_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
          </p>
          <p>{{ item.module?.module_Id }}</p>
        </div>
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

      <template v-slot:item.action="{ item }">
        <div class="d-flex justify-center">
          <v-btn
            icon
            variant="text"
            color="primary"
            @click="viewMenuDetails(item.menu_id)"
          >
            <v-icon>mdi-eye-outline</v-icon>
            <v-tooltip activator="parent" location="top">
              ເບິ່ງລາຍລະອຽດ
            </v-tooltip>
          </v-btn>

          <v-btn
            icon
            variant="text"
            color="info"
            @click="editMenu(item.menu_id)"
          >
            <v-icon>mdi-pen</v-icon>
            <v-tooltip activator="parent" location="top"> ແກ້ໄຂ </v-tooltip>
          </v-btn>

          <v-btn
            icon
            variant="text"
            color="error"
            @click="onDeleteMenu(item.menu_id)"
          >
            <v-icon>mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top"> ລົບ </v-tooltip>
          </v-btn>
        </div>
      </template>

      <template v-slot:no-data>
        <v-alert
          type="info"
          title="ບໍ່ມີຂໍ້ມູນ"
          text="ຍັງບໍ່ມີຂໍ້ມູນເມນູໃນຂະນະນີ້"
        ></v-alert>
      </template>
    </v-data-table>
  </v-col>
</template>