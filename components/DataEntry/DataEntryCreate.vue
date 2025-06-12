<!-- components/DataEntryCreate.vue -->
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
          <v-icon color="primary" class="mr-3" size="28">mdi-database-plus</v-icon>
          <div>
            <h2 class="text-h5 font-weight-bold mb-1 text-styles">ສ້າງການຕັ້ງຄ່າການປ້ອນຂໍ້ມູນໃໝ່</h2>
            <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
              ກຳນົດການຢືນຢັນແລະການອະນຸຍາດສຳລັບການປ້ອນຂໍ້ມູນ MTTB
            </p>
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <!-- Form Content -->
      <v-card-text class="pa-6">
        <v-form ref="form" v-model="valid" @submit.prevent="handleSubmit">
          <!-- Basic Information -->
          <v-row class="mb-6">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.data_entry_id"
                label="ລະຫັດການຕັ້ງຄ່າ *"
                :rules="[rules.required, rules.dataEntryId]"
                variant="outlined"
                density="comfortable"
                placeholder="ປ້ອນລະຫັດການຕັ້ງຄ່າ"
                hint="ສູງສຸດ 20 ຕົວອັກສອນ"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="6">
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
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center text-styles">
              <v-icon color="primary" size="20" class="mr-2">mdi-keyboard</v-icon>
              ການຢືນຢັນຂໍ້ມູນ
            </h3>

            <!-- Main Rekey Switch -->
            <v-card variant="outlined" class="pa-4 mb-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <p class="text-body-1 font-weight-medium text-styles">ຢືນຢັນຂໍ້ມູນໃນເວລາກ່ອນອະນຸມັດບັນຊີ</p>
                  <p class="text-caption text-medium-emphasis text-styles">ຜູ້ໃຊ້ຈະຕ້ອງຢືນຢັນຂໍ້ມູນກ່ອນການອະນຸມັດ</p>
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
                      <p class="text-body-2 font-weight-medium text-styles">ວັນທີເຮັດທຸລະກຳ</p>
                      <p class="text-caption text-medium-emphasis text-styles">ຢືນຢັນຄືນວັນທີ</p>
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
                      <p class="text-body-2 font-weight-medium text-styles">ມູນຄ່າທີ່ປ້ອນ</p>
                      <p class="text-caption text-medium-emphasis text-styles">ຢືນຢັນຈຳນວນເງິນ</p>
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
                      <p class="text-body-2 font-weight-medium text-styles">ລະຫັດທຸລະກຳ</p>
                      <p class="text-caption text-medium-emphasis text-styles">ຢືນຢັນລະຫັດ</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-expand-transition>
          </div>

          <v-divider class="mb-6" />

          <!-- Permission Settings -->
          <div class="mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center text-styles">
              <v-icon color="primary" size="20" class="mr-2">mdi-shield-check</v-icon>
              ການອະນຸຍາດພິເສດ
            </h3>

            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <p class="text-body-2 font-weight-medium text-styles">ອະນຸຍາດໃຫ້ລົງບັນຊີຍ້ອນຫຼັງ</p>
                      <p class="text-caption text-medium-emphasis text-styles">ບັນທຶກທຸລະກຳວັນທີຜ່ານມາ</p>
                    </div>
                    <v-switch
                      v-model="formData.BACK_VALUE"
                      color="success"
                      :true-value="1"
                      :false-value="0"
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
                      <p class="text-body-2 font-weight-medium text-styles">ອະນຸຍາດໃຫ້ລົງບັນຊີມື້ພັກ</p>
                      <p class="text-caption text-medium-emphasis text-styles">ບັນທຶກໃນວັນພັກການ</p>
                    </div>
                    <v-switch
                      v-model="formData.MOD_NO"
                      color="success"
                      :true-value="1"
                      :false-value="0"
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
            <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center text-styles">
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
                      <p class="text-body-2 font-weight-medium text-styles">ອະນຸມັດຄັ້ງດຽວ</p>
                      <p class="text-caption text-medium-emphasis text-styles">ບໍ່ຕ້ອງອະນຸມັດຊ້ຳ</p>
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
        </v-form>
      </v-card-text>

      <v-divider />

      <!-- Form Actions -->
      <v-card-actions class="pa-6">
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
        >
          ລ້າງຂໍ້ມູນ
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!valid"
          prepend-icon="mdi-content-save"
          class="text-none"
        >
          ບັນທຶກ
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

// Router instance
const router = useRouter()

// Form refs
const form = ref()
const valid = ref(false)
const loading = ref(false)

// Messages
const errorMessage = ref('')
const successMessage = ref('')

// Dialog
const showLeaveDialog = ref(false)
const hasChanges = ref(false)

// Form data matching the model
const formData = ref({
  data_entry_id: '',
  JRN_REKEY_REQUIRED: 'N',
  JRN_REKEY_VALUE_DATE: 'N',
  JRN_REKEY_AMOUNT: 'N',
  JRN_REKEY_TXN_CODE: 'N',
  BACK_VALUE: 0,
  MOD_NO: 0,
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N'
})

// Initial form data for reset
const initialFormData = JSON.parse(JSON.stringify(formData.value))

// Options
const statusOptions = [
  { value: 'C', title: 'ເປີດໃຊ້ງານ' },
  { value: 'O', title: 'ປິດໃຊ້ງານ' }
]

const authStatusOptions = [
  { value: 'U', title: 'ລໍຖ້າອະນຸມັດ' },
  { value: 'A', title: 'ອະນຸມັດແລ້ວ' }
]

// Validation rules
const rules = {
  required: (v: any) => !!v || 'ກະລຸນາປ້ອນຂໍ້ມູນ',
  dataEntryId: (v: string) => {
    if (!v) return 'ກະລຸນາປ້ອນລະຫັດການຕັ້ງຄ່າ'
    if (v.length > 20) return 'ລະຫັດຕ້ອງບໍ່ເກີນ 20 ຕົວອັກສອນ'
    if (!/^[A-Za-z0-9_-]+$/.test(v)) return 'ລະຫັດສາມາດໃຊ້ໄດ້ສະເພາະ A-Z, 0-9, -, _ ເທົ່ານັ້ນ'
    return true
  }
}

// Watch for changes
watch(formData, () => {
  hasChanges.value = JSON.stringify(formData.value) !== JSON.stringify(initialFormData)
}, { deep: true })

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
    // Add timestamp
    const submitData = {
      ...formData.value,
      Maker_DT_Stamp: new Date().toISOString()
    }

    await axios.post('/api/mttb-data-entry/', submitData)
    
    successMessage.value = 'ບັນທຶກຂໍ້ມູນສຳເລັດແລ້ວ!'
    hasChanges.value = false
    
    // Redirect after success
    setTimeout(() => {
      router.push('/dataentry')
    }, 1500)
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ'
    console.error('Error creating data entry:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = JSON.parse(JSON.stringify(initialFormData))
  form.value.resetValidation()
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
</style>