<!-- components/DataEntryList.vue -->
<template>
  <v-container fluid class="pa-6">
    <v-card elevation="0" class="rounded-lg">
      <v-card-title class="pa-6 pb-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-3" size="28">mdi-database-edit</v-icon>
            <div>
              <h2 class="text-h5 font-weight-bold mb-1 text-styles">ຈັດການການຕັ້ງຄ່າການປ້ອນຂໍ້ມູນ</h2>
              <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
                ກຳນົດການຢືນຢັນແລະການອະນຸຍາດສຳລັບການປ້ອນຂໍ້ມູນ MTTB
              </p>
            </div>
          </div>
          <div class="d-flex align-center gap-2">
            <v-chip color="info" variant="tonal" prepend-icon="mdi-cog">
              {{ filteredEntries.length }} ການຕັ້ງຄ່າ
            </v-chip>
          </div>
        </div>
      </v-card-title>

      <!-- Header Actions -->
      <v-card-text class="pa-6 pt-0">
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="3">
            <v-btn
              @click="goPath('/dataentry/create')"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              class="text-none"
              block
            >
              ເພີ່ມການຕັ້ງຄ່າ
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="3">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="refresh"
              :loading="loading"
              class="text-none"
              block
            >
              ໂຫຼດໃໝ່
            </v-btn>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="ຄົ້ນຫາດ້ວຍ ID..."
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              density="comfortable"
              variant="outlined"
              placeholder="ພິມເພື່ອຄົ້ນຫາ..."
            />
          </v-col>
        </v-row>

       
        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          variant="tonal"
          closable
          @click:close="error = ''"
        >
          <v-alert-title>ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ</v-alert-title>
          {{ error }}
        </v-alert>

        <!-- Settings Overview Cards -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="text-subtitle-2 font-weight-bold mb-2 text-grey-darken-1 text-styles">
              ພາບລວມການຕັ້ງຄ່າລ່າສຸດ
            </div>
          </v-col>
          <v-col cols="12" md="4" v-for="(entry, index) in paginatedEntries.slice(0, 3)" :key="index">
            <v-card 
              variant="outlined" 
              class="pa-4 h-100 hover-card"
              @click="viewDetails(entry)"
            >
              <div class="d-flex align-center justify-space-between mb-3">
                <v-chip color="primary" size="small" variant="tonal">
                  ID: {{ entry.data_entry_id }}
                </v-chip>
                <v-chip 
                  :color="getAuthStatusColor(entry.Auth_Status)" 
                  size="small"
                  variant="tonal"
                >
                  {{ getAuthStatusText(entry.Auth_Status) }}
                </v-chip>
              </div>
              
              <div class="settings-summary">
                <div class="d-flex align-center mb-2">
                  <v-icon size="16" class="mr-2" :color="entry.JRN_REKEY_REQUIRED === 'Y' ? 'success' : 'grey'">
                    {{ entry.JRN_REKEY_REQUIRED === 'Y' ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                  <span class="text-caption">ຢືນຢັນຂໍ້ມູນກ່ອນອະນຸມັດ</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <v-icon size="16" class="mr-2" :color="entry.BACK_VALUE === 'Y' ? 'success' : 'grey'">
                    {{ entry.BACK_VALUE === 'Y' ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                  <span class="text-caption">ອະນຸຍາດລົງບັນຊີຍ້ອນຫຼັງ</span>
                </div>
                <div class="d-flex align-center">
                  <v-icon size="16" class="mr-2" :color="entry.MOD_NO === 'Y' ? 'success' : 'grey'">
                    {{ entry.MOD_NO === 'Y' ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                  <span class="text-caption">ອະນຸຍາດລົງບັນຊີມື້ພັກ</span>
                </div>
              </div>
              
              <v-divider class="my-3" />
              
              <div class="d-flex align-center justify-space-between text-caption text-grey">
                <span>ຜູ້ສ້າງ: {{ entry.Maker_Id?.username || 'ລະບົບ' }}</span>
                <span>{{ formatDate(entry.Maker_DT_Stamp) }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-card variant="outlined" class="rounded-lg">
          <v-card-title class="pa-4 pb-2">
            <div class="d-flex align-center justify-space-between">
              <span class="text-subtitle-1 font-weight-bold">ລາຍການທັງໝົດ</span>
              <v-chip size="small" variant="tonal" color="primary">
                {{ filteredEntries.length }} ລາຍການ
              </v-chip>
            </div>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="paginatedEntries"
            :loading="loading"
            class="elevation-0 custom-table"
            item-value="data_entry_id"
            hover
            hide-default-footer
          >
            <!-- ID Column -->
            <template #item.data_entry_id="{ item }">
              <div class="d-flex align-center">
                <v-avatar
                  size="32"
                  color="primary"
                  variant="tonal"
                  class="mr-3"
                >
                  <span class="font-weight-bold text-caption">
                    {{ item.data_entry_id }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">ID: {{ item.data_entry_id }}</div>
                  <div class="text-caption text-grey text-styles">ລະຫັດການຕັ້ງຄ່າ</div>
                </div>
              </div>
            </template>

            <!-- Rekey Settings Column -->
            <template #item.rekey_settings="{ item }">
              <div class="d-flex flex-column gap-1">
                <v-chip 
                  size="x-small" 
                  :color="item.JRN_REKEY_REQUIRED === 'Y' ? 'success' : 'grey'"
                  variant="tonal"
                  prepend-icon="mdi-keyboard"
                >
                  ຢືນຢັນຂໍ້ມູນ: {{ item.JRN_REKEY_REQUIRED === 'Y' ? 'ເປີດ' : 'ປິດ' }}
                </v-chip>
                <div v-if="item.JRN_REKEY_REQUIRED === 'Y'" class="text-caption text-grey ml-6 text-styles">
                  <span v-if="item.JRN_REKEY_VALUE_DATE === 'Y'">✓ ວັນທີ</span>
                  <span v-if="item.JRN_REKEY_AMOUNT === 'Y'" class="ml-2">✓ ຈຳນວນເງິນ</span>
                  <span v-if="item.JRN_REKEY_TXN_CODE === 'Y'" class="ml-2">✓ ລະຫັດ</span>
                </div>
              </div>
            </template>

            <!-- Permissions Column -->
            <template #item.permissions="{ item }">
              <div class="d-flex gap-2">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon 
                      v-bind="props"
                      :color="item.BACK_VALUE === 'Y' ? 'success' : 'grey-lighten-1'"
                      size="20"
                    >
                      mdi-calendar-arrow-left
                    </v-icon>
                  </template>
                  ລົງບັນຊີຍ້ອນຫຼັງ: {{ item.BACK_VALUE === 'Y' ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                </v-tooltip>
                
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon 
                      v-bind="props"
                      :color="item.MOD_NO === 'Y' ? 'success' : 'grey-lighten-1'"
                      size="20"
                    >
                      mdi-calendar-weekend
                    </v-icon>
                  </template>
                  ລົງບັນຊີມື້ພັກ: {{ item.MOD_NO === 'Y' ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                </v-tooltip>
              </div>
            </template>

            <!-- Status Column -->
            <template #item.Record_Status="{ item }">
              <v-chip
                :color="getStatusColor(item.Record_Status)"
                variant="tonal"
                size="small"
                class="font-weight-medium"
              >
                {{ getStatusText(item.Record_Status) }}
              </v-chip>
            </template>

            <!-- Auth Status Column -->
            <template #item.Auth_Status="{ item }">
              <v-chip
                :color="getAuthStatusColor(item.Auth_Status)"
                variant="tonal"
                size="small"
                class="font-weight-medium"
              >
                {{ getAuthStatusText(item.Auth_Status) }}
              </v-chip>
            </template>

            <!-- Once Auth Column -->
            <template #item.Once_Auth="{ item }">
              <v-icon 
                :color="item.Once_Auth === 'Y' ? 'success' : 'grey'" 
                size="20"
              >
                {{ item.Once_Auth === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex align-center gap-1">
                <v-btn
                  color="info"
                  variant="text"
                  size="small"
                  icon
                  @click="viewDetails(item)"
                  class="action-btn"
                >
                  <v-icon size="20">mdi-eye</v-icon>
                  <v-tooltip activator="parent" location="top">
                    ເບິ່ງລາຍລະອຽດ
                  </v-tooltip>
                </v-btn>
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  icon
                  @click="editEntry(item)"
                  class="action-btn"
                >
                  <v-icon size="20">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">
                    ແກ້ໄຂ
                  </v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  variant="text"
                  size="small"
                  icon
                  @click="confirmDelete(item)"
                  class="action-btn"
                >
                  <v-icon size="20">mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">
                    ລົບ
                  </v-tooltip>
                </v-btn>
              </div>
            </template>

            <!-- Loading Slot -->
            <template #loading>
              <v-skeleton-loader type="table-row@10" />
            </template>

            <!-- No Data Slot -->
            <template #no-data>
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-2" class="mb-4">
                  mdi-database-off
                </v-icon>
                <p class="text-h6 text-grey-lighten-1 mb-2">
                  ບໍ່ມີຂໍ້ມູນການຕັ້ງຄ່າ
                </p>
                <p class="text-body-2 text-grey-lighten-1 mb-4">
                  {{ search ? 'ລອງປັບປຸງເງື່ອນໄຂການຄົ້ນຫາ' : 'ບໍ່ມີຂໍ້ມູນ' }}
                </p>
              </div>
            </template>
          </v-data-table>
        </v-card>

        <!-- Custom Pagination -->
        <div class="d-flex align-center justify-space-between mt-4 pt-4" style="border-top: 1px solid rgb(var(--v-theme-surface-variant));">
          <div class="text-caption text-grey">
            ສະແດງ {{ (page - 1) * itemsPerPage + 1 }} - 
            {{ Math.min(page * itemsPerPage, filteredEntries.length) }} 
            ຈາກ {{ filteredEntries.length }} ລາຍການ
          </div>
          <div class="d-flex align-center gap-4">
            <div class="d-flex align-center">
              <span class="text-caption text-grey mr-2">ລາຍການຕໍ່ໜ້າ:</span>
              <v-select
                v-model="itemsPerPage"
                :items="[10, 25, 50, 100]"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 80px"
                @update:model-value="page = 1"
              />
            </div>
            <v-pagination
              v-if="totalPages > 1"
              v-model="page"
              :length="totalPages"
              :total-visible="5"
              rounded="circle"
              size="small"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          ຢືນຢັນການລົບ
        </v-card-title>
        <v-card-text>
          ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບການຕັ້ງຄ່າ ID: <strong>{{ itemToDelete?.data_entry_id }}</strong>?
          <br>
          <span class="text-caption text-error">ການດຳເນີນການນີ້ບໍ່ສາມາດຍົກເລີກໄດ້</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            variant="text" 
            @click="deleteDialog = false"
            :disabled="loadingDelete"
          >
            ຍົກເລີກ
          </v-btn>
          <v-btn 
            color="error" 
            variant="elevated"
            :loading="loadingDelete" 
            @click="deleteEntry"
            prepend-icon="mdi-delete"
          >
            ລົບ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Details Dialog -->
    <v-dialog v-model="showDetails" max-width="700" scrollable>
      <v-card v-if="selectedEntry" class="rounded-lg">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon color="primary" size="28" class="mr-3">mdi-database-edit</v-icon>
            <span class="text-h6 font-weight-bold text-styles">ລາຍລະອຽດການຕັ້ງຄ່າ</span>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <!-- Settings Overview -->
          <v-card variant="tonal" color="primary" class="mb-4 pa-4">
            <div class="d-flex align-center justify-space-between">
              <span class="text-subtitle-2 font-weight-bold">ID: {{ selectedEntry.data_entry_id }}</span>
              <v-chip-group>
                <v-chip 
                  :color="getStatusColor(selectedEntry.Record_Status)" 
                  size="small"
                  variant="elevated"
                >
                  {{ getStatusText(selectedEntry.Record_Status) }}
                </v-chip>
                <v-chip 
                  :color="getAuthStatusColor(selectedEntry.Auth_Status)" 
                  size="small"
                  variant="elevated"
                >
                  {{ getAuthStatusText(selectedEntry.Auth_Status) }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-card>

          <!-- Rekey Settings Section -->
          <div class="mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center text-styles">
              <v-icon color="orange" size="20" class="mr-2">mdi-keyboard</v-icon>
              ການຕັ້ງຄ່າການຢືນຢັນຂໍ້ມູນ
            </h3>
            <v-list class="pa-0">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon :color="selectedEntry.JRN_REKEY_REQUIRED === 'Y' ? 'success' : 'grey'">
                    {{ selectedEntry.JRN_REKEY_REQUIRED === 'Y' ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </template>
                <v-list-item-title class="text-styles">ຢືນຢັນຂໍ້ມູນໃນເວລາກ່ອນອະນຸມັດບັນຊີ</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedEntry.JRN_REKEY_REQUIRED === 'Y' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                </v-list-item-subtitle>
              </v-list-item>
              
              <v-expand-transition>
                <div v-if="selectedEntry.JRN_REKEY_REQUIRED === 'Y'" class="ml-12">
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon :color="selectedEntry.JRN_REKEY_VALUE_DATE === 'Y' ? 'success' : 'grey'" size="20">
                        {{ selectedEntry.JRN_REKEY_VALUE_DATE === 'Y' ? 'mdi-check' : 'mdi-close' }}
                      </v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 text-styles">ຢືນຢັນຄືນວັນທີເຮັດທຸລະກຳ</v-list-item-title>
                  </v-list-item>
                  
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon :color="selectedEntry.JRN_REKEY_AMOUNT === 'Y' ? 'success' : 'grey'" size="20">
                        {{ selectedEntry.JRN_REKEY_AMOUNT === 'Y' ? 'mdi-check' : 'mdi-close' }}
                      </v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 text-styles">ຢືນຢັນຄືນມູນຄ່າທີ່ປ້ອນ</v-list-item-title>
                  </v-list-item>
                  
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon :color="selectedEntry.JRN_REKEY_TXN_CODE === 'Y' ? 'success' : 'grey'" size="20">
                        {{ selectedEntry.JRN_REKEY_TXN_CODE === 'Y' ? 'mdi-check' : 'mdi-close' }}
                      </v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 text-styles">ຢືນຢັນຄືນລະຫັດທຸລະກຳ</v-list-item-title>
                  </v-list-item>
                </div>
              </v-expand-transition>
            </v-list>
          </div>

          <v-divider class="mb-4" />

          <!-- Permission Settings Section -->
          <div class="mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center text-styles">
              <v-icon color="orange" size="20" class="mr-2">mdi-shield-check</v-icon>
              ການອະນຸຍາດພິເສດ
            </h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-list class="pa-0">
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon :color="selectedEntry.BACK_VALUE === 'Y' ? 'success' : 'grey'">
                        mdi-calendar-arrow-left
                      </v-icon>
                    </template>
                    <v-list-item-title>ອະນຸຍາດໃຫ້ລົງບັນຊີຍ້ອນຫຼັງ</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ selectedEntry.BACK_VALUE === 'Y' ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list class="pa-0">
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon :color="selectedEntry.MOD_NO === 'Y' ? 'success' : 'grey'">
                        mdi-calendar-weekend
                      </v-icon>
                    </template>
                    <v-list-item-title>ອະນຸຍາດໃຫ້ລົງບັນຊີມື້ພັກ</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ selectedEntry.MOD_NO === 'Y' ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </div>

          <v-divider class="mb-4" />

          <!-- Audit Information -->
          <div>
            <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center text-styles">
              <v-icon color="orange" size="20" class="mr-2">mdi-history</v-icon>
              ຂໍ້ມູນການບັນທຶກ
            </h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-list class="pa-0">
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon size="20">mdi-account-plus</v-icon>
                    </template>
                    <v-list-item-title>ຜູ້ສ້າງ</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ selectedEntry.Maker_Id?.username || 'ລະບົບ' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon size="20">mdi-calendar-clock</v-icon>
                    </template>
                    <v-list-item-title>ວັນທີສ້າງ</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(selectedEntry.Maker_DT_Stamp) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list class="pa-0">
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon size="20">mdi-account-check</v-icon>
                    </template>
                    <v-list-item-title>ຜູ້ກວດສອບ</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ selectedEntry.Checker_Id?.username || '-' }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item class="px-0">
                    <template #prepend>
                      <v-icon size="20">mdi-calendar-check</v-icon>
                    </template>
                    <v-list-item-title>ວັນທີກວດສອບ</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(selectedEntry.Checker_DT_Stamp) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
            
            <v-list class="pa-0 mt-2">
              <v-list-item class="px-0">
                <template #prepend>
                  <v-icon size="20">mdi-lock</v-icon>
                </template>
                <v-list-item-title>ອະນຸມັດຄັ້ງດຽວ</v-list-item-title>
                <v-list-item-subtitle>
                  <v-icon :color="selectedEntry.Once_Auth === 'Y' ? 'success' : 'grey'" size="16">
                    {{ selectedEntry.Once_Auth === 'Y' ? 'mdi-check' : 'mdi-close' }}
                  </v-icon>
                  {{ selectedEntry.Once_Auth === 'Y' ? 'ໃຊ່' : 'ບໍ່' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDetails = false"
            class="text-none"
          >
            ປິດ
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-pencil"
            @click="editEntry(selectedEntry)"
            class="text-none font-weight-medium"
          >
            ແກ້ໄຂ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

// Types
interface DataEntry {
  data_entry_id: string
  JRN_REKEY_REQUIRED: string
  JRN_REKEY_VALUE_DATE: string
  JRN_REKEY_AMOUNT: string
  JRN_REKEY_TXN_CODE: string
  BACK_VALUE: string
  MOD_NO: string
  Record_Status: string
  Auth_Status: string
  Once_Auth: string
  Maker_Id?: { username: string }
  Maker_DT_Stamp?: string
  Checker_Id?: { username: string }
  Checker_DT_Stamp?: string
}

// Router instance
const router = useRouter()

// State
const dataEntries = ref<DataEntry[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const page = ref(1)
const itemsPerPage = ref(10)

// Delete dialog
const deleteDialog = ref(false)
const itemToDelete = ref<DataEntry | null>(null)
const loadingDelete = ref(false)

// Details dialog
const showDetails = ref(false)
const selectedEntry = ref<DataEntry | null>(null)

// Computed statistics
const stats = computed(() => ({
  active: dataEntries.value.filter(e => e.Record_Status === 'C').length,
  authorized: dataEntries.value.filter(e => e.Auth_Status === 'A').length,
  pending: dataEntries.value.filter(e => e.Auth_Status === 'U').length,
  total: dataEntries.value.length
}))

// Table headers
const headers = [
  { title: 'ID', key: 'data_entry_id', align: 'start', width: '180px' },
  { title: 'ການຢືນຢັນຂໍ້ມູນ', key: 'rekey_settings', align: 'start' },
  { title: 'ການອະນຸຍາດ', key: 'permissions', align: 'center', width: '120px' },
  { title: 'ສະຖານະບັນທຶກ', key: 'Record_Status', align: 'center', width: '140px' },
  { title: 'ສະຖານະອະນຸມັດ', key: 'Auth_Status', align: 'center', width: '140px' },
  { title: 'ອະນຸມັດຄັ້ງດຽວ', key: 'Once_Auth', align: 'center', width: '120px' },
  { title: 'ການປະຕິບັດ', key: 'actions', sortable: false, align: 'center', width: '150px' }
]

// Helper functions
const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('lo-LA')
}

// Status helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case 'C': return 'success'
    case 'O': return 'warning'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'C': return 'ເປີດໃຊ້ງານ'
    case 'O': return 'ປິດໃຊ້ງານ'
    default: return status
  }
}

const getAuthStatusColor = (status: string) => {
  switch (status) {
    case 'A': return 'success'
    case 'U': return 'warning'
    default: return 'grey'
  }
}

const getAuthStatusText = (status: string) => {
  switch (status) {
    case 'A': return 'ອະນຸມັດແລ້ວ'
    case 'U': return 'ລໍຖ້າອະນຸມັດ'
    default: return status
  }
}

// API functions
const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.get('/api/mttb-data-entry/')
    dataEntries.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ'
    console.error('Error fetching data:', err)
  } finally {
    loading.value = false
  }
}

// Filtered entries
const filteredEntries = computed(() => {
  if (!search.value) return dataEntries.value
  
  const searchLower = search.value.toLowerCase()
  return dataEntries.value.filter(item => 
    item.data_entry_id.toLowerCase().includes(searchLower)
  )
})

// Paginated entries
const paginatedEntries = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEntries.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredEntries.value.length / itemsPerPage.value)
)

// Actions
const goPath = (path: string) => {
  router.push(path)
}

const refresh = async () => {
  await fetchData()
}

const viewDetails = (entry: DataEntry) => {
  selectedEntry.value = entry
  showDetails.value = true
}

const editEntry = (entry: DataEntry) => {
  router.push(`/dataentry/update?id=${entry.data_entry_id}`)
}

const confirmDelete = (entry: DataEntry) => {
  itemToDelete.value = entry
  deleteDialog.value = true
}

const deleteEntry = async () => {
  if (!itemToDelete.value) return
  loadingDelete.value = true
  try {
    await axios.delete(`/api/mttb-data-entry/${itemToDelete.value.data_entry_id}/`)
    await fetchData()
    deleteDialog.value = false
    itemToDelete.value = null
  } catch (err: any) {
    console.error('Delete error:', err)
    error.value = err.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການລົບຂໍ້ມູນ'
  } finally {
    loadingDelete.value = false
  }
}

// Watch search to reset page
watch(search, () => {
  page.value = 1
})

// Initialize
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* Custom table styling */
:deep(.custom-table .v-data-table__wrapper) {
  border-radius: 12px;
  border: 1px solid rgb(var(--v-theme-surface-variant));
  overflow: hidden;
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.v-data-table-header th) {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* Action buttons */
.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Hover card effect */
.hover-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgb(var(--v-theme-surface-variant));
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: rgb(var(--v-theme-primary));
}

/* Settings summary */
.settings-summary {
  min-height: 80px;
}

/* Custom scrollbar */
:deep(.v-data-table__wrapper) {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar) {
  height: 6px;
  width: 6px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb) {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(var(--v-theme-primary), 0.5);
}

.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

/* Stat cards */
.v-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>