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
            <!-- Year Input (Cycle Code) -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="cycleYear"
                label="ປີຮອບວຽນ *"
                placeholder="ເຊັ່ນ: 2024, 2025"
                variant="outlined"
                density="comfortable"
                required
                type="number"
                :min="2020"
                :max="2030"
                :rules="[rules.required, rules.yearValidation]"
                @input="updateCycleData"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-calendar</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Cycle Description (Auto-generated) -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.cycle_Desc"
                label="ລາຍລະອຽດຮອບວຽນ"
                variant="outlined"
                density="comfortable"
                readonly
                bg-color="grey-lighten-4"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-text</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Date Range Section (Auto-set based on year) -->
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
                    readonly
                    bg-color="grey-lighten-4"
                    :rules="[rules.required]"
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
                    readonly
                    bg-color="grey-lighten-4"
                    :rules="[rules.required]"
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-calendar-end</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </v-col>

            <!-- Duration Display -->
            <v-col cols="12" v-if="duration">
              <v-card 
                class="pa-4 rounded-lg" 
                color="success"
                variant="tonal"
              >
                <div class="d-flex align-center">
                  <v-icon size="24" color="success">mdi-clock-outline</v-icon>
                  <div class="ml-3">
                    <div class="text-subtitle-2 text-styles">ໄລຍະເວລາຮອບວຽນ</div>
                    <div class="text-h6 font-weight-bold text-styles">
                      {{ duration }}
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- Period Generation Option -->
            <v-col cols="12" v-if="cycleYear">
              <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ສ້າງລາຍເດືອນອັດຕະໂນມັດ</div>
              <v-card class="pa-4 rounded-lg" variant="outlined">
                <v-switch
                  v-model="generatePeriods"
                  label="ສ້າງລາຍເດືອນພ້ອມກັບຮອບວຽນບັນຊີ"
                  color="primary"
                  hide-details
                  class="mb-4"
                />

                <!-- Period Type Selection -->
                <div v-if="generatePeriods">
                  <div class="text-body-2 mb-3 text-styles">ເລືອກປະເພດລາຍເດືອນ:</div>
                  <v-radio-group v-model="selectedPeriodType" inline hide-details>
                    <v-radio
                      label="ລາຍເດືອນ (12 ເດືອນ)"
                      value="monthly"
                      color="primary"
                    />
                    <v-radio
                      label="ລາຍໄຕມາດ (4 ໄຕມາດ)"
                      value="quarterly"
                      color="primary"
                    />
                    <v-radio
                      label="ຄິ້ງປີ (2 ໄລຍະ)"
                      value="half-yearly"
                      color="primary"
                    />
                  </v-radio-group>

                  <!-- Period Preview -->
                  <div v-if="selectedPeriodType" class="mt-4">
                    <v-divider class="mb-3" />
                    <div class="text-body-2 mb-3 text-styles">
                      ລາຍການທີ່ຈະສ້າງ ({{ getPreviewPeriods().length }} ລາຍການ):
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <v-chip
                        v-for="(period, index) in getPreviewPeriods().slice(0, 6)"
                        :key="index"
                        size="small"
                        color="primary"
                        variant="tonal"
                      >
                        {{ period.period_code }}: {{ period.PC_StartDate }}
                      </v-chip>
                      <v-chip
                        v-if="getPreviewPeriods().length > 6"
                        size="small"
                        color="grey"
                        variant="tonal"
                      >
                        +{{ getPreviewPeriods().length - 6 }} ເພີ່ມເຕີມ
                      </v-chip>
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
              :disabled="loading"
            >
              ຍົກເລີກ
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              type="submit"
              :disabled="!isValid || !cycleYear"
              :loading="loading"
              class="text-none px-8"
            >
              <v-icon start v-if="generatePeriods">mdi-calendar-plus</v-icon>
              <v-icon start v-else>mdi-content-save</v-icon>
              {{ generatePeriods ? 'ບັນທຶກຮອບວຽນ + ລາຍເດືອນ' : 'ບັນທຶກຮອບວຽນ' }}
            </v-btn>
          </div>
        </v-form>
      </v-card>
    </div>

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
import { ref, computed, watch } from 'vue'
import axios from '@/helpers/axios'
import { useRouter } from 'vue-router'
import { FinCycleModel } from '~/models'

const router = useRouter()

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

const cycleYear = ref<number | null>(null)
const generatePeriods = ref(false)
const selectedPeriodType = ref<'monthly' | 'quarterly' | 'half-yearly'>('monthly')

const form = ref<CreateFinCyclePayload>({
  fin_cycle: '',
  cycle_Desc: '',
  StartDate: '',
  EndDate: '',
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N',
})

// Helper function to format date without timezone issues
function formatDate(year: number, month: number, day: number): string {
  const y = String(year)
  const m = String(month).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Helper function to get last day of month
function getLastDayOfMonth(year: number, month: number): number {
  // month is 1-12
  return new Date(year, month, 0).getDate()
}

const duration = computed(() => {
  if (form.value.StartDate && form.value.EndDate) {
    return calculateDuration(form.value.StartDate, form.value.EndDate)
  }
  return null
})

const recordStatusItems = [
  { title: 'ເປີດໃຊ້ງານ', value: 'C' },
  { title: 'ປິດໃຊ້ງານ', value: 'O' }
]

const authStatusItems = [
  { title: 'ອະນຸມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' },
]

const onceAuthItems = [
  { title: 'ໃຊ່', value: 'Y' },
  { title: 'ບໍ່', value: 'N' }
]

const rules = {
  required: (value: any) => !!value || 'ຈຳເປັນຕ້ອງມີຂໍ້ມູນນີ້',
  yearValidation: (value: any) => {
    if (!value) return true
    const year = parseInt(value)
    if (year < 2020 || year > 2030) return 'ປີຕ້ອງຢູ່ລະຫວ່າງ 2020-2030'
    return true
  }
}

watch(cycleYear, (newYear) => {
  updateCycleData()
})

function updateCycleData() {
  if (cycleYear.value) {
    const year = parseInt(cycleYear.value.toString())
    form.value.fin_cycle = year.toString()
    form.value.cycle_Desc = `ປີຮອບວຽນບັນຊີ ${year}`
    form.value.StartDate = `${year}-01-01`
    form.value.EndDate = `${year}-12-31`
  } else {
    form.value.fin_cycle = ''
    form.value.cycle_Desc = ''
    form.value.StartDate = ''
    form.value.EndDate = ''
  }
}

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

function getPreviewPeriods(): PeriodCode[] {
  if (!cycleYear.value || !selectedPeriodType.value) return []
  
  const year = parseInt(cycleYear.value.toString())
  
  switch (selectedPeriodType.value) {
    case 'monthly':
      return generateMonthlyPeriods(year)
    case 'quarterly':
      return generateQuarterlyPeriods(year)
    case 'half-yearly':
      return generateHalfYearlyPeriods(year)
    default:
      return []
  }
}

// FIXED: Generate monthly periods without timezone issues
function generateMonthlyPeriods(year: number): PeriodCode[] {
  const periods: PeriodCode[] = []
  const monthNames = [
    'ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ',
    'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'
  ]
  
  for (let month = 1; month <= 12; month++) {
    const lastDay = getLastDayOfMonth(year, month)
    const startDate = formatDate(year, month, 1)
    const endDate = formatDate(year, month, lastDay)
    
    periods.push({
      period_code: `${year}${String(month).padStart(2, '0')}`,
      PC_StartDate: startDate,
      PC_EndDate: endDate,
      Fin_cycle: form.value.fin_cycle,
      description: `${monthNames[month - 1]} ${year}`,
      type: 'monthly'
    })
  }
  
  return periods
}

// FIXED: Generate quarterly periods without timezone issues
function generateQuarterlyPeriods(year: number): PeriodCode[] {
  const periods: PeriodCode[] = []
  const quarters = [
    { startMonth: 1, endMonth: 3, name: 'ໄຕມາດທີ 1' },
    { startMonth: 4, endMonth: 6, name: 'ໄຕມາດທີ 2' },
    { startMonth: 7, endMonth: 9, name: 'ໄຕມາດທີ 3' },
    { startMonth: 10, endMonth: 12, name: 'ໄຕມາດທີ 4' }
  ]
  
  quarters.forEach((quarter, index) => {
    const startDate = formatDate(year, quarter.startMonth, 1)
    const lastDay = getLastDayOfMonth(year, quarter.endMonth)
    const endDate = formatDate(year, quarter.endMonth, lastDay)
    
    periods.push({
      period_code: `${year}Q${index + 1}`,
      PC_StartDate: startDate,
      PC_EndDate: endDate,
      Fin_cycle: form.value.fin_cycle,
      description: `${quarter.name} ${year}`,
      type: 'quarterly'
    })
  })
  
  return periods
}

// FIXED: Generate half-yearly periods without timezone issues
function generateHalfYearlyPeriods(year: number): PeriodCode[] {
  const periods: PeriodCode[] = []
  const halves = [
    { startMonth: 1, endMonth: 6, name: 'ຄິ້ງແຮກ' },
    { startMonth: 7, endMonth: 12, name: 'ຄິ້ງຫຼັງ' }
  ]
  
  halves.forEach((half, index) => {
    const startDate = formatDate(year, half.startMonth, 1)
    const lastDay = getLastDayOfMonth(year, half.endMonth)
    const endDate = formatDate(year, half.endMonth, lastDay)
    
    periods.push({
      period_code: `${year}H${index + 1}`,
      PC_StartDate: startDate,
      PC_EndDate: endDate,
      Fin_cycle: form.value.fin_cycle,
      description: `${half.name} ${year}`,
      type: 'half-yearly'
    })
  })
  
  return periods
}

async function submitForm() {
  if (!isValid.value || !cycleYear.value) return
  
  loading.value = true
  try {
    console.log('Creating financial cycle:', form.value)
    await axios.post('/api/fin-cycles/', form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    let totalCreated = 1
    let message = 'ສ້າງຮອບວຽນບັນຊີສຳເລັດແລ້ວ!'
    
    if (generatePeriods.value && selectedPeriodType.value) {
      const periodsToCreate = getPreviewPeriods()
      console.log('Creating periods:', periodsToCreate)
      
      const periodPromises = periodsToCreate.map(period => 
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
      
      await Promise.all(periodPromises)
      totalCreated += periodsToCreate.length
      message = `ສ້າງຮອບວຽນບັນຊີແລະລາຍເດືອນສຳເລັດ! (${totalCreated} ລາຍການ)`
    }
    
    showSuccess.value = true
    successMessage.value = message
    
    setTimeout(() => {
      router.push('/fincycle')
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ'
    console.error('Error creating financial cycle and periods:', error)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/fincycle')
}
</script>

<style scoped>
:deep(.v-field__outline) {
  border-radius: 8px;
}

:deep(.v-field--focused .v-field__outline) {
  border-width: 2px;
}

:deep(.v-field:hover .v-field__outline) {
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.v-col {
  padding-top: 8px;
  padding-bottom: 8px;
}

.v-card {
  transition: box-shadow 0.2s ease;
}

.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

:deep(.v-field__prepend-inner .v-icon) {
  opacity: 0.7;
}

:deep(.v-field--focused .v-field__prepend-inner .v-icon) {
  opacity: 1;
}

.v-switch {
  margin-bottom: 16px;
}

.v-radio-group :deep(.v-radio) {
  margin-right: 24px;
}

:deep(.v-field--readonly) {
  opacity: 0.8;
}

.v-chip {
  margin: 2px;
}
</style>