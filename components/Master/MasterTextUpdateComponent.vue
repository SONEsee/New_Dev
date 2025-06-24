<template>
  <v-dialog v-model="dialog" max-width="800px" persistent scrollable>
    <v-card class="elevation-12">
      <!-- Header -->
      <v-card-title class="pa-4 bg-warning text-white">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon color="white" class="mr-2">mdi-pencil-circle</v-icon>
            <div>
              <div class="text-h6">ແກ້ໄຂ Master Type ແລະ Master Codes</div>
              <div v-if="masterType" class="text-caption">
                {{ masterType.master_type_name }}
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

      <v-card-text class="pa-0">
        <v-tabs v-model="activeTab" color="primary" class="tabs-header">
          <v-tab value="master-type">
            <v-icon class="mr-2">mdi-folder-edit</v-icon>
            Master Type
          </v-tab>
          <v-tab value="master-codes">
            <v-icon class="mr-2">mdi-code-tags</v-icon>
            Master Codes ({{ masterCodes.length }})
          </v-tab>
          <v-tab value="bulk-operations">
            <v-icon class="mr-2">mdi-cog-transfer</v-icon>
            ການດຳເນີນງານຫຼາຍ
          </v-tab>
        </v-tabs>

        <v-tabs-window v-model="activeTab">
          <!-- Master Type Tab -->
          <v-tabs-window-item value="master-type" class="pa-4">
            <v-form ref="masterTypeForm" v-model="masterTypeValid">
              <v-row dense>
                <!-- Master Type Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="masterTypeData.master_type_name"
                    label="ຊື່ Master Type *"
                    :rules="nameRules"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-format-title"
                    counter="100"
                    hide-details="auto"
                    :loading="loading.masterType"
                  ></v-text-field>
                </v-col>

                <!-- Display Order -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="masterTypeData.display_order"
                    label="ລຳດັບການສະແດງ"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-sort-numeric-ascending"
                    min="1"
                    hide-details="auto"
                    :loading="loading.masterType"
                  ></v-text-field>
                </v-col>

                <!-- Description -->
                <v-col cols="12">
                  <v-textarea
                    v-model="masterTypeData.description"
                    label="ຄຳອະທິບາຍ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-text"
                    rows="3"
                    counter="500"
                    hide-details="auto"
                    :loading="loading.masterType"
                  ></v-textarea>
                </v-col>

                <!-- Switches -->
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="masterTypeData.is_active"
                    label="ເປີດໃຊ້ງານ"
                    color="success"
                    density="comfortable"
                    hide-details
                  ></v-switch>
                </v-col>

                <v-col cols="12" md="4">
                  <v-switch
                    v-model="masterTypeData.allow_duplicate_codes"
                    label="ອະນຸຍາດລະຫັດຊ້ຳ"
                    color="warning"
                    density="comfortable"
                    hide-details
                  ></v-switch>
                </v-col>

                <v-col cols="12" md="4">
                  <v-switch
                    v-model="masterTypeData.require_description"
                    label="ບັງຄັບຄຳອະທິບາຍ"
                    color="info"
                    density="comfortable"
                    hide-details
                  ></v-switch>
                </v-col>

                <!-- Code Format Pattern -->
                <v-col cols="12">
                  <v-text-field
                    v-model="masterTypeData.code_format_pattern"
                    label="ຮູບແບບລະຫັດ (RegEx)"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-regex"
                    placeholder="^[A-Z]{2,4}[0-9]{2,4}$"
                    hint="ກຳນົດຮູບແບບສຳລັບ Master Code"
                    persistent-hint
                    hide-details="auto"
                    :loading="loading.masterType"
                  ></v-text-field>
                </v-col>

                <!-- Action Buttons -->
                <v-col cols="12" class="pt-4">
                  <v-btn
                    color="primary"
                    variant="flat"
                    @click="updateMasterType"
                    :loading="loading.masterType"
                    :disabled="!masterTypeValid"
                  >
                    <v-icon start>mdi-content-save</v-icon>
                    ບັນທຶກ Master Type
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-tabs-window-item>

          <!-- Master Codes Tab -->
          <v-tabs-window-item value="master-codes" class="pa-4">
            <!-- Search and Filter -->
            <v-row dense class="mb-3">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="codeSearch"
                  label="ຄົ້ນຫາ Master Code"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="codeStatusFilter"
                  :items="statusOptions"
                  label="ສະຖານະ"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-btn
                  color="primary"
                  variant="flat"
                  @click="openCreateCodeDialog"
                  prepend-icon="mdi-plus"
                  size="small"
                  block
                >
                  ເພີ່ມ Master Code
                </v-btn>
              </v-col>
            </v-row>

            <!-- Master Codes List -->
            <v-data-table
              :headers="codeHeaders"
              :items="filteredMasterCodes"
              :loading="loading.codes"
              density="compact"
              class="elevation-1"
              item-value="id"
              :items-per-page="10"
            >
              <!-- Master Code -->
              <template v-slot:item.master_code="{ item }">
                <div class="d-flex align-center">
                  <v-icon 
                    :color="item.color_code || 'primary'" 
                    class="mr-2"
                    size="small"
                  >
                    {{ item.icon_name || 'mdi-code-tags' }}
                  </v-icon>
                  <strong>{{ item.master_code }}</strong>
                </div>
              </template>

              <!-- Descriptions -->
              <template v-slot:item.descriptions="{ item }">
                <div>
                  <div v-if="item.description_la" class="text-body-2">
                    LA: {{ item.description_la }}
                  </div>
                  <div v-if="item.description_en" class="text-caption text-grey">
                    EN: {{ item.description_en }}
                  </div>
                </div>
              </template>

              <!-- Status -->
              <template v-slot:item.is_active="{ item }">
                <v-switch
                  :model-value="item.is_active"
                  color="success"
                  density="compact"
                  hide-details
                  @update:model-value="toggleCodeStatus(item, $event)"
                  :loading="item._loading"
                ></v-switch>
              </template>

              <!-- Default -->
              <template v-slot:item.is_default="{ item }">
                <v-switch
                  :model-value="item.is_default"
                  color="warning"
                  density="compact"
                  hide-details
                  @update:model-value="toggleCodeDefault(item, $event)"
                  :loading="item._loading"
                ></v-switch>
              </template>

              <!-- Actions -->
              <template v-slot:item.actions="{ item }">
                <div class="d-flex">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="primary"
                    @click="editMasterCode(item)"
                    title="ແກ້ໄຂ"
                  >
                    <v-icon size="small">mdi-pencil</v-icon>
                  </v-btn>
                  
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="info"
                    @click="duplicateMasterCode(item)"
                    title="ຄັດລອກ"
                  >
                    <v-icon size="small">mdi-content-duplicate</v-icon>
                  </v-btn>
                  
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteMasterCode(item)"
                    title="ລຶບ"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-tabs-window-item>

          <!-- Bulk Operations Tab -->
          <v-tabs-window-item value="bulk-operations" class="pa-4">
            <v-row dense>
              <!-- Bulk Actions -->
              <v-col cols="12">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6">ການດຳເນີນງານຫຼາຍລາຍການ</v-card-title>
                  <v-card-text>
                    <v-row dense>
                      <v-col cols="12" md="4">
                        <v-btn
                          color="success"
                          variant="flat"
                          @click="bulkActivateAll"
                          :loading="loading.bulk"
                          block
                        >
                          <v-icon start>mdi-check-all</v-icon>
                          ເປີດໃຊ້ທັງໝົດ
                        </v-btn>
                      </v-col>
                      
                      <v-col cols="12" md="4">
                        <v-btn
                          color="warning"
                          variant="flat"
                          @click="bulkDeactivateAll"
                          :loading="loading.bulk"
                          block
                        >
                          <v-icon start>mdi-close-all</v-icon>
                          ປິດໃຊ້ທັງໝົດ
                        </v-btn>
                      </v-col>
                      
                      <v-col cols="12" md="4">
                        <v-btn
                          color="info"
                          variant="flat"
                          @click="reorderCodes"
                          :loading="loading.bulk"
                          block
                        >
                          <v-icon start>mdi-sort-alphabetical-ascending</v-icon>
                          ຈັດລຳດັບໃໝ່
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Import/Export -->
              <v-col cols="12">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-h6">ນຳເຂົ້າ/ສົ່ງອອກ</v-card-title>
                  <v-card-text>
                    <v-row dense>
                      <v-col cols="12" md="6">
                        <v-file-input
                          v-model="importFile"
                          label="ນຳເຂົ້າ Master Codes"
                          accept=".json,.csv,.xlsx"
                          variant="outlined"
                          density="comfortable"
                          prepend-icon="mdi-upload"
                          hide-details="auto"
                        ></v-file-input>
                        <v-btn
                          color="primary"
                          variant="flat"
                          @click="importCodes"
                          :loading="loading.import"
                          :disabled="!importFile"
                          class="mt-2"
                          size="small"
                        >
                          <v-icon start>mdi-import</v-icon>
                          ນຳເຂົ້າ
                        </v-btn>
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="exportFormat"
                          :items="exportFormats"
                          label="ຮູບແບບການສົ່ງອອກ"
                          variant="outlined"
                          density="comfortable"
                          hide-details
                        ></v-select>
                        <v-btn
                          color="success"
                          variant="flat"
                          @click="exportCodes"
                          :loading="loading.export"
                          class="mt-2"
                          size="small"
                        >
                          <v-icon start>mdi-export</v-icon>
                          ສົ່ງອອກ
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Statistics -->
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-h6">ສະຖິຕິ</v-card-title>
                  <v-card-text>
                    <v-row dense>
                      <v-col cols="6" md="3">
                        <v-card class="text-center pa-3" color="primary" variant="tonal">
                          <div class="text-h4">{{ masterCodes.length }}</div>
                          <div class="text-caption">ລວມທັງໝົດ</div>
                        </v-card>
                      </v-col>
                      
                      <v-col cols="6" md="3">
                        <v-card class="text-center pa-3" color="success" variant="tonal">
                          <div class="text-h4">{{ activeCodes }}</div>
                          <div class="text-caption">ເປີດໃຊ້</div>
                        </v-card>
                      </v-col>
                      
                      <v-col cols="6" md="3">
                        <v-card class="text-center pa-3" color="error" variant="tonal">
                          <div class="text-h4">{{ inactiveCodes }}</div>
                          <div class="text-caption">ປິດໃຊ້</div>
                        </v-card>
                      </v-col>
                      
                      <v-col cols="6" md="3">
                        <v-card class="text-center pa-3" color="warning" variant="tonal">
                          <div class="text-h4">{{ defaultCodes }}</div>
                          <div class="text-caption">ຄ່າເລີ່ມຕົ້ນ</div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <!-- Actions -->
      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="outlined"
          @click="closeDialog"
          :disabled="loading.masterType || loading.codes"
        >
          ປິດ
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="saveAllChanges"
          :loading="loading.masterType || loading.codes"
        >
          <v-icon start>mdi-content-save-all</v-icon>
          ບັນທຶກທັງໝົດ
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Master Code Create/Edit Dialog -->
    <MasterCodeCreateComponent
      v-model="codeDialog"
      :master-type="masterType"
      :edit-item="editingCode"
      @created="onCodeCreated"
      @updated="onCodeUpdated"
    />
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  masterType: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'updated', 'codesUpdated'])

// State
const dialog = ref(false)
const activeTab = ref('master-type')
const masterTypeValid = ref(false)
const masterTypeForm = ref(null)
const codeDialog = ref(false)
const editingCode = ref(null)

// Search and filter
const codeSearch = ref('')
const codeStatusFilter = ref(null)

// Bulk operations
const importFile = ref(null)
const exportFormat = ref('json')

// Loading states
const loading = reactive({
  masterType: false,
  codes: false,
  bulk: false,
  import: false,
  export: false
})

// Data
const masterTypeData = reactive({
  master_type_name: '',
  description: '',
  display_order: null,
  is_active: true,
  allow_duplicate_codes: false,
  require_description: false,
  code_format_pattern: ''
})

const masterCodes = ref([])

// Options
const statusOptions = [
  { title: 'ທັງໝົດ', value: null },
  { title: 'ເປີດໃຊ້', value: true },
  { title: 'ປິດໃຊ້', value: false }
]

const exportFormats = [
  { title: 'JSON', value: 'json' },
  { title: 'CSV', value: 'csv' },
  { title: 'Excel', value: 'xlsx' }
]

// Table headers
const codeHeaders = [
  { title: 'Master Code', key: 'master_code', sortable: true },
  { title: 'ຄຳອະທິບາຍ', key: 'descriptions', sortable: false },
  { title: 'ລຳດັບ', key: 'display_order', sortable: true, align: 'center' },
  { title: 'ເປີດໃຊ້', key: 'is_active', sortable: true, align: 'center' },
  { title: 'ຄ່າເລີ່ມຕົ້ນ', key: 'is_default', sortable: true, align: 'center' },
  { title: 'ການກະທຳ', key: 'actions', sortable: false, align: 'center' }
]

// Validation rules
const nameRules = [
  v => !!v || 'ຈຳເປັນຕ້ອງໃສ່ຊື່ Master Type',
  v => (v && v.length >= 2) || 'ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ',
  v => (v && v.length <= 100) || 'ຊື່ຕ້ອງບໍ່ເກີນ 100 ຕົວອັກສອນ'
]

// API configuration
const { $axios } = useNuxtApp()
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Computed
const filteredMasterCodes = computed(() => {
  let filtered = masterCodes.value

  if (codeSearch.value) {
    filtered = filtered.filter(code => 
      code.master_code.toLowerCase().includes(codeSearch.value.toLowerCase()) ||
      (code.description_la && code.description_la.toLowerCase().includes(codeSearch.value.toLowerCase())) ||
      (code.description_en && code.description_en.toLowerCase().includes(codeSearch.value.toLowerCase()))
    )
  }

  if (codeStatusFilter.value !== null) {
    filtered = filtered.filter(code => code.is_active === codeStatusFilter.value)
  }

  return filtered
})

const activeCodes = computed(() => masterCodes.value.filter(code => code.is_active).length)
const inactiveCodes = computed(() => masterCodes.value.filter(code => !code.is_active).length)
const defaultCodes = computed(() => masterCodes.value.filter(code => code.is_default).length)

// Watch for dialog changes
watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
  if (newVal && props.masterType) {
    loadData()
  }
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
})

// Methods
const loadData = () => {
  loadMasterTypeData()
  loadMasterCodes()
}

const loadMasterTypeData = () => {
  if (props.masterType) {
    Object.assign(masterTypeData, {
      master_type_name: props.masterType.master_type_name || '',
      description: props.masterType.description || '',
      display_order: props.masterType.display_order,
      is_active: props.masterType.is_active !== undefined ? props.masterType.is_active : true,
      allow_duplicate_codes: props.masterType.allow_duplicate_codes || false,
      require_description: props.masterType.require_description || false,
      code_format_pattern: props.masterType.code_format_pattern || ''
    })
  }
}

const loadMasterCodes = async () => {
  try {
    loading.codes = true
    const response = await $axios.get('/api/master-codes/', {
      params: {
        master_type: props.masterType.id,
        ordering: 'display_order,master_code'
      },
      ...getAuthHeaders()
    })
    
    masterCodes.value = response.data.results || response.data || []
    
  } catch (error) {
    console.error('Error loading master codes:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດໂຫຼດ Master Codes ໄດ້'
    })
  } finally {
    loading.codes = false
  }
}

const updateMasterType = async () => {
  try {
    const isValid = await masterTypeForm.value?.validate()
    if (!isValid.valid) return

    loading.masterType = true

    const payload = {
      master_type_name: masterTypeData.master_type_name.trim(),
      description: masterTypeData.description?.trim() || null,
      display_order: masterTypeData.display_order || null,
      is_active: masterTypeData.is_active,
      allow_duplicate_codes: masterTypeData.allow_duplicate_codes,
      require_description: masterTypeData.require_description,
      code_format_pattern: masterTypeData.code_format_pattern?.trim() || null
    }

    const response = await $axios.put(`/api/master-types/${props.masterType.id}/`, payload, getAuthHeaders())
    
    emit('updated', response.data)
    
    $swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      text: 'ອັບເດດ Master Type ສຳເລັດແລ້ວ',
      timer: 2000,
      showConfirmButton: false
    })

  } catch (error) {
    console.error('Error updating master type:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດອັບເດດ Master Type ໄດ້'
    })
  } finally {
    loading.masterType = false
  }
}

// Master Code operations
const openCreateCodeDialog = () => {
  editingCode.value = null
  codeDialog.value = true
}

const editMasterCode = (code) => {
  editingCode.value = { ...code }
  codeDialog.value = true
}

const duplicateMasterCode = (code) => {
  const duplicated = {
    ...code,
    master_code: code.master_code + '_COPY',
    is_default: false
  }
  delete duplicated.id
  editingCode.value = duplicated
  codeDialog.value = true
}

const toggleCodeStatus = async (code, newStatus) => {
  try {
    code._loading = true
    
    const response = await $axios.patch(`/api/master-codes/${code.id}/`, {
      is_active: newStatus
    }, getAuthHeaders())
    
    // Update the code in the list
    const index = masterCodes.value.findIndex(c => c.id === code.id)
    if (index !== -1) {
      masterCodes.value[index] = response.data
    }
    
  } catch (error) {
    console.error('Error toggling code status:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້'
    })
  } finally {
    code._loading = false
  }
}

const toggleCodeDefault = async (code, newDefault) => {
  try {
    code._loading = true
    
    const response = await $axios.patch(`/api/master-codes/${code.id}/`, {
      is_default: newDefault
    }, getAuthHeaders())
    
    // Update the code in the list
    const index = masterCodes.value.findIndex(c => c.id === code.id)
    if (index !== -1) {
      masterCodes.value[index] = response.data
    }
    
    // If setting as default, remove default from others
    if (newDefault) {
      masterCodes.value.forEach(c => {
        if (c.id !== code.id && c.is_default) {
          c.is_default = false
        }
      })
    }
    
  } catch (error) {
    console.error('Error toggling code default:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດປ່ຽນຄ່າເລີ່ມຕົ້ນໄດ້'
    })
  } finally {
    code._loading = false
  }
}

const deleteMasterCode = async (code) => {
  const result = await $swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການລຶບ',
    text: `ທ່ານຕ້ອງການລຶບ Master Code "${code.master_code}" ແທ້ບໍ?`,
    showCancelButton: true,
    confirmButtonText: 'ລຶບ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#f44336'
  })
  
  if (result.isConfirmed) {
    try {
      await $axios.delete(`/api/master-codes/${code.id}/`, getAuthHeaders())
      
      const index = masterCodes.value.findIndex(c => c.id === code.id)
      if (index !== -1) {
        masterCodes.value.splice(index, 1)
      }
      
      $swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ລຶບ Master Code ສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
    } catch (error) {
      console.error('Error deleting master code:', error)
      $swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດລຶບ Master Code ໄດ້'
      })
    }
  }
}

// Bulk operations
const bulkActivateAll = async () => {
  const result = await $swal.fire({
    icon: 'question',
    title: 'ຢືນຢັນ',
    text: 'ເປີດໃຊ້ Master Code ທັງໝົດແທ້ບໍ?',
    showCancelButton: true,
    confirmButtonText: 'ເປີດໃຊ້ທັງໝົດ',
    cancelButtonText: 'ຍົກເລີກ'
  })
  
  if (result.isConfirmed) {
    try {
      loading.bulk = true
      
      const promises = masterCodes.value
        .filter(code => !code.is_active)
        .map(code => 
          $axios.patch(`/api/master-codes/${code.id}/`, {
            is_active: true
          }, getAuthHeaders())
        )
      
      await Promise.all(promises)
      await loadMasterCodes()
      
      $swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ເປີດໃຊ້ທັງໝົດສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
    } catch (error) {
      console.error('Error bulk activating:', error)
      $swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດເປີດໃຊ້ທັງໝົດໄດ້'
      })
    } finally {
      loading.bulk = false
    }
  }
}

const bulkDeactivateAll = async () => {
  const result = await $swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນ',
    text: 'ປິດໃຊ້ Master Code ທັງໝົດແທ້ບໍ?',
    showCancelButton: true,
    confirmButtonText: 'ປິດໃຊ້ທັງໝົດ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#ff9800'
  })
  
  if (result.isConfirmed) {
    try {
      loading.bulk = true
      
      const promises = masterCodes.value
        .filter(code => code.is_active)
        .map(code => 
          $axios.patch(`/api/master-codes/${code.id}/`, {
            is_active: false
          }, getAuthHeaders())
        )
      
      await Promise.all(promises)
      await loadMasterCodes()
      
      $swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ປິດໃຊ້ທັງໝົດສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
    } catch (error) {
      console.error('Error bulk deactivating:', error)
      $swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດປິດໃຊ້ທັງໝົດໄດ້'
      })
    } finally {
      loading.bulk = false
    }
  }
}

const reorderCodes = async () => {
  try {
    loading.bulk = true
    
    // Sort codes alphabetically and update display_order
    const sortedCodes = [...masterCodes.value].sort((a, b) => 
      a.master_code.localeCompare(b.master_code)
    )
    
    const promises = sortedCodes.map((code, index) => 
      $axios.patch(`/api/master-codes/${code.id}/`, {
        display_order: (index + 1) * 10
      }, getAuthHeaders())
    )
    
    await Promise.all(promises)
    await loadMasterCodes()
    
    $swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      text: 'ຈັດລຳດັບໃໝ່ສຳເລັດແລ້ວ',
      timer: 2000,
      showConfirmButton: false
    })
    
  } catch (error) {
    console.error('Error reordering codes:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດຈັດລຳດັບໃໝ່ໄດ້'
    })
  } finally {
    loading.bulk = false
  }
}

// Import/Export operations
const importCodes = () => {
  $swal.fire({
    icon: 'info',
    title: 'ກຳລັງພັດທະນາ',
    text: 'ຟັງຊັນນຳເຂົ້າກຳລັງພັດທະນາ'
  })
}

const exportCodes = () => {
  $swal.fire({
    icon: 'info',
    title: 'ກຳລັງພັດທະນາ',
    text: 'ຟັງຊັນສົ່ງອອກກຳລັງພັດທະນາ'
  })
}

// Event handlers
const onCodeCreated = (newCode) => {
  masterCodes.value.unshift(newCode)
  codeDialog.value = false
  emit('codesUpdated', masterCodes.value)
  
  $swal.fire({
    icon: 'success',
    title: 'ສຳເລັດ',
    text: 'ສ້າງ Master Code ສຳເລັດແລ້ວ',
    timer: 2000,
    showConfirmButton: false
  })
}

const onCodeUpdated = (updatedCode) => {
  const index = masterCodes.value.findIndex(c => c.id === updatedCode.id)
  if (index !== -1) {
    masterCodes.value[index] = updatedCode
  }
  codeDialog.value = false
  emit('codesUpdated', masterCodes.value)
  
  $swal.fire({
    icon: 'success',
    title: 'ສຳເລັດ',
    text: 'ອັບເດດ Master Code ສຳເລັດແລ້ວ',
    timer: 2000,
    showConfirmButton: false
  })
}

const saveAllChanges = async () => {
  await updateMasterType()
  // Additional save operations can be added here
}

const closeDialog = () => {
  dialog.value = false
  activeTab.value = 'master-type'
  codeSearch.value = ''
  codeStatusFilter.value = null
}
</script>

<style scoped>
.tabs-header {
  border-bottom: 1px solid #e0e0e0;
}

:deep(.v-tab) {
  text-transform: none;
  letter-spacing: normal;
}

:deep(.v-tabs-window-item) {
  background: #fafafa;
}

:deep(.v-data-table) {
  background: white;
  border-radius: 8px;
}

:deep(.v-data-table th) {
  background-color: #f5f5f5;
  font-weight: 600;
}

@media (max-width: 768px) {
  :deep(.v-dialog) {
    margin: 16px;
  }
  
  :deep(.v-tab) {
    min-width: auto;
    padding: 0 12px;
  }
}
</style>
                