<template>
  <v-container fluid class="pa-6">
    <div class="mx-auto" style="max-width: 600px;">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-h4 font-weight-medium mb-2 text-styles">ແກ້ໄຂສະກຸນເງິນ</h1>
        <p class="text-body-2 text-grey-darken-1 text-styles">ປັບປຸງຂໍ້ມູນສະກຸນເງິນ {{ form.ccy_code }}</p>
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
            <!-- Currency Code (Disabled) -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.ccy_code"
                label="ລະຫັດສະກຸນເງິນ"
                variant="outlined"
                density="comfortable"
                disabled
                readonly
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
                placeholder="ເຊັ່ນ: $, ₭"
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
                      <v-icon size="20" color="brown">mdi-account-plus</v-icon>
                    </template>
                  </v-text-field>
                </v-col>
                
                <v-col cols="12" md="6" v-if="form.Maker_DT_Stamp">
                  <v-text-field
                    :model-value="formatDate(form.Maker_DT_Stamp)"
                    label="ວັນທີສ້າງ"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    disabled
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-calendar</v-icon>
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
                      <v-icon size="20" color="brown">mdi-account-check</v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="6" v-if="form.Checker_DT_Stamp">
                  <v-text-field
                    :model-value="formatDate(form.Checker_DT_Stamp)"
                    label="ວັນທີກວດສອບ"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    disabled
                  >
                    <template #prepend-inner>
                      <v-icon size="20" color="brown">mdi-calendar-check</v-icon>
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
              color="primary"
              variant="elevated"
              type="submit"
              :disabled="!isValid || updateLoading"
              :loading="updateLoading"
              class="text-none px-8"
            >
              ອັບເດດ
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
      ອັບເດດສະກຸນເງິນສຳເລັດແລ້ວ!
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import { CurrencyModel } from '@/models'

const route = useRoute()
const router = useRouter()
const code = route.query.code as string

const isValid = ref(false)
const loading = ref(false)
const updateLoading = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const form = ref<CurrencyModel.CurrencyResponse>({
  ccy_code: '',
  Ccy_Name_la: '',
  Ccy_Name_en: '',
  Country: '',
  Ccy_Decimals: 0,
  ALT_Ccy_Code: '',
  Record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N',
  Maker_DT_Stamp: new Date(),
  Checker_DT_Stamp: null,
  Maker_Id: '',
  Checker_Id: null,
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
  decimal: (value: number) => {
    if (value === null || value === undefined) return true
    if (value < 0) return 'ຄ່າຕ້ອງເປັນຈຳນວນບວກ'
    if (value > 8) return 'ຄ່າສູງສຸດແມ່ນ 8'
    return true
  }
}

// Helper function to format dates
const formatDate = (date: Date | string | null) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    return d.toLocaleString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

const loadData = async () => {
  if (!code) {
    showError.value = true
    errorMessage.value = 'ບໍ່ພົບລະຫັດສະກຸນເງິນ'
    return
  }

  loading.value = true
  try {
    const res = await axios.get<CurrencyModel.CurrencyResponse>(`api/currencies/${code}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    form.value = res.data
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
    console.error('Error loading currency:', error)
  } finally {
    loading.value = false
  }
}

const updateForm = async () => {
  if (!isValid.value) return
  
  updateLoading.value = true
  try {
    await axios.put(`api/currencies/${code}/`, form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    showSuccess.value = true
    
    // Go back after success
    setTimeout(() => {
      router.push('/currency')
    }, 1500)
    
  } catch (error: any) {
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ'
    console.error('Error updating currency:', error)
  } finally {
    updateLoading.value = false
  }
}

const goBack = () => {
  router.push('/currency')
}

onMounted(loadData)
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
</style>