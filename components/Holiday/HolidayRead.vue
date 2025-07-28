<!-- components/HolidayList.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

// Types
interface Holiday {
  lcl_holiday_id: string
  HYear: string
  HMonth: string
  HDate: string
  Holiday_List: string
  Record_Status: string
  Auth_Status: string
  Maker_Id?: { user_id: string }
  Maker_DT_Stamp?: string
  Checker_Id?: { user_id: string }
  Checker_DT_Stamp?: string
}

// Router instance
const router = useRouter()

// State
const holidays = ref<Holiday[]>([])
const loading = ref(false)
const error = ref('')

// Filters and pagination
const search = ref('')
const selectedYear = ref('all')
const selectedMonth = ref('all')
const selectedStatus = ref('all')
const selectedAuthStatus = ref('all')
const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: 'asc' | 'desc' }>({ key: 'HDate', order: 'desc' })

// Delete dialog
const deleteDialog = ref(false)
const itemToDelete = ref<Holiday | null>(null)
const loadingDelete = ref(false)

// Details dialog
const showDetails = ref(false)
const selectedHoliday = ref<Holiday | null>(null)

// Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Lao month names
const laoMonths: Record<string, string> = {
  '1': 'ມັງກອນ',
  '2': 'ກຸມພາ',
  '3': 'ມີນາ',
  '4': 'ເມສາ',
  '5': 'ພຶດສະພາ',
  '6': 'ມິຖຸນາ',
  '7': 'ກໍລະກົດ',
  '8': 'ສິງຫາ',
  '9': 'ກັນຍາ',
  '10': 'ຕຸລາ',
  '11': 'ພະຈິກ',
  '12': 'ທັນວາ'
}

// Month select items
const monthItems = [
  { value: 'all', title: 'ທັງໝົດ' },
  ...Object.entries(laoMonths).map(([key, value]) => ({
    value: key,
    title: value
  }))
]

// Get unique years from holidays
const yearItems = computed(() => {
  const years = [...new Set(holidays.value.map(h => h.HYear))].sort((a, b) => b.localeCompare(a))
  return [
    { value: 'all', title: 'ທັງໝົດ' },
    ...years.map(year => ({ value: year, title: year }))
  ]
})

// Table headers
const headers = [
  { title: 'ປີ', key: 'HYear', align: 'center', width: '80px' },
  { title: 'ເດືອນ', key: 'HMonth', align: 'center', width: '140px' },
  { title: 'ວັນທີ', key: 'HDate', align: 'center', width: '120px' },
  { title: 'ປະຕິທິນວັນພັກ', key: 'Holiday_List', align: 'start' },
  { title: 'ຈຳນວນວັນພັກ', key: 'holiday_count', align: 'center', width: '120px' },
  { title: 'ສະຖານະ', key: 'Record_Status', align: 'center', width: '120px' },
  { title: 'ອະນຸມັດ', key: 'Auth_Status', align: 'center', width: '120px' },
  { title: 'ການປະຕິບັດ', key: 'actions', sortable: false, align: 'center', width: '100px' }
]

// Debounced search
const debouncedSearch = ref('')
let searchTimeout: NodeJS.Timeout

watch(search, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
    page.value = 1
  }, 300)
})

// Helper functions
const monthToLao = (month: string) => laoMonths[month] || month
const formatDate = (date: string | undefined) => date ? new Date(date).toLocaleDateString('lo-LA') : '-'

// Helper to get actual days in month
const getDaysInMonth = (year: string, month: string) => {
  return new Date(parseInt(year), parseInt(month), 0).getDate()
}

// Updated holiday counting - only count H's within actual days of the month
const countHolidays = (holidayList: string, year: string, month: string) => {
  if (!holidayList) return 0
  const actualDays = getDaysInMonth(year, month)
  return holidayList.slice(0, actualDays).split('').filter(char => char === 'H').length
}

// Status helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case 'C': return 'success'
    case 'D': return 'error'
    case 'O': return 'warning'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'C': return 'ເປີດ'
    case 'D': return 'ລົບ'
    case 'O': return 'ປິດ'
    default: return status
  }
}

const getAuthStatusColor = (status: string) => {
  switch (status) {
    case 'A': return 'success'
    case 'U': return 'info'
    case 'R': return 'error'
    default: return 'grey'
  }
}

const getAuthStatusText = (status: string) => {
  switch (status) {
    case 'A': return 'ອະນຸມັດ'
    case 'U': return 'ລໍຖ້າ'
    case 'R': return 'ປະຕິເສດ'
    default: return status
  }
}

// Show notification
const showNotification = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// API functions
const fetchHolidays = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.get('/api/lcl_holiday/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    holidays.value = response.data
    showNotification('ໂຫຼດຂໍ້ມູນສຳເລັດ', 'success')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ'
    showNotification('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ', 'error')
    console.error('Error fetching holidays:', err)
  } finally {
    loading.value = false
  }
}

const confirmDelete = (item: Holiday) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const deleteHoliday = async () => {
  if (!itemToDelete.value) return
  loadingDelete.value = true
  try {
    await axios.delete(`/api/lcl_holiday/${itemToDelete.value.lcl_holiday_id}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    await fetchHolidays()
    deleteDialog.value = false
    itemToDelete.value = null
    showNotification('ລົບຂໍ້ມູນສຳເລັດ', 'success')
  } catch (err: any) {
    console.error('Delete error:', err)
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ'
    showNotification('ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ', 'error')
  } finally {
    loadingDelete.value = false
  }
}

// Navigation
const goPath = (path: string) => router.push(path)
const editHoliday = (item: Holiday) => router.push(`/holiday/update?id=${item.lcl_holiday_id}`)

// Computed properties
const filteredHolidays = computed(() => {
  let filtered = [...holidays.value]
  if (debouncedSearch.value) {
    const searchLower = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(holiday => 
      holiday.HYear.includes(searchLower) ||
      holiday.HMonth.includes(searchLower) ||
      monthToLao(holiday.HMonth).includes(searchLower)
    )
  }
  if (selectedYear.value !== 'all') filtered = filtered.filter(holiday => holiday.HYear === selectedYear.value)
  if (selectedMonth.value !== 'all') filtered = filtered.filter(holiday => holiday.HMonth === selectedMonth.value)
  if (selectedStatus.value !== 'all') filtered = filtered.filter(holiday => holiday.Record_Status === selectedStatus.value)
  if (selectedAuthStatus.value !== 'all') filtered = filtered.filter(holiday => holiday.Auth_Status === selectedAuthStatus.value)

  filtered.sort((a, b) => {
    const aVal = a[sortBy.value.key as keyof Holiday]
    const bVal = b[sortBy.value.key as keyof Holiday]
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    const compare = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortBy.value.order === 'asc' ? compare : -compare
  })
  return filtered
})

const paginatedHolidays = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredHolidays.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredHolidays.value.length / itemsPerPage.value))

// Refresh data
const refresh = async () => await fetchHolidays()

// Reset filters
const resetFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  selectedYear.value = 'all'
  selectedMonth.value = 'all'
  selectedStatus.value = 'all'
  selectedAuthStatus.value = 'all'
  page.value = 1
  showNotification('ລີເຊັດການຄັດກອງແລ້ວ', 'info')
}

// View details
const viewDetails = (holiday: Holiday) => {
  selectedHoliday.value = holiday
  showDetails.value = true
}

// Updated visualize holiday pattern - only show actual days of the month
const getHolidayPattern = (holidayList: string, year: string, month: string) => {
  if (!holidayList) return []
  const actualDays = getDaysInMonth(year, month)
  
  return holidayList.slice(0, actualDays).split('').map((char, index) => ({
    day: index + 1,
    isHoliday: char === 'H',
    isWeekend: char === 'N',
    isWorkday: char === 'W'
  }))
}

// Get preview pattern for table (first 10 actual days)
const getPreviewPattern = (holidayList: string, year: string, month: string) => {
  const pattern = getHolidayPattern(holidayList, year, month)
  return pattern.slice(0, 10)
}

// Initialize
onMounted(() => fetchHolidays())

// Watch for filter changes
watch([selectedYear, selectedMonth, selectedStatus, selectedAuthStatus], () => {
  page.value = 1
})
</script>

<template>
  <v-container fluid class="pa-4">
    <!-- Main Card -->
    <v-card elevation="2" class="rounded-lg basic-theme-card">
      <!-- Header -->
      <v-card-title class="basic-header pa-4">
        <v-row align="center">
          <v-col cols="12" md="6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3">mdi-calendar-star</v-icon>
              <div>
                <h2 class="text-h6 font-weight-medium">ຈັດການວັນພັກ</h2>
                <p class="text-caption text-medium-emphasis">ຄຸ້ມຄອງປະຕິທິນວັນພັກປະຈຳປີ</p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <v-chip color="primary" variant="tonal" size="small">
              {{ filteredHolidays.length }} ລາຍການ
            </v-chip>
          </v-col>
        </v-row>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-4">
        <!-- Action Buttons -->
        <v-row align="center" class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-btn
              @click="goPath('/holiday/create')"
              color="primary"
              variant="flat"
              prepend-icon="mdi-plus"
              class="text-none rounded-pill"
              block
            >
              ເພີ່ມວັນພັກ
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-btn
              variant="outlined"
              color="primary"
              prepend-icon="mdi-refresh"
              @click="refresh"
              :loading="loading"
              class="text-none rounded-pill"
              block
            >
              ໂຫຼດໃໝ່
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-btn
              variant="outlined"
              color="primary"
              prepend-icon="mdi-filter-off"
              @click="resetFilters"
              class="text-none rounded-pill"
              block
            >
              ລີເຊັດ
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="search"
              label="ຄົ້ນຫາ..."
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              density="comfortable"
              variant="solo"
              rounded="pill"
              color="primary"
              class="search-field"
            />
          </v-col>
        </v-row>

        <!-- Filters -->
        <v-card variant="outlined" class="mb-4 pa-4">
          <div class="text-caption text-medium-emphasis mb-3">
            <v-icon size="small" class="mr-1">mdi-filter</v-icon>
            ຕົວຄັດກອງ
          </div>
          <v-row>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedYear"
                label="ປີ"
                :items="yearItems"
                hide-details
                density="comfortable"
                variant="solo"
                rounded="pill"
                color="primary"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedMonth"
                label="ເດືອນ"
                :items="monthItems"
                hide-details
                density="comfortable"
                variant="solo"
                rounded="pill"
                color="primary"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedStatus"
                label="ສະຖານະ"
                :items="[
                  { value: 'all', title: 'ທັງໝົດ' },
                  { value: 'C', title: 'ເປີດ' },
                  { value: 'O', title: 'ປິດ' }
                ]"
                hide-details
                density="comfortable"
                variant="solo"
                rounded="pill"
                color="primary"
              />
            </v-col>
            <v-col cols="12" sm="6" md="3">
              <v-select
                v-model="selectedAuthStatus"
                label="ອະນຸມັດ"
                :items="[
                  { value: 'all', title: 'ທັງໝົດ' },
                  { value: 'A', title: 'ອະນຸມັດ' },
                  { value: 'U', title: 'ລໍຖ້າ' }
                ]"
                hide-details
                density="comfortable"
                variant="solo"
                rounded="pill"
                color="primary"
              />
            </v-col>
          </v-row>
        </v-card>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4 rounded-lg"
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- Data Table -->
        <v-card variant="outlined">
          <v-data-table
            :headers="headers"
            :items="paginatedHolidays"
            :loading="loading"
            class="basic-table"
            item-value="lcl_holiday_id"
            hover
            hide-default-footer
          >
            <template #item.HYear="{ item }">
              <span class="font-weight-medium">{{ item.HYear }}</span>
            </template>

            <template #item.HMonth="{ item }">
              <div class="d-flex align-center justify-center">
                <v-chip
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="mr-2"
                >
                  {{ item.HMonth }}
                </v-chip>
                {{ monthToLao(item.HMonth) }}
              </div>
            </template>

            <template #item.HDate="{ item }">
              <span>{{ formatDate(item.HDate) }}</span>
            </template>

            <template #item.Holiday_List="{ item }">
              <div class="d-flex align-center">
                <v-chip-group>
                  <v-chip
                    v-for="(day, index) in getPreviewPattern(item.Holiday_List, item.HYear, item.HMonth)"
                    :key="index"
                    :color="day.isHoliday ? 'primary' : day.isWeekend ? 'red-lighten-2' : 'grey-lighten-2'"
                    size="x-small"
                    class="ma-0"
                    :variant="day.isHoliday ? 'flat' : 'outlined'"
                  >
                    {{ day.day }}
                  </v-chip>
                  <span v-if="getDaysInMonth(item.HYear, item.HMonth) > 10" class="text-caption text-grey ml-2">
                    +{{ getDaysInMonth(item.HYear, item.HMonth) - 10 }} ອື່ນໆ
                  </span>
                </v-chip-group>
                <v-btn
                  icon="mdi-eye"
                  size="x-small"
                  variant="text"
                  color="primary"
                  @click="viewDetails(item)"
                />
              </div>
            </template>

            <template #item.holiday_count="{ item }">
              <v-chip
                color="primary"
                variant="tonal"
                size="small"
              >
                {{ countHolidays(item.Holiday_List, item.HYear, item.HMonth) }} ມື້
              </v-chip>
            </template>

            <template #item.Record_Status="{ item }">
              <v-chip
                :color="getStatusColor(item.Record_Status)"
                variant="tonal"
                size="small"
              >
                {{ getStatusText(item.Record_Status) }}
              </v-chip>
            </template>

            <template #item.Auth_Status="{ item }">
              <v-chip
                :color="getAuthStatusColor(item.Auth_Status)"
                variant="tonal"
                size="small"
              >
                {{ getAuthStatusText(item.Auth_Status) }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex justify-center">
                <v-btn 
                  icon="mdi-eye" 
                  size="small" 
                  variant="text" 
                  color="primary"
                  @click="viewDetails(item)" 
                />
                <v-btn 
                  icon="mdi-pencil" 
                  size="small" 
                  variant="text" 
                  color="primary"
                  @click="editHoliday(item)" 
                />
                <v-btn 
                  icon="mdi-delete" 
                  size="small" 
                  variant="text" 
                  color="error" 
                  @click="confirmDelete(item)" 
                />
              </div>
            </template>

            <template #loading>
              <v-skeleton-loader type="table-row@5" />
            </template>

            <template #no-data>
              <div class="text-center pa-4">
                <v-icon size="48" color="grey-lighten-2">mdi-calendar-blank</v-icon>
                <p class="text-caption text-grey-lighten-1 mt-2">
                  {{ search ? 'ບໍ່ພົບຂໍ້ມູນ' : 'ບໍ່ມີຂໍ້ມູນວັນພັກ' }}
                </p>
              </div>
            </template>
          </v-data-table>
        </v-card>

        <!-- Pagination -->
        <v-row align="center" class="mt-4">
          <v-col cols="12" sm="6" class="text-caption text-grey">
            ສະແດງ {{ (page - 1) * itemsPerPage + 1 }} - 
            {{ Math.min(page * itemsPerPage, filteredHolidays.length) }} 
            ຈາກ {{ filteredHolidays.length }}
          </v-col>
          <v-col cols="12" sm="6" class="text-right">
            <v-pagination
              v-model="page"
              :length="totalPages"
              :total-visible="5"
              rounded="circle"
              size="small"
              color="primary"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="pa-4">
        <v-card-title class="text-h6 d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          ຢືນຢັນການລົບ
        </v-card-title>
        <v-card-text>
          ລົບ {{ monthToLao(itemToDelete?.HMonth || '') }} {{ itemToDelete?.HYear }}?
          <br>
          <span class="text-caption text-error">ການລົບນີ້ບໍ່ສາມາດກັບຄືນໄດ້</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="deleteDialog = false" 
            :disabled="loadingDelete"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat" 
            :loading="loadingDelete" 
            @click="deleteHoliday"
          >
            ລົບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Details Dialog -->
    <v-dialog v-model="showDetails" max-width="700" scrollable>
      <v-card v-if="selectedHoliday" class="rounded-lg">
        <v-card-title class="basic-header pa-4">
          <v-icon color="primary" class="mr-2">mdi-calendar-star</v-icon>
          {{ monthToLao(selectedHoliday.HMonth) }} {{ selectedHoliday.HYear }}
          <v-spacer />
          <v-chip color="primary" variant="tonal" size="small">
            {{ getDaysInMonth(selectedHoliday.HYear, selectedHoliday.HMonth) }} ມື້
          </v-chip>
        </v-card-title>
        <v-card-text class="pa-4">
          <!-- Calendar Grid -->
          <div class="calendar-grid">
            <!-- Weekday headers -->
            <div v-for="day in ['ອາ', 'ຈ', 'ອ', 'ພ', 'ພຫ', 'ສ', 'ສ']" :key="day" class="day-header">
              {{ day }}
            </div>
            
            <!-- Empty cells for month start alignment -->
            <div 
              v-for="n in new Date(parseInt(selectedHoliday.HYear), parseInt(selectedHoliday.HMonth) - 1, 1).getDay()" 
              :key="`empty-${n}`"
              class="day-empty"
            />
            
            <!-- Calendar days - only show actual days of the month -->
            <div
              v-for="(day, index) in getHolidayPattern(selectedHoliday.Holiday_List, selectedHoliday.HYear, selectedHoliday.HMonth)"
              :key="index"
              :class="['day-cell', {
                'holiday': day.isHoliday,
                'weekend': day.isWeekend,
                'workday': day.isWorkday
              }]"
            >
              <span class="day-number">{{ day.day }}</span>
              <v-icon v-if="day.isHoliday" size="x-small" class="day-icon">mdi-star</v-icon>
            </div>
          </div>
          
          <!-- Legend -->
          <v-row class="mt-4">
            <v-col cols="12">
              <div class="text-caption text-medium-emphasis mb-2">ຄຳອະທິບາຍ:</div>
              <v-chip-group>
                <v-chip color="primary" variant="flat" size="small">
                  <v-icon start size="x-small">mdi-star</v-icon>
                  ວັນພັກ
                </v-chip>
                <v-chip color="red-lighten-2" variant="flat" size="small">
                  ວັນຢຸດ
                </v-chip>
                <v-chip color="grey-lighten-2" variant="flat" size="small">
                  ວັນເຮັດວຽກ
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
          
          <!-- Details -->
          <v-row class="mt-4">
            <v-col cols="12" sm="6">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend><v-icon color="primary">mdi-calendar</v-icon></template>
                  <v-list-item-title>ປີ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedHoliday.HYear }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="primary">mdi-calendar-month</v-icon></template>
                  <v-list-item-title>ເດືອນ</v-list-item-title>
                  <v-list-item-subtitle>{{ monthToLao(selectedHoliday.HMonth) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="primary">mdi-calendar-remove</v-icon></template>
                  <v-list-item-title>ວັນພັກ</v-list-item-title>
                  <v-list-item-subtitle>{{ countHolidays(selectedHoliday.Holiday_List, selectedHoliday.HYear, selectedHoliday.HMonth) }} ມື້</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" sm="6">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend><v-icon color="primary">mdi-database</v-icon></template>
                  <v-list-item-title>ສະຖານະ</v-list-item-title>
                  <v-list-item-subtitle>{{ getStatusText(selectedHoliday.Record_Status) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="primary">mdi-check-circle</v-icon></template>
                  <v-list-item-title>ການອະນຸມັດ</v-list-item-title>
                  <v-list-item-subtitle>{{ getAuthStatusText(selectedHoliday.Auth_Status) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend><v-icon color="primary">mdi-code-string</v-icon></template>
                  <v-list-item-title>ຂະໜາດຂໍ້ມູນ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedHoliday.Holiday_List?.length || 0 }} ຕົວອັກສອນ</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDetails = false">ປິດ</v-btn>
          <v-btn color="primary" variant="flat" @click="editHoliday(selectedHoliday!)">ແກ້ໄຂ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top" rounded="pill">
      <v-icon start>{{ snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false" icon="mdi-close" />
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
/* Basic theme card styling */
.basic-theme-card {
  border-top: 2px solid #1976D2;
}

/* Header styling */
.basic-header {
  background-color: #F5F5F5;
  color: #212121;
}

/* Table styling */
.basic-table :deep(thead) {
  background-color: #F5F5F5;
}

.basic-table :deep(th) {
  color: #212121 !important;
  font-weight: 600 !important;
}

.basic-table :deep(tbody tr:hover) {
  background-color: #FAFAFA !important;
}

/* Calendar grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 8px;
  background: #FAFAFA;
  border-radius: 8px;
}

.day-header {
  text-align: center;
  font-weight: 600;
  color: #757575;
  padding: 8px;
  font-size: 0.875rem;
  background: #E3F2FD;
  border-radius: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #FFFFFF;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #E0E0E0;
}

.day-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1;
}

.day-cell.holiday {
  background: #1976D2;
  color: white;
  border-color: #1565C0;
}

.day-cell.weekend {
  background: #FFCDD2;
  color: #C62828;
  border-color: #EF9A9A;
}

.day-cell.workday {
  background: #E8F5E8;
  color: #2E7D32;
  border-color: #C8E6C9;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
}

.day-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  color: white;
}

.day-empty {
  /* Empty cell for alignment */
}

/* Responsive calendar */
@media (max-width: 600px) {
  .calendar-grid {
    gap: 2px;
    padding: 4px;
  }
  
  .day-cell {
    border-radius: 4px;
  }
  
  .day-number {
    font-size: 0.75rem;
  }
}
</style>