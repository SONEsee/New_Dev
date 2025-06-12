<template>
  <div class="journal-list-container">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">
        <v-icon left color="primary">mdi-format-list-bulleted</v-icon>
        ລາຍການບັນທຶກບັນຊີ
      </h2>
      <p class="page-subtitle">ຈັດການ ແລະ ກວດສອບລາຍການບັນທຶກບັນຊີ</p>
    </div>

    <!-- Filters Card -->
    <v-card class="filters-card mb-4" elevation="1">
      <v-card-text class="pa-4">
        <v-row dense>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.search"
              label="ຄົ້ນຫາ"
              placeholder="ເລກອ້າງອີງ, ບັນຊີ, ຫມາຍເຫດ..."
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-magnify"
              hide-details="auto"
              @input="debouncedSearch"
              class="compact-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.start_date"
              label="ວັນທີເລີ່ມຕົ້ນ"
              type="date"
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-calendar-start"
              hide-details="auto"
              @change="loadJournalEntries"
              class="compact-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.end_date"
              label="ວັນທີສິ້ນສຸດ"
              type="date"
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-calendar-end"
              hide-details="auto"
              @change="loadJournalEntries"
              class="compact-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.Auth_Status"
              :items="authStatusOptions"
              label="ສະຖານະການອະນຸມັດ"
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-shield-check"
              hide-details="auto"
              @change="loadJournalEntries"
              class="compact-field"
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.Ccy_cd"
              :items="currencies"
              item-title="Ccy_Name_la"
              item-value="ccy_code"
              label="ສະກຸນເງິນ"
              outlined
              dense
              clearable
              prepend-inner-icon="mdi-currency-usd"
              hide-details="auto"
              @change="loadJournalEntries"
              class="compact-field"
            ></v-select>
          </v-col>
          <v-col cols="12" md="1">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="resetFilters"
              class="filter-btn"
            >
              <v-icon size="small">mdi-filter-off</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Action Bar -->
    <div class="action-bar mb-4">
      <div class="action-left">
        <v-chip
          v-if="selectedEntries.length > 0"
          color="primary"
          variant="outlined"
          size="small"
        >
          <v-icon left size="small">mdi-check-circle</v-icon>
          ເລືອກ {{ selectedEntries.length }} ລາຍການ
        </v-chip>
      </div>
      <div class="action-right">
        <v-btn
          v-if="selectedEntries.length > 0"
          color="success"
          size="small"
          variant="outlined"
          @click="authorizeSelected"
          :disabled="loading.authorizeSelected"
          :loading="loading.authorizeSelected"
          class="mr-2"
        >
          <v-icon left size="small">mdi-check-decagram</v-icon>
          ອະນຸມັດທີ່ເລືອກ
        </v-btn>
        <v-btn
          color="info"
          size="small"
          variant="outlined"
          @click="exportData"
          :disabled="loading.export"
          :loading="loading.export"
          class="mr-2"
        >
          <v-icon left size="small">mdi-export</v-icon>
          ສົ່ງອອກ
        </v-btn>
        <v-btn
          color="secondary"
          size="small"
          variant="outlined"
          @click="generateReport"
          :disabled="loading.report"
          :loading="loading.report"
        >
          <v-icon left size="small">mdi-chart-line</v-icon>
          ສາຍງານ
        </v-btn>
      </div>
    </div>

    <!-- Main Data Table -->
    <v-card class="table-card" elevation="2">
      <v-card-text class="pa-0">
        <v-data-table
          v-model="selectedEntries"
          :headers="tableHeaders"
          :items="journalEntries"
          :loading="loading.entries"
          :items-per-page="pagination.itemsPerPage"
          :page="pagination.page"
          :server-items-length="pagination.totalItems"
          show-select
          item-value="JRNLLog_id"
          class="journal-table"
          @update:options="updatePagination"
        >
          <!-- Custom slots for table content -->
          <template v-slot:item.Reference_No="{ item }">
            <div class="reference-cell">
              {{ item.Reference_No }}
              <v-chip
                v-if="getEntriesCountByReference(item.Reference_No) > 1"
                size="x-small"
                color="info"
                variant="outlined"
                class="ml-1"
              >
                {{ getEntriesCountByReference(item.Reference_No) }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.Value_date="{ item }">
            <div class="date-cell">
              {{ formatDate(item.Value_date) }}
            </div>
          </template>

          <template v-slot:item.Account="{ item }">
            <div class="account-cell">
              <div class="account-code">{{ item.account_code }}</div>
              <div class="account-name text-caption">{{ item.account_name }}</div>
            </div>
          </template>

          <template v-slot:item.amounts="{ item }">
            <div class="amounts-cell">
              <div class="fcy-amount">
                <strong>{{ formatNumber(item.Fcy_Amount) }}</strong>
                <span class="currency">{{ item.Ccy_cd }}</span>
              </div>
              <div class="lcy-amount text-caption">
                {{ formatNumber(item.Lcy_Amount) }} LAK
              </div>
            </div>
          </template>

          <template v-slot:item.Dr_cr="{ item }">
            <v-chip
              :color="item.Dr_cr === 'D' ? 'primary' : 'success'"
              size="small"
              variant="flat"
            >
              <v-icon left size="small">
                {{ item.Dr_cr === 'D' ? 'mdi-minus-circle' : 'mdi-plus-circle' }}
              </v-icon>
              {{ item.Dr_cr === 'D' ? 'ເດບິດ' : 'ເຄຣດິດ' }}
            </v-chip>
          </template>

          <template v-slot:item.Auth_Status="{ item }">
            <v-chip
              :color="getAuthStatusColor(item.Auth_Status)"
              size="small"
              variant="flat"
            >
              <v-icon left size="small">{{ getAuthStatusIcon(item.Auth_Status) }}</v-icon>
              {{ getAuthStatusText(item.Auth_Status) }}
            </v-chip>
          </template>

          <template v-slot:item.audit="{ item }">
            <div class="audit-cell">
              <div class="maker text-caption">
                <v-icon size="x-small" class="mr-1">mdi-account-edit</v-icon>
                {{ item.maker_name || item.Maker_Id }}
              </div>
              <div class="date text-caption">{{ formatDateTime(item.Maker_DT_Stamp) }}</div>
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="action-buttons">
              <v-btn
                icon
                size="small"
                color="info"
                @click="viewEntry(item)"
                :title="'ເບິ່ງລາຍລະອຽດ'"
              >
                <v-icon size="small">mdi-eye</v-icon>
              </v-btn>
              
              <v-btn
                v-if="item.Auth_Status === 'U'"
                icon
                size="small"
                color="warning"
                @click="editEntry(item)"
                :title="'ແກ້ໄຂ'"
              >
                <v-icon size="small">mdi-pencil</v-icon>
              </v-btn>
              
              <v-btn
                v-if="item.Auth_Status === 'U'"
                icon
                size="small"
                color="success"
                @click="authorizeEntry(item)"
                :title="'ອະນຸມັດ'"
              >
                <v-icon size="small">mdi-check</v-icon>
              </v-btn>
              
              <v-btn
                icon
                size="small"
                color="secondary"
                @click="checkBalance(item.Reference_No)"
                :title="'ກວດສອບຍອດ'"
              >
                <v-icon size="small">mdi-scale-balance</v-icon>
              </v-btn>
              
              <v-btn
                v-if="item.Auth_Status === 'U'"
                icon
                size="small"
                color="error"
                @click="deleteEntry(item)"
                :title="'ລຶບ'"
              >
                <v-icon size="small">mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="empty-state">
              <v-icon size="64" color="grey">mdi-database-search</v-icon>
              <h3>ບໍ່ພົບຂໍ້ມູນ</h3>
              <p>ລອງປ່ຽນຕົວກອງຫຼືລຶບຕົວກອງອອກ</p>
            </div>
          </template>

          <!-- Loading state -->
          <template v-slot:loading>
            <div class="loading-state">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <p class="mt-2">ກຳລັງໂຫລດຂໍ້ມູນ...</p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Summary Cards -->
    <div class="summary-cards mt-4">
      <v-row>
        <v-col cols="12" md="3">
          <v-card class="summary-card" elevation="1">
            <v-card-text class="pa-3 text-center">
              <v-icon color="primary" size="large" class="mb-2">mdi-format-list-numbered</v-icon>
              <div class="summary-title">ລາຍການທັງໝົດ</div>
              <div class="summary-value text-primary">{{ pagination.totalItems }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="summary-card" elevation="1">
            <v-card-text class="pa-3 text-center">
              <v-icon color="success" size="large" class="mb-2">mdi-check-decagram</v-icon>
              <div class="summary-title">ອະນຸມັດແລ້ວ</div>
              <div class="summary-value text-success">{{ summaryStats.authorized }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="summary-card" elevation="1">
            <v-card-text class="pa-3 text-center">
              <v-icon color="warning" size="large" class="mb-2">mdi-clock-outline</v-icon>
              <div class="summary-title">ລໍຖ້າອະນຸມັດ</div>
              <div class="summary-value text-warning">{{ summaryStats.pending }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="summary-card" elevation="1">
            <v-card-text class="pa-3 text-center">
              <v-icon color="info" size="large" class="mb-2">mdi-calendar-today</v-icon>
              <div class="summary-title">ມື້ນີ້</div>
              <div class="summary-value text-info">{{ summaryStats.today }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- View Dialog -->
    <v-dialog v-model="dialogs.view" max-width="800px" scrollable>
      <v-card v-if="selectedEntry">
        <v-card-title class="dialog-title">
          <v-icon left color="info">mdi-eye</v-icon>
          ລາຍລະອຽດບັນທຶກບັນຊີ
          <v-spacer></v-spacer>
          <v-btn icon @click="dialogs.view = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ເລກອ້າງອີງ:</strong> {{ selectedEntry.Reference_No }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ວັນທີ:</strong> {{ formatDate(selectedEntry.Value_date) }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ບັນຊີ:</strong> {{ selectedEntry.account_code }} - {{ selectedEntry.account_name }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ປະເພດ:</strong> {{ selectedEntry.Dr_cr === 'D' ? 'ເດບິດ' : 'ເຄຣດິດ' }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ຈຳນວນເງິນ:</strong> {{ formatNumber(selectedEntry.Fcy_Amount) }} {{ selectedEntry.Ccy_cd }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ຈຳນວນກີບ:</strong> {{ formatNumber(selectedEntry.Lcy_Amount) }} LAK
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ອັດຕາແລກປ່ຽນ:</strong> {{ formatNumber(selectedEntry.Exch_rate) }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ສະຖານະ:</strong> 
                <v-chip :color="getAuthStatusColor(selectedEntry.Auth_Status)" size="small">
                  {{ getAuthStatusText(selectedEntry.Auth_Status) }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="detail-item">
                <strong>ຫມາຍເຫດ:</strong> {{ selectedEntry.Addl_text || '-' }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ຜູ້ສ້າງ:</strong> {{ selectedEntry.maker_name || selectedEntry.Maker_Id }}
                <br>
                <small>{{ formatDateTime(selectedEntry.Maker_DT_Stamp) }}</small>
              </div>
            </v-col>
            <v-col cols="12" md="6" v-if="selectedEntry.Checker_Id">
              <div class="detail-item">
                <strong>ຜູ້ກວດສອບ:</strong> {{ selectedEntry.checker_name || selectedEntry.Checker_Id }}
                <br>
                <small>{{ formatDateTime(selectedEntry.Checker_DT_Stamp) }}</small>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="selectedEntry.Auth_Status === 'U'"
            color="success"
            @click="authorizeEntry(selectedEntry)"
          >
            <v-icon left>mdi-check</v-icon>
            ອະນຸມັດ
          </v-btn>
          <v-btn
            color="secondary"
            @click="checkBalance(selectedEntry.Reference_No)"
          >
            <v-icon left>mdi-scale-balance</v-icon>
            ກວດສອບຍອດ
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="dialogs.view = false">ປິດ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'

// Reactive data
const journalEntries = ref([])
const selectedEntries = ref([])
const selectedEntry = ref(null)
const currencies = ref([])

const filters = reactive({
  search: '',
  start_date: '',
  end_date: '',
  Auth_Status: '',
  Ccy_cd: ''
})

const loading = reactive({
  entries: false,
  authorizeSelected: false,
  export: false,
  report: false
})

const dialogs = reactive({
  view: false,
  edit: false
})

const pagination = reactive({
  page: 1,
  itemsPerPage: 25,
  totalItems: 0
})

const summaryStats = reactive({
  authorized: 0,
  pending: 0,
  today: 0
})

// Table configuration
const tableHeaders = [
  { title: 'ເລກອ້າງອີງ', key: 'Reference_No', sortable: true, width: '150px' },
  { title: 'ວັນທີ', key: 'Value_date', sortable: true, width: '120px' },
  { title: 'ບັນຊີ', key: 'Account', sortable: false, width: '200px' },
  { title: 'ຈຳນວນເງິນ', key: 'amounts', sortable: false, width: '150px' },
  { title: 'ປະເພດ', key: 'Dr_cr', sortable: true, width: '100px' },
  { title: 'ສະຖານະ', key: 'Auth_Status', sortable: true, width: '120px' },
  { title: 'ຜູ້ສ້າງ', key: 'audit', sortable: false, width: '150px' },
  { title: 'ການດຳເນີນການ', key: 'actions', sortable: false, width: '200px' }
]

const authStatusOptions = [
  { title: 'ອະນຸມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' },
  { title: 'ປະຕິເສດ', value: 'R' }
]

// API configuration
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Computed properties
const entriesCountByReference = computed(() => {
  const counts = {}
  journalEntries.value.forEach(entry => {
    counts[entry.Reference_No] = (counts[entry.Reference_No] || 0) + 1
  })
  return counts
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  }).format(num || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('en-GB')
}

const getAuthStatusColor = (status) => {
  switch (status) {
    case 'A': return 'success'
    case 'U': return 'warning'
    case 'R': return 'error'
    default: return 'grey'
  }
}

const getAuthStatusIcon = (status) => {
  switch (status) {
    case 'A': return 'mdi-check-decagram'
    case 'U': return 'mdi-clock-outline'
    case 'R': return 'mdi-close-circle'
    default: return 'mdi-help-circle'
  }
}

const getAuthStatusText = (status) => {
  switch (status) {
    case 'A': return 'ອະນຸມັດແລ້ວ'
    case 'U': return 'ລໍຖ້າອະນຸມັດ'
    case 'R': return 'ປະຕິເສດ'
    default: return 'ບໍ່ຮູ້'
  }
}

const getEntriesCountByReference = (refNo) => {
  return entriesCountByReference.value[refNo] || 1
}

// Debounced search function
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadJournalEntries()
  }, 500)
}

const loadJournalEntries = async () => {
  try {
    loading.entries = true
    
    const params = {
      page: pagination.page,
      page_size: pagination.itemsPerPage,
      ...filters
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    console.log('Loading journal entries with params:', params)
    
    const response = await axios.get('/api/journal-entries/', {
      params,
      ...getAuthHeaders()
    })

    console.log('Journal entries response:', response.data);
    
    
    if (Array.isArray(response.data)) {
      journalEntries.value = response.data
      pagination.totalItems = response.data.length
    } else if (response.data.results) {
      journalEntries.value = response.data.results
      pagination.totalItems = response.data.count || response.data.results.length
    } else {
      journalEntries.value = []
      pagination.totalItems = 0
    }

    updateSummaryStats()
    
  } catch (error) {
    console.error('Error loading journal entries:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.entries = false
  }
}

const updateSummaryStats = () => {
  const today = new Date().toISOString().substr(0, 10)
  
  summaryStats.authorized = journalEntries.value.filter(e => e.Auth_Status === 'A').length
  summaryStats.pending = journalEntries.value.filter(e => e.Auth_Status === 'U').length
  summaryStats.today = journalEntries.value.filter(e => {
    const entryDate = new Date(e.Value_date).toISOString().substr(0, 10)
    return entryDate === today
  }).length
}

const updatePagination = (options) => {
  pagination.page = options.page
  pagination.itemsPerPage = options.itemsPerPage
  loadJournalEntries()
}

const resetFilters = () => {
  Object.assign(filters, {
    search: '',
    start_date: '',
    end_date: '',
    Auth_Status: '',
    Ccy_cd: ''
  })
  pagination.page = 1
  loadJournalEntries()
}

const viewEntry = (entry) => {
  selectedEntry.value = entry
  dialogs.view = true
}

const editEntry = (entry) => {
  // Navigate to edit page or open edit dialog
  Swal.fire({
    icon: 'info',
    title: 'ຟັງຊັນແກ້ໄຂ',
    text: 'ຟັງຊັນແກ້ໄຂຈະຖືກພັດທະນາໃນອະນາຄົດ',
    confirmButtonText: 'ຕົກລົງ'
  })
}

const authorizeEntry = async (entry) => {
  try {
    const result = await Swal.fire({
      icon: 'question',
      title: 'ຢືນຢັນການອະນຸມັດ',
      text: `ທ່ານຕ້ອງການອະນຸມັດລາຍການ ${entry.Reference_No} ບໍ?`,
      showCancelButton: true,
      confirmButtonText: 'ອະນຸມັດ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#4caf50'
    })
    
    if (result.isConfirmed) {
      await axios.post(`/api/journal-entries/${entry.JRNLLog_id}/authorize/`, {}, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ!',
        text: 'ອະນຸມັດລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      loadJournalEntries()
    }
  } catch (error) {
    console.error('Error authorizing entry:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດອະນຸມັດລາຍການໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  }
}

const authorizeSelected = async () => {
  if (selectedEntries.value.length === 0) return
  
  try {
    const result = await Swal.fire({
      icon: 'question',
      title: 'ຢືນຢັນການອະນຸມັດ',
      text: `ທ່ານຕ້ອງການອະນຸມັດ ${selectedEntries.value.length} ລາຍການທີ່ເລືອກບໍ?`,
      showCancelButton: true,
      confirmButtonText: 'ອະນຸມັດ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#4caf50'
    })
    
    if (result.isConfirmed) {
      loading.authorizeSelected = true
      
      // Group by reference number for batch authorization
      const referenceGroups = {}
      selectedEntries.value.forEach(id => {
        const entry = journalEntries.value.find(e => e.JRNLLog_id === id)
        if (entry && entry.Auth_Status === 'U') {
          if (!referenceGroups[entry.Reference_No]) {
            referenceGroups[entry.Reference_No] = []
          }
          referenceGroups[entry.Reference_No].push(entry)
        }
      })
      
      // Authorize by reference number
      const promises = Object.keys(referenceGroups).map(refNo => 
        axios.post('/api/journal-entries/authorize_batch/', { reference_no: refNo }, getAuthHeaders())
      )
      
      await Promise.all(promises)
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ!',
        text: `ອະນຸມັດ ${Object.keys(referenceGroups).length} ລາຍການອ້າງອີງສຳເລັດແລ້ວ`,
        timer: 3000,
        showConfirmButton: false
      })
      
      selectedEntries.value = []
      loadJournalEntries()
    }
  } catch (error) {
    console.error('Error authorizing selected entries:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດອະນຸມັດລາຍການທີ່ເລືອກໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.authorizeSelected = false
  }
}

const checkBalance = async (referenceNo) => {
  try {
    const response = await axios.get('/api/journal-entries/balance_check/', {
      params: { reference_no: referenceNo },
      ...getAuthHeaders()
    })
    
    const balanceInfo = response.data
    const icon = balanceInfo.overall_balanced ? 'success' : 'warning'
    const title = balanceInfo.overall_balanced ? 'ສົມດຸນແລ້ວ' : 'ບໍ່ສົມດຸນ'
    
    Swal.fire({
      icon: icon,
      title: title,
      html: `
        <div style="text-align: left;">
          <p><strong>ເລກອ້າງອີງ:</strong> ${balanceInfo.reference_no}</p>
          <p><strong>ຈຳນວນລາຍການ:</strong> ${balanceInfo.entry_count}</p>
          <p><strong>ລວມເດບິດ:</strong> ${formatNumber(balanceInfo.lcy_totals.debit)} LAK</p>
          <p><strong>ລວມເຄຣດິດ:</strong> ${formatNumber(balanceInfo.lcy_totals.credit)} LAK</p>
          ${!balanceInfo.overall_balanced ? `<p><strong>ຄວາມແຕກຕ່າງ:</strong> ${formatNumber(Math.abs(balanceInfo.lcy_totals.debit - balanceInfo.lcy_totals.credit))} LAK</p>` : ''}
        </div>
      `,
      confirmButtonText: 'ຕົກລົງ'
    })
  } catch (error) {
    console.error('Error checking balance:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດກວດສອບຍອດໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  }
}

const deleteEntry = async (entry) => {
  try {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ຢືນຢັນການລຶບ',
      text: `ທ່ານຕ້ອງການລຶບລາຍການ ${entry.Reference_No} ບໍ?`,
      showCancelButton: true,
      confirmButtonText: 'ລຶບ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#f44336'
    })
    
    if (result.isConfirmed) {
      await axios.delete(`/api/journal-entries/${entry.JRNLLog_id}/`, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ!',
        text: 'ລຶບລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      loadJournalEntries()
    }
  } catch (error) {
    console.error('Error deleting entry:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດລຶບລາຍການໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  }
}

const exportData = async () => {
  try {
    loading.export = true
    
    const params = { ...filters, export: 'csv' }
    const response = await axios.get('/api/journal-entries/', {
      params,
      ...getAuthHeaders(),
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `journal_entries_${new Date().toISOString().substr(0, 10)}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ!',
      text: 'ສົ່ງອອກຂໍ້ມູນສຳເລັດແລ້ວ',
      timer: 2000,
      showConfirmButton: false
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດສົ່ງອອກຂໍ້ມູນໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.export = false
  }
}

const generateReport = async () => {
  try {
    loading.report = true
    
    const response = await axios.get('/api/journal-entries/summary_report/', {
      params: filters,
      ...getAuthHeaders()
    })
    
    const report = response.data
    
    Swal.fire({
      icon: 'info',
      title: 'ສາຍງານສະຫຼຸບ',
      html: `
        <div style="text-align: left;">
          <h4>ໄລຍະ: ${filters.start_date || 'ທັງໝົດ'} - ${filters.end_date || 'ປັດຈຸບັນ'}</h4>
          <hr>
          <p><strong>ລາຍການທັງໝົດ:</strong> ${report.summary.total_entries}</p>
          <p><strong>ອະນຸມັດແລ້ວ:</strong> ${report.summary.authorized_count}</p>
          <p><strong>ລໍຖ້າອະນຸມັດ:</strong> ${report.summary.unauthorized_count}</p>
          <p><strong>ຈຳນວນເງິນລວມ (LAK):</strong> ${formatNumber(report.summary.total_lcy_amount)}</p>
        </div>
      `,
      confirmButtonText: 'ຕົກລົງ',
      width: '600px'
    })
  } catch (error) {
    console.error('Error generating report:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດສ້າງສາຍງານໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.report = false
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

// Watchers
watch(() => filters.start_date, (newVal) => {
  if (newVal && !filters.end_date) {
    filters.end_date = newVal
  }
})

// Lifecycle
onMounted(() => {
  loadJournalEntries()
  loadCurrencies()
})
</script>

<style scoped>
.journal-list-container {
  max-width: 2200px;
  margin: 0 auto;
  padding: 16px;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 300;
  color: #1976d2;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.filters-card {
  border-radius: 12px;
}

.compact-field :deep(.v-field__input) {
  min-height: 76px;
  padding: 8px 12px;
}

.filter-btn {
  width: 100%;
  height: 40px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.action-left, .action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* .table-card {
  border-radius: 12px;
}

.journal-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
} */

.table-card {
  border-radius: 12px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

.journal-table {
  min-width: 1600px; /* or any width you want for your columns */
  width: 100%;
}
.journal-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
  min-width: 1200px; /* adjust as needed */
}
.reference-cell {
  display: flex;
  align-items: center;
}

.account-cell .account-code {
  font-weight: 600;
  font-size: 0.875rem;
}

.account-cell .account-name {
  color: #666;
  font-size: 0.75rem;
}

.amounts-cell .fcy-amount {
  font-weight: 600;
  font-size: 0.875rem;
}

.amounts-cell .currency {
  font-size: 0.75rem;
  color: #666;
  margin-left: 4px;
}

.amounts-cell .lcy-amount {
  color: #666;
  font-size: 0.75rem;
}

.audit-cell {
  font-size: 0.75rem;
}

.audit-cell .maker {
  color: #666;
  margin-bottom: 2px;
}

.audit-cell .date {
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
}

.summary-cards .summary-card {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.summary-cards .summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.summary-title {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.dialog-title {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.detail-item {
  margin-bottom: 12px;
  font-size: 0.875rem;
}

.detail-item strong {
  color: #424242;
}

.date-cell {
  font-size: 0.875rem;
  white-space: nowrap;
}

/* Responsive design */
@media (max-width: 768px) {
  .journal-list-container {
    padding: 8px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-left, .action-right {
    justify-content: center;
  }
  
  .action-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>