<template>
  <v-app>
    <v-main>
      <v-container class="pa-4">
        <v-card elevation="1">
          <v-card-title class="">
            <GlobalTextTitleLine :title="title" />
          </v-card-title>
          <v-card-text>
            <!-- Filter Section -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedDivision"
                  :items="divisionOptions"
                  item-title="text"
                  item-value="value"
                  label="ເລືອກພະແນກ"
                  clearable
                  outlined
                  dense
                  @update:model-value="filterByDivision"
                >
                  <template #prepend-inner>
                    <v-icon>mdi-filter</v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="8" class="d-flex align-center">
                <v-chip
                  v-if="selectedDivision"
                  closable
                  color="primary"
                  small
                  @click:close="clearFilter"
                >
                  ກໍາລັງຕອງ: {{ getDivisionName(selectedDivision) }}
                </v-chip>
                <v-spacer></v-spacer>
                <span class="text-caption">
                  ທັງໝົດ: {{ filteredLogs.length }} ລາຍການ
                </span>
              </v-col>
            </v-row>

            <!-- Data Table -->
            <v-data-table
              :headers="headers"
              :items="filteredLogs"
              :item-class="rowClass"
              :loading="loading"
              class="elevation-1"
              dense
            >
              <template #item.user="{ item }">
                {{ item.user?.user_name || '-' }}
              </template>

              <template #item.profile="{ item }">
                <v-avatar size="32" v-if="item.user?.profile_picture">
                  <img :src="getMediaUrl(item.user.profile_picture)" alt="Profile" />
                </v-avatar>
                <span v-else>-</span>
              </template>

              <template #item.division="{ item }">
                {{ item.user?.division?.division_name_la || '-' }}
              </template>

              <template #item.login_datetime="{ item }">
                {{ formatDate(item.login_datetime) }}
              </template>

              <template #item.login_status="{ item }">
                <v-chip
                  small
                  :color="item.login_status === 'S' ? 'green lighten-2' : 'red lighten-2'"
                  text-color="white"
                >
                  {{ mapStatus(item.login_status) }}
                </v-chip>
              </template>

              <template #item.logout_datetime="{ item }">
                {{ formatDate(item.logout_datetime) }}
              </template>

              <template #item.logout_type="{ item }">
                {{ mapLogoutType(item.logout_type) }}
              </template>

              <template #item.ip_address="{ item }">
                {{ item.ip_address || '-' }}
              </template>

              <template #item.user_agent="{ item }">
                {{ item.user_agent || '-' }}
              </template>

              <template #header>
                <tr>
                  <th
                    v-for="h in headers"
                    :key="h.value"
                    class="grey lighten-3 text-left text-subtitle-2"
                  >
                    {{ h.title }}
                  </th>
                </tr>
              </template>

              <!-- No data template -->
              <template #no-data>
                <div class="text-center pa-4">
                  <v-icon size="48" color="grey">mdi-database-off</v-icon>
                  <p class="text-subtitle-1 mt-2">ບໍ່ມີຂໍ້ມູນ</p>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'
const logs = ref([])
const loading = ref(false)
const error = ref(null)
const router = useRouter()
const token = localStorage.getItem('token') || ''

// Filter state
const selectedDivision = ref(null)

const title = 'ຕາຕະລາງການເຂົ້າອອກຜູ້ໃຊ້'

// Table headers
const headers = [
  { title: 'ຜູ້ໃຊ້',       value: 'user' },
  { title: 'ຮູບ',         value: 'profile',   sortable: false },
  { title: 'ພະແນກ',        value: 'division' },
  { title: 'ເວລາເຂົ້າລະບົບ',      value: 'login_datetime' },
  { title: 'ສະຖານະເຂົ້າລະບົບ',    value: 'login_status' },
  { title: 'ເວລາອອກລະບົບ',     value: 'logout_datetime' },
  { title: 'ສະຖານະອອກລະບົບ',     value: 'logout_type' },
  { title: 'ໝາຍເລກລະຫັດ',      value: 'ip_address' },
  { title: 'ເຂົ້າລະບົບຜ່ານໜ້າຕ່າງ',      value: 'user_agent', sortable: false }
]

// Computed: Get unique divisions for dropdown
const divisionOptions = computed(() => {
  const divisions = []
  const seen = new Set()
  
  // Add "All" option
  divisions.push({
    text: 'ທັງໝົດ',
    value: null
  })
  
  // Debug: log the data structure
  console.log('Logs data:', logs.value)
  
  logs.value.forEach(log => {
    console.log('Processing log:', log)
    const division = log.user?.division
    console.log('Division found:', division)
    
    if (division) {
      // Try different possible ID fields
      const divisionId = division.id || division.division_id || division.div_id
      const divisionName = division.division_name_la || division.name || division.division_name || `ພະແນກ ${divisionId}`
      
      if (divisionId && !seen.has(divisionId)) {
        seen.add(divisionId)
        divisions.push({
          text: divisionName,
          value: divisionId
        })
        console.log('Added division:', { text: divisionName, value: divisionId })
      }
    }
  })
  
  console.log('Final division options:', divisions)
  return divisions
})

// Computed: Filter logs by selected division
const filteredLogs = computed(() => {
  if (!selectedDivision.value) {
    return logs.value
  }
  
  return logs.value.filter(log => {
    const division = log.user?.division
    if (!division) return false
    
    // Try different possible ID fields
    const divisionId = division.id || division.division_id || division.div_id
    console.log('Filtering - Division ID:', divisionId, 'Selected:', selectedDivision.value)
    
    return divisionId === selectedDivision.value
  })
})

// Construct full media URL for profile pictures
function getMediaUrl(path) {
  if (!path) return ''
  return `${apiBase.replace('/api', '')}${path.startsWith('/') ? path : '/' + path}`
}

// Format ISO datetime strings
function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString()
}

// Map codes to labels
function mapStatus(code) {
  return code === 'S' ? 'ສໍາເລັດ' : code === 'F' ? 'ຜິດພາດ' : '-'
}

function mapLogoutType(code) {
  return code === 'U' ? 'User Logout' : '-'
}

// Row class: highlight based on login_status
function rowClass(item) {
  if (item.login_status === 'S') return 'green lighten-5'
  if (item.login_status === 'F') return 'red lighten-5'
  return ''
}

// Filter functions
function filterByDivision() {
  // This function is called automatically when selectedDivision changes
  // The filtering is handled by the computed property filteredLogs
}

function clearFilter() {
  selectedDivision.value = null
}

function getDivisionName(divisionId) {
  if (!divisionId) return 'ທັງໝົດ'
  const option = divisionOptions.value.find(opt => opt.value === divisionId)
  return option ? option.text : 'ບໍ່ຮູ້ຈັກ'
}

// Fetch wrapper with auth
async function fetchWithAuth(url) {
  if (!token) {
    router.push('/login')
    throw new Error('No access token, please login')
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (res.status === 401) {
    router.push('/login')
    throw new Error('Unauthorized')
  }
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

// Load logs
onMounted(async () => {
  loading.value = true
  try {
    // logs.value = await fetchWithAuth(`user-access-logs/`)
    const response = await axios.get('api/user-access-logs/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.status === 200) {
      logs.value = response.data
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
table {
  border-collapse: collapse;
}

.v-chip {
  margin: 2px;
}
</style>