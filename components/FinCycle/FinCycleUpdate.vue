<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 900px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ແກ້ໄຂຮອບວຽນບັນຊີ</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">
          ປັບປຸງຂໍ້ມູນຮອບວຽນບັນຊີ {{ form.fin_cycle }}
          <v-chip v-if="existingPeriods.length > 0" color="amber-darken-2" size="small" class="ml-2">
            {{ existingPeriods.length }} ລາຍເດືອນ
          </v-chip>
        </p>
      </div>

      <!-- Form Card -->
      <v-card 
        elevation="0" 
        class="rounded-lg pa-6 mb-6" 
        style="border: 1px solid rgb(var(--v-theme-surface-variant));"
        :loading="loading"
      >
        <v-form @submit.prevent="updateForm" v-model="isValid">
          <v-row>
            <!-- Cycle Code (Disabled) -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fin_cycle"
                label="ລະຫັດຮອບວຽນ"
                variant="outlined"
                density="comfortable"
                disabled
                readonly
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
                placeholder="ເຊັ່ນ: ຮອບວຽນບັນຊີ ປີ  * "
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
                    <div class="text-subtitle-2">ໄລຍະເວລາຮອບວຽນ</div>
                    <div class="text-h6 font-weight-bold">
                      {{ duration }}
                    </div>
                    <div class="text-caption" v-if="originalDuration && duration !== originalDuration">
                      ເດີມ: {{ originalDuration }}
                      <v-chip 
                        size="x-small" 
                        :color="isDurationIncreased ? 'error' : 'success'"
                        variant="text"
                        class="ml-1"
                      >
                        {{ isDurationIncreased ? '↑' : '↓' }} ມີການປ່ຽນແປງ
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

            <!-- Audit Information -->
            <v-col cols="12" v-if="form.Maker_Id || form.Checker_Id">
              <v-divider class="mb-4"></v-divider>
              <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ຂໍ້ມູນການກວດສອບ</div>
              <v-row>
                <v-col cols="12" md="6" v-if="form.Maker_Id">
                  <v-text-field
                    :model-value="form.Maker_Id"
                    label="ຜູ້ສ້າງ"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    disabled
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-account-plus</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
                
                <v-col cols="12" md="6" v-if="form.Maker_DT_Stamp">
                  <v-text-field
                    :model-value="formatDate(form.Maker_DT_Stamp)"
                    label="ວັນທີສ້າງ"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    disabled
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-calendar</v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="6" v-if="form.Checker_Id">
                  <v-text-field
                    :model-value="form.Checker_Id"
                    label="ຜູ້ກວດສອບ"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    disabled
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-account-check</v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="6" v-if="form.Checker_DT_Stamp">
                  <v-text-field
                    :model-value="formatDate(form.Checker_DT_Stamp)"
                    label="ວັນທີກວດສອບ"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    disabled
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-calendar-check</v-icon>
                    </template>
                  </v-text-field>
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
              :disabled="!isValid || updateLoading"
              :loading="updateLoading"
              class="text-none px-8"
            >
              ອັບເດດ
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <!-- Period Management Section -->
      <v-card 
        elevation="0" 
        class="rounded-lg pa-6" 
        style="border: 1px solid rgb(var(--v-theme-surface-variant));"
        v-if="form.fin_cycle"
      >
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-icon color="purple" size="28" class="mr-3">mdi-calendar-month</v-icon>
            <div>
              <div class="text-h6 font-weight-bold text-styles">ການຈັດການລາຍເດືອນ</div>
              <div class="text-caption text-grey">{{ existingPeriods.length }} ລາຍການທີ່ມີຢູ່</div>
            </div>
          </div>
          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            @click="refreshPeriods"
            :loading="loadingPeriods"
            prepend-icon="mdi-refresh"
            class="text-none"
          >
            ໂຫຼດລາຍເດືອນ
          </v-btn>
        </div>

        <!-- Existing Periods Display -->
        <div v-if="existingPeriods.length > 0" class="mb-6">
          <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ລາຍເດືອນທີ່ມີຢູ່</div>
          <v-row>
            <v-col 
              v-for="(period, index) in existingPeriods" 
              :key="index"
              cols="12" sm="6" md="4" lg="3"
            >
              <v-card 
                class="pa-3 rounded-lg position-relative" 
                :color="getPeriodTypeColor(period.period_code)" 
                variant="tonal"
                elevation="1"
                hover
              >
                <v-btn
                  color="error"
                  variant="text"
                  size="x-small"
                  icon
                  @click="deletePeriod(period)"
                  :loading="deletingPeriod === period.period_code"
                  class="position-absolute"
                  style="top: 4px; right: 4px; z-index: 1;"
                >
                  <v-icon size="14">mdi-close</v-icon>
                </v-btn>
                <div class="text-center">
                  <v-icon :color="getPeriodTypeColor(period.period_code)" class="mb-1" size="20">
                    {{ getPeriodTypeIcon(period.period_code) }}
                  </v-icon>
                  <div class="font-weight-bold text-body-2">{{ period.period_code }}</div>
                  <div class="text-caption mt-1">
                    {{ formatShortDate(period.PC_StartDate) }} - {{ formatShortDate(period.PC_EndDate) }}
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Period Generation Section -->
        <div v-if="isValidDateRange && form.fin_cycle">
          <v-divider class="mb-4" v-if="existingPeriods.length > 0"></v-divider>
          <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ເພີ່ມລາຍເດືອນໃໝ່</div>
          
          <!-- Period Generation Buttons -->
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-btn
                color="amber-darken-2"
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
                color="amber-darken-2"
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
                color="amber-darken-2"
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
              ລາຍການເດືອນທີ່ຈະເພີ່ມ ({{ generatedPeriods.length }} ລາຍການ)
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
                ບັນທຶກລາຍເດືອນໃໝ່
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="existingPeriods.length === 0 && !loadingPeriods" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2" class="mb-4">
            mdi-calendar-blank
          </v-icon>
          <p class="text-h6 text-grey-lighten-1 mb-2">
            ບໍ່ມີລາຍເດືອນ
          </p>
          <p class="text-body-2 text-grey-lighten-1 mb-4">
            ເລີ່ມຕົ້ນໂດຍການສ້າງລາຍເດືອນໃໝ່ຂ້າງເທິງ
          </p>
        </div>
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

    <!-- Loading Overlay -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        size="64"
        indeterminate
      ></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import { FinCycleModel } from '~/models'

const route = useRoute()
const router = useRouter()
const id = route.query.id as string

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
const loadingPeriods = ref(false)
const updateLoading = ref(false)
const deletingPeriod = ref<string | null>(null)
const generatingPeriods = ref<string | null>(null)
const savingPeriods = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const originalDuration = ref<string | null>(null)
const existingPeriods = ref<any[]>([])
const generatedPeriods = ref<PeriodCode[]>([])

// Fully typed with your interface:
const form = ref<FinCycleModel.FinCycleResponse>({
  fin_cycle: '',
  cycle_Desc: '',
  StartDate: '',   // will come back as ISO date strings
  EndDate: '',
  Record_Status: '',
  Maker_DT_Stamp: null,
  Checker_DT_Stamp: null,
  Auth_Status: '',
  Once_Auth: '',
  Maker_Id: '',
  Checker_Id: null,
})

// Computed properties
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

const isDurationIncreased = computed(() => {
  if (!duration.value || !originalDuration.value) return false
  // Simple comparison - could be more sophisticated
  return duration.value.length > originalDuration.value.length
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
  { title: 'ໃຊ້', value: 'Y' },
  { title: 'ບໍ່', value: 'N' }
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'ຈຳເປັນຕ້ອງມີຂໍ້ມູນນີ້',
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

function formatDate(date: Date | string | null) {
  if (!date) return '-'
  try {
    const d = new Date(date)
    return d.toLocaleString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

function validateDateRange() {
  // This triggers validation for both date fields
  generatedPeriods.value = [] // Clear generated periods when dates change
}

function getPeriodTypeColor(periodCode: string): string {
  if (periodCode.includes('Q')) return 'amber-darken-2'
  if (periodCode.includes('H')) return 'amber-darken-2'
  return 'amber-darken-2' // Monthly
}

function getPeriodTypeIcon(periodCode: string): string {
  if (periodCode.includes('Q')) return 'mdi-calendar-range'
  if (periodCode.includes('H')) return 'mdi-calendar-range-outline'
  return 'mdi-calendar-month-outline' // Monthly
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

// Period generation functions
function generatePeriods(type: 'monthly' | 'quarterly' | 'half-yearly') {
  if (!form.value.StartDate || !form.value.EndDate || !form.value.fin_cycle) return
  
  generatingPeriods.value = type
  generatedPeriods.value = []
  
  setTimeout(() => {
    const startDate = new Date(form.value.StartDate)
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
    
    // Filter out existing periods
    const existingCodes = existingPeriods.value.map(p => p.period_code)
    generatedPeriods.value = generatedPeriods.value.filter(p => !existingCodes.includes(p.period_code))
    
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
    { start: [year, 0, 1], end: [year, 5, 30], name: 'ເຄິ່ງແລກ' },
    { start: [year, 6, 1], end: [year, 11, 31], name: 'ເຄິ່ງຫຼັງ' }
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

async function refreshPeriods() {
  if (!form.value.fin_cycle) return
  
  loadingPeriods.value = true
  try {
    const { data } = await axios.get(`/api/percodes/?Fin_cycle=${form.value.fin_cycle}`, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
    existingPeriods.value = data
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດລາຍເດືອນ'
    showError.value = true
    console.error('Error fetching periods:', error)
  } finally {
    loadingPeriods.value = false
  }
}

async function deletePeriod(period: any) {
  deletingPeriod.value = period.period_code
  try {
    await axios.delete(`/api/percodes/${period.period_code}/`, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
    
    // Remove from local array
    const index = existingPeriods.value.findIndex(p => p.period_code === period.period_code)
    if (index > -1) {
      existingPeriods.value.splice(index, 1)
    }
    
    successMessage.value = 'ລົບລາຍເດືອນສຳເລັດແລ້ວ'
    showSuccess.value = true
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົບລາຍເດືອນ'
    showError.value = true
    console.error('Error deleting period:', error)
  } finally {
    deletingPeriod.value = null
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
    
    // Add to existing periods
    existingPeriods.value.push(...generatedPeriods.value)
    generatedPeriods.value = []
    
    successMessage.value = `ບັນທຶກລາຍເດືອນສຳເລັດ ${promises.length} ລາຍການ`
    showSuccess.value = true
    
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກລາຍເດືອນ'
    showError.value = true
    console.error('Error saving periods:', error)
  } finally {
    savingPeriods.value = false
  }
}

async function loadData() {
  if (!id) {
    showError.value = true
    errorMessage.value = 'ບໍ່ພົບລະຫັດຮອບວຽນບັນຊີ'
    return
  }

  loading.value = true
  try {
    const res = await axios.get<FinCycleModel.FinCycleResponse>(`/api/fin-cycles/${id}/`, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
    form.value = res.data
    
    // Store original duration for comparison
    if (res.data.StartDate && res.data.EndDate) {
      originalDuration.value = calculateDuration(res.data.StartDate, res.data.EndDate)
    }

    // Load existing periods
    await refreshPeriods()
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
    console.error('Error loading financial cycle:', error)
  } finally {
    loading.value = false
  }
}

async function updateForm() {
  if (!isValid.value) return
  
  updateLoading.value = true
  try {
    await axios.put(`/api/fin-cycles/${id}/`, form.value, {
      headers: {
        "Content-Type": "application/json", 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
    
    successMessage.value = 'ອັບເດດຮອບວຽນບັນຊີສຳເລັດແລ້ວ!'
    showSuccess.value = true
    
    // Go back after success
    setTimeout(() => {
      router.push('/fincycle')
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ'
    console.error('Error updating financial cycle:', error)
  } finally {
    updateLoading.value = false
  }
}

function goBack() {
  router.push('/fincycle')
}

onMounted(loadData)
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

/* Disabled field styling */
:deep(.v-field--disabled) {
  opacity: 0.6;
}

:deep(.v-field--disabled .v-field__outline) {
  border-style: dashed;
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

/* Audit section styling */
:deep(.v-field--disabled .v-field__prepend-inner .v-icon) {
  opacity: 0.5;
}

/* Period cards hover effect */
.v-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* Period generation buttons */
.v-btn .v-btn__content {
  flex-direction: column;
}

.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

/* Position relative for absolute positioned delete button */
.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}
</style>