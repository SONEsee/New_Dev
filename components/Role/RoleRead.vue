<!-- components/RoleRead.vue -->
<template>
  <div class="role-list-container">
    <!-- Language Toggle -->
    <div class="language-toggle">
      <button 
        @click="currentLanguage = 'en'" 
        :class="['lang-btn', { active: currentLanguage === 'en' }]"
      >
        EN
      </button>
      <button 
        @click="currentLanguage = 'lo'" 
        :class="['lang-btn', { active: currentLanguage === 'lo' }]"
      >
        ລາວ
      </button>
    </div>

    <div class="header-section">
      <div class="title-group">
        <h1 class="page-title">
          {{ currentLanguage === 'en' ? 'Role Management' : 'ການຈັດການບົດບາດ' }}
        </h1>
        <p class="page-subtitle">
          {{ currentLanguage === 'en' 
            ? 'Manage user roles and permissions' 
            : 'ຈັດການບົດບາດຜູ້ໃຊ້ແລະການອະນຸຍາດ' 
          }}
        </p>
      </div>
      <button 
        @click="navigateToCreate" 
        class="btn btn-primary"
      >
        <Icon name="mdi:plus" size="18" />
        {{ currentLanguage === 'en' ? 'Add Role' : 'ເພີ່ມບົດບາດ' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">
        {{ currentLanguage === 'en' ? 'Loading roles...' : 'ກໍາລັງໂຫຼດບົດບາດ...' }}
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <Icon name="mdi:alert-circle-outline" class="error-icon" />
        <h3>{{ currentLanguage === 'en' ? 'Something went wrong' : 'ມີບາງຢ່າງຜິດພາດ' }}</h3>
        <p class="error-message">{{ error }}</p>
        <button @click="refresh()" class="btn btn-outline">
          <Icon name="mdi:refresh" size="18" />
          {{ currentLanguage === 'en' ? 'Try Again' : 'ລອງໃໝ່' }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-container">
          <div class="search-box">
            <Icon name="mdi:magnify" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="currentLanguage === 'en' ? 'Search roles...' : 'ຄົ້ນຫາບົດບາດ...'"
              class="search-input"
            />
          </div>
        </div>
        
        <div class="filter-group">
          <div class="filter-item">
            <label class="filter-label">
              {{ currentLanguage === 'en' ? 'Status' : 'ສະຖານະ' }}
            </label>
            <select v-model="statusFilter" class="filter-select">
              <option value="">{{ currentLanguage === 'en' ? 'All Status' : 'ທຸກສະຖານະ' }}</option>
              <option value="A">{{ currentLanguage === 'en' ? 'Active' : 'ເປີດໃຊ້ງານ' }}</option>
              <option value="I">{{ currentLanguage === 'en' ? 'Inactive' : 'ປິດໃຊ້ງານ' }}</option>
              <option value="C">{{ currentLanguage === 'en' ? 'Created' : 'ສ້າງແລ້ວ' }}</option>
            </select>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">
              {{ currentLanguage === 'en' ? 'Authorization' : 'ການອະນຸຍາດ' }}
            </label>
            <select v-model="authFilter" class="filter-select">
              <option value="">{{ currentLanguage === 'en' ? 'All Authorization' : 'ທຸກການອະນຸຍາດ' }}</option>
              <option value="A">{{ currentLanguage === 'en' ? 'Authorized' : 'ອະນຸຍາດແລ້ວ' }}</option>
              <option value="U">{{ currentLanguage === 'en' ? 'Unauthorized' : 'ຍັງບໍ່ອະນຸຍາດ' }}</option>
              <option value="R">{{ currentLanguage === 'en' ? 'Rejected' : 'ປະຕິເສດ' }}</option>
            </select>
          </div>
          
          <button 
            v-if="searchQuery || statusFilter || authFilter"
            @click="clearFilters"
            class="btn btn-ghost btn-sm"
          >
            <Icon name="mdi:filter-off" size="16" />
            {{ currentLanguage === 'en' ? 'Clear' : 'ລ້າງ' }}
          </button>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="results-summary">
        <span class="results-count">
          {{ filteredRoles.length }} {{ currentLanguage === 'en' ? 'roles found' : 'ບົດບາດພົບ' }}
        </span>
        <div class="view-options">
          <button 
            @click="viewMode = 'table'" 
            :class="['view-btn', { active: viewMode === 'table' }]"
            :title="currentLanguage === 'en' ? 'Table view' : 'ມຸມມອງຕາຕະລາງ'"
          >
            <Icon name="mdi:table" size="18" />
          </button>
          <button 
            @click="viewMode = 'grid'" 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            :title="currentLanguage === 'en' ? 'Grid view' : 'ມຸມມອງກຣິດ'"
          >
            <Icon name="mdi:view-grid" size="18" />
          </button>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="table-container">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th @click="sortBy('role_id')" class="sortable">
                  <div class="th-content">
                    <span>{{ currentLanguage === 'en' ? 'Role ID' : 'ລະຫັດບົດບາດ' }}</span>
                    <Icon :name="getSortIcon('role_id')" class="sort-icon" />
                  </div>
                </th>
                <th @click="sortBy('role_name_la')" class="sortable">
                  <div class="th-content">
                    <span>{{ currentLanguage === 'en' ? 'Name (Lao)' : 'ຊື່ (ລາວ)' }}</span>
                    <Icon :name="getSortIcon('role_name_la')" class="sort-icon" />
                  </div>
                </th>
                <th @click="sortBy('role_name_en')" class="sortable">
                  <div class="th-content">
                    <span>{{ currentLanguage === 'en' ? 'Name (English)' : 'ຊື່ (ອັງກິດ)' }}</span>
                    <Icon :name="getSortIcon('role_name_en')" class="sort-icon" />
                  </div>
                </th>
                <th>{{ currentLanguage === 'en' ? 'Status' : 'ສະຖານະ' }}</th>
                <th>{{ currentLanguage === 'en' ? 'Authorization' : 'ການອະນຸຍາດ' }}</th>
                <th @click="sortBy('Maker_DT_Stamp')" class="sortable">
                  <div class="th-content">
                    <span>{{ currentLanguage === 'en' ? 'Created' : 'ສ້າງເມື່ອ' }}</span>
                    <Icon :name="getSortIcon('Maker_DT_Stamp')" class="sort-icon" />
                  </div>
                </th>
                <th class="actions-header">{{ currentLanguage === 'en' ? 'Actions' : 'ການກະທໍາ' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in paginatedRoles" :key="role.role_id" class="table-row">
                <td class="role-id">
                  <code>{{ role.role_id }}</code>
                </td>
                <td class="role-name">
                  <span>{{ role.role_name_la || '-' }}</span>
                </td>
                <td class="role-name">
                  <span>{{ role.role_name_en || '-' }}</span>
                </td>
                <td>
                  <span :class="getStatusClass(role.record_Status)">
                    {{ getStatusText(role.record_Status) }}
                  </span>
                </td>
                <td>
                  <span :class="getAuthStatusClass(role.Auth_Status)">
                    {{ getAuthStatusText(role.Auth_Status) }}
                  </span>
                </td>
                <td class="date-cell">
                  <time>{{ formatDate(role.Maker_DT_Stamp) }}</time>
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button 
                      @click="viewRole(role.role_id)"
                      class="action-btn view-btn"
                      :title="currentLanguage === 'en' ? 'View details' : 'ເບິ່ງລາຍລະອຽດ'"
                    >
                      <Icon name="mdi:eye-outline" size="16" />
                    </button>
                    <button 
                      @click="editRole(role.role_id)"
                      class="action-btn edit-btn"
                      :title="currentLanguage === 'en' ? 'Edit role' : 'ແກ້ໄຂບົດບາດ'"
                    >
                      <Icon name="mdi:pencil-outline" size="16" />
                    </button>
                    <button 
                      @click="confirmDelete(role)"
                      class="action-btn delete-btn"
                      :title="currentLanguage === 'en' ? 'Delete role' : 'ລຶບບົດບາດ'"
                      :disabled="role.Auth_Status === 'A'"
                    >
                      <Icon name="mdi:trash-can-outline" size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Grid View -->
      <div v-else class="grid-container">
        <div class="roles-grid">
          <div 
            v-for="role in paginatedRoles" 
            :key="role.role_id" 
            class="role-card"
            @click="viewRole(role.role_id)"
          >
            <div class="card-header">
              <div class="role-info">
                <h3 class="role-title">
                  <code>{{ role.role_id }}</code>
                </h3>
                <div class="role-names">
                  <p v-if="role.role_name_la" class="role-name-la">{{ role.role_name_la }}</p>
                  <p v-if="role.role_name_en" class="role-name-en">{{ role.role_name_en }}</p>
                </div>
              </div>
              <div class="card-menu">
                <button 
                  @click.stop="toggleCardMenu(role.role_id)"
                  class="menu-btn"
                >
                  <Icon name="mdi:dots-vertical" size="16" />
                </button>
                <div v-if="activeCardMenu === role.role_id" class="card-dropdown">
                  <button @click.stop="viewRole(role.role_id)" class="dropdown-item">
                    <Icon name="mdi:eye-outline" size="16" />
                    {{ currentLanguage === 'en' ? 'View' : 'ເບິ່ງ' }}
                  </button>
                  <button @click.stop="editRole(role.role_id)" class="dropdown-item">
                    <Icon name="mdi:pencil-outline" size="16" />
                    {{ currentLanguage === 'en' ? 'Edit' : 'ແກ້ໄຂ' }}
                  </button>
                  <button 
                    @click.stop="confirmDelete(role)" 
                    class="dropdown-item delete"
                    :disabled="role.Auth_Status === 'A'"
                  >
                    <Icon name="mdi:trash-can-outline" size="16" />
                    {{ currentLanguage === 'en' ? 'Delete' : 'ລຶບ' }}
                  </button>
                </div>
              </div>
            </div>
            
            <div class="card-body">
              <div class="status-row">
                <span :class="getStatusClass(role.record_Status)">
                  {{ getStatusText(role.record_Status) }}
                </span>
                <span :class="getAuthStatusClass(role.Auth_Status)">
                  {{ getAuthStatusText(role.Auth_Status) }}
                </span>
              </div>
              
              <div class="card-footer">
                <span class="created-date">
                  {{ currentLanguage === 'en' ? 'Created' : 'ສ້າງເມື່ອ' }}: {{ formatDate(role.Maker_DT_Stamp) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredRoles.length === 0" class="empty-state">
        <div class="empty-content">
          <Icon name="mdi:database-search-outline" class="empty-icon" />
          <h3 class="empty-title">
            {{ currentLanguage === 'en' ? 'No roles found' : 'ບໍ່ພົບບົດບາດ' }}
          </h3>
          <p class="empty-description">
            <span v-if="searchQuery || statusFilter || authFilter">
              {{ currentLanguage === 'en' 
                ? 'Try adjusting your search criteria or filters' 
                : 'ລອງປັບປ່ຽນເງື່ອນໄຂການຄົ້ນຫາຫຼືຕົວກອງ' 
              }}
            </span>
            <span v-else>
              {{ currentLanguage === 'en' 
                ? 'Get started by creating your first role' 
                : 'ເລີ່ມຕົ້ນໂດຍການສ້າງບົດບາດທໍາອິດຂອງທ່ານ' 
              }}
            </span>
          </p>
          <button 
            v-if="!searchQuery && !statusFilter && !authFilter"
            @click="navigateToCreate" 
            class="btn btn-primary"
          >
            <Icon name="mdi:plus" size="18" />
            {{ currentLanguage === 'en' ? 'Create First Role' : 'ສ້າງບົດບາດທໍາອິດ' }}
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination">
          <button 
            @click="currentPage = 1" 
            :disabled="currentPage === 1"
            class="pagination-btn"
            :title="currentLanguage === 'en' ? 'First page' : 'ໜ້າທໍາອິດ'"
          >
            <Icon name="mdi:chevron-double-left" size="16" />
          </button>
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="pagination-btn"
            :title="currentLanguage === 'en' ? 'Previous page' : 'ໜ້າກ່ອນໜ້າ'"
          >
            <Icon name="mdi:chevron-left" size="16" />
          </button>
          
          <div class="pagination-info">
            <span class="page-numbers">
              {{ currentLanguage === 'en' 
                ? `Page ${currentPage} of ${totalPages}` 
                : `ໜ້າ ${currentPage} ຂອງ ${totalPages}` 
              }}
            </span>
            <span class="total-items">
              {{ filteredRoles.length }} {{ currentLanguage === 'en' ? 'total items' : 'ລາຍການທັງໝົດ' }}
            </span>
          </div>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            :title="currentLanguage === 'en' ? 'Next page' : 'ໜ້າຕໍ່ໄປ'"
          >
            <Icon name="mdi:chevron-right" size="16" />
          </button>
          <button 
            @click="currentPage = totalPages" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            :title="currentLanguage === 'en' ? 'Last page' : 'ໜ້າສຸດທ້າຍ'"
          >
            <Icon name="mdi:chevron-double-right" size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-container" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <Icon name="mdi:alert-circle-outline" class="modal-icon warning" />
            <h3 class="modal-title">
              {{ currentLanguage === 'en' ? 'Confirm Deletion' : 'ຢືນຢັນການລຶບ' }}
            </h3>
          </div>
          
          <div class="modal-body">
            <p class="modal-description">
              {{ currentLanguage === 'en' 
                ? `Are you sure you want to delete the role "${roleToDelete?.role_id}"?` 
                : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບົດບາດ "${roleToDelete?.role_id}"?` 
              }}
            </p>
            <div class="role-details">
              <div v-if="roleToDelete?.role_name_la" class="detail-item">
                <span class="detail-label">{{ currentLanguage === 'en' ? 'Lao Name:' : 'ຊື່ລາວ:' }}</span>
                <span class="detail-value">{{ roleToDelete.role_name_la }}</span>
              </div>
              <div v-if="roleToDelete?.role_name_en" class="detail-item">
                <span class="detail-label">{{ currentLanguage === 'en' ? 'English Name:' : 'ຊື່ອັງກິດ:' }}</span>
                <span class="detail-value">{{ roleToDelete.role_name_en }}</span>
              </div>
            </div>
            <div class="warning-message">
              <Icon name="mdi:information-outline" size="16" />
              <span>
                {{ currentLanguage === 'en' 
                  ? 'This action cannot be undone.' 
                  : 'ການກະທໍານີ້ບໍ່ສາມາດຍົກເລີກໄດ້.' 
                }}
              </span>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeDeleteModal" class="btn btn-outline">
              <Icon name="mdi:close" size="16" />
              {{ currentLanguage === 'en' ? 'Cancel' : 'ຍົກເລີກ' }}
            </button>
            <button @click="deleteRole" class="btn btn-danger">
              <Icon name="mdi:trash-can-outline" size="16" />
              {{ currentLanguage === 'en' ? 'Delete Role' : 'ລຶບບົດບາດ' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RoleMasterModel } from '~/models/rolemaster'

// Page metadata
definePageMeta({
  title: 'Role Management'
})

// Reactive data
const currentLanguage = ref<'en' | 'lo'>('en')
const viewMode = ref<'table' | 'grid'>('table')
const activeCardMenu = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref('')
const authFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const sortField = ref('role_id')
const sortDirection = ref<'asc' | 'desc'>('asc')
const showDeleteModal = ref(false)
const roleToDelete = ref<RoleMasterModel.RoleListResponse | null>(null)

// Fetch roles data
const { data: roles, pending, error, refresh } = await useFetch<RoleMasterModel.RoleListResponse[]>('/api/roles/', {
  default: () => [],
  transform: (data: any) => {
    return Array.isArray(data) ? data : data.results || []
  }
})

// Computed properties
const filteredRoles = computed(() => {
  if (!roles.value) return []
  
  let filtered = [...roles.value]
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(role => 
      role.role_id.toLowerCase().includes(query) ||
      role.role_name_la?.toLowerCase().includes(query) ||
      role.role_name_en?.toLowerCase().includes(query)
    )
  }
  
  // Apply status filter
  if (statusFilter.value) {
    filtered = filtered.filter(role => role.record_Status === statusFilter.value)
  }
  
  // Apply auth filter
  if (authFilter.value) {
    filtered = filtered.filter(role => role.Auth_Status === authFilter.value)
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    const aVal = a[sortField.value as keyof RoleMasterModel.RoleListResponse] || ''
    const bVal = b[sortField.value as keyof RoleMasterModel.RoleListResponse] || ''
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
  
  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredRoles.value.length / pageSize.value)
)

const paginatedRoles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRoles.value.slice(start, end)
})

// Methods
const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field: string) => {
  if (sortField.value !== field) return 'mdi:unfold-more-horizontal'
  return sortDirection.value === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  authFilter.value = ''
  currentPage.value = 1
}

const toggleCardMenu = (roleId: string) => {
  activeCardMenu.value = activeCardMenu.value === roleId ? null : roleId
}

const getStatusClass = (status: string) => {
  const classes = {
    'A': 'status-badge status-active',
    'I': 'status-badge status-inactive', 
    'C': 'status-badge status-created'
  }
  return classes[status as keyof typeof classes] || 'status-badge status-default'
}

const getStatusText = (status: string) => {
  if (currentLanguage.value === 'en') {
    const texts = {
      'A': 'Active',
      'I': 'Inactive',
      'C': 'Created'
    }
    return texts[status as keyof typeof texts] || status
  } else {
    const texts = {
      'A': 'ເປີດໃຊ້ງານ',
      'I': 'ປິດໃຊ້ງານ',
      'C': 'ສ້າງແລ້ວ'
    }
    return texts[status as keyof typeof texts] || status
  }
}

const getAuthStatusClass = (status: string) => {
  const classes = {
    'A': 'auth-badge auth-authorized',
    'U': 'auth-badge auth-unauthorized',
    'R': 'auth-badge auth-rejected'
  }
  return classes[status as keyof typeof classes] || 'auth-badge auth-default'
}

const getAuthStatusText = (status: string) => {
  if (currentLanguage.value === 'en') {
    const texts = {
      'A': 'Authorized',
      'U': 'Unauthorized', 
      'R': 'Rejected'
    }
    return texts[status as keyof typeof texts] || status
  } else {
    const texts = {
      'A': 'ອະນຸຍາດແລ້ວ',
      'U': 'ຍັງບໍ່ອະນຸຍາດ',
      'R': 'ປະຕິເສດ'
    }
    return texts[status as keyof typeof texts] || status
  }
}

const formatDate = (date: Date | string) => {
  if (!date) return '-'
  const dateObj = new Date(date)
  
  if (currentLanguage.value === 'en') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } else {
    return dateObj.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const navigateToCreate = () => {
  navigateTo('/role/create')
}

const viewRole = (roleId: string) => {
  navigateTo(`/role/${roleId}`)
}

const editRole = (roleId: string) => {
  navigateTo(`/role/${roleId}/update`)
}

const confirmDelete = (role: RoleMasterModel.RoleListResponse) => {
  roleToDelete.value = role
  showDeleteModal.value = true
  activeCardMenu.value = null
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
    
    const message = currentLanguage.value === 'en' 
      ? 'Role deleted successfully' 
      : 'ລຶບບົດບາດສຳເລັດແລ້ວ'
    useNuxtApp().$toast?.success(message)
    
  } catch (error) {
    console.error('Delete error:', error)
    const message = currentLanguage.value === 'en' 
      ? 'Failed to delete role' 
      : 'ການລຶບບົດບາດລົ້ມເຫລວ'
    useNuxtApp().$toast?.error(message)
  } finally {
    closeDeleteModal()
  }
}

// Close card menu when clicking outside
const handleClickOutside = () => {
  activeCardMenu.value = null
}

// Watch for search changes to reset pagination
watch([searchQuery, statusFilter, authFilter], () => {
  currentPage.value = 1
})

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Global Variables */
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-secondary: #64748b;
  --color-success: #059669;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-info: #0891b2;
  
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-border: #e2e8f0;
  --color-border-light: #f1f5f9;
  
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
}

/* Component Styles */
.role-list-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: var(--space-xl);
}

/* Language Toggle */
.language-toggle {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  z-index: 50;
  display: flex;
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.lang-btn {
  padding: var(--space-sm) var(--space-md);
  background: transparent;
  border: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-btn.active {
  background: var(--color-primary);
  color: white;
}

.lang-btn:hover:not(.active) {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xl);
  gap: var(--space-lg);
}

.title-group {
  flex: 1;
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 400px;
}

.loading-spinner {
  margin-bottom: var(--space-lg);
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  display: flex;
  justify-content: center;
  padding: var(--space-xl) 0;
  min-height: 400px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  color: var(--color-danger);
  margin-bottom: var(--space-lg);
}

.error-content h3 {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.error-message {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.5;
}

/* Main Content */
.main-content {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

/* Filters Section */
.filters-section {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.search-container {
  margin-bottom: var(--space-lg);
}

.search-box {
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  padding: var(--space-md) var(--space-md) var(--space-md) 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.filter-group {
  display: flex;
  align-items: flex-end;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 150px;
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.filter-select {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(37 99 235 / 0.1);
}

/* Results Summary */
.results-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.results-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.view-options {
  display: flex;
  gap: var(--space-xs);
  background: var(--color-surface);
  padding: var(--space-xs);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.view-btn {
  padding: var(--space-sm);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn.active {
  background: var(--color-background);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.view-btn:hover:not(.active) {
  color: var(--color-text-primary);
}

/* Table View */
.table-container {
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  padding: var(--space-md);
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.data-table th.sortable:hover {
  background: #e2e8f0;
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.sort-icon {
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

.data-table th.sortable:hover .sort-icon {
  color: var(--color-text-secondary);
}

.data-table td {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: var(--color-surface);
}

.role-id code {
  background: var(--color-surface);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}

.role-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-cell time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.actions-header {
  width: 120px;
  text-align: center;
}

.actions-cell {
  width: 120px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--space-xs);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.view-btn {
  color: var(--color-info);
}

.view-btn:hover {
  background: rgb(8 145 178 / 0.1);
  color: var(--color-info);
}

.edit-btn {
  color: var(--color-warning);
}

.edit-btn:hover {
  background: rgb(217 119 6 / 0.1);
  color: var(--color-warning);
}

.delete-btn {
  color: var(--color-danger);
}

.delete-btn:hover:not(:disabled) {
  background: rgb(220 38 38 / 0.1);
  color: var(--color-danger);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* Grid View */
.grid-container {
  padding: var(--space-lg);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.role-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-md);
}

.role-info {
  flex: 1;
}

.role-title {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-base);
}

.role-title code {
  background: var(--color-surface);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
}

.role-names {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.role-name-la, .role-name-en {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-menu {
  position: relative;
}

.menu-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background: var(--color-surface);
  color: var(--color-text-secondary);
}

.card-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-sm);
  z-index: 10;
  min-width: 120px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm);
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  text-align: left;
  transition: all 0.2s ease;
}

.dropdown-item:hover:not(:disabled) {
  background: var(--color-surface);
}

.dropdown-item.delete {
  color: var(--color-danger);
}

.dropdown-item.delete:hover:not(:disabled) {
  background: rgb(220 38 38 / 0.1);
}

.dropdown-item:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.status-row {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.card-footer {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.created-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Status Badges */
.status-badge, .auth-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-active {
  background: rgb(5 150 105 / 0.1);
  color: var(--color-success);
  border: 1px solid rgb(5 150 105 / 0.2);
}

.status-inactive {
  background: rgb(220 38 38 / 0.1);
  color: var(--color-danger);
  border: 1px solid rgb(220 38 38 / 0.2);
}

.status-created {
  background: rgb(37 99 235 / 0.1);
  color: var(--color-primary);
  border: 1px solid rgb(37 99 235 / 0.2);
}

.auth-authorized {
  background: rgb(5 150 105 / 0.1);
  color: var(--color-success);
  border: 1px solid rgb(5 150 105 / 0.2);
}

.auth-unauthorized {
  background: rgb(217 119 6 / 0.1);
  color: var(--color-warning);
  border: 1px solid rgb(217 119 6 / 0.2);
}

.auth-rejected {
  background: rgb(220 38 38 / 0.1);
  color: var(--color-danger);
  border: 1px solid rgb(220 38 38 / 0.2);
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-xl) var(--space-lg);
  min-height: 400px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

.empty-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.empty-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.5;
}

/* Pagination */
.pagination-container {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgb(37 99 235 / 0.05);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  margin: 0 var(--space-lg);
}

.page-numbers {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.total-items {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-sm {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-xs);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-outline {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-outline:hover {
  background: var(--color-surface);
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-ghost:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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
  padding: var(--space-lg);
}

.modal-container {
  width: 100%;
  max-width: 500px;
}

.modal-content {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-icon {
  font-size: 1.5rem;
}

.modal-icon.warning {
  color: var(--color-warning);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-body {
  padding: var(--space-lg);
}

.modal-description {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-lg) 0;
  line-height: 1.5;
}

.role-details {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.warning-message {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: rgb(217 119 6 / 0.1);
  border: 1px solid rgb(217 119 6 / 0.2);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-warning);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

/* Responsive Design */
@media (max-width: 768px) {
  .role-list-container {
    padding: var(--space-md);
  }

  .language-toggle {
    top: var(--space-md);
    right: var(--space-md);
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }

  .page-title {
    font-size: var(--font-size-2xl);
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    min-width: auto;
  }

  .results-summary {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }

  .roles-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .pagination-info {
    margin: 0;
    order: -1;
    margin-bottom: var(--space-sm);
  }

  .modal-overlay {
    padding: var(--space-md);
  }
}

@media (max-width: 640px) {
  .table-wrapper {
    overflow-x: scroll;
  }

  .data-table {
    min-width: 700px;
  }

  .action-buttons {
    flex-direction: column;
    gap: var(--space-xs);
  }
}
</style>