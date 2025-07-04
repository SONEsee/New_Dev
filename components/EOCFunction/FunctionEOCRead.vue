<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-light mb-1 text-styles">ການຈັດການ EOC Maintain</h1>
            <p class="text-body-2 text-grey text-styles">ຈັດການການຕັ້ງຄ່າ EOC Functions ທັງໝົດໃນລະບົບ</p>
          </div>
          <v-btn
            color="primary"
            @click="goPath('/eocfunction/create')"
            prepend-icon="mdi-plus"
            variant="flat"
            class="text-none"
            elevation="0"
          >
            ສ້າງໃໝ່
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search and Filters -->
    <v-card class="mb-6" elevation="0" color="grey-lighten-5">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              label="ຄົ້ນຫາ"
              prepend-inner-icon="mdi-magnify"
              clearable
              variant="outlined"
              density="comfortable"
              hide-details
              @input="debounceSearch"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.eoc_type"
              :items="eocTypeOptions"
              label="ປະເພດ EOC"
              clearable
              variant="outlined"
              density="comfortable"
              hide-details
              item-title="title"
              item-value="value"
              @update:model-value="fetchData"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.Record_Status"
              :items="recordStatusOptions"
              label="ສະຖານະ Record"
              clearable
              variant="outlined"
              density="comfortable"
              hide-details
              item-title="title"
              item-value="value"
              @update:model-value="fetchData"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.Auth_Status"
              :items="authStatusOptions"
              label="ສະຖານະການອະນຸມັດ"
              clearable
              variant="outlined"
              density="comfortable"
              hide-details
              item-title="title"
              item-value="value"
              @update:model-value="fetchData"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3" v-for="stat in statistics" :key="stat.title">
        <v-card elevation="0" class="border">
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar :color="stat.color" size="48" class="mr-4">
              <v-icon color="white" size="24">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-medium">{{ stat.value }}</div>
              <div class="text-body-2 text-grey-darken-1">{{ stat.title }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-card elevation="0" class="border">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="items"
        :items-length="totalItems"
        :loading="loading"
        :search="searchQuery"
        @update:options="loadItems"
        class="elevation-0"
        item-value="eoc_id"
        hover
      >
        <!-- Custom loading -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <!-- EOC ID -->
        <template v-slot:item.eoc_id="{ item }">
          <span class="font-weight-medium text-primary">{{ item.eoc_id }}</span>
        </template>

        <!-- EOC Type -->
        <template v-slot:item.eoc_type="{ item }">
          <v-chip
            :color="getEocTypeColor(item.eoc_type)"
            size="small"
            variant="tonal"
            label
          >
            {{ item.eoc_type }}
          </v-chip>
        </template>

        <!-- Module -->
        <template v-slot:item.module_id="{ item }">
          <v-chip size="small" variant="outlined" color="info">
            {{ item.module_id }}
          </v-chip>
        </template>

        <!-- Function -->
        <template v-slot:item.function_name="{ item }">
          <span class="font-weight-medium">
            {{ item.function_id }} - {{ item.function_name || '-' }}
          </span>
        </template>

        <!-- Record Status with Action Buttons -->
        <template v-slot:item.Record_Status="{ item }">
          <div class="d-flex align-center gap-2">
            <v-chip
              :color="getRecordStatusColor(item.Record_Status)"
              size="small"
              variant="tonal"
              label
            >
              {{ getRecordStatusText(item.Record_Status) }}
            </v-chip>
            
            <!-- Open/Close Toggle Buttons -->
            <div class="d-flex gap-1">
              <v-tooltip :text="item.Record_Status === 'O' ? 'ປິດ' : 'ເປີດ'" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="item.Record_Status === 'O' ? 'mdi-lock' : 'mdi-lock-open'"
                    size="x-small"
                    variant="text"
                    :color="item.Record_Status === 'O' ? 'error' : 'success'"
                    @click="toggleRecordStatus(item)"
                    :disabled="item.Auth_Status !== 'A'"
                    :loading="actionLoading[`record_${item.eoc_id}`]"
                  />
                </template>
              </v-tooltip>
            </div>
          </div>
        </template>

        <!-- Auth Status with Action Buttons -->
        <template v-slot:item.Auth_Status="{ item }">
          <div class="d-flex align-center gap-2">
            <v-chip
              :color="getAuthStatusColor(item.Auth_Status)"
              size="small"
              variant="tonal"
              label
            >
              <v-icon 
                :icon="item.Auth_Status === 'A' ? 'mdi-shield-check' : 'mdi-shield-alert'"
                size="small"
                class="mr-1"
              />
              {{ getAuthStatusText(item.Auth_Status) }}
            </v-chip>
            
            <!-- Authorize/Unauthorize Toggle Button -->
            <v-tooltip :text="item.Auth_Status === 'A' ? 'ຍົກເລີກອະນຸມັດ' : 'ອະນຸມັດ'" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="item.Auth_Status === 'A' ? 'mdi-shield-remove' : 'mdi-shield-check'"
                  size="x-small"
                  variant="text"
                  :color="item.Auth_Status === 'A' ? 'error' : 'primary'"
                  @click="toggleAuthStatus(item)"
                  :loading="actionLoading[`auth_${item.eoc_id}`]"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Sequence Number -->
        <template v-slot:item.eoc_seq_no="{ item }">
          <v-chip size="small" variant="outlined" color="purple">
            {{ item.eoc_seq_no }}
          </v-chip>
        </template>

        <!-- Maker Name -->
        <template v-slot:item.maker_name="{ item }">
          <v-chip size="small" variant="outlined" color="grey">
            {{ item.maker_name || item.Maker_Id || '-' }}
          </v-chip>
        </template>

        <!-- Date formatting -->
        <template v-slot:item.Maker_DT_Stamp="{ item }">
          <span class="text-body-2">{{ formatDate(item.Maker_DT_Stamp) }}</span>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="ເບິ່ງລາຍລະອຽດ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="viewItem(item)"
                />
              </template>
            </v-tooltip>
            
            <v-tooltip text="ແກ້ໄຂ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="goPath(`/eocfunction/update?eoc_id=${item.eoc_id}`)"
                />
              </template>
            </v-tooltip>
            
            <v-tooltip text="ລຶບ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteItem(item)"
            
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- No Data -->
        <template v-slot:no-data>
          <div class="text-center py-12">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-database-search-outline</v-icon>
            <div class="text-h6 text-grey mb-2">ບໍ່ພົບຂໍ້ມູນ</div>
            <div class="text-body-2 text-grey">ບໍ່ມີຂໍ້ມູນ EOC Maintain ໃນລະບົບ</div>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500" persistent>
      <v-card class="text-center pa-4">
        <v-card-text>
          <div class="mx-auto mb-4">
            <v-avatar size="80" color="error" class="mb-4">
              <v-icon size="50" color="white">mdi-delete-alert</v-icon>
            </v-avatar>
          </div>
          
          <h2 class="text-h5 mb-2">ຢືນຢັນການລຶບ</h2>
          <p class="text-body-1 text-grey-darken-1 mb-4">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ EOC Maintain:
          </p>
          <v-chip color="primary" size="large" class="mb-4">
            {{ itemToDelete?.eoc_id }}
          </v-chip>
          <p class="text-body-2 text-error">
            ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້
          </p>
        </v-card-text>
        
        <v-card-actions class="justify-center gap-3 pb-4">
          <v-btn 
            @click="deleteDialog = false" 
            variant="outlined"
            color="grey"
            size="large"
            class="text-none px-8"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn 
            @click="confirmDelete" 
            color="error" 
            variant="flat"
            size="large"
            class="text-none px-8"
            :loading="deleteLoading"
          >
            ລຶບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color"
      :timeout="4000"
      location="bottom right"
      variant="flat"
      elevation="4"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3" size="24">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span class="text-body-1">{{ snackbar.message }}</span>
      </div>
      <template v-slot:actions>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          size="small"
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()

// Reactive data
const loading = ref(false)
const deleteLoading = ref(false)
const actionLoading = ref({})
const items = ref([])
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const deleteDialog = ref(false)
const itemToDelete = ref(null)

// Filters
const filters = ref({
  eoc_type: null,
  Record_Status: null,
  Auth_Status: null
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Options
const eocTypeOptions = ref([
  { title: 'ທັງໝົດ', value: null },
  { title: 'EOD - End of Day', value: 'EOD' },
  { title: 'EOM - End of Month', value: 'EOM' },
  { title: 'EOY - End of Year', value: 'EOY' }
])

const recordStatusOptions = ref([
  { title: 'ທັງໝົດ', value: null },
  { title: 'ເປີດ', value: 'O' },
  { title: 'ປິດ', value: 'C' }
])

const authStatusOptions = ref([
  { title: 'ທັງໝົດ', value: null },
  { title: 'ອະນຸມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' }
])

// Table headers
const headers = ref([
  { title: 'EOC ID', key: 'eoc_id', sortable: true, width: '100px' },
  { title: 'ລໍາດັບ', key: 'eoc_seq_no', sortable: true, align: 'center', width: '80px' },
  { title: 'ປະເພດ EOC', key: 'eoc_type', sortable: true, align: 'center', width: '100px' },
  { title: 'Module', key: 'module_id', sortable: false, align: 'center', width: '100px' },
  { title: 'Function', key: 'function_name', sortable: false, width: '120px' },
  { title: 'ສະຖານະ Record', key: 'Record_Status', sortable: true, align: 'center', width: '140px' },
  { title: 'ສະຖານະອະນຸມັດ', key: 'Auth_Status', sortable: true, align: 'center', width: '140px' },
  { title: 'ຜູ້ສ້າງ', key: 'maker_name', sortable: false, width: '100px' },
  { title: 'ວັນທີສ້າງ', key: 'Maker_DT_Stamp', sortable: true, width: '120px' },
  { title: 'ຈັດການ', key: 'actions', sortable: false, align: 'center', width: '120px' }
])

// Computed statistics
const statistics = computed(() => [
  {
    title: 'ທັງໝົດ',
    value: totalItems.value || 0,
    icon: 'mdi-file-document-multiple',
    color: 'primary'
  },
  {
    title: 'ອະນຸມັດແລ້ວ',
    value: items.value.filter(item => item.Auth_Status === 'A').length || 0,
    icon: 'mdi-shield-check-outline',
    color: 'success'
  },
  {
    title: 'ລໍຖ້າອະນຸມັດ',
    value: items.value.filter(item => item.Auth_Status === 'U').length || 0,
    icon: 'mdi-shield-alert-outline',
    color: 'warning'
  },
  {
    title: 'ເປີດຢູ່',
    value: items.value.filter(item => item.Record_Status === 'O').length || 0,
    icon: 'mdi-lock-open-outline',
    color: 'info'
  }
])

// Methods
const goPath = (path) => {
  router.push(path)
}

const setActionLoading = (key, value) => {
  actionLoading.value[key] = value
}

const loadItems = ({ page, itemsPerPage, sortBy }) => {
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: itemsPerPage.value,
      search: searchQuery.value || '',
      ...Object.fromEntries(
        Object.entries(filters.value).filter(([_, v]) => v !== null && v !== '')
      )
    }

    const response = await axios.get('/api/eoc-maintain/', { params })
    
    if (response.data) {
      items.value = response.data.results || response.data
      totalItems.value = response.data.count || items.value.length
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ', 'error')
    items.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

const debounceSearch = (() => {
  let timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      page.value = 1
      fetchData()
    }, 500)
  }
})()

const viewItem = (item) => {
  router.push(`/eocfunction/view/${item.eoc_id}`)
}

const deleteItem = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    await axios.delete(`/api/eoc-maintain/${itemToDelete.value.eoc_id}/`)
    showSnackbar('ລຶບສໍາເລັດແລ້ວ', 'success')
    fetchData()
  } catch (error) {
    console.error('Error deleting item:', error)
    const errorMessage = error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ'
    showSnackbar(errorMessage, 'error')
  } finally {
    deleteLoading.value = false
    deleteDialog.value = false
    itemToDelete.value = null
  }
}

const toggleRecordStatus = async (item) => {
  const action = item.Record_Status === 'O' ? 'set_close' : 'set_open'
  const loadingKey = `record_${item.eoc_id}`
  
  setActionLoading(loadingKey, true)
  try {
    const response = await axios.post(`/api/eoc-maintain/${item.eoc_id}/${action}/`)
    
    if (response.data) {
      showSnackbar(response.data.message || 'ດຳເນີນການສຳເລັດ', 'success')
      fetchData()
    }
  } catch (error) {
    console.error('Error toggling record status:', error)
    const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດ'
    showSnackbar(errorMessage, 'error')
  } finally {
    setActionLoading(loadingKey, false)
  }
}

const toggleAuthStatus = async (item) => {
  const action = item.Auth_Status === 'A' ? 'unauthorize' : 'authorize'
  const loadingKey = `auth_${item.eoc_id}`
  
  setActionLoading(loadingKey, true)
  try {
    const response = await axios.post(`/api/eoc-maintain/${item.eoc_id}/${action}/`)
    
    if (response.data) {
      showSnackbar(response.data.message || 'ດຳເນີນການອະນຸມັດສຳເລັດ', 'success')
      fetchData()
    }
  } catch (error) {
    console.error('Error toggling auth status:', error)
    const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດ'
    showSnackbar(errorMessage, 'error')
  } finally {
    setActionLoading(loadingKey, false)
  }
}

// Status helper methods
const getEocTypeColor = (type) => {
  const colors = {
    'EOD': 'primary',
    'SOD': 'success', 
    'RPT': 'warning',
    'BAK': 'info'
  }
  return colors[type] || 'grey'
}

const getRecordStatusColor = (status) => {
  return status === 'O' ? 'success' : 'error'
}

const getRecordStatusText = (status) => {
  return status === 'O' ? 'ເປີດ' : 'ປິດ'
}

const getAuthStatusColor = (status) => {
  return status === 'A' ? 'success' : 'warning'
}

const getAuthStatusText = (status) => {
  return status === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າອະນຸມັດ'
}

const formatDate = (date) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return date
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
:deep(.v-data-table) {
  font-size: 14px;
}

:deep(.v-data-table-header) {
  background-color: #fafafa;
}

:deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #616161;
  font-size: 13px;
}

.border {
  border: 1px solid #e0e0e0 !important;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.v-btn) {
  text-transform: none !important;
}

:deep(.v-chip) {
  font-weight: 500;
}

/* Hover effects */
:deep(.v-data-table__tr:hover) {
  background-color: #f8f9fa !important;
}

/* Loading skeleton */
:deep(.v-skeleton-loader__bone) {
  background-color: #f5f5f5 !important;
}

/* Table row spacing */
:deep(.v-data-table__td) {
  padding: 8px 12px !important;
}

/* Action buttons spacing */
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

/* Status chips alignment */
:deep(.v-chip--size-small) {
  font-size: 11px;
  height: 24px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  :deep(.v-data-table__td) {
    padding: 6px 8px !important;
    font-size: 12px;
  }
  
  :deep(.v-btn--size-small) {
    min-width: 32px;
    width: 32px;
    height: 32px;
  }
}

/* Enhanced button styles */
.v-btn--variant-flat {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>