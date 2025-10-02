<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" style="border: 1px solid #e0e0e0; width: 100%;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
        <v-icon start size="24">mdi-file-chart</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
          ລາຍງານຜົນການດໍາເນີນງານ (Income Statement) - 
          {{ selectedTab.toUpperCase() }} {{ selectedSegment }} {{ selectedCurrency }}
          <span v-if="periodCodeId" class="ml-2 text-caption text-styles">
            ({{ formatPeriodDisplay(periodCodeId) }})
          </span>
        </span>
      </v-card-title>
      
      <v-card-text class="px-6 py-4">
        <!-- Tabs Section -->
        <v-tabs v-model="selectedTab" class="mb-4" color="primary" align-tabs="start">
          <v-tab value="acc" prepend-icon="mdi-office-building">
            <span class="font-weight-medium">ACC</span>
            <span class="text-caption ml-1">(Accounting)</span>
          </v-tab>
          <v-tab value="mfi" prepend-icon="mdi-bank">
            <span class="font-weight-medium">MFI</span>
            <span class="text-caption ml-1">(Microfinance)</span>
          </v-tab>
        </v-tabs>

        <!-- Filter Form -->
        <v-form @submit.prevent="fetchIncomeStatementData" class="mb-4">
          <v-row no-gutters class="mb-4 align-center">
            <!-- Segment Selection -->
            <v-col cols="12" md="2" class="pe-md-2 mb-3 mb-md-0">
              <v-select
                v-model="selectedSegment"
                :items="segmentOptions"
                label="ເລືອກປະເພດ"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-tag"
                hide-details="auto"
                @update:model-value="onSegmentChange"
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
            
            <!-- Currency Selection -->
            <v-col cols="12" md="2" class="px-md-1 mb-3 mb-md-0">
              <v-select
                v-model="selectedCurrency"
                :items="currencyOptions"
                label="ເລືອກສະກຸນເງິນ"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-currency-usd"
                hide-details="auto"
                :disabled="!selectedSegment"
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

            <!-- Period Code Input -->
            <v-col cols="12" md="2" class="px-md-1 mb-3 mb-md-0">
              <v-text-field
                v-model="periodCodeId"
                label="ລະຫັດເດືອນ (YYYYMM)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-month"
                hide-details="auto"
                maxlength="6"
                :rules="[v => !v || /^[0-9]{6}$/.test(v) || 'ປ້ອນຮູບແບບ YYYYMM']"
                clearable
                @blur="validatePeriod"
              />
            </v-col>

            <!-- Search Field -->
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
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
            <v-col cols="12" md="3" class="ps-md-2 d-flex gap-2">
              <v-btn
                type="submit"
                color="primary"
                prepend-icon="mdi-refresh"
                :loading="loading"
                :disabled="!selectedSegment || !selectedCurrency"
                class="flex-grow-1"
                density="compact"
                style="height: 40px;"
              >
                ດຶງຂໍ້ມູນ
              </v-btn>
              <v-btn
                color="success"
                prepend-icon="mdi-microsoft-excel"
                :disabled="!incomeStatementData.length || loading"
                @click="exportToExcel"
                density="compact"
                style="height: 40px; min-width: 100px;"
              >
                Excel
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-divider class="mb-4" thickness="1" color="grey-lighten-3" />

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="filteredData"
          :items-per-page="25"
          :loading="loading"
          class="elevation-0 professional-table"
          density="compact"
          hover
          show-current-page
          fixed-header
          height="600"
        >
          <!-- Loading State -->
          <template #loading>
            <v-skeleton-loader type="table-row@10" />
          </template>
          
          <!-- Table Top Actions -->
          <template #top>
            <div class="d-flex justify-space-between align-center pa-4 bg-grey-lighten-5">
              <div class="text-h6 font-weight-medium text-styles">
                ຜົນການຄົ້ນຫາ: {{ filteredData.length }} ລາຍການ
                <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
                  {{ chipText }}
                </v-chip>
                <v-chip v-if="periodCodeId" size="small" color="orange" variant="tonal" class="ml-1">
                  {{ formatPeriodDisplay(periodCodeId) }}
                </v-chip>
              </div>
              <div class="text-caption text-grey-darken-1">
                API: {{ selectedTab.toUpperCase() }} - {{ selectedSegment }} {{ selectedCurrency }}
              </div>
            </div>
          </template>
          
          <!-- Custom Row Template -->
          <template #item="{ item }">
            <tr class="table-row"
                :class="[
                    // Blue for special Lao descriptions
                    (item.description === 'ຄ. ລາຍຮັບ ແລະ ລາຍຈ່າຍພິເສດ(ບັງເອີນ)' ||
                    item.description === 'ຂ. ລາຍຮັບ ແລະ ລາຍຈ່າຍປົກກະຕິ' ||
                    item.description === 'ກ. ລາຍຮັບ ແລະ ລາຍຈ່າຍໃນການທຸລະກິດ')
                    ? 'highlight-grey-row'
                    : (
                        // Grey for Roman numerals I-XX (but not if it's a special Lao description)
                        /\b(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)\b/.test(item.description)
                        ? 'highlight-blue-row'
                        : ''
                    )
                ]"
            >
              <td class="description-cell" 
                :title="item.description"
                :class="[
                  (
                    item.description === 'ລາຍການໜີ້ສິນ ແລະທືນ' ||
                    item.description === 'ລວມຍອດຊັບສິນ' ||
                    /\b(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)\b/.test(item.description)
                    ||
                    /\b([1-9]|1[0-9]|2[0-9]|30)\)/.test(item.description)
                  )
                    ? 'font-weight-bold'
                    : ''
                ]">
                {{ item.description }}
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell" :class="getNetAmountClass(item.OPen_Total_amount)">
                  {{ formatCurrency(item.OPen_Total_amount) }}
                </span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell" :class="getNetAmountClass(item.Current_Total_amount)">
                  {{ formatCurrency(item.Current_Total_amount) }}
                </span>
              </td>
              <td class="text-center font-mono">
                <span class="amount-cell positive">{{ formatCurrency(item.currency_display) }}</span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell negative">{{ formatCurrency(item.segment_type) }}</span>
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-file-chart-outline</v-icon>
              <div class="text-h6 text-grey-darken-1 mb-2 text-styles">ບໍ່ມີຂໍ້ມູນ</div>
              <div class="text-body-2 text-grey text-styles">
                ກະລຸນາເລືອກ segment ແລະ currency ແລ້ວກົດດຶງຂໍ້ມູນ
              </div>
            </div>
          </template>
        </v-data-table>
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
import { ref, onMounted, computed, watch } from 'vue'
import axios from '@/helpers/axios'
import * as XLSX from 'xlsx'

// Page Meta
definePageMeta({
  title: 'Income Statement',
  layout: 'default'
})

// Types
interface IncomeStatementItem {
  no: number
  report_number: string
  description: string
  debit_amount: number
  credit_amount: number
  net_amount: number
  OPen_Total_amount: number
  Current_Total_amount: number
  currency_display: string
  segment_type: string
}

interface ApiResponse {
  status: 'success' | 'error'
  message: string
  segment?: string
  currency?: string
  type?: string
  count?: number
  data: IncomeStatementItem[]
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

// Utility function to get current period
const getCurrentPeriodCodeId = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}${month}`
}

// Format period for display
const formatPeriodDisplay = (periodCode: string): string => {
  if (!periodCode || periodCode.length !== 6) return ''
  const year = periodCode.substring(0, 4)
  const month = periodCode.substring(4, 6)
  const monthNames = [
    'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
    'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
  ]
  const monthIndex = parseInt(month) - 1
  return monthIndex >= 0 && monthIndex < 12 ? `${monthNames[monthIndex]} ${year}` : `${month}/${year}`
}

// Reactive state
const loading = ref(false)
const searchText = ref('')
const selectedTab = ref('acc')
const selectedSegment = ref('')
const selectedCurrency = ref('')
const incomeStatementData = ref<IncomeStatementItem[]>([])
const showCompareDialog = ref(false)
const compareResults = ref<any>(null)
const periodCodeId = ref('') // will be set by EOD

// Add EOD state
const eodInfo = ref<any>(null)
const targetDate = ref('')

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Options
const segmentOptions = [
  {
    title: 'Foreign Currency (FCY)',
    value: 'FCY',
    subtitle: 'ສະກຸນເງິນຕ່າງປະເທດ',
    icon: 'mdi-currency-usd'
  },
  {
    title: 'Local Currency Equivalent (LCY)',
    value: 'LCY', 
    subtitle: 'ທຽບເທົ່າກີບລາວ',
    icon: 'mdi-currency-kzt'
  }
]

// Dynamic currency options based on segment
const currencyOptions = computed(() => {
  if (selectedSegment.value === 'LCY') {
    return [
      { title: 'ກີບລາວ (LAK)', value: 'LAK', subtitle: 'Lao Kip', icon: 'mdi-currency-kzt' }
    ]
  } else if (selectedSegment.value === 'FCY') {
    return [
      { title: 'ກີບລາວ (LAK)', value: 'LAK', subtitle: 'Lao Kip', icon: 'mdi-currency-kzt' },
      { title: 'ໂດລາສະຫະລັດ (USD)', value: 'USD', subtitle: 'US Dollar', icon: 'mdi-currency-usd' },
      { title: 'ບາດໄທ (THB)', value: 'THB', subtitle: 'Thai Baht', icon: 'mdi-currency-jpy' },
    ]
  }
  return []
})

// Computed properties
const chipColor = computed(() => {
  if (selectedTab.value === 'acc') return 'primary'
  if (selectedTab.value === 'mfi') return 'success'
  return 'grey'
})

const chipText = computed(() => {
  const tab = selectedTab.value.toUpperCase()
  const segment = selectedSegment.value || '...'
  const currency = selectedCurrency.value || '...'
  return `${tab} - ${segment} ${currency}`
})

// Filter data based on search text
const filteredData = computed(() => {
  if (!searchText.value) return incomeStatementData.value
  
  const search = searchText.value.toLowerCase()
  return incomeStatementData.value.filter(item => 
    item.report_number?.toLowerCase().includes(search) ||
    item.description?.toLowerCase().includes(search) ||
    item.no?.toString().includes(search)
  )
})

// Table headers
const headers = [
  { title: 'ລາຍລະອຽດ', key: 'description', width: '400px', sortable: true },
  { title: 'ຍອດເດືອນກ່ອນ', key: 'OPen_Total_amount', width: '150px', align: 'end', sortable: true },
  { title: 'ຍອດເດືອນນີ້', key: 'Current_Total_amount', width: '150px', align: 'end', sortable: true },
  { title: 'ສະກຸນເງິນ', key: 'currency_display', width: '100px', align: 'center', sortable: true },
  { title: 'ປະເພດ', key: 'segment_type', width: '100px', align: 'center', sortable: true }
]

// Validation function for period
const validatePeriod = () => {
  if (periodCodeId.value && !/^[0-9]{6}$/.test(periodCodeId.value)) {
    showSnackbar('ລະຫັດເດືອນຕ້ອງເປັນຮູບແບບ YYYYMM', 'warning', 'mdi-alert')
    periodCodeId.value = getCurrentPeriodCodeId()
  }
}

// API calls
const fetchIncomeStatementData = async () => {
  if (!selectedSegment.value || !selectedCurrency.value) {
    showSnackbar('ກະລຸນາເລືອກ segment ແລະ currency', 'warning', 'mdi-alert')
    return
  }

  try {
    loading.value = true
    
    const endpoint = selectedTab.value === 'acc' 
      ? '/api/income-statement/acc/dairy-report/' 
      : '/api/income-statement/mfi/dairy-report/'

    console.log(`🔄 Calling ${selectedTab.value.toUpperCase()} API: ${endpoint}`)
    
    const response = await axios.post(endpoint, {
      segment: selectedSegment.value,
      currency: selectedCurrency.value,
    }, getAuthHeaders())
    
    if (response.data.status === 'success') {
      incomeStatementData.value = response.data.data || []
      
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນງົບກຳໄລຂາດທຸນ ${selectedTab.value.toUpperCase()} ສຳເລັດ - ${response.data.display_currency} (${incomeStatementData.value.length} ລາຍການ)`,
        'success',
        'mdi-check-circle'
      )
      
      console.log(`✅ Data loaded successfully: ${incomeStatementData.value.length} records`)
    } else {
      throw new Error(response.data.message || 'Unknown error occurred')
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching income statement data:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນງົບກຳໄລຂາດທຸນ'
    let errorIcon = 'mdi-alert-circle'
    
    // Handle specific errors
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
      errorIcon = 'mdi-account-alert'
    } else if (error?.response?.status === 403) {
      errorMessage = '🚫 ທ່ານບໍ່ມີສິດໃນການເຂົ້າເຖິງຂໍ້ມູນນີ້'
      errorIcon = 'mdi-lock-alert'
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
    incomeStatementData.value = []
    
  } finally {
    loading.value = false
  }
}

// Event handlers
const onSegmentChange = () => {
  selectedCurrency.value = ''
  incomeStatementData.value = []
  
  // Auto-select LAK for LCY
  if (selectedSegment.value === 'LCY') {
    selectedCurrency.value = 'LAK'
  }
}

// Helper to fetch EOD info and set default periodCodeId
const fetchEodInfo = async () => {
  try {
    const res = await axios.get('/api/end-of-day-journal/check/', getAuthHeaders())
    if (res.data && res.data.target_date) {
      eodInfo.value = res.data
      targetDate.value = res.data.target_date

      // Set periodCodeId to target_date (YYYYMM)
      periodCodeId.value = targetDate.value.replace(/-/g, '').substring(0, 6)
    }
  } catch (err) {
    console.error('Failed to fetch EOD info', err)
    showSnackbar('ບໍ່ສາມາດດຶງຂໍ້ມູນ EOD', 'warning', 'mdi-alert')
  }
}

// Utility functions
const formatCurrency = (value: number): string => {
  if (!value || value === 0) return '-'
  return value.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const getNetAmountClass = (amount: number) => {
  if (amount > 0) return 'font-weight-bold'
  if (amount < 0) return 'font-weight-bold'
  return 'text-grey'
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// Export to Excel function
const exportToExcel = () => {
  try {
    if (!incomeStatementData.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    // Prepare export data
    const exportData = incomeStatementData.value.map(item => ({
      'ລາຍລະອຽດ': item.description,
      'ຍອດເດືອນກ່ອນ': item.OPen_Total_amount,
      'ຍອດເດືອນນີ້': item.Current_Total_amount,
      'ສະກຸນເງິນ': item.currency_display,
      'ປະເພດ': item.segment_type
    }))

    // Create and save Excel file
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const colWidths = [
      { wch: 40 }, // ລາຍລະອຽດ
      { wch: 15 }, // ຍອດເດືອນກ່ອນ
      { wch: 15 }, // ຍອດເດືອນນີ້
      { wch: 12 }, // ສະກຸນເງິນ
      { wch: 12 }  // ປະເພດ
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, `Income Statement ${selectedTab.value.toUpperCase()}`)

    // Generate secure filename
    const currentDate = new Date().toISOString().split('T')[0]
    const periodDisplay = formatPeriodDisplay(periodCodeId.value)
    const filename = `Income_Statement_${selectedTab.value.toUpperCase()}_${selectedSegment.value}_${selectedCurrency.value}_${periodDisplay}_${currentDate}.xlsx`

    XLSX.writeFile(wb, filename)

    showSnackbar(
      `📊 ສົ່ງອອກສຳເລັດ (${selectedTab.value.toUpperCase()} ${selectedSegment.value} ${selectedCurrency.value}) - ${incomeStatementData.value.length} ລາຍການ`, 
      'success', 
      'mdi-download'
    )

  } catch (error) {
    console.error('Export error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ', 'error', 'mdi-alert-circle')
  }
}

// Watch for tab changes
watch(selectedTab, () => {
  incomeStatementData.value = []
  console.log(`🔄 Tab changed to: ${selectedTab.value.toUpperCase()}`)
})

onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    if (token) {
      console.log('🚀 Income Statement component mounted')
      
      // Fetch EOD info to set default period
      await fetchEodInfo()
      
      console.log(`📅 Current period: ${periodCodeId.value} (${formatPeriodDisplay(periodCodeId.value)})`)
      
      // Set default values
      selectedSegment.value = 'LCY'
      selectedCurrency.value = 'LAK'
    } else {
      showSnackbar('🔑 ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
    }
  } catch (error) {
    console.error('Initialization error:', error)
  }
})
</script>

<style scoped>
.font-mono {
  font-family: 'Roboto Mono', 'Consolas', monospace;
  font-size: 0.875rem;
}

.professional-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}
  

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.amount-cell {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.amount-cell.positive {
  background: rgba(76, 175, 80, 0.1);
  color: #388e3c;
}

.amount-cell.negative {
  background: rgba(244, 67, 54, 0.1);
  color: #d32f2f;
}

.description-cell {
  max-width: 400px;
  min-width: 250px;
  padding: 8px 12px !important;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  position: relative;
}

.professional-table :deep(.v-data-table__td) {
  padding: 8px 12px !important;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.875rem;
  vertical-align: middle;
}

.professional-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #37474f;
  font-size: 0.85rem;
}

.professional-table :deep(.v-data-table__thead > tr > th) {
  background-color: #fafafa;
  border-bottom: 2px solid #e0e0e0;
  padding: 12px !important;
}

.professional-table :deep(.v-data-table__wrapper) {
  overflow-x: auto;
}

.professional-table :deep(table) {
  table-layout: auto;
  width: 100%;
  min-width: 1000px;
}

.highlight-blue-row {
  background: linear-gradient(135deg, #59b4ff 0%, #e3f2fd 100%);
  font-weight: bold;
}

.highlight-grey-row {
  background: linear-gradient(135deg, #ffb25a 0%, #e7e7e7 100%);
  font-weight: bold;
}

/* Responsive improvements */
@media (max-width: 1200px) {
  .professional-table :deep(table) {
    min-width: 900px;
  }
  
  .description-cell {
    max-width: 300px;
    min-width: 200px;
  }
}

@media (max-width: 960px) {
  .font-mono { 
    font-size: 0.75rem; 
  }
  
  .amount-cell { 
    padding: 2px 4px; 
    font-size: 0.75rem; 
  }
  
  .professional-table :deep(.v-data-table__td) { 
    padding: 6px 8px !important; 
  }
  
  .description-cell {
    max-width: 250px;
    min-width: 150px;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .professional-table :deep(table) {
    min-width: 700px;
  }
  
  .description-cell {
    max-width: 200px;
    min-width: 120px;
  }
}
</style>