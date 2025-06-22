<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <!-- Header Section -->
        <div class="d-flex align-center mb-6">
          <v-btn
            @click="goBack"
            icon="mdi-arrow-left"
            variant="text"
            class="mr-3"
            size="large"
          />
          <div>
            <h1 class="text-h4 font-weight-light text-primary mb-1">ສ້າງ EOC Maintain ໃໝ່</h1>
            <p class="text-body-2 text-grey">ສ້າງການຕັ້ງຄ່າ EOC Function ສໍາລັບລະບົບ</p>
          </div>
        </div>

        <!-- Main Form Card -->
        <v-card elevation="2" class="pa-8" rounded="xl">
          <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
            
            <!-- Module & Function Selection Section -->
            <div class="mb-8">
              <h3 class="text-h6 mb-4 d-flex align-center text-primary">
                <v-icon class="mr-2">mdi-puzzle</v-icon>
                ເລືອກ Module ແລະ Function
              </h3>
              
              <v-row>
                <!-- Module Selection -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.module_Id"
                    :items="moduleOptions"
                    :loading="loadingModules"
                    label="ເລືອກ Module *"
                    item-title="title" 
                    item-value="value"
                    variant="outlined"
                    prepend-inner-icon="mdi-package-variant"
                    :rules="[rules.required]"
                    @update:model-value="onModuleChange"
                    clearable
                    no-data-text="ບໍ່ພົບຂໍ້ມູນ Module"
                    :error-messages="moduleError"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template v-slot:prepend>
                          <v-avatar size="32" color="primary" variant="tonal">
                            <v-icon size="18">mdi-package-variant</v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ item.raw.module_name_la || item.raw.module_name || item.raw.module_Id }}</v-list-item-title>
                        <v-list-item-subtitle>ID: {{ item.raw.module_Id }}</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                    <template v-slot:selection="{ item }">
                      {{ item.value }} - {{ item.title }}
                    </template>
                  </v-select>
                </v-col>

                <!-- Function Selection -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.function_id"
                    :items="functionOptions"
                    :loading="loadingFunctions"
                    :disabled="loadingFunctions"
                    label="ເລືອກ Function *"
                    item-title="description_la"
                    item-value="function_id"
                    variant="outlined"
                    prepend-inner-icon="mdi-function"
                    :rules="[rules.required]"
                    clearable
                    no-data-text="ບໍ່ພົບຂໍ້ມູນ Function"
                    :error-messages="functionError"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template v-slot:prepend>
                          <v-avatar size="32" color="success" variant="tonal">
                            <v-icon size="18">mdi-function</v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ item.raw.description_la || item.raw.function_id }}</v-list-item-title>
                        <v-list-item-subtitle>
                          ID: {{ item.raw.function_id }} • {{ item.raw.description_en || 'No English description' }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </template>
                    <template v-slot:selection="{ item }">
                      {{ item.value }} - {{ item.title }}
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </div>

            <v-divider class="mb-8" />

            <!-- EOC Configuration Section -->
            <div class="mb-8">
              <h3 class="text-h6 mb-4 d-flex align-center text-primary">
                <v-icon class="mr-2">mdi-cog</v-icon>
                ການຕັ້ງຄ່າ EOC
              </h3>
              
              <v-row>
                <!-- Sequence Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.eoc_seq_no"
                    label="ລໍາດັບ EOC *"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-numeric"
                    :rules="[rules.required, rules.positiveNumber]"
                    min="1"
                    step="1"
                    clearable
                  />
                </v-col>

                <!-- EOC Type -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.eoc_type"
                    :items="eocTypeOptions"
                    label="ປະເພດ EOC *"
                    variant="outlined"
                    prepend-inner-icon="mdi-shape"
                    :rules="[rules.required]"
                    item-title="title"
                    item-value="value"
                  >
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template v-slot:prepend>
                          <v-avatar size="32" :color="getTypeColor(item.raw.value)" variant="tonal">
                            <span class="font-weight-bold">{{ item.raw.value }}</span>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>

                <!-- Modification Number -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="form.mod_no"
                    label="ຫມາຍເລກການແກ້ໄຂ"
                    type="number"
                    variant="outlined"
                    prepend-inner-icon="mdi-file-edit"
                    min="0"
                    step="1"
                    clearable
                    hint="ເວົ້າວ່າງໄວ້ຖ້າບໍ່ມີການແກ້ໄຂ"
                    persistent-hint
                  />
                </v-col>

                <!-- Record Status -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.Record_Status"
                    :items="recordStatusOptions"
                    label="ສະຖານະ Record"
                    variant="outlined"
                    prepend-inner-icon="mdi-toggle-switch"
                    disabled
                    item-title="title"
                    item-value="value"
                    hint="ສະຖານະເບື້ອງຕົ້ນຈະຖືກຕັ້ງເປັນ 'ປິດ'"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Preview Section -->
            <v-card 
              v-if="form.module_Id && form.function_id" 
              variant="tonal" 
              color="info" 
              class="mb-8"
            >
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2">mdi-eye</v-icon>
                ຕົວຢ່າງຂໍ້ມູນ
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="d-flex align-center mb-2">
                      <v-icon class="mr-2" color="primary">mdi-package-variant</v-icon>
                      <strong>Module:</strong>
                    </div>
                    <p class="ml-6">{{ getSelectedModuleName() }}</p>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="d-flex align-center mb-2">
                      <v-icon class="mr-2" color="success">mdi-function</v-icon>
                      <strong>Function:</strong>
                    </div>
                    <p class="ml-6">{{ getSelectedFunctionName() }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Action Buttons -->
            <div class="d-flex justify-end gap-3 mt-8">
              <v-btn
                @click="resetForm"
                variant="outlined"
                color="grey"
                :disabled="loading"
                prepend-icon="mdi-refresh"
                class="text-none"
                size="large"
              >
                ລ້າງຂໍ້ມູນ
              </v-btn>
              <v-btn
                @click="goBack"
                variant="outlined"
                color="error"
                :disabled="loading"
                prepend-icon="mdi-close"
                class="text-none"
                size="large"
              >
                ຍົກເລີກ
              </v-btn>
              <v-btn
                type="submit"
                color="primary"
                variant="flat"
                :loading="loading"
                :disabled="!formValid"
                prepend-icon="mdi-content-save"
                class="text-none px-8"
                size="large"
              >
                ບັນທຶກ
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      :timeout="4000"
      location="bottom right"
      variant="flat"
      elevation="4"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-3" size="24">
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span class="text-body-1">{{ snackbar.message }}</span>
      </div>
      <template v-slot:actions>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()

// Reactive data
const loading = ref(false)
const loadingModules = ref(false)
const loadingFunctions = ref(false)
const formValid = ref(false)
const formRef = ref(null)
const moduleError = ref('')
const functionError = ref('')

// Form data
const form = ref({
  module_Id: null,
  function_id: null,
  eoc_seq_no: 1,
  eoc_type: '',
  mod_no: null,
  Record_Status: 'C'
})

// Options data
const moduleOptions = ref([])
const functionOptions = ref([])

// Static options
const eocTypeOptions = ref([
  { 
    title: 'EOD - End of Day Processing', 
    value: 'EOD', 
    description: 'ໃຊ້ສໍາລັບການປຸງແຕ່ງຂໍ້ມູນຕອນຈົບວັນ' 
  },
  { 
    title: 'SOD - Start of Day Processing', 
    value: 'SOD', 
    description: 'ໃຊ້ສໍາລັບການປຸງແຕ່ງຂໍ້ມູນຕອນເລີ່ມວັນ' 
  },
  { 
    title: 'RPT - Report Generation', 
    value: 'RPT', 
    description: 'ໃຊ້ສໍາລັບການສ້າງລາຍງານ' 
  },
  { 
    title: 'BAK - Backup Process', 
    value: 'BAK', 
    description: 'ໃຊ້ສໍາລັບການສຳຮອງຂໍ້ມູນ' 
  }
])

const recordStatusOptions = ref([
  { title: 'ປິດ', value: 'C' },
  { title: 'ເປີດ', value: 'O' },
  { title: 'ໃຊ້ງານ', value: 'Y' },
  { title: 'ບໍ່ໃຊ້ງານ', value: 'N' }
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
  positiveNumber: (value) => !value || value > 0 || 'ຕ້ອງເປັນຕົວເລກບວກ'
}

// Computed
const selectedModule = computed(() => {
  return moduleOptions.value.find(m => m.module_Id === form.value.module_Id)
})

const selectedFunction = computed(() => {
  return functionOptions.value.find(f => f.function_id === form.value.function_id)
})

// Methods
const goBack = () => {
  router.push('/eocfunction')
}

const getTypeColor = (type) => {
  const colors = { 'A': 'primary', 'B': 'success', 'C': 'warning', 'D': 'info' }
  return colors[type] || 'grey'
}

const getSelectedModuleName = () => {
  return selectedModule.value?.module_name || 'N/A'
}

const getSelectedFunctionName = () => {
  return selectedFunction.value?.description_la || selectedFunction.value?.function_id || 'N/A'
}

const loadModules = async () => {
  loadingModules.value = true
  moduleError.value = ''
  
  try {
    const response = await axios.get('/api/modules/')
    
    if (response.data) {
      const modules = response.data.results || response.data
      // Transform modules for v-select
      moduleOptions.value = modules.map(module => ({
        title: module.module_name_la || module.module_name || module.module_Id,
        value: module.module_Id, // <-- this is the code like "GL"
        ...module
      }))
            
      if (moduleOptions.value.length === 0) {
        moduleError.value = 'ບໍ່ພົບຂໍ້ມູນ Module ໃນລະບົບ'
      }
    }
  } catch (error) {
    console.error('Error loading modules:', error)
    moduleError.value = 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດ Modules'
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດ Modules', 'error')
    moduleOptions.value = []
  } finally {
    loadingModules.value = false
  }
}

const loadFunctions = async () => {
  loadingFunctions.value = true
  functionError.value = ''
  
  try {
    // Load all function descriptions
    const response = await axios.get('/api/function-desc/', {
      params: {
        page_size: 1000, // Get all functions
        Record_Status: 'O' // Only active functions
      }
    })
    
    if (response.data) {
      const functions = response.data.results || response.data
      // Transform functions for v-select
      functionOptions.value = functions.map(func => ({
        title: func.description_la || func.function_id,
        value: func.function_id,
        ...func
      }))
      
      if (functionOptions.value.length === 0) {
        functionError.value = 'ບໍ່ພົບ Function ທີ່ເປີດໃຊ້ງານ'
      }
    }
  } catch (error) {
    console.error('Error loading functions:', error)
    functionError.value = 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດ Functions'
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດ Functions', 'error')
    functionOptions.value = []
  } finally {
    loadingFunctions.value = false
  }
}

const onModuleChange = () => {
  // Reset function selection when module changes
  form.value.function_id = null
  loadFunctions()
}

const submitForm = async () => {
  if (!formValid.value) return

  loading.value = true
  try {
    console.log('Submitting EOC Maintain data:', form.value)

    const response = await axios.post('/api/eoc-maintain/', form.value)
    
    if (response.data) {
      showSnackbar(response.data.message || 'ສ້າງສໍາເລັດແລ້ວ', 'success')
      setTimeout(() => {
        goBack()
      }, 1500)
    }
  } catch (error) {
    console.error('Error creating EOC maintain:', error)
    
    if (error.response?.data?.errors) {
      // Handle field-specific validation errors
      const errors = error.response.data.errors
      Object.keys(errors).forEach(field => {
        showSnackbar(`${field}: ${errors[field][0]}`, 'error')
      })
    } else if (error.response?.data?.detail) {
      showSnackbar(error.response.data.detail, 'error')
    } else if (error.response?.data?.error) {
      showSnackbar(error.response.data.error, 'error')
    } else {
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ', 'error')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    module_Id: null,
    function_id: null,
    eoc_seq_no: 1,
    eoc_type: '',
    mod_no: null,
    Record_Status: 'C'
  }
  functionOptions.value = []
  moduleError.value = ''
  functionError.value = ''
  formRef.value?.resetValidation()
  showSnackbar('ຂໍ້ມູນຖືກລ້າງແລ້ວ', 'info')
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadModules()
  loadFunctions() // Load functions on mount since we're not filtering by module
})
</script>

<style scoped>
.v-card {
  border-radius: 16px;
}

.v-btn {
  text-transform: none !important;
  border-radius: 8px;
}

.gap-3 {
  gap: 12px;
}

/* Enhanced form styling */
:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-list-item) {
  border-radius: 8px;
  margin: 2px 8px;
}

:deep(.v-list-item:hover) {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

/* Section headers */
.text-h6 {
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1);
  padding-bottom: 8px;
}

/* Preview card styling */
.v-card--variant-tonal {
  border: 1px solid rgba(var(--v-theme-info), 0.2);
}

/* Button enhancements */
.v-btn--variant-flat {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* Loading states */
:deep(.v-progress-circular) {
  margin: 0 8px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .d-flex.justify-end {
    flex-direction: column;
  }
  
  .d-flex.justify-end .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Form field icons */
:deep(.v-field__prepend-inner) {
  margin-right: 8px;
}

/* Enhanced dropdown items */
:deep(.v-list-item-subtitle) {
  opacity: 0.7;
  font-size: 12px;
}

/* Status indicators */
.status-chip {
  font-weight: 500;
}
</style>