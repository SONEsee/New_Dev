<template>
  <div class="master-text-list">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <v-icon color="primary" size="28" class="mr-2">mdi-format-list-text</v-icon>
        ການຈັດການ Master Type ແລະ Master Code
      </h1>
      <p class="page-subtitle">ຈັດການປະເພດຫຼັກ ແລະ ລະຫັດຍ່ອຍ</p>
    </div>

    <!-- Action Bar -->
    <v-card class="action-bar mb-4" elevation="1">
      <v-card-text class="pa-3">
        <v-row dense align="center">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              label="ຄົ້ນຫາ"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              placeholder="ຊື່ Master Type..."
              @update:model-value="searchDebounced"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="ສະຖານະ"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="loadMasterTypes"
            ></v-select>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="primary"
              variant="flat"
              @click="$router.push('/admin/master-text/create')"
              prepend-icon="mdi-plus"
              size="small"
            >
              ເພີ່ມ Master Data
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="secondary"
              variant="outlined"
              @click="openCreateDialog"
              prepend-icon="mdi-folder-plus"
              size="small"
            >
              Master Type ເທົ່ານັ້ນ
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn
              color="success"
              variant="text"
              @click="exportData"
              :disabled="masterTypes.length === 0"
              size="small"
            >
              <v-icon size="small">mdi-download</v-icon>
              ສົ່ງອອກ
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="loadMasterTypes"
              :loading="loading"
              size="small"
            >
              <v-icon size="small">mdi-refresh</v-icon>
              ໂຫຼດໃໝ່
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Master Types List with Expandable Master Codes -->
    <v-card elevation="1">
      <v-card-title class="pa-3">
        <span>Master Types ({{ masterTypes.length }})</span>
      </v-card-title>
      
      <v-expansion-panels v-model="expandedPanels" multiple variant="accordion" class="master-panels">
        <v-expansion-panel
          v-for="masterType in filteredMasterTypes"
          :key="masterType.id"
          :value="masterType.id"
        >
          <!-- Master Type Header -->
          <v-expansion-panel-title class="master-type-header">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon :color="getStatusColor(masterType.is_active)" class="mr-3">
                  {{ masterType.is_active ? 'mdi-folder' : 'mdi-folder-outline' }}
                </v-icon>
                <div>
                  <div class="master-type-name">{{ masterType.master_type_name }}</div>
                  <div class="master-type-desc text-caption text-grey">
                    {{ masterType.description || 'ບໍ່ມີຄຳອະທິບາຍ' }}
                  </div>
                </div>
              </div>
              
              <div class="d-flex align-center" @click.stop>
                <v-chip
                  :color="getStatusColor(masterType.is_active)"
                  size="small"
                  variant="flat"
                  class="mr-2"
                >
                  {{ masterType.is_active ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
                </v-chip>
                
                <v-chip
                  color="info"
                  size="small"
                  variant="outlined"
                  class="mr-2"
                >
                  {{ masterType.codes_count || 0 }} ລະຫັດ
                </v-chip>

                <!-- Master Type Actions -->
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openCreateCodeDialog(masterType)"
                  title="ເພີ່ມ Master Code"
                >
                  <v-icon size="small">mdi-plus</v-icon>
                </v-btn>
                
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="info"
                  @click="openEditDialog(masterType)"
                  title="ແກ້ໄຂ Master Type"
                >
                  <v-icon size="small">mdi-pencil</v-icon>
                </v-btn>
                
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteMasterType(masterType)"
                  title="ລຶບ Master Type"
                  :disabled="masterType.codes_count > 0"
                >
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </v-expansion-panel-title>

          <!-- Master Codes Content -->
          <v-expansion-panel-text>
            <div class="master-codes-section">
              <!-- Add Master Code Button -->
              <div class="mb-3">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="openCreateCodeDialog(masterType)"
                  prepend-icon="mdi-plus"
                >
                  ເພີ່ມ Master Code ໃຫມ່
                </v-btn>
              </div>

              <!-- Master Codes List -->
              <div v-if="masterType.master_codes && masterType.master_codes.length > 0">
                <v-card
                  v-for="code in masterType.master_codes"
                  :key="code.id"
                  class="master-code-card mb-2"
                  variant="outlined"
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon 
                          :color="getStatusColor(code.is_active)" 
                          class="mr-3"
                          size="small"
                        >
                          mdi-code-tags
                        </v-icon>
                        <div>
                          <div class="master-code-name font-weight-medium">
                            {{ code.master_code }}
                          </div>
                          <div class="master-code-desc text-caption text-grey">
                            LA: {{ code.description_la || '-' }} | 
                            EN: {{ code.description_en || '-' }}
                          </div>
                          <div v-if="code.additional_data" class="text-caption text-info mt-1">
                            ຂໍ້ມູນເພີ່ມເຕີມ: {{ JSON.stringify(code.additional_data) }}
                          </div>
                        </div>
                      </div>
                      
                      <div class="d-flex align-center">
                        <v-chip
                          :color="getStatusColor(code.is_active)"
                          size="x-small"
                          variant="flat"
                          class="mr-2"
                        >
                          {{ code.is_active ? 'ເປີດ' : 'ປິດ' }}
                        </v-chip>
                        
                        <div class="text-caption text-grey mr-3">
                          {{ formatDate(code.created_at) }}
                        </div>
                        
                        <!-- Master Code Actions -->
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          color="info"
                          @click="openEditCodeDialog(code, masterType)"
                          title="ແກ້ໄຂ Master Code"
                        >
                          <v-icon size="small">mdi-pencil</v-icon>
                        </v-btn>
                        
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          :color="code.is_active ? 'warning' : 'success'"
                          @click="toggleCodeStatus(code, masterType)"
                          :title="code.is_active ? 'ປິດໃຊ້' : 'ເປີດໃຊ້'"
                        >
                          <v-icon size="small">
                            {{ code.is_active ? 'mdi-eye-off' : 'mdi-eye' }}
                          </v-icon>
                        </v-btn>
                        
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          color="error"
                          @click="deleteMasterCode(code, masterType)"
                          title="ລຶບ Master Code"
                        >
                          <v-icon size="small">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
              
              <!-- Empty State for Master Codes -->
              <div v-else class="empty-state text-center py-4">
                <v-icon size="48" color="grey-lighten-1">mdi-code-tags-check</v-icon>
                <div class="text-h6 text-grey mt-2">ບໍ່ມີ Master Code</div>
                <div class="text-body-2 text-grey">ເພີ່ມ Master Code ໃຫມ່ສຳລັບ {{ masterType.master_type_name }}</div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Empty State for Master Types -->
      <div v-if="masterTypes.length === 0 && !loading" class="empty-state text-center pa-8">
        <v-icon size="64" color="grey-lighten-1">mdi-folder-plus</v-icon>
        <div class="text-h5 text-grey mt-4">ບໍ່ມີ Master Type</div>
        <div class="text-body-1 text-grey mb-4">ເລີ່ມຕົ້ນໂດຍການສ້າງ Master Type ໃຫມ່</div>
        <v-btn
          color="primary"
          variant="flat"
          @click="openCreateDialog"
          prepend-icon="mdi-plus"
        >
          ສ້າງ Master Type ແຮກ
        </v-btn>
      </div>
    </v-card>

    <!-- Create/Edit Master Type Dialog -->
    <MasterTextCreateComponent
      v-model="createDialog"
      :edit-item="editingMasterType"
      @created="onMasterTypeCreated"
      @updated="onMasterTypeUpdated"
    />

    <!-- Create/Edit Master Code Dialog -->
    <MasterCodeCreateComponent
      v-model="createCodeDialog"
      :master-type="selectedMasterType"
      :edit-item="editingMasterCode"
      @created="onMasterCodeCreated"
      @updated="onMasterCodeUpdated"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { debounce } from 'lodash'

// Props and Emits
const emit = defineEmits(['masterTypeSelected'])

// State
const loading = ref(false)
const masterTypes = ref([])
const search = ref('')
const statusFilter = ref(null)
const expandedPanels = ref([])

// Dialog states
const createDialog = ref(false)
const createCodeDialog = ref(false)
const editingMasterType = ref(null)
const editingMasterCode = ref(null)
const selectedMasterType = ref(null)

// Status options
const statusOptions = [
  { title: 'ທັງໝົດ', value: null },
  { title: 'ເປີດໃຊ້', value: true },
  { title: 'ປິດໃຊ້', value: false }
]

// API configuration
const { $axios } = useNuxtApp()
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Computed
const filteredMasterTypes = computed(() => {
  let filtered = masterTypes.value

  if (search.value) {
    filtered = filtered.filter(type => 
      type.master_type_name.toLowerCase().includes(search.value.toLowerCase()) ||
      (type.description && type.description.toLowerCase().includes(search.value.toLowerCase()))
    )
  }

  if (statusFilter.value !== null) {
    filtered = filtered.filter(type => type.is_active === statusFilter.value)
  }

  return filtered
})

// Methods
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('lo-LA')
}

const getStatusColor = (isActive) => {
  return isActive ? 'success' : 'error'
}

const loadMasterTypes = async () => {
  try {
    loading.value = true
    const response = await $axios.get('/api/master-types/', {
      params: {
        include_codes: true,
        ordering: 'master_type_name'
      },
      ...getAuthHeaders()
    })
    
    masterTypes.value = response.data.results || response.data || []
    
    // Count codes for each master type
    masterTypes.value.forEach(type => {
      type.codes_count = type.master_codes ? type.master_codes.length : 0
    })
    
  } catch (error) {
    console.error('Error loading master types:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນ Master Type ໄດ້'
    })
  } finally {
    loading.value = false
  }
}

const loadMasterCodes = async (masterTypeId) => {
  try {
    const response = await $axios.get(`/api/master-codes/`, {
      params: {
        master_type: masterTypeId,
        ordering: 'master_code'
      },
      ...getAuthHeaders()
    })
    
    const masterType = masterTypes.value.find(t => t.id === masterTypeId)
    if (masterType) {
      masterType.master_codes = response.data.results || response.data || []
      masterType.codes_count = masterType.master_codes.length
    }
    
  } catch (error) {
    console.error('Error loading master codes:', error)
  }
}

// Dialog methods
const openCreateDialog = () => {
  editingMasterType.value = null
  createDialog.value = true
}

const openEditDialog = (masterType) => {
  editingMasterType.value = { ...masterType }
  createDialog.value = true
}

const openCreateCodeDialog = (masterType) => {
  selectedMasterType.value = masterType
  editingMasterCode.value = null
  createCodeDialog.value = true
}

const openEditCodeDialog = (code, masterType) => {
  selectedMasterType.value = masterType
  editingMasterCode.value = { ...code }
  createCodeDialog.value = true
}

// Event handlers
const onMasterTypeCreated = (newMasterType) => {
  masterTypes.value.unshift(newMasterType)
  createDialog.value = false
  
  $swal.fire({
    icon: 'success',
    title: 'ສຳເລັດ',
    text: 'ສ້າງ Master Type ສຳເລັດແລ້ວ',
    timer: 2000,
    showConfirmButton: false
  })
}

const onMasterTypeUpdated = (updatedMasterType) => {
  const index = masterTypes.value.findIndex(t => t.id === updatedMasterType.id)
  if (index !== -1) {
    masterTypes.value[index] = updatedMasterType
  }
  createDialog.value = false
  
  $swal.fire({
    icon: 'success',
    title: 'ສຳເລັດ',
    text: 'ອັບເດດ Master Type ສຳເລັດແລ້ວ',
    timer: 2000,
    showConfirmButton: false
  })
}

const onMasterCodeCreated = (newMasterCode) => {
  const masterType = masterTypes.value.find(t => t.id === selectedMasterType.value.id)
  if (masterType) {
    if (!masterType.master_codes) {
      masterType.master_codes = []
    }
    masterType.master_codes.unshift(newMasterCode)
    masterType.codes_count = masterType.master_codes.length
  }
  createCodeDialog.value = false
  
  $swal.fire({
    icon: 'success',
    title: 'ສຳເລັດ',
    text: 'ສ້າງ Master Code ສຳເລັດແລ້ວ',
    timer: 2000,
    showConfirmButton: false
  })
}

const onMasterCodeUpdated = (updatedMasterCode) => {
  const masterType = masterTypes.value.find(t => t.id === selectedMasterType.value.id)
  if (masterType && masterType.master_codes) {
    const index = masterType.master_codes.findIndex(c => c.id === updatedMasterCode.id)
    if (index !== -1) {
      masterType.master_codes[index] = updatedMasterCode
    }
  }
  createCodeDialog.value = false
  
  $swal.fire({
    icon: 'success',
    title: 'ສຳເລັດ',
    text: 'ອັບເດດ Master Code ສຳເລັດແລ້ວ',
    timer: 2000,
    showConfirmButton: false
  })
}

// Delete methods
const deleteMasterType = async (masterType) => {
  const result = await $swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການລຶບ',
    text: `ທ່ານຕ້ອງການລຶບ Master Type "${masterType.master_type_name}" ແທ້ບໍ?`,
    showCancelButton: true,
    confirmButtonText: 'ລຶບ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#f44336'
  })
  
  if (result.isConfirmed) {
    try {
      await $axios.delete(`/api/master-types/${masterType.id}/`, getAuthHeaders())
      
      const index = masterTypes.value.findIndex(t => t.id === masterType.id)
      if (index !== -1) {
        masterTypes.value.splice(index, 1)
      }
      
      $swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ລຶບ Master Type ສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
    } catch (error) {
      console.error('Error deleting master type:', error)
      $swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດລຶບ Master Type ໄດ້'
      })
    }
  }
}

const deleteMasterCode = async (code, masterType) => {
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
      
      const codeIndex = masterType.master_codes.findIndex(c => c.id === code.id)
      if (codeIndex !== -1) {
        masterType.master_codes.splice(codeIndex, 1)
        masterType.codes_count = masterType.master_codes.length
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

const toggleCodeStatus = async (code, masterType) => {
  try {
    const response = await $axios.patch(`/api/master-codes/${code.id}/`, {
      is_active: !code.is_active
    }, getAuthHeaders())
    
    // Update the code in the list
    const codeIndex = masterType.master_codes.findIndex(c => c.id === code.id)
    if (codeIndex !== -1) {
      masterType.master_codes[codeIndex] = response.data
    }
    
    $swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      text: `${code.is_active ? 'ປິດ' : 'ເປີດ'}ໃຊ້ Master Code ສຳເລັດແລ້ວ`,
      timer: 2000,
      showConfirmButton: false
    })
    
  } catch (error) {
    console.error('Error toggling code status:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້'
    })
  }
}

const exportData = () => {
  $swal.fire({
    icon: 'info',
    title: 'ກຳລັງພັດທະນາ',
    text: 'ຟັງຊັນສົ່ງອອກຂໍ້ມູນກຳລັງພັດທະນາ'
  })
}

// Search with debounce
const searchDebounced = debounce(() => {
  // Filtering is handled by computed property
}, 300)

// Lifecycle
onMounted(() => {
  loadMasterTypes()
})
</script>

<style scoped>
.master-text-list {
  padding: 16px;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.action-bar {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.master-panels {
  border: none;
}

.master-type-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-bottom: 1px solid #e0e0e0;
}

.master-type-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1976d2;
}

.master-type-desc {
  margin-top: 2px;
}

.master-codes-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.master-code-card {
  transition: all 0.2s ease;
  background: white;
}

.master-code-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.master-code-name {
  font-size: 0.9rem;
  color: #1976d2;
}

.master-code-desc {
  margin-top: 2px;
  line-height: 1.3;
}

.empty-state {
  color: #666;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 16px 16px 16px;
}

:deep(.v-expansion-panel-title) {
  padding: 16px 20px;
}

:deep(.v-expansion-panel) {
  margin-bottom: 8px;
  border-radius: 8px !important;
  overflow: hidden;
}

:deep(.v-expansion-panel::before) {
  box-shadow: none;
}

@media (max-width: 768px) {
  .master-text-list {
    padding: 12px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .master-type-name {
    font-size: 0.9rem;
  }
  
  .master-code-name {
    font-size: 0.8rem;
  }
}
</style>