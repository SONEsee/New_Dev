<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

// Router and Route instances
const route = useRoute()
const router = useRouter()

// State
const holidayId = computed(() => route.query.id as string)
const holiday = ref<Holiday | null>(null)
const monthData = ref<string[]>([]) // Array of H/W/N/O for 31 days
const loading = ref(false)
const error = ref('')
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

// Weekday headers
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Legend items
const legendItems = [
  { code: 'H', label: 'ວັນພັກ', color: 'amber-darken-2', icon: 'mdi-star' },
  { code: 'W', label: 'ວັນປົກກະຕິ', color: 'grey-lighten-1', icon: 'mdi-briefcase' },
  { code: 'N', label: 'ວັນຢຸດ', color: 'red-darken-4', icon: 'mdi-beach' }
]

// Status items
const statusItems = [
  { value: 'C', title: 'ເປີດ', color: 'success' },
  { value: 'O', title: 'ປິດ', color: 'warning' },
  { value: 'D', title: 'ລົບ', color: 'error' }
]

const authStatusItems = [
  { value: 'A', title: 'ອະນຸມັດ', color: 'success' },
  { value: 'U', title: 'ລໍຖ້າ', color: 'warning' },
  { value: 'R', title: 'ປະຕິເສດ', color: 'error' }
]

// Helper functions
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate()
}

const getFirstDayOffset = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay()
}

const getButtonColor = (code: string) => {
  switch (code) {
    case 'H': return 'amber-darken-2'
    case 'N': return 'red-darken-4'
    case 'W': return 'grey-lighten-1'
    default: return 'grey'
  }
}

// Calculate total holidays - only count H's within actual days
const totalHolidays = computed(() => {
  if (!holiday.value) return 0
  const actualDays = getDaysInMonth(parseInt(holiday.value.HYear), parseInt(holiday.value.HMonth))
  return monthData.value.slice(0, actualDays).filter(day => day === 'H').length
})

// Get only actual days for display
const actualDaysData = computed(() => {
  if (!holiday.value) return []
  const actualDays = getDaysInMonth(parseInt(holiday.value.HYear), parseInt(holiday.value.HMonth))
  return monthData.value.slice(0, actualDays)
})

// Show notification
const showNotification = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// Initialize month data from Holiday_List (always 31 characters)
const initMonthData = () => {
  if (!holiday.value) return
  
  const year = parseInt(holiday.value.HYear)
  const month = parseInt(holiday.value.HMonth)
  const actualDays = getDaysInMonth(year, month)
  
  monthData.value = []
  
  // Parse the 31-character Holiday_List
  for (let d = 0; d < 31; d++) {
    const char = holiday.value.Holiday_List[d] || 'O'
    
    if (d < actualDays) {
      // Real day exists in this month
      if (char === 'H') {
        monthData.value.push('H')
      } else {
        // Determine if it should be weekend or weekday
        const date = new Date(year, month - 1, d + 1)
        const dayOfWeek = date.getDay()
        monthData.value.push((dayOfWeek === 0 || dayOfWeek === 6) ? 'N' : 'W')
      }
    } else {
      // Day doesn't exist in this month
      monthData.value.push('O')
    }
  }
}

// Fetch holiday data
const fetchHoliday = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.get(`/api/lcl_holiday/${holidayId.value}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    holiday.value = response.data
    initMonthData()
    showNotification('ໂຫຼດຂໍ້ມູນສຳເລັດ', 'success')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error fetching holiday'
    showNotification('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ', 'error')
  } finally {
    loading.value = false
  }
}

// Toggle day status (only for actual days)
const toggleDay = (dayIndex: number) => {
  const code = monthData.value[dayIndex]
  
  if (code === 'H') {
    // Convert holiday back to appropriate type
    const year = parseInt(holiday.value!.HYear)
    const month = parseInt(holiday.value!.HMonth)
    const date = new Date(year, month - 1, dayIndex + 1)
    const dayOfWeek = date.getDay()
    monthData.value[dayIndex] = (dayOfWeek === 0 || dayOfWeek === 6) ? 'N' : 'W'
  } else {
    // Convert to holiday
    monthData.value[dayIndex] = 'H'
  }
}

// Clear all holidays (only in actual days)
const clearAllHolidays = () => {
  if (!holiday.value) return
  
  const year = parseInt(holiday.value.HYear)
  const month = parseInt(holiday.value.HMonth)
  const actualDays = getDaysInMonth(year, month)
  
  monthData.value = monthData.value.map((day, index) => {
    if (index < actualDays && day === 'H') {
      const date = new Date(year, month - 1, index + 1)
      const dayOfWeek = date.getDay()
      return (dayOfWeek === 0 || dayOfWeek === 6) ? 'N' : 'W'
    }
    return day // Keep 'O' for non-existent days
  })
  showNotification('ລົບວັນພັກທັງໝົດແລ້ວ', 'info')
}

// Reset to original
const resetToOriginal = () => {
  initMonthData()
  showNotification('ກັບຄືນຂໍ້ມູນເດີມແລ້ວ', 'info')
}

// Save holiday with correct 31-character format
const saveHoliday = async () => {
  if (!holiday.value) return
  loading.value = true
  
  try {
    // Build the 31-character Holiday_List string
    let holidayList = ''
    
    for (let i = 0; i < 31; i++) {
      holidayList += monthData.value[i] || 'O'
    }
    
    console.log('Saving Holiday_List:', holidayList, `(${holidayList.length} chars)`)
    
    const updatedHoliday = {
      ...holiday.value,
      Holiday_List: holidayList
    }
    
    await axios.put(`/api/lcl_holiday/${holidayId.value}/`, updatedHoliday, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    showNotification('ບັນທຶກການແກ້ໄຂສຳເລັດ!', 'success')
    setTimeout(() => {
      router.push('/holiday/')
    }, 1500)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error updating holiday'
    showNotification('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ', 'error')
    console.error('Save error:', err)
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => fetchHoliday())
</script>

<template>
  <v-container fluid class="pa-4">
    <!-- Main Card -->
    <v-card elevation="2" class="rounded-lg">
      <!-- Header -->
      <v-card-title class="amber-gradient text-white pa-6">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-icon size="x-large" class="mr-3 text-white">mdi-calendar-edit</v-icon>
              <div>
                <h2 class="text-h5 font-weight-bold text-white">ແກ້ໄຂວັນພັກ</h2>
                <p class="text-caption text-white" v-if="holiday">
                  {{ laoMonths[holiday.HMonth] }} {{ holiday.HYear }} 
                  ({{ getDaysInMonth(parseInt(holiday.HYear), parseInt(holiday.HMonth)) }} ມື້)
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-right">
            <v-btn
              variant="outlined"
              color="white"
              @click="router.push('/holiday/')"
              prepend-icon="mdi-arrow-left"
            >
              ກັບຄືນ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="amber-darken-2" size="64" />
          <p class="mt-4 text-h6">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>

        <!-- Error State -->
        <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <!-- Form -->
        <v-form v-else-if="holiday">
          <!-- Info Section -->
          <v-card variant="outlined" class="mb-6">
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    label="ປີ"
                    :model-value="holiday.HYear"
                    readonly
                    variant="outlined"
                    prepend-icon="mdi-calendar"
                    color="amber-darken-2"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    label="ເດືອນ"
                    :model-value="`${holiday.HMonth} - ${laoMonths[holiday.HMonth]}`"
                    readonly
                    variant="outlined"
                    prepend-icon="mdi-calendar-month"
                    color="amber-darken-2"
                  />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="holiday.Record_Status"
                    label="ສະຖານະ"
                    :items="statusItems"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    prepend-icon="mdi-database"
                    color="amber-darken-2"
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip :color="item.raw.color" size="small">
                        {{ item.title }}
                      </v-chip>
                    </template>
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :title="item.title">
                        <template v-slot:prepend>
                          <v-icon :color="item.raw.color">mdi-circle</v-icon>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="holiday.Auth_Status"
                    label="ການອະນຸມັດ"
                    :items="authStatusItems"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    prepend-icon="mdi-check-circle"
                    color="amber-darken-2"
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip :color="item.raw.color" size="small">
                        {{ item.title }}
                      </v-chip>
                    </template>
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :title="item.title">
                        <template v-slot:prepend>
                          <v-icon :color="item.raw.color">mdi-circle</v-icon>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Legend -->
          <v-card variant="outlined" class="mb-6">
            <v-card-text>
              <v-chip-group class="justify-center">
                <v-chip 
                  v-for="legend in legendItems" 
                  :key="legend.code"
                  :color="legend.color"
                  variant="flat"
                  class="text-white"
                >
                  <v-icon start>{{ legend.icon }}</v-icon>
                  {{ legend.label }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>

          <!-- Calendar -->
          <v-card variant="outlined" class="mb-6 elevation-3">
            <v-card-title class="amber lighten-3 text-amber-darken-4">
              <v-icon class="mr-2">mdi-calendar-month</v-icon>
              ປະຕິທິນເດືອນ {{ laoMonths[holiday.HMonth] }} {{ holiday.HYear }}
            </v-card-title>
            <v-card-text class="pa-4">
              <!-- Weekday Headers -->
              <div class="weekday-headers mb-3">
                <div v-for="day in weekDays" :key="day" class="weekday-header">
                  {{ day }}
                </div>
              </div>
              
              <!-- Days Grid -->
              <div class="days-grid">
                <!-- Empty cells for alignment -->
                <div 
                  v-for="n in getFirstDayOffset(parseInt(holiday.HYear), parseInt(holiday.HMonth))" 
                  :key="`empty-${n}`"
                  class="day-empty"
                />
                
                <!-- Day buttons - only show actual days -->
                <v-btn
                  v-for="(dayCode, index) in actualDaysData"
                  :key="index"
                  :color="getButtonColor(dayCode)"
                  @click="toggleDay(index)"
                  class="day-btn"
                  :variant="dayCode === 'H' ? 'flat' : 'outlined'"
                  size="small"
                >
                  {{ index + 1 }}
                  <v-icon v-if="dayCode === 'H'" size="x-small" class="holiday-icon">
                    mdi-star
                  </v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card variant="outlined" class="mb-6">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="text-h6 mb-2">ເຄື່ອງມືຈັດການ</div>
                  <div class="d-flex flex-wrap gap-2">
                    <v-btn
                      color="amber-darken-2"
                      variant="outlined"
                      @click="clearAllHolidays"
                      size="small"
                    >
                      <v-icon start>mdi-broom</v-icon>
                      ລົບວັນພັກທັງໝົດ
                    </v-btn>
                    <v-btn
                      color="amber-darken-2"
                      variant="outlined"
                      @click="resetToOriginal"
                      size="small"
                    >
                      <v-icon start>mdi-restore</v-icon>
                      ກັບຄືນຄ່າເດີມ
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="12" md="6" class="text-right">
                  <div class="text-h6 mb-2">ສັງລວມ</div>
                  <div class="text-body-2 mb-2">
                    ຈໍານວນວັນພັກ: <strong class="text-amber-darken-4">{{ totalHolidays }}</strong> ມື້
                  </div>
                  <div class="text-body-2">
                    ຂະໜາດຂໍ້ມູນ: <strong class="text-grey-darken-2">{{ monthData.length }}</strong> ຕົວອັກສອນ
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Debug Info (optional) -->
          <v-card variant="outlined" class="mb-6" v-if="false">
            <v-card-title class="text-h6">Debug Info</v-card-title>
            <v-card-text>
              <div class="text-caption">
                <strong>Original Holiday_List:</strong> 
                <code>{{ holiday.Holiday_List }}</code> ({{ holiday.Holiday_List?.length }} chars)
              </div>
              <div class="text-caption mt-2">
                <strong>Current Holiday_List:</strong> 
                <code>{{ monthData.join('') }}</code> ({{ monthData.length }} chars)
              </div>
            </v-card-text>
          </v-card>

          <!-- Action Buttons -->
          <v-row justify="end">
            <v-col cols="auto">
              <v-btn 
                variant="text" 
                @click="router.push('/holiday/')"
                size="large"
              >
                ຍົກເລີກ
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn 
                color="amber-darken-2" 
                @click="saveHoliday" 
                :loading="loading"
                size="large"
                prepend-icon="mdi-content-save"
                variant="flat"
                class="text-white"
              >
                ບັນທຶກການແກ້ໄຂ
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.amber-gradient {
  background: linear-gradient(135deg, #FFA000 0%, #FFB300 100%);
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday-header {
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6D4C41;
  padding: 8px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-empty {
  /* Empty cell for alignment */
}

.day-btn {
  position: relative;
  min-width: 0;
  height: 40px;
  font-weight: 500;
}

.day-btn:hover {
  transform: scale(1.05);
}

.holiday-icon {
  position: absolute;
  top: 2px;
  right: 2px;
  color: white;
}

/* Card hover effects */
.v-card {
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-1px);
}

/* Button animations */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .day-btn {
    height: 32px;
    font-size: 0.75rem;
  }
  
  .weekday-header {
    font-size: 0.75rem;
    padding: 4px 0;
  }
}

.gap-2 {
  gap: 8px;
}
</style>