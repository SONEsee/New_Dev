<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 800px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ເພີ່ມຮອບວຽນບັນຊີໃໝ່</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">ປ້ອນຂໍ້ມູນຮອບວຽນບັນຊີທີ່ຕ້ອງການເພີ່ມ</p>
      </div>

      <!-- Form Card -->
      <v-card elevation="0" class="rounded-lg pa-6 mb-6" style="border: 1px solid rgb(var(--v-theme-surface-variant));">
        <v-form @submit.prevent="submitForm" v-model="isValid">
          <v-row>
            <!-- Cycle Code -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fin_cycle"
                label="ລະຫັດຮອບວຽນ *"
                placeholder="ເຊັ່ນ: 2024, FY2024"
                variant="outlined"
                density="comfortable"
                required
                :rules="[rules.required, rules.cycleCode]"
                maxlength="10"
                @input="form.fin_cycle = form.fin_cycle.toUpperCase()"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-identifier</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Cycle Description -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.cycle_Desc"
                label="ລາຍລະອຽດຮອບວຽນ"
                placeholder="ເຊັ່ນ:  ຮອບວຽນບັນຊີ ປີ  * "
                variant="outlined"
                density="comfortable"
                maxlength="250"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-text</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Date Range Section -->
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ໄລຍະເວລາຮອບວຽນ</div>
              <v-row>
                <!-- Start Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.StartDate"
                    label="ວັນທີເລີ່ມຕົ້ນ *"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    required
                    :rules="[rules.required]"
                    @input="validateDateRange"
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-calendar-start</v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- End Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.EndDate"
                    label="ວັນທີສິ້ນສຸດ *"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    required
                    :rules="[rules.required, rules.endDateValidation]"
                    @input="validateDateRange"
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-calendar-end</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </v-col>

            <!-- Quick Preset Buttons -->
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ຕັ້ງຄ່າໄວ</div>
              <div class="d-flex flex-wrap gap-2">
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="setYearDates()"
                  class="text-none"
                  prepend-icon="mdi-calendar"
                >
                  ປີປັດຈຸບັນ
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="setYearDates(new Date().getFullYear() + 1)"
                  class="text-none"
                  prepend-icon="mdi-calendar-plus"
                >
                  ປີໜ້າ
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  @click="setCustomYear()"
                  class="text-none"
                  prepend-icon="mdi-calendar-edit"
                >
                  ປີອື່ນໆ
                </v-btn>
              </div>
            </v-col>

            <!-- Duration Display -->
            <v-col cols="12" v-if="duration">
              <v-card 
                class="pa-4 rounded-lg" 
                :color="getDurationColor()" 
                variant="tonal"
              >
                <div class="d-flex align-center">
                  <v-icon size="24" :color="getDurationColor()">mdi-clock-outline</v-icon>
                  <div class="ml-3">
                    <div class="text-subtitle-2 text-styles">ໄລຍະເວລາຮອບວຽນ</div>
                    <div class="text-h6 font-weight-bold text-styles">
                      {{ duration }}
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- Status Fields -->
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ການຕັ້ງຄ່າສະຖານະ</div>
              <v-row>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.Record_Status"
                    label="ສະຖານະບັນທຶກ"
                    :items="recordStatusItems"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-database</v-icon>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.Auth_Status"
                    label="ສະຖານະອະນຸມັດ"
                    :items="authStatusItems"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-check-circle</v-icon>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.Once_Auth"
                    label="ອະນຸມັດຄັ້ງດຽວ"
                    :items="onceAuthItems"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-lock</v-icon>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Action Buttons -->
          <div class="d-flex justify-end gap-3 mt-6 pt-4" style="border-top: 1px solid rgb(var(--v-theme-surface-variant));">
            <v-btn
              variant="text"
              @click="goBack"
              class="text-none"
            >
              ຍົກເລີກ
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              type="submit"
              :disabled="!isValid"
              :loading="loading"
              class="text-none px-8"
            >
              ບັນທຶກ
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <!-- Period Generation Section -->
      <v-card 
        elevation="0" 
        class="rounded-lg pa-6" 
        style="border: 1px solid rgb(var(--v-theme-surface-variant));"
        v-if="isValidDateRange && form.fin_cycle"
      >
        <div class="text-h6 font-weight-bold mb-4 text-styles">
          <v-icon color="primary" class="mr-2">mdi-calendar-month</v-icon>
          ສ້າງລາຍເດືອນອັດຕະໂນມັດ
        </div>
        
        <div class="text-body-2 text-grey-darken-1 mb-4 text-styles">
          ເລືອກວິທີການສ້າງລາຍເດືອນສຳລັບຮອບວຽນນີ້
        </div>

        <!-- Period Generation Buttons -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-btn
              color="yellow-darken-2"
              variant="elevated"
              block
              @click="generatePeriods('monthly')"
              :loading="generatingPeriods === 'monthly'"
              class="text-none py-4"
              prepend-icon="mdi-calendar-month-outline"
            >
              <div>
                <div class="font-weight-bold text-styles">ລາຍເດືອນ</div>
                <div class="text-caption text-styles">12 ເດືອນ</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              color="yellow-darken-2"
              variant="elevated"
              block
              @click="generatePeriods('quarterly')"
              :loading="generatingPeriods === 'quarterly'"
              class="text-none py-4"
              prepend-icon="mdi-calendar-range"
            >
              <div>
                <div class="font-weight-bold text-styles">ລາຍໄຕມາດ</div>
                <div class="text-caption text-styles">4 ໄຕມາດ</div>
              </div>
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              color="yellow-darken-2"
              variant="elevated"
              block
              @click="generatePeriods('half-yearly')"
              :loading="generatingPeriods === 'half-yearly'"
              class="text-none py-4"
              prepend-icon="mdi-calendar-range-outline"
            >
              <div>
                <div class="font-weight-bold text-styles">ຄິ້ງປີ</div>
                <div class="text-caption text-styles">2 ໄລຍະ</div>
              </div>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Generated Periods Preview -->
        <div v-if="generatedPeriods.length > 0">
          <v-divider class="mb-4"></v-divider>
          <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">
            ລາຍການເດືອນທີ່ຈະສ້າງ ({{ generatedPeriods.length }} ລາຍການ)
          </div>
          <v-row>
            <v-col 
              v-for="(period, index) in generatedPeriods" 
              :key="index"
              cols="12" sm="6" md="4" lg="3"
            >
              <v-card 
                class="pa-3 rounded-lg" 
                :color="getPeriodColor(period.type)" 
                variant="tonal"
                elevation="1"
              >
                <div class="text-center">
                  <v-icon :color="getPeriodColor(period.type)" class="mb-1" size="20">
                    {{ getPeriodIcon(period.type) }}
                  </v-icon>
                  <div class="text-caption text-grey-darken-1 text-styles">{{ period.period_code }}</div>
                  <div class="font-weight-bold text-body-2 text-styles">{{ period.description }}</div>
                  <div class="text-caption mt-1">
                    {{ formatShortDate(period.PC_StartDate) }} - {{ formatShortDate(period.PC_EndDate) }}
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
          
          <!-- Save Periods Button -->
          <div class="d-flex justify-center mt-4">
            <v-btn
              color="primary"
              variant="elevated"
              @click="savePeriods"
              :loading="savingPeriods"
              class="text-none px-8"
              prepend-icon="mdi-content-save"
            >
              ບັນທຶກລາຍເດືອນທັງໝົດ
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Custom Year Dialog -->
    <v-dialog v-model="showYearDialog" max-width="400">
      <v-card class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <span class="text-h6 font-weight-bold  text-styles">ເລືອກປີ</span>
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <v-text-field
            v-model="customYear"
            label="ປີ"
            type="number"
            variant="outlined"
            :min="2020"
            :max="2030"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="showYearDialog = false">ຍົກເລີກ</v-btn>
          <v-btn color="primary" @click="applyCustomYear">ຕົກລົງ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from '@/helpers/axios'
import { useRouter } from 'vue-router'
import { FinCycleModel } from '~/models'

const router = useRouter()

// For creation, we omit read-only and generated fields:
type CreateFinCyclePayload = Omit<
  FinCycleModel.FinCycleResponse,
  'Maker_DT_Stamp' | 'Checker_DT_Stamp' | 'Maker_Id' | 'Checker_Id'
>

interface PeriodCode {
  period_code: string
  PC_StartDate: string
  PC_EndDate: string
  Fin_cycle: string
  description: string
  type: 'monthly' | 'quarterly' | 'half-yearly'
}

const isValid = ref(false)
const loading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showYearDialog = ref(false)
const customYear = ref(new Date().getFullYear())
const generatingPeriods = ref<string | null>(null)
const savingPeriods = ref(false)
const generatedPeriods = ref<PeriodCode[]>([])

const form = ref<CreateFinCyclePayload>({
  fin_cycle: '',
  cycle_Desc: '',
  StartDate: '',   // YYYY-MM-DD
  EndDate: '',
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N',
})

// Computed property for duration calculation
const duration = computed(() => {
  if (form.value.StartDate && form.value.EndDate && isValidDateRange.value) {
    return calculateDuration(form.value.StartDate, form.value.EndDate)
  }
  return null
})

const isValidDateRange = computed(() => {
  if (!form.value.StartDate || !form.value.EndDate) return false
  return new Date(form.value.StartDate) < new Date(form.value.EndDate)
})

// Dropdown options with better labels
const recordStatusItems = [
  { title: 'ເປີດໃຊ້ງານ', value: 'O' },
  { title: 'ປິດໃຊ້ງານ', value: 'C' }
]

const authStatusItems = [
  { title: 'ອະນຸມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' },
]

const onceAuthItems = [
  { title: 'ໃຊ່', value: 'Y' },
  { title: 'ບໍ່', value: 'N' }
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'ຈຳເປັນຕ້ອງມີຂໍ້ມູນນີ້',
  cycleCode: (value: string) => {
    if (!value) return true
    if (value.length < 2) return 'ລະຫັດຮອບວຽນຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ'
    if (!/^[A-Z0-9]+$/.test(value)) return 'ໃຊ້ພຽງຕົວອັກສອນພິມໃຫຍ່ແລະຕົວເລກເທົ່ານັ້ນ'
    return true
  },
  endDateValidation: (value: string) => {
    if (!value || !form.value.StartDate) return true
    if (new Date(value) <= new Date(form.value.StartDate)) return 'ວັນທີສິ້ນສຸດຕ້ອງຫຼັງຈາກວັນທີເລີ່ມຕົ້ນ'
    return true
  }
}

// Helper functions
function calculateDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} ມື້`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ເດືອນ`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingMonths = Math.floor((diffDays % 365) / 30)
    return remainingMonths > 0 ? `${years} ປີ ${remainingMonths} ເດືອນ` : `${years} ປີ`
  }
}

function getDurationColor() {
  if (!duration.value) return 'grey'
  const durationText = duration.value
  if (durationText.includes('ມື້')) return 'warning'
  if (durationText.includes('ເດືອນ') && !durationText.includes('ປີ')) return 'info'
  return 'success'
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

function validateDateRange() {
  // This triggers validation for both date fields
  generatedPeriods.value = [] // Clear generated periods when dates change
}

function setYearDates(year?: number) {
  const targetYear = year || new Date().getFullYear()
  form.value.StartDate = `${targetYear}-01-01`
  form.value.EndDate = `${targetYear}-12-31`
  form.value.fin_cycle = `${targetYear}`
  form.value.cycle_Desc = `ປີຮອບວຽນບັນຊີ ${targetYear}`
  generatedPeriods.value = [] // Clear generated periods
}

function setCustomYear() {
  showYearDialog.value = true
}

function applyCustomYear() {
  setYearDates(customYear.value)
  showYearDialog.value = false
}

// Period generation functions
function generatePeriods(type: 'monthly' | 'quarterly' | 'half-yearly') {
  if (!form.value.StartDate || !form.value.EndDate || !form.value.fin_cycle) return
  
  generatingPeriods.value = type
  generatedPeriods.value = []
  
  setTimeout(() => {
    const startDate = new Date(form.value.StartDate)
    const endDate = new Date(form.value.EndDate)
    const year = startDate.getFullYear()
    
    switch (type) {
      case 'monthly':
        generatedPeriods.value = generateMonthlyPeriods(year)
        break
      case 'quarterly':
        generatedPeriods.value = generateQuarterlyPeriods(year)
        break
      case 'half-yearly':
        generatedPeriods.value = generateHalfYearlyPeriods(year)
        break
    }
    
    generatingPeriods.value = null
  }, 500)
}

function generateMonthlyPeriods(year: number): PeriodCode[] {
  const periods: PeriodCode[] = []
  const monthNames = [
    'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
    'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
  ]
  
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0) // Last day of month
    
    periods.push({
      period_code: `${year}${String(month + 1).padStart(2, '0')}`,
      PC_StartDate: startDate.toISOString().split('T')[0],
      PC_EndDate: endDate.toISOString().split('T')[0],
      Fin_cycle: form.value.fin_cycle,
      description: `${monthNames[month]} ${year}`,
      type: 'monthly'
    })
  }
  
  return periods
}

function generateQuarterlyPeriods(year: number): PeriodCode[] {
  const periods: PeriodCode[] = []
  const quarters = [
    { start: [year, 0, 1], end: [year, 2, 31], name: 'ໄຕມາດທີ 1' },
    { start: [year, 3, 1], end: [year, 5, 30], name: 'ໄຕມາດທີ 2' },
    { start: [year, 6, 1], end: [year, 8, 30], name: 'ໄຕມາດທີ 3' },
    { start: [year, 9, 1], end: [year, 11, 31], name: 'ໄຕມາດທີ 4' }
  ]
  
  quarters.forEach((quarter, index) => {
    const startDate = new Date(quarter.start[0], quarter.start[1], quarter.start[2])
    const endDate = new Date(quarter.end[0], quarter.end[1], quarter.end[2])
    
    periods.push({
      period_code: `${year}Q${index + 1}`,
      PC_StartDate: startDate.toISOString().split('T')[0],
      PC_EndDate: endDate.toISOString().split('T')[0],
      Fin_cycle: form.value.fin_cycle,
      description: `${quarter.name} ${year}`,
      type: 'quarterly'
    })
  })
  
  return periods
}

function generateHalfYearlyPeriods(year: number): PeriodCode[] {
  const periods: PeriodCode[] = []
  const halves = [
    { start: [year, 0, 1], end: [year, 5, 30], name: 'ຄິ້ງແຮກ' },
    { start: [year, 6, 1], end: [year, 11, 31], name: 'ຄິ້ງຫຼັງ' }
  ]
  
  halves.forEach((half, index) => {
    const startDate = new Date(half.start[0], half.start[1], half.start[2])
    const endDate = new Date(half.end[0], half.end[1], half.end[2])
    
    periods.push({
      period_code: `${year}H${index + 1}`,
      PC_StartDate: startDate.toISOString().split('T')[0],
      PC_EndDate: endDate.toISOString().split('T')[0],
      Fin_cycle: form.value.fin_cycle,
      description: `${half.name} ${year}`,
      type: 'half-yearly'
    })
  })
  
  return periods
}

function getPeriodColor(type: 'monthly' | 'quarterly' | 'half-yearly'): string {
  switch (type) {
    case 'monthly': return 'amber-darken-2'
    case 'quarterly': return 'amber-darken-2'
    case 'half-yearly': return 'amber-darken-2'
    default: return 'grey'
  }
}

function getPeriodIcon(type: 'monthly' | 'quarterly' | 'half-yearly'): string {
  switch (type) {
    case 'monthly': return 'mdi-calendar-month-outline'
    case 'quarterly': return 'mdi-calendar-range'
    case 'half-yearly': return 'mdi-calendar-range-outline'
    default: return 'mdi-calendar'
  }
}

async function savePeriods() {
  if (generatedPeriods.value.length === 0) return
  
  savingPeriods.value = true
  try {
    // Save all periods
    const promises = generatedPeriods.value.map(period => 
      axios.post('/api/percodes/', {
        period_code: period.period_code,
        PC_StartDate: period.PC_StartDate,
        PC_EndDate: period.PC_EndDate,
        Fin_cycle: period.Fin_cycle
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
    )
    
    await Promise.all(promises)
    
    showSuccess.value = true
    successMessage.value = `ບັນທຶກລາຍເດືອນສຳເລັດ ${generatedPeriods.value.length} ລາຍການ`
    generatedPeriods.value = []
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກລາຍເດືອນ'
    console.error('Error saving periods:', error)
  } finally {
    savingPeriods.value = false
  }
}

async function submitForm() {
  if (!isValid.value) return
  
  loading.value = true
  try {
    await axios.post('/api/fin-cycles/', form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    showSuccess.value = true
    successMessage.value = 'ເພີ່ມຮອບວຽນບັນຊີສຳເລັດແລ້ວ!'
    
    // Reset form after success
    setTimeout(() => {
      router.push('/fincycle')
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ'
    console.error('Error creating financial cycle:', error)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/fincycle')
}
</script>

<style scoped>
/* Custom form styling */
:deep(.v-field__outline) {
  border-radius: 8px;
}

:deep(.v-field--focused .v-field__outline) {
  border-width: 2px;
}

/* Input field hover effects */
:deep(.v-field:hover .v-field__outline) {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

/* Better spacing for form sections */
.v-col {
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Clean card styling */
.v-card {
  transition: box-shadow 0.2s ease;
}

/* Button hover effects */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* Icon styling */
:deep(.v-field__prepend-inner .v-icon) {
  opacity: 0.7;
}

:deep(.v-field--focused .v-field__prepend-inner .v-icon) {
  opacity: 1;
}

/* Quick preset buttons */
.v-btn--outlined {
  border-radius: 6px;
}

/* Date input styling */
:deep(input[type="date"]) {
  cursor: pointer;
}

/* Period cards animation */
.v-card:hover {
  transform: translateY(-2px);
}

/* Period generation buttons */
.v-btn .v-btn__content {
  flex-direction: column;
}
</style>