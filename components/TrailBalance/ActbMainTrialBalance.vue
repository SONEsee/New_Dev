<!-- MainTrialBalance.vue -->
<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" style="border: 1px solid #e0e0e0; width: 100%;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
        <v-icon start size="24">mdi-chart-line</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
          Dairy Report ລາຍງານໃບດຸ່ນດຽງ - {{ selectedCurrency }} ({{ selectedMSegment }})
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
            <v-col cols="12" md="4" class="pe-md-2 mb-3 mb-md-0">
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
            <v-col cols="12" md="4" class="px-md-1 mb-3 mb-md-0">
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

            <!-- Action Buttons -->
            <v-col cols="12" md="4" class="ps-md-2 d-flex gap-2">
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
                style="height: 40px;"
              >
                Excel
              </v-btn>
            </v-col>
          </v-row>

          <!-- Second Row: Search Field -->
          <v-row no-gutters class="mb-4">
            <!-- Search Field -->
            <v-col cols="12">
              <v-text-field
                v-model="searchText"
                label="ຄົ້ນຫາໃນຕາຕະລາງ (Search GL Code, Description, Currency)"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              />
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
            API: main-trial-balance-dairy | {{ selectedMSegment }}-{{ selectedCurrency }}
          </div>
        </div>

        <!-- Parameter Summary -->
        <div v-if="lastUsedParams" class="mb-3 pa-2 bg-blue-lighten-5 rounded">
          <div class="text-caption text-blue-darken-2">
            <strong>ພາລາມິເຕີທີ່ໃຊ້:</strong> 
            Currency: {{ lastUsedParams.ccy_code_id }}, 
            Segment: {{ lastUsedParams.m_segment }}
          </div>
        </div>

        <!-- Data Info (from stored procedure results) -->
        <div v-if="trialBalanceData.length > 0" class="mb-3 pa-2 bg-green-lighten-5 rounded">
          <div class="text-caption text-green-darken-2">
            <strong>ຂໍ້ມູນປີ:</strong> {{ getDataYear() }} | 
            <strong>ງວດ:</strong> {{ getDataPeriod() }} | 
            <strong>ປະເພດ:</strong> GL Category ≤ 5
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
                    {{ !isFormValid ? 'ກະລຸນາເລືອກ Market Segment ແລະ Currency' : 'ກະລຸນາກົດປຸ່ມດຶງຂໍ້ມູນເພື່ອໂຫຼດຂໍ້ມູນ' }}
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
                    <span class="text-primary font-weight-medium">{{ item.GL_Code }}</span>
                  </div>
                </td>
                <td class="data-cell description-cell">
                  <div class="description-content" :title="item.Description">
                    {{ item.Description }}
                  </div>
                </td>
                <!-- Opening Dr/Cr -->
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Opening_Dr) }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Opening_Cr) }}</span>
                </td>
                <!-- Movement Dr/Cr -->
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Flow_Dr) }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Flow_Cr) }}</span>
                </td>
                <!-- Closing Dr/Cr -->
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Closing_Dr) }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Closing_Cr) }}</span>
                </td>
                <!-- Currency -->
                <td class="data-cell extra-column-cell">
                  <v-chip 
                    size="small" 
                    :color="getCurrencyColor(item.Currency_Code)" 
                    variant="tonal"
                  >
                    {{ item.Currency_Code }}
                  </v-chip>
                </td>
                <!-- Market Segment -->
                <td class="data-cell extra-column-cell">
                  <v-chip 
                    size="small" 
                    :color="getSegmentColor(item.Market_Segment)" 
                    variant="outlined"
                  >
                    {{ item.Market_Segment }}
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

// Types - Updated to match API response
interface TrialBalanceItem {
  GL_Code: string
  Description: string
  Opening_Dr: number
  Opening_Cr: number
  Flow_Dr: number
  Flow_Cr: number
  Closing_Dr: number
  Closing_Cr: number
  Category: number
  Currency_Code: string
  Market_Segment: string
  Financial_Year: string
  Period_Code: string
  Opening_Net: number
  Flow_Net: number
  Closing_Net: number
}

interface ApiResponse {
  status: 'success' | 'error'
  message: string
  count?: number
  data: TrialBalanceItem[]
  ccy_code_id?: string
  m_segment?: string
  report_category?: string
  display_currency?: string
  business_rules?: {
    lcy_currencies: string[]
    fcy_currencies: string[]
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

// Reactive state
const loading = ref(false)
const searchText = ref('')
const selectedMSegment = ref('') // Start empty to force user selection
const selectedCurrency = ref('')
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

// Computed properties
const availableCurrencyOptions = computed(() => {
  if (!selectedMSegment.value) return []
  return allCurrencyOptions[selectedMSegment.value as keyof typeof allCurrencyOptions] || []
})

const isFormValid = computed(() => {
  return selectedMSegment.value && selectedCurrency.value
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
    item.GL_Code?.toLowerCase().includes(search) ||
    item.Description?.toLowerCase().includes(search) ||
    item.Currency_Code?.toLowerCase().includes(search) ||
    item.Market_Segment?.toLowerCase().includes(search)
  )
})

// Helper functions to show data info from results
const getDataYear = () => {
  if (trialBalanceData.value.length > 0) {
    return trialBalanceData.value[0].Financial_Year || 'N/A'
  }
  return 'N/A'
}

const getDataPeriod = () => {
  if (trialBalanceData.value.length > 0) {
    return trialBalanceData.value[0].Period_Code || 'N/A'
  }
  return 'N/A'
}

// Event handlers
const onMSegmentChange = (newValue: string) => {
  console.log(`MSegment changed to: ${newValue}`)
  // Reset currency when MSegment changes
  selectedCurrency.value = ''
  trialBalanceData.value = []
  lastUsedParams.value = null
}

// Watch for currency changes to auto-set as first available if needed
watch([selectedMSegment], () => {
  if (selectedMSegment.value && availableCurrencyOptions.value.length > 0) {
    // Auto-select first currency if none selected
    if (!selectedCurrency.value) {
      selectedCurrency.value = availableCurrencyOptions.value[0].value
    }
  }
})

// API calls - Updated to use only 2 parameters
const fetchTrialBalanceData = async () => {
  try {
    loading.value = true
    
    if (!isFormValid.value) {
      showSnackbar('ກະລຸນາເລືອກ Market Segment ແລະ Currency', 'warning', 'mdi-alert')
      return
    }
    
    // Only 2 parameters as per your stored procedure
    const params = {
      ccy_code_id: selectedCurrency.value,
      m_segment: selectedMSegment.value
    }
    
    console.log('Calling Trial Balance API with params:', params)
    
    const apiResponse = await axios.post('/api/main-trial-balance/all-currencies/dairy-report/', params, getAuthHeaders())
    const response: ApiResponse = apiResponse.data
    
    if (response.status === 'success') {
      trialBalanceData.value = response.data || []
      lastUsedParams.value = {
        ccy_code_id: response.ccy_code_id,
        m_segment: response.m_segment
      }
      
      showSnackbar(
        `ດຶງຂໍ້ມູນ Trial Balance ສຳເລັດ (${trialBalanceData.value.length} ລາຍການ)`,
        'success',
        'mdi-check-circle'
      )
      
      console.log(`Data loaded successfully: ${trialBalanceData.value.length} records`)
    } else {
      throw new Error(response.message || 'Unknown error occurred')
    }
    
  } catch (error: any) {
    console.error('Error fetching trial balance data:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ Trial Balance'
    let errorIcon = 'mdi-alert-circle'
    
    // Handle specific errors
    if (error?.response?.status === 401) {
      errorMessage = 'ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
      errorIcon = 'mdi-account-alert'
    } else if (error?.response?.status === 403) {
      errorMessage = 'ທ່ານບໍ່ມີສິດໃນການເຂົ້າເຖິງຂໍ້ມູນນີ້'
      errorIcon = 'mdi-lock-alert'
    } else if (error?.response?.status === 404) {
      errorMessage = 'ບໍ່ພົບ API endpoint ທີ່ຕ້ອງການ'
      errorIcon = 'mdi-api-off'
    } else if (error?.response?.status === 400) {
      const backendMessage = error?.response?.data?.message || 'Invalid request format'
      errorMessage = backendMessage
      errorIcon = 'mdi-form-select'
    } else if (error?.response?.status === 500) {
      errorMessage = 'ເກີດຂໍ້ຜິດພາດຈາກເຊີຟເວີ ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ'
      errorIcon = 'mdi-server-network-off'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error?.message === 'Authentication token not found') {
      errorMessage = 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ'
      errorIcon = 'mdi-account-alert'
    } else if (error?.message?.includes('Network Error')) {
      errorMessage = 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີຟເວີໄດ້'
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

    // Prepare export data
    const exportData = trialBalanceData.value.map(item => ({
      'GL Code': item.GL_Code,
      'Description': item.Description,
      'Opening Dr': item.Opening_Dr,
      'Opening Cr': item.Opening_Cr,
      'Flow Dr': item.Flow_Dr,
      'Flow Cr': item.Flow_Cr,
      'Closing Dr': item.Closing_Dr,
      'Closing Cr': item.Closing_Cr,
      'Category': item.Category,
      'Currency': item.Currency_Code,
      'Market Segment': item.Market_Segment,
      'Financial Year': item.Financial_Year,
      'Period Code': item.Period_Code,
      'Opening Net': item.Opening_Net,
      'Flow Net': item.Flow_Net,
      'Closing Net': item.Closing_Net
    }))

    // Create and save Excel file
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // GL Code
      { wch: 30 }, // Description
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, // Amount columns (Opening, Flow)
      { wch: 12 }, { wch: 12 }, // Closing columns
      { wch: 8 },  // Category
      { wch: 10 }, // Currency
      { wch: 15 }, // Market Segment
      { wch: 12 }, // Financial Year
      { wch: 12 }, // Period Code
      { wch: 12 }, { wch: 12 }, { wch: 12 } // Net columns (Opening, Flow, Closing)
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, 'Main Trial Balance')

    // Generate filename with current timestamp
    const now = new Date()
    const timestamp = now.getFullYear() + 
                     String(now.getMonth() + 1).padStart(2, '0') + 
                     String(now.getDate()).padStart(2, '0') + '_' +
                     String(now.getHours()).padStart(2, '0') + 
                     String(now.getMinutes()).padStart(2, '0')
    
    const filename = `Trial_Balance_Dairy_${selectedMSegment.value}_${selectedCurrency.value}_${timestamp}.xlsx`

    XLSX.writeFile(wb, filename)

    showSnackbar(
      `ສົ່ງອອກສຳເລັດ (${selectedMSegment.value}-${selectedCurrency.value}) - ${trialBalanceData.value.length} ລາຍການ`, 
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
      
      // Don't auto-fetch data - wait for user to complete form
      showSnackbar('ກະລຸນາເລືອກ Market Segment ແລະ Currency ແລ້ວກົດດຶງຂໍ້ມູນ', 'info', 'mdi-information')
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

/* Extra columns for Currency and Segment */
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

/* Extra Column Cells for Currency and Segment */
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
</style>