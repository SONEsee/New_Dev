<!-- components/BackupDatabase.vue - Nuxt3 Composition API -->
<template>
  <div class="backup-wrapper">
    <div class="backup-card">
      <!-- Header -->
      <div class="backup-header">
        <Icon name="mdi:database-export" size="32" />
        <h2>Database Backup</h2>
      </div>

      <!-- Content -->
      <div class="backup-body">
        <!-- Info Alert -->
        <div class="alert-info">
          <Icon name="mdi:information" size="20" />
          <p>Create a backup of your database. The file will download automatically.</p>
        </div>

        <!-- Path Input -->
        <div class="form-group">
          <label for="path">Backup Path (Optional)</label>
          <input
            id="path"
            v-model="backupPath"
            type="text"
            placeholder="Leave empty for default (C:\Backup)"
            :disabled="isLoading"
          />
        </div>

        <!-- Backup Button -->
        <button
          class="btn-backup"
          :disabled="isLoading"
          @click="handleBackup"
        >
          <Icon v-if="isLoading" name="mdi:loading" class="spin" />
          <Icon v-else name="mdi:download" />
          {{ isLoading ? 'Creating Backup...' : 'Create Backup' }}
        </button>

        <!-- Progress Indicator -->
        <Transition name="fade">
          <div v-if="isLoading" class="progress">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p>Processing backup, please wait...</p>
          </div>
        </Transition>

        <!-- Status Message -->
        <Transition name="slide">
          <div
            v-if="status.message"
            :class="['status', `status-${status.type}`]"
          >
            <Icon :name="status.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'" />
            {{ status.message }}
          </div>
        </Transition>

        <!-- Last Backup -->
        <div v-if="lastBackupTime" class="last-backup">
          <Icon name="mdi:clock-outline" size="16" />
          Last backup: {{ formatDate(lastBackupTime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Types
interface BackupStatus {
  type: 'success' | 'error' | ''
  message: string
}

// State
const isLoading = ref(false)
const backupPath = ref('')
const status = ref<BackupStatus>({ type: '', message: '' })
const lastBackupTime = ref<string | null>(null)

// Load last backup time on mount
onMounted(() => {
  const stored = localStorage.getItem('lastBackupTime')
  if (stored) lastBackupTime.value = stored
})

// Format date helper
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString()
}

// Main backup handler
const handleBackup = async () => {
  isLoading.value = true
  status.value = { type: '', message: '' }

  try {
    // Build URL with params
    const params = new URLSearchParams()
    if (backupPath.value) {
      params.append('backup_path', backupPath.value)
    }

    // Make API request
    const response = await $fetch('/api/backup/', {
      method: 'GET',
      params,
      responseType: 'blob',
      timeout: 900000,
    })

    // Handle file download
    const blob = new Blob([response as BlobPart])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup_${Date.now()}.bak`
    link.click()
    window.URL.revokeObjectURL(url)

    // Update success state
    const now = new Date().toISOString()
    lastBackupTime.value = now
    localStorage.setItem('lastBackupTime', now)
    
    status.value = {
      type: 'success',
      message: 'Backup completed successfully!'
    }

  } catch (error: any) {
    console.error('Backup failed:', error)
    status.value = {
      type: 'error',
      message: error.data?.error || 'Failed to create backup'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.backup-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.backup-card {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.backup-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: white;
}

.backup-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.backup-body {
  padding: 2rem;
}

.alert-info {
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1e40af;
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.btn-backup {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-backup:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.btn-backup:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.progress {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  text-align: center;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

.progress p {
  font-size: 0.875rem;
  color: #6b7280;
}

.status {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.last-backup {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .backup-wrapper {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .backup-card {
    background: #1f2937;
    color: #f3f4f6;
  }

  .form-group label {
    color: #d1d5db;
  }

  .form-group input {
    background: #111827;
    border-color: #374151;
    color: #f3f4f6;
  }

  .alert-info {
    background: #1e3a8a;
    color: #dbeafe;
  }

  .last-backup {
    background: #111827;
    color: #9ca3af;
  }
}
</style>