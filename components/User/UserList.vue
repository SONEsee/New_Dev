<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRolePermissions } from "@/composables/useRolePermissions";
import { debounce } from "lodash-es";
import axios from "@/helpers/axios";

// Types
interface UserFilter {
  div_id?: string | null;
  role_id?: string | null;
  user_status?: string | null;
  auth_status?: string | null;
  search?: string | null;
  created_after?: string | null;
  created_before?: string | null;
  page?: number;
  page_size?: number;
  ordering?: string | null;
}

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
const filters = ref<UserFilter>({
  div_id: null,
  role_id: null,
  user_status: null,
  auth_status: null,
  search: null,
  page: 1,
  page_size: 20,
  ordering: "user_id",
});

// Pagination
const totalUsers = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(20);

// Advanced filters
const showAdvancedFilters = ref(false);
const dateRangeStart = ref<string>("");
const dateRangeEnd = ref<string>("");

// Constants
const FILTERS_STORAGE_KEY = "user_filters_v2";
const title = "ຂໍ້ມູນຜູ້ໃຊ້ງານ";

// Status options
const userStatusOptions = [
  { value: "", text: "ທັງໝົດ" },
  { value: "E", text: "ເປີດໃຊ້ງານ" },
  { value: "D", text: "ປິດໃຊ້ງານ" },
];

const authStatusOptions = [
  { value: "", text: "ທັງໝົດ" },
  { value: "A", text: "ອະນຸມັດແລ້ວ" },
  { value: "U", text: "ຍັງບໍ່ອະນຸມັດ" },
];

const sortOptions = [
  { value: "user_id", text: "ລະຫັດຜູ້ໃຊ້" },
  { value: "-user_id", text: "ລະຫັດຜູ້ໃຊ້ (ກົງກັນຂ້າມ)" },
  { value: "user_name", text: "ຊື່ຜູ້ໃຊ້" },
  { value: "-user_name", text: "ຊື່ຜູ້ໃຊ້ (ກົງກັນຂ້າມ)" },
  { value: "InsertDate", text: "ມື້ສ້າງ (ເກົ່າສຸດກ່ອນ)" },
  { value: "-InsertDate", text: "ມື້ສ້າງ (ໃໝ່ສຸດກ່ອນ)" },
  { value: "UpdateDate", text: "ມື້ແກ້ໄຂ (ເກົ່າສຸດກ່ອນ)" },
  { value: "-UpdateDate", text: "ມື້ແກ້ໄຂ (ໃໝ່ສຸດກ່ອນ)" },
];

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
  canRecordStatus,
  canAuthorize,
  initializeRole,
} = useRolePermissions();

// Computed properties
const usersList = ref<User[]>([]);
const roleData = computed(() => roleStore.respons_data_role || []);
const divisionData = computed(() => devision.categories || []);

const selectedDivision = computed({
  get: () => divisionData.value.find(d => d.div_id === filters.value.div_id) || null,
  set: (value) => {
    filters.value.div_id = value?.div_id || null;
  }
});

const selectedRole = computed({
  get: () => roleData.value.find(r => r.role_id === filters.value.role_id) || null,
  set: (value) => {
    filters.value.role_id = value?.role_id || null;
  }
});

// Enhanced API Functions
const fetchUsers = async (showLoading = true) => {
  try {
    if (showLoading) isLoadingUsers.value = true;
    
    const params = new URLSearchParams();
    
    // Add filters to params
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
      usersList.value = response.data.results || response.data;
      totalUsers.value = response.data.count || usersList.value.length;
      
      // Update pagination if using DRF pagination
      if (response.data.next || response.data.previous) {
        currentPage.value = filters.value.page || 1;
      }
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູໃຊ້ໄດ້",
    });
  } finally {
    if (showLoading) isLoadingUsers.value = false;
  }
};

const fetchUserStats = async () => {
  try {
    const response = await axios.get("/api/users/stats/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
};

// Enhanced user status update
const updateUserStatus = async (id: string, action: 'authorize' | 'unauthorize') => {
  try {
    isUpdatingStatus.value = true;
    const isAuthorize = action === 'authorize';
    
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງ${isAuthorize ? 'ອະນຸມັດ' : 'ຍົກເລີກອະນຸມັດ'}ຜູໃຊ້ງານ ທ່ານແນ່ໃຈແລ້ວບໍ?`,
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
        // Update local data instead of refetching all
        const userIndex = usersList.value.findIndex(u => u.user_id === id);
        if (userIndex !== -1) {
          usersList.value[userIndex].Auth_Status = isAuthorize ? 'A' : 'U';
        }
        
        await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: `${isAuthorize ? 'ອະນຸມັດ' : 'ຍົກເລີກອະນຸມັດ'}ຜູໃຊ້ງານແລ້ວ`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
      
      if (res.status === 406) {
        await CallSwal({
          icon: "warning",
          title: "ບໍ່ສາມາດດຳເນີນການໄດ້",
          text: res.data?.detail || "ເກີດຂໍ້ຜິດພາດໃນການດຳເນີນການ",
        });
      }
    }
  } catch (error: any) {
    console.error(`Error ${action} user:`, error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: error.response?.data?.detail || `ບໍ່ສາມາດ${action === 'authorize' ? 'ອະນຸມັດ' : 'ຍົກເລີກອະນຸມັດ'}ຜູໃຊ້ງານໄດ້`,
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

const updateRecordStatus = async (userId: string, status: 'on' | 'off') => {
  try {
    // Update via your existing store method
    if (status === 'on') {
      await agencyStore.updateRecordStatus(userId);
    } else {
      await agencyStore.updateRecordStatusOff(userId);
    }
    
    // Update local data
    const userIndex = usersList.value.findIndex(u => u.user_id === userId);
    if (userIndex !== -1) {
      usersList.value[userIndex].Record_Status = status === 'on' ? 'O' : 'C';
    }
  } catch (error) {
    console.error("Error updating record status:", error);
    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດແກ້ໄຂສະຖານະໄດ້",
    });
  }
};

const onDeleteUser = async (user_id: string) => {
  const confirmation = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຜູໃຊ້ນີ້?",
    showCancelButton: true,
    confirmButtonText: "ຕົກລົງ",
    cancelButtonText: "ຍົກເລີກ",
  });

  if (confirmation.isConfirmed) {
    try {
      const result = await agencyStore.DeleteUser(user_id);
      if (result) {
        // Remove from local list
        usersList.value = usersList.value.filter(u => u.user_id !== user_id);
        totalUsers.value--;
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
};

// Filter management
const saveFilters = () => {
  try {
    const filtersToSave = {
      ...filters.value,
      searchQuery: searchQuery.value,
      dateRangeStart: dateRangeStart.value,
      dateRangeEnd: dateRangeEnd.value,
      showAdvancedFilters: showAdvancedFilters.value,
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
  } catch (error) {
    console.error("Failed to save filters:", error);
  }
};

const loadFilters = () => {
  try {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved) {
      const parsedFilters = JSON.parse(saved);
      filters.value = { ...filters.value, ...parsedFilters };
      searchQuery.value = parsedFilters.searchQuery || "";
      dateRangeStart.value = parsedFilters.dateRangeStart || "";
      dateRangeEnd.value = parsedFilters.dateRangeEnd || "";
      showAdvancedFilters.value = parsedFilters.showAdvancedFilters || false;
    }
  } catch (error) {
    console.error("Failed to load filters:", error);
  }
};

const clearAllFilters = async () => {
  filters.value = {
    div_id: null,
    role_id: null,
    user_status: null,
    auth_status: null,
    search: null,
    page: 1,
    page_size: 20,
    ordering: "user_id",
  };
  searchQuery.value = "";
  dateRangeStart.value = "";
  dateRangeEnd.value = "";
  currentPage.value = 1;
  
  localStorage.removeItem(FILTERS_STORAGE_KEY);
  await fetchUsers();
};

const applyDateRange = () => {
  if (dateRangeStart.value) {
    filters.value.created_after = dayjs(dateRangeStart.value).format("YYYY-MM-DD");
  } else {
    filters.value.created_after = null;
  }
  
  if (dateRangeEnd.value) {
    filters.value.created_before = dayjs(dateRangeEnd.value).format("YYYY-MM-DD");
  } else {
    filters.value.created_before = null;
  }
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

// Quick filter buttons
const quickFilterActive = async () => {
  filters.value.user_status = "E";
  filters.value.page = 1;
  await fetchUsers();
};

const quickFilterUnauthorized = async () => {
  filters.value.auth_status = "U";
  filters.value.page = 1;
  await fetchUsers();
};

// Watchers
watch(searchQuery, (newValue) => {
  debouncedSearch(newValue);
});

watch([() => filters.value.div_id, () => filters.value.role_id], async () => {
  filters.value.page = 1;
  currentPage.value = 1;
  await fetchUsers();
  saveFilters();
});

watch([() => filters.value.user_status, () => filters.value.auth_status, () => filters.value.ordering], async () => {
  filters.value.page = 1;
  currentPage.value = 1;
  await fetchUsers();
  saveFilters();
});

watch([dateRangeStart, dateRangeEnd], () => {
  applyDateRange();
  saveFilters();
});

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
    // {
    //   title: "ສະຖານະ",
    //   value: "User_Status",
    //   align: "center",
    //   sortable: true,
    //   filterable: true,
    //   width: "100px",
    // },
    {
      title: "ອະນຸມັດ",
      value: "Auth_Status",
      align: "center",
      sortable: true,
      filterable: true,
      width: "100px",
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
    // ...(canRecordStatus.value ? [{
    //   title: "ເປິດ/ປິດ",
    //   value: "Record_Status",
    //   align: "center",
    //   sortable: false,
    //   filterable: false,
    //   width: "100px",
    // }] : []),
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
      title: "ອະນຸມັດ/ຍົກເລີກ",
      value: "confirm",
      align: "center",
      sortable: false,
      filterable: false,
      width: "120px",
    }] : []),
  ];

  return [...baseHeaders, ...actionHeaders];
});

// Lifecycle
onMounted(async () => {
  initializeRole();
  
  try {
    // Load saved filters first
    loadFilters();
    
    // Load reference data
    await Promise.all([
      devision.GetListData(),
      roleStore.GetRole(),
      roleStore.GetRoleDetail(),
    ]);

    // Fetch users with current filters
    await fetchUsers();

    // Handle URL query params
    const user_id = route.query.user_id as string;
    if (user_id) {
      // Handle any specific user_id logic if needed
    }
  } catch (error) {
    console.error("Failed to load initial data:", error);
  }
});

// Export functions for parent components
defineExpose({
  fetchUsers,
  clearAllFilters,
  fetchUserStats,
});
</script>

<template>
  <div class="user-management text-styles">
    <!-- Page Title with Statistics -->
    <v-row class="mb-4">
      <v-col cols="12">
        <GlobalTextTitleLine :title="`${title} (${formatnumber(totalUsers)})`" class="text-styles" />
      </v-col>
    </v-row>

    <v-card flat class="pa-4 text-styles">
      <!-- Quick Action Bar -->
      <v-row class="mb-4" align="center">
        <v-col cols="12" md="6" class="text-styles">
          <v-btn-toggle 
            v-model="filters.user_status" 
            color="primary" 
            group 
            variant="outlined" 
            density="compact"
            @update:model-value="fetchUsers"
            class="text-styles"
          >
            <v-btn value="" size="small" class="text-styles">ທັງໝົດ</v-btn>
            <v-btn value="E" size="small" class="text-styles">ເປີດໃຊ້ງານ</v-btn>
            <v-btn value="D" size="small" class="text-styles">ປິດໃຊ້ງານ</v-btn>
          </v-btn-toggle>

          <v-btn-toggle 
            v-model="filters.auth_status" 
            color="secondary" 
            group 
            variant="outlined" 
            density="compact"
            class="ml-4 text-styles"
            @update:model-value="fetchUsers"
          >
            <v-btn value="" size="small" class="text-styles">ທັງໝົດ</v-btn>
            <v-btn value="A" size="small" class="text-styles">ອະນຸມັດແລ້ວ</v-btn>
            <v-btn value="U" size="small" class="text-styles">ຍັງບໍ່ອະນຸມັດ</v-btn>
          </v-btn-toggle>
        </v-col>
        
        <v-col cols="12" md="6" class="text-right text-styles">
          <v-btn
            v-if="canAdd"
            color="primary"
            @click="goPath('/user/create')"
            prepend-icon="mdi-plus"
            class="text-none mr-2 text-styles"
          >
            ເພີ່ມຜູ້ໃຊ້ງານ
          </v-btn>
          
          <v-btn
            color="info"
            variant="outlined"
            @click="showAdvancedFilters = !showAdvancedFilters"
            :prepend-icon="showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            class="text-none text-styles"
          >
            ຕົວກັ່ນຕອງເພີ່ມເຕີມ
          </v-btn>
        </v-col>
      </v-row>

      <!-- Main Filters Row -->
      <v-row class="mb-4 text-styles">
        <v-col cols="12" md="4" class="text-styles">
          <v-text-field
            v-model="searchQuery"
            density="compact"
            label="ຄົ້ນຫາ..."
            placeholder="ຄົ້ນຫາຊື່, ອີເມວ, ລະຫັດ"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            :loading="isLoadingUsers"
            class="text-styles"
          />
        </v-col>

        <v-col cols="12" md="3" class="text-styles">
          <v-autocomplete
            v-model="selectedDivision"
            density="compact"
            label="ເລືອກພະແນກ"
            :items="divisionData"
            item-value="div_id"
            item-title="division_name_la"
            variant="outlined"
            clearable
            return-object
            :loading="isLoadingUsers"
            hide-details
            prepend-inner-icon="mdi-office-building"
            class="text-styles"
          >
            <template v-slot:selection="{ item }">
              <span class="text-styles">{{ item.raw.division_name_la }}</span>
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`ID: ${item.raw.div_id}`"
                :title="item.raw.division_name_la"
                class="text-styles"
              />
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" md="3" class="text-styles">
          <v-autocomplete
            v-model="selectedRole"
            density="compact"
            label="ເລືອກສິດການນຳໃຊ້"
            :items="roleData"
            item-value="role_id"
            item-title="role_name_la"
            variant="outlined"
            clearable
            return-object
            :loading="isLoadingUsers"
            hide-details
            prepend-inner-icon="mdi-shield-account"
            class="text-styles"
          >
            <template v-slot:selection="{ item }">
              <span class="text-styles">{{ item.raw.role_name_la }}</span>
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="`ID: ${item.raw.role_id}`"
                :title="item.raw.role_name_la"
                class="text-styles"
              />
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="12" md="2" class="text-styles">
          <v-btn
            color="secondary"
            variant="outlined"
            @click="clearAllFilters"
            :loading="isLoadingUsers"
            block
            prepend-icon="mdi-filter-remove"
            class="text-none text-styles"
          >
            ລ້າງຕົວກັ່ນ
          </v-btn>
        </v-col>
      </v-row>

      <!-- Advanced Filters -->
      <v-expand-transition>
        <v-card v-show="showAdvancedFilters" variant="tonal" class="mb-4 text-styles">
          <v-card-title class="text-h6 py-3 text-styles">
            <v-icon class="mr-2 text-styles">mdi-filter-variant</v-icon>
            <span class="text-styles">ຕົວກັ່ນຕອງເພີ່ມເຕີມ</span>
          </v-card-title>
          <v-card-text class="text-styles">
            <v-row class="text-styles">
              <v-col cols="12" md="3" class="text-styles">
                <v-select
                  v-model="filters.ordering"
                  density="compact"
                  label="ຈັດຮຽງຕາມ"
                  :items="sortOptions"
                  item-value="value"
                  item-title="text"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-sort"
                  class="text-styles"
                />
              </v-col>
              
              <v-col cols="12" md="3" class="text-styles">
                <v-text-field
                  v-model="dateRangeStart"
                  density="compact"
                  label="ຈາກມື້"
                  type="date"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-calendar"
                  class="text-styles"
                />
              </v-col>
              
              <v-col cols="12" md="3" class="text-styles">
                <v-text-field
                  v-model="dateRangeEnd"
                  density="compact"
                  label="ຫາມື້"
                  type="date"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-calendar"
                  class="text-styles"
                />
              </v-col>

              <v-col cols="12" md="3" class="text-styles">
                <v-select
                  v-model="filters.page_size"
                  density="compact"
                  label="ສະແດງຕໍ່ໜ້າ"
                  :items="[10, 20, 50, 100]"
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-view-list"
                  @update:model-value="changeItemsPerPage"
                  class="text-styles"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <!-- Data Table with Enhanced Features -->
      <v-data-table
        :headers="header"
        :items="usersList"
        :loading="isLoadingUsers"
        loading-text="ກຳລັງໂຫຼດຂໍ້ມູນ..."
        no-data-text="ບໍ່ມີຂໍ້ມູນ"
        class="elevation-2 user-table text-styles"
        :items-per-page="itemsPerPage"
        :server-items-length="totalUsers"
        hide-default-footer
      >
        <!-- Profile Picture -->
        <template v-slot:item.profile_picture="{ item }">
          <v-avatar size="40" class="ma-2 text-styles">
            <v-img
              v-if="item.profile_picture"
              :src="item.profile_picture"
              :alt="item.user_name"
              cover
              class="rounded-circle text-styles"
            />
            <v-icon v-else icon="mdi-account" size="24" class="text-styles" />
          </v-avatar>
        </template>

        <!-- User ID with status indicator -->
        <template v-slot:item.user_id="{ item }">
          <div class="d-flex align-center text-styles">
            <span class="text-primary font-weight-bold text-styles">{{ item.user_id }}</span>
            <v-chip
              v-if="item.User_Status === 'D'"
              color="error"
              size="x-small"
              class="ml-2 text-styles"
            >
              ປິດ
            </v-chip>
          </div>
        </template>

        <!-- User name with email -->
        <template v-slot:item.user_name="{ item }">
          <div class="text-styles">
            <div class="font-weight-medium text-styles">{{ item.user_name }}</div>
            <!-- <div class="text-caption text-medium-emphasis text-styles">{{ item.user_email || "ບໍ່ມີອີເມວ" }}</div> -->
          </div>
        </template>

        <!-- Date formatting -->
        <template v-slot:item.created_date="{ item }">
          <div class="text-center text-styles">
            <div class="text-body-2 text-styles">{{ dayjs(item.InsertDate).format("DD/MM/YYYY") }}</div>
            <div class="text-caption text-medium-emphasis text-styles">{{ dayjs(item.InsertDate).format("HH:mm") }}</div>
          </div>
        </template>

        <!-- Division info with enhanced styling -->
        <template v-slot:item.division="{ item }">
          <div class="text-center text-styles">
            <v-chip
              v-if="item.division"
              color="primary"
              variant="tonal"
              size="small"
              class="mb-1 text-styles"
            >
              {{ item.division.div_id }}
            </v-chip>
            <div class="text-caption text-styles">{{ item.division?.division_name_la || "ບໍ່ມີຂໍ້ມູນ" }}</div>
          </div>
        </template>

        <!-- Role info with enhanced styling -->
        <template v-slot:item.role="{ item }">
          <div class="text-center text-styles">
            <v-chip
              v-if="item.role"
              color="secondary"
              variant="tonal"
              size="small"
              class="mb-1 text-styles"
            >
              {{ item.role.role_id }}
            </v-chip>
            <div class="text-caption text-styles">{{ item.role?.role_name_la || "ບໍ່ມີຂໍ້ມູນ" }}</div>
          </div>
        </template>

        <!-- Auth Status -->
        <template v-slot:item.Auth_Status="{ item }">
          <v-chip
            :color="item.Auth_Status === 'A' ? 'success' : 'warning'"
            :text="item.Auth_Status === 'A' ? 'ອະນຸມັດ' : 'ລໍຖ້າ'"
            size="small"
            variant="tonal"
            class="text-styles"
          />
        </template>

        <!-- Authorization Status -->
        <template v-slot:item.confirm="{ item }">
          <v-btn
            @click="updateUserStatus(item.user_id, item.Auth_Status === 'A' ? 'unauthorize' : 'authorize')"
            :color="item.Auth_Status === 'A' ? 'success' : 'warning'"
            variant="text"
            :icon="item.Auth_Status === 'A' ? 'mdi-check-circle' : 'mdi-clock-outline'"
            size="small"
            :loading="isUpdatingStatus"
            class="text-styles"
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
            class="text-styles"
          />
        </template>

        <template v-slot:item.edit="{ item }">
          <v-btn
            :to="`/user/edit?user_id=${item.user_id}`"
            color="info"
            variant="text"
            icon="mdi-pencil-outline"
            size="small"
            class="text-styles"
          />
        </template>

        <template v-slot:item.delete="{ item }">
          <v-btn
            @click="onDeleteUser(item.user_id)"
            color="error"
            variant="text"
            icon="mdi-delete-outline"
            size="small"
            class="text-styles"
          />
        </template>

        <!-- Custom loading slot -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@5 text-styles"></v-skeleton-loader>
        </template>
      </v-data-table>

      <!-- Custom Pagination -->
      <v-row class="mt-4" align="center" justify="center text-styles">
        <v-col cols="12" md="4" class="text-styles">
          <div class="text-body-2 text-medium-emphasis text-styles">
            ສະແດງ {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalUsers) }}
            ຈາກທັງໝົດ {{ formatnumber(totalUsers) }} ລາຍການ
          </div>
        </v-col>
        <v-col cols="12" md="8" class="text-center text-styles">
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(totalUsers / itemsPerPage)"
            :total-visible="7"
            @update:model-value="changePage"
            :disabled="isLoadingUsers"
            color="primary"
            class="text-styles"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Floating Action Button for Mobile -->
    <v-fab
      v-if="canAdd"
      icon="mdi-plus"
      location="bottom end"
      app
      color="primary"
      @click="goPath('/user/create')"
      class="d-md-none text-styles"
    />
  </div>
</template>

<style scoped>
.user-management {
  background: #f9fafb;
  min-height: 100vh;
  padding-bottom: 32px;
}

.user-table {
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.v-data-table .v-data-table__th {
  background: #f1f5f9;
  font-weight: 600;
  font-size: 1rem;
  color: #374151;
}

.v-data-table .v-data-table__td {
  font-size: 0.98rem;
  vertical-align: middle;
}

.v-data-table .v-avatar {
  border: 2px solid #e0e7ef;
  background: #f3f6fa;
}

.v-chip {
  font-size: 0.85rem;
  letter-spacing: 0.01em;
}

.v-btn-toggle .v-btn {
  min-width: 90px;
}

.v-btn-toggle .v-btn.v-btn--active {
  background: #e3f2fd !important;
  color: #1976d2 !important;
}

.v-card[flat] {
  box-shadow: 0 2px 8px rgba(60,60,60,0.04);
}

.v-card-title {
  background: #f1f5f9;
  border-bottom: 1px solid #e5e7eb;
}

.v-card-text {
  background: #f9fafb;
}

.v-autocomplete, .v-select, .v-text-field {
  margin-bottom: 0 !important;
}

.v-pagination {
  margin-top: 8px;
}

@media (max-width: 960px) {
  .user-management {
    padding: 0 4px;
  }
  .v-card[flat] {
    padding: 8px !important;
  }
  .v-row, .v-col {
    margin-bottom: 0 !important;
  }
}

.v-btn.text-none {
  text-transform: none !important;
}

.v-btn[variant="outlined"] {
  border-radius: 8px;
}

.v-fab {
  position: fixed !important;
  right: 24px;
  bottom: 24px;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(60,60,60,0.18);
}

.text-h6 {
  font-size: 1.1rem;
  font-weight: 500;
}

.text-primary {
  color: #1976d2 !important;
}

.font-weight-bold {
  font-weight: 700 !important;
}

.font-weight-medium {
  font-weight: 500 !important;
}

.text-medium-emphasis {
  color: #6b7280 !important;
}

.text-caption {
  font-size: 0.85rem !important;
}

.v-switch {
  margin-top: -8px;
}

.v-skeleton-loader[type="table-row@5"] {
  min-height: 180px;
}

.text-styles {
  font-family: 'Noto Sans Lao', 'Noto Sans', Arial, sans-serif;
  font-size: 1rem;
  color: #222831;
  letter-spacing: 0.01em;
}
</style>


