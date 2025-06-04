<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import { VForm, VTextField, VSelect, VDatePicker, VBtn, VCard, VCardTitle, VCardText, VContainer, VRow, VCol } from 'vuetify/components'

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
const selectedDates = ref<Date[]>([]) // Changed to Date[]
const loading = ref(false)
const error = ref('')

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

// Status items
const statusItems = [
  { value: 'C', title: 'ເປີດ' },
  { value: 'O', title: 'ປິດ' },
  { value: 'D', title: 'ລົບ' }
]

const authStatusItems = [
  { value: 'A', title: 'ອະນຸມັດ' },
  { value: 'U', title: 'ລໍຖ້າ' },
  { value: 'R', title: 'ປະຕິເສດ' }
]

// Fetch holiday data
const fetchHoliday = async () => {
  loading.value = true
  try {
    const response = await axios.get(`/api/lcl_holiday/${holidayId.value}/`)
    holiday.value = response.data
    if (holiday.value.Holiday_List) {
      const year = parseInt(holiday.value.HYear)
      const month = parseInt(holiday.value.HMonth) - 1 // JS months are 0-based
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      selectedDates.value = []
      for (let day = 1; day <= daysInMonth; day++) {
        const char = holiday.value.Holiday_List[day - 1]
        if (char === 'H') {
          const date = new Date(year, month, day)
          selectedDates.value.push(date) // Push Date objects
        }
      }
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error fetching holiday'
  } finally {
    loading.value = false
  }
}

// Compute min and max dates for the month
const minDate = computed(() => {
  if (!holiday.value) return ''
  const year = holiday.value.HYear
  const month = holiday.value.HMonth.padStart(2, '0')
  return `${year}-${month}-01`
})

const maxDate = computed(() => {
  if (!holiday.value) return ''
  const year = parseInt(holiday.value.HYear)
  const month = parseInt(holiday.value.HMonth)
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${holiday.value.HMonth.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`
})

// Save holiday
const saveHoliday = async () => {
  if (!holiday.value) return
  loading.value = true
  try {
    const year = parseInt(holiday.value.HYear)
    const month = parseInt(holiday.value.HMonth) - 1 // JS months are 0-based
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    let holidayList = ''
    for (let day = 1; day <= 31; day++) {
      if (day > daysInMonth) {
        holidayList += 'X'
      } else {
        const isHoliday = selectedDates.value.some(d => 
          d.getFullYear() === year && 
          d.getMonth() === month && 
          d.getDate() === day
        )
        holidayList += isHoliday ? 'H' : ' '
      }
    }
    const updatedHoliday = {
      ...holiday.value,
      Holiday_List: holidayList
    }
    await axios.put(`/api/lcl_holiday/${holidayId.value}/`, updatedHoliday)
    router.push('/holiday/')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error updating holiday'
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => fetchHoliday())
</script>

<template>
  <v-container fluid class="pa-4">
    <v-card elevation="2" class="rounded-lg">
      <v-card-title class="basic-header pa-4">
        <v-icon color="primary" class="mr-3">mdi-calendar-edit</v-icon>
        ແກ້ໄຂວັນພັກ
      </v-card-title>
      <v-card-text class="pa-4">
        <div v-if="loading">ກຳລັງໂຫຼດ...</div>
        <div v-else-if="error" class="text-error">{{ error }}</div>
        <v-form v-if="holiday">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                label="Year"
                :value="holiday.HYear"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                label="Month"
                :value="holiday.HMonth"
                readonly
              ></v-text-field>
            </v-col>
          </v-row>
          <v-date-picker
            v-model="selectedDates"
            multiple
            :min="minDate"
            :max="maxDate"
            locale="lo"
            title="ເລືອກວັນພັກ"
            class="mt-4"
          ></v-date-picker>
          <v-row class="mt-4">
            <v-col cols="12" sm="6">
              <v-select
                v-model="holiday.Record_Status"
                label="ສະຖານະ"
                :items="statusItems"
                item-title="title"
                item-value="value"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="holiday.Auth_Status"
                label="ອະນຸມັດ"
                :items="authStatusItems"
                item-title="title"
                item-value="value"
              ></v-select>
            </v-col>
          </v-row>
          <v-row justify="end" class="mt-4">
            <v-btn variant="text" @click="router.push('/holiday/')" class="mr-2">ຍົກເລີກ</v-btn>
            <v-btn color="primary" @click="saveHoliday" :loading="loading">ບັນທຶກ</v-btn>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.basic-header {
  background-color: #F5F5F5;
  color: #212121;
}
</style>