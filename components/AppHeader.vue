<template>
  <v-app-bar
    :elevation="2"
    class="d-flex align-center"
    :style="{
      background: 'linear-gradient(135deg, #c58c20 0%, #616161 100%)',
      color: 'white',
      height: '70px',
    }"
  >
    <v-app-bar-nav-icon
      @click="drawer = !drawer"
      style="color: blue; background-color: blanchedalmond; flex-shrink: 0"
    ></v-app-bar-nav-icon>

    <v-app-bar-title class="text-center flex-grow-1">
      ລະບົບບັນຊີ ບໍລິສັດລັດ ບໍລິຫານໜີ້ ແລະ ຊັບສິນ ຈຳກັດຜູ້ດຽວ (SAMC'S Accounting
      System)
    </v-app-bar-title>

    <v-spacer></v-spacer>
    <v-chip color="#ECEFF1"
      ><h5 class="mr-5">ສິດການເຂົ້ານຳໃຊ້: {{ role }}</h5></v-chip
    >

    <v-menu min-width="200px" rounded>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" style="flex-shrink: 0">
          <v-avatar class="pa-3,mr-3" color="#BDBDBD" size="large">
            <span class="text-h5" v-if="user">
              <v-icon
                icon="mdi-account-circle-outline"
                color="#c58c20"
              ></v-icon>
            </span>
            <span class="text-h5" v-else>
              <v-icon
                icon="mdi-account-circle-outline"
                color="#fdfdf5"
              ></v-icon>
            </span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-card-text>
          <div class="mx-auto text-center">
            <v-avatar color="brown">
              <span class="text-h5" v-if="user">{{ user }}</span>
              <span class="text-h5" v-else>
                <v-icon icon="mdi-account-circle-outline"></v-icon>
              </span>
            </v-avatar>
            <h3>ຊື່ຜູ້ໃຊ້ :{{ username }}</h3>
            <p class="text-caption mt-1">ອີເມວ: {{ email }}</p>
            <p class="text-caption mt-1">ພະແນກ: {{ department }}</p>
            <v-divider class="my-3"></v-divider>
            <v-btn variant="text" rounded> ແກ້ໄຂຂໍ້ມູນສວນຕົວ </v-btn>
            <v-divider class="my-3" color="#c58c20"></v-divider>
            <v-btn variant="text" rounded @click="onLogout">
              ອອກຈາກລະບົບ
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>

  <v-navigation-drawer
    class="mt-1"
    v-model="drawer"
    permanent
    :rail="rail"
    order="1"
    :style="{ background: '#FAFAFA', borderColor: '#c58c20' }"
  >
    <v-list nav density="comfortable" style="color: black; padding: 0">
      <template v-if="isLoading">
        <v-list-subheader
          style="color: #cfd8dc; padding-left: 0px"
          v-show="!rail"
          >ກຳລັງໂຫຼດ...</v-list-subheader
        >
        <v-list-item
          prepend-icon="mdi-loading mdi-spin"
          :title="rail ? '' : 'ກຳລັງໂຫຼດຂໍ້ມູນເມນູ...'"
          disabled
          variant="plain"
          class="px-0"
        ></v-list-item>
      </template>

      <template v-else-if="error">
        <v-list-subheader
          style="color: #c58c20; padding-left: 0px"
          v-show="!rail"
          >ຂໍ້ຜິດພາດ</v-list-subheader
        >
        <v-list-item
          prepend-icon="mdi-alert-circle"
          :title="rail ? '' : 'ມີຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'"
          disabled
          variant="plain"
          class="px-0"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-refresh"
          :title="rail ? '' : 'ລອງໃໝ່'"
          @click="retryLoadMenu"
          variant="tonal"
          color="primary"
          class="px-0"
        ></v-list-item>
      </template>

      <template v-else-if="responeMenuData && responeMenuData.length > 0">
        <template
          v-for="(module, moduleIndex) in responeMenuData"
          :key="`module-${module.module_Id}`"
        >
          <v-list-subheader
            style="
              color: #000;
              font-weight: bold;
              padding-left: 0px;
              background-color: #c58c20;
            "
            v-show="!rail"
            class="text-white"
          >
            <v-icon
              :icon="convertIcon(module.module_icon)"
              class="mr-2"
            ></v-icon>
            {{ module.module_name_la }}
          </v-list-subheader>

          <template
            v-for="(mainMenu, mainMenuIndex) in module.main_menus"
            :key="`main-${module.module_Id}-${mainMenu.menu_id}`"
          >
            <template
              v-if="mainMenu.sub_menus && mainMenu.sub_menus.length > 0"
            >
              <v-list-group
                :value="mainMenu.menu_id"
                style="background-color: #FAFAFA"
              >
                <template v-slot:activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :prepend-icon="convertIcon(mainMenu.menu_icon)"
                    :title="rail ? '' : mainMenu.menu_name_la"
                    variant="tonal"
                    color="info"
                    style="margin-bottom: 2px"
                    class="px-0"
                  ></v-list-item>
                </template>

                <template v-if="!rail">
                  <!-- <v-list-item
                    v-for="(subMenu, subMenuIndex) in mainMenu.sub_menus"
                    :key="`sub-${module.module_Id}-${mainMenu.menu_id}-${subMenu.sub_menu_id}`"
                    :value="subMenu.sub_menu_id"
                    :title="subMenu.sub_menu_name_la"
                    :prepend-icon="convertIcon(subMenu.sub_menu_icon)"
                    :to="{
                      path: cleanUrl(subMenu.sub_menu_urls),
                      query: { sub_menu_id: subMenu.sub_menu_id },
                    }"
                    :active="route.path === cleanUrl(subMenu.sub_menu_urls)"
                    variant="plain"
                    color="accent"
                      style="margin-bottom: 10px; background-color: #FAFAFA; font-weight: 700 !important; font-family: inherit;"

                    class="sub-menu-item"
                  /> -->
                  <v-list-item
  v-for="(subMenu, subMenuIndex) in mainMenu.sub_menus"
  :key="`sub-${module.module_Id}-${mainMenu.menu_id}-${subMenu.sub_menu_id}`"
  :value="subMenu.sub_menu_id"
  :title="subMenu.sub_menu_name_la"
  :prepend-icon="convertIcon(subMenu.sub_menu_icon)"
  :to="subMenu.sub_menu_urls === '#' ? undefined : {
    path: cleanUrl(subMenu.sub_menu_urls),
    query: { sub_menu_id: subMenu.sub_menu_id },
  }"
  :active="route.path === cleanUrl(subMenu.sub_menu_urls)"
  variant="plain"
  color="accent"
  style="margin-bottom: 10px; background-color: #FAFAFA; font-weight: 700 !important; font-family: inherit;"
  class="sub-menu-item"
  @click="handleMenuClick(subMenu)"
/>
                </template>
              </v-list-group>
            </template>

            <template v-else>
              <v-list-item
                :prepend-icon="convertIcon(mainMenu.menu_icon)"
                :title="rail ? '' : mainMenu.menu_name_la"
                :to="mainMenu.menu_url ? cleanUrl(mainMenu.menu_url) : '#'"
                variant="tonal"
                color="#c58c20"
                style="margin-bottom: 2px ;font-weight: bold;"
                class="px-0"
              ></v-list-item>
            </template>
          </template>

          <v-divider
            v-if="moduleIndex < responeMenuData.length - 1 && !rail"
            class="my-3 mx-0"
            color="#c58c20"
            opacity="0.3"
          ></v-divider>
        </template>
      </template>

      <template v-else>
        <v-list-subheader
          style="color: #c58c20; padding-left: 0px"
          v-show="!rail"
          >ເມນູ</v-list-subheader
        >
        <v-list-item
          prepend-icon="mdi-menu-off"
          :title="rail ? '' : 'ບໍ່ມີຂໍ້ມູນເມນູ'"
          disabled
          variant="plain"
          class="px-0"
        ></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { useMenuStore } from "~/stores/menu";
import axios from "@/helpers/axios";
const roleStore = RoleStore();

const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();
const drawer = ref(true);
const rail = ref(false);
const error = ref(false);
const user = localStorage.getItem("user");
const sub_menu_id = route.query.sub_menu_id as string;
const username = user ? JSON.parse(user).user_name : "ບໍ່ພົບຂໍ້ມູນ";
const email = user ? JSON.parse(user).user_email : "ບໍ່ພົບຂໍ້ມູນ";
const department = user
  ? JSON.parse(user).division?.division_name_la || "ບໍ່ພົບຂໍ້ມູນ"
  : "ບໍ່ພົບຂໍ້ມູນ";
const role = user
  ? JSON.parse(user).role?.role_name_la || "ບໍ່ພົບຂໍ້ມູນ"
  : "ບໍ່ພົບຂໍ້ມູນ";
// const role = user ? JSON.parse(user).role.role_name_la : "ບໍ່ພົບຂໍ້ມູນ";

onMounted(() => {
  roleStore.filter_role_id.query.sub_menu_id = sub_menu_id || "";
});

const getUserIdFromLocalStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    const userData = JSON.parse(userStr);
    return userData.user_id || null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
};

const convertIcon = (icon: string): string => {
  if (!icon) return "mdi-circle-small";

  if (icon.startsWith("mdi-")) return icon;

  const iconMap: Record<string, string> = {
    "mdi-home": "mdi-home",
    "fa-users-cog": "mdi-account-cog",
    "fa-chart-bar": "mdi-chart-bar",
    "fa-cogs": "mdi-cog-transfer",

    "mdi-user": "mdi-account",
    "fa-edit": "mdi-pencil",
    "fa-file-alt": "mdi-file-document",
    "fa-database": "mdi-database",

    "fa-sign-in-alt": "mdi-login",
    "fa-key": "mdi-key",
    "fa-upload": "mdi-upload",
    "fa-check-circle": "mdi-check-circle",
    "fa-user-shield": "mdi-shield-account",
    "fa-users": "mdi-account-group",
    "fa-puzzle-piece": "mdi-puzzle",
    "fa-building": "mdi-domain",
    "fa-id-badge": "mdi-badge-account",
    "fa-bars": "mdi-menu",
    "fa-list": "mdi-format-list-bulleted",
    "fa-file-invoice": "mdi-file-document-outline",
    "fa-book": "mdi-book",
    "fa-bookmark": "mdi-bookmark",
    "fa-money-bill": "mdi-cash-multiple",
  };

  return iconMap[icon] || "mdi-circle-small";
};

const cleanUrl = (url: string): string => {
  if (!url) return "/";

  if (url.includes("/module/user-rule/functions/module/user-rule/functions")) {
    return "/module/user-rule/functions";
  }

  return url.replace(/[\r\n\s]+/g, "").trim();
};

const responeMenuData = computed(() => {
  return menuStore.respone_menu_data;
});

const isLoading = computed(() => {
  return menuStore.isloading;
});

const loadMenu = async (userId: string) => {
  try {
    error.value = false;
    console.log("ກຳລັງດຶງຂໍ້ມູນເມນູສຳລັບຜູ້ໃຊ້:", userId);
    await menuStore.Getmenu(userId);

    if (
      !responeMenuData.value ||
      (Array.isArray(responeMenuData.value) &&
        responeMenuData.value.length === 0)
    ) {
      console.warn("ບໍ່ພົບຂໍ້ມູນເມນູ");
      error.value = true;
    }
  } catch (err) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນເມນູ:", err);
    error.value = true;
  }
};

const retryLoadMenu = async () => {
  const user_id = getUserIdFromLocalStorage();
  const user_code = route.query.id as string | undefined;
  const userIdToUse = user_code || user_id;

  if (userIdToUse) {
    await loadMenu(userIdToUse);
  } else {
    console.error("ບໍ່ພົບລະຫັດຜູ້ໃຊ້");
    error.value = true;
  }
};

onMounted(async () => {
  const user_id = getUserIdFromLocalStorage();
  const user_code = route.query.id as string | undefined;
  const userIdToUse = user_code || user_id;

  if (userIdToUse) {
    await loadMenu(userIdToUse);
  } else {
    console.error("ບໍ່ພົບລະຫັດຜູ້ໃຊ້");
    error.value = true;
  }
});
const onLogout = async () => {
  try {
    let refreshToken =
      localStorage.getItem("refresh") ||
      localStorage.getItem("refreshToken") ||
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        refreshToken = user.refresh || user.refreshToken || user.refresh_token;
      }
    }

    console.log("Found refresh token:", refreshToken);

    if (refreshToken) {
      await axios.post(
        `/api/logout/`,
        {
          refresh: refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    clearLocalStorage();
    router.push("/login");
  } catch (err) {
    console.error("Error during logout:", err.response?.data);
    clearLocalStorage();
    window.location.href = "/login";
  }
};

const clearLocalStorage = () => {
  if (typeof window !== "undefined") {
    localStorage.clear();
  }
};
// const handleMenuClick = (subMenu:any) => {
//   if (subMenu.sub_menu_urls === '#') {
//     CallSwal({
//       title: "ຂໍອະໄພ",
//       text: "ໜ້ານີ້ກຳລັງພັດທະນາຢູ",
//       icon: "info",
//       confirmButtonText: "OK",
//     }); 
//   }
// }
const handleMenuClick = (subMenu: any, event?: Event) => {
  if (subMenu.sub_menu_urls === '#') {
    event?.preventDefault();
    CallSwal({
      title: "ຂໍອະໄພ",
       text: `ໜ້າ "${subMenu.sub_menu_name_la}" ກຳລັງພັດທະນາຢູ....`,
      icon: "info",
      confirmButtonText: "OK",
    });
  }
}
</script>
<style>
.v-list-item--active {
  flex: auto;
  border-color: #c58c20 !important;
  background-color: rgba(197, 140, 32, 0.1) !important;
  font-weight: bold;
}
.v-list-item {
  color: #c58c20 !important;
  flex: auto;
  font-weight: 700 !important;
  
}
.v-icon {
  color: #c58c20;
}

.v-list-subheader {
  font-weight: bold !important;
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.v-list-item:hover {
  background-color: rgba(197, 140, 32, 0.08) !important;
}

.v-list-item[variant="tonal"]:hover {
  background-color: rgba(197, 140, 32, 0.15) !important;
}

.v-list-group {
  --v-list-group-background-color: transparent;
}

.v-list-group__items {
  --v-list-item-base-color: #c58c20;
}

.v-list-group__items .v-list-item {
  border-left: 2px solid rgba(239, 237, 234, 0.3);
  margin-left: 0px !important;
  padding-left: 8px !important;
}

.v-list-group__items .v-list-item--active {
  border-left-color: #c58c20 !important;
  background-color: rgba(197, 140, 32, 0.1) !important;
}

.v-list-item {
  padding-left: 0 !important;
  padding-right: 0 !important;
  font-weight: 700 !important;
}

.v-list-item__prepend {
  margin-inline-start: 0 !important;
  font-weight: 700 !important;
}

.v-list-item__content {
  margin-left: 0 !important;
  font-weight: 700 !important;
}

/* ເພີ່ມ CSS ນີ້ໃນສ່ວນທ້າຍຂອງ <style> */

/* ເຮັດໃຫ້ submenu ເປັນໂຕເຂັ້ມ */
.sub-menu-item {
  border-left: 2px solid rgba(41, 34, 24, 0.425) !important;
  margin-left: 0px !important;
  padding-left: 8px !important;
  font-weight: 700 !important; /* ໃຊ້ 700 ແທນ bold ເພື່ອຄວາມແນ່ນອນ */
}

.sub-menu-item .v-list-item__content {
  font-weight: 700 !important;
}

.sub-menu-item .v-list-item-title {
  font-weight: 700 !important;
}

.sub-menu-item.v-list-item--active {
  border-left-color: #f2f7f8 !important;
  background-color: rgba(250, 248, 244, 0.596) !important;
  font-weight: 700 !important;
}

.sub-menu-item.v-list-item--active .v-list-item__content {
  font-weight: 700 !important;
}

.sub-menu-item.v-list-item--active .v-list-item-title {
  font-weight: 700 !important;
}

/* ເພື່ອຮັບປະກັນວ່າ submenu ທຸກສະພາບເປັນໂຕເຂັ້ມ */
.v-list-group__items .v-list-item {
  font-weight: 700 !important;
}

.v-list-group__items .v-list-item .v-list-item__content {
  font-weight: 700 !important;
}

.v-list-group__items .v-list-item .v-list-item-title {
  font-weight: 700 !important;
}

</style>
