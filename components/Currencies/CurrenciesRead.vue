<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="rounded-lg">
      <v-card-title class="pa-6 pb-4">
        <h2 class="text-h5 font-weight-medium text-styles">ຈັດການສະກຸນເງິນ</h2>
      </v-card-title>
      
      <!-- Header Actions -->
      <v-card-text class="pa-6 pt-0">
        <v-row align="center" class="mb-6">
          <v-col>
            <div class="d-flex align-center">
              <v-icon color="grey-darken-1" class="mr-2">mdi-information-outline</v-icon>
              <span class="text-body-2 text-grey-darken-1 text-styles">
                ຈັດການຂໍ້ມູນສະກຸນເງິນທັງໝົດ
              </span>
            </div>
          </v-col>
          <v-col cols="auto">
            <v-btn
              @click="goPath('/currency/create')"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              class="text-none font-weight-medium px-6 py-2"
              size="medium"
            >
              ເພີ່ມສະກຸນເງິນໃຫມ່
            </v-btn>
          </v-col>
        </v-row>

      

        <!-- Enhanced Data Table -->
        <v-data-table
          :headers="headers"
          :items="items"
          :loading="loading"
          class="elevation-0 rounded-lg custom-table"
          item-value="ccy_code"
          hover
          :items-per-page="10"
          :search="search"
        >
          <!-- Search Bar -->
          <template #top>
            <div class="pa-4 d-flex align-center">
              
              <v-spacer />
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
            </div>
          </template>

          <!-- Currency Code Column -->
          <template #item.ccy_code="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="32"
                color="primary"
                variant="tonal"
                class="mr-3"
              >
                <span class="font-weight-bold text-caption">{{ item.ccy_code.substring(0, 2) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.ccy_code }} - {{ item.ALT_Ccy_Code }}</div>
              </div>
            </div>
          </template>

          <!-- Currency Name Column -->
          <template #item.Ccy_Name_en="{ item }">
            <div class="font-weight-medium">{{ item.Ccy_Name_en }}</div>
          </template>

          <!-- Country Column -->
          <template #item.Country="{ item }">
            <v-chip
              color="info"
              variant="tonal"
              size="small"
              prepend-icon="mdi-flag"
              class="font-weight-medium"
            >
              {{ item.Country }}
            </v-chip>
          </template>

          <!-- Decimals Column -->
          <template #item.Ccy_Decimals="{ item }">
            <v-chip
              :color="getDecimalColor(item.Ccy_Decimals)"
              variant="tonal"
              size="small"
              class="font-weight-bold"
            >
              {{ item.Ccy_Decimals }} ໂດຊີ
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
                @click="goPath(`/currency/update?code=${item.ccy_code}`)"
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
                mdi-currency-off
              </v-icon>
              <p class="text-h6 text-grey-lighten-1 mb-2">
                ບໍ່ມີຂໍ້ມູນສະກຸນເງິນ
              </p>
              <p class="text-body-2 text-grey-lighten-1 mb-4">
                ເລີ່ມຕົ້ນໂດຍການເພີ່ມສະກຸນເງິນໃຫມ່
              </p>
              <v-btn
                color="primary"
                variant="elevated"
                @click="goPath('/currency/create')"
                prepend-icon="mdi-plus"
              >
                ເພີ່ມສະກຸນເງິນ
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
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບສະກຸນເງິນ <strong>{{ itemToDelete?.ccy_code }}</strong>?
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

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="500">
      <v-card class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="info" size="28" class="mr-3">mdi-information</v-icon>
            <span class="text-h6 font-weight-bold">ລາຍລະອຽດສະກຸນເງິນ</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-6 pt-0" v-if="selectedItem">
          <v-list class="pa-0">
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="primary">mdi-currency-usd</v-icon>
              </template>
              <v-list-item-title>ລະຫັດສະກຸນ</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem.ccy_code }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="success">mdi-text</v-icon>
              </template>
              <v-list-item-title>ຊື່ສະກຸນເງິນ</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem.Ccy_Name_en }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="info">mdi-flag</v-icon>
              </template>
              <v-list-item-title>ປະເທດ</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem.Country }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item class="px-0">
              <template #prepend>
                <v-icon color="warning">mdi-decimal</v-icon>
              </template>
              <v-list-item-title>ຈຳນວນທົດສະນິຍົມ</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem.Ccy_Decimals }} ຕຳແໜ່ງ</v-list-item-subtitle>
            </v-list-item>
          </v-list>
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
            @click="goPath(`/currency/update?code=${selectedItem?.ccy_code}`)"
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
import { ref, onMounted, computed } from 'vue'
import axios from '@/helpers/axios'
import { useRouter } from 'vue-router'
import { CurrencyModel } from '~/models'

const router = useRouter()
const items = ref<CurrencyModel.CurrencyResponse[]>([])
const loading = ref(false)
const search = ref('')
const deleteDialog = ref(false)
const detailsDialog = ref(false)
const itemToDelete = ref<CurrencyModel.CurrencyResponse | null>(null)
const selectedItem = ref<CurrencyModel.CurrencyResponse | null>(null)

const headers = [
  { 
    title: 'ລະຫັດສະກຸນ', 
    key: 'ccy_code',
    align: 'start' as const,
    width: '180px'
  },
  { 
    title: 'ຊື່ສະກຸນເງິນ', 
    key: 'Ccy_Name_en',
    align: 'start' as const
  },
  { 
    title: 'ປະເທດ', 
    key: 'Country',
    align: 'center' as const,
    width: '140px'
  },
  { 
    title: 'ທົດສະນິຍົມ', 
    key: 'Ccy_Decimals',
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

// Computed properties (removed unused statistics)
// const activeCount = computed(() => {
//   return items.value.filter(item => item.ccy_code).length
// })

// const uniqueCountries = computed(() => {
//   const countries = new Set(items.value.map(item => item.Country))
//   return countries.size
// })

// const avgDecimals = computed(() => {
//   if (items.value.length === 0) return 0
//   const total = items.value.reduce((sum, item) => sum + (item.Ccy_Decimals || 0), 0)
//   return Math.round(total / items.value.length * 10) / 10
// })

// Helper functions
const goPath = (path: string) => {
  router.push(path)
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '-'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const getDecimalColor = (decimals: number) => {
  if (decimals === 0) return 'warning'
  if (decimals <= 2) return 'success'
  return 'info'
}

const confirmDelete = (item: CurrencyModel.CurrencyResponse) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const viewDetails = (item: CurrencyModel.CurrencyResponse) => {
  selectedItem.value = item
  detailsDialog.value = true
}

const deleteItem = async () => {
  if (itemToDelete.value) {
    try {
      // Add your delete API call here
      await axios.delete(`api/currencies/${itemToDelete.value.ccy_code}`)
      
      // Remove item from local array for now
      const index = items.value.findIndex(item => item.ccy_code === itemToDelete.value?.ccy_code)
      if (index > -1) {
        items.value.splice(index, 1)
      }
      
      deleteDialog.value = false
      itemToDelete.value = null
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.get<CurrencyModel.CurrencyResponse[]>('api/currencies/', {
      headers: {
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

/* Statistics cards hover effect */
:deep(.v-card) {
  transition: transform 0.2s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
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