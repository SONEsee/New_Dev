<template>
  <div class="pa-6">
    <v-container fluid class="pa-0">
      <!-- Header Card -->
      <v-card
        elevation="12"
        rounded="xl"
        class="mb-8 pa-8 header-card"
        :style="{
          background: 'linear-gradient(135deg, #c58c20 0%, #616161 100%)',
          color: 'white'
        }"
      >
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <div class="d-flex align-center">
              <v-avatar size="72" class="mr-4 header-avatar" color="rgba(255,255,255,0.2)">
                <v-icon size="36" color="white">mdi-clipboard-check</v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold mb-1 header-title">ກວດສອບກ່ອນປິດບັນຊີ</h1>
                <p class="text-h6 opacity-90">Pre-EOD Validation Check</p>
              </div>
            </div>
          </v-col>
          <v-col cols="auto">
            <div class="d-flex align-center ga-4">
              <v-chip
                size="large"
                color="rgba(255,255,255,0.2)"
                variant="flat"
                prepend-icon="mdi-calendar"
                class="px-4 date-chip"
              >
                <span class="font-weight-bold">{{ selectedDate }}</span>
              </v-chip>
              <v-btn
                size="large"
                :color="canStartEOD ? 'success' : 'error'"
                variant="flat"
                :loading="isProcessing"
                :disabled="!canStartEOD"
                @click="startEODProcess"
                :prepend-icon="canStartEOD ? 'mdi-play-circle' : 'mdi-alert-circle'"
                class="font-weight-bold px-6 eod-button"
                rounded="xl"
                elevation="6"
              >
                {{ isProcessing ? 'ກຳລັງປະມວນຜົນ...' : (canStartEOD ? 'ສາມາດປິດບັນຊີໄດ້' : 'ບໍ່ສາມາດປິດບັນຊີໄດ້') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- Warning/Success Messages -->
      <v-expand-transition>
        <v-row v-if="!canStartEOD" class="mb-4">
          <v-col cols="12">
            <v-alert
              type="warning"
              variant="tonal"
              rounded="lg"
              prominent
              border="start"
              class="warning-alert"
            >
              <template v-slot:title>
                <strong>ບໍ່ສາມາດເລີ່ມການປິດບັນຊີໄດ້</strong>
              </template>
              <div class="mt-2">
                <p class="mb-2">ກະລຸນາແກ້ໄຂບັນຫາຕໍ່ໄປນີ້ກ່ອນ:</p>
                <ul class="ml-4">
                  <li v-for="issue in pendingIssues" :key="issue" class="mb-1">
                    • {{ issue }}
                  </li>
                </ul>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-expand-transition>

      <v-expand-transition>
        <v-row v-if="canStartEOD" class="mb-4">
          <v-col cols="12">
            <v-alert
              type="success"
              variant="tonal"
              rounded="lg"
              prominent
              border="start"
              class="success-alert"
            >
              <template v-slot:title>
                <strong>ພ້ອມສຳລັບການປິດບັນຊີ</strong>
              </template>
              <div class="mt-2">
                <p>ທຸກສິ່ງທຸກຢ່າງພ້ອມແລ້ວ ສາມາດເລີ່ມການປິດບັນຊີໄດ້</p>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-expand-transition>

      <!-- EOD Status History -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card elevation="8" rounded="xl" class="status-card">
            <v-card-title class="pa-6 pb-0">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-avatar size="56" color="primary-lighten-4" class="mr-3 section-avatar">
                    <v-icon color="primary-darken-2" size="28">mdi-history</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold section-title">ສະຖານະການປິດບັນຊີປະຈຳວັນ</h2>
                    <p class="text-body-2 text-medium-emphasis">End of Day Processing Status</p>
                  </div>
                </div>
                <div class="d-flex align-center ga-3">
                  <v-chip color="primary-lighten-4" variant="flat" size="small" class="record-chip">
                    {{ eodStatusHistory.length }} ບັນທຶກ
                  </v-chip>
                  <v-btn
                    :color="showEodDetails ? 'primary' : 'grey'"
                    :variant="showEodDetails ? 'flat' : 'outlined'"
                    size="small"
                    @click="toggleEodDetails"
                    :prepend-icon="showEodDetails ? 'mdi-eye-off' : 'mdi-eye'"
                    rounded="lg"
                    class="toggle-button"
                  >
                    {{ showEodDetails ? 'ເຊື່ອງລາຍລະອຽດ' : 'ເບິ່ງລາຍລະອຽດ' }}
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <v-expand-transition>
                <div v-show="showEodDetails">
                  <v-data-table
                    :headers="eodStatusHeaders"
                    :items="eodStatusHistory"
                    class="elevation-2 rounded-lg data-table"
                    hide-default-footer
                    no-data-text="ບໍ່ມີປະຫວັດການປິດບັນຊີ"
                    item-value="id"
                  >
                    <template v-slot:item.status="{ item }">
                      <v-chip
                        :color="getEODStatusColor(item.status)"
                        :prepend-icon="getEODStatusIcon(item.status)"
                        variant="flat"
                        size="small"
                        class="status-chip"
                      >
                        {{ getEODStatusText(item.status) }}
                      </v-chip>
                    </template>
                    <template v-slot:item.start_time="{ item }">
                      <span v-if="item.start_time" class="time-text">{{ item.start_time }}</span>
                      <span v-else class="text-medium-emphasis">-</span>
                    </template>
                    <template v-slot:item.end_time="{ item }">
                      <span v-if="item.end_time" class="time-text">{{ item.end_time }}</span>
                      <span v-else class="text-medium-emphasis">-</span>
                    </template>
                    <template v-slot:item.duration="{ item }">
                      <span v-if="item.duration" class="duration-text">{{ item.duration }}</span>
                      <span v-else class="text-medium-emphasis">-</span>
                    </template>
                    <template v-slot:item.total_transactions="{ item }">
                      <span v-if="item.total_transactions" class="number-text">{{ formatNumber(item.total_transactions) }}</span>
                      <span v-else class="text-medium-emphasis">-</span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn
                        v-if="item.error_message"
                        color="error"
                        variant="text"
                        size="small"
                        icon="mdi-alert-circle-outline"
                        @click="showErrorDialog(item)"
                        title="ເບິ່ງຂໍ້ຜິດພາດ"
                        class="action-button"
                      ></v-btn>
                      <v-btn
                        v-else-if="item.status === 'completed'"
                        color="primary"
                        variant="text"
                        size="small"
                        icon="mdi-information-outline"
                        @click="showDetailDialog(item)"
                        title="ເບິ່ງລາຍລະອຽດ"
                        class="action-button"
                      ></v-btn>
                      <span v-else class="text-medium-emphasis">-</span>
                    </template>
                  </v-data-table>
                </div>
              </v-expand-transition>
              
              <!-- Summary when collapsed -->
              <v-expand-transition>
                <div v-show="!showEodDetails" class="text-center py-6">
                  <div class="d-flex justify-center align-center ga-12">
                    <div class="text-center summary-item">
                      <v-chip color="success" variant="flat" size="x-large" class="mb-3 summary-chip">
                        {{ completedCount }}
                      </v-chip>
                      <p class="text-body-1 font-weight-medium">ສຳເລັດ</p>
                    </div>
                    <div class="text-center summary-item">
                      <v-chip color="error" variant="flat" size="x-large" class="mb-3 summary-chip">
                        {{ failedCount }}
                      </v-chip>
                      <p class="text-body-1 font-weight-medium">ລົ້ມເຫລວ</p>
                    </div>
                    <div class="text-center summary-item">
                      <v-chip color="warning" variant="flat" size="x-large" class="mb-3 summary-chip">
                        {{ pendingCount }}
                      </v-chip>
                      <p class="text-body-1 font-weight-medium">ລໍຖ້າ</p>
                    </div>
                  </div>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Validation Tables -->
      <v-row>
        <!-- Pending Approvals -->
        <v-col cols="12" lg="6">
          <v-card 
            elevation="6" 
            rounded="xl" 
            class="h-100 validation-card" 
            :color="hasPendingApprovals ? 'error-lighten-5' : 'success-lighten-5'"
          >
            <v-card-title class="pa-6 pb-0">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-avatar 
                    size="56" 
                    :color="hasPendingApprovals ? 'error-lighten-4' : 'success-lighten-4'" 
                    class="mr-3 section-avatar"
                  >
                    <v-icon :color="hasPendingApprovals ? 'error-darken-2' : 'success-darken-2'" size="28">
                      {{ hasPendingApprovals ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold section-title">ຕັ້ງຄ່າທີ່ຍັງບໍ່ໄດ້ອະນຸມັດ</h2>
                    <p class="text-body-2 text-medium-emphasis">Pending Settings Approval</p>
                  </div>
                </div>
                <div class="d-flex align-center ga-3">
                  <v-chip 
                    :color="hasPendingApprovals ? 'error' : 'success'" 
                    variant="flat" 
                    size="small"
                    :prepend-icon="hasPendingApprovals ? 'mdi-alert' : 'mdi-check'"
                    class="count-chip"
                  >
                    {{ pendingApprovalsCount }} ລາຍການ
                  </v-chip>
                  <v-btn
                    :color="showApprovalDetails ? 'primary' : 'grey'"
                    :variant="showApprovalDetails ? 'flat' : 'outlined'"
                    size="small"
                    @click="toggleApprovalDetails"
                    :prepend-icon="showApprovalDetails ? 'mdi-eye-off' : 'mdi-eye'"
                    rounded="lg"
                    class="toggle-button"
                  >
                    {{ showApprovalDetails ? 'ເຊື່ອງ' : 'ເບິ່ງ' }}
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <v-expand-transition>
                <div v-show="showApprovalDetails">
                  <v-data-table
                    :headers="pendingApprovalHeaders"
                    :items="pendingApprovals"
                    class="elevation-2 rounded-lg data-table"
                    hide-default-footer
                    no-data-text="ບໍ່ມີຂໍ້ມູນທີ່ລໍຖ້າອະນຸມັດ"
                  >
                    <template v-slot:item.status="{ item }">
                      <v-chip
                        :color="getStatusColor(item.status)"
                        :prepend-icon="getStatusIcon(item.status)"
                        variant="flat"
                        size="small"
                        class="status-chip"
                      >
                        {{ item.status === 'pending' ? 'ລໍຖ້າອະນຸມັດ' : 'ອະນຸມັດແລ້ວ' }}
                      </v-chip>
                    </template>
                  </v-data-table>
                </div>
              </v-expand-transition>
              <v-expand-transition>
                <div v-show="!showApprovalDetails" class="text-center py-4">
                  <v-icon :color="hasPendingApprovals ? 'error' : 'success'" size="48" class="mb-2">
                    {{ hasPendingApprovals ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                  </v-icon>
                  <p class="text-h6 font-weight-medium">
                    {{ hasPendingApprovals ? `${pendingApprovalsCount} ລາຍການລໍຖ້າອະນຸມັດ` : 'ທັງໝົດອະນຸມັດແລ້ວ' }}
                  </p>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Pending Journals -->
        <v-col cols="12" lg="6">
          <v-card 
            elevation="6" 
            rounded="xl" 
            class="h-100 validation-card" 
            :color="hasPendingJournals ? 'error-lighten-5' : 'success-lighten-5'"
          >
            <v-card-title class="pa-6 pb-0">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-avatar 
                    size="56" 
                    :color="hasPendingJournals ? 'error-lighten-4' : 'success-lighten-4'" 
                    class="mr-3 section-avatar"
                  >
                    <v-icon :color="hasPendingJournals ? 'error-darken-2' : 'success-darken-2'" size="28">
                      {{ hasPendingJournals ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold section-title">ລາຍການບັນຊີທີ່ຍັງບໍ່ໄດ້ອະນຸມັດ</h2>
                    <p class="text-body-2 text-medium-emphasis">Pending Journal Approval</p>
                  </div>
                </div>
                <div class="d-flex align-center ga-3">
                  <v-chip 
                    :color="hasPendingJournals ? 'error' : 'success'" 
                    variant="flat" 
                    size="small"
                    :prepend-icon="hasPendingJournals ? 'mdi-alert' : 'mdi-check'"
                    class="count-chip"
                  >
                    {{ pendingJournalsCount }} ລາຍການ
                  </v-chip>
                  <v-btn
                    :color="showJournalDetails ? 'primary' : 'grey'"
                    :variant="showJournalDetails ? 'flat' : 'outlined'"
                    size="small"
                    @click="toggleJournalDetails"
                    :prepend-icon="showJournalDetails ? 'mdi-eye-off' : 'mdi-eye'"
                    rounded="lg"
                    class="toggle-button"
                  >
                    {{ showJournalDetails ? 'ເຊື່ອງ' : 'ເບິ່ງ' }}
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <v-expand-transition>
                <div v-show="showJournalDetails">
                  <v-data-table
                    :headers="pendingJournalHeaders"
                    :items="pendingJournals"
                    class="elevation-2 rounded-lg data-table"
                    hide-default-footer
                    no-data-text="ບໍ່ມີລາຍການທີ່ລໍຖ້າອະນຸມັດ"
                  >
                    <template v-slot:item.amount="{ item }">
                      <span class="font-weight-medium number-text">{{ formatNumber(item.amount) }}</span>
                    </template>
                    <template v-slot:item.status="{ item }">
                      <v-chip
                        :color="getStatusColor(item.status)"
                        :prepend-icon="getStatusIcon(item.status)"
                        variant="flat"
                        size="small"
                        class="status-chip"
                      >
                        {{ item.status === 'pending' ? 'ລໍຖ້າອະນຸມັດ' : 'ອະນຸມັດແລ້ວ' }}
                      </v-chip>
                    </template>
                  </v-data-table>
                </div>
              </v-expand-transition>
              <v-expand-transition>
                <div v-show="!showJournalDetails" class="text-center py-4">
                  <v-icon :color="hasPendingJournals ? 'error' : 'success'" size="48" class="mb-2">
                    {{ hasPendingJournals ? 'mdi-alert-circle' : 'mdi-check-circle' }}
                  </v-icon>
                  <p class="text-h6 font-weight-medium">
                    {{ hasPendingJournals ? `${pendingJournalsCount} ລາຍການລໍຖ້າອະນຸມັດ` : 'ທັງໝົດອະນຸມັດແລ້ວ' }}
                  </p>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Active Users -->
        <v-col cols="12">
          <v-card 
            elevation="6" 
            rounded="xl" 
            class="validation-card"
            :color="hasOtherActiveUsers ? 'error-lighten-5' : 'success-lighten-5'"
          >
            <v-card-title class="pa-6 pb-0">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-avatar 
                    size="56" 
                    :color="hasOtherActiveUsers ? 'error-lighten-4' : 'success-lighten-4'" 
                    class="mr-3 section-avatar"
                  >
                    <v-icon :color="hasOtherActiveUsers ? 'error-darken-2' : 'success-darken-2'" size="28">
                      {{ hasOtherActiveUsers ? 'mdi-account-alert' : 'mdi-account-check' }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold section-title">ຜູ້ໃຊ້ທີ່ເຂົ້າໃຊ້ລະບົບຢູ່</h2>
                    <p class="text-body-2 text-medium-emphasis">Active Users in System</p>
                  </div>
                </div>
                <div class="d-flex align-center ga-3">
                  <v-chip 
                    :color="hasOtherActiveUsers ? 'error' : 'success'" 
                    variant="flat" 
                    size="small"
                    :prepend-icon="hasOtherActiveUsers ? 'mdi-alert' : 'mdi-check'"
                    class="count-chip"
                  >
                    {{ activeUsersCount }} ຄົນ
                  </v-chip>
                  <v-btn
                    v-if="hasOtherActiveUsers"
                    color="warning"
                    variant="flat"
                    size="small"
                    @click="kickAllUsers"
                    prepend-icon="mdi-account-remove"
                    rounded="lg"
                    class="kick-button"
                  >
                    ເຄື່ອນທຸກຄົນອອກ
                  </v-btn>
                  <v-btn
                    :color="showUserDetails ? 'primary' : 'grey'"
                    :variant="showUserDetails ? 'flat' : 'outlined'"
                    size="small"
                    @click="toggleUserDetails"
                    :prepend-icon="showUserDetails ? 'mdi-eye-off' : 'mdi-eye'"
                    rounded="lg"
                    class="toggle-button"
                  >
                    {{ showUserDetails ? 'ເຊື່ອງ' : 'ເບິ່ງ' }}
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <v-expand-transition>
                <div v-show="showUserDetails">
                  <v-data-table
                    :headers="activeUserHeaders"
                    :items="activeUsers"
                    class="elevation-2 rounded-lg data-table"
                    hide-default-footer
                    no-data-text="ບໍ່ມີຜູ້ໃຊ້ເຂົ້າໃຊ້ລະບົບ"
                  >
                    <template v-slot:item.status="{ item }">
                      <v-chip
                        :color="item.status === 'online' ? 'success' : 'warning'"
                        :prepend-icon="item.status === 'online' ? 'mdi-circle' : 'mdi-circle-outline'"
                        variant="flat"
                        size="small"
                        class="status-chip"
                      >
                        {{ item.status === 'online' ? 'ອອນລາຍ' : 'ຢຸດຊົ່ວຄາວ' }}
                      </v-chip>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-btn
                        v-if="item.user_id !== currentUser"
                        color="error"
                        variant="text"
                        size="small"
                        icon="mdi-logout"
                        @click="kickUser(item.user_id)"
                        title="ເຄື່ອນຜູ້ໃຊ້ອອກ"
                        class="action-button"
                      ></v-btn>
                      <v-chip v-else color="primary" variant="flat" size="small">
                        ຕົວເອງ
                      </v-chip>
                    </template>
                  </v-data-table>
                </div>
              </v-expand-transition>
              <v-expand-transition>
                <div v-show="!showUserDetails" class="text-center py-4">
                  <v-icon :color="hasOtherActiveUsers ? 'error' : 'success'" size="48" class="mb-2">
                    {{ hasOtherActiveUsers ? 'mdi-account-alert' : 'mdi-account-check' }}
                  </v-icon>
                  <p class="text-h6 font-weight-medium">
                    {{ hasOtherActiveUsers ? `${activeUsersCount} ຄົນກຳລັງໃຊ້ລະບົບ` : 'ບໍ່ມີຜູ້ໃຊ້ອື່ນໃນລະບົບ' }}
                  </p>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Footer Actions -->
      <v-card elevation="6" rounded="xl" class="mt-8 pa-6 footer-card">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="grey-darken-1" class="mr-2">mdi-clock-outline</v-icon>
            <span class="text-body-2 text-medium-emphasis">
              ອັບເດດຄັ້ງສຸດທ້າຍ: {{ lastUpdate }}
            </span>
          </div>
          <div class="d-flex ga-3">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-refresh"
              rounded="lg"
              @click="refreshData"
              class="refresh-button"
            >
              ອັບເດດຂໍ້ມູນ
            </v-btn>
            <v-btn
              v-if="canStartEOD"
              color="success"
              variant="flat"
              prepend-icon="mdi-arrow-right"
              rounded="lg"
              @click="proceedToEOD"
              class="proceed-button"
              elevation="4"
            >
              ໄປປິດບັນຊີ
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// Types
interface EODStatus {
  id: number
  process_date: string
  status: 'completed' | 'in_progress' | 'failed' | 'pending'
  start_time?: string
  end_time?: string
  user: string
  duration?: string
  total_transactions?: number
  error_message?: string
}

interface PendingJournal {
  id: number
  journal_no: string
  amount: number
  currency: string
  date: string
  user: string
  status: 'pending' | 'approved'
}

interface ActiveUser {
  id: number
  user_id: string
  user_name: string
  login_time: string
  last_activity: string
  ip_address: string
  status: 'online' | 'idle'
}

// Reactive data
const selectedDate = ref('27/04/2022')
const isProcessing = ref(false)
const lastUpdate = ref(new Date().toLocaleString('lo-LA'))
const currentUser = ref('ADMIN')
const showEodDetails = ref(false)
const showApprovalDetails = ref(false)
const showJournalDetails = ref(false)
const showUserDetails = ref(false)

// Sample data
const eodStatusHistory = ref<EODStatus[]>([
  { 
    id: 1, 
    process_date: '26/04/2022', 
    status: 'completed', 
    start_time: '18:00', 
    end_time: '18:45', 
    user: 'ADMIN',
    duration: '45 ນາທີ',
    total_transactions: 1250
  },
  { 
    id: 2, 
    process_date: '25/04/2022', 
    status: 'completed', 
    start_time: '18:15', 
    end_time: '19:02', 
    user: 'ADMIN',
    duration: '47 ນາທີ',
    total_transactions: 1180
  },
  { 
    id: 3, 
    process_date: '24/04/2022', 
    status: 'failed', 
    start_time: '18:00', 
    end_time: '18:30', 
    user: 'USER01',
    duration: '30 ນາທີ',
    total_transactions: 0,
    error_message: 'ມີຜູ້ໃຊ້ຍັງເຂົ້າໃຊ້ລະບົບຢູ່'
  },
  { 
    id: 4, 
    process_date: '27/04/2022', 
    status: 'pending', 
    user: 'ADMIN'
  }
])

const pendingApprovals = ref<PendingApproval[]>([
  { id: 1, table_name: 'ຕັ້ງຄ່າອັດຕາດອກເບຍ', record_count: 3, last_update: '27/04/2022 14:30', status: 'pending' },
  { id: 2, table_name: 'ຕັ້ງຄ່າຄ່າທຳນຽມ', record_count: 1, last_update: '27/04/2022 15:20', status: 'pending' }
])

const pendingJournals = ref<PendingJournal[]>([
  { id: 1, journal_no: 'JV202204270001', amount: 1500000, currency: 'LAK', date: '27/04/2022', user: 'USER01', status: 'pending' },
  { id: 2, journal_no: 'JV202204270002', amount: 500000, currency: 'LAK', date: '27/04/2022', user: 'USER02', status: 'pending' }
])

const activeUsers = ref<ActiveUser[]>([
  { id: 1, user_id: 'USER01', user_name: 'ນາງສອນ ວົງສີ', login_time: '08:30', last_activity: '16:45', ip_address: '192.168.1.101', status: 'online' },
  { id: 2, user_id: 'USER02', user_name: 'ທ້າວບຸນມີ ລາວົງ', login_time: '09:00', last_activity: '16:30', ip_address: '192.168.1.102', status: 'idle' },
  { id: 3, user_id: 'ADMIN', user_name: 'Administrator', login_time: '07:00', last_activity: '16:50', ip_address: '192.168.1.100', status: 'online' }
])

// Table headers
const eodStatusHeaders = [
  { title: 'ລຳດັບ', key: 'id', width: '80px' },
  { title: 'ວັນທີປະມວນຜົນ', key: 'process_date', width: '120px' },
  { title: 'ສະຖານະ', key: 'status', width: '120px' },
  { title: 'ເວລາເລີ່ມ', key: 'start_time', width: '100px' },
  { title: 'ເວລາສິ້ນສຸດ', key: 'end_time', width: '100px' },
  { title: 'ໄລຍະເວລາ', key: 'duration', width: '100px' },
  { title: 'ຜູ້ປະມວນຜົນ', key: 'user', width: '120px' },
  { title: 'ຈຳນວນລາຍການ', key: 'total_transactions', width: '120px' },
  { title: 'ລາຍລະອຽດ', key: 'actions', width: '100px', sortable: false }
]

const pendingApprovalHeaders = [
  { title: 'ລຳດັບ', key: 'id', width: '80px' },
  { title: 'ຕາຕະລາງ', key: 'table_name' },
  { title: 'ຈຳນວນ', key: 'record_count', width: '100px' },
  { title: 'ວັນທີອັບເດດ', key: 'last_update', width: '150px' },
  { title: 'ສະຖານະ', key: 'status', width: '120px' }
]

const pendingJournalHeaders = [
  { title: 'ລຳດັບ', key: 'id', width: '80px' },
  { title: 'ເລກທີລາຍການ', key: 'journal_no' },
  { title: 'ຈຳນວນເງິນ', key: 'amount', width: '120px' },
  { title: 'ສະກຸນເງິນ', key: 'currency', width: '80px' },
  { title: 'ວັນທີ', key: 'date', width: '120px' },
  { title: 'ຜູ້ບັນທຶກ', key: 'user', width: '100px' },
  { title: 'ສະຖານະ', key: 'status', width: '120px' }
]

const activeUserHeaders = [
  { title: 'ລຳດັບ', key: 'id', width: '80px' },
  { title: 'ລະຫັດຜູ້ໃຊ້', key: 'user_id', width: '100px' },
  { title: 'ຊື່ຜູ້ໃຊ້', key: 'user_name' },
  { title: 'ເວລາເຂົ້າ', key: 'login_time', width: '100px' },
  { title: 'ກິດຈະກຳສຸດທ້າຍ', key: 'last_activity', width: '120px' },
  { title: 'IP Address', key: 'ip_address', width: '120px' },
  { title: 'ສະຖານະ', key: 'status', width: '100px' },
  { title: 'ການດຳເນີນການ', key: 'actions', width: '100px', sortable: false }
]

// Computed properties
const canStartEOD = computed((): boolean => {
  const hasPendingApprovals = pendingApprovals.value.some(item => item.status === 'pending')
  const hasPendingJournals = pendingJournals.value.some(item => item.status === 'pending')
  const hasOtherActiveUsers = activeUsers.value.some(user => 
    user.user_id !== currentUser.value && user.status === 'online'
  )
  
  return !hasPendingApprovals && !hasPendingJournals && !hasOtherActiveUsers
})

const pendingIssues = computed(() => {
  const issues = []
  if (pendingApprovals.value.some(item => item.status === 'pending')) {
    issues.push('ມີຕັ້ງຄ່າທີ່ຍັງບໍ່ໄດ້ອະນຸມັດ')
  }
  if (pendingJournals.value.some(item => item.status === 'pending')) {
    issues.push('ມີລາຍການບັນຊີທີ່ຍັງບໍ່ໄດ້ອະນຸມັດ')
  }
  if (activeUsers.value.some(user => user.user_id !== currentUser.value && user.status === 'online')) {
    issues.push('ມີຜູ້ໃຊ້ອື່ນທີ່ຍັງເຂົ້າໃຊ້ລະບົບຢູ່')
  }
  return issues
})

const hasPendingApprovals = computed(() => {
  return pendingApprovals.value.some(item => item.status === 'pending')
})

const hasPendingJournals = computed(() => {
  return pendingJournals.value.some(item => item.status === 'pending')
})

const hasOtherActiveUsers = computed(() => {
  return activeUsers.value.some(user => user.user_id !== currentUser.value && user.status === 'online')
})

const pendingApprovalsCount = computed(() => {
  return pendingApprovals.value.filter(item => item.status === 'pending').length
})

const pendingJournalsCount = computed(() => {
  return pendingJournals.value.filter(item => item.status === 'pending').length
})

const activeUsersCount = computed(() => {
  return activeUsers.value.filter(user => user.status === 'online').length
})

const completedCount = computed(() => {
  return eodStatusHistory.value.filter(item => item.status === 'completed').length
})

const failedCount = computed(() => {
  return eodStatusHistory.value.filter(item => item.status === 'failed').length
})

const pendingCount = computed(() => {
  return eodStatusHistory.value.filter(item => item.status === 'pending').length
})

// Methods
const getEODStatusColor = (status: string): string => {
  switch(status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'info'
    case 'failed':
      return 'error'
    case 'pending':
      return 'warning'
    default:
      return 'grey'
  }
}

const getEODStatusIcon = (status: string): string => {
  switch(status) {
    case 'completed':
      return 'mdi-check-circle'
    case 'in_progress':
      return 'mdi-loading'
    case 'failed':
      return 'mdi-alert-circle'
    case 'pending':
      return 'mdi-clock-outline'
    default:
      return 'mdi-help-circle'
  }
}

const getEODStatusText = (status: string): string => {
  switch(status) {
    case 'completed':
      return 'ສຳເລັດ'
    case 'in_progress':
      return 'ກຳລັງປະມວນຜົນ'
    case 'failed':
      return 'ລົ້ມເຫລວ'
    case 'pending':
      return 'ລໍຖ້າປະມວນຜົນ'
    default:
      return 'ບໍ່ຮູ້ສະຖານະ'
  }
}

const getStatusColor = (status: string): string => {
  switch(status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    default:
      return 'grey'
  }
}

const getStatusIcon = (status: string): string => {
  switch(status) {
    case 'approved':
      return 'mdi-check-circle'
    case 'pending':
      return 'mdi-clock-outline'
    default:
      return 'mdi-help-circle'
  }
}

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('lo-LA').format(num)
}

const toggleEodDetails = (): void => {
  showEodDetails.value = !showEodDetails.value
}

const toggleApprovalDetails = (): void => {
  showApprovalDetails.value = !showApprovalDetails.value
}

const toggleJournalDetails = (): void => {
  showJournalDetails.value = !showJournalDetails.value
}

const toggleUserDetails = (): void => {
  showUserDetails.value = !showUserDetails.value
}

const kickUser = async (userId: string): Promise<void> => {
  try {
    // Simulate API call to kick user
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Remove user from active users list
    activeUsers.value = activeUsers.value.filter(user => user.user_id !== userId)
    
    console.log(`Kicked user: ${userId}`)
  } catch (error) {
    console.error('Error kicking user:', error)
  }
}

const kickAllUsers = async (): Promise<void> => {
  try {
    const usersToKick = activeUsers.value.filter(user => user.user_id !== currentUser.value)
    
    for (const user of usersToKick) {
      await kickUser(user.user_id)
    }
    
    console.log('All users kicked successfully')
  } catch (error) {
    console.error('Error kicking all users:', error)
  }
}

const startEODProcess = async (): Promise<void> => {
  if (!canStartEOD.value) {
    console.warn('Cannot start EOD process - validation failed')
    return
  }
  
  isProcessing.value = true
  try {
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    lastUpdate.value = new Date().toLocaleString('lo-LA')
  } catch (error) {
    console.error('Validation failed:', error)
  } finally {
    isProcessing.value = false
  }
}

const refreshData = async (): Promise<void> => {
  try {
    // Simulate API call to refresh data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    lastUpdate.value = new Date().toLocaleString('lo-LA')
    console.log('Data refreshed')
  } catch (error) {
    console.error('Error refreshing data:', error)
  }
}

const proceedToEOD = (): void => {
  // Navigate to EOD processing page
  console.log('Proceeding to EOD process')
}

const showErrorDialog = (item: EODStatus): void => {
  console.log('Show error dialog for:', item)
  // Show error details dialog
}

const showDetailDialog = (item: EODStatus): void => {
  console.log('Show detail dialog for:', item)
  // Show success details dialog
}
</script>

<style scoped>
/* Import Noto Sans Lao font */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@100;200;300;400;500;600;700;800;900&display=swap');

/* Apply font to all elements */
* {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

/* Header styling */
.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 50px rgba(102, 126, 234, 0.4) !important;
}

.header-avatar {
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.header-title {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.date-chip {
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.eod-button {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.eod-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

/* Alert styling */
.warning-alert, .success-alert {
  border-left: 6px solid;
  backdrop-filter: blur(5px);
}

/* Card styling */
.status-card, .validation-card, .footer-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.status-card:hover, .validation-card:hover, .footer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
}

.section-avatar {
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.2;
}

/* Button styling */
.toggle-button, .refresh-button, .proceed-button, .kick-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
}

.toggle-button:hover, .refresh-button:hover, .proceed-button:hover, .kick-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.action-button {
  transition: all 0.15s ease;
}

.action-button:hover {
  transform: scale(1.1);
}

/* Chip styling */
.status-chip, .count-chip, .record-chip, .summary-chip {
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.summary-chip {
  font-size: 1.1rem !important;
  height: 40px !important;
  min-width: 60px !important;
}

.summary-item {
  transition: all 0.2s ease;
}

.summary-item:hover {
  transform: translateY(-2px);
}

/* Data table styling */
.data-table {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.data-table :deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  background-color: rgba(0, 0, 0, 0.02);
  font-weight: 700;
  color: rgba(0, 0, 0, 0.8);
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.data-table :deep(.v-table > .v-table__wrapper > table > tbody > tr > td) {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.data-table :deep(.v-table > .v-table__wrapper > table > tbody > tr:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Text styling */
.time-text, .duration-text, .number-text {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

/* Transition styling */
.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ensure Lao text renders properly */
:deep(.v-data-table__wrapper) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

:deep(.v-table) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

:deep(.v-table > .v-table__wrapper > table) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td),
:deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

:deep(.v-btn) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

:deep(.v-chip) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

:deep(.v-alert) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

:deep(.v-card-title) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

:deep(.v-card-text) {
  font-family: 'Noto Sans Lao', sans-serif !important;
}

/* Responsive design */
@media (max-width: 960px) {
  .header-card .v-row {
    flex-direction: column;
    gap: 20px;
  }
  
  .section-avatar {
    margin-right: 12px !important;
  }
  
  .summary-item {
    margin-bottom: 16px;
  }
}

/* Custom scrollbar */
:deep(.v-data-table__wrapper)::-webkit-scrollbar {
  height: 8px;
}

:deep(.v-data-table__wrapper)::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

:deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

:deep(.v-data-table__wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>