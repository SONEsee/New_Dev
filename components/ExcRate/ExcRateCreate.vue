<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 600px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ເພີ່ມອັດຕາແລກປ່ຽນໃໝ່</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">ປ້ອນຂໍ້ມູນອັດຕາແລກປ່ຽນທີ່ຕ້ອງການເພີ່ມ</p>
      </div>

      <!-- Form Card -->
      <v-card elevation="0" class="rounded-lg pa-6" style="border: 1px solid rgb(var(--v-theme-surface-variant));">
        <v-form @submit.prevent="submitForm" v-model="isValid">
          <v-row>
            <!-- Currency Code -->
            <v-col cols="12">
              <v-text-field
                v-model="form.ccy_code"
                label="ລະຫັດສະກຸນເງິນ *"
                placeholder="ເຊັ່ນ: USD, EUR, THB"
                variant="outlined"
                density="comfortable"
                required
                :rules="[rules.required, rules.currencyCode]"
                maxlength="3"
                style="text-transform: uppercase;"
                @input="form.ccy_code = form.ccy_code.toUpperCase()"
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
      ເພີ່ມອັດຕາແລກປ່ຽນສຳເລັດແລ້ວ!
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

const router = useRouter()

const isValid = ref(false)
const loading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const form = ref({
  ccy_code: '',
  Buy_Rate: 0,
  Sale_Rate: 0,
  INT_Auth_Status: 'U',
  Auth_Status: 'U',
})

// Computed property for spread calculation
const spread = computed(() => {
  if (form.value.Sale_Rate && form.value.Buy_Rate) {
    return form.value.Sale_Rate - form.value.Buy_Rate
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
  currencyCode: (value: string) => {
    if (!value) return true
    if (value.length < 3) return 'ລະຫັດສະກຸນເງິນຕ້ອງມີ 3 ຕົວອັກສອນ'
    if (!/^[A-Z]+$/.test(value)) return 'ໃຊ້ພຽງຕົວອັກສອນພິມໃຫຍ່ເທົ່ານັ້ນ'
    return true
  },
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

const calculateSpread = () => {
  // This is automatically handled by the computed property
  // Just trigger reactivity if needed
}

const submitForm = async () => {
  if (!isValid.value) return
  
  loading.value = true
  try {
    await axios.post('api/exc-rate/', form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    showSuccess.value = true
    
    // Reset form after success
    setTimeout(() => {
      router.push('/excrate')
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ'
    console.error('Error creating exchange rate:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/excrate')
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

/* Number input styling */
:deep(input[type="number"]) {
  text-align: right;
}

/* Preview cards animation */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>