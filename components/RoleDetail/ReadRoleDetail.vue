<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="rounded-lg">
      <v-card-title class="pa-6 pb-4">
        <GlobalTextTitleLine :title="title" />
      </v-card-title>
      
      <!-- Filter and Add Button Section -->
      <v-card-text class="pa-6 pt-0">
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedRoleId"
              :items="roleOptions"
              item-title="text"
              item-value="value"
              label="ກັ່ນຕອງຕາມບົດບາດ"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-filter-variant"
              clearable
              :loading="roleOptionsLoading"
              @update:model-value="filterByRole"
              class="role-filter"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <v-list-item-title>{{ item.raw.text }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.raw.subtitle">
                    {{ item.raw.subtitle }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-spacer />
          <v-col cols="auto">
            <v-btn
              @click="goPath('/roledetail/create')"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              class="text-none font-weight-medium"
            >
              ເພີ່ມສິດຜູ້ນໍາໃຊ້
            </v-btn>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          class="elevation-0 rounded-lg"
          item-value="role_id"
          :loading="loading"
          hover
        >

         <template #item.role_id="{ item }">
            <div>
              <div class="font-weight-bold">{{ item.role_id }}</div>
              <div class="text-caption text-grey text-styles">
                {{ item.role_detail?.role_name_la || '-' }}
              </div>
            </div>
          </template>

          <template #item.function_id="{ item }">
            <div>
              <div class="font-weight-bold">{{ item.function_id }}</div>
              <div class="text-caption text-grey text-styles">
                {{ item.fuu_details?.description_la || '-' }}
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
                @click="goPath(`/roledetail/update?role_id=${item.role_id}&fun_id=${item.function_id}`)"
              >
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">
                  ແກ້ໄຂ
                </v-tooltip>
              </v-btn>
              
              <v-btn
                color="error"
                variant="text"
                size="small"
                icon="mdi-delete"
                @click="confirmDelete(item)"
              >
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="top">
                  ລົບ
                </v-tooltip>
              </v-btn>
            </div>
          </template>

          <!-- Loading Slot -->
          <template #loading>
            <v-skeleton-loader type="table-row@5" />
          </template>

          <!-- No Data Slot -->
          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">
                mdi-database-off
              </v-icon>
              <p class="text-h6 text-grey-lighten-1 mb-0">
                ບໍ່ມີຂໍ້ມູນ
              </p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6 pa-6 pb-4">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          ຢືນຢັນການລົບ
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບສິດນີ້?
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteDialog = false"
            class="text-none"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteItem"
            class="text-none"
          >
            ລົບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/helpers/axios'
import { RoleDetailModel } from '~/models'
import { useRouter } from 'vue-router'

// Define Role interface for the API response
interface Role {
  role_id: number
  role_name_la: string
  role_name_en?: string
  // Add other role properties as needed
}

const router = useRouter()
const items = ref<RoleDetailModel.RoleDetailResponse[]>([])
const selectedRoleId = ref<number | null>(null)
const roleOptions = ref<Array<{ text: string; value: number | null; subtitle?: string }>>([])
const loading = ref(false)
const roleOptionsLoading = ref(false)
const deleteDialog = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const itemToDelete = ref<RoleDetailModel.RoleDetailResponse | null>(null)

const title = 'ຈັດການສິດຜູ້ນໍາໃຊ້ລະບົບ'

const headers = [
  { 
    title: 'ລະຫັດສິດ', 
    key: 'role_id',
    align: 'center' as const,
    width: '120px'
  },
  { 
    title: 'ລະຫັດຟັງຊັ້ນ', 
    key: 'function_id',
    align: 'center' as const,
    width: '140px'
  },
  { 
    title: 'ເພີ່ມ', 
    key: 'New_Detail',
    align: 'center' as const,
    width: '100px'
  },
  { 
    title: 'ລົບ', 
    key: 'Del_Detail',
    align: 'center' as const,
    width: '100px'
  },
  { 
    title: 'ແກ້ໄຂ', 
    key: 'Edit_Detail',
    align: 'center' as const,
    width: '100px'
  },
  { 
    title: 'ອະນຸມັດ', 
    key: 'Auth_Detail',
    align: 'center' as const,
    width: '100px'
  },
  { 
    title: 'ເຫດການ', 
    key: 'actions', 
    sortable: false,
    align: 'center' as const,
    width: '120px'
  },
]

// Computed property for filtered items
const filteredItems = computed(() => {
  if (!selectedRoleId.value) {
    return items.value
  }
  return items.value.filter(item => item.role_id === selectedRoleId.value)
})

// Fetch roles from API for dropdown
const fetchRoleOptions = async () => {
  roleOptionsLoading.value = true
  try {
    const res = await axios.get<Role[]>('api/roles/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 200) {
      // Remove duplicates using Map to ensure unique role_id
      const uniqueRolesMap = new Map()
      
      res.data.forEach(role => {
        if (role.role_id && !uniqueRolesMap.has(role.role_id)) {
          uniqueRolesMap.set(role.role_id, role)
        }
      })
      
      // Create dropdown options from unique roles
      const options = Array.from(uniqueRolesMap.values()).map(role => ({
        text: `${role.role_id} - ${role.role_name_la}`,
        value: role.role_id,
        subtitle: `ລະຫັດ: ${role.role_id}`
      }))
      
      // Sort by role_id
      options.sort((a, b) => a.value - b.value)
      
      // Add "All" option at the beginning
      roleOptions.value = [
        {
          text: 'ທັງໝົດ',
          value: null,
          subtitle: 'ສະແດງທຸກບົດບາດ'
        },
        ...options
      ]
      
      console.log('Fetched unique role options from API:', roleOptions.value)
      console.log('Total unique roles:', options.length)
    }
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດລາຍການບົດບາດ'
    
    // Fallback: Generate options from current items if API fails
    generateRoleOptionsFromItems()
  } finally {
    roleOptionsLoading.value = false
  }
}

// Fallback function to generate role options from current items
const generateRoleOptionsFromItems = () => {
  const roleMap = new Map()
  
  items.value.forEach(item => {
    const roleId = item.role_id
    const roleName = item.role_detail?.role_name_la
    
    if (roleId && !roleMap.has(roleId)) {
      roleMap.set(roleId, {
        role_id: roleId,
        role_name_la: roleName
      })
    }
  })
  
  const options = Array.from(roleMap.values()).map(role => ({
    text: role.role_name_la 
      ? `${role.role_id} - ${role.role_name_la}`
      : `ບົດບາດ ${role.role_id}`,
    value: role.role_id,
    subtitle: role.role_name_la ? `ລະຫັດ: ${role.role_id}` : undefined
  }))
  
  options.sort((a, b) => a.value - b.value)
  
  roleOptions.value = [
    {
      text: 'ທັງໝົດ',
      value: null,
      subtitle: 'ສະແດງທຸກບົດບາດ'
    },
    ...options
  ]
  
  console.log('Generated fallback role options:', roleOptions.value)
}

// Fetch main role details data
const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.get<RoleDetailModel.RoleDetailResponse[]>('api/role-details', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    if (res.status === 200) {
      items.value = res.data
    }
  } catch (error: any) {
    console.error('Error fetching data:', error)
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
  } finally {
    loading.value = false
  }
}

// Filter by role
const filterByRole = async () => {
  if (selectedRoleId.value) {
    loading.value = true
    try {
      const res = await axios.get<RoleDetailModel.RoleDetailResponse[]>(
        `api/role-details/?role_id=${selectedRoleId.value}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      if (res.status === 200) {
        items.value = res.data
      }
    } catch (error: any) {
      console.error('Error filtering data:', error)
      showError.value = true
      errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການກັ່ນຕອງຂໍ້ມູນ'
    } finally {
      loading.value = false
    }
  } else {
    // If no role selected, fetch all data
    await fetchData()
  }
}

// Navigation
const goPath = (path: string) => {
  router.push(path)
}

// Delete confirmation
const confirmDelete = (item: RoleDetailModel.RoleDetailResponse) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

// Delete item
const deleteItem = async () => {
  if (itemToDelete.value) {
    try {
      // Add your delete API call here
      // await axios.delete(`api/role-details/${itemToDelete.value.role_id}`)
      
      // Remove item from local array for now
      const index = items.value.findIndex(item => 
        item.role_id === itemToDelete.value?.role_id && 
        item.function_id === itemToDelete.value?.function_id
      )
      if (index > -1) {
        items.value.splice(index, 1)
      }
      
      deleteDialog.value = false
      itemToDelete.value = null
    } catch (error: any) {
      console.error('Error deleting item:', error)
      showError.value = true
      errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົບ'
    }
  }
}

// Initialize data on component mount
onMounted(async () => {
  // Fetch both role options and role details data
  await Promise.all([
    fetchRoleOptions(),
    fetchData()
  ])
})
</script>

<style scoped>
.role-filter :deep(.v-field__outline) {
  border-radius: 8px;
}

:deep(.v-data-table__wrapper) {
  border-radius: 12px;
  border: 1px solid rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

:deep(.v-data-table__tr.v-data-table__tr--selected) {
  background-color: transparent !important;
}

:deep(.v-data-table__tr.v-data-table__tr--selected:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

/* Custom styles for dropdown items */
:deep(.v-list-item-title) {
  font-weight: 500;
}

:deep(.v-list-item-subtitle) {
  font-size: 0.875rem;
  opacity: 0.7;
}
</style>