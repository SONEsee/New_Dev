<template>
  <v-container class="pa-4">
    <!-- Header Section -->
    <v-card class="mb-6 elevation-4">
      <v-card-title class="text-h5 amber-gradient text-white text-styles">
        <v-icon class="mr-2 text-white">mdi-calendar-star</v-icon>
        ຈັດການຂໍ້ມູນວັນພັກ
      </v-card-title>
      <v-card-text class="pt-4">
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="selectedYear"
              label="ກະລຸນາເລືອກ ປີ"
              type="number"
              :min="2020"
              :max="2030"
              prepend-icon="mdi-calendar-range"
              variant="outlined"
              color="amber-darken-2"
              @change="initCalendar"
              class="year-selector"
            />
          </v-col>
          <v-col cols="12" md="6">
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
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Calendar Grid -->
    <v-row>
      <v-col
        v-for="(month, index) in 12"
        :key="index"
        cols="12" md="6" lg="4"
      >
        <v-card class="month-card elevation-3">
          <v-card-title class="amber lighten-3 text-amber-darken-4">
            <v-icon class="mr-2">mdi-calendar-month</v-icon>
            {{ getMonthName(index + 1) }} {{ selectedYear }}
          </v-card-title>
          <v-card-text class="pa-3">
            <!-- Weekday Headers -->
            <div class="weekday-headers mb-2">
              <div v-for="day in weekDays" :key="day" class="weekday-header">
                {{ day }}
              </div>
            </div>
            
            <!-- Days Grid -->
            <div class="days-grid">
              <!-- Empty cells for alignment -->
              <div 
                v-for="n in getFirstDayOffset(selectedYear, index + 1)" 
                :key="`empty-${n}`"
                class="day-empty"
              />
              
              <!-- Day buttons -->
              <v-btn
                v-for="day in getDaysInMonth(selectedYear, index + 1)"
                :key="day"
                :color="getButtonColor(monthData[index][day - 1])"
                @click="toggleDay(index, day)"
                class="day-btn"
                :variant="monthData[index][day - 1] === 'H' ? 'flat' : 'outlined'"
                :size="$vuetify.display.smAndDown ? 'x-small' : 'small'"
              >
                {{ day }}
                <v-icon v-if="monthData[index][day - 1] === 'H'" size="x-small" class="holiday-icon">
                  mdi-star
                </v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Action Buttons -->
    <v-card class="mt-6 elevation-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-h6 mb-2 text-styles">ເຄື່ອງມື ຈັດການ</div>
            <div class="d-flex flex-wrap gap-2">
              <v-btn
                color="amber-darken-2"
                variant="outlined"
                @click="clearAllHolidays"
              >
                <v-icon start>mdi-broom</v-icon>
                ລົບວັນພັກທັງໝົດ
              </v-btn>
              <v-btn
                color="amber-darken-2"
                variant="outlined"
                @click="resetToDefaults"
              >
                <v-icon start>mdi-restore</v-icon>
                ກັບຄືນຄ່າເລີ່ມຕົ້ນ
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="text-right">
            <div class="text-h6 mb-2 text-styles">ສັງລວມ</div>
            <div class="text-body-2 mb-3 text-styles">
              ຈໍານວນວັນພັກທັງໝົດ: <strong class="text-amber-darken-4 text-styles">{{ totalHolidays }}</strong> ມື້
            </div>
            <v-btn
              color="grey-darken-2"
              size="large"
              @click="submitHoliday"
              :loading="loading"
              variant="flat"
              class="text-white"
            >
              <v-icon start>mdi-check-circle</v-icon>
              ກໍານົດວັນພັກ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Snackbar for notifications -->
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from '@/helpers/axios'

const selectedYear = ref(new Date().getFullYear())
const loading = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Legend items
const legendItems = [
  { code: 'H', label: 'ວັນພັກ', color: 'amber-darken-2', icon: 'mdi-star' },
  { code: 'W', label: 'ວັນປົກກະຕິ', color: 'grey-lighten-1', icon: 'mdi-briefcase' },
  { code: 'N', label: 'ວັນຢຸດ', color: 'red-darken-4', icon: 'mdi-beach' }
]

// Weekday headers
const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// 2D Array [12][31] of H/W/N
const monthData = ref<string[][]>([])

// Calculate total holidays
const totalHolidays = computed(() => {
  let count = 0
  monthData.value.forEach(month => {
    month.forEach(day => {
      if (day === 'H') count++
    })
  })
  return count
})

const initCalendar = () => {
  monthData.value = []
  for (let m = 0; m < 12; m++) {
    const days = getDaysInMonth(selectedYear.value, m + 1)
    const monthDays: string[] = []

    for (let d = 1; d <= days; d++) {
      const date = new Date(selectedYear.value, m, d)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        monthDays.push('N') // Weekend
      } else {
        monthDays.push('W') // Weekday
      }
    }

    monthData.value.push(monthDays)
  }
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate()
}

const getFirstDayOffset = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay()
}

const getMonthName = (month: number) => {
  const names = [
    'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
    'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
  ]
  return names[month - 1]
}

const getButtonColor = (code: string) => {
  switch (code) {
    case 'H': return 'amber-darken-2'
    case 'N': return 'red-darken-2'
    case 'W': return 'grey-lighten-1'
    default: return 'grey'
  }
}

const generateHolidayId = (year: number, month: number) => {
  return `HOL-${year}-${String(month).padStart(2, '0')}`
}

const toggleDay = (monthIndex: number, day: number) => {
  const code = monthData.value[monthIndex][day - 1]
  if (code === 'H') {
    const date = new Date(selectedYear.value, monthIndex, day)
    const dayOfWeek = date.getDay()
    monthData.value[monthIndex][day - 1] = (dayOfWeek === 0 || dayOfWeek === 6) ? 'N' : 'W'
  } else {
    monthData.value[monthIndex][day - 1] = 'H'
  }
}

const clearAllHolidays = () => {
  monthData.value.forEach((month, monthIndex) => {
    month.forEach((day, dayIndex) => {
      if (day === 'H') {
        const date = new Date(selectedYear.value, monthIndex, dayIndex + 1)
        const dayOfWeek = date.getDay()
        monthData.value[monthIndex][dayIndex] = (dayOfWeek === 0 || dayOfWeek === 6) ? 'N' : 'W'
      }
    })
  })
  showNotification('All holidays cleared', 'info')
}

const resetToDefaults = () => {
  initCalendar()
  showNotification('Calendar reset to defaults', 'info')
}

const showNotification = (text: string, color: string) => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const submitHoliday = async () => {
  loading.value = true
  try {
    for (let i = 0; i < 12; i++) {
      const days = getDaysInMonth(selectedYear.value, i + 1)
      const record = {
        lcl_holiday_id: generateHolidayId(selectedYear.value, i + 1),
        HYear: selectedYear.value.toString(),
        HMonth: (i + 1).toString(),
        HDate: `${selectedYear.value}-${String(i + 1).padStart(2, '0')}-01T00:00:00Z`,
        Holiday_List: monthData.value[i].slice(0, days).join(''),
        Record_Status: 'C',
      }

      await axios.post('/api/lcl_holiday/', record, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
    }

    showNotification('Holidays submitted successfully!', 'success')
  } catch (error) {
    console.error('Error submitting:', error.response?.data || error.message)
    showNotification('Failed to submit holidays. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}

// Init on mount
initCalendar()
</script>

<style scoped>
.amber-gradient {
  background: linear-gradient(135deg, #FFA000 0%, #FFB300 100%);
}

.year-selector :deep(.v-field__input) {
  font-size: 1.25rem;
  font-weight: 500;
}

.month-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.month-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.weekday-header {
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  color: #6D4C41;
  padding: 4px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-empty {
  /* Empty cell for alignment */
}

.day-btn {
  position: relative;
  min-width: 0;
  height: 36px;
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

/* Responsive adjustments */
@media (max-width: 600px) {
  .day-btn {
    height: 28px;
    font-size: 0.75rem;
  }
  
  .weekday-header {
    font-size: 0.7rem;
  }
}

.gap-2 {
  gap: 8px;
}
</style>