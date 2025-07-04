<template>
  <v-container fluid class="pa-0">
    <!-- Header Section -->
    <div class="header-section">
      <v-container class="py-6">
        <div class="d-flex align-center">
          <v-btn
            @click="$router.go(-1)"
            icon="mdi-arrow-left"
            variant="text"
            size="large"
            class="mr-4"
            color="primary"
          />
          <div>
            <h1 class="text-h4 font-weight-light text-primary mb-1 text-styles">ແກ້ໄຂ EOC Maintain</h1>
            <p class="text-subtitle-1 text-medium-emphasis mb-0">
              ລະຫັັດການປິດບັນຊີ: {{ $route.query.eoc_id }}
            </p>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Main Content -->
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" lg="8" xl="6">
          
          <!-- Loading State -->
          <div v-if="loadingData" class="text-center py-12">
            <v-progress-circular 
              indeterminate 
              color="primary" 
              size="48"
              width="3"
            />
            <p class="text-body-1 text-medium-emphasis mt-4 mb-0">ກໍາລັງໂຫລດຂໍ້ມູນ...</p>
          </div>

          <!-- Form Content -->
          <div v-else>
            
            <!-- Status Alert -->
            <v-alert
              v-if="originalData.Auth_Status === 'A'"
              type="warning"
              variant="tonal"
              class="mb-6 rounded-lg"
              border="start"
              border-color="warning"
            >
              <div class="d-flex align-center">
                <v-icon icon="mdi-lock" class="mr-3" />
                <div>
                  <div class="font-weight-medium">ຂໍ້ມູນນີ້ຖືກອະນຸມັດແລ້ວ</div>
                  <div class="text-caption">Record ນີ້ຖືກອະນຸມັດແລ້ວ ບໍ່ສາມາດແກ້ໄຂໄດ້</div>
                </div>
              </div>
            </v-alert>

            <!-- Main Form Card -->
            <v-card class="main-card" elevation="0" variant="outlined">
              <v-card-text class="pa-8">
                <v-form ref="formRef" v-model="formValid" @submit.prevent="submitForm">
                  
                  <!-- Section: Module & Function -->
                  <div class="form-section">
                    <h3 class="section-title">ຂໍ້ມູນ Module ແລະ Function</h3>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="form.module_id"
                          :items="moduleOptions"
                          :loading="loadingModules"
                          :disabled="isReadOnly"
                          label="ເລືອກ Module"
                          item-title="module_name_la"
                          item-value="module_id"
                          variant="outlined"
                          density="comfortable"
                          :rules="[rules.required]"
                          @change="loadFunctions"
                          prepend-inner-icon="mdi-view-module"
                          hide-details="auto"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary" size="20">mdi-view-module</v-icon>
                          </template>
                        </v-select>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-select
                          v-model="form.function_id"
                          :items="functionOptions"
                          :loading="loadingFunctions"
                          :disabled="!form.module_id || isReadOnly"
                          label="ເລືອກ Function"
                          item-title="description_la"
                          item-value="function_id"
                          variant="outlined"
                          density="comfortable"
                          :rules="[rules.required]"
                          hide-details="auto"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary" size="20">mdi-function</v-icon>
                          </template>
                        </v-select>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Section: EOC Details -->
                  <div class="form-section">
                    <h3 class="section-title">ລາຍລະອຽດ EOC</h3>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="form.eoc_seq_no"
                          :disabled="isReadOnly"
                          label="ລໍາດັບ EOC"
                          type="number"
                          variant="outlined"
                          density="comfortable"
                          :rules="[rules.required, rules.positiveNumber]"
                          hide-details="auto"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary" size="20">mdi-numeric</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-select
                          v-model="form.eoc_type"
                          :items="eocTypeOptions"
                          :loading="loadingEocTypes"      
                          :disabled="isReadOnly"
                          label="ປະເພດ EOC"
                          item-title="MC_name_la"         
                          item-value="MC_code"             
                          variant="outlined"
                          density="comfortable"
                          :rules="[rules.required]"
                          hide-details="auto"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary" size="20">mdi-tag</v-icon>
                          </template>
                        </v-select>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="form.mod_no"
                          :disabled="isReadOnly"
                          label="ຫມາຍເລກການແກ້ໄຂ"
                          type="number"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary" size="20">mdi-pencil</v-icon>
                          </template>
                        </v-text-field>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-select
                          v-model="form.Record_Status"
                          :items="recordStatOptions"
                          label="ສະຖານະ Record"
                          variant="outlined"
                          density="comfortable"
                          disabled
                          hide-details="auto"
                        >
                          <template v-slot:prepend-inner>
                            <v-icon color="primary" size="20">mdi-database</v-icon>
                          </template>
                        </v-select>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Section: Status Information -->
                  <div class="form-section">
                    <h3 class="section-title">ຂໍ້ມູນສະຖານະ</h3>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="status-field">
                          <div class="d-flex align-center">
                            <v-icon 
                              :color="originalData.Auth_Status === 'A' ? 'success' : 'warning'" 
                              size="20" 
                              class="mr-3"
                            >
                              {{ originalData.Auth_Status === 'A' ? 'mdi-check-circle' : 'mdi-clock' }}
                            </v-icon>
                            <div>
                              <div class="text-medium-emphasis text-styles">ສະຖານະການອະນຸມັດ</div>
                              <div class="text-body-1 font-weight-medium text-styles">
                                {{ getAuthStatusText(originalData.Auth_Status) }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </v-col>

                      <v-col cols="12" md="6">
                        <div class="status-field">
                          <div class="d-flex align-center">
                            <v-icon 
                              :color="originalData.Once_Auth === 'Y' ? 'success' : 'grey'" 
                              size="20" 
                              class="mr-3"
                            >
                              {{ originalData.Once_Auth === 'Y' ? 'mdi-shield-check' : 'mdi-shield-outline' }}
                            </v-icon>
                            <div>
                              <div class=".text-styles text-medium-emphasis">ອະນຸມັດຄັ້ງດຽວ</div>
                              <div class="text-body-1 font-weight-medium text-styles">
                                {{ originalData.Once_Auth === 'Y' ? 'ອະນຸມັດແລ້ວ' : 'ຍັງບໍ່ອະນຸມັດ' }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>
                </v-form>
              </v-card-text>

              <!-- Action Footer -->
              <v-divider />
              <v-card-actions class="pa-6">
                <v-spacer />
                <div class="d-flex gap-3">
                  <v-btn
                    @click="resetForm"
                    variant="outlined"
                    color="grey-darken-1"
                    :disabled="loading || isReadOnly"
                    prepend-icon="mdi-refresh"
                  >
                    ລ້າງຂໍ້ມູນ
                  </v-btn>
                  <v-btn
                    @click="$router.go(-1)"
                    variant="outlined"
                    :disabled="loading"
                    prepend-icon="mdi-close"
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
                    prepend-icon="mdi-content-save"
                    @click="submitForm"
                  >
                    ອັບເດດ
                  </v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Enhanced Snackbar -->
    <v-snackbar 
      v-model="snackbar.show" 
      :color="snackbar.color" 
      timeout="4000"
      location="top"
      class="snackbar-custom"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'" 
          class="mr-3"
        />
        {{ snackbar.message }}
      </div>
      <template v-slot:actions>
        <v-btn
          variant="text"
          size="small"
          @click="snackbar.show = false"
          icon="mdi-close"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()
const route = useRoute()

// Reactive data
const loading = ref(false)
const loadingData = ref(true)
const loadingModules = ref(false)
const loadingFunctions = ref(false)
const eocTypeOptions = ref([])
const formValid = ref(false)
const formRef = ref(null)
const loadingEocTypes = ref(false)

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
    const token = localStorage.getItem('token')
    const response = await axios.get(`/api/eoc-maintain/${route.query.eoc_id}/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    originalData.value = response.data
    form.value = {
      module_id: response.data.module_id,
      function_id: response.data.function_id,
      eoc_seq_no: response.data.eoc_seq_no,
      eoc_type: response.data.eoc_type,
      mod_no: response.data.mod_no,
      Record_Status: response.data.Record_Status
    }
    
    // Load functions for the selected module
    if (response.data.module_id) {
      await loadFunctions()
    }
  } catch (error) {
    console.error('Error loading data:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ', 'error')
    router.go(-1)
  } finally {
    loadingData.value = false
  }
}

const loadModules = async () => {
  loadingModules.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/modules/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    moduleOptions.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading modules:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດ Modules', 'error')
  } finally {
    loadingModules.value = false
  }
}

const loadEocTypes = async () => {
  loadingEocTypes.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/master-types/tree/EOC/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    // Filter only active items and format for v-select
    if (response.data.MasterCodes) {
      eocTypeOptions.value = response.data.MasterCodes
        .filter(item => item.Status === 'T') // Only active
        .map(item => ({
          MC_id: item.MC_id,
          MC_code: item.MC_code,        // Value: EOD, EOM, EOY
          MC_name_la: item.MC_name_la,  // Display: ປິດບັນຊີປະຈຳວັນ, etc.
          MC_name_en: item.MC_name_en
        }))
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດປະເພດ EOC', 'error')
  } finally {
    loadingEocTypes.value = false
  }
}

const loadFunctions = async () => {
  if (!form.value.module_id) {
    functionOptions.value = []
    return
  }

  loadingFunctions.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`/api/function-desc/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    functionOptions.value = response.data.results || response.data
  } catch (error) {
    console.error('Error loading functions:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດ Functions', 'error')
  } finally {
    loadingFunctions.value = false
  }
}

const submitForm = async () => {
  if (!formValid.value || isReadOnly.value) return

  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.put(`/api/eoc-maintain/${route.query.eoc_id}/`, form.value, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    showSnackbar(response.data.message || 'ອັບເດດສໍາເລັດແລ້ວ', 'success')
    setTimeout(() => {
      router.push('/eoc-maintain')
    }, 1500)
  } catch (error) {
    console.error('Error updating data:', error)
    if (error.response?.data?.errors) {
      Object.keys(error.response.data.errors).forEach(field => {
        showSnackbar(`${field}: ${error.response.data.errors[field][0]}`, 'error')
      })
    } else {
      showSnackbar(error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ', 'error')
    }
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
  // Check if eoc_id exists in query parameters
  if (!route.query.eoc_id) {
    showSnackbar('ບໍ່ພົບ ID ຂອງ EOC', 'error')
    router.push('/eoc-maintain')
    return
  }
  
  await loadModules()
  await loadData()
  await loadEocTypes()  
})
</script>

<style scoped>
/* Header Section */
.header-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Main Card */
.main-card {
  border-radius: 16px !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important;
  overflow: hidden;
}

/* Form Sections */
.form-section {
  margin-bottom: 2rem;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1);
}

/* Status Fields */
.status-field {
  background: rgba(var(--v-theme-surface), 0.6);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 1rem;
  height: 100%;
  transition: all 0.2s ease;
}

.status-field:hover {
  background: rgba(var(--v-theme-surface), 0.8);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

/* Form Controls */
:deep(.v-field__outline) {
  border-radius: 12px !important;
}

:deep(.v-field--focused .v-field__outline) {
  border-width: 2px !important;
}

:deep(.v-btn) {
  text-transform: none !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
}

:deep(.v-alert) {
  border-radius: 12px !important;
}

/* Snackbar */
.snackbar-custom {
  border-radius: 12px !important;
}

/* Gaps */
.gap-3 {
  gap: 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .header-section .v-container {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }
  
  .main-card .v-card-text {
    padding: 1.5rem !important;
  }
  
  .main-card .v-card-actions {
    padding: 1.5rem !important;
    flex-direction: column;
  }
  
  .d-flex.gap-3 {
    width: 100%;
    flex-direction: column;
  }
  
  .d-flex.gap-3 .v-btn {
    width: 100%;
  }
}

/* Loading state improvements */
:deep(.v-progress-circular) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* Animation for form sections */
.form-section {
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>