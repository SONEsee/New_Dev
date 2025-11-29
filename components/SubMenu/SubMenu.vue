<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch } from "vue";
import { useRolePermissions } from "@/composables/useRolePermissions";
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
        `api/sub-menus/${id}/authorize/`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await subMenuStore.GetMenuSubMenu();

        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ອະນຸມັດຜູ້ໃຊ້ງານແລ້ວ",
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
      } else {
      }
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
        `api/sub-menus/${id}/unauthorize/`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await subMenuStore.GetMenuSubMenu();

        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ຍົກເລີກອະນຸມັດຜູ້ໃຊ້ງານແລ້ວ",
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
      text: "ບໍ່ສາມາດອະນຸມັດຜູ້ໃຊ້ງານໄດ້",
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
const role1 = computed(() => {
  return roleStore.responst_data_detail;
});
const role = computed(() => {
  return roleStore.responst_data_detail;
});

const selecteMainMenu = ref<any | null>(null);

const SELECTED_MAINMENU_KEY = "selected_mainmenu_filter";
const updatRecodeStatus = async (sub_menu_id: string) => {
  try {
    await subMenuStore.updateAdproveStatus(sub_menu_id);
    await subMenuStore.GetMenuSubMenu();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};
const updatRecodeStatusof = async (sub_menu_id: string) => {
  try {
    await subMenuStore.updateAdproveStatusof(sub_menu_id);
    await subMenuStore.GetMenuSubMenu();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};
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
      subMenuStore.query_submenu_filter.data.menu_id =
        newValue?.menu_id || null;
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

// const menuItems = computed(() => {
//   return subMenuStore.respone_main_menu_data || [];
// });
const menuItems = computed(() => {
  const data = subMenuStore.respone_main_menu_data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const loadDataAndApplyFilter = async () => {
  try {
    await Promise.all([
      subMenuStore.GetMenuSubMenu(),
      subMenuStore.GetMainMenu(),
    ]);

    loadSavedMainMenuSelection();

    if (selecteMainMenu.value) {
      subMenuStore.query_submenu_filter.data.menu_id =
        selecteMainMenu.value.menu_id;
      await subMenuStore.GetMenuSubMenu();
    }
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
};
const route = useRoute();
const sub_menu_id = route.query.sub_menu_id as string;
onMounted(async () => {
  initializeRole(sub_menu_id);
  roleStore.GetRoleDetail();
  await loadDataAndApplyFilter();
});

const onDeleteType = async (sub_menu_id: string) => {
  await subMenuStore.DeleteSubMenu(sub_menu_id);
  subMenuStore.GetMenuSubMenu();
};

const title = "ຂໍ້ມູນເມນູຍ່ອຍ";
const header = computed(() => {
  return [
    {
      title: "ລະຫັດ",
      value: "sub_menu_id",
      key: "sub_menu_id",
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
      value: "sub_menu_name_la",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-h6",
      cellClass: "text-wrap",
    },
    {
      title: "ຊື່ເມນູພາສາອັງກິດ",
      value: "sub_menu_name_en",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-subtitle-1",
    },
    {
      title: "ລຳດັບ",
      value: "sub_menu_order",
      align: "center",
      sortable: true,
      filterable: false,
      class: "text-center",
      cellClass: "text-center font-weight-bold",
    },
    {
      title: "ເມນູຫຼັກ",
      value: "menu_id",
      align: "center",
      sortable: true,
      filterable: true,
      sort: (a: any, b: any) => {
        return a.menu_id.localeCompare(b.menu_id);
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
            width: "10px",
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
            value: "weiw",
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
      width: "50px",
    },
    {
      title: "ລົບ",
      value: "delete",
      align: "center",
      sortable: false,
      filterable: false,
      class: "text-center",
      cellClass: "text-center",
      width: "10px",
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
            width: "10px",
          },
        ]
      : []),
  ];
}) as any;

const goToCreateSubMenu = () => {
  if (selecteMainMenu.value && selecteMainMenu.value.menu_id) {
    goPath(`/submenu/create?menu_id=${selecteMainMenu.value.menu_id}`);
  } else {
    goPath("/submenu/create");
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
const displayMainmuenu = (item: any) => {
  if (!item || !item.menu_id || !item.sub_menu_name_la) {
    return "ທັງໝົດ";
  }
  return `${item.menu_name_la}-${item.menu_id}`;
};
</script>

<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />

    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="3">
          <div class="d-flex">
            <v-btn color="primary" @click="goToCreateSubMenu()" v-if="canAdd"
              ><v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດ</v-btn
            >
          </div>
        </v-col>
        <!-- <pre>{{ menuItems }}</pre> -->
        <v-col cols="12" md="7" class="text-no-wrap">
          <v-autocomplete
            width=""
            v-model="selecteMainMenu"
            density="compact"
            label="ເລືອກເມນູຫຼັກ"
            :items="menuItems"
            item-value="menu_id"
            item-title="menu_name_la"
            variant="outlined"
            clearable
            placeholder="ເລືອກເມນູຫຼັກ"
            return-object
            :loading="subMenuStore.isloading"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :title="`${item.raw.menu_name_la}-${item.raw.menu_id}`"
              >
              <template v-slot:prepend>
                <v-avatar size="small" color="primary">
                  <v-icon>mdi-format-list-bulleted-type</v-icon>
                </v-avatar>
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
            :loading="subMenuStore.isloading"
            block
          >
            <v-icon class="mr-2">mdi-filter-remove</v-icon>
            ເຄລຍການກັ່ນຕອງ
          </v-btn>
        </v-col>
      </v-row>

      <v-data-table :headers="header" :items="res || []" class="text-no-wrap">
        <template v-slot:header.sub_menu_id="{ column }">
          <v-icon start>mdi-identifier</v-icon>
          <b style="color: blue">{{ column.title }}</b>
        </template>

        <template v-slot:header.sub_menu_name_la="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.sub_menu_name_en="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.sub_menu_order="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.menu_id="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.created_date="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.Record_Status="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.edit="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.weiw="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.delete="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>
        <template v-slot:header.confirm="{ column }">
          <b style="color: blue"> {{ column.title }}</b>
        </template>

        <template v-slot:item.created_date="{ item }">
          {{ dayjs(item.created_date).format("DD/MM/YYYY") }}
        </template>
        <template v-slot:item.Record_Status="{ item }">
          <div>
            <v-btn
              v-if="item.Record_Status === 'O'"
              flat
              @click="updatRecodeStatusof(item.sub_menu_id)"
            >
              <v-icon color="info">mdi-toggle-switch</v-icon>
            </v-btn>
            <v-btn
              v-if="item.Record_Status === 'C'"
              flat
              @click="updatRecodeStatus(item.sub_menu_id)"
            >
              <v-icon color="error">mdi-toggle-switch-off-outline</v-icon>
            </v-btn>
          </div>
        </template>
        <template v-slot:item.no="{ item, index }">
          {{ index + 1 }}
        </template>
        <template v-slot:item.menu_id="item" class="text-center">
          <div class="text-center">
            <p>{{ item.item.menu?.menu_name_la || "No Data" }}</p>

            <p>
              {{ item.item.menu?.menu_id || "ບໍ່ມີຂໍ້ມູນ" }}
            </p>
          </div>
        </template>

        <template v-slot:item.confirm="{ item }">
          <div class="d-flex align-center">
            <v-btn
              @click="unupdateAdproveStatus(item.sub_menu_id)"
              class="text-primary"
              v-if="item.Auth_Status === 'A'"
              flat
            >
              <v-icon icon="mdi-toggle-switch" color="primary"></v-icon>
            </v-btn>
            <v-btn
              @click="updateAdproveStatus(item.sub_menu_id)"
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

        <template v-slot:item.weiw="{ item }">
          <v-btn
            small
            flat
            class="text-primary"
            icon="mdi-eye-outline"
            @click="goPath(`/submenu/detail?sub_menu_id=${item.sub_menu_id}`)"
          />
        </template>
        <template v-slot:item.edit="{ item }">
          <v-btn
            small
            flat
            class="text-info"
            icon="mdi-pen"
            @click="goPath(`/submenu/edit?sub_menu_id=${item.sub_menu_id}`)"
          />
        </template>
        <template v-slot:item.delete="{ item }">
          <v-btn
            small
            flat
            class="text-error"
            icon="mdi-delete-outline"
            @click="onDeleteType(item.sub_menu_id)"
          />
        </template>
      </v-data-table>
    </v-col>
  </div>
</template>
