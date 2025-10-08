<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="main-card">
      <!-- Header Section -->
      <v-card-title class="header-gradient px-6 py-4 d-flex align-center">
        <v-icon start size="24">mdi-file-chart</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
          ລາຍງານຖານະການເງິນ (Balance Sheet) - 
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
        <v-form @submit.prevent="fetchBalanceSheetData" class="mb-4">
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
            <v-col cols="12" md="2" class="px-md-1 mb-3 mb-md-0">
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
            <v-col cols="12" md="4" class="ps-md-2 d-flex gap-2">
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
                :disabled="!balanceSheetData.length || loading"
                @click="exportToExcel"
                density="compact"
                style="height: 40px; min-width: 90px;"
              >
                Excel
              </v-btn>
              <v-btn
                color="info"
                prepend-icon="mdi-printer"
                :disabled="!balanceSheetData.length || loading"
                @click="printReport"
                density="compact"
                style="height: 40px; min-width: 90px;"
              >
                Print
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
              <div class="text-h6 text-styles font-weight-medium">
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
            <tr class="table-row" :class="getRowClass(item.description)">
              <td class="description-cell" :title="item.description" :class="getDescriptionClass(item.description)">
                {{ item.description }}
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell" :class="getNetAmountClass(item.total_Amount_Opening)">
                  {{ formatCurrency(item.total_Amount_Opening) }}
                </span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell" :class="getNetAmountClass(item.total_Amount_Current)">
                  {{ formatCurrency(item.total_Amount_Current) }}
                </span>
              </td>
              <td class="text-center font-mono">
                <span class="amount-cell positive">{{ item.currency_display || selectedCurrency }}</span>
              </td>
              <td class="text-center font-mono">
                <span class="amount-cell neutral">{{ item.segment_type || selectedSegment }}</span>
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
import * as XLSX from 'xlsx'

// Page Meta
definePageMeta({
  title: 'Balance Sheet',
  layout: 'default'
})

// Types
interface BalanceSheetItem {
  no: number
  report_number: string
  description: string
  total_Amount_Current: number
  total_Amount_Opening: number
  net_amount: number
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
  data: BalanceSheetItem[]
}

interface SnackbarState {
  show: boolean
  message: string
  color: string
  icon: string
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
const getCurrentPeriodCodeId = async (): Promise<string> => {
  try {
    const axios = (await import('@/helpers/axios')).default
    const res = await axios.get('/api/end-of-day-journal/check/')
    const targetDate = res.data?.target_date
    if (targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return targetDate.slice(0, 4) + targetDate.slice(5, 7)
    }
  } catch (e) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    return `${year}${month}`
  }
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

// Get current date for print
const getCurrentDate = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}

// Print function
const printReport = () => {
  if (!filteredData.value.length) {
    showSnackbar('ບໍ່ມີຂໍ້ມູນເພື່ອພິມ', 'warning', 'mdi-alert')
    return
  }

  try {
    const printWindow = window.open('', '', 'width=1400,height=900')
    
    // Build table rows
    const tableRows = filteredData.value.map((row, index) => {
      const rowClass = getRowClass(row.description)
      const descClass = getDescriptionClass(row.description)
      
      return '<tr class="' + rowClass + '">' +
        '<td class="text-left ' + descClass + '">' + (row.description || '') + '</td>' +
        '<td class="text-right">' + formatCurrency(row.total_Amount_Opening) + '</td>' +
        '<td class="text-right">' + formatCurrency(row.total_Amount_Current) + '</td>' +
        '<td class="text-center">' + (row.currency_display || selectedCurrency.value) + '</td>' +
        '<td class="text-center">' + (row.segment_type || selectedSegment.value) + '</td>' +
        '</tr>'
    }).join('')

    const printContent = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<title>ລາຍງານຖານະການເງິນ - ' + selectedTab.value.toUpperCase() + ' ' + selectedSegment.value + ' ' + selectedCurrency.value + '</title>' +
      '<style>' +
      'body { font-family: Phetsarath OT, sans-serif; padding: 20px; margin: 0; }' +
      '.header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }' +
      '.header h1 { margin: 0 0 5px 0; font-size: 1.4rem; font-weight: bold; }' +
      '.header h2 { margin: 0 0 10px 0; font-size: 1.1rem; font-weight: 600; color: #333; }' +
      '.header .report-title { font-size: 1.2rem; font-weight: bold; margin: 10px 0; }' +
      '.header .report-info { font-size: 0.9rem; color: #555; margin: 5px 0; }' +
      '.header .print-date { font-size: 0.85rem; color: #666; margin-top: 5px; }' +
      'table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.85rem; }' +
      'th, td { border: 1px solid #333; padding: 8px 10px; }' +
      'th { background-color: #e0e0e0; font-weight: bold; text-align: center; }' +
      'td { vertical-align: middle; }' +
      '.text-right { text-align: right; }' +
      '.text-center { text-align: center; }' +
      '.text-left { text-align: left; }' +
      '.font-weight-bold { font-weight: bold; }' +
      '.highlight-blue-row { background-color: #e3f2fd; font-weight: bold; }' +
      '.highlight-grey-row { background-color: #f5f5f5; font-weight: bold; }' +
      '.signatures { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 20px; }' +
      '.signature-box { text-align: center; flex: 1; }' +
      '.signature-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 60px; }' +
      '.signature-line { border-top: 1px solid #000; margin: 0 auto 5px auto; width: 200px; }' +
      '.signature-label { font-size: 0.85rem; color: #555; font-style: italic; }' +
      '.footer-note { text-align: center; font-size: 0.8rem; color: #888; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; }' +
      '@media print { body { padding: 10px; } @page { size: A4 landscape; margin: 15mm; } }' +
      '</style></head><body>' +
      '<div class="header">' +
      '<h1>ບໍລິສັດລັດ ບໍລິຫານໜີ້ ແລະ ຊັບສິນ ຈຳກັດຜູ່ດຽວ</h1>' +
      '<h2>LAO MICROFINANCE COMPANY LIMITED</h2>' +
      '<div class="report-title">ໃບລາຍງານຖານະການເງິນ (Balance Sheet)</div>' +
      '<div class="report-info">' +
      '<span>ປະເພດ: ' + selectedTab.value.toUpperCase() + '</span>' +
      '<span> | </span>' +
      '<span>' + selectedSegment.value + ' - ' + selectedCurrency.value + '</span>' +
      (periodCodeId.value ? '<span> | </span><span>ເດືອນ: ' + formatPeriodDisplay(periodCodeId.value) + '</span>' : '') +
      '</div>' +
      '<div class="print-date">ວັນທີພິມ: ' + getCurrentDate() + '</div>' +
      '</div>' +
      '<table>' +
      '<thead><tr>' +
      '<th style="width: 50%;">ລາຍລະອຽດ</th>' +
      '<th style="width: 15%;">ຍອດເດືອນກ່ອນ</th>' +
      '<th style="width: 15%;">ຍອດເດືອນນີ້</th>' +
      '<th style="width: 10%;">ສະກຸນເງິນ</th>' +
      '<th style="width: 10%;">ປະເພດ</th>' +
      '</tr></thead>' +
      '<tbody>' + tableRows + '</tbody>' +
      '</table>' +
      '<div class="signatures">' +
      '<div class="signature-box">' +
      '<div class="signature-title">ຜູ້ອຳນວຍການໃຫຍ່</div>' +
      '<div class="signature-line"></div>' +
      '<div class="signature-label">CEO</div>' +
      '</div>' +
      '<div class="signature-box">' +
      '<div class="signature-title">ຫົວໜ້າພະແນກຄຸ້ມຄອງຊັບພະຍາກອນມະນຸດ</div>' +
      '<div class="signature-line"></div>' +
      '<div class="signature-label">Human Resource Manager</div>' +
      '</div>' +
      '<div class="signature-box">' +
      '<div class="signature-title">ຫົວໜ້າພະແນກບັນຊີ</div>' +
      '<div class="signature-line"></div>' +
      '<div class="signature-label">Chief Accountant</div>' +
      '</div>' +
      '</div>' +
      '<div class="footer-note">' +
      'ເອກະສານນີ້ຖືກສ້າງໂດຍລະບົບອັດຕະໂນມັດ - This document is system generated<br>' +
      'ຈຳນວນລາຍການທັງໝົດ: ' + filteredData.value.length + ' ລາຍການ' +
      '</div>' +
      '<script>window.onload = function() { window.print(); };<\/script>' +
      '</body></html>'

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    showSnackbar('✅ ເປີດໜ້າຕ່າງພິມສຳເລັດ', 'success', 'mdi-printer')
    
  } catch (error) {
    console.error('Print error:', error)
    showSnackbar('❌ ມີຂໍ້ຜິດພາດໃນການພິມ', 'error', 'mdi-alert-circle')
  }
}

// Reactive state
const loading = ref(false)
const searchText = ref('')
const selectedTab = ref('acc')
const selectedSegment = ref('')
const selectedCurrency = ref('')
const balanceSheetData = ref<BalanceSheetItem[]>([])
const periodCodeId = ref('')

const snackbar = ref<SnackbarState>({
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
  if (!searchText.value) return balanceSheetData.value
  
  const search = searchText.value.toLowerCase()
  return balanceSheetData.value.filter(item => 
    item.report_number?.toLowerCase().includes(search) ||
    item.description?.toLowerCase().includes(search) ||
    item.no?.toString().includes(search)
  )
})

// Table headers
const headers = [
  { title: 'ລາຍລະອຽດ', key: 'description', width: '400px', sortable: true },
  { title: 'ຍອດເດືອນກ່ອນ', key: 'total_Amount_Opening', width: '150px', align: 'end', sortable: true },
  { title: 'ຍອດເດືອນນີ້', key: 'total_Amount_Current', width: '150px', align: 'end', sortable: true },
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

// API call function
const fetchBalanceSheetData = async () => {
  if (!selectedSegment.value || !selectedCurrency.value) {
    showSnackbar('ກະລຸນາເລືອກ segment ແລະ currency', 'warning', 'mdi-alert')
    return
  }

  try {
    loading.value = true
    
    const endpoint = selectedTab.value === 'acc' 
      ? '/api/balance-sheet/acc/' 
      : '/api/balance-sheet/mfi/'
    
    console.log(`🔄 Calling ${selectedTab.value.toUpperCase()} API: ${endpoint}`)
    
    const axios = (await import('@/helpers/axios')).default
    
    const requestData = {
      segment: selectedSegment.value,
      currency: selectedCurrency.value,
      period_code_id: periodCodeId.value
    }
    
    console.log('📤 Request data:', requestData)
    
    const response = await axios.post(endpoint, requestData, getAuthHeaders())
    
    if (response.data.status === 'success') {
      balanceSheetData.value = response.data.data || []
      
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນງົບຖານະການເງິນ ${selectedTab.value.toUpperCase()} ສຳເລັດ - ${response.data.display_currency} (${balanceSheetData.value.length} ລາຍການ)`,
        'success',
        'mdi-check-circle'
      )
      
      console.log(`✅ Data loaded successfully: ${balanceSheetData.value.length} records`)
    } else {
      throw new Error(response.data.message || 'Unknown error occurred')
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching balance sheet data:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນງົບຖານະການເງິນ'
    let errorIcon = 'mdi-alert-circle'
    
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
    balanceSheetData.value = []
    
  } finally {
    loading.value = false
  }
}

// Event handlers
const onSegmentChange = () => {
  selectedCurrency.value = ''
  balanceSheetData.value = []
  
  if (selectedSegment.value === 'LCY') {
    selectedCurrency.value = 'LAK'
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

const getRowClass = (description: string) => {
  if (description === 'ຄ. ລາຍຮັບ ແລະ ລາຍຈ່າຍພິເສດ(ບັງເອີນ)' ||
      description === 'ຂ. ລາຍຮັບ ແລະ ລາຍຈ່າຍປົກກະຕິ' ||
      description === 'ກ. ລາຍຮັບ ແລະ ລາຍຈ່າຍໃນການທຸລະກິດ') {
    return 'highlight-grey-row'
  }
  
  if (/\b(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)\b/.test(description)) {
    return 'highlight-blue-row'
  }
  
  return ''
}

const getDescriptionClass = (description: string) => {
  if (description === 'ລາຍການໜີ້ສິນ ແລະທືນ' ||
      description === 'ລວມຍອດຊັບສິນ' ||
      /\b(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)\b/.test(description) ||
      /\b([1-9]|1[0-9]|2[0-9]|30)\)/.test(description)) {
    return 'font-weight-bold'
  }
  return ''
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// Export to Excel function
const exportToExcel = () => {
  try {
    if (!balanceSheetData.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    const exportData = balanceSheetData.value.map(item => ({
      'ລາຍລະອຽດ': item.description,
      'ຍອດເດືອນກ່ອນ': item.total_Amount_Opening,
      'ຍອດເດືອນນີ້': item.total_Amount_Current,
      'ສະກຸນເງິນ': item.currency_display || selectedCurrency.value,
      'ປະເພດ': item.segment_type || selectedSegment.value
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    const colWidths = [
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 }
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, `Balance Sheet ${selectedTab.value.toUpperCase()}`)

    const currentDate = new Date().toISOString().split('T')[0]
    const periodDisplay = formatPeriodDisplay(periodCodeId.value)
    const filename = `Balance_Sheet_${selectedTab.value.toUpperCase()}_${selectedSegment.value}_${selectedCurrency.value}_${periodDisplay}_${currentDate}.xlsx`

    XLSX.writeFile(wb, filename)

    showSnackbar(
      `📊 ສົ່ງອອກສຳເລັດ (${selectedTab.value.toUpperCase()} ${selectedSegment.value} ${selectedCurrency.value}) - ${balanceSheetData.value.length} ລາຍການ`, 
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
  balanceSheetData.value = []
  console.log(`🔄 Tab changed to: ${selectedTab.value.toUpperCase()}`)
})

// Initialize component
onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    if (token) {
      periodCodeId.value = await getCurrentPeriodCodeId()
      console.log('🚀 Balance Sheet component mounted')
      console.log(`📅 Current period: ${periodCodeId.value} (${formatPeriodDisplay(periodCodeId.value)})`)
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
.main-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
}

.header-gradient {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
}

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

.amount-cell.neutral {
  background: rgba(96, 125, 139, 0.1);
  color: #546e7a;
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

.highlight-blue-row {
  background: linear-gradient(135deg, #59b4ff 0%, #e3f2fd 100%);
  font-weight: bold;
}

.highlight-grey-row {
  background: linear-gradient(135deg, #ffb25a 0%, #e7e7e7 100%);
  font-weight: bold;
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

/* Responsive Design */
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