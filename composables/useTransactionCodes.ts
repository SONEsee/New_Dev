import { ref } from 'vue'
import axios from '@/helpers/axios'

export interface TransactionCode {
  trn_code: string
  trn_Desc_la: string
  trn_Desc_en: string
  Record_Status: string
  Maker_Id: number | null
  maker_username: string
  Maker_DT_Stamp: string
  Checker_Id: number | null
  checker_username: string
  Checker_DT_Stamp: string
  Auth_Status: string
  Once_Auth: string
}

export const useTransactionCodes = () => {
  const codes = ref<TransactionCode[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchCodes = async (params?: any) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await axios.get('/api/trn-codes/', { params })
      codes.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch codes'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCode = async (trnCode: string) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await axios.get(`/api/trn-codes/${trnCode}/`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to fetch code'
      throw err
    } finally {
      loading.value = false
    }
  }

  const authorizeCode = async (trnCode: string) => {
    try {
      const response = await axios.post(`/api/trn-codes/${trnCode}/authorize/`)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.detail || 'Failed to authorize'
      throw err
    }
  }

  return {
    codes,
    loading,
    error,
    fetchCodes,
    getCode,
    authorizeCode
  }
}
