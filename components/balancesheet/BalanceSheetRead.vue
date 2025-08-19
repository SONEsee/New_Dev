<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="main-card">
      <!-- Header Section -->
      <v-card-title class="header-gradient px-6 py-4 d-flex align-center">
        <v-icon start size="24">mdi-file-chart</v-icon>
        <span class="text-h6 font-weight-medium">
          ລາຍງານຖານະການເງິນ (Balance Sheet) - 
          {{ selectedTab.toUpperCase() }} {{ selectedSegment }} {{ selectedCurrency }}
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
          <v-row no-gutters class="mb-4">
            <!-- Segment Selection -->
            <v-col cols="12" md="3" class="pe-md-2 mb-3 mb-md-0">
              <v-select
                v-model="selectedSegment"
                :items="segmentOptions"
                label="ເລືອກປະເພດ (Segment)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-tag"
                hide-details="auto"
                @update:model-value="onSegmentChange"
                :rules="[v => !!v || 'ກະລຸນາເລືອກປະເພດ']"
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
                :items="currencyOptions"
                label="ເລືອກສະກຸນເງິນ (Currency)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-currency-usd"
                hide-details="auto"
                :disabled="!selectedSegment"
                :rules="[v => !!v || 'ກະລຸນາເລືອກສະກຸນເງິນ']"
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

            <!-- Flexible Period Selection -->
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
              <div class="period-input-container">
                <v-text-field
                  v-model="periodInput"
                  label="ເດືອນ/ປີ (MM/YYYY)"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-month"
                  hide-details="auto"
                  placeholder="08/2025"
                  :rules="periodRules"
                  @input="onPeriodInputChange"
                  @blur="validateAndFormatPeriod"
                  clearable
                  @click:clear="clearPeriod"
                >
                  <template #append-inner>
                    <v-menu
                      v-model="monthMenu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      offset-y
                      max-width="290px"
                      min-width="290px"
                    >
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-calendar"
                          variant="text"
                          size="small"
                          color="primary"
                          @click="openCalendar"
                        />
                      </template>
                      <!-- <v-date-picker
                        v-model="calendarDate"
                        type="month"
                        color="primary"
                        @update:model-value="onCalendarChange"
                        title="ເລືອກເດືອນ"
                        :max="maxMonth"
                      /> -->
                    </v-menu>
                  </template>
                </v-text-field>
                <div v-if="periodCodeId" class="text-caption text-success mt-1">
                  ✓ Period Code: {{ periodCodeId }}
                </div>
              </div>
            </v-col>

            <!-- Search Field -->
            <v-col cols="12" md="3" class="ps-md-2 mb-3 mb-md-0">
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
          </v-row>

          <!-- Action Buttons -->
          <v-row no-gutters>
            <v-col cols="12" class="d-flex gap-2 flex-wrap">
              <v-btn
                type="submit"
                color="primary"
                prepend-icon="mdi-refresh"
                :loading="loading"
                :disabled="!isFormValid"
                class="flex-grow-1 flex-md-grow-0"
                density="compact"
                min-width="120"
              >
                ດຶງຂໍ້ມູນ
              </v-btn>
              <v-btn
                color="success"
                prepend-icon="mdi-microsoft-excel"
                :disabled="!balanceSheetData.length || loading"
                @click="exportToExcel"
                density="compact"
                min-width="100"
              >
                Excel
              </v-btn>
              <v-btn
                color="info"
                prepend-icon="mdi-compare"
                :disabled="!isFormValid || loading"
                @click="compareAccMfi"
                density="compact"
                min-width="100"
              >
                Compare
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
            <div class="table-header pa-4">
              <div class="text-h6 font-weight-medium">
                ຜົນການຄົ້ນຫາ: {{ filteredData.length }} ລາຍການ
                <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
                  {{ chipText }}
                </v-chip>
              </div>
              <div class="text-caption text-grey-darken-1">
                API: {{ selectedTab.toUpperCase() }} - {{ selectedSegment }} {{ selectedCurrency }} {{ periodCodeId }}
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
              <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
              <div class="text-body-2 text-grey">
                ກະລຸນາເລືອກ segment, currency ແລະ period ແລ້ວກົດດຶງຂໍ້ມູນ
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Compare Results Dialog -->
    <v-dialog v-model="showCompareDialog" max-width="1200">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start color="info">mdi-compare</v-icon>
          ຜົນສົມທຽບ ACC ແລະ MFI
        </v-card-title>
        
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-h6 d-flex align-center">
                  <v-icon start color="primary">mdi-office-building</v-icon>
                  ACC (Accounting)
                </v-card-title>
                <v-card-text>
                  <div class="text-h4 text-primary">{{ compareResults?.acc?.count || 0 }}</div>
                  <div class="text-caption">ລາຍການ</div>
                  <div class="mt-2 text-body-2">
                    ລວມ Total Debit: {{ calculateTotalAmount(compareResults?.acc?.data, 'total_Amount_Opening') }}
                  </div>
                  <div class="text-body-2">
                    ລວມ Total Credit: {{ calculateTotalAmount(compareResults?.acc?.data, 'total_Amount_Current') }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-h6 d-flex align-center">
                  <v-icon start color="success">mdi-bank</v-icon>
                  MFI (Microfinance)
                </v-card-title>
                <v-card-text>
                  <div class="text-h4 text-success">{{ compareResults?.mfi?.count || 0 }}</div>
                  <div class="text-caption">ລາຍການ</div>
                  <div class="mt-2 text-body-2">
                    ລວມ Total Debit: {{ calculateTotalAmount(compareResults?.mfi?.data, 'total_Amount_Opening') }}
                  </div>
                  <div class="text-body-2">
                    ລວມ Total Credit: {{ calculateTotalAmount(compareResults?.mfi?.data, 'total_Amount_Current') }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showCompareDialog = false">ປິດ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

interface CompareResults {
  acc?: { count: number; data: BalanceSheetItem[] }
  mfi?: { count: number; data: BalanceSheetItem[] }
}

interface SnackbarState {
  show: boolean
  message: string
  color: string
  icon: string
}

// Reactive state
const loading = ref(false)
const searchText = ref('')
const selectedTab = ref('acc')
const selectedSegment = ref('')
const selectedCurrency = ref('')
const periodInput = ref('')
const periodCodeId = ref('')
const calendarDate = ref<string | null>(null)
const balanceSheetData = ref<BalanceSheetItem[]>([])
const showCompareDialog = ref(false)
const compareResults = ref<CompareResults | null>(null)
const monthMenu = ref(false)

// Get current date for max month limit
const maxMonth = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
})

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

// Period validation rules
const periodRules = [
  (v: string) => !!v || 'ກະລຸນາເລືອກເດືອນ',
  (v: string) => {
    if (!v) return true
    const pattern = /^(0[1-9]|1[0-2])\/\d{4}$/
    return pattern.test(v) || 'ຮູບແບບບໍ່ຖືກຕ້ອງ (MM/YYYY)'
  },
  (v: string) => {
    if (!v) return true
    const [month, year] = v.split('/')
    const inputDate = new Date(parseInt(year), parseInt(month) - 1)
    const maxDate = new Date()
    return inputDate <= maxDate || 'ບໍ່ສາມາດເລືອກເດືອນອະນາຄົດໄດ້'
  }
]

// Computed properties
const isFormValid = computed(() => {
  return !!(selectedSegment.value && selectedCurrency.value && periodCodeId.value)
})

const chipColor = computed(() => {
  if (selectedTab.value === 'acc') return 'primary'
  if (selectedTab.value === 'mfi') return 'success'
  return 'grey'
})

const chipText = computed(() => {
  const tab = selectedTab.value.toUpperCase()
  const segment = selectedSegment.value || '...'
  const currency = selectedCurrency.value || '...'
  const period = periodCodeId.value || '...'
  return `${tab} - ${segment} ${currency} ${period}`
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

// Period handling functions
const formatPeriodInput = (input: string): string => {
  // Remove all non-numeric characters except /
  let cleaned = input.replace(/[^\d\/]/g, '')
  
  // Auto-format as MM/YYYY
  if (cleaned.length >= 2 && !cleaned.includes('/')) {
    cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2)
  }
  
  // Limit to MM/YYYY format
  if (cleaned.length > 7) {
    cleaned = cleaned.substring(0, 7)
  }
  
  return cleaned
}

const convertToApiFormat = (mmyyyy: string): string => {
  if (!mmyyyy || !mmyyyy.includes('/')) return ''
  const [month, year] = mmyyyy.split('/')
  if (month && year && month.length === 2 && year.length === 4) {
    return `${year}${month}` // YYYYMM format
  }
  return ''
}

const convertFromApiFormat = (yyyymm: string): string => {
  if (!yyyymm || yyyymm.length !== 6) return ''
  const year = yyyymm.substring(0, 4)
  const month = yyyymm.substring(4, 6)
  return `${month}/${year}` // MM/YYYY format
}

const onPeriodInputChange = () => {
  const formatted = formatPeriodInput(periodInput.value)
  periodInput.value = formatted
  
  // Convert to API format if valid
  const apiFormat = convertToApiFormat(formatted)
  if (apiFormat) {
    periodCodeId.value = apiFormat
    console.log(`📅 Period input: ${formatted} -> API: ${apiFormat}`)
  } else {
    periodCodeId.value = ''
  }
}

const validateAndFormatPeriod = () => {
  if (periodInput.value) {
    const formatted = formatPeriodInput(periodInput.value)
    periodInput.value = formatted
    
    // Validate the format
    const pattern = /^(0[1-9]|1[0-2])\/\d{4}$/
    if (pattern.test(formatted)) {
      periodCodeId.value = convertToApiFormat(formatted)
    } else {
      showSnackbar('ຮູບແບບເດືອນບໍ່ຖືກຕ້ອງ (MM/YYYY)', 'warning', 'mdi-alert')
      periodCodeId.value = ''
    }
  }
}

const onCalendarChange = (val: string | null) => {
  if (val) {
    calendarDate.value = val
    const [year, month] = val.split('-')
    periodInput.value = `${month}/${year}`
    periodCodeId.value = `${year}${month}`
    monthMenu.value = false
    console.log(`📅 Calendar selected: ${periodInput.value} -> API: ${periodCodeId.value}`)
  }
}

const openCalendar = () => {
  if (periodCodeId.value && periodCodeId.value.length === 6) {
    const year = periodCodeId.value.substring(0, 4)
    const month = periodCodeId.value.substring(4, 6)
    calendarDate.value = `${year}-${month}`
  }
  monthMenu.value = true
}

const clearPeriod = () => {
  periodInput.value = ''
  periodCodeId.value = ''
  calendarDate.value = null
  console.log('🗑️ Period cleared')
}

// Initialize with current month
const initializeDefaultPeriod = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear().toString()
  periodInput.value = `${month}/${year}`
  periodCodeId.value = `${year}${month}`
  calendarDate.value = `${year}-${month}`
  console.log(`🎯 Default period initialized: ${periodInput.value} -> API: ${periodCodeId.value}`)
}

// API call function
const fetchBalanceSheetData = async () => {
  if (!isFormValid.value) {
    showSnackbar('ກະລຸນາເລືອກ segment, currency ແລະ period', 'warning', 'mdi-alert')
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
    
    const response = await axios.post(endpoint, requestData)
    const apiResponse: ApiResponse = response.data
    
    console.log('✅ API Response:', apiResponse)
    
    if (apiResponse.status === 'success') {
      balanceSheetData.value = apiResponse.data || []
      
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນງົບຖານະການເງິນ ${selectedTab.value.toUpperCase()} ສຳເລັດ (${balanceSheetData.value.length} ລາຍການ)`,
        'success',
        'mdi-check-circle'
      )
      
      console.log(`✅ Data loaded successfully: ${balanceSheetData.value.length} records`)
    } else {
      throw new Error(apiResponse.message || 'Unknown error occurred')
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching balance sheet data:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນງົບຖານະການເງິນ'
    let errorIcon = 'mdi-alert-circle'
    
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
      errorIcon = 'mdi-account-alert'
      await navigateTo('/auth/login')
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

// Compare function
const compareAccMfi = async () => {
  if (!isFormValid.value) {
    showSnackbar('ກະລຸນາເລືອກ segment, currency ແລະ period ເພື່ອສົມທຽບ', 'warning', 'mdi-alert')
    return
  }

  try {
    loading.value = true
    
    const axios = (await import('@/helpers/axios')).default
    
    const requestData = {
      segment: selectedSegment.value,
      currency: selectedCurrency.value,
      period_code_id: periodCodeId.value
    }
    
    console.log('📤 Compare request data:', requestData)
    
    const response = await axios.post('/api/balance-sheet/compare_acc_mfi/', requestData)
    const apiResponse = response.data
    
    console.log('✅ Compare Response:', apiResponse)
    
    if (apiResponse.status === 'success') {
      compareResults.value = apiResponse.data
      showCompareDialog.value = true
      showSnackbar('✅ ສົມທຽບຂໍ້ມູນ ACC ແລະ MFI ສຳເລັດ', 'success', 'mdi-check-circle')
    } else {
      throw new Error(apiResponse.message || 'Comparison failed')
    }
    
  } catch (error: any) {
    console.error('❌ Error comparing ACC and MFI:', error)
    showSnackbar(
      error?.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການສົມທຽບຂໍ້ມູນ ACC ແລະ MFI',
      'error',
      'mdi-alert-circle'
    )
  } finally {
    loading.value = false
  }
}

// Event handlers
const onSegmentChange = () => {
  selectedCurrency.value = ''
  balanceSheetData.value = []
  
  // Auto-select LAK for LCY
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
  // Blue for special Lao descriptions
  if (description === 'ຄ. ລາຍຮັບ ແລະ ລາຍຈ່າຍພິເສດ(ບັງເອີນ)' ||
      description === 'ຂ. ລາຍຮັບ ແລະ ລາຍຈ່າຍປົກກະຕິ' ||
      description === 'ກ. ລາຍຮັບ ແລະ ລາຍຈ່າຍໃນການທຸລະກິດ') {
    return 'highlight-grey-row'
  }
  
  // Grey for Roman numerals I-XX
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

const calculateTotalAmount = (data: BalanceSheetItem[], field: 'total_Amount_Opening' | 'total_Amount_Current') => {
  if (!data || !Array.isArray(data)) return '0.00'
  const total = data.reduce((sum, item) => sum + (item[field] || 0), 0)
  return formatCurrency(total)
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// Export to Excel function with security considerations
const exportToExcel = () => {
  try {
    if (!balanceSheetData.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    // Sanitize data for export (remove any potential malicious content)
    const sanitizeString = (str: any): string => {
      if (typeof str !== 'string') return String(str || '')
      // Remove potentially dangerous characters
      return str.replace(/[<>"/\\&\x00-\x1f\x7f-\x9f]/g, '')
    }

    const exportData = balanceSheetData.value.map(item => ({
      'ລາຍລະອຽດ': sanitizeString(item.description),
      'ຍອດ Debit': Number(item.total_Amount_Opening) || 0,
      'ຍອດ Credit': Number(item.total_Amount_Current) || 0,
      'ສະກຸນເງິນ': sanitizeString(item.currency_display || selectedCurrency.value),
      'ປະເພດ': sanitizeString(item.segment_type || selectedSegment.value)
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const colWidths = [
      { wch: 40 }, // ລາຍລະອຽດ
      { wch: 15 }, // ຍອດ Debit
      { wch: 15 }, // ຍອດ Credit
      { wch: 15 }, // ສະກຸນເງິນ
      { wch: 15 }  // ປະເພດ
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, `Balance_Sheet_${selectedTab.value.toUpperCase()}`)

    // Generate secure filename with timestamp
    const currentDate = new Date().toISOString().split('T')[0]
    const timestamp = new Date().getTime()
    const filename = `Balance_Sheet_${selectedTab.value.toUpperCase()}_${selectedSegment.value}_${selectedCurrency.value}_${periodCodeId.value}_${currentDate}_${timestamp}.xlsx`

    XLSX.writeFile(wb, filename)

    showSnackbar(
      `📊 ສົ່ງອອກສຳເລັດ (${chipText.value}) - ${balanceSheetData.value.length} ລາຍການ`, 
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
    if (process.client) {
      const token = localStorage.getItem("token")
      if (token) {
        console.log('🚀 Balance Sheet component mounted with token')
        
        // Set default values
        selectedSegment.value = 'LCY'
        selectedCurrency.value = 'LAK'
        initializeDefaultPeriod()
        
        console.log('✅ Component initialized with defaults:', {
          segment: selectedSegment.value,
          currency: selectedCurrency.value,
          period: periodInput.value,
          periodCode: periodCodeId.value
        })
      } else {
        showSnackbar('🔑 ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
        await navigateTo('/auth/login')
      }
    }
  } catch (error) {
    console.error('Initialization error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການເລີ່ມຕົ້ນ', 'error', 'mdi-alert-circle')
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

.table-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #dee2e6;
}

.period-input-container {
  position: relative;
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
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  font-weight: bold;
}

.highlight-grey-row {
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
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

/* Responsive Design */
@media (max-width: 1200px) {
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
  .description-cell {
    max-width: 200px;
    min-width: 120px;
  }
}

/* Security: Prevent content injection */
.description-cell, .amount-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Accessibility improvements */
.v-btn:focus {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.v-text-field:focus-within {
  outline: 1px solid #2196f3;
}
</style>