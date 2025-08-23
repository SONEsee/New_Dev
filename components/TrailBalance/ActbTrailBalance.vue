<template>
  <v-container fluid class="pa-2">
    <v-card class="mx-auto" elevation="0" style="border: 1px solid #e0e0e0;">
      <!-- Header Section -->
      <v-card-title class="px-4 py-3 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
        <v-icon start size="24">mdi-chart-box-outline</v-icon>
        <span class="text-h6 font-weight-medium">
          ລາຍງານໃບສົມທົບ - DairyReport
          {{ selectedCurrency ? `${selectedCurrency} (FCY)` : 'LCY Consolidated' }}
        </span>
      </v-card-title>
      
      <v-card-text class="px-4 py-3">
        <!-- Filter Form -->
        <v-form @submit.prevent="fetchTrialBalance" class="mb-3">
          <v-row no-gutters class="mb-3">
            <!-- Currency Selection -->
            <v-col cols="12" md="3" class="pe-md-2 mb-2 mb-md-0">
              <v-select
                v-model="filters.currency"
                :items="currencyOptions"
                label="ເລືອກສະກຸນເງິນ"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-currency-usd"
                hide-details="auto"
                clearable
                @update:model-value="onCurrencyChange"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :icon="item.raw.icon" size="20" />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            
            <v-col cols="12" md="3" class="px-md-1 mb-2 mb-md-0">
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
            
            <v-col cols="12" md="3" class="px-md-1 mb-2 mb-md-0">
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

            <v-col cols="12" md="3" class="ps-md-2 d-flex gap-1">
              <v-btn
                type="submit"
                color="primary"
                prepend-icon="mdi-magnify"
                :loading="loading"
                class="flex-grow-1"
                density="compact"
                style="height: 40px;"
              >
                ຄົ້ນຫາ
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

          <!-- Additional Export Buttons Row -->
          <v-row no-gutters>
            <v-col cols="12" class="d-flex gap-2 justify-end">
              <v-btn
                color="warning"
                prepend-icon="mdi-database-export"
                :disabled="!results.length || loading"
                @click="exportToDairyReport"
                density="compact"
                style="height: 40px;"
              >
                Dairy Report
              </v-btn>

              <v-btn
                color="info"
                prepend-icon="mdi-paperclip-outline"
                :disabled="!results.length || loading"
                @click="exportToSOmTopReport"
                density="compact"
                style="height: 40px;"
              >
                SomTop Report
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-divider class="mb-3" thickness="1" color="grey-lighten-3" />

        <!-- Table Info Bar -->
        <div class="d-flex justify-space-between align-center mb-3 pa-3 bg-grey-lighten-5 rounded">
          <div class="text-h6 font-weight-medium">
            ຜົນການຄົ້ນຫາ: {{ results.length }} ລາຍການ
            <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
              {{ chipText }}
            </v-chip>
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

        <!-- Custom Table Implementation -->
        <div class="custom-table-container">
          <table class="custom-trial-balance-table">
            <!-- Table Header -->
            <thead>
              <!-- Main Group Headers -->
              <tr class="main-header-row">
                <th rowspan="2" class="header-cell sticky-column account-code-header">
                  <div class="header-content-center">ເລກບັນຊີ</div>
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
              </tr>
              <!-- Sub Headers -->
              <tr class="sub-header-row">
                <th class="header-cell sub-header">Dr ({{ currencyCode }})</th>
                <th class="header-cell sub-header">Cr ({{ currencyCode }})</th>
                <th class="header-cell sub-header">Dr ({{ currencyCode }})</th>
                <th class="header-cell sub-header">Cr ({{ currencyCode }})</th>
                <th class="header-cell sub-header">Dr ({{ currencyCode }})</th>
                <th class="header-cell sub-header">Cr ({{ currencyCode }})</th>
              </tr>
            </thead>
            
            <!-- Table Body -->
            <tbody>
              <tr v-if="loading">
                <td colspan="8" class="text-center pa-8">
                  <v-progress-circular indeterminate color="primary" />
                  <div class="mt-3">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
                </td>
              </tr>
              
              <tr v-else-if="!results.length">
                <td colspan="8" class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-table-off</v-icon>
                  <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
                  <div class="text-body-2 text-grey">ກະລຸນາປັບປຸງເງື່ອນໄຂການຄົ້ນຫາແລ້ວລອງໃໝ່</div>
                </td>
              </tr>
              
              <!-- Data Rows -->
              <tr 
                v-for="(item, index) in filteredResults" 
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
                <!-- Flow Dr/Cr -->
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Flow_Dr) }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value">{{ formatCurrency(item.Flow_Cr) }}</span>
                </td>
                <!-- Closing Dr/Cr -->
                <td class="data-cell amount-cell">
                  <span class="amount-value text-success">{{ formatCurrency(item.Closing_Dr) }}</span>
                </td>
                <td class="data-cell amount-cell">
                  <span class="amount-value text-error">{{ formatCurrency(item.Closing_Cr) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Snackbar for notifications -->
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
import { ref, computed, onMounted } from 'vue'
import axios from '@/helpers/axios'
import * as XLSX from 'xlsx'

const activeTab = ref('somtop_trial')

// Type definitions
interface TrialBalanceItem {
  GL_Code: string
  Description: string
  Opening_Dr: number
  Opening_Cr: number
  Flow_Dr: number
  Flow_Cr: number
  Closing_Dr: number
  Closing_Cr: number
}

// State
const loading = ref(false)
const searchText = ref('')
const results = ref<TrialBalanceItem[]>([])

const filters = ref({
  currency: null as string | null,
  date_start: new Date().toISOString().split('T')[0],
  date_end: new Date().toISOString().split('T')[0]
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Currency options
const currencyOptions = [
  {
    title: 'ທຽບເທົ່າກັບ (LCY)',
    value: 'LCY',
    icon: 'mdi-currency-kzt'
  },
  {
    title: 'ກີບລາວ (LAK)',
    value: 'LAK',
    icon: 'mdi-currency-kzt'
  },
  {
    title: 'ໂດລາສະຫະລັດ (USD)',
    value: 'USD',
    icon: 'mdi-currency-usd'
  },
  {
    title: 'ບາດໄທ (THB)',
    value: 'THB',
    icon: 'mdi-currency-jpy'
  }
]

// Computed
const selectedCurrency = computed(() => filters.value.currency)
const currencyCode = computed(() => selectedCurrency.value || 'LAK')

const chipColor = computed(() => {
  if (!selectedCurrency.value) return 'primary'
  const colors: Record<string, string> = { 
    LAK: 'success', 
    USD: 'info', 
    THB: 'warning' 
  }
  return colors[selectedCurrency.value] || 'primary'
})

const chipText = computed(() =>
  selectedCurrency.value ? `${selectedCurrency.value} (FCY)` : 'Consolidated LCY (LAK)'
)

// Filter results based on search
const filteredResults = computed(() => {
  if (!searchText.value) return results.value
  
  const search = searchText.value.toLowerCase()
  return results.value.filter(item => 
    item.GL_Code.toLowerCase().includes(search) ||
    item.Description.toLowerCase().includes(search)
  )
})

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) throw new Error('Authentication token not found')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}

const formatCurrency = (value: number | string | undefined): string => {
  const numValue = Number(value || 0)
  if (numValue === 0) return '-'
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// API functions
const normalizeTrialBalanceData = (data: any[], isConsolidated: boolean = false): TrialBalanceItem[] => {
  return data.map(item => ({
    GL_Code: item.GL_Code || item.GL || '',
    Description: item.Description || item._Desc || '',
    Opening_Dr: Number(isConsolidated ? (item.Opening_Dr_LAK || item.Opening_Dr || 0) : (item.Opening_Dr || 0)),
    Opening_Cr: Number(isConsolidated ? (item.Opening_Cr_LAK || item.Opening_Cr || 0) : (item.Opening_Cr || 0)),
    Flow_Dr: Number(isConsolidated ? (item.Flow_Dr_LAK || item.Flow_Dr || 0) : (item.Flow_Dr || 0)),
    Flow_Cr: Number(isConsolidated ? (item.Flow_Cr_LAK || item.Flow_Cr || 0) : (item.Flow_Cr || 0)),
    Closing_Dr: Number(isConsolidated ? (item.Closing_Dr_LAK || item.Closing_Dr || 0) : (item.Closing_Dr || 0)),
    Closing_Cr: Number(isConsolidated ? (item.Closing_Cr_LAK || item.Closing_Cr || 0) : (item.Closing_Cr || 0))
  }))
}

const fetchTrialBalance = async () => {
  try {
    loading.value = true

    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາຕື່ມຂໍ້ມູນວັນທີໃຫ້ຄົບຖ້ວນ', 'warning', 'mdi-alert')
      return
    }

    const isConsolidated = !selectedCurrency.value || selectedCurrency.value === 'LCY'
    let endpoint: string
    let payload: any

    if (isConsolidated) {
      endpoint = '/api/trial-balance/consolidated/'
      payload = {
        date_start: filters.value.date_start,
        date_end: filters.value.date_end
      }
    } else {
      endpoint = '/api/trial-balance/fcy/'
      payload = {
        ac_ccy_id: selectedCurrency.value,
        date_start: filters.value.date_start,
        date_end: filters.value.date_end
      }
    }

    const { data } = await axios.post(endpoint, payload, getAuthHeaders())
    
    if (data.status === 'success' && Array.isArray(data.data)) {
      results.value = normalizeTrialBalanceData(data.data, isConsolidated)
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນສຳເລັດ - ພົບ ${results.value.length} ລາຍການ`,
        'success',
        'mdi-check-circle'
      )
    } else {
      results.value = []
      showSnackbar('ບໍ່ພົບຂໍ້ມູນ', 'warning', 'mdi-alert')
    }

  } catch (error: any) {
    console.error('Fetch error:', error)
    results.value = []
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const onCurrencyChange = () => {
  results.value = []
  if (filters.value.date_start && filters.value.date_end) {
    fetchTrialBalance()
  }
}

const exportToExcel = () => {
  try {
    if (!results.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    const exportData = results.value.map(item => ({
      'GL Code': item.GL_Code,
      'Description': item.Description,
      [`Opening Dr (${currencyCode.value})`]: item.Opening_Dr,
      [`Opening Cr (${currencyCode.value})`]: item.Opening_Cr,
      [`Flow Dr (${currencyCode.value})`]: item.Flow_Dr,
      [`Flow Cr (${currencyCode.value})`]: item.Flow_Cr,
      [`Closing Dr (${currencyCode.value})`]: item.Closing_Dr,
      [`Closing Cr (${currencyCode.value})`]: item.Closing_Cr
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    ws['!cols'] = [
      { wch: 15 }, { wch: 40 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }
    ]

    XLSX.utils.book_append_sheet(wb, ws, `Trial Balance`)
    
    const filename = `Trial_Balance_${currencyCode.value}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)

    showSnackbar('📊 ສົ່ງອອກສຳເລັດ', 'success', 'mdi-download')

  } catch (error) {
    console.error('Export error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ', 'error', 'mdi-alert-circle')
  }
}

const exportToDairyReport = async () => {
  try {
    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
      return
    }

    const today = new Date()
    const finYear = today.getFullYear().toString()
    const payload = {
      date_start: filters.value.date_start,
      date_end: filters.value.date_end,
      fin_year: finYear,
      period_code: '',
      category: 'TRIAL_BALANCE'
    }

    const { data } = await axios.post('/api/dairy-reports/bulk-insert/', payload, getAuthHeaders())

    if (data.status === 'success') {
      showSnackbar('✅ ສົ່ງອອກ Dairy Report ສຳເລັດ', 'success', 'mdi-check-circle')
    } else {
      showSnackbar(data.message || 'ບໍ່ສາມາດສົ່ງອອກ Dairy Report', 'error', 'mdi-alert-circle')
    }
  } catch (error: any) {
    console.error('Export Dairy Report error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການ Export Dairy Report', 'error', 'mdi-alert-circle')
  }
}

const exportToSOmTopReport = async () => {
  try {
    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
      return
    }

    const today = new Date()
    const finYear = today.getFullYear().toString()
    const payload = {
      date_start: filters.value.date_start,
      date_end: filters.value.date_end,
      fin_year: finYear,
      period_code: '',
      category: 'SOMTOP_TRIAL_BALANCE'
    }

    const { data } = await axios.post('/api/somtop_trail_balance-report/bulk-insert/', payload, getAuthHeaders())

    if (data.status === 'success') {
      showSnackbar('✅ ສົ່ງອອກ SomTop Report ສຳເລັດ', 'success', 'mdi-check-circle')
    } else {
      showSnackbar(data.message || 'ບໍ່ສາມາດສົ່ງອອກ SomTop Report', 'error', 'mdi-alert-circle')
    }
  } catch (error: any) {
    console.error('Export SomTop Report error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການ Export SomTop Report', 'error', 'mdi-alert-circle')
  }
}

// Initialize
onMounted(() => {
  const token = localStorage.getItem("token")
  if (token) {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    filters.value.date_start = firstDay.toISOString().split('T')[0]
    filters.value.date_end = today.toISOString().split('T')[0]
    
    fetchTrialBalance()
  } else {
    showSnackbar('🔑 ກະລຸນາເຂົ້າສູ່ລະບົບ', 'warning', 'mdi-account-alert')
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
  min-width: 1000px;
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
  text-align: center;
  font-weight: 500;
  background: white;
}

.gl-code-content {
  display: flex;
  align-items: center;
  justify-content: center;
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
}

@media (max-width: 960px) {
  .custom-trial-balance-table {
    font-size: 0.75rem;
    min-width: 900px;
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
}

@media (max-width: 600px) {
  .custom-table-container {
    border-radius: 4px;
  }
  
  .custom-trial-balance-table {
    font-size: 0.7rem;
    min-width: 800px;
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