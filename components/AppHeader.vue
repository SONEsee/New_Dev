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
              <span class="text-h5" v-if="user.initials">{{
                user.initials
              }}</span>
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
            <<v-divider class="my-3" color="#c58c20"></v-divider>
            <v-btn variant="text" rounded @click="onLogout"> Disconnect </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" permanent :rail="rail" order="1" :style="{ background: '#fdfdf5', borderColor: '#c58c20' }">
    <v-list nav density="comfortable" style="color: #c58c20;">
     

      <v-list-group value="dashboard">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-view-dashboard"
            title="ໜ້າຫຼັກຂອງລະບົບ"
          ></v-list-item>
        </template>
      </v-list-group>

      <!-- GL-Module -->
      <v-list-group>
        <template v-slot:activator="{ props }" style="color:#c58c20;" >
          <v-list-item
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-finance"
            title="ໂມດູນບັນຊີ"
          ></v-list-item>
        </template>
        
        <v-list-item
          v-for="(item, i) in GLModuleMenus"
          :key="`gl-item-${i}`"
          :value="item.value"
          :title="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          rounded="xl"
        ></v-list-item>
      </v-list-group>

      
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-desktop-tower-monitor"
            title="ໂມດູນຊັບສົມບັດຄົງທີ່"
          ></v-list-item>
        </template>
        
        <v-list-item
          v-for="(item, i) in AssetModuleMenus"
          :key="`asset-item-${i}`"
          :value="item.value"
          :title="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          rounded="xl"
        ></v-list-item>
      </v-list-group>

      
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-cash-multiple"
            title="ໂມດູນເງິນກູ້ຢືມ"
          ></v-list-item>
        </template>
      </v-list-group>

     
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item
         
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-shield-account"
            title="ໂມດູນຫຼັກຊັບຄ້ຳປະກັນ"
          ></v-list-item>
        </template>
      </v-list-group>

      
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-certificate"
            title="ໂມດູນພັນທະບັນ"
          ></v-list-item>
        </template>
      </v-list-group>

     
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-file-chart"
            title="ໂມດູນບົດລາຍງານ"
          ></v-list-item>
        </template>
      </v-list-group>

      
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-account-key"
            title="ໂມດູນກຳນົດສິດເຂົ້າໃຊ້ງານ"
          ></v-list-item>
        </template>
        
        <v-list-item
          v-for="(item, i) in UserRuleModuleMenus"
          :key="`user-rule-item-${i}`"
          :value="item.value"
          :title="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          rounded="xl"
        ></v-list-item>
      </v-list-group>

      <!-- Main-Model -->
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            color="primary"
            rounded="xl"
            prepend-icon="mdi-cog"
            title="ໂມດູນການຕັ້ງຄ້າຫຼັກ"
          ></v-list-item>
        </template>
        
        <!-- <v-list-item
          v-for="(item, i) in MainModuleMenus"
          :key="`main-item-${i}`"
          :value="item.value"
          :title="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          rounded="xl"
        ></v-list-item> -->
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
const user = ref({
  fullName: "Admin User",
  initials: "AU",
  email: "admin@example.com",
});

const drawer = ref(true);
const rail = ref(false);

// GL-Module submenu items
const GLModuleMenus = ref([
  { 
    title: "ລົງບັນຊີປະຈຳວັນ", 
    value: "gl-note", 
    icon: "mdi-notebook-outline", 
    to: "#" 
  },
  { 
    title: "Aprove-GL-Note", 
    value: "approve-gl-note", 
    icon: "mdi-check-decagram", 
    to: "#" 
  },
  { 
    title: " ເກັບຂໍ້ມູນອັດຕາແລກປ່ຽນປະຈຳວັນ", 
    value: "exchangrate", 
    icon: "mdi-currency-usd-exchange", 
    to: "#" 
  },
  { 
    title: "ເກັບຂໍ້ມູນຝັງບັນຊີຍ່ອຍ", 
    value: "gl-sub", 
    icon: "mdi-file-tree", 
    to: "#" 
  },
  { 
    title: "ເກັບຂໍ້ມູນຝັງບັນຊີໃຫຍ່ແຍກປະເພດ", 
    value: "gl-master", 
    icon: "mdi-folder-multiple", 
    to: "#" 
  },
  { 
    title: "ເກັບຂໍ້ມູນປິດບັນຊີ", 
    value: "close-account", 
    icon: "mdi-book-lock", 
    to: "#" 
  },
  { 
    title: "ເກັບຂໍ້ມູນບິນການລົງທຸລະກຳ", 
    value: "transaction-bills", 
    icon: "mdi-receipt", 
    to: "#" 
  },
  { 
    title: "ເກັບຂໍ້ມູນລາຍການກ່ອນການລົງບັນຊີ", 
    value: "gl-capture-bill", 
    icon: "mdi-clipboard-text", 
    to: "#" 
  },
]);

// Asset-Module submenu items
const AssetModuleMenus = ref([
  { 
    title: "ເກັບຂໍ້ມູນຊັບສິນ", 
    value: "fix-asset", 
    icon: "mdi-archive", 
    to: "#" 
  },
  { 
    title: "AssetMain - ເກັບຂໍ້ມູນລາຍລະອຽດຊັບສິນ", 
    value: "asset-main", 
    icon: "mdi-clipboard-list", 
    to: "#" 
  },
  { 
    title: "Report-Asset", 
    value: "report-asset", 
    icon: "mdi-file-chart", 
    to: "#" 
  },
]);

// UserRule-Model submenu items
const UserRuleModuleMenus = ref([
  { 
    title: "ModuleInfo", 
    value: "module-info", 
    icon: "mdi-view-module", 
    to: "#" 
  },
  { 
    title: "FunctionInfo", 
    value: "function-info", 
    icon: "mdi-function", 
    to: "#" 
  },
  { 
    title: "- ເກັບຂໍ້ມູນຜູ້ເຂົ້າໃຊ້ລະບົບ", 
    value: "user-right", 
    icon: "mdi-account-check", 
    to: "/user" 
  },
  { 
    title: "- ເກັບຂໍ້ມູນການກຳນົດກຸ່ມຜູ້ເຂົ້າໃຊ້ງານລະບົບ", 
    value: "group-users", 
    icon: "mdi-account-group", 
    to: "#" 
  },
  { 
    title: "ກຳນົດສິດເຂົ້າໃຊ້ງານ", 
    value: "group-users", 
    icon: "mdi-account-key", 
    to: "/user/role" 
  },
  { 
    title: " - ເກັບຂໍ້ມູນພະແນກ", 
    value: "divisions", 
    icon: "mdi-domain", 
    to: "/devision" 
  },
  { 
    title: "- ເກັບຂໍ້ມູນພະນັກງານ", 
    value: "employees", 
    icon: "mdi-badge-account", 
    to: "#" 
  },
  { 
    title: "- ລາຍງານກ່ຽວການເຂົ້າໃຊ້ລະບົບ", 
    value: "report-user-rule", 
    icon: "mdi-chart-box", 
    to: "#" 
  },
]);

// Main-Model submenu items
const MainModuleMenus = ref([
  { 
    title: "DateOfRed - ເກັບຂໍ້ມູນວັນພັກ", 
    value: "date-of-red", 
    icon: "mdi-calendar-star", 
    to: "#" 
  },
  { 
    title: "MasterCode - ເກັບຂໍ້ມູນລາຍລະອຽດຕາມປະເພດຂອງຕາຕະລາງ", 
    value: "master-code", 
    icon: "mdi-table", 
    to: "#" 
  },
  { 
    title: "MasterType - ເກັບຂໍ້ມູນປະເພດຕາຕະລາງຕ່າງໆ", 
    value: "master-type", 
    icon: "mdi-table-large", 
    to: "#" 
  },
  { 
    title: "ProvinceInfo - ເກັບຂໍ້ມູນແຂວງ", 
    value: "province-info", 
    icon: "mdi-map", 
    to: "#" 
  },
  { 
    title: "DistricInfo - ເກັບຂໍ້ມູນເມືອງ", 
    value: "distric-info", 
    icon: "mdi-map-marker", 
    to: "#" 
  },
]);


const onLogout = () => {

  console.log("Logging out...");
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