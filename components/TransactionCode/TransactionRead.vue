<!-- components/TransactionCodeList.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTransactionCodes, TransactionCode } from '@/composables/useTransactionCodes'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

// Router instance
const router = useRouter()

// Use composable
const { codes: transactionCodes, loading, error, fetchCodes } = useTransactionCodes()

// State for filters and pagination
const search = ref('')
const selectedStatus = ref('all')
const selectedAuthStatus = ref('all')
const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: 'asc' | 'desc' }>({ key: 'trn_code', order: 'asc' })

// Delete dialog state
const deleteDialog = ref(false)
const itemToDelete = ref<TransactionCode | null>(null)
const loadingDelete = ref(false)

function confirmDelete(item: TransactionCode) {
  itemToDelete.value = item
  deleteDialog.value = true
}

async function deleteTransaction() {
  if (!itemToDelete.value) return
  loadingDelete.value = true
  try {
    await axios.delete(`/api/trn-codes/${itemToDelete.value.trn_code}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    await fetchCodes() // Refresh the list
    deleteDialog.value = false
    itemToDelete.value = null
  } catch (error) {
    console.error('Delete error:', error)
    // You can add error notification here
  } finally {
    loadingDelete.value = false
  }
}

// Navigation functions
const goPath = (path: string) => {
  router.push(path)
}

const editTransaction = (item: TransactionCode) => {
  router.push(`/transactioncode/update?id=${item.trn_code}`)
}

// Debounced search
const debouncedSearch = ref('')
let searchTimeout: NodeJS.Timeout

watch(search, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newValue
    page.value = 1 // Reset to first page on search
  }, 300)
})

// Computed properties
const filteredCodes = computed(() => {
  let filtered = [...transactionCodes.value]

  // Search filter
  if (debouncedSearch.value) {
    const searchLower = debouncedSearch.value.toLowerCase()
    filtered = filtered.filter(code => 
      code.trn_code.toLowerCase().includes(searchLower) ||
      code.trn_Desc_en?.toLowerCase().includes(searchLower) ||
      code.trn_Desc_la?.toLowerCase().includes(searchLower)
    )
  }

  // Status filter
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(code => code.Record_Status === selectedStatus.value)
  }

  // Auth status filter
  if (selectedAuthStatus.value !== 'all') {
    filtered = filtered.filter(code => code.Auth_Status === selectedAuthStatus.value)
  }

  // Sorting
  filtered.sort((a, b) => {
    const aVal = a[sortBy.value.key as keyof TransactionCode]
    const bVal = b[sortBy.value.key as keyof TransactionCode]
    
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1
    
    const compare = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortBy.value.order === 'asc' ? compare : -compare
  })

  return filtered
})

const paginatedCodes = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredCodes.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredCodes.value.length / itemsPerPage.value)
)

const headers = [
  { title: 'ລະຫັດທຸລະກຳ', key: 'trn_code', align: 'start', width: '200px' },
  { title: 'ລາຍລະອຽດ (ອັງກິດ)', key: 'trn_Desc_en', align: 'start' },
  { title: 'ລາຍລະອຽດ (ລາວ)', key: 'trn_Desc_la', align: 'start' },
  { title: 'ສະຖານະບັນທຶກ', key: 'Record_Status', align: 'center', width: '140px' },
  { title: 'ສະຖານະອະນຸມັດ', key: 'Auth_Status', align: 'center', width: '140px' },
  { title: 'ການປະຕິບັດ', key: 'actions', sortable: false, align: 'center', width: '120px' }
];

// Status helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case 'C': return 'success'
    case 'D': return 'error'
    case 'O': return 'warning'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'C': return 'ເປີດໃຊ້ງານ'
    case 'D': return 'ລົບແລ້ວ'
    case 'O': return 'ປິດໃຊ້ງານ'
    default: return status
  }
}

const getAuthStatusColor = (status: string) => {
  switch (status) {
    case 'A': return 'success'
    case 'U': return 'warning'
    case 'R': return 'error'
    default: return 'grey'
  }
}

const getAuthStatusText = (status: string) => {
  switch (status) {
    case 'A': return 'ອະນຸມັດແລ້ວ'
    case 'U': return 'ລໍຖ້າອະນຸມັດ'
    case 'R': return 'ປະຕິເສດ'
    default: return status
  }
}

// Sorting
const toggleSort = (key: string) => {
  if (sortBy.value.key === key) {
    sortBy.value.order = sortBy.value.order === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = { key, order: 'asc' }
  }
}

const getSortIcon = (key: string) => {
  if (sortBy.value.key !== key) return 'mdi-sort'
  return sortBy.value.order === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'
}

// Refresh data
const refresh = async () => {
  await fetchCodes()
}

// Reset filters
const resetFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  selectedStatus.value = 'all'
  selectedAuthStatus.value = 'all'
  page.value = 1
}

// View details dialog
const showDetails = ref(false)
const selectedCode = ref<TransactionCode | null>(null)

const viewDetails = (code: TransactionCode) => {
  selectedCode.value = code
  showDetails.value = true
}

// Copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // You can add a snackbar notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Initialize
onMounted(() => {
  fetchCodes()
})

// Watch for filter changes to reset page
watch([selectedStatus, selectedAuthStatus], () => {
  page.value = 1
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="rounded-lg">
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="28">mdi-code-tags</v-icon>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1 text-styles">ຈັດການລະຫັດການເຮັດທຸລະກຳ</h2>
              <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
                ຄຸ້ມຄອງແລະຕິດຕາມລະຫັດການເຮັດທຸລະກຳໃນລະບົບ
              </p>
            </div>
          </div>
          <div class="d-flex align-center gap-2">
            <v-chip color="info" variant="tonal" prepend-icon="mdi-database">
              {{ filteredCodes.length }} ລາຍການ
            </v-chip>
          </div>
        </div>
      </v-card-title>

      <!-- Header Actions -->
      <v-card-text class="pa-6 pt-0">
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="2">
            <v-btn
              @click="goPath('/transactioncode/create')"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              class="text-none"
            >
              ເພີ່ມລະຫັດ
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="2">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="refresh"
              :loading="loading"
              class="text-none"
              block
            >
              ໂຫຼດໃໝ່
            </v-btn>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="ຄົ້ນຫາລະຫັດ ຫຼື ລາຍລະອຽດ..."
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              density="comfortable"
              variant="outlined"
              placeholder="ພິມເພື່ອຄົ້ນຫາ..."
            />
          </v-col>
        </v-row>

        <!-- Filters -->
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedStatus"
              label="ສະຖານະບັນທຶກ"
              :items="[
                { value: 'all', title: 'ທັງໝົດ' },
                { value: 'C', title: 'ເປີດໃຊ້ງານ' },
                { value: 'O', title: 'ປິດໃຊ້ງານ' },
              ]"
              hide-details
              density="comfortable"
              variant="outlined"
              prepend-inner-icon="mdi-database"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedAuthStatus"
              label="ສະຖານະອະນຸມັດ"
              :items="[
                { value: 'all', title: 'ທັງໝົດ' },
                { value: 'A', title: 'ອະນຸມັດແລ້ວ' },
                { value: 'U', title: 'ລໍຖ້າອະນຸມັດ' },
              ]"
              hide-details
              density="comfortable"
              variant="outlined"
              prepend-inner-icon="mdi-check-circle"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              variant="outlined"
              color="primary"
              @click="resetFilters"
              block
              prepend-icon="mdi-filter-remove"
              class="text-none"
            >
              ເຄລຍຟິວເຕີ
            </v-btn>
          </v-col>
        </v-row>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          variant="tonal"
          closable
          @click:close="error = ''"
        >
          <v-alert-title>ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</v-alert-title>
          {{ error }}
        </v-alert>

        <!-- Enhanced Data Table -->
        <v-data-table
          :headers="headers"
          :items="paginatedCodes"
          :loading="loading"
          class="elevation-0 rounded-lg custom-table"
          item-value="trn_code"
          hover
          hide-default-footer
        >
          <!-- Transaction Code Column -->
          <template #item.trn_code="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="32"
                color="primary"
                variant="tonal"
                class="mr-3"
              >
                <span class="font-weight-bold text-caption">
                  {{ item.trn_code.substring(0, 2) || 'TC' }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.trn_code }}</div>
                <div class="text-caption text-grey">ລະຫັດທຸລະກຳ</div>
              </div>
              <v-btn
                icon="mdi-content-copy"
                size="x-small"
                variant="text"
                class="ml-1"
                @click="copyToClipboard(item.trn_code)"
              >
                <v-tooltip activator="parent" location="top">
                  ສຳເນົາ
                </v-tooltip>
              </v-btn>
            </div>
          </template>

          <!-- English Description Column -->
          <template #item.trn_Desc_en="{ item }">
            <div>
              <v-tooltip v-if="item.trn_Desc_en && item.trn_Desc_en.length > 40" location="top">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" class="font-weight-medium">
                    {{ item.trn_Desc_en.substring(0, 40) }}...
                  </div>
                </template>
                {{ item.trn_Desc_en }}
              </v-tooltip>
              <div v-else class="font-weight-medium">{{ item.trn_Desc_en || '-' }}</div>
              <div class="text-caption text-grey">ລາຍລະອຽດ (ອັງກິດ)</div>
            </div>
          </template>

          <!-- Lao Description Column -->
          <template #item.trn_Desc_la="{ item }">
            <div>
              <div class="font-weight-medium">{{ item.trn_Desc_la || '-' }}</div>
              <div class="text-caption text-grey">ລາຍລະອຽດ (ລາວ)</div>
            </div>
          </template>

          <!-- Record Status Column -->
          <template #item.Record_Status="{ item }">
            <v-chip
              :color="getStatusColor(item.Record_Status)"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              {{ getStatusText(item.Record_Status) }}
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
              {{ getAuthStatusText(item.Auth_Status) }}
            </v-chip>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <div class="d-flex align-center gap-1">
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
              <v-btn
                color="primary"
                variant="text"
                size="small"
                icon
                @click="editTransaction(item)"
                class="action-btn"
              >
                <v-icon size="20">mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">
                  ແກ້ໄຂ
                </v-tooltip>
              </v-btn>
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
            </div>
          </template>

          <!-- Loading Slot -->
          <template #loading>
            <v-skeleton-loader type="table-row@10" />
          </template>

          <!-- No Data Slot -->
          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">
                mdi-code-tags-check
              </v-icon>
              <p class="text-h6 text-grey-lighten-1 mb-2">
                ບໍ່ມີຂໍ້ມູນລະຫັດທຸລະກຳ
              </p>
              <p class="text-body-2 text-grey-lighten-1 mb-4">
                {{ search ? 'ລອງປັບປຸງເງື່ອນໄຂການຄົ້ນຫາ' : 'ບໍ່ມີຂໍ້ມູນ' }}
              </p>
            </div>
          </template>
        </v-data-table>

        <!-- Custom Pagination -->
        <div class="d-flex align-center justify-space-between mt-4 pt-4" style="border-top: 1px solid rgb(var(--v-theme-surface-variant));">
          <div class="text-caption text-grey">
            ສະແດງ {{ (page - 1) * itemsPerPage + 1 }} - 
            {{ Math.min(page * itemsPerPage, filteredCodes.length) }} 
            ຈາກ {{ filteredCodes.length }} ລາຍການ
          </div>
          <div class="d-flex align-center gap-4">
            <div class="d-flex align-center">
              <span class="text-caption text-grey mr-2">ລາຍການຕໍ່ໜ້າ:</span>
              <v-select
                v-model="itemsPerPage"
                :items="[10, 25, 50, 100]"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 80px"
                @update:model-value="page = 1"
              />
            </div>
            <v-pagination
              v-if="totalPages > 1"
              v-model="page"
              :length="totalPages"
              :total-visible="5"
              rounded="circle"
              size="small"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          ຢືນຢັນການລົບ
        </v-card-title>
        <v-card-text>
          ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບລະຫັດທຸລະກຳ: <strong>{{ itemToDelete?.trn_code }}</strong>?
          <br>
          <span class="text-caption text-error">ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="deleteDialog = false"
            :disabled="loadingDelete"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn 
            color="error" 
            variant="elevated"
            :loading="loadingDelete" 
            @click="deleteTransaction"
            prepend-icon="mdi-delete"
          >
            ລົບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Details Dialog -->
    <v-dialog v-model="showDetails" max-width="700" scrollable>
      <v-card v-if="selectedCode" class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="primary" size="28" class="mr-3">mdi-code-tags</v-icon>
            <span class="text-h6 font-weight-bold">ລາຍລະອຽດລະຫັດທຸລະກຳ</span>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6 pt-0" v-if="selectedCode">
          <v-row>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-code-tags</v-icon>
                  </template>
                  <v-list-item-title>ລະຫັດທຸລະກຳ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCode.trn_code }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-text</v-icon>
                  </template>
                  <v-list-item-title>ລາຍລະອຽດ (ອັງກິດ)</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCode.trn_Desc_en || 'ບໍ່ມີຂໍ້ມູນ' }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-text-box</v-icon>
                  </template>
                  <v-list-item-title>ລາຍລະອຽດ (ລາວ)</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCode.trn_Desc_la || 'ບໍ່ມີຂໍ້ມູນ' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-database</v-icon>
                  </template>
                  <v-list-item-title>ສະຖານະບັນທຶກ</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getStatusColor(selectedCode.Record_Status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getStatusText(selectedCode.Record_Status) }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>ສະຖານະອະນຸມັດ</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-chip
                      :color="getAuthStatusColor(selectedCode.Auth_Status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getAuthStatusText(selectedCode.Auth_Status) }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-lock</v-icon>
                  </template>
                  <v-list-item-title>ອະນຸມັດຄັ້ງດຽວ</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-icon :color="selectedCode.Once_Auth === 'Y' ? 'success' : 'grey'" size="16">
                      {{ selectedCode.Once_Auth === 'Y' ? 'mdi-check' : 'mdi-close' }}
                    </v-icon>
                    {{ selectedCode.Once_Auth === 'Y' ? 'ໃຊ່' : 'ບໍ່' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-account-plus</v-icon>
                  </template>
                  <v-list-item-title>ຜູ້ສ້າງ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCode.maker_username || 'ລະບົບ' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>ວັນທີສ້າງ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedCode.Maker_DT_Stamp ? new Date(selectedCode.Maker_DT_Stamp).toLocaleString('lo-LA') : '-' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>

          <v-row v-if="selectedCode.Checker_Id">
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-account-check</v-icon>
                  </template>
                  <v-list-item-title>ຜູ້ກວດສອບ</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedCode.checker_username || '-' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon color="orange">mdi-calendar-check</v-icon>
                  </template>
                  <v-list-item-title>ວັນທີກວດສອບ</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ selectedCode.Checker_DT_Stamp ? new Date(selectedCode.Checker_DT_Stamp).toLocaleString('lo-LA') : '-' }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDetails = false"
            class="text-none"
          >
            ປິດ
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-pencil"
            @click="editTransaction(selectedCode)"
            class="text-none font-weight-medium"
          >
            ແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

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

.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

/* Card hover effect */
.v-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>