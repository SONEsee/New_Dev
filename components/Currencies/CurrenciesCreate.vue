<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 600px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ເພີ່ມສະກຸນເງິນໃຫມ່</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">ປ້ອນຂໍ້ມູນສະກຸນເງິນທີ່ຕ້ອງການເພີ່ມ</p>
      </div>

      <!-- Form Card -->
      <v-card elevation="0" class="rounded-lg pa-6" style="border: 1px solid rgb(var(--v-theme-surface-variant));">
        <v-form @submit.prevent="submitForm" v-model="isValid">
          <v-row>
            <!-- Currency Code -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.ccy_code"
                label="ລະຫັດສະກຸນເງິນ *"
                placeholder="ເຊັ່ນ: USD, LAK"
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

            <!-- Currency Symbol -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.ALT_Ccy_Code"
                label="ສັນຍາລັກ"
                placeholder="ເຊັ່ນ: 00, 01"
                variant="outlined"
                density="comfortable"
                maxlength="2"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-currency-sign</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Currency Name English -->
            <v-col cols="12">
              <v-text-field
                v-model="form.Ccy_Name_en"
                label="ຊື່ສະກຸນເງິນ (ພາສາອັງກິດ) *"
                placeholder="ເຊັ່ນ: US Dollar"
                variant="outlined"
                density="comfortable"
                required
                :rules="[rules.required]"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-translate</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Currency Name Lao -->
            <v-col cols="12">
              <v-text-field
                v-model="form.Ccy_Name_la"
                label="ຊື່ສະກຸນເງິນ (ພາສາລາວ)"
                placeholder="ເຊັ່ນ: ໂດລາອາເມລິກາ"
                variant="outlined"
                density="comfortable"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-text</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Country -->
            <v-col cols="12" md="8">
              <v-text-field
                v-model="form.Country"
                label="ປະເທດ *"
                placeholder="ເຊັ່ນ: United States"
                variant="outlined"
                density="comfortable"
                required
                :rules="[rules.required]"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-flag</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Decimal Places -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.Ccy_Decimals"
                label="ທົດສະນິຍົມ *"
                placeholder="2"
                variant="outlined"
                density="comfortable"
                type="number"
                required
                :rules="[rules.required, rules.decimal]"
                min="0"
                max="8"
              >
                <template #prepend-inner>
                  <v-icon size="20" color="brown">mdi-decimal</v-icon>
                </template>
              </v-text-field>
            </v-col>

            <!-- Status Fields -->
            <v-col cols="12">
              <div class="text-subtitle-2 mb-3 text-grey-darken-1">ການຕັ້ງຄ່າສະຖານະ</div>
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
                      <v-icon size="20" color="brown">mdi-database</v-icon>
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
                      <v-icon size="20" color="brown">mdi-check-circle</v-icon>
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
                      <v-icon size="20" color="brown">mdi-lock</v-icon>
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
      ເພີ່ມສະກຸນເງິນສຳເລັດແລ້ວ!
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
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const form = ref({
  ccy_code: '',
  Ccy_Name_la: '',
  Ccy_Name_en: '',
  Country: '',
  Ccy_Decimals: 2,
  ALT_Ccy_Code: '',
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N'
})

// Dropdown options with better labels
const recordStatusItems = [
  { title: 'ເປີດໃຊ້ງານ', value: 'O' },
  { title: 'ປິດໃຊ້ງານ', value: 'C' }
]

const authStatusItems = [
  { title: 'ອະນຸມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' },
]

const onceAuthItems = [
  { title: 'ໃຊ່', value: 'Y' },
  { title: 'ບໍ່', value: 'N' }
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
  decimal: (value: number) => {
    if (value === null || value === undefined) return true
    if (value < 0) return 'ຄ່າຕ້ອງເປັນຈຳນວນບວກ'
    if (value > 8) return 'ຄ່າສູງສຸດແມ່ນ 8'
    return true
  }
}

const submitForm = async () => {
  if (!isValid.value) return
  
  loading.value = true
  try {
    await axios.post('api/currencies/', form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    showSuccess.value = true
    
    // Reset form after success
    setTimeout(() => {
      router.push('/currency')
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ'
    console.error('Error creating currency:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/currency')
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
</style>