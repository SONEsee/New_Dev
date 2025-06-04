<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 700px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ແກ້ໄຂລະຫັດທຸລະກຳ</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">
          ປັບປຸງຂໍ້ມູນລະຫັດທຸລະກຳ {{ form.trn_code }}
          <v-chip v-if="form.Auth_Status" :color="getAuthStatusColor(form.Auth_Status)" size="small" class="ml-2">
            {{ getAuthStatusName(form.Auth_Status) }}
          </v-chip>
        </p>
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
            <!-- Transaction Code (Disabled) -->
            <v-col cols="12">
              <v-text-field
                v-model="form.trn_code"
                label="ລະຫັດທຸລະກຳ"
                variant="outlined"
                density="comfortable"
                disabled
                readonly
              >
                <template #prepend-inner>
                  <v-icon size="20" color="orange">mdi-code-tags</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- English Description -->
            <v-col cols="12">
              <v-text-field
                v-model="form.trn_Desc_en"
                label="ລາຍລະອຽດ (ອັງກິດ) *"
                placeholder="ເຊັ່ນ: Cash Deposit Transaction"
                variant="outlined"
                density="comfortable"
                required
                :rules="[rules.required]"
                maxlength="255"
                @input="onDescriptionChange"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="orange">mdi-text</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Lao Description -->
            <v-col cols="12">
              <v-text-field
                v-model="form.trn_Desc_la"
                label="ລາຍລະອຽດ (ລາວ)"
                placeholder="ເຊັ່ນ: ການເຮັດທຸລະກຳຝາກເງິນສົດ"
                variant="outlined"
                density="comfortable"
                maxlength="255"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="orange">mdi-text-box</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Changes Detection -->
            <v-col cols="12" v-if="hasChanges">
              <v-card 
                class="pa-4 rounded-lg" 
                color="warning" 
                variant="tonal"
              >
                <div class="d-flex align-center">
                  <v-icon size="24" color="warning">mdi-pencil-circle</v-icon>
                  <div class="ml-3">
                    <div class="text-subtitle-2">ການປ່ຽນແປງທີ່ກວດພົບ</div>
                    <div class="text-body-2">
                      <div v-for="change in detectedChanges" :key="change.field" class="text-caption">
                        • {{ change.label }}: {{ change.from }} → {{ change.to }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- Updated Code Preview -->
            <v-col cols="12" v-if="form.trn_code && form.trn_Desc_en">
              <v-card 
                class="pa-4 rounded-lg" 
                color="success" 
                variant="tonal"
              >
                <div class="d-flex align-center">
                  <v-icon size="24" color="success">mdi-code-tags-check</v-icon>
                  <div class="ml-3">
                    <div class="text-subtitle-2">ລະຫັດທຸລະກຳທີ່ກຳລັງແກ້ໄຂ</div>
                    <div class="text-h6 font-weight-bold">
                      {{ form.trn_code }}
                    </div>
                    <div class="text-caption">
                      {{ form.trn_Desc_en }}
                      <span v-if="form.trn_Desc_la"> | {{ form.trn_Desc_la }}</span>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- Status Configuration -->
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
                      <v-icon size="20" color="orange">mdi-database</v-icon>
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
                      <v-icon size="20" color="orange">mdi-check-circle</v-icon>
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
                      <v-icon size="20" color="orange">mdi-lock</v-icon>
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
                      <v-icon size="20" color="orange">mdi-account-plus</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
                
                <v-col cols="12" md="6" v-if="form.Maker_DT_Stamp">
                  <v-text-field
                    :model-value="formatDateTime(form.Maker_DT_Stamp)"
                    label="ວັນທີສ້າງ"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    disabled
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="orange">mdi-calendar</v-icon>
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
                      <v-icon size="20" color="orange">mdi-account-check</v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="6" v-if="form.Checker_DT_Stamp">
                  <v-text-field
                    :model-value="formatDateTime(form.Checker_DT_Stamp)"
                    label="ວັນທີກວດສອບ"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    disabled
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="orange">mdi-calendar-check</v-icon>
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
              color="warning"
              variant="outlined"
              @click="resetForm"
              class="text-none"
              :disabled="!hasChanges"
            >
              ຣີເຊັດ
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              type="submit"
              :disabled="!isValid || !hasChanges"
              :loading="updateLoading"
              class="text-none px-8"
            >
              ອັບເດດລະຫັດ
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

const route = useRoute()
const router = useRouter()
const id = route.query.id as string

const isValid = ref(false)
const loading = ref(false)
const updateLoading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Form data
const form = ref({
  trn_code: '',
  trn_Desc_en: '',
  trn_Desc_la: '',
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N',
  Maker_Id: '',
  Maker_DT_Stamp: null,
  Checker_Id: '',
  Checker_DT_Stamp: null,
})

// Original form data for comparison
const originalForm = ref<typeof form.value>({} as typeof form.value)

// Computed properties
const hasChanges = computed(() => {
  if (!originalForm.value.trn_code) return false
  
  return Object.keys(form.value).some(key => {
    const formKey = key as keyof typeof form.value
    return form.value[formKey] !== originalForm.value[formKey]
  })
})

const detectedChanges = computed(() => {
  const changes: Array<{ field: string; label: string; from: string; to: string }> = []
  
  if (form.value.trn_Desc_en !== originalForm.value.trn_Desc_en) {
    changes.push({
      field: 'trn_Desc_en',
      label: 'ລາຍລະອຽດ (ອັງກິດ)',
      from: originalForm.value.trn_Desc_en || '-',
      to: form.value.trn_Desc_en || '-'
    })
  }
  
  if (form.value.trn_Desc_la !== originalForm.value.trn_Desc_la) {
    changes.push({
      field: 'trn_Desc_la',
      label: 'ລາຍລະອຽດ (ລາວ)',
      from: originalForm.value.trn_Desc_la || '-',
      to: form.value.trn_Desc_la || '-'
    })
  }
  
  if (form.value.Record_Status !== originalForm.value.Record_Status) {
    changes.push({
      field: 'Record_Status',
      label: 'ສະຖານະບັນທຶກ',
      from: getRecordStatusName(originalForm.value.Record_Status),
      to: getRecordStatusName(form.value.Record_Status)
    })
  }
  
  if (form.value.Auth_Status !== originalForm.value.Auth_Status) {
    changes.push({
      field: 'Auth_Status',
      label: 'ສະຖານະອະນຸມັດ',
      from: getAuthStatusName(originalForm.value.Auth_Status),
      to: getAuthStatusName(form.value.Auth_Status)
    })
  }
  
  if (form.value.Once_Auth !== originalForm.value.Once_Auth) {
    changes.push({
      field: 'Once_Auth',
      label: 'ອະນຸມັດຄັ້ງດຽວ',
      from: originalForm.value.Once_Auth === 'Y' ? 'ໃຊ່' : 'ບໍ່',
      to: form.value.Once_Auth === 'Y' ? 'ໃຊ່' : 'ບໍ່'
    })
  }
  
  return changes
})

// Dropdown options
const recordStatusItems = [
  { title: 'ເປີດໃຊ້ງານ', value: 'C' },
  { title: 'ປິດໃຊ້ງານ', value: 'O' }
]

const authStatusItems = [
  { title: 'ອະນຸມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' }
]

const onceAuthItems = [
  { title: 'ໃຊ່', value: 'Y' },
  { title: 'ບໍ່', value: 'N' }
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'ຈຳເປັນຕ້ອງມີຂໍ້ມູນນີ້'
}

// API Functions
async function loadTransactionCode() {
  if (!id) {
    showError.value = true
    errorMessage.value = 'ບໍ່ພົບລະຫັດທຸລະກຳ'
    return
  }

  loading.value = true
  try {
    const { data } = await axios.get(`/api/trn-codes/${id}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    
    form.value = { ...data }
    originalForm.value = { ...data }
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
    console.error('Error loading transaction code:', error)
  } finally {
    loading.value = false
  }
}

// Helper functions
function onDescriptionChange() {
  // Auto-suggest Lao description based on common English terms
  const englishToLao: Record<string, string> = {
    'deposit': 'ຝາກເງິນ',
    'withdraw': 'ຖອນເງິນ',
    'transfer': 'ໂອນເງິນ',
    'payment': 'ຊຳລະ',
    'cash': 'ເງິນສົດ',
    'loan': 'ສິນເຊື່ອ',
    'interest': 'ດອກເບ້ຍ',
    'fee': 'ຄ່າທຳນຽມ',
    'balance': 'ຍອດເງິນ',
    'account': 'ບັນຊີ'
  }

  const description = form.value.trn_Desc_en.toLowerCase()
  let laoSuggestion = ''

  Object.keys(englishToLao).forEach(key => {
    if (description.includes(key)) {
      laoSuggestion += englishToLao[key] + ' '
    }
  })

  // Only suggest if the current Lao description is empty or hasn't been manually edited
  if (laoSuggestion && form.value.trn_Desc_la === originalForm.value.trn_Desc_la) {
    form.value.trn_Desc_la = laoSuggestion.trim()
  }
}

function resetForm() {
  form.value = { ...originalForm.value }
}

function formatDateTime(dateTime: Date | string | null): string {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('lo-LA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getRecordStatusName(status: string): string {
  const statusItem = recordStatusItems.find(s => s.value === status)
  return statusItem ? statusItem.title : status
}

function getAuthStatusName(status: string): string {
  const authItem = authStatusItems.find(a => a.value === status)
  return authItem ? authItem.title : status
}

function getAuthStatusColor(status: string): string {
  switch (status) {
    case 'A': return 'success'
    case 'U': return 'warning'
    default: return 'grey'
  }
}

async function updateForm() {
  if (!isValid.value || !hasChanges.value) return
  
  updateLoading.value = true
  try {
    await axios.put(`/api/trn-codes/${id}/`, form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    successMessage.value = 'ອັບເດດລະຫັດທຸລະກຳສຳເລັດແລ້ວ!'
    showSuccess.value = true
    
    // Update original form data
    originalForm.value = { ...form.value }
    
    // Go back after success
    setTimeout(() => {
      goBack()
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ'
    console.error('Error updating transaction code:', error)
  } finally {
    updateLoading.value = false
  }
}

function goBack() {
  router.push('/transactioncode')
}

// Initialize data on mount
onMounted(() => {
  loadTransactionCode()
})
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

/* Preview cards animation */
.v-card:hover {
  transform: translateY(-2px);
}

.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

/* Readonly field styling */
:deep(.v-field--readonly) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}
</style>