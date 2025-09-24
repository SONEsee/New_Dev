// composables/useAuthCheck.ts
import axios from '@/helpers/axios';
import { onMounted, onUnmounted } from 'vue';

export const useAuthCheck = () => {
  let checkInterval: NodeJS.Timeout | null = null;
  
  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const router = useRouter();
        router.push('/login');
        return false;
      }
      
      // Ping backend to verify token
      await axios.get('/api/verify-token/');
      return true;
    } catch (error: any) {
      // Error will be handled by axios interceptor
      return false;
    }
  };
  
  const startTokenCheck = (intervalMs: number = 30000) => {
    // Initial check
    verifyToken();
    
    // Check periodically
    checkInterval = setInterval(() => {
      verifyToken();
    }, intervalMs);
  };
  
  const stopTokenCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };
  
  // Auto-start/stop
  onMounted(() => {
    startTokenCheck();
  });
  
  onUnmounted(() => {
    stopTokenCheck();
  });
  
  return {
    verifyToken,
    startTokenCheck,
    stopTokenCheck
  };
};