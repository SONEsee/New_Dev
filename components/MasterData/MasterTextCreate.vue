<template>
  <v-dialog v-model="dialog" max-width="600px" persistent scrollable>
    <v-card class="elevation-12">
      <!-- Header -->
      <v-card-title class="pa-4 bg-primary text-white">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon color="white" class="mr-2">mdi-folder-plus</v-icon>
            <span class="text-h6">{{ isEdit ? 'ແກ້ໄຂ' : 'ສ້າງ' }} Master Type</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="closeDialog"
          ></v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <!-- Master Type Name -->
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="formData.master_type_name"
                label="ຊື່ Master Type *"
                :rules="nameRules"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-format-title"
                placeholder="ເຊັ່ນ: AccountType, TransactionType"
                counter="100"
                hide-details="auto"
                :loading="loading"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Description -->
          <v-row dense class="mt-2">
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="ຄຳອະທິບາຍ"
                :rules="descriptionRules"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-text"
                placeholder="ອະທິບາຍລາຍລະອຽດຂອງ Master Type ນີ້"
                rows="3"
                counter="500"
                hide-details="auto"
                :loading="loading"
              ></v-textarea>
            </v-col>
          </v-row>

          <!-- Display Order -->
          <v-row dense class="mt-2">
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.display_order"
                label="ລຳດັບການສະແດງ"
                type="number"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-sort-numeric-ascending"
                placeholder="1, 2, 3..."
                min="1"
                hide-details="auto"
                :loading="loading"
              ></v-text-field>
            </v-col>

            <!-- Status -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.is_active"
                label="ເປີດໃຊ້ງານ"
                color="success"
                density="comfortable"
                hide-details
                :loading="loading"
              >
                <template #label>
                  <div class="d-flex align-center">
                    <v-icon 
                      :color="formData.is_active ? 'success' : 'error'" 
                      class="mr-2"
                    >
                      {{ formData.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                    {{ formData.is_active ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                  </div>
                </template>
              </v-switch>
            </v-col>
          </v-row>

          <!-- Additional Configuration -->
          <v-row dense class="mt-2">
            <v-col cols="12">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="mr-2">mdi-cog</v-icon>
                    ການຕັ້ງຄ່າເພີ່ມເຕີມ
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row dense class="mt-2">
                      <!-- Allow Duplicate Codes -->
                      <v-col cols="12" md="6">
                        <v-switch
                          v-model="formData.allow_duplicate_codes"
                          label="ອະນຸຍາດ Master Code ຊ້ຳ"
                          color="warning"
                          density="comfortable"
                          hide-details
                        ></v-switch>
                      </v-col>

                      <!-- Require Description -->
                      <v-col cols="12" md="6">
                        <v-switch
                          v-model="formData.require_description"
                          label="ບັງຄັບໃສ່ຄຳອະທິບາຍ"
                          color="info"
                          density="comfortable"
                          hide-details
                        ></v-switch>
                      </v-col>
                    </v-row>

                    <!-- Code Format Pattern -->
                    <v-row dense class="mt-2">
                      <v-col cols="12">
                        <v-text-field
                          v-model="formData.code_format_pattern"
                          label="ຮູບແບບລະຫັດ (RegEx)"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-regex"
                          placeholder="^[A-Z]{2,4}[0-9]{2,4}$ (ຕົວຢ່າງ)"
                          hint="ກຳນົດຮູບແບບສຳລັບ Master Code (ບໍ່ບັງຄັບ)"
                          persistent-hint
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <!-- Additional Metadata -->
                    <v-row dense class="mt-2">
                      <v-col cols="12">
                        <v-textarea
                          v-model="formData.metadata"
                          label="ຂໍ້ມູນເພີ່ມເຕີມ (JSON)"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-code-json"
                          placeholder='{"category": "financial", "level": 1}'
                          rows="2"
                          hint="ຂໍ້ມູນເພີ່ມເຕີມໃນຮູບແບບ JSON (ບໍ່ບັງຄັບ)"
                          persistent-hint
                          hide-details="auto"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>

          <!-- Preview Section -->
          <v-row dense class="mt-4" v-if="formData.master_type_name">
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
                class="preview-alert"
              >
                <template #title>
                  <v-icon class="mr-2">mdi-eye</v-icon>
                  ຕົວຢ່າງ Master Type
                </template>
                <div class="preview-content">
                  <div class="d-flex align-center mb-2">
                    <v-icon :color="formData.is_active ? 'success' : 'error'" class="mr-2">
                      mdi-folder
                    </v-icon>
                    <strong>{{ formData.master_type_name }}</strong>
                    <v-chip
                      :color="formData.is_active ? 'success' : 'error'"
                      size="small"
                      variant="flat"
                      class="ml-2"
                    >
                      {{ formData.is_active ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
                    </v-chip>
                  </div>
                  <div v-if="formData.description" class="text-caption text-grey mb-2">
                    {{ formData.description }}
                  </div>
                  <div class="text-caption">
                    <span class="text-info">ລຳດັບ:</span> {{ formData.display_order || 'ອັດຕະໂນມັດ' }}
                    <span v-if="formData.code_format_pattern" class="ml-3">
                      <span class="text-info">ຮູບແບບລະຫັດ:</span> {{ formData.code_format_pattern }}
                    </span>
                  </div>
                </div>
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="loading"
        >
          ຍົກເລີກ
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="submitForm"
          :loading="loading"
          :disabled="!valid"
        >
          <v-icon start>{{ isEdit ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ isEdit ? 'ບັນທຶກການປ່ຽນແປງ' : 'ສ້າງ Master Type' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editItem: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'created', 'updated'])

// State
const dialog = ref(false)
const valid = ref(false)
const loading = ref(false)
const form = ref(null)

// Form data
const formData = reactive({
  master_type_name: '',
  description: '',
  display_order: null,
  is_active: true,
  allow_duplicate_codes: false,
  require_description: false,
  code_format_pattern: '',
  metadata: ''
})

// Validation rules
const nameRules = [
  v => !!v || 'ຈຳເປັນຕ້ອງໃສ່ຊື່ Master Type',
  v => (v && v.length >= 2) || 'ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ',
  v => (v && v.length <= 100) || 'ຊື່ຕ້ອງບໍ່ເກີນ 100 ຕົວອັກສອນ',
  v => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(v) || 'ຊື່ຕ້ອງເລີ່ມດ້ວຍຕົວອັກສອນ ແລະ ມີພຽງຕົວອັກສອນ, ເລກ, _, -'
]

const descriptionRules = [
  v => !v || v.length <= 500 || 'ຄຳອະທິບາຍຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ'
]

// Computed
const isEdit = computed(() => !!props.editItem)

// API configuration
const { $axios } = useNuxtApp()
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Watch for dialog changes
watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (newVal) {
    resetForm()
    if (props.editItem) {
      populateForm(props.editItem)
    }
  }
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
})

// Methods
const resetForm = () => {
  Object.assign(formData, {
    master_type_name: '',
    description: '',
    display_order: null,
    is_active: true,
    allow_duplicate_codes: false,
    require_description: false,
    code_format_pattern: '',
    metadata: ''
  })
  
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

const populateForm = (item) => {
  Object.assign(formData, {
    master_type_name: item.master_type_name || '',
    description: item.description || '',
    display_order: item.display_order,
    is_active: item.is_active !== undefined ? item.is_active : true,
    allow_duplicate_codes: item.allow_duplicate_codes || false,
    require_description: item.require_description || false,
    code_format_pattern: item.code_format_pattern || '',
    metadata: item.metadata ? JSON.stringify(item.metadata, null, 2) : ''
  })
}

const validateForm = async () => {
  if (!form.value) return false
  
  const { valid: isValid } = await form.value.validate()
  return isValid
}

const preparePayload = () => {
  const payload = {
    master_type_name: formData.master_type_name.trim(),
    description: formData.description?.trim() || null,
    display_order: formData.display_order || null,
    is_active: formData.is_active,
    allow_duplicate_codes: formData.allow_duplicate_codes,
    require_description: formData.require_description,
    code_format_pattern: formData.code_format_pattern?.trim() || null
  }

  // Parse metadata if provided
  if (formData.metadata?.trim()) {
    try {
      payload.metadata = JSON.parse(formData.metadata.trim())
    } catch (error) {
      throw new Error('ຂໍ້ມູນເພີ່ມເຕີມຕ້ອງຢູ່ໃນຮູບແບບ JSON ທີ່ຖືກຕ້ອງ')
    }
  } else {
    payload.metadata = null
  }

  return payload
}

const submitForm = async () => {
  try {
    // Validate form
    const isValid = await validateForm()
    if (!isValid) return

    loading.value = true

    // Prepare payload
    const payload = preparePayload()

    let response
    if (isEdit.value) {
      // Update existing master type
      response = await $axios.put(`/api/master-types/${props.editItem.id}/`, payload, getAuthHeaders())
      emit('updated', response.data)
    } else {
      // Create new master type
      response = await $axios.post('/api/master-types/', payload, getAuthHeaders())
      emit('created', response.data)
    }

    closeDialog()

  } catch (error) {
    console.error('Error submitting form:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດ'
    if (error.message) {
      errorMessage = error.message
    } else if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response.data.master_type_name) {
        errorMessage = `ຊື່ Master Type: ${error.response.data.master_type_name.join(', ')}`
      } else {
        errorMessage = JSON.stringify(error.response.data)
      }
    }

    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: errorMessage,
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  dialog.value = false
  resetForm()
}

// Auto-generate display order
watch(() => formData.master_type_name, (newName) => {
  if (newName && !isEdit.value && !formData.display_order) {
    // Simple auto-generation based on name length (you can make this more sophisticated)
    formData.display_order = newName.length * 10
  }
})
</script>

<style scoped>
.preview-alert {
  border-radius: 8px;
}

.preview-content {
  padding: 8px 0;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}

:deep(.v-expansion-panel) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-card-title) {
  border-radius: 8px 8px 0 0;
}

:deep(.v-form) {
  width: 100%;
}

@media (max-width: 768px) {
  :deep(.v-dialog) {
    margin: 16px;
  }
}
</style>