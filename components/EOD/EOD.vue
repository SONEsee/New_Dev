<template>
  <div class="pa-6">
    <v-container fluid class="pa-0">
      <!-- Header Card -->
      <v-card
        elevation="12"
        rounded="xl"
        class="mb-8 pa-8 header-card"
        :style="{
          background: isBackDateMode 
            ? 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' 
            : 'linear-gradient(135deg, #c58c20 0%, #616161 100%)',
          color: 'white'
        }"
      >
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <div class="d-flex align-center">
              <v-avatar size="72" class="mr-4 header-avatar" color="rgba(255,255,255,0.2)">
                <v-icon size="36" color="white">
                  {{ isBackDateMode ? 'mdi-history' : 'mdi-clipboard-check' }}
                </v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold mb-1 header-title">
                  {{ isBackDateMode ? 'ການປິດບັນຊີຍ້ອນຫຼັງວັນທີ' : 'ການກວດສອບກ່ອນປິດບັນຊີ' }} {{ displayDate }}
                </h1>
                <p class="text-h6 opacity-90">
                  {{ isBackDateMode ? 'ກວດສອບການລົງບັນຊີຍ້ອນຫຼັງ' : 'ກວດຄືນເງື່ອນໄຂການລົງບັນຊີ' }}
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="auto">
            <div class="d-flex align-center ga-4">
              <!-- <v-chip
                size="large"
                color="rgba(255,255,255,0.2)"
                variant="flat"
                prepend-icon="mdi-calendar"
                class="px-4 date-chip"
              >
                <span class="font-weight-bold">{{ displayDate }}</span>
              </v-chip> -->
              <!-- <v-chip
                v-if="isBackDateMode"
                size="large"
                color="warning"
                variant="flat"
                prepend-icon="mdi-clock-alert"
                class="px-4 back-date-chip"
              >
                <span class="font-weight-bold">ຍ້ອນຫຼັງ</span>
              </v-chip> -->
              <!-- Update the EOD button to show more detailed status -->
              <v-btn
                size="large"
                :color="canStartEOD ? 'success' : 'error'"
                variant="flat"
                :loading="isProcessing || isPerformingCleanup"
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

      <!-- Back-Date Information Card -->
      <v-expand-transition>
        <v-row v-if="isBackDateMode" class="mb-4">
          <v-col cols="12">
            <v-alert
              type="warning"
              variant="tonal"
              rounded="lg"
              prominent
              border="start"
              class="back-date-alert"
            >
              <template v-slot:title>
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-history</v-icon>
                  <strong>ໂໝດປິດບັນຊີຍ້ອນຫຼັງ</strong>
                </div>
              </template>
              <div class="mt-2">
                <p>{{ workingDayMessage }}</p>
                <div class="mt-3">
                  <div class="d-flex align-center ga-2 mb-2">
                    <v-chip color="info" variant="flat" size="small" prepend-icon="mdi-calendar">
                      ວັນທີເປົ້າໝາຍ: {{ targetDate }}
                    </v-chip>
                    <!-- <v-chip color="warning" variant="flat" size="small" prepend-icon="mdi-database">
                      EOD ID: {{ currentEODInfo.date_id }}
                    </v-chip> -->
                    <v-chip 
                      :color="currentEODInfo.eod_status === 'Y' ? 'success' : 'error'" 
                      variant="flat" 
                      size="small" 
                      :prepend-icon="currentEODInfo.eod_status === 'Y' ? 'mdi-check-circle' : 'mdi-clock-outline'"
                    >
                      {{ currentEODInfo.eod_status === 'Y' ? 'ສຳເລັດແລ້ວ' : 'ຍັງບໍ່ສຳເລັດ' }}
                    </v-chip>
                  </div>
                  <p class="text-body-2 text-grey">
                    ກຳລັງປະມວນຜົນການປິດບັນຊີ ສຳລັບວັນທີ {{ targetDate }} 
                    ({{ currentEODInfo.eod_status === 'Y' ? 'ສຳເລັດແລ້ວ' : 'ລໍຖ້າສຳເລັດ' }})
                  </p>
                </div>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-expand-transition>

      <!-- Warning/Success Messages -->
      <v-expand-transition>
        <v-row v-if="!canStartEOD && !isBackDateMode" class="mb-4">
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
                <strong>{{ isBackDateMode ? 'ພ້ອມສຳລັບການປິດບັນຊີຍ້ອນຫຼັງ' : 'ພ້ອມສຳລັບການປິດບັນຊີ' }}</strong>
              </template>
              <div class="mt-2">
                <p>{{ isBackDateMode ? `ສາມາດປະມວນຜົນປິດບັນຊີປະຈໍາວັນ ສຳລັບວັນທີ ${targetDate} ໄດ້` : 'ທຸກສິ່ງທຸກຢ່າງພ້ອມແລ້ວ ສາມາດເລີ່ມການປິດບັນຊີໄດ້' }}</p>
                  <p class="text-body-2 mt-1">
                    ຈະປະມວນຜົນ {{ readyEOCFunctionsCount }} ຟັງຊັນ EOC{{ isBackDateMode ? ` ສຳລັບວັນທີ ${targetDate}` : '' }}
                  </p>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </v-expand-transition>

      <!-- Working Day Status -->
      <v-expand-transition>
        <v-row v-if="!isWorkingDay && !isBackDateMode" class="mb-4">
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
        <v-row v-if="(isWorkingDay || isBackDateMode) && !isBackDateMode" class="mb-4">
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

      <!-- Previous Journal Records (Back-Date Mode) -->
      <v-expand-transition>
        <v-row v-if="isBackDateMode && previousJournals.length > 0" class="mb-4">
          <v-col cols="12">
            <v-card 
              elevation="12" 
              rounded="xl" 
              class="validation-card" 
              color="warning-lighten-5"
            >
              <v-card-title class="pa-6 pb-0">
                <div class="d-flex align-center justify-space-between w-100">
                  <div class="d-flex align-center">
                    <v-avatar 
                      size="56" 
                      color="warning-lighten-4" 
                      class="mr-3 section-avatar"
                    >
                      <v-icon color="warning-darken-2" size="28">mdi-history</v-icon>
                    </v-avatar>
                    <div>
                      <h2 class="text-h5 font-weight-bold section-title">ບັນຊີວັນທີ {{ targetDate }}</h2>
                      <p class="text-body-2 text-medium-emphasis">Previous Journal Records</p>
                    </div>
                  </div>
                  <div class="d-flex align-center ga-3">
                    <v-chip 
                      color="warning" 
                      variant="flat" 
                      size="small"
                      prepend-icon="mdi-file-document-multiple"
                      class="count-chip"
                    >
                      {{ previousJournals.length }} ລາຍການ
                    </v-chip>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      size="small"
                      @click="refreshPreviousJournals"
                      prepend-icon="mdi-refresh"
                      rounded="lg"
                      class="refresh-btn"
                      :loading="loadingPreviousJournals"
                    >
                      ອັບເດດ
                    </v-btn>
                    <v-btn
                      :color="showPreviousJournalDetails ? 'primary' : 'grey'"
                      :variant="showPreviousJournalDetails ? 'flat' : 'outlined'"
                      size="small"
                      @click="togglePreviousJournalDetails"
                      :prepend-icon="showPreviousJournalDetails ? 'mdi-eye-off' : 'mdi-eye'"
                      rounded="lg"
                      class="toggle-button"
                    >
                      {{ showPreviousJournalDetails ? 'ເຊື່ອງ' : 'ເບິ່ງ' }}
                    </v-btn>
                  </div>
                </div>
              </v-card-title>
              
              <v-card-text class="pa-6">
                <v-expand-transition>
                  <div v-show="showPreviousJournalDetails">
                    <v-data-table
                      :headers="pendingJournalHeaders"
                      :items="previousJournals"
                      class="elevation-2 rounded-lg data-table"
                      hide-default-footer
                      :loading="loadingPreviousJournals"
                      no-data-text="ບໍ່ມີບັນຊີຂອງວັນທີນີ້"
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
                  <div v-show="!showPreviousJournalDetails" class="text-center py-4">
                    <v-icon color="warning" size="48" class="mb-2">mdi-history</v-icon>
                    <p class="text-h6 font-weight-medium">
                      {{ previousJournals.length }} ລາຍການບັນຊີສຳລັບວັນທີ {{ targetDate }}
                    </p>
                    <p class="text-body-2 text-grey mt-1">
                      ມູນຄ່າລວມ: {{ formatNumber(totalPreviousAmount) }} LAK
                    </p>
                  </div>
                </v-expand-transition>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-expand-transition>

      <!-- --------- -->
      <!-- Validation Tables -->
      <v-row class="mb-4">
        <!-- Pending Journals -->
        <v-col v-if="!backValueEnabled" cols="12" lg="12">
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
                    <h2 class="text-h5 font-weight-bold section-title">
                      {{ isBackDateMode ? `ລາຍການບັນຊີປັດຈຸບັນ (${displayDate})` : 'ລາຍການບັນຊີທີ່ຍັງບໍ່ໄດ້ອະນຸມັດ' }}
                    </h2>
                    <p class="text-body-2 text-medium-emphasis">
                      {{ isBackDateMode ? 'Current Day Journal Entries' : 'Pending Journal Approval' }}
                    </p>
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
                    {{ isBackDateMode 
                       ? (hasPendingJournals ? `${pendingJournalsCount} ລາຍການປັດຈຸບັນ` : 'ບໍ່ມີລາຍການປັດຈຸບັນ')
                       : (hasPendingJournals ? `${pendingJournalsCount} ລາຍການລໍຖ້າອະນຸມັດ` : 'ທັງໝົດອະນຸມັດແລ້ວ') }}
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
                    v-if="hasOtherActiveUsers && !isBackDateMode"
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
                        v-if="item.user_id !== currentUser && !isBackDateMode"
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
      :color="!allEOCFunctionsReady ? 'warning-lighten-5' : 'success-lighten-5'"
    >
      <v-card-title class="pa-6 pb-0">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-avatar 
              size="56" 
              :color="!allEOCFunctionsReady ? 'warning-lighten-4' : 'success-lighten-4'" 
              class="mr-3 section-avatar"
            >
              <v-icon :color="!allEOCFunctionsReady ? 'warning-darken-2' : 'success-darken-2'" size="28">
                {{ !allEOCFunctionsReady ? 'mdi-function-variant' : 'mdi-check-circle' }}
              </v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-bold section-title">ຟັງຊັນປິດບັນຊີ EOC</h2>
              <p class="text-body-2 text-medium-emphasis">EOC Functions (EOD/EOM/EOY)</p>
            </div>
          </div>
          <div class="d-flex align-center ga-3">
            <v-chip 
              :color="allEOCFunctionsReady ? 'success' : 'warning'" 
              variant="flat" 
              size="small"
              :prepend-icon="allEOCFunctionsReady ? 'mdi-check' : 'mdi-cog'"
              class="count-chip"
            >
              {{ readyEOCFunctionsCount }}/{{ eocFunctionsCount }} ພ້ອມ
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
              :headers="eocFunctionHeaders"
              :items="eocFunctionsFiltered"
              class="elevation-2 rounded-lg data-table"
              hide-default-footer
              :loading="loadingEODFunctions"
              no-data-text="ບໍ່ມີຟັງຊັນ EOC"
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
              <template v-slot:item.eoc_type="{ item }">
                <v-chip
                  :color="getEOCTypeColor(item.eoc_type)"
                  :prepend-icon="getEOCTypeIcon(item.eoc_type)"
                  variant="flat"
                  size="small"
                  class="status-chip"
                >
                  {{ item.eoc_type }}
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
              <template v-slot:item.execution_status="{ item }">
                <v-chip
                  :color="getExecutionStatusColor(item)"
                  :prepend-icon="getExecutionStatusIcon(item)"
                  variant="flat"
                  size="small"
                  class="status-chip"
                >
                  {{ getExecutionStatusText(item) }}
                </v-chip>
              </template>
              <!-- <template v-slot:item.Maker_DT_Stamp="{ item }">
                <span class="time-text">{{ formatDateTime(item.Maker_DT_Stamp) }}</span>
              </template> -->
              <template v-slot:item.actions="{ item }">
                <div class="d-flex ga-1">
                  <v-btn
                    v-if="canExecuteFunction(item)"
                    color="success"
                    variant="text"
                    size="small"
                    icon="mdi-play"
                    @click="executeEODFunction(item)"
                    title="ດຳເນີນການ"
                    class="action-button"
                    :loading="item.executing"
                  ></v-btn>
                  <v-btn
                    v-if="canToggleFunction(item)"
                    :color="item.Record_Status === 'O' ? 'warning' : 'success'"
                    variant="text"
                    size="small"
                    :icon="item.Record_Status === 'O' ? 'mdi-pause' : 'mdi-play-circle'"
                    @click="toggleEODFunction(item)"
                    :title="item.Record_Status === 'O' ? 'ປິດຟັງຊັນ' : 'ເປີດຟັງຊັນ'"
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
            <v-icon :color="allEOCFunctionsReady ? 'success' : 'warning'" size="48" class="mb-2">
              {{ allEOCFunctionsReady ? 'mdi-check-circle' : 'mdi-cog' }}
            </v-icon>
            <p class="text-h6 font-weight-medium">
              {{ readyEOCFunctionsCount }}/{{ eocFunctionsCount }} ຟັງຊັນພ້ອມປະມວນຜົນ
            </p>
            <div v-if="!allEOCFunctionsReady" class="text-body-2 text-grey mt-1">
              <p>ພ້ອມປະມວນຜົນ: {{ readyEOCFunctionsCount }}</p>
              <p>ປິດ: {{ closedEOCFunctionsCount }}</p>
              <p>ຍັງບໍ່ອະນຸມັດ: {{ unauthorizedEOCFunctionsCount }}</p>
            </div>
            <div v-if="eocTypeBreakdown.length > 0" class="mt-2">
              <div class="d-flex justify-center ga-2">
                <v-chip
                  v-for="type in eocTypeBreakdown"
                  :key="type.type"
                  :color="getEOCTypeColor(type.type)"
                  variant="flat"
                  size="small"
                >
                  {{ type.type }}: {{ type.count }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </v-card-text>
    </v-card>
  </v-col>
</v-row>
<!-- Post-EOD Cleanup Progress Alert -->
  <v-expand-transition>
    <v-row v-if="isPerformingCleanup" class="mb-4">
      <v-col cols="12">
        <v-alert
          type="info"
          variant="tonal"
          rounded="lg"
          prominent
          border="start"
          class="cleanup-progress-alert"
        >
          <template v-slot:title>
            <div class="d-flex align-center">
              <v-progress-circular
                indeterminate
                color="info"
                size="24"
                class="mr-3"
              ></v-progress-circular>
              <strong>ກຳລັງອັບເດດຂໍ້ມູນຫຼັງປິດບັນຊີ</strong>
            </div>
          </template>
          <div class="mt-2">
            <p>ກຳລັງອັບເດດ BACK_VALUE ແລະ MOD_NO ໃນຕາຕະລາງຂໍ້ມູນ...</p>
            <v-progress-linear
              indeterminate
              color="info"
              class="mt-2"
            ></v-progress-linear>
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </v-expand-transition>

  <!-- Logout Countdown Alert -->
  <v-expand-transition>
    <v-row v-if="showLogoutCountdown" class="mb-4">
      <v-col cols="12">
        <v-alert
          type="warning"
          variant="tonal"
          rounded="lg"
          prominent
          border="start"
          class="logout-countdown-alert"
        >
          <template v-slot:title>
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-logout</v-icon>
              <strong>ກຳລັງອອກຈາກລະບົບ</strong>
            </div>
          </template>
          <div class="mt-2">
            <p>ການປິດບັນຊີສຳເລັດສົມບູນ. ລະບົບຈະອອກອັດຕະໂນມັດໃນ:</p>
            <div class="d-flex align-center mt-3">
              <v-progress-circular
                :model-value="((5 - logoutCountdown) / 5) * 100"
                size="48"
                width="4"
                color="warning"
                class="mr-3"
              >
                <span class="text-h6 font-weight-bold">{{ logoutCountdown }}</span>
              </v-progress-circular>
              <div>
                <p class="text-body-1 font-weight-medium mb-1">ວິນາທີ</p>
                <p class="text-body-2 text-grey">ກະລຸນາບັນທຶກຂໍ້ມູນທີ່ຈຳເປັນ</p>
              </div>
            </div>
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </v-expand-transition>

<!-- Missing EOD Dates Alert -->
<v-expand-transition>
  <v-row v-if="missingEODDates.length > 0" class="mb-4">
    <v-col cols="12">
      <v-alert
        type="error"
        variant="tonal"
        rounded="lg"
        prominent
        border="start"
        class="missing-dates-alert"
      >
        <template v-slot:title>
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-calendar-alert</v-icon>
            <strong>ມີວັນທີ່ຍັງບໍ່ໄດ້ປິດບັນຊີ</strong>
          </div>
        </template>
        <div class="mt-2">
          <p class="mb-3">ທ່ານຕ້ອງປິດບັນຊີຕາມລຳດັບວັນທີ່. ວັນທີ່ຕໍ່ໄປທີ່ຕ້ອງປະມວນຜົນ:</p>
          <v-chip
            color="error"
            variant="flat"
            size="large"
            prepend-icon="mdi-calendar-clock"
            class="mb-3"
          >
            <strong>{{ nextRequiredDate }}</strong>
          </v-chip>
          
          <div v-if="missingEODDates.length > 1" class="mt-3">
            <p class="text-body-2 mb-2">ວັນທີ່ທັງໝົດທີ່ຍັງບໍ່ໄດ້ປິດບັນຊີ:</p>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="(date, index) in missingEODDates"
                :key="date"
                :color="index === 0 ? 'error' : 'warning'"
                variant="flat"
                size="small"
                prepend-icon="mdi-calendar"
              >
                {{ formatDate(date) }}
              </v-chip>
            </div>
          </div>
          
          <v-divider class="my-3"></v-divider>
          
          <div class="d-flex ga-2">
            <v-btn
              color="primary"
              variant="flat"
              @click="processNextMissingDate"
              prepend-icon="mdi-play-circle"
              :loading="isProcessingMissing"
            >
              ປະມວນຜົນວັນທີ {{ formatDate(nextRequiredDate) }}
            </v-btn>
            <v-btn
              color="info"
              variant="outlined"
              @click="checkMissingDates"
              prepend-icon="mdi-refresh"
              :loading="loadingMissingDates"
            >
              ກວດສອບອີກຄັ້ງ
            </v-btn>
          </div>
        </div>
      </v-alert>
    </v-col>
  </v-row>
</v-expand-transition>


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
              {{ isBackDateMode ? 'ປິດບັນຊີຍ້ອນຫຼັງ' : 'ໄປປິດບັນຊີ' }}
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
  executing?: boolean
}

interface WorkingDayResponse {
  available: boolean
  reason: string
  target_date?: string
  is_back_date?: boolean
  back_value_enabled?: boolean
  current_eod?: {
    date_id: number
    next_working_day: string
    eod_status: string
  }
}

interface JournalResponse {
  results: PendingJournal[]
  processing_date?: string
  is_back_date?: boolean
  record_count?: number
  today?: string
  target_date?: string
  error?: string
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
const loadingPreviousJournals = ref(false)
const loadingEODFunctions = ref(false)
const loadingWorkingDay = ref(false)
const loadingActiveUsers = ref(false)
const lastUpdate = ref(new Date().toLocaleString('lo-LA'))
const currentUser = ref<string>('')
const currentUserName = ref<string>('')
const currentUserRole = ref<string>('')
const showJournalDetails = ref(false)
const showPreviousJournalDetails = ref(false)
const showUserDetails = ref(false)
const showEODFunctionDetails = ref(false)

// Back-date mode data
const isBackDateMode = ref(false)
const targetDate = ref('')
const currentEODInfo = ref<{
  date_id: number
  next_working_day: string
  eod_status: string
}>({
  date_id: 0,
  next_working_day: '',
  eod_status: 'N'
})

// Missing dates handling
const missingEODDates = ref<string[]>([])
const nextRequiredDate = ref<string>('')
const isProcessingMissing = ref(false)
const loadingMissingDates = ref(false)
const isPerformingCleanup = ref(false)
const logoutCountdown = ref(0)
const showLogoutCountdown = ref(false)
const logoutTimer = ref<NodeJS.Timeout | null>(null)
// Add new interfaces
interface MissingDatesResponse {
  missing_dates: string[]
  next_required_date: string
  can_process_today: boolean
  message: string
}

interface DateValidationResponse {
  can_process: boolean
  message: string
  next_required_date?: string
}

// Add new API methods
const checkMissingDates = async () => {
  loadingMissingDates.value = true
  try {
    const response = await axios.get<MissingDatesResponse>('/api/end-of-day-journal/missing-dates/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      missingEODDates.value = response.data.missing_dates || []
      nextRequiredDate.value = response.data.next_required_date || ''
      
      console.log('Missing EOD dates:', {
        missing: response.data.missing_dates,
        next: response.data.next_required_date,
        can_process_today: response.data.can_process_today
      })
    }
  } catch (error: any) {
    console.error("Error checking missing dates:", error)
    showError.value = true
    errorMessage.value = error.response?.data?.error || "ເກີດຂໍ້ຜິດພາດໃນການກວດສອບວັນທີ່"
  } finally {
    loadingMissingDates.value = false
  }
}

const validateDateSequence = async (date: string): Promise<DateValidationResponse> => {
  try {
    const response = await axios.post<DateValidationResponse>(
      '/api/end-of-day-journal/validate-date/', 
      { processing_date: date },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    return response.data
  } catch (error: any) {
    console.error("Date validation failed:", error)
    return {
      can_process: false,
      message: error.response?.data?.message || "ບໍ່ສາມາດກວດສອບວັນທີ່ໄດ້"
    }
  }
}

const processNextMissingDate = async () => {
  if (!nextRequiredDate.value) {
    showError.value = true
    errorMessage.value = "ບໍ່ມີວັນທີ່ທີ່ຕ້ອງປະມວນຜົນ"
    return
  }

  isProcessingMissing.value = true
  try {
    // Validate the date first
    const validation = await validateDateSequence(nextRequiredDate.value)
    if (!validation.can_process) {
      showError.value = true
      errorMessage.value = validation.message
      return
    }

    // Process the EOD for the missing date
    const response = await axios.post(
      '/api/end-of-day-journal/process-with-validation/',
      { processing_date: nextRequiredDate.value },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )

    if (response.status === 201 || response.status === 200) {
      showSuccess.value = true
      successMessage.value = response.data.message || `ປິດບັນຊີສຳລັບວັນທີ ${nextRequiredDate.value} ສຳເລັດແລ້ວ`
      
      // Refresh all data including missing dates
      await Promise.all([
        checkWorkingDay(),
        checkMissingDates(),
        fetchPendingJournals(),
        fetchEODFunctions(),
        fetchActiveUsers()
      ])
    }
  } catch (error: any) {
    console.error('Error processing missing date:', error)
    showError.value = true
    errorMessage.value = error.response?.data?.error || `ເກີດຂໍ້ຜິດພາດໃນການປິດບັນຊີວັນທີ ${nextRequiredDate.value}`
  } finally {
    isProcessingMissing.value = false
  }
}

// Working Day Status
const isWorkingDay = ref(true)
const workingDayMessage = ref('')
const workingDayError = ref('')

// Notification states
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// API Data - Initialize as empty arrays to prevent filter errors
const pendingJournals = ref<PendingJournal[]>([])
const previousJournals = ref<PendingJournal[]>([])
const eodFunctions = ref<EODFunction[]>([])
const activeUsers = ref<ActiveUserSession[]>([])

// Computed properties for display
const displayDate = computed(() => {
  return isBackDateMode.value ? targetDate.value : selectedDate.value
})

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

const eocFunctionHeaders = [
  { title: 'ລຳດັບ', key: 'eoc_seq_no', width: '40px' },
  { title: 'ຊື່ຟັງຊັນ', key: 'function_name', width:'120px' },
  { title: 'ປະເພດ', key: 'eoc_type', width: '80px' }, // Add EOC Type column
  { title: 'ສະຖານະບັນທຶກ', key: 'Record_Status', width: '120px' },
  { title: 'ສະຖານະອະນຸມັດ', key: 'Auth_Status', width: '120px' },
  // { title: 'ວັນທີບັນທຶກ', key: 'Maker_DT_Stamp', width: '150px' },
  { title: 'ການດຳເນີນການ', key: 'actions', width: '150px', sortable: false }
]

// At the top with other refs
const backValueEnabled = ref(false)


// Computed properties for EOD Functions
const eocFunctionsFiltered = computed(() => {
  // Ensure eodFunctions.value is an array before calling filter
  if (!Array.isArray(eodFunctions.value)) {
    console.warn('eodFunctions.value is not an array:', eodFunctions.value)
    return []
  }
  // Filter to include EOD, EOM, and EOY types
  return eodFunctions.value.filter(func => 
    func.eoc_type === 'EOD' || func.eoc_type === 'EOM' || func.eoc_type === 'EOY'
  )
})

const eocFunctionsCount = computed(() => {
  return eocFunctionsFiltered.value.length
})

const readyEOCFunctionsCount = computed(() => {
  return eocFunctionsFiltered.value.filter(func => 
    func.Record_Status === 'O' && func.Auth_Status === 'A'
  ).length
})

const closedEOCFunctionsCount = computed(() => {
  return eocFunctionsFiltered.value.filter(func => func.Record_Status === 'C').length
})

const unauthorizedEOCFunctionsCount = computed(() => {
  return eocFunctionsFiltered.value.filter(func => func.Auth_Status === 'U').length
})

const allEOCFunctionsReady = computed(() => {
  if (eocFunctionsCount.value === 0) return true
  return readyEOCFunctionsCount.value === eocFunctionsCount.value
})

const eocTypeBreakdown = computed(() => {
  if (!Array.isArray(eocFunctionsFiltered.value)) return []
  
  const breakdown = {}
  eocFunctionsFiltered.value.forEach(func => {
    if (breakdown[func.eoc_type]) {
      breakdown[func.eoc_type]++
    } else {
      breakdown[func.eoc_type] = 1
    }
  })
  
  return Object.keys(breakdown).map(type => ({
    type,
    count: breakdown[type]
  })).sort((a, b) => a.type.localeCompare(b.type))
})

// Main computed properties
const canStartEOD = computed((): boolean => {
  // In back-date mode, allow EOD even with pending journals from current day
  const hasPendingJournals = isBackDateMode.value 
    ? false // Allow back-date EOD regardless of current day journals
    : pendingJournals.value.some(item => item.Auth_Status === 'U' || item.Auth_Status === 'R' || item.Auth_Status === 'P')
  
  // Check if there are other users (excluding current user) with active sessions
  const hasOtherActiveUsers = isBackDateMode.value 
    ? false // Allow back-date EOD with other users (special permission)
    : activeUsers.value.some(session => session.user_id !== currentUser.value)
  
  // EOC can start even if not all functions are ready - we'll execute only the ready ones
  const hasReadyEOCFunctions = readyEOCFunctionsCount.value > 0
  
  return (isWorkingDay.value || isBackDateMode.value) && !hasPendingJournals && !hasOtherActiveUsers && hasReadyEOCFunctions
})
const pendingIssues = computed(() => {
  const issues = []
  if (!isWorkingDay.value && !isBackDateMode.value) {
    issues.push(workingDayError.value || 'ວັນນີ້ບໍ່ແມ່ນວັນເຮັດການ')
  }
  if (!isBackDateMode.value && Array.isArray(pendingJournals.value) && pendingJournals.value.some(item => item.Auth_Status === 'U')) {
    issues.push('ມີລາຍການບັນຊີທີ່ຍັງບໍ່ໄດ້ອະນຸມັດ')
  }
  
  // Updated to use session data with array check
  const otherActiveUsersCount = Array.isArray(activeUsers.value) 
    ? activeUsers.value.filter(session => session.user_id !== currentUser.value).length
    : 0
  
  if (!isBackDateMode.value && otherActiveUsersCount > 0) {
    issues.push(`ມີຜູ້ໃຊ້ອື່ນທີ່ຍັງເຂົ້າໃຊ້ລະບົບຢູ່ (${otherActiveUsersCount} ຄົນ)`)
  }
  
  if (readyEOCFunctionsCount.value === 0) {
    issues.push('ບໍ່ມີຟັງຊັນ EOC ທີ່ພ້ອມປະມວນຜົນ')
  }
  return issues
})

const getEOCTypeColor = (type: string): string => {
  switch(type) {
    case 'EOD':
      return 'primary'
    case 'EOM':
      return 'secondary'
    case 'EOY':
      return 'accent'
    default:
      return 'grey'
  }
}

const getEOCTypeIcon = (type: string): string => {
  switch(type) {
    case 'EOD':
      return 'mdi-calendar-today'
    case 'EOM':
      return 'mdi-calendar-month'
    case 'EOY':
      return 'mdi-calendar-star'
    default:
      return 'mdi-calendar'
  }
}


// Add this method for countdown display
const startLogoutCountdown = (seconds: number = 5) => {
  logoutCountdown.value = seconds
  showLogoutCountdown.value = true
  
  logoutTimer.value = setInterval(() => {
    logoutCountdown.value--
    if (logoutCountdown.value <= 0) {
      if (logoutTimer.value) {
        clearInterval(logoutTimer.value)
      }
      showLogoutCountdown.value = false
    }
  }, 1000)
}

// Update the performPostEODCleanup method to set loading state
const performPostEODCleanup = async () => {
  isPerformingCleanup.value = true
  try {
    const response = await axios.post('/api/mttb-data-entry/post_eod_cleanup/', {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200 && response.data.success) {
      console.log('Post-EOD cleanup completed:', response.data.updated_count, 'records updated')
      return {
        success: true,
        message: response.data.message,
        updatedCount: response.data.updated_count,
        logoutRequired: response.data.logout_required
      }
    }
  } catch (error) {
    console.error("Post-EOD cleanup failed:", error)
    return {
      success: false,
      error: error.response?.data?.error || "ເກີດຂໍ້ຜິດພາດໃນການສຳເລັດການປິດບັນຊີ"
    }
  } finally {
    isPerformingCleanup.value = false
  }
}

// New logout method
const performLogout = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    
    // Optional: Call logout endpoint if you have one
    try {
      await axios.post('/api/logout/', {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
    } catch (logoutError) {
      console.log('Logout endpoint call failed, but continuing with local logout')
    }
    
    // Redirect to login page
    router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
    // Force redirect even if logout fails
    router.push('/login')
  }
}

const hasPendingJournals = computed(() => {
  // Ensure pendingJournals.value is an array before calling filter
  if (!Array.isArray(pendingJournals.value)) {
    console.warn('pendingJournals.value is not an array:', pendingJournals.value)
    return false
  }
  return pendingJournals.value.some(item => item.Auth_Status === 'U' || item.Auth_Status === 'P')
})

const hasOtherActiveUsers = computed(() => {
  // Ensure activeUsers.value is an array before calling some
  if (!Array.isArray(activeUsers.value)) {
    console.warn('activeUsers.value is not an array:', activeUsers.value)
    return false
  }
  return activeUsers.value.some(session => session.user_id !== currentUser.value)
})

const pendingJournalsCount = computed(() => {
  // Ensure pendingJournals.value is an array before calling filter
  if (!Array.isArray(pendingJournals.value)) {
    console.warn('pendingJournals.value is not an array:', pendingJournals.value)
    return 0
  }
  return pendingJournals.value.filter(item => item.Auth_Status === 'U' || item.Auth_Status === 'P').length
})

const activeUsersCount = computed(() => {
  // Ensure activeUsers.value is an array before processing
  if (!Array.isArray(activeUsers.value)) {
    console.warn('activeUsers.value is not an array:', activeUsers.value)
    return 0
  }
  // Count unique active users
  const uniqueUserIds = new Set(activeUsers.value.map(session => session.user_id))
  return uniqueUserIds.size
})

const otherActiveUsersCount = computed(() => {
  // Ensure activeUsers.value is an array before processing
  if (!Array.isArray(activeUsers.value)) {
    console.warn('activeUsers.value is not an array:', activeUsers.value)
    return 0
  }
  const uniqueOtherUsers = new Set(
    activeUsers.value
      .filter(session => session.user_id !== currentUser.value)
      .map(session => session.user_id)
  )
  return uniqueOtherUsers.size
})

const totalPendingAmount = computed(() => {
  // Ensure pendingJournals.value is an array before processing
  if (!Array.isArray(pendingJournals.value)) {
    console.warn('pendingJournals.value is not an array:', pendingJournals.value)
    return 0
  }
  return pendingJournals.value
    .filter(item => item.Auth_Status === 'U')
    .reduce((sum, item) => sum + parseFloat(item.Fcy_Amount), 0)
})

const totalPreviousAmount = computed(() => {
  // Ensure previousJournals.value is an array before processing
  if (!Array.isArray(previousJournals.value)) {
    console.warn('previousJournals.value is not an array:', previousJournals.value)
    return 0
  }
  return previousJournals.value
    .reduce((sum, item) => sum + parseFloat(item.Fcy_Amount), 0)
})

// Function execution helpers
const canExecuteFunction = (func: EODFunction): boolean => {
  return func.Record_Status === 'O' && 
         func.Auth_Status === 'A' && 
         (func.eoc_type === 'EOD' || func.eoc_type === 'EOM' || func.eoc_type === 'EOY')
}

const canToggleFunction = (func: EODFunction): boolean => {
  return func.Auth_Status === 'A' && 
         (func.eoc_type === 'EOD' || func.eoc_type === 'EOM' || func.eoc_type === 'EOY')
}

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
      backValueEnabled.value = !!data.back_value_enabled
      
      // Check if this is back-date mode
      if (data.is_back_date && data.back_value_enabled) {
        isBackDateMode.value = true
        targetDate.value = data.target_date || ''
        currentEODInfo.value = data.current_eod || { date_id: 0, next_working_day: '', eod_status: 'N' }
        isWorkingDay.value = true // Allow back-date processing
        workingDayMessage.value = data.reason
        workingDayError.value = ''
        
        // Fetch previous journals for the target date
        await fetchPreviousJournals(data.target_date || '')
        
        console.log('Back-date mode activated:', {
          target_date: data.target_date,
          eod_info: data.current_eod
        })
      } else {
        // Normal mode
        isBackDateMode.value = false
        targetDate.value = ''
        currentEODInfo.value = { date_id: 0, next_working_day: '', eod_status: 'N' }
        previousJournals.value = []
        
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
    }
  } catch (error: any) {
    console.error("Working day check failed:", error)
    isWorkingDay.value = false
    isBackDateMode.value = false
    
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

// Fetch previous journals for back-date mode
const fetchPreviousJournals = async (date: string) => {
  if (!date) return
  
  loadingPreviousJournals.value = true
  try {
    const response = await axios.get(`/api/journal-log-master/journal-log-by-date/?date=${date}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      // Handle the new response structure
      if (response.data.results) {
        previousJournals.value = response.data.results
        console.log('Previous journals loaded for', date, ':', response.data.record_count || response.data.results.length, 'records')
      } else if (Array.isArray(response.data)) {
        // Fallback for old response structure
        previousJournals.value = response.data
        console.log('Previous journals loaded for', date, ':', response.data.length, 'records')
      } else {
        previousJournals.value = []
        console.log('Previous journals loaded for', date, ': 0 records')
      }
    }
  } catch (error: any) {
    console.error("Error fetching previous journals:", error)
    previousJournals.value = [] // Ensure it's always an array
    if (error.response?.status !== 404) { // 404 is expected if no journals found
      showError.value = true
      errorMessage.value = error.response?.data?.error || error.response?.data?.detail || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດບັນຊີວັນທີກ່ອນ"
    }
  } finally {
    loadingPreviousJournals.value = false
  }
}

const refreshPreviousJournals = async () => {
  if (targetDate.value) {
    await fetchPreviousJournals(targetDate.value)
    lastUpdate.value = new Date().toLocaleString('lo-LA')
    showSuccess.value = true
    successMessage.value = 'ອັບເດດຂໍ້ມູນບັນຊີວັນທີກ່ອນສຳເລັດແລ້ວ'
  }
}

// Update submitEndOfDayJournal to use countdown
const submitEndOfDayJournal = async () => {
  try {
    const payload = isBackDateMode.value 
      ? { target_date: targetDate.value, eod_id: currentEODInfo.value.date_id }
      : {}
      
    const response = await axios.post('/api/end-of-day-journal/', payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 201) {
      showSuccess.value = true
      successMessage.value = response.data.message || (isBackDateMode.value 
        ? `ປິດບັນຊີຍ້ອນຫຼັງສຳລັບວັນທີ ${targetDate.value} ສຳເລັດແລ້ວ`
        : 'ປິດບັນຊີປະຈຳວັນສຳເລັດແລ້ວ')
      
      // Update EOD status to 'Y' after successful submission
      if (isBackDateMode.value) {
        currentEODInfo.value.eod_status = 'Y'
      }
      
      // Refresh data after successful submission
      await Promise.all([
        checkWorkingDay(),
        fetchPendingJournals(),
        fetchEODFunctions(),
        fetchActiveUsers()
      ])
      
      // Perform post-EOD cleanup (update BACK_VALUE and MOD_NO)
      console.log('Starting post-EOD cleanup...')
      const cleanupResult = await performPostEODCleanup()
      
      if (cleanupResult.success) {
        // Show additional success message for data update
        setTimeout(() => {
          showSuccess.value = true
          successMessage.value = cleanupResult.message
        }, 2000)
        
        // Logout after cleanup if required
        if (cleanupResult.logoutRequired) {
          setTimeout(() => {
            showSuccess.value = true
            successMessage.value = 'ການປິດບັນຊີສຳເລັດສົມບູນ. ກຳລັງອອກຈາກລະບົບ...'
            startLogoutCountdown(5)
            
            // Logout after countdown
            setTimeout(async () => {
              await performLogout()
            }, 5000)
          }, 4000)
        }
      } else {
        // Show error if cleanup failed, but don't prevent EOD success
        setTimeout(() => {
          showError.value = true
          errorMessage.value = cleanupResult.error
        }, 3000)
      }
      
      return true
    }
  } catch (error) {
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
    const response = await axios.get('/api/journal-log-master/journal-log-active', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      // Handle the new response structure
      if (response.data.results) {
        pendingJournals.value = response.data.results
        console.log('Pending journals loaded:', response.data.record_count || response.data.results.length, 'records')
        console.log('Processing date:', response.data.processing_date)
        if (response.data.is_back_date) {
          console.log('Using back-date processing for:', response.data.processing_date)
        }
      } else if (Array.isArray(response.data)) {
        // Fallback for old response structure
        pendingJournals.value = response.data
        console.log('Pending journals loaded:', response.data.length, 'records')
      } else {
        pendingJournals.value = []
        console.log('Pending journals loaded: 0 records')
      }
    }
  } catch (error: any) {
    console.error("Error fetching pending journals:", error)
    pendingJournals.value = [] // Ensure it's always an array
    showError.value = true
    errorMessage.value = error.response?.data?.error || error.response?.data?.detail || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ"
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
      // Ensure active_sessions is an array
      if (Array.isArray(response.data.active_sessions)) {
        activeUsers.value = response.data.active_sessions
      } else {
        console.warn('active_sessions is not an array:', response.data.active_sessions)
        activeUsers.value = []
      }
      
      currentUser.value = response.data.own_user_id || ''
      currentUserName.value = response.data.own_user_name || ''
      currentUserRole.value = response.data.own_role_id || ''
      
      console.log('Active users loaded:', {
        total: response.data.total_count,
        unique_users: response.data.total_active_users_all,
        current_user: response.data.own_user_id,
        sessions_array_length: activeUsers.value.length
      })
    } else {
      activeUsers.value = []
      console.warn('Failed to load active users - invalid response structure')
    }
  } catch (error: any) {
    console.error("Error fetching active users:", error)
    activeUsers.value = [] // Ensure it's always an array
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
    const response = await axios.get<EODFunction[]>('/api/eoc-maintain/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        // Filter and sort EOD functions
        eodFunctions.value = response.data
          .map(func => ({ ...func, executing: false })) // Add executing state
          .sort((a, b) => a.eoc_seq_no - b.eoc_seq_no)
        console.log('EOD functions loaded:', response.data.length)
      } else {
        console.warn('EOD functions response is not an array:', response.data)
        eodFunctions.value = []
      }
    } else {
      eodFunctions.value = []
    }
  } catch (error: any) {
    console.error("Error fetching EOD functions:", error)
    eodFunctions.value = [] // Ensure it's always an array
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

// Execute individual EOD function
const executeEODFunction = async (eodFunction: EODFunction) => {
  if (!canExecuteFunction(eodFunction)) {
    showError.value = true
    errorMessage.value = 'ຟັງຊັນນີ້ບໍ່ສາມາດປະມວນຜົນໄດ້'
    return
  }

  // Set executing state - ensure eodFunctions.value is an array
  if (Array.isArray(eodFunctions.value)) {
    const functionIndex = eodFunctions.value.findIndex(f => f.eoc_id === eodFunction.eoc_id)
    if (functionIndex !== -1) {
      eodFunctions.value[functionIndex].executing = true
    }

    try {
      // Call the specific function endpoint based on function_id
      const response = await axios.post(`/api/eoc-maintain/${eodFunction.eoc_id}/execute/`, {}, {
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
      errorMessage.value = error.response?.data?.error || `ເກີດຂໍ້ຜິດພາດໃນການດຳເນີນການຟັງຊັນ ${eodFunction.function_name}`
    } finally {
      // Clear executing state
      if (functionIndex !== -1) {
        eodFunctions.value[functionIndex].executing = false
      }
    }
  } else {
    showError.value = true
    errorMessage.value = 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຟັງຊັນ EOD ໄດ້'
  }
}

// Toggle EOD function open/close
const toggleEODFunction = async (eodFunction: EODFunction) => {
  if (!canToggleFunction(eodFunction)) {
    showError.value = true
    errorMessage.value = 'ບໍ່ສາມາດປ່ຽນສະຖານະຟັງຊັນນີ້ໄດ້'
    return
  }

  try {
    const action = eodFunction.Record_Status === 'O' ? 'set_close' : 'set_open'
    const response = await axios.post(`/api/eoc-maintain/${eodFunction.eoc_id}/${action}/`, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.status === 200) {
      showSuccess.value = true
      successMessage.value = response.data.message || `ປ່ຽນສະຖານະຟັງຊັນ ${eodFunction.function_name} ສຳເລັດແລ້ວ`
      
      await fetchEODFunctions()
    }
  } catch (error: any) {
    console.error('Error toggling EOD function:', error)
    showError.value = true
    errorMessage.value = error.response?.data?.error || `ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນສະຖານະຟັງຊັນ ${eodFunction.function_name}`
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
      // Ensure activeUsers.value is an array before filtering
      if (Array.isArray(activeUsers.value)) {
        activeUsers.value = activeUsers.value.filter(session => session.user_id !== userId)
      }
      
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
    // Ensure activeUsers.value is an array before processing
    if (!Array.isArray(activeUsers.value)) {
      showError.value = true
      errorMessage.value = 'ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຜູ້ໃຊ້ໄດ້'
      return
    }

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
      return 'success'
    case 'D':
      return 'error'
    default:
      return 'grey'
  }
}

const getEODFunctionStatusIcon = (status: string): string => {
  switch(status) {
    case 'C':
      return 'mdi-pause-circle'
    case 'O':
      return 'mdi-play-circle'
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

// Execution status helpers
const getExecutionStatusColor = (func: EODFunction): string => {
  if (func.executing) return 'info'
  if (canExecuteFunction(func)) return 'success'
  if (func.Record_Status === 'C') return 'error'
  if (func.Auth_Status === 'U') return 'warning'
  return 'grey'
}

const getExecutionStatusIcon = (func: EODFunction): string => {
  if (func.executing) return 'mdi-loading'
  if (canExecuteFunction(func)) return 'mdi-check-circle'
  if (func.Record_Status === 'C') return 'mdi-pause-circle'
  if (func.Auth_Status === 'U') return 'mdi-clock-outline'
  return 'mdi-help-circle'
}

const getExecutionStatusText = (func: EODFunction): string => {
  if (func.executing) return 'ກຳລັງປະມວນຜົນ'
  if (canExecuteFunction(func)) return 'ພ້ອມປະມວນຜົນ'
  if (func.Record_Status === 'C') return 'ປິດ'
  if (func.Auth_Status === 'U') return 'ຍັງບໍ່ອະນຸມັດ'
  return 'ບໍ່ສາມາດປະມວນຜົນໄດ້'
}

// Helper function for EOD button text
const getEODButtonText = (): string => {
  if (isProcessing.value) {
    return isBackDateMode.value ? 'ກຳລັງປິດບັນຊີຍ້ອນຫຼັງ...' : 'ກຳລັງປະມວນຜົນ...'
  }
  
  if (!isWorkingDay.value && !isBackDateMode.value) {
    return 'ບໍ່ແມ່ນວັນເຮັດການ'
  }
  
  if (canStartEOD.value) {
    return isBackDateMode.value ? 'ດໍາເນີນການປິດບັນຊີຍ້ອນຫຼັງ' : 'ດໍາເນີນການປິດບັນຊີ'
  }
  
  return isBackDateMode.value ? 'ບໍ່ສາມາດດໍາເນີນການປິດບັນຊີ' : 'ບໍ່ສາມາດດໍາເນີນການປິດບັນຊີ'
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

const togglePreviousJournalDetails = (): void => {
  showPreviousJournalDetails.value = !showPreviousJournalDetails.value
}

const toggleUserDetails = (): void => {
  showUserDetails.value = !showUserDetails.value
}

const toggleEODFunctionDetails = (): void => {
  showEODFunctionDetails.value = !showEODFunctionDetails.value
}

// Updated startEODProcess method with better progress indication
const startEODProcess = async (): Promise<void> => {
  if (!canStartEOD.value) {
    showError.value = true
    errorMessage.value = isBackDateMode.value 
      ? 'ບໍ່ສາມາດເລີ່ມການປິດບັນຊີຍ້ອນຫຼັງໄດ້ ກະລຸນາແກ້ໄຂບັນຫາກ່ອນ'
      : 'ບໍ່ສາມາດເລີ່ມການປິດບັນຊີໄດ້ ກະລຸນາແກ້ໄຂບັນຫາກ່ອນ'
    return
  }
  
  isProcessing.value = true
  try {
    // First, do a final check if not in back-date mode
    if (!isBackDateMode.value) {
      await checkWorkingDay()
      
      if (!isWorkingDay.value) {
        showError.value = true
        errorMessage.value = workingDayError.value || 'ວັນນີ້ບໍ່ສາມາດປິດບັນຊີໄດ້'
        return
      }
    }
    
    // Submit the end-of-day journal (this now includes cleanup and logout)
    const success = await submitEndOfDayJournal()
    
    if (success) {
      lastUpdate.value = new Date().toLocaleString('lo-LA')
      
      // If back-date mode, refresh to potentially exit back-date mode
      if (isBackDateMode.value) {
        await checkWorkingDay()
      }
    }
  } catch (error) {
    console.error('EOD process failed:', error)
    showError.value = true
    errorMessage.value = isBackDateMode.value 
      ? 'ການປິດບັນຊີຍ້ອນຫຼັງລົ້ມເຫລວ' 
      : 'ການປິດບັນຊີລົ້ມເຫລວ'
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
/* Add these new styles */
.cleanup-progress-alert {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  border-left: 6px solid #2196F3 !important;
}

.logout-countdown-alert {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.08) 100%);
  border-left: 6px solid #FF9800 !important;
}

.logout-countdown-alert .v-progress-circular {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
}

/* Update the EOD button text helper */
.eod-button:disabled {
  opacity: 0.6 !important;
}

.eod-button .v-btn__loader {
  color: white;
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

.date-chip, .back-date-chip {
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
.warning-alert, .success-alert, .working-day-alert, .working-day-success-alert, .back-date-alert {
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

.back-date-alert {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);
  border-left: 6px solid #FF9800 !important;
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