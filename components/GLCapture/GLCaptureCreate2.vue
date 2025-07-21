<template>
  <div class="journal-entry-container">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">
        <v-icon left color="primary">mdi-book-open-page-variant</v-icon>
        ລາຍການບັນທຶກບັນຊີ
      </h2>
      <p class="page-subtitle">ສ້າງລາຍການບັນທຶກບັນຊີໃໝ່</p>
    </div>

    <!-- Main Form Card -->
    <v-card class="form-card" elevation="2">
      <v-card-text class="pa-4">
        <v-form ref="form" v-model="valid" lazy-validation>

          <!-- Basic Information Section -->
          <div class="form-section">
            <h3 class="section-title">
              <v-icon left color="primary" size="small">mdi-information</v-icon>
              ຂໍ້ມູນພື້ນຖານ
            </h3>
            <v-row dense>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="journalData.Reference_No"
                  label="ເລກອ້າງອີງ *"
                  :rules="referenceRules"
                  :disabled="autoReferenceMode"
                  outlined
                  dense
                  counter="20"
                  prepend-inner-icon="mdi-identifier"
                  hide-details="auto"
                  class="compact-field"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="journalData.Ccy_cd"
                  :items="currencies"
                  item-title="Ccy_Name_la"
                  item-value="ccy_code"
                  label="ສະກຸນເງິນ *"
                  :rules="requiredRules"
                  outlined
                  dense
                  :loading="loading.currencies"
                  @change="onCurrencyChange"
                  prepend-inner-icon="mdi-currency-usd"
                  hide-details="auto"
                  class="compact-field"
                  :menu-props="{ maxHeight: 400 }"
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="journalData.Txn_code"
                  :items="transactionCodes"
                  item-title="txn_display"
                  item-value="trn_code"
                  label="ລະຫັດການເຄື່ອນໄຫວ *"
                  :rules="requiredRules"
                  outlined
                  dense
                  :loading="loading.transactionCodes"
                  @change="onTransactionCodeChange"
                  prepend-inner-icon="mdi-code-tags"
                  hide-details="auto"
                  class="compact-field"
                  :menu-props="{ maxHeight: 400 }"
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="journalData.Value_date"
                  label="ວັນທີ *"
                  type="date"
                  outlined
                  dense
                  @change="updateReferenceNumber"
                  prepend-inner-icon="mdi-calendar"
                  hide-details="auto"
                  class="compact-field"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row dense class="mt-2">
              <v-col cols="12">
                <v-textarea
                  v-model="journalData.Addl_text"
                  label="ຂໍ້ຄວາມເພີ່ມເຕີມ"
                  outlined
                  dense
                  rows="2"
                  counter="255"
                  prepend-inner-icon="mdi-text"
                  hide-details="auto"
                  class="compact-field"
                ></v-textarea>
              </v-col>
            </v-row>
          </div>

          <!-- Journal Entries Section -->
          <div class="entries-container">
            <v-row>
              <!-- Credit Entries -->
              <v-col cols="12" md="6">
                <div class="entries-section credit-section">
                  <div class="section-header">
                    <h3 class="entries-title">
                      <v-icon left color="success" size="small">mdi-plus-circle</v-icon>
                      ເຄຣດິດ (Credit)
                    </h3>
                    <v-btn 
                      color="success" 
                      size="small"
                      variant="outlined"
                      @click="addCreditEntry"
                      :disabled="loading.submit"
                    >
                      <v-icon left size="small">mdi-plus</v-icon>
                      ເພີ່ມ
                    </v-btn>
                  </div>
                  
                  <div v-if="creditEntries.length === 0" class="empty-state">
                    <v-icon color="grey" size="small">mdi-information-outline</v-icon>
                    <span class="grey--text text-caption">ກົດປຸ່ມ "ເພີ່ມ" ເພື່ອເພີ່ມລາຍການເຄຣດິດ</span>
                  </div>

                  <div v-for="(entry, index) in creditEntries" :key="`credit-${index}`" class="entry-item">
                    <v-card outlined class="entry-card">
                      <v-card-text class="pa-2">
                        <div class="entry-header">
                          <span class="entry-number">C{{ index + 1 }}</span>
                          <v-btn 
                            icon
                            size="x-small"
                            color="error" 
                            @click="removeCreditEntry(index)"
                            :disabled="loading.submit"
                          >
                            <v-icon size="small">mdi-close</v-icon>
                          </v-btn>
                        </div>
                        
                        <v-autocomplete
                          v-model="entry.Account"
                          :items="accounts"
                          item-title="glsub_code"
                          item-value="glsub_id"
                          label="ບັນຊີ"
                          outlined
                          dense
                          :loading="loading.accounts"
                          clearable
                          hide-details="auto"
                          class="compact-field mb-2"
                          :menu-props="{ maxHeight: 400, minWidth: 300 }"
                        >
                          <!-- <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props" class="compact-item">
                              <v-list-item-title class="text-body-2">{{ item.raw.glsub_code }}</v-list-item-title>
                              <v-list-item-subtitle class="text-caption">{{ item.raw.glsub_Desc_la }}</v-list-item-subtitle>
                            </v-list-item>
                          </template> -->
                        </v-autocomplete>
                        
                        <v-row dense>
                          <v-col cols="6">
                            <v-text-field
                              v-model="entry.Amount"
                              label="ຈຳນວນ"
                              type="number"
                              outlined
                              dense
                              step="0.001"
                              @input="calculateEntryAmount(entry)"
                              hide-details="auto"
                              class="compact-field"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model="entry.Lcy_Amount"
                              label="ຈຳນວນກີບ"
                              type="number"
                              outlined
                              dense
                              readonly
                              hide-details="auto"
                              class="compact-field lcy-field"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
              </v-col>

              <!-- Debit Entries -->
              <v-col cols="12" md="6">
                <div class="entries-section debit-section">
                  <div class="section-header">
                    <h3 class="entries-title">
                      <v-icon left color="primary" size="small">mdi-minus-circle</v-icon>
                      ເດບິດ (Debit)
                    </h3>
                    <v-btn 
                      color="primary" 
                      size="small"
                      variant="outlined"
                      @click="addDebitEntry"
                      :disabled="loading.submit"
                    >
                      <v-icon left size="small">mdi-plus</v-icon>
                      ເພີ່ມ
                    </v-btn>
                  </div>
                  
                  <div v-if="debitEntries.length === 0" class="empty-state">
                    <v-icon color="grey" size="small">mdi-information-outline</v-icon>
                    <span class="grey--text text-caption">ກົດປຸ່ມ "ເພີ່ມ" ເພື່ອເພີ່ມລາຍການເດບິດ</span>
                  </div>

                  <div v-for="(entry, index) in debitEntries" :key="`debit-${index}`" class="entry-item">
                    <v-card outlined class="entry-card">
                      <v-card-text class="pa-2">
                        <div class="entry-header">
                          <span class="entry-number">D{{ index + 1 }}</span>
                          <v-btn 
                            icon
                            size="x-small" 
                            color="error" 
                            @click="removeDebitEntry(index)"
                            :disabled="loading.submit"
                          >
                            <v-icon size="small">mdi-close</v-icon>
                          </v-btn>
                        </div>
                        
                        <v-autocomplete
                          v-model="entry.Account"
                          :items="accounts"
                          item-title="glsub_code"
                          item-value="glsub_id"
                          label="ບັນຊີ"
                          outlined
                          dense
                          :loading="loading.accounts"
                          clearable
                          hide-details="auto"
                          class="compact-field mb-2"
                          :menu-props="{ maxHeight: 400, minWidth: 300 }"
                        >
                          <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props" class="compact-item">
                              <v-list-item-title class="text-body-2">{{ item.raw.glsub_code }}</v-list-item-title>
                              <v-list-item-subtitle class="text-caption">{{ item.raw.glsub_Desc_la }}</v-list-item-subtitle>
                            </v-list-item>
                          </template>
                        </v-autocomplete>
                        
                        <v-row dense>
                          <v-col cols="6">
                            <v-text-field
                              v-model="entry.Amount"
                              label="ຈຳນວນ"
                              type="number"
                              outlined
                              dense
                              step="0.001"
                              @input="calculateEntryAmount(entry)"
                              hide-details="auto"
                              class="compact-field"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="6">
                            <v-text-field
                              v-model="entry.Lcy_Amount"
                              label="ຈຳນວນກີບ"
                              type="number"
                              outlined
                              dense
                              readonly
                              hide-details="auto"
                              class="compact-field lcy-field"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Summary Section -->
          <div class="summary-section">
            <v-row dense>
              <v-col cols="12" md="4">
                <v-card class="summary-card credit-summary" elevation="1">
                  <v-card-text class="pa-3 text-center">
                    <div class="summary-label">ເຄຣດິດລວມ</div>
                    <div class="summary-amount text-success">{{ formatNumber(totalCreditAmount) }}</div>
                    <div class="summary-currency">{{ journalData.Ccy_cd || 'LAK' }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="summary-card debit-summary" elevation="1">
                  <v-card-text class="pa-3 text-center">
                    <div class="summary-label">ເດບິດລວມ</div>
                    <div class="summary-amount text-primary">{{ formatNumber(totalDebitAmount) }}</div>
                    <div class="summary-currency">{{ journalData.Ccy_cd || 'LAK' }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card class="summary-card balance-summary" elevation="1">
                  <v-card-text class="pa-3 text-center">
                    <div class="summary-label">ສະຖານະ</div>
                    <div class="summary-status">
                      <v-chip 
                        :color="isBalanced ? 'success' : 'error'" 
                        size="small"
                        variant="flat"
                      >
                        <v-icon left size="small">{{ isBalanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
                        {{ isBalanced ? 'ສົມດຸນ' : 'ບໍ່ສົມດຸນ' }}
                      </v-chip>
                    </div>
                    <div class="summary-difference" v-if="!isBalanced">
                      ຕ່າງ: {{ formatNumber(Math.abs(balanceDifference)) }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <v-btn
              color="primary"
              size="large"
              :disabled="!isFormValid || loading.submit"
              :loading="loading.submit"
              @click="submitJournal"
              class="submit-btn"
            >
              <v-icon left>mdi-content-save</v-icon>
              ບັນທຶກ
            </v-btn>
            
            <v-btn
              variant="outlined"
              size="large"
              @click="resetForm"
              :disabled="loading.submit"
              class="reset-btn"
            >
              <v-icon left>mdi-refresh</v-icon>
              ລ້າງຟອມ
            </v-btn>

            <v-btn
              variant="text"
              size="large"
              @click="addQuickEntry"
              :disabled="loading.submit"
              class="quick-btn"
            >
              <v-icon left>mdi-lightning-bolt</v-icon>
              ເພີ່ມໄວ
            </v-btn>
          </div>

        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'

// Reactive data
const valid = ref(false)
const form = ref(null)
const autoReferenceMode = ref(false)
const nextReferenceNumber = ref(1)

const journalData = reactive({
  Reference_No: '',
  Ccy_cd: 'LAK', // Default to LAK
  Txn_code: null,
  Value_date: new Date().toISOString().substr(0, 10),
  Addl_text: ''
})

const loading = reactive({
  currencies: false,
  accounts: false,
  transactionCodes: false,
  submit: false
})

// Arrays for entries
const creditEntries = ref([])
const debitEntries = ref([])

// Exchange rate
const exchangeRate = ref(1)

// Data arrays
const currencies = ref([])
const accounts = ref([])
const transactionCodes = ref([])

// Validation rules
const requiredRules = [
  v => !!v || 'ຈຳເປັນຕ້ອງເພີ່ມຂໍ້ມູນ'
]

const referenceRules = [
  v => !!v || 'ຈຳເປັນຕ້ອງເພີ່ມເລກອ້າງອີງ',
  v => (v && v.length <= 20) || 'ເລກອ້າງອີງຕ້ອງບໍ່ເກີນ 20 ໂຕອັກສອນ'
]

// API configuration
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Computed properties
const totalCreditAmount = computed(() => {
  return creditEntries.value.reduce((sum, entry) => sum + (parseFloat(entry.Lcy_Amount) || 0), 0)
})

const totalDebitAmount = computed(() => {
  return debitEntries.value.reduce((sum, entry) => sum + (parseFloat(entry.Lcy_Amount) || 0), 0)
})

const balanceDifference = computed(() => {
  return totalDebitAmount.value - totalCreditAmount.value
})

const isBalanced = computed(() => {
  return Math.abs(balanceDifference.value) < 0.01 // Allow for small rounding differences
})

const isFormValid = computed(() => {
  return valid.value && 
         creditEntries.value.length > 0 && 
         debitEntries.value.length > 0 && 
         isBalanced.value &&
         creditEntries.value.every(entry => entry.Account && entry.Amount > 0) &&
         debitEntries.value.every(entry => entry.Account && entry.Amount > 0)
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  }).format(num || 0)
}

const generateReferenceNumber = async () => {
  if (!journalData.Txn_code || !journalData.Value_date) return ''
  
  const date = new Date(journalData.Value_date)
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  // Try to get the next sequence number from the backend
  try {
    const dateStr = `${year}${month}${day}`
    const prefix = `${journalData.Txn_code}-${dateStr}`
    
    // Get existing journals for today to find the last sequence
    const response = await axios.get(`/api/gl-capture/?Reference_No__startswith=${prefix}`, getAuthHeaders())
    const existingJournals = response.data.results || response.data || []
    
    let maxSequence = 0
    existingJournals.forEach(journal => {
      const match = journal.Reference_No.match(/-(\d{5})$/)
      if (match) {
        const seq = parseInt(match[1])
        if (seq > maxSequence) maxSequence = seq
      }
    })
    
    nextReferenceNumber.value = maxSequence + 1
  } catch (error) {
    console.error('Error getting next reference number:', error)
  }
  
  const sequence = nextReferenceNumber.value.toString().padStart(5, '0')
  return `${journalData.Txn_code}-${year}${month}${day}-${sequence}`
}

const updateReferenceNumber = async () => {
  if (autoReferenceMode.value) {
    journalData.Reference_No = await generateReferenceNumber()
  }
}

const onTransactionCodeChange = async () => {
  if (journalData.Txn_code) {
    autoReferenceMode.value = true
    await updateReferenceNumber()
  }
}

const calculateEntryAmount = (entry) => {
  if (entry.Amount && exchangeRate.value) {
    entry.Lcy_Amount = parseFloat((entry.Amount * exchangeRate.value).toFixed(3))
  }
}

const onCurrencyChange = () => {
  const selectedCurrency = currencies.value.find(c => c.ccy_code === journalData.Ccy_cd)
  if (selectedCurrency && selectedCurrency.default_rate) {
    exchangeRate.value = selectedCurrency.default_rate
  }
  // Recalculate all entries
  creditEntries.value.forEach(calculateEntryAmount)
  debitEntries.value.forEach(calculateEntryAmount)
}

const addCreditEntry = () => {
  creditEntries.value.push({
    Account: null,
    Amount: 0,
    Lcy_Amount: 0
  })
}

const removeCreditEntry = (index) => {
  creditEntries.value.splice(index, 1)
}

const addDebitEntry = () => {
  debitEntries.value.push({
    Account: null,
    Amount: 0,
    Lcy_Amount: 0
  })
}

const removeDebitEntry = (index) => {
  debitEntries.value.splice(index, 1)
}

const addQuickEntry = () => {
  // Add both debit and credit entry for quick balanced entry
  addDebitEntry()
  addCreditEntry()
}

const loadCurrencies = async () => {
  try {
    loading.currencies = true
    const response = await axios.get('/api/currencies/', getAuthHeaders())
    currencies.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading currencies:', error)
    Swal.fire('ຂໍ້ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດສະກຸນເງິນ', 'error')
  } finally {
    loading.currencies = false
  }
}

const loadAccounts = async () => {
  try {
    loading.accounts = true
    const response = await axios.get('/api/gl-sub/?page_size=200', getAuthHeaders())
    const data = response.data.results || response.data || []
    accounts.value = data
  } catch (error) {
    console.error('Error loading accounts:', error)
    Swal.fire('ຂໍ້ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດບັນຊີ', 'error')
  } finally {
    loading.accounts = false
  }
}

const loadTransactionCodes = async () => {
  try {
    loading.transactionCodes = true
    const response = await axios.get('/api/trn-codes/', getAuthHeaders())
    const data = response.data.results || response.data || []
    transactionCodes.value = data.map(code => ({
      ...code,
      txn_display: `${code.trn_code} - ${code.trn_Desc_la || code.trn_Desc_en}`,
    }))
  } catch (error) {
    console.error('Error loading transaction codes:', error)
    Swal.fire('ຂໍ້ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດລະຫັດການເຄື່ອນໄຫວ', 'error')
  } finally {
    loading.transactionCodes = false
  }
}

const submitJournal = async () => {
  if (!isFormValid.value) {
    Swal.fire({
      icon: 'warning',
      title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ',
      text: 'ກະລຸນາກວດສອບຂໍ້ມູນໃຫ້ຄົບຖ້ວນ ແລະ ຍອດເດບິດ-ເຄຣດິດຕ້ອງສົມດຸນ',
      confirmButtonText: 'ຕົກລົງ'
    })
    return
  }
  
  try {
    loading.submit = true
    
    // Prepare all journal entries
    const journalEntries = []
    
    // Add credit entries
    creditEntries.value.forEach(entry => {
      journalEntries.push({
        ...journalData,
        Account: entry.Account,
        Amount: entry.Amount,
        Lcy_Amount: entry.Lcy_Amount,
        Dr_cr: 'C',
        Exch_rate: exchangeRate.value,
        Value_date: journalData.Value_date + 'T00:00:00Z',
        Maker_DT_Stamp: new Date().toISOString(),
        Auth_Status: 'U'
      })
    })
    
    // Add debit entries
    debitEntries.value.forEach(entry => {
      journalEntries.push({
        ...journalData,
        Account: entry.Account,
        Amount: entry.Amount,
        Lcy_Amount: entry.Lcy_Amount,
        Dr_cr: 'D',
        Exch_rate: exchangeRate.value,
        Value_date: journalData.Value_date + 'T00:00:00Z',
        Maker_DT_Stamp: new Date().toISOString(),
        Auth_Status: 'U'
      })
    })
    
    // Submit all entries
    for (const entry of journalEntries) {
      await axios.post('/api/gl-capture/', entry, getAuthHeaders())
    }
    
    // Success message
    await Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ!',
      text: `ບັນທຶກລາຍການບັນຊີ ${journalData.Reference_No} ສຳເລັດແລ້ວ`,
      confirmButtonText: 'ຕົກລົງ',
      timer: 3000,

    })
    
    // Increment reference number for next entry
    if (autoReferenceMode.value) {
      nextReferenceNumber.value++
    }
    
    resetForm()
    
  } catch (error) {
    console.error('Error submitting journal:', error)
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ'
    
    if (error.response?.data?.Reference_No) {
      errorMessage = 'ເລກອ້າງອີງນີ້ມີຢູ່ແລ້ວ'
    }
    
    Swal.fire('ຂໍ້ຜິດພາດ', errorMessage, 'error')
  } finally {
    loading.submit = false
  }
}

const resetForm = () => {
  const currentTxnCode = journalData.Txn_code
  const currentCurrency = journalData.Ccy_cd
  
  Object.assign(journalData, {
    Reference_No: '',
    Ccy_cd: currentCurrency || 'LAK',
    Txn_code: currentTxnCode,
    Value_date: new Date().toISOString().substr(0, 10),
    Addl_text: ''
  })
  
  creditEntries.value = []
  debitEntries.value = []
  
  // Update reference number after resetting
  if (autoReferenceMode.value && currentTxnCode) {
    updateReferenceNumber()
  }
  
  nextTick(() => {
    form.value?.resetValidation()
  })
}

// Watchers
watch(() => journalData.Txn_code, onTransactionCodeChange)
watch(() => journalData.Value_date, updateReferenceNumber)

// Lifecycle
onMounted(() => {
  loadCurrencies()
  loadAccounts()
  loadTransactionCodes()
})
</script>

<style scoped>
.journal-entry-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 16px;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 300;
  color: #1976d2;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.page-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.form-card {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  width: 100%;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  color: #424242;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
}

.compact-field {
  font-size: 0.875rem;
}

.compact-field :deep(.v-field__input) {
  min-height: 36px;
  padding: 8px 12px;
}

.compact-field :deep(.v-field__prepend-inner) {
  padding-top: 6px;
}

/* Fix for dropdown menu */
.compact-field :deep(.v-menu__content) {
  min-width: 300px !important;
}

.compact-field :deep(.v-autocomplete__content) {
  min-width: 300px !important;
}

.entries-container {
  margin: 24px 0;
}

.entries-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  height: fit-content;
  min-height: 300px;
}

.credit-section {
  background: linear-gradient(135deg, #f8fff8 0%, #ffffff 100%);
  border-left: 3px solid #4caf50;
}

.debit-section {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-left: 3px solid #2196f3;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.entries-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #424242;
  margin: 0;
  display: flex;
  align-items: center;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px;
  text-align: center;
  background: #fafafa;
  border-radius: 6px;
  border: 1px dashed #ddd;
}

.entry-item {
  margin-bottom: 8px;
}

.entry-card {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.entry-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.entry-number {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.compact-item {
  min-height: 48px !important;
  padding: 8px 16px !important;
}

.compact-item :deep(.v-list-item-title) {
  font-size: 0.875rem !important;
  line-height: 1.4 !important;
  font-weight: 500;
  white-space: normal !important;
  word-wrap: break-word !important;
}

.compact-item :deep(.v-list-item-subtitle) {
  font-size: 0.75rem !important;
  line-height: 1.3 !important;
  margin-top: 2px;
  white-space: normal !important;
  word-wrap: break-word !important;
}

.lcy-field :deep(.v-field__input) {
  background-color: #f8f9fa;
  font-weight: 500;
}

.summary-section {
  margin: 24px 0;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.summary-card {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(0,0,0,0.1);
}

.summary-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.summary-amount {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 4px 0;
}

.summary-currency {
  font-size: 0.7rem;
  color: #999;
}

.summary-status {
  margin: 4px 0;
}

.summary-difference {
  font-size: 0.7rem;
  color: #f44336;
  margin-top: 4px;
}

.credit-summary {
  border-left: 3px solid #4caf50;
}

.debit-summary {
  border-left: 3px solid #2196f3;
}

.balance-summary {
  border-left: 3px solid #ff9800;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.submit-btn, .reset-btn, .quick-btn {
  min-width: 120px;
  border-radius: 6px;
}

/* Responsive design */
@media (max-width: 768px) {
  .journal-entry-container {
    padding: 8px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .submit-btn, .reset-btn, .quick-btn {
    width: 100%;
    max-width: 240px;
  }
  
  .entries-container .v-col {
    margin-bottom: 16px;
  }
}

/* Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entry-item {
  animation: slideIn 0.3s ease;
}
</style>