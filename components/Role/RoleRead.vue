<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12">
        <!-- Header -->
        <v-card elevation="0" class="rounded-lg mb-6">
          <v-card-title class="pa-8 pb-6">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-3" size="28">mdi-shield-account</v-icon>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-1 text-styles">
                    ຈັດການສິດທິ
                  </h2>
                  <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
                    ສະແດງຂໍ້ມູນສິດທິໃນລະບົບ
                  </p>
                </div>
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                @click="goPath('/role/create')"
                class="text-none"
              >
                ເພີ່ມສິດທິ
              </v-btn>
            </div>
          </v-card-title>

          <!-- Filters Section -->
          <v-card-text class="pa-6 pt-0">
            <v-row align="center" class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="ຄົ້ນຫາສິດທິ..."
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="statusFilter"
                  :items="statusOptions"
                  item-title="label"
                  item-value="value"
                  label="ກັ່ນຕອງສະຖານະ"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-filter"
                  clearable
                  hide-details
                  @update:model-value="fetchRoles"
                />
              </v-col>
            </v-row>

            <!-- Role Table -->
            <v-data-table
              :headers="headers"
              :items="roles"
              :loading="loading"
              :search="search"
              class="elevation-0 rounded-lg custom-table"
              item-value="role_id"
              hover
              :items-per-page="10"
            >
              <!-- Role ID Column -->
              <template #item.role_id="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" color="primary" variant="tonal" class="mr-3">
                    <span class="font-weight-bold text-caption">
                      {{ String(item.role_id).substring(0, 2) || 'RL' }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.role_id || '-' }}</div>
                    <div class="text-caption text-grey">ລະຫັດສິດທິ</div>
                  </div>
                </div>
              </template>

              <!-- Role Name Column -->
              <template #item.role_name_la="{ item }">
                <div>
                  <div class="font-weight-medium">{{ item.role_name_la || '-' }}</div>
                  <div class="text-caption text-grey">{{ item.role_name_en || 'ບໍ່ມີລາຍລະອຽດ' }}</div>
                </div>
              </template>
              <!-- Status Column -->

              <!-- Status Column -->
              <template #item.record_Status="{ item }">
                <v-chip
                  :color="item.record_Status === 'O' ? 'success' : item.record_Status === 'C' ? 'warning' : 'error'"
                  variant="tonal"
                  size="small"
                  :prepend-icon="item.record_Status === 'O' ? 'mdi-check-circle' : item.record_Status === 'C' ? 'mdi-clock' : 'mdi-close-circle'"
                  class="font-weight-medium"
                >
                  {{ item.record_Status === 'O' ? 'ເປີດໃຊ້' : item.record_Status === 'C' ? 'ລໍຖ້າອະນຸມັດ' : 'ປິດໃຊ້' }}
                </v-chip>
              </template>

              <!-- Maker Info Column -->
              <template #item.maker_info="{ item }">
                <div v-if="item.Maker_Id || item.Maker_DT_Stamp">
                  <div class="text-body-2">{{ item.Maker_Id?.username || 'ບໍ່ມີຂໍ້ມູນ' }}</div>
                  <div class="text-caption text-grey">
                    {{ formatDateTime(item.Maker_DT_Stamp) }}
                  </div>
                </div>
                <div v-else class="text-grey">-</div>
              </template>

              <!-- Checker Info Column -->
              <template #item.checker_info="{ item }">
                <div v-if="item.Checker_Id || item.Checker_DT_Stamp">
                  <div class="text-body-2">{{ item.Checker_Id?.username || 'ບໍ່ມີຂໍ້ມູນ' }}</div>
                  <div class="text-caption text-grey">
                    {{ formatDateTime(item.Checker_DT_Stamp) }}
                  </div>
                </div>
                <div v-else class="text-grey">-</div>
              </template>

              <!-- Actions Column -->
              <template #item.actions="{ item }">
                <div class="d-flex align-center gap-1">
                  <!-- Edit Button -->
                  <v-btn
                    color="primary"
                    variant="text"
                    size="small"
                    icon
                    @click="goPath(`/role/update?role_id=${item.role_id}`)"
                    class="action-btn"
                  >
                    <v-icon size="20">mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">
                      ແກ້ໄຂ
                    </v-tooltip>
                  </v-btn>

                  <!-- Toggle Status Button -->
                  <v-btn
                    :color="item.is_active ? 'warning' : 'success'"
                    variant="text"
                    size="small"
                    icon
                    @click="toggleRoleStatus(item)"
                    class="action-btn"
                  >
                    <v-icon size="20">
                      {{ item.is_active ? 'mdi-pause' : 'mdi-play' }}
                    </v-icon>
                    <v-tooltip activator="parent" location="top">
                      {{ item.is_active ? 'ປິດໃຊ້' : 'ເປີດໃຊ້' }}
                    </v-tooltip>
                  </v-btn>

                  <!-- Delete Button -->
                  <v-btn
                    color="error"
                    variant="text"
                    size="small"
                    icon
                    @click="openDeleteDialog(item)"
                    class="action-btn"
                  >
                    <v-icon size="20">mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">
                      ລົບ
                    </v-tooltip>
                  </v-btn>

                  <!-- View Details Button -->
                  <v-btn
                    color="info"
                    variant="text"
                    size="small"
                    icon
                    @click="viewDetails(item)"
                    class="action-btn"
                  >
                    <v-icon size="20">mdi-eye</v-icon>
                    <v-tooltip activator="parent" location="top">
                      ເບິ່ງລາຍລະອຽດ
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
                    mdi-shield-off
                  </v-icon>
                  <p class="text-h6 text-grey-lighten-1 mb-2">
                    ບໍ່ມີຂໍ້ມູນສິດທິ
                  </p>
                  <p class="text-body-2 text-grey-lighten-1 mb-4">
                    ເລີ່ມຕົ້ນໂດຍການເພີ່ມສິດທິໃໝ່
                  </p>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    @click="goPath('/role/create')"
                    prepend-icon="mdi-plus"
                  >
                    ເພີ່ມສິດທິ
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="error" size="28" class="mr-3">mdi-alert-circle</v-icon>
            <span class="text-h6 font-weight-bold">ຢືນຢັນການລົບ</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <p class="text-body-1 mb-4">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບສິດທິ <strong>{{ deleteItem?.role_name }}</strong>?
          </p>
          <div v-if="deleteItem" class="mb-4">
            <div class="text-body-2 text-grey-darken-1 mb-2">ລາຍລະອຽດ:</div>
            <div class="text-body-2"><strong>ລະຫັດ:</strong> {{ deleteItem.role_id }}</div>
            <div class="text-body-2"><strong>ສະຖານະ:</strong> {{ deleteItem.is_active ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}</div>
          </div>
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-0"
            icon="mdi-information"
          >
            ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້
          </v-alert>
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
            @click="deleteRole"
            :loading="deleteLoading"
            class="text-none font-weight-medium"
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
            <v-icon color="info" size="28" class="mr-3">mdi-shield-account</v-icon>
            <span class="text-h6 font-weight-bold">ລາຍລະອຽດສິດທິ</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0" v-if="selectedItem">
          <v-row>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon color="success">mdi-shield</v-icon>
                    </template>
                    <v-list-item-title>ຊື່ສິດທິ (ລາວ)</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedItem.role_name_la || '-' }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon color="info">mdi-translate</v-icon>
                    </template>
                    <v-list-item-title>ຊື່ສິດທິ (ອັງກິດ)</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedItem.role_name_en || '-' }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon :color="selectedItem.record_Status === 'O' ? 'success' : selectedItem.record_Status === 'C' ? 'warning' : 'error'">
                        {{ selectedItem.record_Status === 'O' ? 'mdi-check-circle' : selectedItem.record_Status === 'C' ? 'mdi-clock' : 'mdi-close-circle' }}
                      </v-icon>
                    </template>
                    <v-list-item-title>ສະຖານະ</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ selectedItem.record_Status === 'O' ? 'ເປີດໃຊ້' : selectedItem.record_Status === 'C' ? 'ລໍຖ້າອະນຸມັດ' : 'ປິດໃຊ້' }}
                    </v-list-item-subtitle>
                  </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="warning">mdi-account-plus</v-icon>
                  </template>
                  <v-list-item-title>ຜູ້ສ້າງ</v-list-item-title>
                  <v-list-item-subtitle>
                    <div>{{ selectedItem.Maker_Id?.username || 'ບໍ່ມີຂໍ້ມູນ' }}</div>
                    <div class="text-caption">{{ formatDateTime(selectedItem.Maker_DT_Stamp) }}</div>
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="purple">mdi-account-check</v-icon>
                  </template>
                  <v-list-item-title>ຌູ້ກວດສອບ</v-list-item-title>
                  <v-list-item-subtitle>
                    <div>{{ selectedItem.Checker_Id?.username || 'ຍັງບໍ່ໄດ້ກວດສອບ' }}</div>
                    <div v-if="selectedItem.Checker_DT_Stamp" class="text-caption">
                      {{ formatDateTime(selectedItem.Checker_DT_Stamp) }}
                    </div>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="detailsDialog = false"
            class="text-none"
          >
            ປິດ
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="goPath(`/role/update/${selectedItem?.role_id}`)"
            class="text-none font-weight-medium"
          >
            ແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
          icon="mdi-close"
          size="small"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/helpers/axios'

// Types
interface Role {
  role_id: string
  role_name_la?: string
  role_name_en?: string
  record_Status?: string
  Maker_Id?: {
    username: string
  } | null
  Maker_DT_Stamp?: string | null
  Checker_Id?: {
    username: string
  } | null
  Checker_DT_Stamp?: string | null
  Auth_Status?: string | null
  Once_Auth?: string | null
}

const router = useRouter()
const route = useRoute()

// Reactive state
const loading = ref(false)
const deleteLoading = ref(false)
const roles = ref<Role[]>([])
const search = ref('')
const statusFilter = ref('')
const deleteDialog = ref(false)
const detailsDialog = ref(false)
const deleteItem = ref<Role | null>(null)
const selectedItem = ref<Role | null>(null)

// Table headers
const headers = [
  { title: 'ລະຫັດສິດທິ', key: 'role_id', align: 'start' as const, width: '150px' },
  { title: 'ຊື່ສິດທິ', key: 'role_name_la', align: 'start' as const },
  { title: 'ສະຖານະ', key: 'record_Status', align: 'center' as const, width: '120px' },
  { title: 'ຜູ້ສ້າງ', key: 'maker_info', align: 'center' as const, width: '150px' },
  { title: 'ຜູ້ກວດສອບ', key: 'checker_info', align: 'center' as const, width: '150px' },
  { title: 'ການປະຕິບັດ', key: 'actions', sortable: false, align: 'center' as const, width: '180px' }
]

// Status filter options
const statusOptions = [
  { label: 'ທັງໝົດ', value: '' },
  { label: 'ເປີດໃຊ້', value: 'O' },
  { label: 'ລໍຖ້າອະນຸມັດ', value: 'C' },
  { label: 'ປິດໃຊ້', value: 'I' }
]

// Snackbar state
const snackbar = ref<SnackbarState>({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Computed properties
const filteredRoles = computed(() => {
  if (!statusFilter.value) return roles.value
  return roles.value.filter(role => role.record_Status === statusFilter.value)
})


// Helper functions
const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const goPath = (path: string) => {
  router.push(path)
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.icon = icon
  snackbar.value.show = true
}

// API functions
const fetchRoles = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (statusFilter.value === 'active') params.is_active = true
    if (statusFilter.value === 'inactive') params.is_active = false

    const response = await axios.get('/api/roles/', {
      params,
      headers: getAuthHeaders()
    })
    
    if (response.status === 200) {
      roles.value = response.data
      console.log('Roles data:', response.data)
    }
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນສິດທິ'
    
    showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const toggleRoleStatus = async (role: Role) => {
  // Example: toggle between 'A' (active) and 'I' (inactive)
  const newStatus = role.record_Status === 'O' ? 'I' : 'O'
  try {
    const response = await axios.patch(`/api/roles/${role.role_id}/`, {
      record_Status: newStatus
    }, {
      headers: getAuthHeaders() 
    })
    if (response.status === 200) {
      const action = newStatus === 'O' ? 'ເປີດໃຊ້' : 'ປິດໃຊ້'
      showSnackbar(`${action}ສິດທິສຳເລັດ`, 'success', 'mdi-check-circle')
      await fetchRoles()
    }
  } catch (error: any) {
    console.error('Error toggling role status:', error)
    
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະສິດທິ'
    
    showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
  }
}

const openDeleteDialog = (role: Role) => {
  deleteItem.value = role
  deleteDialog.value = true
}

const deleteRole = async () => {
  if (!deleteItem.value) return
  
  deleteLoading.value = true
  try {
    const response = await axios.delete(`/api/roles/${deleteItem.value.role_id}/`, {
      headers: getAuthHeaders()
    })
    
    if (response.status === 204 || response.status === 200) {
      showSnackbar('ລົບສິດທິສຳເລັດ', 'success', 'mdi-check-circle')
      await fetchRoles()
      deleteDialog.value = false
      deleteItem.value = null
    }
  } catch (error: any) {
    console.error('Error deleting role:', error)
    
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        'ເກີດຂໍ້ຜິດພາດໃນການລົບສິດທິ'
    
    showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
  } finally {
    deleteLoading.value = false
  }
}

const viewDetails = (role: Role) => {
  selectedItem.value = role
  detailsDialog.value = true
}

// Lifecycle
onMounted(async () => {
  await fetchRoles()
})
</script>

<style scoped>
.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

/* Custom table styling */
:deep(.custom-table .v-data-table__wrapper) {
  border-radius: 12px;
  border: 1px solid rgb(var(--v-theme-surface-variant));
  overflow: hidden;
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* Action buttons */
.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

:deep(.v-field__outline) {
  border-radius: 8px;
}
</style>