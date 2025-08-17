<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" style="border: 1px solid #e0e0e0; width: 100%;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
        <v-icon start size="24">mdi-chart-line</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
          ລາຍງານໃບດຸ່ນດຽງ - DairyReport
          {{ selectedCurrency === 'all' ? 'ທຸກສະກຸນເງິນ' : selectedCurrency }}
        </span>
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
                    <!-- <v-list-item-title>{{ item.raw.title }}</v-list-item-title> -->
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

        <!-- Data Table with Grouped Headers -->
        <div class="table-container">
          <!-- Top Actions Bar -->
          <div class="d-flex justify-space-between align-center pa-4 bg-grey-lighten-5 table-top-bar">
            <div class="text-h6 font-weight-medium text-styles">
              ຜົນການຄົ້ນຫາ: {{ filteredData.length }} ລາຍການ
              <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
                {{ chipText }}
              </v-chip>
            </div>
            <div class="text-caption text-grey-darken-1">
              API: {{ selectedCurrency === 'all' ? 'all-currencies' : 'by-currency' }}
            </div>
          </div>

          <!-- Group Headers Row -->
          <div class="group-headers-wrapper">
            <table class="group-headers-table">
              <thead>
                <tr class="group-header-row">
                  <th class="group-header-cell sticky-col text-left">
                    <span class="text-subtitle-2 font-weight-bold">GL Code</span>
                  </th>
                  <th class="group-header-cell text-left">
                    <span class="text-subtitle-2 font-weight-bold">ລາຍລະອຽດ</span>
                  </th>
                  <th class="group-header-cell text-center" colspan="2">
                    <div class="header-content">
                      <v-icon start size="16" color="success">mdi-arrow-up-circle</v-icon>
                      <span class="text-subtitle-1 font-weight-bold text-success">ຍອດຍົກ</span>
                    </div>
                  </th>
                  <th class="group-header-cell text-center" colspan="2">
                    <div class="header-content">
                      <v-icon start size="16" color="info">mdi-swap-horizontal-circle</v-icon>
                      <span class="text-subtitle-1 font-weight-bold text-info">ຍອດເຄື່ອນ</span>
                    </div>
                  </th>
                  <th class="group-header-cell text-center" colspan="2">
                    <div class="header-content">
                      <v-icon start size="16" color="warning">mdi-arrow-down-circle</v-icon>
                      <span class="text-subtitle-1 font-weight-bold text-warning">ຍອດເຫຼືອ</span>
                    </div>
                  </th>
                  <th class="group-header-cell text-center">
                    <span class="text-subtitle-2 font-weight-bold">Currency</span>
                  </th>
                  <th class="group-header-cell text-center">
                    <span class="text-subtitle-2 font-weight-bold">Category</span>
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          <!-- Main Data Table -->
          <v-data-table
            :headers="customHeaders"
            :items="filteredData"
            :items-per-page="25"
            :loading="loading"
            class="elevation-0 professional-table"
            density="compact"
            hover
            show-current-page
            fixed-header
            height="550"
          >
            <!-- Loading State -->
            <template #loading>
              <v-skeleton-loader type="table-row@10" />
            </template>
            
            <!-- Custom Row Template -->
            <template #item="{ item }">
              <tr class="table-row">
                <td class="font-weight-medium text-primary sticky-col">
                  {{ item.gl_code }}
                </td>
                <td class="description-cell">
                  <span :title="item.Desc">{{ item.Desc }}</span>
                </td>
                <td class="text-right font-mono amount-column">
                  <span class="amount-cell">{{ formatCurrency(item.OP_DR) }}</span>
                </td>
                <td class="text-right font-mono amount-column">
                  <span class="amount-cell">{{ formatCurrency(item.OP_CR) }}</span>
                </td>
                <td class="text-right font-mono amount-column">
                  <span class="amount-cell">{{ formatCurrency(item.Mo_DR) }}</span>
                </td>
                <td class="text-right font-mono amount-column">
                  <span class="amount-cell">{{ formatCurrency(item.Mo_Cr) }}</span>
                </td>
                <td class="text-right font-mono amount-column">
                  <span class="amount-cell text-success font-weight-medium">
                    {{ formatCurrency(item.C1_DR) }}
                  </span>
                </td>
                <td class="text-right font-mono amount-column">
                  <span class="amount-cell text-error font-weight-medium">
                    {{ formatCurrency(item.C1_CR) }}
                  </span>
                </td>
                <td class="text-center currency-column">
                  <v-chip size="small" :color="getCurrencyColor(item.CCy_Code_id)" variant="tonal">
                    {{ item.CCy_Code_id }}
                  </v-chip>
                </td>
                <td class="text-center category-column">
                  <v-chip size="small" color="info" variant="outlined">
                    {{ item.Category }}
                  </v-chip>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <template #no-data>
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-chart-line-variant</v-icon>
                <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
                <div class="text-body-2 text-grey">ກະລຸນາກົດປຸ່ມດຶງຂໍ້ມູນເພື່ອໂຫຼດຂໍ້ມູນ</div>
              </div>
            </template>
          </v-data-table>
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

// Table headers for the grouped display
const customHeaders = [
  { 
    title: '', 
    key: 'gl_code', 
    width: '120px', 
    sortable: true, 
    align: 'start',
    class: 'sticky-col text-left'
  },
  { 
    title: '', 
    key: 'Desc', 
    width: '250px', 
    sortable: true, 
    align: 'start',
    class: 'description-col text-left'
  },
  { 
    title: 'Dr', 
    key: 'OP_DR', 
    width: '120px', 
    align: 'end', 
    sortable: true, 
    class: 'amount-col text-center'
  },
  { 
    title: 'Cr', 
    key: 'OP_CR', 
    width: '120px', 
    align: 'end', 
    sortable: true, 
    class: 'amount-col text-center'
  },
  { 
    title: 'Dr', 
    key: 'Mo_DR', 
    width: '120px', 
    align: 'end', 
    sortable: true, 
    class: 'amount-col text-center'
  },
  { 
    title: 'Cr', 
    key: 'Mo_Cr', 
    width: '120px', 
    align: 'end', 
    sortable: true, 
    class: 'amount-col text-center'
  },
  { 
    title: 'Dr', 
    key: 'C1_DR', 
    width: '120px', 
    align: 'end', 
    sortable: true, 
    class: 'amount-col text-center'
  },
  { 
    title: 'Cr', 
    key: 'C1_CR', 
    width: '120px', 
    align: 'end', 
    sortable: true, 
    class: 'amount-col text-center'
  },
  { 
    title: '', 
    key: 'CCy_Code_id', 
    width: '100px', 
    align: 'center', 
    sortable: true,
    class: 'text-center'
  },
  { 
    title: '', 
    key: 'Category', 
    width: '100px', 
    align: 'center', 
    sortable: true,
    class: 'text-center'
  }
]

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
/* Table Container and Base Styles */
.table-container {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

/* 
  NOTE: Borders are added for alignment debugging and visual clarity.
  To remove borders for a cleaner look, you can:
  1. Change border-collapse: collapse to border-collapse: separate
  2. Remove border declarations from .group-header-cell and .professional-table :deep() selectors
  3. Keep only border-right: 2px solid #dee2e6 for sticky columns
*/

.table-top-bar {
  border-bottom: 1px solid #e0e0e0;
  border-radius: 8px 8px 0 0;
}

/* Group Headers Styling */
.group-headers-wrapper {
  width: 100%;
  overflow-x: auto;
  border-bottom: none;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.group-headers-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 1200px;
}

.group-header-row {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.group-header-cell {
  padding: 12px 8px !important;
  border: 1px solid #dee2e6;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  vertical-align: middle;
  font-weight: 600;
  color: #37474f;
  white-space: nowrap;
  box-sizing: border-box;
}

/* Exact width matching with data table columns - with borders */
.group-header-cell:nth-child(1) {
  width: 120px;
  position: sticky;
  left: 0;
  z-index: 15;
  border-right: 2px solid #dee2e6;
  text-align: left;
  padding-left: 12px !important;
}

.group-header-cell:nth-child(2) {
  width: 250px;
  text-align: left;
  padding-left: 12px !important;
}

.group-header-cell:nth-child(3) {
  width: 241px; /* 120px + 120px + 1px border */
  text-align: center;
}

.group-header-cell:nth-child(4) {
  width: 241px; /* 120px + 120px + 1px border */
  text-align: center;
}

.group-header-cell:nth-child(5) {
  width: 241px; /* 120px + 120px + 1px border */
  text-align: center;
}

.group-header-cell:nth-child(6) {
  width: 100px;
  text-align: center;
}

.group-header-cell:nth-child(7) {
  width: 100px;
  text-align: center;
  border-right: none;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

/* Adjust main table to align with group headers */
.professional-table {
  border-radius: 0 0 8px 8px !important;
  border-top: none !important;
  border: 1px solid #dee2e6 !important;
  border-top: none !important;
  width: 100%;
  min-width: 1200px;
}

.professional-table :deep(.v-data-table__wrapper) {
  border-collapse: collapse;
}

.professional-table :deep(.v-data-table__wrapper table) {
  border-collapse: collapse;
  table-layout: fixed;
}

.professional-table :deep(.v-data-table__thead > tr > th) {
  background-color: #ffffff !important;
  border-top: none;
  padding: 8px 12px !important;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
  box-sizing: border-box;
}

/* Exact column width and alignment matching */
.professional-table :deep(.v-data-table__thead > tr > th:nth-child(1)) {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  position: sticky;
  left: 0;
  z-index: 3;
  border-right: 2px solid #dee2e6;
  background-color: #ffffff !important;
  text-align: left !important;
}

.professional-table :deep(.v-data-table__thead > tr > th:nth-child(2)) {
  width: 250px !important;
  min-width: 250px !important;
  max-width: 250px !important;
  text-align: left !important;
}

.professional-table :deep(.v-data-table__thead > tr > th:nth-child(3)),
.professional-table :deep(.v-data-table__thead > tr > th:nth-child(4)) {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  text-align: center !important;
}

.professional-table :deep(.v-data-table__thead > tr > th:nth-child(5)),
.professional-table :deep(.v-data-table__thead > tr > th:nth-child(6)) {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  text-align: center !important;
}

.professional-table :deep(.v-data-table__thead > tr > th:nth-child(7)),
.professional-table :deep(.v-data-table__thead > tr > th:nth-child(8)) {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  text-align: center !important;
}

.professional-table :deep(.v-data-table__thead > tr > th:nth-child(9)),
.professional-table :deep(.v-data-table__thead > tr > th:nth-child(10)) {
  width: 100px !important;
  min-width: 100px !important;
  max-width: 100px !important;
  text-align: center !important;
}

.professional-table :deep(.v-data-table__thead > tr > th:nth-child(10)) {
  border-right: none;
}

/* Data cell alignment with borders */
.professional-table :deep(.v-data-table__td) {
  padding: 8px 12px !important;
  border: 1px solid #f0f0f0;
  font-size: 0.875rem;
  vertical-align: middle;
  white-space: nowrap;
  box-sizing: border-box;
}

.professional-table :deep(.v-data-table__td:nth-child(1)) {
  width: 120px !important;
  position: sticky;
  left: 0;
  z-index: 1;
  border-right: 2px solid #dee2e6;
  background-color: white !important;
  text-align: left !important;
  font-weight: 500;
}

.professional-table :deep(.v-data-table__td:nth-child(2)) {
  width: 250px !important;
  text-align: left !important;
}

.professional-table :deep(.v-data-table__td:nth-child(3)),
.professional-table :deep(.v-data-table__td:nth-child(4)),
.professional-table :deep(.v-data-table__td:nth-child(5)),
.professional-table :deep(.v-data-table__td:nth-child(6)),
.professional-table :deep(.v-data-table__td:nth-child(7)),
.professional-table :deep(.v-data-table__td:nth-child(8)) {
  width: 120px !important;
  text-align: right !important;
}

.professional-table :deep(.v-data-table__td:nth-child(9)),
.professional-table :deep(.v-data-table__td:nth-child(10)) {
  width: 100px !important;
  text-align: center !important;
}

.professional-table :deep(.v-data-table__td:nth-child(10)) {
  border-right: none;
}

.font-mono {
  font-family: 'Roboto Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table-row:hover .sticky-col {
  background-color: #f8f9fa !important;
}

.table-row:hover .description-cell {
  background-color: #f8f9fa !important;
}

.amount-cell {
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  font-size: 0.85rem;
  font-weight: 500;
  min-width: 80px;
  display: inline-block;
}

.description-cell {
  width: 250px !important;
  min-width: 250px !important;
  max-width: 250px !important;
  padding: 8px 12px !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: left !important;
}

.description-cell span {
  display: block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.amount-column {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
}

.currency-column,
.category-column {
  width: 100px !important;
  min-width: 100px !important;
  max-width: 100px !important;
}

.sticky-col {
  position: sticky !important;
  left: 0 !important;
  background-color: white !important;
  z-index: 1 !important;
  border-right: 2px solid #dee2e6 !important;
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  text-align: left !important;
}

.professional-table :deep(.v-data-table__td) {
  padding: 8px 12px !important;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.875rem;
  vertical-align: middle;
  white-space: nowrap;
  border-right: 1px solid #f0f0f0;
}

.professional-table :deep(.v-data-table__wrapper) {
  overflow-x: auto;
}

/* Responsive design */
@media (max-width: 1200px) {
  .amount-cell {
    font-size: 0.75rem;
    padding: 2px 6px;
    min-width: 70px;
  }
  
  .professional-table :deep(.v-data-table__td) {
    padding: 6px 8px !important;
    font-size: 0.8rem;
  }
  
  .group-headers-table {
    min-width: 1000px;
  }
  
  .professional-table {
    min-width: 1000px;
  }
  
  /* Maintain exact column alignment with borders */
  .group-header-cell:nth-child(3),
  .group-header-cell:nth-child(4),
  .group-header-cell:nth-child(5) {
    width: 201px; /* 100px + 100px + 1px border */
  }
  
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(3)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(4)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(5)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(6)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(7)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(8)) {
    width: 100px !important;
    min-width: 100px !important;
    max-width: 100px !important;
  }
  
  .professional-table :deep(.v-data-table__td:nth-child(3)),
  .professional-table :deep(.v-data-table__td:nth-child(4)),
  .professional-table :deep(.v-data-table__td:nth-child(5)),
  .professional-table :deep(.v-data-table__td:nth-child(6)),
  .professional-table :deep(.v-data-table__td:nth-child(7)),
  .professional-table :deep(.v-data-table__td:nth-child(8)) {
    width: 100px !important;
  }
  
  .amount-column {
    width: 100px !important;
    min-width: 100px !important;
    max-width: 100px !important;
  }
  
  .group-header-cell {
    padding: 10px 6px !important;
    font-size: 0.85rem;
  }
}

@media (max-width: 960px) {
  .font-mono { 
    font-size: 0.75rem; 
  }
  
  .amount-cell { 
    padding: 2px 4px; 
    font-size: 0.7rem;
    min-width: 60px;
  }
  
  .professional-table :deep(.v-data-table__td) { 
    padding: 4px 6px !important; 
    font-size: 0.75rem;
  }
  
  .description-cell {
    width: 200px !important;
    min-width: 200px !important;
    max-width: 200px !important;
  }
  
  .group-header-cell:nth-child(2) {
    width: 200px;
  }
  
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(2)) {
    width: 200px !important;
    min-width: 200px !important;
    max-width: 200px !important;
  }
  
  .professional-table :deep(.v-data-table__td:nth-child(2)) {
    width: 200px !important;
  }
  
  .group-header-cell:nth-child(3),
  .group-header-cell:nth-child(4),
  .group-header-cell:nth-child(5) {
    width: 181px; /* 90px + 90px + 1px border */
  }
  
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(3)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(4)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(5)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(6)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(7)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(8)) {
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
  }
  
  .professional-table :deep(.v-data-table__td:nth-child(3)),
  .professional-table :deep(.v-data-table__td:nth-child(4)),
  .professional-table :deep(.v-data-table__td:nth-child(5)),
  .professional-table :deep(.v-data-table__td:nth-child(6)),
  .professional-table :deep(.v-data-table__td:nth-child(7)),
  .professional-table :deep(.v-data-table__td:nth-child(8)) {
    width: 90px !important;
  }
  
  .amount-column {
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
  }
  
  .group-header-cell {
    padding: 8px 4px !important;
    font-size: 0.8rem;
  }
  
  .header-content {
    font-size: 0.75rem;
  }
}

@media (max-width: 600px) {
  .table-container {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }
  
  .group-headers-table {
    min-width: 800px;
  }
  
  .professional-table {
    min-width: 800px;
  }
  
  .description-cell {
    width: 180px !important;
    min-width: 180px !important;
    max-width: 180px !important;
  }
  
  .group-header-cell:nth-child(2) {
    width: 180px;
  }
  
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(2)) {
    width: 180px !important;
    min-width: 180px !important;
    max-width: 180px !important;
  }
  
  .professional-table :deep(.v-data-table__td:nth-child(2)) {
    width: 180px !important;
  }
  
  .group-header-cell:nth-child(3),
  .group-header-cell:nth-child(4),
  .group-header-cell:nth-child(5) {
    width: 161px; /* 80px + 80px + 1px border */
  }
  
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(3)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(4)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(5)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(6)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(7)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(8)) {
    width: 80px !important;
    min-width: 80px !important;
    max-width: 80px !important;
  }
  
  .professional-table :deep(.v-data-table__td:nth-child(3)),
  .professional-table :deep(.v-data-table__td:nth-child(4)),
  .professional-table :deep(.v-data-table__td:nth-child(5)),
  .professional-table :deep(.v-data-table__td:nth-child(6)),
  .professional-table :deep(.v-data-table__td:nth-child(7)),
  .professional-table :deep(.v-data-table__td:nth-child(8)) {
    width: 80px !important;
  }
  
  .amount-column {
    width: 80px !important;
    min-width: 80px !important;
    max-width: 80px !important;
  }
  
  .group-header-cell {
    padding: 6px 3px !important;
    font-size: 0.75rem;
  }
  
  .header-content {
    font-size: 0.7rem;
  }
  
  .group-header-cell .header-content {
    flex-direction: column;
    gap: 2px;
  }
  
  .currency-column,
  .category-column {
    width: 80px !important;
    min-width: 80px !important;
    max-width: 80px !important;
  }
  
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(9)),
  .professional-table :deep(.v-data-table__thead > tr > th:nth-child(10)) {
    width: 80px !important;
    min-width: 80px !important;
    max-width: 80px !important;
    font-size: 0.7rem;
  }
  
  .professional-table :deep(.v-data-table__td:nth-child(9)),
  .professional-table :deep(.v-data-table__td:nth-child(10)) {
    width: 80px !important;
  }
}
</style>