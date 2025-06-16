<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch } from "vue";
import { useRolePermissions } from "@/composables/useRolePermissions";

const isUpdatingStatus = ref(false);
const updateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;

    const res = await axios.post(
      `api/sub-menus/${id}/set_stt_submenu/`,
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
      await subMenuStore.GetMenuSubMenu();

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
const toggleUserStatus = async (res: any) => {
  try {
    const result = await CallSwal({
      icon: "question",
      title: "ຢືນຢັນການອະນຸມັດ",
      text: `ທ່ານຕ້ອງການອະນຸມັດຜູ້ໃຊ້ງານ "${res.sub_menu_name_la}" ບໍ?`,
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
const {
  canEdit,
  canDelete,
  canView,
  canAdd,
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
      subMenuStore.query_submenu_filter.data.menu_id =
        selecteMainMenu.value.menu_id;
      await subMenuStore.GetMenuSubMenu();
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

const onDeleteType = async (sub_menu_id: string) => {
  await subMenuStore.DeleteSubMenu(sub_menu_id);
  subMenuStore.GetMenuSubMenu();
};

const title = "ຂໍ້ມູນເມນູຍ່ອຍ";
const header = [
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

    // Custom sort function
    sort: (a, b) => {
      return a.menu_id.localeCompare(b.menu_id);
    },
  },

  {
    title: "ສະຖານະການໃຊ້ງານ",
    value: "is_active",
    align: "center",
    sortable: true,
    filterable: true,

    class: "text-center",
    cellClass: "text-center",
    // Custom filter function
    filter: (value, query, item) => {
      if (!query) return true;
      const statusText = value === "Y" ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ";
      return statusText.includes(query);
    },
  },

  {
    title: "ມື້ສ້າງຂໍ້ມູນ",
    value: "created_date",
    align: "center",
    sortable: true,
    filterable: false,

    class: "text-center",
    // Custom sort for dates
    // sort: (a, b) => {
    //   return new Date(a.created_date) - new Date(b.created_date);
    // },
  },

  {
    title: "ອະນຸມັດ",
    value: "confirm",
    align: "center",
    sortable: false,
    filterable: false,

    class: "text-center",
    cellClass: "text-center",
    fixed: true,
  },
  {
    title: "ຈັດການ",
    value: "action",
    align: "center",
    sortable: false,
    filterable: false,

    class: "text-center",
    cellClass: "text-center",
    fixed: true,
  },
];

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
</script>

<template>
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

      <v-col cols="12" md="7" class="text-no-wrap">
        <v-autocomplete
          width=""
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

    <v-data-table :headers="header" :items="res || []" class="text-no-wrap">
      <template v-slot:header.confirm="{ column }">
        <b> {{ column.title }}</b>
      </template>
      <template v-slot:header.sub_menu_id="{ column }">
        <v-icon start>mdi-identifier</v-icon>
        <b>{{ column.title }}</b>
      </template>

      <template v-slot:header.sub_menu_name_la="{ column }">
        <b> {{ column.title }}</b>
      </template>
      <template v-slot:header.sub_menu_name_en="{ column }">
        <b> {{ column.title }}</b>
      </template>
      <template v-slot:header.sub_menu_order="{ column }">
        <b> {{ column.title }}</b>
      </template>
      <template v-slot:header.menu_id="{ column }">
        <b> {{ column.title }}</b>
      </template>
      <template v-slot:header.created_date="{ column }">
        <b> {{ column.title }}</b>
      </template>
      <template v-slot:header.is_active="{ column }">
        <b> {{ column.title }}</b>
      </template>
      <template v-slot:header.action="{ column }">
        <b> {{ column.title }}</b>
      </template>

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
          <p>{{ item.item.menu?.menu_name_la || "No Data" }}</p>

          <p>
            {{ item.item.menu?.menu_id || "ບໍ່ມີຂໍ້ມູນ" }}
          </p>
        </div>
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
        <v-btn
          v-if="(role as any)?.[0]?.View_Detail === 0 && item.is_active === 'N'"
          small
          flat
          class="text-primary"
          icon="mdi-toggle-switch-off-outline"
          @click="goPath(`#`)"
        />
        <v-btn
          v-if="canView"
          small
          flat
          class="text-primary"
          icon="mdi-eye-outline"
          @click="goPath(`/submenu/detail?sub_menu_id=${item.sub_menu_id}`)"
        />
        <v-btn
          v-if="canEdit"
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/submenu/edit?sub_menu_id=${item.sub_menu_id}`)"
        />
        <v-btn
          v-if="canDelete"
          small
          flat
          class="text-error"
          icon="mdi-delete-outline"
          @click="onDeleteType(item.sub_menu_id)"
        />
      </template>
    </v-data-table>
  </v-col>
</template>
