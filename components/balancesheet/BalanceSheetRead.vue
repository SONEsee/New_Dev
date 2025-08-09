<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" style="border: 1px solid #e0e0e0; width: 100%;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
        <v-icon start size="24">mdi-file-chart</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
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
        <v-form @submit.prevent="fetchIncomeStatementData" class="mb-4">
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
            <v-col cols="12" md="3" class="ps-md-2 d-flex gap-1">
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
                style="height: 40px;"
              >
                Excel
              </v-btn>
              <v-btn
                color="info"
                prepend-icon="mdi-compare"
                :disabled="!selectedSegment || !selectedCurrency || loading"
                @click="compareAccMfi"
                density="compact"
                style="height: 40px;"
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
            <div class="d-flex justify-space-between align-center pa-4 bg-grey-lighten-5">
              <div class="text-h6 font-weight-medium text-styles">
                ຜົນການຄົ້ນຫາ: {{ filteredData.length }} ລາຍການ
                <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
                  {{ chipText }}
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
                    <span class="amount-cell" :class="getNetAmountClass(item.net_amount)">
                        {{ formatCurrency(item.net_amount) }}
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
              <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
              <div class="text-body-2 text-grey">
                ກະລຸນາເລືອກ segment ແລະ currency ແລ້ວກົດດຶງຂໍ້ມູນ
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
                    ລວມ Net Amount: {{ calculateTotalNet(compareResults?.acc?.data) }}
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
                    ລວມ Net Amount: {{ calculateTotalNet(compareResults?.mfi?.data) }}
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

// Reactive state
const loading = ref(false)
const searchText = ref('')
const selectedTab = ref('acc') // Default to ACC tab
const selectedSegment = ref('')
const selectedCurrency = ref('')
const incomeStatementData = ref<IncomeStatementItem[]>([])
const showCompareDialog = ref(false)
const compareResults = ref<any>(null)

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
  { title: 'ຍອດສຸດທິ', key: 'net_amount', width: '150px', align: 'end', sortable: true },
  { title: 'ສະກຸນເງິນ', key: 'currency_display', width: '100px', align: 'center', sortable: true },
  { title: 'ປະເພດ', key: 'segment_type', width: '100px', align: 'center', sortable: true }
]

// Fixed API call function using axios
const fetchIncomeStatementData = async () => {
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
    
    // Import axios
    const axios = (await import('@/helpers/axios')).default
    
    const requestData = {
      segment: selectedSegment.value,
      currency: selectedCurrency.value
    }
    
    console.log('📤 Request data:', requestData)
    
    // Make API call using axios
    const response = await axios.post(endpoint, requestData)
    
    console.log('✅ Raw Response:', response)
    console.log('✅ Response Data:', response.data)
    
    // With axios, the actual API response is in response.data
    const apiResponse = response.data
    
    if (apiResponse.status === 'success') {
      incomeStatementData.value = apiResponse.data || []
      
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນງົບກຳໄລຂາດທຸນ ${selectedTab.value.toUpperCase()} ສຳເລັດ (${incomeStatementData.value.length} ລາຍການ)`,
        'success',
        'mdi-check-circle'
      )
      
      console.log(`✅ Data loaded successfully: ${incomeStatementData.value.length} records`)
      console.log('📊 First few records:', incomeStatementData.value.slice(0, 3))
    } else {
      throw new Error(apiResponse.message || 'Unknown error occurred')
    }
    
  } catch (error: any) {
    console.error('❌ Error fetching income statement data:', error)
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    })
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນງົບກຳໄລຂາດທຸນ'
    let errorIcon = 'mdi-alert-circle'
    
    // Enhanced error handling for axios
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
      errorIcon = 'mdi-account-alert'
      // Redirect to login
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
    } else if (error?.message === 'Authentication token not found') {
      errorMessage = '🔑 ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ'
      errorIcon = 'mdi-account-alert'
      await navigateTo('/auth/login')
    } else if (error?.message?.includes('Network Error')) {
      errorMessage = '🌐 ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີຟເວີໄດ້'
      errorIcon = 'mdi-wifi-off'
    } else if (error?.userMessage) {
      // Use the user-friendly message from axios interceptor
      errorMessage = error.userMessage
    }
    
    showSnackbar(errorMessage, 'error', errorIcon)
    incomeStatementData.value = []
    
  } finally {
    loading.value = false
  }
}

// Fixed compare function using axios
const compareAccMfi = async () => {
  if (!selectedSegment.value || !selectedCurrency.value) {
    showSnackbar('ກະລຸນາເລືອກ segment ແລະ currency ເພື່ອສົມທຽບ', 'warning', 'mdi-alert')
    return
  }

  try {
    loading.value = true
    
    // Import axios
    const axios = (await import('@/helpers/axios')).default
    
    const requestData = {
      segment: selectedSegment.value,
      currency: selectedCurrency.value
    }
    
    console.log('📤 Compare request data:', requestData)
    
    const response = await axios.post('/api/income-statement/compare_acc_mfi/', requestData)
    
    console.log('✅ Compare Response:', response.data)
    
    // With axios, the actual API response is in response.data
    const apiResponse = response.data
    
    if (apiResponse.status === 'success') {
      compareResults.value = apiResponse.data
      showCompareDialog.value = true
      showSnackbar(
        `✅ ສົມທຽບຂໍ້ມູນ ACC ແລະ MFI ສຳເລັດ`,
        'success',
        'mdi-check-circle'
      )
    } else {
      throw new Error(apiResponse.message || 'Comparison failed')
    }
    
  } catch (error: any) {
    console.error('❌ Error comparing ACC and MFI:', error)
    showSnackbar(
      error?.response?.data?.message || error?.userMessage || 'ເກີດຂໍ້ຜິດພາດໃນການສົມທຽບຂໍ້ມູນ ACC ແລະ MFI',
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
  incomeStatementData.value = []
  
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
  if (amount > 0) return 'text-success font-weight-bold'
  if (amount < 0) return 'text-error font-weight-bold'
  return 'text-grey'
}

const calculateTotalNet = (data: any[]) => {
  if (!data || !Array.isArray(data)) return '0.00'
  const total = data.reduce((sum, item) => sum + (item.net_amount || 0), 0)
  return formatCurrency(total)
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// Debug function - you can call this in browser console: window.testApi()
const testApiCall = async () => {
  console.log('🧪 Testing API call manually...')
  
  try {
    const axios = (await import('@/helpers/axios')).default
    console.log('✅ Axios imported:', axios)
    
    const testData = {
      segment: 'FCY',
      currency: 'USD'
    }
    
    console.log('📤 Test request data:', testData)
    
    const response = await axios.post('/api/income-statement/acc/', testData)
    
    console.log('✅ Test response status:', response.status)
    console.log('✅ Test response data:', response.data)
    
    if (response.data.status === 'success') {
      console.log('🎉 API call successful!')
      console.log('📊 Data count:', response.data.count)
      console.log('📋 First item:', response.data.data[0])
    } else {
      console.log('❌ API returned error:', response.data.message)
    }
    
    return response.data
    
  } catch (error) {
    console.error('❌ Test API call failed:', error)
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    })
    throw error
  }
}

// Expose test function to global scope for debugging
if (process.client) {
  (window as any).testApi = testApiCall
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
      'ຍອດສຸດທິ': item.net_amount,
      'ສະກຸນເງິນ': item.currency_display,
      'ປະເພດ': item.segment_type
    }))

    // Create and save Excel file
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const colWidths = [
      { wch: 40 }, // ລາຍລະອຽດ
      { wch: 15 }, // ຍອດສຸດທິ
      { wch: 15 }, // ສະກຸນເງິນ
      { wch: 15 }  // ປະເພດ
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, `Income Statement ${selectedTab.value.toUpperCase()}`)

    // Generate secure filename
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `Income_Statement_${selectedTab.value.toUpperCase()}_${selectedSegment.value}_${selectedCurrency.value}_${currentDate}.xlsx`

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

// Watch for tab changes - Fixed watch import
watch(selectedTab, () => {
  incomeStatementData.value = []
  console.log(`🔄 Tab changed to: ${selectedTab.value.toUpperCase()}`)
})

// Initialize component
onMounted(async () => {
  try {
    if (process.client) {
      const token = localStorage.getItem("token")
      if (token) {
        console.log('🚀 Income Statement component mounted with token')
        // Set default values
        selectedSegment.value = 'LCY'
        selectedCurrency.value = 'LAK'
        
        // Test axios import
        try {
          const axios = (await import('@/helpers/axios')).default
          console.log('✅ Axios imported successfully:', axios)
        } catch (axiosError) {
          console.error('❌ Failed to import axios:', axiosError)
          showSnackbar('⚠️ ບໍ່ສາມາດໂຫຼດ axios helper ໄດ້', 'warning', 'mdi-alert')
        }
      } else {
        showSnackbar('🔑 ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
        await navigateTo('/auth/login')
      }
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
  .font-mono { font-size: 0.75rem; }
  .amount-cell { padding: 2px 4px; font-size: 0.75rem; }
  .professional-table :deep(.v-data-table__td) { padding: 6px 8px !important; }
  
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

.highlight-blue-row {
  background : linear-gradient(135deg, #59b4ff 0%, #e3f2fd 100%);
  font-weight: bold;
}

.highlight-grey-row {
  background : linear-gradient(135deg, #ffb25a 0%, #e7e7e7 100%);
  font-weight: bold;
}
</style>