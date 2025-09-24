<template>
  <div class="journal-entry-container">
    <!-- Working Day Status Alert -->
    <v-alert
      v-if="!isAvailable || error"
      :type="!isAvailable ? 'error' : 'warning'"
      class="mb-4"
      :loading="pending"
      prominent
      border="start"
      variant="tonal"
    >
      <v-alert-title class="d-flex align-center">
        <v-icon class="mr-2">{{ !isAvailable ? 'mdi-calendar-remove' : 'mdi-information' }}</v-icon>
        {{ !isAvailable ? 'ມື້ນີ້ບໍ່ສາມາດບັນທຶກບັນຊີໄດ້' : 'ແຈ້ງເຕືອນ' }}
      </v-alert-title>
      <div class="mt-2">
        {{ error ? error.message : permissionReason }}
      </div>
      
      <!-- Enhanced EOD Info Display -->
      <div v-if="currentEod" class="mt-3 pa-2 bg-grey-lighten-4 rounded">
        <v-row dense>
          <v-col cols="6" md="3">
            <v-chip size="small" :color="isAvailable ? 'success' : 'warning'" variant="flat">
              <v-icon left size="small">mdi-calendar-check</v-icon>
              EOD Status: {{ currentEod.eod_status === 'Y' ? 'Completed' : 'Open' }}
            </v-chip>
          </v-col>
          <v-col cols="6" md="3">
            <v-chip size="small" :color="backValueEnabled ? 'success' : 'info'" variant="flat">
              <v-icon left size="small">mdi-calendar-edit</v-icon>
              BACK_VALUE: {{ backValueEnabled ? 'Y' : 'N' }}
            </v-chip>
          </v-col>
          <v-col cols="12" md="6">
            <span class="text-caption text-grey-darken-1">
              <v-icon size="small" class="mr-1">mdi-information-outline</v-icon>
              {{ isBackDate ? `ໃຊ້ວັນທີ່ຍ້ອນຫຼັງ: ${targetDate}` : `ວັນທີ່ປະຈຸບັນ: ${targetDate}` }}
            </span>
          </v-col>
        </v-row>
      </div>
      
      <template #append>
        <v-btn
          size="small"
          variant="outlined"
          :color="!isAvailable ? 'error' : 'info'"
          @click="refresh"
          :loading="pending"
        >
          <v-icon left size="small">mdi-refresh</v-icon>
          ກວດສອບໃໝ່
        </v-btn>
      </template>
    </v-alert>

    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">
        <v-icon left color="primary">mdi-book-open-page-variant</v-icon>
        ລາຍການບັນທຶກບັນຊີ
        <v-chip v-if="isBackDate" size="small" color="warning" variant="flat" class="ml-2">
          <v-icon left size="small">mdi-history</v-icon>
          Back Date Entry
        </v-chip>
      </h2>
    </div>

    <!-- Main Form Card -->
    <v-card class="form-card" elevation="2" :disabled="!isAvailable">
      <v-card-text class="pa-4">
        <v-form ref="form" v-model="valid" lazy-validation>
          <!-- Basic Information Section -->
          <div class="form-section">
            <h3 class="section-title">
              <v-icon left color="primary" size="small">mdi-information</v-icon>
              ຂໍ້ມູນພື້ນຖານ
            </h3>
            <v-row dense>
              <v-col cols="12" md="2">
                <v-text-field 
                  v-model="journalData.Value_date" 
                  label="ວັນທີ *" 
                  type="date" 
                  variant="outlined"
                  density="compact" 
                  @change="updateReferenceNumber" 
                  prepend-inner-icon="mdi-calendar"
                  hide-details="auto"
                  :disabled="isValueDateDisabled"
                  :class="{ 'value-date-disabled': isValueDateDisabled }"
                >
                  <template #append-inner v-if="isValueDateDisabled">
                    <v-tooltip text="ວັນທີ່ຖືກກຳນົດໂດຍລະບົບ EOD">
                      <template #activator="{ props }">
                        <v-icon v-bind="props" size="small" color="warning">mdi-lock</v-icon>
                      </template>
                    </v-tooltip>
                  </template>
                </v-text-field>
                <!-- Date Info Display -->
                <div v-if="targetDate" class="text-caption text-info mt-1 pl-2">
                  <v-icon size="x-small" class="mr-1">mdi-calendar-today</v-icon>
                  {{ isBackDate ? 'ວັນທີ່ຍ້ອນຫຼັງ' : 'ວັນທີ່ປະຈຸບັນ' }}: {{ formatDisplayDate(targetDate) }}
                </div>
              </v-col>

              <v-col cols="12" md="2">
                <v-autocomplete
                  v-model="journalData.module_id" 
                  :items="modules" 
                  item-title="module_name_la"
                  item-value="module_Id" 
                  label="ໂມດູນ *" 
                  :rules="requiredRules" 
                  variant="outlined" 
                  density="compact"
                  :loading="loading.modules" 
                  @update:model-value="onModuleChange" 
                  prepend-inner-icon="mdi-cube-outline"
                  hide-details="auto" 
                  no-data-text="ບໍ່ມີຂໍ້ມູນໂມດູນ" 
                  class="module-field"
                  clearable
                  hide-no-data
                  :disabled="!isAvailable"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" class="compact-item"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="journalData.Txn_code" 
                  :items="transactionCodes" 
                  item-title="txn_display"
                  item-value="trn_code" 
                  label="ລະຫັດການເຄື່ອນໄຫວ *" 
                  :rules="requiredRules" 
                  variant="outlined"
                  density="compact" 
                  :loading="loading.transactionCodes"
                  @update:model-value="onTransactionCodeChange" 
                  prepend-inner-icon="mdi-code-tags" 
                  hide-details="auto"
                  no-data-text="ບໍ່ມີຂໍ້ມູນລະຫັດການເຄື່ອນໄຫວ"
                  clearable
                  hide-no-data
                  :disabled="!isAvailable"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" class="compact-item"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="2">
                <v-autocomplete
                  v-model="journalData.Ccy_cd" 
                  :items="currencies" 
                  item-title="Ccy_Name_la"
                  item-value="ccy_code" 
                  label="ສະກຸນເງິນ *" 
                  :rules="requiredRules" 
                  variant="outlined"
                  density="compact" 
                  :loading="loading.currencies" 
                  @update:model-value="onMainCurrencyChange"
                  prepend-inner-icon="mdi-currency-usd" 
                  hide-details="auto" 
                  no-data-text="ບໍ່ມີຂໍ້ມູນສະກຸນເງິນ"
                  class="currency-field"
                  clearable
                  hide-no-data
                  :disabled="!isAvailable"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" class="compact-item"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field 
                  v-model="journalData.Reference_No" 
                  label="ເລກອ້າງອີງ *" 
                  :rules="referenceRules"
                  :disabled="autoReferenceMode || !isAvailable" 
                  variant="outlined" 
                  density="compact" 
                  counter="30"
                  prepend-inner-icon="mdi-identifier" 
                  hide-details="auto"
                  :placeholder="referencePlaceholder"
                />
              </v-col>
            </v-row>

            <!-- Enhanced Description Fields Row -->
            <v-row dense class="mt-2">
              <v-col cols="12" md="4">
                <v-select 
                  v-model="journalData.fin_cycle" 
                  :items="finCycles" 
                  item-title="cycle_display"
                  item-value="fin_cycle" 
                  label="ຮອບການເງິນ" 
                  :rules="finCycleRules"
                  variant="outlined" 
                  density="compact"
                  :loading="loading.finCycles" 
                  @update:model-value="loadPeriodCodes"
                  prepend-inner-icon="mdi-calendar-range" 
                  hide-details="auto" 
                  no-data-text="ບໍ່ມີຂໍ້ມູນຮອບການເງິນ"
                  :disabled="!isAvailable"
                >
                  <template #append-inner>
                    <v-btn 
                      icon 
                      size="x-small" 
                      variant="text" 
                      color="info" 
                      @click="refreshAutoSelection"
                      title="ເລືອກອັດຕະໂນມັດຕາມປີປັດຈຸບັນ"
                      :disabled="!isAvailable"
                    >
                      <v-icon size="small">mdi-refresh-auto</v-icon>
                    </v-btn>
                  </template>
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #append v-if="item.raw.fin_cycle.toString().includes(getTargetYear().toString())">
                        <v-chip size="x-small" color="success" variant="flat">
                          <v-icon size="x-small">mdi-calendar-today</v-icon>
                          ປີນີ້
                        </v-chip>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select 
                  v-model="journalData.Period_code" 
                  :items="periodCodes" 
                  item-title="period_display"
                  item-value="period_code" 
                  label="ລະຫັດໄລຍະ" 
                  :rules="periodCodeRules"
                  variant="outlined" 
                  density="compact"
                  :loading="loading.periodCodes" 
                  :disabled="!journalData.fin_cycle || !isAvailable"
                  prepend-inner-icon="mdi-calendar-clock" 
                  hide-details="auto" 
                  no-data-text="ບໍ່ມີຂໍ້ມູນລະຫັດໄລຍະ"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props"></v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="journalData.Addl_text"
                  label="ຂໍ້ຄວາມເພີ່ມເຕີມ (ຫຼັກ)"
                  variant="outlined"
                  density="compact"
                  counter="255"
                  :rules="addlTextRules"
                  prepend-inner-icon="mdi-text"
                  hide-details="auto"
                  placeholder="ໃສ່ຂໍ້ຄວາມເພີ່ມເຕີມຫຼັກ..."
                  @input="onMainDescriptionChange"
                  :disabled="!isAvailable"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Exchange Rate Info -->
          <div class="exchange-rate-info" v-if="journalData.Ccy_cd && journalData.Ccy_cd !== 'LAK'">
            <v-chip :color="exchangeRate > 1 ? 'success' : 'warning'" variant="flat" size="small">
              <v-icon left size="small">mdi-calculator</v-icon>
              ອັດຕາແລກປ່ຽນ: 1 {{ journalData.Ccy_cd }} = {{ formatNumber(exchangeRate) }} LAK
            </v-chip>
            <v-btn 
              size="x-small" 
              variant="text" 
              color="info" 
              @click="onMainCurrencyChange"
              :loading="loading.exchangeRate" 
              class="ml-2"
              :disabled="!isAvailable"
            >
              <v-icon size="small">mdi-refresh</v-icon>
              ໂຫລດໃໝ່
            </v-btn>
          </div>

          <!-- Journal Entries Section -->
          <div class="entries-section">
            <div class="section-header">
              <h3 class="entries-title">
                <v-icon left color="primary" size="small">mdi-table-row</v-icon>
                ລາຍການບັນທຶກ (Journal Entries)
              </h3>
              <div class="section-actions">
                <v-btn 
                  color="primary" 
                  size="small" 
                  variant="outlined" 
                  @click="addJournalEntry"
                  :disabled="loading.submit || !isAvailable" 
                  class="action-btn"
                >
                  <v-icon left size="small">mdi-plus</v-icon>
                  ເພີ່ມແຖວ
                </v-btn>
                <v-btn 
                  color="secondary" 
                  size="small" 
                  variant="text" 
                  @click="addQuickEntry" 
                  :disabled="loading.submit || !isAvailable"
                  class="action-btn"
                >
                  <v-icon left size="small">mdi-lightning-bolt</v-icon>
                  ເພີ່ມໄວ
                </v-btn>
                <v-btn 
                  color="info" 
                  size="small" 
                  variant="text" 
                  @click="fillSubTextFromMain"
                  :disabled="loading.submit || !journalData.Addl_sub_text || !isAvailable"
                  class="action-btn"
                >
                  <v-icon left size="small">mdi-format-text</v-icon>
                  ຕື່ມລາຍລະອຽດ
                </v-btn>
                <v-btn 
                  color="success" 
                  size="small" 
                  variant="text" 
                  @click="refreshAccounts"
                  :loading="loading.debitAccounts || loading.creditAccounts"
                  class="action-btn"
                  title="Refresh account lists"
                  :disabled="!isAvailable"
                >
                  <v-icon left size="small">mdi-refresh</v-icon>
                  ໂຫລດບັນຊີ
                </v-btn>
              </div>
            </div>

            <!-- Table Header -->
            <div class="entry-header-row">
              <div class="header-cell account-col">ບັນຊີເດບິດ</div>
              <div class="header-cell account-col">ບັນຊີເຄຣດິດ</div>
              <div class="header-cell amount-col">ຈຳນວນ</div>
              <div class="header-cell lcy-col">ຈຳນວນກີບ</div>
              <div class="header-cell text-col">ຂໍ້ຄວາມເພີ່ມເຕີມ</div>
              <div class="header-cell action-col">ຈັດການ</div>
            </div>

            <!-- Empty State -->
            <div v-if="journalEntries.length === 0" class="empty-state">
              <v-icon color="grey" size="large">mdi-table-row-plus-after</v-icon>
              <div class="empty-text">
                <h4>ຍັງບໍ່ມີລາຍການ</h4>
                <p>ກົດປຸ່ມ "ເພີ່ມແຖວ" ເພື່ອເພີ່ມລາຍການບັນທຶກບັນຊີ</p>
              </div>
            </div>

            <!-- Journal Entry Rows -->
            <div v-for="(entry, index) in journalEntries" :key="`entry-${index}`" class="journal-entry-row">
              <v-card outlined class="entry-card">
                <v-card-text class="pa-2">
                  <v-row dense align="stretch" class="entry-row-fields">
                    <!-- Row Number -->
                    <v-col cols="auto" class="row-number">
                      <v-chip size="small" color="primary" variant="outlined">
                        #{{ index + 1 }}
                      </v-chip>
                    </v-col>

                    <!-- Debit Account -->
                    <v-col cols="12" sm="6" md="3">
                      <v-autocomplete
                        v-model="entry.DebitAccount"
                        :items="debitAccounts"
                        item-title="account_display"
                        item-value="glsub_id"
                        label="ບັນຊີເດບິດ"
                        variant="outlined"
                        density="compact"
                        :loading="loading.debitAccounts"
                        clearable
                        hide-details="auto"
                        @update:model-value="onAccountChange(entry, 'DebitAccount')"
                        no-data-text="ບໍ່ມີຂໍ້ມູນບັນຊີ"
                        :disabled="loading.debitAccounts || !isAvailable"
                      >
                      </v-autocomplete>
                      <div v-if="entry.DebitAccount" class="text-caption text-grey-darken-1 pl-2 pb-1 text-styles">
                        {{ getAccountDesc(entry.DebitAccount, 'debit') }}
                        <span class="ml-2 text-primary">
                          ({{ getAccountPostSide(entry.DebitAccount, 'debit') }})
                        </span>
                      </div>
                    </v-col>

                    <!-- Credit Account -->
                    <v-col cols="12" sm="6" md="3">
                      <v-autocomplete
                        v-model="entry.CreditAccount"
                        :items="creditAccounts"
                        item-title="account_display"
                        item-value="glsub_id"
                        label="ບັນຊີເຄຣດິດ"
                        variant="outlined"
                        density="compact"
                        :loading="loading.creditAccounts"
                        clearable
                        hide-details="auto"
                        @update:model-value="onAccountChange(entry, 'CreditAccount')"
                        no-data-text="ບໍ່ມີຂໍ້ມູນບັນຊີ"
                        :disabled="loading.creditAccounts || !isAvailable"
                      >
                      </v-autocomplete>
                      <div v-if="entry.CreditAccount" class="text-caption text-grey-darken-1 pl-2 pb-1 text-styles">
                        {{ getAccountDesc(entry.CreditAccount, 'credit') }}
                        <span class="ml-2 text-secondary">
                          ({{ getAccountPostSide(entry.CreditAccount, 'credit') }})
                        </span>
                      </div>
                    </v-col>

                    <!-- Amount -->
                    <v-col cols="12" sm="6" md="2">
                      <v-text-field
                        v-model.number="entry.Fcy_Amount"
                        label="ຈຳນວນ *"
                        type="number"
                        :rules="amountRules"
                        variant="outlined"
                        density="compact"
                        step="0.001"
                        @update:model-value="() => calculateLcyAmount(entry)"
                        @blur="() => calculateLcyAmount(entry)"
                        hide-details="auto"
                        class="amount-field"
                        placeholder="0.00"
                        :disabled="!isAvailable"
                      ></v-text-field>
                    </v-col>

                    <!-- Additional Sub Text -->
                    <v-col cols="12" sm="12" md="2">
                      <v-text-field
                        v-model="entry.Addl_sub_text"
                        label="ຂໍ້ຄວາມເພີ່ມເຕີມ"
                        variant="outlined"
                        density="compact"
                        hide-details="auto"
                        counter="255"
                        :rules="entrySubTextRules"
                        placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
                        class="entry-sub-text-field"
                        @blur="onEntrySubTextBlur(entry, index)"
                        :disabled="!isAvailable"
                      >
                        <template #append-inner>
                          <v-menu>
                            <template #activator="{ props }">
                              <v-btn
                                icon
                                size="x-small"
                                variant="text"
                                color="info"
                                v-bind="props"
                                :disabled="(!journalData.Addl_sub_text && subTextSuggestions.length === 0) || !isAvailable"
                              >
                                <v-icon size="small">mdi-dots-vertical</v-icon>
                              </v-btn>
                            </template>
                            <v-list density="compact">
                              <v-list-item
                                v-if="journalData.Addl_sub_text"
                                @click="entry.Addl_sub_text = journalData.Addl_sub_text"
                                title="ໃຊ້ຂໍ້ຄວາມຫຼັກ"
                              >
                                <template #prepend>
                                  <v-icon size="small">mdi-content-copy</v-icon>
                                </template>
                              </v-list-item>
                              <v-list-item
                                v-for="(suggestion, idx) in subTextSuggestions.slice(0, 3)"
                                :key="idx"
                                @click="entry.Addl_sub_text = suggestion"
                                :title="suggestion"
                              >
                                <template #prepend>
                                  <v-icon size="small">mdi-lightbulb-outline</v-icon>
                                </template>
                              </v-list-item>
                              <v-list-item
                                @click="entry.Addl_sub_text = generateAutoDescription(entry)"
                                title="ສ້າງອັດຕະໂນມັດ"
                              >
                                <template #prepend>
                                  <v-icon size="small">mdi-auto-fix</v-icon>
                                </template>
                              </v-list-item>
                            </v-list>
                          </v-menu>
                        </template>
                      </v-text-field>
                    </v-col>

                    <!-- Actions -->
                    <v-col cols="auto">
                      <div class="entry-actions">
                        <v-btn
                          icon
                          size="small"
                          color="info"
                          variant="text"
                          @click="duplicateEntry(index)"
                          :disabled="loading.submit || !isAvailable"
                          title="ຄັດລອກແຖວ"
                        >
                          <v-icon size="small">mdi-content-duplicate</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          size="small"
                          color="error"
                          @click="removeJournalEntry(index)"
                          :disabled="loading.submit || !isAvailable"
                          title="ລຶບແຖວ"
                        >
                          <v-icon size="small">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Enhanced Entry Status -->
                  <div class="entry-status" v-if="entry.Fcy_Amount > 0">
                    <v-chip size="x-small" :color="getEntryStatusColor(entry)" variant="flat" class="mr-2">
                      {{ getEntryStatus(entry) }}
                    </v-chip>
                    <span class="text-caption text-grey">
                      ເດບິດ: {{ getAccountName(entry.DebitAccount) || 'ບໍ່ໄດ້ເລືອກ' }} |
                      ເຄຣດິດ: {{ getAccountName(entry.CreditAccount) || 'ບໍ່ໄດ້ເລືອກ' }}
                    </span>
                    <div v-if="entry.Addl_sub_text" class="entry-description mt-1">
                      <v-icon size="x-small" color="info" class="mr-1">mdi-text-box-outline</v-icon>
                      <span class="text-caption text-info">{{ entry.Addl_sub_text }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Compact Summary Section -->
          <div class="summary-section-compact" v-if="journalEntries.length > 0">
            <v-row dense class="summary-row-compact">
              <v-col cols="6" sm="3">
                <div class="summary-item-compact primary">
                  <div class="summary-label-compact">ລາຍການ</div>
                  <div class="summary-value-compact">{{ journalEntries.length }}</div>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="summary-item-compact success">
                  <div class="summary-label-compact">ເດບິດ</div>
                  <div class="summary-value-compact">{{ formatNumber(totalDebitAmount) }}</div>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="summary-item-compact info">
                  <div class="summary-label-compact">ເຄຣດິດ</div>
                  <div class="summary-value-compact">{{ formatNumber(totalCreditAmount) }}</div>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="summary-item-compact" :class="isBalanced ? 'success' : 'error'">
                  <div class="summary-label-compact">ສະຖານະ</div>
                  <div class="summary-value-compact">
                    <v-icon size="x-small" class="mr-1">{{ isBalanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
                    {{ isBalanced ? 'ສົມດຸນ' : 'ບໍ່ສົມດຸນ' }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Compact Action Buttons -->
          <div class="action-buttons-compact">
            <div class="primary-actions">
              <v-btn 
                color="primary" 
                size="default" 
                :disabled="!isFormValid || loading.submit || !isAvailable"
                @click="submitJournal" 
                :loading="loading.submit"
                class="submit-btn-compact"
              >
                <v-icon left size="small">mdi-content-save</v-icon>
                ບັນທຶກ ({{ apiEntriesCount }})
              </v-btn>
              
              <v-btn 
                variant="outlined" 
                size="default" 
                @click="resetForm" 
                :disabled="loading.submit || !isAvailable"
                class="secondary-btn-compact"
              >
                <v-icon left size="small">mdi-refresh</v-icon>
                ລ້າງຟອມ
              </v-btn>
            </div>
            
            <div class="secondary-actions">
              <v-btn
                variant="outlined"
                size="default"
                @click="$router.go(-1)"
                prepend-icon="mdi-arrow-left"
                class="secondary-btn-compact"
              >
                ກັບ
              </v-btn>
            </div>
          </div>

          <!-- Loading States -->
          <v-row v-if="loading.debitAccounts || loading.creditAccounts">
            <v-col cols="12">
              <v-alert type="info" variant="tonal">
                <v-progress-circular indeterminate size="small" class="mr-2"></v-progress-circular>
                ກຳລັງໂຫຼດຂໍ້ມູນບັນຊີ...
              </v-alert>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'  
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'
import { useAuthCheck } from "@/composables/useAuthCheck"

// Router
const router = useRouter()
useAuthCheck();
// Use the updated journal permission composable
const {
  data: permissionData,
  pending,
  error,
  isAvailable,
  permissionReason,
  targetDate,
  isBackDate,
  backValueEnabled,
  currentEod,
  bypassInfo,
  isBypassActive,
  checkPermission,
  refresh,
  clearError
} = useJournalPermission()

// Reactive state
const valid = ref(true)
const formRef = ref(null)
const autoReferenceMode = ref(false)
const selectedTemplate = ref(null)
const debitAccounts = ref([])
const creditAccounts = ref([])

// Computed property for value date disabled state
const isValueDateDisabled = computed(() => {
  // Disable value date input if we have a target date from the API
  return !!targetDate.value
})

const journalData = reactive({
  Reference_No: '',
  module_id: 'GL',
  Ccy_cd: 'LAK',
  Txn_code: null,
  Value_date: new Date().toISOString().substr(0, 10),
  Addl_text: '',
  Addl_sub_text: '',
  fin_cycle: null,
  Period_code: null
})

const exchangeRate = ref(1)

const loading = reactive({
  modules: false,
  currencies: false,
  accounts: false,
  transactionCodes: false,
  finCycles: false,
  periodCodes: false,
  submit: false,
  generateRef: false,
  checkBalance: false,
  exchangeRate: false,
  debitAccounts: false,
  creditAccounts: false,
})

const journalEntries = ref([])
const modules = ref([])
const currencies = ref([])
const accounts = ref([])
const transactionCodes = ref([])
const finCycles = ref([])
const periodCodes = ref([])
const subTextSuggestions = ref([])

// Updated computed properties to use target date
const getTargetYear = () => {
  if (targetDate.value) {
    return new Date(targetDate.value).getFullYear()
  }
  return new Date().getFullYear()
}

const getTargetMonth = () => {
  if (targetDate.value) {
    return new Date(targetDate.value).getMonth() + 1
  }
  return new Date().getMonth() + 1
}

const getTargetPeriodCode = computed(() => {
  const year = getTargetYear()
  const month = getTargetMonth().toString().padStart(2, '0')
  return `${year}${month}`
})

// Helper method to format display date
const formatDisplayDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const descriptionTemplates = ref([
  { label: 'ການໂອນເງິນ', main: 'ການໂອນເງິນລະຫວາງບັນຊີ', sub: 'ການໂອນເງິນປົກ຺ະຕິ' },
  { label: 'ການຈ່າຍເງິນເດືອນ', main: 'ການຈ່າຍເງິນເດືອນພະນັກງານ', sub: 'ເງິນເດືອນປະຈຳເດືອນ' },
  { label: 'ຄ່າໃຊຈ່າຍ', main: 'ຄ່າໃຊ້ຈາຍດຫາເນີນງານ', sub: 'ຄ່າໃຊ້ຈາຍປົກກະຕິ' },
  { label: 'ລາຍຮັບ', main: 'ລາຍຮັບຈາກການຂາຍ', sub: 'ລາຍຮັບປົກກະຕິ' },
  { label: 'ການປິດບັນຊີ', main: 'ການປິດບັນຊີປະຈຳເດືອນ', sub: 'ການປິດບັນຊິຕາມປົກກະຕິ' }
])

const entryTemplates = ref([
  {
    name: 'ໂອນເງິນສົດ',
    entries: [
      { DebitAccount: null, CreditAccount: null, Fcy_Amount: 0, Addl_sub_text: 'ໂອນເງິນສົດເຖົາບັນຊີ' },
      { DebitAccount: null, CreditAccount: null, Fcy_Amount: 0, Addl_sub_text: 'ໂອນເງິນສົດອອກຈາກບັນຊີ' }
    ]
  },
  {
    name: 'ຈ່າຍເງິນເດືອນ',
    entries: [
      { DebitAccount: null, CreditAccount: null, Fcy_Amount: 0, Addl_sub_text: 'ເງິນເດືອນພະນັກງານ' },
      { DebitAccount: null, CreditAccount: null, Fcy_Amount: 0, Addl_sub_text: 'ເງິນຝາກບັນຊີ' }
    ]
  }
])

// Validation rules
const requiredRules = [
  v => !!v || 'ຈຳເປັນຕ້ອງເພີ່ມຂໍ້ມູນ'
]

const referenceRules = [
  v => !!v || 'ຈຳເປັນຕ້ອງເພີ່ມເລກອ້າງອີງ',
  v => (v && v.length <= 30) || 'ເລກອ້າງອີງຕ້ອງບໍ່ເກີນ 30 ໂຕອັກສອນ'
]

const amountRules = [
  v => !!v || 'ຈຳເປັນຕ້ອງເພີ່ມຈຳນວນເງິນ',
  v => v > 0 || 'ຈຳນວນເງິນຕ້ອງມາກກວ່າ 0'
]

const addlTextRules = [
  v => !v || v.length <= 255 || 'ຂໍ້ຄວາມເພີ່ມເຕີມຕ້ອງບໍ່ເກີນ 255 ຕົວອັກສອນ',
  v => !v || !/[<>]/.test(v) || 'ບໍ່ອະນຸຍາດໃຫ້ໃຊ້ສັນຍາລັກ < ແລະ >'
]

const addlSubTextRules = [
  v => !v || v.length <= 255 || 'ຂໍ້ຄວາມເພີ່ມເຕີມຕ້ອງບໍ່ເກີນ 255 ຕົວອັກສອນ',
  v => !v || !/[<>]/.test(v) || 'ບໍ່ອະນຸຍາດໃຫ້ໃຊ້ສັນຍາລັກ < ແລະ >'
]

const entrySubTextRules = [
  v => !v || v.length <= 255 || 'ລາຍລະອຽດຕ້ອງບໍ່ເກີນ 255 ຕົວອັກສອນ',
  v => !v || !/[<>]/.test(v) || 'ບໍ່ອະນຸຍາດໃຫ້ໃຊ້ສັນຍາລັກ < ແລະ >'
]

const finCycleRules = [
  v => !!v || 'ກະລຸນາເຮລືອກຮອບການເງິນ'
]

const periodCodeRules = [
  v => !!v || 'ກະລຸນາເຖືອກລະຫັດໄລຍະ'
]

// API configuration
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Computed properties
const totalDebitAmount = computed(() => {
  return journalEntries.value.reduce((sum, entry) => {
    const amount = getLcyAmount(entry)
    return sum + (entry.DebitAccount && amount > 0 ? amount : 0)
  }, 0)
})

const totalCreditAmount = computed(() => {
  return journalEntries.value.reduce((sum, entry) => {
    const amount = getLcyAmount(entry)
    return sum + (entry.CreditAccount && amount > 0 ? amount : 0)
  }, 0)
})

const balanceDifference = computed(() => totalDebitAmount.value - totalCreditAmount.value)

const isBalanced = computed(() => {
  return Math.abs(balanceDifference.value) < 0.01 &&
    totalDebitAmount.value > 0 &&
    totalCreditAmount.value > 0
})

const getLcyAmount = (entry) => {
  const fcyAmount = parseFloat(entry.Fcy_Amount) || 0
  const rate = parseFloat(exchangeRate.value) || 1
    return fcyAmount * rate
}

const apiEntriesCount = computed(() => {
  let count = 0
  journalEntries.value.forEach(entry => {
    if (parseFloat(entry.Fcy_Amount) > 0) {
      if (entry.DebitAccount) count++
      if (entry.CreditAccount) count++
    }
  })
  return count
})

const entriesWithDescription = computed(() => {
  return journalEntries.value.filter(entry => entry.Addl_sub_text && entry.Addl_sub_text.trim()).length
})

const isFormValid = computed(() => {
  if (!valid.value || journalEntries.value.length === 0 || !isAvailable.value) {
    return false
  }

  if (
    !journalData.Reference_No ||
    !journalData.Ccy_cd ||
    !journalData.Txn_code ||
    !journalData.module_id ||
    !journalData.fin_cycle ||
    !journalData.Period_code
  ) {
    return false
  }

  if (!journalData.Addl_text && !journalData.Addl_sub_text) {
    const hasEntryDescription = journalEntries.value.some(entry => entry.Addl_sub_text && entry.Addl_sub_text.trim())
    if (!hasEntryDescription) {
      return false
    }
  }

  const validEntries = journalEntries.value.every(entry => {
    const hasValidAmount = entry.Fcy_Amount && parseFloat(entry.Fcy_Amount) > 0
    const hasAccount = entry.DebitAccount || entry.CreditAccount
    return hasValidAmount && hasAccount
  })

  if (!validEntries) {
    return false
  }

  let totalDebit = 0
  let totalCredit = 0

  journalEntries.value.forEach(entry => {
    const amount = parseFloat(entry.Fcy_Amount) || 0
    if (amount > 0) {
      if (entry.DebitAccount) {
        totalDebit += amount
      }
      if (entry.CreditAccount) {
        totalCredit += amount
      }
    }
  })

  const isApiBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0 && totalCredit > 0

  return isApiBalanced
})

const referencePlaceholder = computed(() => {
  if (journalData.module_id && journalData.Txn_code) {
    const date = new Date(journalData.Value_date)
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${journalData.module_id}-${journalData.Txn_code}-${year}${month}${day}-00001`
  }
  return 'GL-TRF-250609-00001'
})

// Methods
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  }).format(num || 0)
}

const calculateLcyAmount = (entry) => {
  const fcyAmount = parseFloat(entry.Fcy_Amount) || 0
  const rate = parseFloat(exchangeRate.value) || 1

  if (fcyAmount > 0) {
    entry.Lcy_Amount = parseFloat((fcyAmount * rate).toFixed(3))
  } else {
    entry.Lcy_Amount = 0
  }
}

// Simplified account fetching using the backend's display_item_by_postside endpoint
const fetchDebitAccounts = async () => {
  try {
    loading.debitAccounts = true
    console.log('Fetching debit accounts using display_item_by_postside...')
    
    const response = await axios.post('/api/gl-sub/display_item_by_postside/', {
      post_side: 'dr'
    }, getAuthHeaders())
    
    console.log('Debit accounts response:', response.data)
    
    if (response.data.items) {
      debitAccounts.value = response.data.items.map(account => ({
        ...account,
        account_display: `${account.glsub_code} - ${account.glsub_Desc_la || account.glsub_Desc}`,
        post_side: account.gl_code?.post_side || 'dr'
      }))
      console.log(`Loaded ${debitAccounts.value.length} debit accounts`)
    } else {
      console.error('No items in debit accounts response')
      debitAccounts.value = []
    }
  } catch (error) {
    console.error('Error fetching debit accounts:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດດຶງຂໍ້ມູນບັນຊີເດບິດໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
    debitAccounts.value = []
  } finally {
    loading.debitAccounts = false
  }
}

const fetchCreditAccounts = async () => {
  try {
    loading.creditAccounts = true
    console.log('Fetching credit accounts using display_item_by_postside...')
    
    const response = await axios.post('/api/gl-sub/display_item_by_postside/', {
      post_side: 'cr'
    }, getAuthHeaders())
    
    console.log('Credit accounts response:', response.data)
    
    if (response.data.items) {
      creditAccounts.value = response.data.items.map(account => ({
        ...account,
        account_display: `${account.glsub_code} - ${account.glsub_Desc_la || account.glsub_desc}`,
        post_side: account.gl_code?.post_side || 'cr'
      }))
      console.log(`Loaded ${creditAccounts.value.length} credit accounts`)
    } else {
      console.error('No items in credit accounts response')
      creditAccounts.value = []
    }
  } catch (error) {
    console.error('Error fetching credit accounts:', error)
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດດຶງຂໍ້ມູນບັນຊີເຄຣດິດໄດ້',
      confirmButtonText: 'ຕົກລົງ'
    })
    creditAccounts.value = []
  } finally {
    loading.creditAccounts = false
  }
}

// Simplified account change handler
const onAccountChange = (entry, field) => {
  const accountId = entry[field]
  if (!accountId) return

  // Simple validation to prevent same account selection
  if (entry.DebitAccount && entry.CreditAccount && entry.DebitAccount === entry.CreditAccount) {
    entry[field] = null
    Swal.fire({
      icon: 'warning',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດເລືອກບັນຊີດຽວກັນສຳລັບເດບິດ ແລະ ເຄຣດິດ',
      confirmButtonText: 'ຕົກລົງ'
    })
  }
}

// Simplified account description methods
const getAccountDesc = (accountId, type) => {
  const accountsList = type === 'debit' ? debitAccounts.value : creditAccounts.value
  const account = accountsList.find(a => a.glsub_id === accountId) ||
                  accounts.value.find(a => a.glsub_id === accountId)
  return account ? (account.glsub_desc_la || account.glsub_desc || '') : ''
}

const getAccountPostSide = (accountId, type) => {
  const accountsList = type === 'debit' ? debitAccounts.value : creditAccounts.value
  const account = accountsList.find(a => a.glsub_id === accountId) ||
                  accounts.value.find(a => a.glsub_id === accountId)
  return account?.post_side?.toUpperCase() || type.toUpperCase()
}

const copyMainToSub = () => {
  if (journalData.Addl_text) {
    journalData.Addl_sub_text = journalData.Addl_text
    updateSubTextSuggestions()
  }
}

const fillSubTextFromMain = () => {
  if (journalData.Addl_sub_text) {
    journalEntries.value.forEach(entry => {
      if (!entry.Addl_sub_text) {
        entry.Addl_sub_text = journalData.Addl_sub_text
      }
    })

    Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      text: `ຕື່ມລາຍລະອຽດໃຫ້ ${journalEntries.value.length} ລາຍການແລ້ວ`,
      timer: 2000,
      showConfirmButton: false
    })
  }
}

const applyDescriptionTemplate = (templateIndex) => {
  if (templateIndex !== null && descriptionTemplates.value[templateIndex]) {
    const template = descriptionTemplates.value[templateIndex]
    journalData.Addl_text = template.main
    journalData.Addl_sub_text = template.sub
    updateSubTextSuggestions()
  }
}

const applyEntryTemplate = (template) => {
  journalEntries.value = []
  template.entries.forEach(entryTemplate => {
    const newEntry = {
      Fcy_Amount: entryTemplate.Fcy_Amount,
      Lcy_Amount: 0,
      DebitAccount: entryTemplate.DebitAccount,
      CreditAccount: entryTemplate.CreditAccount,
      Addl_sub_text: entryTemplate.Addl_sub_text
    }
    journalEntries.value.push(newEntry)
    setupEntryWatchers(newEntry)
  })
}

const onMainDescriptionChange = () => {
  updateSubTextSuggestions()
}

const onEntrySubTextBlur = (entry, index) => {
  if (entry.Addl_sub_text) {
    updateSubTextSuggestions()
  }
}

const updateSubTextSuggestions = () => {
  const suggestions = new Set()
  if (journalData.Addl_text) suggestions.add(journalData.Addl_text)
  if (journalData.Addl_sub_text) suggestions.add(journalData.Addl_sub_text)
  journalEntries.value.forEach(entry => {
    if (entry.Addl_sub_text) suggestions.add(entry.Addl_sub_text)
  })
  descriptionTemplates.value.forEach(template => {
    suggestions.add(template.main)
    suggestions.add(template.sub)
  })
  subTextSuggestions.value = Array.from(suggestions).filter(s => s.length > 0).slice(0, 10)
}

const generateAutoDescription = (entry) => {
  const debitAccount = debitAccounts.value.find(a => a.glsub_id === entry.DebitAccount) ||
                      accounts.value.find(a => a.glsub_id === entry.DebitAccount)
  const creditAccount = creditAccounts.value.find(a => a.glsub_id === entry.CreditAccount) ||
                       accounts.value.find(a => a.glsub_id === entry.CreditAccount)
  const amount = formatNumber(entry.Fcy_Amount || 0)

  if (debitAccount && creditAccount) {
    return `ໂອນ ${amount} ${journalData.Ccy_cd} ຈາກ ${creditAccount.glsub_code} ໄປ ${debitAccount.glsub_code}`
  } else if (debitAccount) {
    return `ເດບິດ ${amount} ${journalData.Ccy_cd} ໃສ່ ${debitAccount.glsub_code}`
  } else if (creditAccount) {
    return `ເຄຣດິດ ${amount} ${journalData.Ccy_cd} ຈາກ ${creditAccount.glsub_code}`
  } else {
    return `ລາຍການ ${amount} ${journalData.Ccy_cd}`
  }
}

const duplicateEntry = (index) => {
  const originalEntry = journalEntries.value[index]
  const newEntry = {
    Fcy_Amount: originalEntry.Fcy_Amount,
    Lcy_Amount: originalEntry.Lcy_Amount,
    DebitAccount: originalEntry.DebitAccount,
    CreditAccount: originalEntry.CreditAccount,
    Addl_sub_text: originalEntry.Addl_sub_text + ' (ສຳເນົາ)'
  }
  journalEntries.value.splice(index + 1, 0, newEntry)
  setupEntryWatchers(newEntry)
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('glcapture/') // fallback if no history
  }
}

const validateDescriptions = () => {
  const errors = []
  const warnings = []

  if (!journalData.Addl_text && !journalData.Addl_sub_text) {
    warnings.push('ບໍ່ມີຂຶ້ຄວາມເພ່ມເຕ່ມຫຼັກ')
  }

  journalEntries.value.forEach((entry, index) => {
    if (!entry.Addl_sub_text || !entry.Addl_sub_text.trim()) {
      warnings.push(`ລາຍການທີ ${index + 1} ບໍ່ມີລາຍລະອຽດ`)
    } else if (entry.Addl_sub_text.length > 255) {
      errors.push(`ລາຍການທີ ${index + 1} ລາຍລະອຽດຍາວເກີນໄປ`)
    }
  })

  if (errors.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'ພົບຂ້ຜິດພາດ',
      html: `<ul style="text-align: left;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`,
      confirmButtonText: 'ຕົກລົງ'
    })
  } else if (warnings.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'ຄຳເຕ່ອນ',
      html: `<ul style="text-align: left;">${warnings.map(w => `<li>${w}</li>`).join('')}</ul>`,
      confirmButtonText: 'ຕົກລົງ'
    })
  } else {
    Swal.fire({
      icon: 'success',
      title: 'ຖືກຕ້ອງ',
      text: 'ລາຍລະອຽດທັງໝົດຖືກຕ້ອງ',
      timer: 500,
      showConfirmButton: false
    })
  }
}

const onMainCurrencyChange = async () => {
  const selectedCurrency = currencies.value.find(c => c.ccy_code === journalData.Ccy_cd)
  if (selectedCurrency && journalData.Ccy_cd !== 'LAK') {
    try {
      loading.exchangeRate = true
      const url = `/api/exc-rate/?ccy_code=${journalData.Ccy_cd}`
      const response = await axios.get(url, getAuthHeaders())
      let buyRate = 1

      if (response.data) {
        if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
          buyRate = parseFloat(response.data.results[0].Buy_Rate || response.data.results[0].buy_rate || 1)
        } else if (response.data.Buy_Rate || response.data.buy_rate) {
          buyRate = parseFloat(response.data.Buy_Rate || response.data.buy_rate || 1)
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          buyRate = parseFloat(response.data[0].Buy_Rate || response.data[0].buy_rate || 1)
        }
      }

      exchangeRate.value = buyRate
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      exchangeRate.value = 1
      Swal.fire({
        icon: 'warning',
        title: 'ບໍ່ສາມາດໂຫລດອັດຕາແລກປ່ຽນ',
        text: `ໃຊ້ອັດຕາແລກປ່ຽນເລີ່ມຕົ້ນ 1:1 ສໍາລັບ ${journalData.Ccy_cd}`,
        timer: 3000,
        showConfirmButton: false
      })
    } finally {
      loading.exchangeRate = false
    }
  } else {
    exchangeRate.value = 1
  }

  journalEntries.value.forEach(entry => {
    calculateLcyAmount(entry)
  })
}

const onModuleChange = () => {
  if (autoReferenceMode.value) {
    generateReference()
  }
}

const validateEntry = (entry) => {
  if (!entry.DebitAccount && !entry.CreditAccount) {
    return false
  }
  return true
}

const getEntryStatus = (entry) => {
  if (!entry.Fcy_Amount || entry.Fcy_Amount <= 0) return 'ບໍ່ມີຈຳນວນ'
  if (!entry.DebitAccount && !entry.CreditAccount) return 'ບໍ່ມີບັນຊີ'
  if (entry.DebitAccount && entry.CreditAccount) return 'ຄົບຖ້ວນ'
  if (entry.DebitAccount || entry.CreditAccount) return 'ຂາດບາຍ'
  return 'ບໍ່ຖືກຕ້ອງ'
}

const getEntryStatusColor = (entry) => {
  const status = getEntryStatus(entry)
  switch (status) {
    case 'ຄົບຖ້ວນ': return 'success'
    case 'ຂາດບາຍ': return 'warning'
    default: return 'error'
  }
}

const getAccountName = (accountId) => {
  const account = debitAccounts.value.find(a => a.glsub_id === accountId) ||
                  creditAccounts.value.find(a => a.glsub_id === accountId) ||
                  accounts.value.find(a => a.glsub_id === accountId)
  return account ? account.glsub_code : null
}

const generateReference = async () => {
  if (!journalData.Txn_code || !journalData.module_id) {
    Swal.fire({
      icon: 'warning',
      title: 'ຂໍ້ມູນບໍ່ຄົບ',
      text: 'ກະລຸນາເລືອກໂມດູນ ແລະ ລະຫັດການເຄື່ອນໄຫວກ່ອນ',
      confirmButtonText: 'ຕົກລົງ'
    })
    return
  }

  try {
    loading.generateRef = true
    const payload = {
      module_id: journalData.module_id,
      txn_code: journalData.Txn_code,
      value_date: journalData.Value_date
    }
    const response = await axios.post('/api/journal-entries/generate_reference/', payload, getAuthHeaders())
    journalData.Reference_No = response.data.reference_no
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `ສ້າງເລກອ້າງອີງ: ${response.data.reference_no}`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    })
  } catch (error) {
    console.error('Error generating reference:', error)
    let errorMessage = 'ບໍ່ສາມາດສ້າງເລກອ້າງອີງໄດ້'
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    }
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: errorMessage,
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.generateRef = false
  }
}

const updateReferenceNumber = () => {
  if (autoReferenceMode.value) {
    generateReference()
  }
}

const onTransactionCodeChange = () => {
  if (journalData.Txn_code && journalData.module_id) {
    autoReferenceMode.value = true
    generateReference()
  }
}

const setupEntryWatchers = (entry) => {
  watch(() => entry.Fcy_Amount, (newValue) => {
    calculateLcyAmount(entry)
  })
}

const addJournalEntry = () => {
  const newEntry = {
    Fcy_Amount: '',
    Lcy_Amount: 0,
    DebitAccount: null,
    CreditAccount: null,
    Addl_sub_text: journalData.Addl_sub_text || ''
  }
  journalEntries.value.push(newEntry)
  setupEntryWatchers(newEntry)
}

const removeJournalEntry = (index) => {
  journalEntries.value.splice(index, 1)
}

const addQuickEntry = () => {
  for (let i = 0; i < 2; i++) {
    addJournalEntry()
  }
}

const checkBalance = async () => {
  if (!journalData.Reference_No) return

  try {
    loading.checkBalance = true
    const response = await axios.get('/api/journal-entries/balance_check/', {
      params: { reference_no: journalData.Reference_No },
      ...getAuthHeaders()
    })

    const balanceInfo = response.data
    const icon = balanceInfo.overall_balanced ? 'success' : 'warning'
    const title = balanceInfo.overall_balanced ? 'ສົມດຸນແລ້ວ' : 'ບໍ່ສົມດຸນ'

    Swal.fire({
      icon: icon,
      title: title,
      html: `
        <div style="text-align: left;">
          <p><strong>ເລກອ້າງອີງ:</strong> ${balanceInfo.reference_no}</p>
          <p><strong>ຈຳນວນລາຍການ:</strong> ${balanceInfo.entry_count}</p>
          <p><strong>ລວມເດບິດ:</strong> ${formatNumber(balanceInfo.lcy_totals.debit)}</p>
          <p><strong>ລວມເຄຣດິດ:</strong> ${formatNumber(balanceInfo.lcy_totals.credit)}</p>
        </div>
      `,
      confirmButtonText: 'ຕົກລົງ'
    })
  } catch (error) {
    console.error('Error checking balance:', error)
    if (error.response?.status === 404) {
      Swal.fire({
        icon: 'info',
        title: 'ບໍ່ພົບຂໍ້ມູນ',
        text: 'ບໍ່ພົບລາຍການບັນທຶກສຳລັບເລກອ້າງອີງນີ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດ',
        text: 'ບໍ່ສາມາດກວດສອບຍອດໄດ້',
        confirmButtonText: 'ຕົກລົງ'
      })
    }
  } finally {
    loading.checkBalance = false
  }
}

const loadModules = async () => {
  try {
    loading.modules = true
    const response = await axios.get('/api/modules/', getAuthHeaders())
    modules.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Error loading modules:', error)
    Swal.fire('ຂໍ້ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດໂມດູນ', 'error')
  } finally {
    loading.modules = false
  }
}

const loadCurrencies = async () => {
  try {
    loading.currencies = true
    const response = await axios.get('/api/currencies/', getAuthHeaders())
    currencies.value = response.data.results || response.data || []
    if (journalData.Ccy_cd && journalData.Ccy_cd !== 'LAK') {
      onMainCurrencyChange()
    }
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
    accounts.value = data.map(account => ({
      ...account,
      account_display: `${account.glsub_code} - ${account.glsub_Desc_la || account.glsub_Desc_en || account.glsub_desc}`,
    }))
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

const loadFinCycles = async () => {
  try {
    loading.finCycles = true
    const response = await axios.get('/api/fin-cycles/', getAuthHeaders())
    const data = response.data.results || response.data || []
    finCycles.value = data.map(cycle => ({
      ...cycle,
      cycle_display: `${cycle.fin_cycle} - ${cycle.cycle_Desc}`,
    }))

    // Use target year instead of current year
    const targetYear = getTargetYear()
    const currentCycle = finCycles.value.find(cycle =>
      cycle.fin_cycle.toString() === targetYear.toString()
    )
    if (currentCycle) {
      journalData.fin_cycle = currentCycle.fin_cycle
      await loadPeriodCodes()
    } else {
      console.warn('No financial cycle found for target year:', targetYear)
      Swal.fire({
        icon: 'warning',
        title: 'ບໍ່ພົບຮອບການເງິນ',
        text: `ບໍ່ພົບຮອບການເງິນສຳລັບປີ ${targetYear}`,
        timer: 3000,
        showConfirmButton: false
      })
    }
  } catch (error) {
    console.error('Error loading financial cycles:', error)
    Swal.fire('ຂໍ້ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຮອບການເງິນ', 'error')
  } finally {
    loading.finCycles = false
  }
}

const loadPeriodCodes = async () => {
  if (!journalData.fin_cycle) {
    periodCodes.value = []
    return
  }

  try {
    loading.periodCodes = true
    const response = await axios.get(`/api/percodes/?fin_cycle=${journalData.fin_cycle}`, getAuthHeaders())
    const data = response.data.results || response.data || []
    
    // Format the period_display to show YYYY-MM instead of YYYYMM
    periodCodes.value = data.map(period => ({
      ...period,
      period_display: formatPeriodDisplay(period.period_code),
    }))

    // Use target period code instead of current period code
    const targetPeriod = getTargetPeriodCode.value
    const currentPeriod = periodCodes.value.find(period => 
      period.period_code === targetPeriod
    )
    if (currentPeriod) {
      journalData.Period_code = currentPeriod.period_code
    } else {
      console.warn('No period code found for target period:', targetPeriod)
      journalData.Period_code = periodCodes.value[0]?.period_code || null
      Swal.fire({
        icon: 'warning',
        title: 'ບໍ່ພົບລະຫັດໄລຍະ',
        text: `ບໍ່ພົບລະຫັດໄລຍະສຳລັບ ${targetPeriod}`,
        timer: 3000,
        showConfirmButton: false
      })
    }
  } catch (error) {
    console.error('Error loading period codes:', error)
    Swal.fire('ຂໍ້ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດລະຫັດໄລຍະ', 'error')
  } finally {
    loading.periodCodes = false
  }
}

// Helper function to format period code for display
const formatPeriodDisplay = (periodCode) => {
  if (!periodCode || periodCode.length !== 6) {
    return periodCode // Return as-is if invalid format
  }
  
  const year = periodCode.substring(0, 4)
  const month = periodCode.substring(4, 6)
  return `${year}-${month}`
}

const refreshAutoSelection = async () => {
  try {
    loading.finCycles = true
    await loadFinCycles()
  } catch (error) {
    console.error('Error refreshing auto-selection:', error)
    Swal.fire('ຂໍ້ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດຮອບການເງິນ', 'error')
  } finally {
    loading.finCycles = false
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
    const selectedCurrency = currencies.value.find(c => c.ccy_code === journalData.Ccy_cd)
    const altCcyCode = selectedCurrency?.ALT_Ccy_Code || ''
    const batchPayload = {
      Reference_No: journalData.Reference_No,
      Ccy_cd: journalData.Ccy_cd,
      Txn_code: journalData.Txn_code,
      Value_date: journalData.Value_date + 'T00:00:00Z',
      Addl_text: journalData.Addl_text || '',
      Addl_sub_text: journalData.Addl_sub_text || '',
      fin_cycle: journalData.fin_cycle || null,
      Period_code: journalData.Period_code || null,
      module_id: journalData.module_id || 'GL',
      entries: []
    }

    journalEntries.value.forEach(entry => {
      calculateLcyAmount(entry)
      const getAccountCode = (accountId) => {
        const account = debitAccounts.value.find(a => a.glsub_id === accountId) ||
                        creditAccounts.value.find(a => a.glsub_id === accountId) ||
                        accounts.value.find(a => a.glsub_id === accountId)
        return account ? account.glsub_code : ''
      }
      const amount = parseFloat(entry.Fcy_Amount) || 0
      if (amount <= 0) return

      const buildAccountNo = (accountId) => {
        let code = getAccountCode(accountId)
        if (altCcyCode) {
          code = `${altCcyCode}.${code}`
        }
        return code
      }
      const buildRelativeAccountNo = (accountId) => {
        let code = getAccountCode(accountId)
        if (altCcyCode) {
          code = `${altCcyCode}.${code}`
        }
          return code
        }

      if (entry.DebitAccount) {
        batchPayload.entries.push({
          Account: entry.DebitAccount,
          Account_no: buildAccountNo(entry.DebitAccount),
          Amount: amount,
          Dr_cr: 'D',
          Addl_sub_text: entry.Addl_sub_text || batchPayload.Addl_sub_text || '',
          Ac_relatives: buildRelativeAccountNo(entry.CreditAccount)
        })
      }

      if (entry.CreditAccount) {
        batchPayload.entries.push({
          Account: entry.CreditAccount,
          Account_no: buildAccountNo(entry.CreditAccount),
          Amount: amount,
          Dr_cr: 'C',
          Addl_sub_text: entry.Addl_sub_text || batchPayload.Addl_sub_text || '',
          Ac_relatives: buildRelativeAccountNo(entry.DebitAccount)
        })
      }
    })

    if (batchPayload.entries.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ບໍ່ມີລາຍການ',
        text: 'ກະລຸນາເພີ່ມລາຍການບັນທຶກກ່ອນບັນທຶກ',
        confirmButtonText: 'ຕົກລົງ'
      })
      return
    }

    const totalDebit = batchPayload.entries
      .filter(e => e.Dr_cr === 'D')
      .reduce((sum, e) => sum + e.Amount, 0)
    const totalCredit = batchPayload.entries
      .filter(e => e.Dr_cr === 'C')
      .reduce((sum, e) => sum + e.Amount, 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      Swal.fire({
        icon: 'error',
        title: 'ບໍ່ສົມດຸນ',
        html: `
          <div style="text-align: left;">
            <p>ລາຍການບັນທຶກບໍ່ສົມດຸນ:</p>
            <p><strong>ເດບິດລວມ:</strong> ${formatNumber(totalDebit)}</p>
            <p><strong>ເຄຣດິດລວມ:</strong> ${formatNumber(totalCredit)}</p>
            <p><strong>ຕ່າງ:</strong> ${formatNumber(Math.abs(totalDebit - totalCredit))}</p>
          </div>
        `,
        confirmButtonText: 'ຕົກລົງ'
      })
      return
    }

    const response = await axios.post('/api/journal-entries/batch_create/', batchPayload, getAuthHeaders())

    const result = await Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ!',
      html: `
        <div style="
          text-align: left; 
          font-family: 'Roboto', sans-serif;
          color: #424242;
          line-height: 1.5;
          margin: 8px 0;
        ">
          <div style="
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border-radius: 8px;
            padding: 16px;
            border-left: 4px solid #4CAF50;
            margin-bottom: 12px;
          ">
            <p style="margin: 6px 0; font-size: 14px;">
              <span style="color: #666; font-weight: 500;">ເລກອ້າງອີງ:</span> 
              <span style="color: #1976d2; font-weight: 600;">${response.data.reference_no || journalData.Reference_No}</span>
            </p>
            <p style="margin: 6px 0; font-size: 14px;">
              <span style="color: #666; font-weight: 500;">ຈຳນວນລາຍການທີ່ສ້າງ:</span> 
              <span style="color: #2e7d32; font-weight: 600;">${response.data.entries?.length || batchPayload.entries.length}</span>
            </p>
            <p style="margin: 6px 0; font-size: 14px;">
              <span style="color: #666; font-weight: 500;">ວັນທີ່ບັນທຶກ:</span> 
              <span style="color: #1976d2; font-weight: 600;">${formatDisplayDate(journalData.Value_date)} ${isBackDate ? '(Back Date)' : ''}</span>
            </p>
          </div>
          
          <div style="
            background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
            border-radius: 8px;
            padding: 16px;
            border-left: 4px solid #FF9800;
          ">
            <p style="margin: 6px 0; font-size: 14px;">
              <span style="color: #666; font-weight: 500;">ເດບິດລວມ:</span> 
              <span style="color: #f57c00; font-weight: 600;">${formatNumber(totalDebit)} ${journalData.Ccy_cd}</span>
            </p>
            <p style="margin: 6px 0; font-size: 14px;">
              <span style="color: #666; font-weight: 500;">ເຄຣດິດລວມ:</span> 
              <span style="color: #f57c00; font-weight: 600;">${formatNumber(totalCredit)} ${journalData.Ccy_cd}</span>
            </p>
            <p style="margin: 6px 0; font-size: 14px;">
              <span style="color: #666; font-weight: 500;">ລາຍການທີ່ມີລາຍລະອຽດ:</span> 
              <span style="color: #1976d2; font-weight: 600;">${entriesWithDescription.value}/${journalEntries.value.length}</span>
            </p>
          </div>
        </div>
      `,
      confirmButtonText: `<i class="mdi mdi-eye" style="margin-right: 6px;"></i>ເບິ່ງລາຍການ`,
      confirmButtonColor: '#E8F5E8',
      width: '520px',
      padding: '20px',  
      timer: 10000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
      backdrop: 'rgba(0,0,0,0.4)'
    })

    // Handle different button clicks
    if (result.isConfirmed) {
      // Navigate to view journals or journal list
      await navigateToJournalList()
    } else {
      // Timer expired or other dismissal - go back to capture
      await navigateToCapture()
    }

    // Generate new reference if in auto mode
    if (autoReferenceMode.value) {
      setTimeout(() => {
        generateReference()
      }, 500)
    }

    resetForm()
  } catch (error) {
    console.error('Error submitting journal:', error)
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ'
    let errorDetails = ''
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.entries) {
        errorMessage = 'ຂໍ້ຜິດພາດໃນລາຍການບັນທຶກ'
        errorDetails = Array.isArray(errorData.entries)
          ? errorData.entries.join(', ')
          : JSON.stringify(errorData.entries)
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (typeof errorData === 'object') {
        const fieldErrors = []
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            fieldErrors.push(`${field}: ${errorData[field].join(', ')}`)
          }
        })
        if (fieldErrors.length > 0) {
          errorDetails = fieldErrors.join('\n')
        }
      }
    }
    Swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      html: `
        <div style="text-align: left;">
          <p><strong>ຂໍ້ຜິດພາດ:</strong> ${errorMessage}</p>
          ${errorDetails ? `<p><strong>ລາຍລະອຽດ:</strong></p><pre style="font-size: 12px; text-align: left;">${errorDetails}</pre>` : ''}
        </div>
      `,
      confirmButtonText: 'ຕົກລົງ'
    })
  } finally {
    loading.submit = false
  }
}

// Refresh accounts function
const refreshAccounts = async () => {
  await Promise.all([
    fetchDebitAccounts(),
    fetchCreditAccounts()
  ])
  
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'info',
    title: `ໂຫລດບັນຊີແລ້ວ: ${debitAccounts.value.length} ເດບິດ, ${creditAccounts.value.length} ເຄຣດິດ`,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  })
}

const resetForm = () => {
  const currentTxnCode = journalData.Txn_code
  const currentCurrency = journalData.Ccy_cd
  const currentModule = journalData.module_id
  const wasAutoMode = autoReferenceMode.value

  Object.assign(journalData, {
    Reference_No: '',
    module_id: currentModule || 'GL',
    Ccy_cd: currentCurrency || 'LAK',
    Txn_code: currentTxnCode,
    Value_date: targetDate.value || new Date().toISOString().substr(0, 10),
    Addl_text: '',
    Addl_sub_text: '',
    fin_cycle: null,
    Period_code: null
  })

  journalEntries.value = []
  autoReferenceMode.value = false
  selectedTemplate.value = null
  subTextSuggestions.value = []

  if (wasAutoMode && currentTxnCode && currentModule) {
    nextTick(() => {
      autoReferenceMode.value = true
      generateReference()
    })
  }

  nextTick(() => {
    formRef.value?.resetValidation()
    addJournalEntry()
  })
}

const navigateToCapture = async () => {
  try {
    await router.push('/glcapture')
  } catch (error) {
    console.error('Navigation error:', error)
    // Fallback to window.location if router fails
    window.location.href = '/glcapture'
  }
}

const navigateToJournalList = async () => {
  try {
    // Navigate to journal list/view page - adjust path as needed
    await router.push('/glcapture') // or whatever your journal list route is
  } catch (error) {
    console.error('Navigation error:', error)
    // Fallback navigation
    await navigateToCapture()
  }
}

// Watchers
watch(() => journalData.Txn_code, onTransactionCodeChange)
watch(() => journalData.Value_date, async (newDate) => {
  const selectedDate = new Date(newDate)
  const selectedYear = selectedDate.getFullYear()
  const selectedPeriodCode = `${selectedYear}${String(selectedDate.getMonth() + 1).padStart(2, '0')}`
  
  if (selectedYear.toString() !== journalData.fin_cycle?.toString() ||
      selectedPeriodCode !== journalData.Period_code) {
    await loadFinCycles() // Auto-reload cycles/periods when date changes
  }
  updateReferenceNumber()
})

watch(() => journalData.Ccy_cd, onMainCurrencyChange)
watch(() => journalData.fin_cycle, loadPeriodCodes)
watch(() => journalData.Addl_text, updateSubTextSuggestions)
watch(() => journalData.Addl_sub_text, updateSubTextSuggestions)
watch(exchangeRate, (newRate) => {
  journalEntries.value.forEach(entry => {
    if (entry.Fcy_Amount > 0) {
      calculateLcyAmount(entry)
    }
  })
})

watch(targetDate, (newTargetDate) => {
  if (newTargetDate) {
    const oldValueDate = journalData.Value_date
    journalData.Value_date = newTargetDate  // KEY CHANGE: Direct assignment
    
    console.log('Target date changed, updating Value_date:', {
      old: oldValueDate,
      new: newTargetDate,
      isBackDate: isBackDate.value,
      backValueEnabled: backValueEnabled.value
    })
    // ... notification logic
  }
}, { immediate: true })

// NEW: Watch for back value enabled changes
watch(backValueEnabled, (newValue) => {
  console.log(`Back value ${newValue ? 'enabled' : 'disabled'}`)

}, { immediate: true })

// NEW: Watch for current EOD changes
watch(currentEod, (newValue) => {
  if (newValue) {
    console.log('Current EOD info:', {
      eod_process_date: newValue.eod_process_date,
      eod_status: newValue.eod_status,
      next_working_day: newValue.next_working_day
    })
  }
}, { deep: true })

// Watch for permission changes and show notifications
watch(isAvailable, (newValue, oldValue) => {
  if (oldValue !== undefined && newValue !== oldValue) {
    if (newValue) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'ສາມາດບັນທຶກບັນຊີໄດ້ແລ້ວ',
        text: permissionReason.value,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      })
    } else {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'ບໍ່ສາມາດບັນທຶກບັນຊີໄດ້',
        text: permissionReason.value,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true
      })
    }
  }
})

// Watch for bypass info changes
watch(bypassInfo, (newValue) => {
  if (newValue) {
    console.log('Bypass info updated:', {
      working_day_bypassed: newValue.working_day_bypassed,
      eod_check_bypassed: newValue.eod_check_bypassed
    })
  }
}, { deep: true })

// Watch for value date disabled changes
watch(isValueDateDisabled, (newValue) => {
  console.log(`Value date input ${newValue ? 'disabled' : 'enabled'} based on BACK_VALUE setting`)
})

// Lifecycle
onMounted(async () => {
  // Initialize journal permission check
  await checkPermission()
  
  // Load all necessary data
  await Promise.all([
    loadModules(),
    loadCurrencies(),
    loadAccounts(),
    loadTransactionCodes(),
    loadFinCycles()
  ])

  // Load debit and credit accounts separately using the new endpoint
  await Promise.all([
    fetchDebitAccounts(),
    fetchCreditAccounts()
  ])

  if (journalData.Ccy_cd && journalData.Ccy_cd !== 'LAK') {
    onMainCurrencyChange()
  }

  updateSubTextSuggestions()
  addJournalEntry()
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
  margin-bottom: 20px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 300;
  color: #1976d2;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.form-card {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  width: 100%;
}

.form-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #424242;
  margin-bottom: 10px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
}

.module-field {
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

.currency-field {
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
}

/* Value Date Disabled Styling */
.value-date-disabled {
  background: linear-gradient(135deg, #fce4ec 0%, #ffffff 100%) !important;
}

.value-date-disabled :deep(.v-field) {
  background: linear-gradient(135deg, #fce4ec 0%, #ffffff 100%) !important;
}

.value-date-disabled :deep(.v-field--disabled) {
  opacity: 0.7 !important;
}

.exchange-rate-info {
  margin: 10px 0;
  text-align: center;
}

.entries-section {
  margin: 20px 0;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 80px;
  height: 32px;
  font-size: 0.8rem;
}

.entries-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #424242;
  margin: 0;
  display: flex;
  align-items: center;
}

.entry-header-row {
  display: none;
}

@media (min-width: 960px) {
  .entry-header-row {
    display: flex;
    background: #e3f2fd;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 10px;
    font-weight: 500;
    font-size: 0.75rem;
    color: #1976d2;
  }
}

.header-cell {
  padding: 0 3px;
}

.account-col { width: 20%; }
.amount-col { width: 15%; }
.lcy-col { width: 15%; }
.text-col { width: 25%; }
.action-col { width: 5%; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  background: white;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.empty-text h4 {
  margin: 10px 0 6px 0;
  color: #666;
  font-size: 1rem;
}

.empty-text p {
  margin: 0;
  color: #999;
  font-size: 0.85rem;
}

.journal-entry-row {
  margin-bottom: 10px;
  animation: slideIn 0.3s ease;
}

.entry-card {
  border-radius: 8px;
  transition: all 0.2s ease;
  background: white;
}

.entry-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.row-number {
  min-width: 55px;
}

.amount-field {
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

.entry-status {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.text-styles {
  font-size: 0.75rem;
  line-height: 1.2;
}

.compact-item {
  min-height: 48px !important;
  padding: 4px 8px !important;
}

.compact-item :deep(.v-list-item-title) {
  font-size: 0.8rem;
  line-height: 1.2;
}

/* Compact Summary Section */
.summary-section-compact {
  margin: 16px 0;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.summary-row-compact {
  align-items: stretch !important;
}

.summary-item-compact {
  background: white;
  border-radius: 6px;
  padding: 8px 10px;
  text-align: center;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.summary-item-compact:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-item-compact.primary {
  border-left: 3px solid #1976d2;
}

.summary-item-compact.success {
  border-left: 3px solid #4caf50;
}

.summary-item-compact.info {
  border-left: 3px solid #2196f3;
}

.summary-item-compact.error {
  border-left: 3px solid #f44336;
}

.summary-label-compact {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 2px;
  font-weight: 500;
}

.summary-value-compact {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

/* Compact Action Buttons */
.action-buttons-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.primary-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.secondary-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.submit-btn-compact,
.secondary-btn-compact {
  height: 36px;
  min-width: 100px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

.submit-btn-compact {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

/* Entry Actions */
.entry-actions {
  display: flex;
  flex-direction: row; /* Change from column to row */
  gap: 4px;
  align-items: center;
}

.entry-description {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

/* Chip Styles */
.v-chip {
  font-size: 0.625rem !important;
  height: 16px !important;
}

/* Working Day Alert Custom Styling */
.v-alert--prominent {
  border-left-width: 4px !important;
}

.v-alert.v-alert--variant-tonal {
  background: rgba(255, 245, 238, 0.9) !important;
  border-color: #ff9800 !important;
}

.v-alert--type-error.v-alert--variant-tonal {
  background: rgba(255, 235, 238, 0.9) !important;
  border-color: #f44336 !important;
}

/* Bypass Configuration Display */
.bg-grey-lighten-4 {
  background-color: rgba(245, 245, 245, 0.8) !important;
}

.v-chip--size-small {
  font-size: 0.75rem !important;
  height: 24px !important;
  padding: 0 8px !important;
}

/* Configuration Info Text */
.text-caption {
  font-size: 0.75rem !important;
  line-height: 1.2 !important;
}

/* Disabled form state */
.v-card--disabled {
  opacity: 0.6 !important;
  pointer-events: none !important;
}

.v-card--disabled .v-field {
  background: #f5f5f5 !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .journal-entry-container {
    padding: 8px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .action-buttons-compact {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-actions,
  .secondary-actions {
    justify-content: center;
    width: 100%;
  }

  .submit-btn-compact,
  .secondary-btn-compact {
    min-width: 120px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    justify-content: center;
  }

  .action-btn {
    flex: 1;
    min-width: 90px;
  }

  .entry-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .summary-row-compact {
    gap: 8px;
  }

  .summary-item-compact {
    padding: 6px 8px;
    min-height: 45px;
  }

  .summary-label-compact {
    font-size: 0.65rem;
  }

  .summary-value-compact {
    font-size: 0.8rem;
  }

  .entry-actions {
    flex-direction: row;
    gap: 2px;
  }
}

@media (max-width: 480px) {
  .journal-entry-container {
    padding: 4px;
  }

  .page-title {
    font-size: 1.1rem;
    flex-direction: column;
    gap: 4px;
  }

  .form-card {
    border-radius: 8px;
  }

  .entries-section {
    padding: 8px;
  }

  .entry-card {
    border-radius: 6px;
  }

  .row-number {
    min-width: 45px;
  }

  .summary-item-compact {
    padding: 4px 6px;
    min-height: 40px;
  }

  .summary-label-compact {
    font-size: 0.6rem;
  }

  .summary-value-compact {
    font-size: 0.75rem;
  }
}

/* Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced density for compact layout */
:deep(.v-field--density-compact .v-field__input) {
  min-height: 36px;
  padding-top: 4px;
  padding-bottom: 4px;
}

:deep(.v-field--density-compact .v-field__prepend-inner) {
  padding-top: 2px;
}

:deep(.v-field--density-compact .v-field__append-inner) {
  padding-top: 2px;
}

/* Custom scrollbar for better UX */
:deep(.v-autocomplete__content) {
  max-height: 300px;
}

:deep(.v-list) {
  max-height: 280px;
  overflow-y: auto;
}

/* Loading states */
.v-progress-circular {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Focus states */
.v-field--focused {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.12);
}

/* Error states */
.v-field--error {
  box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.12);
}

/* Success states */
.success-border {
  border-color: #4caf50 !important;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.12);
}
</style>