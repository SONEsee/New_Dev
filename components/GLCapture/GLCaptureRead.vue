<template>
  <div class="gl-approved-master">
    <!-- Page Header - Compact -->
    <div class="page-header-compact">
      <h1 class="page-title-compact">
        <v-icon color="primary" size="20" class="mr-2">mdi-book-check</v-icon>
        ລາຍການບັນທຶກບັນຊີ
      </h1>
    </div>

    <!-- Filter Section - Thinner -->
    <v-card class="filter-card-thin mb-2" elevation="1">
      <v-card-text class="pa-2">
        <v-row dense>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="ຄົ້ນຫາ"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              placeholder="ເລກອ້າງອີງ, ຂໍ້ຄວາມ..."
              @update:model-value="searchDebounced"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.module_id"
              :items="modules"
              item-title="module_name_la"
              item-value="module_Id"
              label="ໂມດູນ"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="loadData"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.Ccy_cd"
              :items="currencies"
              item-title="ccy_code"
              item-value="ccy_code"
              label="ສະກຸນເງິນ"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="loadData"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.Auth_Status"
              :items="authStatusOptions"
              item-title="text"
              item-value="value"
              label="ສະຖານະອະນຸມັດ"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="loadData"
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.dateFrom"
              label="ວັນທີເລີ່ມ"
              type="date"
              variant="outlined"
              density="compact"
              @update:model-value="loadData"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="1">
            <v-btn
              color="primary"
              variant="flat"
              @click="loadData"
              :loading="loading"
              block
              size="small"
            >
              <v-icon size="16">mdi-filter</v-icon>
              ຄົ້ນຫາ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Summary Cards - Thinner -->
    <v-row dense class="mb-3">
      <v-col cols="6" sm="3" md="3">
        <v-card class="summary-card-thin" elevation="1">
          <v-card-text class="pa-2">
            <div class="d-flex align-center">
              <v-icon size="20" color="primary" class="mr-2">mdi-file-document-multiple</v-icon>
              <div>
                <div class="summary-value-thin">{{ summary.total }}</div>
                <div class="summary-label-thin">ລາຍການທັງໝົດ</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3" md="3">
        <v-card class="summary-card-thin" elevation="1">
          <v-card-text class="pa-2">
            <div class="d-flex align-center">
              <v-icon size="20" color="warning" class="mr-2">mdi-clock-outline</v-icon>
              <div>
                <div class="summary-value-thin">{{ summary.pending }}</div>
                <div class="summary-label-thin">ລໍຖ້າອະນຸມັດ</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3" md="3">
        <v-card class="summary-card-thin" elevation="1">
          <v-card-text class="pa-2">
            <div class="d-flex align-center">
              <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
              <div>
                <div class="summary-value-thin">{{ summary.approved }}</div>
                <div class="summary-label-thin">ອະນຸມັດແລ້ວ</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3" md="3">
        <v-card class="summary-card-thin" elevation="1">
          <v-card-text class="pa-2">
            <div class="d-flex align-center">
              <v-icon size="20" color="error" class="mr-2">mdi-close-circle</v-icon>
              <div>
                <div class="summary-value-thin">{{ summary.rejected }}</div>
                <div class="summary-label-thin">ປະຕິເສດ</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Table - Compact -->
    <v-card elevation="1" class="data-table-card-thin">
      <v-card-title class="d-flex justify-space-between align-center pa-3">
        <span class="text-h6">ລາຍການບັນທຶກບັນຊີ</span>
        <div>
          <v-btn
            color="primary"
            variant="flat"
            @click="$router.push('/glcapture/create')"
            prepend-icon="mdi-plus"
            class="mr-2"
            size="small"
          >
            ເພີ່ມບັນທຶກໃຫມ່
          </v-btn>
          <v-btn
            color="success"
            variant="text"
            @click="exportData"
            :disabled="items.length === 0"
            class="mr-2"
            size="small"
          >
            <v-icon left size="16">mdi-download</v-icon>
            ສົ່ງອອກ
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="loadData"
            size="small"
          >
            <v-icon left size="16">mdi-refresh</v-icon>
            ໂຫຼດໃໝ່
          </v-btn>
        </div>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :search="filters.search"
        :items-per-page="10"
        density="compact"
        class="elevation-0 full-width-table-thin"
        item-value="JRNLLog_id"
      >
        <!-- Reference No -->
        <template v-slot:item.Reference_No="{ item }">
          <v-chip
            size="x-small"
            color="primary"
            variant="outlined"
            @click="viewDetails(item)"
            class="cursor-pointer"
          >
            {{ item.Reference_No }}
          </v-chip>
        </template>

        <!-- Module -->
        <template v-slot:item.module_id="{ item }">
          <span v-if="item.module_id" class="text-compact">
            {{ getModuleName(item.module_id) }}
          </span>
          <span v-else class="text-grey">-</span>
        </template>

        <!-- Currency and Amount -->
        <template v-slot:item.Fcy_Amount="{ item }">
          <div class="text-right text-compact">
            <strong>{{ formatNumber(item.Fcy_Amount) }}</strong>
            <span class="text-grey ml-1">{{ item.Ccy_cd }}</span>
          </div>
        </template>

        <!-- LCY Amount -->
        <template v-slot:item.Lcy_Amount="{ item }">
          <div class="text-right text-compact">
            {{ formatNumber(item.Lcy_Amount) }} LAK
          </div>
        </template>

        <!-- Transaction Code -->
        <template v-slot:item.Txn_code="{ item }">
          <v-chip size="x-small" variant="flat" color="info">
            {{ item.Txn_code || '-' }}
          </v-chip>
        </template>

        <template v-slot:item.Addl_text="{ item }">
          <div class="text-truncate text-compact">
            {{ item.Addl_text || '-' }}
            <v-tooltip v-if="item.Addl_text" location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props">{{ item.Addl_text }}</span>
              </template>
              <span>{{ item.Addl_text }}</span>
            </v-tooltip>
          </div>
        </template>

        <!-- Value Date -->
        <template v-slot:item.Value_date="{ item }">
          <span class="text-compact">{{ formatDate(item.Value_date) }}</span>
        </template>

        <!-- Auth Status -->
        <template v-slot:item.Auth_Status="{ item }">
          <v-chip
            :color="getStatusColor(item.Auth_Status)"
            size="x-small"
            variant="flat"
          >
            <v-icon left size="x-small">{{ getStatusIcon(item.Auth_Status) }}</v-icon>
            {{ getStatusText(item.Auth_Status) }}
          </v-chip>
        </template>

        <!-- Maker Info -->
        <template v-slot:item.Maker_Id="{ item }">
          <div class="text-caption-thin">
            <div v-if="item.Maker_Id" class="text-compact">{{ item.Maker_Id.Username }}</div>
            <div class="text-grey text-xs">{{ formatDateTime(item.Maker_DT_Stamp) }}</div>
          </div>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="info"
            @click="viewDetails(item)"
            title="ເບິ່ງລາຍລະອຽດ"
          >
            <v-icon size="14">mdi-eye</v-icon>
          </v-btn>
          
          <v-btn
            v-if="item.Auth_Status === 'U' && canApprove"
            icon
            size="x-small"
            variant="text"
            color="success"
            @click="approveItem(item)"
            title="ອະນຸມັດ"
          >
            <v-icon size="14">mdi-check</v-icon>
          </v-btn>
          
          <v-btn
            v-if="item.Auth_Status === 'U' && canApprove"
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="rejectItem(item)"
            title="ປະຕິເສດ"
          >
            <v-icon size="14">mdi-close</v-icon>
          </v-btn>
          
          <v-btn
            v-if="item.delete_stat !== 'Y'"
            icon
            size="x-small"
            variant="text"
            color="error"
            @click="deleteItem(item)"
            title="ລຶບ"
          >
            <v-icon size="14">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

<!-- Details Dialog - Thinner and more compact -->
<v-dialog v-model="detailsDialog" max-width="900px" scrollable>
  <v-card class="elevation-1 rounded-lg">
    <!-- Minimal Header -->
    <v-card-title class="px-4 py-2 bg-primary text-white">
      <div class="d-flex align-center justify-space-between w-100">
        <div class="text-h6 font-weight-medium">{{ selectedItem?.Reference_No }}</div>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          size="x-small"
          color="white"
          @click="detailsDialog = false"
        ></v-btn>
      </div>
    </v-card-title>
    
    <v-card-text v-if="selectedItem" class="px-4 py-3">
      <!-- Compact Main Information -->
      <div class="mb-4">
        <div class="section-title-thin mb-2">ຂໍ້ມູນຫຼັກ</div>
        <div class="info-grid-thin">
          <div class="info-item-thin">
            <span class="info-label-thin">ໂມດູນ:</span>
            <span class="info-value-thin">{{ getModuleName(selectedItem.module_id) }}</span>
          </div>
          <div class="info-item-thin">
            <span class="info-label-thin">ວັນທີ:</span>
            <span class="info-value-thin">{{ formatDate(selectedItem.Value_date) }}</span>
          </div>
          <div class="info-item-thin">
            <span class="info-label-thin">ສະຖານະ:</span>
            <v-chip
              :color="getStatusColor(selectedItem.Auth_Status)"
              size="x-small"
              variant="flat"
              class="ml-1"
            >
              {{ getStatusText(selectedItem.Auth_Status) }}
            </v-chip>
          </div>
          <div class="info-item-thin">
            <span class="info-label-thin">ລະຫັດ:</span>
            <span class="info-value-thin">{{ selectedItem.Txn_code }}</span>
          </div>
        </div>
      </div>

     <!-- Journal Entries - Thinner table -->
      <div>
        <div class="section-title-thin mb-2">
          ລາຍການບັນທຶກ ({{ journalEntries.length }} ລາຍການ)
        </div>
        <div class="journal-table-container-thin">
          <table class="journal-table-ultra-thin">
            <thead>
              <tr>
                <th width="120">ບັນຊີ</th>
                <th>ຊື່ບັນຊີ</th>
                <th width="80" class="text-right">Debit (FCY)</th>
                <th width="80" class="text-right">Credit (FCY)</th>
                <th width="80" class="text-right">Debit (LCY)</th>
                <th width="80" class="text-right">Credit (LCY)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, index) in journalEntries" :key="entry.JRNLLog_id">
                <td class="font-weight-medium text-compact">{{ entry.account_code }}</td>
                <td class="text-truncate text-compact" style="max-width: 180px;">
                  <span :title="entry.account_name">{{ entry.account_name }}</span>
                  <div v-if="entry.Addl_sub_text" class="text-xs text-grey">
                    {{ entry.Addl_sub_text }}
                  </div>
                </td>
                <td class="text-right text-compact">
                  <span v-if="parseFloat(entry.fcy_dr) > 0" class="font-weight-medium">
                    {{ formatNumber(entry.fcy_dr) }}
                  </span>
                  <span v-else class="text-grey">-</span>
                </td>
                <td class="text-right text-compact">
                  <span v-if="parseFloat(entry.fcy_cr) > 0" class="font-weight-medium">
                    {{ formatNumber(entry.fcy_cr) }}
                  </span>
                  <span v-else class="text-grey">-</span>
                </td>
                <td class="text-right text-compact">
                  <span v-if="parseFloat(entry.lcy_dr) > 0" class="font-weight-medium text-blue">
                    {{ formatNumber(entry.lcy_dr) }}
                  </span>
                  <span v-else class="text-grey">-</span>
                </td>
                <td class="text-right text-compact">
                  <span v-if="parseFloat(entry.lcy_cr) > 0" class="font-weight-medium text-blue">
                    {{ formatNumber(entry.lcy_cr) }}
                  </span>
                  <span v-else class="text-grey">-</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="totals-row-thin">
                <td colspan="2" class="text-right font-weight-bold text-compact">ລວມ:</td>
                <td class="text-right font-weight-bold text-compact">{{ formatNumber(totalFcyDebit) }}</td>
                <td class="text-right font-weight-bold text-compact">{{ formatNumber(totalFcyCredit) }}</td>
                <td class="text-right font-weight-bold text-blue text-compact">{{ formatNumber(totalLcyDebit) }}</td>
                <td class="text-right font-weight-bold text-blue text-compact">{{ formatNumber(totalLcyCredit) }}</td>
              </tr>
              <tr>
                <td colspan="6" class="text-center py-1">
                  <v-chip 
                    size="x-small" 
                    :color="isBalanced ? 'success' : 'error'"
                    variant="flat"
                  >
                    <v-icon size="12" class="mr-1">{{ isBalanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
                    {{ isBalanced ? 'ສົມດຸນ' : 'ບໍ່ສົມດຸນ' }}
                  </v-chip>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Compact Financial Information -->
      <div class="mb-4">
        <div class="section-title-thin mb-2">ຂໍ້ມູນການເງິນ</div>
        <div class="amount-summary-thin">
          <div class="amount-item-thin">
            <div class="amount-label-thin">FCY Amount</div>
            <div class="amount-value-thin">{{ formatNumber(selectedItem.Fcy_Amount) }} {{ selectedItem.Ccy_cd }}</div>
          </div>
          <div class="amount-item-thin">
            <div class="amount-label-thin">LCY Amount</div>
            <div class="amount-value-thin">{{ formatNumber(selectedItem.Lcy_Amount) }} LAK</div>
          </div>
          <div class="amount-item-thin">
            <div class="amount-label-thin">Rate</div>
            <div class="amount-value-thin">{{ formatNumber(selectedItem.Exch_rate, 6) }}</div>
          </div>
        </div>
      </div>
    </v-card-text>
    
    <!-- Minimal Actions -->
    <v-divider></v-divider>
    <v-card-actions class="px-4 py-2">
      <v-spacer></v-spacer>
      <v-btn
        v-if="selectedItem?.Auth_Status === 'U' && canApprove"
        color="success"
        variant="flat"
        size="x-small"
        @click="approveItem(selectedItem)"
      >
        <v-icon start size="12">mdi-check</v-icon>
        ອະນຸມັດ
      </v-btn>
      <v-btn
        v-if="selectedItem?.Auth_Status === 'U' && canApprove"
        color="error"
        variant="flat"
        size="x-small"
        class="ml-2"
        @click="rejectItem(selectedItem)"
      >
        <v-icon start size="12">mdi-close</v-icon>
        ປະຕິເສດ
      </v-btn>
      <v-btn
        variant="outlined"
        size="x-small"
        class="ml-2"
        @click="detailsDialog = false"
      >
        ປິດ
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'
import { debounce } from 'lodash'

// State
const loading = ref(false)
const items = ref([])
const modules = ref([])
const currencies = ref([])
const detailsDialog = ref(false)
const selectedItem = ref(null)
const journalEntries = ref([])

// Filters
const filters = reactive({
  search: '',
  module_id: null,
  Ccy_cd: null,
  Auth_Status: null,
  dateFrom: null,
  dateTo: null
})

// Summary
const summary = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

// Auth status options
const authStatusOptions = [
  { value: 'U', text: 'ລໍຖ້າອະນຸມັດ' },
  { value: 'A', text: 'ອະນຸມັດແລ້ວ' },
  { value: 'R', text: 'ປະຕິເສດ' }
]

// Table headers
const headers = [
  { title: 'ເລກອ້າງອີງ', key: 'Reference_No', sortable: true },
  { title: 'ໂມດູນ', key: 'module_id', sortable: true },
  { title: 'ຈຳນວນເງິນ', key: 'Fcy_Amount', align: 'end', sortable: true },
  { title: 'ຈຳນວນກີບ', key: 'Lcy_Amount', align: 'end', sortable: true },
  { title: 'ເນື້ອໃນ', key: 'Addl_text', sortable: true },
  { title: 'ລະຫັດ', key: 'Txn_code', sortable: true },
  { title: 'ວັນທີ', key: 'Value_date', sortable: true },
  { title: 'ສະຖານະ', key: 'Auth_Status', sortable: true },
  { title: 'ຜູ້ສ້າງ', key: 'Maker_Id', sortable: true },
  { title: 'ການກະທຳ', key: 'actions', sortable: false, align: 'center' }
]

// API configuration
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Computed
const canApprove = computed(() => {
  // Check user permissions - implement based on your auth system
  return true // Placeholder
})

const totalFcyDebit = computed(() => {
  return journalEntries.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.fcy_dr || 0)
  }, 0)
})

const totalFcyCredit = computed(() => {
  return journalEntries.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.fcy_cr || 0)
  }, 0)
})

const totalLcyDebit = computed(() => {
  return journalEntries.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.lcy_dr || 0)
  }, 0)
})

const totalLcyCredit = computed(() => {
  return journalEntries.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.lcy_cr || 0)
  }, 0)
})

const isBalanced = computed(() => {
  const fcyBalance = Math.abs(totalFcyDebit.value - totalFcyCredit.value) < 0.01
  const lcyBalance = Math.abs(totalLcyDebit.value - totalLcyCredit.value) < 0.01
  return fcyBalance && lcyBalance
})

// Method to get maker name from journal entries
const getMakerName = () => {
  if (!selectedItem.value || !journalEntries.value.length) {
    return selectedItem.value?.Maker_Id || '-'
  }
  
  // Get maker name from the first journal entry (they should all have the same maker)
  const firstEntry = journalEntries.value[0]
  return firstEntry?.maker_name || selectedItem.value?.Maker_Id || '-'
}

// Updated viewDetails method to handle the new structure
  const viewDetails = async (item) => {
  selectedItem.value = item
  detailsDialog.value = true
  
  console.log('Viewing details for item:', selectedItem.value);
  
  // Load journal entries with proper error handling
  try {
    loading.value = true
    const response = await axios.get('/api/journal-entries/', {
      params: { 
        Reference_No: item.Reference_No,
        ordering: 'Dr_cr' // Order by Dr_cr to show debits first
      },
      ...getAuthHeaders()
    })
    
    journalEntries.value = response.data.results || response.data || []
    
    // Log the structure for debugging
    console.log('Journal entries loaded:', journalEntries.value)
    console.log('Maker name:', getMakerName())
    console.log('FCY Totals - Debit:', totalFcyDebit.value, 'Credit:', totalFcyCredit.value)
    console.log('LCY Totals - Debit:', totalLcyDebit.value, 'Credit:', totalLcyCredit.value)
    console.log('Is Balanced:', isBalanced.value)
    
  } catch (error) {
    console.error('Error loading journal entries:', error)
    journalEntries.value = []
    
    Swal.fire({
      icon: 'warning',
      title: 'ແຈ້ງເຕືອນ',
      text: 'ບໍ່ສາມາດໂຫຼດລາຍການບັນທຶກໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.value = false
  }
}

// Methods
const formatNumber = (num, decimals = 2) => {
  if (!num) return '0.00'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('lo-LA')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('lo-LA')
}

const getStatusColor = (status) => {
  switch(status) {
    case 'A': return 'success'
    case 'R': return 'error'
    case 'U': return 'warning'
    default: return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'A': return 'mdi-check-circle'
    case 'R': return 'mdi-close-circle'
    case 'U': return 'mdi-clock-outline'
    default: return 'mdi-help-circle'
  }
}

const getStatusText = (status) => {
  switch(status) {
    case 'A': return 'ອະນຸມັດແລ້ວ'
    case 'R': return 'ປະຕິເສດ'
    case 'U': return 'ລໍຖ້າອະນຸມັດ'
    default: return 'ບໍ່ຮູ້'
  }
}

const getModuleName = (moduleId) => {
  if (!moduleId) return '-'
  const module = modules.value.find(m => m.module_Id === moduleId)
  return module ? module.module_name_la : moduleId
}

const loadData = async () => {
  try {
    loading.value = true
    
    // Build query params
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.module_id) params.module_id = filters.module_id
    if (filters.Ccy_cd) params.Ccy_cd = filters.Ccy_cd
    if (filters.Auth_Status) params.Auth_Status = filters.Auth_Status
    if (filters.dateFrom) params.Value_date__gte = filters.dateFrom
    if (filters.dateTo) params.Value_date__lte = filters.dateTo
    params.delete_stat__ne = 'Y' // Exclude soft deleted
    params.ordering = '-Maker_DT_Stamp' // Order by newest first
    
    const response = await axios.get('/api/journal-log-master/', {
      params,
      ...getAuthHeaders()
    })
    
    items.value = response.data.results || response.data || []

    console.log('Loaded items:', items.value);
    
    
    // Update summary
    updateSummary()
    
  } catch (error) {
    console.error('Error loading data:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.value = false
  }
}

const updateSummary = () => {
  summary.total = items.value.length
  summary.pending = items.value.filter(i => i.Auth_Status === 'U').length
  summary.approved = items.value.filter(i => i.Auth_Status === 'A').length
  summary.rejected = items.value.filter(i => i.Auth_Status === 'R').length
}

const loadModules = async () => {
  try {
    const response = await axios.get('/api/modules/', getAuthHeaders())
    modules.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading modules:', error)
  }
}

const loadCurrencies = async () => {
  try {
    const response = await axios.get('/api/currencies/', getAuthHeaders())
    currencies.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading currencies:', error)
  }
}

const approveItem = async (item) => {
  const result = await Swal.fire({
    icon: 'question',
    title: 'ຢືນຢັນການອະນຸມັດ',
    text: `ທ່ານຕ້ອງການອະນຸມັດລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    showCancelButton: true,
    confirmButtonText: 'ອະນຸມັດ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#4caf50',
    cancelButtonColor: '#9e9e9e'
  })
  
  if (result.isConfirmed) {
    try {
      const response = await axios.patch(`/api/journal-log-master/${item.JRNLLog_id}/`, {
        Auth_Status: 'A',
        Checker_Id: localStorage.getItem('userId'), // Get from your auth system
        Checker_DT_Stamp: new Date().toISOString()
      }, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ອະນຸມັດລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      detailsDialog.value = false
      loadData()
      
    } catch (error) {
      console.error('Error approving item:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດອະນຸມັດລາຍການໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

const rejectItem = async (item) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການປະຕິເສດ',
    text: `ທ່ານຕ້ອງການປະຕິເສດລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    input: 'textarea',
    inputLabel: 'ເຫດຜົນໃນການປະຕິເສດ',
    inputPlaceholder: 'ກະລຸນາໃສ່ເຫດຜົນ...',
    inputValidator: (value) => {
      if (!value) {
        return 'ກະລຸນາໃສ່ເຫດຜົນໃນການປະຕິເສດ!'
      }
    },
    showCancelButton: true,
    confirmButtonText: 'ປະຕິເສດ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#9e9e9e'
  })
  
  if (result.isConfirmed) {
    try {
      const response = await axios.patch(`/api/journal-log-master/${item.JRNLLog_id}/`, {
        Auth_Status: 'R',
        Checker_Id: localStorage.getItem('userId'), // Get from your auth system
        Checker_DT_Stamp: new Date().toISOString(),
        Addl_text: item.Addl_text + '\nເຫດຜົນປະຕິເສດ: ' + result.value
      }, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ປະຕິເສດລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      detailsDialog.value = false
      loadData()
      
    } catch (error) {
      console.error('Error rejecting item:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດປະຕິເສດລາຍການໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

const deleteItem = async (item) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການລຶບ',
    text: `ທ່ານຕ້ອງການລຶບລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    showCancelButton: true,
    confirmButtonText: 'ລຶບ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#9e9e9e'
  })
  
  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/journal-log-master/${item.JRNLLog_id}/`, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ລຶບລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      loadData()
      
    } catch (error) {
      console.error('Error deleting item:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດລຶບລາຍການໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

const exportData = () => {
  // Implement export functionality
  Swal.fire({
    icon: 'info',
    title: 'ກຳລັງພັດທະນາ',
    text: 'ຟັງຊັນສົ່ງອອກຂໍ້ມູນກຳລັງພັດທະນາ',
    confirmButtonText: 'ຕົກລົງ'
  })
}

// Search with debounce
const searchDebounced = debounce(() => {
  loadData()
}, 500)

// Lifecycle
onMounted(() => {
  loadModules()
  loadCurrencies()
  loadData()
})
</script>

<style scoped>
.gl-approved-master {
  padding: 16px;
}

/* Compact header */
.page-header-compact {
  padding: 8px 0;
  margin-bottom: 16px;
}

.page-title-compact {
  font-size: 1.4rem;
  font-weight: 500;
  color: #1976d2;
  display: flex;
  align-items: center;
  margin: 0;
  line-height: 1.2;
}

/* Thinner filter card */
.filter-card-thin {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
}

/* Thinner summary cards */
.summary-card-thin {
  height: auto;
  min-height: 60px;
  transition: transform 0.2s;
  border: 1px solid #e0e0e0;
}

.summary-card-thin:hover {
  transform: translateY(-1px);
}

.summary-value-thin {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
}

.summary-label-thin {
  font-size: 0.7rem;
  color: #666;
  line-height: 1;
}

/* Thinner data table card */
.data-table-card-thin {
  border: 1px solid #e0e0e0;
}

/* Compact text */
.text-compact {
  font-size: 0.8rem;
  line-height: 1.1;
}

.text-caption-thin {
  font-size: 0.7rem;
  line-height: 1.1;
}

.text-xs {
  font-size: 0.65rem;
  line-height: 1;
}

/* Full width table - thinner */
.full-width-table-thin {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

/* Dialog styles - thinner */
.section-title-thin {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid #e3f2fd;
  padding-bottom: 2px;
  line-height: 1;
}

.info-grid-thin {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.info-item-thin {
  display: flex;
  align-items: center;
  padding: 1px 0;
  line-height: 1.1;
}

.info-label-thin {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
  min-width: 60px;
  line-height: 1;
}

.info-value-thin {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-left: 6px;
  line-height: 1;
}

/* Thinner amount summary */
.amount-summary-thin {
  display: flex;
  gap: 16px;
  justify-content: space-around;
  background: #f9f9f9;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.amount-item-thin {
  text-align: center;
  flex: 1;
}

.amount-label-thin {
  font-size: 0.65rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1;
}

.amount-value-thin {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1976d2;
  line-height: 1;
}

/* Ultra-thin journal table */
.journal-table-container-thin {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.journal-table-ultra-thin {
  width: 100%;
  border-collapse: collapse;
}

.journal-table-ultra-thin thead {
  background: #f7f7f7;
}

.journal-table-ultra-thin th {
  font-size: 0.7rem;
  font-weight: 700;
  color: #333;
  padding: 6px 4px;
  border-bottom: 1px solid #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1;
}

.journal-table-ultra-thin td {
  padding: 4px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 0.75rem;
  line-height: 1.1;
}

.journal-table-ultra-thin tbody tr:hover {
  background-color: #f9f9f9;
}

.journal-table-ultra-thin tbody tr:last-child td {
  border-bottom: none;
}

.totals-row-thin {
  background: #f7f7f7;
  font-weight: 700;
}

.totals-row-thin td {
  padding: 6px 4px;
  font-size: 0.75rem;
  border-top: 1px solid #ddd;
  line-height: 1;
}

.text-blue {
  color: #1976d2;
}

/* Vuetify overrides for compact design */
:deep(.v-data-table) {
  font-size: 0.8rem;
  width: 100% !important;
}

:deep(.v-data-table th) {
  font-weight: 600;
  background-color: #f7f7f7;
  font-size: 0.75rem;
  padding: 8px 12px !important;
  height: 36px !important;
}

:deep(.v-data-table td) {
  padding: 6px 12px !important;
  height: 40px !important;
  font-size: 0.8rem;
}

:deep(.v-data-table-wrapper) {
  width: 100% !important;
  overflow-x: auto;
}

:deep(.v-table__wrapper) {
  width: 100% !important;
}

:deep(.v-field__input) {
  min-height: 32px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

:deep(.v-field__field) {
  height: 32px !important;
}

:deep(.v-input--density-compact .v-field--variant-outlined .v-field__outline__start) {
  border-radius: 4px 0 0 4px;
}

:deep(.v-input--density-compact .v-field--variant-outlined .v-field__outline__end) {
  border-radius: 0 4px 4px 0;
}

:deep(.v-btn--size-small) {
  min-height: 28px;
  padding: 0 12px;
  font-size: 0.75rem;
}

:deep(.v-btn--size-x-small) {
  min-height: 24px;
  padding: 0 8px;
  font-size: 0.7rem;
}

:deep(.v-chip--size-x-small) {
  height: 20px;
  font-size: 0.65rem;
  padding: 0 6px;
}

:deep(.v-card-title) {
  font-size: 1rem;
  font-weight: 500;
  padding: 12px 16px;
}

:deep(.v-card-text) {
  font-size: 0.8rem;
}

:deep(.v-card-actions) {
  min-height: 40px;
}

:deep(.v-dialog .v-card) {
  max-height: 90vh;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-title-compact {
    font-size: 1.2rem;
  }
  
  .summary-value-thin {
    font-size: 1rem;
  }
  
  .summary-label-thin {
    font-size: 0.65rem;
  }
  
  .info-grid-thin {
    grid-template-columns: 1fr;
  }
  
  .amount-summary-thin {
    flex-direction: column;
    gap: 8px;
  }
  
  .journal-table-ultra-thin {
    font-size: 0.65rem;
  }
  
  .journal-table-ultra-thin th,
  .journal-table-ultra-thin td {
    padding: 3px 2px;
  }
  
  :deep(.v-data-table th) {
    padding: 4px 8px !important;
    font-size: 0.7rem;
  }
  
  :deep(.v-data-table td) {
    padding: 4px 8px !important;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .gl-approved-master {
    padding: 8px;
  }
  
  .text-compact {
    font-size: 0.75rem;
  }
  
  .journal-table-ultra-thin th,
  .journal-table-ultra-thin td {
    padding: 2px 1px;
    font-size: 0.6rem;
  }
}
</style>