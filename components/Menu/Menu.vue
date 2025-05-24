<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { useMenuStore } from "@/stores/menu";

const title = "ຂໍ້ມູນເມນູຫຼັກ";

const router = useRouter();
const menuStore = useMenuStore();

const menuItems = computed(() => {
  return menuStore.respone_main_menu_data || [];
});

const headers = [
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

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />

    <v-col cols="12">
      <div class="d-flex justify-end mb-2">
        <v-btn color="primary" @click="goToCreateMenu">
          <v-icon icon="mdi-plus" start></v-icon>
          ເພີ່ມຂໍ້ມູນເມນູ
        </v-btn>
      </div>

      <v-data-table
        :items="menuItems"
        :headers="headers"
        :loading="loading"
        :items-per-page="itemsPerPage"
        class="elevation-1"
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
  </v-container>
</template>
