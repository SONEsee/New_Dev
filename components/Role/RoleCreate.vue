<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" lg="8" xl="6">
        <!-- Header -->
        <v-card elevation="0" class="rounded-lg mb-6">
          <v-card-title class="pa-8 pb-6">
            <div class="d-flex align-center">
              <v-btn
                icon
                variant="text"
                @click="goBack"
                class="mr-3"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-icon color="primary" class="mr-3" size="28">mdi-shield-plus</v-icon>
              <div>
                <h2 class="text-h5 font-weight-bold mb-1 text-styles">
                  ເພີ່ມສິດທິໃໝ່
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
                  ສ້າງສິດທິໃໝ່ສຳລັບລະບົບ
                </p>
              </div>
            </div>
          </v-card-title>

          <!-- Form -->
          <v-card-text class="pa-8 pt-0">
            <v-form ref="formRef" v-model="formValid" @submit.prevent="createRole">
              <v-row>
                <!-- Role ID Field -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.role_id"
                    label="ລະຫັດສິດທິ *"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-identifier"
                    :rules="roleIdRules"
                    :error-messages="fieldErrors.role_id"
                    :loading="checkingRoleId"
                    @input="clearFieldError('role_id')"
                    @blur="checkRoleIdUnique"
                    counter="20"
                    hint="ລະຫັດສິດທິຕ້ອງເປັນເອກະລັກ"
                    persistent-hint
                  />
                </v-col>

                <!-- Status Field -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.record_Status"
                    :items="statusOptions"
                    item-title="label"
                    item-value="value"
                    label="ສະຖານະເບື້ອງຕົ້ນ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-check-circle"
                    :rules="statusRules"
                    :error-messages="fieldErrors.record_Status"
                    @update:model-value="clearFieldError('record_Status')"
                  />
                </v-col>

                <!-- Role Name in Lao -->
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.role_name_la"
                    label="ຊື່ສິດທິ (ພາສາລາວ) *"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-shield"
                    :rules="roleNameLaRules"
                    :error-messages="fieldErrors.role_name_la"
                    @input="clearFieldError('role_name_la')"
                    counter="100"
                    hint="ໃສ່ຊື່ສິດທິເປັນພາສາລາວ"
                    persistent-hint
                  />
                </v-col>

                <!-- Role Name in English -->
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.role_name_en"
                    label="ຊື່ສິດທິ (ພາສາອັງກິດ)"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-translate"
                    :rules="roleNameEnRules"
                    :error-messages="fieldErrors.role_name_en"
                    @input="clearFieldError('role_name_en')"
                    counter="100"
                    hint="ໃສ່ຊື່ສິດທິເປັນພາສາອັງກິດ (ທາງເລືອກ)"
                    persistent-hint
                  />
                </v-col>

                <!-- Role Description -->
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.role_description"
                    label="ລາຍລະອຽດສິດທິ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-information"
                    rows="3"
                    :error-messages="fieldErrors.role_description"
                    @input="clearFieldError('role_description')"
                    counter="500"
                    hint="ອະທິບາຍລາຍລະອຽດຂອງສິດທິນີ້ (ທາງເລືອກ)"
                    persistent-hint
                  />
                </v-col>
              </v-row>

              <!-- Form Preview -->
              <v-card 
                v-if="formData.role_id || formData.role_name_la" 
                variant="tonal" 
                color="primary" 
                class="mt-6"
              >
                <v-card-title class="text-subtitle-1 pb-2">
                  <v-icon class="mr-2">mdi-eye</v-icon>
                  ຕົວຢ່າງຂໍ້ມູນສິດທິ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="d-flex align-center mb-2">
                        <v-avatar size="24" color="primary" variant="tonal" class="mr-2">
                          <span class="text-caption font-weight-bold">
                            {{ formData.role_id ? formData.role_id.substring(0, 2).toUpperCase() : 'RL' }}
                          </span>
                        </v-avatar>
                        <div>
                          <div class="text-body-2 font-weight-medium">
                            {{ formData.role_id || 'ລະຫັດສິດທິ' }}
                          </div>
                          <div class="text-caption text-grey">ລະຫັດສິດທິ</div>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="mb-2">
                        <v-chip
                          :color="getStatusColor(formData.record_Status)"
                          variant="tonal"
                          size="small"
                          :prepend-icon="getStatusIcon(formData.record_Status)"
                        >
                          {{ getStatusLabel(formData.record_Status) }}
                        </v-chip>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="mb-1">
                        <strong>ຊື່ສິດທິ (ລາວ):</strong> {{ formData.role_name_la || '-' }}
                      </div>
                      <div class="mb-1">
                        <strong>ຊື່ສິດທິ (ອັງກິດ):</strong> {{ formData.role_name_en || '-' }}
                      </div>
                      <div v-if="formData.role_description">
                        <strong>ລາຍລະອຽດ:</strong> {{ formData.role_description }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Action Buttons -->
              <v-row class="mt-6">
                <v-col cols="12">
                  <div class="d-flex flex-wrap gap-3 justify-end">
                    <v-btn
                      variant="outlined"
                      @click="resetForm"
                      prepend-icon="mdi-refresh"
                      class="text-none"
                    >
                      ລ້າງຟອມ
                    </v-btn>
                    
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
                      :loading="loading"
                      :disabled="!formValid"
                      prepend-icon="mdi-content-save"
                      class="text-none font-weight-medium"
                    >
                      ບັນທຶກສິດທິ
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Dialog -->
    <v-dialog v-model="successDialog" max-width="400" persistent>
      <v-card class="rounded-lg text-center pa-4">
        <div class="mb-4">
          <v-icon color="success" size="64">mdi-check-circle</v-icon>
        </div>
        <v-card-title class="text-h6 font-weight-bold mb-2">
          ສຳເລັດ!
        </v-card-title>
        <v-card-text class="text-body-1 mb-4">
          ສ້າງສິດທິ <strong>{{ createdRole?.role_name_la }}</strong> ສຳເລັດແລ້ວ
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            variant="elevated"
            @click="handleSuccessAction('list')"
            class="text-none mr-2"
          >
            ໄປຫາລາຍການສິດທິ
          </v-btn>
          <v-btn
            variant="outlined"
            @click="handleSuccessAction('new')"
            class="text-none"
          >
            ສ້າງສິດທິໃໝ່
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
          icon="mdi-close"
          size="small"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

// Types
interface RoleFormData {
  role_id: string
  role_name_la: string
  role_name_en: string
  role_description: string
  record_Status: string
}

interface CreatedRole {
  role_id: string
  role_name_la: string
  role_name_en?: string
  record_Status: string
}

interface SnackbarState {
  show: boolean
  message: string
  color: string
  icon: string
}

interface FieldErrors {
  [key: string]: string[]
}

const router = useRouter()

// Reactive state
const loading = ref(false)
const checkingRoleId = ref(false)
const formValid = ref(false)
const successDialog = ref(false)
const formRef = ref()
const createdRole = ref<CreatedRole | null>(null)

// Form data
const formData = reactive<RoleFormData>({
  role_id: '',
  role_name_la: '',
  role_name_en: '',
  role_description: '',
  record_Status: 'O'
})

// Field errors
const fieldErrors = reactive<FieldErrors>({})

// Status options
const statusOptions = [
  { label: 'ເປີດໃຊ້', value: 'O', color: 'success', icon: 'mdi-check-circle' },
  { label: 'ລໍຖ້າອະນຸມັດ', value: 'C', color: 'warning', icon: 'mdi-clock' },
  { label: 'ປິດໃຊ້', value: 'I', color: 'error', icon: 'mdi-close-circle' }
]

// Snackbar state
const snackbar = reactive<SnackbarState>({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Validation rules
const roleIdRules = [
  (v: string) => !!v || 'ຕ້ອງໃສ່ລະຫັດສິດທິ',
  (v: string) => (v && v.length >= 3) || 'ລະຫັດສິດທິຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ',
  (v: string) => (v && v.length <= 20) || 'ລະຫັດສິດທິຕ້ອງບໍ່ເກີນ 20 ຕົວອັກສອນ',
  (v: string) => /^[A-Za-z0-9_-]+$/.test(v) || 'ລະຫັດສິດທິສາມາດມີໄດ້ແຕ່ຕົວອັກສອນ, ຕົວເລກ, _ ແລະ -'
]

const roleNameLaRules = [
  (v: string) => !!v || 'ຕ້ອງໃສ່ຊື່ສິດທິເປັນພາສາລາວ',
  (v: string) => (v && v.length >= 2) || 'ຊື່ສິດທິຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ',
  (v: string) => (v && v.length <= 100) || 'ຊື່ສິດທິຕ້ອງບໍ່ເກີນ 100 ຕົວອັກສອນ'
]

const roleNameEnRules = [
  (v: string) => !v || v.length <= 100 || 'ຊື່ສິດທິຕ້ອງບໍ່ເກີນ 100 ຕົວອັກສອນ'
]

const statusRules = [
  (v: string) => !!v || 'ຕ້ອງເລືອກສະຖານະ'
]

// Helper functions
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.message = message
  snackbar.color = color
  snackbar.icon = icon
  snackbar.show = true
}

const clearFieldError = (field: string) => {
  if (fieldErrors[field]) {
    delete fieldErrors[field]
  }
}

const clearAllErrors = () => {
  Object.keys(fieldErrors).forEach(key => {
    delete fieldErrors[key]
  })
}

const goBack = () => {
  router.push('/role')
}

const getStatusColor = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.color || 'grey'
}

const getStatusIcon = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.icon || 'mdi-help-circle'
}

const getStatusLabel = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.label || 'ບໍ່ຮູ້ຈັກ'
}

// API functions
const checkRoleIdUnique = async () => {
  if (!formData.role_id || formData.role_id.length < 3) return

  checkingRoleId.value = true
  try {
    const response = await axios.get(`/api/roles/${formData.role_id}/`, {
      headers: getAuthHeaders()
    })
    
    // If we get a response, the role ID already exists
    if (response.status === 200) {
      fieldErrors.role_id = ['ລະຫັດສິດທິນີ້ມີຢູ່ແລ້ວ']
    }
  } catch (error: any) {
    // If we get a 404, the role ID is available
    if (error.response?.status === 404) {
      clearFieldError('role_id')
    } else {
      console.error('Error checking role ID:', error)
    }
  } finally {
    checkingRoleId.value = false
  }
}

const createRole = async () => {
  if (!formValid.value) return

  loading.value = true
  clearAllErrors()

  try {
    const payload = {
      role_id: formData.role_id.trim(),
      role_name_la: formData.role_name_la.trim(),
      role_name_en: formData.role_name_en.trim() || undefined,
      role_description: formData.role_description.trim() || undefined,
      record_Status: formData.record_Status
    }

    const response = await axios.post('/api/roles/', payload, {
      headers: getAuthHeaders()
    })

    if (response.status === 201 || response.status === 200) {
      createdRole.value = response.data
      successDialog.value = true
    }
  } catch (error: any) {
    console.error('Error creating role:', error)
    
    if (error.response?.status === 400) {
      // Handle validation errors
      const errorData = error.response.data
      if (typeof errorData === 'object') {
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            fieldErrors[field] = errorData[field]
          } else {
            fieldErrors[field] = [String(errorData[field])]
          }
        })
      }
      showSnackbar('ກາລຸນາກວດສອບຂໍ້ມູນທີ່ໃສ່', 'error', 'mdi-alert-circle')
    } else if (error.response?.status === 401) {
      router.push('/login')
    } else {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'ເກີດຂໍ້ຜິດພາດໃນການສ້າງສິດທິ'
      
      showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.role_id = ''
  formData.role_name_la = ''
  formData.role_name_en = ''
  formData.role_description = ''
  formData.record_Status = 'O'
  clearAllErrors()
  formRef.value?.resetValidation()
}

const handleSuccessAction = (action: 'list' | 'new') => {
  successDialog.value = false
  
  if (action === 'list') {
    router.push('/role')
  } else {
    createdRole.value = null
    resetForm()
  }
}
</script>

<style scoped>
.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

:deep(.v-field__outline) {
  border-radius: 8px;
}

:deep(.v-text-field .v-input__details) {
  padding-inline-start: 44px;
}

:deep(.v-textarea .v-input__details) {
  padding-inline-start: 44px;
}

/* Form validation styling */
:deep(.v-input--error .v-field__outline) {
  border-color: rgb(var(--v-theme-error));
}

/* Success preview card styling */
:deep(.v-card--variant-tonal.v-card--density-default) {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>