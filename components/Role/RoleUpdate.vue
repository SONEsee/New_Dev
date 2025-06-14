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
              <v-icon color="primary" class="mr-3" size="28">mdi-shield-edit</v-icon>
              <div>
                <h2 class="text-h5 font-weight-bold mb-1 text-styles">
                  ແກ້ໄຂສິດທິ
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
                  ແກ້ໄຂຂໍ້ມູນສິດທິ: {{ roleId }}
                </p>
              </div>
            </div>
          </v-card-title>

          <!-- Loading State -->
          <v-card-text v-if="loadingRole" class="pa-8 pt-0">
            <div class="text-center">
              <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
              <div class="text-body-1">ກຳລັງໂຫຼດຂໍ້ມູນສິດທິ...</div>
            </div>
          </v-card-text>

          <!-- Error State -->
          <v-card-text v-else-if="loadError" class="pa-8 pt-0">
            <v-alert type="error" variant="tonal" class="mb-4">
              <v-alert-title>ເກີດຂໍ້ຜິດພາດ</v-alert-title>
              {{ loadError }}
            </v-alert>
            <div class="d-flex gap-3">
              <v-btn color="primary" @click="loadRole" prepend-icon="mdi-refresh">
                ລອງໃໝ່
              </v-btn>
              <v-btn variant="outlined" @click="goBack">
                ກັບໄປ
              </v-btn>
            </div>
          </v-card-text>

          <!-- Form -->
          <v-card-text v-else class="pa-8 pt-0">
            <v-form ref="formRef" v-model="formValid" @submit.prevent="updateRole">
              <v-row>
                <!-- Role ID Field (Disabled) -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.role_id"
                    label="ລະຫັດສິດທິ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-identifier"
                    disabled
                    hint="ລະຫັດສິດທິບໍ່ສາມາດແກ້ໄຂໄດ້"
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
                    label="ສະຖານະ"
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

              <!-- Change Summary -->
              <v-card 
                v-if="hasChanges" 
                variant="tonal" 
                color="warning" 
                class="mt-6"
              >
                <v-card-title class="text-subtitle-1 pb-2">
                  <v-icon class="mr-2">mdi-file-edit</v-icon>
                  ການປ່ຽນແປງ
                </v-card-title>
                <v-card-text class="pt-0">
                  <div v-for="change in changes" :key="change.field" class="mb-2">
                    <div class="text-body-2 font-weight-medium">{{ change.label }}:</div>
                    <div class="d-flex align-center gap-2">
                      <span class="text-body-2 text-grey">{{ change.oldValue || '-' }}</span>
                      <v-icon size="16" color="grey">mdi-arrow-right</v-icon>
                      <span class="text-body-2 font-weight-medium">{{ change.newValue || '-' }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Audit Information -->
              <v-card v-if="originalRole" variant="outlined" class="mt-6">
                <v-card-title class="text-subtitle-1 pb-2">
                  <v-icon class="mr-2">mdi-history</v-icon>
                  ຂໍ້ມູນການກວດສອບ
                </v-card-title>
                <v-card-text class="pt-0">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="mb-3">
                        <div class="text-body-2 font-weight-medium text-grey-darken-1 mb-1">ຜູ້ສ້າງ:</div>
                        <div class="text-body-2">{{ originalRole.Maker_Id?.username || 'ບໍ່ມີຂໍ້ມູນ' }}</div>
                        <div class="text-caption text-grey">{{ formatDateTime(originalRole.Maker_DT_Stamp) }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="mb-3">
                        <div class="text-body-2 font-weight-medium text-grey-darken-1 mb-1">ຜູ້ກວດສອບລ່າສຸດ:</div>
                        <div class="text-body-2">{{ originalRole.Checker_Id?.username || 'ຍັງບໍ່ໄດ້ກວດສອບ' }}</div>
                        <div v-if="originalRole.Checker_DT_Stamp" class="text-caption text-grey">
                          {{ formatDateTime(originalRole.Checker_DT_Stamp) }}
                        </div>
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
                      :disabled="!hasChanges"
                    >
                      ຍົກເລີກການປ່ຽນແປງ
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
                      :disabled="!formValid || !hasChanges"
                      prepend-icon="mdi-content-save"
                      class="text-none font-weight-medium"
                    >
                      ບັນທຶກການປ່ຽນແປງ
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
          ອັບເດດສຳເລັດ!
        </v-card-title>
        <v-card-text class="text-body-1 mb-4">
          ອັບເດດສິດທິ <strong>{{ formData.role_name_la }}</strong> ສຳເລັດແລ້ວ
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
            @click="handleSuccessAction('stay')"
            class="text-none"
          >
            ຢູ່ໜ້ານີ້
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/helpers/axios'

// Types
interface RoleFormData {
  role_id: string
  role_name_la: string
  role_name_en: string
  role_description: string
  record_Status: string
}

interface Role {
  role_id: string
  role_name_la?: string
  role_name_en?: string
  role_description?: string
  record_Status?: string
  Maker_Id?: {
    username: string
  } | null
  Maker_DT_Stamp?: string | null
  Checker_Id?: {
    username: string
  } | null
  Checker_DT_Stamp?: string | null
  Auth_Status?: string | null
  Once_Auth?: string | null
}

interface SnackbarState {
  show: boolean
  message: string
  color: string
  icon: string
}

interface FieldChange {
  field: string
  label: string
  oldValue: string
  newValue: string
}

interface FieldErrors {
  [key: string]: string[]
}

const router = useRouter()
const route = useRoute()

// Get role_id from route params
const roleId = computed(() => {
  // Handle both /role/update/ACA and /role/update?role_id=ACA patterns
  return route.params.id || route.query.role_id || ''
})

// Local state
const loading = ref(false)
const loadingRole = ref(false)
const loadError = ref('')
const formValid = ref(false)
const successDialog = ref(false)
const formRef = ref()
const originalRole = ref<Role | null>(null)
const originalFormData = ref<RoleFormData | null>(null)

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

// Computed
const hasChanges = computed(() => {
  if (!originalFormData.value) return false
  
  return (
    formData.role_name_la !== originalFormData.value.role_name_la ||
    formData.role_name_en !== originalFormData.value.role_name_en ||
    formData.role_description !== originalFormData.value.role_description ||
    formData.record_Status !== originalFormData.value.record_Status
  )
})

const changes = computed((): FieldChange[] => {
  if (!originalFormData.value) return []
  
  const changeList: FieldChange[] = []
  
  if (formData.role_name_la !== originalFormData.value.role_name_la) {
    changeList.push({
      field: 'role_name_la',
      label: 'ຊື່ສິດທິ (ລາວ)',
      oldValue: originalFormData.value.role_name_la,
      newValue: formData.role_name_la
    })
  }
  
  if (formData.role_name_en !== originalFormData.value.role_name_en) {
    changeList.push({
      field: 'role_name_en',
      label: 'ຊື່ສິດທິ (ອັງກິດ)',
      oldValue: originalFormData.value.role_name_en,
      newValue: formData.role_name_en
    })
  }
  
  if (formData.role_description !== originalFormData.value.role_description) {
    changeList.push({
      field: 'role_description',
      label: 'ລາຍລະອຽດ',
      oldValue: originalFormData.value.role_description,
      newValue: formData.role_description
    })
  }
  
  if (formData.record_Status !== originalFormData.value.record_Status) {
    changeList.push({
      field: 'record_Status',
      label: 'ສະຖານະ',
      oldValue: getStatusLabel(originalFormData.value.record_Status),
      newValue: getStatusLabel(formData.record_Status)
    })
  }
  
  return changeList
})

// Helper functions
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const getStatusLabel = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status)
  return option?.label || 'ບໍ່ຮູ້ຈັກ'
}

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

// API functions
const loadRole = async () => {
  if (!roleId.value) {
    loadError.value = 'ບໍ່ມີລະຫັດສິດທິ'
    return
  }

  loadingRole.value = true
  loadError.value = ''
  
  try {
    const response = await axios.get(`/api/roles/${roleId.value}/`, {
      headers: getAuthHeaders()
    })
    
    if (response.status === 200) {
      originalRole.value = response.data
      
      // Populate form data
      formData.role_id = response.data.role_id || ''
      formData.role_name_la = response.data.role_name_la || ''
      formData.role_name_en = response.data.role_name_en || ''
      formData.role_description = response.data.role_description || ''
      formData.record_Status = response.data.record_Status || 'O'
      
      // Store original form data for comparison
      originalFormData.value = {
        role_id: formData.role_id,
        role_name_la: formData.role_name_la,
        role_name_en: formData.role_name_en,
        role_description: formData.role_description,
        record_Status: formData.record_Status
      }
    }
  } catch (error: any) {
    console.error('Error loading role:', error)
    
    if (error.response?.status === 404) {
      loadError.value = 'ບໍ່ພົບສິດທິທີ່ຕ້ອງການແກ້ໄຂ'
    } else if (error.response?.status === 401) {
      router.push('/login')
      return
    } else {
      loadError.value = error.response?.data?.detail || 
                       error.response?.data?.message || 
                       'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນສິດທິ'
    }
  } finally {
    loadingRole.value = false
  }
}

const updateRole = async () => {
  if (!formValid.value || !hasChanges.value) return

  loading.value = true
  clearAllErrors()

  try {
    const payload = {
      role_name_la: formData.role_name_la.trim(),
      role_name_en: formData.role_name_en.trim() || undefined,
      role_description: formData.role_description.trim() || undefined,
      record_Status: formData.record_Status
    }

    const response = await axios.patch(`/api/roles/${roleId.value}/`, payload, {
      headers: getAuthHeaders()
    })

    if (response.status === 200) {
      originalRole.value = response.data
      originalFormData.value = {
        role_id: formData.role_id,
        role_name_la: formData.role_name_la,
        role_name_en: formData.role_name_en,
        role_description: formData.role_description,
        record_Status: formData.record_Status
      }
      successDialog.value = true
    }
  } catch (error: any) {
    console.error('Error updating role:', error)
    
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
                          'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສິດທິ'
      
      showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  if (originalFormData.value) {
    formData.role_name_la = originalFormData.value.role_name_la
    formData.role_name_en = originalFormData.value.role_name_en
    formData.role_description = originalFormData.value.role_description
    formData.record_Status = originalFormData.value.record_Status
  }
  clearAllErrors()
  formRef.value?.resetValidation()
}

const handleSuccessAction = (action: 'list' | 'stay') => {
  successDialog.value = false
  
  if (action === 'list') {
    router.push('/role')
  }
  // If 'stay', just close the dialog and remain on the page
}

// Lifecycle
onMounted(async () => {
  await loadRole()
})
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

/* Change summary card styling */
:deep(.v-card--variant-tonal.v-card--density-default) {
  background-color: rgba(var(--v-theme-warning), 0.08);
}
</style>