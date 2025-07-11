import { AxiosError } from 'axios';
import axios from '@/helpers/axios'

interface ForceLogoutResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const useAuth = () => {

  const forceLogout = async (userId: string): Promise<ForceLogoutResponse> => {
    try {
      const response = await axios.post(`/api/force-logout-test/${userId}/`);
      return { success: true, message: response.data.message };
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to force logout',
      };
    }
  };

  return { forceLogout };
};