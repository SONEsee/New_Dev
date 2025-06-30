<template>
  <div class="gl-detail-page">
    <!-- Page Header -->
    <div class="page-header-compact">
      <div class="d-flex align-center justify-space-between">
        <h1 class="page-title-compact">
          <v-icon color="primary" size="20" class="mr-2">mdi-book-open</v-icon>
          ລາຍລະອຽດບັນທຶກບັນຊີ
          <span v-if="referenceNo" class="text-caption ml-2 opacity-70">{{ referenceNo }}</span>
        </h1>
        <v-btn
          variant="outlined"
          @click="$router.go(-1)"
          prepend-icon="mdi-arrow-left"
          size="small"
        >
          ກັບ
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="mt-4">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h6 mb-2">ບໍ່ພົບຂໍ້ມູນ</div>
      <div class="text-caption mb-4">{{ error }}</div>
      <div v-if="!referenceNo" class="text-xs text-grey mb-4">
        URL ຄວນມີຮູບແບບ: /glcapture/detail?Reference_No=GL-XXX-XXXXXX-XXXXX
      </div>
      <v-btn color="primary" @click="loadData" v-if="referenceNo">ລອງໃໝ່</v-btn>
      <v-btn color="primary" @click="$router.go(-1)" v-else>ກັບໄປໜ້າກ່ອນ</v-btn>
    </div>

    <!-- Main Content -->
    <div v-else-if="selectedItem">
      <!-- Master Information Card -->
      <v-card class="mb-4" elevation="1">
        <v-card-title class="d-flex justify-space-between align-center pa-4 bg-primary text-white">
          <div>
            <div class="text-h5 font-weight-medium">{{ selectedItem.Reference_No }}</div>
            <div class="text-caption opacity-80">{{ formatDateTime(selectedItem.Maker_DT_Stamp) }}</div>
          </div>
          <v-chip
            :color="getStatusColor(selectedItem.Auth_Status)"
            size="small"
            variant="flat"
            class="text-white"
          >
            <v-icon left size="small">{{ getStatusIcon(selectedItem.Auth_Status) }}</v-icon>
            {{ getStatusText(selectedItem.Auth_Status) }}
          </v-chip>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <!-- Main Information Grid -->
          <div class="info-grid mb-4">
            <div class="info-item">
              <span class="info-label">ໂມດູນ:</span>
              <span class="info-value">{{ getModuleName(selectedItem.module_id) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ວັນທີ:</span>
              <span class="info-value">{{ formatDate(selectedItem.Value_date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ລະຫັດທຸລະກຳ:</span>
              <span class="info-value">{{ selectedItem.Txn_code }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ຜູ້ສ້າງ:</span>
              <span class="info-value">{{ getMakerName() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ເນື້ອໃນ:</span>
              <span class="info-value">{{ selectedItem.Addl_text || '-' }}</span>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="amount-summary">
            <div class="amount-item">
              <div class="amount-label">FCY Amount</div>
              <div class="amount-value">{{ formatNumber(selectedItem.Fcy_Amount) }} {{ selectedItem.Ccy_cd }}</div>
            </div>
            <div class="amount-item">
              <div class="amount-label">LCY Amount</div>
              <div class="amount-value">{{ formatNumber(selectedItem.Lcy_Amount) }} LAK</div>
            </div>
            <div class="amount-item">
              <div class="amount-label">Exchange Rate</div>
              <div class="amount-value">{{ formatNumber(selectedItem.Exch_rate, 6) }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Journal Entries Card -->
      <v-card elevation="1">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div>
            <span class="text-h6">ລາຍການບັນທຶກ ({{ journalEntries.length }} ລາຍການ)</span>
            <div v-if="journalEntries.some(entry => entry.Auth_Status === 'P')" class="mt-1">
              <div class="correction-legend">
                <div class="correction-indicator"></div>
                <span class="text-xs text-grey ml-1">ຕ້ອງແກ້ໄຂ ({{ journalEntries.filter(e => e.Auth_Status === 'P').length }} ລາຍການ)</span>
              </div>
            </div>
          </div>
          <div class="d-flex gap-2 align-center">
            <!-- Approval Status Indicator -->
            <v-chip 
              v-if="selectedItem?.Auth_Status === 'A'"
              color="success"
              variant="flat"
              size="small"
            >
              <v-icon left size="small">mdi-check-circle</v-icon>
              ອະນຸມັດແລ້ວ
            </v-chip>
            <v-chip 
              v-else-if="selectedItem?.Auth_Status === 'R'"
              color="error"
              variant="flat"
              size="small"
            >
              <v-icon left size="small">mdi-close-circle</v-icon>
              ປະຕິເສດແລ້ວ
            </v-chip>
            <v-chip 
              v-else-if="canApproveMaster"
              color="warning"
              variant="flat"
              size="small"
            >
              <v-icon left size="small">mdi-clock-outline</v-icon>
              ພ້ອມອະນຸມັດ
            </v-chip>
            <v-chip 
              v-else-if="selectedItem?.Auth_Status === 'U'"
              color="error"
              variant="flat"
              size="small"
            >
              <v-icon left size="small">mdi-alert</v-icon>
              ຕ້ອງແກ້ໄຂກ່ອນ
            </v-chip>
            
            <!-- Balance Indicator -->
            <v-chip 
              :color="isBalanced ? 'success' : 'error'"
              variant="flat"
              size="small"
            >
              <v-icon left size="small">{{ isBalanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
              {{ isBalanced ? 'ສົມດຸນ' : 'ບໍ່ສົມດຸນ' }}
            </v-chip>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <div class="journal-table-container">
            <table class="journal-table">
              <thead>
                <tr>
                  <th width="120">ບັນຊີ</th>
                  <th width="180">ເລກອ້າງອີງຄູ່</th>
                  <th width="250">ຊື່ບັນຊີ</th>
                  <th width="140" class="text-right">Debit (FCY)</th>
                  <th width="140" class="text-right">Credit (FCY)</th>
                  <th width="140" class="text-center">ການກະທຳ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) in journalEntries" :key="entry.JRNLLog_id" 
                    :class="{ 'correction-row': entry.Auth_Status === 'P' }">
                  <td class="font-weight-medium">{{ entry.account_code }}</td>
                  <td>
                    <v-chip size="small" variant="outlined" color="primary">
                      {{ entry.Reference_sub_No }}
                    </v-chip>
                  </td>
                  <td class="text-truncate" style="max-width: 250px;">
                    <span :title="entry.account_name">{{ entry.account_name }}</span>
                    <div v-if="entry.Addl_sub_text" class="text-xs text-grey mt-1">
                      {{ entry.Addl_sub_text }}
                    </div>
                  </td>
                  <td class="text-right">
                    <span v-if="parseFloat(entry.fcy_dr) > 0" class="font-weight-medium">
                      {{ formatNumber(entry.fcy_dr) }}
                    </span>
                    <span v-else class="text-grey">-</span>
                  </td>
                  <td class="text-right">
                    <span v-if="parseFloat(entry.fcy_cr) > 0" class="font-weight-medium">
                      {{ formatNumber(entry.fcy_cr) }}
                    </span>
                    <span v-else class="text-grey">-</span>
                  </td>
                  <td class="text-center">
                    <div class="d-flex justify-center gap-1">
                      <v-btn
                        v-if="entry.Auth_Status === 'P'"
                        icon
                        size="small"
                        variant="text"
                        color="info"
                        @click="editByPairAccount(entry)"
                        :disabled="isEditingPair"
                        :loading="editingRefSubNo === entry.Reference_sub_No"
                        title="ແກ້ໄຂຄູ່ບັນທຶກ"
                      >
                        <v-icon size="16">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="warning"
                        @click="rejectByPairAccount(entry.Reference_sub_No)"
                        :disabled="isRejectingPair || entry.Auth_Status === 'R'"
                        :loading="rejectingRefSubNo === entry.Reference_sub_No"
                        title="ປະຕິເສດຄູ່ບັນທຶກ"
                      >
                        <v-icon size="16">mdi-close-circle</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="error"
                        @click="deleteByPairAccount(entry.Reference_sub_No)"
                        :disabled="isDeletingPair || entry.Auth_Status === 'R'"
                        :loading="deletingRefSubNo === entry.Reference_sub_No"
                        title="ລຶບຄູ່ບັນທຶກ"
                      >
                        <v-icon size="16">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="totals-row">
                  <td colspan="3" class="text-right font-weight-bold">ລວມ:</td>
                  <td class="text-right font-weight-bold">{{ formatNumber(totalFcyDebit) }}</td>
                  <td class="text-right font-weight-bold">{{ formatNumber(totalFcyCredit) }}</td>
                  <td class="text-center">
                    <v-chip 
                      :color="isBalanced ? 'success' : 'error'"
                      variant="flat"
                      size="x-small"
                    >
                      <v-icon size="12">{{ isBalanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip 
                      v-if="canApproveMaster"
                      color="success"
                      variant="flat"
                      size="x-small"
                    >
                      <v-icon size="12">mdi-check</v-icon>
                      ພ້ອມ
                    </v-chip>
                    <v-chip 
                      v-else
                      color="warning"
                      variant="flat"
                      size="x-small"
                    >
                      <v-icon size="12">mdi-alert</v-icon>
                      ບໍ່ພ້ອມ
                    </v-chip>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </v-card-text>
      </v-card>

      <!-- Action Buttons -->
      <v-card class="mt-4" elevation="1">
        <v-card-text class="pa-4">
          <!-- Show warning if there are corrections needed -->
          <div v-if="journalEntries.some(entry => entry.Auth_Status === 'P')" class="mb-3">
            <v-alert type="warning" variant="tonal" density="compact">
              <v-icon start>mdi-alert</v-icon>
              <strong>ບໍ່ສາມາດອະນຸມັດໄດ້:</strong> ມີລາຍການທີ່ຕ້ອງແກ້ໄຂກ່ອນ ({{ journalEntries.filter(e => e.Auth_Status === 'P').length }} ລາຍການ)
            </v-alert>
          </div>

          <!-- Show info if master is already approved -->
          <div v-if="selectedItem.Auth_Status === 'A'" class="mb-3">
            <v-alert type="success" variant="tonal" density="compact">
              <v-icon start>mdi-check-circle</v-icon>
              <strong>ອະນຸມັດແລ້ວ:</strong> ລາຍການນີ້ໄດ້ຮັບການອະນຸມັດແລ້ວ
            </v-alert>
          </div>

          <!-- Show info if master is rejected -->
          <div v-if="selectedItem.Auth_Status === 'R'" class="mb-3">
            <v-alert type="error" variant="tonal" density="compact">
              <v-icon start>mdi-close-circle</v-icon>
              <strong>ປະຕິເສດແລ້ວ:</strong> ລາຍການນີ້ໄດ້ຖືກປະຕິເສດແລ້ວ
            </v-alert>
          </div>

          <div class="d-flex justify-end gap-3">
            <v-btn
              v-if="canApproveMaster"
              color="success"
              variant="flat"
              @click="approveItem(selectedItem)"
              prepend-icon="mdi-check"
              size="large"
            >
              ອະນຸມັດ
            </v-btn>
            <v-btn
              v-if="selectedItem?.Auth_Status === 'U' && canApprove"
              color="error"
              variant="flat"
              @click="rejectItem(selectedItem)"
              prepend-icon="mdi-close"
              size="large"
            >
              ປະຕິເສດ
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Edit Pair Dialog -->
    <v-dialog v-model="editDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between pa-4 bg-info text-white">
          <div>
            <v-icon left color="white" size="20">mdi-pencil</v-icon>
            ແກ້ໄຂບັນທຶກຄູ່
          </div>
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            size="small"
            color="white"
            @click="closeEditDialog"
          ></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="mb-4">
            <div class="text-subtitle-2 mb-2">ເລກອ້າງອີງຄູ່:</div>
            <v-chip color="primary" variant="outlined" size="small">
              {{ editForm.Reference_sub_No }}
            </v-chip>
            
            <div class="mt-2 text-caption text-grey">
              <v-icon size="16" color="warning" class="mr-1">mdi-arrow-right</v-icon>
              ສະຖານະຈະປ່ຽນຈາກ 'P' (ຕ້ອງແກ້ໄຂ) ເປັນ 'U' (ລໍຖ້າອະນຸມັດ)
            </div>
          </div>

          <v-form ref="editFormRef">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editForm.Fcy_Amount"
                  label="ຈຳນວນເງິນ FCY *"
                  type="number"
                  step="0.01"
                  variant="outlined"
                  density="compact"
                  :rules="[
                    v => !!v || 'ກະລຸນາໃສ່ຈຳນວນເງິນ',
                    v => v > 0 || 'ຈຳນວນເງິນຕ້ອງມີຄ່າມາກກ່ວາ 0'
                  ]"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="editForm.glsub_id"
                  :items="accounts"
                  item-title="account_display"
                  item-value="glsub_id"
                  label="ບັນຊີ Debit"
                  variant="outlined"
                  density="compact"
                  clearable
                  :loading="loadingAccounts"
                  :rules="[
                    v => !editForm.relative_glsub_id || !!v || 'ກະລຸນາເລືອກບັນຊີ Debit ເມື່ອເລືອກບັນຊີ Credit',
                  ]"
                  :hint="`ເລືອກ: ${accounts.length} ບັນຊີ`"
                  persistent-hint
                  :menu-props="{ maxHeight: 300 }"
                  :no-data-text="loadingAccounts ? 'ກຳລັງໂຫຼດ...' : 'ບໍ່ພົບຂໍ້ມູນ'"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="editForm.relative_glsub_id"
                  :items="accounts"
                  item-title="account_display"
                  item-value="glsub_id"
                  label="ບັນຊີ Credit"
                  variant="outlined"
                  density="compact"
                  clearable
                  :loading="loadingAccounts"
                  :rules="[
                    v => !editForm.glsub_id || !!v || 'ກະລຸນາເລືອກບັນຊີ Credit ເມື່ອເລືອກບັນຊີ Debit',
                  ]"
                  :hint="`ເລືອກ: ${accounts.length} ບັນຊີ`"
                  persistent-hint
                  :menu-props="{ maxHeight: 300 }"
                  :no-data-text="loadingAccounts ? 'ກຳລັງໂຫຼດ...' : 'ບໍ່ພົບຂໍ້ມູນ'"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12">
                <div class="text-caption text-grey mb-2">
                  <v-icon size="16" color="info" class="mr-1">mdi-information</v-icon>
                  ໝາຍເຫດ: ຖ້າຕ້ອງການປ່ຽນບັນຊີ, ກະລຸນາເລືອກທັງບັນຊີ Debit ແລະ Credit ພ້ອມກັນ
                  <span v-if="accounts.length === 0" class="text-warning ml-2">
                    (ຍັງບໍ່ມີບັນຊີໃຫ້ເລືອກ)
                  </span>
                </div>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="editForm.Addl_text"
                  label="ເນື້ອໃນຫຼັກ"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  counter="255"
                  :rules="[v => !v || v.length <= 255 || 'ເນື້ອໃນຕ້ອງບໍ່ເກີນ 255 ຕົວອັກສອນ']"
                ></v-textarea>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="editForm.Addl_sub_text"
                  label="ເນື້ອໃນຍ່ອຍ"
                  variant="outlined"
                  density="compact"
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
                  density="compact"
                  rows="3"
                  counter="1000"
                  placeholder="ກະລຸນາອະທິບາຍເຫດຜົນການແກ້ໄຂ..."
                  :rules="[
                    v => !!v || 'ກະລຸນາໃສ່ເຫດຜົນການແກ້ໄຂ',
                    v => v && v.length >= 10 || 'ເຫດຜົນຕ້ອງມີຢ່າງນ້ອຍ 10 ຕົວອັກສອນ',
                    v => !v || v.length <= 1000 || 'ເຫດຜົນຕ້ອງບໍ່ເກີນ 1000 ຕົວອັກສອນ'
                  ]"
                  required
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="outlined"
            @click="closeEditDialog"
            :disabled="isEditingPair"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn
            color="info"
            variant="flat"
            @click="fixRejectedEntry"
            :loading="isEditingPair"
            :disabled="!isEditFormValid"
          >
            <v-icon start size="16">mdi-content-save</v-icon>
            ບັນທຶກການແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'

// Router and route
const route = useRoute()
const router = useRouter()

// State
const loading = ref(false)
const error = ref(null)
const selectedItem = ref(null)
const journalEntries = ref([])
const modules = ref([])
const isDeletingPair = ref(false)
const deletingRefSubNo = ref(null)
const isRejectingPair = ref(false)
const rejectingRefSubNo = ref(null)
const isEditingPair = ref(false)
const editingRefSubNo = ref(null)
const editDialog = ref(false)
const editForm = ref({
  Reference_sub_No: '',
  Fcy_Amount: 0,
  Addl_text: '',
  Addl_sub_text: '',
  comments: '',
  glsub_id: null,
  relative_glsub_id: null
})
const editFormRef = ref(null)
const accounts = ref([])
const loadingAccounts = ref(false)

// API configuration
const API_BASE_URL = 'http://127.0.0.1:8000'

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Approve item)

// Computed
const canApprove = computed(() => {
  // Check user permissions - implement based on your auth system
  return true // Placeholder
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

// Form validation computed
const isEditFormValid = computed(() => {
  const hasAmount = editForm.value.Fcy_Amount && editForm.value.Fcy_Amount > 0
  const hasComments = editForm.value.comments && editForm.value.comments.trim().length >= 10
  const accountsValid = (!editForm.value.glsub_id && !editForm.value.relative_glsub_id) || 
                       (editForm.value.glsub_id && editForm.value.relative_glsub_id)
  
  console.log('Form validation:', {
    hasAmount,
    hasComments, 
    accountsValid,
    glsub_id: editForm.value.glsub_id,
    relative_glsub_id: editForm.value.relative_glsub_id
  })
  
  return hasAmount && hasComments && accountsValid
})

// Check if master entry can be approved
const canApproveMaster = computed(() => {
  if (!selectedItem.value || !canApprove.value) return false
  
  // Can only approve if master status is 'U' (pending approval)
  const isMasterPending = selectedItem.value.Auth_Status === 'U'
  
  // Cannot approve if any journal entries need correction (Auth_Status = 'P')
  const hasCorrectionsNeeded = journalEntries.value.some(entry => entry.Auth_Status === 'P')
  
  console.log('Approve validation:', {
    isMasterPending,
    hasCorrectionsNeeded,
    masterStatus: selectedItem.value.Auth_Status,
    entriesWithP: journalEntries.value.filter(entry => entry.Auth_Status === 'P').length
  })
  
  return isMasterPending && !hasCorrectionsNeeded
})

// Get Reference_No from route query parameters
// URL format: /glcapture/detail?Reference_No=GL-ADE-20250629-00001
const referenceNo = computed(() => route.query.Reference_No)

// Load data
const loadData = async () => {
  try {
    loading.value = true
    error.value = null

    // Check if Reference_No is provided
    if (!referenceNo.value) {
      throw new Error('ບໍ່ພົບເລກອ້າງອີງ Reference_No')
    }

    // Load master data
    const masterResponse = await axios.get('/api/journal-log-master/', {
      params: { Reference_No: referenceNo.value },
      ...getAuthHeaders()
    })

    const masterData = masterResponse.data.results || masterResponse.data || []
    if (masterData.length === 0) {
      throw new Error('ບໍ່ພົບຂໍ້ມູນລາຍການນີ້')
    }

    selectedItem.value = masterData[0]

    // Load journal entries
    const entriesResponse = await axios.get('/api/journal-entries/', {
      params: { 
        Reference_No: referenceNo.value,
        ordering: 'Dr_cr'
      },
      ...getAuthHeaders()
    })

    journalEntries.value = entriesResponse.data.results || entriesResponse.data || []

    // Debug journal entries structure
    if (journalEntries.value.length > 0) {
      console.log('Sample journal entry structure:', journalEntries.value[0])
      console.log('Account_id type:', typeof journalEntries.value[0].Account_id)
      console.log('Ac_relatives type:', typeof journalEntries.value[0].Ac_relatives)
    }

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

// Load accounts
const loadAccounts = async () => {
  try {
    loadingAccounts.value = true
    const response = await axios.get('/api/gl-sub/', getAuthHeaders())
    const accountData = response.data.results || response.data || []
    
    // Format accounts for display in select using correct field names
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

    await axios.delete(`${API_BASE_URL}/api/journal-entries/delete-by-pair-account/`, {
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

    // Reload data
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
const rejectByPairAccount = async (referenceSubNo) => {
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
    title: 'ປະຕິເສດບັນທຶກຄູ່',
    html: `ທ່ານຕ້ອງການປະຕິເສດບັນທຶກຄູ່:<br><strong>${referenceSubNo}</strong><br><br>ການປະຕິເສດນີ້ຈະປະຕິເສດທັງຄູ່ບັນທຶກ (Debit ແລະ Credit)`,
    input: 'textarea',
    inputLabel: 'ເຫດຜົນໃນການປະຕິເສດ *',
    inputPlaceholder: 'ກະລຸນາໃສ່ເຫດຜົນການປະຕິເສດ...',
    inputAttributes: {
      'aria-label': 'Rejection reason',
      'rows': 3,
      'maxlength': 500
    },
    inputValidator: (value) => {
      if (!value || value.trim().length === 0) {
        return 'ກະລຸນາໃສ່ເຫດຜົນໃນການປະຕິເສດ'
      }
      if (value.trim().length < 10) {
        return 'ເຫດຜົນຕ້ອງມີຢ່າງນ້ອຍ 10 ຕົວອັກສອນ'
      }
      if (value.length > 500) {
        return 'ເຫດຜົນຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ'
      }
    },
    showCancelButton: true,
    confirmButtonText: 'ປະຕິເສດ',
    cancelButtonText: 'ຍົກເລີກ',
    confirmButtonColor: '#ff9800',
    cancelButtonColor: '#9e9e9e',
    width: '600px'
  })

  if (!result.isConfirmed) return

  try {
    isRejectingPair.value = true
    rejectingRefSubNo.value = referenceSubNo

    await axios.post(`${API_BASE_URL}/api/journal-entries/reject-by-pair-account/`, {
      Reference_sub_No: referenceSubNo,
      comments: result.value.trim()
    }, getAuthHeaders())

    Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      text: 'ປະຕິເສດບັນທຶກຄູ່ສຳເລັດແລ້ວ',
      timer: 2000,
      showConfirmButton: false
    })

    // Reload data
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
  console.log('Entry Account_id:', entry.Account_id, 'Type:', typeof entry.Account_id)
  console.log('Entry Ac_relatives:', entry.Ac_relatives, 'Type:', typeof entry.Ac_relatives)
  
  // Find the related entry (debit/credit pair) to get the relative account
  const relatedEntry = journalEntries.value.find(e => 
    e.Reference_sub_No === entry.Reference_sub_No && e.JRNLLog_id !== entry.JRNLLog_id
  )
  
  console.log('Related entry:', relatedEntry)
  if (relatedEntry) {
    console.log('Related Account_id:', relatedEntry.Account_id, 'Type:', typeof relatedEntry.Account_id)
    console.log('Related Ac_relatives:', relatedEntry.Ac_relatives, 'Type:', typeof relatedEntry.Ac_relatives)
  }
  
  // Extract numeric IDs properly - handle all possible formats
  const getAccountId = (account) => {
    console.log('Processing account:', account, 'Type:', typeof account)
    
    if (!account) return null
    
    // If it's already a number
    if (typeof account === 'number') {
      console.log('Account is number:', account)
      return account
    }
    
    // If it's an object with glsub_id property
    if (typeof account === 'object' && account !== null) {
      if (account.glsub_id !== undefined) {
        console.log('Account object has glsub_id:', account.glsub_id)
        return parseInt(account.glsub_id)
      }
      // Handle case where the object might have other ID properties
      if (account.id !== undefined) {
        console.log('Account object has id:', account.id)
        return parseInt(account.id)
      }
    }
    
    // If it's a string that can be converted to number
    if (typeof account === 'string') {
      const num = parseInt(account)
      if (!isNaN(num)) {
        console.log('Account string converted to number:', num)
        return num
      }
    }
    
    console.log('Could not extract account ID from:', account)
    return null
  }
  
  const currentAccountId = getAccountId(entry.Account_id)
  const relatedAccountId = relatedEntry ? getAccountId(relatedEntry.Account_id) : null
  const currentRelatives = getAccountId(entry.Ac_relatives)
  const relatedRelatives = relatedEntry ? getAccountId(relatedEntry.Ac_relatives) : null
  
  console.log('Extracted IDs:')
  console.log('- currentAccountId:', currentAccountId)
  console.log('- relatedAccountId:', relatedAccountId)
  console.log('- currentRelatives:', currentRelatives) 
  console.log('- relatedRelatives:', relatedRelatives)
  
  // For debit entry, use current account as debit, related as credit
  // For credit entry, use related as debit, current as credit
  let debitAccountId, creditAccountId
  
  if (entry.Dr_cr === 'D') {
    debitAccountId = currentAccountId
    creditAccountId = relatedAccountId || currentRelatives
  } else {
    debitAccountId = relatedAccountId || currentRelatives  
    creditAccountId = currentAccountId
  }
  
  console.log('Final account assignment:')
  console.log('- debitAccountId (glsub_id):', debitAccountId)
  console.log('- creditAccountId (relative_glsub_id):', creditAccountId)
  
  // Populate edit form with current entry data
  editForm.value = {
    Reference_sub_No: entry.Reference_sub_No,
    Fcy_Amount: parseFloat(entry.fcy_dr || entry.fcy_cr || 0),
    Addl_text: entry.Addl_text || '',
    Addl_sub_text: entry.Addl_sub_text || '',
    comments: '',
    glsub_id: debitAccountId,
    relative_glsub_id: creditAccountId
  }
  
  console.log('Edit form populated:', editForm.value)
  console.log('=== END EDIT FORM DEBUG ===')
  
  editDialog.value = true
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
    relative_glsub_id: null
  }
}

const fixRejectedEntry = async () => {
  try {
    isEditingPair.value = true
    editingRefSubNo.value = editForm.value.Reference_sub_No

    console.log('=== FIX REJECTED DEBUG ===')
    console.log('Form data before validation:', editForm.value)

    // Validate form data
    if (!editForm.value.Fcy_Amount || editForm.value.Fcy_Amount <= 0) {
      throw new Error('ກະລຸນາໃສ່ຈຳນວນເງິນທີ່ຖືກຕ້ອງ')
    }

    if (!editForm.value.comments || editForm.value.comments.trim().length < 10) {
      throw new Error('ກະລຸນາໃສ່ເຫດຜົນການແກ້ໄຂທີ່ມີຄວາມຍາວຢ່າງນ້ອຍ 10 ຕົວອັກສອນ')
    }

    if (editForm.value.comments.length > 1000) {
      throw new Error('ເຫດຜົນການແກ້ໄຂຕ້ອງບໍ່ເກີນ 1000 ຕົວອັກສອນ')
    }

    // Validate account fields - both must be provided together or not at all
    const hasDebitAccount = editForm.value.glsub_id !== null && editForm.value.glsub_id !== undefined && editForm.value.glsub_id !== ''
    const hasCreditAccount = editForm.value.relative_glsub_id !== null && editForm.value.relative_glsub_id !== undefined && editForm.value.relative_glsub_id !== ''
    
    console.log('Account validation:')
    console.log('- glsub_id:', editForm.value.glsub_id, 'Type:', typeof editForm.value.glsub_id, 'Has:', hasDebitAccount)
    console.log('- relative_glsub_id:', editForm.value.relative_glsub_id, 'Type:', typeof editForm.value.relative_glsub_id, 'Has:', hasCreditAccount)
    
    if (hasDebitAccount !== hasCreditAccount) {
      throw new Error('ກະລຸນາເລືອກທັງບັນຊີ Debit ແລະ Credit ພ້ອມກັນ ຫຼື ບໍ່ເລືອກເລີຍ')
    }

    // Prepare request data according to backend function
    const requestData = {
      Reference_sub_No: editForm.value.Reference_sub_No,
      comments: editForm.value.comments.trim(),
      Fcy_Amount: parseFloat(editForm.value.Fcy_Amount)
    }

    // Add optional fields only if they have values
    if (editForm.value.Addl_text && editForm.value.Addl_text.trim()) {
      requestData.Addl_text = editForm.value.Addl_text.trim()
    }

    if (editForm.value.Addl_sub_text && editForm.value.Addl_sub_text.trim()) {
      requestData.Addl_sub_text = editForm.value.Addl_sub_text.trim()
    }

    // Add account fields if both are selected - with STRICT validation
    if (hasDebitAccount && hasCreditAccount) {
      // Convert to numbers and validate they are actually numbers
      const debitId = Number(editForm.value.glsub_id)
      const creditId = Number(editForm.value.relative_glsub_id)
      
      console.log('Converting account IDs:')
      console.log('- Original glsub_id:', editForm.value.glsub_id, '→ Number:', debitId, 'IsNaN:', isNaN(debitId))
      console.log('- Original relative_glsub_id:', editForm.value.relative_glsub_id, '→ Number:', creditId, 'IsNaN:', isNaN(creditId))
      
      if (isNaN(debitId) || isNaN(creditId) || debitId <= 0 || creditId <= 0) {
        throw new Error('ລະບຸບັນຊີບໍ່ຖືກຕ້ອງ - ກະລຸນາເລືອກບັນຊີໃໝ່')
      }
      
      // Make sure we're sending integers, not floats
      requestData.glsub_id = Math.floor(debitId)
      requestData.relative_glsub_id = Math.floor(creditId)
      
      // Double-check the final values
      console.log('Final account IDs being sent:')
      console.log('- glsub_id:', requestData.glsub_id, 'Type:', typeof requestData.glsub_id, 'Is Integer:', Number.isInteger(requestData.glsub_id))
      console.log('- relative_glsub_id:', requestData.relative_glsub_id, 'Type:', typeof requestData.relative_glsub_id, 'Is Integer:', Number.isInteger(requestData.relative_glsub_id))
    }

    console.log('Final request data:', requestData)
    console.log('Request data types:')
    Object.entries(requestData).forEach(([key, value]) => {
      console.log(`- ${key}:`, value, 'Type:', typeof value)
    })

    console.log('Calling API: POST /api/journal-entries/fix-rejected/')
    console.log('Full request details:', {
      url: `${API_BASE_URL}/api/journal-entries/fix-rejected/`,
      method: 'POST',
      headers: getAuthHeaders().headers,
      data: requestData
    })
    
    // Also check JSON serialization
    console.log('JSON serialized data:', JSON.stringify(requestData))
    console.log('JSON parsed back:', JSON.parse(JSON.stringify(requestData)))

    const response = await axios.post(`${API_BASE_URL}/api/journal-entries/fix-rejected/`, requestData, getAuthHeaders())

    console.log('API Response:', response.data)

    // Success notification
    Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      html: `
        <div class="text-left">
          <p><strong>ແກ້ໄຂບັນທຶກຄູ່ສຳເລັດແລ້ວ!</strong></p>
          <hr class="my-2">
          <p><small>• ອັດເດດສະຖານະຈາກ 'P' ເປັນ 'U'</small></p>
          <p><small>• ບັນທຶກເຫດຜົນການແກ້ໄຂແລ້ວ</small></p>
          ${requestData.glsub_id ? '<p><small>• ອັດເດດບັນຊີແລ້ວ</small></p>' : ''}
        </div>
      `,
      timer: 3000,
      showConfirmButton: false
    })

    // Close dialog and reload data
    closeEditDialog()
    await loadData()

    console.log('=== END FIX REJECTED DEBUG ===')

  } catch (error) {
    console.error('=== ERROR FIXING REJECTED ENTRY ===')
    console.error('Error object:', error)
    console.error('Error response:', error.response)
    
    let errorMessage = 'ບໍ່ສາມາດແກ້ໄຂບັນທຶກຄູ່ໄດ້'
    
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data
      
      console.error('Response status:', status)
      console.error('Response headers:', error.response.headers)
      console.error('Response data:', errorData)
      console.error('Full response:', error.response)
      
      if (status === 404) {
        errorMessage = 'ບໍ່ພົບບັນທຶກທີ່ຕ້ອງການແກ້ໄຂ ຫຼື ສະຖານະບໍ່ແມ່ນ P'
      } else if (status === 400) {
        if (errorData?.detail?.includes('glsub_id')) {
          errorMessage = `ບັນຊີທີ່ເລືອກບໍ່ຖືກຕ້ອງ: ${errorData.detail}`
        } else if (errorData?.detail?.includes('Comments')) {
          errorMessage = 'ເຫດຜົນການແກ້ໄຂບໍ່ຖືກຕ້ອງ'
        } else if (errorData?.detail?.includes('Fcy_Amount')) {
          errorMessage = 'ຈຳນວນເງິນບໍ່ຖືກຕ້ອງ'
        } else {
          errorMessage = errorData?.detail || 'ຂໍ້ມູນບໍ່ຖືກຕ້ອງ'
        }
      } else if (errorData?.detail) {
        errorMessage = errorData.detail
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    
    console.error('Final error message:', errorMessage)
    
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
      await axios.patch(`/api/journal-log-master/${item.JRNLLog_id}/`, {
        Auth_Status: 'A',
        Checker_Id: localStorage.getItem('userId'),
        Checker_DT_Stamp: new Date().toISOString()
      }, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ອະນຸມັດລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      // Reload data or navigate back
      await loadData()
      
    } catch (error) {
      console.error('Error approving item:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດອະນຸມັດລາຍການໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

// Reject item
const rejectItem = async (item) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'ຢືນຢັນການປະຕິເສດ',
    text: `ທ່ານຕ້ອງການປະຕິເສດລາຍການ ${item.Reference_No} ແທ້ບໍ?`,
    input: 'textarea',
    inputLabel: 'ເຫດຜົນໃນການປະຕິເສດ',
    inputPlaceholder: 'ກະລຸນາໃສ່ເຫດຜົນ...',
    inputValidator: (value) => {
      if (!value) {
        return 'ກະລຸນາໃສ່ເຫດຜົນໃນການປະຕິເສດ!'
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
      await axios.patch(`/api/journal-log-master/${item.JRNLLog_id}/`, {
        Auth_Status: 'R',
        Checker_Id: localStorage.getItem('userId'),
        Checker_DT_Stamp: new Date().toISOString(),
        Addl_text: item.Addl_text + '\nເຫດຜົນປະຕິເສດ: ' + result.value
      }, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: 'ປະຕິເສດລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      // Reload data
      await loadData()
      
    } catch (error) {
      console.error('Error rejecting item:', error)
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດປະຕິເສດລາຍການໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  }
}

// Lifecycle
onMounted(() => {
  console.log('Detail page mounted with query:', route.query)
  console.log('Reference_No:', referenceNo.value)
  
  loadModules()
  loadAccounts()
  if (referenceNo.value) {
    loadData()
  } else {
    error.value = 'ບໍ່ພົບພາລາມິເຕີ Reference_No ໃນ URL - ກະລຸນາກວດສອບ URL'
  }
})

// Watch for changes in Reference_No query parameter
watch(() => route.query.Reference_No, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    loadData()
  }
}, { immediate: false })
</script>

<style scoped>
.gl-detail-page {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page header */
.page-header-compact {
  padding: 8px 0;
  margin-bottom: 16px;
}

.page-title-compact {
  font-size: 1.4rem;
  font-weight: 500;
  color: #1976d2;
  display: flex;
  align-items: center;
  margin: 0;
  line-height: 1.2;
}

/* Info grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  min-width: 120px;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-left: 12px;
}

/* Amount summary */
.amount-summary {
  display: flex;
  gap: 24px;
  justify-content: space-around;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.amount-item {
  text-align: center;
  flex: 1;
}

.amount-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1976d2;
}

/* Journal table */
.journal-table-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.journal-table {
  width: 100%;
  border-collapse: collapse;
}

.journal-table thead {
  background: #f5f5f5;
}

.journal-table th {
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
  padding: 12px 8px;
  border-bottom: 2px solid #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.journal-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 0.9rem;
}

.journal-table tbody tr:hover {
  background-color: #f9f9f9;
}

.journal-table tbody tr:last-child td {
  border-bottom: none;
}

.totals-row {
  background: #f8f9fa;
  font-weight: 700;
}

.totals-row td {
  padding: 12px 8px;
  font-size: 0.9rem;
  border-top: 2px solid #dee2e6;
}

/* Correction row styling */
.correction-row {
  background-color: #ffebee !important;
  border-left: 4px solid #f44336 !important;
}

.correction-row:hover {
  background-color: #ffcdd2 !important;
}

.correction-row td {
  color: #d32f2f;
}

.correction-row .v-chip {
  background-color: #ffcdd2 !important;
  border-color: #f44336 !important;
  color: #d32f2f !important;
}

/* Correction legend */
.correction-legend {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: #ffebee;
  border-radius: 4px;
  border: 1px solid #ffcdd2;
}

.correction-indicator {
  width: 12px;
  height: 12px;
  background-color: #f44336;
  border-radius: 2px;
}

/* Action buttons gap */
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

/* Edit dialog styles */
:deep(.v-dialog .v-card) {
  border-radius: 8px;
}

:deep(.v-form .v-field) {
  margin-bottom: 8px;
}

:deep(.v-textarea textarea) {
  line-height: 1.4;
}

:deep(.v-counter) {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .gl-detail-page {
    padding: 8px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .amount-summary {
    flex-direction: column;
    gap: 12px;
  }
  
  .journal-table-container {
    overflow-x: auto;
  }
  
  .journal-table th,
  .journal-table td {
    padding: 8px 4px;
    font-size: 0.8rem;
  }
  
  /* Stack action buttons vertically on mobile */
  .journal-table .d-flex.gap-1 {
    flex-direction: column;
    gap: 2px;
  }
  
  .journal-table .d-flex.gap-1 .v-btn {
    min-width: 28px;
    height: 24px;
  }
}
</style>