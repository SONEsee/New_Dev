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
          <!-- Permission indicators -->
          <div class="permission-indicators" v-if="permissions">
            <v-tooltip text="ສິດເຂົ້າເຖິງຂອງທ່ານ" location="bottom">
              <template #activator="{ props }">
                <div v-bind="props" class="d-flex gap-1">
                  <v-chip
                    v-if="canView"
                    color="info"
                    size="x-small"
                    variant="flat"
                  >
                    <v-icon size="12">mdi-eye</v-icon>
                    ເບິ່ງ
                  </v-chip>
                  <v-chip
                    v-if="canEdit"
                    color="warning"
                    size="x-small"
                    variant="flat"
                  >
                    <v-icon size="12">mdi-pencil</v-icon>
                    ແກ້
                  </v-chip>
                  <v-chip
                    v-if="canDelete"
                    color="error"
                    size="x-small"
                    variant="flat"
                  >
                    <v-icon size="12">mdi-delete</v-icon>
                    ລຶບ
                  </v-chip>
                  <v-chip
                    v-if="canAuthorize"
                    color="success"
                    size="x-small"
                    variant="flat"
                  >
                    <v-icon size="12">mdi-check-circle</v-icon>
                    ອະນຸມັດ
                  </v-chip>
                </div>
              </template>
            </v-tooltip>
          </div>

          <v-btn
            variant="outlined"
            @click="$router.go(-1)"
            prepend-icon="mdi-arrow-left"
            size="default"
            class="action-btn"
          >
            ກັບ
          </v-btn>
          <v-btn
            v-if="referenceNo"
            variant="text"
            @click="loadData"
            prepend-icon="mdi-refresh"
            size="default"
            :loading="loading"
            class="action-btn"
          >
            ໂຫຼດໃໝ່
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-card class="text-center py-12" elevation="1">
        <v-progress-circular indeterminate color="primary" size="64" width="4"></v-progress-circular>
        <div class="mt-6 text-h6">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
        <div class="text-caption text-grey mt-2">ກະລຸນາລໍຖ້າສັກຄູ່</div>
      </v-card>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <v-card class="text-center py-12" elevation="1">
        <v-icon size="80" color="error" class="mb-6">mdi-alert-circle-outline</v-icon>
        <div class="text-h5 mb-3 text-error">ບໍ່ພົບຂໍ້ມູນ</div>
        <div class="text-body-1 mb-4 text-grey">{{ error }}</div>
        <div v-if="!referenceNo" class="text-caption text-grey mb-6 px-4">
          <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
          URL ຄວນມີຮູບແບບ: /glcapture/detail?Reference_No=GL-XXX-XXXXXX-XXXXX
        </div>
        <div class="d-flex justify-center gap-3">
          <v-btn
            color="primary"
            @click="loadData"
            v-if="referenceNo"
            prepend-icon="mdi-refresh"
            size="large"
          >
            ລອງໃໝ່
          </v-btn>
          <v-btn
            variant="outlined"
            @click="$router.go(-1)"
            prepend-icon="mdi-arrow-left"
            size="large"
          >
            ກັບໄປໜ້າກ່ອນ
          </v-btn>
        </div>
      </v-card>
    </div>

    <!-- Permission Denied State -->
    <div v-else-if="permissions && !canView" class="permission-denied-state">
      <v-card class="text-center py-12" elevation="1">
        <v-icon size="80" color="error" class="mb-6">mdi-shield-lock</v-icon>
        <div class="text-h5 mb-3 text-error">ບໍ່ມີສິດເຂົ້າເຖິງ</div>
        <div class="text-body-1 mb-4 text-grey">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</div>
        <div class="text-caption text-grey mb-6 px-4">
          <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
          ກະລຸນາຕິດຕໍ່ຜູ້ດູແລລະບົບເພື່ອຂໍສິດເຂົ້າເຖິງ
        </div>
        <v-btn
          variant="outlined"
          @click="$router.go(-1)"
          prepend-icon="mdi-arrow-left"
          size="large"
        >
          ກັບໄປໜ້າກ່ອນ
        </v-btn>
      </v-card>
    </div>

    <!-- Main Content -->
    <div v-else-if="selectedItem" class="main-content">
      <!-- Master Information Card -->
      <v-card class="master-card mb-6" elevation="2">

        
        <v-card-text class="master-content">
          <!-- Main Information Grid -->
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
            <!-- Balance Indicator -->
            <v-chip 
              :color="isBalanced ? 'success' : 'error'"
              variant="flat"
              size="default"
              class="balance-chip"
            >
              <v-icon left size="18">{{ isBalanced ? 'mdi-scale-balance' : 'mdi-scale-unbalanced' }}</v-icon>
              {{ isBalanced ? 'ສົມດຸນ' : 'ບໍ່ສົມດຸນ' }}
            </v-chip>

            <!-- Approval Status -->
            <v-chip 
              v-if="selectedItem?.Auth_Status === 'A'"
              color="success"
              variant="flat"
              size="default"
            >
              <v-icon left size="18">mdi-check-circle</v-icon>
              ອະນຸມັດແລ້ວ
            </v-chip>
            <v-chip 
              v-else-if="selectedItem?.Auth_Status === 'R'"
              color="error"
              variant="flat"
              size="default"
            >
              <v-icon left size="18">mdi-close-circle</v-icon>
              ປະຕິເສດແລ້ວ
            </v-chip>
            <v-chip 
              v-else-if="canApproveMaster"
              color="warning"
              variant="flat"
              size="default"
            >
              <v-icon left size="18">mdi-clock-check</v-icon>
              ພ້ອມອະນຸມັດ
            </v-chip>
            <v-chip 
              v-else-if="selectedItem?.Auth_Status === 'U'"
              color="warning"
              variant="flat"
              size="default"
            >
              <v-icon left size="18">mdi-clock-outline</v-icon>
              ລໍຖ້າອະນຸມັດ
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
                    <th class="th-account">ບັນຊີ</th>
                    <th class="th-description">ເນື້ອໃນ</th>
                    <th class="th-debit">Debit (FCY)</th>
                    <th class="th-credit">Credit (FCY)</th>
                    <th class="th-status">ສະຖານະ</th>
                    <th class="th-actions">ການກະທຳ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="(entry, index) in journalEntries" 
                    :key="entry.JRNLLog_id" 
                    :class="{ 'correction-row': entry.Auth_Status === 'P' }"
                    class="entry-row"
                  >
                    <td class="td-ref">
                      <v-chip size="small" variant="outlined" color="primary" class="ref-chip">
                        {{ entry.Reference_sub_No }}
                      </v-chip>
                    </td>
                    
                    <td class="td-account">
                      <div class="account-info">
                        <div class="account-code">{{ entry.account_code }}</div>
                        <div class="account-name">{{ entry.account_name }}</div>
                      </div>
                    </td>
                    
                    <td class="td-description">
                      <div v-if="entry.Addl_sub_text" class="description-text">
                        {{ entry.Addl_sub_text }}
                      </div>
                      <div v-else class="text-grey text-center">-</div>
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
                        <!-- Show actions only if user has permissions -->
                        <template v-if="canView">
                          <v-tooltip text="ແກ້ໄຂຄູ່ບັນທຶກ" location="top">
                            <template #activator="{ props }">
                              <v-btn
                                v-if="entry.Auth_Status === 'P' && canEdit"
                                v-bind="props"
                                icon
                                size="small"
                                variant="text"
                                color="info"
                                @click="editByPairAccount(entry)"
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
                                @click="rejectByPairAccount(entry.Reference_sub_No)"
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
                                :disabled="isDeletingPair || entry.Auth_Status === 'R'"
                                :loading="deletingRefSubNo === entry.Reference_sub_No"
                                class="action-btn-small"
                              >
                                <v-icon size="16">mdi-delete</v-icon>
                              </v-btn>
                            </template>
                          </v-tooltip>
                        </template>

                        <!-- Show message if no permissions -->
                        <template v-else>
                          <v-chip size="x-small" color="grey" variant="flat">
                            <v-icon size="12">mdi-lock</v-icon>
                            ບໍ່ມີສິດ
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
                    <td class="totals-status">
                      <v-chip 
                        :color="isBalanced ? 'success' : 'error'"
                        variant="flat"
                        size="small"
                      >
                        <v-icon size="14">{{ isBalanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
                      </v-chip>
                    </td>
                    <td class="totals-actions">
                      <v-chip 
                        v-if="canApproveMaster"
                        color="success"
                        variant="flat"
                        size="small"
                      >
                        <v-icon size="14">mdi-check-circle</v-icon>
                        ພ້ອມ
                      </v-chip>
                      <v-chip 
                        v-else
                        color="warning"
                        variant="flat"
                        size="small"
                      >
                        <v-icon size="14">mdi-alert</v-icon>
                        ບໍ່ພ້ອມ
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
          <!-- Status Alerts -->
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
              <div class="d-flex align-center justify-space-between">
                <div>
                  <strong>ບໍ່ສາມາດອະນຸມັດໄດ້:</strong> 
                  ມີລາຍການທີ່ຕ້ອງແກ້ໄຂກ່ອນ ({{ journalEntries.filter(e => e.Auth_Status === 'P').length }} ລາຍການ)
                </div>
                <v-chip color="warning" size="small" variant="flat">
                  {{ journalEntries.filter(e => e.Auth_Status === 'P').length }} ລາຍການ
                </v-chip>
              </div>
            </v-alert>

            <v-alert
              v-if="selectedItem.Auth_Status === 'A'"
              type="success"
              variant="tonal"
              density="comfortable"
              class="mb-3"
            >
              <template #prepend>
                <v-icon>mdi-check-circle</v-icon>
              </template>
              <strong>ອະນຸມັດແລ້ວ:</strong> ລາຍການນີ້ໄດ້ຮັບການອະນຸມັດແລ້ວ
            </v-alert>

            <v-alert
              v-if="selectedItem.Auth_Status === 'R'"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-3"
            >
              <template #prepend>
                <v-icon>mdi-close-circle</v-icon>
              </template>
              <strong>ປະຕິເສດແລ້ວ:</strong> ລາຍການນີ້ໄດ້ຖືກປະຕິເສດແລ້ວ
            </v-alert>
          </div>

          <!-- Action Buttons -->
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

              <!-- Show permission info if user doesn't have auth permissions -->
              <v-alert
                v-if="!canAuthorize && (selectedItem?.Auth_Status === 'U' || canApproveMaster)"
                type="info"
                variant="tonal"
                density="compact"
                class="mt-3"
              >
                <template #prepend>
                  <v-icon>mdi-shield-lock</v-icon>
                </template>
                <strong>ສິດເຂົ້າເຖິງຈຳກັດ:</strong> ທ່ານບໍ່ມີສິດອະນຸມັດ/ປະຕິເສດລາຍການ
              </v-alert>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Edit Pair Dialog -->
    <v-dialog v-model="editDialog" max-width="900px" persistent>
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
            size="default"
            color="white"
            @click="closeEditDialog"
            class="close-btn"
          ></v-btn>
        </v-card-title>

        <v-card-text class="edit-dialog-content">
          <div class="reference-info mb-6">
            <h3 class="text-subtitle-1 mb-3">ຂໍ້ມູນອ້າງອີງ:</h3>
            <v-chip color="primary" variant="outlined" size="default" class="mb-3">
              <v-icon left size="16">mdi-identifier</v-icon>
              {{ editForm.Reference_sub_No }}
            </v-chip>
            
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
                  density="comfortable"
                  prepend-inner-icon="mdi-plus"
                  clearable
                  :loading="loadingAccounts"
                  :rules="[
                    v => !editForm.relative_glsub_id || !!v || 'ກະລຸນາເລືອກບັນຊີ Debit ເມື່ອເລືອກບັນຊີ Credit',
                  ]"
                  :hint="`ມີ ${accounts.length} ບັນຊີໃຫ້ເລືອກ`"
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
                  density="comfortable"
                  prepend-inner-icon="mdi-minus"
                  clearable
                  :loading="loadingAccounts"
                  :rules="[
                    v => !editForm.glsub_id || !!v || 'ກະລຸນາເລືອກບັນຊີ Credit ເມື່ອເລືອກບັນຊີ Debit',
                  ]"
                  :hint="`ມີ ${accounts.length} ບັນຊີໃຫ້ເລືອກ`"
                  persistent-hint
                  :menu-props="{ maxHeight: 300 }"
                  :no-data-text="loadingAccounts ? 'ກຳລັງໂຫຼດ...' : 'ບໍ່ພົບຂໍ້ມູນ'"
                ></v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-alert type="info" variant="tonal" density="compact">
                  <template #prepend>
                    <v-icon size="16">mdi-information</v-icon>
                  </template>
                  <div class="text-caption">
                    ຖ້າຕ້ອງການປ່ຽນບັນຊີ, ກະລຸນາເລືອກທັງບັນຊີ Debit ແລະ Credit ພ້ອມກັນ
                    <span v-if="accounts.length === 0" class="text-warning ml-2">
                      (ຍັງບໍ່ມີບັນຊີໃຫ້ເລືອກ)
                    </span>
                  </div>
                </v-alert>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="editForm.Addl_text"
                  label="ເນື້ອໃນຫຼັກ"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-text"
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
  permissions
} = useRolePermissions()

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



const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Approve item)

// Computed
const canApprove = computed(() => {
  // Check both user permissions and authorization capability
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

// Form validation computed
const isEditFormValid = computed(() => {
  const hasAmount = editForm.value.Fcy_Amount && editForm.value.Fcy_Amount > 0
  const hasComments = editForm.value.comments && editForm.value.comments.trim().length >= 1
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
  if (!selectedItem.value || !canAuthorize.value) return false
  
  // Can only approve if master status is 'U' (pending approval)
  const isMasterPending = selectedItem.value.Auth_Status === 'U'
  
  // Cannot approve if any journal entries need correction (Auth_Status = 'P')
  const hasCorrectionsNeeded = journalEntries.value.some(entry => entry.Auth_Status === 'P')
  
  console.log('Approve validation:', {
    isMasterPending,
    hasCorrectionsNeeded,
    masterStatus: selectedItem.value.Auth_Status,
    entriesWithP: journalEntries.value.filter(entry => entry.Auth_Status === 'P').length,
    canAuthorize: canAuthorize.value,
    permissions: permissions.value
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
    const masterResponse = await axios.get('/api/journal-log-master/journal-log-active/', {
      params: { 
        Reference_No: referenceNo.value,
      },
      ...getAuthHeaders()
    })

    console.log('Master data response:', masterResponse);
    
    const masterData = masterResponse.data.results || masterResponse.data || []
    if (masterData.length === 0) {
      throw new Error('ບໍ່ພົບຂໍ້ມູນລາຍການນີ້')
    }

    selectedItem.value = masterData[0]

    console.log('Selected master item:', selectedItem.value)

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
      console.log('Ac_relatives type:', typeof journalEntries.value[0].Ac_relatives);
      
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
      if (value.trim().length < 1) {
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

    if (!editForm.value.comments || editForm.value.comments.trim().length < 1) {
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
// Corrected approve function - using master table endpoint and ID
// Simplified approve function - updates MASTER, LOG, and HIST tables
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
      // Call endpoint that updates MASTER, LOG, and HIST tables
      const response = await axios.post('/api/journal-entries/approve-all/', {
        Reference_No: item.Reference_No
      }, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: response.data.message || 'ອະນຸມັດລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      // Reload data to show updated status
      await loadData()
      
    } catch (error) {
      console.error('Error approving item:', error)
      
      let errorMessage = 'ບໍ່ສາມາດອະນຸມັດລາຍການໄດ້'
      
      if (error.response?.data?.error) {
        const backendError = error.response.data.error
        if (backendError.includes('already approved')) {
          errorMessage = 'ລາຍການນີ້ໄດ້ຮັບການອະນຸມັດແລ້ວ'
        } else if (backendError.includes('problematic entries')) {
          errorMessage = 'ມີລາຍການທີ່ມີບັນຫາ (P ຫຼື R) ບໍ່ສາມາດອະນຸມັດໄດ້'
        } else {
          errorMessage = backendError
        }
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

// Simplified reject function - updates MASTER, LOG, and HIST tables  
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
      if (value.trim().length < 1) {
        return 'ເຫດຜົນຕ້ອງມີຢ່າງນ້ອຍ 10 ຕົວອັກສອນ'
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
      // Call endpoint that updates MASTER, LOG, and HIST tables
      const response = await axios.post('/api/journal-entries/reject-all/', {
        Reference_No: item.Reference_No,
        rejection_reason: result.value.trim()
      }, getAuthHeaders())
      
      Swal.fire({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: response.data.message || 'ປະຕິເສດລາຍການສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false
      })
      
      // Reload data to show updated status
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
  console.log('Detail page mounted with query:', route.query)
  console.log('Reference_No:', referenceNo.value)
  
  // Initialize role permissions first
  await initializeRole()
  
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

// Watch for permission changes (for debugging)
watch(permissions, (newPermissions) => {
  if (newPermissions) {
    console.log('Permissions loaded:', {
      canView: canView.value,
      canEdit: canEdit.value,
      canDelete: canDelete.value,
      canAuthorize: canAuthorize.value,
      canAdd: canAdd.value,
      rawPermissions: newPermissions
    })
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
.gl-detail-page {
  padding: 20px;
  max-width: 1800px; /* Extended from 1400px to 1800px */
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Page Header Improvements */
.page-header-improved {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.page-title-improved {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  margin: 0 0 8px 0;
  line-height: 1.2;
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

.permission-indicators {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 4px 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.permission-indicators .v-chip {
  font-weight: 600;
  font-size: 0.7rem;
}

.action-btn {
  min-width: 100px;
  height: 40px;
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
}

/* Loading and Error States */
.loading-state,
.error-state,
.permission-denied-state {
  max-width: 600px;
  margin: 40px auto;
}

/* Master Card */
.master-card {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.master-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.master-info {
  flex: 1;
}

.master-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.master-meta {
  font-size: 0.9rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
}

.status-chip {
  color: white !important;
  font-weight: 600;
  padding: 8px 16px;
  height: auto;
}

.master-content {
  padding: 28px !important;
}

/* Info Grid Improvements */
.info-grid-improved {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 28px;
}

.info-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
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
  padding: 2px 0;
}

.info-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 140px;
  flex-shrink: 0;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin-left: 16px;
}

/* Amount Cards */
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

.amount-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.amount-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.amount-currency {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Description Section */
.description-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.description-content {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #374151;
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* Entries Card */
.entries-card {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.entries-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.entries-info {
  flex: 1;
}

.entries-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.entries-warning {
  margin-top: 4px;
}

.entries-status {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.balance-chip {
  font-weight: 600;
}

/* Table Improvements */
.table-wrapper {
  background: white;
}

.table-container {
  overflow-x: auto;
  border-radius: 0;
}

.entries-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
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
  letter-spacing: 0.5px;
  border: none;
}

.th-ref { width: 140px; }
.th-account { width: 200px; }
.th-description { width: 220px; }
.th-debit { width: 140px; text-align: right; }
.th-credit { width: 140px; text-align: right; }
.th-status { width: 80px; text-align: center; }
.th-actions { width: 140px; text-align: center; }

.entries-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.entry-row {
  transition: all 0.2s ease;
}

.entry-row:hover {
  background-color: #f8fafc;
}

.entry-row:last-child td {
  border-bottom: none;
}

/* Cell Styles */
.ref-chip {
  font-size: 0.75rem;
  font-weight: 600;
}

.account-info {
  display: flex;
  flex-direction: column;
}

.account-code {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.account-name {
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.2;
}

.description-text {
  font-size: 0.85rem;
  line-height: 1.4;
  color: #374151;
  max-width: 200px;
  word-wrap: break-word;
}

.amount-display {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: right;
}

.amount-display.debit {
  color: #dc2626;
}

.amount-display.credit {
  color: #059669;
}

.status-mini-chip {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
}

/* Action Buttons */
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
  transition: all 0.2s ease;
}

.action-btn-small:hover {
  transform: scale(1.1);
}

/* Totals Row */
.totals-row {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-top: 2px solid #cbd5e1;
  font-weight: 700;
}

.totals-row td {
  padding: 16px 12px;
  font-size: 0.95rem;
  border-bottom: none;
}

.totals-label {
  color: #374151;
}

.total-amount {
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-weight: 700;
  font-size: 1rem;
  text-align: right;
}

.total-amount.debit {
  color: #dc2626;
}

.total-amount.credit {
  color: #059669;
}

/* Correction Row Styling */
.correction-row {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border-left: 4px solid #ef4444 !important;
}

.correction-row:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
}

.correction-row td {
  color: #dc2626;
}

/* Action Panel */
.action-panel {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.status-alerts .v-alert {
  border-radius: 12px;
  border: 1px solid;
}

.action-buttons-main {
  display: flex;
  justify-content: center;
}

.buttons-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.primary-action-btn {
  min-width: 180px;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-transform: none;
  transition: all 0.2s ease;
}

.primary-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* Edit Dialog */
.edit-dialog-card {
  border-radius: 16px;
  overflow: hidden;
}

.edit-dialog-header {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.dialog-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.dialog-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
}

.close-btn {
  margin-left: 16px;
}

.edit-dialog-content {
  padding: 28px !important;
}

.reference-info {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.edit-form {
  margin-top: 8px;
}

.edit-dialog-actions {
  padding: 20px 28px !important;
  background: #f8fafc;
}

.action-btn-dialog {
  min-width: 120px;
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: none;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .gl-detail-page {
    max-width: 100%;
    padding: 16px;
  }
}

@media (max-width: 1024px) {
  .info-grid-improved {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .amount-cards {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .entries-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .gl-detail-page {
    padding: 12px;
  }
  
  .page-header-improved {
    padding: 16px;
  }
  
  .page-title-improved {
    font-size: 1.4rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
  }
  
  .master-header {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .master-content {
    padding: 20px !important;
  }
  
  .info-section {
    padding: 16px;
  }
  
  .entries-header {
    padding: 16px;
  }
  
  .entries-table th,
  .entries-table td {
    padding: 12px 8px;
    font-size: 0.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-btn-small {
    width: 28px;
    height: 28px;
    min-width: 28px;
  }
  
  .buttons-group {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  
  .primary-action-btn {
    width: 100%;
    min-width: auto;
  }
  
  .edit-dialog-header {
    padding: 20px;
  }
  
  .edit-dialog-content {
    padding: 20px !important;
  }
  
  .edit-dialog-actions {
    padding: 16px 20px !important;
    flex-direction: column;
    gap: 12px;
  }
  
  .action-btn-dialog {
    width: 100%;
    min-width: auto;
  }
}

/* Enhanced animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.master-card {
  animation: fadeInUp 0.4s ease-out;
}

.entries-card {
  animation: fadeInUp 0.4s ease-out 0.1s both;
}

.action-panel {
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.entry-row {
  animation: slideIn 0.3s ease-out;
}

/* Enhanced focus styles for accessibility */
.action-btn:focus,
.action-btn-small:focus,
.primary-action-btn:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .gl-detail-page {
    max-width: none;
    padding: 0;
    background: white;
  }
  
  .page-header-improved,
  .action-panel {
    display: none;
  }
  
  .master-card,
  .entries-card {
    box-shadow: none;
    border: 1px solid #000;
    break-inside: avoid;
  }
  
  .entries-table {
    font-size: 0.8rem;
  }
  
  .action-buttons {
    display: none;
  }
  .totals-row {
    font-weight: 700;
    background: #f1f5f9;
  }
}
</style>