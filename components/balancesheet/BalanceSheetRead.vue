<template>
  <v-container fluid class="pa-6">
    <v-card class="mx-auto" max-width="1400" elevation="0" style="border: 1px solid #e0e0e0;">
      <!-- Header -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
        <v-icon start size="24">mdi-file-document-outline</v-icon>
        <span class="text-h6 font-weight-medium text-styles">
          ລາຍງານໃບລາຍງານຖານະການເງິນ (Balance Sheet) - 
          {{ selectedSegment }} {{ selectedCurrency }}
        </span>
      </v-card-title>
      
      <v-card-text class="px-6 py-4">
        <!-- Filter Form -->
        <v-form @submit.prevent="fetchBalanceSheet" class="mb-4">
          <v-row no-gutters class="mb-4">
            <!-- Segment Selection -->
            <v-col cols="12" md="4" class="pe-md-2 mb-3 mb-md-0">
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
            <v-col cols="12" md="4" class="px-md-1 mb-3 mb-md-0">
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

            <!-- Action Buttons -->
            <v-col cols="12" md="4" class="ps-md-2 d-flex gap-1">
              <v-btn
                type="submit"
                color="primary"
                prepend-icon="mdi-magnify"
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
                style="height: 40px;"
              >
                Excel
              </v-btn>
              <v-btn
                color="info"
                prepend-icon="mdi-compare"
                :disabled="selectedSegment !== 'FCY' || loading"
                @click="compareSegments"
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
          :items="balanceSheetData"
          :items-per-page="25"
          :loading="loading"
          class="elevation-0 professional-table"
          density="compact"
          hover
          show-current-page
        >
          <!-- Loading State -->
          <template #loading>
            <v-skeleton-loader type="table-row@10" />
          </template>
          
          <!-- Table Top Actions -->
          <template #top>
            <div class="d-flex justify-space-between align-center pa-4 bg-grey-lighten-5">
              <div class="text-h6 font-weight-medium text-styles">
                ຜົນການຄົ້ນຫາ: {{ balanceSheetData.length }} ລາຍການ
                <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
                  {{ chipText }}
                </v-chip>
              </div>
            </div>
          </template>
          
          <!-- Custom Row Template -->
          <template #item="{ item }">
            <tr
              class="table-row"
              :class="[
                (item.description === 'ລາຍການໜີ້ສິນ ແລະທືນ' || item.description === 'ລວມຍອດຊັບສິນ')
                  ? 'highlight-blue-row'
                  : ''
              ]"
            >
              <!-- <td class="text-center">{{ item.no }}</td> -->
              <!-- <td class="font-weight-medium text-primary">{{ item.report_number }}</td> -->
              <td
                class="text-truncate"
                :title="item.description"
                :class="[
                  (
                    item.description === 'ລາຍການໜີ້ສິນ ແລະທືນ' ||
                    item.description === 'ລວມຍອດຊັບສິນ' ||
                    // /(^|[^A-Z])I($|[^A-Z])|III|IV/.test(item.description)
                    /\b(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)\b/.test(item.description)
                  )
                    ? 'font-weight-bold'
                    : ''
                ]"
              >
                {{ item.description }}
              </td>
              
              <td class="text-end font-mono">
                <span class="amount-cell" :class="getNetAmountClass(item.net_amount)">
                  {{ formatCurrency(item.net_amount) }}
                </span>
              </td>
              <td class="text-end font-mono">
                <span class="amount-cell positive">{{ formatCurrency(item.currency_display) }}</span>
              </td>
            </tr>
          </template>

          <!-- Empty State -->
          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-file-document-off</v-icon>
              <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
              <div class="text-body-2 text-grey">ກະລຸນາເລືອກ segment ແລະ currency ແລ້ວກົດດຶງຂໍ້ມູນ</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
      location="top"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from '@/helpers/axios'
import * as XLSX from 'xlsx'

// Types
interface BalanceSheetItem {
  no: number
  report_number: string
  description: string
  debit_amount: number
  credit_amount: number
  net_amount: number
  currency_display: string
  segment_type: string
}

// Authentication helper
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

// Reactive state
const loading = ref(false)
const selectedSegment = ref('')
const selectedCurrency = ref('')
const balanceSheetData = ref<BalanceSheetItem[]>([])
const supportedOptions = ref<any>(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Segment options
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
  if (!selectedSegment.value || !supportedOptions.value) return []
  
  const segment = supportedOptions.value.segments.find(s => s.value === selectedSegment.value)
  if (!segment) return []
  
  return segment.currencies.map(currency => ({
    title: supportedOptions.value.currencies[currency] || currency,
    value: currency,
    subtitle: currency,
    icon: currency === 'LAK' ? 'mdi-currency-kzt' : 'mdi-currency-usd'
  }))
})

// Dynamic chip display
const chipColor = computed(() => {
  if (selectedSegment.value === 'FCY') return 'info'
  if (selectedSegment.value === 'LCY') return 'success'
  return 'primary'
})

const chipText = computed(() => {
  if (!selectedSegment.value || !selectedCurrency.value) return 'ເລືອກຕົວເລືອກ'
  return `${selectedSegment.value} - ${selectedCurrency.value}`
})

// Table headers
const headers = [
  // { title: 'ລຳດັບ', key: 'no', width: '80px', sortable: true, align: 'center' },
  // { title: 'ເລກລາຍງານ', key: 'report_number', width: '120px', sortable: true },
  { title: 'ລາຍລະອຽດ', key: 'description', width: '300px', sortable: true },
  // { title: 'ຍອດເດບິດ', key: 'debit_amount', width: '150px', align: 'end', sortable: true },
  // { title: 'ຍອດເຄຣດິດ', key: 'credit_amount', width: '150px', align: 'end', sortable: true },
  { title: 'ຍອດສຸດທິ', key: 'net_amount', width: '150px', align: 'center', sortable: true },
  {title: 'ສະກຸນເງິນ', key: 'currency_display', width: '100px', align: 'center', sortable: true },
]

// API calls
const fetchBalanceSheet = async () => {
  if (!selectedSegment.value || !selectedCurrency.value) {
    showSnackbar('ກະລຸນາເລືອກ segment ແລະ currency', 'warning')
    return
  }

  try {
    loading.value = true
    
    const response = await axios.post('/api/balance-sheet/', {
      segment: selectedSegment.value,
      currency: selectedCurrency.value,
      ordering: 'no'
    }, getAuthHeaders())
    
    balanceSheetData.value = response.data.data
    
    showSnackbar(
      `✅ ດຶງຂໍ້ມູນໃບສົມທົບສຳເລັດ - ${response.data.display_currency} (${balanceSheetData.value.length} ລາຍການ)`,
      'success'
    )
    
  } catch (error: any) {
    console.error('Balance Sheet Error:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນໃບສົມທົບ'
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    showSnackbar(errorMessage, 'error')
    balanceSheetData.value = []
  } finally {
    loading.value = false
  }
}

const loadSupportedOptions = async () => {
  try {
    const response = await axios.get('/api/balance-sheet/supported_segments/', getAuthHeaders())
    supportedOptions.value = response.data.data
  } catch (error) {
    console.error('Error loading supported options:', error)
  }
}

const compareSegments = async () => {
  if (!selectedCurrency.value || selectedSegment.value !== 'FCY') return
  
  try {
    loading.value = true
    
    const response = await axios.post('/api/balance-sheet/compare/', {
      currency: selectedCurrency.value
    }, getAuthHeaders())
    
    console.log('Comparison data:', response.data)
    showSnackbar(
      `✅ ສົມທຽບຂໍ້ມູນ FCY ແລະ LCY ສຳລັບ ${selectedCurrency.value} ສຳເລັດ`,
      'success'
    )
    
  } catch (error) {
    console.error('Compare error:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການສົມທຽບຂໍ້ມູນ', 'error')
  } finally {
    loading.value = false
  }
}

// Event handlers
const onSegmentChange = () => {
  selectedCurrency.value = ''
  balanceSheetData.value = []
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

const showSnackbar = (message: string, color: string = 'success') => {
  snackbar.value = { show: true, message, color }
}

const exportToExcel = () => {
  if (!balanceSheetData.value.length) {
    showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning')
    return
  }

  try {
    const exportData = balanceSheetData.value.map(item => ({
      'ລຳດັບ': item.no,
      // 'ເລກລາຍງານ': item.report_number,
      'ລາຍລະອຽດ': item.description,
      // 'ຍອດເດບິດ': item.debit_amount,
      // 'ຍອດເຄຣດິດ': item.credit_amount,
      'ຍອດສຸດທິ': item.net_amount,
      'ສະກຸນເງິນ': item.currency_display
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    ws['!cols'] = [
      { wch: 8 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet')

    const filename = `Balance_Sheet_${selectedSegment.value}_${selectedCurrency.value}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)

    showSnackbar(`📊 ສົ່ງອອກສຳເລັດ - ${balanceSheetData.value.length} ລາຍການ`, 'success')
  } catch (error) {
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ', 'error')
  }
}

// Initialize
onMounted(async () => {
  await loadSupportedOptions()
  
  // Set defaults
  selectedSegment.value = 'LCY'
  selectedCurrency.value = 'LAK'
})
</script>

<style scoped>
.professional-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
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

.font-mono {
  font-family: 'Roboto Mono', 'Consolas', monospace;
}

.highlight-blue-row {
  /* background: #e3f2fd !important; */
  background : linear-gradient(135deg, #59b4ff 0%, #e3f2fd 100%)
  /* background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); */
}
</style>