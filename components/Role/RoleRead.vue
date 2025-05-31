<!-- components/RoleRead.vue -->
<template>
  <div class="role-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="title">{{ t('title') }}</h1>
          <p class="subtitle">{{ t('subtitle') }}</p>
        </div>
        <div class="header-actions">
          <button class="lang-toggle" @click="toggleLanguage">
            <Icon name="mdi:translate" />
            {{ currentLanguage === 'lo' ? 'ລາວ' : 'EN' }}
          </button>
          <button class="btn-primary" @click="navigateToCreate">
            <Icon name="mdi:plus" />
            {{ t('addRole') }}
          </button>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <div class="loader"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <Icon name="mdi:alert-circle-outline" class="error-icon" />
      <p>{{ t('errorMessage') }}</p>
      <button class="btn-secondary" @click="refresh()">
        <Icon name="mdi:refresh" />
        {{ t('tryAgain') }}
      </button>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-wrapper">
          <Icon name="mdi:magnify" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('searchPlaceholder')"
            class="search-input"
            @input="handleSearch"
          />
          <button 
            v-if="searchQuery" 
            class="clear-btn"
            @click="searchQuery = ''"
          >
            <Icon name="mdi:close" />
          </button>
        </div>

        <!-- Filter Pills -->
        <div class="filter-pills">
          <button
            v-for="filter in filters"
            :key="filter.key"
            :class="['filter-pill', { active: activeFilter === filter.key }]"
            @click="setFilter(filter.key)"
          >
            {{ filter.label }}
            <span v-if="filter.count" class="count">{{ filter.count }}</span>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <!-- Results Header -->
        <div class="results-header">
          <span class="result-count">
            {{ filteredRoles.length }} {{ t('results') }}
          </span>
          <div class="view-toggle">
            <button 
              :class="['view-btn', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
              :title="t('listView')"
            >
              <Icon name="mdi:view-list" />
            </button>
            <button 
              :class="['view-btn', { active: viewMode === 'grid' }]"
              @click="viewMode = 'grid'"
              :title="t('gridView')"
            >
              <Icon name="mdi:view-grid" />
            </button>
          </div>
        </div>

        <!-- List View -->
        <div v-if="viewMode === 'list'" class="list-view">
          <div class="list-header">
            <div class="col-id">{{ t('roleId') }}</div>
            <div class="col-name">{{ t('roleName') }}</div>
            <div class="col-status">{{ t('status') }}</div>
            <div class="col-date">{{ t('created') }}</div>
            <div class="col-actions"></div>
          </div>
          
          <TransitionGroup name="list" tag="div" class="list-body">
            <div 
              v-for="role in paginatedRoles" 
              :key="role.role_id"
              class="list-item"
              @click="viewRole(role.role_id)"
            >
              <div class="col-id">
                <span class="role-code">{{ role.role_id }}</span>
              </div>
              <div class="col-name">
                <div class="name-wrapper">
                  <span class="name-primary">{{ role.role_name_la || role.role_name_en || '-' }}</span>
                  <span v-if="role.role_name_la && role.role_name_en" class="name-secondary">
                    {{ role.role_name_en }}
                  </span>
                </div>
              </div>
              <div class="col-status">
                <span :class="['status-badge', getStatusClass(role.record_Status)]">
                  {{ getStatusText(role.record_Status) }}
                </span>
                <span :class="['status-badge', getAuthClass(role.Auth_Status)]">
                  {{ getAuthText(role.Auth_Status) }}
                </span>
              </div>
              <div class="col-date">
                <time>{{ formatDate(role.Maker_DT_Stamp) }}</time>
              </div>
              <div class="col-actions" @click.stop>
                <button class="action-btn" @click="editRole(role.role_id)">
                  <Icon name="mdi:pencil" />
                </button>
                <button 
                  class="action-btn" 
                  @click="confirmDelete(role)"
                  :disabled="role.Auth_Status === 'A'"
                >
                  <Icon name="mdi:delete" />
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Grid View -->
        <div v-else class="grid-view">
          <TransitionGroup name="grid" tag="div" class="grid-container">
            <div 
              v-for="role in paginatedRoles" 
              :key="role.role_id"
              class="grid-card"
              @click="viewRole(role.role_id)"
            >
              <div class="card-header">
                <span class="role-code">{{ role.role_id }}</span>
                <div class="card-actions" @click.stop>
                  <button class="action-btn" @click="editRole(role.role_id)">
                    <Icon name="mdi:pencil" />
                  </button>
                  <button 
                    class="action-btn" 
                    @click="confirmDelete(role)"
                    :disabled="role.Auth_Status === 'A'"
                  >
                    <Icon name="mdi:delete" />
                  </button>
                </div>
              </div>
              
              <div class="card-body">
                <h3 class="card-title">{{ role.role_name_la || role.role_name_en || '-' }}</h3>
                <p v-if="role.role_name_la && role.role_name_en" class="card-subtitle">
                  {{ role.role_name_en }}
                </p>
              </div>
              
              <div class="card-footer">
                <div class="status-group">
                  <span :class="['status-badge', getStatusClass(role.record_Status)]">
                    {{ getStatusText(role.record_Status) }}
                  </span>
                  <span :class="['status-badge', getAuthClass(role.Auth_Status)]">
                    {{ getAuthText(role.Auth_Status) }}
                  </span>
                </div>
                <time class="card-date">{{ formatDate(role.Maker_DT_Stamp) }}</time>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <!-- Empty State -->
        <div v-if="filteredRoles.length === 0" class="empty-state">
          <Icon name="mdi:folder-open-outline" class="empty-icon" />
          <h3>{{ t('noResults') }}</h3>
          <p>{{ t('noResultsDesc') }}</p>
          <button v-if="!searchQuery" class="btn-primary" @click="navigateToCreate">
            <Icon name="mdi:plus" />
            {{ t('createFirst') }}
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            <Icon name="mdi:chevron-double-left" />
          </button>
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <Icon name="mdi:chevron-left" />
          </button>
          
          <div class="page-info">
            <span>{{ t('page') }} {{ currentPage }} {{ t('of') }} {{ totalPages }}</span>
          </div>
          
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <Icon name="mdi:chevron-right" />
          </button>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          >
            <Icon name="mdi:chevron-double-right" />
          </button>
        </div>
      </div>
    </template>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <Icon name="mdi:alert" class="modal-icon" />
              <h3>{{ t('confirmDelete') }}</h3>
            </div>
            
            <div class="modal-body">
              <p>{{ t('deleteMessage') }}</p>
              <div class="delete-info">
                <strong>{{ roleToDelete?.role_id }}</strong>
                <span>{{ roleToDelete?.role_name_la || roleToDelete?.role_name_en }}</span>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-secondary" @click="closeDeleteModal">
                {{ t('cancel') }}
              </button>
              <button class="btn-danger" @click="deleteRole">
                {{ t('delete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { RoleListResponse } from '~/models/rolemaster'

// Composables
const router = useRouter()
const { $toast } = useNuxtApp()

// State
const currentLanguage = ref<'lo' | 'en'>('lo')
const viewMode = ref<'list' | 'grid'>('list')
const searchQuery = ref('')
const activeFilter = ref('all')
const currentPage = ref(1)
const pageSize = 20
const showDeleteModal = ref(false)
const roleToDelete = ref<RoleListResponse | null>(null)

// Translations
const translations = {
  lo: {
    title: 'ການຈັດການບົດບາດ',
    subtitle: 'ຈັດການບົດບາດຜູ້ໃຊ້ແລະການອະນຸຍາດ',
    addRole: 'ເພີ່ມບົດບາດ',
    searchPlaceholder: 'ຄົ້ນຫາບົດບາດ...',
    errorMessage: 'ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ',
    tryAgain: 'ລອງໃໝ່',
    results: 'ຜົນການຄົ້ນຫາ',
    listView: 'ມຸມມອງລາຍການ',
    gridView: 'ມຸມມອງຕາຕະລາງ',
    roleId: 'ລະຫັດ',
    roleName: 'ຊື່ບົດບາດ',
    status: 'ສະຖານະ',
    created: 'ວັນທີສ້າງ',
    noResults: 'ບໍ່ພົບຂໍ້ມູນ',
    noResultsDesc: 'ບໍ່ມີບົດບາດທີ່ຕົງກັບການຄົ້ນຫາຂອງທ່ານ',
    createFirst: 'ສ້າງບົດບາດທຳອິດ',
    page: 'ໜ້າ',
    of: 'ຈາກ',
    confirmDelete: 'ຢືນຢັນການລົບ',
    deleteMessage: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບບົດບາດນີ້?',
    cancel: 'ຍົກເລີກ',
    delete: 'ລົບ',
    all: 'ທັງໝົດ',
    active: 'ໃຊ້ງານຢູ່',
    inactive: 'ປິດໃຊ້ງານ',
    authorized: 'ອະນຸຍາດແລ້ວ',
    unauthorized: 'ຍັງບໍ່ອະນຸຍາດ',
    statusActive: 'ໃຊ້ງານ',
    statusInactive: 'ປິດໃຊ້ງານ',
    statusCreated: 'ສ້າງແລ້ວ',
    authAuthorized: 'ອະນຸຍາດ',
    authUnauthorized: 'ລໍຖ້າອະນຸຍາດ',
    authRejected: 'ປະຕິເສດ'
  },
  en: {
    title: 'Role Management',
    subtitle: 'Manage user roles and permissions',
    addRole: 'Add Role',
    searchPlaceholder: 'Search roles...',
    errorMessage: 'Something went wrong. Please try again.',
    tryAgain: 'Try Again',
    results: 'results',
    listView: 'List view',
    gridView: 'Grid view',
    roleId: 'ID',
    roleName: 'Role Name',
    status: 'Status',
    created: 'Created',
    noResults: 'No results found',
    noResultsDesc: 'No roles match your search criteria',
    createFirst: 'Create First Role',
    page: 'Page',
    of: 'of',
    confirmDelete: 'Confirm Delete',
    deleteMessage: 'Are you sure you want to delete this role?',
    cancel: 'Cancel',
    delete: 'Delete',
    all: 'All',
    active: 'Active',
    inactive: 'Inactive',
    authorized: 'Authorized',
    unauthorized: 'Unauthorized',
    statusActive: 'Active',
    statusInactive: 'Inactive',
    statusCreated: 'Created',
    authAuthorized: 'Authorized',
    authUnauthorized: 'Pending',
    authRejected: 'Rejected'
  }
}

const t = (key: string) => {
  return translations[currentLanguage.value][key as keyof typeof translations.lo] || key
}

// Fetch data
const { data: roles, pending, error, refresh } = await useFetch<RoleListResponse[]>('/api/roles/', {
  default: () => [],
  transform: (data: any) => {
    return Array.isArray(data) ? data : data.results || []
  }
})

// Computed
const filters = computed(() => {
  const counts = {
    all: roles.value?.length || 0,
    active: roles.value?.filter(r => r.record_Status === 'A').length || 0,
    inactive: roles.value?.filter(r => r.record_Status === 'I').length || 0,
    authorized: roles.value?.filter(r => r.Auth_Status === 'A').length || 0,
    unauthorized: roles.value?.filter(r => r.Auth_Status === 'U').length || 0
  }

  return [
    { key: 'all', label: t('all'), count: counts.all },
    { key: 'active', label: t('active'), count: counts.active },
    { key: 'inactive', label: t('inactive'), count: counts.inactive },
    { key: 'authorized', label: t('authorized'), count: counts.authorized },
    { key: 'unauthorized', label: t('unauthorized'), count: counts.unauthorized }
  ]
})

const filteredRoles = computed(() => {
  if (!roles.value) return []
  
  let filtered = [...roles.value]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(role => 
      role.role_id.toLowerCase().includes(query) ||
      role.role_name_la?.toLowerCase().includes(query) ||
      role.role_name_en?.toLowerCase().includes(query)
    )
  }
  
  // Status filter
  switch (activeFilter.value) {
    case 'active':
      filtered = filtered.filter(r => r.record_Status === 'A')
      break
    case 'inactive':
      filtered = filtered.filter(r => r.record_Status === 'I')
      break
    case 'authorized':
      filtered = filtered.filter(r => r.Auth_Status === 'A')
      break
    case 'unauthorized':
      filtered = filtered.filter(r => r.Auth_Status === 'U')
      break
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredRoles.value.length / pageSize))

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredRoles.value.slice(start, end)
})

// Methods
const toggleLanguage = () => {
  currentLanguage.value = currentLanguage.value === 'lo' ? 'en' : 'lo'
}

const handleSearch = () => {
  currentPage.value = 1
}

const setFilter = (filter: string) => {
  activeFilter.value = filter
  currentPage.value = 1
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'A': return 'active'
    case 'I': return 'inactive'
    case 'C': return 'created'
    default: return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'A': return t('statusActive')
    case 'I': return t('statusInactive')
    case 'C': return t('statusCreated')
    default: return status
  }
}

const getAuthClass = (status: string) => {
  switch (status) {
    case 'A': return 'authorized'
    case 'U': return 'unauthorized'
    case 'R': return 'rejected'
    default: return 'default'
  }
}

const getAuthText = (status: string) => {
  switch (status) {
    case 'A': return t('authAuthorized')
    case 'U': return t('authUnauthorized')
    case 'R': return t('authRejected')
    default: return status
  }
}

const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const d = new Date(date)
  return currentLanguage.value === 'lo' 
    ? d.toLocaleDateString('lo-LA')
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const navigateToCreate = () => {
  router.push('/role/create')
}

const viewRole = (roleId: string) => {
  router.push(`/role/${roleId}`)
}

const editRole = (roleId: string) => {
  router.push(`/role/${roleId}/update`)
}

const confirmDelete = (role: RoleListResponse) => {
  roleToDelete.value = role
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  roleToDelete.value = null
}

const deleteRole = async () => {
  if (!roleToDelete.value) return
  
  try {
    await $fetch(`/api/roles/${roleToDelete.value.role_id}/`, {
      method: 'DELETE'
    })
    
    await refresh()
    $toast?.success(t('delete') + ' ' + t('results'))
    
  } catch (error) {
    $toast?.error(t('errorMessage'))
  } finally {
    closeDeleteModal()
  }
}

// Lifecycle
watch([searchQuery, activeFilter], () => {
  currentPage.value = 1
})
</script>

<style scoped>
/* Font Import */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap');

/* CSS Variables */
:root {
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --secondary: #e5e7eb;
  --secondary-hover: #d1d5db;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --danger-hover: #dc2626;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  
  --border: #e5e7eb;
  --border-light: #f3f4f6;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  
  --radius: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
  
  --transition: all 0.2s ease;
}

/* Global Styles */
* {
  box-sizing: border-box;
}

/* Container */
.role-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  font-family: 'Noto Sans Lao', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.lang-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.lang-toggle:hover {
  background: var(--secondary);
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--secondary);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover {
  background: var(--danger-hover);
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.loader {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: var(--danger);
}

/* Search Section */
.search-section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem;
}

.search-wrapper {
  position: relative;
  max-width: 480px;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.clear-btn:hover {
  background: var(--secondary);
  color: var(--text-primary);
}

/* Filter Pills */
.filter-pills {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.filter-pill:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-pill.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.filter-pill .count {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.filter-pill.active .count {
  background: rgba(255, 255, 255, 0.2);
}

/* Content Area */
.content-area {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
}

/* Results Header */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.result-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius);
}

.view-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: var(--transition);
}

.view-btn:hover {
  color: var(--text-secondary);
}

.view-btn.active {
  background: var(--bg-primary);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

/* List View */
.list-view {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.list-header {
  display: grid;
  grid-template-columns: 120px 1fr 200px 140px 100px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--bg-tertiary);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}

.list-body {
  position: relative;
}

.list-item {
  display: grid;
  grid-template-columns: 120px 1fr 200px 140px 100px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: var(--transition);
}

.list-item:hover {
  background: var(--bg-secondary);
}

.list-item:last-child {
  border-bottom: none;
}

.role-code {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  display: inline-block;
}

.name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name-primary {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.name-secondary {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.col-status {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.status-badge.created {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.status-badge.authorized {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.unauthorized {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.col-date {
  display: flex;
  align-items: center;
}

.col-date time {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.col-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: var(--transition);
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Grid View */
.grid-view {
  padding-top: 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.grid-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.grid-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.grid-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.grid-card:hover::before {
  transform: translateX(0);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.grid-card:hover .card-actions {
  opacity: 1;
}

.card-body {
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.card-subtitle {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.status-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-tertiary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.page-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  padding: 0 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 28rem;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-icon {
  font-size: 1.5rem;
  color: var(--danger);
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.delete-info {
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.delete-info strong {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.delete-info span {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--bg-tertiary);
}

/* Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-move {
  transition: transform 0.3s ease;
}

.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}

.grid-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal {
  transform: scale(0.9);
}

.modal-leave-to .modal {
  transform: scale(0.9);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .list-header,
  .list-item {
    grid-template-columns: 100px 1fr 160px 100px;
  }
  
  .col-date {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .search-wrapper {
    max-width: 100%;
  }
  
  .list-header {
    display: none;
  }
  
  .list-item {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .list-item > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .col-status {
    justify-content: flex-start;
  }
  
  .col-actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .page-info {
    width: 100%;
    text-align: center;
    order: -1;
    margin-bottom: 0.5rem;
  }
}

/* Print Styles */
@media print {
  .header-actions,
  .search-section,
  .view-toggle,
  .col-actions,
  .card-actions,
  .pagination,
  .modal-overlay {
    display: none !important;
  }
  
  .role-container {
    background: white;
  }
  
  .list-item {
    break-inside: avoid;
  }
}
</style>