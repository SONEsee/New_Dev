<template>
  <div class="villages-tree-view">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <v-icon color="primary" size="28" class="mr-2">mdi-map-marker-multiple</v-icon>
        ການຈັດການຂໍ້ມູນທີ່ຢູ່ອາໄສ
      </h1>
      <p class="page-subtitle">ແຂວງ - ເມືອງ - ບ້ານ</p>
    </div>

    <!-- Action Bar -->
    <v-card class="action-bar mb-4" elevation="1">
      <v-card-text class="pa-3">
        <v-row dense align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="ຄົ້ນຫາບ້ານ"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              placeholder="ຊື່ບ້ານ..."
              @input="debouncedSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedProvinceFilter"
              :items="provinceFilterOptions"
              label="ກັ່ນຕອງແຂວງ"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="onProvinceFilterChange"
            ></v-select>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="primary"
              variant="flat"
              @click="expandAllProvinces"
              prepend-icon="mdi-expand-all"
              size="small"
            >
              ເປີດທັງໝົດ
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn
              color="secondary"
              variant="outlined"
              @click="collapseAllProvinces"
              prepend-icon="mdi-collapse-all"
              size="small"
            >
              ປິດທັງໝົດ
            </v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn
              color="success"
              variant="text"
              @click="exportData"
              :disabled="totalVillagesCount === 0"
              size="small"
            >
              <v-icon size="small">mdi-download</v-icon>
              ສົ່ງອອກ
            </v-btn>
            <v-btn
              color="primary"
              variant="text"
              @click="refreshData"
              :loading="provincesLoading"
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
    <v-card v-if="provincesLoading" class="text-center pa-8" elevation="1">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
      <div class="text-h6 mt-4 text-grey">ກຳລັງໂຫຼດຂໍ້ມູນແຂວງ...</div>
    </v-card>

    <!-- Error State -->
    <v-alert
      v-if="error && !provincesLoading"
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

    <!-- Provinces Tree with Districts and Villages -->
    <v-card v-if="!provincesLoading && !error" elevation="1">
      <v-card-title class="pa-4 bg-grey-lighten-5">
        <div class="d-flex align-center justify-space-between">
          <span class="text-h6">ແຂວງທັງໝົດ ({{ filteredProvinces.length }})</span>
          <v-chip color="info" size="small" variant="outlined">
            ທັງໝົດ {{ totalVillagesCount }} ບ້ານ
          </v-chip>
        </div>
      </v-card-title>
      
      <v-expansion-panels 
        v-model="expandedProvinces" 
        multiple 
        variant="accordion" 
        class="provinces-panels"
      >
        <v-expansion-panel
          v-for="province in filteredProvinces"
          :key="province.pro_id"
          :value="province.pro_id"
          @group:selected="onProvinceExpanded(province)"
        >
          <!-- Province Header -->
          <v-expansion-panel-title class="province-header">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon 
                  color="primary" 
                  class="mr-3"
                  size="large"
                >
                  mdi-map
                </v-icon>
                <div>
                  <div class="province-name">
                    [{{ province.pro_code }}] {{ province.pro_name_l }}
                  </div>
                  <div class="province-desc text-caption text-grey">
                    EN: {{ province.pro_name_e }} | ID: {{ province.pro_id }}
                  </div>
                </div>
              </div>
              
              <div class="d-flex align-center" @click.stop>
                <v-chip
                  color="primary"
                  size="small"
                  variant="flat"
                  class="mr-2"
                >
                  {{ getDistrictsByProvinceId(province.pro_id).length }} ເມືອງ
                </v-chip>
                
                <v-chip
                  color="info"
                  size="small"
                  variant="outlined"
                  class="mr-2"
                >
                  {{ getVillagesByProvinceId(province.pro_id).length }} ບ້ານ
                </v-chip>
              </div>
            </div>
          </v-expansion-panel-title>

          <!-- Districts Content -->
          <v-expansion-panel-text>
            <div class="districts-section">
              <!-- Loading Districts -->
              <div v-if="loadingDistrictsFor === province.pro_id" class="text-center py-4">
                <v-progress-circular
                  color="secondary"
                  indeterminate
                  size="40"
                ></v-progress-circular>
                <div class="text-body-2 mt-2 text-grey">ກຳລັງໂຫຼດເມືອງ...</div>
              </div>

              <!-- Districts List -->
              <v-expansion-panels 
                v-else-if="getDistrictsByProvinceId(province.pro_id).length > 0"
                v-model="expandedDistricts" 
                multiple 
                variant="accordion" 
                class="districts-panels"
              >
                <v-expansion-panel
                  v-for="district in getDistrictsByProvinceId(province.pro_id)"
                  :key="district.dis_code"
                  :value="district.dis_code"
                  @group:selected="onDistrictExpanded(district)"
                >
                  <!-- District Header -->
                  <v-expansion-panel-title class="district-header">
                    <div class="d-flex align-center justify-space-between w-100">
                      <div class="d-flex align-center">
                        <v-icon 
                          color="secondary" 
                          class="mr-3"
                          size="medium"
                        >
                          mdi-city-variant
                        </v-icon>
                        <div>
                          <div class="district-name">
                            [{{ district.dis_code }}] {{ district.dis_name_l }}
                          </div>
                          <div class="district-desc text-caption text-grey">
                            EN: {{ district.dis_name_e }} | Pro: {{ district.pro_id }}
                          </div>
                        </div>
                      </div>
                      
                      <div class="d-flex align-center" @click.stop>
                        <v-chip
                          color="success"
                          size="small"
                          variant="outlined"
                          class="mr-2"
                        >
                          {{ getVillagesByDistrictCode(district.dis_code).length }} ບ້ານ
                        </v-chip>
                      </div>
                    </div>
                  </v-expansion-panel-title>

                  <!-- Villages Content -->
                  <v-expansion-panel-text>
                    <div class="villages-section">
                      <!-- Loading Villages -->
                      <div v-if="loadingVillagesFor === district.dis_code" class="text-center py-4">
                        <v-progress-circular
                          color="success"
                          indeterminate
                          size="32"
                        ></v-progress-circular>
                        <div class="text-body-2 mt-2 text-grey">ກຳລັງໂຫຼດບ້ານ...</div>
                      </div>

                      <!-- Villages List -->
                      <div v-else-if="getVillagesByDistrictCode(district.dis_code).length > 0">
                        <v-card
                          v-for="village in getVillagesByDistrictCode(district.dis_code)"
                          :key="village.vil_sys_id || village.vil_id"
                          class="village-card mb-2"
                          variant="outlined"
                        >
                          <v-card-text class="pa-3">
                            <div class="d-flex align-center justify-space-between">
                              <div class="d-flex align-center">
                                <v-icon 
                                  color="success" 
                                  class="mr-3"
                                  size="small"
                                >
                                  mdi-home-group
                                </v-icon>
                                <div>
                                  <div class="village-name font-weight-medium">
                                    [{{ village.vil_code }}] {{ village.vil_name_l }}
                                  </div>
                                  <div class="village-desc text-caption text-grey">
                                    EN: {{ village.vil_name_e || '-' }}
                                  </div>
                                  <div v-if="village.vbol_name" class="text-caption text-info mt-1">
                                    ບໍລິຫານ: {{ village.vbol_name }}
                                  </div>
                                </div>
                              </div>
                              
                              <div class="d-flex align-center">
                                <v-chip
                                  color="success"
                                  size="x-small"
                                  variant="flat"
                                  class="mr-2"
                                >
                                  ID: {{ village.vil_sys_id || village.vil_id }}
                                </v-chip>
                              </div>
                            </div>
                          </v-card-text>
                        </v-card>
                      </div>
                      
                      <!-- Empty State for Villages -->
                      <div v-else class="empty-state text-center py-4">
                        <v-icon size="48" color="grey-lighten-1">mdi-home-group</v-icon>
                        <div class="text-h6 text-grey mt-2">ບໍ່ມີບ້ານ</div>
                        <div class="text-body-2 text-grey">ບໍ່ພົບຂໍ້ມູນບ້ານໃນເມືອງ {{ district.dis_name_l }}</div>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
              
              <!-- Empty State for Districts -->
              <div v-else class="empty-state text-center py-4">
                <v-icon size="48" color="grey-lighten-1">mdi-city-variant</v-icon>
                <div class="text-h6 text-grey mt-2">ບໍ່ມີເມືອງ</div>
                <div class="text-body-2 text-grey">ບໍ່ພົບຂໍ້ມູນເມືອງໃນແຂວງ {{ province.pro_name_l }}</div>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Empty State for Provinces -->
      <div v-if="provinces.length === 0 && !provincesLoading" class="empty-state text-center pa-8">
        <v-icon size="64" color="grey-lighten-1">mdi-map</v-icon>
        <div class="text-h5 text-grey mt-4">ບໍ່ມີຂໍ້ມູນແຂວງ</div>
        <div class="text-body-1 text-grey mb-4">ບໍ່ສາມາດໂຫຼດຂໍ້ມູນແຂວງໄດ້</div>
        <v-btn
          color="primary"
          variant="flat"
          @click="refreshData"
          prepend-icon="mdi-refresh"
        >
          ໂຫຼດຂໍ້ມູນໃໝ່
        </v-btn>
      </div>
    </v-card>

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

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/helpers/axios'

// Auth helper
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Reactive data
const provinces = ref([])
const districts = ref([])
const villages = ref([])
const provincesLoading = ref(false)
const loadingDistrictsFor = ref(null)
const loadingVillagesFor = ref(null)
const error = ref(null)
const successMessage = ref('')
const showSuccess = ref(false)
const search = ref('')
const selectedProvinceFilter = ref(null)

// Expansion states
const expandedProvinces = ref([])
const expandedDistricts = ref([])

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    // If there's a search term, search across all loaded villages
    if (search.value) {
      searchVillages()
    }
  }, 500)
}

// Computed
const filteredProvinces = computed(() => {
  let filtered = provinces.value

  if (selectedProvinceFilter.value) {
    filtered = filtered.filter(province => province.pro_id === selectedProvinceFilter.value)
  }

  return filtered
})

const provinceFilterOptions = computed(() => {
  return [
    { title: 'ທັງໝົດ', value: null },
    ...provinces.value.map(province => ({
      title: `${province.pro_name_l} (${province.pro_code})`,
      value: province.pro_id
    }))
  ]
})

const getDistrictsByProvinceId = computed(() => {
  return (provinceId) => {
    return districts.value.filter(district => district.pro_id === provinceId)
  }
})

const getVillagesByProvinceId = computed(() => {
  return (provinceId) => {
    return villages.value.filter(village => village.pro_id === provinceId)
  }
})

const getVillagesByDistrictCode = computed(() => {
  return (districtCode) => {
    const filteredVillages = villages.value.filter(village => village.dis_id === districtCode)
    
    // Apply search filter if search term exists
    if (search.value) {
      return filteredVillages.filter(village => 
        village.vil_name_l?.toLowerCase().includes(search.value.toLowerCase()) ||
        village.vil_name_e?.toLowerCase().includes(search.value.toLowerCase()) ||
        village.vil_code?.toLowerCase().includes(search.value.toLowerCase())
      )
    }
    
    return filteredVillages
  }
})

const totalVillagesCount = computed(() => {
  return villages.value.length
})

// Methods
const fetchProvinces = async () => {
  provincesLoading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/api/provinces/', getAuthHeaders())
    
    if (response.data.status) {
      provinces.value = response.data.data || []
    } else {
      error.value = response.data.message || 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນແຂວງ'
    }
  } catch (err) {
    console.error('Error fetching provinces:', err)
    error.value = 'ບໍ່ສາມາດດຶງຂໍ້ມູນແຂວງໄດ້'
  } finally {
    provincesLoading.value = false
  }
}

const fetchDistrictsByProvince = async (provinceId) => {
  loadingDistrictsFor.value = provinceId
  
  try {
    const response = await axios.get(`/api/districts/?pro_id=${provinceId}`, getAuthHeaders())
    
    console.log('Fetched districts for province:', provinceId, response.data);
    
    if (response.data.status) {
      const newDistricts = response.data.data || []
      
      // Add new districts to the existing array (avoid duplicates)
      newDistricts.forEach(newDistrict => {
        const exists = districts.value.find(d => d.dis_code === newDistrict.dis_code)
        if (!exists) {
          districts.value.push(newDistrict)
        }
      })
    }
  } catch (err) {
    console.error('Error fetching districts:', err)
    showSuccessMessage('ບໍ່ສາມາດດຶງຂໍ້ມູນເມືອງໄດ້')
  } finally {
    loadingDistrictsFor.value = null
  }
}

const fetchVillagesByDistrict = async (districtCode) => {
  loadingVillagesFor.value = districtCode
  
  try {
    const response = await axios.get(`/api/villages_list/?dis_id=${districtCode}`, getAuthHeaders())
    
    if (response.data.status) {
      const newVillages = response.data.data || []
      
      // Add new villages to the existing array (avoid duplicates)
      newVillages.forEach(newVillage => {
        const exists = villages.value.find(v => 
          (v.vil_sys_id && v.vil_sys_id === newVillage.vil_sys_id) ||
          (v.vil_id && v.vil_id === newVillage.vil_id)
        )
        if (!exists) {
          villages.value.push(newVillage)
        }
      })
    }
  } catch (err) {
    console.error('Error fetching villages:', err)
    showSuccessMessage('ບໍ່ສາມາດດຶງຂໍ້ມູນບ້ານໄດ້')
  } finally {
    loadingVillagesFor.value = null
  }
}

const searchVillages = async () => {
  if (!search.value) return
  
  try {
    const response = await axios.get(`/api/villages_list/?search_name=${search.value}`, getAuthHeaders())
    
    if (response.data.status) {
      const searchResults = response.data.data || []
      
      // Add search results to villages array (avoid duplicates)
      searchResults.forEach(village => {
        const exists = villages.value.find(v => 
          (v.vil_sys_id && v.vil_sys_id === village.vil_sys_id) ||
          (v.vil_id && v.vil_id === village.vil_id)
        )
        if (!exists) {
          villages.value.push(village)
        }
      })
      
      // Auto-expand provinces and districts that have search results
      const uniqueProvinces = [...new Set(searchResults.map(v => v.pro_id))]
      const uniqueDistricts = [...new Set(searchResults.map(v => v.dis_id))]
      
      uniqueProvinces.forEach(proId => {
        if (!expandedProvinces.value.includes(proId)) {
          expandedProvinces.value.push(proId)
          fetchDistrictsByProvince(proId)
        }
      })
      
      uniqueDistricts.forEach(disCode => {
        if (!expandedDistricts.value.includes(disCode)) {
          expandedDistricts.value.push(disCode)
        }
      })
    }
  } catch (err) {
    console.error('Error searching villages:', err)
  }
}

const onProvinceExpanded = (province) => {
  if (expandedProvinces.value.includes(province.pro_id)) {
    // Province is being expanded, load districts
    const hasDistricts = getDistrictsByProvinceId.value(province.pro_id).length > 0
    if (!hasDistricts) {
      fetchDistrictsByProvince(province.pro_id)
    }
  }
}

const onDistrictExpanded = (district) => {
  if (expandedDistricts.value.includes(district.dis_code)) {
    // District is being expanded, load villages
    const hasVillages = getVillagesByDistrictCode.value(district.dis_code).length > 0
    if (!hasVillages) {
      fetchVillagesByDistrict(district.dis_code)
    }
  }
}

const onProvinceFilterChange = () => {
  // Reset expansions when filter changes
  expandedProvinces.value = []
  expandedDistricts.value = []
}

const expandAllProvinces = () => {
  expandedProvinces.value = filteredProvinces.value.map(p => p.pro_id)
  // Load districts for all expanded provinces
  filteredProvinces.value.forEach(province => {
    const hasDistricts = getDistrictsByProvinceId.value(province.pro_id).length > 0
    if (!hasDistricts) {
      fetchDistrictsByProvince(province.pro_id)
    }
  })
}

const collapseAllProvinces = () => {
  expandedProvinces.value = []
  expandedDistricts.value = []
}

const refreshData = () => {
  // Reset all data
  districts.value = []
  villages.value = []
  expandedProvinces.value = []
  expandedDistricts.value = []
  search.value = ''
  selectedProvinceFilter.value = null
  
  // Reload provinces
  fetchProvinces()
}

const exportData = () => {
  showSuccessMessage('ຟັງຊັນສົ່ງອອກຂໍ້ມູນກຳລັງພັດທະນາ')
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
}

// Lifecycle
onMounted(() => {
  fetchProvinces()
})
</script>

<style scoped>
.villages-tree-view {
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

.provinces-panels {
  border: none;
}

.province-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-bottom: 1px solid #e0e0e0;
}

.province-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
}

.province-desc {
  margin-top: 2px;
}

.districts-section {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.districts-panels {
  border: none;
}

.district-header {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  border-bottom: 1px solid #e0e0e0;
}

.district-name {
  font-size: 1rem;
  font-weight: 600;
  color: #7b1fa2;
}

.district-desc {
  margin-top: 2px;
}

.villages-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.village-card {
  transition: all 0.2s ease;
  background: white;
}

.village-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.village-name {
  font-size: 0.9rem;
  color: #388e3c;
}

.village-desc {
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

/* Nested expansion panels styling */
.districts-panels :deep(.v-expansion-panel) {
  margin-bottom: 6px;
  border-radius: 6px !important;
}

.districts-panels :deep(.v-expansion-panel-title) {
  padding: 12px 16px;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .villages-tree-view {
    padding: 12px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .province-name {
    font-size: 1rem;
  }
  
  .district-name {
    font-size: 0.9rem;
  }
  
  .village-name {
    font-size: 0.8rem;
  }
}
</style>