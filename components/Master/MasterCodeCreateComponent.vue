<template>
  <v-dialog v-model="dialog" max-width="700px" persistent scrollable>
    <v-card class="elevation-12">
      <!-- Header -->
      <v-card-title class="pa-4 bg-success text-white">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon color="white" class="mr-2">mdi-code-tags-check</v-icon>
            <div>
              <div class="text-h6">{{ isEdit ? 'ແກ້ໄຂ' : 'ສ້າງ' }} Master Code</div>
              <div v-if="masterType" class="text-caption">
                ສຳລັບ: {{ masterType.master_type_name }}
              </div>
            </div>
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
          <!-- Master Type Info -->
          <v-row dense v-if="masterType">
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
                class="mb-3"
              >
                <template #title>
                  <v-icon class="mr-2">mdi-information</v-icon>
                  Master Type: {{ masterType.master_type_name }}
                </template>
                <div v-if="masterType.description" class="text-caption">
                  {{ masterType.description }}
                </div>
                <div class="text-caption mt-2">
                  <v-chip 
                    v-if="masterType.code_format_pattern" 
                    size="small" 
                    color="warning" 
                    variant="outlined"
                    class="mr-2"
                  >
                    ຮູບແບບ: {{ masterType.code_format_pattern }}
                  </v-chip>
                  <v-chip 
                    v-if="masterType.require_description" 
                    size="small" 
                    color="info" 
                    variant="outlined"
                  >
                    ບັງຄັບຄຳອະທິບາຍ
                  </v-chip>
                </div>
              </v-alert>
            </v-col>
          </v-row>

          <!-- Master Code -->
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.master_code"
                label="Master Code *"
                :rules="codeRules"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-identifier"
                placeholder="SAV001, CUR001, DEP001"
                counter="50"
                hide-details="auto"
                :loading="loading"
                @blur="validateCodeFormat"
              >
                <template #append-inner>
                  <v-btn
                    v-if="!isEdit"
                    icon
                    size="small"
                    variant="text"
                    color="primary"
                    @click="generateCode"
                    title="ສ້າງລະຫັດອັດຕະໂນມັດ"
                  >
                    <v-icon size="small">mdi-auto-fix</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>

            <!-- Display Order -->
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
          </v-row>

          <!-- Descriptions -->
          <v-row dense class="mt-2">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.description_la"
                :label="descriptionLabel"
                :rules="descriptionLaRules"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-translate"
                placeholder="ບັນຊີເງິນຝາກປະຢັດ"
                counter="200"
                hide-details="auto"
                :loading="loading"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.description_en"
                label="ຄຳອະທິບາຍ (ອັງກິດ)"
                :rules="descriptionEnRules"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-translate-variant"
                placeholder="Savings Account"
                counter="200"
                hide-details="auto"
                :loading="loading"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Status and Options -->
          <v-row dense class="mt-2">
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

            <v-col cols="12" md="6">
              <v-switch
                v-model="formData.is_default"
                label="ຄ່າເລີ່ມຕົ້ນ"
                color="warning"
                density="comfortable"
                hide-details
                :loading="loading"
              >
                <template #label>
                  <div class="d-flex align-center">
                    <v-icon 
                      :color="formData.is_default ? 'warning' : 'grey'" 
                      class="mr-2"
                    >
                      {{ formData.is_default ? 'mdi-star' : 'mdi-star-outline' }}
                    </v-icon>
                    {{ formData.is_default ? 'ຄ່າເລີ່ມຕົ້ນ' : 'ບໍ່ແມ່ນຄ່າເລີ່ມຕົ້ນ' }}
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
                    <!-- Additional Properties -->
                    <v-row dense class="mt-2">
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="formData.category"
                          label="ປະເພດ/ໝວດໝູ່"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-tag"
                          placeholder="financial, system, user"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="formData.color_code"
                          label="ລະຫັດສີ"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-palette"
                          placeholder="#FF5722"
                          hide-details="auto"
                        >
                          <template #append-inner>
                            <v-menu>
                              <template #activator="{ props }">
                                <v-btn
                                  icon
                                  size="small"
                                  variant="text"
                                  v-bind="props"
                                  :style="{ backgroundColor: formData.color_code || '#ccc' }"
                                >
                                  <v-icon size="small" :color="getContrastColor(formData.color_code)">
                                    mdi-palette
                                  </v-icon>
                                </v-btn>
                              </template>
                              <v-color-picker
                                v-model="formData.color_code"
                                mode="hex"
                                hide-inputs
                              ></v-color-picker>
                            </v-menu>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>

                    <!-- Icon -->
                    <v-row dense class="mt-2">
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="formData.icon_name"
                          label="ຊື່ໄອຄອນ"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-emoticon"
                          placeholder="mdi-account, mdi-credit-card"
                          hide-details="auto"
                        >
                          <template #append-inner>
                            <v-icon 
                              v-if="formData.icon_name" 
                              :name="formData.icon_name"
                              size="small"
                              color="primary"
                            >
                              {{ formData.icon_name }}
                            </v-icon>
                          </template>
                        </v-text-field>
                      </v-col>

                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="formData.level"
                          label="ລະດັບ"
                          type="number"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-format-list-numbered"
                          placeholder="1, 2, 3"
                          min="1"
                          max="10"
                          hide-details="auto"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <!-- Additional Data (JSON) -->
                    <v-row dense class="mt-2">
                      <v-col cols="12">
                        <v-textarea
                          v-model="formData.additional_data"
                          label="ຂໍ້ມູນເພີ່ມເຕີມ (JSON)"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-code-json"
                          placeholder='{"min_amount": 1000, "max_amount": 1000000, "interest_rate": 2.5}'
                          rows="3"
                          hint="ຂໍ້ມູນເພີ່ມເຕີມໃນຮູບແບບ JSON (ບໍ່ບັງຄັບ)"
                          persistent-hint
                          hide-details="auto"
                        ></v-textarea>
                      </v-col>
                    </v-row>

                    <!-- Notes -->
                    <v-row dense class="mt-2">
                      <v-col cols="12">
                        <v-textarea
                          v-model="formData.notes"
                          label="ໝາຍເຫດ"
                          variant="outlined"
                          density="comfortable"
                          prepend-inner-icon="mdi-note-text"
                          placeholder="ໝາຍເຫດເພີ່ມເຕີມ..."
                          rows="2"
                          counter="1000"
                          hide-details="auto"
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>

          <!-- Code Format Validation Warning -->
          <v-row dense class="mt-2" v-if="formatValidationMessage">
            <v-col cols="12">
              <v-alert
                :type="formatValidationMessage.type"
                variant="tonal"
                density="compact"
              >
                {{ formatValidationMessage.text }}
              </v-alert>
            </v-col>
          </v-row>

          <!-- Preview Section -->
          <v-row dense class="mt-4" v-if="formData.master_code">
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
                class="preview-alert"
              >
                <template #title>
                  <v-icon class="mr-2">mdi-eye</v-icon>
                  ຕົວຢ່າງ Master Code
                </template>
                <div class="preview-content">
                  <div class="d-flex align-center mb-2">
                    <v-icon 
                      :color="formData.color_code || 'primary'" 
                      class="mr-2"
                      :name="formData.icon_name"
                    >
                      {{ formData.icon_name || 'mdi-code-tags' }}
                    </v-icon>
                    <strong>{{ formData.master_code }}</strong>
                    <v-chip
                      :color="formData.is_active ? 'success' : 'error'"
                      size="small"
                      variant="flat"
                      class="ml-2"
                    >
                      {{ formData.is_active ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
                    </v-chip>
                    <v-chip
                      v-if="formData.is_default"
                      color="warning"
                      size="small"
                      variant="flat"
                      class="ml-1"
                    >
                      <v-icon size="x-small" class="mr-1">mdi-star</v-icon>
                      Default
                    </v-chip>
                  </div>
                  <div v-if="formData.description_la || formData.description_en" class="text-caption text-grey mb-2">
                    <div v-if="formData.description_la">LA: {{ formData.description_la }}</div>
                    <div v-if="formData.description_en">EN: {{ formData.description_en }}</div>
                  </div>
                  <div class="text-caption">
                    <span class="text-info">ລຳດັບ:</span> {{ formData.display_order || 'ອັດຕະໂນມັດ' }}
                    <span v-if="formData.category" class="ml-3">
                      <span class="text-info">ປະເພດ:</span> {{ formData.category }}
                    </span>
                    <span v-if="formData.level" class="ml-3">
                      <span class="text-info">ລະດັບ:</span> {{ formData.level }}
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
          color="success"
          variant="flat"
          @click="submitForm"
          :loading="loading"
          :disabled="!valid"
        >
          <v-icon start>{{ isEdit ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
          {{ isEdit ? 'ບັນທຶກການປ່ຽນແປງ' : 'ສ້າງ Master Code' }}
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
  masterType: {
    type: Object,
    required: true
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
const formatValidationMessage = ref(null)

// Form data
const formData = reactive({
  master_code: '',
  description_la: '',
  description_en: '',
  display_order: null,
  is_active: true,
  is_default: false,
  category: '',
  color_code: '',
  icon_name: '',
  level: null,
  additional_data: '',
  notes: ''
})

// Computed
const isEdit = computed(() => !!props.editItem)

const descriptionLabel = computed(() => {
  return props.masterType?.require_description 
    ? 'ຄຳອະທິບາຍ (ລາວ) *' 
    : 'ຄຳອະທິບາຍ (ລາວ)'
})

// Validation rules
const codeRules = computed(() => [
  v => !!v || 'ຈຳເປັນຕ້ອງໃສ່ Master Code',
  v => (v && v.length >= 2) || 'Master Code ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ',
  v => (v && v.length <= 50) || 'Master Code ຕ້ອງບໍ່ເກີນ 50 ຕົວອັກສອນ',
  v => /^[A-Z0-9][A-Z0-9_-]*$/.test(v) || 'Master Code ຕ້ອງເປັນຕົວອັກສອນໃຫຍ່, ເລກ, _, - ເທົ່ານັ້ນ'
])

const descriptionLaRules = computed(() => {
  const rules = [
    v => !v || v.length <= 200 || 'ຄຳອະທິບາຍຕ້ອງບໍ່ເກີນ 200 ຕົວອັກສອນ'
  ]
  
  if (props.masterType?.require_description) {
    rules.unshift(v => !!v || 'ຈຳເປັນຕ້ອງໃສ່ຄຳອະທິບາຍ')
  }
  
  return rules
})

const descriptionEnRules = [
  v => !v || v.length <= 200 || 'ຄຳອະທິບາຍຕ້ອງບໍ່ເກີນ 200 ຕົວອັກສອນ'
]

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
    master_code: '',
    description_la: '',
    description_en: '',
    display_order: null,
    is_active: true,
    is_default: false,
    category: '',
    color_code: '',
    icon_name: '',
    level: null,
    additional_data: '',
    notes: ''
  })
  
  formatValidationMessage.value = null
  
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

const populateForm = (item) => {
  Object.assign(formData, {
    master_code: item.master_code || '',
    description_la: item.description_la || '',
    description_en: item.description_en || '',
    display_order: item.display_order,
    is_active: item.is_active !== undefined ? item.is_active : true,
    is_default: item.is_default || false,
    category: item.category || '',
    color_code: item.color_code || '',
    icon_name: item.icon_name || '',
    level: item.level,
    additional_data: item.additional_data ? JSON.stringify(item.additional_data, null, 2) : '',
    notes: item.notes || ''
  })
}

const validateCodeFormat = () => {
  if (!formData.master_code || !props.masterType?.code_format_pattern) {
    formatValidationMessage.value = null
    return
  }
  
  try {
    const pattern = new RegExp(props.masterType.code_format_pattern)
    const isValid = pattern.test(formData.master_code)
    
    if (isValid) {
      formatValidationMessage.value = {
        type: 'success',
        text: 'Master Code ຕົງຕາມຮູບແບບທີ່ກຳນົດ'
      }
    } else {
      formatValidationMessage.value = {
        type: 'warning',
        text: `Master Code ບໍ່ຕົງຕາມຮູບແບບ: ${props.masterType.code_format_pattern}`
      }
    }
  } catch (error) {
    formatValidationMessage.value = {
      type: 'error',
      text: 'ຮູບແບບ RegEx ບໍ່ຖືກຕ້ອງ'
    }
  }
}

const generateCode = async () => {
  if (!props.masterType) return
  
  try {
    loading.value = true
    
    // Get existing codes count
    const response = await $axios.get('/api/master-codes/', {
      params: {
        master_type: props.masterType.id,
        ordering: '-id'
      },
      ...getAuthHeaders()
    })
    
    const existingCodes = response.data.results || response.data || []
    const nextNumber = existingCodes.length + 1
    
    // Generate code based on master type name
    const prefix = props.masterType.master_type_name
      .replace(/[^A-Z]/gi, '')
      .toUpperCase()
      .substring(0, 3)
    
    const generatedCode = `${prefix}${nextNumber.toString().padStart(3, '0')}`
    formData.master_code = generatedCode
    
    validateCodeFormat()
    
  } catch (error) {
    console.error('Error generating code:', error)
    $swal.fire({
      icon: 'warning',
      title: 'ແຈ້ງເຕືອນ',
      text: 'ບໍ່ສາມາດສ້າງລະຫັດອັດຕະໂນມັດໄດ້'
    })
  } finally {
    loading.value = false
  }
}

const getContrastColor = (hexColor) => {
  if (!hexColor) return 'black'
  
  // Remove # if present
  const color = hexColor.replace('#', '')
  
  // Calculate luminance
  const r = parseInt(color.substr(0, 2), 16)
  const g = parseInt(color.substr(2, 2), 16)
  const b = parseInt(color.substr(4, 2), 16)
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? 'black' : 'white'
}

const validateForm = async () => {
  if (!form.value) return false
  
  const { valid: isValid } = await form.value.validate()
  return isValid
}

const preparePayload = () => {
  const payload = {
    master_type: props.masterType.id,
    master_code: formData.master_code.trim().toUpperCase(),
    description_la: formData.description_la?.trim() || null,
    description_en: formData.description_en?.trim() || null,
    display_order: formData.display_order || null,
    is_active: formData.is_active,
    is_default: formData.is_default,
    category: formData.category?.trim() || null,
    color_code: formData.color_code?.trim() || null,
    icon_name: formData.icon_name?.trim() || null,
    level: formData.level || null,
    notes: formData.notes?.trim() || null
  }

  // Parse additional data if provided
  if (formData.additional_data?.trim()) {
    try {
      payload.additional_data = JSON.parse(formData.additional_data.trim())
    } catch (error) {
      throw new Error('ຂໍ້ມູນເພີ່ມເຕີມຕ້ອງຢູ່ໃນຮູບແບບ JSON ທີ່ຖືກຕ້ອງ')
    }
  } else {
    payload.additional_data = null
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
      // Update existing master code
      response = await $axios.put(`/api/master-codes/${props.editItem.id}/`, payload, getAuthHeaders())
      emit('updated', response.data)
    } else {
      // Create new master code
      response = await $axios.post('/api/master-codes/', payload, getAuthHeaders())
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
      } else if (error.response.data.master_code) {
        errorMessage = `Master Code: ${error.response.data.master_code.join(', ')}`
      } else if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors.join(', ')
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

// Watch for master code changes to validate format
watch(() => formData.master_code, () => {
  if (formData.master_code) {
    validateCodeFormat()
  } else {
    formatValidationMessage.value = null
  }
})

// Auto-generate display order
watch(() => formData.master_code, (newCode) => {
  if (newCode && !isEdit.value && !formData.display_order) {
    // Simple auto-generation (you can make this more sophisticated)
    formData.display_order = newCode.length * 10
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

:deep(.v-color-picker) {
  max-width: 300px;
}

@media (max-width: 768px) {
  :deep(.v-dialog) {
    margin: 16px;
  }
}
</style>