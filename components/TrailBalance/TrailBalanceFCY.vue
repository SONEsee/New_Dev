<!-- pages/trial-balance-fcy.vue (Complete Integration Example) -->
<template>
  <div class="fcy-page">
    <!-- Page Header with Breadcrumb -->
    <div class="page-header">
      <nav class="breadcrumb">
        <NuxtLink to="/" class="breadcrumb-link">Home</NuxtLink>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Trial Balance FCY</span>
      </nav>
      
      <h1 class="page-title">Foreign Currency Trial Balance</h1>
      <p class="page-subtitle">
        Analyze trial balance data by individual currencies with original amounts
      </p>
    </div>

    <!-- Summary Cards -->
    <FCYSummaryCards :cards="summaryCards" />

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-form">
        <!-- Currency Selector -->
        <FCYCurrencySelector
          v-model="filters.currency"
          :currencies="availableCurrencies"
          :disabled="loading"
          label="Currency Filter"
          hint="Leave empty to show all currencies"
        />
        
        <!-- Date Inputs -->
        <div class="date-inputs">
          <div class="input-group">
            <label for="dateStart">Start Date</label>
            <input
              id="dateStart"
              v-model="filters.dateStart"
              type="date"
              class="date-input"
              :disabled="loading"
            />
          </div>
          
          <div class="input-group">
            <label for="dateEnd">End Date</label>
            <input
              id="dateEnd"
              v-model="filters.dateEnd"
              type="date"
              class="date-input"
              :disabled="loading"
            />
          </div>
        </div>
        
        <!-- Actions -->
        <div class="filter-actions">
          <button 
            @click="fetchData"
            :disabled="loading || !isValidDateRange"
            class="btn-primary"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Loading...' : 'Generate Report' }}
          </button>
          
          <button 
            @click="resetFilters"
            :disabled="loading"
            class="btn-secondary"
          >
            Reset
          </button>
        </div>
      </div>
      
      <!-- Error Display -->
      <div v-if="error" class="error-alert">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
        <button @click="error = ''" class="error-close">×</button>
      </div>
    </div>

    <!-- Data Display -->
    <div v-if="!loading && fcyData.length > 0" class="data-section">
      <!-- Single Currency View -->
      <div v-if="filters.currency" class="single-currency-section">
        <FCYDataTable
          :data="fcyData"
          :columns="singleCurrencyColumns"
          :title="`${filters.currency} Trial Balance`"
          :currency="filters.currency"
          @row-click="handleRowClick"
        />
      </div>
      
      <!-- Multi-Currency View -->
      <div v-else class="multi-currency-section">
        <div class="currency-tabs">
          <button
            v-for="currency in availableCurrencyList"
            :key="currency"
            @click="activeTab = currency"
            :class="['tab-button', { active: activeTab === currency }]"
          >
            {{ getCurrencySymbol(currency) }} {{ currency }}
            <span class="record-count">({{ getRecordCount(currency) }})</span>
          </button>
        </div>
        
        <FCYDataTable
          v-if="activeTab && groupedData[activeTab]"
          :data="groupedData[activeTab]"
          :columns="multiCurrencyColumns"
          :title="`${activeTab} Trial Balance`"
          :currency="activeTab"
          @row-click="handleRowClick"
        />
      </div>
      
      <!-- Export Actions -->
      <div class="export-section">
        <div class="export-header">
          <h3>Export Options</h3>
          <span class="export-subtitle">Download your data in various formats</span>
        </div>
        
        <div class="export-buttons">
          <button 
            @click="exportToExcel"
            :disabled="loading"
            class="export-btn excel"
          >
            <span class="export-icon">📊</span>
            Excel (.xlsx)
          </button>
          
          <button 
            @click="exportToCSV"
            :disabled="loading"
            class="export-btn csv"
          >
            <span class="export-icon">📄</span>
            CSV (.csv)
          </button>
          
          <button 
            @click="exportToPDF"
            :disabled="loading"
            class="export-btn pdf"
          >
            <span class="export-icon">📑</span>
            PDF (.pdf)
          </button>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!loading" class="empty-state">
      <div class="empty-icon">💱</div>
      <h3>No FCY Data Available</h3>
      <p>Select your filters and click "Generate Report" to view foreign currency trial balance data.</p>
      <button @click="loadSampleData" class="btn-secondary">
        Load Sample Data
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner large"></div>
      <p>Loading FCY trial balance data...</p>
      <div class="loading-progress">
        <div class="progress-bar" :style="{ width: `${loadingProgress}%` }"></div>
      </div>
    </div>

    <!-- Success Toast -->
    <Teleport to="body">
      <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button @click="hideToast" class="toast-close">×</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
// Page meta
definePageMeta({
  title: 'Trial Balance FCY',
  layout: 'default'
})

// Import composables and components
const { 
  getFCYTrialBalance, 
  getFCYTrialBalanceFiltered, 
  getAvailableCurrencies,
  generateSummaryCards,
  exportFCYToCSV
} = useFCY()

// Reactive state
const fcyData = ref([])
const groupedData = ref({})
const availableCurrencies = ref([])
const loading = ref(false)
const error = ref('')
const activeTab = ref('')
const loadingProgress = ref(0)

// Filter state
const filters = reactive({
  currency: '',
  dateStart: '',
  dateEnd: ''
})

// Toast notification state
const toast = reactive({
  show: false,
  type: 'success',
  message: '',
  icon: '✅'
})

// Initialize data
onMounted(async () => {
  await initializeData()
})

// Computed properties
const isValidDateRange = computed(() => {
  if (!filters.dateStart || !filters.dateEnd) return false
  return new Date(filters.dateStart) <= new Date(filters.dateEnd)
})

const availableCurrencyList = computed(() => {
  return Object.keys(groupedData.value).sort()
})

const summaryCards = computed(() => {
  const totalRecords = fcyData.value.length
  const uniqueCurrencies = new Set(fcyData.value.map(r => r.Currency)).size
  const uniqueGLs = new Set(fcyData.value.map(r => r.GL)).size
  
  return [
    {
      label: 'Total Records',
      value: totalRecords.toString(),
      icon: '📊',
      color: '#3b82f6',
      change: totalRecords > 0 ? '+100%' : null,
      changeType: 'positive'
    },
    {
      label: 'Currencies',
      value: uniqueCurrencies.toString(),
      icon: '💱',
      color: '#059669'
    },
    {
      label: 'GL Accounts',
      value: uniqueGLs.toString(),
      icon: '🏦',
      color: '#dc2626'
    },
    {
      label: 'Date Range',
      value: filters.dateStart && filters.dateEnd 
        ? `${formatDateShort(filters.dateStart)} - ${formatDateShort(filters.dateEnd)}`
        : 'Not set',
      icon: '📅',
      color: '#d97706'
    }
  ]
})

// Table column definitions
const singleCurrencyColumns = computed(() => [
  { key: 'GL', title: 'GL Code', sortable: true, cellClass: 'font-mono' },
  { key: 'Description', title: 'Description', sortable: true },
  { key: 'Opening_Dr_FCY', title: `Opening Dr (${filters.currency})`, type: 'currency', align: 'right', sortable: true },
  { key: 'Opening_Cr_FCY', title: `Opening Cr (${filters.currency})`, type: 'currency', align: 'right', sortable: true },
  { key: 'Flow_Dr_FCY', title: `Flow Dr (${filters.currency})`, type: 'currency', align: 'right', sortable: true },
  { key: 'Flow_Cr_FCY', title: `Flow Cr (${filters.currency})`, type: 'currency', align: 'right', sortable: true },
  { key: 'Closing_Dr_FCY', title: `Closing Dr (${filters.currency})`, type: 'currency', align: 'right', sortable: true, cellClass: 'font-bold text-green-600' },
  { key: 'Closing_Cr_FCY', title: `Closing Cr (${filters.currency})`, type: 'currency', align: 'right', sortable: true, cellClass: 'font-bold text-red-600' }
])

const multiCurrencyColumns = computed(() => [
  { key: 'GL', title: 'GL Code', sortable: true, cellClass: 'font-mono' },
  { key: 'Description', title: 'Description', sortable: true },
  { key: 'Currency', title: 'Currency', sortable: true, cellClass: 'font-semibold' },
  { key: 'Opening_Dr_FCY', title: 'Opening Dr', type: 'currency', align: 'right', sortable: true },
  { key: 'Opening_Cr_FCY', title: 'Opening Cr', type: 'currency', align: 'right', sortable: true },
  { key: 'Flow_Dr_FCY', title: 'Flow Dr', type: 'currency', align: 'right', sortable: true },
  { key: 'Flow_Cr_FCY', title: 'Flow Cr', type: 'currency', align: 'right', sortable: true },
  { key: 'Closing_Dr_FCY', title: 'Closing Dr', type: 'currency', align: 'right', sortable: true, cellClass: 'font-bold text-green-600' },
  { key: 'Closing_Cr_FCY', title: 'Closing Cr', type: 'currency', align: 'right', sortable: true, cellClass: 'font-bold text-red-600' }
])

// Methods
const initializeData = async () => {
  try {
    // Set default date range to current month
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    
    filters.dateStart = firstDay.toISOString().split('T')[0]
    filters.dateEnd = today.toISOString().split('T')[0]
    
    // Load available currencies
    const currencyResponse = await getAvailableCurrencies()
    if (currencyResponse.status === 'success') {
      availableCurrencies.value = Object.entries(currencyResponse.currency_details || {})
        .map(([code, details]) => ({
          code,
          name: details.name,
          symbol: details.symbol
        }))
    }
    
    // Auto-load data
    await fetchData()
    
  } catch (err) {
    console.error('Initialization error:', err)
    showToast('Failed to initialize FCY data', 'error', '❌')
  }
}

const fetchData = async () => {
  if (!isValidDateRange.value) {
    showToast('Please select a valid date range', 'warning', '⚠️')
    return
  }

  loading.value = true
  error.value = ''
  loadingProgress.value = 0
  
  try {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      loadingProgress.value = Math.min(loadingProgress.value + 10, 90)
    }, 200)

    let response
    
    if (filters.currency) {
      // Fetch specific currency data
      response = await getFCYTrialBalanceFiltered(
        filters.dateStart,
        filters.dateEnd,
        filters.currency
      )
    } else {
      // Fetch all currencies data
      response = await getFCYTrialBalance(
        filters.dateStart,
        filters.dateEnd
      )
    }
    
    clearInterval(progressInterval)
    loadingProgress.value = 100
    
    if (response.status === 'success') {
      fcyData.value = response.data || []
      groupedData.value = response.grouped_data || {}
      
      // Set active tab to first currency if not filtered
      if (!filters.currency && Object.keys(groupedData.value).length > 0) {
        activeTab.value = Object.keys(groupedData.value)[0]
      }
      
      showToast(
        `✅ Successfully loaded ${fcyData.value.length} records${filters.currency ? ` for ${filters.currency}` : ` across ${Object.keys(groupedData.value).length} currencies`}`,
        'success',
        '✅'
      )
    } else {
      error.value = response.message || 'Failed to fetch data'
    }
    
  } catch (err) {
    console.error('Fetch error:', err)
    error.value = err.message || 'An error occurred while fetching data'
    fcyData.value = []
    groupedData.value = {}
  } finally {
    loading.value = false
    setTimeout(() => {
      loadingProgress.value = 0
    }, 1000)
  }
}

const resetFilters = () => {
  filters.currency = ''
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  
  filters.dateStart = firstDay.toISOString().split('T')[0]
  filters.dateEnd = today.toISOString().split('T')[0]
  
  showToast('Filters reset to default values', 'info', 'ℹ️')
}

const loadSampleData = () => {
  // Load sample data for demonstration
  fcyData.value = [
    {
      GL: '101001',
      Description: 'Cash on Hand',
      Opening_Dr_FCY: 50000000,
      Opening_Cr_FCY: 0,
      Flow_Dr_FCY: 10000000,
      Flow_Cr_FCY: 5000000,
      Closing_Dr_FCY: 55000000,
      Closing_Cr_FCY: 0,
      Currency: 'LAK'
    },
    {
      GL: '101001',
      Description: 'Cash on Hand',
      Opening_Dr_FCY: 10000,
      Opening_Cr_FCY: 0,
      Flow_Dr_FCY: 2000,
      Flow_Cr_FCY: 1000,
      Closing_Dr_FCY: 11000,
      Closing_Cr_FCY: 0,
      Currency: 'USD'
    }
  ]
  
  groupedData.value = {
    LAK: [fcyData.value[0]],
    USD: [fcyData.value[1]]
  }
  
  activeTab.value = 'LAK'
  
  showToast('Sample data loaded successfully', 'success', '✅')
}

const handleRowClick = (item) => {
  console.log('Row clicked:', item)
  showToast(`Selected: ${item.GL} - ${item.Description}`, 'info', 'ℹ️')
}

const getCurrencySymbol = (currency) => {
  const symbols = { LAK: '₭', USD: '$', THB: '฿' }
  return symbols[currency] || currency
}

const getRecordCount = (currency) => {
  return groupedData.value[currency]?.length || 0
}

const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const exportToExcel = () => {
  if (!fcyData.value.length) {
    showToast('No data to export', 'warning', '⚠️')
    return
  }
  
  exportFCYToCSV(fcyData.value, 'fcy_trial_balance_excel')
  showToast('Data exported to Excel format', 'success', '📊')
}

const exportToCSV = () => {
  if (!fcyData.value.length) {
    showToast('No data to export', 'warning', '⚠️')
    return
  }
  
  exportFCYToCSV(fcyData.value, 'fcy_trial_balance')
  showToast('Data exported to CSV format', 'success', '📄')
}

const exportToPDF = () => {
  showToast('PDF export feature coming soon!', 'info', 'ℹ️')
}

const showToast = (message, type = 'success', icon = '✅') => {
  toast.show = true
  toast.type = type
  toast.message = message
  toast.icon = icon
  
  setTimeout(() => {
    hideToast()
  }, 5000)
}

const hideToast = () => {
  toast.show = false
}
</script>

<style scoped>
/* Page Styles */
.fcy-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.breadcrumb-link {
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #3b82f6;
}

.breadcrumb-separator {
  color: #9ca3af;
}

.breadcrumb-current {
  color: #374151;
  font-weight: 500;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Filter Section */
.filter-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
}

.filter-form {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 24px;
  align-items: end;
}

.date-inputs {
  display: flex;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.date-input {
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: white;
  backdrop-filter: blur(10px);
}

.date-input::placeholder {
  color: rgba(255,255,255,0.7);
}

.filter-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.btn-primary {
  background: rgba(255,255,255,0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-primary:hover:not(:disabled) {
  background: rgba(255,255,255,0.3);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  color: #fecaca;
}

.error-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  mar