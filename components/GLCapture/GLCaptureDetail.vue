<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'
import { useRolePermissions } from '@/composables/useRolePermissions'

// Router and route
const route = useRoute()
const router = useRouter()

// Role Permissions
const {
  initializeRole,
  canView,
  canEdit,
  canDelete,
  canAuthorize,
  canAdd,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  permissions
} = useRolePermissions()

// State
const loading = ref(false)
const error = ref(null)
const selectedItem = ref(null)
const journalEntries = ref([])
const modules = ref([])
const currencies = ref([])
const isDeletingPair = ref(false)
const deletingRefSubNo = ref(null)
const isRejectingPair = ref(false)
const rejectingRefSubNo = ref(null)
const isEditingPair = ref(false)
const editingRefSubNo = ref(null)
const editDialog = ref(false)

// Updated editForm reactive object definition
const editForm = ref({
  Reference_sub_No: '',
  Fcy_Amount: 0,
  Addl_text: '',
  Addl_sub_text: '',
  comments: '',
  glsub_id: null,
  relative_glsub_id: null,
  debit_account_code: '',
  credit_account_code: '',
  currency_code: ''
})

const editFormRef = ref(null)
const accounts = ref([])
const loadingAccounts = ref(false)
const selectedDebitAccount = ref(null)
const selectedCreditAccount = ref(null)
const editFormCurrency = ref(null)
const previousComments = ref('')

// Helper functions
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

const getAccountCode = (accountId) => {
  if (!accountId) return ''
  let account = accounts.value.find(a => a.glsub_id === accountId)
  if (account) {
    return account.glsub_code || account.account_code || ''
  }
  return ''
}

const getCurrencyInfo = (ccyCode) => {
  if (!ccyCode) return null
  return currencies.value.find(c => c.ccy_code === ccyCode)
}

// Format account display with currency prefix
const formatAccountDisplay = (accountCode, currencyCode) => {
  if (!accountCode) return ''
  
  const currency = getCurrencyInfo(currencyCode)
  const altCcyCode = currency?.ALT_Ccy_Code || ''
  
  if (altCcyCode && altCcyCode.trim() !== '') {
    return `${altCcyCode}.${accountCode}`
  }
  return accountCode
}

// Get formatted account code for journal entry in table
const getFormattedAccountCode = (entry) => {
  if (!entry) return ''
  const code = entry.account_code || getAccountCode(entry.Account)
  return formatAccountDisplay(code, entry.Ccy_cd || selectedItem.value?.Ccy_cd)
}

// Build account number like in GLCaptureCreate
const buildAccountNo = (accountId, currencyCode = null) => {
  let code = getAccountCode(accountId)
  if (!code) return ''
  
  const currency = getCurrencyInfo(currencyCode || selectedItem.value?.Ccy_cd)
  const altCcyCode = currency?.ALT_Ccy_Code || ''
  
  if (altCcyCode && altCcyCode.trim() !== '') {
    code = `${altCcyCode}.${code}`
  }
  
  return code
}

function handleEdit(entry) {
  const allowedTypes = ['GL']
  const isAllowedType = allowedTypes.includes(referenceNoSubstring.value)
  
  if (canEdit.value && isAllowedType) {
    editByPairAccount(entry)
  } else if (!canEdit.value) {
    Swal.fire({
      icon: 'warning',
      title: 'ບໍ່ອະນຸຍາດ',
      text: 'ທ່ານບໍ່ມີສິດແກ້ໄຂລາຍການນີ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'ບໍ່ອະນຸຍາດ',
      text: 'ປະເພດລາຍການນີ້ບໍ່ສາມາດແກ້ໄຂໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  }
}

// Computed
const canApprove = computed(() => {
  return canAuthorize.value && hasPermission('Auth_Detail')
})

const totalFcyDebit = computed(() => {
  return journalEntries.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.fcy_dr || 0)
  }, 0)
})

const totalFcyCredit = computed(() => {
  return journalEntries.value.reduce((sum, entry) => {
    return sum + parseFloat(entry.fcy_cr || 0)
  }, 0)
})

const isBalanced = computed(() => {
  const fcyBalance = Math.abs(totalFcyDebit.value - totalFcyCredit.value) < 0.01
  return fcyBalance
})

const isEditFormValid = computed(() => {
  const hasAmount = editForm.value.Fcy_Amount && editForm.value.Fcy_Amount > 0
  const hasComments = editForm.value.comments && editForm.value.comments.trim().length >= 1
  const accountsValid = (!editForm.value.glsub_id && !editForm.value.relative_glsub_id) || 
                       (editForm.value.glsub_id && editForm.value.relative_glsub_id)
  
  return hasAmount && hasComments && accountsValid
})

// Computed property for accounts with currency prefix formatting in edit dialog
const formattedAccountsForSelect = computed(() => {
  if (!editFormCurrency.value || !accounts.value.length) return accounts.value
  
  const altCcyCode = editFormCurrency.value.ALT_Ccy_Code || ''
  
  return accounts.value.map(account => ({
    ...account,
    account_display: altCcyCode 
      ? `${altCcyCode}.${account.glsub_code} - ${account.glsub_Desc_la || account.glsub_Desc_en || ''}`
      : `${account.glsub_code} - ${account.glsub_Desc_la || account.glsub_Desc_en || ''}`
  }))
})

const canApproveMaster = computed(() => {
  if (!selectedItem.value || !canAuthorize.value) return false
  
  const isMasterPending = selectedItem.value.Auth_Status === 'U'
  const hasCorrectionsNeeded = journalEntries.value.some(entry => entry.Auth_Status === 'P')
  
  return isMasterPending && !hasCorrectionsNeeded
})

const referenceNo = computed(() => route.query.Reference_No)
const referenceNoSubstring = computed(() => referenceNo.value?.substring(0, 2))

// Load data functions
const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    if (!referenceNo.value) {
      throw new Error('ບໍ່ພົບເລກອ້າງອີງ Reference_No')
    }

    const masterResponse = await axios.get('/api/journal-log-master/journal-log-detail/', {
      params: { Reference_No: referenceNo.value },
      ...getAuthHeaders()
    })
    
    const masterData = masterResponse.data.results || masterResponse.data || []
    if (masterData.length === 0) {
      throw new Error('ບໍ່ພົບຂໍ້ມູນລາຍການນີ້')
    }

    selectedItem.value = masterData[0]

    const entriesResponse = await axios.get('/api/journal-entries/', {
      params: { 
        Reference_No: referenceNo.value,
        ordering: 'Dr_cr'
      },
      ...getAuthHeaders()
    })

    journalEntries.value = entriesResponse.data.results || entriesResponse.data || []

    console.log('Detail data loaded:', {
      master: selectedItem.value,
      entries: journalEntries.value,
      totals: {
        debit: totalFcyDebit.value,
        credit: totalFcyCredit.value,
        balanced: isBalanced.value
      }
    })

  } catch (err) {
    console.error('Error loading detail data:', err)
    error.value = err.response?.data?.detail || err.message || 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້'
  } finally {
    loading.value = false
  }
}

const loadAccounts = async () => {
  try {
    loadingAccounts.value = true
    const response = await axios.get('/api/gl-sub/', getAuthHeaders())
    const accountData = response.data.results || response.data || []
    
    // Load accounts WITHOUT currency prefix - will be formatted when displayed
    accounts.value = accountData.map(account => ({
      ...account,
      account_display: `${account.glsub_code} - ${account.glsub_Desc_la || account.glsub_Desc_en || ''}`
    }))
    
    console.log('Accounts loaded:', accounts.value.length)
    
  } catch (error) {
    console.error('Error loading accounts:', error)
    Swal.fire({
      icon: 'warning',
      title: 'ແຈ້ງເຕືອນ',
      text: 'ບໍ່ສາມາດໂຫຼດລາຍການບັນຊີໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loadingAccounts.value = false
  }
}

const loadModules = async () => {
  try {
    const response = await axios.get('/api/modules/', getAuthHeaders())
    modules.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading modules:', error)
  }
}

const loadCurrencies = async () => {
  try {
    const response = await axios.get('/api/currencies/', getAuthHeaders())
    currencies.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading currencies:', error)
  }
}

// Helper functions
const formatNumber = (num, decimals = 2) => {
  if (!num) return '0.00'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('lo-LA')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('lo-LA')
}

const getStatusColor = (status) => {
  switch(status) {
    case 'A': return 'success'
    case 'R': return 'error'
    case 'U': return 'warning'
    case 'P': return 'info'
    default: return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch(status) {
    case 'A': return 'mdi-check-circle'
    case 'R': return 'mdi-close-circle'
    case 'U': return 'mdi-clock-outline'
    case 'P': return 'mdi-pencil-circle'
    default: return 'mdi-help-circle'
  }
}

const getStatusText = (status) => {
  switch(status) {
    case 'A': return 'ອະນຸມັດແລ້ວ'
    case 'R': return 'ປະຕິເສດ'
    case 'U': return 'ລໍຖ້າອະນຸມັດ'
    case 'P': return 'ຖ້າເແກ້ໄຂ'
    default: return 'ບໍ່ຮູ້'
  }
}

const getModuleName = (moduleId) => {
  if (!moduleId) return '-'
  const module = modules.value.find(m => m.module_Id === moduleId)
  return module ? module.module_name_la : moduleId
}

const getMakerName = () => {
  if (!selectedItem.value || !journalEntries.value.length) {
    return selectedItem.value?.Maker_Id || '-'
  }
  
  const firstEntry = journalEntries.value[0]
  return firstEntry?.maker_name || selectedItem.value?.Maker_Id || '-'
}

// Delete by pair account function
const deleteByPairAccount = async (referenceSubNo) => {
  if (!referenceSubNo) {
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ພົບເລກອ້າງອີງຄູ່',
      confirmButtonText: 'ຕົກລົງ'
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການລຶບ',
    html: `ທ່ານຕ້ອງການລຶບບັນທຶກຄູ່:<br><strong>${referenceSubNo}</strong><br><br>ການລຶບນີ້ຈະລຶບທັງຄູ່ບັນທຶກ (Debit ແລະ Credit)`,
    showCancelButton: true,
    confirmButtonText: 'ລຶບ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#9e9e9e'
  })

  if (!result.isConfirmed) return

  try {
    isDeletingPair.value = true
    deletingRefSubNo.value = referenceSubNo

    await axios.delete(`/api/journal-entries/delete-by-pair-account/`, {
      data: { Reference_sub_No: referenceSubNo },
      ...getAuthHeaders()
    })

    Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      text: 'ລຶບບັນທຶກຄູ່ສຳເລັດແລ້ວ',
      timer: 2000,
      showConfirmButton: false
    })

    await loadData()

  } catch (error) {
    console.error('Error deleting journal entry pair:', error)
    
    let errorMessage = 'ບໍ່ສາມາດລຶບບັນທຶກຄູ່ໄດ້'
    if (error.response?.status === 404) {
      errorMessage = 'ບໍ່ພົບບັນທຶກທີ່ຕ້ອງການລຶບ'
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
    }
    
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: errorMessage,
      confirmButtonText: 'ຕົກລົງ'
    })
    
  } finally {
    isDeletingPair.value = false
    deletingRefSubNo.value = null
  }
}

// Reject by pair account function
const rejectByPairAccount = async (referenceSubNo, item) => {
  if (!referenceSubNo) {
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ພົບເລກອ້າງອີງຄູ່',
      confirmButtonText: 'ຕົກລົງ'
    })
    return
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'ດັດເເກ້ຄູ່ບັນຊີ',
    html: `
      <div class="rejection-content">
        <p class="rejection-subtitle">ທ່ານຕ້ອງການປະຕິເສດບັນທຶກຄູ່:</p>
        <div class="reference-number">${referenceSubNo}</div>
        <p class="rejection-warning text-styles">ການປະຕິເສດນີ້ຈະປະຕິເສດທັງຄູ່ບັນທຶກ (Debit ແລະ Credit)</p>
      </div>
    `,
    input: 'textarea',
    inputLabel: 'ເຫດຜົນໃນການປະຕິເສດ *',
    inputPlaceholder: 'ກະລຸນາໃສ່ເຫດຜົນການປະຕິເສດ...',
    inputAttributes: {
      'aria-label': 'Rejection reason',
      'rows': 3,
      'maxlength': 250
    },
    inputValidator: (value) => {
      if (!value || value.trim().length === 0) {
        return 'ກະລຸນາໃສ່ເຫດຜົນໃນການປະຕິເສດ'
      }
      if (value.trim().length < 1) {
        return 'ເຫດຜົນຕ້ອງມີຢ່າງນ້ອຍ 1 ຕົວອັກສອນ'
      }
      if (value.length > 250) {
        return 'ເຫດຜົນຕ້ອງບໍ່ເກີນ 250 ຕົວອັກສອນ'
      }
    },
    showCancelButton: true,
    confirmButtonText: 'ຢັ້ງຢືນ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280'
  })

  if (!result.isConfirmed) return

  try {
    isRejectingPair.value = true
    rejectingRefSubNo.value = referenceSubNo

    await axios.post(
      `/api/journal-entries/reject-by-pair-account/`,
      {
        Reference_sub_No: referenceSubNo,
        comments: result.value.trim()
      },
      getAuthHeaders()
    )
    
    if (
      referenceNoSubstring.value !== 'GL' &&
      item &&
      item.Ac_relatives &&
      item.Ac_relatives.trim() !== ''
    ) {
      await axios.post(
        '/api/journal-entries/pending-asset/',
        {
          Ac_relatives: item.Ac_relatives,
          module_id: "AS"
        },
        getAuthHeaders()
      )
    }

    Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      text: 'ປະຕິເສດບັນທຶກຄູ່ແລະປັບສະຖານະຊັບສິນສຳເລັດແລ້ວ',
      timer: 2000,
      showConfirmButton: false
    })

    await loadData()

  } catch (error) {
    console.error('Error rejecting journal entry pair:', error)
    
    let errorMessage = 'ບໍ່ສາມາດປະຕິເສດບັນທຶກຄູ່ໄດ້'
    if (error.response?.status === 404) {
      errorMessage = 'ບໍ່ພົບບັນທຶກທີ່ຕ້ອງການປະຕິເສດ'
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.detail || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
    }
    
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: errorMessage,
      confirmButtonText: 'ຕົກລົງ'
    })
    
  } finally {
    isRejectingPair.value = false
    rejectingRefSubNo.value = null
  }
}

// Edit by pair account function
const editByPairAccount = (entry) => {
  console.log('=== EDIT FORM DEBUG ===')
  console.log('Editing entry:', entry)
  
  const relatedEntry = journalEntries.value.find(e => 
    e.Reference_sub_No === entry.Reference_sub_No && e.JRNLLog_id !== entry.JRNLLog_id
  )
  
  const getAccountId = (account) => {
    if (!account) return null
    if (typeof account === 'number') return account
    if (typeof account === 'object' && account.glsub_id !== undefined) {
      return parseInt(account.glsub_id)
    }
    if (typeof account === 'string') {
      const num = parseInt(account)
      if (!isNaN(num)) return num
    }
    return null
  }
  
  const currentAccountId = getAccountId(entry.Account)
  const relatedAccountId = relatedEntry ? getAccountId(relatedEntry.Account) : null
  
  let debitAccountId, creditAccountId, debitAccountCode, creditAccountCode
  
  if (entry.Dr_cr === 'D') {
    debitAccountId = currentAccountId
    creditAccountId = relatedAccountId
    debitAccountCode = entry.account_code
    creditAccountCode = relatedEntry?.account_code
  } else {
    debitAccountId = relatedAccountId  
    creditAccountId = currentAccountId
    debitAccountCode = relatedEntry?.account_code
    creditAccountCode = entry.account_code
  }
  
  editFormCurrency.value = getCurrencyInfo(entry.Ccy_cd)
  
  // Capture previous comments if they exist
  previousComments.value = entry.comments || ''
  
  editForm.value = {
    Reference_sub_No: entry.Reference_sub_No,
    Fcy_Amount: parseFloat(entry.fcy_dr || entry.fcy_cr || 0),
    Addl_text: entry.Addl_text || '',
    Addl_sub_text: entry.Addl_sub_text || '',
    comments: '',
    glsub_id: debitAccountId,
    relative_glsub_id: creditAccountId,
    debit_account_code: debitAccountCode,
    credit_account_code: creditAccountCode,
    currency_code: entry.Ccy_cd
  }
  
  if (debitAccountId) {
    selectedDebitAccount.value = accounts.value.find(acc => acc.glsub_id === debitAccountId)
    if (!selectedDebitAccount.value) {
      selectedDebitAccount.value = {
        glsub_id: debitAccountId,
        glsub_code: debitAccountCode,
        account_display: `${debitAccountCode} - Debit Account`
      }
    }
  }
  
  if (creditAccountId) {
    selectedCreditAccount.value = accounts.value.find(acc => acc.glsub_id === creditAccountId)
    if (!selectedCreditAccount.value) {
      selectedCreditAccount.value = {
        glsub_id: creditAccountId,
        glsub_code: creditAccountCode,
        account_display: `${creditAccountCode} - Credit Account`
      }
    }
  }
  
  console.log('=== END EDIT FORM DEBUG ===')
  
  editDialog.value = true
}

// Account change handlers
const onDebitAccountChange = (glsubId) => {
  if (glsubId) {
    selectedDebitAccount.value = accounts.value.find(acc => acc.glsub_id === glsubId)
    if (selectedDebitAccount.value) {
      editForm.value.debit_account_code = selectedDebitAccount.value.glsub_code
    }
  } else {
    selectedDebitAccount.value = null
    editForm.value.debit_account_code = ''
  }
}

const onCreditAccountChange = (glsubId) => {
  if (glsubId) {
    selectedCreditAccount.value = accounts.value.find(acc => acc.glsub_id === glsubId)
    if (selectedCreditAccount.value) {
      editForm.value.credit_account_code = selectedCreditAccount.value.glsub_code
    }
  } else {
    selectedCreditAccount.value = null
    editForm.value.credit_account_code = ''
  }
}

const closeEditDialog = () => {
  editDialog.value = false
  editForm.value = {
    Reference_sub_No: '',
    Fcy_Amount: 0,
    Addl_text: '',
    Addl_sub_text: '',
    comments: '',
    glsub_id: null,
    relative_glsub_id: null,
    debit_account_code: '',
    credit_account_code: '',
    currency_code: ''
  }
  selectedDebitAccount.value = null
  selectedCreditAccount.value = null
  editFormCurrency.value = null
  previousComments.value = ''
}

// Fix rejected entry function
const fixRejectedEntry = async () => {
  try {
    isEditingPair.value = true
    editingRefSubNo.value = editForm.value.Reference_sub_No

    if (!editForm.value.Fcy_Amount || editForm.value.Fcy_Amount <= 0) {
      throw new Error('ກະລຸນາໃສ່ຈຳນວນເງິນທີ່ຖືກຕ້ອງ')
    }

    if (!editForm.value.comments || editForm.value.comments.trim().length < 1) {
      throw new Error('ກະລຸນາໃສ່ເຫດຜົນການແກ້ໄຂທີ່ມີຄວາມຍາວຢ່າງນ້ອຍ 1 ຕົວອັກສອນ')
    }

    if (editForm.value.comments.length > 1000) {
      throw new Error('ເຫດຜົນການແກ້ໄຂຕ້ອງບໍ່ເກີນ 1000 ຕົວອັກສອນ')
    }

    const hasDebitAccount = editForm.value.glsub_id !== null && editForm.value.glsub_id !== undefined && editForm.value.glsub_id !== ''
    const hasCreditAccount = editForm.value.relative_glsub_id !== null && editForm.value.relative_glsub_id !== undefined && editForm.value.relative_glsub_id !== ''
    
    if (hasDebitAccount !== hasCreditAccount) {
      throw new Error('ກະລຸນາເລືອກທັງບັນຊີ Debit ແລະ Credit ພ້ອມກັນ ຫຼື ບໍ່ເລືອກເລີຍ')
    }

    const requestData = {
      Reference_sub_No: editForm.value.Reference_sub_No,
      comments: editForm.value.comments.trim(),
      Fcy_Amount: parseFloat(editForm.value.Fcy_Amount)
    }

    if (editForm.value.Addl_text && editForm.value.Addl_text.trim()) {
      requestData.Addl_text = editForm.value.Addl_text.trim()
    }

    if (editForm.value.Addl_sub_text && editForm.value.Addl_sub_text.trim()) {
      requestData.Addl_sub_text = editForm.value.Addl_sub_text.trim()
    }

    if (hasDebitAccount && hasCreditAccount) {
      const debitId = Number(editForm.value.glsub_id)
      const creditId = Number(editForm.value.relative_glsub_id)
      
      if (isNaN(debitId) || isNaN(creditId) || debitId <= 0 || creditId <= 0) {
        throw new Error('ລະບຸບັນຊີບໍ່ຖືກຕ້ອງ - ກະລຸນາເລືອກບັນຊີໃໝ່')
      }
      
      const debitAccountNo = buildAccountNo(debitId, editForm.value.currency_code)
      const creditAccountNo = buildAccountNo(creditId, editForm.value.currency_code)
      
      if (!debitAccountNo || !creditAccountNo) {
        throw new Error('ບໍ່ສາມາດສ້າງເລກບັນຊີໄດ້ - ກະລຸນາລອງໃໝ່')
      }
      
      requestData.glsub_id = Math.floor(debitId)
      requestData.relative_glsub_id = Math.floor(creditId)
      requestData.Account_no = debitAccountNo
      requestData.Ac_relatives = creditAccountNo
    }

    const response = await axios.post(`/api/journal-entries/fix-rejected/`, requestData, getAuthHeaders())

    let successDetails = [
      '• ອັດເດດສະຖານະຈາກ \'P\' ເປັນ \'U\'',
      '• ບັນທຶກເຫດຜົນການແກ້ໄຂແລ້ວ'
    ]
    
    if (requestData.glsub_id) {
      successDetails.push('• ອັດເດດບັນຊີແລ້ວ')
      successDetails.push(`• ບັນຊີ Debit: ${requestData.Account_no}`)
      successDetails.push(`• ບັນຊີ Credit: ${requestData.Ac_relatives}`)
    }

    Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      html: `
        <div class="text-left">
          <p><strong>ແກ້ໄຂບັນທຶກຄູ່ສຳເລັດແລ້ວ!</strong></p>
          <hr class="my-2">
          ${successDetails.map(detail => `<p><small>${detail}</small></p>`).join('')}
        </div>
      `,
      timer: 6000,
      showConfirmButton: false
    })

    closeEditDialog()
    await loadData()

  } catch (error) {
    console.error('Error fixing rejected entry:', error)
    
    let errorMessage = 'ບໍ່ສາມາດແກ້ໄຂບັນທຶກຄູ່ໄດ້'
    
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data
      
      if (status === 404) {
        errorMessage = 'ບໍ່ພົບບັນທຶກທີ່ຕ້ອງການແກ້ໄຂ'
      } else if (status === 400) {
        errorMessage = errorData?.detail || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
      } else if (errorData?.detail) {
        errorMessage = errorData.detail
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: errorMessage,
      confirmButtonText: 'ຕົກລົງ'
    })
    
  } finally {
    isEditingPair.value = false
    editingRefSubNo.value = null
  }
}

// Approve function
const approveItem = async (item) => {
  const result = await Swal.fire({
    icon: 'question',
    title: 'ຢືນຢັນການອະນຸມັດ',
    text: `ທ່ານຕ້ອງການອະນຸມັດລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    showCancelButton: true,
    confirmButtonText: 'ອະນຸມັດ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#4caf50',
    cancelButtonColor: '#9e9e9e'
  })

  if (result.isConfirmed) {
    try {
      const approvalPromises = []

      approvalPromises.push(
        axios.post('/api/journal-entries/approve-all/', {
          Reference_No: item.Reference_No
        }, getAuthHeaders())
      )

      const assetRelatives = [
        ...new Set(
          journalEntries.value
            .map(e => e.Ac_relatives && e.Ac_relatives.trim())
            .filter(Boolean)
        )
      ]

      const referenceNoSubstring = item.Reference_No.substring(0, 2)

      if (referenceNoSubstring !== 'GL') {
        assetRelatives.forEach(ac => {
          approvalPromises.push(
            axios.post('/api/journal-entries/approve-asset/', {
              Ac_relatives: ac,
              module_id: "AS"
            }, getAuthHeaders())
          )
        })
      }

      const responses = await Promise.all(approvalPromises)
      
      let successMessage = responses[0].data.message || 'ອະນຸມັດລາຍການສຳເລັດແລ້ວ'
      
      if (responses[1] && responses[1].data.success) {
        successMessage += '\nອະນຸມັດຊັບສິນສຳເລັດ'
      }

      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: successMessage,
        timer: 2000,
        showConfirmButton: false,
        didClose: () => {
          window.history.back()
        }
      })
      
      await loadData()
      
    } catch (error) {
      console.error('Error approving item:', error)
      
      let errorMessage = 'ບໍ່ສາມາດອະນຸມັດລາຍການໄດ້'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.status === 404) {
        errorMessage = 'ບໍ່ພົບລາຍການທີ່ຕ້ອງການອະນຸມັດ'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.detail || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
      }
      
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: errorMessage,
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

// Reject function
const rejectItem = async (item) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການປະຕິເສດ',
    text: `ທ່ານຕ້ອງການປະຕິເສດລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    input: 'textarea',
    inputLabel: 'ເຫດຜົນໃນການປະຕິເສດ *',
    inputPlaceholder: 'ກະລຸນາໃສ່ເຫດຜົນ...',
    inputAttributes: {
      'aria-label': 'Rejection reason',
      'rows': 3,
      'maxlength': 500
    },
    inputValidator: (value) => {
      if (!value || value.trim().length === 0) {
        return 'ກະລຸນາໃສ່ເຫດຜົນໃນການປະຕິເສດ'
      }
    },
    showCancelButton: true,
    confirmButtonText: 'ປະຕິເສດ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#9e9e9e'
  })
  
  if (result.isConfirmed) {
    try {
      const response = await axios.post('/api/journal-entries/reject-all/', {
        Reference_No: item.Reference_No,
        rejection_reason: result.value.trim()
      }, getAuthHeaders())

      if (item && item.Ac_relatives && item.Ac_relatives.trim() !== '') {
        await axios.post(
          '/api/journal-entries/reject-asset/',
          {
            Ac_relatives: item.Ac_relatives,
            module_id: "AS"
          },
          getAuthHeaders()
        )
      }

      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: response.data.message || 'ປະຕິເສດລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      await loadData()
      
    } catch (error) {
      console.error('Error rejecting item:', error)
      
      let errorMessage = 'ບໍ່ສາມາດປະຕິເສດລາຍການໄດ້'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.status === 404) {
        errorMessage = 'ບໍ່ພົບລາຍການທີ່ຕ້ອງການປະຕິເສດ'
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.detail || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
      }
      
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: errorMessage,
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

// Lifecycle
onMounted(async () => {
  await initializeRole()
  
  await Promise.all([
    loadModules(),
    loadAccounts(),
    loadCurrencies()
  ])
  
  if (referenceNo.value) {
    loadData()
  } else {
    error.value = 'ບໍ່ພົບພາລາມິເຕີ Reference_No ໃນ URL'
  }
})

watch(() => route.query.Reference_No, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    loadData()
  }
}, { immediate: false })
</script>

<template>
  <div class="gl-detail-page">
    <!-- Page Header -->
    <div class="page-header-improved">
      <div class="d-flex align-center justify-space-between flex-wrap gap-3">
        <div class="header-left">
          <h1 class="page-title-improved">
            <v-icon color="primary" size="24" class="mr-3">mdi-book-open</v-icon>
            ລາຍລະອຽດບັນທຶກບັນຊີ
          </h1>
          <div v-if="referenceNo" class="page-subtitle">
            <v-chip color="primary" variant="outlined" size="default" class="mr-2">
              <v-icon left size="16">mdi-identifier</v-icon>
              {{ referenceNo }}
            </v-chip>
            <span class="text-caption text-grey">
              <v-icon color="gray" size="16" class="mr-1">mdi-clock-outline</v-icon>
              {{ formatDateTime(selectedItem?.Value_date) }}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <div class="permission-indicators" v-if="permissions">
            <v-tooltip text="ສິດເຂົ້າເຖິງຂອງທ່ານ" location="bottom">
              <template #activator="{ props }">
                <div v-bind="props" class="d-flex gap-1">
                  <v-chip v-if="canView" color="info" size="x-small" variant="flat">
                    <v-icon size="12">mdi-eye</v-icon> ເບິ່ງ
                  </v-chip>
                  <v-chip v-if="canEdit" color="warning" size="x-small" variant="flat">
                    <v-icon size="12">mdi-pencil</v-icon> ແກ້
                  </v-chip>
                  <v-chip v-if="canDelete" color="error" size="x-small" variant="flat">
                    <v-icon size="12">mdi-delete</v-icon> ລຶບ
                  </v-chip>
                  <v-chip v-if="canAuthorize" color="success" size="x-small" variant="flat">
                    <v-icon size="12">mdi-check-circle</v-icon> ອະນຸມັດ
                  </v-chip>
                </div>
              </template>
            </v-tooltip>
          </div>
          <v-btn variant="outlined" @click="$router.go(-1)" prepend-icon="mdi-arrow-left" size="default" class="action-btn">ກັບ</v-btn>
          <v-btn v-if="referenceNo" variant="text" @click="loadData" prepend-icon="mdi-refresh" size="default" :loading="loading" class="action-btn">ໂຫຼດໃໝ່</v-btn>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-card class="text-center py-12" elevation="1">
        <v-progress-circular indeterminate color="primary" size="64" width="4"></v-progress-circular>
        <div class="mt-6 text-h6">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
      </v-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <v-card class="text-center py-12" elevation="1">
        <v-icon size="80" color="error" class="mb-6">mdi-alert-circle-outline</v-icon>
        <div class="text-h5 mb-3 text-error">ບໍ່ພົບຂໍ້ມູນ</div>
        <div class="text-body-1 mb-4 text-grey">{{ error }}</div>
        <v-btn color="primary" @click="loadData" v-if="referenceNo" prepend-icon="mdi-refresh" size="large">ລອງໃໝ່</v-btn>
        <v-btn variant="outlined" @click="$router.go(-1)" prepend-icon="mdi-arrow-left" size="large" class="ml-2">ກັບ</v-btn>
      </v-card>
    </div>

    <!-- Permission Denied State -->
    <div v-else-if="permissions && !canView" class="permission-denied-state">
      <v-card class="text-center py-12" elevation="1">
        <v-icon size="80" color="error" class="mb-6">mdi-shield-lock</v-icon>
        <div class="text-h5 mb-3 text-error">ບໍ່ມີສິດເຂົ້າເຖິງ</div>
        <div class="text-body-1 mb-4 text-grey">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</div>
        <v-btn variant="outlined" @click="$router.go(-1)" prepend-icon="mdi-arrow-left" size="large">ກັບ</v-btn>
      </v-card>
    </div>

    <!-- Main Content -->
    <div v-else-if="selectedItem" class="main-content">
      <!-- Master Information Card -->
      <v-card class="master-card mb-6" elevation="2">
        <v-card-text class="master-content">
          <div class="info-grid-improved">
            <div class="info-section">
              <h3 class="section-header">
                <v-icon color="primary" size="18" class="mr-2">mdi-information</v-icon>
                ຂໍ້ມູນທົ່ວໄປ
              </h3>
              <div class="info-rows">
                <div class="info-row">
                  <span class="info-label">ໂມດູນ:</span>
                  <span class="info-value">{{ getModuleName(selectedItem.module_id) }} - {{ selectedItem.Txn_code }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">ຜູ້ສ້າງ:</span>
                  <span class="info-value">{{ getMakerName() }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">ເນື້ອໃນ:</span>
                  <span class="info-value">{{ selectedItem.Addl_text || '-' }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h3 class="section-header">
                <v-icon color="success" size="18" class="mr-2">mdi-cash</v-icon>
                ຂໍ້ມູນການເງິນ
              </h3>
              <div class="amount-cards">
                <div class="amount-card primary">
                  <div class="amount-label">FCY Amount</div>
                  <div class="amount-value">{{ formatNumber(selectedItem.Fcy_Amount) }}</div>
                  <div class="amount-currency">{{ selectedItem.Ccy_cd }}</div>
                </div>
                <div class="amount-card success">
                  <div class="amount-label">LCY Amount</div>
                  <div class="amount-value">{{ formatNumber(selectedItem.Lcy_Amount) }}</div>
                  <div class="amount-currency">LAK</div>
                </div>
                <div class="amount-card info">
                  <div class="amount-label">Exchange Rate</div>
                  <div class="amount-value">{{ formatNumber(selectedItem.Exch_rate, 6) }}</div>
                  <div class="amount-currency">Rate</div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Journal Entries Card -->
      <v-card class="entries-card" elevation="2">
        <v-card-title class="entries-header">
          <div class="entries-info">
            <div class="entries-title">
              <v-icon color="primary" size="20" class="mr-2">mdi-table</v-icon>
              ລາຍການບັນທຶກ
              <v-chip color="primary" variant="outlined" size="small" class="ml-2">
                {{ journalEntries.length }} ລາຍການ
              </v-chip>
            </div>
            <div v-if="journalEntries.some(entry => entry.Auth_Status === 'P')" class="entries-warning">
              <v-chip color="warning" variant="flat" size="small">
                <v-icon left size="16">mdi-alert</v-icon>
                {{ journalEntries.filter(e => e.Auth_Status === 'P').length }} ລາຍການຕ້ອງແກ້ໄຂ
              </v-chip>
            </div>
          </div>
          
          <div class="entries-status">
            <v-chip :color="isBalanced ? 'success' : 'error'" variant="flat" size="default" class="balance-chip">
              <v-icon left size="18">{{ isBalanced ? 'mdi-scale-balance' : 'mdi-scale-unbalanced' }}</v-icon>
              {{ isBalanced ? 'ສົມດຸນ' : 'ບໍ່ສົມດຸນ' }}
            </v-chip>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <div class="table-wrapper">
            <div class="table-container">
              <table class="entries-table">
                <thead>
                  <tr>
                    <th class="th-ref">ເລກອ້າງອີງຄູ່</th>
                    <th class="th-description">ເນື້ອໃນ</th>
                    <th class="th-account">ບັນຊີ</th>
                    <th class="th-debit">Debit (FCY)</th>
                    <th class="th-credit">Credit (FCY)</th>
                    <th class="th-status">ສະຖານະ</th>
                    <th class="th-actions">ການກະທຳ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="entry in journalEntries" 
                    :key="entry.JRNLLog_id" 
                    :class="{ 'correction-row': entry.Auth_Status === 'P' }"
                    class="entry-row"
                  >
                    <td class="td-ref">
                      <v-chip size="small" variant="outlined" color="primary" class="ref-chip">
                        {{ entry.Reference_sub_No }}
                      </v-chip>
                    </td>
                    
                    <td class="td-description">
                      <div v-if="entry.Addl_sub_text" class="description-text">
                        {{ entry.Addl_sub_text }}
                      </div>
                      <div v-else class="text-grey text-center">-</div>
                    </td>
                    
                    <td class="td-account">
                      <div class="account-info">
                        <div class="account-code">{{ getFormattedAccountCode(entry) }}</div>
                        <div class="account-name">{{ entry.account_name }}</div>
                      </div>
                    </td>
                    
                    <td class="td-debit">
                      <div v-if="parseFloat(entry.fcy_dr) > 0" class="amount-display debit">
                        {{ formatNumber(entry.fcy_dr) }}
                      </div>
                      <div v-else class="text-grey text-center">-</div>
                    </td>
                    
                    <td class="td-credit">
                      <div v-if="parseFloat(entry.fcy_cr) > 0" class="amount-display credit">
                        {{ formatNumber(entry.fcy_cr) }}
                      </div>
                      <div v-else class="text-grey text-center">-</div>
                    </td>
                    
                    <td class="td-status">
                      <v-chip 
                        :color="getStatusColor(entry.Auth_Status)"
                        variant="flat"
                        size="small"
                        class="status-mini-chip"
                      >
                        <v-icon size="14">{{ getStatusIcon(entry.Auth_Status) }}</v-icon>
                      </v-chip>
                    </td>
                    
                    <td class="td-actions">
                      <div class="action-buttons">
                        <template v-if="canView">
                          <v-tooltip text="ແກ້ໄຂຄູ່ບັນທຶກ" location="top">
                            <template #activator="{ props }">
                              <v-btn
                                v-if="(entry.Auth_Status === 'U' || entry.Auth_Status === 'P') && canEdit"
                                v-bind="props"
                                icon
                                size="small"
                                variant="text"
                                color="info"
                                @click="handleEdit(entry)"
                                :disabled="isEditingPair"
                                :loading="editingRefSubNo === entry.Reference_sub_No"
                                class="action-btn-small"
                              >
                                <v-icon size="16">mdi-pencil</v-icon>
                              </v-btn>
                            </template>
                          </v-tooltip>

                          <v-tooltip text="ປະຕິເສດຄູ່ບັນທຶກ" location="top">
                            <template #activator="{ props }">
                              <v-btn
                                v-if="canAuthorize"
                                v-bind="props"
                                icon
                                size="small"
                                variant="text"
                                color="warning"
                                @click="rejectByPairAccount(entry.Reference_sub_No, entry)"
                                :disabled="isRejectingPair || entry.Auth_Status === 'R' || entry.Auth_Status === 'A'"
                                :loading="rejectingRefSubNo === entry.Reference_sub_No"
                                class="action-btn-small"
                              >
                                <v-icon size="16">mdi-close-circle</v-icon>
                              </v-btn>
                            </template>
                          </v-tooltip>

                          <v-tooltip text="ລຶບຄູ່ບັນທຶກ" location="top">
                            <template #activator="{ props }">
                              <v-btn
                                v-if="canDelete && entry.Auth_Status !== 'A' && entry.Auth_Status !== 'R'"
                                v-bind="props"
                                icon
                                size="small"
                                variant="text"
                                color="error"
                                @click="deleteByPairAccount(entry.Reference_sub_No)"
                                :disabled="isDeletingPair"
                                :loading="deletingRefSubNo === entry.Reference_sub_No"
                                class="action-btn-small"
                              >
                                <v-icon size="16">mdi-delete</v-icon>
                              </v-btn>
                            </template>
                          </v-tooltip>
                        </template>

                        <template v-else>
                          <v-chip size="x-small" color="grey" variant="flat">
                            <v-icon size="12">mdi-lock</v-icon> ບໍ່ມີສິດ
                          </v-chip>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="totals-row">
                    <td colspan="3" class="totals-label">
                      <div class="d-flex align-center">
                        <v-icon size="18" class="mr-2">mdi-calculator</v-icon>
                        <strong>ລວມທັງໝົດ:</strong>
                      </div>
                    </td>
                    <td class="totals-debit">
                      <div class="total-amount debit">{{ formatNumber(totalFcyDebit) }}</div>
                    </td>
                    <td class="totals-credit">
                      <div class="total-amount credit">{{ formatNumber(totalFcyCredit) }}</div>
                    </td>
                    <td colspan="2" class="totals-status">
                      <v-chip :color="isBalanced ? 'success' : 'error'" variant="flat" size="small">
                        <v-icon size="14">{{ isBalanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
                      </v-chip>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Action Panel -->
      <v-card class="action-panel mt-6" elevation="2">
        <v-card-text class="pa-6">
          <div class="status-alerts mb-4">
            <v-alert
              v-if="journalEntries.some(entry => entry.Auth_Status === 'P')"
              type="warning"
              variant="tonal"
              density="comfortable"
              class="mb-3"
            >
              <template #prepend>
                <v-icon>mdi-alert-circle</v-icon>
              </template>
              <strong>ບໍ່ສາມາດອະນຸມັດໄດ້:</strong> ມີລາຍການທີ່ຕ້ອງແກ້ໄຂກ່ອນ
            </v-alert>
          </div>

          <div class="action-buttons-main">
            <div class="buttons-group">
              <v-btn
                v-if="canApproveMaster && canAuthorize"
                color="success"
                variant="flat"
                @click="approveItem(selectedItem)"
                prepend-icon="mdi-check-circle"
                size="large"
                class="primary-action-btn"
              >
                ອະນຸມັດລາຍການ
              </v-btn>
              
              <v-btn
                v-if="selectedItem?.Auth_Status === 'U' && canAuthorize"
                color="error"
                variant="flat"
                @click="rejectItem(selectedItem)"
                prepend-icon="mdi-close-circle"
                size="large"
                class="primary-action-btn"
              >
                ປະຕິເສດລາຍການ
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="1000px" persistent>
      <v-card class="edit-dialog-card">
        <v-card-title class="edit-dialog-header">
          <div class="d-flex align-center">
            <v-icon color="white" size="22" class="mr-3">mdi-pencil</v-icon>
            <div>
              <div class="dialog-title">ແກ້ໄຂບັນທຶກຄູ່</div>
              <div class="dialog-subtitle">ປັບປຸງຂໍ້ມູນລາຍການບັນທຶກ</div>
            </div>
          </div>
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            size="small"
            color="white"
            @click="closeEditDialog"
            class="dialog-close-btn"
          ></v-btn>
        </v-card-title>

        <v-card-text class="edit-dialog-content">
          <div class="reference-info mb-6">
            <h3 class="text-subtitle-1 mb-3">ຂໍ້ມູນອ້າງອີງ:</h3>
            <div class="d-flex flex-wrap gap-3 mb-3">
              <v-chip color="primary" variant="outlined" size="default">
                <v-icon left size="16">mdi-identifier</v-icon>
                {{ editForm.Reference_sub_No }}
              </v-chip>
              
              <v-chip v-if="editFormCurrency" color="success" variant="outlined" size="default">
                <v-icon left size="16">mdi-currency-usd</v-icon>
                {{ editForm.currency_code }} - {{ editFormCurrency.Ccy_Name_la || editFormCurrency.Ccy_Name_en }}
              </v-chip>
            </div>
            
            <div v-if="editForm.debit_account_code || editForm.credit_account_code" class="current-accounts mb-3">
              <h4 class="text-subtitle-2 mb-2">ບັນຊີປັດຈຸບັນ:</h4>
              <div class="d-flex flex-wrap gap-2">
                <v-chip v-if="editForm.debit_account_code" color="info" variant="flat" size="small">
                  <v-icon left size="14">mdi-plus</v-icon>
                  Debit: {{ formatAccountDisplay(editForm.debit_account_code, editForm.currency_code) }}
                </v-chip>
                <v-chip v-if="editForm.credit_account_code" color="warning" variant="flat" size="small">
                  <v-icon left size="14">mdi-minus</v-icon>
                  Credit: {{ formatAccountDisplay(editForm.credit_account_code, editForm.currency_code) }}
                </v-chip>
              </div>
            </div>

            <!-- Previous Comments Display -->
            <div v-if="previousComments" class="previous-comments mb-3">
              <h4 class="text-subtitle-2 mb-2">
                <v-icon size="16" color="warning" class="mr-1">mdi-comment-alert</v-icon>
                ເຫດຜົນການແກ້ໄຂກ່ອນໜ້າ:
              </h4>
              <div class="comments-display">
                <v-icon size="16" color="grey" class="mr-2">mdi-comment-text-outline</v-icon>
                <span class="comments-text">{{ previousComments }}</span>
              </div>
            </div>
            
            <v-alert type="info" variant="tonal" density="compact">
              <template #prepend>
                <v-icon>mdi-information</v-icon>
              </template>
              ສະຖານະຈະປ່ຽນຈາກ 'P' (ຕ້ອງແກ້ໄຂ) ເປັນ 'U' (ລໍຖ້າອະນຸມັດ)
            </v-alert>
          </div>
          <v-form ref="editFormRef" class="edit-form">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="editForm.glsub_id"
                  :items="formattedAccountsForSelect"
                  item-title="account_display"
                  item-value="glsub_id"
                  label="ບັນຊີ Debit"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-plus"
                  clearable
                  :loading="loadingAccounts"
                  :rules="[v => !editForm.relative_glsub_id || !!v || 'ກະລຸນາເລືອກບັນຊີ Debit']"
                  :menu-props="{ maxHeight: 300 }"
                  @update:model-value="onDebitAccountChange"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="editForm.relative_glsub_id"
                  :items="formattedAccountsForSelect"
                  item-title="account_display"
                  item-value="glsub_id"
                  label="ບັນຊີ Credit"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-minus"
                  clearable
                  :loading="loadingAccounts"
                  :rules="[v => !editForm.glsub_id || !!v || 'ກະລຸນາເລືອກບັນຊີ Credit']"
                  :menu-props="{ maxHeight: 300 }"
                  @update:model-value="onCreditAccountChange"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editForm.Fcy_Amount"
                  label="ຈຳນວນເງິນ FCY *"
                  type="number"
                  step="0.01"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-currency-usd"
                  :rules="[
                    v => !!v || 'ກະລຸນາໃສ່ຈຳນວນເງິນ',
                    v => v > 0 || 'ຈຳນວນເງິນຕ້ອງມາກກ່ວາ 0'
                  ]"
                  :suffix="editForm.currency_code"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-textarea
                  v-model="editForm.Addl_sub_text"
                  label="ເນື້ອໃນຍ່ອຍ"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-text-box"
                  rows="2"
                  counter="255"
                  :rules="[v => !v || v.length <= 255 || 'ເນື້ອໃນຕ້ອງບໍ່ເກີນ 255 ຕົວອັກສອນ']"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="editForm.comments"
                  label="ເຫດຜົນການແກ້ໄຂ *"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-comment-edit"
                  rows="3"
                  counter="1000"
                  placeholder="ກະລຸນາອະທິບາຍເຫດຜົນການແກ້ໄຂ..."
                  :rules="[
                    v => !!v || 'ກະລຸນາໃສ່ເຫດຜົນການແກ້ໄຂ',
                    v => v && v.length >= 1 || 'ເຫດຜົນຕ້ອງມີຢ່າງນ້ອຍ 1 ຕົວອັກສອນ',
                    v => !v || v.length <= 1000 || 'ເຫດຜົນຕ້ອງບໍ່ເກີນ 1000 ຕົວອັກສອນ'
                  ]"
                  required
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="edit-dialog-actions">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="closeEditDialog"
            :disabled="isEditingPair"
            size="large"
            class="action-btn-dialog"
          >
            <v-icon left size="16">mdi-close</v-icon>
            ຍົກເລີກ
          </v-btn>
          <v-btn
            color="info"
            variant="flat"
            @click="fixRejectedEntry"
            :loading="isEditingPair"
            :disabled="!isEditFormValid"
            size="large"
            class="action-btn-dialog"
          >
            <v-icon left size="16">mdi-content-save</v-icon>
            ບັນທຶກການແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.gl-detail-page {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.page-header-improved {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.page-title-improved {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.page-subtitle {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 100px;
  height: 40px;
  border-radius: 8px;
}

.master-card {
  border-radius: 16px;
  overflow: hidden;
}

.info-grid-improved {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.info-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
}

.section-header {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: center;
}

.info-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 140px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin-left: 16px;
}

.amount-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.amount-card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  border: 2px solid;
  transition: all 0.2s ease;
}

.amount-card.primary {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.amount-card.success {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.amount-card.info {
  border-color: #06b6d4;
  background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%);
}

.amount-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.amount-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
}

.amount-currency {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
}

.entries-card {
  border-radius: 16px;
  overflow: hidden;
}

.entries-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.entries-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
}

.entries-table {
  width: 100%;
  border-collapse: collapse;
}

.entries-table thead {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.entries-table th {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 16px 12px;
  text-align: left;
  text-transform: uppercase;
}

.entries-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.entry-row:hover {
  background-color: #f8fafc;
}

.account-code {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
}

.account-name {
  color: #6b7280;
  font-size: 0.8rem;
}

.amount-display {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 600;
  text-align: right;
}

.amount-display.debit {
  color: #dc2626;
}

.amount-display.credit {
  color: #059669;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.action-btn-small {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 6px;
}

.totals-row {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-top: 2px solid #cbd5e1;
  font-weight: 700;
}

.total-amount {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 700;
  text-align: right;
}

.total-amount.debit {
  color: #dc2626;
}

.total-amount.credit {
  color: #059669;
}

.correction-row {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border-left: 4px solid #ef4444 !important;
}

.action-panel {
  border-radius: 16px;
}

.primary-action-btn {
  min-width: 180px;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
}

.edit-dialog-card {
  border-radius: 16px;
}

.edit-dialog-header {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  padding: 24px 28px;
  position: relative;
}

.dialog-close-btn {
  position: absolute !important;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.dialog-close-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.dialog-title {
  font-size: 1.3rem;
  font-weight: 600;
}

.reference-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
}

.current-accounts {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
}

@media (max-width: 1024px) {
  .info-grid-improved {
    grid-template-columns: 1fr;
  }
}
</style>