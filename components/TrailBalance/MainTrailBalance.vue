<!-- MainTrialBalance.vue -->
<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" style="border: 1px solid #e0e0e0; width: 100%;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
        <v-icon start size="24">mdi-chart-line</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
          ລາຍງານໃບດຸ່ນດຽງ - 
          {{ selectedCurrency === 'all' ? 'ທຸກສະກຸນເງິນ' : selectedCurrency }}
        </span>
        <v-spacer />
        <v-chip 
          color="white" 
          text-color="primary" 
          size="small" 
          variant="outlined"
        >
          Main Trial Balance
        </v-chip>
      </v-card-title>
      
      <v-card-text class="px-6 py-4">
        <!-- Filter Form -->
        <v-form @submit.prevent="fetchTrialBalanceData" class="mb-4">
          <v-row no-gutters class="mb-4">
            <!-- Currency Selection -->
            <v-col cols="12" md="4" class="pe-md-2 mb-3 mb-md-0">
              <v-select
                v-model="selectedCurrency"
                :items="currencyOptions"
                label="ເລືອກສະກຸນເງິນ (Currency)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-currency-usd"
                hide-details="auto"
                @update:model-value="onCurrencyChange"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :icon="item.raw.icon" size="20" />
                    </template>
                    <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            
            <!-- Search Field -->
            <v-col cols="12" md="4" class="px-md-1 mb-3 mb-md-0">
              <v-text-field
                v-model="searchText"
                label="ຄົ້ນຫາໃນຕາຕະລາງ"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
            </v-col>

            <!-- Action Buttons -->
            <v-col cols="12" md="4" class="ps-md-2 d-flex gap-1">
              <v-btn
                type="submit"
                color="primary"
                prepend-icon="mdi-refresh"
                :loading="loading"
                class="flex-grow-1"
                density="compact"
                style="height: 40px;"
              >
                ດຶງຂໍ້ມູນ
              </v-btn>
              <v-btn
                color="success"
                prepend-icon="mdi-microsoft-excel"
                :disabled="!trialBalanceData.length || loading"
                @click="exportToExcel"
                density="compact"
                style="height: 40px;"
              >
                Excel
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-divider class="mb-4" thickness="1" color="grey-lighten-3" />

        <!-- Table Info Bar -->
        <div class="d-flex justify-space-between align-center mb-3 pa-3 bg-grey-lighten-5 rounded">
          <div class="text-h6 font-weight-medium">
            ຜົນການຄົ້ນຫາ: {{ filteredData.length }} ລາຍການ
            <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
              {{ chipText }}
            </v-chip>
          </div>
          <div class="text-caption text-grey-darken-1">
            API: {{ selectedCurrency === 'all' ? 'all-currencies' : 'by-currency' }}
          </div>
        </div>

        <!-- Custom Table Implementation -->
        <div class="custom-table-container">
          <table class="custom-trial-balance-table">
            <!-- Table Header -->
            <thead>
              <!-- Main Group Headers -->
              <tr class="main-header-row">
                <th rowspan="2" class="header-cell sticky-column account-code-header">
                  <div class="header-content-center">GL Code</div>
                </th>
                <th rowspan="2" class="header-cell description-header">
                  <div class="header-content-left">ລາຍລະອຽດ</div>
                </th>
                <th colspan="2" class="header-cell group-header">
                  <div class="group-header-content">
                    <v-icon size="16" color="success">mdi-arrow-up-circle</v-icon>
                    <span>ຍອດຍົກ</span>
                  </div>
                </th>
                <th colspan="2" class="header-cell group-header">
                  <div class="group-header-content">
                    <v-icon size="16" color="info">mdi-swap-horizontal-circle</v-icon>
                    <span>ຍອດເຄື່ອນ</span>
                  </div>
                </th>
                <th colspan="2" class="header-cell group-header">
                  <div class="group-header-content">
                    <v-icon size="16" color="warning">mdi-arrow-down-circle</v-icon>
                    <span>ຍອດເຫຼືອ</span>
                  </div>
                </th>
                <th rowspan="2" class="header-cell extra-column-header">
                  <div class="header-content-center">Currency</div>
                </th>
                <th rowspan="2" class="header-cell extra-column-header">
                  <div class="header-content-center">Category</div>
                </th>
              </tr>
              <!-- Sub Headers -->
              <tr class="sub-header-row">
                <th class="header-cell sub-header">Dr</th>
                <th class="header-cell sub-header">Cr</th>
                <th class="header-cell sub-header">Dr</th>
                <th class="header-cell sub-header">Cr</th>
                <th class="header-cell sub-header">Dr</th>
                <th class="header-cell sub-header">Cr</th>
              </tr>
            </thead>
            
            <!-- Table Body -->
            <tbody>
              <tr v-if="loading">
                <td colspan="10" class="text-center pa-8">
                  <v-progress-circular indeterminate color="primary" />
                  <div class="mt-3">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
                </td>
              </tr>
              
              <tr v-else-if="!filteredData.length">
                <td colspan="10" class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-chart-line-variant</v-icon>
                  <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
                  <div class="text-body-2 text-grey">ກະລຸນາກົດປຸ່ມດຶງຂໍ້ມູນເພື່ອໂຫຼດຂໍ້ມູນ</div>
                </td>
              </tr>
              
              <!-- Data Rows -->
              <tr 
                v-for="(item, index) in filteredData" 
                :key="index"
                class="data-row"
              >
                <td class="data-cell sticky-column account-code-cell">
                  <div class="gl-code-content">
                    <span class="text-primary font-weight-medium">{{ item.gl_code }}</span>
                  </div>
                </td>
                <td class="data-cell description-cell">
                  <div class="description-content" :title="item.Desc">
                    {{ item.Desc }}
                  </div>
                </td>
                <!-- Opening Dr/Cr -->
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.OP_DR) }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.OP_CR) }}</span>
                </td>
                <!-- Movement Dr/Cr -->
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Mo_DR) }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Mo_Cr) }}</span>
                </td>
                <!-- Closing Dr/Cr -->
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.C1_DR) }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.C1_CR) }}</span>
                </td>
                <!-- Currency -->
                <td class="data-cell extra-column-cell">
                  <v-chip 
                    size="small" 
                    :color="getCurrencyColor(item.CCy_Code_id)" 
                    variant="tonal"
                  >
                    {{ item.CCy_Code_id }}
                  </v-chip>
                </td>
                <!-- Category -->
                <td class="data-cell extra-column-cell">
                  <v-chip 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  >
                    {{ item.Category }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Notification Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
      location="top"
      elevation="6"
    >
      <div class="d-flex align-center">
        <v-icon start :icon="snackbar.icon" />
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
import { ref, onMounted, computed, nextTick } from 'vue'
import axios from '@/helpers/axios'
import * as XLSX from 'xlsx'

// Page Meta
definePageMeta({
  title: 'Main Trial Balance',
  layout: 'default'
})

// Types
interface TrialBalanceItem {
  gl_code: string
  Desc: string
  OP_DR: number
  OP_CR: number
  Mo_DR: number
  Mo_Cr: number
  C1_DR: number
  C1_CR: number
  CCy_Code_id: string
  MSegment: string
  Category: string
}

interface ApiResponse {
  status: 'success' | 'error'
  message: string
  count?: number
  currency?: string
  data: TrialBalanceItem[]
}

// Authentication helper
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) {
    throw new Error('Authentication token not found')
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}

// Reactive state
const loading = ref(false)
const searchText = ref('')
const selectedCurrency = ref('all') // Default to 'all'
const trialBalanceData = ref<TrialBalanceItem[]>([])

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Currency options with 'all' as default
const currencyOptions = [
  {
    title: 'ທຸກສະກຸນເງິນ (All Currencies)',
    value: 'all',
    subtitle: 'ສະແດງຂໍ້ມູນທຸກສະກຸນເງິນ',
    icon: 'mdi-currency-usd-circle'
  },
  {
    title: 'ກີບລາວ (LAK)',
    value: 'LAK',
    subtitle: 'Lao Kip',
    icon: 'mdi-currency-kzt'
  },
  {
    title: 'ໂດລາສະຫະລັດ (USD)',
    value: 'USD',
    subtitle: 'US Dollar',
    icon: 'mdi-currency-usd'
  },
  {
    title: 'ບາດໄທ (THB)',
    value: 'THB',
    subtitle: 'Thai Baht',
    icon: 'mdi-currency-jpy'
  }
]

// Computed properties
const chipColor = computed(() => {
  if (selectedCurrency.value === 'all') return 'success'
  switch (selectedCurrency.value) {
    case 'LAK': return 'success'
    case 'USD': return 'primary'
    case 'THB': return 'warning'
    default: return 'info'
  }
})

const chipText = computed(() => {
  if (selectedCurrency.value === 'all') return 'ທຸກສະກຸນເງິນ'
  return selectedCurrency.value
})

// Filter data based on search text
const filteredData = computed(() => {
  if (!searchText.value) return trialBalanceData.value
  
  const search = searchText.value.toLowerCase()
  return trialBalanceData.value.filter(item => 
    item.gl_code?.toLowerCase().includes(search) ||
    item.Desc?.toLowerCase().includes(search) ||
    item.CCy_Code_id?.toLowerCase().includes(search) ||
    item.Category?.toString().includes(search)
  )
})

// API calls
const fetchTrialBalanceData = async () => {
  try {
    loading.value = true
    
    let response: ApiResponse
    
    if (selectedCurrency.value === 'all') {
      // Call all-currencies API
      console.log('🔄 Calling all-currencies API')
      const apiResponse = await axios.get('/api/main-trial-balance/all-currencies/', getAuthHeaders())
      response = apiResponse.data
    } else {
      // Call by-currency API
      console.log(`🔄 Calling by-currency API for ${selectedCurrency.value}`)
      const apiResponse = await axios.post('/api/main-trial-balance/by-currency/', {
        currency: selectedCurrency.value
      }, getAuthHeaders())
      response = apiResponse.data
    }
    
    if (response.status === 'success') {
      trialBalanceData.value = response.data || []
      
      const currencyDisplay = selectedCurrency.value === 'all' ? 'ທຸກສະກຸນເງິນ' : selectedCurrency.value
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນ Main Trial Balance ${currencyDisplay} ສຳເລັດ (${trialBalanceData.value.length} ລາຍການ)`,
        'success',
        'mdi-check-circle'
      )
      
      console.log(`✅ Data loaded successfully: ${trialBalanceData.value.length} records`)
    } else {
      throw new Error(response.message || 'Unknown error occurred')
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching trial balance data:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ Main Trial Balance'
    let errorIcon = 'mdi-alert-circle'
    
    // Handle specific errors
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
      errorIcon = 'mdi-account-alert'
    } else if (error?.response?.status === 403) {
      errorMessage = '🚫 ທ່ານບໍ່ມີສິດໃນການເຂົ້າເຖິງຂໍ້ມູນນີ້'
      errorIcon = 'mdi-lock-alert'
    } else if (error?.response?.status === 404) {
      errorMessage = '🔍 ບໍ່ພົບ API endpoint ທີ່ຕ້ອງການ'
      errorIcon = 'mdi-api-off'
    } else if (error?.response?.status === 400) {
      errorMessage = '📋 ຂໍ້ມູນທີ່ສົ່ງມາບໍ່ຖືກຕ້ອງ: ' + (error?.response?.data?.message || 'Invalid request format')
      errorIcon = 'mdi-form-select'
    } else if (error?.response?.status === 500) {
      errorMessage = '🔧 ເກີດຂໍ້ຜິດພາດຈາກເຊີຟເວີ ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ'
      errorIcon = 'mdi-server-network-off'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error?.message === 'Authentication token not found') {
      errorMessage = '🔑 ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ'
      errorIcon = 'mdi-account-alert'
    } else if (error?.message?.includes('Network Error')) {
      errorMessage = '🌐 ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີຟເວີໄດ້'
      errorIcon = 'mdi-wifi-off'
    }
    
    showSnackbar(errorMessage, 'error', errorIcon)
    trialBalanceData.value = []
    
  } finally {
    loading.value = false
  }
}

// Event handlers
const onCurrencyChange = (newValue: string) => {
  console.log(`🔄 Currency changed to: ${newValue}`)
  // Clear previous data when currency changes
  trialBalanceData.value = []
  
  // Auto-fetch data when currency changes
  nextTick(() => {
    fetchTrialBalanceData()
  })
}

// Utility functions
const formatCurrency = (value: number | string | undefined): string => {
  const numValue = Number(value || 0)
  if (numValue === 0) return '-'
  return numValue.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getCurrencyColor = (currency: string) => {
  const colors = {
    'LAK': 'success',
    'USD': 'primary',
    'THB': 'warning',
    'EUR': 'info',
    'JPY': 'purple'
  }
  return colors[currency as keyof typeof colors] || 'grey'
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// Export to Excel function
const exportToExcel = () => {
  try {
    if (!trialBalanceData.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    // Prepare export data
    const exportData = trialBalanceData.value.map(item => ({
      'GL Code': item.gl_code,
      'Description': item.Desc,
      'Opening Dr': item.OP_DR,
      'Opening Cr': item.OP_CR,
      'Movement Dr': item.Mo_DR,
      'Movement Cr': item.Mo_Cr,
      'Closing Dr': item.C1_DR,
      'Closing Cr': item.C1_CR,
      'Currency': item.CCy_Code_id,
      'Category': item.Category
    }))

    // Create and save Excel file
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // GL Code
      { wch: 30 }, // Description
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, // Amount columns
      { wch: 12 }, { wch: 12 }, // Amount columns
      { wch: 10 }, // Currency
      { wch: 10 }  // Category
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Main Trial Balance')

    // Generate secure filename
    const currentDate = new Date().toISOString().split('T')[0]
    const currencyPart = selectedCurrency.value === 'all' ? 'AllCurrencies' : selectedCurrency.value
    const filename = `Main_Trial_Balance_${currencyPart}_${currentDate}.xlsx`

    XLSX.writeFile(wb, filename)

    showSnackbar(
      `📊 ສົ່ງອອກສຳເລັດ (${currencyPart}) - ${trialBalanceData.value.length} ລາຍການ`, 
      'success', 
      'mdi-download'
    )

  } catch (error) {
    console.error('Export error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ', 'error', 'mdi-alert-circle')
  }
}

// Initialize component
onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    if (token) {
      console.log('🚀 Component mounted, loading default data...')
      // Auto-fetch data on mount with default 'all' selection
      await fetchTrialBalanceData()
    } else {
      showSnackbar('🔑 ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
    }
  } catch (error) {
    console.error('Initialization error:', error)
  }
})
</script>

<style scoped>
/* Custom Table Container */
.custom-table-container {
  width: 100%;
  max-height: 65vh;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  position: relative;
}

/* Custom Table */
.custom-trial-balance-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  min-width: 1200px;
}

/* Header Rows */
.main-header-row {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.sub-header-row {
  background: #fafafa;
}

/* Header Cells */
.header-cell {
  padding: 12px 8px;
  font-weight: 600;
  color: #37474f;
  border: 1px solid #dee2e6;
  vertical-align: middle;
  text-align: center;
  white-space: nowrap;
}

/* GL Code Header - Optimized Width */
.account-code-header {
  width: 150px;
  min-width: 150px;
  max-width: 150px;
}

.header-content-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Description Header - Fixed for no-wrap */
.description-header {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  text-align: left;
}

.header-content-left {
  display: flex;
  align-items: center;
  padding-left: 16px;
  width: 100%;
  height: 100%;
}

.group-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.group-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.sub-header {
  width: 140px;
  min-width: 140px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #fafafa;
  color: #546e7a;
}

/* Extra columns for Currency and Category */
.extra-column-header {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

/* Sticky Column */
.sticky-column {
  position: sticky;
  left: 0;
  z-index: 2;
  background: white;
  border-right: 2px solid #dee2e6 !important;
}

.main-header-row .sticky-column,
.sub-header-row .sticky-column {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

/* Data Rows */
.data-row {
  transition: background-color 0.2s;
  background: white;
}

.data-row:hover {
  background-color: #f8f9fa !important;
}

.data-row:nth-child(even) {
  background-color: #fafafa;
}

/* Data Cells */
.data-cell {
  padding: 10px 8px;
  border: 1px solid #f0f0f0;
  vertical-align: middle;
}

/* GL Code Cell - Optimized */
.account-code-cell {
  width: 150px;
  min-width: 150px;
  max-width: 150px;
  text-align: left;
  font-weight: 500;
  background: white;
}

.gl-code-content {
  display: flex;
  align-items: left;
  justify-content: left;
  width: 100%;
  padding: 0 8px;
}

.data-row:hover .account-code-cell {
  background-color: #f8f9fa;
}

/* Description Cell - No Wrap with Ellipsis */
.description-cell {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  padding: 10px 16px;
}

.description-content {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  cursor: default;
}

.description-content:hover {
  cursor: help;
}

/* Amount Cells */
.amount-cell {
  width: 140px;
  min-width: 140px;
  text-align: right;
  padding-right: 12px;
}

.amount-value {
  font-family: 'Roboto Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0,0,0,0.02);
  min-width: 100px;
  text-align: right;
}

.amount-value.text-success {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.08);
}

.amount-value.text-error {
  color: #f44336;
  background: rgba(244, 67, 54, 0.08);
}

/* Extra Column Cells for Currency and Category */
.extra-column-cell {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  text-align: center;
  padding: 8px;
}

/* Scrollbar Styling */
.custom-table-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.custom-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.custom-table-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.custom-table-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.custom-table-container::-webkit-scrollbar-corner {
  background: #f1f1f1;
}

/* Responsive adjustments */
@media (max-width: 1400px) {
  .description-header,
  .description-cell {
    width: 350px;
    min-width: 350px;
    max-width: 350px;
  }
}

@media (max-width: 1200px) {
  .custom-trial-balance-table {
    font-size: 0.8rem;
    min-width: 1100px;
  }
  
  .account-code-header,
  .account-code-cell {
    width: 130px;
    min-width: 130px;
    max-width: 130px;
  }
  
  .description-header,
  .description-cell {
    width: 300px;
    min-width: 300px;
    max-width: 300px;
  }
  
  .header-cell {
    padding: 10px 6px;
  }
  
  .data-cell {
    padding: 8px 6px;
  }
  
  .amount-value {
    font-size: 0.8rem;
    min-width: 85px;
  }
  
  .sub-header {
    width: 130px;
    min-width: 130px;
  }
  
  .amount-cell {
    width: 130px;
    min-width: 130px;
  }
  
  .extra-column-header,
  .extra-column-cell {
    width: 100px;
    min-width: 100px;
    max-width: 100px;
  }
}

@media (max-width: 960px) {
  .custom-trial-balance-table {
    font-size: 0.75rem;
    min-width: 1000px;
  }
  
  .account-code-header,
  .account-code-cell {
    width: 110px;
    min-width: 110px;
    max-width: 110px;
  }
  
  .description-header,
  .description-cell {
    width: 250px;
    min-width: 250px;
    max-width: 250px;
  }
  
  .header-cell {
    padding: 8px 4px;
    font-size: 0.75rem;
  }
  
  .sub-header {
    font-size: 0.7rem;
    width: 120px;
    min-width: 120px;
  }
  
  .data-cell {
    padding: 6px 4px;
    font-size: 0.75rem;
  }
  
  .amount-cell {
    width: 120px;
    min-width: 120px;
  }
  
  .amount-value {
    font-size: 0.75rem;
    min-width: 75px;
    padding: 1px 4px;
  }
  
  .extra-column-header,
  .extra-column-cell {
    width: 90px;
    min-width: 90px;
    max-width: 90px;
  }
}

@media (max-width: 600px) {
  .custom-table-container {
    border-radius: 4px;
  }
  
  .custom-trial-balance-table {
    font-size: 0.7rem;
    min-width: 900px;
  }
  
  .account-code-header,
  .account-code-cell {
    width: 100px;
    min-width: 100px;
    max-width: 100px;
  }
  
  .description-header,
  .description-cell {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }
  
  .description-content {
    font-size: 0.7rem;
  }
  
  .sub-header,
  .amount-cell {
    width: 100px;
    min-width: 100px;
  }
  
  .amount-value {
    font-size: 0.7rem;
    min-width: 65px;
  }
  
  .extra-column-header,
  .extra-column-cell {
    width: 80px;
    min-width: 80px;
    max-width: 80px;
  }
}

/* Print styles */
@media print {
  .custom-table-container {
    max-height: none;
    overflow: visible;
    border: none;
  }
  
  .sticky-column {
    position: static;
  }
  
  .data-row:hover {
    background-color: transparent !important;
  }
  
  .description-content {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
}
</style>