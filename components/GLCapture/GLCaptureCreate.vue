<template>
  <div class="journal-entry-container">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">
        <v-icon left color="primary">mdi-book-open-page-variant</v-icon>
        ລາຍການບັນທຶກບັນຊີ
      </h2>
      <p class="page-subtitle">ສ້າງລາຍການບັນທຶກບັນຊີ</p>
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
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="journalData.Reference_No"
                  label="ເລກອ້າງອີງ *"
                  :rules="referenceRules"
                  :disabled="autoReferenceMode"
                  variant="outlined"
                  density="comfortable"
                  counter="30"
                  prepend-inner-icon="mdi-identifier"
                  hide-details="auto"
                  :placeholder="referencePlaceholder"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="journalData.module_id"
                  :items="modules"
                  item-title="module_name_la"
                  item-value="module_Id"
                  label="ໂມດູນ *"
                  :rules="requiredRules"
                  variant="outlined"
                  density="comfortable"
                  :loading="loading.modules"
                  @update:model-value="onModuleChange"
                  prepend-inner-icon="mdi-cube-outline"
                  hide-details="auto"
                  no-data-text="ບໍ່ມີຂໍ້ມູນໂມດູນ"
                  class="module-field"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="journalData.Ccy_cd"
                  :items="currencies"
                  item-title="Ccy_Name_la"
                  item-value="ccy_code"
                  label="ສະກຸນເງິນ *"
                  :rules="requiredRules"
                  variant="outlined"
                  density="comfortable"
                  :loading="loading.currencies"
                  @update:model-value="onMainCurrencyChange"
                  prepend-inner-icon="mdi-currency-usd"
                  hide-details="auto"
                  no-data-text="ບໍ່ມີຂໍ້ມູນສະກຸນເງິນ"
                  class="currency-field"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="journalData.Txn_code"
                  :items="transactionCodes"
                  item-title="txn_display"
                  item-value="trn_code"
                  label="ລະຫັດການເຄື່ອນໄຫວ *"
                  :rules="requiredRules"
                  variant="outlined"
                  density="comfortable"
                  :loading="loading.transactionCodes"
                  @update:model-value="onTransactionCodeChange"
                  prepend-inner-icon="mdi-code-tags"
                  hide-details="auto"
                  no-data-text="ບໍ່ມີຂໍ້ມູນລະຫັດການເຄື່ອນໄຫວ"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="journalData.Value_date"
                  label="ວັນທີ *"
                  type="date"
                  variant="outlined"
                  density="comfortable"
                  @change="updateReferenceNumber"
                  prepend-inner-icon="mdi-calendar"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  color="success"
                  variant="outlined"
                  size="default"
                  @click="generateReference"
                  :disabled="!journalData.Txn_code || !journalData.module_id || loading.generateRef"
                  :loading="loading.generateRef"
                  class="generate-btn"
                  block
                >
                  <v-icon left>mdi-auto-fix</v-icon>
                  ສ້າງອ້າງອີງ
                </v-btn>
              </v-col>
            </v-row>
            
            <!-- Enhanced Description Fields Row -->
            <v-row dense class="mt-2">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="journalData.Addl_text"
                  label="ຂໍ້ຄວາມເພີ່ມເຕີມ (ຫຼັກ)"
                  variant="outlined"
                  density="comfortable"
                  counter="255"
                  :rules="addlTextRules"
                  prepend-inner-icon="mdi-text"
                  hide-details="auto"
                  placeholder="ໃສ່ຂໍ້ຄວາມເພີ່ມເຕີມຫຼັກ..."
                  @input="onMainDescriptionChange"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="journalData.fin_cycle"
                  :items="finCycles"
                  item-title="cycle_display"
                  item-value="fin_cycle"
                  label="ຮອບການເງິນ"
                  variant="outlined"
                  density="comfortable"
                  :loading="loading.finCycles"
                  @update:model-value="loadPeriodCodes"
                  prepend-inner-icon="mdi-calendar-range"
                  hide-details="auto"
                  no-data-text="ບໍ່ມີຂໍ້ມູນຮອບການເງິນ"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
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
                  variant="outlined"
                  density="comfortable"
                  :loading="loading.periodCodes"
                  :disabled="!journalData.fin_cycle"
                  prepend-inner-icon="mdi-calendar-clock"
                  hide-details="auto"
                  no-data-text="ບໍ່ມີຂໍ້ມູນລະຫັດໄລຍະ"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <!-- Description Templates Row -->
            <v-row dense class="mt-1" v-if="descriptionTemplates.length > 0">
              <v-col cols="12">
                <div class="description-templates">
                  <span class="template-label">ແມ່ແບບ:</span>
                  <v-chip-group
                    v-model="selectedTemplate"
                    @update:model-value="applyDescriptionTemplate"
                    variant="outlined"
                    size="small"
                    class="template-chips"
                  >
                    <v-chip 
                      v-for="(template, index) in descriptionTemplates" 
                      :key="index"
                      :value="index"
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      {{ template.label }}
                    </v-chip>
                  </v-chip-group>
                </div>
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
                  :disabled="loading.submit"
                  class="mr-2"
                >
                  <v-icon left size="small">mdi-plus</v-icon>
                  ເພີ່ມແຖວ
                </v-btn>
                <v-btn 
                  color="secondary" 
                  size="small"
                  variant="text"
                  @click="addQuickEntry"
                  :disabled="loading.submit"
                  class="mr-2"
                >
                  <v-icon left size="small">mdi-lightning-bolt</v-icon>
                  ເພີ່ມໄວ
                </v-btn>
                <v-btn 
                  color="info" 
                  size="small"
                  variant="text"
                  @click="fillSubTextFromMain"
                  :disabled="loading.submit || !journalData.Addl_sub_text"
                >
                  <v-icon left size="small">mdi-format-text</v-icon>
                  ຕື່ມລາຍລະອຽດ
                </v-btn>
              </div>
            </div>

            <!-- Entry Templates -->
            <div class="entry-templates" v-if="entryTemplates.length > 0">
              <v-chip-group
                variant="outlined"
                size="small"
                class="mb-3"
              >
                <v-chip 
                  v-for="(template, index) in entryTemplates" 
                  :key="index"
                  size="small"
                  variant="outlined"
                  color="secondary"
                  @click="applyEntryTemplate(template)"
                  :disabled="loading.submit"
                >
                  <v-icon left size="small">mdi-bookmark</v-icon>
                  {{ template.name }}
                </v-chip>
              </v-chip-group>
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
                    <v-col cols="12" sm="6" md="2">
                      <v-autocomplete
                        v-model="entry.DebitAccount"
                        :items="accounts"
                        item-title="account_display"
                        item-value="glsub_id"
                        label="ບັນຊີເດບິດ"
                        variant="outlined"
                        density="comfortable"
                        :loading="loading.accounts"
                        clearable
                        hide-details="auto"
                        @update:model-value="validateEntry(entry)"
                        no-data-text="ບໍ່ມີຂໍ້ມູນບັນຊີ"
                      >
                      
                      </v-autocomplete>
                    </v-col>

                    <!-- Credit Account -->
                    <v-col cols="12" sm="6" md="2">
                      <v-autocomplete
                        v-model="entry.CreditAccount"
                        :items="accounts"
                        item-title="account_display"
                        item-value="glsub_id"
                        label="ບັນຊີເຄຣດິດ"
                        variant="outlined"
                        density="comfortable"
                        :loading="loading.accounts"
                        clearable
                        hide-details="auto"
                        @update:model-value="validateEntry(entry)"
                        no-data-text="ບໍ່ມີຂໍ້ມູນບັນຊີ"
                      >
                        
                      </v-autocomplete>
                    </v-col>

                    <!-- Amount -->
                    <v-col cols="12" sm="6" md="2">
                      <v-text-field
                        v-model.number="entry.Fcy_Amount"
                        label="ຈຳນວນ *"
                        type="number"
                        :rules="amountRules"
                        variant="outlined"
                        density="comfortable"
                        step="0.001"
                        @update:model-value="() => calculateLcyAmount(entry)"
                        @blur="() => calculateLcyAmount(entry)"
                        hide-details="auto"
                        class="amount-field"
                        placeholder="0.00"
                      ></v-text-field>
                    </v-col>

                    <!-- LCY Amount -->
                    <v-col cols="12" sm="6" md="2">
                      <v-text-field
                        :value="formatNumber(getLcyAmount(entry))"
                        label="ຈຳນວນກີບ"
                        variant="outlined"
                        density="comfortable"
                        readonly
                        :hide-details="false"
                        class="lcy-field"
                        :hint="exchangeRate !== 1 ? `Rate: 1 ${journalData.Ccy_cd} = ${formatNumber(exchangeRate)} LAK` : ''"
                        persistent-hint
                      ></v-text-field>
                    </v-col>

                    <!-- Enhanced Additional Sub Text -->
                    <v-col cols="12" sm="12" md="2">
                      <v-text-field
                        v-model="entry.Addl_sub_text"
                        label="ຂໍ້ຄວາມເພີ່ມເຕີມ"
                        variant="outlined"
                        density="comfortable"
                        hide-details="auto"
                        counter="255"
                        :rules="entrySubTextRules"
                        placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
                        class="entry-sub-text-field"
                        @blur="onEntrySubTextBlur(entry, index)"
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
                                :disabled="!journalData.Addl_sub_text && subTextSuggestions.length === 0"
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
                          :disabled="loading.submit"
                          title="ຄັດລອກແຖວ"
                        >
                          <v-icon size="small">mdi-content-duplicate</v-icon>
                        </v-btn>
                        <v-btn 
                          icon
                          size="small"
                          color="error" 
                          @click="removeJournalEntry(index)"
                          :disabled="loading.submit"
                          title="ລຶບແຖວ"
                        >
                          <v-icon size="small">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- Enhanced Entry Status -->
                  <div class="entry-status" v-if="entry.Fcy_Amount > 0">
                    <v-chip 
                      size="x-small" 
                      :color="getEntryStatusColor(entry)" 
                      variant="flat"
                      class="mr-2"
                    >
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

          <!-- Summary Section -->
          <div class="summary-section" v-if="journalEntries.length > 0">
            <v-row dense>
              <v-col cols="12" md="3">
                <v-card class="summary-card" elevation="1" color="primary-lighten-5">
                  <v-card-text class="pa-3 text-center">
                    <div class="summary-label">ລາຍການທັງໝົດ</div>
                    <div class="summary-value text-primary">{{ journalEntries.length }}</div>
                    <div class="summary-meta">{{ entriesWithDescription }} ມີລາຍລະອຽດ</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card class="summary-card" elevation="1" color="success-lighten-5">
                  <v-card-text class="pa-3 text-center">
                    <div class="summary-label">ລວມເດບິດ</div>
                    <div class="summary-value text-success">{{ formatNumber(totalDebitAmount) }}</div>
                    <div class="summary-currency">LAK</div>
                    <div v-if="journalData.Ccy_cd !== 'LAK'" class="summary-fcy text-caption">
                      ({{ formatNumber(totalDebitAmount / (exchangeRate || 1)) }} {{ journalData.Ccy_cd }})
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card class="summary-card" elevation="1" color="info-lighten-5">
                  <v-card-text class="pa-3 text-center">
                    <div class="summary-label">ລວມເຄຣດິດ</div>
                    <div class="summary-value text-info">{{ formatNumber(totalCreditAmount) }}</div>
                    <div class="summary-currency">LAK</div>
                    <div v-if="journalData.Ccy_cd !== 'LAK'" class="summary-fcy text-caption">
                      ({{ formatNumber(totalCreditAmount / (exchangeRate || 1)) }} {{ journalData.Ccy_cd }})
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card class="summary-card" elevation="1" :color="isBalanced ? 'success-lighten-5' : 'error-lighten-5'">
                  <v-card-text class="pa-3 text-center">
                    <div class="summary-label">ສະຖານະ</div>
                    <v-chip 
                      size="small" 
                      :color="isBalanced ? 'success' : 'error'" 
                      variant="flat"
                    >
                      <v-icon left size="x-small">{{ isBalanced ? 'mdi-check' : 'mdi-alert' }}</v-icon>
                      {{ isBalanced ? 'ສົມດຸນ' : 'ບໍ່ສົມດຸນ' }}
                    </v-chip>
                    <div v-if="!isBalanced && balanceDifference !== 0" class="balance-difference">
                      ຕ່າງ: {{ formatNumber(Math.abs(balanceDifference)) }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Description Analysis (Show commonly used descriptions) -->
          <div class="description-analysis" v-if="journalEntries.length > 1">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon left color="info" size="small">mdi-chart-bar</v-icon>
                  ການວິເຄາະລາຍລະອຽດ (Description Analysis)
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <h5>ລາຍລະອຽດທີ່ໃຊ້ຫຼາຍ:</h5>
                      <v-chip-group variant="outlined" size="small">
                        <v-chip 
                          v-for="(desc, index) in uniqueDescriptions" 
                          :key="index"
                          size="small"
                          variant="outlined"
                          color="info"
                          @click="fillAllEntriesWithDescription(desc.text)"
                        >
                          {{ desc.text }} ({{ desc.count }})
                        </v-chip>
                      </v-chip-group>
                    </v-col>
                    <v-col cols="12" md="6">
                      <h5>ສະຖິຕິ:</h5>
                      <div class="text-caption">
                        <div>ລາຍການທີ່ມີລາຍລະອຽດ: {{ entriesWithDescription }}/{{ journalEntries.length }}</div>
                        <div>ລາຍລະອຽດທີ່ແຕກຕ່າງ: {{ uniqueDescriptions.length }}</div>
                        <div>ຄວາມຍາວສູງສຸດ: {{ maxDescriptionLength }} ຕົວອັກສອນ</div>
                      </div>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <!-- Debug Information (for development) -->
          <div class="debug-section" v-if="journalEntries.length > 0">
            <v-expansion-panels variant="accordion">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon left color="info" size="small">mdi-bug</v-icon>
                  ຂໍ້ມູນການດີບັກ (Debug Info)
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-card outlined class="pa-2">
                        <div class="text-caption"><strong>ຟອມ Entries:</strong> {{ journalEntries.length }}</div>
                        <div class="text-caption"><strong>API Entries:</strong> {{ apiEntriesCount }}</div>
                        <div class="text-caption"><strong>Currency:</strong> {{ journalData.Ccy_cd }}</div>
                        <div class="text-caption"><strong>Exchange Rate:</strong> {{ formatNumber(exchangeRate) }}</div>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-card outlined class="pa-2">
                        <div class="text-caption"><strong>Debit Total (FCY):</strong> {{ formatNumber(totalDebitAmount / (exchangeRate || 1)) }}</div>
                        <div class="text-caption"><strong>Credit Total (FCY):</strong> {{ formatNumber(totalCreditAmount / (exchangeRate || 1)) }}</div>
                        <div class="text-caption"><strong>Debit Total (LCY):</strong> {{ formatNumber(totalDebitAmount) }}</div>
                        <div class="text-caption"><strong>Credit Total (LCY):</strong> {{ formatNumber(totalCreditAmount) }}</div>
                        <div class="text-caption"><strong>Difference:</strong> {{ formatNumber(balanceDifference) }}</div>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-card outlined class="pa-2">
                        <div class="text-caption"><strong>Form Valid:</strong> {{ isFormValid ? 'Yes' : 'No' }}</div>
                        <div class="text-caption"><strong>Balanced:</strong> {{ isBalanced ? 'Yes' : 'No' }}</div>
                        <div class="text-caption"><strong>Reference:</strong> {{ journalData.Reference_No || 'Not set' }}</div>
                        <div class="text-caption"><strong>Main Addl_text:</strong> {{ journalData.Addl_text || 'Empty' }}</div>
                        <div class="text-caption"><strong>Main Addl_sub_text:</strong> {{ journalData.Addl_sub_text || 'Empty' }}</div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
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
              ບັນທຶກ ({{ apiEntriesCount }} ລາຍການ API)
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
<!-- 
            <v-btn
              variant="text"
              size="large"
              @click="checkBalance"
              :disabled="!journalData.Reference_No || loading.checkBalance"
              :loading="loading.checkBalance"
              class="balance-btn"
            >
              <v-icon left>mdi-scale-balance</v-icon>
              ກວດສອບຍອດ
            </v-btn>

            <v-btn
              variant="text"
              size="large"
              @click="validateDescriptions"
              :disabled="loading.submit"
              color="info"
            >
              <v-icon left>mdi-text-box-check</v-icon>
              ກວດລາຍລະອຽດ
            </v-btn> -->
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
const selectedTemplate = ref(null)

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

// Exchange rate - make sure it's a ref
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
  exchangeRate: false
})

// Arrays for entries
const journalEntries = ref([])

// Data arrays
const modules = ref([])
const currencies = ref([])
const accounts = ref([])
const transactionCodes = ref([])
const finCycles = ref([])
const periodCodes = ref([])

// New arrays for templates and suggestions
const descriptionTemplates = ref([
  { label: 'ການໂອນເງິນ', main: 'ການໂອນເງິນລະຫວ່າງບັນຊີ', sub: 'ການໂອນເງິນປົກກະຕິ' },
  { label: 'ການຈ່າຍເງິນເດືອນ', main: 'ການຈ່າຍເງິນເດືອນພະນັກງານ', sub: 'ເງິນເດືອນປະຈຳເດືອນ' },
  { label: 'ຄ່າໃຊ້ຈ່າຍ', main: 'ຄ່າໃຊ້ຈ່າຍດຳເນີນງານ', sub: 'ຄ່າໃຊ້ຈ່າຍປົກກະຕິ' },
  { label: 'ລາຍຮັບ', main: 'ລາຍຮັບຈາກການຂາຍ', sub: 'ລາຍຮັບປົກກະຕິ' },
  { label: 'ການປິດບັນຊີ', main: 'ການປິດບັນຊີປະຈຳເດືອນ', sub: 'ການປິດບັນຊີຕາມປົກກະຕິ' }
])

const entryTemplates = ref([
  {
    name: 'ໂອນເງິນສົດ',
    entries: [
      { DebitAccount: null, CreditAccount: null, Fcy_Amount: 0, Addl_sub_text: 'ໂອນເງິນສົດເຂົ້າບັນຊີ' },
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

const subTextSuggestions = ref([])

console.log('Journal entries before submit:', JSON.parse(JSON.stringify(journalEntries.value)))

// Enhanced validation rules
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

// New validation rules for Addl_text and Addl_sub_text
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

// API configuration
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Enhanced computed properties
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

const balanceDifference = computed(() => {
  return totalDebitAmount.value - totalCreditAmount.value
})

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

// New computed properties for description analysis
const entriesWithDescription = computed(() => {
  return journalEntries.value.filter(entry => entry.Addl_sub_text && entry.Addl_sub_text.trim()).length
})

const uniqueDescriptions = computed(() => {
  const descriptions = {}
  journalEntries.value.forEach(entry => {
    if (entry.Addl_sub_text && entry.Addl_sub_text.trim()) {
      const text = entry.Addl_sub_text.trim()
      descriptions[text] = (descriptions[text] || 0) + 1
    }
  })
  
  return Object.entries(descriptions)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5
})

const maxDescriptionLength = computed(() => {
  return Math.max(0, ...journalEntries.value.map(entry => (entry.Addl_sub_text || '').length))
})

const isFormValid = computed(() => {
  // Basic form validation
  if (!valid.value || journalEntries.value.length === 0) {
    return false
  }
  
  // Required fields validation
  if (!journalData.Reference_No || !journalData.Ccy_cd || !journalData.Txn_code || !journalData.module_id) {
    return false
  }
  
  // Check if either main Addl_text or Addl_sub_text is provided
  if (!journalData.Addl_text && !journalData.Addl_sub_text) {
    const hasEntryDescription = journalEntries.value.some(entry => entry.Addl_sub_text && entry.Addl_sub_text.trim())
    if (!hasEntryDescription) {
      return false
    }
  }
  
  // Check if all entries have valid amounts and at least one account
  const validEntries = journalEntries.value.every(entry => {
    const hasValidAmount = entry.Fcy_Amount && parseFloat(entry.Fcy_Amount) > 0
    const hasAccount = entry.DebitAccount || entry.CreditAccount
    return hasValidAmount && hasAccount
  })
  
  if (!validEntries) {
    return false
  }
  
  // Calculate API-level balance (what will actually be sent to backend)
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
  
  // Must be balanced within 0.01 tolerance
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

// Enhanced methods
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
    console.log('Calculate LCY:', {
      fcyAmount,
      rate,
      result: entry.Lcy_Amount,
      currency: journalData.Ccy_cd
    })
  } else {
    entry.Lcy_Amount = 0
  }
}

// New methods for Addl_sub_text handling
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

const fillAllEntriesWithDescription = (description) => {
  journalEntries.value.forEach(entry => {
    entry.Addl_sub_text = description
  })
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
  // Clear existing entries
  journalEntries.value = []
  
  // Add template entries
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
  // Auto-suggest similar descriptions for other entries
  if (entry.Addl_sub_text) {
    updateSubTextSuggestions()
  }
}

const updateSubTextSuggestions = () => {
  const suggestions = new Set()
  
  // Add from current form
  if (journalData.Addl_text) suggestions.add(journalData.Addl_text)
  if (journalData.Addl_sub_text) suggestions.add(journalData.Addl_sub_text)
  
  // Add from existing entries
  journalEntries.value.forEach(entry => {
    if (entry.Addl_sub_text) suggestions.add(entry.Addl_sub_text)
  })
  
  // Add from templates
  descriptionTemplates.value.forEach(template => {
    suggestions.add(template.main)
    suggestions.add(template.sub)
  })
  
  subTextSuggestions.value = Array.from(suggestions).filter(s => s.length > 0).slice(0, 10)
}

const generateAutoDescription = (entry) => {
  const debitAccount = accounts.value.find(a => a.glsub_id === entry.DebitAccount)
  const creditAccount = accounts.value.find(a => a.glsub_id === entry.CreditAccount)
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

const validateDescriptions = () => {
  const errors = []
  const warnings = []
  
  // Check main descriptions
  if (!journalData.Addl_text && !journalData.Addl_sub_text) {
    warnings.push('ບໍ່ມີຂໍ້ຄວາມເພີ່ມເຕີມຫຼັກ')
  }
  
  // Check entry descriptions
  journalEntries.value.forEach((entry, index) => {
    if (!entry.Addl_sub_text || !entry.Addl_sub_text.trim()) {
      warnings.push(`ລາຍການທີ ${index + 1} ບໍ່ມີລາຍລະອຽດ`)
    } else if (entry.Addl_sub_text.length > 255) {
      errors.push(`ລາຍການທີ ${index + 1} ລາຍລະອຽດຍາວເກີນໄປ`)
    }
  })
  
  // Show results
  if (errors.length > 0) {
    Swal.fire({
      icon: 'error',
      title: 'ພົບຂໍ້ຜິດພາດ',
      html: `<ul style="text-align: left;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`,
      confirmButtonText: 'ຕົກລົງ'
    })
  } else if (warnings.length > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'ຄຳເຕືອນ',
      html: `<ul style="text-align: left;">${warnings.map(w => `<li>${w}</li>`).join('')}</ul>`,
      confirmButtonText: 'ຕົກລົງ'
    })
  } else {
    Swal.fire({
      icon: 'success',
      title: 'ຖືກຕ້ອງ',
      text: 'ລາຍລະອຽດທັງໝົດຖືກຕ້ອງ',
      timer: 2000,
      showConfirmButton: false
    })
  }
}

// Continue with existing methods (keeping all the original methods)
const onMainCurrencyChange = async () => {
  const selectedCurrency = currencies.value.find(c => c.ccy_code === journalData.Ccy_cd)
  console.log('Currency changed to:', journalData.Ccy_cd, selectedCurrency)
  
  if (selectedCurrency && journalData.Ccy_cd !== 'LAK') {
    // Try to get exchange rate from API
    try {
      loading.exchangeRate = true
      const url = `/api/exc-rate/?ccy_code=${journalData.Ccy_cd}`
      console.log('Fetching exchange rate from:', url)
      
      const response = await axios.get(url, getAuthHeaders())
      console.log('Exchange rate response:', response.data)
      
      let saleRate = 1
      
      // Handle different response structures
      if (response.data) {
        if (response.data.results && Array.isArray(response.data.results) && response.data.results.length > 0) {
          // Paginated response
          saleRate = parseFloat(response.data.results[0].Sale_Rate || response.data.results[0].sale_rate || 1)
        } else if (response.data.Sale_Rate || response.data.sale_rate) {
          // Direct response
          saleRate = parseFloat(response.data.Sale_Rate || response.data.sale_rate || 1)
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          // Array response
          saleRate = parseFloat(response.data[0].Sale_Rate || response.data[0].sale_rate || 1)
        }
      }
      
      exchangeRate.value = saleRate
      console.log('Exchange rate set to:', exchangeRate.value)
      
      if (saleRate === 1) {
        console.warn('Exchange rate defaulted to 1, API response might not contain rate data')
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      exchangeRate.value = 1
      
      // Show error to user
      Swal.fire({
        icon: 'warning',
        title: 'ບໍ່ສາມາດໂຫລດອັດຕາແລກປ່ຽນ',
        text: `ໃຊ້ອັດຕາແລກປ່ຽນເລີ່ມຕົ້ນ 1:1 ສຳລັບ ${journalData.Ccy_cd}`,
        timer: 3000,
        showConfirmButton: false
      })
    } finally {
      loading.exchangeRate = false
    }
  } else {
    // LAK or no currency selected
    exchangeRate.value = 1
  }
  
  // Recalculate all entries with new exchange rate
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
  // Ensure at least one account is selected
  if (!entry.DebitAccount && !entry.CreditAccount) {
    return false
  }
  // Don't allow same account for both debit and credit
  if (entry.DebitAccount && entry.CreditAccount && entry.DebitAccount === entry.CreditAccount) {
    entry.CreditAccount = null
    Swal.fire({
      icon: 'warning',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດເລືອກບັນຊີດຽວກັນສຳລັບເດບິດ ແລະ ເຄຣດິດ',
      confirmButtonText: 'ຕົກລົງ'
    })
    return false
  }
  return true
}

const getEntryStatus = (entry) => {
  if (!entry.Fcy_Amount || entry.Fcy_Amount <= 0) return 'ບໍ່ມີຈຳນວນ'
  if (!entry.DebitAccount && !entry.CreditAccount) return 'ບໍ່ມີບັນຊີ'
  if (entry.DebitAccount && entry.CreditAccount) return 'ຄົບຖ້ວນ'
  if (entry.DebitAccount || entry.CreditAccount) return 'ຂາດບັນຊີ'
  return 'ບໍ່ຖືກຕ້ອງ'
}

const getEntryStatusColor = (entry) => {
  const status = getEntryStatus(entry)
  switch (status) {
    case 'ຄົບຖ້ວນ': return 'success'
    case 'ຂາດບັນຊີ': return 'warning'
    default: return 'error'
  }
}

const getAccountName = (accountId) => {
  const account = accounts.value.find(a => a.glsub_id === accountId)
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
    
    // Use the exact payload structure expected by backend
    const payload = {
      module_id: journalData.module_id,
      txn_code: journalData.Txn_code,
      value_date: journalData.Value_date
    }
    
    console.log('Generating reference with payload:', payload)
    
    const response = await axios.post('/api/journal-entries/generate_reference/', payload, getAuthHeaders())
    
    console.log('Generate reference response:', response.data)
    
    journalData.Reference_No = response.data.reference_no
    autoReferenceMode.value = true
    
    Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ',
      text: `ສ້າງເລກອ້າງອີງ: ${response.data.reference_no}`,
      timer: 2000,
      showConfirmButton: false
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

// Add this function to create watchers for each entry
const setupEntryWatchers = (entry) => {
  watch(() => entry.Fcy_Amount, (newValue) => {
    console.log('Fcy_Amount changed:', newValue)
    calculateLcyAmount(entry)
  })
}

const addJournalEntry = () => {
  const newEntry = {
    Fcy_Amount: '',
    Lcy_Amount: 0,
    DebitAccount: null,
    CreditAccount: null,
    Addl_sub_text: journalData.Addl_sub_text || ''  // Use main sub text as default
  }
  journalEntries.value.push(newEntry)
  setupEntryWatchers(newEntry)
}

const removeJournalEntry = (index) => {
  journalEntries.value.splice(index, 1)
}

const addQuickEntry = () => {
  // Add a few entries for quick setup
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

// API Loading Functions
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
    
    // If a currency is already selected, load its exchange rate
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
      account_display: `${account.glsub_code} - ${account.glsub_Desc_la || account.glsub_Desc_en}`,
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
    periodCodes.value = data.map(period => ({
      ...period,
      period_display: `${period.period_code} - ${period.PC_StartDate ? new Date(period.PC_StartDate).toLocaleDateString() : ''}`,
    }))
  } catch (error) {
    console.error('Error loading period codes:', error)
    Swal.fire('ຂໍ້ຜິດພາດ', 'ເກີດຂໍ້ຜິດພາດໃນການໂຫລດລະຫັດໄລຍະ', 'error')
  } finally {
    loading.periodCodes = false
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
    
    // Prepare batch create payload exactly matching backend API
    const batchPayload = {
      Reference_No: journalData.Reference_No,
      Ccy_cd: journalData.Ccy_cd,
      Txn_code: journalData.Txn_code,
      Value_date: journalData.Value_date + 'T00:00:00Z',
      Addl_text: journalData.Addl_text || '',
      Addl_sub_text: journalData.Addl_sub_text || '',  // Include the main sub text
      fin_cycle: journalData.fin_cycle || null,
      Period_code: journalData.Period_code || null,
      module_id: journalData.module_id || 'GL',
      entries: []
    }
    
    // Convert journal entries to API format
    journalEntries.value.forEach(entry => {
      // Calculate LCY amount before submission
      calculateLcyAmount(entry)
      const getAccountCode = (accountId) => {
      const account = accounts.value.find(a => a.glsub_id === accountId)
      return account ? account.glsub_code : ''
}
      // Ensure we have a valid amount
      const amount = parseFloat(entry.Fcy_Amount) || 0
      if (amount <= 0) return
      
      // Add debit entry if debit account is selected
      if (entry.DebitAccount) {
        batchPayload.entries.push({
          Account: entry.DebitAccount,
          Amount: amount,
          Dr_cr: 'D',
          Addl_sub_text: entry.Addl_sub_text || batchPayload.Addl_sub_text || '',  // Priority: entry -> main -> empty
          Ac_relatives: getAccountCode(entry.CreditAccount) // <-- use code, not id

        })
      }
      
      // Add credit entry if credit account is selected
      if (entry.CreditAccount) {
        batchPayload.entries.push({
          Account: entry.CreditAccount,
          Amount: amount,
          Dr_cr: 'C',
          Addl_sub_text: entry.Addl_sub_text || batchPayload.Addl_sub_text || '',  // Priority: entry -> main -> empty
          Ac_relatives: getAccountCode(entry.DebitAccount) // <-- use code, not id
        })
      }
    })
    
    // Validate entries before submission
    if (batchPayload.entries.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ບໍ່ມີລາຍການ',
        text: 'ກະລຸນາເພີ່ມລາຍການບັນທຶກກ່ອນບັນທຶກ',
        confirmButtonText: 'ຕົກລົງ'
      })
      return
    }
    
    // Calculate totals for validation
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
    
    console.log('Submitting batch payload:', batchPayload)
    
    // Submit using batch create API
    const response = await axios.post('/api/journal-entries/batch_create/', batchPayload, getAuthHeaders())
    
    console.log('Batch create response:', response.data)
    
    // Success message with detailed information
    await Swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ!',
      html: `
        <div style="text-align: left;">
          <p><strong>ເລກອ້າງອີງ:</strong> ${response.data.reference_no || journalData.Reference_No}</p>
          <p><strong>ຈຳນວນລາຍການທີ່ສ້າງ:</strong> ${response.data.entries?.length || batchPayload.entries.length}</p>
          <p><strong>ຈຳນວນແຖວຟອມ:</strong> ${journalEntries.value.length}</p>
          <p><strong>ເດບິດລວມ:</strong> ${formatNumber(totalDebit)} ${journalData.Ccy_cd}</p>
          <p><strong>ເຄຣດິດລວມ:</strong> ${formatNumber(totalCredit)} ${journalData.Ccy_cd}</p>
          <p><strong>ລາຍການທີ່ມີລາຍລະອຽດ:</strong> ${entriesWithDescription.value}/${journalEntries.value.length}</p>
        </div>
      `,
      confirmButtonText: 'ຕົກລົງ',
      timer: 7000
    })
    
    // Auto-generate next reference if in auto mode
    if (autoReferenceMode.value) {
      setTimeout(() => {
        generateReference()
      }, 1000)
    }
    
    resetForm()
    
  } catch (error) {
    console.error('Error submitting journal:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ'
    let errorDetails = ''
    
    if (error.response?.data) {
      const errorData = error.response.data
      
      // Handle validation errors
      if (errorData.entries) {
        errorMessage = 'ຂໍ້ຜິດພາດໃນລາຍການບັນທຶກ'
        errorDetails = Array.isArray(errorData.entries) 
          ? errorData.entries.join(', ')
          : JSON.stringify(errorData.entries)
      }
      // Handle other API errors
      else if (errorData.error) {
        errorMessage = errorData.error
      }
      else if (errorData.detail) {
        errorMessage = errorData.detail
      }
      // Handle field validation errors
      else if (typeof errorData === 'object') {
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
    Value_date: new Date().toISOString().substr(0, 10),
    Addl_text: '',
    Addl_sub_text: '',
    fin_cycle: null,
    Period_code: null
  })
  
  journalEntries.value = []
  autoReferenceMode.value = false
  selectedTemplate.value = null
  
  // Clear suggestions
  subTextSuggestions.value = []
  
  // If we were in auto mode and have the required fields, generate new reference
  if (wasAutoMode && currentTxnCode && currentModule) {
    nextTick(() => {
      autoReferenceMode.value = true
      generateReference()
    })
  }
  
  nextTick(() => {
    form.value?.resetValidation()
    // Add default entry
    addJournalEntry()
  })
}

// Watchers
watch(() => journalData.Txn_code, onTransactionCodeChange)
watch(() => journalData.Value_date, updateReferenceNumber)
watch(() => journalData.Ccy_cd, onMainCurrencyChange)
watch(() => journalData.fin_cycle, loadPeriodCodes)

// Watch for changes in main descriptions to update suggestions
watch(() => journalData.Addl_text, updateSubTextSuggestions)
watch(() => journalData.Addl_sub_text, updateSubTextSuggestions)

// Watch exchange rate changes to recalculate all amounts
watch(exchangeRate, (newRate) => {
  console.log('Exchange rate changed to:', newRate)
  journalEntries.value.forEach(entry => {
    if (entry.Fcy_Amount > 0) {
      calculateLcyAmount(entry)
    }
  })
})

// Lifecycle
onMounted(async () => {
  // Load all necessary data
  await Promise.all([
    loadModules(),
    loadCurrencies(),
    loadAccounts(),
    loadTransactionCodes(),
    loadFinCycles()
  ])
  
  // If LAK is not the default currency, load exchange rate
  if (journalData.Ccy_cd && journalData.Ccy_cd !== 'LAK') {
    onMainCurrencyChange()
  }
  
  // Initialize suggestions
  updateSubTextSuggestions()
  
  // Add first entry by default
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
  margin-bottom: 20px;
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

.module-field {
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
  /* border: 2px solid #ff9800 !important; */
}

.currency-field {
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
  /* border: 2px solid #4caf50 !important; */
}

.generate-btn {
  height: 56px;
}

.exchange-rate-info {
  margin: 12px 0;
  text-align: center;
}

.entries-section {
  margin: 24px 0;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.entries-title {
  font-size: 1rem;
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
    padding: 8px 12px;
    margin-bottom: 12px;
    font-weight: 500;
    font-size: 0.8rem;
    color: #1976d2;
  }
}

.header-cell {
  padding: 0 4px;
}

.account-col {
  width: 20%;
}

.amount-col {
  width: 15%;
}

.lcy-col {
  width: 15%;
}

.text-col {
  width: 25%;
}

.action-col {
  width: 5%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  background: white;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.empty-text h4 {
  margin: 12px 0 8px 0;
  color: #666;
}

.empty-text p {
  margin: 0;
  color: #999;
  font-size: 0.9rem;
}

.journal-entry-row {
  margin-bottom: 12px;
  animation: slideIn 0.3s ease;
}

.entry-card {
  border-radius: 8px;
  transition: all 0.2s ease;
  background: white;
}

.entry-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.row-number {
  min-width: 60px;
}

.amount-field {
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

.lcy-field {
  background-color: #f8f9fa;
}

.lcy-field :deep(.v-text-field__details) {
  min-height: 20px;
  padding-top: 4px;
}

.lcy-field :deep(.v-messages) {
  font-size: 0.75rem;
  color: #666;
}

.entry-status {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.summary-section {
  margin: 24px 0;
}

.summary-card {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-1px);
}

.summary-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.summary-currency {
  font-size: 0.75rem;
  color: #666;
  margin-top: 2px;
}

.summary-fcy {
  margin-top: 4px;
  color: #888;
}

.balance-difference {
  font-size: 0.75rem;
  color: #f44336;
  margin-top: 4px;
}

.debug-section {
  margin: 16px 0;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.debug-section :deep(.v-expansion-panel-title) {
  background: #e3f2fd;
  min-height: 40px;
}

.debug-section .text-caption {
  margin: 2px 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.submit-btn, .reset-btn, .balance-btn {
  min-width: 160px;
  border-radius: 6px;
}

.compact-item {
  min-height: 70px !important;
}

.compact-item :deep(.v-list-item-title) {
  font-size: 0.8rem;
  line-height: 1.2;
}

.compact-item :deep(.v-list-item-subtitle) {
  font-size: 0.7rem;
  line-height: 1;
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
  
  .submit-btn, .reset-btn, .balance-btn {
    width: 100%;
    max-width: 280px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .section-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  
  .entry-status {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
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
</style>  