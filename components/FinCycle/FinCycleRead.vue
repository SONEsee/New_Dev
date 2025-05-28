<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="rounded-lg">
      <v-card-title class="pa-6 pb-4">
        <h2 class="text-h5 font-weight-medium text-styles">ຈັດການຮອບວຽນບັນຊີ</h2>
      </v-card-title>
      
      <!-- Header Actions -->
      <v-card-text class="pa-6 pt-0">
        <v-row align="center" class="mb-4">
          <v-col cols="auto">
            <v-btn
              @click="goPath('/fincycle/create')"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              class="text-none"
              size="small"
            >
              ເພີ່ມຮອບວຽນບັນຊີ
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              @click="fetchData"
              color="success"
              variant="outlined"
              prepend-icon="mdi-refresh"
              class="text-none"
              size="small"
              :loading="loading"
            >
              ໂຫຼດຂໍ້ມູນໃໝ່
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="ຄົ້ນຫາ..."
              single-line
              hide-details
              variant="plain"
              density="compact"
              style="max-width: 280px;"
              class="search-input"
            />
          </v-col>
          <v-spacer />
        </v-row>

        <!-- Enhanced Data Table -->
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          class="elevation-0 rounded-lg custom-table"
          item-value="fin_cycle"
          hover
          :items-per-page="10"
          :search="search"
        >
 

          <!-- Fin Cycle Column -->
          <template #item.fin_cycle="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="32"
                color="primary"
                variant="tonal"
                class="mr-3"
              >
                <span class="font-weight-bold text-caption">{{ item.fin_cycle?.toString().substring(0, 2) || 'FC' }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.fin_cycle || '-' }}</div>
                <div class="text-caption text-grey">ລະຫັດຮອບ</div>
              </div>
            </div>
          </template>

          <!-- Cycle Description Column -->
          <template #item.cycle_Desc="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.cycle_Desc || '-' }}</div>
              <div class="text-caption text-grey">ລາຍລະອຽດຮອບວຽນ</div>
            </div>
          </template>

          <!-- Start Date Column -->
          <template #item.StartDate="{ item }">
            <div class="text-center">
              <v-chip
                color="success"
                variant="tonal"
                size="small"
                prepend-icon="mdi-calendar-start"
                class="font-weight-medium"
              >
                {{ formatDate(item.StartDate) }}
              </v-chip>
              <div class="text-caption text-grey mt-1">ເລີ່ມຕົ້ນ</div>
            </div>
          </template>

          <!-- End Date Column -->
          <template #item.EndDate="{ item }">
            <div class="text-center">
              <v-chip
                color="error"
                variant="tonal"
                size="small"
                prepend-icon="mdi-calendar-end"
                class="font-weight-medium"
              >
                {{ formatDate(item.EndDate) }}
              </v-chip>
              <div class="text-caption text-grey mt-1">ສິ້ນສຸດ</div>
            </div>
          </template>

          <!-- Duration Column -->
          <template #item.duration="{ item }">
            <div class="text-center">
              <v-chip
                color="info"
                variant="tonal"
                size="small"
                prepend-icon="mdi-clock-outline"
                class="font-weight-medium"
              >
                {{ calculateDuration(item.StartDate, item.EndDate) }}
              </v-chip>
              <div class="text-caption text-grey mt-1">ໄລຍະເວລາ</div>
            </div>
          </template>

          
          <!-- Record Status Column -->
          <template #item.Record_Status="{ item }">
            <v-chip
              :color="getStatusColor(item.Record_Status)"
              variant="tonal"
              size="small"
              class="font-weight-medium"
              :prepend-icon="getStatusIcon(item.Record_Status)"
            >
              {{ mapRecordStatus(item.Record_Status) }}
            </v-chip>
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
                @click="goPath(`/fincycle/update?id=${item.fin_cycle}`)"
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
                @click="confirmDelete(item)"
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
                mdi-calendar-off
              </v-icon>
              <p class="text-h6 text-grey-lighten-1 mb-2">
                ບໍ່ມີຂໍ້ມູນຮອບວຽນບັນຊີ
              </p>
              <p class="text-body-2 text-grey-lighten-1 mb-4">
                ເລີ່ມຕົ້ນໂດຍການເພີ່ມຮອບວຽນບັນຊີໃໝ່
              </p>
              <v-btn
                color="primary"
                variant="elevated"
                @click="goPath('/fincycle/create')"
                prepend-icon="mdi-plus"
              >
                ເພີ່ມຮອບວຽນບັນຊີ
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

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
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບຮອບວຽນບັນຊີ <strong>{{ itemToDelete?.fin_cycle }}</strong>?
          </p>
          <div class="mb-4" v-if="itemToDelete">
            <div class="text-body-2 text-grey-darken-1 mb-2">ລາຍລະອຽດຮອບວຽນ:</div>
            <div class="text-body-2">{{ itemToDelete.cycle_Desc }}</div>
            <div class="text-body-2">{{ formatDate(itemToDelete.StartDate) }} - {{ formatDate(itemToDelete.EndDate) }}</div>
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
            @click="deleteItem"
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
            <v-icon color="info" size="28" class="mr-3">mdi-information</v-icon>
            <span class="text-h6 font-weight-bold">ລາຍລະອຽດຮອບວຽນບັນຊີ</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0" v-if="selectedItem">
          <v-row>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="brown">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>ລະຫັດຮອບວຽນ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.fin_cycle }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="brown">mdi-text</v-icon>
                  </template>
                  <v-list-item-title>ລາຍລະອຽດ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedItem.cycle_Desc || '-' }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="brown">mdi-calendar-start</v-icon>
                  </template>
                  <v-list-item-title>ວັນທີເລີ່ມຕົ້ນ</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedItem.StartDate) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="brown">mdi-calendar-end</v-icon>
                  </template>
                  <v-list-item-title>ວັນທີສິ້ນສຸດ</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedItem.EndDate) }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="brown">mdi-clock-outline</v-icon>
                  </template>
                  <v-list-item-title>ໄລຍະເວລາ</v-list-item-title>
                  <v-list-item-subtitle>{{ calculateDuration(selectedItem.StartDate, selectedItem.EndDate) }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="brown">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>ສະຖານະ</v-list-item-title>
                  <v-list-item-subtitle>{{ mapRecordStatus(selectedItem.Record_Status) }}</v-list-item-subtitle>
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
            @click="goPath(`/fincycle/update?id=${selectedItem?.fin_cycle}`)"
            class="text-none font-weight-medium"
          >
            ແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import { FinCycleModel } from '~/models'

const router = useRouter()
const items = ref<FinCycleModel.FinCycleResponse[]>([])
const loading = ref(false)
const deleteLoading = ref(false)
const search = ref('')
const deleteDialog = ref(false)
const detailsDialog = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const itemToDelete = ref<FinCycleModel.FinCycleResponse | null>(null)
const selectedItem = ref<FinCycleModel.FinCycleResponse | null>(null)

const headers = [
  { 
    title: 'ລະຫັດຮອບວຽນບັນຊີ', 
    key: 'fin_cycle',
    align: 'start' as const,
    width: '180px'
  },
  { 
    title: 'ເນື້ອຫາ', 
    key: 'cycle_Desc',
    align: 'start' as const
  },
  { 
    title: 'ເລີ່ມວັນທີ', 
    key: 'StartDate',
    align: 'center' as const,
    width: '140px'
  },
  { 
    title: 'ໝົດວັນທີ', 
    key: 'EndDate',
    align: 'center' as const,
    width: '140px'
  },
  { 
    title: 'ໄລຍະເວລາ', 
    key: 'duration',
    align: 'center' as const,
    width: '120px',
    sortable: false
  },
  { 
    title: 'ສະຖານະ', 
    key: 'Record_Status',
    align: 'center' as const,
    width: '120px'
  },
  { 
    title: 'ການປະຕິບັດ', 
    key: 'actions',
    sortable: false,
    align: 'center' as const,
    width: '150px'
  }
]

// Helper functions
function goPath(path: string) {
  router.push(path)
}

function formatDate(d: string | Date | null): string {
  if (!d) return '-'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function calculateDuration(startDate: string | Date | null, endDate: string | Date | null): string {
  if (!startDate || !endDate) return '-'
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-'
  
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} ມື້`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ເດືອນ`
  } else {
    const years = Math.floor(diffDays / 365)
    const remainingMonths = Math.floor((diffDays % 365) / 30)
    return remainingMonths > 0 ? `${years} ປີ ${remainingMonths} ເດືອນ` : `${years} ປີ`
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'A': return 'success'
    case 'U': return 'error'
    default: return 'grey'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'A': return 'mdi-check-circle'
    case 'U': return 'mdi-cancel'
    default: return 'mdi-help-circle'
  }
}

function mapRecordStatus(status: string) {
  switch (status) {
    case 'O': return 'ເປີດໃຊ້ງານ'
    case 'C': return 'ປິດໃຊ້ງານ'
    default: return status || '-'
  }
}

function confirmDelete(item: FinCycleModel.FinCycleResponse) {
  itemToDelete.value = item
  deleteDialog.value = true
}

function viewDetails(item: FinCycleModel.FinCycleResponse) {
  selectedItem.value = item
  detailsDialog.value = true
}

async function deleteItem() {
  if (!itemToDelete.value) return
  
  deleteLoading.value = true
  try {
    await axios.delete(`api/fin-cycles/${itemToDelete.value.fin_cycle}/`, {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
    
    // Remove item from local array
    const index = items.value.findIndex(item => item.fin_cycle === itemToDelete.value?.fin_cycle)
    if (index > -1) {
      items.value.splice(index, 1)
    }
    
    successMessage.value = 'ລົບຮອບວຽນບັນຊີສຳເລັດແລ້ວ'
    showSuccess.value = true
    deleteDialog.value = false
    itemToDelete.value = null
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົບ'
    showError.value = true
    console.error('Error deleting item:', error)
  } finally {
    deleteLoading.value = false
  }
}

async function fetchData() {
  loading.value = true
  try {
    const { data } = await axios.get<FinCycleModel.FinCycleResponse[]>('api/fin-cycles/', {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem('token')}` 
      }
    })
    items.value = data
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
    showError.value = true
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped>
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

/* Search input without background */
.search-input :deep(.v-field__field) {
  background: transparent !important;
}

.search-input :deep(.v-field__outline) {
  display: none;
}

/* Custom scrollbar for table */
:deep(.v-data-table__wrapper) {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar) {
  height: 6px;
  width: 6px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(var(--v-theme-primary), 0.5);
}
</style>