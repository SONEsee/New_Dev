<!-- MainTrialBalance.vue with Print Function -->
<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" style="border: 1px solid #e0e0e0; width: 100%;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
        <v-icon start size="24">mdi-chart-line</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
          ລາຍງານໃບດຸ່ນດຽງ - {{ selectedCurrency }} ({{ selectedMSegment }})
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
          <!-- First Row: MSegment and Currency -->
          <v-row no-gutters class="mb-3">
            <!-- Market Segment Selection -->
            <v-col cols="12" md="3" class="pe-md-2 mb-3 mb-md-0">
              <v-select
                v-model="selectedMSegment"
                :items="mSegmentOptions"
                label="ປະເພດຕະຫຼາດ (Market Segment)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-bank"
                hide-details="auto"
                @update:model-value="onMSegmentChange"
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
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
              <v-select
                v-model="selectedCurrency"
                :items="availableCurrencyOptions"
                label="ເລືອກສະກຸນເງິນ (Currency)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-currency-usd"
                hide-details="auto"
                :disabled="!selectedMSegment"
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
            
            <!-- Financial Year -->
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
              <v-text-field
                v-model="selectedFinYear"
                label="ປີການເງິນ (Financial Year)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar"
                hide-details="auto"
                type="number"
                min="2020"
                max="2050"
                :rules="[validateFinYear]"
              />
            </v-col>
            
            <!-- Period Code -->
            <v-col cols="12" md="3" class="ps-md-2 mb-3 mb-md-0">
              <v-text-field
                v-model="selectedPeriodCode"
                label="ລະຫັດງວດ (Period Code)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-month"
                hide-details="auto"
                placeholder="202508"
                maxlength="6"
                :rules="[validatePeriodCode]"
              />
            </v-col>
          </v-row>

          <!-- Second Row: Search and Actions -->
          <v-row no-gutters class="mb-4">
            <!-- Search Field -->
            <v-col cols="12" md="6" class="pe-md-2 mb-3 mb-md-0">
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
            <v-col cols="12" md="6" class="ps-md-2 d-flex gap-2">
              <v-btn
                type="submit"
                color="primary"
                prepend-icon="mdi-refresh"
                :loading="loading"
                :disabled="!isFormValid"
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
                style="height: 40px; min-width: 80px;"
              >
                Excel
              </v-btn>
              <v-btn
                color="info"
                prepend-icon="mdi-printer"
                :disabled="!trialBalanceData.length || loading"
                @click="printReport"
                density="compact"
                style="height: 40px; min-width: 80px;"
              >
                Print
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-divider class="mb-4" thickness="1" color="grey-lighten-3" />

        <!-- Table Info Bar -->
        <div class="d-flex justify-space-between align-center mb-3 pa-3 bg-grey-lighten-5 rounded">
          <div class="text-h6 font-weight-medium text-styles">
            ຜົນການຄົ້ນຫາ: {{ filteredData.length }} ລາຍການ
            <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
              {{ chipText }}
            </v-chip>
          </div>
          <div class="text-caption text-grey-darken-1">
            API: main-trial-balance | {{ selectedMSegment }}-{{ selectedCurrency }}
          </div>
        </div>

        <!-- Parameter Summary -->
        <div v-if="lastUsedParams" class="mb-3 pa-2 bg-blue-lighten-5 rounded">
          <div class="text-caption text-blue-darken-2">
            <strong>ພາລາມິເຕີທີ່ໃຊ້:</strong> 
            Currency: {{ lastUsedParams.ccy_code_id }}, 
            Segment: {{ lastUsedParams.m_segment }}, 
            Year: {{ lastUsedParams.fin_year_id }}, 
            Period: {{ lastUsedParams.period_code_id }}
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
                  <div class="header-content-center">Segment</div>
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
                  <div class="text-h6 text-grey-darken-1 mb-2 text-styles">ບໍ່ມີຂໍ້ມູນ</div>
                  <div class="text-body-2 text-grey text-styles">
                    {{ !isFormValid ? 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ' : 'ກະລຸນາກົດປຸ່ມດຶງຂໍ້ມູນເພື່ອໂຫຼດຂໍ້ມູນ' }}
                  </div>
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
                <!-- Market Segment -->
                <td class="data-cell extra-column-cell">
                  <v-chip 
                    size="small" 
                    :color="getSegmentColor(item.MSegment)" 
                    variant="outlined"
                  >
                    {{ item.MSegment }}
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
import { ref, onMounted, computed, nextTick, watch } from 'vue'
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
  data: TrialBalanceItem[]
  parameters?: {
    ccy_code_id: string
    m_segment: string
    fin_year_id: string
    period_code_id: string
  }
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

// Get current date for print
const getCurrentDate = (): string => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  return `${day}/${month}/${year}`
}

// Format period for display
const formatPeriodDisplay = (periodCode: string): string => {
  if (!periodCode || periodCode.length !== 6) return periodCode
  const year = periodCode.substring(0, 4)
  const month = periodCode.substring(4, 6)
  const monthNames = [
    'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
    'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
  ]
  const monthIndex = parseInt(month) - 1
  return monthIndex >= 0 && monthIndex < 12 ? `${monthNames[monthIndex]} ${year}` : `${month}/${year}`
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
    const tableRows = filteredData.value.map((row) => {
      return '<tr>' +
        '<td class="text-left">' + (row.gl_code || '') + '</td>' +
        '<td class="text-left">' + (row.Desc || '') + '</td>' +
        '<td class="text-right">' + formatCurrency(row.OP_DR) + '</td>' +
        '<td class="text-right">' + formatCurrency(row.OP_CR) + '</td>' +
        '<td class="text-right">' + formatCurrency(row.Mo_DR) + '</td>' +
        '<td class="text-right">' + formatCurrency(row.Mo_Cr) + '</td>' +
        '<td class="text-right">' + formatCurrency(row.C1_DR) + '</td>' +
        '<td class="text-right">' + formatCurrency(row.C1_CR) + '</td>' +
        '<td class="text-center">' + (row.CCy_Code_id || '') + '</td>' +
        '<td class="text-center">' + (row.MSegment || '') + '</td>' +
        '</tr>'
    }).join('')

    const printContent = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
      '<title>ລາຍງານໃບດຸ່ນດຽງ - ' + selectedMSegment.value + ' ' + selectedCurrency.value + '</title>' +
      '<style>' +
      'body { font-family: Phetsarath OT, sans-serif; padding: 20px; margin: 0; }' +
      '.header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }' +
      '.header h1 { margin: 0 0 5px 0; font-size: 1.4rem; font-weight: bold; }' +
      '.header h2 { margin: 0 0 10px 0; font-size: 1.1rem; font-weight: 600; color: #333; }' +
      '.header .report-title { font-size: 1.2rem; font-weight: bold; margin: 10px 0; }' +
      '.header .report-info { font-size: 0.9rem; color: #555; margin: 5px 0; }' +
      '.header .print-date { font-size: 0.85rem; color: #666; margin-top: 5px; }' +
      'table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.75rem; }' +
      'th, td { border: 1px solid #333; padding: 6px 8px; }' +
      'th { background-color: #e0e0e0; font-weight: bold; text-align: center; }' +
      'td { vertical-align: middle; }' +
      '.main-header { background-color: #f0f0f0; font-size: 0.8rem; font-weight: 600; }' +
      '.sub-header { background-color: #fafafa; font-size: 0.7rem; font-weight: 500; }' +
      '.text-right { text-align: right; }' +
      '.text-center { text-align: center; }' +
      '.text-left { text-align: left; }' +
      '.signatures { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 20px; }' +
      '.signature-box { text-align: center; flex: 1; }' +
      '.signature-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 60px; }' +
      '.signature-line { border-top: 1px solid #000; margin: 0 auto 5px auto; width: 200px; }' +
      '.signature-label { font-size: 0.85rem; color: #555; font-style: italic; }' +
      '.footer-note { text-align: center; font-size: 0.8rem; color: #888; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; }' +
      '@media print { body { padding: 10px; } @page { size: A4 landscape; margin: 15mm; } }' +
      '</style></head><body>' +
      '<div class="header">' +
      '<h1>ບໍລິສັດ ເງິນກູ້ຈຸນລະ ລາວ ຈຳກັດ</h1>' +
      '<h2>LAO MICROFINANCE COMPANY LIMITED</h2>' +
      '<div class="report-title">ລາຍງານໃບດຸ່ນດຽງ (Main Trial Balance)</div>' +
      '<div class="report-info">' +
      '<span>Market Segment: ' + selectedMSegment.value + '</span>' +
      '<span> | </span>' +
      '<span>Currency: ' + selectedCurrency.value + '</span>' +
      '<span> | </span>' +
      '<span>Year: ' + selectedFinYear.value + '</span>' +
      '<span> | </span>' +
      '<span>Period: ' + formatPeriodDisplay(selectedPeriodCode.value) + '</span>' +
      '</div>' +
      '<div class="print-date">ວັນທີພິມ: ' + getCurrentDate() + '</div>' +
      '</div>' +
      '<table>' +
      '<thead>' +
      '<tr class="main-header">' +
      '<th rowspan="2" style="width: 10%;">GL Code</th>' +
      '<th rowspan="2" style="width: 25%;">ລາຍລະອຽດ</th>' +
      '<th colspan="2" style="width: 15%;">ຍອດຍົກ (Opening)</th>' +
      '<th colspan="2" style="width: 15%;">ຍອດເຄື່ອນ (Movement)</th>' +
      '<th colspan="2" style="width: 15%;">ຍອດເຫຼືອ (Closing)</th>' +
      '<th rowspan="2" style="width: 8%;">Currency</th>' +
      '<th rowspan="2" style="width: 12%;">Segment</th>' +
      '</tr>' +
      '<tr class="sub-header">' +
      '<th>Dr</th><th>Cr</th>' +
      '<th>Dr</th><th>Cr</th>' +
      '<th>Dr</th><th>Cr</th>' +
      '</tr>' +
      '</thead>' +
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
const selectedMSegment = ref('')
const selectedCurrency = ref('')
const selectedFinYear = ref(new Date().getFullYear().toString())
const selectedPeriodCode = ref('')
const trialBalanceData = ref<TrialBalanceItem[]>([])
const lastUsedParams = ref<any>(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Market Segment options
const mSegmentOptions = [
  {
    title: 'LCY - ທຽບເທົ່າກີບ (Local Currency)',
    value: 'LCY',
    subtitle: 'ສະເພາະກີບລາວ (LAK)',
    icon: 'mdi-home-currency-usd'
  },
  {
    title: 'FCY - ສະກຸນເງິນຕ່າງປະເທດ (Foreign Currency)',
    value: 'FCY',
    subtitle: 'LAK, USD, THB',
    icon: 'mdi-currency-usd-circle'
  }
]

// All currency options
const allCurrencyOptions = {
  LCY: [
    {
      title: 'ກີບລາວ (LAK)',
      value: 'LAK',
      subtitle: 'Lao Kip',
      icon: 'mdi-currency-kzt'
    }
  ],
  FCY: [
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
}

// Validation functions
const validateFinYear = (value: string) => {
  if (!value) return 'ປີການເງິນບໍ່ຄວນຫວ່າງເປົ່າ'
  const year = parseInt(value)
  if (year < 2020 || year > 2050) return 'ປີການເງິນຕ້ອງຢູ່ລະຫວ່າງ 2020-2050'
  return true
}

const validatePeriodCode = (value: string) => {
  if (!value) return 'ລະຫັດງວດບໍ່ຄວນຫວ່າງເປົ່າ'
  if (!/^\d{6}$/.test(value)) return 'ລະຫັດງວດຕ້ອງເປັນຕົວເລກ 6 ຫຼັກ (YYYYMM)'
  const year = parseInt(value.substring(0, 4))
  const month = parseInt(value.substring(4, 6))
  if (year < 2020 || year > 2050) return 'ປີໃນລະຫັດງວດບໍ່ຖືກຕ້ອງ'
  if (month < 1 || month > 12) return 'ເດືອນໃນລະຫັດງວດບໍ່ຖືກຕ້ອງ'
  return true
}

// Computed properties
const availableCurrencyOptions = computed(() => {
  if (!selectedMSegment.value) return []
  return allCurrencyOptions[selectedMSegment.value as keyof typeof allCurrencyOptions] || []
})

const isFormValid = computed(() => {
  return selectedMSegment.value && 
         selectedCurrency.value && 
         selectedFinYear.value && 
         selectedPeriodCode.value &&
         validateFinYear(selectedFinYear.value) === true &&
         validatePeriodCode(selectedPeriodCode.value) === true
})

const chipColor = computed(() => {
  switch (selectedCurrency.value) {
    case 'LAK': return 'success'
    case 'USD': return 'primary'
    case 'THB': return 'warning'
    default: return 'info'
  }
})

const chipText = computed(() => {
  return `${selectedMSegment.value} - ${selectedCurrency.value}`
})

// Filter data based on search text
const filteredData = computed(() => {
  if (!searchText.value) return trialBalanceData.value
  
  const search = searchText.value.toLowerCase()
  return trialBalanceData.value.filter(item => 
    item.gl_code?.toLowerCase().includes(search) ||
    item.Desc?.toLowerCase().includes(search) ||
    item.CCy_Code_id?.toLowerCase().includes(search) ||
    item.MSegment?.toLowerCase().includes(search)
  )
})

// Event handlers
const onMSegmentChange = (newValue: string) => {
  console.log(`🔄 MSegment changed to: ${newValue}`)
  selectedCurrency.value = ''
  trialBalanceData.value = []
  lastUsedParams.value = null
}

// Watch for currency changes to auto-set as first available if needed
watch([selectedMSegment], () => {
  if (selectedMSegment.value && availableCurrencyOptions.value.length > 0) {
    if (!selectedCurrency.value) {
      selectedCurrency.value = availableCurrencyOptions.value[0].value
    }
  }
})

// API calls
const fetchTrialBalanceData = async () => {
  try {
    loading.value = true
    
    if (!isFormValid.value) {
      showSnackbar('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນແລະຖືກຕ້ອງ', 'warning', 'mdi-alert')
      return
    }
    
    const params = {
      ccy_code_id: selectedCurrency.value,
      m_segment: selectedMSegment.value,
      fin_year_id: selectedFinYear.value,
      period_code_id: selectedPeriodCode.value
    }
    
    console.log('🔄 Calling Trial Balance API with params:', params)
    
    const apiResponse = await axios.post('/api/main-trial-balance/all-currencies/', params, getAuthHeaders())
    const response: ApiResponse = apiResponse.data
    
    if (response.status === 'success') {
      trialBalanceData.value = response.data || []
      lastUsedParams.value = response.parameters || params
      
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນ Trial Balance ສຳເລັດ (${trialBalanceData.value.length} ລາຍການ)`,
        'success',
        'mdi-check-circle'
      )
      
      console.log(`✅ Data loaded successfully: ${trialBalanceData.value.length} records`)
    } else {
      throw new Error(response.message || 'Unknown error occurred')
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching trial balance data:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ Trial Balance'
    let errorIcon = 'mdi-alert-circle'
    
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
      const backendMessage = error?.response?.data?.message || 'Invalid request format'
      errorMessage = '📋 ' + backendMessage
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

const getSegmentColor = (segment: string) => {
  return segment === 'LCY' ? 'success' : 'info'
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
      'Market Segment': item.MSegment
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    const colWidths = [
      { wch: 12 },
      { wch: 30 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 },
      { wch: 10 },
      { wch: 15 }
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Main Trial Balance')

    const filename = `Trial_Balance_${selectedMSegment.value}_${selectedCurrency.value}_${selectedFinYear.value}_${selectedPeriodCode.value}.xlsx`

    XLSX.writeFile(wb, filename)

    showSnackbar(
      `📊 ສົ່ງອອກສຳເລັດ (${selectedMSegment.value}-${selectedCurrency.value}) - ${trialBalanceData.value.length} ລາຍການ`, 
      'success', 
      'mdi-download'
    )

  } catch (error) {
    console.error('Export error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ', 'error', 'mdi-alert-circle')
  }
}

// Utility function to get current period as YYYYMM from API
const getCurrentPeriodCodeId = async (): Promise<string> => {
  try {
    const axiosInstance = (await import('@/helpers/axios')).default
    const res = await axiosInstance.get('/api/end-of-day-journal/check/')
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

// Initialize component
onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    if (token) {
      console.log('🚀 Component mounted')
      const periodCode = await getCurrentPeriodCodeId()
      selectedPeriodCode.value = periodCode
      if (periodCode && periodCode.length === 6) {
        selectedFinYear.value = periodCode.substring(0, 4)
      }
      showSnackbar('📋 ກະລຸນາເລືອກຂໍ້ມູນໃນແບບຟອມແລ້ວກົດດຶງຂໍ້ມູນ', 'info', 'mdi-information')
    } else {
      showSnackbar('🔑 ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
    }
  } catch (error) {
    console.error('Initialization error:', error)
  }
})
</script>

<style scoped>
/* Keep all your existing styles exactly as they are */
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

.custom-trial-balance-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  min-width: 1200px;
}

.main-header-row {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.sub-header-row {
  background: #fafafa;
}

.header-cell {
  padding: 12px 8px;
  font-weight: 600;
  color: #37474f;
  border: 1px solid #dee2e6;
  vertical-align: middle;
  text-align: center;
  white-space: nowrap;
}

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

.extra-column-header {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

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

.data-cell {
  padding: 10px 8px;
  border: 1px solid #f0f0f0;
  vertical-align: middle;
}

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

.extra-column-cell {
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  text-align: center;
  padding: 8px;
}

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