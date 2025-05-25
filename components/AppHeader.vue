<template>
  <v-app-bar :elevation="2" color="#c58c20" class="d-flex align-center">
    <!-- ປຸ່ມເມນູຢູ່ຊ້າຍສຸດ -->
    <v-app-bar-nav-icon 
      @click="drawer = !drawer" 
      style="color: blue; background-color: blanchedalmond; flex-shrink: 0;"
    ></v-app-bar-nav-icon>
    
    <!-- ຊື່ລະບົບຢູ່ກາງ -->
    <v-app-bar-title class="text-center flex-grow-1">
      ລະບົບບັນຊີ ບໍລິສັດລັດ ບໍລິຫານໜີ້ ແລະ ຊັບສິນ ຈຳກັດຜູ້ດຽວ
      (SAMC'S Accounting System)
    </v-app-bar-title>
    
    <!-- ເມນູຜູ້ໃຊ້ຢູ່ຂວາສຸດ -->
    <v-spacer></v-spacer>
    <v-menu min-width="200px" rounded>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" style="flex-shrink: 0;">
          <v-avatar class="pa-3,mr-3" color="#BDBDBD" size="large">
            <span class="text-h5" v-if="user.initials">
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
              <span class="text-h5" v-if="user.initials">{{ user.initials }}</span>
              <span class="text-h5" v-else>
                <v-icon icon="mdi-account-circle-outline"></v-icon>
              </span>
            </v-avatar>
            <h3>{{ user.fullName }}</h3>
            <p class="text-caption mt-1">
              {{ user.email }}
            </p>
            <v-divider class="my-3"></v-divider>
            <v-btn variant="text" rounded> Edit Account </v-btn>
            <v-divider class="my-3" color="#c58c20"></v-divider>
            <v-btn variant="text" rounded @click="onLogout"> Disconnect </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>

  <!-- Navigation drawer ທີ່ເລື່ອນເຂົ້າມາຈາກຊ້າຍ (overlay) -->
  <v-navigation-drawer 
    v-model="drawer" permanent :rail="rail" order="1"
    
    :style="{ background: '#fdfdf5', borderColor: '#c58c20' }" 
    
   
    
   
  >
   
      <v-list nav density="comfortable" style="color: #c58c20; padding: 0;">
        
        <!-- Loading State -->
        <template v-if="isLoading">
          <v-list-subheader style="color: #c58c20; padding-left: 0px;" v-show="!rail">ກຳລັງໂຫຼດ...</v-list-subheader>
          <v-list-item 
            prepend-icon="mdi-loading mdi-spin" 
            :title="rail ? '' : 'ກຳລັງໂຫຼດຂໍ້ມູນເມນູ...'" 
            disabled
            variant="plain"
            class="px-0"
          ></v-list-item>
        </template>
        
        <!-- Error State -->
        <template v-else-if="error">
          <v-list-subheader style="color: #c58c20; padding-left: 0px;" v-show="!rail">ຂໍ້ຜິດພາດ</v-list-subheader>
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
        
        <!-- Menu Data -->
        <template v-else-if="responeMenuData && responeMenuData.length > 0">
          <!-- Modules -->
          <template v-for="(module, moduleIndex) in responeMenuData" :key="`module-${module.module_Id}`">
            <v-list-subheader style="color: #c58c20; font-weight: bold; padding-left: 0px;" v-show="!rail">
              <v-icon :icon="convertIcon(module.module_icon)" class="mr-2"></v-icon>
              {{ module.module_name_la }}
            </v-list-subheader>
            
            <!-- Main Menus -->
            <template v-for="(mainMenu, mainMenuIndex) in module.main_menus" :key="`main-${module.module_Id}-${mainMenu.menu_id}`">
              <!-- Main Menu Item with Sub Menus (Dropdown) -->
              <template v-if="mainMenu.sub_menus && mainMenu.sub_menus.length > 0">
                <v-list-group :value="mainMenu.menu_id">
                  <template v-slot:activator="{ props }">
                    <v-list-item
                      v-bind="props"
                      :prepend-icon="convertIcon(mainMenu.menu_icon)"
                      :title="rail ? '' : mainMenu.menu_name_la"
                      variant="tonal"
                      color="primary"
                      style="margin-bottom: 2px;"
                      class="px-0"
                    ></v-list-item>
                  </template>
                  
                  <!-- Sub Menus - ຊື່ນເມື່ອ rail mode ເປັນ true -->
                  <template v-if="!rail">
                    <v-list-item
                      v-for="(subMenu, subMenuIndex) in mainMenu.sub_menus"
                      :key="`sub-${module.module_Id}-${mainMenu.menu_id}-${subMenu.sub_menu_id}`"
                      :value="subMenu.sub_menu_id"
                      :title="subMenu.sub_menu_name_la"
                      :prepend-icon="convertIcon(subMenu.sub_menu_icon)"
                      :to="cleanUrl(subMenu.sub_menu_urls)"
                      :active="route.path === cleanUrl(subMenu.sub_menu_urls)"
                      variant="plain"
                      color="primary"
                      style="margin-bottom: 2px;"
                      class="sub-menu-item"
                    ></v-list-item>
                  </template>
                </v-list-group>
              </template>
              
              <!-- Main Menu without sub menus (direct clickable) -->
              <template v-else>
                <v-list-item
                  :prepend-icon="convertIcon(mainMenu.menu_icon)"
                  :title="rail ? '' : mainMenu.menu_name_la"
                  :to="mainMenu.menu_url ? cleanUrl(mainMenu.menu_url) : '#'"
                  variant="tonal"
                  color="primary"
                  style="margin-bottom: 2px;"
                  class="px-0"
                ></v-list-item>
              </template>
            </template>
            
            <!-- Divider between modules - ຊື່ນເມື່ອ rail mode -->
            <v-divider v-if="moduleIndex < responeMenuData.length - 1 && !rail" class="my-3 mx-0" color="#c58c20" opacity="0.3"></v-divider>
          </template>
        </template>
        
        <!-- Empty State -->
        <template v-else>
          <v-list-subheader style="color: #c58c20; padding-left: 0px;" v-show="!rail">ເມນູ</v-list-subheader>
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

const menuStore = useMenuStore();
const route = useRoute();
const router = useRouter();
const drawer = ref(true);
const rail = ref(false);
const error = ref(false);

const user = ref({
  fullName: "Admin User",
  initials: "AU",
  email: "admin@example.com",
});

// ຟັງຊັ່ນດຶງ user ID ຈາກ localStorage
const getUserIdFromLocalStorage = () => {
  if (typeof window === 'undefined') return null;
  
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

// ຟັງຊັ່ນສຳລັບແປງ FontAwesome icons ເປັນ Material Design icons
const convertIcon = (icon: string): string => {
  if (!icon) return 'mdi-circle-small';
  
  // ຖ້າເປັນ MDI icon ແລ້ວ ໃໃຫ້ return ກັບໄປເລີຍ
  if (icon.startsWith('mdi-')) return icon;
  
  // Icon mapping ທີ່ສົມບູນ
  const iconMap: Record<string, string> = {
    // Module icons
    'mdi-home': 'mdi-home',
    'fa-users-cog': 'mdi-account-cog',
    'fa-chart-bar': 'mdi-chart-bar',
    'fa-cogs': 'mdi-cog-transfer',
    
    // Menu icons
    'mdi-user': 'mdi-account',
    'fa-edit': 'mdi-pencil',
    'fa-file-alt': 'mdi-file-document',
    'fa-database': 'mdi-database',
    
    // Sub-menu icons
    'fa-sign-in-alt': 'mdi-login',
    'fa-key': 'mdi-key',
    'fa-upload': 'mdi-upload',
    'fa-check-circle': 'mdi-check-circle',
    'fa-user-shield': 'mdi-shield-account',
    'fa-users': 'mdi-account-group',
    'fa-puzzle-piece': 'mdi-puzzle',
    'fa-building': 'mdi-domain',
    'fa-id-badge': 'mdi-badge-account',
    'fa-bars': 'mdi-menu',
    'fa-list': 'mdi-format-list-bulleted',
    'fa-file-invoice': 'mdi-file-document-outline',
    'fa-book': 'mdi-book',
    'fa-bookmark': 'mdi-bookmark',
    'fa-money-bill': 'mdi-cash-multiple',
  };
  
  return iconMap[icon] || 'mdi-circle-small';
};

// ຟັງຊັ່ນສຳລັບທຳຄວາມສະອາດ URL
const cleanUrl = (url: string): string => {
  if (!url) return '/';
  
  // ແກ້ໄຂ URL ທີ່ມີການຊໍ້າກັນ ຫຼື ຜິດພາດ
  if (url.includes('/module/user-rule/functions/module/user-rule/functions')) {
    return '/module/user-rule/functions';
  }
  
  // ລຶບ \r\n ຫຼື whitespace ທີ່ບໍ່ຕ້ອງການ
  return url.replace(/[\r\n\s]+/g, '').trim();
};

// Computed properties
const responeMenuData = computed(() => {
  return menuStore.respone_menu_data;
});

const isLoading = computed(() => {
  return menuStore.isloading;
});

// ຟັງຊັ່ນສຳລັບໂຫຼດເມນູ
const loadMenu = async (userId: string) => {
  try {
    error.value = false;
    console.log("ກຳລັງດຶງຂໍ້ມູນເມນູສຳລັບຜູ້ໃຊ້:", userId);
    await menuStore.Getmenu(userId);
    
    // ກວດສອບວ່າມີຂໍ້ມູນຫຼືບໍ່
    if (!responeMenuData.value || (Array.isArray(responeMenuData.value) && responeMenuData.value.length === 0)) {
      console.warn("ບໍ່ພົບຂໍ້ມູນເມນູ");
      error.value = true;
    }
  } catch (err) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນເມນູ:", err);
    error.value = true;
  }
};

// ຟັງຊັ່ນສຳລັບລອງໂຫຼດເມນູໃໝ່
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

const onLogout = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/login');
  } catch (err) {
    console.error("Error during logout:", err);
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};
</script>

<style>
.v-list-item--active {
  flex: auto;
  border-color: #c58c20 !important;
  background-color: rgba(197, 140, 32, 0.1) !important;
}
.v-list-item {
  color: #c58c20 !important;
  flex: auto;
}
.v-icon {
  color: #c58c20;
}

.v-list-subheader {
  color: #c58c20 !important;
  font-weight: bold !important;
}

/* Loading animation */
.mdi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Hover effects */
.v-list-item:hover {
  background-color: rgba(197, 140, 32, 0.08) !important;
}

.v-list-item[variant="tonal"]:hover {
  background-color: rgba(197, 140, 32, 0.15) !important;
}

/* List group styling */
.v-list-group {
  --v-list-group-background-color: transparent;
}

.v-list-group__items {
  --v-list-item-base-color: #c58c20;
}

.v-list-group__items .v-list-item {
  border-left: 2px solid rgba(197, 140, 32, 0.3);
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
}

.v-list-item__prepend {
  margin-inline-start: 0 !important;
}

.v-list-item__content {
  margin-left: 0 !important;
}

/* ສຳລັບ sub-menu ໃຫ້ມີການເລື່ອນເຂົ້າໄປເລັກນ້ອຍ */
.sub-menu-item {
  border-left: 2px solid rgba(197, 140, 32, 0.3) !important;
  margin-left: 0px !important;
  padding-left: 8px !important;
}

.sub-menu-item.v-list-item--active {
  border-left-color: #c58c20 !important;
  background-color: rgba(197, 140, 32, 0.1) !important;
}
</style>