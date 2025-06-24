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
              @update:model-value="debouncedSearch"
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
              @click="navigateToCreate"
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

    <!-- Simple Create Master Type Dialog -->
    <v-dialog v-model="createDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-primary text-white">
          <v-icon color="white" class="mr-2">mdi-folder-plus</v-icon>
          {{ isEdit ? 'ແກ້ໄຂ' : 'ສ້າງ' }} Master Type
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="formData.master_type_name"
              label="ຊື່ Master Type *"
              :rules="[v => !!v || 'ຈຳເປັນ']"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            ></v-text-field>
            
            <v-textarea
              v-model="formData.description"
              label="ຄຳອະທິບາຍ"
              variant="outlined"
              density="comfortable"
              rows="3"
              class="mb-3"
            ></v-textarea>
            
            <v-switch
              v-model="formData.is_active"
              label="ເປີດໃຊ້ງານ"
              color="success"
            ></v-switch>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="closeDialog">ຍົກເລີກ</v-btn>
          <v-btn 
            color="primary" 
            @click="submitForm"
            :loading="submitLoading"
            :disabled="!valid"
          >
            {{ isEdit ? 'ບັນທຶກ' : 'ສ້າງ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// Props and Emits
const emit = defineEmits(['masterTypeSelected'])

// State
const loading = ref(false)
const submitLoading = ref(false)
const masterTypes = ref([])
const search = ref('')
const statusFilter = ref(null)
const expandedPanels = ref([])
const valid = ref(false)

// Dialog states
const createDialog = ref(false)
const editingMasterType = ref(null)

// Form data
const formData = reactive({
  master_type_name: '',
  description: '',
  is_active: true
})

// Status options
const statusOptions = [
  { title: 'ທັງໝົດ', value: null },
  { title: 'ເປີດໃຊ້', value: true },
  { title: 'ປິດໃຊ້', value: false }
]

// Computed
const isEdit = computed(() => !!editingMasterType.value)

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
const navigateToCreate = () => {
  navigateTo('/admin/master-text/create')
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('lo-LA')
}

const getStatusColor = (isActive) => {
  return isActive ? 'success' : 'error'
}

// Simple debounced search
let searchTimeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // Filtering is handled by computed property
  }, 300)
}

const loadMasterTypes = async () => {
  try {
    loading.value = true
    
    // Mock data for testing - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    masterTypes.value = [
      {
        id: 1,
        master_type_name: 'AccountType',
        description: 'Bank Account Types',
        is_active: true,
        codes_count: 3,
        master_codes: [
          {
            id: 1,
            master_code: 'SAV001',
            description_la: 'ບັນຊີເງິນຝາກປະຢັດ',
            description_en: 'Savings Account',
            is_active: true,
            created_at: '2024-01-01'
          },
          {
            id: 2,
            master_code: 'CUR001',
            description_la: 'ບັນຊີກະແສລາຍວັນ',
            description_en: 'Current Account',
            is_active: true,
            created_at: '2024-01-02'
          }
        ]
      }
    ]
    
  } catch (error) {
    console.error('Error loading master types:', error)
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingMasterType.value = null
  Object.assign(formData, {
    master_type_name: '',
    description: '',
    is_active: true
  })
  createDialog.value = true
}

const openEditDialog = (masterType) => {
  editingMasterType.value = masterType
  Object.assign(formData, {
    master_type_name: masterType.master_type_name,
    description: masterType.description || '',
    is_active: masterType.is_active
  })
  createDialog.value = true
}

const closeDialog = () => {
  createDialog.value = false
  editingMasterType.value = null
}

const submitForm = async () => {
  try {
    submitLoading.value = true
    
    // Mock API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEdit.value) {
      // Update existing
      const index = masterTypes.value.findIndex(t => t.id === editingMasterType.value.id)
      if (index !== -1) {
        masterTypes.value[index] = {
          ...masterTypes.value[index],
          ...formData
        }
      }
    } else {
      // Create new
      const newMasterType = {
        id: Date.now(),
        ...formData,
        codes_count: 0,
        master_codes: []
      }
      masterTypes.value.unshift(newMasterType)
    }
    
    closeDialog()
    
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    submitLoading.value = false
  }
}

const openCreateCodeDialog = (masterType) => {
  // Mock implementation
  console.log('Open create code dialog for:', masterType.master_type_name)
}

const openEditCodeDialog = (code, masterType) => {
  // Mock implementation
  console.log('Edit code:', code.master_code, 'for:', masterType.master_type_name)
}

const deleteMasterType = async (masterType) => {
  // Mock implementation
  console.log('Delete master type:', masterType.master_type_name)
}

const deleteMasterCode = async (code, masterType) => {
  // Mock implementation
  console.log('Delete master code:', code.master_code)
}

const toggleCodeStatus = async (code, masterType) => {
  // Mock implementation
  code.is_active = !code.is_active
  console.log('Toggle code status:', code.master_code, 'to:', code.is_active)
}

const exportData = () => {
  console.log('Export data')
}

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