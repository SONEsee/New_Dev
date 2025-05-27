<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 600px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ແກ້ໄຂຮອບວຽນບັນຊີ</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">ປັບປຸງຂໍ້ມູນຮອບວຽນບັນຊີ {{ form.fin_cycle }}</p>
      </div>

      <!-- Form Card -->
      <v-card 
        elevation="0" 
        class="rounded-lg pa-6" 
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
    </div>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      ອັບເດດຮອບວຽນບັນຊີສຳເລັດແລ້ວ!
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

const isValid = ref(false)
const loading = ref(false)
const updateLoading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const originalDuration = ref<string | null>(null)

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
}

// Quick date preset functions
function setQuarterDates(quarter: string) {
  const currentYear = new Date().getFullYear()
  
  switch (quarter) {
    case 'Q1':
      form.value.StartDate = `${currentYear}-01-01`
      form.value.EndDate = `${currentYear}-03-31`
      form.value.cycle_Desc = `ໄຕມາດທີ 1 ປີ ${currentYear}`
      break
    case 'Q2':
      form.value.StartDate = `${currentYear}-04-01`
      form.value.EndDate = `${currentYear}-06-30`
      form.value.cycle_Desc = `ໄຕມາດທີ 2 ປີ ${currentYear}`
      break
    case 'Q3':
      form.value.StartDate = `${currentYear}-07-01`
      form.value.EndDate = `${currentYear}-09-30`
      form.value.cycle_Desc = `ໄຕມາດທີ 3 ປີ ${currentYear}`
      break
    case 'Q4':
      form.value.StartDate = `${currentYear}-10-01`
      form.value.EndDate = `${currentYear}-12-31`
      form.value.cycle_Desc = `ໄຕມາດທີ 4 ປີ ${currentYear}`
      break
  }
}

function setYearDates() {
  const currentYear = new Date().getFullYear()
  form.value.StartDate = `${currentYear}-01-01`
  form.value.EndDate = `${currentYear}-12-31`
  form.value.cycle_Desc = `ປີງົບປະມານ ${currentYear}`
}

async function loadData() {
  if (!id) {
    showError.value = true
    errorMessage.value = 'ບໍ່ພົບລະຫັດຮອບວຽນບັນຊີ'
    return
  }

  loading.value = true
  try {
    const res = await axios.get<FinCycleModel.FinCycleResponse>(`api/fin-cycles/${id}/`, {
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
    await axios.put(`api/fin-cycles/${id}/`, form.value, {
      headers: {
        "Content-Type": "application/json", 
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
    
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