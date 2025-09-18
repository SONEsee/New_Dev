<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 600px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ແກ້ໄຂອັດຕາແລກປ່ຽນ</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">ປັບປຸງຂໍ້ມູນອັດຕາແລກປ່ຽນ {{ form.ccy_code }}</p>
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
            <!-- Currency Code (Disabled) -->
            <v-col cols="12">
              <v-text-field
                v-model="form.ccy_code"
                label="ລະຫັດສະກຸນເງິນ"
                variant="outlined"
                density="comfortable"
                disabled
                readonly
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-currency-usd</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Exchange Rates Section -->
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ອັດຕາແລກປ່ຽນ</div>
              <v-row>
                <!-- Buy Rate -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.Buy_Rate"
                    label="ອັດຕາຊື້ *"
                    placeholder="0.0000"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                    step="0.0001"
                    min="0"
                    required
                    :rules="[rules.required, rules.positiveNumber]"
                    @input="calculateSpread"
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-trending-up</v-icon>
                    </template>
                    <template #append-inner>
                      <span class="text-caption text-success">ຊື້</span>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Sale Rate -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.Sale_Rate"
                    label="ອັດຕາຂາຍ *"
                    placeholder="0.0000"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                    step="0.0001"
                    min="0"
                    required
                    :rules="[rules.required, rules.positiveNumber, rules.saleRateValidation]"
                    @input="calculateSpread"
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-trending-down</v-icon>
                    </template>
                    <template #append-inner>
                      <span class="text-caption text-error">ຂາຍ</span>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </v-col>

            <!-- Spread Display -->
            <v-col cols="12" v-if="spread !== null">
              <v-card 
                class="pa-4 rounded-lg" 
                :color="getSpreadColor(spread)" 
                variant="tonal"
              >
                <div class="d-flex align-center">
                  <v-icon size="24" :color="getSpreadColor(spread)">mdi-calculator</v-icon>
                  <div class="ml-3">
                    <div class="text-subtitle-2">ຄ່າຕ່າງ (Spread)</div>
                    <div class="text-h6 font-weight-bold">
                      {{ formatCurrency(spread) }}
                    </div>
                    <div class="text-caption" v-if="originalSpread !== null">
                      ເດີມ: {{ formatCurrency(originalSpread) }}
                      <v-chip 
                        size="x-small" 
                        :color="spread > originalSpread ? 'error' : 'success'"
                        variant="text"
                        class="ml-1"
                      >
                        {{ spread > originalSpread ? '↑' : '↓' }} 
                        {{ formatCurrency(Math.abs(spread - originalSpread)) }}
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
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.INT_Auth_Status"
                    label="ສະຖານະອະນຸມັດພາຍໃນ"
                    :items="intAuthStatusItems"
                    variant="outlined"
                    density="comfortable"
                    clearable
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-check-circle</v-icon>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.Auth_Status"
                    label="ສະຖານະອະນຸມັດສຸດທ້າຍ"
                    :items="authStatusItems"
                    variant="outlined"
                    density="comfortable"
                    clearable
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-shield-check</v-icon>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-col>

            <!-- Target Date Information -->
            <v-col cols="12">
              <v-card 
                class="pa-4 rounded-lg" 
                color="info" 
                variant="tonal"
              >
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon size="24" color="info">mdi-calendar-today</v-icon>
                    <div class="ml-3">
                      <div class="text-subtitle-2">ວັນທີເປົ້າໝາຍ (Target Date)</div>
                      <div class="text-h6 font-weight-bold">
                        {{ formatDateSimple(targetDate) }}
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        ວັນທີນີ້ຈະຖືກໃຊ້ເປັນ value_date ໃນການອັບເດດ
                      </div>
                    </div>
                  </div>
                  <v-btn
                    size="small"
                    variant="text"
                    color="info"
                    @click="refreshTargetDate"
                    :loading="refreshingDate"
                    class="text-none"
                  >
                    <v-icon size="16">mdi-refresh</v-icon>
                    ອັບເດດວັນທີ
                  </v-btn>
                </div>
              </v-card>
            </v-col>

            <!-- Exchange Rate Preview -->
            <v-col cols="12" v-if="form.ccy_code && form.Buy_Rate && form.Sale_Rate">
              <v-divider class="mb-4"></v-divider>
              <div class="text-subtitle-2 mb-3 text-grey-darken-1 text-styles">ຕົວຢ່າງການແລກປ່ຽນ</div>
              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="pa-3 rounded-lg" color="success" variant="tonal">
                    <div class="text-center">
                      <div class="text-caption text-success">ຊື້ {{ form.ccy_code }}</div>
                      <div class="text-h6 font-weight-bold">
                        1 {{ form.ccy_code }} = {{ formatCurrency(form.Buy_Rate) }} LAK
                      </div>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card class="pa-3 rounded-lg" color="error" variant="tonal">
                    <div class="text-center">
                      <div class="text-caption text-error">ຂາຍ {{ form.ccy_code }}</div>
                      <div class="text-h6 font-weight-bold">
                        1 {{ form.ccy_code }} = {{ formatCurrency(form.Sale_Rate) }} LAK
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
                
                <v-col cols="12" md="6" v-if="form.value_date">
                  <v-text-field
                    :model-value="formatDate(form.value_date)"
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
      ອັບເດດອັດຕາແລກປ່ຽນສຳເລັດແລ້ວ!
    </v-snackbar>

    <!-- Target Date Refresh Success Snackbar -->
    <v-snackbar
      v-model="showDateRefresh"
      color="info"
      timeout="2000"
      location="top"
    >
      <v-icon class="mr-2">mdi-calendar-check</v-icon>
      ອັບເດດວັນທີເປົ້າໝາຍສຳເລັດແລ້ວ!
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
import { ExcRateModel } from '~/models'

// Types for API responses
interface EODCheckResponse {
  available: boolean
  reason: string
  target_date: string
  is_back_date: boolean
  back_value_enabled: boolean
  current_eod: {
    date_id: number
    eod_process_date: string
    next_working_day: string
    eod_status: string
  }
}

const route = useRoute()
const router = useRouter()
const id = route.query.id as string

const isValid = ref(false)
const loading = ref(false)
const updateLoading = ref(false)
const refreshingDate = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const showDateRefresh = ref(false)
const errorMessage = ref('')
const originalSpread = ref<number | null>(null)
const targetDate = ref<string>('')

const form = ref<ExcRateModel.ExcRateResponse>({
  id: 0,
  ccy_code: '',
  Buy_Rate: 0,
  Sale_Rate: 0,
  INT_Auth_Status: '',
  Auth_Status: '',
  Maker_Id: '',
  Checker_Id: null,
  value_date: '',
  Maker_DT_Stamp: new Date(),
  Checker_DT_Stamp: null,
})

// Computed property for spread calculation
const spread = computed(() => {
  if (form.value.Sale_Rate && form.value.Buy_Rate) {
    return Number(form.value.Sale_Rate) - Number(form.value.Buy_Rate)
  }
  return null
})

// Dropdown options with better labels
const intAuthStatusItems = [
  { title: 'ອະນຸມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' },
]

const authStatusItems = [
  { title: 'ອະນຸມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' },
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'ຈຳເປັນຕ້ອງມີຂໍ້ມູນນີ້',
  positiveNumber: (value: number) => {
    if (value === null || value === undefined) return true
    if (value <= 0) return 'ຄ່າຕ້ອງເປັນຈຳນວນບວກ'
    return true
  },
  saleRateValidation: (value: number) => {
    if (!value || !form.value.Buy_Rate) return true
    if (value <= form.value.Buy_Rate) return 'ອັດຕາຂາຍຕ້ອງສູງກວ່າອັດຕາຊື້'
    return true
  }
}

// Helper functions
const formatCurrency = (value: number | null) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('lo-LA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value)
}

const getSpreadColor = (spread: number | null) => {
  if (!spread) return 'grey'
  if (spread < 50) return 'success'
  if (spread < 100) return 'warning'
  return 'error'
}

const formatDate = (date: Date | string | null) => {
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

const formatDateSimple = (date: string | null) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  } catch {
    return '-'
  }
}

const calculateSpread = () => {
  // This is automatically handled by the computed property
  // Just trigger reactivity if needed
}

const refreshTargetDate = async () => {
  refreshingDate.value = true
  try {
    const newTargetDate = await getTargetDate()
    targetDate.value = newTargetDate
    
    // Show success message for date refresh
    showDateRefresh.value = true
  } catch (error) {
    console.error('Error refreshing target date:', error)
    showError.value = true
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດວັນທີເປົ້າໝາຍ'
  } finally {
    refreshingDate.value = false
  }
}

// Enhanced getTargetDate with detailed logging
const getTargetDate = async (): Promise<string> => {
  console.log('🔍 Starting getTargetDate request...')
  
  try {
    const response = await axios.get<EODCheckResponse>('/api/end-of-day-journal/check/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    
    console.log('✅ EOD API Response:', response.data)
    
    if (response.data.target_date) {
      console.log('✅ Target date found:', response.data.target_date)
      targetDate.value = response.data.target_date
      return response.data.target_date
    }
    
    console.error('❌ Target date not found in response:', response.data)
    throw new Error('Target date not found in response')
  } catch (error: any) {
    console.error('❌ Error fetching target date:', error)
    console.error('❌ Error response:', error.response?.data)
    
    // Fallback to current date if API fails
    const fallbackDate = new Date().toISOString().split('T')[0]
    console.log('⚠️ Using fallback date:', fallbackDate)
    targetDate.value = fallbackDate
    return fallbackDate
  }
}

const loadData = async () => {
  if (!id) {
    showError.value = true
    errorMessage.value = 'ບໍ່ພົບລະຫັດອັດຕາແລກປ່ຽນ'
    return
  }

  loading.value = true
  try {
    // First get the target date
    const dateFromAPI = await getTargetDate()
    
    // Then load the exchange rate data
    const res = await axios.get<ExcRateModel.ExcRateResponse>(`api/exc-rate/${id}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    // Update form with loaded data and set value_date to target_date from API
    form.value = {
      ...res.data,
      value_date: dateFromAPI
    }
    
    // Store original spread for comparison
    if (res.data.Sale_Rate && res.data.Buy_Rate) {
      originalSpread.value = Number(res.data.Sale_Rate) - Number(res.data.Buy_Rate)
    }
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
    console.error('Error loading exchange rate:', error)
  } finally {
    loading.value = false
  }
}

const updateForm = async () => {
  if (!isValid.value) return
  
  updateLoading.value = true
  try {
    // Always get the latest target_date before updating to ensure we use the current business date
    const latestTargetDate = await getTargetDate()
    
    // Prepare update data with the latest target_date as value_date
    const updateData = {
      ...form.value,
      value_date: latestTargetDate
    }
    
    console.log('Updating exchange rate with target_date:', latestTargetDate)
    
    await axios.put(`api/exc-rate/${id}/`, updateData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    showSuccess.value = true
    
    // Go back after success
    setTimeout(() => {
      router.push('/excrate')
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ'
    console.error('Error updating exchange rate:', error)
  } finally {
    updateLoading.value = false
  }
}

const goBack = () => {
  router.push('/excrate')
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

/* Number input styling */
:deep(input[type="number"]) {
  text-align: right;
}

/* Preview cards animation */
.v-card:hover {
  transform: translateY(-2px);
}
</style>