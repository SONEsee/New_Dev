<!-- components/RoleCreate.vue -->
<template>
  <div class="role-create-container">
    <div class="header-section">
      <div class="breadcrumb">
        <NuxtLink to="/roles" class="breadcrumb-link">
          <Icon name="mdi:arrow-left" />
          Back to Roles
        </NuxtLink>
      </div>
      <h2 class="page-title">Create New Role</h2>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="role-form">
        <!-- Role ID Field -->
        <div class="form-group">
          <label for="role_id" class="form-label required">
            Role ID
          </label>
          <input
            id="role_id"
            v-model="form.role_id"
            type="text"
            class="form-input"
            :class="{ 'error': errors.role_id }"
            placeholder="Enter unique role ID"
            maxlength="20"
            required
          />
          <div v-if="errors.role_id" class="error-message">
            {{ errors.role_id }}
          </div>
          <div class="field-hint">
            Maximum 20 characters. Use uppercase letters and underscores (e.g., ADMIN_ROLE)
          </div>
        </div>

        <!-- Role Name LA Field -->
        <div class="form-group">
          <label for="role_name_la" class="form-label">
            Role Name (Lao)
          </label>
          <input
            id="role_name_la"
            v-model="form.role_name_la"
            type="text"
            class="form-input"
            :class="{ 'error': errors.role_name_la }"
            placeholder="ປ້ອນຊື່ບົດບາດເປັນພາສາລາວ"
            maxlength="250"
          />
          <div v-if="errors.role_name_la" class="error-message">
            {{ errors.role_name_la }}
          </div>
        </div>

        <!-- Role Name EN Field -->
        <div class="form-group">
          <label for="role_name_en" class="form-label">
            Role Name (English)
          </label>
          <input
            id="role_name_en"
            v-model="form.role_name_en"
            type="text"
            class="form-input"
            :class="{ 'error': errors.role_name_en }"
            placeholder="Enter role name in English"
            maxlength="250"
          />
          <div v-if="errors.role_name_en" class="error-message">
            {{ errors.role_name_en }}
          </div>
        </div>

        <!-- Record Status Field -->
        <div class="form-group">
          <label for="record_Status" class="form-label">
            Record Status
          </label>
          <select
            id="record_Status"
            v-model="form.record_Status"
            class="form-select"
            :class="{ 'error': errors.record_Status }"
          >
            <option value="C">Created</option>
            <option value="A">Active</option>
            <option value="I">Inactive</option>
          </select>
          <div v-if="errors.record_Status" class="error-message">
            {{ errors.record_Status }}
          </div>
        </div>

        <!-- Authorization Settings -->
        <div class="form-section">
          <h3 class="section-title">Authorization Settings</h3>
          
          <div class="form-group">
            <label for="Auth_Status" class="form-label">
              Authorization Status
            </label>
            <select
              id="Auth_Status"
              v-model="form.Auth_Status"
              class="form-select"
              :class="{ 'error': errors.Auth_Status }"
            >
              <option value="U">Unauthorized</option>
              <option value="A">Authorized</option>
              <option value="R">Rejected</option>
            </select>
            <div v-if="errors.Auth_Status" class="error-message">
              {{ errors.Auth_Status }}
            </div>
          </div>

          <div class="form-group">
            <label for="Once_Auth" class="form-label">
              Once Authorization
            </label>
            <select
              id="Once_Auth"
              v-model="form.Once_Auth"
              class="form-select"
              :class="{ 'error': errors.Once_Auth }"
            >
              <option value="N">No</option>
              <option value="Y">Yes</option>
            </select>
            <div v-if="errors.Once_Auth" class="error-message">
              {{ errors.Once_Auth }}
            </div>
            <div class="field-hint">
              Select "Yes" if this role requires one-time authorization
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            type="button"
            @click="resetForm"
            class="btn btn-secondary"
            :disabled="isSubmitting"
          >
            <Icon name="mdi:refresh" />
            Reset
          </button>
          
          <button
            type="button"
            @click="goBack"
            class="btn btn-outline"
            :disabled="isSubmitting"
          >
            <Icon name="mdi:close" />
            Cancel
          </button>
          
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting || !isFormValid"
          >
            <Icon v-if="isSubmitting" name="mdi:loading" class="animate-spin" />
            <Icon v-else name="mdi:check" />
            {{ isSubmitting ? 'Creating...' : 'Create Role' }}
          </button>
        </div>
      </form>

      <!-- Preview Card -->
      <div class="preview-card">
        <h3 class="preview-title">
          <Icon name="mdi:eye" />
          Preview
        </h3>
        <div class="preview-content">
          <div class="preview-item">
            <span class="preview-label">Role ID:</span>
            <span class="preview-value">{{ form.role_id || '-' }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Role Name (LA):</span>
            <span class="preview-value">{{ form.role_name_la || '-' }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Role Name (EN):</span>
            <span class="preview-value">{{ form.role_name_en || '-' }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Status:</span>
            <span :class="getStatusClass(form.record_Status)">
              {{ getStatusText(form.record_Status) }}
            </span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Auth Status:</span>
            <span :class="getAuthStatusClass(form.Auth_Status)">
              {{ getAuthStatusText(form.Auth_Status) }}
            </span>
          </div>
          <div class="preview-item">
            <span class="preview-label">Once Auth:</span>
            <span class="preview-value">{{ form.Once_Auth === 'Y' ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoleListResponse } from '~/models/rolemaster'

// Page metadata
definePageMeta({
  title: 'Create Role'
})

// Form data
const form = reactive({
  role_id: '',
  role_name_la: '',
  role_name_en: '',
  record_Status: 'C',
  Auth_Status: 'U',
  Once_Auth: 'N'
})

// Form state
const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)

// Computed properties
const isFormValid = computed(() => {
  return form.role_id.trim().length > 0 && Object.keys(errors).length === 0
})

// Validation rules
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  // Role ID validation
  if (!form.role_id.trim()) {
    errors.role_id = 'Role ID is required'
  } else if (form.role_id.length > 20) {
    errors.role_id = 'Role ID must not exceed 20 characters'
  } else if (!/^[A-Z0-9_]+$/.test(form.role_id)) {
    errors.role_id = 'Role ID should contain only uppercase letters, numbers, and underscores'
  }
  
  // Role Name LA validation
  if (form.role_name_la && form.role_name_la.length > 250) {
    errors.role_name_la = 'Role name (LA) must not exceed 250 characters'
  }
  
  // Role Name EN validation
  if (form.role_name_en && form.role_name_en.length > 250) {
    errors.role_name_en = 'Role name (EN) must not exceed 250 characters'
  }
  
  return Object.keys(errors).length === 0
}

// Watch for form changes to validate
watch(form, () => {
  if (Object.keys(errors).length > 0) {
    validateForm()
  }
}, { deep: true })

// Methods
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const response = await $fetch<RoleListResponse>('/api/roles/', {
      method: 'POST',
      body: {
        role_id: form.role_id.trim(),
        role_name_la: form.role_name_la.trim() || null,
        role_name_en: form.role_name_en.trim() || null,
        record_Status: form.record_Status,
        Auth_Status: form.Auth_Status,
        Once_Auth: form.Once_Auth
      }
    })
    
    // Show success message
    useNuxtApp().$toast?.success('Role created successfully!')
    
    // Navigate to role list or detail page
    await navigateTo('/roles')
    
  } catch (error: any) {
    console.error('Create role error:', error)
    
    // Handle validation errors from backend
    if (error.data && error.data.errors) {
      Object.assign(errors, error.data.errors)
    } else if (error.data && error.data.role_id) {
      errors.role_id = Array.isArray(error.data.role_id) 
        ? error.data.role_id[0] 
        : error.data.role_id
    } else {
      useNuxtApp().$toast?.error('Failed to create role. Please try again.')
    }
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    role_id: '',
    role_name_la: '',
    role_name_en: '',
    record_Status: 'C',
    Auth_Status: 'U',
    Once_Auth: 'N'
  })
  
  // Clear errors
  Object.keys(errors).forEach(key => delete errors[key])
}

const goBack = () => {
  navigateTo('/roles')
}

const getStatusClass = (status: string) => {
  const classes = {
    'A': 'status-active',
    'I': 'status-inactive', 
    'C': 'status-created'
  }
  return `status-badge ${classes[status as keyof typeof classes] || 'status-default'}`
}

const getStatusText = (status: string) => {
  const texts = {
    'A': 'Active',
    'I': 'Inactive',
    'C': 'Created'
  }
  return texts[status as keyof typeof texts] || status
}

const getAuthStatusClass = (status: string) => {
  const classes = {
    'A': 'auth-authorized',
    'U': 'auth-unauthorized',
    'R': 'auth-rejected'
  }
  return `auth-badge ${classes[status as keyof typeof classes] || 'auth-default'}`
}

const getAuthStatusText = (status: string) => {
  const texts = {
    'A': 'Authorized',
    'U': 'Unauthorized', 
    'R': 'Rejected'
  }
  return texts[status as keyof typeof texts] || status
}

// Auto-focus on role ID field when component mounts
onMounted(() => {
  const roleIdInput = document.getElementById('role_id')
  if (roleIdInput) {
    roleIdInput.focus()
  }
})
</script>

<style scoped>
.role-create-container {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 2rem;
}

.breadcrumb {
  margin-bottom: 1rem;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #374151;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.form-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

@media (max-width: 768px) {
  .form-container {
    grid-template-columns: 1fr;
  }
}

.role-form {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.field-hint {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-decoration: none;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #4b5563;
}

.btn-outline {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.preview-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 1rem;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.preview-content {
  space-y: 0.75rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.preview-value {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
}

.status-badge,
.auth-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-active {
  background-color: #dcfce7;
  color: #166534;
}

.status-inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-created {
  background-color: #dbeafe;
  color: #1e40af;
}

.auth-authorized {
  background-color: #dcfce7;
  color: #166534;
}

.auth-unauthorized {
  background-color: #fef3c7;
  color: #92400e;
}

.auth-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>