// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip on server side
  if (process.server) return;
  
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  if (!token || !user) {
    return navigateTo({
      path: "/login",
      query: {
        redirect: to.fullPath,
      },
    });
  }
  
 
  if (!window.autoLogoutManager) {
    initAutoLogout();
  }
});


interface AutoLogoutManager {
  stop: () => void;
  resetTimer: () => void;
  isActive: () => boolean;
  getRemainingTime: () => number;
}

declare global {
  interface Window {
    autoLogoutManager?: AutoLogoutManager;
  }
}

function initAutoLogout(): void {
  const IDLE_TIME: number = 15 * 60 * 1000; 
  let idleTimer: NodeJS.Timeout | null = null;
  let warningTimer: NodeJS.Timeout | null = null;
  
  function resetIdleTimer(): void {
    if (idleTimer) clearTimeout(idleTimer);
    if (warningTimer) clearTimeout(warningTimer);
    
   
    const currentToken: string | null = localStorage.getItem("token");
    if (!currentToken) {
     
      if (window.autoLogoutManager) {
        window.autoLogoutManager.stop();
      }
      return;
    }
    
   
    const warningTime: number = IDLE_TIME > 15 * 60 * 1000 ? 15 * 60 * 1000 : 30 * 1000;
    
    warningTimer = setTimeout(() => {
      
      CallSwal({
        title: "ຄຳເຕືອນ",
        text: `ທ່ານຈະຖືກ logout ໃນ ${warningTime / 1000} ວິນາທີ ເນື່ອງຈາກບໍ່ມີການເຄື່ອນໄຫວ. ຕ້ອງການສືບຕໍ່ ຫຼື ບໍ່?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ຕົກລົງ",
        cancelButtonText: "ຍົກເລີກ",
      }).then((result) => {
        if (result.isConfirmed) {
          resetIdleTimer();
        }
      });
    }, IDLE_TIME - warningTime);
    

    idleTimer = setTimeout(() => {
      performAutoLogout();
    }, IDLE_TIME);
  }
  
  function performAutoLogout(): void {
    
    if (window.autoLogoutManager) {
      window.autoLogoutManager.stop();
    }
    
  
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    
   
    Object.keys(localStorage).forEach((key: string) => {
      if (key.includes('filter')) {
        localStorage.removeItem(key);
      }
    });
    
  CallSwal({
    title: "ຄຳເຕືອນ",
    text: "ທ່ານຖືກ logout ເນື່ອງຈາກບໍ່ມີການເຄື່ອນໄຫວໃນ 15 ນາທີ",
    icon: "warning",
    showCancelButton: false,
    confirmButtonText: "ຕົກລົງ",
    showConfirmButton: true,
    timer: 5000,
  })
    // alert('ເຈົ້າຖືກ logout ອັດຕະໂນມັດເນື່ອງຈາກບໍ່ມີການເຄື່ອນໄຫວເປັນເວລາ 15 ນາທີ');
    
    
    window.location.href = '/login';
  }
  
  
  const events: string[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];
  
 
  events.forEach((event: string) => {
    document.addEventListener(event, resetIdleTimer, true);
  });
  
  
  resetIdleTimer();
  
  
  window.autoLogoutManager = {
    stop: (): void => {
      if (idleTimer) clearTimeout(idleTimer);
      if (warningTimer) clearTimeout(warningTimer);
      events.forEach((event: string) => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      delete window.autoLogoutManager;
    },
    
   
    resetTimer: (): void => {
      resetIdleTimer();
    },
    
   
    isActive: (): boolean => {
      return !!window.autoLogoutManager;
    },
    

    getRemainingTime: (): number => {
      return IDLE_TIME; 
    }
  };
}

// Optional: Add types for your component logout function
/*
// In your Vue component with TypeScript:
export default defineComponent({
  methods: {
    async onManualLogout(): Promise<void> {
      // Stop auto logout when manually logging out
      if (window.autoLogoutManager) {
        window.autoLogoutManager.stop();
      }
      
      try {
        const refreshToken: string | null = localStorage.getItem("refresh");
        if (refreshToken) {
          await $fetch('/api/logout/', {
            method: 'POST',
            body: {
              refresh: refreshToken
            }
          });
        }
        
        localStorage.clear();
        await this.$router.push('/login');
      } catch (err) {
        console.error('Logout error:', err);
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  }
});
*/

// Optional: TypeScript axios interceptor types
/*
// types/axios.d.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAutoLogoutReset?: boolean;
  }
}

// In your axios setup file:
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Reset auto logout timer on API calls (unless explicitly skipped)
    if (!config.skipAutoLogoutReset && window.autoLogoutManager) {
      window.autoLogoutManager.resetTimer();
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // Reset timer on successful API responses
    if (window.autoLogoutManager) {
      window.autoLogoutManager.resetTimer();
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 errors - token expired
    if (error.response?.status === 401) {
      if (window.autoLogoutManager) {
        window.autoLogoutManager.stop();
      }
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
*/

// Optional: Create a composable with TypeScript
/*
// composables/useAutoLogout.ts
interface AutoLogoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onWarning?: () => boolean;
  onLogout?: () => void;
}

export const useAutoLogout = (options: AutoLogoutOptions = {}) => {
  const router = useRouter();
  
  const {
    timeoutMinutes = 15,
    warningMinutes = 2,
    onWarning,
    onLogout
  } = options;
  
  let timer: NodeJS.Timeout | null = null;
  let warningTimer: NodeJS.Timeout | null = null;
  
  const startAutoLogout = (): (() => void) => {
    const IDLE_TIME: number = timeoutMinutes * 60 * 1000;
    const WARNING_TIME: number = warningMinutes * 60 * 1000;
    
    const resetTimer = (): void => {
      if (timer) clearTimeout(timer);
      if (warningTimer) clearTimeout(warningTimer);
      
      warningTimer = setTimeout(() => {
        const shouldContinue = onWarning ? onWarning() : 
          confirm(`ເຈົ້າຈະຖືກ logout ໃນອີກ ${warningMinutes} ນາທີ. ຕ້ອງການສືບຕໍ່ບໍ່?`);
        
        if (shouldContinue) {
          resetTimer();
        }
      }, IDLE_TIME - WARNING_TIME);
      
      timer = setTimeout(() => {
        performLogout();
      }, IDLE_TIME);
    };
    
    const performLogout = async (): Promise<void> => {
      if (onLogout) {
        onLogout();
      } else {
        localStorage.clear();
        alert('Auto logout');
        await router.push('/login');
      }
    };
    
    const events: string[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach((event: string) => {
      document.addEventListener(event, resetTimer, true);
    });
    
    resetTimer();
    
    return (): void => {
      if (timer) clearTimeout(timer);
      if (warningTimer) clearTimeout(warningTimer);
      events.forEach((event: string) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  };
  
  return {
    startAutoLogout
  };
};
*/