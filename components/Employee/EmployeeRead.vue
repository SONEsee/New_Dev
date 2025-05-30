<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12">
        <!-- Header -->
        <v-card elevation="0" class="rounded-lg mb-6">
          <v-card-title class="pa-8 pb-6">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-3" size="28">mdi-account-group</v-icon>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-1 text-styles">
                    ຈັດການພະນັກງານ
                  </h2>
                  <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
                    ສະແດງຂໍ້ມູນພະນັກງານໃນລະບົບ
                  </p>
                </div>
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-plus"
                @click="goPath('/employee/create')"
                class="text-none"
              >
                ເພີ່ມພະນັກງານ
              </v-btn>
            </div>
          </v-card-title>

          <!-- Filters Section -->
          <v-card-text class="pa-6 pt-0">
            <v-row align="center" class="mb-4">
              <v-col cols="12" md="4">
                <v-select
                  v-model="div_id"
                  :items="divisionOptions"
                  item-title="display"
                  item-value="div_id"
                  label="ກັ່ນຕອງຕາມພະແນກ"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-filter"
                  clearable
                  hide-details
                  :loading="loadingDivisions"
                  @update:model-value="fetchEmployees"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="ຄົ້ນຫາພະນັກງານ..."
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-col>
            </v-row>

            <!-- Employee Table -->
            <v-data-table
              :headers="headers"
              :items="employees"
              :loading="loading"
              :search="search"
              class="elevation-0 rounded-lg custom-table"
              item-value="employee_id"
              hover
              :items-per-page="10"
            >
              <!-- Employee ID Column -->
              <template #item.employee_id="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" color="primary" variant="tonal" class="mr-3">
                    <span class="font-weight-bold text-caption">
                      {{ String(getEmployeeId(item)).substring(0, 2) || 'ID' }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ getEmployeeId(item) || '-' }}</div>
                    <div class="text-caption text-grey">ລະຫັດພະນັກງານ</div>
                  </div>
                </div>
              </template>

              <!-- Employee Name Column -->
              <template #item.employee_name_la="{ item }">
                <div>
                  <div class="font-weight-medium">{{ item.employee_name_la || '-' }}</div>
                  <div class="text-caption text-grey">{{ item.employee_name_en || '-' }}</div>
                </div>
              </template>

              <!-- Division Column -->
              <template #item.division_name_la="{ item }">
                <v-chip
                  color="info"
                  variant="tonal"
                  size="small"
                  prepend-icon="mdi-domain"
                  class="font-weight-medium"
                >
                  {{ item.division_name_la || item.division?.division_name_la || '-' }}
                </v-chip>
              </template>

              <!-- Employee Photo Column -->
              <template #item.employee_photo="{ item }">
                <div class="text-center">
                  <v-avatar size="50" class="rounded">
                    <v-img
                      :src="getImageUrl(item.employee_photo)"
                      cover
                      :alt="item.employee_name_la"
                    >
                      <template #placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon color="grey-lighten-2" size="24">mdi-account</v-icon>
                        </div>
                      </template>
                      <template #error>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon color="grey-lighten-2" size="24">mdi-account</v-icon>
                        </div>
                      </template>
                    </v-img>
                  </v-avatar>
                </div>
              </template>

              <!-- Employee Signature Column -->
              <template #item.employee_signature="{ item }">
                <div class="text-center">
                  <v-avatar size="50" class="rounded">
                    <v-img
                      :src="getImageUrl(item.employee_signature)"
                      cover
                      alt="ລາຍເຊັນ"
                    >
                      <template #placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon color="grey-lighten-2" size="24">mdi-draw</v-icon>
                        </div>
                      </template>
                      <template #error>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon color="grey-lighten-2" size="24">mdi-draw</v-icon>
                        </div>
                      </template>
                    </v-img>
                  </v-avatar>
                </div>
              </template>

              <!-- Actions Column -->
              <template #item.actions="{ item }">
                <div class="d-flex align-center gap-1">
                  <!-- Edit Button -->
                    <v-btn
                    color="primary"
                    variant="text"
                    size="small"
                    icon
                    @click="goPath(`/employee/update?employee_id=${getEmployeeId(item)}`)"
                    class="action-btn"
                    >
                    <v-icon size="20">mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">
                        ແກ້ໄຂ
                    </v-tooltip>
                    </v-btn>

                  <!-- Delete Button -->
                  <v-btn
                    color="error"
                    variant="text"
                    size="small"
                    icon
                    @click="openDeleteDialog(item)"
                    class="action-btn"
                  >
                    <v-icon size="20">mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">
                      ລົບ
                    </v-tooltip>
                  </v-btn>

                  <!-- View Details Button -->
                  <v-btn
                    color="info"
                    variant="text"
                    size="small"
                    icon
                    @click="viewDetails(item)"
                    class="action-btn"
                  >
                    <v-icon size="20">mdi-eye</v-icon>
                    <v-tooltip activator="parent" location="top">
                      ເບິ່ງລາຍລະອຽດ
                    </v-tooltip>
                  </v-btn>
                </div>
              </template>

              <!-- Loading Slot -->
              <template #loading>
                <v-skeleton-loader type="table-row@5" />
              </template>

              <!-- No Data Slot -->
              <template #no-data>
                <div class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4">
                    mdi-account-off
                  </v-icon>
                  <p class="text-h6 text-grey-lighten-1 mb-2">
                    ບໍ່ມີຂໍ້ມູນພະນັກງານ
                  </p>
                  <p class="text-body-2 text-grey-lighten-1 mb-4">
                    ເລີ່ມຕົ້ນໂດຍການເພີ່ມພະນັກງານໃໝ່
                  </p>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    @click="goPath('/employee/create')"
                    prepend-icon="mdi-plus"
                  >
                    ເພີ່ມພະນັກງານ
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="error" size="28" class="mr-3">mdi-alert-circle</v-icon>
            <span class="text-h6 font-weight-bold">ຢືນຢັນການລົບ</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <p class="text-body-1 mb-4">
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບພະນັກງານ <strong>{{ deleteItem?.employee_name_la }}</strong>?
          </p>
          <div v-if="deleteItem" class="mb-4">
            <div class="text-body-2 text-grey-darken-1 mb-2">ລາຍລະອຽດ:</div>
            <div class="text-body-2"><strong>ລະຫັດ:</strong> {{ getEmployeeId(deleteItem) }}</div>
            <div class="text-body-2"><strong>ພະແນກ:</strong> {{ deleteItem.division_name_la || deleteItem.division?.division_name_la || '-' }}</div>
          </div>
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-0"
            icon="mdi-information"
          >
            ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="deleteDialog = false"
            class="text-none"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteEmployee"
            :loading="deleteLoading"
            class="text-none font-weight-medium"
          >
            ລົບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="info" size="28" class="mr-3">mdi-account-details</v-icon>
            <span class="text-h6 font-weight-bold">ລາຍລະອຽດພະນັກງານ</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0" v-if="selectedItem">
          <v-row>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="primary">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>ລະຫັດພະນັກງານ</v-list-item-title>
                  <v-list-item-subtitle>{{ getEmployeeId(selectedItem) }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="success">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>ຊື່ພະນັກງານ (ລາວ)</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.employee_name_la }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="info">mdi-account-outline</v-icon>
                  </template>
                  <v-list-item-title>ຊື່ພະນັກງານ (ອັງກິດ)</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.employee_name_en || '-' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="warning">mdi-domain</v-icon>
                  </template>
                  <v-list-item-title>ພະແນກ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.division_name_la || selectedItem.division?.division_name_la || '-' }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="purple">mdi-image</v-icon>
                  </template>
                  <v-list-item-title>ຮູບພະນັກງານ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.employee_photo ? 'ມີຮູບ' : 'ບໍ່ມີຮູບ' }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-draw</v-icon>
                  </template>
                  <v-list-item-title>ລາຍເຊັນ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.employee_signature ? 'ມີລາຍເຊັນ' : 'ບໍ່ມີລາຍເຊັນ' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="detailsDialog = false"
            class="text-none"
          >
            ປິດ
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="goPath(`/employee/update/${getEmployeeId(selectedItem)}`)"
            class="text-none font-weight-medium"
          >
            ແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
          icon="mdi-close"
          size="small"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const deleteLoading = ref(false)
const loadingDivisions = ref(false)
const employees = ref<any[]>([])
const divisionOptions = ref<any[]>([])
const div_id = ref(route.query.div_id || '')
const search = ref('')
const deleteDialog = ref(false)
const detailsDialog = ref(false)
const deleteItem = ref<any>(null)
const selectedItem = ref<any>(null)
const baseUrl = ref('http://127.0.0.1:8000') // Adjust to your backend URL

const headers = [
  { title: 'ລະຫັດພະນັກງານ', key: 'employee_id', align: 'start' as const, width: '180px' },
  { title: 'ຊື່ພະນັກງານ', key: 'employee_name_la', align: 'start' as const },
  { title: 'ພະແນກ', key: 'division_name_la', align: 'center' as const, width: '150px' },
  { title: 'ຮູບພະນັກງານ', key: 'employee_photo', sortable: false, align: 'center' as const, width: '120px' },
  { title: 'ລາຍເຊັນ', key: 'employee_signature', sortable: false, align: 'center' as const, width: '120px' },
  { title: 'ການປະຕິບັດ', key: 'actions', sortable: false, align: 'center' as const, width: '150px' }
]

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Helper function to get employee ID with fallback
const getEmployeeId = (item: any) => {
  return item.employee_id || item.id || item.emp_id || item.employeeId || null
}

// Helper function to construct image URLs
const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return '/placeholder.png'
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath
  
  // If it starts with /, prepend base URL
  if (imagePath.startsWith('/')) return `${baseUrl.value}${imagePath}`
  
  // Otherwise, assume it needs both base URL and /
  return `${baseUrl.value}/${imagePath}`
}

const goPath = (path: string) => {
  router.push(path)
}

const fetchEmployees = async () => {
  loading.value = true
  try {
    const params = div_id.value ? { div_id: div_id.value } : {}
    const res = await axios.get('/api/employees/', { 
      params,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    if (res.status === 200) {
      employees.value = res.data
      console.log('Employee data:', res.data) // Debug log to check data structure
    }
  } catch (error: any) {
    console.error('Error fetching employees:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນພະນັກງານ', 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const fetchDivisions = async () => {
  loadingDivisions.value = true
  try {
    const res = await axios.get('/api/divisions/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    if (res.status === 200) {
      divisionOptions.value = res.data.map((div: any) => ({
        div_id: div.div_id || div.id,
        display: `${div.div_id || div.id} - ${div.division_name_la || div.name}`
      }))
    }
  } catch (error: any) {
    console.error('Error fetching divisions:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນພະແນກ', 'error', 'mdi-alert-circle')
  } finally {
    loadingDivisions.value = false
  }
}

const openDeleteDialog = (item: any) => {
  const employeeId = getEmployeeId(item)
  if (!employeeId) {
    showSnackbar('ບໍ່ສາມາດລົບໄດ້: ບໍ່ພົບລະຫັດພະນັກງານ', 'error', 'mdi-alert-circle')
    return
  }
  deleteItem.value = item
  deleteDialog.value = true
}

const viewDetails = (item: any) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const deleteEmployee = async () => {
  if (!deleteItem.value) return
  
  const employeeId = getEmployeeId(deleteItem.value)
  if (!employeeId) {
    showSnackbar('ບໍ່ສາມາດລົບໄດ້: ບໍ່ພົບລະຫັດພະນັກງານ', 'error', 'mdi-alert-circle')
    return
  }

  deleteLoading.value = true
  try {
    const res = await axios.delete(`/api/employees/${employeeId}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    if (res.status === 204 || res.status === 200) {
      showSnackbar('ລົບພະນັກງານສຳເລັດ', 'success', 'mdi-check-circle')
      await fetchEmployees()
      deleteDialog.value = false
      deleteItem.value = null
    }
  } catch (error: any) {
    console.error('Error deleting employee:', error)
    showSnackbar(
      error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົບພະນັກງານ',
      'error',
      'mdi-alert-circle'
    )
  } finally {
    deleteLoading.value = false
  }
}

const showSnackbar = (message: string, color: string, icon: string) => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.icon = icon
  snackbar.value.show = true
}

onMounted(async () => {
  await Promise.all([fetchEmployees(), fetchDivisions()])
})
</script>

<style scoped>
.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

/* Custom table styling */
:deep(.custom-table .v-data-table__wrapper) {
  border-radius: 12px;
  border: 1px solid rgb(var(--v-theme-surface-variant));
  overflow: hidden;
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* Action buttons */
.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

:deep(.v-field__outline) {
  border-radius: 8px;
}
</style>