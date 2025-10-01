<template>
  <v-container fluid>
    <h1 class="page-title">
      <v-icon size="32" color="primary">mdi-magnify</v-icon>
      ຄົ້ນຫາບັນຊີ - Account Statement Search
    </h1>
    
    <!-- Search Form Card -->
    <v-card class="search-card elevation-2">
      <v-card-title class="bg-primary text-white">
        <v-icon start>mdi-filter</v-icon>
        ຟອມຄົ້ນຫາ
      </v-card-title>
      
      <v-card-text class="pa-6">
        <v-form ref="searchForm" v-model="formValid">
          <v-row>
            <!-- Account Number - Now Optional -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchParams.gl_code"
                label="ເລກບັນຊີ (Account Number)"
                placeholder="1234567 (ທາງເລືອກ - Optional)"
                :rules="accountRules"
                prepend-inner-icon="mdi-card-account-details"
                variant="outlined"
                density="comfortable"
                maxlength="25"
                counter
                clearable
                hint="ປ່ອຍວ່າງເພື່ອຄົ້ນຫາທຸກບັນຊີ (7+ ຫຼັກ)"
                persistent-hint
              />
            </v-col>
            
            <!-- Currency Code -->
            <v-col cols="12" md="6">
              <v-select
                v-model="searchParams.currency_code"
                :items="currencies"
                item-title="text"
                item-value="value"
                label="ສະກຸນເງິນ (Currency) *"
                :rules="requiredRules"
                prepend-inner-icon="mdi-currency-usd"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            
            <!-- Start Date -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchParams.date_start"
                label="ວັນທີ່ເລີ່ມຕົ້ນ (Start Date) *"
                type="date"
                :rules="dateRules"
                prepend-inner-icon="mdi-calendar-start"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            
            <!-- End Date -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchParams.date_end"
                label="ວັນທີ່ສິ້ນສຸດ (End Date) *"
                type="date"
                :rules="dateRules"
                prepend-inner-icon="mdi-calendar-end"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <v-btn
          color="grey"
          variant="outlined"
          prepend-icon="mdi-refresh"
          @click="resetForm"
          :disabled="loading"
        >
          ລ້າງຟອມ
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-magnify"
          @click="searchAccount"
          :loading="loading"
          :disabled="!formValid"
        >
          ຄົ້ນຫາ
        </v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- Results Section -->
    <div v-if="searchResult">
      <!-- Account Info Card -->
      <v-card class="result-card elevation-2">
        <div class="account-header">
          <v-row align="center">
            <v-col cols="12" md="4">
              <div class="text-subtitle-2">ເລກບັນຊີ</div>
              <div class="text-h5 font-weight-bold">
                {{ searchResult.account_info?.gl_code || 'ທຸກບັນຊີ' }}
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-subtitle-2">ສະກຸນເງິນ</div>
              <div class="text-h5 font-weight-bold">{{ searchResult.account_info.currency_code }}</div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-subtitle-2">ຍອດເປີດບັນຊີ (Opening Balance)</div>
              <div class="balance-display">{{ formatCurrency(searchResult.account_info.open_balance) }}</div>
            </v-col>
          </v-row>
        </div>
        
        <v-card-text>
          <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
            <div class="text-h6">
              <v-icon start color="primary">mdi-format-list-bulleted</v-icon>
              ລາຍການເຄື່ອນໄຫວ ({{ transactionCount }} ລາຍການ)
            </div>
            <div class="d-flex align-center gap-2">
              <v-chip color="primary" variant="outlined">
                {{ formatDate(searchResult.account_info.date_start) }} - 
                {{ formatDate(searchResult.account_info.date_end) }}
              </v-chip>
              <v-btn
                icon="mdi-download"
                size="small"
                variant="text"
                color="primary"
                @click="exportData"
                title="ດາວໂຫຼດ CSV"
              />
              <v-btn
                icon="mdi-printer"
                size="small"
                variant="text"
                color="primary"
                @click="printData"
                title="ພິມ"
              />
            </div>
          </div>
          
          <!-- Summary Cards -->
          <v-row class="mb-4">
            <v-col cols="12" sm="6" md="3">
              <v-card class="summary-card" color="success" variant="tonal">
                <v-card-text>
                  <div class="text-subtitle-2">ລວມເດບິດ (Total DR)</div>
                  <div class="text-h6 font-weight-bold">{{ formatCurrency(totalDebit) }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card class="summary-card" color="error" variant="tonal">
                <v-card-text>
                  <div class="text-subtitle-2">ລວມເຄຣດິດ (Total CR)</div>
                  <div class="text-h6 font-weight-bold">{{ formatCurrency(totalCredit) }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card class="summary-card" color="info" variant="tonal">
                <v-card-text>
                  <div class="text-subtitle-2">ຍອດເປີດ (Opening)</div>
                  <div class="text-h6 font-weight-bold">{{ formatCurrency(searchResult.account_info.open_balance) }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-card class="summary-card" color="primary" variant="tonal">
                <v-card-text>
                  <div class="text-subtitle-2">ຍອດປິດ (Closing)</div>
                  <div class="text-h6 font-weight-bold">{{ formatCurrency(closingBalance) }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Transactions Table -->
          <div v-if="transactions.length > 0" class="table-container">
            <v-data-table
              :headers="tableHeaders"
              :items="transactions"
              :items-per-page="10"
              class="data-table elevation-1"
              :loading="loading"
            >
              <template #item.GL_Code_7="{ item }">
                <span>{{ item.GL_Code_7 }}</span>
              </template>
              <template #item.T_DATE="{ item }">
                <span>{{ formatDate(item.T_DATE) }}</span>
              </template>
              
              <template #item.TRN_DESC="{ item }">
                <span class="text-truncate" style="max-width: 300px; display: inline-block;" :title="item.TRN_DESC">
                  {{ item.TRN_DESC }}
                </span>
              </template>
              
              <template #item.DR="{ item }">
                <span :class="item.DR > 0 ? 'positive-amount' : ''">
                  {{ formatCurrency(item.DR) }}
                </span>
              </template>
              
              <template #item.CR="{ item }">
                <span :class="item.CR > 0 ? 'negative-amount' : ''">
                  {{ formatCurrency(item.CR) }}
                </span>
              </template>
              
              <template #item.BALANCE="{ item }">
                <v-chip
                  :color="item.BALANCE >= 0 ? 'success' : 'error'"
                  variant="flat"
                  size="small"
                >
                  {{ formatCurrency(item.BALANCE) }}
                </v-chip>
              </template>
            </v-data-table>
          </div>
          
          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="text-h6 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
            <div class="text-body-2">ບໍ່ພົບລາຍການເຄື່ອນໄຫວໃນຊ່ວງເວລາທີ່ເລືອກ</div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      <v-icon start>{{ snackbar.icon }}</v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/helpers/axios'

// =============================================
// AUTHENTICATION
// =============================================
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

// =============================================
// STATE
// =============================================
const searchForm = ref(null)
const formValid = ref(false)
const loading = ref(false)
const searchResult = ref(null)

const searchParams = ref({
  gl_code: '',
  currency_code: 'LAK',
  date_start: '',
  date_end: ''
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// =============================================
// DATA
// =============================================
const currencies = [
  { text: 'LAK - ກີບ', value: 'LAK' },
  { text: 'USD - ໂດລາ', value: 'USD' },
  { text: 'THB - ບາດ', value: 'THB' },
  { text: 'EUR - ເອີໂຣ', value: 'EUR' },
  { text: 'CNY - ຢວນ', value: 'CNY' }
]

const tableHeaders = [
  { title: 'ລໍາດັບ', key: 'rID', align: 'center', width: '80px' },
  { title: 'ວັນທີ່', key: 'T_DATE', align: 'center', width: '80px' },
  { title: 'ເລກບັນຊີ', key: 'GL_Code_7', align: 'center', width: '120px' },
  { title: 'ລາຍລະອຽດ', key: 'TRN_DESC', align: 'start' },
  { title: 'ເດບິດ (DR)', key: 'DR', align: 'end', width: '140px' },
  { title: 'ເຄຣດິດ (CR)', key: 'CR', align: 'end', width: '140px' },
  { title: 'ຍອດເງິນ (Balance)', key: 'BALANCE', align: 'end', width: '160px' }
]

// =============================================
// VALIDATION - Updated for 7+ digits
// =============================================
const accountRules = [
  v => {
    if (!v || v.trim() === '') return true // Allow empty
    const cleaned = String(v).trim()
    return (/^\d+$/.test(cleaned) && cleaned.length >= 7) || 'ເລກບັນຊີຕ້ອງເປັນຕົວເລກຢ່າງໜ້ອຍ 7 ຫຼັກ'
  }
]

const requiredRules = [
  v => !!v || 'ກະລຸນາປ້ອນຂໍ້ມູນ'
]

const dateRules = [
  v => !!v || 'ກະລຸນາເລືອກວັນທີ່',
  v => /^\d{4}-\d{2}-\d{2}$/.test(v) || 'ຮູບແບບວັນທີ່ບໍ່ຖືກຕ້ອງ'
]

// =============================================
// COMPUTED
// =============================================
const transactions = computed(() => searchResult.value?.transactions || [])
const transactionCount = computed(() => transactions.value.length)
const totalDebit = computed(() => transactions.value.reduce((sum, item) => sum + (parseFloat(item.DR) || 0), 0))
const totalCredit = computed(() => transactions.value.reduce((sum, item) => sum + (parseFloat(item.CR) || 0), 0))
const closingBalance = computed(() => {
  if (transactions.value.length === 0) return 0
  return transactions.value[transactions.value.length - 1].BALANCE || 0
})

// =============================================
// HELPERS
// =============================================
const formatCurrency = (value) => {
  if (!value && value !== 0) return '0.00'
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatDateInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const showNotification = (message, color = 'success', icon = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

const handleAPIError = (error) => {
  let errorMessage = 'ມີຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ລະບົບ'
  
  if (error.message === 'Authentication token not found') {
    errorMessage = 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ'
  } else if (error.response) {
    const status = error.response.status
    const data = error.response.data
    
    if (status === 400) errorMessage = data.message || 'ຂໍ້ມູນທີ່ສົ່ງບໍ່ຖືກຕ້ອງ'
    else if (status === 401) errorMessage = 'ໝົດອາຍຸການເຂົ້າສູ່ລະບົບ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
    else if (status === 403) errorMessage = 'ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຂໍ້ມູນນີ້'
    else if (status === 404) errorMessage = 'ບໍ່ພົບຂໍ້ມູນທີ່ຄົ້ນຫາ'
    else if (status === 500) errorMessage = data.message || 'ມີຂໍ້ຜິດພາດໃນລະບົບ'
    else errorMessage = data.message || 'ມີຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ'
  } else if (error.request) {
    errorMessage = 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີໄດ້'
  }
  
  return errorMessage
}

// =============================================
// MAIN METHODS
// =============================================
const searchAccount = async () => {
  try {
    const { valid } = await searchForm.value.validate()
    if (!valid) {
      showNotification('ກະລຸນາກວດສອບຂໍ້ມູນ', 'error', 'mdi-alert-circle')
      return
    }
    
    // Validate date range
    const startDate = new Date(searchParams.value.date_start)
    const endDate = new Date(searchParams.value.date_end)
    if (startDate > endDate) {
      showNotification('ວັນທີ່ເລີ່ມຕົ້ນຕ້ອງມາກ່ອນຫຼືເທົ່າກັບວັນທີ່ສິ້ນສຸດ', 'error', 'mdi-alert-circle')
      return
    }
    
    loading.value = true
    searchResult.value = null
    
    // Prepare request - send null if gl_code is empty
    const requestData = {
      ...searchParams.value,
      gl_code: searchParams.value.gl_code?.trim() || null
    }
    
    const response = await axios.post(
      'api/account/statement/search/eoc',
      requestData,
      getAuthHeaders()
    )
    
    if (response.data.status === 'success') {
      searchResult.value = response.data.data
      showNotification(response.data.message, 'success', 'mdi-check-circle')
    } else {
      showNotification(response.data.message, 'error', 'mdi-alert-circle')
    }
  } catch (error) {
    console.error('Search error:', error)
    showNotification(handleAPIError(error), 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  searchForm.value.reset()
  searchResult.value = null
  
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  
  searchParams.value = {
    gl_code: '',
    currency_code: 'LAK',
    date_start: formatDateInput(firstDay),
    date_end: formatDateInput(today)
  }
}

const exportData = () => {
  if (!transactions.value.length) {
    showNotification('ບໍ່ມີຂໍ້ມູນເພື່ອດາວໂຫຼດ', 'warning', 'mdi-alert')
    return
  }
  
  try {
    const accountInfo = searchResult.value.account_info
    const headerInfo = [
      `Account Statement Report`,
      `Account Number: ${accountInfo.gl_code || 'All Accounts'}`,
      `Currency: ${accountInfo.currency_code}`,
      `Period: ${formatDate(accountInfo.date_start)} - ${formatDate(accountInfo.date_end)}`,
      `Opening Balance: ${formatCurrency(accountInfo.open_balance)}`,
      `Closing Balance: ${formatCurrency(closingBalance.value)}`,
      `Total Debit: ${formatCurrency(totalDebit.value)}`,
      `Total Credit: ${formatCurrency(totalCredit.value)}`,
      ``,
      ``
    ]
    
    const headers = ['No,Date,Description,Debit,Credit,Balance']
    const csvRows = transactions.value.map(row => [
      row.rID,
      formatDate(row.T_DATE),
      `"${row.TRN_DESC.replace(/"/g, '""')}"`,
      row.DR || 0,
      row.CR || 0,
      row.BALANCE
    ].join(','))
    
    const csvContent = [...headerInfo, ...headers, ...csvRows].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    const fileName = `account_statement_${searchParams.value.gl_code || 'all'}_${formatDateInput(new Date())}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showNotification('ດາວໂຫຼດສໍາເລັດ', 'success', 'mdi-check-circle')
  } catch (error) {
    console.error('Export error:', error)
    showNotification('ມີຂໍ້ຜິດພາດໃນການດາວໂຫຼດ', 'error', 'mdi-alert-circle')
  }
}

const printData = () => {
  if (!transactions.value.length) {
    showNotification('ບໍ່ມີຂໍ້ມູນເພື່ອພິມ', 'warning', 'mdi-alert')
    return
  }
  
  try {
    const printWindow = window.open('', '', 'width=800,height=600')
    
    const accountInfo = searchResult.value.account_info
    const tableRows = transactions.value.map(row => {
      return '<tr>' +
        '<td class="text-center">' + row.rID + '</td>' +
        '<td class="text-center">' + formatDate(row.T_DATE) + '</td>' +
        '<td>' + row.TRN_DESC + '</td>' +
        '<td class="text-right">' + formatCurrency(row.DR) + '</td>' +
        '<td class="text-right">' + formatCurrency(row.CR) + '</td>' +
        '<td class="text-right">' + formatCurrency(row.BALANCE) + '</td>' +
        '</tr>'
    }).join('')
    
    const printContent = '<!DOCTYPE html>' +
      '<html>' +
      '<head>' +
      '<title>Account Statement - ' + accountInfo.gl_code + '</title>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; padding: 20px; }' +
      '.header { text-align: center; margin-bottom: 30px; }' +
      '.info-section { margin-bottom: 20px; }' +
      '.info-row { display: flex; justify-content: space-between; padding: 5px 0; }' +
      'table { width: 100%; border-collapse: collapse; margin-top: 20px; }' +
      'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }' +
      'th { background-color: #f2f2f2; font-weight: bold; }' +
      '.text-right { text-align: right; }' +
      '.text-center { text-align: center; }' +
      '.summary { margin-top: 20px; font-weight: bold; }' +
      '@media print { body { padding: 10px; } }' +
      '</style>' +
      '</head>' +
      '<body>' +
      '<div class="header">' +
      '<h2>Account Statement Report</h2>' +
      '<p>ລາຍງານບັນຊີ</p>' +
      '</div>' +
      '<div class="info-section">' +
      '<div class="info-row">' +
      '<span><strong>Account Number:</strong> ' + accountInfo.gl_code + '</span>' +
      '<span><strong>Currency:</strong> ' + accountInfo.currency_code + '</span>' +
      '</div>' +
      '<div class="info-row">' +
      '<span><strong>Period:</strong> ' + formatDate(accountInfo.date_start) + ' - ' + formatDate(accountInfo.date_end) + '</span>' +
      '<span><strong>Opening Balance:</strong> ' + formatCurrency(accountInfo.open_balance) + '</span>' +
      '</div>' +
      '</div>' +
      '<table>' +
      '<thead>' +
      '<tr>' +
      '<th class="text-center">No</th>' +
      '<th class="text-center">Date</th>' +
      '<th>Description</th>' +
      '<th class="text-right">Debit</th>' +
      '<th class="text-right">Credit</th>' +
      '<th class="text-right">Balance</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      tableRows +
      '</tbody>' +
      '</table>' +
      '<div class="summary">' +
      '<div class="info-row">' +
      '<span>Total Debit: ' + formatCurrency(totalDebit.value) + '</span>' +
      '<span>Total Credit: ' + formatCurrency(totalCredit.value) + '</span>' +
      '<span>Closing Balance: ' + formatCurrency(closingBalance.value) + '</span>' +
      '</div>' +
      '</div>' +
      '<script>' +
      'window.onload = function () { window.print(); };' +
      '<\/script>' +
      '</body>' +
      '</html>'
    
    printWindow.document.write(printContent)
    printWindow.document.close()
    
  } catch (error) {
    console.error('Print error:', error)
    showNotification('ມີຂໍ້ຜິດພາດໃນການພິມ', 'error', 'mdi-alert-circle')
  }
}


// =============================================
// LIFECYCLE
// =============================================
onMounted(() => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  
  searchParams.value.date_start = formatDateInput(firstDay)
  searchParams.value.date_end = formatDateInput(today)
})
</script>

<style scoped>
.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-card,
.result-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.account-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px 8px 0 0;
}

.balance-display {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 8px;
}

.summary-card {
  border-radius: 8px;
  transition: transform 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
}

.positive-amount {
  color: #2e7d32;
  font-weight: 600;
}

.negative-amount {
  color: #c62828;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #757575;
}

.empty-state-icon {
  font-size: 72px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .balance-display {
    font-size: 1.5rem;
  }
}
</style>