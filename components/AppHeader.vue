<template>
  <v-app-bar :elevation="2" color="primary">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title>ລະບົບຈັດການບັນຊີ</v-app-bar-title>
    <v-menu min-width="200px" rounded>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-avatar class="pa-3,mr-3" color="#BDBDBD" size="large">
            <span class="text-h5" v-if="user.initials">
              <v-icon
                icon="mdi-account-circle-outline"
                color="#FFFFFF"
              ></v-icon>
            </span>
            <span class="text-h5" v-else>
              <v-icon
                icon="mdi-account-circle-outline"
                color="#FFFFFF"
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
            <v-divider class="my-3"></v-divider>
            <v-btn variant="text" rounded @click="onLogout"> Disconnect </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" permanent :rail="rail" order="1">
    <v-list nav density="comfortable">
     

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
        <template v-slot:activator="{ props }">
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

      <!-- Asset-Module -->
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

      <!-- Loan-Module -->
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

      <!-- Collector-Model -->
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

      <!-- Bron-Model -->
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
    title: "UserRight - ເກັບຂໍ້ມູນຜູ້ເຂົ້າໃຊ້ລະ", 
    value: "user-right", 
    icon: "mdi-account-check", 
    to: "#" 
  },
  { 
    title: "GroupUsers - ເກັບຂໍ້ມູນການກຳນົດກຸ່ມຜູ້ເຂົ້າໃຊ້ງານລະບົບ", 
    value: "group-users", 
    icon: "mdi-account-group", 
    to: "#" 
  },
  { 
    title: "Divisions - ເກັບຂໍ້ມູນພະແນກ", 
    value: "divisions", 
    icon: "mdi-domain", 
    to: "#" 
  },
  { 
    title: "Employees - ເກັບຂໍ້ມູນພະນັກງານ", 
    value: "employees", 
    icon: "mdi-badge-account", 
    to: "#" 
  },
  { 
    title: "Report-UserRule - ລາຍງານກ່ຽວການເຂົ້າໃຊ້ລະບົບ", 
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

// Function for logout action (placeholder)
const onLogout = () => {
  // Handle logout logic here
  console.log("Logging out...");
};
</script>