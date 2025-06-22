
<template>
  <v-container fluid class="pa-4">
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h2 class="text-h4 font-weight-medium text-primary">ການຈັດການ EOC Maintain</h2>
          <v-btn
            color="primary"
            @click="$router.push('/eocfunction/create')"
            prepend-icon="mdi-plus"
            variant="elevated"
            class="text-none"
          >
            ສ້າງໃໝ່
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters Section -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.eoc_type"
          :items="eocTypeOptions"
          label="ປະເພດ EOC"
          clearable
          outlined
          dense
          @change="fetchData"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.Record_Status"
          :items="recordStatOptions"
          label="ສະຖານະ Record"
          clearable
          outlined
          dense
          @change="fetchData"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="filters.Auth_Status"
          :items="authStatusOptions"
          label="ສະຖານະການອະນຸມັດ"
          clearable
          outlined
          dense
          @change="fetchData"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="searchQuery"
          label="ຄົ້ນຫາ"
          prepend-inner-icon="mdi-magnify"
          clearable
          outlined
          dense
          @input="debounceSearch"
        />
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" md="3" v-for="stat in statistics" :key="stat.title">
        <v-card class="pa-3" outlined>
          <div class="d-flex align-center">
            <v-icon :color="stat.color" size="32" class="mr-3">{{ stat.icon }}</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ stat.value }}</div>
              <div class="text-caption text-grey-darken-1">{{ stat.title }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-card outlined>
      <v-card-title class="bg-grey-lighten-4 pa-4">
        <span class="text-h6">ລາຍການ EOC Maintain</span>
        <v-spacer />
        <v-btn
          @click="fetchData"
          icon="mdi-refresh"
          variant="text"
          size="small"
        />
      </v-card-title>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="items"
        :items-length="totalItems"
        :loading="loading"
        :search="searchQuery"
        @update:options="fetchData"
        class="elevation-0"
        item-value="eoc_id"
      >
        <!-- Status Chips -->
        <template v-slot:item.Record_Status="{ item }">
          <v-chip
            :color="getStatusColor(item.Record_Status)"
            size="small"
            variant="flat"
          >
            {{ getStatusText(item.Record_Status) }}
          </v-chip>
        </template>

        <template v-slot:item.Auth_Status="{ item }">
          <v-chip
            :color="getAuthStatusColor(item.Auth_Status)"
            size="small"
            variant="flat"
          >
            {{ getAuthStatusText(item.Auth_Status) }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              @click="viewItem(item)"
              icon="mdi-eye"
              size="small"
              variant="text"
              color="blue"
            />
            <v-btn
              @click="editItem(item)"
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="green"
              :disabled="item.Auth_Status === 'A'"
            />
            <v-btn
              @click="deleteItem(item)"
              icon="mdi-delete"
              size="small"
              variant="text"
              color="red"
              :disabled="item.Auth_Status === 'A'"
            />
            
            <!-- Status Actions -->
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="toggleOpen(item)" :disabled="item.Auth_Status !== 'A'">
                  <v-list-item-title>
                    {{ item.Record_Status === 'O' ? 'ປິດ' : 'ເປີດ' }}
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="toggleAuth(item)">
                  <v-list-item-title>
                    {{ item.Auth_Status === 'A' ? 'ຍົກເລີກອະນຸມັດ' : 'ອະນຸມັດ' }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <!-- No Data -->
        <template v-slot:no-data>
          <div class="text-center pa-4">
            <v-icon size="64" color="grey-lighten-2">mdi-database-off</v-icon>
            <div class="text-h6 text-grey-darken-1 mt-2">ບໍ່ມີຂໍ້ມູນ</div>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">ຢືນຢັນການລຶບ</v-card-title>
        <v-card-text>
          ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ EOC Maintain ນີ້?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false" variant="text">ຍົກເລີກ</v-btn>
          <v-btn @click="confirmDelete" color="red" variant="flat">ລຶບ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from "@/helpers/axios";

const router = useRouter()

// Reactive data
const loading = ref(false)
const items = ref([])
const totalItems = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const deleteDialog = ref(false)
const itemToDelete = ref(null)
const stats = ref({})

// Filters
const filters = ref({
  eoc_type: null,
  Record_Status: null,
  Auth_Status: null
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Options
const eocTypeOptions = ref([
  { title: 'Type A', value: 'A' },
  { title: 'Type B', value: 'B' },
  { title: 'Type C', value: 'C' }
])

const recordStatOptions = ref([
  { title: 'ເປີດ', value: 'O' },
  { title: 'ປິດ', value: 'C' }
])

const authStatusOptions = ref([
  { title: 'ອະນຍມັດແລ້ວ', value: 'A' },
  { title: 'ລໍຖ້າອະນຸມັດ', value: 'U' }
])

// Table headers
const headers = ref([
  { title: 'ID', key: 'eoc_id', sortable: true },
  { title: 'ລໍາດັບ', key: 'eoc_seq_no', sortable: true },
  { title: 'ປະເພດ EOC', key: 'eoc_type', sortable: true },
  { title: 'Module', key: 'module_name', sortable: false },
  { title: 'Function', key: 'function_name', sortable: false },
  { title: 'ສະຖານະ Record', key: 'Record_Status', sortable: true },
  { title: 'ສະຖານະການອະນຸມັດ', key: 'Auth_Status', sortable: true },
  { title: 'ຜູ້ສ້າງ', key: 'maker_name', sortable: false },
  { title: 'ວັນທີສ້າງ', key: 'Maker_DT_Stamp', sortable: true },
  { title: 'ການດໍາເນີນງານ', key: 'actions', sortable: false, width: '200px' }
])

// Computed statistics
const statistics = computed(() => [
  {
    title: 'ທັງໝົດ',
    value: stats.value.total_records || 0,
    icon: 'mdi-file-document-multiple',
    color: 'blue'
  },
  {
    title: 'ອະນຸມັດແລ້ວ',
    value: stats.value.authorized || 0,
    icon: 'mdi-check-circle',
    color: 'green'
  },
  {
    title: 'ລໍຖ້າອະນຸມັດ',
    value: stats.value.unauthorized || 0,
    icon: 'mdi-clock-outline',
    color: 'orange'
  },
  {
    title: 'ເປີດຢູ່',
    value: stats.value.open_records || 0,
    icon: 'mdi-lock-open',
    color: 'purple'
  }
])

// Methods
const fetchData = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({
      page: page.value,
      page_size: itemsPerPage.value,
      search: searchQuery.value || '',
      ...Object.fromEntries(Object.entries(filters.value).filter(([_, v]) => v !== null))
    })

    const response = await axios.get(`/api/eoc-maintain/?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('Response data:', response.data);
    

    if (response.ok) {
      const data = await response.json()
      items.value = data.results
      totalItems.value = data.count
    } else {
      showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຂໍ້ມູນ', 'error')
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່', 'error')
  } finally {
    loading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch('/api/eoc-maintain/statistics/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      stats.value = await response.json()
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
  }
}

const debounceSearch = (() => {
  let timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fetchData()
    }, 500)
  }
})()

const viewItem = (item) => {
  router.push(`/eoc-maintain/view/${item.eoc_id}`)
}

const editItem = (item) => {
  router.push(`/eoc-maintain/update${item.eoc_id}`)
}

const deleteItem = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/eoc-maintain/${itemToDelete.value.eoc_id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      showSnackbar('ລຶບສໍາເລັດແລ້ວ', 'success')
      fetchData()
      fetchStatistics()
    } else {
      const errorData = await response.json()
      showSnackbar(errorData.error || 'ເກີດຂໍ້ຜິດພາດໃນການລຶບ', 'error')
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່', 'error')
  } finally {
    deleteDialog.value = false
    itemToDelete.value = null
  }
}

const toggleOpen = async (item) => {
  const action = item.Record_Status === 'O' ? 'set_close' : 'set_open'
  await performAction(item.eoc_id, action)
}

const toggleAuth = async (item) => {
  const action = item.Auth_Status === 'A' ? 'unauthorize' : 'authorize'
  await performAction(item.eoc_id, action)
}

const performAction = async (id, action) => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/eoc-maintain/${id}/${action}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      showSnackbar(data.message, 'success')
      fetchData()
      fetchStatistics()
    } else {
      const errorData = await response.json()
      showSnackbar(errorData.detail || errorData.error || 'ເກີດຂໍ້ຜິດພາດ', 'error')
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່', 'error')
  }
}

const getStatusColor = (status) => {
  return status === 'O' ? 'green' : 'grey'
}

const getStatusText = (status) => {
  return status === 'O' ? 'ເປີດ' : 'ປິດ'
}

const getAuthStatusColor = (status) => {
  return status === 'A' ? 'green' : 'orange'
}

const getAuthStatusText = (status) => {
  return status === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າອະນຸມັດ'
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  fetchData()
  fetchStatistics()
})
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}

.v-btn {
  text-transform: none !important;
}

.v-chip {
  font-weight: 500;
}
</style>
