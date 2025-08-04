<template>
  <v-container fluid class="pa-6">
    <v-card class="mx-auto" max-width="1400" elevation="0" style="border: 1px solid #e0e0e0;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <v-icon start size="24">mdi-chart-box-outline</v-icon>
        <span class="text-h6 font-weight-medium text-styles">ລາຍງານໃບສົມທົບ</span>
      </v-card-title>
      
      <v-card-text class="px-6 py-4">
        <!-- Filter Form -->
        <v-form @submit.prevent="fetchTrialBalance" class="mb-4">
          <v-row no-gutters class="mb-4">
            <v-col cols="12" md="3" class="pe-md-2 mb-3 mb-md-0">
              <v-select
                v-model="filters.ac_ccy_id"
                :items="currencyOptions"
                label="ສະກຸນເງິນ (Currency)"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-currency-usd"
                hide-details="auto"
                clearable
              />
            </v-col>
            
            <v-col cols="12" md="3" class="px-md-2 mb-3 mb-md-0">
              <v-text-field
                v-model="filters.date_start"
                label="ວັນທີເລີ່ມຕົ້ນ"
                type="date"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-start"
                hide-details="auto"
              />
            </v-col>
            
            <v-col cols="12" md="3" class="px-md-2 mb-3 mb-md-0">
              <v-text-field
                v-model="filters.date_end"
                label="ວັນທີສິ້ນສຸດ"
                type="date"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-end"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="3" class="ps-md-2 d-flex gap-2">
              <v-btn
                type="submit"
                color="primary"
                prepend-icon="mdi-magnify"
                :loading="loading"
                class="flex-grow-1"
                density="compact"
                style="height: 40px;"
              >
                ຄົ້ນຫາຂໍ້ມູນ
              </v-btn>
              <v-btn
                color="success"
                prepend-icon="mdi-microsoft-excel"
                :disabled="!results.length || loading"
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

        <!-- Action Buttons Row -->
        <v-row no-gutters class="mb-4">
          <v-col cols="12" class="d-flex justify-end gap-2">
            <v-btn
              color="info"
              prepend-icon="mdi-database-import"
              :disabled="!filters.date_start || !filters.date_end || loading || transferLoading"
              :loading="transferLoading"
              @click="transferDataToDatabase"
              elevation="2"
            >
              <span class="font-weight-medium">ນຳເຂົ້າຂໍ້ມູນໃສ່ລະບົບ</span>
              <v-tooltip activator="parent" location="top">
                ເອີ້ນ stored procedure ແລະນຳເຂົ້າຂໍ້ມູນໃບສົມທົບ
              </v-tooltip>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="results"
          :items-per-page="20"
          :loading="loading"
          class="elevation-0 professional-table full-width-table"
          density="compact"
          hover
          show-current-page
          :search="searchText"
        >
          <!-- Loading State -->
          <template #loading>
            <v-skeleton-loader type="table-row@10" />
          </template>
          
          <!-- Table Top Actions -->
          <template #top>
            <div class="d-flex justify-space-between align-center pa-4 bg-grey-lighten-5">
              <div class="text-h6 font-weight-medium text-styles">
                ຜົນການຄົ້ນຫາ: {{ results.length }} ລາຍການ
              </div>
              <v-text-field
                v-model="searchText"
                label="ຄົ້ນຫາໃນຕາຕະລາງ"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                style="max-width: 300px;"
                hide-details
                clearable
              />
            </div>
          </template>
          
          <!-- Custom Row Template -->
          <template #item="{ item }">
            <tr class="table-row">
              <td class="font-weight-medium text-primary">{{ item.GL }}</td>
              <td class="text-truncate" :title="item._Desc">
                {{ item._Desc }}
              </td>
              <!-- Currency column (only shown for All Currency view) -->
              <td v-if="isAllCurrency" class="text-center font-weight-medium">
                <v-chip size="small" :color="getCurrencyColor(item.Currency)" variant="tonal">
                  {{ item.Currency }}
                </v-chip>
              </td>
              <!-- Amount columns (using normalized field names) -->
              <td class="text-end font-mono">
                <span class="amount-cell">{{ formatCurrency(item.Opening_Dr) }}</span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell">{{ formatCurrency(item.Opening_Cr) }}</span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell">{{ formatCurrency(item.Flow_Dr) }}</span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell">{{ formatCurrency(item.Flow_Cr) }}</span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell text-success font-weight-medium">
                  {{ formatCurrency(item.Closing_Dr) }}
                </span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell text-error font-weight-medium">
                  {{ formatCurrency(item.Closing_Cr) }}
                </span>
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-table-off</v-icon>
              <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
              <div class="text-body-2 text-grey">ກະລຸນາປັບປຸງເງື່ອນໄຂການຄົ້ນຫາແລ້ວລອງໃໝ່</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Updated Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4">
          <v-icon start color="warning">mdi-database-import</v-icon>
          ຢືນຢັນການນຳເຂົ້າຂໍ້ມູນ
        </v-card-title>
        <v-card-text class="pa-4">
          <div class="text-body-1 mb-3">
            ທ່ານຕ້ອງການເອີ້ນ <strong>stored procedure</strong> ແລະນຳເຂົ້າຂໍ້ມູນໃບສົມທົບໄປຍັງລະບົບບໍ?
          </div>
          <div class="text-body-2 text-grey-darken-1">
            <strong>ລາຍລະອຽດການດຳເນີນງານ:</strong><br>
            • ລຶບຂໍ້ມູນເກົ່າທັງໝົດຈາກຕາຕະລາງ Dairy_Report<br>
            • ເອີ້ນ stored procedure: <code class="text-primary">Somtop_Trail_Balance_All_Currency_Temp_ACTB</code><br>
            • ນຳເຂົ້າຂໍ້ມູນໃໝ່ທັງໝົດທີ່ໄດ້ຈາກ stored procedure<br><br>
            
            <strong>ຂໍ້ມູນທີ່ຈະປະມວນຜົນ:</strong><br>
            • ວັນທີ: {{ filters.date_start }} ຫາ {{ filters.date_end }}<br>
            • ປີງບ: {{ getCurrentYear() }}<br>
            • ລະຫັດໄລຍະ: {{ getCurrentPeriod() }}<br>
            • ປະເພດ: TRIAL_BALANCE
          </div>
          
          <v-alert
            type="warning"
            variant="tonal"
            class="mt-3"
            density="compact"
          >
            <strong>ຄຳເຕືອນ:</strong> ການດຳເນີນງານນີ້ຈະລຶບຂໍ້ມູນເກົ່າທັງໝົດກ່ອນນຳເຂົ້າຂໍ້ມູນໃໝ່
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="confirmDialog.show = false"
            :disabled="transferLoading"
          >
            <v-icon start>mdi-close</v-icon>
            ຍົກເລີກ
          </v-btn>
          <v-btn
            color="info"
            @click="confirmTransfer"
            :loading="transferLoading"
          >
            <v-icon start>mdi-database-check</v-icon>
            ຢືນຢັນນຳເຂົ້າ
          </v-btn>
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
import { ref, onMounted, computed } from 'vue'
import axios from '@/helpers/axios'
import * as XLSX from 'xlsx'

// Authentication helper function
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    'Content-Type': 'application/json'
  }
})

// Reactive state
const loading = ref(false)
const transferLoading = ref(false)
const searchText = ref('')

// Currency options
const currencyOptions = ref([
  { title: 'All Currencies (LCY)', value: 'ALL' },
  { title: 'LAK - Lao Kip', value: 'LAK' },
  { title: 'USD - US Dollar', value: 'USD' },
  { title: 'THB - Thai Baht', value: 'THB' }
])

const filters = ref({
  ac_ccy_id: 'ALL', // Default to ALL
  date_start: new Date().toISOString().split('T')[0],
  date_end: new Date().toISOString().split('T')[0] // Current date
})

const results = ref([])

const confirmDialog = ref({
  show: false
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Computed property for dynamic currency display
const currentCurrencyDisplay = computed(() => {
  return filters.value.ac_ccy_id === 'ALL' ? 'LCY' : filters.value.ac_ccy_id
})

// Computed property to check if showing all currencies
const isAllCurrency = computed(() => {
  return filters.value.ac_ccy_id === 'ALL'
})

// Table configuration
const headers = computed(() => {
  const baseHeaders = [
    { 
      title: 'ເລກບັນຊີ', 
      key: 'GL', 
      width: '120px',
      sortable: true
    },
    { 
      title: 'ລາຍລະອຽດ (Description)', 
      key: '_Desc', 
      width: '300px',
      sortable: true
    }
  ]

  // Add Currency column for All Currency view
  if (isAllCurrency.value) {
    baseHeaders.push({
      title: 'ສະກຸນເງິນ',
      key: 'Currency',
      width: '80px',
      sortable: true
    })
  }

  // Add amount columns (using same field names for both modes)
  const amountColumns = [
    { 
      title: 'Opening Dr', 
      key: 'Opening_Dr', 
      width: '140px', 
      align: 'end',
      sortable: true
    },
    { 
      title: 'Opening Cr', 
      key: 'Opening_Cr', 
      width: '140px', 
      align: 'end',
      sortable: true
    },
    { 
      title: 'Flow Dr', 
      key: 'Flow_Dr', 
      width: '140px', 
      align: 'end',
      sortable: true
    },
    { 
      title: 'Flow Cr', 
      key: 'Flow_Cr', 
      width: '140px', 
      align: 'end',
      sortable: true
    },
    { 
      title: 'Closing Dr', 
      key: 'Closing_Dr', 
      width: '140px', 
      align: 'end',
      sortable: true
    },
    { 
      title: 'Closing Cr', 
      key: 'Closing_Cr', 
      width: '140px', 
      align: 'end',
      sortable: true
    }
  ]

  return [...baseHeaders, ...amountColumns]
})

// Helper functions for date parsing
const getCurrentYear = (): string => {
  return new Date().getFullYear().toString()
}

const getCurrentPeriod = (): string => {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}${month}`
}

// Updated fetchTrialBalance method to handle ALL currency option
const fetchTrialBalance = async () => {
  try {
    loading.value = true
    
    // Validate token exists
    const token = localStorage.getItem("token")
    if (!token) {
      showSnackbar('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ', 'error', 'mdi-alert-circle')
      return
    }

    // Validate form data
    if (!filters.value.ac_ccy_id || !filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບຖ້ວນ', 'warning', 'mdi-alert')
      return
    }

    let apiEndpoint = ''
    let payload = {}

    // Check if ALL currency is selected
    if (filters.value.ac_ccy_id === 'ALL') {
      apiEndpoint = '/api/trial-balance-allccy/'
      payload = {
        date_start: filters.value.date_start,
        date_end: filters.value.date_end
      }
    } else {
      apiEndpoint = '/api/trial-balance/'
      payload = {
        ac_ccy_id: filters.value.ac_ccy_id,
        date_start: filters.value.date_start,
        date_end: filters.value.date_end
      }
    }
    
    const { data } = await axios.post(apiEndpoint, payload, getAuthHeaders())
    
    // Normalize data: convert _LCY fields to regular fields for all currency data
    let normalizedData = data.data || []
    
    if (filters.value.ac_ccy_id === 'ALL') {
      normalizedData = normalizedData.map(item => ({
        ...item,
        // Map LCY fields (LAK equivalent) to standard field names
        Opening_Dr: item.Opening_Dr_LCY || item.Opening_Dr || 0,
        Opening_Cr: item.Opening_Cr_LCY || item.Opening_Cr || 0,
        Flow_Dr: item.Flow_Dr_LCY || item.Flow_Dr || 0,
        Flow_Cr: item.Flow_Cr_LCY || item.Flow_Cr || 0,
        Closing_Dr: item.Closing_Dr_LCY || item.Closing_Dr || 0,
        Closing_Cr: item.Closing_Cr_LCY || item.Closing_Cr || 0
      }))
    }
    
    results.value = normalizedData
    
    const currencyText = filters.value.ac_ccy_id === 'ALL' ? 'All Currencies (LCY)' : filters.value.ac_ccy_id
    showSnackbar(
      `ດຶງຂໍ້ມູນສຳເລັດ (${currencyText}) - ພົບ ${results.value.length} ລາຍການ`, 
      'success', 
      'mdi-check-circle'
    )
    
  } catch (error) {
    console.error('Error fetching trial balance:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
    let errorIcon = 'mdi-alert-circle'
    
    if (error?.response?.status === 401) {
      errorMessage = 'ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
      errorIcon = 'mdi-account-alert'
    } else if (error?.response?.status === 403) {
      errorMessage = 'ທ່ານບໍ່ມີສິດໃນການເຂົ້າເຖິງຂໍ້ມູນນີ້'
      errorIcon = 'mdi-lock-alert'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error?.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    showSnackbar(errorMessage, 'error', errorIcon)
    results.value = []
    
  } finally {
    loading.value = false
  }
}

// Updated transferDataToDatabase function - simplified since we don't need to transform data
const transferDataToDatabase = () => {
  // Validate required fields
  if (!filters.value.date_start || !filters.value.date_end) {
    showSnackbar('ກະລຸນາລະບຸວັນທີເລີ່ມຕົ້ນແລະວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
    return
  }

  confirmDialog.value.show = true
}

// Updated confirmTransfer function to use new API
const confirmTransfer = async () => {
  try {
    transferLoading.value = true

    // Validate token exists
    const token = localStorage.getItem("token")
    if (!token) {
      showSnackbar('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ', 'error', 'mdi-alert-circle')
      return
    }

    // Validate required data
    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາລະບຸວັນທີເລີ່ມຕົ້ນແລະວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
      return
    }

    // Prepare payload for the new bulk-insert-allcurrency API
    const payload = {
      date_start: filters.value.date_start,
      date_end: filters.value.date_end,
      fin_year: getCurrentYear(),
      period_code: getCurrentPeriod(),
      category: 'TRIAL_BALANCE'
    }

    // Send data to the new bulk-insert-allcurrency API endpoint
    const response = await axios.post('/api/dairy-report/bulk-insert-allcurrency/', payload, getAuthHeaders())

    confirmDialog.value.show = false

    if (response.data.status === 'success') {
      const successMessage = `ນຳເຂົ້າຂໍ້ມູນສຳເລັດ - ${response.data.inserted_count || 0} ລາຍການ`
      
      // Show additional details if available
      if (response.data.cleared_records > 0) {
        const detailMessage = `ລຶບຂໍ້ມູນເກົ່າ: ${response.data.cleared_records} ລາຍການ, ນຳເຂົ້າໃໝ່: ${response.data.inserted_count} ລາຍການ`
        showSnackbar(detailMessage, 'success', 'mdi-database-check')
      } else {
        showSnackbar(successMessage, 'success', 'mdi-database-check')
      }

      // Log additional info for debugging
      console.log('Transfer successful:', {
        cleared: response.data.cleared_records,
        inserted: response.data.inserted_count,
        failed: response.data.failed_count,
        dateRange: response.data.date_range
      })

      // Show warning if there were failed records
      if (response.data.failed_count > 0) {
        setTimeout(() => {
          showSnackbar(
            `ມີ ${response.data.failed_count} ລາຍການຜິດພາດ - ກະລຸນາກວດສອບ log`,
            'warning',
            'mdi-alert-circle'
          )
        }, 3000)
      }

    } else {
      throw new Error(response.data.message || 'Unknown error occurred')
    }

  } catch (error) {
    console.error('Error transferring data:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການນຳເຂົ້າຂໍ້ມູນ'
    let errorIcon = 'mdi-database-alert'
    
    if (error?.response?.status === 401) {
      errorMessage = 'ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
      errorIcon = 'mdi-account-alert'
    } else if (error?.response?.status === 403) {
      errorMessage = 'ທ່ານບໍ່ມີສິດໃນການນຳເຂົ້າຂໍ້ມູນ'  
      errorIcon = 'mdi-lock-alert'
    } else if (error?.response?.status === 400) {
      // Handle validation errors from the backend
      errorMessage = error?.response?.data?.message || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
      errorIcon = 'mdi-form-select'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error?.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error?.message) {
      errorMessage = error.message
    }
    
    showSnackbar(errorMessage, 'error', errorIcon)
    confirmDialog.value.show = false
    
  } finally {
    transferLoading.value = false
  }
}

const formatCurrency = (value: number | string): string => {
  const numValue = Number(value || 0)
  return numValue.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// Helper function to get currency color for chips
const getCurrencyColor = (currency: string): string => {
  const colors: Record<string, string> = {
    'LAK': 'primary',
    'USD': 'success', 
    'THB': 'warning',
    'EUR': 'info',
    'JPY': 'secondary'
  }
  return colors[currency] || 'grey'
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = {
    show: true,
    message,
    color,
    icon
  }
}

// Updated exportToExcel function to handle currency display
const exportToExcel = () => {
  try {
    if (!results.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    // Prepare data for export with normalized field names
    const exportData = results.value.map(item => {
      const baseData: any = {
        'GL Code': item.GL,
        'ລາຍລະອຽດ (Description)': item._Desc
      }

      // Add Currency column for All Currency view
      if (isAllCurrency.value) {
        baseData['Currency'] = item.Currency
      }

      // Add amount columns (using normalized field names)
      baseData['Opening Dr'] = Number(item.Opening_Dr || 0)
      baseData['Opening Cr'] = Number(item.Opening_Cr || 0)
      baseData['Flow Dr'] = Number(item.Flow_Dr || 0)
      baseData['Flow Cr'] = Number(item.Flow_Cr || 0)
      baseData['Closing Dr'] = Number(item.Closing_Dr || 0)
      baseData['Closing Cr'] = Number(item.Closing_Cr || 0)

      return baseData
    })

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Auto-width columns
    const colWidths = []
    colWidths[0] = { wch: 12 } // GL Code
    colWidths[1] = { wch: 40 } // Description
    
    let columnIndex = 2
    if (isAllCurrency.value) {
      colWidths[columnIndex] = { wch: 10 } // Currency column
      columnIndex++
    }
    
    // Amount columns
    for (let i = columnIndex; i < columnIndex + 6; i++) {
      colWidths[i] = { wch: 15 }
    }
    ws['!cols'] = colWidths

    // Dynamic currency display for export
    const currencyDisplay = currentCurrencyDisplay.value
    
    // Add title row
    XLSX.utils.sheet_add_aoa(ws, [
      [`ລາຍງານໃບສົມທົບ (Trial Balance) - ສະກຸນເງິນ: ${currencyDisplay}`],
      [`ວັນທີ: ${filters.value.date_start} ຫາ ${filters.value.date_end}`],
      [''] // Empty row
    ], { origin: 'A1' })

    // Adjust data range
    XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A4' })

    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance')

    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `Trial_Balance_${currencyDisplay}_${currentDate}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)

    showSnackbar(
      `ສົ່ງອອກຂໍ້ມູນສຳເລັດ (${currencyDisplay}) - ${results.value.length} ລາຍການ`, 
      'success', 
      'mdi-download'
    )

  } catch (error) {
    console.error('Export error:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກຂໍ້ມູນ', 'error', 'mdi-alert-circle')
  }
}

// Initialize component
onMounted(() => {
  // Auto-load data if token exists
  const token = localStorage.getItem("token")
  if (token) {
    fetchTrialBalance()
  } else {
    showSnackbar('ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
  }
})
</script>

<style scoped>
/* Professional font styling */
.font-mono {
  font-family: 'Roboto Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
}

/* Table styling */
.professional-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.full-width-table {
  width: 100% !important;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.amount-cell {
  padding: 2px 6px;
  border-radius: 3px;
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  font-size: 0.8rem;
}

/* Deep styling for Vuetify components */
.professional-table :deep(.v-data-table__td) {
  padding: 8px 12px !important;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  font-size: 0.875rem;
}

.professional-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #37474f;
  font-size: 0.8rem;
}

.professional-table :deep(.v-data-table__thead > tr > th) {
  background-color: #fafafa;
  border-bottom: 2px solid #e0e0e0;
  padding: 8px 12px !important;
  height: 48px !important;
}

/* Card styling */
.v-card-title {
  border-radius: 4px 4px 0 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

/* Responsive improvements */
@media (max-width: 960px) {
  .font-mono {
    font-size: 0.7rem;
  }
  
  .amount-cell {
    padding: 1px 4px;
    font-size: 0.75rem;
  }

  .professional-table :deep(.v-data-table__td) {
    padding: 6px 8px !important;
    font-size: 0.8rem;
  }

  .professional-table :deep(.v-data-table__thead > tr > th) {
    padding: 6px 8px !important;
    height: 40px !important;
  }
}

/* Animation for loading */
.v-skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>