<template>
  <v-container fluid class="pa-6">
    <v-card class="mx-auto" max-width="1400" elevation="0" style="border: 1px solid #e0e0e0;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%); color: white;">
        <v-icon start size="24">mdi-scale-balance</v-icon>
        <span class="text-h6 font-weight-medium">ລາຍງານໃບສົມດຸນ (Balance Sheet)</span>
      </v-card-title>
      
      <v-card-text class="px-6 py-4">
        <!-- Filter Form -->
        <v-form @submit.prevent="fetchBalanceSheet" class="mb-4">
          <v-row no-gutters class="mb-4">
            <v-col cols="12" md="4" class="pe-md-2 mb-3 mb-md-0">
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
            
            <v-col cols="12" md="4" class="px-md-2 mb-3 mb-md-0">
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

            <v-col cols="12" md="4" class="ps-md-2 d-flex gap-2">
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

        <!-- Summary Cards -->
        <v-row v-if="summaryStats.totalAssets > 0" class="mb-4">
          <v-col cols="12" md="4">
            <v-card class="text-center" elevation="2" color="blue-lighten-5">
              <v-card-text class="py-3">
                <div class="text-h6 text-blue-darken-2 font-weight-bold">ຊັບສິນລວມ</div>
                <div class="text-h5 text-blue-darken-3">{{ formatCurrency(summaryStats.totalAssets) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="text-center" elevation="2" color="orange-lighten-5">
              <v-card-text class="py-3">
                <div class="text-h6 text-orange-darken-2 font-weight-bold">ໜີ້ສິນລວມ</div>
                <div class="text-h5 text-orange-darken-3">{{ formatCurrency(summaryStats.totalLiabilities) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="text-center" elevation="2" color="green-lighten-5">
              <v-card-text class="py-3">
                <div class="text-h6 text-green-darken-2 font-weight-bold">ທຶນລວມ</div>
                <div class="text-h5 text-green-darken-3">{{ formatCurrency(summaryStats.totalEquity) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Balance Sheet Table -->
        <v-card elevation="0" class="balance-sheet-table">
          <v-card-title class="px-4 py-3 bg-grey-lighten-5">
            <div class="d-flex justify-space-between align-center w-100">
              <div class="text-h6 font-weight-medium">
                ລາຍງານໃບສົມດຸນ - {{ results.length }} ລາຍການ
              </div>
              <v-text-field
                v-model="searchText"
                label="ຄົ້ນຫາ"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                style="max-width: 250px;"
                hide-details
                clearable
              />
            </div>
          </v-card-title>

          <v-card-text class="pa-0">
            <v-data-table
              :headers="headers"
              :items="filteredResults"
              :loading="loading"
              class="balance-sheet-data-table"
              density="compact"
              disable-pagination
              hide-default-footer
              :search="searchText"
            >
              <!-- Loading State -->
              <template #loading>
                <v-skeleton-loader type="table-row@15" />
              </template>
              
              <!-- Custom Row Template -->
              <template #item="{ item }">
                <tr :class="getRowClass(item)">
                  <td class="text-center">
                    <span class="text-body-2">{{ item.rno }}</span>
                  </td>
                  <td class="text-start">
                    <span :class="getTextClass(item)">{{ item.r_no }}</span>
                  </td>
                  <td class="text-start" style="white-space: pre;">
                    <span :class="getTextClass(item)">{{ item._desc }}</span>
                  </td>
                  <td class="text-end font-mono">
                    <span :class="getAmountClass(item)">
                      {{ formatCurrency(item.PM) }}
                    </span>
                  </td>
                </tr>
              </template>

              <!-- Empty State -->
              <template #no-data>
                <div class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-scale-balance</v-icon>
                  <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
                  <div class="text-body-2 text-grey">ກະລຸນາປັບປຸງເງື່ອນໄຂການຄົ້ນຫາແລ້ວລອງໃໝ່</div>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
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
import { ref, computed, onMounted } from 'vue'
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
const searchText = ref('')

const filters = ref({
  date_start: new Date().toISOString().split('T')[0],
  date_end: new Date().toISOString().split('T')[0]
})

const results = ref([])

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Table headers
const headers = [
  { 
    title: 'ລຳດັບ', 
    key: 'rno', 
    width: '80px',
    sortable: false
  },
  { 
    title: 'ລະຫັດ', 
    key: 'r_no', 
    width: '120px',
    sortable: false
  },
  { 
    title: 'ລາຍລະອຽດ', 
    key: '_desc', 
    width: '500px',
    sortable: false
  },
  { 
    title: 'ຈຳນວນເງິນ (LAK)', 
    key: 'PM', 
    width: '200px', 
    align: 'end',
    sortable: false
  }
]

// Computed properties for filtering and summary
const filteredResults = computed(() => {
  if (!searchText.value) return results.value
  
  return results.value.filter(item => 
    item._desc?.toLowerCase().includes(searchText.value.toLowerCase()) ||
    item.r_no?.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const summaryStats = computed(() => {
  // Calculate summary statistics
  const assets = results.value.find(item => item.r_no === '1')
  const liabilitiesAndEquity = results.value.find(item => item.r_no === '2')
  
  // Find equity items (usually items with r_no starting with "2.6")
  const equityItems = results.value.filter(item => 
    item.r_no && item.r_no.startsWith('2.6')
  )
  const totalEquity = equityItems.reduce((sum, item) => sum + (item.PM || 0), 0)
  
  return {
    totalAssets: assets?.PM || 0,
    totalLiabilities: (liabilitiesAndEquity?.PM || 0) - totalEquity,
    totalEquity: totalEquity
  }
})

// Helper functions for styling
const getRowClass = (item: any): string => {
  const rNo = item.r_no || ''
  if (rNo === '1' || rNo === '2') {
    return 'main-category-row'
  } else if (rNo.includes('.') && rNo.split('.').length === 2) {
    return 'sub-category-row'
  }
  return 'detail-row'
}

const getTextClass = (item: any): string => {
  const rNo = item.r_no || ''
  if (rNo === '1' || rNo === '2') {
    return 'text-subtitle-1 font-weight-bold text-primary'
  } else if (rNo.includes('.') && rNo.split('.').length === 2) {
    return 'text-body-1 font-weight-medium text-blue-darken-1'
  }
  return 'text-body-2'
}

const getAmountClass = (item: any): string => {
  const rNo = item.r_no || ''
  const amount = item.PM || 0
  
  if (rNo === '1' || rNo === '2') {
    return 'text-subtitle-1 font-weight-bold text-primary amount-cell-main'
  } else if (rNo.includes('.') && rNo.split('.').length === 2) {
    return 'text-body-1 font-weight-medium amount-cell-sub'
  } else if (amount < 0) {
    return 'text-body-2 text-red amount-cell-negative'
  }
  return 'text-body-2 amount-cell'
}

// Methods
const fetchBalanceSheet = async () => {
  try {
    loading.value = true
    
    // Validate token exists
    const token = localStorage.getItem("token")
    if (!token) {
      showSnackbar('ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ', 'error', 'mdi-alert-circle')
      return
    }

    // Validate form data
    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາຕື່ມຂໍ້ມູນວັນທີໃຫ້ຄົບຖ້ວນ', 'warning', 'mdi-alert')
      return
    }

    const payload = {
      date_start: filters.value.date_start,
      date_end: filters.value.date_end
    }
    
    const { data } = await axios.post('/api/balance-sheet/', payload, getAuthHeaders())
    
    results.value = data.data || []
    
    showSnackbar(
      `ດຶງຂໍ້ມູນໃບສົມດຸນສຳເລັດ - ພົບ ${results.value.length} ລາຍການ`, 
      'success', 
      'mdi-check-circle'
    )
    
  } catch (error) {
    console.error('Error fetching balance sheet:', error)
    
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

const formatCurrency = (value: number | string): string => {
  const numValue = Number(value || 0)
  
  return numValue.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = {
    show: true,
    message,
    color,
    icon
  }
}

const exportToExcel = () => {
  try {
    if (!results.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    // Prepare data for export
    const exportData = results.value.map(item => ({
      'ລຳດັບ': item.rno,
      'ລະຫັດ': item.r_no,
      'ລາຍລະອຽດ': item._desc,
      'ຈຳນວນເງິນ (LAK)': Number(item.PM || 0)
    }))

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Auto-width columns
    const colWidths = [
      { wch: 8 },  // ລຳດັບ
      { wch: 15 }, // ລະຫັດ
      { wch: 60 }, // ລາຍລະອຽດ  
      { wch: 20 }  // ຈຳນວນເງິນ
    ]
    ws['!cols'] = colWidths

    // Add title rows
    XLSX.utils.sheet_add_aoa(ws, [
      [`ລາຍງານໃບສົມດຸນ (Balance Sheet)`],
      [`ວັນທີ: ${filters.value.date_start} ຫາ ${filters.value.date_end}`],
      [`ຊັບສິນລວມ: ${formatCurrency(summaryStats.value.totalAssets)}`],
      [`ໜີ້ສິນລວມ: ${formatCurrency(summaryStats.value.totalLiabilities)}`],
      [`ທຶນລວມ: ${formatCurrency(summaryStats.value.totalEquity)}`],
      [''] // Empty row
    ], { origin: 'A1' })

    // Adjust data range
    XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A7' })

    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet')

    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `Balance_Sheet_${currentDate}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)

    showSnackbar(
      `ສົ່ງອອກຂໍ້ມູນສຳເລັດ - ${results.value.length} ລາຍການ`, 
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
    fetchBalanceSheet()
  } else {
    showSnackbar('ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
  }
})
</script>

<style scoped>
/* Professional styling */
.balance-sheet-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.balance-sheet-data-table {
  background: white;
}

/* Row styling based on hierarchy */
.main-category-row {
  background: #f5f5f5 !important;
  border-top: 2px solid #1976D2;
  border-bottom: 1px solid #1976D2;
}

.sub-category-row {
  background: #fafafa !important;
  border-left: 3px solid #1976D2;
}

.detail-row {
  background: white;
  transition: background-color 0.2s ease;
}

.detail-row:hover {
  background: #f8f9fa !important;
}

/* Amount cell styling */
.amount-cell-main {
  background: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #1976D2;
  font-weight: bold !important;
}

.amount-cell-sub {
  background: #f3e5f5;
  padding: 3px 6px;
  border-radius: 3px;
  border: 1px solid #7b1fa2;
  font-weight: 500 !important;
}

.amount-cell {
  padding: 2px 4px;
  border-radius: 2px;
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
}

.amount-cell-negative {
  background: #ffebee;
  border: 1px solid #d32f2f;
  color: #d32f2f !important;
  font-weight: 500 !important;
}

/* Table styling */
.balance-sheet-data-table :deep(.v-data-table__td) {
  padding: 8px 12px !important;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  font-size: 0.875rem;
}

.balance-sheet-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #37474f;
  font-size: 0.85rem;
}

.balance-sheet-data-table :deep(.v-data-table__thead > tr > th) {
  background-color: #fafafa;
  border-bottom: 2px solid #e0e0e0;
  padding: 12px !important;
  height: 50px !important;
}

/* Font styling */
.font-mono {
  font-family: 'Roboto Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Ubuntu Mono', monospace;
}

/* Responsive design */
@media (max-width: 960px) {
  .balance-sheet-data-table :deep(.v-data-table__td) {
    padding: 6px 8px !important;
    font-size: 0.8rem;
  }

  .balance-sheet-data-table :deep(.v-data-table__thead > tr > th) {
    padding: 8px !important;
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