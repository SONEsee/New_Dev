<template>
  <v-app-bar :elevation="2" color="#c58c20">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="drawer = !drawer" style="color: blue; background-color: blanchedalmond;"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>ລະບົບຈັດການບັນຊີ</v-app-bar-title>
   
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
      <template v-if="responeMenuData && responeMenuData.length > 0">
        <v-list-group 
          v-for="(module, moduleIndex) in responeMenuData" 
          :key="`module-${moduleIndex}`" 
          :value="module.module_Id"
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              color="primary"
              rounded="xl"
              :prepend-icon="getModuleIcon(module.module_icon)"
              :title="module.module_name_la"
            ></v-list-item>
          </template>
          
          <v-list-group 
            v-for="(mainMenu, mainMenuIndex) in module.main_menus" 
            :key="`main-${moduleIndex}-${mainMenuIndex}`" 
            :value="mainMenu.menu_id" 
            sub-group
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                color="primary"
                rounded="xl"
                :prepend-icon="getMenuIcon(mainMenu.menu_icon)"
                :title="mainMenu.menu_name_la"
              ></v-list-item>
            </template>
            
            <v-list-item
              v-for="(subMenu, subMenuIndex) in mainMenu.sub_menus"
              :key="`sub-${moduleIndex}-${mainMenuIndex}-${subMenuIndex}`"
              :value="subMenu.sub_menu_id"
              :title="subMenu.sub_menu_name_la"
              :prepend-icon="getSubMenuIcon(subMenu.sub_menu_icon)"
              :to="subMenu.sub_menu_urls"
              :active="route.path === subMenu.sub_menu_urls"
              rounded="xl"
            ></v-list-item>
          </v-list-group>
        </v-list-group>
      </template>
      
      <div v-else>
        <v-list-item prepend-icon="mdi-refresh" title="ກຳລັງໂຫຼດຂໍ້ມູນເມນູ..." disabled></v-list-item>
        <v-list-item v-if="isLoading" prepend-icon="mdi-loading" title="ກຳລັງໂຫຼດ..."></v-list-item>
        <v-list-item v-if="error" prepend-icon="mdi-alert" title="ມີຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ"></v-list-item>
      </div>
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


const getUserIdFromLocalStorage = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    const userData = JSON.parse(userStr);
    return userData.user_id || null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
};


const responeMenuData = computed(() => {
  return menuStore.respone_menu_data;
});

const isLoading = computed(() => {
  return menuStore.isloading;
});


onMounted(async () => {
  try {
    error.value = false;
    const user_id = getUserIdFromLocalStorage();
    const user_code = route.query.id as string | undefined;
    
   
    const userIdToUse = user_code || user_id;
    
    if (userIdToUse) {
      console.log("ກຳລັງດຶງຂໍ້ມູນເມນູສຳລັບຜູ້ໃຊ້:", userIdToUse);
      await menuStore.Getmenu(userIdToUse);
      
     
      if (!responeMenuData.value || (Array.isArray(responeMenuData.value) && responeMenuData.value.length === 0)) {
        console.log("ບໍ່ພົບຂໍ້ມູນເມນູ, ກຳລັງລອງຄືນໃໝ່...");
        setTimeout(async () => {
          await menuStore.Getmenu(userIdToUse);
        }, 1000);
      }
    } else {
      console.error("ບໍ່ພົບລະຫັດຜູ້ໃຊ້");
      error.value = true;
    }
  } catch (err) {
    console.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນເມນູ:", err);
    error.value = true;
  }
});


const getModuleIcon = (icon) => {
  const iconMap = {
    'fa-book': 'mdi-book',
    'fa-users-cog': 'mdi-account-cog',
    'fa-chart-bar': 'mdi-chart-bar',
    'fa-cogs': 'mdi-cog-transfer',
  };
  
  return iconMap[icon] || 'mdi-view-dashboard';
};

const getMenuIcon = (icon) => {
  const iconMap = {
    'fa-user-lock': 'mdi-account-lock',
    'fa-edit': 'mdi-pencil',
    'fa-user-shield': 'mdi-shield-account',
    'fa-file-alt': 'mdi-file-document',
    'fa-database': 'mdi-database',
  };
  
  return iconMap[icon] || 'mdi-menu';
};

const getSubMenuIcon = (icon) => {
  const iconMap = {
    'fa-sign-in-alt': 'mdi-login',
    'fa-key': 'mdi-key',
    'fa-edit': 'mdi-pencil',
    'fa-upload': 'mdi-upload',
    'fa-check-circle': 'mdi-check-circle',
    'fa-user-shield': 'mdi-shield-account',
    'fa-users': 'mdi-account-group',
    'fa-puzzle-piece': 'mdi-puzzle',
    'fa-cogs': 'mdi-cog-transfer',
    'fa-building': 'mdi-domain',
    'fa-id-badge': 'mdi-badge-account',
    'fa-bars': 'mdi-menu',
    'fa-list': 'mdi-format-list-bulleted',
    'fa-file-invoice': 'mdi-file-document',
    'fa-book': 'mdi-book',
    'fa-bookmark': 'mdi-bookmark',
    'fa-money-bill': 'mdi-cash-multiple',
  };
  
  return iconMap[icon] || 'mdi-circle-small';
};


const onLogout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  } catch (err) {
    console.error("Error during logout:", err);
  
    window.location.href = '/login';
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
</style>