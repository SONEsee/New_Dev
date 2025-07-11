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
                <h1 class="text-h3 font-weight-bold mb-1 header-title">ການກວດສອບກ່ອນປິດບັນຊີ</h1>
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
                {{ getEODButtonText() }}
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

      <!-- Working Day Status -->
      <v-expand-transition>
        <v-row v-if="!isWorkingDay" class="mb-4">
          <v-col cols="12">
            <v-alert
              type="error"
              variant="tonal"
              rounded="lg"
              prominent
              border="start"
              class="working-day-alert"
            >
              <template v-slot:title>
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-calendar-remove</v-icon>
                  <strong>ບໍ່ສາມາດປິດບັນຊີໄດ້</strong>
                </div>
              </template>
              <div class="mt-2">
                <p>{{ workingDayError || 'ວັນນີ້ບໍ່ແມ່ນວັນເຮັດການ' }}</p>
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  @click="checkWorkingDay"
                  prepend-icon="mdi-refresh"
                  class="mt-2"
                  :loading="loadingWorkingDay"
                >
                  ກວດສອບອີກຄັ້ງ
                </v-btn>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-expand-transition>

      <!-- Working Day Success Status -->
      <v-expand-transition>
        <v-row v-if="isWorkingDay" class="mb-4">
          <v-col cols="12">
            <v-alert
              type="success"
              variant="tonal"
              rounded="lg"
              prominent
              border="start"
              class="working-day-success-alert"
            >
              <template v-slot:title>
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-calendar-check</v-icon>
                  <strong>ວັນນີ້ສາມາດປິດບັນຊີໄດ້</strong>
                </div>
              </template>
              <div class="mt-2">
                <p>{{ workingDayMessage || 'ວັນນີ້ແມ່ນວັນເຮັດການ ສາມາດປະມວນຜົນປິດບັນຊີໄດ້' }}</p>
                <div class="d-flex align-center ga-2 mt-2">
                  <v-chip color="success" variant="flat" size="small" prepend-icon="mdi-check-circle">
                    ວັນເຮັດການ
                  </v-chip>
                  <v-btn
                    color="primary"
                    variant="text"
                    size="small"
                    @click="checkWorkingDay"
                    prepend-icon="mdi-refresh"
                    :loading="loadingWorkingDay"
                  >
                    ກວດສອບອີກຄັ້ງ
                  </v-btn>
                </div>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-expand-transition>

      <!-- Validation Tables -->
      <v-row>
        <!-- Pending Journals -->
        <v-col cols="12" lg="12">
          <v-card 
            elevation="12" 
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
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="refreshPendingJournals"
                    prepend-icon="mdi-refresh"
                    rounded="lg"
                    class="refresh-btn"
                    :loading="loadingJournals"
                  >
                    ອັບເດດ
                  </v-btn>
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
                    :loading="loadingJournals"
                    no-data-text="ບໍ່ມີລາຍການທີ່ລໍຖ້າອະນຸມັດ"
                  >
                    <template v-slot:loading>
                      <v-skeleton-loader type="table-row@3" />
                    </template>
                    <template v-slot:item.Fcy_Amount="{ item }">
                      <div class="text-right">
                        <span class="font-weight-medium number-text">{{ formatNumber(parseFloat(item.Fcy_Amount)) }}</span>
                        <div class="text-caption text-grey">{{ item.Ccy_cd }}</div>
                      </div>
                    </template>
                    <template v-slot:item.Value_date="{ item }">
                      <span class="time-text">{{ formatDate(item.Value_date) }}</span>
                    </template>
                    <template v-slot:item.Auth_Status="{ item }">
                      <v-chip
                        :color="getJournalStatusColor(item.Auth_Status)"
                        :prepend-icon="getJournalStatusIcon(item.Auth_Status)"
                        variant="flat"
                        size="small"
                        class="status-chip"
                      >
                        {{ getJournalStatusText(item.Auth_Status) }}
                      </v-chip>
                    </template>
                    <template v-slot:item.Maker_DT_Stamp="{ item }">
                      <span class="time-text">{{ formatDateTime(item.Maker_DT_Stamp) }}</span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <div class="d-flex ga-1">
                        <v-btn
                          color="info"
                          variant="text"
                          size="small"
                          icon="mdi-eye"
                          @click="viewJournalDetails(item)"
                          title="ເບິ່ງລາຍລະອຽດ"
                          class="action-button"
                        ></v-btn>
                      </div>
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
                  <p v-if="hasPendingJournals" class="text-body-2 text-grey mt-1">
                    ມູນຄ່າລວມ: {{ formatNumber(totalPendingAmount) }} LAK
                  </p>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Active Users -->
        <v-col cols="6">
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
                    :loading="loadingActiveUsers"
                  >
                    ເຄື່ອນທຸກຄົນອອກ
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="refreshActiveUsers"
                    prepend-icon="mdi-refresh"
                    rounded="lg"
                    class="refresh-btn"
                    :loading="loadingActiveUsers"
                  >
                    ອັບເດດ
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
                    :loading="loadingActiveUsers"
                    no-data-text="ບໍ່ມີຜູ້ໃຊ້ເຂົ້າໃຊ້ລະບົບ"
                  >
                    <template v-slot:loading>
                      <v-skeleton-loader type="table-row@3" />
                    </template>
                    
                    <template v-slot:item.user_id="{ item }">
                      <div class="d-flex align-center">
                        <v-chip 
                          :color="item.user_id === currentUser ? 'primary' : 'grey'" 
                          variant="flat" 
                          size="small"
                          class="mr-2"
                        >
                          {{ item.user_id }}
                        </v-chip>
                        <v-icon 
                          v-if="item.user_id === currentUser" 
                          color="primary" 
                          size="16"
                          title="ຕົວເອງ"
                        >
                          mdi-account-star
                        </v-icon>
                      </div>
                    </template>
                    
                    <template v-slot:item.user_name="{ item }">
                      <div class="d-flex align-center">
                        <span class="font-weight-medium">{{ item.user_name }}</span>
                        <v-chip 
                          v-if="item.user_id === currentUser"
                          color="primary"
                          variant="outlined"
                          size="x-small"
                          class="ml-2"
                        >
                          ຕົວເອງ
                        </v-chip>
                      </div>
                    </template>
                    
                    <template v-slot:item.login_datetime="{ item }">
                      <div>
                        <div class="time-text">{{ formatLoginTime(item.login_datetime) }}</div>
                        <div class="text-caption text-grey">{{ formatDate(item.login_datetime) }}</div>
                      </div>
                    </template>
                    
                    <template v-slot:item.session_duration="{ item }">
                      <span class="duration-text">{{ formatSessionDuration(item.session_duration) }}</span>
                    </template>
                    
                    <template v-slot:item.ip_address="{ item }">
                      <v-chip 
                        color="info-lighten-4" 
                        variant="flat" 
                        size="small"
                        prepend-icon="mdi-ip-network"
                      >
                        {{ item.ip_address }}
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
                        :title="`ເຄື່ອນ ${item.user_name} ອອກ`"
                        class="action-button"
                      ></v-btn>
                      <v-chip 
                        v-else 
                        color="primary" 
                        variant="flat" 
                        size="small"
                        prepend-icon="mdi-account-star"
                      >
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
                    {{ hasOtherActiveUsers ? `${activeUsersCount} ຄົນກຳລັງໃຊ້ລະບົບ` : 'ມີແຕ່ຕົວເອງໃນລະບົບ' }}
                  </p>
                  <p v-if="hasOtherActiveUsers" class="text-body-2 text-grey mt-1">
                    ຜູ້ໃຊ້ອື່ນ: {{ otherActiveUsersCount }} ຄົນ
                  </p>
                  <p v-if="currentUserName" class="text-body-2 text-primary mt-1">
                    ຜູ້ໃຊ້ປັດຈຸບັນ: {{ currentUserName }} ({{ currentUser }})
                  </p>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Function EOD -->
        <v-col cols="6">
          <v-card 
            elevation="6" 
            rounded="xl" 
            class="validation-card"
            :color="hasIncompleteEODFunctions ? 'error-lighten-5' : 'success-lighten-5'"
          >
            <v-card-title class="pa-6 pb-0">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-avatar 
                    size="56" 
                    :color="hasIncompleteEODFunctions ? 'error-lighten-4' : 'success-lighten-4'" 
                    class="mr-3 section-avatar"
                  >
                    <v-icon :color="hasIncompleteEODFunctions ? 'error-darken-2' : 'success-darken-2'" size="28">
                      {{ hasIncompleteEODFunctions ? 'mdi-function-variant' : 'mdi-check-circle' }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold section-title">ຟັງຊັນປິດບັນຊີປະຈຳວັນ</h2>
                    <p class="text-body-2 text-medium-emphasis">EOD Functions Status</p>
                  </div>
                </div>
                <div class="d-flex align-center ga-3">
                  <v-chip 
                    :color="hasIncompleteEODFunctions ? 'error' : 'success'" 
                    variant="flat" 
                    size="small"
                    :prepend-icon="hasIncompleteEODFunctions ? 'mdi-alert' : 'mdi-check'"
                    class="count-chip"
                  >
                    {{ completedEODFunctionsCount }}/{{ eodFunctions.length }} ສຳເລັດ
                  </v-chip>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="refreshEODFunctions"
                    prepend-icon="mdi-refresh"
                    rounded="lg"
                    class="refresh-btn"
                    :loading="loadingEODFunctions"
                  >
                    ອັບເດດ
                  </v-btn>
                  <v-btn
                    :color="showEODFunctionDetails ? 'primary' : 'grey'"
                    :variant="showEODFunctionDetails ? 'flat' : 'outlined'"
                    size="small"
                    @click="toggleEODFunctionDetails"
                    :prepend-icon="showEODFunctionDetails ? 'mdi-eye-off' : 'mdi-eye'"
                    rounded="lg"
                    class="toggle-button"
                  >
                    {{ showEODFunctionDetails ? 'ເຊື່ອງ' : 'ເບິ່ງ' }}
                  </v-btn>
                </div>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <v-expand-transition>
                <div v-show="showEODFunctionDetails">
                  <v-data-table
                    :headers="eodFunctionHeaders"
                    :items="eodFunctions"
                    class="elevation-2 rounded-lg data-table"
                    hide-default-footer
                    :loading="loadingEODFunctions"
                    no-data-text="ບໍ່ມີຟັງຊັນ EOD"
                    item-value="eoc_id"
                  >
                    <template v-slot:loading>
                      <v-skeleton-loader type="table-row@3" />
                    </template>
                    <template v-slot:item.eoc_seq_no="{ item }">
                      <v-chip 
                        color="info" 
                        variant="flat" 
                        size="small"
                        class="sequence-chip"
                      >
                        {{ item.eoc_seq_no }}
                      </v-chip>
                    </template>
                    <template v-slot:item.Record_Status="{ item }">
                      <v-chip
                        :color="getEODFunctionStatusColor(item.Record_Status)"
                        :prepend-icon="getEODFunctionStatusIcon(item.Record_Status)"
                        variant="flat"
                        size="small"
                        class="status-chip"
                      >
                        {{ getEODFunctionStatusText(item.Record_Status) }}
                      </v-chip>
                    </template>
                    <template v-slot:item.Auth_Status="{ item }">
                      <v-chip
                        :color="getJournalStatusColor(item.Auth_Status)"
                        :prepend-icon="getJournalStatusIcon(item.Auth_Status)"
                        variant="flat"
                        size="small"
                        class="status-chip"
                      >
                        {{ getJournalStatusText(item.Auth_Status) }}
                      </v-chip>
                    </template>
                    <template v-slot:item.Maker_DT_Stamp="{ item }">
                      <span class="time-text">{{ formatDateTime(item.Maker_DT_Stamp) }}</span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <div class="d-flex ga-1">
                        <v-btn
                          v-if="item.Record_Status === 'O' && item.Auth_Status === 'A'"
                          color="success"
                          variant="text"
                          size="small"
                          icon="mdi-play"
                          @click="executeEODFunction(item)"
                          title="ດຳເນີນການ"
                          class="action-button"
                        ></v-btn>
                        <v-btn
                          color="info"
                          variant="text"
                          size="small"
                          icon="mdi-eye"
                          @click="viewEODFunctionDetails(item)"
                          title="ເບິ່ງລາຍລະອຽດ"
                          class="action-button"
                        ></v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </div>
              </v-expand-transition>
              <v-expand-transition>
                <div v-show="!showEODFunctionDetails" class="text-center py-4">
                  <v-icon :color="hasIncompleteEODFunctions ? 'error' : 'success'" size="48" class="mb-2">
                    {{ hasIncompleteEODFunctions ? 'mdi-function-variant' : 'mdi-check-circle' }}
                  </v-icon>
                  <p class="text-h6 font-weight-medium">
                    {{ hasIncompleteEODFunctions ? `${completedEODFunctionsCount}/${eodFunctions.length} ຟັງຊັນສຳເລັດ` : 'ຟັງຊັນທັງໝົດສຳເລັດແລ້ວ' }}
                  </p>
                  <p v-if="hasIncompleteEODFunctions" class="text-body-2 text-grey mt-1">
                    ຍັງເຫຼືອ {{ incompleteEODFunctionsCount }} ຟັງຊັນທີ່ບໍ່ສຳເລັດ
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
              :loading="isRefreshing"
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

    <!-- Snackbars for notifications -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000" location="top">
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <v-snackbar v-model="showError" color="error" timeout="5000" location="top">
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
const router = useRouter()
import axios from '@/helpers/axios'

// Types
interface PendingJournal {
  JRNLLog_id: number
  Reference_No: string
  Fcy_Amount: string
  Lcy_Amount: string
  Value_date: string
  Exch_rate: string
  Addl_text: string
  Maker_DT_Stamp: string
  Checker_DT_Stamp?: string
  Auth_Status: string
  entry_seq_no: number
  delete_stat?: string
  module_id: string
  Ccy_cd: string
  Txn_code: string
  fin_cycle: string
  Period_code: string
  Maker_Id: string
  Checker_Id?: string
}

interface ActiveUserSession {
  log_id: number
  user_id: string
  user_name: string
  login_datetime: string
  session_duration: string
  ip_address: string
}

interface EODFunction {
  eoc_id: number
  function_name: string
  eoc_seq_no: number
  eoc_type: string
  Record_Status: string
  mod_no: number
  Maker_DT_Stamp: string
  Checker_DT_Stamp: string
  Auth_Status: string
  Once_Auth: string
  module_id: string
  function_id: string
  Maker_Id: string
  Checker_Id: string
}

interface WorkingDayResponse {
  available: boolean
  reason: string
}

interface ActiveSessionsResponse {
  success: boolean
  own_user_id: string
  own_user_name: string
  own_role_id: string
  active_sessions: ActiveUserSession[]
  total_count: number
  total_active_users_all: number
  active_user_ids: string[]
  current_time: string
}

// Reactive data
const selectedDate = ref(new Date().toLocaleDateString('lo-LA'))
const isProcessing = ref(false)
const isRefreshing = ref(false)
const loadingJournals = ref(false)
const loadingEODFunctions = ref(false)
const loadingWorkingDay = ref(false)
const loadingActiveUsers = ref(false)
const lastUpdate = ref(new Date().toLocaleString('lo-LA'))
const currentUser = ref<string>('')
const currentUserName = ref<string>('')
const currentUserRole = ref<string>('')
const showJournalDetails = ref(false)
const showUserDetails = ref(false)
const showEODFunctionDetails = ref(false)

// Working Day Status
const isWorkingDay = ref(true)
const workingDayMessage = ref('')
const workingDayError = ref('')

// Notification states
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// API Data
const pendingJournals = ref<PendingJournal[]>([])
const eodFunctions = ref<EODFunction[]>([])
const activeUsers = ref<ActiveUserSession[]>([])

// Table headers
const pendingJournalHeaders = [
  { title: 'ລຳດັບ', key: 'JRNLLog_id', width: '80px' },
  { title: 'ເລກທີອ້າງອີງ', key: 'Reference_No', width: '180px' },
  { title: 'ຈຳນວນເງິນ', key: 'Fcy_Amount', width: '140px' },
  { title: 'ວັນທີ', key: 'Value_date', width: '120px' },
  { title: 'ຜູ້ບັນທຶກ', key: 'Maker_Id', width: '100px' },
  { title: 'ເວລາບັນທຶກ', key: 'Maker_DT_Stamp', width: '150px' },
  { title: 'ສະຖານະ', key: 'Auth_Status', width: '120px' },
  { title: 'ການດຳເນີນການ', key: 'actions', width: '120px', sortable: false }
]

const activeUserHeaders = [
  { title: 'ລຳດັບ', key: 'log_id', width: '80px' },
  { title: 'ລະຫັດຜູ້ໃຊ້', key: 'user_id', width: '120px' },
  { title: 'ຊື່ຜູ້ໃຊ້', key: 'user_name' },
  { title: 'ເວລາເຂົ້າ', key: 'login_datetime', width: '150px' },
  { title: 'ໄລຍະເວລາ', key: 'session_duration', width: '120px' },
  { title: 'IP Address', key: 'ip_address', width: '130px' },
  { title: 'ການດຳເນີນການ', key: 'actions', width: '100px', sortable: false }
]

const eodFunctionHeaders = [
  { title: 'ລຳດັບ', key: 'eoc_seq_no', width: '80px' },
  { title: 'ຊື່ຟັງຊັນ', key: 'function_name' },
  { title: 'ສະຖານະບັນທຶກ', key: 'Record_Status', width: '120px' },
  { title: 'ສະຖານະອະນຸມັດ', key: 'Auth_Status', width: '120px' },
  { title: 'ວັນທີບັນທຶກ', key: 'Maker_DT_Stamp', width: '150px' },
  { title: 'ການດຳເນີນການ', key: 'actions', width: '120px', sortable: false }
]

// Computed properties
const canStartEOD = computed((): boolean => {
  const hasPendingJournals = pendingJournals.value.some(item => item.Auth_Status === 'U')
  
  // Check if there are other users (excluding current user) with active sessions
  const hasOtherActiveUsers = activeUsers.value.some(session => 
    session.user_id !== currentUser.value
  )
  
  const hasIncompleteEODFunctions = eodFunctions.value.some(func => func.Record_Status === 'C')
  
  return isWorkingDay.value && !hasPendingJournals && !hasOtherActiveUsers && !hasIncompleteEODFunctions
})

const pendingIssues = computed(() => {
  const issues = []
  if (!isWorkingDay.value) {
    issues.push(workingDayError.value || 'ວັນນີ້ບໍ່ແມ່ນວັນເຮັດການ')
  }
  if (pendingJournals.value.some(item => item.Auth_Status === 'U')) {
    issues.push('ມີລາຍການບັນຊີທີ່ຍັງບໍ່ໄດ້ອະນຸມັດ')
  }
  
  // Updated to use session data
  const otherActiveUsersCount = activeUsers.value.filter(session => 
    session.user_id !== currentUser.value
  ).length
  
  if (otherActiveUsersCount > 0) {
    issues.push(`ມີຜູ້ໃຊ້ອື່ນທີ່ຍັງເຂົ້າໃຊ້ລະບົບຢູ່ (${otherActiveUsersCount} ຄົນ)`)
  }
  
  if (eodFunctions.value.some(func => func.Record_Status === 'C')) {
    issues.push('ມີຟັງຊັນ EOD ທີ່ຍັງບໍ່ສຳເລັດ')
  }
  return issues
})

const hasPendingJournals = computed(() => {
  return pendingJournals.value.some(item => item.Auth_Status === 'U' || item.Auth_Status === 'P')
})

const hasOtherActiveUsers = computed(() => {
  return activeUsers.value.some(session => session.user_id !== currentUser.value)
})

const hasIncompleteEODFunctions = computed(() => {
  return eodFunctions.value.some(func => func.Record_Status === 'C')
})

const pendingJournalsCount = computed(() => {
  return pendingJournals.value.filter(item => item.Auth_Status === 'U' || item.Auth_Status === 'P').length
})

const activeUsersCount = computed(() => {
  // Count unique active users
  const uniqueUserIds = new Set(activeUsers.value.map(session => session.user_id))
  return uniqueUserIds.size
})

const otherActiveUsersCount = computed(() => {
  const uniqueOtherUsers = new Set(
    activeUsers.value
      .filter(session => session.user_id !== currentUser.value)
      .map(session => session.user_id)
  )
  return uniqueOtherUsers.size
})

const completedEODFunctionsCount = computed(() => {
  return eodFunctions.value.filter(func => func.Record_Status === 'O').length
})

const incompleteEODFunctionsCount = computed(() => {
  return eodFunctions.value.filter(func => func.Record_Status === 'C').length
})

const totalPendingAmount = computed(() => {
  return pendingJournals.value
    .filter(item => item.Auth_Status === 'U')
    .reduce((sum, item) => sum + parseFloat(item.Fcy_Amount), 0)
})

// API Methods
const checkWorkingDay = async () => {
  loadingWorkingDay.value = true
  try {
    const response = await axios.get<WorkingDayResponse>('/api/end-of-day-journal/check/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      const data = response.data
      isWorkingDay.value = data.available
      workingDayMessage.value = data.reason
      
      if (data.available) {
        workingDayError.value = ''
        console.log('Working day check passed:', data.reason)
      } else {
        workingDayError.value = data.reason
        console.log('Working day check failed:', data.reason)
      }
    }
  } catch (error: any) {
    console.error("Working day check failed:", error)
    isWorkingDay.value = false
    
    if (error.response?.status === 400) {
      workingDayError.value = error.response.data.reason || 'ວັນນີ້ບໍ່ແມ່ນວັນເຮັດການ'
    } else if (error.response?.status === 500) {
      workingDayError.value = 'ເກີດຂໍ້ຜິດພາດໃນລະບົບ'
    } else {
      workingDayError.value = error.response?.data?.reason || 'ເກີດຂໍ້ຜິດພາດໃນການກວດສອບວັນເຮັດການ'
    }
  } finally {
    loadingWorkingDay.value = false
  }
}

// Submit end-of-day journal
const submitEndOfDayJournal = async () => {
  try {
    const response = await axios.post('/api/end-of-day-journal/', {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 201) {
      showSuccess.value = true
      successMessage.value = response.data.message || 'ປິດບັນຊີປະຈຳວັນສຳເລັດແລ້ວ'
      
      // Refresh data after successful submission
      await Promise.all([
        checkWorkingDay(),
        fetchPendingJournals(),
        fetchEODFunctions(),
        fetchActiveUsers()
      ])
      
      return true
    }
  } catch (error: any) {
    console.error("End-of-day journal submission failed:", error)
    showError.value = true
    
    if (error.response?.status === 400) {
      errorMessage.value = error.response.data.error || 'ບໍ່ສາມາດປິດບັນຊີໄດ້'
    } else if (error.response?.status === 500) {
      errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນລະບົບ'
    } else {
      errorMessage.value = error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດໃນການປິດບັນຊີ'
    }
    
    return false
  }
}

const fetchPendingJournals = async () => {
  loadingJournals.value = true
  try {
    const response = await axios.get<PendingJournal[]>('/api/journal-log-master/journal-log-active', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      pendingJournals.value = response.data
      console.log('Pending journals loaded:', response.data.length)
    }
  } catch (error: any) {
    console.error("Error fetching pending journals:", error)
    showError.value = true
    errorMessage.value = error.response?.data?.detail || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ"
  } finally {
    loadingJournals.value = false
  }
}

const fetchActiveUsers = async () => {
  loadingActiveUsers.value = true
  try {
    const response = await axios.get<ActiveSessionsResponse>('/api/active-sessions/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200 && response.data.success) {
      activeUsers.value = response.data.active_sessions
      currentUser.value = response.data.own_user_id
      currentUserName.value = response.data.own_user_name
      currentUserRole.value = response.data.own_role_id
      
      console.log('Active users loaded:', {
        total: response.data.total_count,
        unique_users: response.data.total_active_users_all,
        current_user: response.data.own_user_id
      })
    }
  } catch (error: any) {
    console.error("Error fetching active users:", error)
    if (error.response?.status === 403) {
      showError.value = true
      errorMessage.value = "ທ່ານບໍ່ມີສິດເຂົ້າເບິ່ງຂໍ້ມູນນີ້"
    } else {
      showError.value = true
      errorMessage.value = error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ທີ່ເຂົ້າໃຊ້ລະບົບ"
    }
  } finally {
    loadingActiveUsers.value = false
  }
}

const fetchEODFunctions = async () => {
  loadingEODFunctions.value = true
  try {
    const response = await axios.get<EODFunction[]>('/api/eoc-maintain/?eoc_type=EOD', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      eodFunctions.value = response.data.sort((a, b) => a.eoc_seq_no - b.eoc_seq_no)
      console.log('EOD functions loaded:', response.data.length)
    }
  } catch (error: any) {
    console.error("Error fetching EOD functions:", error)
    showError.value = true
    errorMessage.value = error.response?.data?.detail || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຟັງຊັນ EOD"
  } finally {
    loadingEODFunctions.value = false
  }
}

const refreshPendingJournals = async () => {
  await fetchPendingJournals()
  lastUpdate.value = new Date().toLocaleString('lo-LA')
  showSuccess.value = true
  successMessage.value = 'ອັບເດດຂໍ້ມູນບັນຊີສຳເລັດແລ້ວ'
}

const refreshActiveUsers = async () => {
  await fetchActiveUsers()
  lastUpdate.value = new Date().toLocaleString('lo-LA')
  showSuccess.value = true
  successMessage.value = 'ອັບເດດຂໍ້ມູນຜູ້ໃຊ້ທີ່ເຂົ້າໃຊ້ລະບົບສຳເລັດແລ້ວ'
}

const refreshEODFunctions = async () => {
  await fetchEODFunctions()
  lastUpdate.value = new Date().toLocaleString('lo-LA')
  showSuccess.value = true
  successMessage.value = 'ອັບເດດຂໍ້ມູນຟັງຊັນ EOD ສຳເລັດແລ້ວ'
}

const viewJournalDetails = (journal: PendingJournal) => {
  router.push({
    path: '/glcapture/detail',
    query: {
      Reference_No: journal.Reference_No,
      sub_menu_id: 'GL_NOTE_CAP'
    }
  })
}

const executeEODFunction = async (eodFunction: EODFunction) => {
  try {
    const response = await axios.post(`/api/eoc-maintain/bulk-journal`, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      showSuccess.value = true
      successMessage.value = `ດຳເນີນການຟັງຊັນ ${eodFunction.function_name} ສຳເລັດແລ້ວ`
      
      await fetchEODFunctions()
    }
  } catch (error: any) {
    console.error('Error executing EOD function:', error)
    showError.value = true
    errorMessage.value = error.response?.data?.detail || 'ເກີດຂໍ້ຜິດພາດໃນການດຳເນີນການຟັງຊັນ'
  }
}

const viewEODFunctionDetails = (eodFunction: EODFunction) => {
  console.log('View EOD function details:', eodFunction)
}

const kickUser = async (userId: string): Promise<void> => {
  try {
    const response = await axios.post(`/api/force-logout-test/${userId}/`, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      activeUsers.value = activeUsers.value.filter(session => session.user_id !== userId)
      
      showSuccess.value = true
      successMessage.value = `ເຄື່ອນຜູ້ໃຊ້ ${userId} ອອກຈາກລະບົບແລ້ວ`
    }
  } catch (error: any) {
    console.error('Error kicking user:', error)
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຄື່ອນຜູ້ໃຊ້ອອກ'
  }
}

const kickAllUsers = async (): Promise<void> => {
  try {
    const otherUserIds = [
      ...new Set(
        activeUsers.value
          .filter(session => session.user_id !== currentUser.value)
          .map(session => session.user_id)
      )
    ]

    if (otherUserIds.length === 0) {
      showError.value = true
      errorMessage.value = 'ບໍ່ມີຜູ້ໃຊ້ອື່ນໃນລະບົບ'
      return
    }

    const response = await axios.post('/api/kick-all-users/', {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      activeUsers.value = activeUsers.value.filter(session => session.user_id === currentUser.value)
      
      showSuccess.value = true
      successMessage.value = `ເຄື່ອນຜູ້ໃຊ້ທຸກຄົນອອກຈາກລະບົບແລ້ວ (${otherUserIds.length} ຄົນ)`
    }
  } catch (error: any) {
    console.error('Error kicking all users:', error)
    showError.value = true
    errorMessage.value = error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຄື່ອນຜູ້ໃຊ້ອອກ'
  }
}

// Status Helper Methods
const getJournalStatusColor = (status: string): string => {
  switch(status) {
    case 'A':
      return 'success'
    case 'U':
      return 'warning'
    case 'R':
      return 'error'
    case 'P':
      return 'warning'
    default:
      return 'grey'
  }
}

const getJournalStatusIcon = (status: string): string => {
  switch(status) {
    case 'A':
      return 'mdi-check-circle'
    case 'U':
      return 'mdi-clock-outline'
    case 'R':
      return 'mdi-close-circle'
    case 'P':
      return 'mdi-clock-outline'
    default:
      return 'mdi-help-circle'
  }
}

const getJournalStatusText = (status: string): string => {
  switch(status) {
    case 'A':
      return 'ອະນຸມັດແລ້ວ'
    case 'U':
      return 'ລໍຖ້າອະນຸມັດ'
    case 'R':
      return 'ປະຕິເສດ'
    case 'P':
      return 'ລໍຖ້າແກ້ໄຂ'
    default:
      return 'ບໍ່ຮູ້ສະຖານະ'
  }
}

const getEODFunctionStatusColor = (status: string): string => {
  switch(status) {
    case 'C':
      return 'error'
    case 'O':
      return 'warning'
    case 'D':
      return 'error'
    default:
      return 'grey'
  }
}

const getEODFunctionStatusIcon = (status: string): string => {
  switch(status) {
    case 'C':
      return 'mdi-help-circle'
    case 'O':
      return 'mdi-clock-outline'
    case 'D':
      return 'mdi-delete'
    default:
      return 'mdi-help-circle'
  }
}

const getEODFunctionStatusText = (status: string): string => {
  switch(status) {
    case 'C':
      return 'ປິດ'
    case 'O':
      return 'ເປີດ'
    case 'D':
      return 'ລຶບ'
    default:
      return 'ບໍ່ຮູ້ສະຖານະ'
  }
}

// Helper function for EOD button text
const getEODButtonText = (): string => {
  if (isProcessing.value) {
    return 'ກຳລັງປະມວນຜົນ...'
  }
  
  if (!isWorkingDay.value) {
    return 'ບໍ່ແມ່ນວັນເຮັດການ'
  }
  
  if (canStartEOD.value) {
    return 'ສາມາດປິດບັນຊີໄດ້'
  }
  
  return 'ບໍ່ສາມາດປິດບັນຊີໄດ້'
}

// Utility Methods
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('lo-LA').format(num)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lo-LA')
}

const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('lo-LA')
}

const formatSessionDuration = (duration: string): string => {
  if (!duration) return '-'
  
  const parts = duration.split(':')
  if (parts.length >= 2) {
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    
    if (hours > 0) {
      return `${hours} ຊົ່ວໂມງ ${minutes} ນາທີ`
    } else {
      return `${minutes} ນາທີ`
    }
  }
  
  return duration
}

const formatLoginTime = (dateString: string): string => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleTimeString('lo-LA', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

// Toggle Methods
const toggleJournalDetails = (): void => {
  showJournalDetails.value = !showJournalDetails.value
}

const toggleUserDetails = (): void => {
  showUserDetails.value = !showUserDetails.value
}

const toggleEODFunctionDetails = (): void => {
  showEODFunctionDetails.value = !showEODFunctionDetails.value
}

// Main Process Methods
const startEODProcess = async (): Promise<void> => {
  if (!canStartEOD.value) {
    showError.value = true
    errorMessage.value = 'ບໍ່ສາມາດເລີ່ມການປິດບັນຊີໄດ້ ກະລຸນາແກ້ໄຂບັນຫາກ່ອນ'
    return
  }
  
  isProcessing.value = true
  try {
    // First, do a final check
    await checkWorkingDay()
    
    if (!isWorkingDay.value) {
      showError.value = true
      errorMessage.value = workingDayError.value || 'ວັນນີ້ບໍ່ສາມາດປິດບັນຊີໄດ້'
      return
    }
    
    // Submit the end-of-day journal
    const success = await submitEndOfDayJournal()
    
    if (success) {
      lastUpdate.value = new Date().toLocaleString('lo-LA')
    }
  } catch (error) {
    console.error('EOD process failed:', error)
    showError.value = true
    errorMessage.value = 'ການປິດບັນຊີລົ້ມເຫລວ'
  } finally {
    isProcessing.value = false
  }
}

const refreshData = async (): Promise<void> => {
  isRefreshing.value = true
  try {
    await Promise.all([
      checkWorkingDay(),
      fetchPendingJournals(),
      fetchEODFunctions(),
      fetchActiveUsers()
    ])
    
    lastUpdate.value = new Date().toLocaleString('lo-LA')
    showSuccess.value = true
    successMessage.value = 'ອັບເດດຂໍ້ມູນທັງໝົດສຳເລັດແລ້ວ'
  } catch (error) {
    console.error('Error refreshing data:', error)
    showError.value = true
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດຂໍ້ມູນ'
  } finally {
    isRefreshing.value = false
  }
}

const proceedToEOD = (): void => {
  console.log('Proceeding to EOD process')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    checkWorkingDay(),
    fetchPendingJournals(),
    fetchEODFunctions(),
    fetchActiveUsers()
  ])
})
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
.warning-alert, .success-alert, .working-day-alert, .working-day-success-alert {
  border-left: 6px solid;
  backdrop-filter: blur(5px);
}

.working-day-alert {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
  border-left: 6px solid #F44336 !important;
}

.working-day-success-alert {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-left: 6px solid #4CAF50 !important;
}

/* Card styling */
.validation-card, .footer-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.validation-card:hover, .footer-card:hover {
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
.toggle-button, .refresh-button, .proceed-button, .kick-button, .refresh-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
}

.toggle-button:hover, .refresh-button:hover, .proceed-button:hover, .kick-button:hover, .refresh-btn:hover {
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
.status-chip, .count-chip, .sequence-chip {
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.sequence-chip {
  font-weight: bold;
  min-width: 40px;
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