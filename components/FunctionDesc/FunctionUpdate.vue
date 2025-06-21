<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" lg="8">
        <!-- Header -->
        <div class="d-flex align-center mb-6">
          <v-btn
            @click="$router.go(-1)"
            icon="mdi-arrow-left"
            variant="text"
            class="mr-3"
          />
          <div>
            <h2 class="text-h4 font-weight-medium text-primary">ແກ້ໄຂ Function Description</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mt-1">
              Function ID: {{ $route.params.id }}
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <v-card v-if="loadingData" outlined class="pa-6">
          <div class="text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="mt-3">ກໍາລັງໂຫລດຂໍ້ມູນ...</div>
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
          >
            <template v-slot:title>ຂໍ້ມູນນີ້ຖືກອະນຸມັດແລ້ວ</template>
            Function ນີ້ຖືກອະນຸມັດແລ້ວ ບໍ່ສາມາດແກ້ໄຂໄດ້
          </v-alert>

          <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
            <v-row>
              <!-- Function ID (Read Only) -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.function_id"
                  label="Function ID"
                  outlined
                  readonly
                  bg-color="grey-lighten-4"
                />
              </v-col>

              <!-- Function Order -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.function_order"
                  :disabled="isReadOnly"
                  label="ລໍາດັບ Function"
                  type="number"
                  outlined
                  :rules="[rules.positiveNumber]"
                />
              </v-col>

              <!-- Description Lao -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.description_la"
                  :disabled="isReadOnly"
                  label="ລາຍລະອຽດ (ພາສາລາວ) *"
                  required
                  outlined
                  :rules="[rules.required, rules.maxLength200]"
                  counter="200"
                  rows="3"
                />
              </v-col>

              <!-- Description English -->
              <v-col cols="12">
                <v-textarea
                  v-model="form.description_en"
                  :disabled="isReadOnly"
                  label="ລາຍລະອຽດ (ພາສາອັງກິດ)"
                  outlined
                  :rules="[rules.maxLength200]"
                  counter="200"
                  rows="3"
                />
              </v-col>

              <!-- EOD Function -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.eod_function"
                  :items="eodFunctionOptions"
                  :disabled="isReadOnly"
                  label="Function EOD"
                  outlined
                />
              </v-col>

              <!-- Record Status -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.Record_Status"
                  :items="recordStatusOptions"
                  :disabled="isReadOnly"
                  label="ສະຖານະ Record"
                  outlined
                />
              </v-col>

              <!-- Authorization Status (Read Only) -->
              <v-col cols="12" md="6" v-if="originalData.Auth_Status">
                <v-text-field
                  :model-value="getAuthStatusText(originalData.Auth_Status)"
                  label="ສະຖານະການອະນຸມັດ"
                  outlined
                  readonly
                  bg-color="grey-lighten-4"
                />
              </v-col>

              <!-- Once Status (Read Only) -->
              <v-col cols="12" md="6" v-if="originalData.Once_Status">
                <v-text-field
                  :model-value="originalData.Once_Status === 'Y' ? 'ອະນຸມັດແລ້ວ' : 'ຍັງບໍ່ອະນຸມັດ'"
                  label="ອະນຸມັດຄັ້ງດຽວ"
                  outlined
                  readonly
                  bg-color="grey-lighten-4"
                />
              </v-col>
            </v-row>

            <!-- Audit Information -->
            <v-divider class="my-6" />
            <h3 class="text-h6 mb-4">ຂໍ້ມູນການກວດສອບ</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="originalData.Maker_Id || 'N/A'"
                  label="ຜູ້ສ້າງ"
                  outlined
                  readonly
                  bg-color="grey-lighten-5"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDateTime(originalData.Maker_DT_Stamp)"
                  label="ວັນທີສ້າງ"
                  outlined
                  readonly
                  bg-color="grey-lighten-5"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="originalData.Checker_Id || 'N/A'"
                  label="ຜູ້ກວດສອບ"
                  outlined
                  readonly
                  bg-color="grey-lighten-5"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDateTime(originalData.Checker_DT_Stamp)"
                  label="ວັນທີກວດສອບ"
                  outlined
                  readonly
                  bg-color="grey-lighten-5"
                />
              </v-col>
            </v-row>

            <!-- Action Buttons -->
            <v-row class="mt-4">
              <v-col cols="12">
                <div class="d-flex justify-end gap-3">
                  <v-btn
                    @click="resetForm"
                    variant="outlined"
                    color="grey"
                    :disabled="loading || isReadOnly"
                  >
                    ລ້າງຂໍ້ມູນ
                  </v-btn>
                  <v-btn
                    @click="$router.go(-1)"
                    variant="outlined"
                    :disabled="loading"
                  >
                    ຍົກເລີກ
                  </v-btn>
                  <v-btn
                    v-if="!isReadOnly"
                    type="submit"
                    color="primary"
                    variant="elevated"
                    :loading="loading"
                    :disabled="!formValid || !hasChanges"
                  >
                    ອັບເດດ
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Reactive data
const loading = ref(false)
const loadingData = ref(true)
const formValid = ref(false)
const formRef = ref(null)

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
  maxLength200: (value) => !value || value.length <= 200 || 'ບໍ່ສາມາດເກີນ 200 ຕົວອັກສອນ',
  positiveNumber: (value) => !value || value > 0 || 'ຕ້ອງເປັນຕົວເລກບວກ'
}

// Computed
const isReadOnly = computed(() => originalData.value.Auth_Status === 'A')

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify({
    function_id: originalData.value.function_id,
    description_la: originalData.value.description_la,
    description_en: originalData.value.description_en,
    eod_function: originalData.value.eod_function,
    function_order: originalData.value.function_order,
    Record_Status: originalData.value.Record_Status
  })
})

// Methods
const loadData = async () => {
  loadingData.value = true
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/function-desc/${route.params.id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      originalData.value = data
      form.value = {
        function_id: data.function_id,
        description_la: data.description_la,
        description_en: data.description_en || '',
        eod_function: data.eod_function,
        function_order: data.function_order,
        Record_Status: data.Record_Status
      }
    } else {
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ', 'error')
      router.go(-1)
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່', 'error')
    router.go(-1)
  } finally {
    loadingData.value = false
  }
}

const submitForm = async () => {
  if (!formValid.value || isReadOnly.value) return

  loading.value = true
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/function-desc/${route.params.id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (response.ok) {
      const data = await response.json()
      showSnackbar('ອັບເດດສໍາເລັດແລ້ວ', 'success')
      setTimeout(() => {
        router.push('/function-desc')
      }, 1500)
    } else {
      const errorData = await response.json()
      if (errorData.errors) {
        Object.keys(errorData.errors).forEach(field => {
          showSnackbar(`${field}: ${errorData.errors[field][0]}`, 'error')
        })
      } else {
        showSnackbar(errorData.error || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ', 'error')
      }
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່', 'error')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    function_id: originalData.value.function_id,
    description_la: originalData.value.description_la,
    description_en: originalData.value.description_en || '',
    eod_function: originalData.value.eod_function,
    function_order: originalData.value.function_order,
    Record_Status: originalData.value.Record_Status
  }
  formRef.value?.resetValidation()
}

const getAuthStatusText = (status) => {
  return status === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າອະນຸມັດ'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A'
  return new Date(dateTime).toLocaleString('lo-LA')
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
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
</style>