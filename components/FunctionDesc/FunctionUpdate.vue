<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" lg="8">
        <!-- Header -->
        <div class="d-flex align-center mb-6">
          <v-btn
            @click="goBack"
            icon="mdi-arrow-left"
            variant="text"
            class="mr-3"
          />
          <div>
            <h2 class="text-h4 font-weight-medium text-primary">ແກ້ໄຂ Function Description</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mt-1">
              Function ID: {{ functionId }}
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <v-card v-if="loadingData" outlined class="pa-6">
          <div class="text-center">
            <v-progress-circular indeterminate color="primary" size="60" />
            <div class="mt-3 text-h6">ກໍາລັງໂຫລດຂໍ້ມູນ...</div>
          </div>
        </v-card>

        <!-- Error State -->
        <v-card v-else-if="errorMessage" outlined class="pa-6">
          <v-alert type="error" variant="tonal" class="mb-4">
            <template v-slot:title>ເກີດຂໍ້ຜິດພາດ</template>
            {{ errorMessage }}
          </v-alert>
          <div class="text-center">
            <v-btn @click="loadData" color="primary" variant="outlined">
              ລອງໃໝ່
            </v-btn>
          </div>
        </v-card>

        <!-- Form Card -->
        <v-card v-else outlined class="pa-6">
          <!-- Authorization Status Alert -->
          <v-alert
            v-if="originalData.Auth_Status === 'A'"
            type="warning"
            variant="tonal"
            class="mb-4"
            prominent
          >
            <template v-slot:title>
              <v-icon class="mr-2">mdi-shield-check</v-icon>
              ຂໍ້ມູນນີ້ຖືກອະນຸມັດແລ້ວ
            </template>
            Function ນີ້ຖືກອະນຸມັດແລ້ວ ບໍ່ສາມາດແກ້ໄຂໄດ້. ກະລຸນາຍົກເລີກການອະນຸມັດກ່ອນແກ້ໄຂ
          </v-alert>

          <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
            <v-row>
              <!-- Function ID (Read Only) -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.function_id"
                  label="Function ID"
                  variant="outlined"
              
                  bg-color="grey-lighten-4"
                  prepend-inner-icon="mdi-identifier"
                />
              </v-col>

              <!-- Function Order -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.function_order"
                  :disabled="isReadOnly"
                  label="ລໍາດັບ Function"
                  type="number"
                  variant="outlined"
                  :rules="[rules.positiveNumber]"
                  prepend-inner-icon="mdi-numeric"
                  clearable
                />
              </v-col>

              <!-- Description Lao -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.description_la"
                  :disabled="isReadOnly"
                  label="ລາຍລະອຽດ (ພາສາລາວ) *"
                  required
                  variant="outlined"
                  :rules="[rules.required, rules.maxLength200]"
                  counter="200"
                  rows="3"
                  prepend-inner-icon="mdi-text"
                  auto-grow
                />
              </v-col>

              <!-- Description English -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.description_en"
                  :disabled="isReadOnly"
                  label="ລາຍລະອຽດ (ພາສາອັງກິດ)"
                  variant="outlined"
                  :rules="[rules.maxLength200]"
                  counter="200"
                  rows="3"
                  prepend-inner-icon="mdi-translate"
                  auto-grow
                />
              </v-col>

              <!-- EOD Function -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.eod_function"
                  :items="eodFunctionOptions"
                  :disabled="isReadOnly"
                  label="Function EOD"
                  variant="outlined"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-clock-end"
                />
              </v-col>

              <!-- Record Status -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.Record_Status"
                  :items="recordStatusOptions"
                  :disabled="isReadOnly"
                  label="ສະຖານະ Record"
                  variant="outlined"
                  item-title="title"
                  item-value="value"
                  prepend-inner-icon="mdi-toggle-switch"
                />
              </v-col>

              <!-- Current Status Display -->
              <v-col cols="12">
                <v-row>
                  <v-col cols="12" md="4">
                    <v-chip 
                      :color="getRecordStatusColor(originalData.Record_Status)"
                      variant="tonal"
                      size="large"
                      class="mb-2"
                    >
                      <v-icon start>mdi-circle</v-icon>
                      Record: {{ getRecordStatusText(originalData.Record_Status) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-chip 
                      :color="originalData.eod_function === 'Y' ? 'success' : 'grey'"
                      variant="tonal"
                      size="large"
                      class="mb-2"
                    >
                      <v-icon start>{{ originalData.eod_function === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                      EOD: {{ originalData.eod_function === 'Y' ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-chip 
                      :color="getAuthStatusColor(originalData.Auth_Status)"
                      variant="tonal"
                      size="large"
                      class="mb-2"
                    >
                      <v-icon start>{{ originalData.Auth_Status === 'A' ? 'mdi-shield-check' : 'mdi-shield-alert' }}</v-icon>
                      {{ getAuthStatusText(originalData.Auth_Status) }}
                    </v-chip>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Audit Information -->
            <v-divider class="my-6" />
            <h3 class="text-h6 mb-4 d-flex align-center">
              <v-icon class="mr-2">mdi-history</v-icon>
              ຂໍ້ມູນການກວດສອບ
            </h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="originalData.Maker_Id || 'N/A'"
                  label="ຜູ້ສ້າງ"
                  variant="outlined"
                  readonly
                  bg-color="grey-lighten-5"
                  prepend-inner-icon="mdi-account-plus"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDateTime(originalData.Maker_DT_Stamp)"
                  label="ວັນທີສ້າງ"
                  variant="outlined"
                  readonly
                  bg-color="grey-lighten-5"
                  prepend-inner-icon="mdi-calendar-plus"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="originalData.Checker_Id || 'N/A'"
                  label="ຜູ້ກວດສອບ"
                  variant="outlined"
                  readonly
                  bg-color="grey-lighten-5"
                  prepend-inner-icon="mdi-account-check"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDateTime(originalData.Checker_DT_Stamp)"
                  label="ວັນທີກວດສອບ"
                  variant="outlined"
                  readonly
                  bg-color="grey-lighten-5"
                  prepend-inner-icon="mdi-calendar-check"
                />
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <v-row class="mt-6">
              <v-col cols="12">
                <div class="d-flex justify-end gap-3">
                  <v-btn
                    @click="resetForm"
                    variant="outlined"
                    color="grey"
                    :disabled="loading || isReadOnly"
                    prepend-icon="mdi-refresh"
                    class="text-none"
                  >
                    ລ້າງຂໍ້ມູນ
                  </v-btn>
                  <v-btn
                    @click="goBack"
                    variant="outlined"
                    color="error"
                    :disabled="loading"
                    prepend-icon="mdi-close"
                    class="text-none"
                  >
                    ຍົກເລີກ
                  </v-btn>
                  <v-btn
                    v-if="!isReadOnly"
                    type="submit"
                    color="primary"
                    variant="flat"
                    :loading="loading"
                    :disabled="!formValid || !hasChanges"
                    prepend-icon="mdi-content-save"
                    class="text-none px-8"
                  >
                    ອັບເດດ
                  </v-btn>
                  <v-chip
                    v-else
                    color="warning"
                    variant="tonal"
                    size="large"
                  >
                    <v-icon start>mdi-lock</v-icon>
                    ບໍ່ສາມາດແກ້ໄຂໄດ້
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for notifications -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      :timeout="4000"
      location="bottom right"
      variant="flat"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ snackbar.message }}
      </div>
      <template v-slot:actions>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()
const route = useRoute()

// Reactive data
const loading = ref(false)
const loadingData = ref(true)
const errorMessage = ref('')
const formValid = ref(false)
const formRef = ref(null)

// Get function_id from route params or query
const functionId = computed(() => {
  return route.params.id || route.query.function_id || route.query.id
})

// Form data
const form = ref({
  function_id: '',
  description_la: '',
  description_en: '',
  eod_function: 'N',
  function_order: null,
  Record_Status: 'Y'
})

const originalData = ref({})

// Options matching FunctionList component
const eodFunctionOptions = ref([
  { title: 'ເປີດໃຊ້', value: 'Y' },
  { title: 'ປິດໃຊ້', value: 'N' }
])

const recordStatusOptions = ref([
  { title: 'ເປີດ', value: 'O' },
  { title: 'ປິດ', value: 'C' },
  { title: 'ໃຊ້ງານ', value: 'Y' },
  { title: 'ບໍ່ໃຊ້ງານ', value: 'N' }
])

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Validation rules
const rules = {
  required: (value) => !!value || 'ຈໍາເປັນຕ້ອງປ້ອນ',
  maxLength200: (value) => !value || value.length <= 200 || 'ບໍ່ສາມາດເກີນ 200 ຕົວອັກສອນ',
  positiveNumber: (value) => !value || value > 0 || 'ຕ້ອງເປັນຕົວເລກບວກ'
}

// Computed
const isReadOnly = computed(() => originalData.value.Auth_Status === 'A')

const hasChanges = computed(() => {
  if (!originalData.value.function_id) return false
  
  const original = {
    function_id: originalData.value.function_id,
    description_la: originalData.value.description_la || '',
    description_en: originalData.value.description_en || '',
    eod_function: originalData.value.eod_function,
    function_order: originalData.value.function_order,
    Record_Status: originalData.value.Record_Status
  }
  
  return JSON.stringify(form.value) !== JSON.stringify(original)
})

// Methods
const goBack = () => {
  router.push('/functiondesc')
}

const loadData = async () => {
  if (!functionId.value) {
    errorMessage.value = 'ບໍ່ພົບ Function ID'
    loadingData.value = false
    return
  }

  loadingData.value = true
  errorMessage.value = ''
  
  try {
    const response = await axios.get(`/api/function-desc/${functionId.value}/`)
    
    if (response.data) {
      originalData.value = response.data
      form.value = {
        function_id: response.data.function_id,
        description_la: response.data.description_la || '',
        description_en: response.data.description_en || '',
        eod_function: response.data.eod_function || 'N',
        function_order: response.data.function_order,
        Record_Status: response.data.Record_Status || 'Y'
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
    if (error.response?.status === 404) {
      errorMessage.value = 'ບໍ່ພົບຂໍ້ມູນ Function Description'
    } else if (error.response?.status === 403) {
      errorMessage.value = 'ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຂໍ້ມູນນີ້'
    } else {
      errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ'
    }
  } finally {
    loadingData.value = false
  }
}

const submitForm = async () => {
  if (!formValid.value || isReadOnly.value || !hasChanges.value) return

  loading.value = true
  try {
    const response = await axios.put(`/api/function-desc/${functionId.value}/`, form.value)
    
    if (response.data) {
      showSnackbar('ອັບເດດສໍາເລັດແລ້ວ', 'success')
      setTimeout(() => {
        goBack()
      }, 1500)
    }
  } catch (error) {
    console.error('Error updating data:', error)
    
    if (error.response?.data?.errors) {
      // Handle field-specific errors
      const errors = error.response.data.errors
      Object.keys(errors).forEach(field => {
        showSnackbar(`${field}: ${errors[field][0]}`, 'error')
      })
    } else if (error.response?.data?.detail) {
      showSnackbar(error.response.data.detail, 'error')
    } else if (error.response?.data?.error) {
      showSnackbar(error.response.data.error, 'error')
    } else {
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ', 'error')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  if (originalData.value.function_id) {
    form.value = {
      function_id: originalData.value.function_id,
      description_la: originalData.value.description_la || '',
      description_en: originalData.value.description_en || '',
      eod_function: originalData.value.eod_function || 'N',
      function_order: originalData.value.function_order,
      Record_Status: originalData.value.Record_Status || 'Y'
    }
    formRef.value?.resetValidation()
    showSnackbar('ຂໍ້ມູນຖືກລ້າງແລ້ວ', 'info')
  }
}

// Status helper methods matching FunctionList component
const getRecordStatusColor = (status) => {
  const colors = {
    'O': 'success',
    'C': 'error',
    'Y': 'success',
    'N': 'grey'
  }
  return colors[status] || 'grey'
}

const getRecordStatusText = (status) => {
  const texts = {
    'O': 'ເປີດ',
    'C': 'ປິດ',
    'Y': 'ໃຊ້ງານ',
    'N': 'ບໍ່ໃຊ້ງານ'
  }
  return texts[status] || status
}

const getAuthStatusColor = (status) => {
  return status === 'A' ? 'success' : 'warning'
}

const getAuthStatusText = (status) => {
  return status === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າອະນຸມັດ'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A'
  try {
    return new Date(dateTime).toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateTime
  }
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  if (!functionId.value) {
    errorMessage.value = 'ບໍ່ພົບ Function ID ໃນ URL'
    loadingData.value = false
    return
  }
  loadData()
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-btn {
  text-transform: none !important;
  border-radius: 8px;
}

.gap-3 {
  gap: 12px;
}

.v-alert {
  border-radius: 8px;
}

.v-chip {
  font-weight: 500;
}

/* Form field spacing */
:deep(.v-field) {
  border-radius: 8px;
}

/* Status chips styling */
.status-chips .v-chip {
  margin: 4px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .d-flex.justify-end {
    flex-direction: column;
  }
  
  .d-flex.justify-end .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Loading state */
.v-progress-circular {
  margin: 20px auto;
}

/* Enhanced button styles */
.v-btn--variant-flat {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>