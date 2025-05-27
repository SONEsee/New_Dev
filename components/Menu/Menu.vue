<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { useMenuStore } from "@/stores/menu";
const moduleStore = ModulesStore();
const selectedModule = ref<any | null>(null);
const searchMenu = async () => {
  try {
    menuStore.query_menu_filter.data.module_Id =
      selectedModule.value?.module_Id || null;
    await menuStore.GetMainMenu();
  } catch (error) {
    console.error("Failed to search menu:", error);
  }
};

const clearFilters = () => {
  selectedModule.value = null;
  menuStore.query_menu_filter.data.module_Id = null;
  menuStore.GetMainMenu();
};
onMounted(() => {
  menuStore.GetMainMenu();
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
  { title: "ລຳດັບເມນູ", key: "menu_order", sortable: true },
  { title: "ຊື່ເມນູພາສາລາວ", key: "menu_name_la", sortable: true },
  { title: "ຊື່ເມນູພາສາອັງກິດ", key: "menu_name_en", sortable: true },
  { title: "ໄອຄອນ", key: "menu_icon", sortable: false },
  { title: "ສະຖານະການໃຊ້ງານ", key: "is_active", sortable: true },
  { title: "ວັນທີສ້າງ", key: "created_date", sortable: true },
  { title: "ຈັດການ", key: "action", sortable: false },
];

const page = ref(1);
const itemsPerPage = ref(10);
const loading = computed(() => menuStore.isloading);

onMounted(() => {
  menuStore.GetMainMenu();
  moduleStore.getModule();
});

const goToCreateMenu = () => {
  router.push("/menu/create");
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

</script>

<template class="">
  
    <GlobalTextTitleLine :title="title" />

    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="3"
          ><div class="d-flex mb-2">
            <v-btn color="primary" @click="goToCreateMenu">
              <v-icon icon="mdi-plus" start></v-icon>
              ເພີ່ມຂໍ້ມູນເມນູ
            </v-btn>
          </div></v-col
        >
        <v-col cols="12" md="2"></v-col>
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

        <v-col cols="12" md="3">
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="flat"
              @click="searchMenu"
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

        <template v-slot:item.is_active="{ item }">
          <v-chip
            :color="item.is_active === 'true' ? 'green' : 'red'"
            size="small"
            label
          >
            {{ item.is_active === "true" ? "ໃຊ້ງານ" : "ບໍ່ໃຊ້ງານ" }}
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
