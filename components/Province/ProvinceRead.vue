<template>
  <v-container fluid class="pa-4">
    <v-card class="elevation-2" style="border-radius: 12px;">
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-3" size="28">mdi-map-marker-multiple</v-icon>
          <span class="text-h5 font-weight-medium">ຂໍ້ມູນທີ່ຢູ່ອາໄສ</span>
        </div>
        <v-chip color="primary" variant="outlined" size="small">
          {{ totalVillages }} ບ້ານ
        </v-chip>
      </v-card-title>

      <!-- Search and Filter Section -->
      <v-card-text class="pb-0">
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchName"
              label="ຄົ້ນຫາຊື່ບ້ານ"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @input="debouncedSearch"
              class="search-field"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedProvince"
              :items="provinces"
              item-title="pro_name_l"
              item-value="pro_id"
              label="ເລືອກແຂວງ"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="onProvinceChange"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedDistrict"
              :items="districts"
              item-title="dis_name_l"
              item-value="dis_code"
              label="ເລືອກເມືອງ"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              :disabled="!selectedProvince"
              @update:model-value="fetchVillages"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              @click="resetFilters"
              variant="outlined"
              color="secondary"
              block
              prepend-icon="mdi-refresh"
            >
              ລ້າງ
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Loading State -->
      <v-card-text v-if="loading" class="text-center py-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="50"
          class="mb-4"
        />
        <p class="text-body-1 text-medium-emphasis">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
      </v-card-text>

      <!-- Error State -->
      <v-card-text v-else-if="error" class="text-center py-8">
        <v-icon color="error" size="48" class="mb-4">mdi-alert-circle</v-icon>
        <p class="text-body-1 text-error mb-4">{{ error }}</p>
        <v-btn @click="fetchVillages" color="primary" variant="outlined">
          ລອງໃໝ່
        </v-btn>
      </v-card-text>

      <!-- Tree View -->
      <v-card-text v-else-if="treeItems.length > 0" class="pt-0">
        <v-treeview
          :items="treeItems"
          item-title="name"
          item-value="id"
          open-strategy="multiple"
          :open-all="openAll"
          class="address-tree"
        >
          <template v-slot:prepend="{ item, open }">
            <v-icon
              :color="getIconColor(item.type)"
              size="20"
              class="mr-2"
            >
              {{ getIcon(item.type, open) }}
            </v-icon>
          </template>

          <template v-slot:title="{ item }">
            <div class="d-flex align-center">
              <span 
                :class="getTitleClass(item.type)"
                class="tree-title"
              >
                {{ item.name }}
              </span>
              <v-chip
                v-if="item.code"
                size="x-small"
                variant="outlined"
                :color="getChipColor(item.type)"
                class="ml-2"
              >
                {{ item.code }}
              </v-chip>
              <v-chip
                v-if="item.count && item.type !== 'village'"
                size="x-small"
                :color="getChipColor(item.type)"
                class="ml-2"
              >
                {{ item.count }} {{ item.type === 'province' ? 'ເມືອງ' : 'ບ້ານ' }}
              </v-chip>
            </div>
          </template>
        </v-treeview>

        <!-- Toggle Controls -->
        <v-divider class="my-4" />
        <div class="d-flex justify-center">
          <v-btn-toggle
            v-model="openAll"
            mandatory
            variant="outlined"
            density="compact"
          >
            <v-btn :value="false" prepend-icon="mdi-collapse-all">
              ປິດທັງໝົດ
            </v-btn>
            <v-btn :value="true" prepend-icon="mdi-expand-all">
              ເປີດທັງໝົດ
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-card-text>

      <!-- Empty State -->
      <v-card-text v-else class="text-center py-8">
        <v-icon color="grey" size="64" class="mb-4">mdi-map-marker-off</v-icon>
        <p class="text-body-1 text-medium-emphasis mb-2">ບໍ່ພົບຂໍ້ມູນບ້ານ</p>
        <p class="text-body-2 text-medium-emphasis">ກະລຸນາລອງຄົ້ນຫາດ້ວຍເງື່ອນໄຂອື່ນ</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from '@/helpers/axios' 
import { Axios } from 'axios'

// Reactive state
const loading = ref(false)
const error = ref(null)
const villages = ref([])
const provinces = ref([])
const districts = ref([])
const searchName = ref('')
const selectedProvince = ref(null)
const selectedDistrict = ref(null)
const openAll = ref(false)

// Base API URL - adjust according to your setup

// Get auth token from localStorage or your preferred method
const getAuthToken = () => {
  // Adjust this based on how you store the token
  return localStorage.getItem('token') || ''
}


// API headers with authentication
const getHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json'
})

// Debounced search function
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchVillages()
  }, 500)
}

// Fetch villages from API
const fetchVillages = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams()
    if (selectedProvince.value) params.append('pro_id', selectedProvince.value)
    if (selectedDistrict.value) params.append('dis_id', selectedDistrict.value)
    if (searchName.value) params.append('search_name', searchName.value)

    const url = axios.get(`/api/villages_list/?${params.toString()}`)
    
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        const data = await response.json()
        error.value = data.message || 'ບໍ່ພົບຂໍ້ມູນ'
        villages.value = []
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status) {
      villages.value = data.data || []
      extractProvinceAndDistrictData()
    } else {
      error.value = data.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
      villages.value = []
    }
  } catch (err) {
    console.error('Error fetching villages:', err)
    error.value = 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີໄດ້'
    villages.value = []
  } finally {
    loading.value = false
  }
}

// Extract unique provinces and districts from village data
const extractProvinceAndDistrictData = () => {
  const uniqueProvinces = new Map()
  const uniqueDistricts = new Map()
  
  villages.value.forEach(village => {
    if (village.dis_detail?.pro_detail) {
      const province = village.dis_detail.pro_detail
      uniqueProvinces.set(province.pro_id, province)
    }
    
    if (village.dis_detail) {
      const district = village.dis_detail
      uniqueDistricts.set(district.dis_code, district)
    }
  })
  
  provinces.value = Array.from(uniqueProvinces.values())
  districts.value = Array.from(uniqueDistricts.values())
}

// Handle province selection change
const onProvinceChange = () => {
  selectedDistrict.value = null
  fetchVillages()
}

// Reset all filters
const resetFilters = () => {
  searchName.value = ''
  selectedProvince.value = null
  selectedDistrict.value = null
  fetchVillages()
}

// Computed properties
const totalVillages = computed(() => villages.value.length)

const treeItems = computed(() => {
  if (!villages.value.length) return []
  
  const provinceMap = new Map()
  
  villages.value.forEach(village => {
    if (!village.dis_detail?.pro_detail) return
    
    const province = village.dis_detail.pro_detail
    const district = village.dis_detail
    
    // Initialize province if not exists
    if (!provinceMap.has(province.pro_id)) {
      provinceMap.set(province.pro_id, {
        id: `province-${province.pro_id}`,
        name: province.pro_name_l || province.pro_name_e,
        code: province.pro_code,
        type: 'province',
        children: new Map(),
        count: 0
      })
    }
    
    const provinceItem = provinceMap.get(province.pro_id)
    
    // Initialize district if not exists
    if (!provinceItem.children.has(district.dis_code)) {
      provinceItem.children.set(district.dis_code, {
        id: `district-${district.dis_code}`,
        name: district.dis_name_l || district.dis_name_e,
        code: district.dis_code,
        type: 'district',
        children: [],
        count: 0
      })
    }
    
    const districtItem = provinceItem.children.get(district.dis_code)
    
    // Add village
    districtItem.children.push({
      id: `village-${village.vil_sys_id}`,
      name: village.vil_name_l || village.vil_name_e,
      code: village.vil_code,
      type: 'village',
      vbol_name: village.vbol_name
    })
    
    districtItem.count = districtItem.children.length
  })
  
  // Convert maps to arrays and set province counts
  const result = Array.from(provinceMap.values()).map(province => ({
    ...province,
    children: Array.from(province.children.values()),
    count: Array.from(province.children.values()).length
  }))
  
  return result
})

// Helper functions for styling
const getIcon = (type, open) => {
  switch (type) {
    case 'province':
      return 'mdi-map'
    case 'district':
      return open ? 'mdi-city-variant' : 'mdi-city-variant-outline'
    case 'village':
      return 'mdi-home-group'
    default:
      return 'mdi-circle-small'
  }
}

const getIconColor = (type) => {
  switch (type) {
    case 'province':
      return 'primary'
    case 'district':
      return 'secondary'
    case 'village':
      return 'success'
    default:
      return 'grey'
  }
}

const getTitleClass = (type) => {
  switch (type) {
    case 'province':
      return 'text-h6 font-weight-bold text-primary'
    case 'district':
      return 'text-subtitle-1 font-weight-medium text-secondary'
    case 'village':
      return 'text-body-1'
    default:
      return 'text-body-2'
  }
}

const getChipColor = (type) => {
  switch (type) {
    case 'province':
      return 'primary'
    case 'district':
      return 'secondary'
    case 'village':
      return 'success'
    default:
      return 'grey'
  }
}

// Lifecycle
onMounted(() => {
  fetchVillages()
})
</script>

<style scoped>
.search-field :deep(.v-field__input) {
  padding: 8px 12px;
}

.address-tree :deep(.v-treeview-item) {
  margin-bottom: 4px;
}

.address-tree :deep(.v-treeview-item__content) {
  padding: 8px 4px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.address-tree :deep(.v-treeview-item__content:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.tree-title {
  user-select: text;
  cursor: pointer;
}

.v-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
}

.v-card-title {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-secondary), 0.05) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

/* Custom scrollbar for tree view */
.address-tree :deep(.v-treeview) {
  max-height: 600px;
  overflow-y: auto;
}

.address-tree :deep(.v-treeview)::-webkit-scrollbar {
  width: 6px;
}

.address-tree :deep(.v-treeview)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.address-tree :deep(.v-treeview)::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.address-tree :deep(.v-treeview)::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .v-container {
    padding: 8px;
  }
  
  .v-card-title {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 12px;
  }
  
  .address-tree :deep(.v-treeview) {
    max-height: 400px;
  }
}
</style>