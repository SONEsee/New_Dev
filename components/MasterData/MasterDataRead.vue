<template>
  <div class="master-data-create">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <v-icon color="primary" size="28" class="mr-2">mdi-database-plus</v-icon>
        ການຈັດການ Master Data
      </h1>
      <p class="page-subtitle">ສ້າງ ແລະ ຈັດການ Master Type ແລະ Master Code</p>
    </div>

    <!-- Action Bar -->
    <v-card class="action-bar mb-4" elevation="1">
      <v-card-text class="pa-3">
        <v-row dense align="center">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="search"
              label="ຄົ້ນຫາ Master Type"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              placeholder="ຊື່ Master Type..."
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
            ></v-select>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="primary"
              variant="flat"
              @click="openCreateMasterTypeDialog"
              prepend-icon="mdi-folder-plus"
              size="small"
            >
              ເພີ່ມ Master Type
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="secondary"
              variant="outlined"
              @click="openCreateMasterCodeDialog"
              prepend-icon="mdi-code-tags-check"
              size="small"
            >
              ເພີ່ມ Master Code
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
              @click="refreshData"
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

    <!-- Loading State -->
    <v-card v-if="loading" class="text-center pa-8" elevation="1">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
      <div class="text-h6 mt-4 text-grey">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
    </v-card>

    <!-- Error State -->
    <v-alert
      v-if="error && !loading"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="error = null"
    >
      <template #title>ຂໍ້ຜິດພາດ</template>
      {{ error }}
      <template #append>
        <v-btn
          color="error"
          variant="outlined"
          size="small"
          @click="refreshData"
        >
          ລອງໃໝ່
        </v-btn>
      </template>
    </v-alert>

    <!-- Master Types List with Tree Structure -->
    <v-card v-if="!loading && !error" elevation="1">
      <v-card-title class="pa-4 bg-grey-lighten-5">
        <div class="d-flex align-center justify-space-between">
          <span class="text-h6">Master Types ({{ filteredMasterTypes.length }})</span>
          <v-chip color="info" size="small" variant="outlined">
            ທັງໝົດ {{ totalMasterCodes }} Master Codes
          </v-chip>
        </div>
      </v-card-title>
      
      <v-expansion-panels 
        v-model="expandedPanels" 
        multiple 
        variant="accordion" 
        class="master-panels"
      >
        <v-expansion-panel
          v-for="masterType in filteredMasterTypes"
          :key="masterType.M_id"
          :value="masterType.M_id"
        >
          <!-- Master Type Header -->
          <v-expansion-panel-title class="master-type-header">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon 
                  :color="getStatusColor(masterType.Status)" 
                  class="mr-3"
                  size="large"
                >
                  {{ masterType.Status === 'T' ? 'mdi-folder' : 'mdi-folder-outline' }}
                </v-icon>
                <div>
                  <div class="master-type-name">
                    [{{ masterType.M_code }}] {{ masterType.M_name_en }}
                  </div>
                  <div class="master-type-desc text-caption text-grey">
                    LA: {{ masterType.M_name_la }} | {{ masterType.M_detail || 'ບໍ່ມີຄຳອະທິບາຍ' }}
                  </div>
                </div>
              </div>
              
              <div class="d-flex align-center" @click.stop>
                <v-chip
                  :color="getStatusColor(masterType.Status)"
                  size="small"
                  variant="flat"
                  class="mr-2"
                >
                  {{ masterType.Status === 'T' ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
                </v-chip>
                
                <v-chip
                  color="info"
                  size="small"
                  variant="outlined"
                  class="mr-2"
                >
                  {{ getMasterCodesByTypeId(masterType.M_id).length }} ລະຫັດ
                </v-chip>

                <!-- Master Type Actions -->
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openCreateMasterCodeDialog(masterType)"
                  title="ເພີ່ມ Master Code"
                >
                  <v-icon size="small">mdi-plus</v-icon>
                </v-btn>
                
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="info"
                  @click="editMasterType(masterType)"
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
                  :disabled="getMasterCodesByTypeId(masterType.M_id).length > 0"
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
                  @click="openCreateMasterCodeDialog(masterType)"
                  prepend-icon="mdi-plus"
                >
                  ເພີ່ມ Master Code ໃຫມ່
                </v-btn>
              </div>

              <!-- Master Codes List -->
              <div v-if="getMasterCodesByTypeId(masterType.M_id).length > 0">
                <v-card
                  v-for="code in getMasterCodesByTypeId(masterType.M_id)"
                  :key="code.MC_id"
                  class="master-code-card mb-2"
                  variant="outlined"
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-icon 
                          :color="getStatusColor(code.Status)" 
                          class="mr-3"
                          size="small"
                        >
                          mdi-code-tags
                        </v-icon>
                        <div>
                          <div class="master-code-name font-weight-medium">
                            [{{ code.MC_code }}] {{ code.MC_name_en }}
                          </div>
                          <div class="master-code-desc text-caption text-grey">
                            LA: {{ code.MC_name_la || '-' }} | Detail: {{ code.MC_detail || '-' }}
                          </div>
                          <div v-if="code.BOL_code || code.BOL_name" class="text-caption text-info mt-1">
                            BOL: {{ code.BOL_code || '-' }} / {{ code.BOL_name || '-' }}
                          </div>
                        </div>
                      </div>
                      
                      <div class="d-flex align-center">
                        <v-chip
                          :color="getStatusColor(code.Status)"
                          size="x-small"
                          variant="flat"
                          class="mr-2"
                        >
                          {{ code.Status === 'T' ? 'ເປີດ' : 'ປິດ' }}
                        </v-chip>
                        
                        <!-- Master Code Actions -->
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          color="info"
                          @click="editMasterCode(code)"
                          title="ແກ້ໄຂ Master Code"
                        >
                          <v-icon size="small">mdi-pencil</v-icon>
                        </v-btn>
                        
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          color="error"
                          @click="deleteMasterCode(code)"
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
                <div class="text-body-2 text-grey">ເພີ່ມ Master Code ໃຫມ່ສຳລັບ {{ masterType.M_name_en }}</div>
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
          @click="openCreateMasterTypeDialog"
          prepend-icon="mdi-plus"
        >
          ສ້າງ Master Type ແຮກ
        </v-btn>
      </div>
    </v-card>

    <!-- Create/Edit Master Type Dialog -->
    <v-dialog v-model="showCreateMasterType" max-width="600px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-primary text-white">
          <div class="d-flex align-center justify-space-between">
            <span class="text-h6">
              <v-icon class="mr-2">mdi-folder-plus</v-icon>
              {{ editingMasterType ? 'ແກ້ໄຂ Master Type' : 'ສ້າງ Master Type ໃຫມ່' }}
            </span>
            <v-btn
              icon
              variant="text"
              color="white"
              @click="closeModal"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-form @submit.prevent="createMasterType" ref="masterTypeFormRef">
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="masterTypeForm.M_code"
                  label="Master Code *"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'ຕ້ອງລະບຸ Master Code']"
                  required
                  placeholder="ເຊັ່ນ: PROVINCE"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="masterTypeForm.Status"
                  :items="statusItems"
                  label="ສະຖານະ"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="masterTypeForm.M_name_en"
                  label="ຊື່ພາສາອັງກິດ *"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'ຕ້ອງລະບຸຊື່ພາສາອັງກິດ']"
                  required
                  placeholder="ເຊັ່ນ: Province"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="masterTypeForm.M_name_la"
                  label="ຊື່ພາສາລາວ *"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'ຕ້ອງລະບຸຊື່ພາສາລາວ']"
                  required
                  placeholder="ເຊັ່ນ: ແຂວງ"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="masterTypeForm.M_detail"
                  label="ລາຍລະອຽດ"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  placeholder="ລາຍລະອຽດເພີ່ມເຕີມ (ທາງເລືອກ)"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="outlined"
              @click="closeModal"
              :disabled="creating"
            >
              ຍົກເລີກ
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              type="submit"
              :loading="creating"
            >
              {{ editingMasterType ? 'ອັບເດດ' : 'ສ້າງ' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Create/Edit Master Code Dialog -->
    <v-dialog v-model="showCreateMasterCode" max-width="700px" persistent>
      <v-card>
        <v-card-title class="pa-4 bg-secondary text-white">
          <div class="d-flex align-center justify-space-between">
            <span class="text-h6">
              <v-icon class="mr-2">mdi-code-tags-check</v-icon>
              {{ editingMasterCode ? 'ແກ້ໄຂ Master Code' : 'ສ້າງ Master Code ໃຫມ່' }}
            </span>
            <v-btn
              icon
              variant="text"
              color="white"
              @click="closeModal"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-form @submit.prevent="createMasterCode" ref="masterCodeFormRef">
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="masterCodeForm.M_id"
                  :items="masterTypeItems"
                  label="Master Type *"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'ຕ້ອງເລືອກ Master Type']"
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="masterCodeForm.Status"
                  :items="statusItems"
                  label="ສະຖານະ"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="masterCodeForm.MC_code"
                  label="Master Code *"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'ຕ້ອງລະບຸ Master Code']"
                  required
                  placeholder="ເຊັ່ນ: VTE"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="masterCodeForm.MC_name_en"
                  label="ຊື່ພາສາອັງກິດ *"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'ຕ້ອງລະບຸຊື່ພາສາອັງກິດ']"
                  required
                  placeholder="ເຊັ່ນ: Vientiane"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="masterCodeForm.MC_name_la"
                  label="ຊື່ພາສາລາວ *"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'ຕ້ອງລະບຸຊື່ພາສາລາວ']"
                  required
                  placeholder="ເຊັ່ນ: ວຽງຈັນ"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="masterCodeForm.MC_detail"
                  label="ລາຍລະອຽດ"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  placeholder="ລາຍລະອຽດເພີ່ມເຕີມ (ທາງເລືອກ)"
                ></v-textarea>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="masterCodeForm.BOL_code"
                  label="BOL Code"
                  variant="outlined"
                  density="compact"
                  placeholder="BOL Code (ທາງເລືອກ)"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="masterCodeForm.BOL_name"
                  label="BOL Name"
                  variant="outlined"
                  density="compact"
                  placeholder="BOL Name (ທາງເລືອກ)"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="outlined"
              @click="closeModal"
              :disabled="creating"
            >
              ຍົກເລີກ
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              type="submit"
              :loading="creating"
            >
              {{ editingMasterCode ? 'ອັບເດດ' : 'ສ້າງ' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top right"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from '@/helpers/axios'

// Types
interface MasterType {
  M_id: number
  M_code: string
  M_name_en: string
  M_name_la: string
  M_detail: string
  Status: string
}

interface MasterCode {
  MC_id: number
  M_id: number
  MC_code: string
  MC_name_en: string
  MC_name_la: string
  MC_detail: string
  Status: string
  BOL_code: string | null
  BOL_name: string | null
}

interface MasterTypeForm {
  M_code: string
  M_name_en: string
  M_name_la: string
  M_detail: string
  Status: string
}

interface MasterCodeForm {
  M_id: number | string
  MC_code: string
  MC_name_en: string
  MC_name_la: string
  MC_detail: string
  Status: string
  BOL_code: string
  BOL_name: string
}

// Auth helper
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Reactive data
const masterTypes = ref<MasterType[]>([])
const masterCodes = ref<MasterCode[]>([])
const loading = ref(false)
const creating = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string>('')
const showSuccess = ref(false)
const expandedPanels = ref<number[]>([])
const search = ref('')
const statusFilter = ref(null)

// Modal states
const showCreateMasterType = ref(false)
const showCreateMasterCode = ref(false)
const editingMasterType = ref<MasterType | null>(null)
const editingMasterCode = ref<MasterCode | null>(null)
const selectedMasterTypeForCode = ref<MasterType | null>(null)

// Form refs
const masterTypeFormRef = ref()
const masterCodeFormRef = ref()

// Form data with correct variable names
const masterTypeForm = ref<MasterTypeForm>({
  M_code: '',
  M_name_en: '',
  M_name_la: '',
  M_detail: '',
  Status: 'T'
})

const masterCodeForm = ref<MasterCodeForm>({
  M_id: '',
  MC_code: '',
  MC_name_en: '',
  MC_name_la: '',
  MC_detail: '',
  Status: 'T',
  BOL_code: '',
  BOL_name: ''
})

// Options
const statusOptions = [
  { title: 'ທັງໝົດ', value: null },
  { title: 'ເປີດໃຊ້', value: 'T' },
  { title: 'ປິດໃຊ້', value: 'F' }
]

const statusItems = [
  { title: 'ເປີດໃຊ້', value: 'T' },
  { title: 'ປິດໃຊ້', value: 'F' }
]

// Computed
const filteredMasterTypes = computed(() => {
  let filtered = masterTypes.value

  if (search.value) {
    filtered = filtered.filter(type => 
      type.M_name_en.toLowerCase().includes(search.value.toLowerCase()) ||
      type.M_name_la.includes(search.value) ||
      type.M_code.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  if (statusFilter.value !== null) {
    filtered = filtered.filter(type => type.Status === statusFilter.value)
  }

  return filtered
})

const getMasterCodesByTypeId = computed(() => {
  return (masterTypeId: number) => {
    return masterCodes.value.filter(code => code.M_id === masterTypeId)
  }
})

const totalMasterCodes = computed(() => {
  return masterCodes.value.length
})

const masterTypeItems = computed(() => {
  return masterTypes.value.map(type => ({
    title: `[${type.M_code}] ${type.M_name_en}`,
    value: type.M_id
  }))
})

// Methods
const getStatusColor = (status: string) => {
  return status === 'T' ? 'success' : 'error'
}

const fetchMasterTypes = async () => {
  try {
    const response = await axios.get('api/master-types/', getAuthHeaders())
    masterTypes.value = response.data.results || response.data
  } catch (err: any) {
    console.error('Error fetching master types:', err)
    throw err
  }
}

const fetchMasterCodes = async () => {
  try {
    const response = await axios.get('api/master-codes/', getAuthHeaders())
    masterCodes.value = response.data.results || response.data
  } catch (err: any) {
    console.error('Error fetching master codes:', err)
    throw err
  }
}

const refreshData = async () => {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([fetchMasterTypes(), fetchMasterCodes()])
  } catch (err: any) {
    error.value = err.response?.data?.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
  } finally {
    loading.value = false
  }
}

const createMasterType = async () => {
  if (!masterTypeFormRef.value.validate()) return
  
  creating.value = true
  error.value = null
  
  try {
    if (editingMasterType.value) {
      // Update existing
      const response = await axios.put(
        `api/master-types/${editingMasterType.value.M_id}/`, 
        masterTypeForm.value, 
        getAuthHeaders()
      )
      
      const index = masterTypes.value.findIndex(t => t.M_id === editingMasterType.value!.M_id)
      if (index !== -1) {
        masterTypes.value[index] = response.data
      }
      
      showSuccessMessage('ອັບເດດ Master Type ສຳເລັດແລ້ວ!')
    } else {
      // Create new
      const response = await axios.post('api/master-types/', masterTypeForm.value, getAuthHeaders())
      masterTypes.value.push(response.data)
      showSuccessMessage('ສ້າງ Master Type ສຳເລັດແລ້ວ!')
    }
    
    closeModal()
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້'
  } finally {
    creating.value = false
  }
}

const createMasterCode = async () => {
  if (!masterCodeFormRef.value.validate()) return
  
  creating.value = true
  error.value = null
  
  try {
    const formData = {
      ...masterCodeForm.value,
      M_id: Number(masterCodeForm.value.M_id)
    }
    
    if (editingMasterCode.value) {
      // Update existing
      const response = await axios.put(
        `api/master-codes/${editingMasterCode.value.MCID}/`, 
        formData, 
        getAuthHeaders()
      )
      
      const index = masterCodes.value.findIndex(c => c.MCID === editingMasterCode.value!.MCID)
      if (index !== -1) {
        masterCodes.value[index] = response.data
      }
      
      showSuccessMessage('ອັບເດດ Master Code ສຳເລັດແລ້ວ!')
    } else {
      // Create new
      const response = await axios.post('api/master-codes/', formData, getAuthHeaders())
      masterCodes.value.push(response.data)
      showSuccessMessage('ສ້າງ Master Code ສຳເລັດແລ້ວ!')
    }
    
    closeModal()
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້'
  } finally {
    creating.value = false
  }
}

const openCreateMasterTypeDialog = () => {
  editingMasterType.value = null
  resetMasterTypeForm()
  showCreateMasterType.value = true
}

const openCreateMasterCodeDialog = (masterType?: MasterType) => {
  editingMasterCode.value = null
  selectedMasterTypeForCode.value = masterType || null
  resetMasterCodeForm()
  if (masterType) {
    masterCodeForm.value.M_id = masterType.MID
  }
  showCreateMasterCode.value = true
}

const editMasterType = (masterType: MasterType) => {
  editingMasterType.value = masterType
  masterTypeForm.value = {
    M_code: masterType.M_code,
    M_name_en: masterType.M_name_en,
    M_name_la: masterType.M_name_la,
    M_detail: masterType.M_detail,
    Status: masterType.Status
  }
  showCreateMasterType.value = true
}

const editMasterCode = (masterCode: MasterCode) => {
  editingMasterCode.value = masterCode
  masterCodeForm.value = {
    M_id: masterCode.MID,
    MC_code: masterCode.MC_code,
    MC_name_en: masterCode.MC_name_en,
    MC_name_la: masterCode.MC_name_la,
    MC_detail: masterCode.MC_detail,
    Status: masterCode.Status,
    BOL_code: masterCode.BOL_code || '',
    BOL_name: masterCode.BOL_name || ''
  }
  showCreateMasterCode.value = true
}

const deleteMasterType = async (masterType: MasterType) => {
  if (getMasterCodesByTypeId.value(masterType.M_id).length > 0) {
    error.value = 'ບໍ່ສາມາດລຶບໄດ້ເພາະມີ Master Code ຢູ່'
    return
  }
  
  if (confirm(`ທ່ານຕ້ອງການລຶບ Master Type "${masterType.M_name_en}" ແທ້ບໍ?`)) {
    try {
      await axios.delete(`api/master-types/${masterType.M_id}/`, getAuthHeaders())
      
      const index = masterTypes.value.findIndex(t => t.M_id === masterType.M_id)
      if (index !== -1) {
        masterTypes.value.splice(index, 1)
      }
      
      showSuccessMessage('ລຶບ Master Type ສຳເລັດແລ້ວ!')
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'ບໍ່ສາມາດລຶບໄດ້'
    }
  }
}

const deleteMasterCode = async (masterCode: MasterCode) => {
  if (confirm(`ທ່ານຕ້ອງການລຶບ Master Code "${masterCode.MC_code}" ແທ້ບໍ?`)) {
    try {
      await axios.delete(`api/master-codes/${masterCode.MC_id}/`, getAuthHeaders())
      
      const index = masterCodes.value.findIndex(c => c.MC_id === masterCode.MC_id)
      if (index !== -1) {
        masterCodes.value.splice(index, 1)
      }
      
      showSuccessMessage('ລຶບ Master Code ສຳເລັດແລ້ວ!')
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'ບໍ່ສາມາດລຶບໄດ້'
    }
  }
}

const closeModal = () => {
  showCreateMasterType.value = false
  showCreateMasterCode.value = false
  editingMasterType.value = null
  editingMasterCode.value = null
  selectedMasterTypeForCode.value = null
  resetMasterTypeForm()
  resetMasterCodeForm()
  error.value = null
}

const resetMasterTypeForm = () => {
  masterTypeForm.value = {
    M_code: '',
    M_name_en: '',
    M_name_la: '',
    M_detail: '',
    Status: 'T'
  }
}

const resetMasterCodeForm = () => {
  masterCodeForm.value = {
    M_id: '',
    MC_code: '',
    MC_name_en: '',
    MC_name_la: '',
    MC_detail: '',
    Status: 'T',
    BOL_code: '',
    BOL_name: ''
  }
}

const showSuccessMessage = (message: string) => {
  successMessage.value = message
  showSuccess.value = true
}

const exportData = () => {
  // Export functionality placeholder
  showSuccessMessage('ຟັງຊັນສົ່ງອອກຂໍ້ມູນກຳລັງພັດທະນາ')
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.master-data-create {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
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
  .master-data-create {
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