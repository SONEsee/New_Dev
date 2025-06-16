<script setup lang="ts">
import { ref, computed, onMounted, watch, onActivated } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { useMenuStore } from "@/stores/menu";
const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canAuthorize,
  hasPermission,
  initializeRole,

} = useRolePermissions();
const moduleStore = ModulesStore();
const selectedModule = ref<any | null>(null);
const roleStore = RoleStore();
const role1 = computed(() => {
  return roleStore.responst_data_detail;
});
const isUpdatingStatus = ref(false);
const updateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;

    const res = await axios.post(
      `api/users/${id}/authorize/`,
      {},
      {
        // ເພີ່ມ {} ສຳລັບ body
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (res.status === 200) {
      // ສຳເລັດ - refresh data
      await agencyStore.GetUser();

      await CallSwal({
        icon: "success",
        title: "ສຳເລັດ",
        text: "ອະນຸມັດຜູ້ໃຊ້ງານແລ້ວ",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error updating approve status:", error);

    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດອະນຸມັດຜູ້ໃຊ້ງານໄດ້",
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

// ຫຼື ຖ້າຢາກໃຫ້ມີ confirmation dialog
const toggleUserStatus = async (user: any) => {
  try {
    const result = await CallSwal({
      icon: "question",
      title: "ຢືນຢັນການອະນຸມັດ",
      text: `ທ່ານຕ້ອງການອະນຸມັດຜູ້ໃຊ້ງານ "${user.user_name}" ບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ອະນຸມັດ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#4CAF50",
    });

    if (result.isConfirmed) {
      await updateAdproveStatus(user.user_id);
    }
  } catch (error) {
    console.error("Error in toggleUserStatus:", error);
  }
};
const SELECTED_MODULE_KEY = "selected_module_filter";


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


watch(
  selectedModule,
  async (newValue) => {
    saveModuleSelection(newValue);
    
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
  
  await moduleStore.getModule();


  loadSavedModuleSelection();

  
  if (selectedModule.value) {
    menuStore.query_menu_filter.data.module_Id = selectedModule.value.module_Id;
  } else {
    
    menuStore.query_menu_filter.data.module_Id = null;
  }

  // Get menu data
  await menuStore.GetMainMenu();
};

onMounted(async () => {
  await loadDataAndApplyFilter();
  initializeRole();
  roleStore.GetRoleDetail();
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
  { title: "ອະນຸມັດ", key: "confirm", sortable: false, align: "center" },
  { title: "ຈັດການ", key: "action", sortable: false, align: "center" },
];

const page = ref(1);
const itemsPerPage = ref(10);
const loading = computed(() => menuStore.isloading);

const goToCreateMenu = () => {
  
  if (selectedModule.value && selectedModule.value.module_Id) {
    router.push({
      path: "/menu/create",
      query: {
        module_id: selectedModule.value.module_Id,
      },
    });
  } else {
    
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


defineExpose({
  clearSavedSelection,
});
</script>

<template class="">
  <div class="pa-5">
  <GlobalTextTitleLine :title="title" />

  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="3">
        <div class="d-flex mb-2">
          <v-btn color="primary" @click="goToCreateMenu" v-if="canAdd">
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

 <template v-slot:item.confirm="{ item }">
  <div class="d-flex align-center">
    <v-btn
      v-if="(role1 as any)?.[0]?.Auth_Detail === 1"
      :color="item.is_active === 'Y' ? 'success' : 'warning'"
      :icon="
        item.is_active === 'Y'
          ? 'mdi-check-circle'
          : 'mdi-toggle-switch-off-outline'
      "
      variant="text"
      size="small"
      :loading="isUpdatingStatus"
      :disabled="item.is_active === 'Y'"
      @click="updateAdproveStatus(item.sub_menu_id)"
      :class="{
        'disabled-btn': item.is_active === 'Y'
      }"
      :title="item.is_active === 'Y' ? 'ອະນຸມັດແລ້ວ' : 'ຄລິກເພື່ອອະນຸມັດ'"
    />
    
    <v-fade-transition>
      <v-icon
        v-if="item.is_active === 'Y'"
        color="success"
        size="small"
        class="ml-2"
      >
        mdi-shield-check
      </v-icon>
    </v-fade-transition>
  </div>
</template>




      <template v-slot:item.action="{ item }">
        <div class="d-flex justify-center">
          <v-btn
          v-if="canView"
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
          v-if="canEdit"
            icon
            variant="text"
            color="info"
            @click="editMenu(item.menu_id)"
          >
            <v-icon>mdi-pen</v-icon>
            <v-tooltip activator="parent" location="top"> ແກ້ໄຂ </v-tooltip>
          </v-btn>

          <v-btn
          v-if="canDelete"
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
  </v-col></div>
</template>