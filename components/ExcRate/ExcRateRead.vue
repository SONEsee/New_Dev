<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="rounded-lg">
      <v-card-title class="pa-6 pb-4">
        <h2 class="text-h5 font-weight-medium text-styles">ຈັດການອັດຕາແລກປ່ຽນ</h2>
      </v-card-title>
      
      <!-- Header Actions -->
      <v-card-text class="pa-6 pt-0">
        <v-row align="center" class="mb-4">
          <v-col cols="auto">
            <v-btn
              @click="checkAndCreateNew"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              class="text-none"
              size="small"
              :loading="checkingDuplicates"
            >
              ເພີ່ມອັດຕາແລກປ່ຽນ
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
          item-value="id"
          hover
          :items-per-page="10"
          :search="search"
        >
          <!-- Table Header -->
          <template #top>
            <div class="pa-4">
              <span class="text-h6 text-styles">ລາຍການອັດຕາແລກປ່ຽນ</span>
            </div>
          </template>

          <!-- Currency Column -->
          <template #item.ccy_code="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="32"
                color="primary"
                variant="tonal"
                class="mr-3"
              >
                <span class="font-weight-bold text-caption">{{ item.ccy_code?.substring(0, 2) || 'XX' }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.ccy_code || '-' }}</div>
              </div>
            </div>
          </template>

          <!-- Buy Rate Column with Arrow Up Icon -->
          <template #item.Buy_Rate="{ item }">
            <div class="text-right">
              <div class="d-flex align-center justify-end">
                <v-icon color="success" size="16" class="mr-1">mdi-arrow-up-bold</v-icon>
                <div class="font-weight-bold text-success">
                  {{ formatCurrency(item.Buy_Rate) }}
                </div>
              </div>
              <div class="text-caption text-grey">ຊື້</div>
            </div>
          </template>

          <!-- Sale Rate Column with Arrow Down Icon -->
          <template #item.Sale_Rate="{ item }">
            <div class="text-right">
              <div class="d-flex align-center justify-end">
                <v-icon color="error" size="16" class="mr-1">mdi-arrow-down-bold</v-icon>
                <div class="font-weight-bold text-error">
                  {{ formatCurrency(item.Sale_Rate) }}
                </div>
              </div>
              <div class="text-caption text-grey">ຂາຍ</div>
            </div>
          </template>

          <!-- Spread Column -->
          <template #item.spread="{ item }">
            <v-chip
              :color="getSpreadColor(item.Sale_Rate - item.Buy_Rate)"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              {{ formatCurrency(item.Sale_Rate - item.Buy_Rate) }}
            </v-chip>
          </template>

          <!-- Date Column -->
          <template #item.value_date="{ item }">
            <div class="text-center">
              <v-chip
                color="info"
                variant="tonal"
                size="small"
                prepend-icon="mdi-calendar"
                class="font-weight-medium"
              >
                {{ formatDate(item.value_date) }}
              </v-chip>
              <div class="text-caption text-grey mt-1">
                {{ formatTime(item.value_date) }}
              </div>
            </div>
          </template>

          <!-- INT Auth Status Column -->
          <template #item.INT_Auth_Status="{ item }">
            <v-chip
              :color="getAuthStatusColor(item.INT_Auth_Status)"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              {{ mapAuthStatus(item.INT_Auth_Status) }}
            </v-chip>
          </template>

          <!-- Auth Status Column -->
          <template #item.Auth_Status="{ item }">
            <v-chip
              :color="getAuthStatusColor(item.Auth_Status)"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              {{ mapAuthStatus(item.Auth_Status) }}
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
                @click="goPath(`/excrate/update?id=${item.id}`)"
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

              <!-- View Charts/Analytics Button -->
              <v-btn
                color="info"
                variant="text"
                size="small"
                icon
                @click="viewDetails(item)"
                class="action-btn"
              >
                <v-icon size="20">mdi-chart-line</v-icon>
                <v-tooltip activator="parent" location="top">
                  ເບິ່ງກາຟິກ
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
                mdi-currency-usd-off
              </v-icon>
              <p class="text-h6 text-grey-lighten-1 mb-2">
                ບໍ່ມີຂໍ້ມູນອັດຕາແລກປ່ຽນ
              </p>
              <p class="text-body-2 text-grey-lighten-1 mb-4">
                ເລີ່ມຕົ້ນໂດຍການເພີ່ມອັດຕາແລກປ່ຽນໃໝ່
              </p>
              <v-btn
                color="primary"
                variant="elevated"
                @click="checkAndCreateNew"
                prepend-icon="mdi-plus"
                :loading="checkingDuplicates"
              >
                ເພີ່ມອັດຕາແລກປ່ຽນ
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Duplicate Currency Warning Dialog -->
    <v-dialog v-model="duplicateWarningDialog" max-width="500">
      <v-card class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="warning" size="28" class="mr-3">mdi-alert</v-icon>
            <span class="text-h6 font-weight-bold text-styles">ເຕືອນສະກຸນເງິນຊໍ້າ</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0">
          <p class="text-body-1 mb-4 text-styles">
            ມີສະກຸນເງິນເຫຼົ່ານີ້ຢູ່ແລ້ວໃນລະບົບ:
          </p>
          <v-list class="bg-warning-lighten-4 rounded">
            <v-list-item
              v-for="currency in existingCurrencies"
              :key="currency"
              prepend-icon="mdi-currency-usd"
            >
              <v-list-item-title class="font-weight-medium">{{ currency }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
            icon="mdi-information"
          >
            ກະລຸນາເລືອກສະກຸນເງິນອື່ນ ຫຼື ແກ້ໄຂສະກຸນເງິນທີ່ມີຢູ່ແລ້ວ
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="duplicateWarningDialog = false"
            class="text-none"
          >
            ປິດ
          </v-btn>
          <v-btn
            color="warning"
            variant="elevated"
            @click="proceedWithDuplicates"
            class="text-none font-weight-medium"
          >
            ສືບຕໍ່ແນວໃດ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບອັດຕາແລກປ່ຽນ <strong>{{ itemToDelete?.ccy_code }}</strong>?
          </p>
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
            class="text-none font-weight-medium"
          >
            ລົບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Enhanced Details Dialog with Charts -->
    <v-dialog v-model="detailsDialog" max-width="1200">
      <v-card class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="info" size="28" class="mr-3">mdi-chart-line</v-icon>
            <span class="text-h6 font-weight-bold">ກາຟິກອັດຕາແລກປ່ຽນ</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-6 pt-0" v-if="selectedItem">
          <!-- Current Details -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="pa-4 pb-2">
              <v-icon class="mr-2" color="primary">mdi-currency-usd</v-icon>
              ຂໍ້ມູນປັດຈຸບັນ
            </v-card-title>
            <v-card-text class="pa-4 pt-2">
              <v-row>
                <v-col cols="12" md="6">
                  <v-list class="pa-0">
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="brown">mdi-currency-usd</v-icon>
                      </template>
                      <v-list-item-title>ສະກຸນເງິນ</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedItem.ccy_code }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="success">mdi-arrow-up-bold</v-icon>
                      </template>
                      <v-list-item-title>ອັດຕາຊື້</v-list-item-title>
                      <v-list-item-subtitle>{{ formatCurrency(selectedItem.Buy_Rate) }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="error">mdi-arrow-down-bold</v-icon>
                      </template>
                      <v-list-item-title>ອັດຕາຂາຍ</v-list-item-title>
                      <v-list-item-subtitle>{{ formatCurrency(selectedItem.Sale_Rate) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list class="pa-0">
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="brown">mdi-calculator</v-icon>
                      </template>
                      <v-list-item-title>ຄ່າຕ່າງ (Spread)</v-list-item-title>
                      <v-list-item-subtitle>{{ formatCurrency(selectedItem.Sale_Rate - selectedItem.Buy_Rate) }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="brown">mdi-calendar</v-icon>
                      </template>
                      <v-list-item-title>ວັນທີສ້າງ</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(selectedItem.value_date) }} {{ formatTime(selectedItem.value_date) }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="brown">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>ສະຖານະ INT</v-list-item-title>
                      <v-list-item-subtitle>{{ mapAuthStatus(selectedItem.INT_Auth_Status) }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item class="px-0">
                      <template #prepend>
                        <v-icon color="brown">mdi-shield-check</v-icon>
                      </template>
                      <v-list-item-title>ສະຖານະອະນຸມັດ</v-list-item-title>
                      <v-list-item-subtitle>{{ mapAuthStatus(selectedItem.Auth_Status) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Rate Trend Chart Section -->
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="pa-4 pb-2">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="primary">mdi-chart-areaspline</v-icon>
                  ແນວໂນ້ມອັດຕາແລກປ່ຽນ
                </div>
                <v-chip color="info" variant="tonal" size="small">
                  7 ວັນຜ່ານມາ
                </v-chip>
              </div>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-center pa-8">
                <v-icon size="64" color="info" class="mb-4">mdi-chart-timeline-variant</v-icon>
                <p class="text-body-1 mb-2">ກາຟິກແນວໂນ້ມອັດຕາແລກປ່ຽນ</p>
                <p class="text-caption text-grey">ເຊື່ອມຕໍ່ກັບ API ເພື່ອສະແດງກາຟິກ</p>
              </div>
            </v-card-text>
          </v-card>

          <!-- History Section -->
          <v-card variant="outlined">
            <v-card-title class="pa-4 pb-2">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="info">mdi-history</v-icon>
                  ປະຫວັດການແກ້ໄຂ
                </div>
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click="fetchHistoryData"
                  :loading="historyLoading"
                  prepend-icon="mdi-refresh"
                >
                  ໂຫຼດປະຫວັດ
                </v-btn>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-0">
              <v-data-table
                :headers="historyHeaders"
                :items="historyItems"
                :loading="historyLoading"
                class="elevation-0"
                item-value="id"
                density="compact"
                :items-per-page="5"
              >
                <!-- Buy Rate Column -->
                <template #item.Buy_Rate="{ item }">
                  <div class="text-right">
                    <div class="d-flex align-center justify-end">
                      <v-icon color="success" size="14" class="mr-1">mdi-arrow-up-bold</v-icon>
                      <div class="font-weight-bold text-success">
                        {{ formatCurrency(item.Buy_Rate) }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Sale Rate Column -->
                <template #item.Sale_Rate="{ item }">
                  <div class="text-right">
                    <div class="d-flex align-center justify-end">
                      <v-icon color="error" size="14" class="mr-1">mdi-arrow-down-bold</v-icon>
                      <div class="font-weight-bold text-error">
                        {{ formatCurrency(item.Sale_Rate) }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Spread Column -->
                <template #item.spread="{ item }">
                  <v-chip
                    :color="getSpreadColor(item.Sale_Rate - item.Buy_Rate)"
                    variant="tonal"
                    size="x-small"
                    class="font-weight-medium"
                  >
                    {{ formatCurrency(item.Sale_Rate - item.Buy_Rate) }}
                  </v-chip>
                </template>

                <!-- Date Column -->
                <template #item.value_date="{ item }">
                  <div class="text-center">
                    <div class="text-caption font-weight-medium">
                      {{ formatDate(item.value_date) }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ formatTime(item.value_date) }}
                    </div>
                  </div>
                </template>

                <!-- Status Column -->
                <template #item.Auth_Status="{ item }">
                  <v-chip
                    :color="getAuthStatusColor(item.Auth_Status)"
                    variant="tonal"
                    size="x-small"
                    class="font-weight-medium"
                  >
                    {{ mapAuthStatus(item.Auth_Status) }}
                  </v-chip>
                </template>

                <!-- Loading Slot -->
                <template #loading>
                  <v-skeleton-loader type="table-row@3" />
                </template>

                <!-- No Data Slot -->
                <template #no-data>
                  <div class="text-center pa-4">
                    <v-icon size="32" color="grey-lighten-2" class="mb-2">
                      mdi-history
                    </v-icon>
                    <p class="text-body-2 text-grey-lighten-1">
                      ບໍ່ມີປະຫວັດການແກ້ໄຂ
                    </p>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
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
            @click="goPath(`/excrate/update?id=${selectedItem?.id}`)"
            class="text-none font-weight-medium"
          >
            ແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/helpers/axios'
import { useRouter } from 'vue-router'
import { ExcRateModel } from '~/models'

const router = useRouter()
const items = ref<ExcRateModel.ExcRateResponse[]>([])
const loading = ref(false)
const search = ref('')
const deleteDialog = ref(false)
const detailsDialog = ref(false)
const duplicateWarningDialog = ref(false)
const checkingDuplicates = ref(false)
const itemToDelete = ref<ExcRateModel.ExcRateResponse | null>(null)
const selectedItem = ref<ExcRateModel.ExcRateResponse | null>(null)
const existingCurrencies = ref<string[]>([])

// History related
const historyItems = ref<any[]>([])
const historyLoading = ref(false)

const headers = [
  { 
    title: 'ສະກຸນເງິນ', 
    key: 'ccy_code',
    align: 'start' as const,
    width: '120px'
  },
  { 
    title: 'ອັດຕາຊື້', 
    key: 'Buy_Rate',
    align: 'end' as const,
    width: '120px'
  },
  { 
    title: 'ອັດຕາຂາຍ', 
    key: 'Sale_Rate',
    align: 'end' as const,
    width: '120px'
  },
  { 
    title: 'ຄ່າຕ່າງ', 
    key: 'spread',
    align: 'center' as const,
    width: '90px',
    sortable: false
  },
  { 
    title: 'ວັນທີສ້າງ', 
    key: 'value_date',
    align: 'center' as const,
    width: '130px'
  },
  { 
    title: 'ສະຖານະ INT', 
    key: 'INT_Auth_Status',
    align: 'center' as const,
    width: '110px'
  },
  { 
    title: 'ສະຖານະອະນຸມັດ', 
    key: 'Auth_Status',
    align: 'center' as const,
    width: '120px'
  },
  { 
    title: 'ການປະຕິບັດ', 
    key: 'actions', 
    sortable: false,
    align: 'center' as const,
    width: '140px'
  }
]

const historyHeaders = [
  { 
    title: 'ອັດຕາຊື້', 
    key: 'Buy_Rate',
    align: 'end' as const,
    width: '120px'
  },
  { 
    title: 'ອັດຕາຂາຍ', 
    key: 'Sale_Rate',
    align: 'end' as const,
    width: '120px'
  },
  { 
    title: 'ຄ່າຕ່າງ', 
    key: 'spread',
    align: 'center' as const,
    width: '80px',
    sortable: false
  },
  { 
    title: 'ວັນທີ', 
    key: 'value_date',
    align: 'center' as const,
    width: '120px'
  },
  { 
    title: 'ສະຖານະ', 
    key: 'Auth_Status',
    align: 'center' as const,
    width: '100px'
  }
]

// Helper functions
const goPath = (path: string) => {
  router.push(path)
}

const formatCurrency = (value: number | string) => {
  if (!value && value !== 0) return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('lo-LA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(num)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return '-'
  }
}

const formatTime = (dateString: string) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('lo-LA', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}

const getSpreadColor = (spread: number) => {
  if (spread < 50) return 'success'
  if (spread < 100) return 'warning'
  return 'error'
}

const getAuthStatusColor = (status: string) => {
  switch (status) {
    case 'A': return 'success'
    case 'P': return 'warning'
    case 'R': return 'error'
    default: return 'grey'
  }
}

const mapAuthStatus = (status: string) => {
  switch (status) {
    case 'A': return 'ອະນຸມັດແລ້ວ'
    case 'P': return 'ລໍຖ້າອະນຸມັດ'
    case 'R': return 'ປະຕິເສດ'
    default: return status || '-'
  }
}

// Duplicate prevention logic
const checkForDuplicates = async () => {
  checkingDuplicates.value = true
  try {
    const res = await axios.get<ExcRateModel.ExcRateResponse[]>('api/exc-rate/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    return res.data.map(item => item.ccy_code).filter(code => code) as string[]
  } catch (error) {
    console.error('Error checking for duplicates:', error)
    return []
  } finally {
    checkingDuplicates.value = false
  }
}

const checkAndCreateNew = async () => {
  const existingCodes = await checkForDuplicates()
  
  if (existingCodes.length > 0) {
    existingCurrencies.value = existingCodes
    duplicateWarningDialog.value = true
  } else {
    goPath('/excrate/create')
  }
}

const proceedWithDuplicates = () => {
  duplicateWarningDialog.value = false
  // Pass existing currencies as query params to warn user in create form
  const existingCodesParam = existingCurrencies.value.join(',')
  goPath(`/excrate/create?existing=${encodeURIComponent(existingCodesParam)}`)
}

const confirmDelete = (item: ExcRateModel.ExcRateResponse) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const viewDetails = async (item: ExcRateModel.ExcRateResponse) => {
  selectedItem.value = item
  detailsDialog.value = true
  // Fetch history when dialog opens
  await fetchHistoryData()
}

const deleteItem = async () => {
  if (itemToDelete.value) {
    try {
      await axios.delete(`api/exc-rate/${itemToDelete.value.id}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      
      // Remove item from local array
      const index = items.value.findIndex(item => item.id === itemToDelete.value?.id)
      if (index > -1) {
        items.value.splice(index, 1)
      }
      
      deleteDialog.value = false
      itemToDelete.value = null
    } catch (error) {
      console.error('Error deleting item:', error)
      // Show error notification
    }
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.get<ExcRateModel.ExcRateResponse[]>('api/exc-rate/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    items.value = res.data
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
}

const fetchHistoryData = async () => {
  if (!selectedItem.value?.ccy_code) return
  
  historyLoading.value = true
  try {
    const res = await axios.get(
      `api/exchange-rate-history-for-ccy/${selectedItem.value.ccy_code}/`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    historyItems.value = res.data
  } catch (error) {
    console.error('Error fetching history data:', error)
    historyItems.value = []
  } finally {
    historyLoading.value = false
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

/* Rate display improvements */
.rate-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.rate-icon {
  margin-right: 4px;
}
</style>