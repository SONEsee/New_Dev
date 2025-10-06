<template>
  <div class="gl-approved-master">
    <!-- Page Header - Compact -->
    <div class="page-header-compact">
      <div class="d-flex justify-space-between align-center">
        <h1 class="page-title-compact">
          <v-icon color="primary" size="20" class="mr-2">mdi-book-check</v-icon>
          ລາຍການບັນທຶກບັນຊີ
        </h1>

        <!-- Permission indicators - Only show when ready -->
        <div class="permission-indicators" v-if="isReady && permissions">
          <v-tooltip text="ສິດເຂົ້າເຖິງຂອງທ່ານ" location="bottom">
            <template #activator="{ props }">
              <div v-bind="props" class="d-flex gap-1">
                <v-chip v-if="canAdd" color="primary" size="x-small" variant="flat">
                  <v-icon size="12">mdi-plus</v-icon>
                  ເພິ່ມ
                </v-chip>
                <v-chip v-if="canView" color="info" size="x-small" variant="flat">
                  <v-icon size="12">mdi-eye</v-icon>
                  ເບິ່ງ
                </v-chip>
                <v-chip v-if="canEdit" color="warning" size="x-small" variant="flat">
                  <v-icon size="12">mdi-pencil</v-icon>
                  ແກ້
                </v-chip>
                <v-chip v-if="canDelete" color="error" size="x-small" variant="flat">
                  <v-icon size="12">mdi-delete</v-icon>
                  ລຶບ
                </v-chip>
                <v-chip v-if="canAuthorize" color="success" size="x-small" variant="flat">
                  <v-icon size="12">mdi-check-circle</v-icon>
                  ອະນຸມັດ
                </v-chip>
              </div>
            </template>
          </v-tooltip>
        </div>
      </div>
    </div>

    <!-- Permission Loading State -->
    <div v-if="!permissionCheckComplete || permissionsLoading" class="loading-overlay">
      <v-card class="text-center py-12" elevation="1">
        <v-progress-circular
          indeterminate
          color="primary"
          :size="60"
          :width="4"
          class="mb-6"
        />
        <div class="text-h6 mb-3">ກຳລັງກວດສອບສິດການນຳໃຊ້...</div>
        <div class="text-body-2 text-grey">ກະລຸນາລໍຖ້າ...</div>
      </v-card>
    </div>

    <!-- Permission Error State -->
    <div v-else-if="initializationError" class="permission-error-state">
      <v-card class="text-center py-12" elevation="1">
        <v-icon size="80" color="error" class="mb-6">mdi-alert-circle</v-icon>
        <div class="text-h5 mb-3 text-error">ເກີດຂໍ້ຜິດພາດ</div>
        <div class="text-body-1 mb-4 text-grey">{{ initializationError }}</div>
        <v-btn
          color="primary"
          variant="elevated"
          @click="retryPermissionLoad"
          prepend-icon="mdi-refresh"
          size="large"
        >
          ລອງໃໝ່
        </v-btn>
      </v-card>
    </div>

    <!-- Main Content - Only show when permissions are ready -->
    <div v-else-if="isReady">
      <!-- Permission Access Check -->
      <div v-if="!canView" class="permission-denied-state">
        <v-card class="text-center py-12" elevation="1">
          <v-icon size="80" color="error" class="mb-6">mdi-shield-lock</v-icon>
          <div class="text-h5 mb-3 text-error">ບໍ່ມີສິດເຂົ້າເຖິງ</div>
          <div class="text-body-1 mb-4 text-grey">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</div>
          <div class="text-caption text-grey mb-6 px-4">
            <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
            ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບເພື່ອຂໍສິດເຂົ້າເຖິງ
          </div>
          <v-btn variant="outlined" @click="$router.go(-1)" prepend-icon="mdi-arrow-left" size="large">
            ກັບໄປໜ້າກ່ອນ
          </v-btn>
        </v-card>
      </div>

      <!-- Main Content (only show if user has view permission) -->
      <div v-else>
        <!-- Data Access Info -->
        <!-- <v-alert v-if="canAuthorize" type="success" variant="tonal" density="compact" class="mb-3">
          <template #prepend>
            <v-icon>mdi-check-circle</v-icon>
          </template>
          <strong>ສິດເຂົ້າເຖິງ:</strong> ທ່ານສາມາດເບິ່ງລາຍການທັງໝົດໄດ້
        </v-alert>

        <v-alert v-else type="info" variant="tonal" density="compact" class="mb-3">
          <template #prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          <strong>ສິດເຂົ້າເຖິງ:</strong> ທ່ານສາມາດເບິ່ງລາຍການທີ່ທ່ານສ້າງເທົ່ານັ້ນ
        </v-alert> -->

        <!-- Filter Section - Thinner -->
        <v-card class="filter-card-thin mb-2" elevation="1">
          <v-card-text class="pa-2">
            <v-row dense>
              <v-col cols="12" md="3">
                <v-text-field 
                  v-model="filters.search" 
                  label="ຄົ້ນຫາ" 
                  prepend-inner-icon="mdi-magnify" 
                  variant="outlined"
                  density="compact" 
                  clearable 
                  placeholder="ເລກອ້າງອີງ, ຂໍ້ຄວາມ..." 
                  @update:model-value="searchDebounced"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select 
                  v-model="filters.module_id" 
                  :items="modules" 
                  item-title="module_name_la" 
                  item-value="module_Id"
                  label="ໂມດູນ" 
                  variant="outlined" 
                  density="compact" 
                  clearable 
                  @update:model-value="handleFilterChange"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select 
                  v-model="filters.Ccy_cd" 
                  :items="currencies" 
                  item-title="ccy_code" 
                  item-value="ccy_code"
                  label="ສະກຸນເງິນ" 
                  variant="outlined" 
                  density="compact" 
                  clearable 
                  @update:model-value="handleFilterChange"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select 
                  v-model="filters.Auth_Status" 
                  :items="authStatusOptions" 
                  item-title="text" 
                  item-value="value"
                  label="ສະຖານະອະນຸມັດ" 
                  variant="outlined" 
                  density="compact" 
                  clearable 
                  @update:model-value="loadData"
                  hide-details 
                  :loading="loadingAuthStatus"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field 
                  v-model="filters.date" 
                  label="ວັນທີເລີ່ມ" 
                  type="date" 
                  variant="outlined" 
                  density="compact"
                  @update:model-value="handleFilterChange" 
                  hide-details
                  :hint="getDateHint()"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" md="1">
                <v-btn 
                  color="primary" 
                  variant="flat" 
                  @click="loadData" 
                  :loading="loading" 
                  block 
                  size="small"
                >
                  <v-icon size="16">mdi-filter</v-icon>
                  ຄົ້ນຫາ
                </v-btn>
              </v-col>
            </v-row>
            
            <!-- Clear Filters Button -->
            <v-row dense class="mt-1">
              <v-col cols="12" class="text-right">
                <v-btn color="grey" variant="text" @click="clearAllFilters" size="x-small">
                  <v-icon left size="14">mdi-filter-off</v-icon>
                  ລຶບຕົວກອງ
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Summary Cards - Updated with active state -->
        <v-row dense class="mb-3">
          <v-col cols="6" sm="3" md="2">
            <v-card 
              class="summary-card-thin" 
              :class="{ 'active-filter': filters.Auth_Status === null }"
              elevation="1" 
              @click="setAuthStatusFilter(null)" 
              style="cursor:pointer"
            >
              <v-card-text class="pa-2">
                <div class="d-flex align-center">
                  <v-icon size="20" color="primary" class="mr-2">mdi-file-document-multiple</v-icon>
                  <div>
                    <div class="summary-value-thin">{{ summary.total }}</div>
                    <div class="summary-label-thin">ລາຍການທັງໝົດ</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-card 
              class="summary-card-thin" 
              :class="{ 'active-filter': filters.Auth_Status === 'U' }"
              elevation="1" 
              @click="setAuthStatusFilter('U')" 
              style="cursor:pointer"
            >
              <v-card-text class="pa-2">
                <div class="d-flex align-center">
                  <v-icon size="20" color="warning" class="mr-2">mdi-clock-outline</v-icon>
                  <div>
                    <div class="summary-value-thin">{{ summary.pending }}</div>
                    <div class="summary-label-thin">ລໍຖ້າອະນຸມັດ</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-card 
              class="summary-card-thin" 
              :class="{ 'active-filter': filters.Auth_Status === 'A' }"
              elevation="1" 
              @click="setAuthStatusFilter('A')" 
              style="cursor:pointer"
            >
              <v-card-text class="pa-2">
                <div class="d-flex align-center">
                  <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
                  <div>
                    <div class="summary-value-thin">{{ summary.approved }}</div>
                    <div class="summary-label-thin">ອະນຸມັດແລ້ວ</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-card 
              class="summary-card-thin" 
              :class="{ 'active-filter': filters.Auth_Status === 'R' }"
              elevation="1" 
              @click="setAuthStatusFilter('R')" 
              style="cursor:pointer"
            >
              <v-card-text class="pa-2">
                <div class="d-flex align-center">
                  <v-icon size="20" color="error" class="mr-2">mdi-close-circle</v-icon>
                  <div>
                    <div class="summary-value-thin">{{ summary.rejected }}</div>
                    <div class="summary-label-thin">ປະຕິເສດ</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" sm="3" md="2">
            <v-card 
              class="summary-card-thin" 
              :class="{ 'active-filter': filters.Auth_Status === 'P' }"
              elevation="1" 
              @click="setAuthStatusFilter('P')" 
              style="cursor:pointer"
            >
              <v-card-text class="pa-2">
                <div class="d-flex align-center">
                  <v-icon size="20" color="info" class="mr-2">mdi-pencil-circle</v-icon>
                  <div>
                    <div class="summary-value-thin">{{ summary.correction }}</div>
                    <div class="summary-label-thin">ຖ້າເແກ້ໄຂ</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Data Table - Compact -->
        <v-card elevation="1" class="data-table-card-thin">
          <!-- Updated Data Table Title -->
          <v-card-title class="d-flex justify-space-between align-center pa-3">
            <span class="text-h6">
              ລາຍການບັນທຶກບັນຊີ
              <v-chip size="small" color="primary" variant="outlined" class="ml-2">
                {{ canAuthorize ? 'ທັງໝົດ' : 'ຂອງຂ້ອຍ' }}
              </v-chip>
              <!-- Show current filter status -->
              <v-chip 
                v-if="filters.Auth_Status" 
                size="small" 
                :color="getStatusColor(filters.Auth_Status)" 
                variant="flat" 
                class="ml-2"
              >
                <v-icon left size="12">{{ getStatusIcon(filters.Auth_Status) }}</v-icon>
                {{ getStatusText(filters.Auth_Status) }}
              </v-chip>
              <v-chip 
                v-else 
                size="small" 
                color="grey" 
                variant="flat" 
                class="ml-2"
              >
                <v-icon left size="12">mdi-filter-off</v-icon>
                ທັງໝົດ
              </v-chip>
            </span>
            <div>
              <v-btn 
                v-if="canAdd" 
                color="primary" 
                variant="flat" 
                @click="navigateToCreate" 
                prepend-icon="mdi-plus"
                class="mr-2" 
                size="small"
              >
                ເພີ່ມບັນທຶກໃຫມ່
              </v-btn>
              <v-btn 
                color="success" 
                variant="text" 
                @click="exportData" 
                :disabled="items.length === 0" 
                class="mr-2"
                size="small"
              >
                <v-icon left size="16">mdi-download</v-icon>
                ສົ່ງອອກ
              </v-btn>
              <v-btn color="primary" variant="text" @click="loadData" size="small">
                <v-icon left size="16">mdi-refresh</v-icon>
                ໂຫຼດໃໝ່
              </v-btn>
            </div>
          </v-card-title>

          <v-data-table 
            :headers="headers" 
            :items="items" 
            :loading="loading" 
            :search="filters.search" 
            :items-per-page="10"
            density="compact" 
            class="elevation-0 full-width-table-thin" 
            item-value="JRNLLog_id"
          >
            <!-- Reference No -->
            <template v-slot:item.Reference_No="{ item }">
              <v-chip 
                v-if="canView" 
                size="x-small" 
                color="primary" 
                variant="outlined" 
                @click="viewDetails(item)"
                class="cursor-pointer"
              >
                {{ item.Reference_No }}
              </v-chip>
            </template>

            <!-- Module -->
            <template v-slot:item.module_id="{ item }">
              <span v-if="item.module_id" class="text-compact">
                {{ getModuleName(item.module_id) }}
              </span>
              <span v-else class="text-grey">-</span>
            </template>

            <!-- Currency and Amount -->
            <template v-slot:item.Fcy_Amount="{ item }">
              <div class="text-right text-compact">
                <strong>{{ formatNumber(item.Fcy_Amount) }}</strong>
                <span class="text-grey ml-1">{{ item.Ccy_cd }}</span>
              </div>
            </template>

            <!-- LCY Amount -->
            <template v-slot:item.Lcy_Amount="{ item }">
              <div class="text-right text-compact">
                {{ formatNumber(item.Lcy_Amount) }} LAK
              </div>
            </template>

            <!-- Transaction Code -->
            <template v-slot:item.Txn_code="{ item }">
              <v-chip size="x-small" variant="flat" color="info">
                {{ item.Txn_code || '-' }}
              </v-chip>
            </template>

            <template v-slot:item.Addl_text="{ item }">
              <div class="text-truncate text-compact">
                <v-tooltip v-if="item.Addl_text" location="top">
                  <template v-slot:activator="{ props }">
                    <span v-bind="props">{{ item.Addl_text || '-' }}</span>
                  </template>
                  <span>{{ item.Addl_text }}</span>
                </v-tooltip>
                <span v-else>-</span>
              </div>
            </template>

            <!-- Value Date -->
            <template v-slot:item.Value_date="{ item }">
              <span class="text-compact text-grey">{{ formatDate(item.Value_date) }}</span>
            </template>

            <!-- Auth Status -->
            <template v-slot:item.Auth_Status="{ item }">
              <v-chip :color="getStatusColor(item.Auth_Status)" size="x-small" variant="flat">
                <v-icon left size="x-small">{{ getStatusIcon(item.Auth_Status) }}</v-icon>
                {{ getStatusText(item.Auth_Status) }}
              </v-chip>
            </template>

            <!-- Maker Info -->
            <template v-slot:item.maker_name="{ item }">
              <div class="text-caption-thin">
                <div v-if="item.Maker_Id" class="text-compact">{{ item.maker_name || item.Maker_Id }}</div>
              </div>
            </template>

            <!-- Actions -->
            <template v-slot:item.actions="{ item }">
       
                <div class="d-flex gap-1">
                  <v-btn 
                    v-if="canView" 
                    icon 
                    size="x-small" 
                    variant="text" 
                    color="info" 
                    @click="viewDetails(item)"
                    title="ເບິ່ງລາຍລະອຽດ"
                  >
                    <v-icon size="14">mdi-eye</v-icon>
                  </v-btn>

                  <!-- Print Button -->
                  <v-btn
                    v-if="canView"
                    icon 
                    size="x-small" 
                    variant="text" 
                    color="primary" 
                    @click="printJournal(item)"
                    :loading="printingRefNo === item.Reference_No"
                    :disabled="isPrinting"
                    title="ພິມເອກະສານ"
                  >
                    <v-icon size="14">mdi-printer</v-icon>
                  </v-btn>

                  <v-btn
                    v-if="canDelete && (canAuthorize || item.Maker_Id === currentUser?.user_id) && item.Auth_Status !== 'A' && item.Auth_Status !== 'R'"
                    icon 
                    size="x-small" 
                    variant="text" 
                    color="error" 
                    @click="deleteItem(item)" 
                    title="ລຶບ"
                  >
                    <v-icon size="14">mdi-delete</v-icon>
                  </v-btn>
                </div>
            </template>
          </v-data-table>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'
import { debounce } from 'lodash'
import { useRolePermissions } from '@/composables/useRolePermissions'
import { useJournalPermission, formatEodDate } from '@/composables/useJournalPermission'

// Router
const route = useRoute()
const router = useRouter()
const isPrinting = ref(false)
const printingRefNo = ref<string | null>(null)

// Get sub_menu_id from route
const submenu_id = route.query.sub_menu_id as string || 'GL_NOTE_CAP'

// Role Store (for legacy support)
const roleStore = RoleStore()

// Role Permissions - Initialize with new composable
const {
  initializeRole,
  isReady,
  isLoading: permissionsLoading,
  initializationError,
  canView,
  canEdit,
  canDelete,
  canAuthorize,
  canAdd,
  permissions,
  // debugPermissions,
  waitForReady
} = useRolePermissions()

// Permission loading state
const permissionCheckComplete = ref(false)

// Journal Permission - Initialize composable
const journalPermission = useJournalPermission({
  autoRedirect: false,
  redirectPath: '/glcapture/',
})

// State
const loading = ref(false)
const loadingAuthStatus = ref(false)
const items = ref([])
const modules = ref([])
const currencies = ref([])
const authStatusOptions = ref([])

// Auth Status Mapping
const authStatusMapping = ref(new Map())

// Current user
const currentUser = computed(() => {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    return null
  }
})

// Get default date
const getDefaultDate = () => {
  if (journalPermission.targetDate.value) {
    return new Date(journalPermission.targetDate.value).toISOString().slice(0, 10)
  }
  return new Date().toISOString().slice(0, 10)
}

// Filters
const filters = reactive({
  search: '',
  module_id: null,
  Ccy_cd: null,
  Auth_Status: 'U',
  date: getDefaultDate(),
})

// Summary
const summary = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  correction: 0
})

// Watch for target date changes
watch(
  () => journalPermission.targetDate.value,
  (newTargetDate) => {
    if (newTargetDate) {
      const formattedDate = new Date(newTargetDate).toISOString().slice(0, 10)
      filters.date = formattedDate
      if (canView.value && permissionCheckComplete.value) {
        handleFilterChange()
      }
    }
  },
  { immediate: true }
)

// Get date hint
const getDateHint = () => {
  if (journalPermission.targetDate.value) {
    if (journalPermission.isBackDate.value) {
      return `ວັນທີຍ້ອນຫຼັງ: ${formatEodDate(journalPermission.targetDate.value)}`
    } else {
      return `ວັນທີເປົ້າໝາຍ: ${formatEodDate(journalPermission.targetDate.value)}`
    }
  }
  return 'ວັນທີປັດຈຸບັນ'
}

// Table headers
const headers = [
  { title: 'ໂມດູນ', key: 'module_id', sortable: true },
  { title: 'ລະຫັດ', key: 'Txn_code', sortable: true },
  { title: 'ເລກອ້າງອີງ', key: 'Reference_No', sortable: true },
  { title: 'ເນື້ອໃນ', key: 'Addl_text', sortable: true },
  { title: 'ຈຳນວນເງິນ', key: 'Fcy_Amount', align: 'end', sortable: true },
  { title: 'ຜູ້ສ້າງ', key: 'maker_name', sortable: true },
  { title: 'ວັນທີ', key: 'Value_date', sortable: true },
  { title: 'ສະຖານະ', key: 'Auth_Status', sortable: true },
  { title: 'ການກະທຳ', key: 'actions', sortable: false, align: 'center' }
]

// API configuration
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Navigate to details
const viewDetails = (item) => {
  router.push({
    path: '/glcapture/detail',
    query: {
      Reference_No: item.Reference_No,
      sub_menu_id: submenu_id
    }
  })
}

// Navigate to create
const navigateToCreate = () => {
  router.push({
    path: '/glcapture/create',
    query: { sub_menu_id: submenu_id }
  })
}

// Load summary data (without Auth_Status filter)
const loadSummaryData = async () => {
  try {
    const params = {
      show_all: canAuthorize.value ? 'true' : 'false',
      delete_stat__ne: 'D'
    }

    if (filters.search) params.search = filters.search
    if (filters.module_id) params.module_id = filters.module_id
    if (filters.Ccy_cd) params.Ccy_cd = filters.Ccy_cd
    if (filters.date) params.Value_date = filters.date

    const response = await axios.get('/api/journal-log-master/', {
      params,
      ...getAuthHeaders()
    })

    const allItems = response.data.results || response.data || []
    const filteredItems = allItems.filter(item => item.Txn_code !== 'ARD')
    
    summary.total = filteredItems.length
    summary.pending = filteredItems.filter(i => i.Auth_Status === 'U').length
    summary.approved = filteredItems.filter(i => i.Auth_Status === 'A').length
    summary.rejected = filteredItems.filter(i => i.Auth_Status === 'R').length
    summary.correction = filteredItems.filter(i => i.Auth_Status === 'P').length

  } catch (error) {
    console.error('Error loading summary:', error)
  }
}

// Load Auth Status Options
const loadAuthStatusOptions = async () => {
  try {
    loadingAuthStatus.value = true

    const response = await axios.get('/api/master-types/tree/A', getAuthHeaders())

    if (response.data && response.data.MasterCodes) {
      authStatusOptions.value = response.data.MasterCodes
        .filter(code => code.Status === 'T')
        .map(code => ({
          value: code.MC_code,
          text: code.MC_name_la
        }))

      authStatusMapping.value.clear()
      response.data.MasterCodes
        .filter(code => code.Status === 'T')
        .forEach(code => {
          authStatusMapping.value.set(code.MC_code, {
            text: code.MC_name_la,
            color: getStatusColorFromCode(code.MC_code),
            icon: getStatusIconFromCode(code.MC_code)
          })
        })
    }
  } catch (error) {
    console.error('Error loading auth status:', error)
    authStatusOptions.value = [
      { value: 'U', text: 'ລໍຖ້າອະນຸມັດ' },
      { value: 'A', text: 'ອະນຸມັດແລ້ວ' },
      { value: 'R', text: 'ປະຕິເສດ' },
      { value: 'P', text: 'ຖ້າເແກ້ໄຂ' }
    ]
  } finally {
    loadingAuthStatus.value = false
  }
}

// Helper functions
const getStatusColorFromCode = (code) => {
  switch (code) {
    case 'A': return 'success'
    case 'R': return 'error'
    case 'U': return 'warning'
    case 'P': return 'info'
    default: return 'grey'
  }
}

const getStatusIconFromCode = (code) => {
  switch (code) {
    case 'A': return 'mdi-check-circle'
    case 'R': return 'mdi-close-circle'
    case 'U': return 'mdi-clock-outline'
    case 'P': return 'mdi-pencil-circle'
    default: return 'mdi-help-circle'
  }
}

const formatNumber = (num, decimals = 2) => {
  if (!num) return '0.00'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('lo-LA')
}

const getStatusColor = (status) => {
  if (authStatusMapping.value.has(status)) {
    return authStatusMapping.value.get(status).color
  }
  return getStatusColorFromCode(status)
}

const getStatusIcon = (status) => {
  if (authStatusMapping.value.has(status)) {
    return authStatusMapping.value.get(status).icon
  }
  return getStatusIconFromCode(status)
}

const getStatusText = (status) => {
  if (authStatusMapping.value.has(status)) {
    return authStatusMapping.value.get(status).text
  }
  switch (status) {
    case 'A': return 'ອະນຸມັດແລ້ວ'
    case 'R': return 'ປະຕິເສດ'
    case 'U': return 'ລໍຖ້າອະນຸມັດ'
    case 'P': return 'ຖ້າເແກ້ໄຂ'
    default: return 'ບໍ່ຮູ້'
  }
}

const getModuleName = (moduleId) => {
  if (!moduleId) return '-'
  const module = modules.value.find(m => m.module_Id === moduleId)
  return module ? module.module_name_la : moduleId
}

// Load filtered data
const loadData = async () => {
  try {
    loading.value = true

    await loadSummaryData()

    const params = {
      show_all: canAuthorize.value ? 'true' : 'false',
      delete_stat__ne: 'D',
      ordering: '-Maker_DT_Stamp'
    }

    if (filters.search) params.search = filters.search
    if (filters.module_id) params.module_id = filters.module_id
    if (filters.Ccy_cd) params.Ccy_cd = filters.Ccy_cd
    if (filters.Auth_Status) params.Auth_Status = filters.Auth_Status
    if (filters.date) params.Value_date = filters.date

    const response = await axios.get('/api/journal-log-master/', {
      params,
      ...getAuthHeaders()
    })

    const rawItems = response.data.results || response.data || []
    items.value = rawItems.filter(item => item.Txn_code !== 'ARD')

  } catch (error) {
    console.error('Error loading data:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.value = false
  }
}

const loadModules = async () => {
  try {
    const response = await axios.get('/api/modules/', getAuthHeaders())
    modules.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading modules:', error)
  }
}

const loadCurrencies = async () => {
  try {
    const response = await axios.get('/api/currencies/', getAuthHeaders())
    currencies.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading currencies:', error)
  }
}

// Set Auth Status Filter
const setAuthStatusFilter = (status) => {
  filters.Auth_Status = status
  loadData()
}

// Handle filter changes
const handleFilterChange = () => {
  loadData()
}

// Clear all filters
const clearAllFilters = () => {
  filters.search = ''
  filters.module_id = null
  filters.Ccy_cd = null
  filters.Auth_Status = 'U'
  filters.date = getDefaultDate()
  loadData()
}

// Delete item
const deleteItem = async (item) => {
  const canDeleteItem = canDelete.value && (canAuthorize.value || item.Maker_Id === currentUser.value?.user_id)

  if (!canDeleteItem) {
    Swal.fire({
      icon: 'warning',
      title: 'ບໍ່ມີສິດ',
      text: 'ທ່ານບໍ່ມີສິດລຶບລາຍການນີ້',
      confirmButtonText: 'ຕົກລົງ'
    })
    return
  }

  if (item.Txn_code === 'ARD') {
    Swal.fire({
      icon: 'warning',
      title: 'ບໍ່ສາມາດລຶບໄດ້',
      text: 'ບໍ່ສາມາດລຶບລາຍການປະເພດ ARD ໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການລຶບ',
    text: `ທ່ານຕ້ອງການລຶບລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    showCancelButton: true,
    confirmButtonText: 'ລຶບ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#9e9e9e'
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/journal-log-master/${item.JRNLLog_id}/`, getAuthHeaders())

      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ລຶບລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })

      loadData()

    } catch (error) {
      console.error('Error deleting item:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດລຶບລາຍການໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

// Export data
const exportData = () => {
  Swal.fire({
    icon: 'info',
    title: 'ກຳລັງພັດທະນາ',
    text: 'ຟັງຊັນສົ່ງອອກຂໍ້ມູນກຳລັງພັດທະນາ',
    confirmButtonText: 'ຕົກລົງ'
  })
}

// Search with debounce
const searchDebounced = debounce(() => {
  handleFilterChange()
}, 500)

// Retry permission load
const retryPermissionLoad = async () => {
  permissionCheckComplete.value = false
  
  const subMenuId = route.query.sub_menu_id as string || 'GL_NOTE_CAP'
  const success = await initializeRole(subMenuId, true)
  
  if (success) {
    await waitForReady(5000)
    permissionCheckComplete.value = true
    
    if (canView.value) {
      await Promise.all([
        loadAuthStatusOptions(),
        loadModules(),
        loadCurrencies()
      ])
      loadData()
    }
  } else {
    permissionCheckComplete.value = true
  }
}
 // Print function - Corrected data mapping
const printJournal = async (item: any) => {
  try {
    isPrinting.value = true
    printingRefNo.value = item.Reference_No

    // Fetch journal details using correct endpoint
    const [masterResponse, detailsResponse] = await Promise.all([
      axios.get(`/api/journal-log-master/?Reference_No=${item.Reference_No}`, getAuthHeaders()),
      axios.get(`/api/journal-entries/?Reference_No=${item.Reference_No}`, getAuthHeaders())
    ])

    const masterData = masterResponse.data.results?.[0] || masterResponse.data?.[0] || {}
    const detailsData = detailsResponse.data || []

    if (!masterData || !masterData.Reference_No) {
      throw new Error('Journal data not found')
    }

    // Calculate totals from detail entries
    const totalFcyDebit = detailsData.reduce((sum, d) => sum + (parseFloat(d.fcy_dr) || 0), 0)
    const totalFcyCredit = detailsData.reduce((sum, d) => sum + (parseFloat(d.fcy_cr) || 0), 0)
    const isBalanced = Math.abs(totalFcyDebit - totalFcyCredit) < 0.01

    // Helper function to get maker display name
    const getMakerDisplay = () => {
      return masterData.maker_name || masterData.Maker_Id || '-'
    }

    // Helper function to get module display name
    const getModuleDisplay = () => {
      const moduleName = getModuleName(masterData.module_id)
      return moduleName !== '-' ? moduleName : masterData.module_id || '-'
    }

    // Generate table rows
    const tableRows = detailsData
      .map((detail, index) => {
        const debitAmount = detail.Dr_cr === 'D' ? formatNumber(detail.Fcy_Amount) : ''
        const creditAmount = detail.Dr_cr === 'C' ? formatNumber(detail.Fcy_Amount) : ''
        
        return `<tr>
          <td class="text-center">${index + 1}</td>
          <td class="text-left">${detail.Reference_sub_No || '-'}</td>
          <td class="text-left">${detail.Addl_sub_text || detail.Addl_text || '-'}</td>
          <td class="text-left">
            <div style="font-weight: 600;">${detail.Account_no || '-'}</div>
            <div style="font-size: 0.75rem; color: #666;">${detail.account_name || ''}</div>
          </td>
          <td class="text-right">${debitAmount}</td>
          <td class="text-right">${creditAmount}</td>
          <td class="text-center">
            <span class="status-${detail.Auth_Status}">${getStatusText(detail.Auth_Status)}</span>
          </td>
        </tr>`
      })
      .join('')

    // Generate print content with correct field mapping
    const printContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ບົດລາຍງານບັນທຶກບັນຊີ - ${masterData.Reference_No}</title>
  <style>
    body { font-family: "Noto Sans Lao", "Phetsarath OT", sans-serif; padding: 20px; margin: 0; }
    .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #000; padding-bottom: 15px; }
    .header h1 { margin: 0 0 5px 0; font-size: 1.5rem; font-weight: bold; }
    .header h2 { margin: 5px 0; font-size: 1.2rem; }
    .header p { margin: 3px 0; font-size: 0.9rem; font-style: italic; }
    .info-section { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border: 1px solid #000; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.9rem; }
    .info-label { font-weight: bold; min-width: 150px; }
    .info-value { flex: 1; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.85rem; }
    th, td { border: 1px solid #000; padding: 8px 6px; }
    th { background-color: #e0e0e0; font-weight: bold; text-align: center; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .totals-row { font-weight: bold; background: #f0f0f0; border-top: 2px solid #000; }
    .balance-row { font-weight: bold; background: #e8e8e8; }
    .status-A { color: #22c55e; font-weight: bold; }
    .status-U { color: #f59e0b; font-weight: bold; }
    .status-R { color: #ef4444; font-weight: bold; }
    .status-P { color: #3b82f6; font-weight: bold; }
    .summary-box { margin-top: 20px; width: 50%; margin-left: auto; border: 1px solid #000; }
    .summary-row { display: flex; padding: 6px 10px; border-bottom: 1px solid #ccc; }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { font-weight: bold; width: 50%; background: #f0f0f0; padding: 4px 8px; }
    .summary-value { width: 50%; text-align: right; padding: 4px 8px; font-family: "Courier New", monospace; }
    .signatures { margin-top: 60px; display: flex; justify-content: space-between; padding: 0 40px; }
    .signature-box { text-align: center; width: 40%; }
    .signature-title { font-size: 1rem; font-weight: bold; margin-bottom: 60px; }
    .signature-line { border-bottom: 2px solid #000; margin: 0 20px 10px 20px; }
    .footer { margin-top: 30px; text-align: center; font-size: 0.85rem; color: #666; border-top: 1px solid #000; padding-top: 10px; }
    @media print {
      body { padding: 10px; }
      @page { size: A4; margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ບໍລິສັດລັດ ບໍລິຫານໜີ້ ແລະ ຊັບສິນ ຈຳກັດຜູ່ດຽວ</h1>
    <h2>ບົດລາຍງານບັນທຶກບັນຊີ</h2>
    <p>Journal Entry Report</p>
  </div>
  
  <div class="info-section">
    <div class="info-row">
      <span><span class="info-label">ເລກອ້າງອີງ / Reference No:</span> <span class="info-value">${masterData.Reference_No}</span></span>
      <span><span class="info-label">ວັນທີ່ພິມ / Print Date:</span> <span class="info-value">${new Date().toLocaleDateString('lo-LA')}</span></span>
    </div>
    <div class="info-row">
      <span><span class="info-label">ໂມດູນ / Module:</span> <span class="info-value">${getModuleDisplay()} - ${masterData.Txn_code || ''}</span></span>
      <span><span class="info-label">ວັນທີ່ / Date:</span> <span class="info-value">${formatDate(masterData.Value_date)}</span></span>
    </div>
    <div class="info-row">
      <span><span class="info-label">ຜູ້ສ້າງ / Created By:</span> <span class="info-value">${getMakerDisplay()}</span></span>
      <span><span class="info-label">ສະກຸນເງິນ / Currency:</span> <span class="info-value">${masterData.Ccy_cd || ''}</span></span>
    </div>
    <div class="info-row">
      <span class="info-label">ເນື້ອໃນ / Description:</span>
      <span class="info-value">${masterData.Addl_text || '-'}</span>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 5%;">ລຳດັບ<br>No.</th>
        <th style="width: 12%;">ເລກອ້າງອີງຄູ່<br>Ref. Sub No</th>
        <th style="width: 25%;">ເນື້ອໃນ<br>Description</th>
        <th style="width: 20%;">ບັນຊີ<br>Account</th>
        <th style="width: 14%;">Debit (FCY)</th>
        <th style="width: 14%;">Credit (FCY)</th>
        <th style="width: 10%;">ສະຖານະ<br>Status</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
    <tfoot>
      <tr class="totals-row">
        <td colspan="4" class="text-right"><strong>ລວມທັງໝົດ / Total:</strong></td>
        <td class="text-right"><strong>${formatNumber(totalFcyDebit)}</strong></td>
        <td class="text-right"><strong>${formatNumber(totalFcyCredit)}</strong></td>
        <td class="text-center"></td>
      </tr>
      <tr class="balance-row">
        <td colspan="4" class="text-right"><strong>ສະຖານະຍອດ / Balance Status:</strong></td>
        <td colspan="3" class="text-center" style="color: ${isBalanced ? '#22c55e' : '#ef4444'};">
          <strong>${isBalanced ? '✓ ສົມດຸນ / Balanced' : '✗ ບໍ່ສົມດຸນ / Unbalanced'}</strong>
        </td>
      </tr>
    </tfoot>
  </table>
  
  <div class="summary-box">
    <div class="summary-row">
      <div class="summary-label">FCY Amount:</div>
      <div class="summary-value">${formatNumber(masterData.Fcy_Amount)} ${masterData.Ccy_cd}</div>
    </div>
    <div class="summary-row">
      <div class="summary-label">LCY Amount:</div>
      <div class="summary-value">${formatNumber(masterData.Lcy_Amount)} LAK</div>
    </div>
    <div class="summary-row">
      <div class="summary-label">Exchange Rate:</div>
      <div class="summary-value">${formatNumber(masterData.Exch_rate, 6)}</div>
    </div>
  </div>
  
  <div class="signatures">
    <div class="signature-box">
      <div class="signature-title">ຜູ້ກວດສອບ</div>
      <div class="signature-line"></div>
    </div>
    <div class="signature-box">
      <div class="signature-title">ນັກບັນທຶກ</div>
      <div class="signature-line"></div>
    </div>
  </div>
  
  <div class="footer">
    <p>ລະບົບບັນຊີ ບໍລິສັດລັດ ບໍລິຫານໜີ້ ແລະ ຊັບສິນ ຈຳກັດຜູ່ດຽວ</p>
  </div>
  
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

    // Open print window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Could not open print window')
    }

    printWindow.document.write(printContent)
    printWindow.document.close()

  } catch (error) {
    console.error('Print error:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຜິດພາດ',
      text: 'ມີຂໍ້ຜິດພາດໃນການພິມ: ' + (error.message || 'Unknown error'),
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    isPrinting.value = false
    printingRefNo.value = null
  }
}

// Lifecycle
onMounted(async () => {
  console.log('=== Journal list page mounted ===')
  
  try {
    // Step 1: Get sub_menu_id
    const subMenuId = route.query.sub_menu_id as string || 'GL_NOTE_CAP'
    console.log('Sub Menu ID:', subMenuId)

    // Step 2: Initialize permissions with sub_menu_id
    console.log('Initializing permissions...')
    const permissionsInitialized = await initializeRole(subMenuId, false)
    
    if (!permissionsInitialized) {
      console.error('Failed to initialize permissions:', initializationError.value)
      permissionCheckComplete.value = true
      
      Swal.fire({
        icon: 'error',
        title: 'ເກີດຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດໂຫຼດສິດການນຳໃຊ້ໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
      return
    }

    // Step 3: Wait for permissions to be ready
    console.log('Waiting for permissions to be ready...')
    const ready = await waitForReady(5000)
    
    if (!ready) {
      console.error('Permission loading timeout')
      permissionCheckComplete.value = true
      return
    }

    permissionCheckComplete.value = true
    
    // Step 4: Debug permissions
    // debugPermissions()

    // Step 5: Initialize journal permission
    await journalPermission.checkPermission()

    console.log('Journal permission status:', {
      isAvailable: journalPermission.isAvailable.value,
      targetDate: journalPermission.targetDate.value,
      isBackDate: journalPermission.isBackDate.value
    })

    // Step 6: Load data if user has view permission
    if (canView.value) {
      console.log('User has view permission, loading data...')
      
      await Promise.all([
        loadAuthStatusOptions(),
        loadModules(),
        loadCurrencies()
      ])

      loadData()
    } else {
      console.warn('User does not have view permission')
    }

    console.log('=== Page initialization complete ===')
    
  } catch (error) {
    console.error('Error during initialization:', error)
    permissionCheckComplete.value = true
    
    Swal.fire({
      icon: 'error',
      title: 'ເກີດຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດໂຫຼດໜ້ານີ້ໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  }
})
</script>

<style scoped>
.gl-approved-master {
  padding: 16px;
}

.permission-indicators {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.permission-indicators .v-chip {
  font-weight: 600;
  font-size: 0.7rem;
}

.permission-denied-state,
.loading-overlay,
.permission-error-state {
  max-width: 600px;
  margin: 40px auto;
}

.page-header-compact {
  padding: 8px 0;
  margin-bottom: 16px;
}

.page-title-compact {
  font-size: 1.4rem;
  font-weight: 500;
  color: #1976d2;
  display: flex;
  align-items: center;
  margin: 0;
  line-height: 1.2;
}

.filter-card-thin {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
}

.summary-card-thin {
  height: auto;
  min-height: 60px;
  transition: transform 0.2s;
  border: 1px solid #e0e0e0;
}

.summary-card-thin:hover {
  transform: translateY(-1px);
}

.summary-card-thin.active-filter {
  border: 2px solid #1976d2 !important;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2) !important;
}

.summary-card-thin.active-filter .summary-value-thin {
  color: #1976d2;
  font-weight: 700;
}

.summary-card-thin.active-filter .summary-label-thin {
  color: #1976d2;
  font-weight: 600;
}

.summary-value-thin {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
}

.summary-label-thin {
  font-size: 0.7rem;
  color: #666;
  line-height: 1;
}

.data-table-card-thin {
  border: 1px solid #e0e0e0;
}

.text-compact {
  font-size: 0.8rem;
  line-height: 1.1;
}

.text-caption-thin {
  font-size: 0.7rem;
  line-height: 1.1;
}

.full-width-table-thin {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

:deep(.v-data-table) {
  font-size: 0.8rem;
  width: 100% !important;
}

:deep(.v-data-table th) {
  font-weight: 600;
  background-color: #f7f7f7;
  font-size: 0.75rem;
  padding: 8px 12px !important;
  height: 36px !important;
}

:deep(.v-data-table td) {
  padding: 6px 12px !important;
  height: 40px !important;
  font-size: 0.8rem;
}

:deep(.v-field__input) {
  min-height: 32px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}

@media (max-width: 768px) {
  .page-title-compact {
    font-size: 1.2rem;
  }

  .summary-value-thin {
    font-size: 1rem;
  }

  .summary-label-thin {
    font-size: 0.65rem;
  }

  .permission-indicators {
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .gl-approved-master {
    padding: 8px;
  }

  .text-compact {
    font-size: 0.75rem;
  }
}
</style>