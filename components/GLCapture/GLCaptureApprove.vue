<template>
  <div class="gl-approved-master">
    <!-- Page Header -->
    <div class="page-header mb-6">
      <h1 class="page-title">
        <v-icon left color="primary">mdi-book-check</v-icon>
        ອະນຸມັດລາຍການບັນທຶກບັນຊີ
      </h1>
      <p class="page-subtitle">ຈັດການ ແລະ ອະນຸມັດລາຍການບັນທຶກບັນຊີທັງໝົດ</p>
    </div>

    <!-- Filter Section -->
    <v-card class="filter-card mb-4" elevation="2">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="ຄົ້ນຫາ"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              placeholder="ເລກອ້າງອີງ, ຂໍ້ຄວາມ..."
              @update:model-value="searchDebounced"
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
              density="comfortable"
              clearable
              @update:model-value="loadData"
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
              density="comfortable"
              clearable
              @update:model-value="loadData"
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
              density="comfortable"
              clearable
              @update:model-value="loadData"
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.dateFrom"
              label="ວັນທີເລີ່ມ"
              type="date"
              variant="outlined"
              density="comfortable"
              @update:model-value="loadData"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="1">
            <v-btn
              color="primary"
              variant="flat"
              @click="loadData"
              :loading="loading"
              block
            >
              <v-icon>mdi-filter</v-icon>
              ຄົ້ນຫາ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Summary Cards -->
    <v-row dense class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card class="summary-card" elevation="2">
          <v-card-text class="text-center">
            <div class="summary-icon">
              <v-icon size="40" color="primary">mdi-file-document-multiple</v-icon>
            </div>
            <div class="summary-value">{{ summary.total }}</div>
            <div class="summary-label">ລາຍການທັງໝົດ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="summary-card" elevation="2">
          <v-card-text class="text-center">
            <div class="summary-icon">
              <v-icon size="40" color="warning">mdi-clock-outline</v-icon>
            </div>
            <div class="summary-value">{{ summary.pending }}</div>
            <div class="summary-label">ລໍຖ້າອະນຸມັດ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="summary-card" elevation="2">
          <v-card-text class="text-center">
            <div class="summary-icon">
              <v-icon size="40" color="success">mdi-check-circle</v-icon>
            </div>
            <div class="summary-value">{{ summary.approved }}</div>
            <div class="summary-label">ອະນຸມັດແລ້ວ</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="summary-card" elevation="2">
          <v-card-text class="text-center">
            <div class="summary-icon">
              <v-icon size="40" color="error">mdi-close-circle</v-icon>
            </div>
            <div class="summary-value">{{ summary.rejected }}</div>
            <div class="summary-label">ປະຕິເສດ</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-card elevation="2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>ລາຍການບັນທຶກບັນຊີ</span>
        <div>
          <v-btn
            color="success"
            variant="text"
            @click="exportData"
            :disabled="items.length === 0"
            class="mr-2"
          >
            <v-icon left>mdi-download</v-icon>
            ສົ່ງອອກ
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="loadData"
          >
            <v-icon left>mdi-refresh</v-icon>
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
        density="comfortable"
        class="elevation-0"
        item-value="JRNLLog_id"
      >
        <!-- Reference No -->
        <template v-slot:item.Reference_No="{ item }">
          <v-chip
            size="small"
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
          <span v-if="item.module_id">
            {{ getModuleName(item.module_id) }}
          </span>
          <span v-else class="text-grey">-</span>
        </template>

        <!-- Currency and Amount -->
        <template v-slot:item.Fcy_Amount="{ item }">
          <div class="text-right">
            <strong>{{ formatNumber(item.Fcy_Amount) }}</strong>
            <span class="text-grey ml-1">{{ item.Ccy_cd?.ccy_code || 'LAK' }}</span>
          </div>
        </template>

        <!-- LCY Amount -->
        <template v-slot:item.Lcy_Amount="{ item }">
          <div class="text-right">
            {{ formatNumber(item.Lcy_Amount) }}
          </div>
        </template>

        <!-- Transaction Code -->
        <template v-slot:item.Txn_code="{ item }">
          <v-chip size="x-small" variant="flat" color="info">
            {{ item.Txn_code?.trn_code || '-' }}
          </v-chip>
        </template>

        <!-- Value Date -->
        <template v-slot:item.Value_date="{ item }">
          {{ formatDate(item.Value_date) }}
        </template>

        <!-- Auth Status -->
        <template v-slot:item.Auth_Status="{ item }">
          <v-chip
            :color="getStatusColor(item.Auth_Status)"
            size="small"
            variant="flat"
          >
            <v-icon left size="x-small">{{ getStatusIcon(item.Auth_Status) }}</v-icon>
            {{ getStatusText(item.Auth_Status) }}
          </v-chip>
        </template>

        <!-- Maker Info -->
        <template v-slot:item.Maker_Id="{ item }">
          <div class="text-caption">
            <div v-if="item.Maker_Id">{{ item.Maker_Id.Username }}</div>
            <div class="text-grey">{{ formatDateTime(item.Maker_DT_Stamp) }}</div>
          </div>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            color="info"
            @click="viewDetails(item)"
            title="ເບິ່ງລາຍລະອຽດ"
          >
            <v-icon size="small">mdi-eye</v-icon>
          </v-btn>
          
          <v-btn
            v-if="item.Auth_Status === 'U' && canApprove"
            icon
            size="small"
            variant="text"
            color="success"
            @click="approveItem(item)"
            title="ອະນຸມັດ"
          >
            <v-icon size="small">mdi-check</v-icon>
          </v-btn>
          
          <v-btn
            v-if="item.Auth_Status === 'U' && canApprove"
            icon
            size="small"
            variant="text"
            color="error"
            @click="rejectItem(item)"
            title="ປະຕິເສດ"
          >
            <v-icon size="small">mdi-close</v-icon>
          </v-btn>
          
          <v-btn
            v-if="item.delete_stat !== 'Y'"
            icon
            size="small"
            variant="text"
            color="error"
            @click="deleteItem(item)"
            title="ລຶບ"
          >
            <v-icon size="small">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="900px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>ລາຍລະອຽດລາຍການບັນທຶກ</span>
          <v-btn icon variant="text" @click="detailsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text v-if="selectedItem">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>ເລກອ້າງອີງ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.Reference_No }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-cube-outline</v-icon>
                  </template>
                  <v-list-item-title>ໂມດູນ</v-list-item-title>
                  <v-list-item-subtitle>{{ getModuleName(selectedItem.module_id) }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-currency-usd</v-icon>
                  </template>
                  <v-list-item-title>ຈຳນວນເງິນ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatNumber(selectedItem.Fcy_Amount) }} {{ selectedItem.Ccy_cd?.ccy_code || 'LAK' }}
                    ({{ formatNumber(selectedItem.Lcy_Amount) }} LAK)
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-swap-horizontal</v-icon>
                  </template>
                  <v-list-item-title>ອັດຕາແລກປ່ຽນ</v-list-item-title>
                  <v-list-item-subtitle>{{ formatNumber(selectedItem.Exch_rate, 6) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>ວັນທີມູນຄ່າ</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedItem.Value_date) }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-code-tags</v-icon>
                  </template>
                  <v-list-item-title>ລະຫັດການເຄື່ອນໄຫວ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.Txn_code?.trn_code }} - {{ selectedItem.Txn_code?.trn_Desc_la }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-calendar-range</v-icon>
                  </template>
                  <v-list-item-title>ຮອບການເງິນ / ໄລຍະ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedItem.fin_cycle?.fin_cycle || '-' }} / {{ selectedItem.Period_code?.period_code || '-' }}
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-shield-check</v-icon>
                  </template>
                  <v-list-item-title>ສະຖານະອະນຸມັດ</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getStatusColor(selectedItem.Auth_Status)"
                      size="small"
                      variant="flat"
                    >
                      {{ getStatusText(selectedItem.Auth_Status) }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
          
          <v-divider class="my-4"></v-divider>
          
          <!-- Additional Text -->
          <div v-if="selectedItem.Addl_text" class="mb-4">
            <h4 class="text-subtitle-2 mb-2">
              <v-icon size="small" class="mr-1">mdi-text</v-icon>
              ຂໍ້ຄວາມເພີ່ມເຕີມ
            </h4>
            <v-card variant="outlined" class="pa-3">
              <p class="text-body-2 mb-0">{{ selectedItem.Addl_text }}</p>
            </v-card>
          </div>
          
          <!-- Maker/Checker Info -->
          <v-row dense>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 mb-2">
                <v-icon size="small" class="mr-1">mdi-account-edit</v-icon>
                ຜູ້ສ້າງ
              </h4>
              <v-card variant="outlined" class="pa-3">
                <div class="text-body-2">
                  <strong>ຊື່ຜູ້ໃຊ້:</strong> {{ selectedItem.Maker_Id?.Username || '-' }}<br>
                  <strong>ວັນທີ:</strong> {{ formatDateTime(selectedItem.Maker_DT_Stamp) }}
                </div>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 mb-2">
                <v-icon size="small" class="mr-1">mdi-account-check</v-icon>
                ຜູ້ອະນຸມັດ
              </h4>
              <v-card variant="outlined" class="pa-3">
                <div class="text-body-2">
                  <strong>ຊື່ຜູ້ໃຊ້:</strong> {{ selectedItem.Checker_Id?.Username || '-' }}<br>
                  <strong>ວັນທີ:</strong> {{ formatDateTime(selectedItem.Checker_DT_Stamp) }}
                </div>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Journal Entries -->
          <div class="mt-4">
            <h4 class="text-subtitle-2 mb-2">
              <v-icon size="small" class="mr-1">mdi-table</v-icon>
              ລາຍການບັນທຶກ ({{ journalEntries.length }} ລາຍການ)
            </h4>
            <v-simple-table density="compact">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th>ລຳດັບ</th>
                    <th>ບັນຊີ</th>
                    <th>ຊື່ບັນຊີ</th>
                    <th class="text-right">ເດບິດ</th>
                    <th class="text-right">ເຄຣດິດ</th>
                    <th>ໝາຍເຫດ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, index) in journalEntries" :key="entry.JRNLentry_Id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ entry.Account?.glsub_code }}</td>
                    <td>{{ entry.Account?.glsub_Desc_la }}</td>
                    <td class="text-right">
                      <span v-if="entry.Dr_cr === 'D'">{{ formatNumber(entry.Fcy_Amount) }}</span>
                    </td>
                    <td class="text-right">
                      <span v-if="entry.Dr_cr === 'C'">{{ formatNumber(entry.Fcy_Amount) }}</span>
                    </td>
                    <td>{{ entry.Addl_sub_text || '-' }}</td>
                  </tr>
                  <tr class="font-weight-bold">
                    <td colspan="3" class="text-right">ລວມ:</td>
                    <td class="text-right">{{ formatNumber(totalDebit) }}</td>
                    <td class="text-right">{{ formatNumber(totalCredit) }}</td>
                    <td>
                      <v-chip 
                        size="x-small" 
                        :color="isBalanced ? 'success' : 'error'"
                        variant="flat"
                      >
                        {{ isBalanced ? 'ສົມດຸນ' : 'ບໍ່ສົມດຸນ' }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            v-if="selectedItem?.Auth_Status === 'U' && canApprove"
            color="success"
            variant="flat"
            @click="approveItem(selectedItem)"
          >
            <v-icon left>mdi-check</v-icon>
            ອະນຸມັດ
          </v-btn>
          <v-btn
            v-if="selectedItem?.Auth_Status === 'U' && canApprove"
            color="error"
            variant="flat"
            @click="rejectItem(selectedItem)"
          >
            <v-icon left>mdi-close</v-icon>
            ປະຕິເສດ
          </v-btn>
          <v-btn
            variant="text"
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

const totalDebit = computed(() => {
  return journalEntries.value
    .filter(e => e.Dr_cr === 'D')
    .reduce((sum, e) => sum + parseFloat(e.Fcy_Amount || 0), 0)
})

const totalCredit = computed(() => {
  return journalEntries.value
    .filter(e => e.Dr_cr === 'C')
    .reduce((sum, e) => sum + parseFloat(e.Fcy_Amount || 0), 0)
})

const isBalanced = computed(() => {
  return Math.abs(totalDebit.value - totalCredit.value) < 0.01
})

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

const viewDetails = async (item) => {
  selectedItem.value = item
  detailsDialog.value = true
  
  // Load journal entries
  try {
    const response = await axios.get('/api/journal-entries/', {
      params: { Reference_No: item.Reference_No },
      ...getAuthHeaders()
    })
    journalEntries.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading journal entries:', error)
    journalEntries.value = []
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
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 2rem;
  font-weight: 300;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.filter-card {
  background: #f8f9fa;
}

.summary-card {
  height: 100%;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-icon {
  margin-bottom: 12px;
}

.summary-value {
  font-size: 2rem;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 0.875rem;
  color: #666;
}

.cursor-pointer {
  cursor: pointer;
}

:deep(.v-data-table) {
  font-size: 0.875rem;
}

:deep(.v-data-table th) {
  font-weight: 600;
  background-color: #f5f5f5;
}

:deep(.v-data-table td) {
  padding: 12px 16px;
}

:deep(.v-simple-table) {
  font-size: 0.875rem;
}

:deep(.v-simple-table thead) {
  background-color: #f5f5f5;
}

:deep(.v-simple-table th) {
  font-weight: 600;
  padding: 8px 12px;
}

:deep(.v-simple-table td) {
  padding: 8px 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .summary-value {
    font-size: 1.5rem;
  }
}
</style>