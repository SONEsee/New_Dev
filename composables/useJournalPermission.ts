// composables/useJournalPermission.ts
import { ref, computed, watch, readonly } from 'vue'
import type { Ref } from 'vue'
import axios from '@/helpers/axios'

// TypeScript interfaces for the new EOD API response
interface CurrentEodInfo {
  date_id: number
  eod_process_date: string
  next_working_day: string
  eod_status: 'Y' | 'N'
}

interface JournalPermissionResponse {
  available: boolean
  reason: string
  target_date: string
  is_back_date: boolean
  back_value_enabled: boolean
  current_eod: CurrentEodInfo
  // Keep backward compatibility with old bypass_info if needed
  bypass_info?: {
    working_day_bypassed: boolean
    eod_check_bypassed: boolean
    back_value_date?: string
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
  
  // Computed - existing
  isAvailable: Ref<boolean>
  permissionReason: Ref<string>
  isBypassActive: Ref<boolean>
  bypassInfo: Ref<{ working_day_bypassed: boolean; eod_check_bypassed: boolean; back_value_date?: string } | null>
  
  // Computed - new EOD fields
  targetDate: Ref<string | null>
  isBackDate: Ref<boolean>
  backValueEnabled: Ref<boolean>
  currentEod: Ref<CurrentEodInfo | null>
  
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
  
  // Main function to check journal permission using EOD endpoint
  const checkPermission = async (): Promise<void> => {
    try {
      pending.value = true
      error.value = null
      
      console.log('Checking journal permission via EOD endpoint...')
      
      const response = await axios.get('/api/end-of-day-journal/check/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      
      console.log('EOD permission check response:', response.data)
      
      // Store the response data
      data.value = response.data
      
      // Create backward compatibility bypass_info from the new structure
      if (response.data) {
        data.value.bypass_info = {
          working_day_bypassed: response.data.available || false,
          eod_check_bypassed: response.data.back_value_enabled || false,
          back_value_date: response.data.target_date || undefined
        }
      }
      
      // Check if permission is denied and auto-redirect is enabled
      if (!response.data.available && autoRedirect.value) {
        console.log('Permission denied, scheduling auto-redirect...')
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
  
  // Existing computed properties
  const isAvailable = computed<boolean>(() => {
    return data.value?.available ?? false
  })
  
  const permissionReason = computed<string>(() => {
    return data.value?.reason ?? ''
  })
  
  const isBypassActive = computed<boolean>(() => {
    // Check both old bypass_info and new structure
    const bypass = data.value?.bypass_info
    const newStructure = data.value?.back_value_enabled || data.value?.available
    return !!(bypass?.working_day_bypassed || bypass?.eod_check_bypassed || newStructure)
  })
  
  const bypassInfo = computed(() => {
    return data.value?.bypass_info ?? null
  })

  // New computed properties for EOD data
  const targetDate = computed<string | null>(() => {
    return data.value?.target_date ?? null
  })

  const isBackDate = computed<boolean>(() => {
    return data.value?.is_back_date ?? false
  })

  const backValueEnabled = computed<boolean>(() => {
    return data.value?.back_value_enabled ?? false
  })

  const currentEod = computed<CurrentEodInfo | null>(() => {
    return data.value?.current_eod ?? null
  })

  // Watch for permission changes and auto-redirect if needed
  watch(isAvailable, (newValue) => {
    if (!newValue && autoRedirect.value && data.value) {
      // Permission became unavailable, redirect after delay
      console.log('Permission status changed to unavailable, scheduling redirect...')
      setTimeout(() => {
        navigateToErrorPage(permissionReason.value)
      }, redirectDelay)
    }
  })

  // Watch for target date changes and log
  watch(targetDate, (newTargetDate) => {
    if (newTargetDate) {
      console.log('Target date updated:', newTargetDate, 'Is back date:', isBackDate.value, 'Back value enabled:', backValueEnabled.value)
    }
  })

  // Watch for back value enabled changes and log 
  watch(backValueEnabled, (newValue) => {
    if (newValue !== undefined) {
      console.log('Back value enabled changed:', newValue)
    }
  })
  
  return {
    // State
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    
    // Computed - existing
    isAvailable: readonly(isAvailable),
    permissionReason: readonly(permissionReason),
    isBypassActive: readonly(isBypassActive),
    bypassInfo: readonly(bypassInfo),
    
    // Computed - new EOD fields
    targetDate: readonly(targetDate),
    isBackDate: readonly(isBackDate),
    backValueEnabled: readonly(backValueEnabled),
    currentEod: readonly(currentEod),
    
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
      console.log('Auto-refreshing journal permission...')
      checkPermission()
    }, intervalMs)
  }
  
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
      console.log('Stopped auto-refresh for journal permission')
    }
  }
  
  // Auto refresh on mount (client-side only)
  onMounted(() => {
    console.log('Starting journal permission auto-refresh')
    checkPermission() // Initial check
    startAutoRefresh()
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    console.log('Cleaning up journal permission auto-refresh')
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
  redirectDelay: number = 0
) => {
  return useJournalPermission({
    autoRedirect: true,
    redirectPath,
    redirectDelay
  })
}

// Utility function to format date for display
export const formatEodDate = (dateString: string | null): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

// Utility function to get EOD status display text
export const getEodStatusText = (status: 'Y' | 'N' | undefined): string => {
  switch (status) {
    case 'Y':
      return 'ສຳເລັດແລ້ວ' // Completed
    case 'N':
      return 'ກຳລັງດຳເນີນການ' // In progress
    default:
      return 'ບໍ່ຮູ້ສະຖານະ' // Unknown status
  }
}