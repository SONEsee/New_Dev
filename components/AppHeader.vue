<template>
  <v-app-bar :elevation="2" color="#c58c20">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="drawer = !drawer" style="color: blue; background-color: blanchedalmond;"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>ລະບົບບັນຊີ ບໍລິສັດລັດ ບໍລິຫານໜີ້ ແລະ ຊັບສິນ ຈຳກັດຜູ້ດຽວ
(SAMC’S Accounting System)</v-app-bar-title>
   
    <v-menu min-width="200px" rounded>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
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

  <v-navigation-drawer v-model="drawer" permanent :rail="rail" order="1" :style="{ background: '#fdfdf5', borderColor: '#c58c20' }">
    <v-list nav density="comfortable" style="color: #c58c20;">
      <!-- Loading State -->
      <template v-if="isLoading">
        <v-list-item prepend-icon="mdi-loading mdi-spin" title="ກຳລັງໂຫຼດຂໍ້ມູນເມນູ..." disabled></v-list-item>
      </template>
      
      <!-- Error State -->
      <template v-else-if="error">
        <v-list-item prepend-icon="mdi-alert-circle" title="ມີຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ" disabled></v-list-item>
        <v-list-item 
          prepend-icon="mdi-refresh" 
          title="ລອງໃໝ່" 
          @click="retryLoadMenu"
          class="mt-2"
        ></v-list-item>
      </template>
      
      <!-- Menu Data -->
      <template v-else-if="responeMenuData && responeMenuData.length > 0">
        <v-list-group 
          v-for="(module, moduleIndex) in responeMenuData" 
          :key="`module-${module.module_Id}`" 
          :value="module.module_Id"
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              color="primary"
              rounded="xl"
              :prepend-icon="convertIcon(module.module_icon)"
              :title="module.module_name_la"
            ></v-list-item>
          </template>
          
          <v-list-group 
            v-for="(mainMenu, mainMenuIndex) in module.main_menus" 
            :key="`main-${module.module_Id}-${mainMenu.menu_id}`" 
            :value="mainMenu.menu_id" 
            sub-group
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                color="primary"
                rounded="xl"
                :prepend-icon="convertIcon(mainMenu.menu_icon)"
                :title="mainMenu.menu_name_la"
              ></v-list-item>
            </template>
            
            <v-list-item
              v-for="(subMenu, subMenuIndex) in mainMenu.sub_menus"
              :key="`sub-${module.module_Id}-${mainMenu.menu_id}-${subMenu.sub_menu_id}`"
              :value="subMenu.sub_menu_id"
              :title="subMenu.sub_menu_name_la"
              :prepend-icon="convertIcon(subMenu.sub_menu_icon)"
              :to="cleanUrl(subMenu.sub_menu_urls)"
              :active="route.path === cleanUrl(subMenu.sub_menu_urls)"
              rounded="xl"
            ></v-list-item>
          </v-list-group>
        </v-list-group>
      </template>
      
      <!-- Empty State -->
      <template v-else>
        <v-list-item prepend-icon="mdi-menu-off" title="ບໍ່ມີຂໍ້ມູນເມນູ" disabled></v-list-item>
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

// ຟັງຊັ່ນສຳລັບດຶງ user ID ຈາກ localStorage
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

// Lifecycle hook
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
  border-color: #c58c20 !important;
}
.v-list-item {
  color: #c58c20 !important;
}
.v-icon {
  color: #c58c20;
}

/* Loading animation */
.mdi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>