<template>
  <div class="gl-approved-master">
    <!-- Page Header - Compact -->
    <div class="page-header-compact">
      <div class="d-flex justify-space-between align-center">
        <h1 class="page-title-compact">
          <v-icon color="primary" size="20" class="mr-2">mdi-book-check</v-icon>
          ລາຍການບັນທຶກບັນຊີ
        </h1>
        
        <!-- Permission indicators -->
        <div class="permission-indicators" v-if="permissions">
          <v-tooltip text="ສິດເຂົ້າເຖິງຂອງທ່ານ" location="bottom">
            <template #activator="{ props }">
              <div v-bind="props" class="d-flex gap-1">
                <v-chip
                  v-if="canView"
                  color="info"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon size="12">mdi-eye</v-icon>
                  ເບິ່ງ
                </v-chip>
                <v-chip
                  v-if="canEdit"
                  color="warning"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon size="12">mdi-pencil</v-icon>
                  ແກ້
                </v-chip>
                <v-chip
                  v-if="canDelete"
                  color="error"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon size="12">mdi-delete</v-icon>
                  ລຶບ
                </v-chip>
                <v-chip
                  v-if="canAuthorize"
                  color="success"
                  size="x-small"
                  variant="flat"
                >
                  <v-icon size="12">mdi-check-circle</v-icon>
                  ອະນຸມັດ
                </v-chip>
              </div>
            </template>
          </v-tooltip>
        </div>
      </div>
    </div>

    <!-- Permission Access Check -->
    <div v-if="!canView" class="permission-denied-state">
      <v-card class="text-center py-12" elevation="1">
        <v-icon size="80" color="error" class="mb-6">mdi-shield-lock</v-icon>
        <div class="text-h5 mb-3 text-error">ບໍ່ມີສິດເຂົ້າເຖິງ</div>
        <div class="text-body-1 mb-4 text-grey">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</div>
        <div class="text-caption text-grey mb-6 px-4">
          <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
          ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບເພື່ອຂໍສິດເຂົ້າເຖິງ
        </div>
        <v-btn
          variant="outlined"
          @click="$router.go(-1)"
          prepend-icon="mdi-arrow-left"
          size="large"
        >
          ກັບໄປໜ້າກ່ອນ
        </v-btn>
      </v-card>
    </div>

    <!-- Main Content (only show if user has view permission) -->
    <div v-else>
      <!-- Data Access Info -->
      <v-alert
        v-if="canAuthorize"
        type="success"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <template #prepend>
          <v-icon>mdi-check-circle</v-icon>
        </template>
        <strong>ສິດເຂົ້າເຖິງ:</strong> ທ່ານສາມາດເບິ່ງລາຍການທັງໝົດໄດ້
      </v-alert>
      
      <v-alert
        v-else
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <template #prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <strong>ສິດເຂົ້າເຖິງ:</strong> ທ່ານສາມາດເບິ່ງລາຍການທີ່ທ່ານສ້າງເທົ່ານັ້ນ
      </v-alert>

      <!-- Filter Section - Thinner -->
      <v-card class="filter-card-thin mb-2" elevation="1">
        <v-card-text class="pa-2">
          <v-row dense>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.search"
                label="ຄົ້ນຫາ"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                placeholder="ເລກອ້າງອີງ, ຂໍ້ຄວາມ..."
                @update:model-value="searchDebounced"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.module_id"
                :items="modules"
                item-title="module_name_la"
                item-value="module_Id"
                label="ໂມດູນ"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="loadData"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.Ccy_cd"
                :items="currencies"
                item-title="ccy_code"
                item-value="ccy_code"
                label="ສະກຸນເງິນ"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="loadData"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="filters.Auth_Status"
                :items="authStatusOptions"
                item-title="text"
                item-value="value"
                label="ສະຖານະອະນຸມັດ"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="loadData"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filters.dateFrom"
                label="ວັນທີເລີ່ມ"
                type="date"
                variant="outlined"
                density="compact"
                @update:model-value="loadData"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="1">
              <v-btn
                color="primary"
                variant="flat"
                @click="loadData"
                :loading="loading"
                block
                size="small"
              >
                <v-icon size="16">mdi-filter</v-icon>
                ຄົ້ນຫາ
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Summary Cards - Thinner -->
      <v-row dense class="mb-3">
        <v-col cols="6" sm="3" md="2">
          <v-card class="summary-card-thin" elevation="1">
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="primary" class="mr-2">mdi-file-document-multiple</v-icon>
                <div>
                  <div class="summary-value-thin">{{ summary.total }}</div>
                  <div class="summary-label-thin">ລາຍການທັງໝົດ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-card class="summary-card-thin" elevation="1">
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="warning" class="mr-2">mdi-clock-outline</v-icon>
                <div>
                  <div class="summary-value-thin">{{ summary.pending }}</div>
                  <div class="summary-label-thin">ລໍຖ້າອະນຸມັດ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-card class="summary-card-thin" elevation="1">
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
                <div>
                  <div class="summary-value-thin">{{ summary.approved }}</div>
                  <div class="summary-label-thin">ອະນຸມັດແລ້ວ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-card class="summary-card-thin" elevation="1">
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="error" class="mr-2">mdi-close-circle</v-icon>
                <div>
                  <div class="summary-value-thin">{{ summary.rejected }}</div>
                  <div class="summary-label-thin">ປະຕິເສດ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-card class="summary-card-thin" elevation="1">
            <v-card-text class="pa-2">
              <div class="d-flex align-center">
                <v-icon size="20" color="info" class="mr-2">mdi-pencil-circle</v-icon>
                <div>
                  <div class="summary-value-thin">{{ summary.correction }}</div>
                  <div class="summary-label-thin">ຖ້າເແກ້ໄຂ</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Data Table - Compact -->
      <v-card elevation="1" class="data-table-card-thin">
        <v-card-title class="d-flex justify-space-between align-center pa-3">
          <span class="text-h6">
            ລາຍການບັນທຶກບັນຊີ
            <v-chip size="small" color="primary" variant="outlined" class="ml-2">
              {{ canAuthorize ? 'ທັງໝົດ' : 'ຂອງຂ້ອຍ' }}
            </v-chip>
          </span>
          <div>
            <v-btn
              v-if="canEdit"
              color="primary"
              variant="flat"
              @click="navigateToCreate"
              prepend-icon="mdi-plus"
              class="mr-2"
              size="small"
            >
              ເພີ່ມບັນທຶກໃຫມ່
            </v-btn>
            <v-btn
              color="success"
              variant="text"
              @click="exportData"
              :disabled="items.length === 0"
              class="mr-2"
              size="small"
            >
              <v-icon left size="16">mdi-download</v-icon>
              ສົ່ງອອກ
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="loadData"
              size="small"
            >
              <v-icon left size="16">mdi-refresh</v-icon>
              ໂຫຼດໃໝ່
            </v-btn>
          </div>
        </v-card-title>
        
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          :search="filters.search"
          :items-per-page="10"
          density="compact"
          class="elevation-0 full-width-table-thin"
          item-value="JRNLLog_id"
        >
          <!-- Reference No -->
          <template v-slot:item.Reference_No="{ item }">
            <v-chip
              v-if="canView"
              size="x-small"
              color="primary"
              variant="outlined"
              @click="viewDetails(item)"
              class="cursor-pointer"
            >
              {{ item.Reference_No }}
            </v-chip>
          </template>

          <!-- Module -->
          <template v-slot:item.module_id="{ item }">
            <span v-if="item.module_id" class="text-compact">
              {{ getModuleName(item.module_id) }}
            </span>
            <span v-else class="text-grey">-</span>
          </template>

          <!-- Currency and Amount -->
          <template v-slot:item.Fcy_Amount="{ item }">
            <div class="text-right text-compact">
              <strong>{{ formatNumber(item.Fcy_Amount) }}</strong>
              <span class="text-grey ml-1">{{ item.Ccy_cd }}</span>
            </div>
          </template>

          <!-- LCY Amount -->
          <template v-slot:item.Lcy_Amount="{ item }">
            <div class="text-right text-compact">
              {{ formatNumber(item.Lcy_Amount) }} LAK
            </div>
          </template>

          <!-- Transaction Code -->
          <template v-slot:item.Txn_code="{ item }">
            <v-chip size="x-small" variant="flat" color="info">
              {{ item.Txn_code || '-' }}
            </v-chip>
          </template>

          <template v-slot:item.Addl_text="{ item }">
            <div class="text-truncate text-compact">
              <v-tooltip v-if="item.Addl_text" location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props">{{ item.Addl_text || '-' }}</span>
                </template>
                <span>{{ item.Addl_text }}</span>
              </v-tooltip>
              <span v-else>-</span>
            </div>
          </template>

          <!-- Value Date -->
          <template v-slot:item.Value_date="{ item }">
            <span class="text-compact text-grey">{{ formatDate(item.Value_date) }}</span>
          </template>

          <!-- Auth Status -->
          <template v-slot:item.Auth_Status="{ item }">
            <v-chip
              :color="getStatusColor(item.Auth_Status)"
              size="x-small"
              variant="flat"
            >
              <v-icon left size="x-small">{{ getStatusIcon(item.Auth_Status) }}</v-icon>
              {{ getStatusText(item.Auth_Status) }}
            </v-chip>
          </template>

          <!-- Maker Info -->
          <template v-slot:item.maker_name="{ item }">
            <div class="text-caption-thin">
              <div v-if="item.Maker_Id" class="text-compact">{{ item.maker_name || item.Maker_Id }}</div>
              <!-- <div class="text-grey text-xs">{{ formatDateTime(item.Maker_DT_Stamp) }}</div> -->
            </div>
          </template>

          <!-- Actions -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                v-if="canView"
                icon
                size="x-small"
                variant="text"
                color="info"
                @click="viewDetails(item)"
                title="ເບິ່ງລາຍລະອຽດ"
              >
                <v-icon size="14">mdi-eye</v-icon>
              </v-btn>

              
              <v-btn
                v-if="canDelete && (canAuthorize || item.Maker_Id === currentUser?.user_id) && item.Auth_Status !== 'A' && item.Auth_Status !== 'R'"
                icon
                size="x-small"
                variant="text"
                color="error"
                @click="deleteItem(item)"
                title="ລຶບ"
              >
                <v-icon size="14">mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'
import { debounce } from 'lodash'
import { useRolePermissions } from '@/composables/useRolePermissions'

// Router
const route = useRoute()
const router = useRouter()

// Get sub_menu_id from route
const submenu_id = route.query.sub_menu_id || 'GL_NOTE_CAP'
console.log('Submenu ID:', submenu_id)

// Role Permissions
const {
  initializeRole,
  canView,
  canEdit,
  canDelete,
  canAuthorize,
  canAdd,
  permissions
} = useRolePermissions()

// State
const loading = ref(false)
const items = ref([])
const modules = ref([])
const currencies = ref([])

// Current user (get from localStorage or auth store)
const currentUser = computed(() => {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
})

const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

// Filters
const filters = reactive({
  search: '',
  module_id: null,
  Ccy_cd: null,
  Auth_Status: null,
  dateFrom: today,
  dateTo: today
})

// Summary
const summary = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  correction: 0
})

// Auth status options
const authStatusOptions = [
  { value: 'U', text: 'ລໍຖ້າອະນຸມັດ' },
  { value: 'A', text: 'ອະນຸມັດແລ້ວ' },
  { value: 'R', text: 'ປະຕິເສດ' },
  { value: 'P', text: 'ຖ້າເເກ້ໄຂ' }
]

// Table headers
const headers = [
  { title: 'ໂມດູນ', key: 'module_id', sortable: true },
  { title: 'ລະຫັດ', key: 'Txn_code', sortable: true },
  { title: 'ເລກອ້າງອີງ', key: 'Reference_No', sortable: true },
    { title: 'ເນື້ອໃນ', key: 'Addl_text', sortable: true },
  { title: 'ຈຳນວນເງິນ', key: 'Fcy_Amount', align: 'end', sortable: true },

  { title: 'ຜູ້ສ້າງ', key: 'maker_name', sortable: true },
  { title: 'ວັນທີ', key: 'Value_date', sortable: true },
  { title: 'ສະຖານະ', key: 'Auth_Status', sortable: true },
  { title: 'ການກະທຳ', key: 'actions', sortable: false, align: 'center' }
]

// API configuration
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Navigate to details page
const viewDetails = (item) => {
  const detailUrl = `/glcapture/detail?Reference_No=${item.Reference_No}&sub_menu_id=${submenu_id}`
  router.push(detailUrl)
}

// Navigate to create page
const navigateToCreate = () => {
  const createUrl = `/glcapture/create?sub_menu_id=${submenu_id}`
  router.push(createUrl)
}


// Methods
const formatNumber = (num, decimals = 2) => {
  if (!num) return '0.00'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('lo-LA')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('lo-LA')
}

const getStatusColor = (status) => {
  switch(status) {
    case 'A': return 'success'
    case 'R': return 'error'
    case 'U': return 'warning'
    case 'P': return 'info'
    default: return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'A': return 'mdi-check-circle'
    case 'R': return 'mdi-close-circle'
    case 'U': return 'mdi-clock-outline'
    case 'P': return 'mdi-pencil-circle'
    default: return 'mdi-help-circle'
  }
}

const getStatusText = (status) => {
  switch(status) {
    case 'A': return 'ອະນຸມັດແລ້ວ'
    case 'R': return 'ປະຕິເສດ'
    case 'U': return 'ລໍຖ້າອະນຸມັດ'
    case 'P': return 'ຖ້າເເກ້ໄຂ'
    default: return 'ບໍ່ຮູ້'
  }
}



const getModuleName = (moduleId) => {
  if (!moduleId) return '-'
  const module = modules.value.find(m => m.module_Id === moduleId)
  return module ? module.module_name_la : moduleId
}

const loadData = async () => {
  try {
    loading.value = true
    
    // Build query params
    const params = {
      // **KEY ADDITION**: Add permission-based filtering
      show_all: canAuthorize.value ? 'true' : 'false'
    }
    
    // Add filter params
    if (filters.search) params.search = filters.search
    if (filters.module_id) params.module_id = filters.module_id
    if (filters.Ccy_cd) params.Ccy_cd = filters.Ccy_cd
    if (filters.Auth_Status) params.Auth_Status = filters.Auth_Status
    if (filters.dateFrom) params.Value_date__gte = filters.dateFrom
    if (filters.dateTo) params.Value_date__lte = filters.dateTo
    
    // Exclude soft deleted
    params.delete_stat__ne = 'D'
    params.ordering = '-Maker_DT_Stamp' // Order by newest first
    
    console.log('Loading data with params:', params)
    console.log('User permissions:', {
      canView: canView.value,
      canEdit: canEdit.value,
      canDelete: canDelete.value,
      canAuthorize: canAuthorize.value,
      showingAllRecords: canAuthorize.value
    })
    
    const response = await axios.get('/api/journal-log-master/', {
      params,
      ...getAuthHeaders()
    })
    
    items.value = response.data.results || response.data || []

    console.log(`Loaded ${items.value.length} items`)
    console.log(`Permission level: ${canAuthorize.value ? 'ALL RECORDS' : 'OWN RECORDS ONLY'}`)
    
    // Update summary
    updateSummary()
    
  } catch (error) {
    console.error('Error loading data:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.value = false
  }
}

const updateSummary = () => {
  summary.total = items.value.length
  summary.pending = items.value.filter(i => i.Auth_Status === 'U').length
  summary.approved = items.value.filter(i => i.Auth_Status === 'A').length
  summary.rejected = items.value.filter(i => i.Auth_Status === 'R').length
  summary.correction = items.value.filter(i => i.Auth_Status === 'P').length
}

const loadModules = async () => {
  try {
    const response = await axios.get('/api/modules/', getAuthHeaders())
    modules.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading modules:', error)
  }
}

const loadCurrencies = async () => {
  try {
    const response = await axios.get('/api/currencies/', getAuthHeaders())
    currencies.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading currencies:', error)
  }
}

const deleteItem = async (item) => {
  // Check if user can delete this specific item
  const canDeleteItem = canDelete.value && (canAuthorize.value || item.Maker_Id === currentUser.value?.user_id)
  
  if (!canDeleteItem) {
    Swal.fire({
      icon: 'warning',
      title: 'ບໍ່ມີສິດ',
      text: 'ທ່ານບໍ່ມີສິດລຶບລາຍການນີ້',
      confirmButtonText: 'ຕົກລົງ'
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການລຶບ',
    text: `ທ່ານຕ້ອງການລຶບລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    showCancelButton: true,
    confirmButtonText: 'ລຶບ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#9e9e9e'
  })
  
  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/journal-log-master/${item.JRNLLog_id}/`, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ລຶບລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      loadData()
      
    } catch (error) {
      console.error('Error deleting item:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດລຶບລາຍການໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

const exportData = () => {
  // Implement export functionality
  Swal.fire({
    icon: 'info',
    title: 'ກຳລັງພັດທະນາ',
    text: 'ຟັງຊັນສົ່ງອອກຂໍ້ມູນກຳລັງພັດທະນາ',
    confirmButtonText: 'ຕົກລົງ'
  })
}

// Search with debounce
const searchDebounced = debounce(() => {
  loadData()
}, 500)

// Lifecycle
onMounted(async () => {
  console.log('Journal list page mounted')
  
  // Initialize permissions first
  await initializeRole()
  
  // Debug permissions
  console.log('Permissions initialized:', {
    canView: canView.value,
    canEdit: canEdit.value,
    canDelete: canDelete.value,
    canAuthorize: canAuthorize.value,
    permissions: permissions.value
  })
  
  // Load reference data
  loadModules()
  loadCurrencies()
  
  // Load main data (only if user has view permission)
  if (canView.value) {
    loadData()
  }
})
</script>

<style scoped>
.gl-approved-master {
  padding: 16px;
}

/* Permission indicators */
.permission-indicators {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.permission-indicators .v-chip {
  font-weight: 600;
  font-size: 0.7rem;
}

/* Permission denied state */
.permission-denied-state {
  max-width: 600px;
  margin: 40px auto;
}

/* Compact header */
.page-header-compact {
  padding: 8px 0;
  margin-bottom: 16px;
}

.page-title-compact {
  font-size: 1.4rem;
  font-weight: 500;
  color: #1976d2;
  display: flex;
  align-items: center;
  margin: 0;
  line-height: 1.2;
}

/* Thinner filter card */
.filter-card-thin {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
}

/* Thinner summary cards */
.summary-card-thin {
  height: auto;
  min-height: 60px;
  transition: transform 0.2s;
  border: 1px solid #e0e0e0;
}

.summary-card-thin:hover {
  transform: translateY(-1px);
}

.summary-value-thin {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
}

.summary-label-thin {
  font-size: 0.7rem;
  color: #666;
  line-height: 1;
}

/* Thinner data table card */
.data-table-card-thin {
  border: 1px solid #e0e0e0;
}

/* Compact text */
.text-compact {
  font-size: 0.8rem;
  line-height: 1.1;
}

.text-caption-thin {
  font-size: 0.7rem;
  line-height: 1.1;
}

.text-xs {
  font-size: 0.65rem;
  line-height: 1;
}

/* Full width table - thinner */
.full-width-table-thin {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

/* Vuetify overrides for compact design */
:deep(.v-data-table) {
  font-size: 0.8rem;
  width: 100% !important;
}

:deep(.v-data-table th) {
  font-weight: 600;
  background-color: #f7f7f7;
  font-size: 0.75rem;
  padding: 8px 12px !important;
  height: 36px !important;
}

:deep(.v-data-table td) {
  padding: 6px 12px !important;
  height: 40px !important;
  font-size: 0.8rem;
}

:deep(.v-data-table-wrapper) {
  width: 100% !important;
  overflow-x: auto;
}

:deep(.v-table__wrapper) {
  width: 100% !important;
}

:deep(.v-field__input) {
  min-height: 32px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

:deep(.v-field__field) {
  height: 32px !important;
}

:deep(.v-input--density-compact .v-field--variant-outlined .v-field__outline__start) {
  border-radius: 4px 0 0 4px;
}

:deep(.v-input--density-compact .v-field--variant-outlined .v-field__outline__end) {
  border-radius: 0 4px 4px 0;
}

:deep(.v-btn--size-small) {
  min-height: 28px;
  padding: 0 12px;
  font-size: 0.75rem;
}

:deep(.v-btn--size-x-small) {
  min-height: 24px;
  padding: 0 8px;
  font-size: 0.7rem;
}

:deep(.v-chip--size-x-small) {
  height: 20px;
  font-size: 0.65rem;
  padding: 0 6px;
}

:deep(.v-card-title) {
  font-size: 1rem;
  font-weight: 500;
  padding: 12px 16px;
}

:deep(.v-card-text) {
  font-size: 0.8rem;
}

:deep(.v-card-actions) {
  min-height: 40px;
}

:deep(.v-dialog .v-card) {
  max-height: 90vh;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title-compact {
    font-size: 1.2rem;
  }
  
  .summary-value-thin {
    font-size: 1rem;
  }
  
  .summary-label-thin {
    font-size: 0.65rem;
  }
  
  .permission-indicators {
    margin-top: 8px;
  }
  
  :deep(.v-data-table th) {
    padding: 4px 8px !important;
    font-size: 0.7rem;
  }
  
  :deep(.v-data-table td) {
    padding: 4px 8px !important;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .gl-approved-master {
    padding: 8px;
  }
  
  .text-compact {
    font-size: 0.75rem;
  }
}
</style>