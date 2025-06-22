<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-light mb-1 text-styles">ຈັດການຕັ້ງຄ່າ</h1>
            <p class="text-body-2 text-grey">ຈັດການລາຍລະອຽດ ການຕັ້ງຄ່າ ທັງໝົດໃນລະບົບ</p>
          </div>
          <v-btn
            color="primary"
            @click="goPath('/functiondesc/create')"
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
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="ຄົ້ນຫາ Function"
              prepend-inner-icon="mdi-magnify"
              clearable
              variant="outlined"
              density="comfortable"
              hide-details
              @input="debounceSearch"
            />
          </v-col>
          <v-col cols="12" md="4">
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
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.eod_function"
              :items="eodFunctionOptions"
              label="Function EOD"
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
        item-value="function_id"
        hover
      >
        <!-- Custom loading -->
        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10" />
        </template>

        <!-- Function ID -->
        <template v-slot:item.function_id="{ item }">
          <span class="font-weight-medium text-primary">{{ item.function_id }}</span>
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
                    :loading="actionLoading[`record_${item.function_id}`]"
                  />
                </template>
              </v-tooltip>
            </div>
          </div>
        </template>

        <!-- EOD Function with Action Buttons -->
        <template v-slot:item.eod_function="{ item }">
          <div class="d-flex align-center gap-2">
            <v-chip
              :color="item.eod_function === 'Y' ? 'success' : 'grey'"
              size="small"
              variant="tonal"
              label
            >
              <v-icon 
                :icon="item.eod_function === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle'"
                size="small"
                class="mr-1"
              />
              {{ item.eod_function === 'Y' ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
            </v-chip>
            
            <!-- Enable/Disable Toggle Buttons -->
            <div class="d-flex gap-1">
              <v-tooltip :text="item.eod_function === 'Y' ? 'ປິດໃຊ້ EOD' : 'ເປີດໃຊ້ EOD'" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="item.eod_function === 'Y' ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
                    size="x-small"
                    variant="text"
                    :color="item.eod_function === 'Y' ? 'warning' : 'success'"
                    @click="toggleEodFunction(item)"
                    :loading="actionLoading[`eod_${item.function_id}`]"
                  />
                </template>
              </v-tooltip>
            </div>
          </div>
        </template>

        <!-- Auth Status -->
        <template v-slot:item.Auth_Status="{ item }">
          <div class="d-flex align-center gap-2">
            <v-chip
              v-if="item.Auth_Status"
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
            <span v-else class="text-grey text-body-2">-</span>
            
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
                  :loading="actionLoading[`auth_${item.function_id}`]"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Descriptions -->
        <template v-slot:item.description_la="{ item }">
          <div class="text-truncate" style="max-width: 200px;" :title="item.description_la">
            {{ item.description_la || '-' }}
          </div>
        </template>

        <template v-slot:item.description_en="{ item }">
          <div class="text-truncate" style="max-width: 200px;" :title="item.description_en">
            {{ item.description_en || '-' }}
          </div>
        </template>

        <!-- Function Order -->
        <template v-slot:item.function_order="{ item }">
          <v-chip size="small" variant="outlined" color="info">
            {{ item.function_order || '-' }}
          </v-chip>
        </template>

        <!-- Date formatting -->
        <template v-slot:item.Maker_DT_Stamp="{ item }">
          <span class="text-body-2">{{ formatDate(item.Maker_DT_Stamp) }}</span>
        </template>

        <!-- Maker ID -->
        <template v-slot:item.Maker_Id="{ item }">
          <v-chip size="small" variant="outlined" color="grey">
            {{ item.Maker_Id || '-' }}
          </v-chip>
        </template>
        
        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-tooltip text="ເບິ່ງລາຍລະອຽດ" location="top">
              <!-- <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="goPath(`/functiondesc/view/${item.function_id}`)"
                />
              </template> -->
            </v-tooltip>
            
            <v-tooltip text="ແກ້ໄຂ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="goPath(`/functiondesc/update?function_id=${item.function_id}`)"
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
                  :disabled="item.Auth_Status === 'A'"
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
            <div class="text-body-2 text-grey">ບໍ່ມີຂໍ້ມູນ Function Description ໃນລະບົບ</div>
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
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ Function Description:
          </p>
          <v-chip color="primary" size="large" class="mb-4">
            {{ itemToDelete?.function_id }}
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
import { ref, computed, onMounted } from 'vue'
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
  Record_Status: null,
  eod_function: null
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Options
const recordStatusOptions = ref([
  { title: 'ທັງໝົດ', value: null },
  { title: 'ເປີດ', value: 'O' },
  { title: 'ປິດ', value: 'C' }
])

const eodFunctionOptions = ref([
  { title: 'ທັງໝົດ', value: null },
  { title: 'ເປີດໃຊ້', value: 'Y' },
  { title: 'ປິດໃຊ້', value: 'N' }
])

// Table headers
const headers = ref([
  { title: 'Function ID', key: 'function_id', sortable: true, width: '120px' },
  { title: 'ລາຍລະອຽດ (ລາວ)', key: 'description_la', sortable: true },
  { title: 'ລາຍລະອຽດ (ອັງກິດ)', key: 'description_en', sortable: true },
  { title: 'ລໍາດັບ', key: 'function_order', sortable: true, align: 'center', width: '100px' },
  { title: 'EOD Function', key: 'eod_function', sortable: true, align: 'center', width: '140px' },
  { title: 'ສະຖານະ Record', key: 'Record_Status', sortable: true, align: 'center', width: '140px' },
  { title: 'ຜູ້ສ້າງ', key: 'Maker_Id', sortable: false, width: '100px' },
  { title: 'ວັນທີສ້າງ', key: 'Maker_DT_Stamp', sortable: true, width: '140px' },
  { title: 'ຈັດການ', key: 'actions', sortable: false, align: 'center', width: '120px' }
])

// Computed statistics
const statistics = computed(() => [
  {
    title: 'ທັງໝົດ',
    value: totalItems.value || 0,
    icon: 'mdi-function-variant',
    color: 'primary'
  },
  {
    title: 'ໃຊ້ງານ',
    value: items.value.filter(item => item.Record_Status === 'Y' || item.Record_Status === 'O').length || 0,
    icon: 'mdi-check-circle-outline',
    color: 'success'
  },
  {
    title: 'EOD Functions',
    value: items.value.filter(item => item.eod_function === 'Y').length || 0,
    icon: 'mdi-clock-end',
    color: 'warning'
  },
  {
    title: 'ອະນຸມັດແລ້ວ',
    value: items.value.filter(item => item.Auth_Status === 'A').length || 0,
    icon: 'mdi-shield-check-outline',
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

    const response = await axios.get('/api/function-desc/', { params })
    
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

const deleteItem = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    await axios.delete(`/api/function-desc/${itemToDelete.value.function_id}/`)
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
  const loadingKey = `record_${item.function_id}`
  
  setActionLoading(loadingKey, true)
  try {
    const response = await axios.post(`/api/function-desc/${item.function_id}/${action}/`)
    
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

const toggleEodFunction = async (item) => {
  const action = item.eod_function === 'Y' ? 'set_disable_eoc' : 'set_enable_eoc'
  const loadingKey = `eod_${item.function_id}`
  
  setActionLoading(loadingKey, true)
  try {
    const response = await axios.post(`/api/function-desc/${item.function_id}/${action}/`)
    
    if (response.data) {
      showSnackbar(response.data.message || 'ດຳເນີນການ EOD ສຳເລັດ', 'success')
      fetchData()
    }
  } catch (error) {
    console.error('Error toggling EOD function:', error)
    const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດ'
    showSnackbar(errorMessage, 'error')
  } finally {
    setActionLoading(loadingKey, false)
  }
}


const getRecordStatusColor = (status) => {
  const colors = {
    'O': 'success',
    'C': 'error',
    'Y': 'success',
    'N': 'grey'
  }
  return colors[status] || 'grey'
}

const getRecordStatusText = (status) => {
  const texts = {
    'O': 'ເປີດ',
    'C': 'ປິດ',
  }
  return texts[status] || status
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
</style>