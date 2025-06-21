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
          <h2 class="text-h4 font-weight-medium text-primary">ສ້າງ EOC Maintain ໃໝ່</h2>
        </div>

        <!-- Form Card -->
        <v-card outlined class="pa-6">
          <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
            <v-row>
              <!-- Module Selection -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.module_id"
                  :items="moduleOptions"
                  :loading="loadingModules"
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
                  :disabled="!form.module_id"
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
            </v-row>

            <!-- Action Buttons -->
            <v-row class="mt-4">
              <v-col cols="12">
                <div class="d-flex justify-end gap-3">
                  <v-btn
                    @click="resetForm"
                    variant="outlined"
                    color="grey"
                    :disabled="loading"
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
                    type="submit"
                    color="primary"
                    variant="elevated"
                    :loading="loading"
                    :disabled="!formValid"
                  >
                    ບັນທຶກ
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const loading = ref(false)
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

// Methods
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
    form.value.function_id = null
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
    form.value.function_id = null
  }
}

const submitForm = async () => {
  if (!formValid.value) return

  loading.value = true
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch('/api/eoc-maintain/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (response.ok) {
      const data = await response.json()
      showSnackbar(data.message || 'ສ້າງສໍາເລັດແລ້ວ', 'success')
      setTimeout(() => {
        router.push('/eoc-maintain')
      }, 1500)
    } else {
      const errorData = await response.json()
      if (errorData.errors) {
        // Handle validation errors
        Object.keys(errorData.errors).forEach(field => {
          showSnackbar(`${field}: ${errorData.errors[field][0]}`, 'error')
        })
      } else {
        showSnackbar(errorData.error || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ', 'error')
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
    module_id: null,
    function_id: null,
    eoc_seq_no: 1,
    eoc_type: '',
    mod_no: null,
    Record_Status: 'C'
  }
  functionOptions.value = []
  formRef.value?.resetValidation()
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadModules()
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
</style>