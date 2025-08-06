<template>
  <v-container fluid class="pa-6">
    <v-card class="mx-auto" max-width="1400" elevation="0" style="border: 1px solid #e0e0e0;">
      <!-- Header Section -->
      <v-card-title class="px-6 py-4 d-flex align-center" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <v-icon start size="24">mdi-chart-box-outline</v-icon>
        <span class="text-h6 font-weight-medium">
          ລາຍງານໃບສົມທົບ - 
          {{ selectedCurrency ? `${selectedCurrency} (FCY)` : 'LCY Consolidated' }}
        </span>
      </v-card-title>
      
      <v-card-text class="px-6 py-4">
        <!-- Filter Form -->
        <v-form @submit.prevent="fetchTrialBalance" class="mb-4">
          <v-row no-gutters class="mb-4">
            <!-- Currency Selection -->
            <v-col cols="12" md="3" class="pe-md-2 mb-3 mb-md-0">
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
                    <!-- <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.subtitle }}</v-list-item-subtitle> -->
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
            
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
              <v-text-field
                v-model="filters.date_start"
                label="ວັນທີເລີ່ມຕົ້ນ"
                type="date"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-start"
                hide-details="auto"
                :rules="[validateDate]"
              />
            </v-col>
            
            <v-col cols="12" md="3" class="px-md-1 mb-3 mb-md-0">
              <v-text-field
                v-model="filters.date_end"
                label="ວັນທີສິ້ນສຸດ"
                type="date"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-calendar-end"
                hide-details="auto"
                :rules="[validateDate]"
              />
            </v-col>

            <!-- Updated Button Section with Bulk Insert Button -->
              <v-col cols="12" md="3" class="ps-md-2 d-flex gap-1">
                <!-- Search Button -->
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

                <!-- Excel Export Button -->
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

                <!-- NEW: Bulk Insert Button -->
                <v-btn
                  color="warning"
                  prepend-icon="mdi-database-import"
                  :loading="bulkInsertLoading"
                  :disabled="loading || !filters.date_start || !filters.date_end"
                  @click="showBulkInsertDialog = true"
                  density="compact"
                  style="height: 40px;"
                  class="text-white"
                >
                  <span class="d-none d-sm-inline">Bulk</span>
                  <v-icon class="d-sm-none">mdi-database-import</v-icon>
                </v-btn>
              </v-col>
          </v-row>
        </v-form>

<!-- Dialog Insert Dairy Report  -->

<!-- ADD THIS DIALOG AFTER YOUR MAIN v-card ENDS -->
<!-- Bulk Insert Confirmation Dialog -->
<v-dialog v-model="showBulkInsertDialog" max-width="600" persistent>
  <v-card elevation="8">
    <!-- Dialog Header -->
    <v-card-title class="d-flex align-center pa-4" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white;">
      <v-icon start size="24">mdi-database-import</v-icon>
      <span class="text-h6">ການນຳເຂົ້າຂໍ້ມູນທັງໝົດ (Bulk Insert)</span>
    </v-card-title>
    
    <v-card-text class="pa-4">
      <!-- Warning Alert -->
      <v-alert type="warning" variant="tonal" class="mb-4" border="start">
        <template #prepend>
          <v-icon>mdi-alert-circle</v-icon>
        </template>
        <v-alert-title class="text-h6 mb-2">⚠️ ການເຮັດວຽກທີ່ສຳຄັນ</v-alert-title>
        <div class="text-body-2">
          <strong>ການດຳເນີນງານນີ້ຈະ:</strong><br>
          • ລຶບຂໍ້ມູນເກົ່າທັງໝົດໃນ Dairy_Report<br>
          • ນຳເຂົ້າຂໍ້ມູນໃໝ່ຈາກ 2 stored procedures<br>
          • <span class="text-red font-weight-bold">ບໍ່ສາມາດຍົກເລີກການດຳເນີນງານໄດ້</span>
        </div>
      </v-alert>
      
      <v-divider class="my-4" />
      
      <!-- Operation Details -->
      <div class="text-body-1 font-weight-medium mb-3">
        📋 ລາຍລະອຽດການດຳເນີນງານ:
      </div>
      
      <v-card variant="outlined" class="mb-4">
        <v-list density="compact" class="pa-0">
          <v-list-item>
            <template #prepend>
              <v-icon color="primary">mdi-calendar-range</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">ໄລຍະວັນທີ</v-list-item-title>
            <v-list-item-subtitle class="text-primary">
              {{ filters.date_start }} ຫາ {{ filters.date_end }}
            </v-list-item-subtitle>
          </v-list-item>
          
          <v-divider />
          
          <v-list-item>
            <template #prepend>
              <v-icon color="info">mdi-currency-usd</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">FCY Procedure</v-list-item-title>
            <v-list-item-subtitle class="font-mono">
              Somtop_Trail_Balance_All_Currency_fcy
            </v-list-item-subtitle>
          </v-list-item>
          
          <v-divider />
          
          <v-list-item>
            <template #prepend>
              <v-icon color="success">mdi-currency-kzt</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">LCY Procedure</v-list-item-title>
            <v-list-item-subtitle class="font-mono">
              Somtop_Trail_Balance_All_Currency_Consolidated_lcy
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
      
      <!-- Optional Settings -->
      <v-expansion-panels variant="accordion" class="mt-4">
        <v-expansion-panel>
          <v-expansion-panel-title>
            <template #default>
              <div class="d-flex align-center">
                <v-icon start>mdi-cog</v-icon>
                <span>ການຕັ້ງຄ່າເພີ່ມເຕີມ (Optional Settings)</span>
              </div>
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="pt-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="bulkInsertOptions.fin_year"
                  label="ປີງົບປະມານ"
                  density="compact"
                  variant="outlined"
                  placeholder="2025"
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="bulkInsertOptions.period_code"
                  label="ລະຫັດໄລຍະ"
                  density="compact"
                  variant="outlined"
                  placeholder="Optional"
                  prepend-inner-icon="mdi-timeline"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="bulkInsertOptions.category"
                  label="ໝວດໝູ່"
                  density="compact"
                  variant="outlined"
                  placeholder="TRIAL_BALANCE"
                  prepend-inner-icon="mdi-tag"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
    
    <!-- UPdater Dialog -->
    <!-- Dialog Actions -->
    <v-card-actions class="pa-4 bg-grey-lighten-5">
      <v-spacer />
      <v-btn 
        color="grey-darken-1"
        variant="outlined"
        @click="showBulkInsertDialog = false"
        :disabled="bulkInsertLoading"
        prepend-icon="mdi-close"
      >
        ຍົກເລີກ
      </v-btn>
      <v-btn 
        color="warning"
        variant="elevated"
        prepend-icon="mdi-database-import"
        :loading="bulkInsertLoading"
        @click="executeBulkInsert"
        class="text-white ml-2"
      >
        <span v-if="!bulkInsertLoading">ດຳເນີນການ</span>
        <span v-else>ກຳລັງປະມວນຜົນ...</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


        <v-divider class="mb-4" thickness="1" color="grey-lighten-3" />

        <!-- Data Table -->
        <v-data-table
          :headers="dynamicHeaders"
          :items="results"
          :items-per-page="20"
          :loading="loading"
          class="elevation-0 professional-table"
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
          </template>
          
          <!-- Custom Row Template -->
          <template #item="{ item, index }">
            <tr class="table-row">
              <td class="font-weight-medium text-primary">{{ item.GL_Code }}</td>
              <td class="text-truncate" :title="item.Description">
                {{ item.Description }}
              </td>
              <!-- Amount columns - dynamic based on currency -->
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
import { ref, onMounted, computed } from 'vue'
import axios from '@/helpers/axios'
import * as XLSX from 'xlsx'

// Types for better type safety
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

interface ApiResponse {
  status: 'success' | 'error'
  message: string
  count?: number
  currency?: string
  data: any[]
}

// Security: Authentication helper with validation
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

// dairy Report 
const bulkInsertLoading = ref(false)
const showBulkInsertDialog = ref(false)
const bulkInsertOptions = ref({
  fin_year: '2025',
  period_code: '',
  category: 'TRIAL_BALANCE'
})

const filters = ref({
  currency: null as string | null,
  date_start: new Date().toISOString().split('T')[0],
  date_end: new Date().toISOString().split('T')[0]
})

const results = ref<TrialBalanceItem[]>([])

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Currency options configuration
const currencyOptions = [
    {
    title: 'ທຽບເທົ່າກັບ (LCY)',
    value: 'LCY',
    subtitle: 'Local Consolidated',
    icon: 'mdi-currency-kzt'
  },
  {
    title: 'ກີບລາວ (LAK)',
    value: 'LAK',
    subtitle: 'Local Currency',
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

// Computed properties for dynamic UI
const selectedCurrency = computed(() => filters.value.currency)

const chipColor = computed(() => {
  if (!selectedCurrency.value) return 'primary'
  switch (selectedCurrency.value) {
    case 'LAK': return 'success'
    case 'USD': return 'info'
    case 'THB': return 'warning'
    default: return 'primary'
  }
})

const chipText = computed(() => {
  if (!selectedCurrency.value) return 'Consolidated LCY (LAK)'
  return `${selectedCurrency.value} (FCY)`
})

// Dynamic headers based on currency selection
const dynamicHeaders = computed(() => {
  const currencyCode = selectedCurrency.value || 'LAK'
  
  return [
    { 
      title: 'ເລກບັນຊີ', 
      key: 'GL_Code', 
      width: '120px',
      sortable: true
    },
    { 
      title: 'ລາຍລະອຽດ', 
      key: 'Description', 
      width: '300px',
      sortable: true
    },
    { 
      title: `Opening Dr (${currencyCode})`, 
      key: 'Opening_Dr', 
      width: '140px', 
      align: 'end', 
      sortable: true 
    },
    { 
      title: `Opening Cr (${currencyCode})`, 
      key: 'Opening_Cr', 
      width: '140px', 
      align: 'end', 
      sortable: true 
    },
    { 
      title: `Flow Dr (${currencyCode})`, 
      key: 'Flow_Dr', 
      width: '140px', 
      align: 'end', 
      sortable: true 
    },
    { 
      title: `Flow Cr (${currencyCode})`, 
      key: 'Flow_Cr', 
      width: '140px', 
      align: 'end', 
      sortable: true 
    },
    { 
      title: `Closing Dr (${currencyCode})`, 
      key: 'Closing_Dr', 
      width: '140px', 
      align: 'end', 
      sortable: true 
    },
    { 
      title: `Closing Cr (${currencyCode})`, 
      key: 'Closing_Cr', 
      width: '140px', 
      align: 'end', 
      sortable: true 
    }
  ]
})

// Input validation
const validateDate = (value: string) => {
  if (!value) return 'ກະລຸນາເລືອກວັນທີ'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'ຮູບແບບວັນທີບໍ່ຖືກຕ້ອງ'
  return true
}

// API Service - Updated to handle both endpoints
const apiService = {
  async fetchTrialBalanceConsolidated(payload: any): Promise<ApiResponse> {
    try {
      const endpoint = '/api/trial-balance/consolidated/'
      
      console.log(`🔄 Fetching LCY Consolidated from: ${endpoint}`, payload)
      
      const { data } = await axios.post(endpoint, payload, getAuthHeaders())
      
      console.log(`✅ LCY API Response:`, {
        endpoint,
        status: data?.status,
        dataCount: data?.data?.length || 0
      })
      
      return data
    } catch (error) {
      console.error(`❌ API Error for Consolidated LCY:`, error)
      throw error
    }
  },
  async bulkInsertDairyReports(payload) {
    try {
      const endpoint = '/api/dairy-reports/bulk-insert/'
      
      console.log(`🔄 Bulk Insert to: ${endpoint}`, payload)
      
      const { data } = await axios.post(endpoint, payload, getAuthHeaders())
      
      console.log(`✅ Bulk Insert Response:`, {
        endpoint,
        status: data?.status,
        totalInserted: data?.statistics?.totals?.inserted || 0,
        totalFailed: data?.statistics?.totals?.failed || 0
      })
      
      return data
    } catch (error) {
      console.error(`❌ Bulk Insert API Error:`, error)
      throw error
    }
  },

  async fetchTrialBalanceFCY(payload: any): Promise<ApiResponse> {
    try {
      const endpoint = '/api/trial-balance/fcy/'
      
      console.log(`🔄 Fetching FCY from: ${endpoint}`, payload)
      
      const { data } = await axios.post(endpoint, payload, getAuthHeaders())
      
      console.log(`✅ FCY API Response:`, {
        endpoint,
        status: data?.status,
        currency: data?.currency,
        dataCount: data?.data?.length || 0
      })
      
      return data
    } catch (error) {
      console.error(`❌ API Error for FCY:`, error)
      throw error
    }
  }
}

// Data normalization for different API response formats
const normalizeTrialBalanceData = (apiResponse: ApiResponse, isConsolidated: boolean = false): TrialBalanceItem[] => {
  if (apiResponse.status !== 'success' || !Array.isArray(apiResponse.data)) {
    return []
  }

  return apiResponse.data.map(item => {
    if (isConsolidated) {
      // LCY Consolidated format (with _LAK suffix)
      return {
        GL_Code: item.GL_Code || item.GL || '',
        Description: item.Description || item._Desc || '',
        Opening_Dr: Number(item.Opening_Dr_LAK || item.Opening_Dr || 0),
        Opening_Cr: Number(item.Opening_Cr_LAK || item.Opening_Cr || 0),
        Flow_Dr: Number(item.Flow_Dr_LAK || item.Flow_Dr || 0),
        Flow_Cr: Number(item.Flow_Cr_LAK || item.Flow_Cr || 0),
        Closing_Dr: Number(item.Closing_Dr_LAK || item.Closing_Dr || 0),
        Closing_Cr: Number(item.Closing_Cr_LAK || item.Closing_Cr || 0)
      }
    } else {
      // FCY format (without suffix)
      return {
        GL_Code: item.GL || item.GL_Code || '',
        Description: item._Desc || item.Description || '',
        Opening_Dr: Number(item.Opening_Dr || 0),
        Opening_Cr: Number(item.Opening_Cr || 0),
        Flow_Dr: Number(item.Flow_Dr || 0),
        Flow_Cr: Number(item.Flow_Cr || 0),
        Closing_Dr: Number(item.Closing_Dr || 0),
        Closing_Cr: Number(item.Closing_Cr || 0)
      }
    }
  })
}

// ADD THIS BULK INSERT FUNCTION
const executeBulkInsert = async () => {
  try {
    bulkInsertLoading.value = true
    
    // Validation
    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາຕື່ມຂໍ້ມູນວັນທີໃຫ້ຄົບຖ້ວນ', 'warning', 'mdi-alert')
      return
    }

    // Date validation
    if (new Date(filters.value.date_start) > new Date(filters.value.date_end)) {
      showSnackbar('ວັນທີເລີ່ມຕົ້ນຕ້ອງນ້ອຍກວ່າວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
      return
    }

    // Prepare payload
    const payload = {
      date_start: filters.value.date_start,
      date_end: filters.value.date_end,
      fin_year: bulkInsertOptions.value.fin_year || '2025',
      period_code: bulkInsertOptions.value.period_code || '',
      category: bulkInsertOptions.value.category || 'TRIAL_BALANCE'
    }

    console.log(`[BulkInsert] Starting bulk insert operation:`, payload)

    // Call bulk insert API
    const response = await apiService.bulkInsertDairyReports(payload)
    
    // Close dialog
    showBulkInsertDialog.value = false
    
    // Show success message with details
    const stats = response.statistics
    const successMessage = `🎉 ການນຳເຂົ້າຂໍ້ມູນສຳເລັດ!

📊 ສະຖິຕິ:
• ລຶບຂໍ້ມູນເກົ່າ: ${stats.cleared_records.toLocaleString()} ລາຍການ
• FCY: ${stats.fcy_procedure.inserted.toLocaleString()}/${stats.fcy_procedure.fetched.toLocaleString()} ລາຍການ
• LCY: ${stats.lcy_procedure.inserted.toLocaleString()}/${stats.lcy_procedure.fetched.toLocaleString()} ລາຍການ
• ລວມທັງໝົດ: ${stats.totals.inserted.toLocaleString()} ລາຍການ
${stats.totals.failed > 0 ? `• ຜິດພາດ: ${stats.totals.failed.toLocaleString()} ລາຍການ` : ''}

✅ ການດຳເນີນງານສົມບູນແບບ!`
    
    showSnackbar(successMessage, 'success', 'mdi-check-circle')
    
    // Auto-refresh data after successful bulk insert
    if (filters.value.date_start && filters.value.date_end) {
      await nextTick()
      await fetchTrialBalance()
    }
    
    console.log(`[BulkInsert] Operation completed successfully:`, {
      cleared: stats.cleared_records,
      fcyInserted: stats.fcy_procedure.inserted,
      lcyInserted: stats.lcy_procedure.inserted,
      totalInserted: stats.totals.inserted,
      totalFailed: stats.totals.failed
    })
    
  } catch (error) {
    console.error('❌ Bulk Insert Error:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການນຳເຂົ້າຂໍ້ມູນ'
    
    // Handle specific errors
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
    } else if (error?.response?.status === 403) {
      errorMessage = '🚫 ທ່ານບໍ່ມີສິດໃນການດຳເນີນການນີ້'
    } else if (error?.response?.status === 400) {
      errorMessage = '📋 ຂໍ້ມູນທີ່ສົ່ງມາບໍ່ຖືກຕ້ອງ: ' + (error?.response?.data?.message || 'Invalid request')
    } else if (error?.response?.status === 500) {
      errorMessage = '🔧 ເກີດຂໍ້ຜິດພາດຈາກເຊີຟເວີ ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error?.message?.includes('Network Error')) {
      errorMessage = '🌐 ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີຟເວີໄດ້'
    }
    
    showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
    
  } finally {
    bulkInsertLoading.value = false
  }
}

// Main fetch function - Updated to handle both APIs
const fetchTrialBalance = async () => {
  try {
    loading.value = true
    
    // Validation
    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາຕື່ມຂໍ້ມູນວັນທີໃຫ້ຄົບຖ້ວນ', 'warning', 'mdi-alert')
      return
    }

    // Date validation
    if (new Date(filters.value.date_start) > new Date(filters.value.date_end)) {
      showSnackbar('ວັນທີເລີ່ມຕົ້ນຕ້ອງນ້ອຍກວ່າວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
      return
    }

    // Date range validation (max 2 years)
    const startDate = new Date(filters.value.date_start)
    const endDate = new Date(filters.value.date_end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 730) {
      showSnackbar('ໄລຍະວັນທີບໍ່ສາມາດເກີນ 2 ປີ', 'warning', 'mdi-alert')
      return
    }

    // Determine which API to call based on currency selection
    const isConsolidated = !selectedCurrency.value || selectedCurrency.value === 'LCY'
    let response: ApiResponse
    let normalizedData: TrialBalanceItem[]

    if (isConsolidated) {
      // Call consolidated LCY API
      const payload = {
        date_start: filters.value.date_start,
        date_end: filters.value.date_end
      }
      
      response = await apiService.fetchTrialBalanceConsolidated(payload)
      normalizedData = normalizeTrialBalanceData(response, true)
      
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນສຳເລັດ (LCY Consolidated) - ພົບ ${normalizedData.length} ລາຍການ`, 
        'success', 
        'mdi-check-circle'
      )
    } else {
      // Call FCY API
      const payload = {
        ac_ccy_id: selectedCurrency.value,
        date_start: filters.value.date_start,
        date_end: filters.value.date_end
      }
      
      response = await apiService.fetchTrialBalanceFCY(payload)
      normalizedData = normalizeTrialBalanceData(response, false)
      
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນສຳເລັດ (${selectedCurrency.value} FCY) - ພົບ ${normalizedData.length} ລາຍການ`, 
        'success', 
        'mdi-check-circle'
      )
    }
    
    results.value = normalizedData
    
  } catch (error: any) {
    console.error('❌ Fetch Error:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
    let errorIcon = 'mdi-alert-circle'
    
    // Handle specific errors
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
    } else if (error?.message?.includes('Network Error')) {
      errorMessage = '🌐 ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີຟເວີໄດ້'
      errorIcon = 'mdi-wifi-off'
    }
    
    showSnackbar(errorMessage, 'error', errorIcon)
    results.value = []
    
  } finally {
    loading.value = false
  }
}

// Currency change handler
const onCurrencyChange = (newValue: string | null) => {
  console.log('🔄 Currency changed to:', newValue)
  // Clear previous results when currency changes
  results.value = []
  
  // Auto-fetch data if dates are already set
  if (filters.value.date_start && filters.value.date_end) {
    nextTick(() => {
      fetchTrialBalance()
    })
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

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// Export function - Updated to handle both data types
const exportToExcel = () => {
  try {
    if (!results.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    const currencyCode = selectedCurrency.value || 'LAK'
    const reportType = selectedCurrency.value ? 'FCY' : 'LCY_Consolidated'

    // Prepare export data
    const exportData = results.value.map(item => ({
      'GL Code': item.GL_Code,
      'Description': item.Description,
      [`Opening Dr (${currencyCode})`]: item.Opening_Dr,
      [`Opening Cr (${currencyCode})`]: item.Opening_Cr,
      [`Flow Dr (${currencyCode})`]: item.Flow_Dr,
      [`Flow Cr (${currencyCode})`]: item.Flow_Cr,
      [`Closing Dr (${currencyCode})`]: item.Closing_Dr,
      [`Closing Cr (${currencyCode})`]: item.Closing_Cr
    }))

    // Create and save Excel file
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // Set column widths
    const colWidths = [
      { wch: 12 }, // GL Code
      { wch: 40 }, // Description
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 } // Amount columns
    ]
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, `Trial Balance ${currencyCode}`)

    // Generate secure filename
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `Trial_Balance_${reportType}_${currencyCode}_${currentDate}.xlsx`

    XLSX.writeFile(wb, filename)

    showSnackbar(
      `📊 ສົ່ງອອກສຳເລັດ (${currencyCode} ${reportType}) - ${results.value.length} ລາຍການ`, 
      'success', 
      'mdi-download'
    )

  } catch (error) {
    console.error('Export error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ', 'error', 'mdi-alert-circle')
  }
}

// Initialize component
onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    if (token) {
      // Set default to current month
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      filters.value.date_start = firstDay.toISOString().split('T')[0]
      filters.value.date_end = today.toISOString().split('T')[0]
      
      // Auto-fetch data on mount (default to consolidated)
      await fetchTrialBalance()
    } else {
      showSnackbar('🔑 ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນ', 'warning', 'mdi-account-alert')
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
  background: rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  font-size: 0.85rem;
  font-weight: 500;
}

.professional-table :deep(.v-data-table__td) {
  padding: 8px 12px !important;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.875rem;
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

@media (max-width: 960px) {
  .font-mono { font-size: 0.75rem; }
  .amount-cell { padding: 2px 4px; font-size: 0.75rem; }
  .professional-table :deep(.v-data-table__td) { padding: 6px 8px !important; }
}

.font-mono {
  font-family: 'Roboto Mono', 'Consolas', monospace;
  font-size: 0.8rem;
}

.v-expansion-panel-text :deep(.v-expansion-panel-text__wrapper) {
  padding-top: 0;
}

.v-dialog .v-card {
  border-radius: 12px;
  overflow: hidden;
}

.v-alert {
  border-radius: 8px;
}

@media (max-width: 600px) {
  .v-dialog {
    margin: 12px;
  }
  
  .v-dialog .v-card {
    margin: 0;
  }
}
</style>