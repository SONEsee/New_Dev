<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 700px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ເພີ່ມລະຫັດທຸລະກຳໃໝ່</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">ສ້າງລະຫັດທຸລະກຳໃໝ່ສຳລັບລະບົບ</p>
      </div>

      <!-- Form Card -->
      <v-card elevation="0" class="rounded-lg pa-6" style="border: 1px solid rgb(var(--v-theme-surface-variant));">
        <v-form @submit.prevent="submitForm" v-model="isValid">
          <v-row>
            <!-- Transaction Code -->
            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.trn_code"
                label="ລະຫັດທຸລະກຳ *"
                placeholder="ເຊັ່ນ: TXN001, DEPOSIT"
                variant="outlined"
                density="comfortable"
                required
                :rules="[rules.required, rules.codeFormat, rules.uniqueCode]"
                maxlength="20"
                @input="form.trn_code = form.trn_code.toUpperCase()"
                @blur="checkDuplicateCode"
                :loading="checkingDuplicate"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="orange">mdi-code-tags</v-icon>
                </template>
                <template #append-inner v-if="codeCheckResult">
                  <v-icon 
                    :color="codeCheckResult === 'available' ? 'success' : 'error'" 
                    size="20"
                  >
                    {{ codeCheckResult === 'available' ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Code Generator Button -->
            <v-col cols="12" md="4" class="d-flex align-center">
              <v-btn
                variant="outlined"
                prepend-icon="mdi-auto-fix"
                @click="generateCode"
                class="text-none"
                :disabled="!form.trn_Desc_en"
                block
              >
                ສ້າງລະຫັດອັດຕະໂນມັດ
              </v-btn>
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

            <!-- Code Preview -->
            <v-col cols="12" v-if="form.trn_code && form.trn_Desc_en">
              <v-card 
                class="pa-4 rounded-lg" 
                color="success" 
                variant="tonal"
              >
                <div class="d-flex align-center">
                  <v-icon size="24" color="success">mdi-code-tags-check</v-icon>
                  <div class="ml-3">
                    <div class="text-subtitle-2">ລະຫັດທຸລະກຳທີ່ກຳລັງສ້າງ</div>
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
            >
              ເຄລຍຟອມ
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              type="submit"
              :disabled="!isValid"
              :loading="loading"
              class="text-none px-8"
            >
              ສ້າງລະຫັດທຸລະກຳ
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
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from '@/helpers/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const isValid = ref(false)
const loading = ref(false)
const checkingDuplicate = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Validation states
const codeCheckResult = ref<'available' | 'taken' | null>(null)

const form = ref({
  trn_code: '',
  trn_Desc_en: '',
  trn_Desc_la: '',
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N',
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
  { title: 'ໃຊ້', value: 'Y' },
  { title: 'ບໍ່', value: 'N' }
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'ຈຳເປັນຕ້ອງມີຂໍ້ມູນນີ້',
  codeFormat: (value: string) => {
    if (!value) return true
    if (value.length < 3) return 'ລະຫັດຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ'
    if (value.length > 20) return 'ລະຫັດຕ້ອງບໍ່ເກີນ 20 ຕົວອັກສອນ'
    if (!/^[A-Z0-9_]+$/.test(value)) return 'ໃຊ້ພຽງຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ ແລະ _'
    return true
  },
  uniqueCode: () => {
    if (codeCheckResult.value === 'taken') return 'ລະຫັດນີ້ຖືກໃຊ້ແລ້ວ'
    return true
  }
}

// API Functions
async function checkDuplicateCode() {
  if (!form.value.trn_code || form.value.trn_code.length < 3) {
    codeCheckResult.value = null
    return
  }

  checkingDuplicate.value = true
  try {
    // This would check against your transaction codes API
    const { data } = await axios.get(`/api/trn-codes/${form.value.trn_code}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    codeCheckResult.value = 'taken'
  } catch (error: any) {
    if (error.response?.status === 404) {
      codeCheckResult.value = 'available'
    }
  } finally {
    checkingDuplicate.value = false
  }
}

// Helper functions
function generateCode() {
  if (!form.value.trn_Desc_en) return

  // Simple code generation logic
  const words = form.value.trn_Desc_en.split(' ')
  let code = ''
  
  if (words.length === 1) {
    code = words[0].substring(0, 6).toUpperCase()
  } else if (words.length === 2) {
    code = words[0].substring(0, 3).toUpperCase() + words[1].substring(0, 3).toUpperCase()
  } else {
    code = words.map(w => w.charAt(0)).join('').toUpperCase()
    if (code.length < 3) {
      code = words[0].substring(0, 3).toUpperCase()
    }
  }
  
  // Add number if too short
  if (code.length < 3) {
    code += '001'
  }
  
  form.value.trn_code = code
  checkDuplicateCode()
}

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

  if (laoSuggestion && !form.value.trn_Desc_la) {
    form.value.trn_Desc_la = laoSuggestion.trim()
  }
}

function resetForm() {
  form.value = {
    trn_code: '',
    trn_Desc_en: '',
    trn_Desc_la: '',
    Record_Status: 'C',
    Auth_Status: 'U',
    Once_Auth: 'N',
  }
  codeCheckResult.value = null
}

async function submitForm() {
  if (!isValid.value) return
  
  loading.value = true
  try {
    await axios.post('/api/trn-codes/', form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    successMessage.value = 'ສ້າງລະຫັດທຸລະກຳສຳເລັດແລ້ວ!'
    showSuccess.value = true
    
    // Reset form after success
    setTimeout(() => {
      goBack()
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ'
    console.error('Error creating transaction code:', error)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/transactioncode')
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

/* Preview cards animation */
.v-card:hover {
  transform: translateY(-2px);
}

.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}
</style>