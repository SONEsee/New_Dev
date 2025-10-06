<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRolePermissions } from "@/composables/useRolePermissions";
import { debounce } from "lodash-es";
import axios from "@/helpers/axios";

// Types
interface User {
  user_id: string;
  user_name: string;
  user_email?: string;
  user_mobile?: string;
  User_Status: string;
  Auth_Status: string;
  profile_picture?: string;
  division?: {
    div_id: string;
    division_name_la: string;
    division_name_en: string;
  };
  role?: {
    role_id: string;
    role_name_la: string;
    role_name_en: string;
  };
  InsertDate: string;
  UpdateDate: string;
}

// Reactive state
const isUpdatingStatus = ref(false);
const isLoadingUsers = ref(false);
const searchQuery = ref<string>("");

// Filters
const filters = ref({
  search: null as string | null,
  auth_status: null as string | null,
  div_id: null as string | null,
  role_id: null as string | null,
  page: 1,
  page_size: 20,
});

// Pagination
const totalUsers = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalPages = ref(1);

// Constants
const title = "ຂໍ້ມູນຜູ້ໃຊ້ງານ";

// Stores and composables
const route = useRoute();
const router = useRouter();
const agencyStore = UserStore();
const devision = UseCategoryStore();
const roleStore = RoleStore();
const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canAuthorize,
  initializeRole,
} = useRolePermissions();

// Computed properties
const usersList = ref<User[]>([]);
const roleData = computed(() => roleStore.respons_data_role || []);
const divisionData = computed(() => devision.categories || []);

// API Functions
const fetchUsers = async (showLoading = true) => {
  try {
    if (showLoading) isLoadingUsers.value = true;
    
    const params = new URLSearchParams();
    
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await axios.get(`/api/users/?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.data) {
      // Handle paginated response (DRF)
      if (response.data.results) {
        usersList.value = response.data.results;
        totalUsers.value = response.data.count || 0;
        totalPages.value = Math.ceil(totalUsers.value / itemsPerPage.value);
      } 
      // Handle direct array response
      else if (Array.isArray(response.data)) {
        usersList.value = response.data;
        totalUsers.value = response.data.length;
        totalPages.value = Math.ceil(totalUsers.value / itemsPerPage.value);
      }
      // Handle other formats
      else {
        usersList.value = response.data.items || response.data.Item || [];
        totalUsers.value = usersList.value.length;
        totalPages.value = Math.ceil(totalUsers.value / itemsPerPage.value);
      }
      
      currentPage.value = filters.value.page || 1;
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ໄດ້",
    });
  } finally {
    if (showLoading) isLoadingUsers.value = false;
  }
};

// Update user status
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
        `/api/users/${id}/${action}/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.status === 200) {
        const userIndex = usersList.value.findIndex(u => u.user_id === id);
        if (userIndex !== -1) {
          usersList.value[userIndex].Auth_Status = isAuthorize ? 'A' : 'U';
        }
        
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: `${isAuthorize ? 'ອະນຸມັດ' : 'ຍົກເລີກອະນຸມັດ'}ຜູ້ໃຊ້ງານແລ້ວ`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  } catch (error: any) {
    console.error(`Error ${action} user:`, error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: error.response?.data?.detail || `ບໍ່ສາມາດ${action === 'authorize' ? 'ອະນຸມັດ' : 'ຍົກເລີກອະນຸມັດ'}ຜູ້ໃຊ້ງານໄດ້`,
    });
  } finally {
    isUpdatingStatus.value = false;
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
    try {
      const result = await agencyStore.DeleteUser(user_id);
      if (result || result === undefined) {
        usersList.value = usersList.value.filter(u => u.user_id !== user_id);
        totalUsers.value--;
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
};

// Clear filters
const clearFilters = async () => {
  filters.value = {
    search: null,
    auth_status: null,
    div_id: null,
    role_id: null,
    page: 1,
    page_size: 20,
  };
  searchQuery.value = "";
  currentPage.value = 1;
  await fetchUsers();
};

// Debounced search
const debouncedSearch = debounce(async (searchValue: string) => {
  filters.value.search = searchValue || null;
  filters.value.page = 1;
  currentPage.value = 1;
  await fetchUsers();
}, 500);

// Pagination handlers
const changePage = async (page: number) => {
  filters.value.page = page;
  currentPage.value = page;
  await fetchUsers();
};

const changeItemsPerPage = async (items: number) => {
  filters.value.page_size = items;
  filters.value.page = 1;
  currentPage.value = 1;
  itemsPerPage.value = items;
  await fetchUsers();
};

// Watchers
watch(searchQuery, (newValue) => {
  debouncedSearch(newValue);
});

watch([() => filters.value.auth_status, () => filters.value.div_id, () => filters.value.role_id], async () => {
  filters.value.page = 1;
  currentPage.value = 1;
  await fetchUsers();
});

// Table headers
const header = computed(() => {
  const baseHeaders = [
    {
      title: "ຮູບ",
      value: "profile_picture",
      align: "center",
      sortable: false,
      width: "70px",
    },
    {
      title: "ລະຫັດຜູ້ໃຊ້",
      value: "user_id",
      align: "start",
      sortable: false,
    },
    {
      title: "ຊື່ຜູ້ໃຊ້ງານ",
      value: "user_name",
      align: "start",
      sortable: false,
    },
    {
      title: "ພະແນກ",
      value: "division",
      align: "center",
      sortable: false,
    },
    {
      title: "ສິດການນຳໃຊ້",
      value: "role",
      align: "center",
      sortable: false,
    },
    {
      title: "ສະຖານະອະນຸມັດ",
      value: "Auth_Status",
      align: "center",
      sortable: false,
      width: "130px",
    },
    {
      title: "ວັນທີ່ສ້າງ",
      value: "created_date",
      align: "center",
      sortable: false,
      width: "120px",
    },
  ];

  const actionHeaders = [];
  
  if (canView.value || canEdit.value || canDelete.value || canAuthorize.value) {
    actionHeaders.push({
      title: "ຈັດການ",
      value: "actions",
      align: "center",
      sortable: false,
      width: "150px",
    });
  }

  return [...baseHeaders, ...actionHeaders];
});

// Lifecycle
onMounted(async () => {
  initializeRole();
  
  await Promise.all([
    devision.GetListData(),
    roleStore.GetRole(),
  ]);
  
  await fetchUsers();
});
</script>

<template>
  <div class="user-management">
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="page-header">
          <h1 class="text-styles page-title">{{ title }}</h1>
          <p class="text-styles page-subtitle">ທັງໝົດ {{ formatnumber(totalUsers) }} ຜູ້ໃຊ້ງານ</p>
        </div>
      </v-col>
    </v-row>

    <!-- Main Content Card -->
    <v-card class="main-card" elevation="0">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <v-row align="center">
          <!-- Search -->
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              density="comfortable"
              label="ຄົ້ນຫາ"
              placeholder="ຄົ້ນຫາຊື່ ຫຼື ລະຫັດຜູ້ໃຊ້"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              :loading="isLoadingUsers"
              class="text-styles search-field"
            />
          </v-col>

          <!-- Division Filter -->
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="filters.div_id"
              density="comfortable"
              label="ພະແນກ"
              :items="divisionData"
              item-value="div_id"
              item-title="division_name_la"
              variant="outlined"
              hide-details
              clearable
              prepend-inner-icon="mdi-office-building"
              :disabled="isLoadingUsers"
              class="text-styles"
            />
          </v-col>

          <!-- Role Filter -->
          <v-col cols="12" md="2">
            <v-autocomplete
              v-model="filters.role_id"
              density="comfortable"
              label="ສິດການນຳໃຊ້"
              :items="roleData"
              item-value="role_id"
              item-title="role_name_la"
              variant="outlined"
              hide-details
              clearable
              prepend-inner-icon="mdi-shield-account"
              :disabled="isLoadingUsers"
              class="text-styles"
            />
          </v-col>

          <!-- Auth Status Filter -->
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.auth_status"
              density="comfortable"
              label="ສະຖານະອະນຸມັດ"
              :items="[
                { value: null, title: 'ທັງໝົດ' },
                { value: 'A', title: 'ອະນຸມັດແລ້ວ' },
                { value: 'U', title: 'ລໍຖ້າອະນຸມັດ' },
              ]"
              variant="outlined"
              hide-details
              clearable
              prepend-inner-icon="mdi-check-circle"
              :disabled="isLoadingUsers"
              class="text-styles"
            />
          </v-col>

          <!-- Action Buttons -->
          <v-col cols="12" md="1" class="text-right">
            <v-btn
              v-if="canAdd"
              color="primary"
              size="large"
              @click="goPath('/user/create')"
              icon="mdi-plus"
              class="text-styles"
            />
          </v-col>
        </v-row>

        <!-- Clear Filter Button -->
        <v-row v-if="filters.search || filters.auth_status || filters.div_id || filters.role_id" class="mt-2">
          <v-col cols="12">
            <v-btn
              variant="text"
              color="secondary"
              size="small"
              @click="clearFilters"
              prepend-icon="mdi-filter-remove"
              class="text-styles"
            >
              ລ້າງຕົວກັ່ນທັງໝົດ
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- Data Table -->
      <v-data-table
        :headers="header"
        :items="usersList"
        :loading="isLoadingUsers"
        loading-text="ກຳລັງໂຫຼດຂໍ້ມູນ..."
        no-data-text="ບໍ່ມີຂໍ້ມູນ"
        class="user-table"
        :items-per-page="itemsPerPage"
        hide-default-footer
      >
        <!-- Profile Picture -->
        <template v-slot:item.profile_picture="{ item }">
          <v-avatar size="45" class="user-avatar">
            <v-img
              v-if="item.profile_picture"
              :src="item.profile_picture"
              :alt="item.user_name"
              cover
            />
            <v-icon v-else icon="mdi-account-circle" size="45" color="grey-lighten-1" />
          </v-avatar>
        </template>

        <!-- User ID -->
        <template v-slot:item.user_id="{ item }">
          <span class="text-styles user-id">{{ item.user_id }}</span>
        </template>

        <!-- User Name -->
        <template v-slot:item.user_name="{ item }">
          <div class="text-styles user-info">
            <div class="user-name">{{ item.user_name }}</div>
            <div v-if="item.user_email" class="user-email">{{ item.user_email }}</div>
          </div>
        </template>

        <!-- Division -->
        <template v-slot:item.division="{ item }">
          <div class="text-styles text-center">
            {{ item.division?.division_name_la || "-" }}
          </div>
        </template>

        <!-- Role -->
        <template v-slot:item.role="{ item }">
          <div class="text-styles text-center">
            {{ item.role?.role_name_la || "-" }}
          </div>
        </template>

        <!-- Auth Status -->
        <template v-slot:item.Auth_Status="{ item }">
          <v-chip
            :color="item.Auth_Status === 'A' ? 'success' : 'warning'"
            size="small"
            class="text-styles status-chip"
          >
            {{ item.Auth_Status === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າອະນຸມັດ' }}
          </v-chip>
        </template>

        <!-- Created Date -->
        <template v-slot:item.created_date="{ item }">
          <div class="text-styles text-center date-cell">
            {{ dayjs(item.InsertDate).format("DD/MM/YYYY") }}
          </div>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="action-buttons">
            <v-tooltip text="ເບິ່ງລາຍລະອຽດ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="canView"
                  v-bind="props"
                  :to="`/user/detail?user_id=${item.user_id}`"
                  icon="mdi-eye-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  class="text-styles"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="ແກ້ໄຂ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="canEdit"
                  v-bind="props"
                  :to="`/user/edit?user_id=${item.user_id}`"
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  color="info"
                  class="text-styles"
                />
              </template>
            </v-tooltip>

            <v-tooltip 
              :text="item.Auth_Status === 'A' ? 'ຍົກເລີກອະນຸມັດ' : 'ອະນຸມັດ'" 
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="canAuthorize"
                  v-bind="props"
                  @click="updateUserStatus(item.user_id, item.Auth_Status === 'A' ? 'unauthorize' : 'authorize')"
                  :icon="item.Auth_Status === 'A' ? 'mdi-check-circle' : 'mdi-clock-alert-outline'"
                  size="small"
                  variant="text"
                  :color="item.Auth_Status === 'A' ? 'success' : 'orange'"
                  :loading="isUpdatingStatus"
                  class="text-styles"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="ລົບ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-if="canDelete"
                  v-bind="props"
                  @click="onDeleteUser(item.user_id)"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  class="text-styles"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Loading -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@5" />
        </template>
      </v-data-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <div class="pagination-info text-styles">
          ສະແດງ {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalUsers) }}
          ຈາກ {{ formatnumber(totalUsers) }} ລາຍການ
        </div>
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          @update:model-value="changePage"
          :disabled="isLoadingUsers"
          color="primary"
          class="my-pagination"
        />
      </div>
    </v-card>

    <!-- Floating Action Button (Mobile) -->
    <v-btn
      v-if="canAdd"
      icon="mdi-plus"
      color="primary"
      size="large"
      elevation="8"
      class="fab-button d-md-none"
      @click="goPath('/user/create')"
    />
  </div>
</template>

<style scoped>
/* Text Styles */
.text-styles {
  font-family: 'Noto Sans Lao', 'Noto Sans', sans-serif;
  font-size: 0.95rem;
  color: #2c3e50;
  letter-spacing: 0.01em;
}

/* Page Layout */
.user-management {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 8px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

/* Main Card */
.main-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  overflow: hidden;
}

/* Filter Bar */
.filter-bar {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.search-field {
  border-radius: 8px;
}

/* Data Table */
.user-table {
  background: transparent;
}

.user-table :deep(.v-data-table__th) {
  background: #f8f9fa;
  font-weight: 600;
  font-size: 0.9rem;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  padding: 16px;
}

.user-table :deep(.v-data-table__td) {
  padding: 16px;
  border-bottom: 1px solid #f1f3f5;
}

.user-table :deep(tr:hover) {
  background: #f8f9fa !important;
}

/* Avatar */
.user-avatar {
  border: 2px solid #e2e8f0;
}

/* User Info */
.user-id {
  font-weight: 600;
  color: #2563eb;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 500;
  color: #1a202c;
  font-size: 0.95rem;
}

.user-email {
  font-size: 0.85rem;
  color: #718096;
}

/* Status Chip */
.status-chip {
  font-weight: 500;
  border-radius: 6px;
}

/* Date Cell */
.date-cell {
  font-size: 0.9rem;
  color: #4a5568;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.pagination-info {
  font-size: 0.9rem;
  color: #718096;
}

.my-pagination :deep(.v-pagination__item) {
  border-radius: 6px;
}

/* FAB Button */
.fab-button {
  position: fixed !important;
  bottom: 24px;
  right: 24px;
  z-index: 100;
}

/* Responsive Design */
@media (max-width: 960px) {
  .user-management {
    padding: 16px;
  }

  .filter-bar {
    padding: 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .pagination-wrapper {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .user-table :deep(.v-data-table__th),
  .user-table :deep(.v-data-table__td) {
    padding: 12px 8px;
    font-size: 0.85rem;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .user-management {
    padding: 12px;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .filter-bar {
    padding: 12px;
  }
}

/* Loading State */
.v-skeleton-loader {
  background: transparent;
}

/* Smooth Transitions */
.v-btn,
.v-chip,
.v-avatar {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>