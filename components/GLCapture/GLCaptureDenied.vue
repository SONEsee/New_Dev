<!-- pages/journal/permission-denied.vue -->
<template>
  <div class="permission-denied-container">
    <!-- Main Error Card -->
    <v-card class="error-card" elevation="8">
      <!-- Error Icon and Title -->
      <v-card-title class="error-header">
        <div class="error-icon-wrapper">
          <v-icon size="64" color="error" class="error-icon">
            mdi-shield-remove
          </v-icon>
        </div>
        <h1 class="error-title">ບໍ່ມີສິດອະນຸຍາດ</h1>
        <p class="error-subtitle">Access Denied</p>
      </v-card-title>

      <!-- Error Content -->
      <v-card-text class="pa-6">
        <!-- Main Error Message -->
        <v-alert
          type="error"
          variant="tonal"
          class="mb-4"
          prominent
          border="start"
        >
          <v-alert-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-alert-circle</v-icon>
            ຂໍ້ຜິດພາດການເຂົ້າເຖິງ
          </v-alert-title>
          
          <div class="mt-2">
            <p class="error-reason">{{ reason }}</p>
            
            <!-- Additional error details if available -->
            <div v-if="status || statusText" class="mt-3 pa-2 bg-error-lighten-5 rounded">
              <div class="d-flex align-items-center">
                <v-chip size="small" color="error" variant="outlined" class="mr-2">
                  HTTP {{ status }}
                </v-chip>
                <span class="text-caption text-error">{{ statusText }}</span>
              </div>
            </div>
          </div>
        </v-alert>

        <!-- Information Card -->
        <v-card variant="outlined" class="info-card mb-4">
          <v-card-title class="pb-2">
            <v-icon color="info" class="mr-2">mdi-information</v-icon>
            ເຫດຜົນທີ່ເປັນໄປໄດ້
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon color="warning" size="small">mdi-calendar-remove</v-icon>
                </template>
                <v-list-item-title>ມື້ນີ້ບໍ່ແມ່ນວັນເຮັດວຽກ</v-list-item-title>
                <v-list-item-subtitle>ວັນພັກ ຫຼື ວັນສຸດສັບປະດາ</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="error" size="small">mdi-clock-alert</v-icon>
                </template>
                <v-list-item-title>ການບັນທຶກບັນຊີມື້ນີ້ຖືກສົ່ງແລ້ວ</v-list-item-title>
                <v-list-item-subtitle>EOD ໄດ້ປິດແລ້ວ</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary" size="small">mdi-cog</v-icon>
                </template>
                <v-list-item-title>ການຕັ້ງຄ່າລະບົບບໍ່ອະນຸຍາດ</v-list-item-title>
                <v-list-item-subtitle>MOD_NO ຫຼື BACK_VALUE ຖືກປິດ</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="warning" size="small">mdi-server-network-off</v-icon>
                </template>
                <v-list-item-title>ຂໍ້ຜິດພາດເຊີເວີ</v-list-item-title>
                <v-list-item-subtitle>ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບລະບົບໄດ້</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Timestamp -->
        <div class="timestamp-info">
          <v-chip size="small" color="grey" variant="outlined">
            <v-icon start size="small">mdi-clock</v-icon>
            {{ formattedTimestamp }}
          </v-chip>
        </div>
      </v-card-text>

      <!-- Action Buttons -->
      <v-card-actions class="pa-6 pt-0">
        <div class="action-buttons">
          <!-- Primary Actions -->
          <div class="primary-actions">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              @click="retryPermissionCheck"
              :loading="retrying"
              class="retry-btn"
            >
              <v-icon start>mdi-refresh</v-icon>
              ລອງໃໝ່
            </v-btn>
            
            <v-btn
              color="success"
              variant="outlined"
              size="large"
              @click="goToDashboard"
              class="dashboard-btn"
            >
              <v-icon start>mdi-view-dashboard</v-icon>
              ໄປແດັສບໍດ
            </v-btn>
          </div>

          <!-- Secondary Actions -->
          <div class="secondary-actions">
            <v-btn
              variant="text"
              @click="goBack"
              class="back-btn"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              ກັບ
            </v-btn>
            
            <v-btn
              variant="text"
              @click="contactSupport"
              class="support-btn"
            >
              <v-icon start>mdi-help-circle</v-icon>
              ຕິດຕໍ່ຝ່າຍສະໜັບສະໜູນ
            </v-btn>
          </div>
        </div>
      </v-card-actions>
    </v-card>

    <!-- Additional Help Section -->
    <v-card class="help-card mt-6" variant="outlined">
      <v-card-title class="pb-2">
        <v-icon color="info" class="mr-2">mdi-lightbulb-on</v-icon>
        ແນະນຳການແກ້ໄຂ
      </v-card-title>
      <v-card-text>
        <v-expansion-panels variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2" color="primary">mdi-calendar-check</v-icon>
              ກວດສອບວັນເຮັດວຽກ
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>ຖ້າມື້ນີ້ແມ່ນວັນພັກ ແຕ່ຕ້ອງການເຮັດວຽກ:</p>
              <ul>
                <li>ຕິດຕໍ່ຜູ້ຄຸ້ມຄອງລະບົບເພື່ອເປີດ MOD_NO</li>
                <li>ກວດສອບການຕັ້ງຄ່າ MTTB_DATA_Entry</li>
                <li>ຢືນຢັນວ່າມີສິດອະນຸຍາດພິເສດ</li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2" color="warning">mdi-clock-edit</v-icon>
              ແກ້ໄຂວັນທີ່ເກົ່າ
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>ຖ້າຕ້ອງການບັນທຶກວັນທີ່ເກົ່າ:</p>
              <ul>
                <li>ກວດສອບການຕັ້ງຄ່າ BACK_VALUE</li>
                <li>ຂໍອະນຸຍາດຈາກຜູ້ຄຸ້ມຄອງ</li>
                <li>ໃຊ້ຟັງຊັນ Back Value ໃນລະບົບ</li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2" color="error">mdi-server-security</v-icon>
              ຂໍ້ຜິດພາດລະບົບ
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>ຖ້າເປັນຂໍ້ຜິດພາດເຕັກນິກ:</p>
              <ul>
                <li>ລອງໂຫລດໜ້າໃໝ່</li>
                <li>ກວດສອບການເຊື່ອມຕໍ່ອິນເຕີເນັດ</li>
                <li>ລ້າງ Cache ຂອງ Browser</li>
                <li>ຕິດຕໍ່ IT Support</li>
              </ul>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'

// Router and route
const router = useRouter()
const route = useRoute()

// State
const retrying = ref(false)

// Get error details from query parameters
const reason = computed(() => {
  return route.query.reason as string || 'ບໍ່ສາມາດເຂົ້າເຖິງໄດ້'
})

const status = computed(() => {
  return route.query.status as string || null
})

const statusText = computed(() => {
  return route.query.statusText as string || null
})

const timestamp = computed(() => {
  return route.query.timestamp as string || new Date().toISOString()
})

const formattedTimestamp = computed(() => {
  try {
    const date = new Date(timestamp.value)
    return date.toLocaleString('lo-LA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'ບໍ່ສາມາດສະແດງເວລາໄດ້'
  }
})

// Page metadata
useHead({
  title: 'ບໍ່ມີສິດອະນຸຍາດ - Accounting System',
  meta: [
    { name: 'description', content: 'Access denied to journal entry system' }
  ]
})

// Methods
const retryPermissionCheck = async () => {
  try {
    retrying.value = true
    
    // Try to use the journal permission composable to recheck
    const { checkPermission, isAvailable } = useJournalPermission()
    await checkPermission()
    
    if (isAvailable.value) {
      // Permission granted, redirect back to journal entry
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ!',
        text: 'ສາມາດເຂົ້າເຖິງລະບົບໄດ້ແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        router.push('/journal/entry')
      })
    } else {
      // Still denied
      Swal.fire({
        icon: 'warning',
        title: 'ຍັງບໍ່ມີສິດອະນຸຍາດ',
        text: 'ກະລຸນາລໍຖ້າ ຫຼື ຕິດຕໍ່ຜູ້ຄຸ້ມຄອງລະບົບ',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  } catch (error) {
    console.error('Error retrying permission check:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດກວດສອບສິດອະນຸຍາດໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    retrying.value = false
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/') // fallback to home
  }
}

const contactSupport = () => {
  Swal.fire({
    icon: 'info',
    title: 'ຕິດຕໍ່ຝ່າຍສະໜັບສະໜູນ',
    html: `
      <div style="text-align: left;">
        <p><strong>ອີເມວ:</strong> support@yourcompany.com</p>
        <p><strong>ໂທລະສັບ:</strong> +856 20 1234 5678</p>
        <p><strong>ເວລາເຮັດວຽກ:</strong> ຈັນ-ສຸກ 8:00-17:00</p>
        <hr>
        <p><strong>ຂໍ້ມູນຂໍ້ຜິດພາດ:</strong></p>
        <pre style="font-size: 12px; background: #f5f5f5; padding: 8px; border-radius: 4px;">
Error: ${reason.value}
Status: ${status.value || 'N/A'}
Time: ${formattedTimestamp.value}
        </pre>
      </div>
    `,
    confirmButtonText: 'ຕົກລົງ',
    width: '500px'
  })
}

// Auto-retry after 30 seconds (optional)
let autoRetryTimer: NodeJS.Timeout | null = null

const startAutoRetry = () => {
  autoRetryTimer = setTimeout(() => {
    retryPermissionCheck()
  }, 30000) // 30 seconds
}

onMounted(() => {
  // Log the access denial for analytics
  console.log('Access denied:', {
    reason: reason.value,
    status: status.value,
    timestamp: timestamp.value
  })
  
  // Start auto-retry timer
  startAutoRetry()
})

onUnmounted(() => {
  if (autoRetryTimer) {
    clearTimeout(autoRetryTimer)
  }
})
</script>

<style scoped>
.permission-denied-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #ffebee 0%, #fce4ec 50%, #f3e5f5 100%);
}

.error-card {
  max-width: 600px;
  width: 100%;
  border-radius: 16px;
  border: 1px solid #ffcdd2;
}

.error-header {
  text-align: center;
  padding: 32px 24px 16px 24px;
  background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
  border-radius: 16px 16px 0 0;
}

.error-icon-wrapper {
  margin-bottom: 16px;
}

.error-icon {
  animation: pulse 2s infinite;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: #c62828;
  margin-bottom: 8px;
}

.error-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.error-reason {
  font-size: 1.1rem;
  font-weight: 500;
  color: #d32f2f;
  line-height: 1.4;
}

.info-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
}

.timestamp-info {
  text-align: center;
  margin-top: 16px;
}

.action-buttons {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.primary-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.secondary-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn,
.dashboard-btn {
  min-width: 140px;
  height: 48px;
  font-weight: 600;
}

.retry-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.dashboard-btn {
  border: 2px solid #4caf50;
}

.back-btn,
.support-btn {
  min-width: 120px;
  color: #666;
}

.help-card {
  max-width: 600px;
  width: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

/* Animations */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .permission-denied-container {
    padding: 16px;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .primary-actions {
    flex-direction: column;
    align-items: center;
  }

  .retry-btn,
  .dashboard-btn {
    width: 100%;
    max-width: 280px;
  }

  .secondary-actions {
    flex-direction: column;
    align-items: center;
  }

  .back-btn,
  .support-btn {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .error-header {
    padding: 24px 16px 12px 16px;
  }

  .error-title {
    font-size: 1.3rem;
  }

  .error-icon {
    font-size: 48px !important;
  }
}

/* Dark mode support */
.v-theme--dark .permission-denied-container {
  background: linear-gradient(135deg, #424242 0%, #616161 50%, #757575 100%);
}

.v-theme--dark .error-card {
  border-color: #f44336;
}

.v-theme--dark .error-header {
  background: linear-gradient(135deg, #424242 0%, #525252 100%);
}

.v-theme--dark .info-card {
  background: linear-gradient(135deg, #1e3a8a 0%, #374151 100%);
}

.v-theme--dark .help-card {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
}
</style>