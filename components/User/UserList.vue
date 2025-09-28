<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useRolePermissions } from "@/composables/useRolePermissions";
import axios from "@/helpers/axios";

// Reactive state
const isUpdatingStatus = ref(false);
const selectedDivision = ref<any | null>(null);
const selectedRole = ref<any | null>(null);

// Constants
const SELECTED_DIVISION_KEY = "selected_division_filter";
const SELECTED_ROLE_KEY = "selected_role_filter";
const title = "ຂໍ້ມູນຜູ້ໃຊ້ງານ";

// Stores and composables
const route = useRoute();
const agencyStore = UserStore();
const devision = UseCategoryStore();
const roleStore = RoleStore();
const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canRecordStatus,
  canAuthorize,
  initializeRole,
} = useRolePermissions();

// Computed properties
const response_data = computed(() => {
  const data = agencyStore.userList || null;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});

const roleData = computed(() => roleStore.respons_data_role || []);
const userItems = computed(() => devision.categories || []);

// API Functions
const updateUserStatus = async (id: string, action: 'authorize' | 'unauthorize') => {
  try {
    isUpdatingStatus.value = true;
    const isAuthorize = action === 'authorize';
    
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງ${isAuthorize ? 'ອະນຸມັດ' : 'ຍົກເລີກອະນຸມັດ'}ຜູ້ໃຊ້ງານ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    
    if (notification.isConfirmed) {
      const res = await axios.post(
        `api/users/${id}/${action}/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        await agencyStore.GetUser();
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: `${isAuthorize ? 'ອະນຸມັດ' : 'ຍົກເລີກອະນຸມັດ'}ຜູ້ໃຊ້ງານແລ້ວ`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      
      if (res.status === 406 && isAuthorize) {
        await CallSwal({
          icon: "warning",
          title: "ບໍ່ສາມາດອະນຸມັດໄດ້",
          text: "ບໍ່ສາມາດເປີດໄດ້ ເນື່ອງຈາກ ຍັງບໍ່ທັນອະນຸມັດ",
        });
      }
    }
  } catch (error) {
    console.error(`Error ${action} user:`, error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: `ບໍ່ສາມາດ${action === 'authorize' ? 'ອະນຸມັດ' : 'ຍົກເລີກອະນຸມັດ'}ຜູ້ໃຊ້ງານໄດ້`,
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

const updateRecordStatus = async (userId: string, status: 'on' | 'off') => {
  try {
    if (status === 'on') {
      await agencyStore.updateRecordStatus(userId);
    } else {
      await agencyStore.updateRecordStatusOff(userId);
    }
    await agencyStore.GetUser();
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂໄດ້",
    });
  }
};

const onDeleteUser = async (user_id: string) => {
  const confirmation = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຜູ້ໃຊ້ນີ້?",
    showCancelButton: true,
    confirmButtonText: "ຕົກລົງ",
    cancelButtonText: "ຍົກເລີກ",
  });

  if (confirmation.isConfirmed) {
    const result = await agencyStore.DeleteUser(user_id);
    if (result) {
      await agencyStore.GetUser();
    }
  }
};

// Filter management
const saveSelection = (key: string, value: any) => {
  try {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
};

const loadSelection = (key: string) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return null;
  }
};

const clearFilters = async () => {
  selectedDivision.value = null;
  selectedRole.value = null;
  agencyStore.reqest_get_user.query.div_id = null;
  agencyStore.reqest_get_user.query.role_id = null;
  await agencyStore.GetUser();
};

// Watchers
watch(
  [selectedDivision, selectedRole],
  async ([newDivision, newRole]) => {
    saveSelection(SELECTED_DIVISION_KEY, newDivision);
    saveSelection(SELECTED_ROLE_KEY, newRole);
    
    try {
      agencyStore.reqest_get_user.query.div_id = newDivision?.div_id || null;
      agencyStore.reqest_get_user.query.role_id = newRole?.role_id || null;
      await agencyStore.GetUser();
    } catch (error) {
      console.error("Failed to auto search users:", error);
    }
  },
  { deep: true }
);

// Table headers configuration
const header = computed(() => {
  const baseHeaders = [
    {
      title: "ຮູບພາບ",
      value: "profile_picture",
      align: "center",
      sortable: false,
      filterable: false,
      width: "80px",
      class: "text-center",
    },
    {
      title: "ລະຫັດ",
      value: "user_id",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-primary font-weight-bold",
    },
    {
      title: "ຊື່ຜູ້ໃຊ້ງານ",
      value: "user_name",
      align: "start",
      sortable: true,
      filterable: true,
      class: "text-h6",
    },
    // {
    //   title: "ອີເມວ",
    //   value: "user_email",
    //   align: "start",
    //   sortable: true,
    //   filterable: true,
    // },
    // {
    //   title: "ເບີ້ໂທ",
    //   value: "user_mobile",
    //   align: "center",
    //   sortable: true,
    //   filterable: true,
    //   class: "text-center",
    // },
    {
      title: "ພະແນກ",
      value: "division",
      align: "center",
      sortable: true,
      filterable: true,
    },
    {
      title: "ສິດເຂົ້ານຳໃຊ້ລະບົບ",
      value: "role",
      align: "center",
      sortable: true,
      filterable: true,
    },
    {
      title: "ມື້ສ້າງຂໍ້ມູນ",
      value: "created_date",
      align: "center",
      sortable: true,
      filterable: false,
    },
  ];

  const actionHeaders = [
    ...(canRecordStatus.value ? [{
      title: "ສະຖານະ",
      value: "Record_Status",
      align: "center",
      sortable: true,
      filterable: true,
      width: "100px",
    }] : []),
    ...(canView.value ? [{
      title: "ເບິ່ງ",
      value: "view",
      align: "center",
      sortable: false,
      filterable: false,
      width: "70px",
    }] : []),
    ...(canEdit.value ? [{
      title: "ແກ້ໄຂ",
      value: "edit",
      align: "center",
      sortable: false,
      filterable: false,
      width: "70px",
    }] : []),
    ...(canDelete.value ? [{
      title: "ລົບ",
      value: "delete",
      align: "center",
      sortable: false,
      filterable: false,
      width: "70px",
    }] : []),
    ...(canAuthorize.value ? [{
      title: "ອະນຸມັດ",
      value: "confirm",
      align: "center",
      sortable: false,
      filterable: false,
      width: "80px",
    }] : []),
  ];

  return [...baseHeaders, ...actionHeaders];
});

// Lifecycle
onMounted(async () => {
  initializeRole();
  roleStore.GetRoleDetail();
  
  try {
    await Promise.all([
      agencyStore.GetUser(),
      devision.GetListData(),
      roleStore.GetRole(),
    ]);

    // Load saved filters
    selectedDivision.value = loadSelection(SELECTED_DIVISION_KEY);
    selectedRole.value = loadSelection(SELECTED_ROLE_KEY);

    // Apply filters if they exist
    if (selectedDivision.value || selectedRole.value) {
      agencyStore.reqest_get_user.query.div_id = selectedDivision.value?.div_id || null;
      agencyStore.reqest_get_user.query.role_id = selectedRole.value?.role_id || null;
      await agencyStore.GetUser();
    }

    // Handle URL query params
    const user_id = route.query.user_id as string;
    if (user_id) {
      agencyStore.DeleteUser(user_id);
    }
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
});

// Expose clear function
const clearSavedSelection = () => {
  localStorage.removeItem(SELECTED_DIVISION_KEY);
  localStorage.removeItem(SELECTED_ROLE_KEY);
  selectedDivision.value = null;
  selectedRole.value = null;
  agencyStore.reqest_get_user.query.div_id = null;
  agencyStore.reqest_get_user.query.role_id = null;
};

defineExpose({
  clearSavedSelection,
});
</script>

<template>
  <div class="user-management">
    <!-- Page Title -->
    <GlobalTextTitleLine :title="`${title} (${formatnumber(response_data?.length ?? 0)})`" />

    <v-card flat class="pa-4">
      <!-- Controls Section -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-btn 
            v-if="canAdd" 
            color="primary" 
            @click="goPath('/user/create')"
            prepend-icon="mdi-plus"
            class="text-none"
          >
            ເພີ່ມຜູ້ໃຊ້ງານ
          </v-btn>
        </v-col>

        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="selectedDivision"
            density="compact"
            label="ເລືອກພະແນກ"
            :items="userItems"
            item-value="div_id"
            item-title="division_name_la"
            variant="outlined"
            clearable
            return-object
            :loading="agencyStore.loading"
            hide-details
          >
            <template v-slot:selection="{ item }">
              {{ item.raw.division_name_la }}
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`ID: ${item.raw.div_id}`"
                :title="item.raw.division_name_la"
              />
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="selectedRole"
            density="compact"
            label="ເລືອກສິດການນຳໃຊ້ລະບົບ"
            :items="roleData"
            item-value="role_id"
            item-title="role_name_la"
            variant="outlined"
            clearable
            return-object
            :loading="agencyStore.loading"
            hide-details
          >
            <template v-slot:selection="{ item }">
              {{ item.raw.role_name_la }}
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`ID: ${item.raw.role_id}`"
                :title="item.raw.role_name_la"
              />
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" md="2">
          <v-btn
            color="secondary"
            variant="outlined"
            @click="clearFilters"
            :loading="agencyStore.loading"
            block
            prepend-icon="mdi-filter-remove"
            class="text-none"
          >
            ເຄລຍການກັ່ນຕອງ
          </v-btn>
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-data-table 
        :headers="header" 
        :items="response_data || []" 
        class="elevation-1 user-table"
        :loading="agencyStore.loading"
        loading-text="ກຳລັງໂຫຼດຂໍ້ມູນ..."
        no-data-text="ບໍ່ມີຂໍ້ມູນ"
      >
        <!-- Profile Picture -->
        <template v-slot:item.profile_picture="{ item }">
          <v-avatar size="40" class="ma-2">
            <v-img
              v-if="item.profile_picture"
              :src="item.profile_picture"
              :alt="item.user_name"
              cover
            />
            <v-icon v-else icon="mdi-account" size="24" />
          </v-avatar>
        </template>

        <!-- Date formatting -->
        <template v-slot:item.created_date="{ item }">
          <span class="text-caption">
            {{ dayjs(item.InsertDate).format("DD/MM/YYYY") }}
          </span>
        </template>

        <!-- Division info -->
        <template v-slot:item.division="{ item }">
          <div class="text-center">
            <div class="font-weight-medium">{{ item.division?.division_name_la || "ບໍ່ມີຂໍ້ມູນ" }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.division?.div_id || "" }}</div>
          </div>
        </template>

        <!-- Role info -->
        <template v-slot:item.role="{ item }">
          <div class="text-center">
            <div class="font-weight-medium">{{ item.role?.role_name_la || "ບໍ່ມີຂໍ້ມູນ" }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.role?.role_id || "" }}</div>
          </div>
        </template>

        <!-- Record Status -->
        <template v-slot:item.Record_Status="{ item }">
          <v-btn
            @click="updateRecordStatus(item.user_id, item.Record_Status === 'O' ? 'off' : 'on')"
            :color="item.Record_Status === 'O' ? 'success' : 'error'"
            variant="text"
            :icon="item.Record_Status === 'O' ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'"
            size="small"
          />
        </template>

        <!-- Authorization Status -->
        <template v-slot:item.confirm="{ item }">
          <v-btn
            @click="updateUserStatus(item.user_id, item.Auth_Status === 'A' ? 'unauthorize' : 'authorize')"
            :color="item.Auth_Status === 'A' ? 'primary' : 'error'"
            variant="text"
            :icon="item.Auth_Status === 'A' ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'"
            size="small"
            :loading="isUpdatingStatus"
          />
        </template>

        <!-- Action buttons -->
        <template v-slot:item.view="{ item }">
          <v-btn
            :to="`/user/detail?user_id=${item.user_id}`"
            color="primary"
            variant="text"
            icon="mdi-eye-outline"
            size="small"
          />
        </template>

        <template v-slot:item.edit="{ item }">
          <v-btn
            :to="`/user/edit?user_id=${item.user_id}`"
            color="info"
            variant="text"
            icon="mdi-pencil-outline"
            size="small"
          />
        </template>

        <template v-slot:item.delete="{ item }">
          <v-btn
            @click="onDeleteUser(item.user_id)"
            color="error"
            variant="text"
            icon="mdi-delete-outline"
            size="small"
          />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.user-management {
  height: 100%;
}

.user-table {
  border-radius: 8px;
}

.user-table :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.user-table :deep(th) {
  background-color: rgb(var(--v-theme-surface-variant));
  font-weight: 600 !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.user-table :deep(.v-data-table-header__content) {
  font-weight: 600;
}

.user-table :deep(.v-avatar) {
  border: 2px solid rgba(var(--v-theme-primary), 0.1);
}
</style>