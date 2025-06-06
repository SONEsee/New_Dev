<!-- components/DataEntryUpdate.vue -->
<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="rounded-lg mx-auto" style="max-width: 900px;">
      <!-- Header -->
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center">
          <v-btn
            icon
            variant="text"
            @click="goBack"
            class="mr-3"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-icon color="primary" class="mr-3" size="28">mdi-database-edit</v-icon>
          <div>
            <h2 class="text-h5 font-weight-bold mb-1 text-styles">ແກ້ໄຂການຕັ້ງຄ່າການປ້ອນຂໍ້ມູນ</h2>
            <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
              ແກ້ໄຂການຢືນຢັນແລະການອະນຸຍາດສຳລັບການປ້ອນຂໍ້ມູນ MTTB
            </p>
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <!-- Loading State -->
      <v-card-text v-if="loadingData" class="pa-6">
        <div class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            :size="60"
            :width="4"
          />
          <p class="text-body-2 text-medium-emphasis mt-4">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
        </div>
      </v-card-text>

      <!-- Error State -->
      <v-card-text v-else-if="loadError" class="pa-6">
        <v-alert
          type="error"
          variant="tonal"
          class="mb-4"
        >
          <v-alert-title>ເກີດຂໍ້ຜິດພາດ</v-alert-title>
          {{ loadError }}
        </v-alert>
        <v-btn
          color="primary"
          variant="tonal"
          @click="fetchData"
        >
          ລອງໃໝ່
        </v-btn>
      </v-card-text>

      <!-- Form Content -->
      <v-card-text v-else class="pa-6">
        <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
          <!-- ID Display (Read-only) -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-6"
          >
            <div class="d-flex align-center justify-space-between">
              <span>
                <strong>ລະຫັດການຕັ້ງຄ່າ:</strong> {{ formData.data_entry_id }}
              </span>
              <v-chip size="small" color="info" variant="elevated">
                ID ບໍ່ສາມາດແກ້ໄຂໄດ້
              </v-chip>
            </div>
          </v-alert>

          <!-- Basic Information -->
          <v-row class="mb-6">
            <v-col cols="12">
              <v-select
                v-model="formData.Record_Status"
                label="ສະຖານະບັນທຶກ"
                :items="statusOptions"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <v-divider class="mb-6" />

          <!-- Rekey Settings -->
          <div class="mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" size="20" class="mr-2">mdi-keyboard</v-icon>
              ການຢືນຢັນຂໍ້ມູນ
            </h3>

            <!-- Main Rekey Switch -->
            <v-card variant="outlined" class="pa-4 mb-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-body-1 font-weight-medium">ຢືນຢັນຂໍ້ມູນໃນເວລາກ່ອນອະນຸມັດບັນຊີ</p>
                  <p class="text-caption text-medium-emphasis">ຜູ້ໃຊ້ຈະຕ້ອງຢືນຢັນຂໍ້ມູນກ່ອນການອະນຸມັດ</p>
                </div>
                <v-switch
                  v-model="formData.JRN_REKEY_REQUIRED"
                  color="primary"
                  true-value="Y"
                  false-value="N"
                  hide-details
                />
              </div>
            </v-card>

            <!-- Sub Options -->
            <v-expand-transition>
              <v-row v-if="formData.JRN_REKEY_REQUIRED === 'Y'" class="ml-8">
                <v-col cols="12" md="4">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="formData.JRN_REKEY_VALUE_DATE"
                      color="primary"
                      true-value="Y"
                      false-value="N"
                      hide-details
                      density="compact"
                    />
                    <div class="ml-3">
                      <p class="text-body-2 font-weight-medium">ວັນທີເຮັດທຸລະກຳ</p>
                      <p class="text-caption text-medium-emphasis">ຢືນຢັນຄືນວັນທີ</p>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="formData.JRN_REKEY_AMOUNT"
                      color="primary"
                      true-value="Y"
                      false-value="N"
                      hide-details
                      density="compact"
                    />
                    <div class="ml-3">
                      <p class="text-body-2 font-weight-medium">ມູນຄ່າທີ່ປ້ອນ</p>
                      <p class="text-caption text-medium-emphasis">ຢືນຢັນຈຳນວນເງິນ</p>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="formData.JRN_REKEY_TXN_CODE"
                      color="primary"
                      true-value="Y"
                      false-value="N"
                      hide-details
                      density="compact"
                    />
                    <div class="ml-3">
                      <p class="text-body-2 font-weight-medium">ລະຫັດທຸລະກຳ</p>
                      <p class="text-caption text-medium-emphasis">ຢືນຢັນລະຫັດ</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-expand-transition>
          </div>

          <v-divider class="mb-6" />

          <!-- Permission Settings -->
          <div class="mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" size="20" class="mr-2">mdi-shield-check</v-icon>
              ການອະນຸຍາດພິເສດ
            </h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-body-2 font-weight-medium">ອະນຸຍາດໃຫ້ລົງບັນຊີຍ້ອນຫຼັງ</p>
                      <p class="text-caption text-medium-emphasis">ບັນທຶກທຸລະກຳວັນທີຜ່ານມາ</p>
                    </div>
                    <v-switch
                      v-model="formData.BACK_VALUE"
                      color="success"
                      true-value="Y"
                      false-value="N"
                      hide-details
                      density="compact"
                    />
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-body-2 font-weight-medium">ອະນຸຍາດໃຫ້ລົງບັນຊີມື້ພັກ</p>
                      <p class="text-caption text-medium-emphasis">ບັນທຶກໃນວັນພັກການ</p>
                    </div>
                    <v-switch
                      v-model="formData.MOD_NO"
                      color="success"
                      true-value="Y"
                      false-value="N"
                      hide-details
                      density="compact"
                    />
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <v-divider class="mb-6" />

          <!-- Authorization Settings -->
          <div class="mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" size="20" class="mr-2">mdi-lock</v-icon>
              ການອະນຸມັດ
            </h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.Auth_Status"
                  label="ສະຖານະອະນຸມັດ"
                  :items="authStatusOptions"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-body-2 font-weight-medium">ອະນຸມັດຄັ້ງດຽວ</p>
                      <p class="text-caption text-medium-emphasis">ບໍ່ຕ້ອງອະນຸມັດຊ້ຳ</p>
                    </div>
                    <v-switch
                      v-model="formData.Once_Auth"
                      color="warning"
                      true-value="Y"
                      false-value="N"
                      hide-details
                      density="compact"
                    />
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Audit Information -->
          <v-divider class="mb-6" />
          
          <div class="mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center">
              <v-icon color="primary" size="20" class="mr-2">mdi-history</v-icon>
              ປະຫວັດການແກ້ໄຂ
            </h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :value="originalData.Maker_Id?.username || 'ລະບົບ'"
                  label="ຜູ້ສ້າງ"
                  variant="outlined"
                  density="compact"
                  readonly
                  prepend-inner-icon="mdi-account-plus"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :value="formatDate(originalData.Maker_DT_Stamp)"
                  label="ວັນທີສ້າງ"
                  variant="outlined"
                  density="compact"
                  readonly
                  prepend-inner-icon="mdi-calendar"
                />
              </v-col>
            </v-row>

            <v-row v-if="originalData.Checker_Id">
              <v-col cols="12" md="6">
                <v-text-field
                  :value="originalData.Checker_Id?.username || '-'"
                  label="ຜູ້ກວດສອບລ່າສຸດ"
                  variant="outlined"
                  density="compact"
                  readonly
                  prepend-inner-icon="mdi-account-check"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :value="formatDate(originalData.Checker_DT_Stamp)"
                  label="ວັນທີກວດສອບລ່າສຸດ"
                  variant="outlined"
                  density="compact"
                  readonly
                  prepend-inner-icon="mdi-calendar-check"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Messages -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>

          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            density="compact"
            class="mb-4"
            closable
            @click:close="successMessage = ''"
          >
            {{ successMessage }}
          </v-alert>

          <!-- Change Summary -->
          <v-expand-transition>
            <v-alert
              v-if="hasChanges"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              <v-alert-title class="text-body-2">ມີການປ່ຽນແປງທີ່ຍັງບໍ່ໄດ້ບັນທຶກ</v-alert-title>
              <div class="text-caption mt-2">
                <div v-for="change in getChanges()" :key="change.field">
                  • {{ change.label }}: {{ change.oldValue }} → {{ change.newValue }}
                </div>
              </div>
            </v-alert>
          </v-expand-transition>
        </v-form>
      </v-card-text>

      <v-divider v-if="!loadingData && !loadError" />

      <!-- Form Actions -->
      <v-card-actions v-if="!loadingData && !loadError" class="pa-6">
        <v-spacer />
        <v-btn
          variant="text"
          @click="goBack"
          class="text-none"
        >
          ຍົກເລີກ
        </v-btn>
        <v-btn
          variant="outlined"
          @click="resetForm"
          class="text-none"
          :disabled="!hasChanges"
        >
          ຄືນຄ່າເດີມ
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!valid || !hasChanges"
          prepend-icon="mdi-content-save"
          class="text-none"
        >
          ບັນທຶກການປ່ຽນແປງ
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Leave Confirmation Dialog -->
    <v-dialog v-model="showLeaveDialog" max-width="400">
      <v-card>
        <v-card-title>ຢືນຢັນການອອກ</v-card-title>
        <v-card-text>
          ທ່ານມີການປ່ຽນແປງທີ່ຍັງບໍ່ໄດ້ບັນທຶກ. ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showLeaveDialog = false">
            ຍົກເລີກ
          </v-btn>
          <v-btn 
            color="error" 
            variant="text"
            @click="confirmLeave"
          >
            ອອກໂດຍບໍ່ບັນທຶກ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/helpers/axios'

// Router and route
const router = useRouter()
const route = useRoute()

// Form refs
const form = ref()
const valid = ref(false)
const loading = ref(false)
const loadingData = ref(true)
const loadError = ref('')

// Messages
const errorMessage = ref('')
const successMessage = ref('')

// Dialog
const showLeaveDialog = ref(false)

// Type definition
interface DataEntry {
  data_entry_id: string
  JRN_REKEY_REQUIRED: string
  JRN_REKEY_VALUE_DATE: string
  JRN_REKEY_AMOUNT: string
  JRN_REKEY_TXN_CODE: string
  BACK_VALUE: string
  MOD_NO: string
  Record_Status: string
  Auth_Status: string
  Once_Auth: string
  Maker_Id?: { username: string }
  Maker_DT_Stamp?: string
  Checker_Id?: { username: string }
  Checker_DT_Stamp?: string
}

// Form data
const formData = ref({
  data_entry_id: '',
  JRN_REKEY_REQUIRED: 'N',
  JRN_REKEY_VALUE_DATE: 'N',
  JRN_REKEY_AMOUNT: 'N',
  JRN_REKEY_TXN_CODE: 'N',
  BACK_VALUE: 'N',
  MOD_NO: 'N',
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N'
})

// Original data for comparison
const originalData = ref<DataEntry>({
  data_entry_id: '',
  JRN_REKEY_REQUIRED: 'N',
  JRN_REKEY_VALUE_DATE: 'N',
  JRN_REKEY_AMOUNT: 'N',
  JRN_REKEY_TXN_CODE: 'N',
  BACK_VALUE: 'N',
  MOD_NO: 'N',
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N'
})

// Options
const statusOptions = [
  { value: 'C', title: 'ເປີດໃຊ້ງານ' },
  { value: 'O', title: 'ປິດໃຊ້ງານ' }
]

const authStatusOptions = [
  { value: 'U', title: 'ລໍຖ້າອະນຸມັດ' },
  { value: 'A', title: 'ອະນຸມັດແລ້ວ' }
]

// Check if form has changes
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify({
    data_entry_id: originalData.value.data_entry_id,
    JRN_REKEY_REQUIRED: originalData.value.JRN_REKEY_REQUIRED,
    JRN_REKEY_VALUE_DATE: originalData.value.JRN_REKEY_VALUE_DATE,
    JRN_REKEY_AMOUNT: originalData.value.JRN_REKEY_AMOUNT,
    JRN_REKEY_TXN_CODE: originalData.value.JRN_REKEY_TXN_CODE,
    BACK_VALUE: originalData.value.BACK_VALUE,
    MOD_NO: originalData.value.MOD_NO,
    Record_Status: originalData.value.Record_Status,
    Auth_Status: originalData.value.Auth_Status,
    Once_Auth: originalData.value.Once_Auth
  })
})

// Get list of changes
const getChanges = () => {
  const changes = []
  const fieldLabels: Record<string, string> = {
    JRN_REKEY_REQUIRED: 'ຢືນຢັນຂໍ້ມູນ',
    JRN_REKEY_VALUE_DATE: 'ຢືນຢັນວັນທີ',
    JRN_REKEY_AMOUNT: 'ຢືນຢັນຈຳນວນເງິນ',
    JRN_REKEY_TXN_CODE: 'ຢືນຢັນລະຫັດ',
    BACK_VALUE: 'ລົງບັນຊີຍ້ອນຫຼັງ',
    MOD_NO: 'ລົງບັນຊີມື້ພັກ',
    Record_Status: 'ສະຖານະບັນທຶກ',
    Auth_Status: 'ສະຖານະອະນຸມັດ',
    Once_Auth: 'ອະນຸມັດຄັ້ງດຽວ'
  }

  const statusText: Record<string, string> = {
    'C': 'ເປີດໃຊ້ງານ',
    'O': 'ປິດໃຊ້ງານ',
    'U': 'ລໍຖ້າອະນຸມັດ',
    'A': 'ອະນຸມັດແລ້ວ',
    'Y': 'ເປີດ',
    'N': 'ປິດ',
    '0': 'ປິດ',
    '1': 'ເປີດ'
  }

  Object.keys(fieldLabels).forEach(field => {
    if (formData.value[field as keyof typeof formData.value] !== originalData.value[field]) {
      const oldVal = String(originalData.value[field])
      const newVal = String(formData.value[field as keyof typeof formData.value])
      
      changes.push({
        field,
        label: fieldLabels[field],
        oldValue: statusText[oldVal] || oldVal,
        newValue: statusText[newVal] || newVal
      })
    }
  })

  return changes
}

// Helper functions
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('lo-LA')
}

// Fetch existing data
const fetchData = async () => {
  const id = route.query.id
  if (!id) {
    loadError.value = 'ບໍ່ພົບລະຫັດການຕັ້ງຄ່າ'
    loadingData.value = false
    return
  }

  loadingData.value = true
  loadError.value = ''

  try {
    const response = await axios.get(`/api/mttb-data-entry/${id}/`)
    originalData.value = response.data
    
    // Set form data
    formData.value = {
      data_entry_id: response.data.data_entry_id,
      JRN_REKEY_REQUIRED: response.data.JRN_REKEY_REQUIRED || 'N',
      JRN_REKEY_VALUE_DATE: response.data.JRN_REKEY_VALUE_DATE || 'N',
      JRN_REKEY_AMOUNT: response.data.JRN_REKEY_AMOUNT || 'N',
      JRN_REKEY_TXN_CODE: response.data.JRN_REKEY_TXN_CODE || 'N',
      BACK_VALUE: response.data.BACK_VALUE || 'N',
      MOD_NO: response.data.MOD_NO || 'N',
      Record_Status: response.data.Record_Status || 'C',
      Auth_Status: response.data.Auth_Status || 'U',
      Once_Auth: response.data.Once_Auth || 'N'
    }
  } catch (error: any) {
    loadError.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
    console.error('Error fetching data:', error)
  } finally {
    loadingData.value = false
  }
}

// When main rekey switch is turned off, reset sub options
watch(() => formData.value.JRN_REKEY_REQUIRED, (newVal) => {
  if (newVal === 'N') {
    formData.value.JRN_REKEY_VALUE_DATE = 'N'
    formData.value.JRN_REKEY_AMOUNT = 'N'
    formData.value.JRN_REKEY_TXN_CODE = 'N'
  }
})

// Form actions
const handleSubmit = async () => {
  const validation = await form.value.validate()
  if (!validation.valid) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // Add checker timestamp
    const submitData = {
      ...formData.value,
      Checker_DT_Stamp: new Date().toISOString()
    }

    await axios.put(`/api/mttb-data-entry/${formData.value.data_entry_id}/`, submitData)
    
    successMessage.value = 'ບັນທຶກການປ່ຽນແປງສຳເລັດແລ້ວ!'
    
    // Update original data
    await fetchData()
    
    // Redirect after success
    setTimeout(() => {
      router.push('/dataentry')
    }, 1500)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ'
    console.error('Error updating data entry:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  // Reset to original values
  formData.value = {
    data_entry_id: originalData.value.data_entry_id,
    JRN_REKEY_REQUIRED: originalData.value.JRN_REKEY_REQUIRED || 'N',
    JRN_REKEY_VALUE_DATE: originalData.value.JRN_REKEY_VALUE_DATE || 'N',
    JRN_REKEY_AMOUNT: originalData.value.JRN_REKEY_AMOUNT || 'N',
    JRN_REKEY_TXN_CODE: originalData.value.JRN_REKEY_TXN_CODE || 'N',
    BACK_VALUE: originalData.value.BACK_VALUE || 'N',
    MOD_NO: originalData.value.MOD_NO || 'N',
    Record_Status: originalData.value.Record_Status || 'C',
    Auth_Status: originalData.value.Auth_Status || 'U',
    Once_Auth: originalData.value.Once_Auth || 'N'
  }
  form.value?.resetValidation()
  errorMessage.value = ''
  successMessage.value = ''
}

const goBack = () => {
  if (hasChanges.value) {
    showLeaveDialog.value = true
  } else {
    router.push('/dataentry')
  }
}

const confirmLeave = () => {
  showLeaveDialog.value = false
  router.push('/dataentry')
}

// Initialize
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

.rounded-lg {
  border-radius: 8px !important;
}

/* Minimal card styling */
.v-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* Remove hover effects for minimal style */
.v-card:hover {
  transform: none;
  box-shadow: none;
}

/* Subtle dividers */
.v-divider {
  opacity: 0.08;
}

/* Loading spinner */
.v-progress-circular {
  margin: 0 auto;
}
</style>