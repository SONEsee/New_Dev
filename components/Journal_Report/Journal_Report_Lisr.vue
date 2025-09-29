<template>
  <v-container fluid class="pa-2">
    <!-- Enhanced Tabs Section with 6 tabs including Journal Report ACTB -->
    <v-tabs 
      v-model="activeTab" 
      bg-color="primary" 
      dark 
      class="mb-3"
      show-arrows
      slider-color="white"
    >
      <!-- Tab for the main table content -->
      <!-- Journal Report ACTB Tab -->
    <v-tab value="journal_report_actb">
        <v-icon start>mdi-book-open-page-variant</v-icon>
        <span class="d-none d-md-inline">ການເຄື່ອນໄຫວບັນຊີກ່ອນປິດບັນຊີ</span>
        <span class="d-md-none">JR ACTB</span>
      </v-tab>
            <v-tab value="journal_report">
        <v-icon start>mdi-book-open-page-variant</v-icon>
        <span class="d-none d-md-inline">ການເຄື່ອນໄຫວບັນຊີຫຼັງປິດບັນຊີ</span>
        <span class="d-md-none">JR</span>
      </v-tab>
    </v-tabs>

    <!-- Tab Content Info Bar -->
    <v-card class="mb-3" elevation="0" style="border: 1px solid #e0e0e0;">
      <v-card-text class="py-2">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-chip 
              :color="getTabColor(activeTab)" 
              size="small" 
              variant="tonal"
              class="me-2"
            >
              <v-icon start size="16">{{ getTabIcon(activeTab) }}</v-icon>
              {{ getTabTitle(activeTab) }}
            </v-chip>
            <span class="text-body-2 text-grey-darken-1 text-styles">
              ກຳລັງສະແດງ: {{ getTabDescription(activeTab) }}
            </span>
          </div>
          <v-btn-toggle 
            v-model="viewMode" 
            density="compact" 
            class="d-none d-md-flex"
          >
            <v-btn value="table" size="small">
              <v-icon>mdi-table</v-icon>
            </v-btn>
            <v-btn value="chart" size="small">
              <v-icon>mdi-chart-bar</v-icon>
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-card-text>
    </v-card>

    <!-- Enhanced Tab Content Window - ALL CONTENT IS NOW INSIDE HERE -->
    <v-window v-model="activeTab">
      <!-- Main SomTop Trail Balance Tab with Table -->
      <v-window-item value="somtop_trial">
        <v-card class="mx-auto" elevation="0" style="border: 1px solid #e0e0e0;">
          <!-- Header Section -->
          <v-card-title class="px-4 py-3 d-flex align-center" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white;">
            <v-icon start size="24">mdi-chart-box-outline</v-icon>
            <span class="text-h6 font-weight-medium text-styles">
              ລາຍງານໃບສົມທົບ - 
              {{ selectedCurrency ? `${selectedCurrency} (FCY)` : 'LCY Consolidated' }}
            </span>
            <v-spacer />
            <v-chip 
              color="white" 
              text-color="primary" 
              size="small" 
              variant="outlined"
            >
              {{ getTabTitle(activeTab) }}
            </v-chip>
          </v-card-title>
          
          <v-card-text class="px-4 py-3">
            <!-- Filter Form -->
            <v-form @submit.prevent="fetchTrialBalance" class="mb-3">
              <!-- Main Filter Row - Optimized for better space utilization -->
              <v-row no-gutters class="mb-3 align-center">
                <!-- Currency Selection - Reduced width for more space -->
                <v-col cols="12" sm="6" md="3" lg="3" xl="3" class="pe-md-2 mb-3 mb-md-0">
                  <v-select
                    v-model="filters.currency"
                    :items="currencyOptions"
                    label="ເລືອກສະກຸນເງິນ"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-currency-usd"
                    hide-details="auto"
                    clearable
                    @update:model-value="onCurrencyChange"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-icon :icon="item.raw.icon" size="20" />
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
                
                <!-- Date Range Container - Better spacing -->
                <v-col cols="12" sm="6" md="4" lg="4" xl="4" class="px-md-1 mb-3 mb-md-0">
                  <v-row no-gutters>
                    <v-col cols="6" class="pe-1">
                      <v-text-field
                        v-model="filters.date_start"
                        label="ວັນທີເລີ່ມຕົ້ນ"
                        type="date"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-calendar-start"
                        hide-details="auto"
                      />
                    </v-col>
                    <v-col cols="6" class="ps-1">
                      <v-text-field
                        v-model="filters.date_end"
                        label="ວັນທີສິ້ນສຸດ"
                        type="date"
                        variant="outlined"
                        density="compact"
                        prepend-inner-icon="mdi-calendar-end"
                        hide-details="auto"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <!-- Search Field -->
                <v-col cols="12" md="3" lg="3" xl="3" class="px-md-1 mb-3 mb-md-0">
                  <v-text-field
                    v-model="searchText"
                    label="ຄົ້ນຫາໃນຕາຕະລາງ"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                </v-col>

                <!-- Professional Action Buttons -->
                <v-col cols="12" md="2" lg="2" xl="2" class="ps-md-2 d-flex justify-end">
                  <div class="action-buttons-container">
                    <!-- Primary Search Button -->
                    <v-tooltip text="ຄົ້ນຫາຂໍ້ມູນ" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          type="submit"
                          icon="mdi-magnify"
                          color="primary"
                          :loading="loading"
                          size="large"
                          variant="elevated"
                          class="action-btn primary-action"
                        />
                      </template>
                    </v-tooltip>

                    <!-- Action Button Group -->
                    <div class="action-group">
                      <!-- Excel Export -->
                      <v-tooltip text="ສົ່ງອອກເປັນ Excel" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-microsoft-excel"
                            color="success"
                            :disabled="!results.length || loading"
                            @click="exportToExcel"
                            size="default"
                            variant="tonal"
                            class="action-btn"
                          />
                        </template>
                      </v-tooltip>

                      <!-- Dairy Report Export -->
                      <v-tooltip text="ສົ່ງອອກ Dairy Report" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-database-export"
                            color="warning"
                            :disabled="!results.length || loading"
                            @click="exportToDairyReport"
                            size="default"
                            variant="tonal"
                            class="action-btn"
                          />
                        </template>
                      </v-tooltip>

                      <!-- SomTop Report Export -->
                      <v-tooltip text="ສົ່ງອອກ SomTop Report" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-database-import"
                            color="info"
                            :disabled="!results.length || loading"
                            @click="exportToSOmTopReport"
                            size="default"
                            variant="tonal"
                            class="action-btn"
                          />
                        </template>
                      </v-tooltip>

                      <!-- ACTB Export (conditional) -->
                      <v-tooltip v-if="isACTBTab(activeTab)" text="ສົ່ງອອກ ACTB Report" location="top">
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon="mdi-file-export"
                            color="deep-purple"
                            :disabled="!results.length || loading"
                            @click="exportToACTBReport"
                            size="default"
                            variant="tonal"
                            class="action-btn"
                          />
                        </template>
                      </v-tooltip>

                      <!-- More Actions Menu -->
                      <v-menu location="bottom">
                        <template #activator="{ props }">
                          <v-tooltip text="ເພີ່ມເຕີມ" location="top">
                            <template #activator="{ props: tooltipProps }">
                              <v-btn
                                v-bind="{ ...props, ...tooltipProps }"
                                icon="mdi-dots-vertical"
                                color="grey-darken-1"
                                size="default"
                                variant="text"
                                class="action-btn"
                              />
                            </template>
                          </v-tooltip>
                        </template>
                        
                        <v-list density="compact" min-width="200">
                          <v-list-item @click="exportToExcel" :disabled="!results.length">
                            <template #prepend>
                              <v-icon color="success">mdi-microsoft-excel</v-icon>
                            </template>
                            <v-list-item-title>ສົ່ງອອກ Excel</v-list-item-title>
                          </v-list-item>
                          
                          <v-list-item @click="exportToDairyReport" :disabled="!results.length">
                            <template #prepend>
                              <v-icon color="warning">mdi-database-export</v-icon>
                            </template>
                            <v-list-item-title>Dairy Report</v-list-item-title>
                          </v-list-item>
                          
                          <v-list-item @click="exportToSOmTopReport" :disabled="!results.length">
                            <template #prepend>
                              <v-icon color="info">mdi-paperclip-outline</v-icon>
                            </template>
                            <v-list-item-title>SomTop Report</v-list-item-title>
                          </v-list-item>
                          
                          <v-list-item v-if="isACTBTab(activeTab)" @click="exportToACTBReport" :disabled="!results.length">
                            <template #prepend>
                              <v-icon color="deep-purple">mdi-file-export</v-icon>
                            </template>
                            <v-list-item-title>ACTB Report</v-list-item-title>
                          </v-list-item>
                          
                          <v-divider />
                          
                          <v-list-item @click="fetchTrialBalance" :disabled="loading">
                            <template #prepend>
                              <v-icon color="primary">mdi-refresh</v-icon>
                            </template>
                            <v-list-item-title>ໂຫຼດຂໍ້ມູນໃໝ່</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Mobile-Only Actions Row -->
              <v-row no-gutters class="d-md-none mb-3">
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-3">
                    <div class="text-caption text-grey-darken-1 mb-3">ການດຳເນີນງານ</div>
                    
                    <!-- Mobile Action Buttons -->
                    <div class="d-flex flex-wrap gap-2 align-center">
                      <!-- Mobile Search Button -->
                      <v-btn
                        type="submit"
                        color="primary"
                        prepend-icon="mdi-magnify"
                        :loading="loading"
                        size="small"
                        variant="elevated"
                        class="flex-grow-1"
                        style="min-width: 120px;"
                      >
                        ຄົ້ນຫາ
                      </v-btn>

                      <!-- Mobile Export Buttons -->
                      <v-btn
                        icon="mdi-microsoft-excel"
                        color="success"
                        :disabled="!results.length || loading"
                        @click="exportToExcel"
                        size="small"
                        variant="tonal"
                      />
                      
                      <v-btn
                        icon="mdi-database-export"
                        color="warning"
                        :disabled="!results.length || loading"
                        @click="exportToDairyReport"
                        size="small"
                        variant="tonal"
                      />
                      
                      <v-btn
                        icon="mdi-paperclip-outline"
                        color="info"
                        :disabled="!results.length || loading"
                        @click="exportToSOmTopReport"
                        size="small"
                        variant="tonal"
                      />
                      
                      <v-btn
                        v-if="isACTBTab(activeTab)"
                        icon="mdi-file-export"
                        color="deep-purple"
                        :disabled="!results.length || loading"
                        @click="exportToACTBReport"
                        size="small"
                        variant="tonal"
                      />
                    </div>
                    
                    <!-- Mobile Status Chips -->
                    <div class="d-flex flex-wrap gap-1 mt-3">
                      <v-chip
                        v-if="filters.currency"
                        size="small"
                        color="primary"
                        variant="tonal"
                        prepend-icon="mdi-currency-usd"
                      >
                        {{ filters.currency }}
                      </v-chip>
                      <v-chip
                        v-if="filters.date_start && filters.date_end"
                        size="small"
                        color="success"
                        variant="tonal"
                        prepend-icon="mdi-calendar-range"
                      >
                        {{ filters.date_start }} - {{ filters.date_end }}
                      </v-chip>
                      <v-chip
                        v-if="results.length"
                        size="small"
                        color="info"
                        variant="tonal"
                        prepend-icon="mdi-table"
                      >
                        {{ results.length }} ລາຍການ
                      </v-chip>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>

            <v-divider class="mb-3" thickness="1" color="grey-lighten-3" />

            <!-- Table Info Bar -->
            <div class="d-flex justify-space-between align-center mb-3 pa-3 bg-grey-lighten-5 rounded">
              <div class="text-h6 font-weight-medium text-styles">
                ຜົນການຄົ້ນຫາ: {{ results.length }} ລາຍການ
                <v-chip size="small" :color="chipColor" variant="tonal" class="ml-2">
                  {{ chipText }}
                </v-chip>
              </div>
              <v-text-field
                v-model="searchText"
                label="ຄົ້ນຫາໃນຕາຕະລາງ"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                style="max-width: 300px;"
                hide-details
                clearable
              />
            </div>

            <!-- Custom Table Implementation -->
            <div class="custom-table-container">
              <table class="custom-trial-balance-table">
                <!-- Table Header -->
                <thead>
                  <!-- Main Group Headers -->
                  <tr class="main-header-row">
                    <th rowspan="2" class="header-cell sticky-column account-code-header">
                      <div class="header-content-center">ເລກບັນຊີ</div>
                    </th>
                    <th rowspan="2" class="header-cell description-header">
                      <div class="header-content-left">ລາຍລະອຽດ</div>
                    </th>
                    <th colspan="2" class="header-cell group-header">
                      <div class="group-header-content">
                        <v-icon size="16" color="success">mdi-arrow-up-circle</v-icon>
                        <span>ຍອດຍົກ</span>
                      </div>
                    </th>
                    <th colspan="2" class="header-cell group-header">
                      <div class="group-header-content">
                        <v-icon size="16" color="info">mdi-swap-horizontal-circle</v-icon>
                        <span>ຍອດເຄື່ອນ</span>
                      </div>
                    </th>
                    <th colspan="2" class="header-cell group-header">
                      <div class="group-header-content">
                        <v-icon size="16" color="warning">mdi-arrow-down-circle</v-icon>
                        <span>ຍອດເຫຼືອ</span>
                      </div>
                    </th>
                  </tr>
                  <!-- Sub Headers -->
                  <tr class="sub-header-row">
                    <th class="header-cell sub-header">Dr ({{ currencyCode }})</th>
                    <th class="header-cell sub-header">Cr ({{ currencyCode }})</th>
                    <th class="header-cell sub-header">Dr ({{ currencyCode }})</th>
                    <th class="header-cell sub-header">Cr ({{ currencyCode }})</th>
                    <th class="header-cell sub-header">Dr ({{ currencyCode }})</th>
                    <th class="header-cell sub-header">Cr ({{ currencyCode }})</th>
                  </tr>
                </thead>
                
                <!-- Table Body -->
                <tbody>
                  <tr v-if="loading">
                    <td colspan="8" class="text-center pa-8">
                      <v-progress-circular indeterminate color="primary" />
                      <div class="mt-3">ກຳລັງໂຫຼດຂໍ້ມູນ...</div>
                    </td>
                  </tr>
                  
                  <tr v-else-if="!results.length">
                    <td colspan="8" class="text-center pa-8">
                      <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-table-off</v-icon>
                      <div class="text-h6 text-grey-darken-1 mb-2">ບໍ່ມີຂໍ້ມູນ</div>
                      <div class="text-body-2 text-grey">ກະລຸນາປັບປຸງເງື່ອນໄຂການຄົ້ນຫາແລ້ວລອງໃໝ່</div>
                    </td>
                  </tr>
                  
                  <!-- Data Rows -->
                  <tr 
                    v-for="(item, index) in filteredResults" 
                    :key="index"
                    class="data-row"
                  >
                    <td class="data-cell sticky-column account-code-cell">
                      <div class="gl-code-content">
                        <span class="text-primary font-weight-medium">{{ item.GL_Code }}</span>
                      </div>
                    </td>
                    <td class="data-cell description-cell">
                      <div class="description-content" :title="item.Description">
                        {{ item.Description }}
                      </div>
                    </td>
                    <!-- Opening Dr/Cr -->
                    <td class="data-cell amount-cell">
                      <span class="amount-value">{{ formatCurrency(item.Opening_Dr) }}</span>
                    </td>
                    <td class="data-cell amount-cell">
                      <span class="amount-value">{{ formatCurrency(item.Opening_Cr) }}</span>
                    </td>
                    <!-- Flow Dr/Cr -->
                    <td class="data-cell amount-cell">
                      <span class="amount-value">{{ formatCurrency(item.Flow_Dr) }}</span>
                    </td>
                    <td class="data-cell amount-cell">
                      <span class="amount-value">{{ formatCurrency(item.Flow_Cr) }}</span>
                    </td>
                    <!-- Closing Dr/Cr -->
                    <td class="data-cell amount-cell">
                      <span class="amount-value ">{{ formatCurrency(item.Closing_Dr) }}</span>
                    </td>
                    <td class="data-cell amount-cell">
                      <span class="amount-value">{{ formatCurrency(item.Closing_Cr) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Journal Report ACTB Tab - NEW TAB -->
      <v-window-item value="journal_report_actb">
        <JournalReportACTB />
      </v-window-item>
      <v-window-item value="journal_report">
        <JournalReport />
      </v-window-item>
    </v-window>

    <!-- Dairy Report Export Dialog -->
    <v-dialog v-model="showDairyReportDialog" max-width="600" persistent>
      <v-card elevation="8">
        <!-- Dialog Header -->
        <v-card-title class="d-flex align-center pa-4" style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white;">
          <v-icon start size="24">mdi-database-export</v-icon>
          <span class="text-h6 text-styles">ການສົ່ງອອກ Dairy Report</span>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <!-- Warning Alert -->
          <v-alert type="warning" variant="tonal" class="mb-4" border="start">
            <template #prepend>
              <v-icon>mdi-alert-circle</v-icon>
            </template>
            <v-alert-title class="text-h6 mb-2 text-styles">⚠️ ການເຮັດວຽກທີ່ສຳຄັນ</v-alert-title>
            <div class="text-body-2 text-styles">
              <strong>ການດຳເນີນງານນີ້ຈະ:</strong><br>
              • ສົ່ງອອກຂໍ້ມູນໄປ Dairy Report ລະບົບ<br>
              • ນຳເຂົ້າຂໍ້ມູນຈາກ Trial Balance ປັດຈຸບັນ<br>
              • <span class="text-red font-weight-bold text-styles">ກະລຸນາກວດສອບຂໍ້ມູນກ່ອນດຳເນີນການ</span>
            </div>
          </v-alert>
          
          <v-divider class="my-4" />
          
          <!-- Operation Details -->
          <div class="text-body-1 font-weight-medium mb-3 text-styles">
            📋 ລາຍລະອຽດການດຳເນີນງານ:
          </div>
          
          <v-card variant="outlined" class="mb-4">
            <v-list density="compact" class="pa-0">
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-calendar-range</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium text-styles">ໄລຍະວັນທີ</v-list-item-title>
                <v-list-item-subtitle class="text-primary">
                  {{ filters.date_start }} ຫາ {{ filters.date_end }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-divider />
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="info">mdi-currency-usd</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium text-styles">ປະເພດສະກຸນເງິນ</v-list-item-title>
                <v-list-item-subtitle>
                  <!-- {{ selectedCurrency ? `${selectedCurrency} (FCY)` : 'LCY Consolidated' }} -->
                  Somtop_Trail_Balance_All_Currency_Consolidated_lcy
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-divider />
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="success">mdi-database</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">API Endpoint</v-list-item-title>
                <v-list-item-subtitle class="font-mono">
                  /api/dairy-reports/bulk-insert/
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
          
          <!-- Optional Settings -->
          <v-expansion-panels variant="accordion" class="mt-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <template #default>
                  <div class="d-flex align-center">
                    <v-icon start>mdi-cog</v-icon>
                    <span>ການຕັ້ງຄ່າເພີ່ມເຕີມ (Optional Settings)</span>
                  </div>
                </template>
              </v-expansion-panel-title>
              <v-expansion-panel-text class="pt-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="dairyReportOptions.fin_year"
                      label="ປີງົບປະມານ"
                      density="compact"
                      variant="outlined"
                      placeholder="2025"
                      prepend-inner-icon="mdi-calendar"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="dairyReportOptions.period_code"
                      label="ລະຫັດໄລຍະ"
                      density="compact"
                      variant="outlined"
                      placeholder="Optional"
                      prepend-inner-icon="mdi-timeline"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="dairyReportOptions.category"
                      label="ໝວດໝູ່"
                      density="compact"
                      variant="outlined"
                      placeholder="TRIAL_BALANCE"
                      prepend-inner-icon="mdi-tag"
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        
        <!-- Dialog Actions -->
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn 
            color="grey-darken-1"
            variant="outlined"
            @click="showDairyReportDialog = false"
            :disabled="dairyReportLoading"
            prepend-icon="mdi-close"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn 
            color="warning"
            variant="elevated"
            prepend-icon="mdi-database-export"
            :loading="dairyReportLoading"
            @click="executeDairyReportExport"
            class="text-white ml-2"
          >
            <span v-if="!dairyReportLoading">ສົ່ງອອກ</span>
            <span v-else>ກຳລັງສົ່ງອອກ...</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SomTop Report Export Dialog -->
    <v-dialog v-model="showSomTopReportDialog" max-width="600" persistent>
      <v-card elevation="8">
        <!-- Dialog Header -->
        <v-card-title class="d-flex align-center pa-4" style="background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%); color: white;">
          <v-icon start size="24">mdi-paperclip-outline</v-icon>
          <span class="text-h6">ການສົ່ງອອກ SomTop Report</span>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <!-- Warning Alert -->
          <v-alert type="info" variant="tonal" class="mb-4" border="start">
            <template #prepend>
              <v-icon>mdi-information-outline</v-icon>
            </template>
            <v-alert-title class="text-h6 mb-2 text-styles">📊 ການສົ່ງອອກລາຍງານ</v-alert-title>
            <div class="text-body-2 text-styles">
              <strong>ການດຳເນີນງານນີ້ຈະ:</strong><br>
              • ສົ່ງອອກຂໍ້ມູນໄປ SomTop Report ລະບົບ<br>
              • ນຳເຂົ້າຂໍ້ມູນຈາກ Trial Balance ປັດຈຸບັນ<br>
              • <span class="text-blue font-weight-bold">ໃຊ້ສຳລັບລາຍງານພິເສດ SomTop</span>
            </div>
          </v-alert>
          
          <v-divider class="my-4" />
          
          <!-- Operation Details -->
          <div class="text-body-1 font-weight-medium mb-3">
            📋 ລາຍລະອຽດການດຳເນີນງານ:
          </div>
          
          <v-card variant="outlined" class="mb-4">
            <v-list density="compact" class="pa-0">
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-calendar-range</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">ໄລຍະວັນທີ</v-list-item-title>
                <v-list-item-subtitle class="text-primary">
                  {{ filters.date_start }} ຫາ {{ filters.date_end }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-divider />
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="info">mdi-currency-usd</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">ສະກຸນເງິນ</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedCurrency ? `${selectedCurrency} (FCY)` : 'LCY Consolidated' }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-divider />
              
              <v-list-item>
                <template #prepend>
                  <v-icon color="success">mdi-database</v-icon>
                </template>
                <v-list-item-title class="font-weight-medium">API Endpoint</v-list-item-title>
                <v-list-item-subtitle class="font-mono">
                  /api/somtop_trail_balance-report/bulk-insert/
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
          
          <!-- Optional Settings -->
          <v-expansion-panels variant="accordion" class="mt-4">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <template #default>
                  <div class="d-flex align-center">
                    <v-icon start>mdi-cog</v-icon>
                    <span>ການຕັ້ງຄ່າເພີ່ມເຕີມ (Optional Settings)</span>
                  </div>
                </template>
              </v-expansion-panel-title>
              <v-expansion-panel-text class="pt-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="somTopReportOptions.fin_year"
                      label="ປີງົບປະມານ"
                      density="compact"
                      variant="outlined"
                      placeholder="2025"
                      prepend-inner-icon="mdi-calendar"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="somTopReportOptions.period_code"
                      label="ລະຫັດໄລຍະ"
                      density="compact"
                      variant="outlined"
                      placeholder="Optional"
                      prepend-inner-icon="mdi-timeline"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="somTopReportOptions.category"
                      label="ໝວດໝູ່"
                      density="compact"
                      variant="outlined"
                      placeholder="SOMTOP_TRIAL_BALANCE"
                      prepend-inner-icon="mdi-tag"
                    />
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        
        <!-- Dialog Actions -->
        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer />
          <v-btn 
            color="grey-darken-1"
            variant="outlined"
            @click="showSomTopReportDialog = false"
            :disabled="somTopReportLoading"
            prepend-icon="mdi-close"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn 
            color="info"
            variant="elevated"
            prepend-icon="mdi-paperclip-outline"
            :loading="somTopReportLoading"
            @click="executeSomTopReportExport"
            class="text-white ml-2"
          >
            <span v-if="!somTopReportLoading">ສົ່ງອອກ</span>
            <span v-else>ກຳລັງສົ່ງອອກ...</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
      location="top"
      elevation="6"
    >
      <div class="d-flex align-center">
        <v-icon start :icon="snackbar.icon" />
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn 
          variant="text" 
          @click="snackbar.show = false"
          icon="mdi-close"
          size="small"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from '@/helpers/axios'
import * as XLSX from 'xlsx'

// Import the new Journal Report ACTB component
import JournalReportACTB from './Journal_Report_ACTB.vue'

const activeTab = ref('somtop_trial') // Set default tab
const viewMode = ref('table')

// Type definitions
interface TrialBalanceItem {
  GL_Code: string
  Description: string
  Opening_Dr: number
  Opening_Cr: number
  Flow_Dr: number
  Flow_Cr: number
  Closing_Dr: number
  Closing_Cr: number
}

// State
const loading = ref(false)
const searchText = ref('')
const results = ref<TrialBalanceItem[]>([])

const filters = ref({
  currency: null as string | null,
  date_start: new Date().toISOString().split('T')[0],
  date_end: new Date().toISOString().split('T')[0]
})

// Dialog states
const showDairyReportDialog = ref(false)
const showSomTopReportDialog = ref(false)
const dairyReportLoading = ref(false)
const somTopReportLoading = ref(false)

// Dialog options
const dairyReportOptions = ref({
  fin_year: new Date().getFullYear().toString(),
  period_code: '',
  category: 'TRIAL_BALANCE'
})

const somTopReportOptions = ref({
  fin_year: new Date().getFullYear().toString(),
  period_code: '',
  category: 'SOMTOP_TRIAL_BALANCE'
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

// Currency options
const currencyOptions = [
  {
    title: 'ທຽບເທົ່າກັບ (LCY)',
    value: 'LCY',
    icon: 'mdi-currency-kzt'
  },
  {
    title: 'ກີບລາວ (LAK)',
    value: 'LAK',
    icon: 'mdi-currency-kzt'
  },
  {
    title: 'ໂດລາສະຫະລັດ (USD)',
    value: 'USD',
    icon: 'mdi-currency-usd'
  },
  {
    title: 'ບາດໄທ (THB)',
    value: 'THB',
    icon: 'mdi-currency-jpy'
  }
]

// Tab management functions - Updated to include Journal Report ACTB
const tabConfig = {
  somtop_trial: { 
    title: 'SomTop Trail Balance', 
    description: 'ລາຍງານໃບສົມທົບ SomTop',
    icon: 'mdi-account-balance',
    color: 'primary'
  },
  journal_report_actb: { 
    title: 'Journal Report ACTB', 
    description: 'ລາຍງານການເຄື່ອນໄຫວບັນຊີກ່ອນປິດບັນຊີ',
    icon: 'mdi-book-open-page-variant',
    color: 'blue'
  },
  actb_somtop_trial: { 
    title: 'Dairy SomTop TB', 
    description: 'ລາຍງານ Dairy SomTop Trial Balance',
    icon: 'mdi-account-balance-wallet',
    color: 'deep-purple'
  },
  actb_trial: { 
    title: 'Dairy Trial Balance', 
    description: 'ລາຍງານ Dairy Trail Balance',
    icon: 'mdi-account-cash',
    color: 'indigo'
  },
  actb_balance: { 
    title: 'Dairy Balance Sheet', 
    description: 'ລາຍງານ Dairy Balance Sheet',
    icon: 'mdi-bank',
    color: 'blue-grey'
  },
  actb_income: { 
    title: 'Dairy Income Statement', 
    description: 'ລາຍງານ ACDairyTB Income Statement',
    icon: 'mdi-chart-line',
    color: 'teal'
  }
}

const getTabTitle = (tab: string) => tabConfig[tab]?.title || tab
const getTabDescription = (tab: string) => tabConfig[tab]?.description || tab
const getTabIcon = (tab: string) => tabConfig[tab]?.icon || 'mdi-file'
const getTabColor = (tab: string) => tabConfig[tab]?.color || 'primary'

const isACTBTab = (tab: string) => tab.startsWith('actb_') || tab === 'journal_report_actb'

// Computed
const selectedCurrency = computed(() => filters.value.currency)
const currencyCode = computed(() => selectedCurrency.value || 'LAK')

const chipColor = computed(() => {
  if (!selectedCurrency.value) return 'primary'
  const colors: Record<string, string> = { 
    LAK: 'success', 
    USD: 'info', 
    THB: 'warning' 
  }
  return colors[selectedCurrency.value] || 'primary'
})

const chipText = computed(() =>
  selectedCurrency.value ? `${selectedCurrency.value} (FCY)` : 'Consolidated LCY (LAK)'
)

// Filter results based on search
const filteredResults = computed(() => {
  if (!searchText.value) return results.value
  
  const search = searchText.value.toLowerCase()
  return results.value.filter(item => 
    item.GL_Code.toLowerCase().includes(search) ||
    item.Description.toLowerCase().includes(search)
  )
})

// Watch for tab changes and clear data when switching away from somtop_trial
watch(activeTab, (newTab, oldTab) => {
  if (oldTab === 'somtop_trial' && newTab !== 'somtop_trial') {
    // Clear table data when switching away from main tab
    results.value = []
  } else if (newTab === 'somtop_trial' && filters.value.date_start && filters.value.date_end) {
    // Load data when switching to main tab
    fetchTrialBalance()
  }
})

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) throw new Error('Authentication token not found')
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}

const formatCurrency = (value: number | string | undefined): string => {
  const numValue = Number(value || 0)
  if (numValue === 0) return '-'
  return numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const showSnackbar = (message: string, color: string = 'success', icon: string = 'mdi-check-circle') => {
  snackbar.value = { show: true, message, color, icon }
}

// API functions
const normalizeTrialBalanceData = (data: any[], isConsolidated: boolean = false): TrialBalanceItem[] => {
  return data.map(item => ({
    GL_Code: item.GL_Code || item.GL || '',
    Description: item.Description || item._Desc || '',
    Opening_Dr: Number(isConsolidated ? (item.Opening_Dr_LAK || item.Opening_Dr || 0) : (item.Opening_Dr || 0)),
    Opening_Cr: Number(isConsolidated ? (item.Opening_Cr_LAK || item.Opening_Cr || 0) : (item.Opening_Cr || 0)),
    Flow_Dr: Number(isConsolidated ? (item.Flow_Dr_LAK || item.Flow_Dr || 0) : (item.Flow_Dr || 0)),
    Flow_Cr: Number(isConsolidated ? (item.Flow_Cr_LAK || item.Flow_Cr || 0) : (item.Flow_Cr || 0)),
    Closing_Dr: Number(isConsolidated ? (item.Closing_Dr_LAK || item.Closing_Dr || 0) : (item.Closing_Dr || 0)),
    Closing_Cr: Number(isConsolidated ? (item.Closing_Cr_LAK || item.Closing_Cr || 0) : (item.Closing_Cr || 0))
  }))
}

const fetchTrialBalance = async () => {
  // Only fetch data for the main somtop_trial tab
  if (activeTab.value !== 'somtop_trial') return

  try {
    loading.value = true

    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາຕື່ມຂໍ້ມູນວັນທີໃຫ້ຄົບຖ້ວນ', 'warning', 'mdi-alert')
      return
    }

    const isConsolidated = !selectedCurrency.value || selectedCurrency.value === 'LCY'
    let endpoint: string
    let payload: any

    endpoint = getStandardEndpoint(isConsolidated)

    if (isConsolidated) {
      payload = {
        date_start: filters.value.date_start,
        date_end: filters.value.date_end
      }
    } else {
      payload = {
        ac_ccy_id: selectedCurrency.value,
        date_start: filters.value.date_start,
        date_end: filters.value.date_end
      }
    }

    const { data } = await axios.post(endpoint, payload, getAuthHeaders())
    
    if (data.status === 'success' && Array.isArray(data.data)) {
      results.value = normalizeTrialBalanceData(data.data, isConsolidated)
      showSnackbar(
        `✅ ດຶງຂໍ້ມູນສຳເລັດ - ພົບ ${results.value.length} ລາຍການ`,
        'success',
        'mdi-check-circle'
      )
    } else {
      results.value = []
      showSnackbar('ບໍ່ພົບຂໍ້ມູນ', 'warning', 'mdi-alert')
    }

  } catch (error: any) {
    console.error('Fetch error:', error)
    results.value = []
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ'
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const getStandardEndpoint = (isConsolidated: boolean) => {
  return isConsolidated ? '/api/trial-balance/consolidated/' : '/api/trial-balance/fcy/'
}

const onCurrencyChange = () => {
  if (activeTab.value === 'somtop_trial') {
    results.value = []
    if (filters.value.date_start && filters.value.date_end) {
      fetchTrialBalance()
    }
  }
}

const exportToExcel = () => {
  try {
    if (!results.value.length) {
      showSnackbar('ບໍ່ມີຂໍ້ມູນໃຫ້ສົ່ງອອກ', 'warning', 'mdi-alert')
      return
    }

    const exportData = results.value.map(item => ({
      'GL Code': item.GL_Code,
      'Description': item.Description,
      [`Opening Dr (${currencyCode.value})`]: item.Opening_Dr,
      [`Opening Cr (${currencyCode.value})`]: item.Opening_Cr,
      [`Flow Dr (${currencyCode.value})`]: item.Flow_Dr,
      [`Flow Cr (${currencyCode.value})`]: item.Flow_Cr,
      [`Closing Dr (${currencyCode.value})`]: item.Closing_Dr,
      [`Closing Cr (${currencyCode.value})`]: item.Closing_Cr
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    ws['!cols'] = [
      { wch: 15 }, { wch: 40 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }
    ]

    XLSX.utils.book_append_sheet(wb, ws, getTabTitle(activeTab.value))
    
    const filename = `${getTabTitle(activeTab.value)}_${currencyCode.value}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, filename)

    showSnackbar('📊 ສົ່ງອອກສຳເລັດ', 'success', 'mdi-download')

  } catch (error) {
    console.error('Export error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການສົ່ງອອກ', 'error', 'mdi-alert-circle')
  }
}

// Show Dairy Report Dialog
const exportToDairyReport = () => {
  if (!filters.value.date_start || !filters.value.date_end) {
    showSnackbar('ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
    return
  }
  showDairyReportDialog.value = true
}

// Show SomTop Report Dialog
const exportToSOmTopReport = () => {
  if (!filters.value.date_start || !filters.value.date_end) {
    showSnackbar('ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
    return
  }
  showSomTopReportDialog.value = true
}

// Execute Dairy Report Export
const executeDairyReportExport = async () => {
  try {
    dairyReportLoading.value = true

    const payload = {
      date_start: filters.value.date_start,
      date_end: filters.value.date_end,
      fin_year: dairyReportOptions.value.fin_year,
      period_code: dairyReportOptions.value.period_code,
      category: dairyReportOptions.value.category
    }

    const { data } = await axios.post('/api/dairy-reports/bulk-insert/', payload, getAuthHeaders())

    if (data.status === 'success') {
      showSnackbar('✅ ສົ່ງອອກ Dairy Report ສຳເລັດ', 'success', 'mdi-check-circle')
      showDairyReportDialog.value = false
    } else {
      showSnackbar(data.message || 'ບໍ່ສາມາດສົ່ງອອກ Dairy Report', 'error', 'mdi-alert-circle')
    }
  } catch (error: any) {
    console.error('Export Dairy Report error:', error)
    
    let errorMessage = '❌ ເກີດຂໍ້ຜິດພາດໃນການ Export Dairy Report'
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
  } finally {
    dairyReportLoading.value = false
  }
}

// Execute SomTop Report Export
const executeSomTopReportExport = async () => {
  try {
    somTopReportLoading.value = true

    const payload = {
      date_start: filters.value.date_start,
      date_end: filters.value.date_end,
      fin_year: somTopReportOptions.value.fin_year,
      period_code: somTopReportOptions.value.period_code,
      category: somTopReportOptions.value.category
    }

    const { data } = await axios.post('/api/somtop-trial-balance/bulk-insert/', payload, getAuthHeaders())

    if (data.status === 'success') {
      showSnackbar('✅ ສົ່ງອອກ SomTop Report ສຳເລັດ', 'success', 'mdi-check-circle')
      showSomTopReportDialog.value = false
    } else {
      showSnackbar(data.message || 'ບໍ່ສາມາດສົ່ງອອກ SomTop Report', 'error', 'mdi-alert-circle')
    }
  } catch (error: any) {
    console.error('Export SomTop Report error:', error)
    
    let errorMessage = '❌ ເກີດຂໍ້ຜິດພາດໃນການ Export SomTop Report'
    if (error?.response?.status === 401) {
      errorMessage = '🔐 ໂທເຄນໝົດອາຍຸ ກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່'
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    showSnackbar(errorMessage, 'error', 'mdi-alert-circle')
  } finally {
    somTopReportLoading.value = false
  }
}

const exportToACTBReport = async () => {
  try {
    if (!filters.value.date_start || !filters.value.date_end) {
      showSnackbar('ກະລຸນາເລືອກວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ', 'warning', 'mdi-alert')
      return
    }

    const today = new Date()
    const finYear = today.getFullYear().toString()
    const payload = {
      date_start: filters.value.date_start,
      date_end: filters.value.date_end,
      fin_year: finYear,
      period_code: '',
      category: `ACTB_${activeTab.value.toUpperCase().replace('ACTB_', '')}`
    }

    const { data } = await axios.post('/api/actb-reports/bulk-insert/', payload, getAuthHeaders())

    if (data.status === 'success') {
      showSnackbar('✅ ສົ່ງອອກ ACTB Report ສຳເລັດ', 'success', 'mdi-check-circle')
    } else {
      showSnackbar(data.message || 'ບໍ່ສາມາດສົ່ງອອກ ACTB Report', 'error', 'mdi-alert-circle')
    }
  } catch (error: any) {
    console.error('Export ACTB Report error:', error)
    showSnackbar('❌ ເກີດຂໍ້ຜິດພາດໃນການ Export ACTB Report', 'error', 'mdi-alert-circle')
  }
}

// Initialize
onMounted(() => {
  const token = localStorage.getItem("token")
  if (token) {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    filters.value.date_start = firstDay.toISOString().split('T')[0]
    filters.value.date_end = today.toISOString().split('T')[0]
    
    // Only fetch data if we're on the main tab
    if (activeTab.value === 'somtop_trial') {
      fetchTrialBalance()
    }
  } else {
    showSnackbar('🔑 ກະລຸນາເຂົ້າສູ່ລະບົບ', 'warning', 'mdi-account-alert')
  }
})
</script>

<style scoped>
/* Enhanced Tab Styling */
.v-tab {
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 120px;
}

.v-tab--selected {
  font-weight: 600;
}

/* Tab Content Transitions */
.v-window-item {
  min-height: 300px;
}

/* Custom Table Container */
.custom-table-container {
  width: 100%;
  max-height: 65vh;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  position: relative;
}

/* Custom Table */
.custom-trial-balance-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  min-width: 1000px;
}

/* Header Rows */
.main-header-row {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.sub-header-row {
  background: #fafafa;
}

/* Header Cells */
.header-cell {
  padding: 12px 8px;
  font-weight: 600;
  color: #37474f;
  border: 1px solid #dee2e6;
  vertical-align: middle;
  text-align: center;
  white-space: nowrap;
}

/* GL Code Header - Optimized Width */
.account-code-header {
  width: 150px;
  min-width: 150px;
  max-width: 150px;
}

.header-content-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Description Header - Fixed for no-wrap */
.description-header {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  text-align: left;
}

.header-content-left {
  display: flex;
  align-items: center;
  padding-left: 16px;
  width: 100%;
  height: 100%;
}

.group-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.group-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.sub-header {
  width: 140px;
  min-width: 140px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #fafafa;
  color: #546e7a;
}

/* Sticky Column */
.sticky-column {
  position: sticky;
  left: 0;
  z-index: 2;
  background: white;
  border-right: 2px solid #dee2e6 !important;
}

.main-header-row .sticky-column,
.sub-header-row .sticky-column {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

/* Data Rows */
.data-row {
  transition: background-color 0.2s;
  background: white;
}

.data-row:hover {
  background-color: #f8f9fa !important;
}

.data-row:nth-child(even) {
  background-color: #fafafa;
}

/* Data Cells */
.data-cell {
  padding: 10px 8px;
  border: 1px solid #f0f0f0;
  vertical-align: middle;
}

/* GL Code Cell - Optimized */
.account-code-cell {
  width: 150px;
  min-width: 150px;
  max-width: 150px;
  text-align: right;
  font-weight: 500;
  background: white;
}

.gl-code-content {
  display: flex;
  align-items: left;
  justify-content: left;
  width: 100%;
  padding: 0 8px;
}

.data-row:hover .account-code-cell {
  background-color: #f8f9fa;
}

/* Description Cell - No Wrap with Ellipsis */
.description-cell {
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  padding: 10px 16px;
}

.description-content {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  cursor: default;
}

.description-content:hover {
  cursor: help;
}

/* Amount Cells */
.amount-cell {
  width: 140px;
  min-width: 140px;
  text-align: right;
  padding-right: 12px;
}

.amount-value {
  font-family: 'Roboto Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0,0,0,0.02);
  min-width: 100px;
  text-align: right;
}

.amount-value.text-success {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.08);
}

.amount-value.text-error {
  color: #f44336;
  background: rgba(244, 67, 54, 0.08);
}

/* Scrollbar Styling */
.custom-table-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.custom-table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.custom-table-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.custom-table-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.custom-table-container::-webkit-scrollbar-corner {
  background: #f1f1f1;
}

/* Professional Action Buttons Styling */
.action-buttons-container {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
  width: 100%;
}

.action-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
}

.primary-action {
  margin-right: 8px;
  box-shadow: 0 3px 6px rgba(33, 150, 243, 0.3) !important;
}

.primary-action:hover {
  box-shadow: 0 6px 12px rgba(33, 150, 243, 0.4) !important;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(0,0,0,0.02);
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.08);
}

/* Responsive Design */
@media (max-width: 1400px) {
  .description-header,
  .description-cell {
    width: 350px;
    min-width: 350px;
    max-width: 350px;
  }
  
  .action-buttons-container {
    gap: 6px;
  }
  
  .action-group {
    gap: 3px;
    padding: 3px;
  }
  
  .primary-action {
    margin-right: 6px;
  }
}

@media (max-width: 1200px) {
  .custom-trial-balance-table {
    font-size: 0.8rem;
  }
  
  .account-code-header,
  .account-code-cell {
    width: 130px;
    min-width: 130px;
    max-width: 130px;
  }
  
  .description-header,
  .description-cell {
    width: 300px;
    min-width: 300px;
    max-width: 300px;
  }
  
  .header-cell {
    padding: 10px 6px;
  }
  
  .data-cell {
    padding: 8px 6px;
  }
  
  .amount-value {
    font-size: 0.8rem;
    min-width: 85px;
  }
  
  .sub-header {
    width: 130px;
    min-width: 130px;
  }
  
  .amount-cell {
    width: 130px;
    min-width: 130px;
  }
  
  .v-tab {
    font-size: 0.8rem;
    min-width: 100px;
  }
  
  .action-buttons-container {
    gap: 6px;
  }
  
  .action-group {
    gap: 3px;
    padding: 3px;
  }
}

@media (max-width: 960px) {
  .custom-trial-balance-table {
    font-size: 0.75rem;
    min-width: 900px;
  }
  
  .account-code-header,
  .account-code-cell {
    width: 110px;
    min-width: 110px;
    max-width: 110px;
  }
  
  .description-header,
  .description-cell {
    width: 250px;
    min-width: 250px;
    max-width: 250px;
  }
  
  .header-cell {
    padding: 8px 4px;
    font-size: 0.75rem;
  }
  
  .sub-header {
    font-size: 0.7rem;
    width: 120px;
    min-width: 120px;
  }
  
  .data-cell {
    padding: 6px 4px;
    font-size: 0.75rem;
  }
  
  .amount-cell {
    width: 120px;
    min-width: 120px;
  }
  
  .amount-value {
    font-size: 0.75rem;
    min-width: 75px;
    padding: 1px 4px;
  }
  
  .v-tab {
    font-size: 0.75rem;
    min-width: 80px;
  }
  
  .action-buttons-container {
    gap: 4px;
  }
  
  .action-group {
    gap: 2px;
    padding: 2px;
  }
  
  .primary-action {
    margin-right: 4px;
  }
  
  .action-btn {
    border-radius: 6px !important;
  }
}

@media (max-width: 768px) {
  .action-buttons-container {
    display: none; /* Hide desktop actions on mobile */
  }
}

@media (max-width: 600px) {
  .custom-table-container {
    border-radius: 4px;
  }
  
  .custom-trial-balance-table {
    font-size: 0.7rem;
    min-width: 800px;
  }
  
  .account-code-header,
  .account-code-cell {
    width: 100px;
    min-width: 100px;
    max-width: 100px;
  }
  
  .description-header,
  .description-cell {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }
  
  .description-content {
    font-size: 0.7rem;
  }
  
  .sub-header,
  .amount-cell {
    width: 100px;
    min-width: 100px;
  }
  
  .amount-value {
    font-size: 0.7rem;
    min-width: 65px;
  }
  
  .v-tab {
    font-size: 0.7rem;
    min-width: 60px;
  }
}

/* Enhanced Button States */
.action-btn.v-btn--disabled {
  opacity: 0.4 !important;
  transform: none !important;
}

.action-btn.v-btn--loading {
  transform: none !important;
}

/* Tooltip Styling */
.v-tooltip .v-overlay__content {
  background: rgba(0,0,0,0.9) !important;
  color: white !important;
  font-size: 0.875rem !important;
  padding: 8px 12px !important;
  border-radius: 6px !important;
  backdrop-filter: blur(4px);
}

/* Menu Styling */
.v-list {
  border-radius: 8px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
}

.v-list-item {
  border-radius: 6px !important;
  margin: 2px 4px !important;
}

.v-list-item:hover {
  background: rgba(0,0,0,0.04) !important;
}

/* Professional Chip Styling */
.v-chip {
  font-weight: 500 !important;
  letter-spacing: 0.025em !important;
}

/* Enhanced Mobile Card */
.mobile-actions-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%) !important;
  border: 1px solid rgba(0,0,0,0.08) !important;
}

/* Print styles */
@media print {
  .custom-table-container {
    max-height: none;
    overflow: visible;
    border: none;
  }
  
  .sticky-column {
    position: static;
  }
  
  .data-row:hover {
    background-color: transparent !important;
  }
  
  .description-content {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }
  
  .action-buttons-container {
    display: none !important;
  }
}
</style>