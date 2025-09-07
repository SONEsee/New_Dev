<!-- JournalReport.vue -->
<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" style="border: 1px solid #e0e0e0; width: 100%;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%); color: white;">
        <v-icon start size="24">mdi-book-open-page-variant</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
          ລາຍງານວາລະສານບັນຊີ (Journal Report)
        </span>
        <v-spacer />
        <v-chip 
          color="white" 
          text-color="success" 
          size="small" 
          variant="outlined"
        >
          Journal Entries
        </v-chip>
      </v-card-title>
      
      <v-card-text class="px-6 py-4">
        <!-- Filter Form -->
        <v-form @submit.prevent="fetchJournalData" class="mb-4">
          <!-- First Row: Main Filters -->
          <v-row no-gutters class="mb-3">
            <!-- Financial Cycle -->
            <v-col cols="12" md="3" class="pe-md-2 mb-3 mb-md-0">
              <v-text-field
                v-model="selectedFinancialCycle"
                label="ວົງຈອນການເງິນ (Financial Cycle)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-range"
                hide-details="auto"
                type="number"
                min="2020"
                max="2050"
                :rules="[validateFinancialCycle]"
              />
            </v-col>
            
            <!-- Period Code -->
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
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
            
            <!-- Module ID -->
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
              <v-select
                v-model="selectedModuleId"
                :items="moduleOptions"
                :loading="loadingOptions"
                label="ໂມດູນ (Module)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-view-module"
                hide-details="auto"
                clearable
                item-title="title"
                item-value="value"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon icon="mdi-view-module" size="20" />
                    </template>
                    <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Transaction Code -->
            <v-col cols="12" md="3" class="ps-md-2 mb-3 mb-md-0">
              <v-select
                v-model="selectedTrnCode"
                :items="transactionCodeOptions"
                :loading="loadingOptions"
                label="ລະຫັດລາຍການ (Transaction Code)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-code-tags"
                hide-details="auto"
                clearable
                item-title="title"
                item-value="value"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon icon="mdi-code-tags" size="20" />
                    </template>
                    <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <!-- Second Row: Date Range -->
          <v-row no-gutters class="mb-3">
            <!-- Start Date -->
            <v-col cols="12" md="3" class="pe-md-2 mb-3 mb-md-0">
              <v-text-field
                v-model="selectedStartDate"
                label="ວັນທີ່ເລີ່ມຕົ້ນ (Start Date)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-start"
                hide-details="auto"
                type="date"
                clearable
              />
            </v-col>
            
            <!-- End Date -->
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
              <v-text-field
                v-model="selectedEndDate"
                label="ວັນທີ່ສິ້ນສຸດ (End Date)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-end"
                hide-details="auto"
                type="date"
                clearable
              />
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
                placeholder="ຄົ້ນຫາບັນຊີ, ອ້າງອີງ, ລາຍລະອຽດ"
              />
            </v-col>

            <!-- Action Buttons -->
            <v-col cols="12" md="2" class="ps-md-2 d-flex gap-2">
              <v-btn
                type="submit"
                color="success"
                prepend-icon="mdi-refresh"
                :loading="loading"
                class="flex-grow-1"
                density="compact"
                style="height: 40px;"
              >
                ດຶງຂໍ້ມູນ
              </v-btn>
            </v-col>
          </v-row>

          <!-- Third Row: Export Actions -->
          <v-row no-gutters class="mb-4">
            <v-col cols="12" class="d-flex gap-2 justify-end">
              <v-btn
                color="primary"
                prepend-icon="mdi-microsoft-excel"
                :disabled="!journalData.length || loading"
                @click="exportToExcel"
                density="compact"
                variant="outlined"
                style="height: 40px;"
              >
                ສົ່ງອອກ Excel
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-divider class="mb-4" thickness="1" color="grey-lighten-3" />

        <!-- Table Info Bar -->
        <div class="d-flex justify-space-between align-center mb-3 pa-3 bg-grey-lighten-5 rounded">
          <div class="text-h6 font-weight-medium text-styles">
            ຜົນການຄົ້ນຫາ: {{ filteredData.length }} ລາຍ
            <v-chip size="small" color="success" variant="tonal" class="ml-2">
              Journal Entries
            </v-chip>
          </div>
          <div class="text-caption text-grey-darken-1">
            API: journal-report | {{ selectedFinancialCycle }}-{{ selectedPeriodCode }}
          </div>
        </div>

        <!-- Parameter Summary -->
        <div v-if="lastUsedParams" class="mb-3 pa-2 bg-green-lighten-5 rounded">
          <div class="text-caption text-green-darken-2">
            <strong>ພາລາມິເຕີທີ່ໃຊ້:</strong> 
            Cycle: {{ lastUsedParams.financial_cycle_id }}, 
            Period: {{ lastUsedParams.period_code_id }}, 
            Module: {{ lastUsedParams.module_id || 'All' }},
            Dates: {{ lastUsedParams.date_start || 'N/A' }} - {{ lastUsedParams.date_end || 'N/A' }}
          </div>
        </div>

        <!-- Custom Table Implementation -->
        <div class="custom-table-container">
          <table class="custom-journal-table">
            <!-- Table Header -->
            <thead>
              <tr class="main-header-row">
                <th class="header-cell sticky-column entry-no-header">
                  <div class="header-content-center">Module</div>
                </th>
                <th class="header-cell">
                  <div class="header-content-center">Trn Code</div>
                </th>
                <th class="header-cell">
                  <div class="header-content-center">Reference No</div>
                </th>
                <th class="header-cell">
                  <div class="header-content-center">Description</div>
                </th>
                <th class="header-cell">
                  <div class="header-content-center">Account Full</div>
                </th>
                <th class="header-cell amount-header">
                  <div class="header-content-center">FCY Dr</div>
                </th>
                <th class="header-cell amount-header">
                  <div class="header-content-center">FCY Cr</div>
                </th>
                <th class="header-cell amount-header">
                  <div class="header-content-center">Exchange Rate</div>
                </th>
                <th class="header-cell">
                  <div class="header-content-center">Currency</div>
                </th>
                <th class="header-cell">
                  <div class="header-content-center">Trn Date</div>
                </th>
                <th class="header-cell">
                  <div class="header-content-center">Maker ID</div>
                </th>
                <th class="header-cell">
                  <div class="header-content-center">Status</div>
                </th>
              </tr>
            </thead>
            
            <!-- Table Body -->
            <tbody>
              <tr v-if="loading">
                <td colspan="12" class="text-center pa-8">
                  <v-progress-circular indeterminate color="success" />
                  <div class="mt-3">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
                </td>
              </tr>
              
              <tr v-else-if="!filteredData.length">
                <td colspan="12" class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-book-open-page-variant</v-icon>
                  <div class="text-h6 text-grey-darken-1 mb-2 text-styles">ບໍ່ມີຂໍ້ມູນ</div>
                  <div class="text-body-2 text-grey text-styles">
                    ກະລຸນາປ້ອນເງື່ອນໄຂການຄົ້ນຫາແລ້ວກົດດຶງຂໍ້ມູນ
                  </div>
                </td>
              </tr>
              
              <!-- Data Rows -->
              <tr 
                v-for="(item, index) in filteredData" 
                :key="index"
                class="data-row"
                :class="getRowClass(item)"
              >
                <td class="data-cell sticky-column module-cell">
                  <v-chip 
                    size="small" 
                    :color="getModuleColor(item.module_id)" 
                    variant="outlined"
                  >
                    {{ item.module_id }}
                  </v-chip>
                </td>
                <td class="data-cell trn-code-cell">
                  <span class="code-value">{{ item.trn_code_id }}</span>
                </td>
                <td class="data-cell ref-cell">
                  <div class="ref-content" :title="item.trn_ref_no">
                    {{ item.trn_ref_no }}
                  </div>
                </td>
                <td class="data-cell description-cell">
                  <div class="description-content" :title="item.addl_sub_text">
                    {{ item.addl_sub_text || '-' }}
                  </div>
                </td>
                <td class="data-cell account-full-cell">
                  <span class="account-full-value">{{ item.ac_no_full }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value" :class="item.fcy_dr > 0 ? 'text-success' : ''">
                    {{ formatCurrency(item.fcy_dr) }}
                  </span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value" :class="item.fcy_cr > 0 ? 'text-error' : ''">
                    {{ formatCurrency(item.fcy_cr) }}
                  </span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="rate-value">{{ formatExchangeRate(item.exch_rate) }}</span>
                </td>
                <td class="data-cell currency-cell">
                  <v-chip 
                    size="small" 
                    :color="getCurrencyColor(item.ac_ccy_id)" 
                    variant="tonal"
                  >
                    {{ item.ac_ccy_id }}
                  </v-chip>
                </td>
                <td class="data-cell date-cell">
                  <span class="date-value">{{ formatDate(item.trn_dt) }}</span>
                </td>
                <td class="data-cell maker-cell">
                  <span class="maker-value">{{ item.Maker_id_id }}</span>
                </td>
                <td class="data-cell status-cell">
                  <v-chip 
                    size="small" 
                    :color="getStatusColor(item.Auth_Status)" 
                    variant="tonal"
                  >
                    {{ getStatusText(item.Auth_Status) }}
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
import { ref, onMounted, computed, watch } from 'vue'
import axios from '@/helpers/axios'
import * as XLSX from 'xlsx'

// Page Meta
definePageMeta({
  title: 'Journal Report',
  layout: 'default'
})

// Types
interface JournalItem {
  ac_entry_sr_no: number
  module_id: string
  trn_code_id: string
  trn_dt: string
  trn_ref_no: string
  financial_cycle_id: string
  period_code_id: string
  value_dt: string
  trn_ref_sub_no: string
  external_ref_no: string
  addl_text: string
  addl_sub_text: string
  ac_no_id: string
  ac_relative: string
  fcy_amount: number
  lcy_amount: number
  fcy_dr: number
  fcy_cr: number
  lcy_dr: number
  lcy_cr: number
  exch_rate: number
  ac_ccy_id: string
  drcr_ind: string
  delete_stat: string
  category: string
  product: string
  event: string
  event_sr_no: number
  entry_seq_no: number
  Auth_Status: string
  Checker_DT_Stamp: string
  Checker_id_id: string
  Maker_DT_Stamp: string
  Maker_id_id: string
  ac_no_full: string
  glType: string
  glid_id: string
}

interface ApiResponse {
  status: 'success' | 'error'
  message: string
  count?: number
  data: JournalItem[]
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
const selectedFinancialCycle = ref(new Date().getFullYear().toString())
const selectedPeriodCode = ref('')
const selectedModuleId = ref('')
const selectedTrnCode = ref('')
const selectedStartDate = ref('')
const selectedEndDate = ref('')
const journalData = ref<JournalItem[]>([])
const lastUsedParams = ref<any>(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Dynamic options from API
const moduleOptions = ref([])
const transactionCodeOptions = ref([])
const loadingOptions = ref(false)

// Validation functions
const validateFinancialCycle = (value: string) => {
  if (!value) return true // Optional field
  const year = parseInt(value)
  if (year < 2020 || year > 2050) return 'ປີການເງິນຕ້ອງຢູ່ລະຫວ່າງ 2020-2050'
  return true
}

const validatePeriodCode = (value: string) => {
  if (!value) return true // Optional field
  if (!/^\d{6}$/.test(value)) return 'ລະຫັດງວດຕ້ອງເປັນຕົວເລກ 6 ຫຼັກ (YYYYMM)'
  const year = parseInt(value.substring(0, 4))
  const month = parseInt(value.substring(4, 6))
  if (year < 2020 || year > 2050) return 'ປີໃນລະຫັດງວດບໍ່ຖືກຕ້ອງ'
  if (month < 1 || month > 12) return 'ເດືອນໃນລະຫັດງວດບໍ່ຖືກຕ້ອງ'
  return true
}

// Computed properties
const filteredData = computed(() => {
  if (!searchText.value) return journalData.value
  
  const search = searchText.value.toLowerCase()
  return journalData.value.filter(item => 
    item.ac_no_id?.toLowerCase().includes(search) ||
    item.ac_no_full?.toLowerCase().includes(search) ||
    item.trn_ref_no?.toLowerCase().includes(search) ||
    item.addl_text?.toLowerCase().includes(search) ||
    item.addl_sub_text?.toLowerCase().includes(search) ||
    item.ac_ccy_id?.toLowerCase().includes(search) ||
    item.module_id?.toLowerCase().includes(search)
  )
})

// API calls for dropdown data
const fetchModules = async () => {
  try {
    loadingOptions.value = true
    const apiResponse = await axios.get('/api/modules/', getAuthHeaders())
    
    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      moduleOptions.value = apiResponse.data.map(module => ({
        title: `${module.module_Id} - ${module.module_name_la}`,
        value: module.module_Id,
        subtitle: module.module_name_la,
        icon: 'mdi-view-module'
      }))
    }
  } catch (error) {
    console.error('Error fetching modules:', error)
    showSnackbar('ບໍ່ສາມາດດຶງຂໍ້ມູນໂມດູນໄດ້', 'warning', 'mdi-alert')
  }
}

const fetchTransactionCodes = async () => {
  try {
    const apiResponse = await axios.get('/api/trn-codes/', getAuthHeaders())
    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      transactionCodeOptions.value = apiResponse.data.map(code => ({
        title: `${code.trn_code} - ${code.trn_Desc_la}`,
        value: code.trn_code,
        subtitle: code.trn_Desc_la,
        icon: 'mdi-code-tags'
      }))
    }
  } catch (error) {
    console.error('Error fetching transaction codes:', error)
    showSnackbar('ບໍ່ສາມາດດຶງຂໍ້ມູນລະຫັດລາຍການໄດ້', 'warning', 'mdi-alert')
  } finally {
    loadingOptions.value = false
  }
}

// Main fetch function for journal data
const fetchJournalData = async () => {
  try {
    loading.value = true

    const params = {
      financial_cycle_id: selectedFinancialCycle.value || null,
      period_code_id: selectedPeriodCode.value || null,
      date_start: selectedStartDate.value || null,
      date_end: selectedEndDate.value || null,
      module_id: selectedModuleId.value || null,
      trn_code_id: selectedTrnCode.value || null
    }

    console.log('Calling Journal Report API with params:', params)

    const apiResponse = await axios.post('/api/journal-report/', params, getAuthHeaders())
    const response: ApiResponse = apiResponse.data

    if (response.status === 'success') {
      journalData.value = response.data || []
      lastUsedParams.value = params

      showSnackbar(
        `ດຶງຂໍ້ມູນລາຍງານສຳເລັດ (${journalData.value.length} ລາຍການ)`,
        'success',
        'mdi-check-circle'
      )

      console.log(`Data loaded successfully: ${journalData.value.length} records`)
    } else {
      throw new Error(response.message || 'Unknown error occurred')
    }

  } catch (error: any) {
    console.error('Error fetching journal data:', error)
    handleApiError(error)
    journalData.value = []

  } finally {
    loading.value = false
  }
}

// Utility functions
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })
}

const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return date.toLocaleString('en-GB', { 
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatExchangeRate = (rate: number | string | undefined): string => {
  const numValue = Number(rate || 0)
  if (numValue === 0) return '-'
  return numValue.toFixed(4)
}

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
    'EUR': 'info'
  }
  return colors[currency as keyof typeof colors] || 'grey'
}

const getModuleColor = (module: string) => {
  const colors = {
    'GL': 'success',
    'CM': 'primary',
    'LM': 'warning', 
    'FA': 'info'
  }
  return colors[module as keyof typeof colors] || 'grey'
}

const getStatusColor = (status: string) => {
  const colors = {
    'A': 'success', // Authorized
    'U': 'warning', // Unauthorized
    'R': 'error',   // Rejected
    'P': 'info'     // Pending
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const getStatusText = (status: string) => {
  const texts = {
    'A': 'Authorized',
    'U': 'Unauthorized', 
    'R': 'Rejected',
    'P': 'Pending'
  }
  return texts[status as keyof typeof texts] || status
}

const getRowClass = (item: JournalItem) => {
  return {
    'debit-row': item.drcr_ind === 'D',
    'credit-row': item.drcr_ind === 'C'
  }
}

const handleApiError = (error: any) => {
  let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
  let errorIcon = 'mdi-alert-circle'
  
  if (error?.response?.status === 401) {
    errorMessage = 'ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
    errorIcon = 'mdi-account-alert'
  } else if (error?.response?.status === 403) {
    errorMessage = 'ທ່ານບໍ່ມີສິດໃນການເຂົ້າເຖິງຂໍ້ມູນນີ້'
    errorIcon = 'mdi-lock-alert'
  } else if (error?.response?.status === 500) {
    errorMessage = 'ເກີດຂໍ້ຜິດພາດຈາກເຊີຟເວີ ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ'
    errorIcon = 'mdi-server-network-off'
  } else if (error?.response?.data?.message) {
    errorMessage = error.response.data.message
  }
  
  showSnackbar(errorMessage, 'error', errorIcon)
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// Export to Excel function
const exportToExcel = () => {
  try {
    if (!journalData.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    const exportData = journalData.value.map(item => ({
      'Module ID': item.module_id,
      'Transaction Code': item.trn_code_id,
      'Transaction Date': item.trn_dt,
      'Reference No': item.trn_ref_no,
      'Period Code': item.period_code_id,
      'Value Date': item.value_dt,
      'Sub Reference': item.trn_ref_sub_no,
      'Description': item.addl_sub_text,
      'Account Relative': item.ac_relative,
      'FCY Amount': item.fcy_amount,
      'FCY Dr': item.fcy_dr,
      'FCY Cr': item.fcy_cr,
      'Exchange Rate': item.exch_rate,
      'Currency': item.ac_ccy_id,
      'Dr/Cr Indicator': item.drcr_ind,
      'Auth Status': item.Auth_Status,
      'Maker Date': item.Maker_DT_Stamp,
      'Maker ID': item.Maker_id_id,
      'Account Full': item.ac_no_full
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const colWidths = [
      { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 25 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 25 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 5 }, { wch: 10 }
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Journal Report')

    const filename = `Journal_Report_${selectedFinancialCycle.value}_${selectedPeriodCode.value}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)

    showSnackbar(
      `ສົ່ງອອກສຳເລັດ - ${journalData.value.length} ລາຍການ`, 
      'success', 
      'mdi-download'
    )

  } catch (error) {
    console.error('Export error:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ', 'error', 'mdi-alert-circle')
  }
}

// Initialize component
onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    if (token) {
      console.log('Component mounted')
      
      // Set current day as default dates
      const today = new Date().toISOString().split('T')[0]
      selectedStartDate.value = today
      selectedEndDate.value = today
      
      // Set default period code to current year-month
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      selectedPeriodCode.value = `${year}${month}`
      
      // Fetch dropdown data
      await Promise.all([
        fetchModules(),
        fetchTransactionCodes()
      ])
      
      showSnackbar('ເລືອກເງື່ອນໄຂການຄົ້ນຫາແລ້ວກົດດຶງຂໍ້ມູນ', 'info', 'mdi-information')
    } else {
      showSnackbar('ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
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
  max-height: 70vh;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  position: relative;
}

/* Custom Table */
.custom-journal-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  min-width: 2400px; /* Updated for more columns */
}

/* Header Rows */
.main-header-row {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
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

.header-content-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Entry No Header - Sticky Column */
.entry-no-header {
  width: 70px;
  min-width: 70px;
  max-width: 70px;
}

.amount-header {
  width: 100px;
  min-width: 100px;
}

/* Sticky Column */
.sticky-column {
  position: sticky;
  left: 0;
  z-index: 2;
  background: white;
  border-right: 2px solid #dee2e6 !important;
}

.main-header-row .sticky-column {
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

.debit-row {
  border-left: 3px solid #4caf50;
}

.credit-row {
  border-left: 3px solid #f44336;
}

/* Data Cells */
.data-cell {
  padding: 8px;
  border: 1px solid #f0f0f0;
  vertical-align: middle;
}

/* Entry No Cell - Now Module Cell */
.entry-no-cell {
  width: 60px;
  min-width: 60px;
  max-width: 60px;
  text-align: center;
  font-weight: 500;
  background: white;
}

/* New cell types */
.trn-code-cell {
  width: 60px;
  min-width: 60px;
  text-align: center;
}

.code-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  font-weight: 500;
}

.period-cell {
  width: 60px;
  min-width: 60px;
  text-align: center;
}

.period-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
}

.ref-sub-cell {
  width: 120px;
  min-width: 120px;
}

.account-relative-cell {
  width: 100px;
  min-width: 100px;
}

.account-relative-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
}

.rate-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  font-weight: 500;
}

.drcr-cell {
  width: 60px;
  min-width: 60px;
  text-align: center;
}

.datetime-cell {
  width: 130px;
  min-width: 130px;
}

.datetime-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.75rem;
}

.maker-cell {
  width: 80px;
  min-width: 80px;
  text-align: center;
}

.maker-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  font-weight: 500;
}

.account-full-cell {
  width: 70px;
  min-width: 70px;
}

.account-full-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
}

/* Date Cell */
.date-cell {
  width: 80px;
  min-width: 80px;
  text-align: center;
}

.date-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
}

/* Reference Cell */
.ref-cell {
  width: 200px;
  min-width: 200px;
}

.ref-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
}

/* Account Cell */
.account-cell {
  width: 150px;
  min-width: 150px;
}

.account-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.account-code {
  font-size: 0.9rem;
}

/* Description Cell */
.description-cell {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
}

.description-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: help;
}

/* Amount Cells */
.amount-cell {
  width: 120px;
  min-width: 120px;
  text-align: right;
  padding-right: 12px;
}

.amount-value {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0,0,0,0.02);
  min-width: 90px;
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

/* Currency, Module, Status Cells */
.currency-cell,
.module-cell,
.status-cell {
  width: 90px;
  min-width: 90px;
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

/* Responsive Design */
@media (max-width: 1200px) {
  .custom-journal-table {
    font-size: 0.8rem;
    min-width: 1200px;
  }
  
  .data-cell {
    padding: 6px;
  }
  
  .amount-value {
    font-size: 0.8rem;
    min-width: 75px;
  }
}

@media (max-width: 960px) {
  .custom-journal-table {
    font-size: 0.75rem;
    min-width: 1100px;
  }
  
  .header-cell,
  .data-cell {
    padding: 4px;
  }
  
  .amount-value {
    font-size: 0.75rem;
    min-width: 65px;
  }
}
</style>