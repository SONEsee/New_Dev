<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <!-- Header -->
        <div class="mb-6">
          <v-btn
            @click="$router.go(-1)"
            icon
            variant="text"
            class="mb-4"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-light mb-1">ສ້າງ Function Description ໃໝ່</h1>
          <p class="text-body-2 text-grey">ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນໃນແບບຟອມດ້ານລຸ່ມ</p>
        </div>

        <!-- Form Card -->
        <v-card elevation="0" class="border">
          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
              <!-- Basic Information Section -->
              <div class="mb-6">
                <h3 class="text-h6 font-weight-regular mb-4">ຂໍ້ມູນພື້ນຖານ</h3>
                <v-row>
                  <!-- Function ID -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="form.function_id"
                      label="Function ID"
                      required
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required, rules.maxLength20, rules.functionId]"
                      counter="20"
                      placeholder="FN001"
                      persistent-placeholder
                    >
                      <template v-slot:prepend-inner>
                        <v-icon size="small" color="grey">mdi-identifier</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>

                  <!-- Function Order -->
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="form.function_order"
                      label="ລໍາດັບ Function"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.positiveNumber]"
                      placeholder="1"
                      persistent-placeholder
                    >
                      <template v-slot:prepend-inner>
                        <v-icon size="small" color="grey">mdi-sort-numeric-ascending</v-icon>
                      </template>
                    </v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- Description Section -->
              <div class="mb-6">
                <h3 class="text-h6 font-weight-regular mb-4">ລາຍລະອຽດ</h3>
                <v-row>
                  <!-- Description Lao -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="form.description_la"
                      label="ລາຍລະອຽດ (ພາສາລາວ)"
                      required
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.required, rules.maxLength200]"
                      counter="200"
                      rows="3"
                      placeholder="ອະທິບາຍ function ເປັນພາສາລາວ..."
                      persistent-placeholder
                    >
                      <template v-slot:prepend-inner>
                        <v-icon size="small" color="grey">mdi-text</v-icon>
                      </template>
                    </v-textarea>
                  </v-col>

                  <!-- Description English -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="form.description_en"
                      label="ລາຍລະອຽດ (ພາສາອັງກິດ)"
                      variant="outlined"
                      density="comfortable"
                      :rules="[rules.maxLength200]"
                      counter="200"
                      rows="3"
                      placeholder="Describe function in English... (optional)"
                      persistent-placeholder
                    >
                      <template v-slot:prepend-inner>
                        <v-icon size="small" color="grey">mdi-translate</v-icon>
                      </template>
                    </v-textarea>
                  </v-col>
                </v-row>
              </div>

              <!-- Settings Section -->
              <div class="mb-6">
                <h3 class="text-h6 font-weight-regular mb-4">ການຕັ້ງຄ່າ</h3>
                <v-row>


                  <!-- Record Status -->
                 
                </v-row>
              </div>

              <!-- Info Alert -->
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mb-6"
              >
                <v-icon slot="prepend" size="small">mdi-information</v-icon>
                ໝາຍເຫດ: ຊ່ອງທີ່ມີເຄື່ອງໝາຍ (*) ແມ່ນຈຳເປັນຕ້ອງປ້ອນ
              </v-alert>

              <!-- Action Buttons -->
              <v-divider class="mb-6" />
              <div class="d-flex justify-end flex-wrap gap-3">
                <v-btn
                  @click="resetForm"
                  variant="text"
                  color="grey"
                  :disabled="loading"
                  prepend-icon="mdi-refresh"
                  class="text-none"
                >
                  ລ້າງຂໍ້ມູນ
                </v-btn>
                <v-btn
                  @click="$router.go(-1)"
                  variant="outlined"
                  :disabled="loading"
                  prepend-icon="mdi-close"
                  class="text-none"
                >
                  ຍົກເລີກ
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  :loading="loading"
                  :disabled="!formValid"
                  prepend-icon="mdi-check"
                  class="text-none"
                  elevation="0"
                >
                  ບັນທຶກ
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="400" persistent>
      <v-card>
        <v-card-text class="pa-6">
          <div class="text-center">
            <v-icon size="64" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
            <h3 class="text-h6 mb-2">ບັນທຶກສຳເລັດ!</h3>
            <p class="text-body-2 text-grey">
              Function Description ໄດ້ຖືກສ້າງສຳເລັດແລ້ວ
            </p>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            @click="createAnother" 
            variant="text"
            class="text-none"
          >
            ສ້າງໃໝ່ອີກ
          </v-btn>
          <v-btn 
            @click="goToList" 
            color="primary" 
            variant="flat"
            class="text-none"
          >
            ໄປຫາລາຍການ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color"
      :timeout="3000"
      location="bottom right"
      variant="flat"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ snackbar.message }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()

// Reactive data
const loading = ref(false)
const formValid = ref(false)
const formRef = ref(null)
const successDialog = ref(false)

// Form data
const form = ref({
  function_id: '',
  description_la: '',
  description_en: '',
  eod_function: 'N',
  function_order: null,
  Record_Status: 'Y'
})

// Options
const eodFunctionOptions = ref([
  { title: 'ໃຊ້ງານ', value: 'Y' },
  { title: 'ບໍ່ໃຊ້', value: 'N' }
])

const recordStatusOptions = ref([
  { title: 'ໃຊ້ງານ', value: 'Y' },
  { title: 'ບໍ່ໃຊ້ງານ', value: 'N' },
  { title: 'ເປີດ', value: 'O' },
  { title: 'ປິດ', value: 'C' }
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
  maxLength20: (value) => !value || value.length <= 20 || 'ບໍ່ສາມາດເກີນ 20 ຕົວອັກສອນ',
  maxLength200: (value) => !value || value.length <= 200 || 'ບໍ່ສາມາດເກີນ 200 ຕົວອັກສອນ',
  positiveNumber: (value) => !value || value > 0 || 'ຕ້ອງເປັນຕົວເລກບວກ',
  functionId: (value) => {
    if (!value) return true
    const pattern = /^[A-Za-z0-9_-]+$/
    return pattern.test(value) || 'ໃຊ້ໄດ້ສະເພາະ A-Z, a-z, 0-9, - ແລະ _'
  }
}

// Methods
const submitForm = async () => {
  if (!formValid.value) return

  loading.value = true
  try {
    const response = await axios.post('/api/function-desc/', form.value)
    
    if (response.data) {
      successDialog.value = true
    }
  } catch (error) {
    console.error('Error creating function:', error)
    
    if (error.response?.data) {
      const errorData = error.response.data
      
      // Handle validation errors
      if (errorData.errors) {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          showSnackbar(`${field}: ${messages[0]}`, 'error')
        })
      } else if (errorData.function_id) {
        showSnackbar(`Function ID: ${errorData.function_id[0]}`, 'error')
      } else {
        showSnackbar(errorData.error || errorData.detail || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ', 'error')
      }
    } else {
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່', 'error')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    function_id: '',
    description_la: '',
    description_en: '',
    eod_function: 'N',
    function_order: null,
    Record_Status: 'Y'
  }
  formRef.value?.resetValidation()
}

const createAnother = () => {
  successDialog.value = false
  resetForm()
  generateNextOrder()
}

const goToList = () => {
  router.push('/functiondesc')
}

const getStatusColor = (status) => {
  const colors = {
    'Y': 'success',
    'N': 'grey',
    'O': 'success',
    'C': 'error'
  }
  return colors[status] || 'grey'
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// Auto-generate next function order
const generateNextOrder = async () => {
  try {
    const response = await axios.get('/api/function-desc/')
    
    if (response.data) {
      const functions = response.data.results || response.data
      if (functions.length > 0) {
        const maxOrder = Math.max(...functions.map(f => f.function_order || 0))
        form.value.function_order = maxOrder + 1
      } else {
        form.value.function_order = 1
      }
    }
  } catch (error) {
    console.error('Error generating next order:', error)
    form.value.function_order = 1
  }
}

// Lifecycle
onMounted(() => {
  generateNextOrder()
})
</script>

<style scoped>
.border {
  border: 1px solid #e0e0e0 !important;
}

.gap-3 {
  gap: 12px;
}

:deep(.v-btn) {
  text-transform: none !important;
}

:deep(.v-field--variant-outlined) {
  border-radius: 8px;
}

:deep(.v-input__details) {
  padding-top: 4px;
}

/* Form sections spacing */
h3.text-h6 {
  color: #424242;
  border-bottom: 2px solid #f5f5f5;
  padding-bottom: 8px;
}

/* Card hover effect */
.v-card {
  transition: all 0.3s ease;
}

/* Custom focus styles */
:deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

/* Success dialog animation */
.v-dialog {
  transition: all 0.3s ease;
}
</style>