<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-light mb-1">ຈັດການ Function Description</h1>
            <p class="text-body-2 text-grey">ຈັດການລາຍລະອຽດ Function ທັງໝົດໃນລະບົບ</p>
          </div>
          <v-btn
            color="primary"
            @click="$router.push('/functiondesc/create')"
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
              @change="fetchData"
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
              @change="fetchData"
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
          <span class="font-weight-medium">{{ item.function_id }}</span>
        </template>

        <!-- Record Status -->
        <template v-slot:item.Record_Status="{ item }">
          <v-chip
            :color="getRecordStatusColor(item.Record_Status)"
            size="small"
            variant="tonal"
            label
          >
            {{ getRecordStatusText(item.Record_Status) }}
          </v-chip>
        </template>

        <!-- EOD Function -->
        <template v-slot:item.eod_function="{ item }">
          <v-icon 
            :icon="item.eod_function === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="item.eod_function === 'Y' ? 'success' : 'grey'"
            size="small"
          />
        </template>

        <!-- Auth Status -->
        <template v-slot:item.Auth_Status="{ item }">
          <v-chip
            v-if="item.Auth_Status"
            :color="getAuthStatusColor(item.Auth_Status)"
            size="small"
            variant="tonal"
            label
          >
            {{ getAuthStatusText(item.Auth_Status) }}
          </v-chip>
          <span v-else class="text-grey text-body-2">-</span>
        </template>

        <!-- Descriptions -->
        <template v-slot:item.description_la="{ item }">
          <div class="text-truncate" style="max-width: 250px;" :title="item.description_la">
            {{ item.description_la || '-' }}
          </div>
        </template>

        <template v-slot:item.description_en="{ item }">
          <div class="text-truncate" style="max-width: 250px;" :title="item.description_en">
            {{ item.description_en || '-' }}
          </div>
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
                  @click="viewItem(item)"
                  icon="mdi-eye-outline"
                  size="small"
                  variant="text"
                  color="primary"
                />
              </template>
            </v-tooltip>
            
            <v-tooltip text="ແກ້ໄຂ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  @click="editItem(item)"
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  :disabled="item.Auth_Status === 'A'"
                />
              </template>
            </v-tooltip>
            
            <v-tooltip text="ລຶບ" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  @click="deleteItem(item)"
                  icon="mdi-delete-outline"
                  size="small"
                  variant="text"
                  color="error"
                  :disabled="item.Auth_Status === 'A'"
                />
              </template>
            </v-tooltip>
            
            <v-menu location="bottom">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                />
              </template>
              <v-list density="compact" elevation="0" class="py-0">
                <v-list-item 
                  @click="toggleOpen(item)" 
                  :disabled="item.Auth_Status !== 'A'"
                  slim
                >
                  <template v-slot:prepend>
                    <v-icon size="small">
                      {{ item.Record_Status === 'O' ? 'mdi-close' : 'mdi-check' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    {{ item.Record_Status === 'O' ? 'ປິດ' : 'ເປີດ' }}
                  </v-list-item-title>
                </v-list-item>
                
                <v-list-item 
                  @click="toggleAuth(item)" 
                  v-if="item.Auth_Status !== undefined"
                  slim
                >
                  <template v-slot:prepend>
                    <v-icon size="small">
                      {{ item.Auth_Status === 'A' ? 'mdi-cancel' : 'mdi-check-decagram' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    {{ item.Auth_Status === 'A' ? 'ຍົກເລີກອະນຸມັດ' : 'ອະນຸມັດ' }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
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
    <v-dialog v-model="deleteDialog" max-width="400" persistent>
      <v-card>
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon size="64" color="error" class="mb-4">mdi-delete-alert-outline</v-icon>
            <h3 class="text-h6 mb-2">ຢືນຢັນການລຶບ</h3>
            <p class="text-body-2 text-grey">
              ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ Function Description ນີ້?<br>
              ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້
            </p>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            @click="deleteDialog = false" 
            variant="text"
            class="text-none"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn 
            @click="confirmDelete" 
            color="error" 
            variant="flat"
            class="text-none"
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
      :timeout="3000"
      location="bottom right"
      variant="flat"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ snackbar.message }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()

// Reactive data
const loading = ref(false)
const deleteLoading = ref(false)
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
  { title: 'ເປີດ', value: 'O' },
  { title: 'ປິດ', value: 'C' },
  { title: 'ໃຊ້ງານ', value: 'Y' },
  { title: 'ບໍ່ໃຊ້ງານ', value: 'N' }
])

const eodFunctionOptions = ref([
  { title: 'ໃຊ້ງານ', value: 'Y' },
  { title: 'ບໍ່ໃຊ້', value: 'N' }
])

// Table headers
const headers = ref([
  { title: 'Function ID', key: 'function_id', sortable: true },
  { title: 'ລາຍລະອຽດ (ລາວ)', key: 'description_la', sortable: true },
  { title: 'ລາຍລະອຽດ (ອັງກິດ)', key: 'description_en', sortable: true },
  { title: 'ລໍາດັບ', key: 'function_order', sortable: true, align: 'center' },
  { title: 'EOD', key: 'eod_function', sortable: true, align: 'center' },
  { title: 'ສະຖານະ', key: 'Record_Status', sortable: true, align: 'center' },
  { title: 'ອະນຸມັດ', key: 'Auth_Status', sortable: false, align: 'center' },
  { title: 'ຜູ້ສ້າງ', key: 'Maker_Id', sortable: false },
  { title: 'ວັນທີ', key: 'Maker_DT_Stamp', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'center', width: '150px' }
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
    value: items.value.filter(item => item.Record_Status === 'Y').length || 0,
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
      ...Object.fromEntries(Object.entries(filters.value).filter(([_, v]) => v !== null))
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

const viewItem = (item) => {
  router.push(`/function-desc/view/${item.function_id}`)
}

const editItem = (item) => {
  router.push(`/function-desc/update/${item.function_id}`)
}

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

const toggleOpen = async (item) => {
  const action = item.Record_Status === 'O' ? 'set_close' : 'set_open'
  await performAction(item.function_id, action)
}

const toggleAuth = async (item) => {
  const action = item.Auth_Status === 'A' ? 'unauthorize' : 'authorize'
  await performAction(item.function_id, action)
}

const performAction = async (id, action) => {
  try {
    const response = await axios.post(`/api/function-desc/${id}/${action}/`)
    
    if (response.data) {
      showSnackbar(response.data.message || 'ດຳເນີນການສຳເລັດ', 'success')
      fetchData()
    }
  } catch (error) {
    console.error('Error performing action:', error)
    const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດ'
    showSnackbar(errorMessage, 'error')
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
    'Y': 'ໃຊ້ງານ',
    'N': 'ບໍ່ໃຊ້ງານ'
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
  background-color: #f5f5f5 !important;
}

/* Loading skeleton */
:deep(.v-skeleton-loader__bone) {
  background-color: #f5f5f5 !important;
}
</style>