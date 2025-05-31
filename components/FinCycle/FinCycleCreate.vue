<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 600px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ເພີ່ມຮອບວຽນບັນຊີໃໝ່</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">ປ້ອນຂໍ້ມູນຮອບວຽນບັນຊີທີ່ຕ້ອງການເພີ່ມ</p>
      </div>

      <!-- Form Card -->
      <v-card elevation="0" class="rounded-lg pa-6" style="border: 1px solid rgb(var(--v-theme-surface-variant));">
        <v-form @submit.prevent="submitForm" v-model="isValid">
          <v-row>
            <!-- Cycle Code -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.fin_cycle"
                label="ລະຫັດຮອບວຽນ *"
                placeholder="ເຊັ່ນ: 2024Q1, FY2024"
                variant="outlined"
                density="comfortable"
                required
                :rules="[rules.required, rules.cycleCode]"
                maxlength="20"
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
                placeholder="ເຊັ່ນ: ໄຕມາດທີ 1 ປີ 2024"
                variant="outlined"
                density="comfortable"
                maxlength="100"
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

            <!-- Date Range Preview -->
            <v-col cols="12" v-if="form.StartDate && form.EndDate && isValidDateRange">
              <v-divider class="mb-4"></v-divider>
              <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ຕົວຢ່າງໄລຍະເວລາ</div>
              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="pa-3 rounded-lg" color="success" variant="tonal">
                    <div class="text-center">
                      <v-icon color="success" class="mb-2">mdi-calendar-start</v-icon>
                      <div class="text-caption text-success">ເລີ່ມຕົ້ນ</div>
                      <div class="text-h6 font-weight-bold">
                        {{ formatDisplayDate(form.StartDate) }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card class="pa-3 rounded-lg" color="error" variant="tonal">
                    <div class="text-center">
                      <v-icon color="error" class="mb-2">mdi-calendar-end</v-icon>
                      <div class="text-caption text-error">ສິ້ນສຸດ</div>
                      <div class="text-h6 font-weight-bold">
                        {{ formatDisplayDate(form.EndDate) }}
                      </div>
                    </div>
                  </v-card>
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
    </div>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      ເພີ່ມຮອບວຽນບັນຊີສຳເລັດແລ້ວ!
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

const isValid = ref(false)
const loading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

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

function validateDateRange() {
  // This triggers validation for both date fields
}

// Quick date preset functions
function setQuarterDates(quarter: string) {
  const currentYear = new Date().getFullYear()
  
  switch (quarter) {
    case 'Q1':
      form.value.StartDate = `${currentYear}-01-01`
      form.value.EndDate = `${currentYear}-03-31`
      form.value.fin_cycle = `${currentYear}Q1`
      form.value.cycle_Desc = `ໄຕມາດທີ 1 ປີ ${currentYear}`
      break
    case 'Q2':
      form.value.StartDate = `${currentYear}-04-01`
      form.value.EndDate = `${currentYear}-06-30`
      form.value.fin_cycle = `${currentYear}Q2`
      form.value.cycle_Desc = `ໄຕມາດທີ 2 ປີ ${currentYear}`
      break
    case 'Q3':
      form.value.StartDate = `${currentYear}-07-01`
      form.value.EndDate = `${currentYear}-09-30`
      form.value.fin_cycle = `${currentYear}Q3`
      form.value.cycle_Desc = `ໄຕມາດທີ 3 ປີ ${currentYear}`
      break
    case 'Q4':
      form.value.StartDate = `${currentYear}-10-01`
      form.value.EndDate = `${currentYear}-12-31`
      form.value.fin_cycle = `${currentYear}Q4`
      form.value.cycle_Desc = `ໄຕມາດທີ 4 ປີ ${currentYear}`
      break
  }
}

function setYearDates() {
  const currentYear = new Date().getFullYear()
  form.value.StartDate = `${currentYear}-01-01`
  form.value.EndDate = `${currentYear}-12-31`
  form.value.fin_cycle = `FY${currentYear}`
  form.value.cycle_Desc = `ປີງົບປະມານ ${currentYear}`
}

async function submitForm() {
  if (!isValid.value) return
  
  loading.value = true
  try {
    await axios.post('api/fin-cycles/', form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    showSuccess.value = true
    
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

/* Preview cards animation */
.v-card:hover {
  transform: translateY(-2px);
}
</style>