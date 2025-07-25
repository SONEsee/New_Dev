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
              <v-text-field
                v-model="filters.ac_ccy_id"
                label="ສະກຸນເງິນ (Currency)"
                placeholder="LAK, USD"
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
import { ref, onMounted } from 'vue'
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
  ac_ccy_id: 'LAK',
  date_start: '2023-01-01',
  date_end: new Date().toISOString().split('T')[0] // Current date
})

const results = ref([])

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Table configuration
const headers = [
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
  },
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

// Methods
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
    
    const { data } = await axios.post('/api/trial-balance/', filters.value, getAuthHeaders())
    
    results.value = data.data || []
    
    showSnackbar(
      `ດຶງຂໍ້ມູນສຳເລັດ - ພົບ ${results.value.length} ລາຍການ`, 
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
      'GL Code': item.GL,
      'ລາຍລະອຽດ (Description)': item._Desc,
      'Opening Dr': Number(item.Opening_Dr || 0),
      'Opening Cr': Number(item.Opening_Cr || 0),
      'Flow Dr': Number(item.Flow_Dr || 0),
      'Flow Cr': Number(item.Flow_Cr || 0),
      'Closing Dr': Number(item.Closing_Dr || 0),
      'Closing Cr': Number(item.Closing_Cr || 0)
    }))

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Auto-width columns
    const colWidths = []
    colWidths[0] = { wch: 12 } // GL Code
    colWidths[1] = { wch: 40 } // Description
    for (let i = 2; i < 8; i++) {
      colWidths[i] = { wch: 15 } // Amount columns
    }
    ws['!cols'] = colWidths

    // Add title row
    XLSX.utils.sheet_add_aoa(ws, [
      [`ລາຍງານໃບສົມທົບ (Trial Balance) - ສະກຸນເງິນ: ${filters.value.ac_ccy_id}`],
      [`ວັນທີ: ${filters.value.date_start} ຫາ ${filters.value.date_end}`],
      [''] // Empty row
    ], { origin: 'A1' })

    // Adjust data range
    XLSX.utils.sheet_add_json(ws, exportData, { origin: 'A4' })

    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance')

    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `Trial_Balance_${filters.value.ac_ccy_id}_${currentDate}.xlsx`

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