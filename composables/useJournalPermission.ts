// composables/useJournalPermission.ts
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import axios from '@/helpers/axios'

// TypeScript interfaces
interface JournalPermissionResponse {
  available: boolean
  reason: string
  bypass_info?: {
    working_day_bypassed: boolean
    eod_check_bypassed: boolean
  }
}

interface JournalPermissionError {
  message: string
  status?: number
  statusText?: string
}

interface UseJournalPermissionReturn {
  // State
  data: Ref<JournalPermissionResponse | null>
  pending: Ref<boolean>
  error: Ref<JournalPermissionError | null>
  
  // Computed
  isAvailable: Ref<boolean>
  permissionReason: Ref<string>
  isBypassActive: Ref<boolean>
  bypassInfo: Ref<{ working_day_bypassed: boolean; eod_check_bypassed: boolean } | null>
  
  // Methods
  checkPermission: () => Promise<void>
  refresh: () => Promise<void>
  clearError: () => void
  
  // Navigation options
  autoRedirect: Ref<boolean>
  redirectPath: Ref<string>
}

interface JournalPermissionOptions {
  autoRedirect?: boolean
  redirectPath?: string
  redirectDelay?: number
}

export const useJournalPermission = (options: JournalPermissionOptions = {}): UseJournalPermissionReturn => {
  // Options with defaults
  const {
    autoRedirect: enableAutoRedirect = false,
    redirectPath: defaultRedirectPath = '/glcapture/',
    redirectDelay = 2000
  } = options

  // Reactive state
  const data = ref<JournalPermissionResponse | null>(null)
  const pending = ref<boolean>(false)
  const error = ref<JournalPermissionError | null>(null)
  const autoRedirect = ref<boolean>(enableAutoRedirect)
  const redirectPath = ref<string>(defaultRedirectPath)
  
  // Clear error function
  const clearError = (): void => {
    error.value = null
  }

  // Navigation function
  const navigateToErrorPage = async (reason: string, errorDetails?: JournalPermissionError) => {
    try {
      const router = useRouter()
      
      // Prepare query parameters for the error page
      const query: Record<string, string> = {
        reason: reason || 'ບໍ່ມີສິດອະນຸຍາດ',
        timestamp: new Date().toISOString()
      }
      
      if (errorDetails?.status) {
        query.status = errorDetails.status.toString()
      }
      
      if (errorDetails?.statusText) {
        query.statusText = errorDetails.statusText
      }

      // Navigate to error page with query parameters
      await router.push({
        path: redirectPath.value,
        query
      })
      
      console.log(`Redirected to ${redirectPath.value} due to permission denial:`, reason)
    } catch (navigationError) {
      console.error('Failed to navigate to error page:', navigationError)
      
      // Fallback: try to navigate to a generic error page
      try {
        await navigateTo('/error')
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError)
        // Last resort: reload to home page
        window.location.href = '/'
      }
    }
  }
  
  // Main function to check journal permission
  const checkPermission = async (): Promise<void> => {
    try {
      pending.value = true
      error.value = null
      
      const response = await axios.get('api/end-of-day-journal/check/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      
      // Assuming your axios helper returns response.data directly
      data.value = response.data
      
      // Check if permission is denied and auto-redirect is enabled
      if (!response.data.available && autoRedirect.value) {
        // Delay before redirect to allow user to read the message
        setTimeout(() => {
          navigateToErrorPage(response.data.reason)
        }, redirectDelay)
      }
      
    } catch (err: any) {
      console.error('Journal permission check error:', err)
      
      // Handle axios error responses
      const status = err.response?.status || err.status || 0
      const statusText = err.response?.statusText || err.statusText || ''
      const serverMessage = err.response?.data?.message || err.response?.data?.detail || ''
      
      let errorMessage = ''
      
      // Handle different types of errors
      if (status === 401) {
        errorMessage = serverMessage || 'ບໍ່ມີສິດເຂົ້າເຖິງ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່' // Unauthorized, please login again
      } else if (status === 403) {
        errorMessage = serverMessage || 'ບໍ່ມີສິດອະນຸຍາດໃນການເຂົ້າເຖິງ' // No permission to access
      } else if (status === 404) {
        errorMessage = serverMessage || 'ບໍ່ພົບຂໍ້ມູນທີ່ຕ້ອງການ' // Data not found
      } else if (status === 500) {
        errorMessage = serverMessage || 'ມີຂໍ້ຜິດພາດໃນລະບົບ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ' // System error, please try again
      } else if (err.code === 'ECONNABORTED' || err.code === 'NETWORK_ERROR' || !status) {
        errorMessage = 'ບໍ່ສາມາດເຊື່ອມຕໍ່ຫາເຊີເວີໄດ້' // Cannot connect to server
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'ເຊີເວີປະຕິເສດການເຊື່ອມຕໍ່' // Server refused connection
      } else if (err.code === 'ETIMEDOUT') {
        errorMessage = 'ການເຊື່ອມຕໍ່ໝົດເວລາ ກະລຸນາລອງໃໝ່' // Connection timeout, please try again
      } else {
        errorMessage = serverMessage || err.message || 'ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ' // Unexpected error occurred
      }

      const errorDetails: JournalPermissionError = {
        message: errorMessage,
        status: status,
        statusText: statusText
      }

      error.value = errorDetails
      data.value = null
      
      // Auto-redirect on error if enabled
      if (autoRedirect.value) {
        setTimeout(() => {
          navigateToErrorPage(errorMessage, errorDetails)
        }, redirectDelay)
      }
      
    } finally {
      pending.value = false
    }
  }
  
  // Alias for checkPermission to refresh data
  const refresh = checkPermission
  
  // Computed properties for easier access
  const isAvailable = computed<boolean>(() => {
    return data.value?.available ?? false
  })
  
  const permissionReason = computed<string>(() => {
    return data.value?.reason ?? ''
  })
  
  const isBypassActive = computed<boolean>(() => {
    const bypass = data.value?.bypass_info
    return !!(bypass?.working_day_bypassed || bypass?.eod_check_bypassed)
  })
  
  const bypassInfo = computed(() => {
    return data.value?.bypass_info ?? null
  })

  // Watch for permission changes and auto-redirect if needed
  watch(isAvailable, (newValue) => {
    if (!newValue && autoRedirect.value && data.value) {
      // Permission became unavailable, redirect after delay
      setTimeout(() => {
        navigateToErrorPage(permissionReason.value)
      }, redirectDelay)
    }
  })
  
  return {
    // State
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    
    // Computed
    isAvailable: readonly(isAvailable),
    permissionReason: readonly(permissionReason),
    isBypassActive: readonly(isBypassActive),
    bypassInfo: readonly(bypassInfo),
    
    // Methods
    checkPermission,
    refresh,
    clearError,
    
    // Navigation options
    autoRedirect,
    redirectPath
  }
}

// Auto-refresh composable version with redirect
export const useJournalPermissionWithAutoRefresh = (
  intervalMs: number = 60000, 
  options: JournalPermissionOptions = {}
) => {
  const journalPermission = useJournalPermission(options)
  const { checkPermission } = journalPermission
  
  // Auto refresh timer
  let refreshTimer: NodeJS.Timeout | null = null
  
  const startAutoRefresh = () => {
    stopAutoRefresh() // Clear existing timer
    refreshTimer = setInterval(() => {
      checkPermission()
    }, intervalMs)
  }
  
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
  
  // Auto refresh on mount (client-side only)
  onMounted(() => {
    checkPermission() // Initial check
    startAutoRefresh()
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    stopAutoRefresh()
  })
  
  return {
    ...journalPermission,
    startAutoRefresh,
    stopAutoRefresh
  }
}

// Simplified composable with auto-redirect enabled by default
export const useJournalPermissionWithRedirect = (
  redirectPath: string = '/glcapture/permission-denied',
  redirectDelay: number = 2000
) => {
  return useJournalPermission({
    autoRedirect: true,
    redirectPath,
    redirectDelay
  })
}