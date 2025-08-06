
<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-light text-primary">
          ຂໍ້ມູນບໍລິສັດ
        </h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          ຈັດການຂໍ້ມູນບໍລິສັດ
        </p>
      </v-col>
    </v-row>

    <!-- Search and Filter Bar -->
    <v-card class="mb-4" elevation="2">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="ຄົ້ນຫາບໍລິສັດ"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              @input="handleSearch"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filterActive"
              :items="activeFilterOptions"
              label="ສະຖານະ"
              variant="outlined"
              density="compact"
              clearable
              @update:modelValue="fetchCompanies"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filterIndustry"
              label="ປະເພດທຸລະກິດ"
              variant="outlined"
              density="compact"
              clearable
              @input="handleSearch"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="elevated"
              block
              @click="openCreateDialog"
            >
              <v-icon left>mdi-plus</v-icon>
              ເພີ່ມໃໝ່
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Companies Table -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-office-building</v-icon>
        ລາຍຊື່ບໍລິສັດ
        <v-spacer />
        <v-chip :color="companies.length > 0 ? 'success' : 'warning'" variant="elevated">
          ທັງໝົດ: {{ companies.length }}
        </v-chip>
      </v-card-title>
      
      <v-data-table
        :headers="tableHeaders"
        :items="companies"
        :loading="loading"
        class="elevation-0"
        :search="searchQuery"
        :items-per-page="10"
        loading-text="ກຳລັງໂຫຼດຂໍ້ມູນ..."
        no-data-text="ບໍ່ມີຂໍ້ມູນ"
      >
        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            variant="elevated"
            size="small"
          >
            {{ item.is_active ? 'ໃຊ້ງານ' : 'ບໍ່ໃຊ້ງານ' }}
          </v-chip>
        </template>
        
        <template #item.logo="{ item }">
          <v-avatar v-if="item.logo" size="40" class="my-2">
            <v-img :src="item.logo" alt="Logo" />
          </v-avatar>
          <v-avatar v-else size="40" color="grey-lighten-2" class="my-2">
            <v-icon>mdi-office-building</v-icon>
          </v-avatar>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              color="info"
              @click="viewCompany(item)"
            />
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="editCompany(item)"
            />
            <v-btn
              icon="mdi-power"
              variant="text"
              size="small"
              :color="item.is_active ? 'warning' : 'success'"
              @click="toggleActive(item)"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="deleteCompany(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="1200px" persistent>
      <v-card>
        <v-card-title class="text-h5 pa-4">
          <v-icon class="me-2">{{ editMode ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editMode ? 'ແກ້ໄຂຂໍ້ມູນບໍລິສັດ' : 'ເພີ່ມບໍລິສັດໃໝ່' }}
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-form ref="form" v-model="valid">
            <v-row>
              <!-- Basic Information -->
              <v-col cols="12">
                <h3 class="text-h6 mb-3 text-primary">ຂໍ້ມູນພື້ນຖານ</h3>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name_la"
                  label="ຊື່ບໍລິສັດ (ລາວ) *"
                  :rules="nameRules"
                  variant="outlined"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name_en"
                  label="ຊື່ບໍລິສັດ (ອັງກິດ)"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.registration_number"
                  label="ເລກທະບຽນບໍລິສັດ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.tax_id"
                  label="ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.industry_type"
                  label="ປະເພດທຸລະກິດ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.director_name"
                  label="ຊື່ຜູ້ອຳນວຍການ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="ລາຍລະອຽດບໍລິສັດ"
                  variant="outlined"
                  rows="3"
                />
              </v-col>

              <!-- Contact Information -->
              <v-col cols="12">
                <h3 class="text-h6 mb-3 text-primary">ຂໍ້ມູນຕິດຕໍ່</h3>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="ອີເມລ"
                  :rules="emailRules"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.telephone"
                  label="ເບີໂທລະສັບ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.website"
                  label="ເວັບໄຊ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.fax"
                  label="ແຟັກ"
                  variant="outlined"
                />
              </v-col>

              <!-- Address Information -->
              <v-col cols="12">
                <h3 class="text-h6 mb-3 text-primary">ທີ່ຢູ່</h3>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.address_line1"
                  label="ທີ່ຢູ່ບັນທັດ 1"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.address_line2"
                  label="ທີ່ຢູ່ບັນທັດ 2"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.city"
                  label="ເມືອງ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.state_province"
                  label="ແຂວງ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.country"
                  label="ປະເທດ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.postal_code"
                  label="ລະຫັດໄປສະນີ"
                  variant="outlined"
                />
              </v-col>

              <!-- Additional Information -->
              <v-col cols="12">
                <h3 class="text-h6 mb-3 text-primary">ຂໍ້ມູນເພີ່ມເຕີມ</h3>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.founded_date"
                  label="ວັນທີ່ກໍ່ຕັ້ງ"
                  type="date"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.tagline"
                  label="ຄຳຂວັນ"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.facebook"
                  label="Facebook URL"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.twitter"
                  label="Twitter URL"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="formData.youtube"
                  label="YouTube URL"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="formData.is_active"
                  label="ສະຖານະໃຊ້ງານ"
                  color="success"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="closeDialog"
            :disabled="saving"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveCompany"
            :loading="saving"
            :disabled="!valid"
          >
            {{ editMode ? 'ອັບເດດ' : 'ບັນທຶກ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="800px">
      <v-card v-if="viewData">
        <v-card-title class="text-h5 pa-4">
          <v-icon class="me-2">mdi-eye</v-icon>
          ລາຍລະອຽດບໍລິສັດ
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" class="text-center" v-if="viewData.logo">
              <v-avatar size="100" class="mb-4">
                <v-img :src="viewData.logo" alt="Company Logo" />
              </v-avatar>
            </v-col>

            <v-col cols="12" md="6">
              <strong>ຊື່ບໍລິສັດ (ລາວ):</strong>
              <p>{{ viewData.name_la || 'ບໍ່ລະບຸ' }}</p>
            </v-col>

            <v-col cols="12" md="6">
              <strong>ຊື່ບໍລິສັດ (ອັງກິດ):</strong>
              <p>{{ viewData.name_en || 'ບໍ່ລະບຸ' }}</p>
            </v-col>

            <v-col cols="12" md="6">
              <strong>ເລກທະບຽນ:</strong>
              <p>{{ viewData.registration_number || 'ບໍ່ລະບຸ' }}</p>
            </v-col>

            <v-col cols="12" md="6">
              <strong>ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ:</strong>
              <p>{{ viewData.tax_id || 'ບໍ່ລະບຸ' }}</p>
            </v-col>

            <v-col cols="12" md="6">
              <strong>ປະເພດທຸລະກິດ:</strong>
              <p>{{ viewData.industry_type || 'ບໍ່ລະບຸ' }}</p>
            </v-col>

            <v-col cols="12" md="6">
              <strong>ສະຖານະ:</strong>
              <v-chip :color="viewData.is_active ? 'success' : 'error'" variant="elevated" size="small">
                {{ viewData.is_active ? 'ໃຊ້ງານ' : 'ບໍ່ໃຊ້ງານ' }}
              </v-chip>
            </v-col>

            <v-col cols="12" v-if="viewData.description">
              <strong>ລາຍລະອຽດ:</strong>
              <p>{{ viewData.description }}</p>
            </v-col>

            <v-col cols="12" v-if="viewData.address_line1">
              <strong>ທີ່ຢູ່:</strong>
              <p>
                {{ [viewData.address_line1, viewData.address_line2, viewData.city, viewData.state_province, viewData.country].filter(Boolean).join(', ') }}
              </p>
            </v-col>

            <v-col cols="12" md="6" v-if="viewData.email">
              <strong>ອີເມລ:</strong>
              <p>{{ viewData.email }}</p>
            </v-col>

            <v-col cols="12" md="6" v-if="viewData.telephone">
              <strong>ເບີໂທລະສັບ:</strong>
              <p>{{ viewData.telephone }}</p>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" @click="viewDialog = false">
            ປິດ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          <v-icon class="me-2" color="error">mdi-delete-alert</v-icon>
          ຢືນຢັນການລົບ
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          ທ່ານແນ່ໃຈແລ້ວບໍ່ວ່າຕ້ອງການລົບບໍລິສັດ "<strong>{{ deleteItem?.name_la }}</strong>" ?
          <br><br>
          <v-alert type="warning" variant="tonal">
            ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້!
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" @click="deleteDialog = false">
            ຍົກເລີກ
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="confirmDelete"
            :loading="deleting"
          >
            ລົບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Loading Overlay -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">
          ປິດ
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import axios from 'axios'

// Define reactive data using ref and reactive
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const dialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const editMode = ref(false)
const valid = ref(false)
const searchQuery = ref('')
const filterActive = ref(null)
const filterIndustry = ref('')
const companies = ref([])
const viewData = ref(null)
const deleteItem = ref(null)
const form = ref(null)
const currentEditId = ref(null)

// Initialize snackbar with proper default values
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Form data using reactive
const formData = reactive({
  name_la: '',
  name_en: '',
  registration_number: '',
  tax_id: '',
  industry_type: '',
  description: '',
  website: '',
  email: '',
  telephone: '',
  fax: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state_province: '',
  postal_code: '',
  country: '',
  director_name: '',
  founded_date: '',
  is_active: true,
  logo: '',
  tagline: '',
  facebook: '',
  twitter: '',
  youtube: ''
})

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Adjust to your Django API URL
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  if (process.client) {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response?.status === 401) {
      if (process.client) {
        localStorage.removeItem('token')
        showMessage('ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່', 'error')
        navigateTo('/login')
      }
    }
    return Promise.reject(error)
  }
)

// Table headers
const tableHeaders = [
  { title: 'ໂລໂກ້', key: 'logo', sortable: false },
  { title: 'ຊື່ບໍລິສັດ', key: 'name_la' },
  { title: 'ປະເພດທຸລະກິດ', key: 'industry_type' },
  { title: 'ອີເມລ', key: 'email' },
  { title: 'ເບີໂທ', key: 'telephone' },
  { title: 'ສະຖານະ', key: 'is_active' },
  { title: 'ການດຳເນີນການ', key: 'actions', sortable: false }
]

// Filter options
const activeFilterOptions = [
  { title: 'ທັງໝົດ', value: null },
  { title: 'ໃຊ້ງານ', value: true },
  { title: 'ບໍ່ໃຊ້ງານ', value: false }
]

// Validation rules
const nameRules = [
  v => !!v || 'ຊື່ບໍລິສັດເປັນພາສາລາວຈຳເປັນຕ້ອງມີ',
  v => (v && v.length >= 2) || 'ຊື່ບໍລິສັດຕ້ອງມີຢ່າງນ້ອຍ 2 ຕົວອັກສອນ'
]

const emailRules = [
  v => !v || /.+@.+\..+/.test(v) || 'ຮູບແບບອີເມລບໍ່ຖືກຕ້ອງ'
]

// Helper function to show messages
const showMessage = (message, color = 'success') => {
  try {
    snackbar.value.message = message
    snackbar.value.color = color
    snackbar.value.show = true
  } catch (error) {
    console.error('Error showing message:', error)
  }
}

// Fetch companies from API
const fetchCompanies = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    
    if (filterActive.value !== null) {
      params.append('is_active', filterActive.value)
    }
    
    if (searchQuery.value && searchQuery.value.trim()) {
      params.append('search', searchQuery.value.trim())
    }
    
    if (filterIndustry.value && filterIndustry.value.trim()) {
      params.append('industry_type', filterIndustry.value.trim())
    }

    const response = await api.get(`/companies/?${params.toString()}`)
    companies.value = response.data.results || response.data || []
    
    if (companies.value.length > 0) {
      showMessage('ໂຫຼດຂໍ້ມູນສຳເລັດ', 'success')
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
    companies.value = []
    showMessage('ໂຫຼດຂໍ້ມູນລົ້ມເຫລວ: ' + (error.response?.data?.message || error.message), 'error')
  } finally {
    loading.value = false
  }
}

// Debounced search handler
let searchTimeout = null
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchCompanies()
  }, 500)
}

// Open create dialog
const openCreateDialog = () => {
  editMode.value = false
  currentEditId.value = null
  resetForm()
  dialog.value = true
}

// Reset form data
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    if (key === 'is_active') {
      formData[key] = true
    } else {
      formData[key] = ''
    }
  })
  if (form.value) {
    form.value.resetValidation()
  }
}

// Edit company
const editCompany = (company) => {
  editMode.value = true
  currentEditId.value = company.id
  
  // Populate form with company data
  Object.keys(formData).forEach(key => {
    formData[key] = company[key] !== null && company[key] !== undefined 
      ? company[key] 
      : (key === 'is_active' ? true : '')
  })
  
  dialog.value = true
}

// View company details
const viewCompany = (company) => {
  viewData.value = { ...company }
  viewDialog.value = true
}

// Save company (create or update)
const saveCompany = async () => {
  if (!form.value || !form.value.validate()) {
    showMessage('ກະລຸນາກວດສອບຂໍ້ມູນທີ່ປ້ອນ', 'error')
    return
  }

  saving.value = true
  try {
    // Clean the payload
    const payload = {}
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        payload[key] = formData[key]
      }
    })

    let response
    if (editMode.value && currentEditId.value) {
      response = await api.put(`/companies/${currentEditId.value}/`, payload)
      showMessage('ອັບເດດຂໍ້ມູນສຳເລັດ', 'success')
    } else {
      response = await api.post('/companies/', payload)
      showMessage('ເພີ່ມບໍລິສັດສຳເລັດ', 'success')
    }
    
    closeDialog()
    await fetchCompanies()
  } catch (error) {
    console.error('Error saving company:', error)
    let errorMessage = 'ບັນທຶກຂໍ້ມູນລົ້ມເຫລວ'
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message
      } else if (error.response.data.name_la) {
        errorMessage = `ຊື່ບໍລິສັດ: ${error.response.data.name_la.join(', ')}`
      }
    }
    
    showMessage(errorMessage, 'error')
  } finally {
    saving.value = false
  }
}

// Close dialog
const closeDialog = () => {
  dialog.value = false
  editMode.value = false
  currentEditId.value = null
  resetForm()
}

// Delete company
const deleteCompany = (company) => {
  deleteItem.value = company
  deleteDialog.value = true
}

// Confirm delete
const confirmDelete = async () => {
  if (!deleteItem.value?.id) return

  deleting.value = true
  try {
    await api.delete(`/companies/${deleteItem.value.id}/`)
    showMessage('ລົບບໍລິສັດສຳເລັດ', 'success')
    deleteDialog.value = false
    deleteItem.value = null
    await fetchCompanies()
  } catch (error) {
    console.error('Error deleting company:', error)
    showMessage('ລົບບໍລິສັດລົ້ມເຫລວ', 'error')
  } finally {
    deleting.value = false
  }
}

// Toggle active status
const toggleActive = async (company) => {
  try {
    await api.patch(`/companies/${company.id}/toggle_active/`)
    showMessage(
      `${company.is_active ? 'ປິດ' : 'ເປີດ'}ການໃຊ້ງານສຳເລັດ`,
      'success'
    )
    await fetchCompanies()
  } catch (error) {
    console.error('Error toggling company status:', error)
    showMessage('ປ່ຽນສະຖານະລົ້ມເຫລວ', 'error')
  }
}

// Initialize component
onMounted(async () => {
  // Check authentication only on client side
  if (process.client) {
    const token = localStorage.getItem('token')
    if (!token) {
      await navigateTo('/login')
      return
    }
  }
  
  // Fetch initial data
  await fetchCompanies()
})
</script>

<style scoped>
.v-container {
  background-color: #fafafa;
}

.v-card {
  border-radius: 12px !important;
}

.v-btn {
  border-radius: 8px !important;
  text-transform: none !important;
  font-weight: 500 !important;
}

.v-text-field, .v-textarea, .v-select {
  font-size: 14px;
}

.v-data-table {
  border-radius: 12px !important;
}

.text-primary {
  color: #1976d2 !important;
}

.gap-1 {
  gap: 4px;
}
</style>