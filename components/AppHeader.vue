<template>
  <v-app-bar
    :elevation="2"
    class="d-flex align-center"
    :style="{
      background: 'linear-gradient(135deg, #0D47A1 0%, #BBDEFB 100%)',
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

    <!-- Working Day Status Alert -->
    <v-tooltip bottom>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          @click="checkWorkingDay"
          :loading="loadingWorkingDay"
          class="mr-2"
          style="flex-shrink: 0"
        >
          <v-badge
            :color="isWorkingDay ? 'success' : 'error'"
            :content="isWorkingDay ? '✓' : '!'"
            overlap
          >
            <v-icon
              :color="isWorkingDay ? 'success' : 'error'"
              size="24"
            >
              {{ isWorkingDay ? 'mdi-calendar-check' : 'mdi-calendar-alert' }}
            </v-icon>
          </v-badge>
        </v-btn>
      </template>
      <span>{{ workingDayMessage || 'ກວດສອບວັນເຮັດການ' }}</span>
    </v-tooltip>

    <v-spacer></v-spacer>
    
    <v-chip color="#0D47A1">
      <h5 class="mr-5">ສິດການເຂົ້ານຳໃຊ້: {{ role }}</h5>
    </v-chip>

    <v-menu min-width="200px" rounded>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" style="flex-shrink: 0">
          <v-avatar class="pa-3,mr-3" color="#E3F2FD" size="large">
            <span class="text-h5" v-if="user">
              <v-icon
                icon="mdi-account-circle-outline"
                color="#0D47A1"
              ></v-icon>
            </span>
            <span class="text-h5" v-else>
              <v-icon
                icon="mdi-account-circle-outline"
                color="#0D47A1"
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
            <v-divider class="my-3" color="#0D47A1"></v-divider>
            <v-btn variant="text" rounded @click="onLogout">
              ອອກຈາກລະບົບ
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>

  <!-- Working Day Status Snackbar -->
  <v-snackbar
    v-model="showWorkingDaySnackbar"
    :color="isWorkingDay ? 'success' : 'error'"
    :timeout="5000"
    top
    multi-line
  >
    <v-icon class="mr-2">
      {{ isWorkingDay ? 'mdi-check-circle' : 'mdi-alert-circle' }}
    </v-icon>
    {{ workingDayMessage }}
    
    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="showWorkingDaySnackbar = false"
      >
        ປິດ
      </v-btn>
    </template>
  </v-snackbar>

  <!-- Working Day Status Banner (Optional - shows permanent status) -->
  <v-banner
    v-if="!isWorkingDay && workingDayMessage"
    :color="'error'"
    :icon="'mdi-calendar-alert'"
    lines="one"
    sticky
    class="working-day-banner"
  >
    <v-banner-text>
      {{ workingDayMessage }}
    </v-banner-text>
    
    <template v-slot:actions>
      <v-btn
        variant="text"
        color="white"
        size="small"
        @click="checkWorkingDay"
        :loading="loadingWorkingDay"
      >
        ກວດສອບໃໝ່
      </v-btn>
    </template>
  </v-banner>

  <v-navigation-drawer
    class="mt-2"
    v-model="drawer"
    permanent
    :rail="rail"
    order="1"
    :style="{ background: '#E3F2FD', borderColor: '#0D47A1' }"
  >
    <v-list nav density="comfortable" style="color: black; padding: 0">
      <template v-if="isLoading">
        <v-list-subheader
          style="color: #e3f2fd; padding-left: 0px"
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
          style="color: #0d47a1; padding-left: 0px"
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
          <v-tooltip bottom v-if="isModuleDisabled(module.module_Id)">
            <template v-slot:activator="{ props }">
              <v-list-subheader
                v-bind="props"
                :style="{
                  color: isModuleDisabled(module.module_Id) ? '#999' : '#000',
                  fontWeight: 'bold',
                  paddingLeft: '0px',
                  backgroundColor: isModuleDisabled(module.module_Id) ? '#ccc' : '#0d47a1',
                  opacity: isModuleDisabled(module.module_Id) ? 0.5 : 1
                }"
                v-show="!rail"
                :class="isModuleDisabled(module.module_Id) ? 'text-grey' : 'text-white'"
              >
                <v-icon
                  :icon="convertIcon(module.module_icon)"
                  :color="isModuleDisabled(module.module_Id) ? 'grey' : 'white'"
                  class="mr-2"
                ></v-icon>
                {{ module.module_name_la }}
                <v-icon 
                  v-if="isModuleDisabled(module.module_Id)"
                  icon="mdi-lock"
                  size="small"
                  class="ml-2"
                  color="grey"
                ></v-icon>
              </v-list-subheader>
            </template>
            <span>ບໍ່ສາມາດເຂົ້າໃຊ້ໄດ້ໃນວັນພັກ - {{ workingDayMessage }}</span>
          </v-tooltip>
          
          <v-list-subheader
            v-else
            style="
              color: #000;
              font-weight: bold;
              padding-left: 0px;
              background-color: #0d47a1;
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
              <v-tooltip bottom v-if="isMainMenuDisabled(module)">
                <template v-slot:activator="{ props }">
                  <v-list-group
                    v-bind="props"
                    :value="mainMenu.menu_id"
                    style="background-color: #e3f2fd"
                    :disabled="isMainMenuDisabled(module)"
                  >
                    <template v-slot:activator="{ props: groupProps }">
                      <v-list-item
                        v-bind="groupProps"
                        :prepend-icon="convertIcon(mainMenu.menu_icon)"
                        :title="rail ? '' : mainMenu.menu_name_la"
                        variant="tonal"
                        color="info"
                        style="margin-bottom: 2px"
                        class="px-0"
                        :disabled="isMainMenuDisabled(module)"
                        :style="{
                          opacity: isMainMenuDisabled(module) ? 0.5 : 1,
                          color: isMainMenuDisabled(module) ? '#999' : '#0d47a1'
                        }"
                      >
                        <template v-slot:append v-if="isMainMenuDisabled(module)">
                          <v-icon icon="mdi-lock" size="small" color="grey"></v-icon>
                        </template>
                      </v-list-item>
                    </template>

                    <template v-if="!rail">
                      <v-list-item
                        v-for="(subMenu, subMenuIndex) in mainMenu.sub_menus"
                        :key="`sub-${module.module_Id}-${mainMenu.menu_id}-${subMenu.sub_menu_id}`"
                        :value="subMenu.sub_menu_id"
                        :title="subMenu.sub_menu_name_la"
                        :prepend-icon="convertIcon(subMenu.sub_menu_icon)"
                        variant="plain"
                        color="accent"
                        style="
                          margin-bottom: 10px;
                          background-color: #e3f2fd;
                          font-weight: 700 !important;
                          font-family: inherit;
                          opacity: 0.5;
                          color: #999;
                        "
                        class="sub-menu-item"
                        disabled
                      >
                        <template v-slot:append>
                          <v-icon icon="mdi-lock" size="small" color="grey"></v-icon>
                        </template>
                      </v-list-item>
                    </template>
                  </v-list-group>
                </template>
                <span>ບໍ່ສາມາດເຂົ້າໃຊ້ໄດ້ໃນວັນພັກ - {{ workingDayMessage }}</span>
              </v-tooltip>

              <v-list-group
                v-else
                :value="mainMenu.menu_id"
                style="background-color: #e3f2fd"
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
                  <template v-for="(subMenu, subMenuIndex) in mainMenu.sub_menus" :key="`sub-${module.module_Id}-${mainMenu.menu_id}-${subMenu.sub_menu_id}`">
                    <v-tooltip bottom v-if="isSubMenuDisabled(module)">
                      <template v-slot:activator="{ props }">
                        <v-list-item
                          v-bind="props"
                          :value="subMenu.sub_menu_id"
                          :title="subMenu.sub_menu_name_la"
                          :prepend-icon="convertIcon(subMenu.sub_menu_icon)"
                          variant="plain"
                          color="accent"
                          style="
                            margin-bottom: 10px;
                            background-color: #e3f2fd;
                            font-weight: 700 !important;
                            font-family: inherit;
                            opacity: 0.5;
                            color: #999;
                          "
                          class="sub-menu-item disabled-menu"
                          disabled
                          @click="handleDisabledMenuClick($event)"
                        >
                          <template v-slot:append>
                            <v-icon icon="mdi-lock" size="small" color="grey"></v-icon>
                          </template>
                        </v-list-item>
                      </template>
                      <span>ບໍ່ສາມາດເຂົ້າໃຊ້ໄດ້ໃນວັນພັກ - {{ workingDayMessage }}</span>
                    </v-tooltip>

                    <v-list-item
                      v-else
                      :value="subMenu.sub_menu_id"
                      :title="subMenu.sub_menu_name_la"
                      :prepend-icon="convertIcon(subMenu.sub_menu_icon)"
                      :to="
                        subMenu.sub_menu_urls === '#'
                          ? undefined
                          : {
                              path: cleanUrl(subMenu.sub_menu_urls),
                              query: { sub_menu_id: subMenu.sub_menu_id },
                            }
                      "
                      :active="route.path === cleanUrl(subMenu.sub_menu_urls)"
                      variant="plain"
                      color="accent"
                      style="
                        margin-bottom: 10px;
                        background-color: #e3f2fd;
                        font-weight: 700 !important;
                        font-family: inherit;
                      "
                      class="sub-menu-item"
                      @click="handleMenuClick(subMenu)"
                    />
                  </template>
                </template>
              </v-list-group>
            </template>

            <template v-else>
              <v-tooltip bottom v-if="isMainMenuDisabled(module)">
                <template v-slot:activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :prepend-icon="convertIcon(mainMenu.menu_icon)"
                    :title="rail ? '' : mainMenu.menu_name_la"
                    variant="tonal"
                    color="#0D47A1"
                    style="margin-bottom: 2px; font-weight: bold; opacity: 0.5; color: #999"
                    class="px-0"
                    disabled
                    @click="handleDisabledMenuClick($event)"
                  >
                    <template v-slot:append>
                      <v-icon icon="mdi-lock" size="small" color="grey"></v-icon>
                    </template>
                  </v-list-item>
                </template>
                <span>ບໍ່ສາມາດເຂົ້າໃຊ້ໄດ້ໃນວັນພັກ - {{ workingDayMessage }}</span>
              </v-tooltip>

              <v-list-item
                v-else
                :prepend-icon="convertIcon(mainMenu.menu_icon)"
                :title="rail ? '' : mainMenu.menu_name_la"
                :to="mainMenu.menu_url ? cleanUrl(mainMenu.menu_url) : '#'"
                variant="tonal"
                color="#0D47A1"
                style="margin-bottom: 2px; font-weight: bold"
                class="px-0"
              ></v-list-item>
            </template>
          </template>

          <v-divider
            v-if="moduleIndex < responeMenuData.length - 1 && !rail"
            class="my-3 mx-0"
            color="#0D47A1"
            opacity="0.3"
          ></v-divider>
        </template>
      </template>

      <template v-else>
        <v-list-subheader
          style="color: #0d47a1; padding-left: 0px"
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useMenuStore } from "~/stores/menu";
import axios from "@/helpers/axios";

// Working Day Check Interface
interface WorkingDayResponse {
  available: boolean;
  reason: string;
  bypass_info?: {
    working_day_bypassed: boolean;
    eod_check_bypassed: boolean;
  };
}

const roleStore = RoleStore();
const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();
const drawer = ref(true);
const rail = ref(false);
const error = ref(false);

// Working Day Check Variables
const isWorkingDay = ref<boolean | null>(null);
const loadingWorkingDay = ref(false);
const workingDayMessage = ref('');
const workingDayError = ref('');
const showWorkingDaySnackbar = ref(false);

// User data from localStorage
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

// Working Day Check Methods
const checkWorkingDay = async () => {
  loadingWorkingDay.value = true;
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("ບໍ່ພົບ Token ການເຂົ້າລະບົບ");
    }

    const response = await axios.get<WorkingDayResponse>(
      '/api/end-of-day-journal/check/',
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      const data = response.data;
      isWorkingDay.value = data.available;
      workingDayMessage.value = data.reason;
      
      if (data.available) {
        workingDayError.value = '';
        console.log('Working day check passed:', data.reason);
      } else {
        workingDayError.value = data.reason;
        console.log('Working day check failed:', data.reason);
      }
      
      // Show snackbar notification
      showWorkingDaySnackbar.value = true;
    }
  } catch (error: any) {
    console.error("Working day check failed:", error);
    isWorkingDay.value = false;
    
    if (error.response?.status === 400) {
      workingDayError.value = error.response.data.reason || 'ວັນນີ້ບໍ່ແມ່ນວັນເຮັດການ';
      workingDayMessage.value = workingDayError.value;
    } else if (error.response?.status === 500) {
      workingDayError.value = 'ເກີດຂໍ້ຜິດພາດໃນລະບົບ';
      workingDayMessage.value = workingDayError.value;
    } else if (error.response?.status === 401) {
      workingDayError.value = 'ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່';
      workingDayMessage.value = workingDayError.value;
      // Optionally redirect to login
      // router.push('/login');
    } else {
      workingDayError.value = error.response?.data?.reason || 'ເກີດຂໍ້ຜິດພາດໃນການກວດສອບວັນເຮັດການ';
      workingDayMessage.value = workingDayError.value;
    }
    
    // Show error notification
    showWorkingDaySnackbar.value = true;
  } finally {
    loadingWorkingDay.value = false;
  }
};

// Auto-check working day on component mount
onMounted(() => {
  roleStore.filter_role_id.query.sub_menu_id = sub_menu_id || "";
  
  // Auto-check working day status
  checkWorkingDay();
  
  // Optional: Set up periodic checking (every 30 minutes)
  const workingDayInterval = setInterval(() => {
    checkWorkingDay();
  }, 30 * 60 * 1000); // 30 minutes
  
  // Clean up interval on component unmount
  onUnmounted(() => {
    clearInterval(workingDayInterval);
  });
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

// Check if a module should be disabled based on working day
const isModuleDisabled = (moduleId: string): boolean => {
  const restrictedModules = ['AS', 'GL']; // Accounting System and General Ledger
  return !isWorkingDay.value && restrictedModules.includes(moduleId);
};

// Check if a main menu should be disabled
const isMainMenuDisabled = (module: any): boolean => {
  return isModuleDisabled(module.module_Id);
};

// Check if a sub menu should be disabled
const isSubMenuDisabled = (module: any): boolean => {
  return isModuleDisabled(module.module_Id);
};

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

const handleMenuClick = (subMenu: any, event?: Event) => {
  if (subMenu.sub_menu_urls === "#") {
    event?.preventDefault();
    CallSwal({
      title: "ຂໍອະໄພ",
      text: `ໜ້າ "${subMenu.sub_menu_name_la}" ກຳລັງພັດທະນາຢູ....`,
      icon: "info",
      confirmButtonText: "OK",
    });
  }
};

// Handle clicks on disabled menu items
const handleDisabledMenuClick = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  
  CallSwal({
    title: "ບໍ່ສາມາດເຂົ້າໃຊ້ໄດ້",
    text: `ບໍ່ສາມາດເຂົ້າໃຊ້ເມນູນີ້ໄດ້ໃນວັນພັກ\n${workingDayMessage.value}`,
    icon: "warning",
    confirmButtonText: "ເຂົ້າໃຈແລ້ວ",
    showCancelButton: true,
    cancelButtonText: "ກວດສອບວັນເຮັດການ",
  }).then((result: any) => {
    if (result.dismiss === 'cancel') {
      checkWorkingDay();
    }
  });
};
</script>

<style>
.v-list-item--active {
  flex: auto;
  border-color: #0d47a1 !important;
  background-color: rgba(138, 133, 124, 0.1) !important;
  font-weight: bold;
}

.v-list-item {
  color: #0d47a1 !important;
  flex: auto;
  font-weight: 700 !important;
}

.v-icon {
  color: #0d47a1;
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
  --v-list-item-base-color: #0d47a1;
}

.v-list-group__items .v-list-item {
  border-left: 2px solid rgba(239, 237, 234, 0.3);
  margin-left: 0px !important;
  padding-left: 8px !important;
}

.v-list-group__items .v-list-item--active {
  border-left-color: #0d47a1 !important;
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

.sub-menu-item {
  border-left: 2px solid rgba(41, 34, 24, 0.425) !important;
  margin-left: 0px !important;
  padding-left: 8px !important;
  font-weight: 700 !important;
}

.sub-menu-item .v-list-item__content {
  font-weight: 700 !important;
}

.sub-menu-item .v-list-item-title {
  font-weight: 700 !important;
}

.sub-menu-item.v-list-item--active {
  border-left-color: #e3f2fd !important;
  background-color: rgba(250, 248, 244, 0.596) !important;
  font-weight: 700 !important;
}

.sub-menu-item.v-list-item--active .v-list-item__content {
  font-weight: 700 !important;
}

.sub-menu-item.v-list-item--active .v-list-item-title {
  font-weight: 700 !important;
}

.v-list-group__items .v-list-item {
  font-weight: 700 !important;
}

.v-list-group__items .v-list-item .v-list-item__content {
  font-weight: 700 !important;
}

.v-list-group__items .v-list-item .v-list-item-title {
  font-weight: 700 !important;
}

/* Working Day Banner Styles */
.working-day-banner {
  z-index: 1000;
  position: relative;
}

.working-day-banner .v-banner-text {
  font-weight: 500;
  font-size: 14px;
}

/* Working Day Status Button Animation */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.working-day-error {
  animation: pulse 2s infinite;
}

/* Disabled Menu Styles */
.disabled-menu {
  opacity: 0.5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  pointer-events: none !important;
}

.disabled-menu .v-list-item__content {
  color: #999 !important;
}

.disabled-menu .v-list-item-title {
  color: #999 !important;
}

.disabled-menu .v-icon {
  color: #999 !important;
}

/* Disabled module headers */
.v-list-subheader.disabled-module {
  opacity: 0.5 !important;
  background-color: #ccc !important;
}

.v-list-subheader.disabled-module .v-icon {
  color: #999 !important;
}

/* Disabled main menu items */
.v-list-item:disabled {
  opacity: 0.5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
}

.v-list-item:disabled .v-list-item__content {
  color: #999 !important;
}

.v-list-item:disabled .v-list-item-title {
  color: #999 !important;
}

.v-list-item:disabled .v-icon {
  color: #999 !important;
}

/* Disabled list group */
.v-list-group:disabled {
  opacity: 0.5 !important;
}

.v-list-group:disabled .v-list-item {
  cursor: not-allowed !important;
}

.v-list-group:disabled .v-icon {
  color: #999 !important;
}
</style>