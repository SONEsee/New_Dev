<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch, onActivated } from "vue";
import { useRouter } from "vue-router";
import { useRolePermissions } from "@/composables/useRolePermissions";
import { useMenuStore } from "@/stores/menu";
import axios from "@/helpers/axios";

const isUpdatingStatus = ref(false);

const updateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງອະນຸມັດເມນູ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/main-menus/${id}/authorize/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await menuStore.GetMainMenu();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ອະນຸມັດເມນູແລ້ວ",
          timer: 2000,
          showConfirmButton: false,
        });
      }
      if (res.status === 406) {
        await CallSwal({
          icon: "warning",
          title: "ບໍ່ສາມາດອະນຸມັດໄດ້",
          text: "ບໍ່ສາມາດເປີດໄດ້ ເນື່ອງຈາກ ຍັງບໍ່ທັນອະນຸມັດ",
        });
      }
    }
  } catch (error) {
    console.error("Error updating approve status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດອະນຸມັດເມນູໄດ້",
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

const unupdateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງຍົກເລີກອະນຸມັດເມນູ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/main-menus/${id}/unauthorize/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await menuStore.GetMainMenu();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ຍົກເລີກອະນຸມັດເມນູແລ້ວ",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  } catch (error) {
    console.error("Error updating approve status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດຍົກເລີກອະນຸມັດເມນູໄດ້",
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canRecordStatus,
  canAuthStatus,
  canAuthorize,
  hasPermission,
  initializeRole,
} = useRolePermissions();

const roleStore = RoleStore();
const role = computed(() => {
  return roleStore.responst_data_detail;
});

const moduleStore = ModulesStore();
const selectedModule = ref<any | null>(null);

const SELECTED_MODULE_KEY = "selected_module_filter";

const updatRecodeStatus = async (menu_id: string) => {
  try {
    await menuStore.updateRecordStatusmain(menu_id);
    await menuStore.GetMainMenu();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};

const updatRecodeStatusof = async (menu_id: string) => {
  try {
    await menuStore.updateRecordStatusOffmain(menu_id);
    await menuStore.GetMainMenu();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};

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
  try {
    await Promise.all([menuStore.GetMainMenu(), moduleStore.getModule()]);

    loadSavedModuleSelection();

    if (selectedModule.value) {
      menuStore.query_menu_filter.data.module_Id =
        selectedModule.value.module_Id;
      await menuStore.GetMainMenu();
    }
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
};

onMounted(async () => {
  initializeRole();
  roleStore.GetRoleDetail();
  await loadDataAndApplyFilter();
});

onActivated(async () => {
  await loadDataAndApplyFilter();
});

const module = computed(() => {
  return moduleStore.response_data_module || [];
});

const router = useRouter();
const menuStore = useMenuStore();

const menuItems = computed(() => {
  const data = menuStore.respone_main_menu_data || null;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});

const onDeleteMenu = async (menu_id: string) => {
  await menuStore.DeleteMenu(menu_id);
  menuStore.GetMainMenu();
};

const title = "ຂໍ້ມູນເມນູຫຼັກ";

const header = computed(() => {
  return [
    {
      title: "ລະຫັດ",
      value: "menu_id",
      key: "menu_id",
      align: "start",
      sortable: true,
      filterable: true,
      groupable: false,
      divider: false,
      class: "text-primary font-weight-bold",
      cellClass: "pa-2",
    },
    {
      title: "ຊື່ເມນູພາສາລາວ",
      value: "menu_name_la",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-h6",
      cellClass: "text-wrap",
    },
    {
      title: "ຊື່ເມນູພາສາອັງກິດ",
      value: "menu_name_en",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-subtitle-1",
    },
    {
      title: "ລຳດັບ",
      value: "menu_order",
      align: "center",
      sortable: true,
      filterable: false,
      class: "text-center",
      cellClass: "text-center font-weight-bold",
    },
    {
      title: "ໂມດູນ",
      value: "module_Id",
      align: "center",
      sortable: true,
      filterable: true,
      sort: (a: any, b: any) => {
        return a.module_Id.localeCompare(b.module_Id);
      },
    },
    {
      title: "ມື້ສ້າງຂໍ້ມູນ",
      value: "created_date",
      align: "center",
      sortable: true,
      filterable: false,
      class: "text-center",
    },
    ...(canRecordStatus.value
      ? [
          {
            title: "ສະຖານະ",
            value: "Record_Status",
            align: "center",
            sortable: true,
            filterable: true,
            width: "120px",
            class: "text-center",
            cellClass: "text-center",
            filter: (value: any, query: any, item: any) => {
              if (!query) return true;
              const statusText = value === "Y" ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ";
              return statusText.includes(query);
            },
          },
        ]
      : []),
    ...(canView.value
      ? [
          {
            title: "ເບິ່ງ",
            value: "view",
            align: "center",
            sortable: false,
            filterable: false,
            class: "text-center",
            cellClass: "text-center",
            width: "80px",
          },
        ]
      : []),
    {
      title: "ແກ້ໄຂ",
      value: "edit",
      align: "center",
      sortable: false,
      filterable: false,
      class: "text-center",
      cellClass: "text-center",
      width: "80px",
    },
    {
      title: "ລົບ",
      value: "delete",
      align: "center",
      sortable: false,
      filterable: false,
      class: "text-center",
      cellClass: "text-center",
      width: "80px",
    },
    ...(canAuthorize.value
      ? [
          {
            title: "ອະນຸມັດ",
            value: "confirm",
            align: "center",
            sortable: false,
            filterable: false,
            class: "text-center",
            cellClass: "text-center",
            width: "80px",
          },
        ]
      : []),
  ];
}) as any;

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
const displayName = (item:any)=>{
  if(!item || !item.module_name_la || !item.module_Id){
    return "ທັງໝົດ"
  }
  return `${item.module_name_la} - ${item.module_Id}`
}

const clearSavedSelection = () => {
  localStorage.removeItem(SELECTED_MODULE_KEY);
  selectedModule.value = null;
  menuStore.query_menu_filter.data.module_Id = null;
};

defineExpose({
  clearSavedSelection,
});
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="3">
          <div class="d-flex">
            <v-btn color="primary" @click="goToCreateMenu()" v-if="canAdd">
              <v-icon icon="mdi-plus"></v-icon> ເພີ່ມເມນູຫຼັກ
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" md="7" class="text-no-wrap">
          <v-autocomplete
            v-model="selectedModule"
            density="compact"
            label="ເລືອກໂມດູນ"
            :items="module"
            item-value="module_Id"
            :item-title="displayName"
            variant="outlined"
            clearable
            placeholder="ເລືອກໂມດູນ"
            return-object
            :loading="menuStore.isloading"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.module_name_la}(${item.raw.module_Id})`"
              >
                <template v-slot:prepend>
                  <v-avatar size="small" color="primary"
                    ><v-icon size="small">mdi-package-variant</v-icon></v-avatar
                  >
                </template>
              </v-list-item>
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
        :headers="header"
        :items="menuItems || []"
        class="text-no-wrap"
      >
        <template v-slot:header.menu_id="{ column }">
          <v-icon start>mdi-identifier</v-icon>
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.menu_name_la="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.menu_name_en="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.menu_order="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.module_Id="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.created_date="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.Record_Status="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.edit="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.view="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.delete="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.confirm="{ column }">
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:item.created_date="{ item }">
          {{ dayjs(item.created_date).format("DD/MM/YYYY") }}
        </template>

        <template v-slot:item.Record_Status="{ item }">
          <div>
            <v-btn
              v-if="item.Record_Status === 'O'"
              flat
              @click="updatRecodeStatusof(item.menu_id)"
            >
              <v-icon color="info">mdi-toggle-switch</v-icon>
            </v-btn>
            <v-btn
              v-if="item.Record_Status === 'C'"
              flat
              @click="updatRecodeStatus(item.menu_id)"
            >
              <v-icon color="error">mdi-toggle-switch-off-outline</v-icon>
            </v-btn>
          </div>
        </template>

        <template v-slot:item.no="{ item, index }">
          {{ index + 1 }}
        </template>

        <template v-slot:item.module_Id="item" class="text-center">
          <div class="text-center">
            <p>{{ item.item.module?.module_name_la || "No Data" }}</p>
            <p>{{ item.item.module?.module_Id || "ບໍ່ມີຂໍ້ມູນ" }}</p>
          </div>
        </template>

        <template v-slot:item.confirm="{ item }">
          <div class="d-flex align-center">
            <v-btn
              @click="unupdateAdproveStatus(item.menu_id)"
              class="text-primary"
              v-if="item.Auth_Status === 'A'"
              flat
            >
              <v-icon icon="mdi-toggle-switch" color="primary"></v-icon>
            </v-btn>
            <v-btn
              @click="updateAdproveStatus(item.menu_id)"
              class="text-error"
              v-if="item.Auth_Status === 'U'"
              flat
            >
              <v-icon
                icon="mdi-toggle-switch-off-outline"
                color="error"
              ></v-icon>
            </v-btn>
          </div>
        </template>

        <template v-slot:item.view="{ item }">
          <v-btn
            small
            flat
            class="text-primary"
            icon="mdi-eye-outline"
            @click="goPath(`/menu/detail?menu_id=${item.menu_id}`)"
          />
        </template>

        <template v-slot:item.edit="{ item }">
          <v-btn
            small
            flat
            class="text-info"
            icon="mdi-pen"
            @click="goPath(`/menu/edit?menu_id=${item.menu_id}`)"
          />
        </template>

        <template v-slot:item.delete="{ item }">
          <v-btn
            small
            flat
            class="text-error"
            icon="mdi-delete-outline"
            @click="onDeleteMenu(item.menu_id)"
          />
        </template>
      </v-data-table>
    </v-col>
  </div>
</template>
