<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="rounded-lg">
      <v-card-title class="pa-6 pb-4">
        <GlobalTextTitleLine :title="title" />
      </v-card-title>

      <!-- Filter and Add Button Section -->
      <v-card-text class="pa-6 pt-0">
        <!-- Single Filter Row with All Controls -->
        <v-row align="center" justify="space-between" class="mb-4 filter-row">
          <!-- Add Button -->
          <v-col cols="12" sm="6" md="2">
            <v-btn
              @click="goToCreateRoleDetail"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              class="text-none font-weight-medium mb-2 mb-md-0 add-role-btn"
              block
            >
              ເພີ່ມສິດຜູ້ນໍາໃຊ້
            </v-btn>
          </v-col>
          
          <!-- Search Input -->
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="searchQuery"
              label="ຄົ້ນຫາ"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
              @input="debounceSearch"
              @clear="clearSearch"
            />
          </v-col>
          
          <!-- Module Filter -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedModuleId"
              :items="moduleOptions"
              item-title="text"
              item-value="value"
              label="ກັ່ນຕອງຕາມໂມດູນ"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-application"
              clearable
              :loading="moduleOptionsLoading"
              @update:model-value="onModuleChange"
            />
          </v-col>
          
          <!-- Menu Filter -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedMenuId"
              :items="menuOptions"
              item-title="text"
              item-value="value"
              label="ກັ່ນຕອງຕາມເມນູຫຼັກ"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-view-dashboard"
              clearable
              :loading="menuOptionsLoading"
              :disabled="!selectedModuleId"
              @update:model-value="applyFilters"
            />
          </v-col>
          
          <!-- Role Filter -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="selectedRoleId"
              :items="roleOptions"
              item-title="text"
              item-value="value"
              label="ກັ່ນຕອງຕາມບົດບາດ"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-account-key"
              clearable
              :loading="roleOptionsLoading"
              @update:model-value="applyFilters"
            />
          </v-col>
          
          <!-- Filter Reset Button -->
          <v-col cols="12" sm="6" md="2">
            <v-btn
              @click="resetFilters"
              variant="outlined"
              prepend-icon="mdi-filter-off"
              class="text-none"
              :disabled="!hasActiveFilters"
              block
            >
              ເຄລີຍດ
            </v-btn>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="items"
          class="elevation-0 rounded-lg"
          item-value="role_id"
          :loading="loading"
          hover
          :items-per-page="20"
          :server-items-length="totalItems"
          @update:options="handlePagination"
        >
          <template #item.role_id="{ item }">
            <div>
              <div class="font-weight-bold">
                {{ item.role_detail?.role_name_la || "-" }}
              </div>
              <div class="text-caption text-grey text-styles">
                {{ item.role_id }}
              </div>
            </div>
          </template>

          <template #item.sub_menu_id="{ item }">
            <div>
              <div class="font-weight-bold">
                {{ item.fuu_details?.sub_menu_name_la || '-' }}
              </div>
              <div class="text-caption text-grey text-styles">
                {{ item.sub_menu_id || "-" }}
              </div>
            </div>
          </template>

          <template #item.main_menu="{ item }">
            <div class="text-center">
              <div class="font-weight-bold">
                {{ item.fuu_details?.menu?.menu_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
              </div>
              <div class="text-caption text-grey">
                {{ item.fuu_details?.menu?.menu_id || "-" }}
              </div>
            </div>
          </template>

          <template #item.module_info="{ item }">
            <div class="text-center">
              <div class="font-weight-bold">
                {{ getModuleInfo(item).name || "ບໍ່ມີຂໍ້ມູນ" }}
              </div>
              <div class="text-caption text-grey">
                {{ getModuleInfo(item).id || "-" }}
              </div>
            </div>
          </template>

          <!-- Permission Status Slots -->
          <template #item.New_Detail="{ item }">
            <v-chip
              :color="item.New_Detail === 1 ? 'success' : 'error'"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              <v-icon
                :icon="item.New_Detail === 1 ? 'mdi-check' : 'mdi-close'"
                size="16"
              />
              <v-tooltip activator="parent" location="top">
                {{ item.New_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
              </v-tooltip>
            </v-chip>
          </template>

          <template #item.Del_Detail="{ item }">
            <v-chip
              :color="item.Del_Detail === 1 ? 'success' : 'error'"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              <v-icon
                :icon="item.Del_Detail === 1 ? 'mdi-check' : 'mdi-close'"
                size="16"
              />
              <v-tooltip activator="parent" location="top">
                {{ item.Del_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
              </v-tooltip>
            </v-chip>
          </template>

          <template #item.Edit_Detail="{ item }">
            <v-chip
              :color="item.Edit_Detail === 1 ? 'success' : 'error'"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              <v-icon
                :icon="item.Edit_Detail === 1 ? 'mdi-check' : 'mdi-close'"
                size="16"
              />
              <v-tooltip activator="parent" location="top">
                {{ item.Edit_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
              </v-tooltip>
            </v-chip>
          </template>

          <template #item.View_Detail="{ item }">
            <v-chip
              :color="item.View_Detail === 1 ? 'success' : 'error'"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              <v-icon
                :icon="item.View_Detail === 1 ? 'mdi-check' : 'mdi-close'"
                size="16"
              />
              <v-tooltip activator="parent" location="top">
                {{ item.View_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
              </v-tooltip>
            </v-chip>
          </template>

          <template #item.Auth_Detail="{ item }">
            <v-chip
              :color="item.Auth_Detail === 1 ? 'success' : 'error'"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              <v-icon
                :icon="item.Auth_Detail === 1 ? 'mdi-check' : 'mdi-close'"
                size="16"
              />
              <v-tooltip activator="parent" location="top">
                {{ item.Auth_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
              </v-tooltip>
            </v-chip>
          </template>

          <!-- Actions Slot -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                variant="text"
                size="small"
                icon="mdi-pencil"
                @click="goToEdit(item)"
              >
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">ແກ້ໄຂ</v-tooltip>
              </v-btn>

              <v-btn
                color="error"
                variant="text"
                size="small"
                icon="mdi-delete"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="top">ລົບ</v-tooltip>
              </v-btn>

              <v-btn
                color="info"
                variant="text"
                size="small"
                icon="mdi-eye"
                @click="viewDetails(item)"
              >
                <v-icon>mdi-eye</v-icon>
                <v-tooltip activator="parent" location="top">ເບິ່ງລາຍລະອຽດ</v-tooltip>
              </v-btn>
            </div>
          </template>

          <!-- Loading Slot -->
          <template #loading>
            <v-skeleton-loader type="table-row@7" />
          </template>

          <!-- No Data Slot -->
          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">
                mdi-database-off
              </v-icon>
              <p class="text-h6 text-grey-lighten-1 mb-0">
                ບໍ່ມີຂໍ້ມູນສິດຜູ້ນໍາໃຊ້
              </p>
              <p class="text-body-2 text-grey-lighten-1 mt-2">
                ເລີ່ມຕົ້ນໂດຍການເພີ່ມສິດຜູ້ນໍາໃຊ້ໃໝ່
              </p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6 pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="error" size="28" class="mr-3">mdi-alert-circle</v-icon>
            <span>ຢືນຢັນການລົບ</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <p class="text-body-1 mb-4">ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບສິດນີ້?</p>
          <div v-if="itemToDelete" class="mb-4">
            <div class="text-body-2 text-grey-darken-1 mb-2">ລາຍລະອຽດ:</div>
            <div class="text-body-2">
              <strong>ບົດບາດ:</strong>
              {{ itemToDelete.role_detail?.role_name_la }} ({{ itemToDelete.role_id }})
            </div>
            <div class="text-body-2">
              <strong>ເມນູ:</strong>
              {{ itemToDelete.fuu_details?.sub_menu_name_la }}
            </div>
          </div>
          <v-alert type="warning" variant="tonal" class="mb-0" icon="mdi-information">
            ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false" class="text-none">
            ຍົກເລີກ
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteItem"
            :loading="deleteLoading"
            class="text-none"
          >
            ລົບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="info" size="28" class="mr-3">mdi-information</v-icon>
            <span class="text-h6 font-weight-bold">ລາຍລະອຽດສິດຜູ້ນໍາໃຊ້</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0" v-if="selectedItem">
          <v-row>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-account-key</v-icon>
                  </template>
                  <v-list-item-title>ບົດບາດ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem.role_detail?.role_name_la }} ({{ selectedItem.role_id }})
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="info">mdi-menu</v-icon>
                  </template>
                  <v-list-item-title>ເມນູຍ່ອຍ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem.fuu_details?.sub_menu_name_la }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="success">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>ລະຫັດເມນູຍ່ອຍ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.sub_menu_id }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="warning">mdi-view-dashboard</v-icon>
                  </template>
                  <v-list-item-title>ເມນູຫຼັກ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.fuu_details?.menu?.menu_name_la }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon :color="selectedItem.New_Detail === 1 ? 'success' : 'error'">
                      mdi-plus
                    </v-icon>
                  </template>
                  <v-list-item-title>ສິດເພີ່ມ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem.New_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon :color="selectedItem.Edit_Detail === 1 ? 'success' : 'error'">
                      mdi-pencil
                    </v-icon>
                  </template>
                  <v-list-item-title>ສິດແກ້ໄຂ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem.Edit_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon :color="selectedItem.Del_Detail === 1 ? 'success' : 'error'">
                      mdi-delete
                    </v-icon>
                  </template>
                  <v-list-item-title>ສິດລົບ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem.Del_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon :color="selectedItem.Auth_Detail === 1 ? 'success' : 'error'">
                      mdi-check-circle
                    </v-icon>
                  </template>
                  <v-list-item-title>ສິດອະນຸມັດ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem.Auth_Detail === 1 ? "ອະນຸຍາດ" : "ບໍ່ອະນຸຍາດ" }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="detailsDialog = false" class="text-none">
            ປິດ
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="goToEdit(selectedItem)"
            class="text-none font-weight-medium"
          >
            ແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000" location="top">
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

// Types/Interfaces
interface RoleDetailResponse {
  id: number
  role_id: string
  sub_menu_id: string
  New_Detail: number
  Del_Detail: number
  Edit_Detail: number
  View_Detail: number
  Auth_Detail: number
  fuu_details: {
    sub_menu_id: string
    sub_menu_name_la: string
    sub_menu_name_en: string
    sub_menu_icon?: string
    sub_menu_order?: string
    sub_menu_urls?: string
    Record_Status: string
    Auth_Status: string
    menu: {
      menu_id: string
      menu_name_la: string
      menu_name_en: string
    }
  }
  role_detail: {
    role_id: string
    role_name_la: string
    role_name_en: string
    record_Status: string
  }
}

interface Role {
  role_id: string
  role_name_la: string
  role_name_en: string
  Record_Status: string
  Auth_Status: string
}

interface MainMenu {
  menu_id: string
  menu_name_la: string
  menu_name_en: string
  menu_icon?: string
  menu_order?: number
  Record_Status: string
  Auth_Status: string
  module_Id: string
}

interface Module {
  module_Id: string
  module_name_la: string
  module_name_en: string
  module_icon?: string
  module_order?: number
  Record_Status: string
  Auth_Status: string
}

// Composables
const router = useRouter()

// Reactive data
const items = ref<RoleDetailResponse[]>([])
const selectedRoleId = ref<string | null>(null)
const selectedMenuId = ref<string | null>(null)
const selectedModuleId = ref<string | null>(null)
const searchQuery = ref('')
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Options for dropdowns
const roleOptions = ref<Array<{ text: string; value: string | null }>>([])
const menuOptions = ref<Array<{ text: string; value: string | null }>>([])
const moduleOptions = ref<Array<{ text: string; value: string | null }>>([])

// Loading states
const loading = ref(false)
const deleteLoading = ref(false)
const roleOptionsLoading = ref(false)
const menuOptionsLoading = ref(false)
const moduleOptionsLoading = ref(false)


// Dialog states
const deleteDialog = ref(false)
const detailsDialog = ref(false)

// Messages
const showError = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Selected items
const itemToDelete = ref<RoleDetailResponse | null>(null)
const selectedItem = ref<RoleDetailResponse | null>(null)
const allModules = ref<Module[]>([])

// Pagination
const totalItems = ref(0)
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Constants
const title = "ຈັດການສິດຜູ້ນໍາໃຊ້ລະບົບ"

// Table headers
const headers = [
  {
    title: "ບົດບາດ",
    key: "role_id",
    align: "start" as const,
    width: "180px",
  },
  {
    title: "ເມນູຍ່ອຍ",
    key: "sub_menu_id",
    align: "start" as const,
    width: "200px",
  },
  {
    title: "ເມນູຫຼັກ",
    key: "main_menu",
    align: "center" as const,
    width: "180px",
  },
  {
    title: "ໂມດູນ",
    key: "module_info",
    align: "center" as const,
    width: "160px",
  },
  {
    title: "ເພີ່ມ",
    key: "New_Detail",
    align: "center" as const,
    width: "80px",
  },
  {
    title: "ແກ້ໄຂ",
    key: "Edit_Detail",
    align: "center" as const,
    width: "80px",
  },
  {
    title: "ລົບ",
    key: "Del_Detail",
    align: "center" as const,
    width: "80px",
  },
  {
    title: "ກວດສອບ",
    key: "View_Detail",
    align: "center" as const,
    width: "80px",
  },
  {
    title: "ອະນຸມັດ",
    key: "Auth_Detail",
    align: "center" as const,
    width: "80px",
  },
  {
    title: "ການປະຕິບັດ",
    key: "actions",
    sortable: false,
    align: "center" as const,
    width: "150px",
  },
]

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(selectedRoleId.value || selectedMenuId.value || selectedModuleId.value || searchQuery.value)
})

// Helper functions to get module info
const getModuleName = (item: RoleDetailResponse) => {
  // Since there's no direct module info in the response, we'll extract from menu structure
  // You might need to modify this based on your actual module mapping
  const menuId = item.fuu_details?.menu?.menu_id
  if (!menuId) return ''
  
  // Extract module prefix from menu_id (e.g., "GL_NOTE" -> "GL", "MM-GL" -> "MM-GL")
  const modulePrefix = menuId.includes('_') ? menuId.split('_')[0] : 
                      menuId.includes('-') ? menuId.split('-').slice(0, 2).join('-') : menuId
  
  // Map common module prefixes to names
  const moduleMap: Record<string, string> = {
    'GL': 'ບັນຊີທົ່ວໄປ',
    'MM': 'ຂໍ້ມູນຫຼັກ', 
    'MM-GL': 'ຂໍ້ມູນຫຼັກ-ບັນຊີ',
    'RP': 'ລາຍງານ',
    'UR': 'ຜູ້ໃຊ້ລະບົບ',
    'UR-SYS': 'ຈັດການລະບົບ',
    'AS': 'ຊັບສິນ',
    'MM_MASTER': 'ຂໍ້ມູນຫຼັກ'
  }
  
  return moduleMap[modulePrefix] || modulePrefix
}

const getModuleId = (item: RoleDetailResponse) => {
  const menuId = item.fuu_details?.menu?.menu_id
  if (!menuId) return ''
  
  // Extract module prefix from menu_id
  return menuId.includes('_') ? menuId.split('_')[0] : 
         menuId.includes('-') ? menuId.split('-').slice(0, 2).join('-') : menuId
}

// Methods
const fetchRoleDetails = async () => {
  loading.value = true
  try {
    // Build query parameters  
    const params = new URLSearchParams()
    
    if (selectedRoleId.value) params.append('role_id', selectedRoleId.value)
    if (selectedMenuId.value) params.append('menu_id', selectedMenuId.value)
    if (searchQuery.value) params.append('search', searchQuery.value)
    
    // Add pagination
    params.append('page', currentPage.value.toString())
    params.append('page_size', itemsPerPage.value.toString())

    const response = await axios.get<RoleDetailResponse[]>(`/api/role-details/?${params}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      let filteredData = response.data
      
      // Apply client-side module filtering since API might not support it directly
      if (selectedModuleId.value) {
        filteredData = response.data.filter(item => {
          const itemModuleId = getModuleId(item)
          return itemModuleId === selectedModuleId.value
        })
      }
      
      items.value = filteredData
      totalItems.value = filteredData.length
      
      // Generate module options if we haven't fetched them yet
      if (moduleOptions.value.length <= 1) {
        generateModuleOptionsFromItems()
      }
    }
  } catch (error: any) {
    console.error("Error fetching role details:", error)
    showError.value = true
    errorMessage.value = error.response?.data?.detail || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ"
  } finally {
    loading.value = false
  }
}

const fetchRoleOptions = async () => {
  roleOptionsLoading.value = true
  try {
    const response = await axios.get<Role[]>("/api/roles/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      const options = response.data.map((role) => ({
        text: `${role.role_id} - ${role.role_name_la}`,
        value: role.role_id,
      }))
      
      roleOptions.value = [
        { text: "ທັງໝົດ", value: null },
        ...options.sort((a, b) => a.value.localeCompare(b.value))
      ]
    }
  } catch (error: any) {
    console.error("Error fetching role options:", error)
  } finally {
    roleOptionsLoading.value = false
  }
}
const fetchModuleOptions = async () => {
  moduleOptionsLoading.value = true
  try {
    const response = await axios.get<Module[]>("/api/modules/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      allModules.value = response.data // <-- Store all modules here
      const options = response.data.map((module) => ({
        text: `${module.module_Id} - ${module.module_name_la}`,
        value: module.module_Id,
      }))
      moduleOptions.value = [
        { text: "ທັງໝົດ", value: null },
        ...options.sort((a, b) => a.value.localeCompare(b.value))
      ]
    }
  } catch (error: any) {
    console.error("Error fetching module options:", error)
    generateModuleOptionsFromItems()
  } finally {
    moduleOptionsLoading.value = false
  }
}

const generateModuleOptionsFromItems = () => {
  const moduleMap = new Map<string, string>()
  
  items.value.forEach(item => {
    const moduleId = getModuleId(item)
    const moduleName = getModuleName(item)
    if (moduleId && !moduleMap.has(moduleId)) {
      moduleMap.set(moduleId, moduleName)
    }
  })

  const options = Array.from(moduleMap.entries()).map(([id, name]) => ({
    text: `${id} - ${name}`,
    value: id,
  }))
  
  options.sort((a, b) => a.value.localeCompare(b.value))
  
  moduleOptions.value = [
    { text: "ທັງໝົດ", value: null },
    ...options
  ]
}

const fetchMenuOptions = async (moduleId?: string) => {
  menuOptionsLoading.value = true
  try {
    const params = new URLSearchParams()
    if (moduleId) params.append('module_Id', moduleId)
    
    const response = await axios.get<MainMenu[]>(`/api/main-menus/?${params}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      const options = response.data.map((menu) => ({
        text: `${menu.menu_id} - ${menu.menu_name_la}`,
        value: menu.menu_id,
      }))
      
      menuOptions.value = [
        { text: "ທັງໝົດ", value: null },
        ...options.sort((a, b) => a.value.localeCompare(b.value))
      ]
    }
  } catch (error: any) {
    console.error("Error fetching menu options:", error)
  } finally {
    menuOptionsLoading.value = false
  }
}

const onModuleChange = () => {
  selectedMenuId.value = null
  if (selectedModuleId.value) {
    fetchMenuOptions(selectedModuleId.value)
  } else {
    // Reset menu options to show all when no module is selected
    fetchMenuOptions()
  }
  applyFilters()
}

const applyFilters = () => {
  currentPage.value = 1
  fetchRoleDetails()
}

const resetFilters = () => {
  selectedRoleId.value = null
  selectedMenuId.value = null
  selectedModuleId.value = null
  searchQuery.value = ''
  currentPage.value = 1
  
  // Reset menu options to all
  menuOptions.value = [{ text: "ທັງໝົດ", value: null }]
  
  fetchRoleDetails()
}

const debounceSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    applyFilters()
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  applyFilters()
}

const handlePagination = (options: any) => {
  currentPage.value = options.page
  itemsPerPage.value = options.itemsPerPage
  fetchRoleDetails()
}

const goToCreateRoleDetail = () => {
  const query: any = {}
  if (selectedRoleId.value) query.role_id = selectedRoleId.value
  router.push({ path: '/roledetail/create', query })
}

const goToEdit = (item: RoleDetailResponse) => {
  router.push({
    path: '/roledetail/update',
    query: {
      role_id: item.role_id,
      sub_menu_id: item.sub_menu_id
    }
  })
}

const confirmDelete = (item: RoleDetailResponse) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const viewDetails = (item: RoleDetailResponse) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const deleteItem = async () => {
  if (!itemToDelete.value) return

  deleteLoading.value = true
  try {
    const roleId = itemToDelete.value.role_id
    const subMenuId = itemToDelete.value.sub_menu_id

    await axios.delete(`/api/roledetail-delete?role_id=${roleId}&sub_menu_id=${subMenuId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    deleteDialog.value = false
    itemToDelete.value = null
    successMessage.value = "ລົບສິດຜູ້ນໍາໃຊ້ສຳເລັດແລ້ວ"
    showSuccess.value = true
    
    // Refresh data
    await fetchRoleDetails()
  } catch (error: any) {
    console.error('Error deleting item:', error)
    showError.value = true
    errorMessage.value = error.response?.data?.detail || 'ເກີດຂໍ້ຜິດພາດໃນການລົບ'
  } finally {
    deleteLoading.value = false
  }
}

const getModuleInfo = (item: RoleDetailResponse) => {
  const menuId = item.fuu_details?.menu?.menu_id
  if (!menuId) return { id: '', name: '' }
  // Try to match module_Id as prefix of menu_id (before _ or -)
  let moduleId = ''
  if (menuId.includes('_')) {
    moduleId = menuId.split('_')[0]
  } else if (menuId.includes('-')) {
    moduleId = menuId.split('-')[0]
  } else {
    moduleId = menuId
  }
  const found = allModules.value.find(m => m.module_Id === moduleId)
  return {
    id: found?.module_Id || moduleId,
    name: found?.module_name_la || ''
  }
}

// Lifecycle
onMounted(async () => {
  await fetchRoleOptions()
  await fetchModuleOptions() // <-- Add this!
  await fetchRoleDetails()
  await fetchMenuOptions()
})
</script>

<style scoped>
.text-styles {
  font-size: 11px;
}

.add-role-btn {
  min-width: 160px;
}

/* Filter Row Styling */
.filter-row {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 12px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
  margin-bottom: 20px !important;
}

.filter-input {
  height: 40px;
}

.filter-btn {
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Input Field Styling */
:deep(.filter-input .v-field) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:deep(.filter-input .v-field:hover) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

:deep(.filter-input .v-field--focused) {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

/* Responsive adjustments */
@media (max-width: 1280px) {
  .filter-row {
    padding: 8px 4px;
  }
}

@media (max-width: 960px) {
  .filter-row {
    background: #ffffff;
    box-shadow: none;
    border: none;
    border-radius: 0;
    padding: 0;
  }
  
  .filter-btn,
  .filter-input {
    margin-bottom: 8px;
  }
}

.v-data-table {
  border: 1px solid #e0e0e0;
}

.v-data-table-header {
  background-color: #f5f5f5;
}

.v-data-table .v-data-table__td {
  border-bottom: 1px solid #f0f0f0;
}

.v-chip {
  font-size: 11px;
}
</style>