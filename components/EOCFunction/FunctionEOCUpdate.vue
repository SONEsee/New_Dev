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
            <h2 class="text-h4 font-weight-medium text-primary">ແກ້ໄຂ EOC Maintain</h2>
            <div class="text-subtitle-1 text-grey-darken-1 mt-1">
              ID: {{ $route.params.id }}
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
            Record ນີ້ຖືກອະນຸມັດແລ້ວ ບໍ່ສາມາດແກ້ໄຂໄດ້
          </v-alert>

          <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
            <v-row>
              <!-- Module Selection -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.module_id"
                  :items="moduleOptions"
                  :loading="loadingModules"
                  :disabled="isReadOnly"
                  label="ເລືອກ Module *"
                  item-title="module_name"
                  item-value="module_id"
                  required
                  outlined
                  :rules="[rules.required]"
                  @change="loadFunctions"
                />
              </v-col>

              <!-- Function Selection -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.function_id"
                  :items="functionOptions"
                  :loading="loadingFunctions"
                  :disabled="!form.module_id || isReadOnly"
                  label="ເລືອກ Function *"
                  item-title="function_name"
                  item-value="function_id"
                  required
                  outlined
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Sequence Number -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.eoc_seq_no"
                  :disabled="isReadOnly"
                  label="ລໍາດັບ EOC *"
                  type="number"
                  required
                  outlined
                  :rules="[rules.required, rules.positiveNumber]"
                />
              </v-col>

              <!-- EOC Type -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.eoc_type"
                  :items="eocTypeOptions"
                  :disabled="isReadOnly"
                  label="ປະເພດ EOC *"
                  required
                  outlined
                  :rules="[rules.required]"
                />
              </v-col>

              <!-- Modification Number -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="form.mod_no"
                  :disabled="isReadOnly"
                  label="ຫມາຍເລກການແກ້ໄຂ"
                  type="number"
                  outlined
                />
              </v-col>

              <!-- Record Status -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.Record_Status"
                  :items="recordStatOptions"
                  label="ສະຖານະ Record"
                  outlined
                  disabled
                />
              </v-col>

              <!-- Authorization Status (Read Only) -->
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="getAuthStatusText(originalData.Auth_Status)"
                  label="ສະຖານະການອະນຸມັດ"
                  outlined
                  readonly
                />
              </v-col>

              <!-- Once Auth (Read Only) -->
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="originalData.Once_Auth === 'Y' ? 'ອະນຸມັດແລ້ວ' : 'ຍັງບໍ່ອະນຸມັດ'"
                  label="ອະນຸມັດຄັ້ງດຽວ"
                  outlined
                  readonly
                />
              </v-col>
            </v-row>

            <!-- Audit Information -->
            <v-divider class="my-6" />
            <h3 class="text-h6 mb-4">ຂໍ້ມູນການກວດສອບ</h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="originalData.maker_name || 'N/A'"
                  label="ຜູ້ສ້າງ"
                  outlined
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDateTime(originalData.Maker_DT_Stamp)"
                  label="ວັນທີສ້າງ"
                  outlined
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="originalData.checker_name || 'N/A'"
                  label="ຜູ້ກວດສອບ"
                  outlined
                  readonly
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="formatDateTime(originalData.Checker_DT_Stamp)"
                  label="ວັນທີກວດສອບ"
                  outlined
                  readonly
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
const loadingModules = ref(false)
const loadingFunctions = ref(false)
const formValid = ref(false)
const formRef = ref(null)

// Form data
const form = ref({
  module_id: null,
  function_id: null,
  eoc_seq_no: 1,
  eoc_type: '',
  mod_no: null,
  Record_Status: 'C'
})

const originalData = ref({})

// Options
const moduleOptions = ref([])
const functionOptions = ref([])

const eocTypeOptions = ref([
  { title: 'Type A', value: 'A' },
  { title: 'Type B', value: 'B' },
  { title: 'Type C', value: 'C' }
])

const recordStatOptions = ref([
  { title: 'ປິດ', value: 'C' },
  { title: 'ເປີດ', value: 'O' }
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
  positiveNumber: (value) => value > 0 || 'ຕ້ອງເປັນຕົວເລກບວກ'
}

// Computed
const isReadOnly = computed(() => originalData.value.Auth_Status === 'A')

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify({
    module_id: originalData.value.module_id,
    function_id: originalData.value.function_id,
    eoc_seq_no: originalData.value.eoc_seq_no,
    eoc_type: originalData.value.eoc_type,
    mod_no: originalData.value.mod_no,
    Record_Status: originalData.value.Record_Status
  })
})

// Methods
const loadData = async () => {
  loadingData.value = true
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/eoc-maintain/${route.params.id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      originalData.value = data
      form.value = {
        module_id: data.module_id,
        function_id: data.function_id,
        eoc_seq_no: data.eoc_seq_no,
        eoc_type: data.eoc_type,
        mod_no: data.mod_no,
        Record_Status: data.Record_Status
      }
      
      // Load functions for the selected module
      if (data.module_id) {
        await loadFunctions()
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

const loadModules = async () => {
  loadingModules.value = true
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch('/api/modules/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      moduleOptions.value = data.results || data
    } else {
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດ Modules', 'error')
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່', 'error')
  } finally {
    loadingModules.value = false
  }
}

const loadFunctions = async () => {
  if (!form.value.module_id) {
    functionOptions.value = []
    return
  }

  loadingFunctions.value = true
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/functions/?module_id=${form.value.module_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      functionOptions.value = data.results || data
    } else {
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດ Functions', 'error')
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່', 'error')
  } finally {
    loadingFunctions.value = false
  }
}

const submitForm = async () => {
  if (!formValid.value || isReadOnly.value) return

  loading.value = true
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/eoc-maintain/${route.params.id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (response.ok) {
      const data = await response.json()
      showSnackbar(data.message || 'ອັບເດດສໍາເລັດແລ້ວ', 'success')
      setTimeout(() => {
        router.push('/eoc-maintain')
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
    module_id: originalData.value.module_id,
    function_id: originalData.value.function_id,
    eoc_seq_no: originalData.value.eoc_seq_no,
    eoc_type: originalData.value.eoc_type,
    mod_no: originalData.value.mod_no,
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

// Watch for module changes
watch(() => form.value.module_id, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal) {
    loadFunctions()
  }
})

// Lifecycle
onMounted(async () => {
  await loadModules()
  await loadData()
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