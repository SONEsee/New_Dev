<template>
  <div class="master-data-create">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="page-title">
            <v-icon color="primary" size="32" class="mr-3">mdi-plus-circle</v-icon>
            ສ້າງ Master Data
          </h1>
          <p class="page-subtitle">ສ້າງ Master Type ແລະ Master Code ໃນໜ້າດຽວ</p>
        </div>
        <v-btn
          variant="outlined"
          @click="$router.back()"
          prepend-icon="mdi-arrow-left"
        >
          ກັບຄືນ
        </v-btn>
      </div>
    </div>

    <!-- Creation Mode Toggle -->
    <v-card class="mode-selector mb-4" elevation="2">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-select
              v-model="creationMode"
              :items="creationModes"
              label="ເລືອກປະເພດການສ້າງ"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="onModeChange"
            >
              <template #prepend-inner>
                <v-icon :color="getModeColor(creationMode)">
                  {{ getModeIcon(creationMode) }}
                </v-icon>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="8">
            <v-alert
              :type="getModeAlertType(creationMode)"
              variant="tonal"
              density="compact"
              class="ma-0"
            >
              {{ getModeDescription(creationMode) }}
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Creation Content -->
    <v-row>
      <!-- Master Type Section -->
      <v-col 
        cols="12" 
        :md="creationMode === 'both' ? 6 : 12"
        v-if="creationMode === 'master-type' || creationMode === 'both'"
      >
        <v-card class="master-type-card" elevation="2">
          <v-card-title class="pa-4 bg-primary text-white">
            <v-icon color="white" class="mr-2">mdi-folder-plus</v-icon>
            ສ້າງ Master Type
            <v-spacer></v-spacer>
            <v-chip
              v-if="creationMode === 'both'"
              color="white"
              text-color="primary"
              size="small"
            >
              ຂັ້ນຕອນ 1
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-form ref="masterTypeForm" v-model="masterTypeValid">
              <!-- Master Type Name -->
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model="masterTypeData.master_type_name"
                    label="ຊື່ Master Type *"
                    :rules="masterTypeNameRules"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-format-title"
                    placeholder="ເຊັ່ນ: AccountType, TransactionType"
                    counter="100"
                    hide-details="auto"
                    @input="onMasterTypeNameChange"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Description -->
              <v-row dense class="mt-2">
                <v-col cols="12">
                  <v-textarea
                    v-model="masterTypeData.description"
                    label="ຄຳອະທິບາຍ"
                    :rules="descriptionRules"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-text"
                    placeholder="ອະທິບາຍລາຍລະອຽດຂອງ Master Type ນີ້"
                    rows="3"
                    counter="500"
                    hide-details="auto"
                  ></v-textarea>
                </v-col>
              </v-row>

              <!-- Display Order and Status -->
              <v-row dense class="mt-2">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="masterTypeData.display_order"
                    label="ລຳດັບການສະແດງ"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-sort-numeric-ascending"
                    placeholder="1, 2, 3..."
                    min="1"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-switch
                    v-model="masterTypeData.is_active"
                    label="ເປີດໃຊ້ງານ"
                    color="success"
                    density="comfortable"
                    hide-details
                  >
                    <template #label>
                      <div class="d-flex align-center">
                        <v-icon 
                          :color="masterTypeData.is_active ? 'success' : 'error'" 
                          class="mr-2"
                        >
                          {{ masterTypeData.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                        </v-icon>
                        {{ masterTypeData.is_active ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                      </div>
                    </template>
                  </v-switch>
                </v-col>
              </v-row>

              <!-- Advanced Settings -->
              <v-row dense class="mt-2">
                <v-col cols="12">
                  <v-expansion-panels variant="accordion">
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        <v-icon class="mr-2">mdi-cog</v-icon>
                        ການຕັ້ງຄ່າເພີ່ມເຕີມ
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-row dense class="mt-2">
                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="masterTypeData.allow_duplicate_codes"
                              label="ອະນຸຍາດ Master Code ຊ້ຳ"
                              color="warning"
                              density="comfortable"
                              hide-details
                            ></v-switch>
                          </v-col>

                          <v-col cols="12" md="6">
                            <v-switch
                              v-model="masterTypeData.require_description"
                              label="ບັງຄັບໃສ່ຄຳອະທິບາຍ"
                              color="info"
                              density="comfortable"
                              hide-details
                            ></v-switch>
                          </v-col>
                        </v-row>

                        <v-row dense class="mt-2">
                          <v-col cols="12">
                            <v-text-field
                              v-model="masterTypeData.code_format_pattern"
                              label="ຮູບແບບລະຫັດ (RegEx)"
                              variant="outlined"
                              density="comfortable"
                              prepend-inner-icon="mdi-regex"
                              placeholder="^[A-Z]{2,4}[0-9]{2,4}$ (ຕົວຢ່າງ)"
                              hint="ກຳນົດຮູບແບບສຳລັບ Master Code (ບໍ່ບັງຄັບ)"
                              persistent-hint
                              hide-details="auto"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>
              </v-row>

              <!-- Master Type Actions -->
              <v-row dense class="mt-4" v-if="creationMode === 'master-type'">
                <v-col cols="12">
                  <v-btn
                    color="primary"
                    variant="flat"
                    @click="createMasterType"
                    :loading="loading.masterType"
                    :disabled="!masterTypeValid"
                    size="large"
                    block
                  >
                    <v-icon start>mdi-plus</v-icon>
                    ສ້າງ Master Type
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Master Code Section -->
      <v-col 
        cols="12" 
        :md="creationMode === 'both' ? 6 : 12"
        v-if="creationMode === 'master-code' || creationMode === 'both'"
      >
        <v-card class="master-code-card" elevation="2">
          <v-card-title class="pa-4 bg-success text-white">
            <v-icon color="white" class="mr-2">mdi-code-tags-check</v-icon>
            ສ້າງ Master Code
            <v-spacer></v-spacer>
            <v-chip
              v-if="creationMode === 'both'"
              color="white"
              text-color="success"
              size="small"
            >
              ຂັ້ນຕອນ 2
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Master Type Selection (for standalone master code creation) -->
            <v-row dense v-if="creationMode === 'master-code'">
              <v-col cols="12">
                <v-select
                  v-model="selectedMasterTypeId"
                  :items="availableMasterTypes"
                  item-title="master_type_name"
                  item-value="id"
                  label="ເລືອກ Master Type *"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-folder"
                  :rules="[v => !!v || 'ຈຳເປັນຕ້ອງເລືອກ Master Type']"
                  hide-details="auto"
                  :loading="loading.masterTypes"
                  @update:model-value="onMasterTypeSelect"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :color="item.raw.is_active ? 'success' : 'error'">
                          {{ item.raw.is_active ? 'mdi-folder' : 'mdi-folder-outline' }}
                        </v-icon>
                      </template>
                      <v-list-item-title>{{ item.raw.master_type_name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.description || 'ບໍ່ມີຄຳອະທິບາຍ' }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <!-- Master Type Info (for both mode) -->
            <v-row dense v-if="creationMode === 'both' || selectedMasterType">
              <v-col cols="12">
                <v-alert
                  type="info"
                  variant="tonal"
                  class="mb-3"
                >
                  <template #title>
                    <v-icon class="mr-2">mdi-information</v-icon>
                    Master Type: {{ currentMasterType?.master_type_name || 'ກຳລັງສ້າງ...' }}
                  </template>
                  <div v-if="currentMasterType?.description" class="text-caption">
                    {{ currentMasterType.description }}
                  </div>
                  <div class="text-caption mt-2">
                    <v-chip 
                      v-if="currentMasterType?.code_format_pattern" 
                      size="small" 
                      color="warning" 
                      variant="outlined"
                      class="mr-2"
                    >
                      ຮູບແບບ: {{ currentMasterType.code_format_pattern }}
                    </v-chip>
                    <v-chip 
                      v-if="currentMasterType?.require_description" 
                      size="small" 
                      color="info" 
                      variant="outlined"
                    >
                      ບັງຄັບຄຳອະທິບາຍ
                    </v-chip>
                  </div>
                </v-alert>
              </v-col>
            </v-row>

            <v-form ref="masterCodeForm" v-model="masterCodeValid">
              <!-- Master Code -->
              <v-row dense class="mt-2">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="masterCodeData.master_code"
                    label="Master Code *"
                    :rules="masterCodeRules"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-identifier"
                    placeholder="SAV001, CUR001, DEP001"
                    counter="50"
                    hide-details="auto"
                    @blur="validateCodeFormat"
                  >
                    <template #append-inner>
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        color="primary"
                        @click="generateCode"
                        title="ສ້າງລະຫັດອັດຕະໂນມັດ"
                        :disabled="!canGenerateCode"
                      >
                        <v-icon size="small">mdi-auto-fix</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="masterCodeData.display_order"
                    label="ລຳດັບການສະແດງ"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-sort-numeric-ascending"
                    placeholder="1, 2, 3..."
                    min="1"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Descriptions -->
              <v-row dense class="mt-2">
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="masterCodeData.description_la"
                    :label="descriptionLaLabel"
                    :rules="descriptionLaRules"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-translate"
                    placeholder="ບັນຊີເງິນຝາກປະຢັດ"
                    counter="200"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="masterCodeData.description_en"
                    label="ຄຳອະທິບາຍ (ອັງກິດ)"
                    :rules="descriptionEnRules"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-translate-variant"
                    placeholder="Savings Account"
                    counter="200"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Status and Options -->
              <v-row dense class="mt-2">
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="masterCodeData.is_active"
                    label="ເປີດໃຊ້ງານ"
                    color="success"
                    density="comfortable"
                    hide-details
                  >
                    <template #label>
                      <div class="d-flex align-center">
                        <v-icon 
                          :color="masterCodeData.is_active ? 'success' : 'error'" 
                          class="mr-2"
                        >
                          {{ masterCodeData.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                        </v-icon>
                        {{ masterCodeData.is_active ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
                      </div>
                    </template>
                  </v-switch>
                </v-col>

                <v-col cols="12" md="6">
                  <v-switch
                    v-model="masterCodeData.is_default"
                    label="ຄ່າເລີ່ມຕົ້ນ"
                    color="warning"
                    density="comfortable"
                    hide-details
                  >
                    <template #label>
                      <div class="d-flex align-center">
                        <v-icon 
                          :color="masterCodeData.is_default ? 'warning' : 'grey'" 
                          class="mr-2"
                        >
                          {{ masterCodeData.is_default ? 'mdi-star' : 'mdi-star-outline' }}
                        </v-icon>
                        {{ masterCodeData.is_default ? 'ຄ່າເລີ່ມຕົ້ນ' : 'ບໍ່ແມ່ນຄ່າເລີ່ມຕົ້ນ' }}
                      </div>
                    </template>
                  </v-switch>
                </v-col>
              </v-row>

              <!-- Format Validation Warning -->
              <v-row dense class="mt-2" v-if="formatValidationMessage">
                <v-col cols="12">
                  <v-alert
                    :type="formatValidationMessage.type"
                    variant="tonal"
                    density="compact"
                  >
                    {{ formatValidationMessage.text }}
                  </v-alert>
                </v-col>
              </v-row>

              <!-- Master Code Actions -->
              <v-row dense class="mt-4" v-if="creationMode === 'master-code'">
                <v-col cols="12">
                  <v-btn
                    color="success"
                    variant="flat"
                    @click="createMasterCode"
                    :loading="loading.masterCode"
                    :disabled="!masterCodeValid || !canCreateMasterCode"
                    size="large"
                    block
                  >
                    <v-icon start>mdi-plus</v-icon>
                    ສ້າງ Master Code
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Action Buttons for Both Mode -->
    <v-row class="mt-4" v-if="creationMode === 'both'">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-btn
                color="primary"
                variant="flat"
                @click="createBoth"
                :loading="loading.both"
                :disabled="!canCreateBoth"
                size="large"
                class="mr-3"
              >
                <v-icon start>mdi-creation</v-icon>
                ສ້າງທັງ Master Type ແລະ Master Code
              </v-btn>

              <v-btn
                variant="outlined"
                @click="resetAllForms"
                :disabled="loading.both"
                size="large"
              >
                <v-icon start>mdi-refresh</v-icon>
                ລ້າງຟອມ
              </v-btn>
            </div>

            <!-- Creation Progress -->
            <div v-if="creationProgress.show" class="mt-4">
              <v-progress-linear
                :model-value="creationProgress.value"
                :color="creationProgress.color"
                height="6"
                rounded
              ></v-progress-linear>
              <div class="text-center text-caption mt-2">
                {{ creationProgress.message }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Multiple Master Codes Section -->
    <v-row class="mt-4" v-if="creationMode === 'both' && createdMasterType">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="pa-4 bg-info text-white">
            <v-icon color="white" class="mr-2">mdi-plus-box-multiple</v-icon>
            ເພີ່ມ Master Code ຫຼາຍລາຍການ
            <v-spacer></v-spacer>
            <v-chip color="white" text-color="info" size="small">
              ເພີ່ມເຕີມ
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-4">
            <v-row dense>
              <v-col cols="12" md="8">
                <v-combobox
                  v-model="multipleCodes"
                  label="Master Codes ຫຼາຍລາຍການ"
                  multiple
                  chips
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-code-array"
                  placeholder="ພິມ Master Code ແລະ ກົດ Enter (ເຊັ່ນ: SAV001, CUR001, DEP001)"
                  hint="ພິມລະຫັດແລະກົດ Enter ເພື່ອເພີ່ມ ຫຼື ແຍກດ້ວຍ ຈຸດກ້າ"
                  persistent-hint
                  hide-details="auto"
                ></v-combobox>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="info"
                  variant="flat"
                  @click="createMultipleCodes"
                  :loading="loading.multipleCodes"
                  :disabled="!multipleCodes || multipleCodes.length === 0"
                  block
                >
                  <v-icon start>mdi-plus-box-multiple</v-icon>
                  ສ້າງ {{ multipleCodes?.length || 0 }} ລາຍການ
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Preview Section -->
    <v-row class="mt-4" v-if="showPreview">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="pa-4 bg-grey-lighten-4">
            <v-icon class="mr-2">mdi-eye</v-icon>
            ຕົວຢ່າງ Master Data
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="creationMode === 'both' || creationMode === 'master-type'">
              <h4>Master Type:</h4>
              <div class="preview-item mb-3">
                <v-icon :color="masterTypeData.is_active ? 'success' : 'error'" class="mr-2">
                  mdi-folder
                </v-icon>
                <strong>{{ masterTypeData.master_type_name || 'ບໍ່ໄດ້ໃສ່ຊື່' }}</strong>
                <v-chip
                  :color="masterTypeData.is_active ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                  class="ml-2"
                >
                  {{ masterTypeData.is_active ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
                </v-chip>
                <div v-if="masterTypeData.description" class="text-caption text-grey mt-1">
                  {{ masterTypeData.description }}
                </div>
              </div>
            </div>

            <div v-if="(creationMode === 'both' || creationMode === 'master-code') && masterCodeData.master_code">
              <h4>Master Code:</h4>
              <div class="preview-item">
                <v-icon color="primary" class="mr-2">mdi-code-tags</v-icon>
                <strong>{{ masterCodeData.master_code }}</strong>
                <v-chip
                  :color="masterCodeData.is_active ? 'success' : 'error'"
                  size="small"
                  variant="flat"
                  class="ml-2"
                >
                  {{ masterCodeData.is_active ? 'ເປີດໃຊ້' : 'ປິດໃຊ້' }}
                </v-chip>
                <v-chip
                  v-if="masterCodeData.is_default"
                  color="warning"
                  size="small"
                  variant="flat"
                  class="ml-1"
                >
                  <v-icon size="x-small" class="mr-1">mdi-star</v-icon>
                  Default
                </v-chip>
                <div v-if="masterCodeData.description_la || masterCodeData.description_en" class="text-caption text-grey mt-1">
                  <div v-if="masterCodeData.description_la">LA: {{ masterCodeData.description_la }}</div>
                  <div v-if="masterCodeData.description_en">EN: {{ masterCodeData.description_en }}</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'

// Meta
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
  title: 'Create Master Data'
})

// State
const creationMode = ref('both') // 'master-type', 'master-code', 'both'
const masterTypeValid = ref(false)
const masterCodeValid = ref(false)
const masterTypeForm = ref(null)
const masterCodeForm = ref(null)
const formatValidationMessage = ref(null)

// Data
const masterTypeData = reactive({
  master_type_name: '',
  description: '',
  display_order: null,
  is_active: true,
  allow_duplicate_codes: false,
  require_description: false,
  code_format_pattern: ''
})

const masterCodeData = reactive({
  master_code: '',
  description_la: '',
  description_en: '',
  display_order: null,
  is_active: true,
  is_default: false
})

// Loading states
const loading = reactive({
  masterType: false,
  masterCode: false,
  both: false,
  masterTypes: false,
  multipleCodes: false
})

// Other state
const availableMasterTypes = ref([])
const selectedMasterTypeId = ref(null)
const selectedMasterType = ref(null)
const createdMasterType = ref(null)
const multipleCodes = ref([])

// Creation progress
const creationProgress = reactive({
  show: false,
  value: 0,
  color: 'primary',
  message: ''
})

// Creation modes
const creationModes = [
  { title: 'ສ້າງທັງສອງຢ່າງ (Master Type + Master Code)', value: 'both' },
  { title: 'ສ້າງ Master Type ເທົ່ານັ້ນ', value: 'master-type' },
  { title: 'ສ້າງ Master Code ເທົ່ານັ້ນ', value: 'master-code' }
]

// API configuration
const { $axios } = useNuxtApp()
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }
})

// Validation rules
const masterTypeNameRules = [
  v => !!v || 'ຈຳເປັນຕ້ອງໃສ່ຊື່ Master Type',
  v => (v && v.length >= 2) || 'ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ',
  v => (v && v.length <= 100) || 'ຊື່ຕ້ອງບໍ່ເກີນ 100 ຕົວອັກສອນ',
  v => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(v) || 'ຊື່ຕ້ອງເລີ່ມດ້ວຍຕົວອັກສອນ ແລະ ມີພຽງຕົວອັກສອນ, ເລກ, _, -'
]

const descriptionRules = [
  v => !v || v.length <= 500 || 'ຄຳອະທິບາຍຕ້ອງບໍ່ເກີນ 500 ຕົວອັກສອນ'
]

const masterCodeRules = computed(() => [
  v => !!v || 'ຈຳເປັນຕ້ອງໃສ່ Master Code',
  v => (v && v.length >= 2) || 'Master Code ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ',
  v => (v && v.length <= 50) || 'Master Code ຕ້ອງບໍ່ເກີນ 50 ຕົວອັກສອນ',
  v => /^[A-Z0-9][A-Z0-9_-]*$/.test(v) || 'Master Code ຕ້ອງເປັນຕົວອັກສອນໃຫຍ່, ເລກ, _, - ເທົ່ານັ້ນ'
])

const descriptionLaRules = computed(() => {
  const rules = [
    v => !v || v.length <= 200 || 'ຄຳອະທິບາຍຕ້ອງບໍ່ເກີນ 200 ຕົວອັກສອນ'
  ]
  
  if (currentMasterType.value?.require_description) {
    rules.unshift(v => !!v || 'ຈຳເປັນຕ້ອງໃສ່ຄຳອະທິບາຍ')
  }
  
  return rules
})

const descriptionEnRules = [
  v => !v || v.length <= 200 || 'ຄຳອະທິບາຍຕ້ອງບໍ່ເກີນ 200 ຕົວອັກສອນ'
]

// Computed properties
const currentMasterType = computed(() => {
  if (creationMode.value === 'both') {
    return masterTypeData
  } else if (creationMode.value === 'master-code') {
    return selectedMasterType.value
  }
  return null
})

const descriptionLaLabel = computed(() => {
  return currentMasterType.value?.require_description 
    ? 'ຄຳອະທິບາຍ (ລາວ) *' 
    : 'ຄຳອະທິບາຍ (ລາວ)'
})

const canGenerateCode = computed(() => {
  return creationMode.value === 'both' || selectedMasterType.value
})

const canCreateMasterCode = computed(() => {
  return creationMode.value === 'both' || selectedMasterTypeId.value
})

const canCreateBoth = computed(() => {
  return masterTypeValid.value && masterCodeValid.value
})

const showPreview = computed(() => {
  return (masterTypeData.master_type_name && (creationMode.value === 'both' || creationMode.value === 'master-type')) ||
         (masterCodeData.master_code && (creationMode.value === 'both' || creationMode.value === 'master-code'))
})

// Methods
const getModeColor = (mode) => {
  switch (mode) {
    case 'both': return 'primary'
    case 'master-type': return 'info'
    case 'master-code': return 'success'
    default: return 'grey'
  }
}

const getModeIcon = (mode) => {
  switch (mode) {
    case 'both': return 'mdi-creation'
    case 'master-type': return 'mdi-folder-plus'
    case 'master-code': return 'mdi-code-tags-check'
    default: return 'mdi-help'
  }
}

const getModeAlertType = (mode) => {
  switch (mode) {
    case 'both': return 'info'
    case 'master-type': return 'info'
    case 'master-code': return 'success'
    default: return 'info'
  }
}

const getModeDescription = (mode) => {
  switch (mode) {
    case 'both': return 'ສ້າງ Master Type ກ່ອນ ແລ້ວຈຶ່ງສ້າງ Master Code ທີ່ເກີ່ຍວຂ້ອງ'
    case 'master-type': return 'ສ້າງ Master Type ໃຫມ່ເທົ່ານັ້ນ (ສາມາດເພີ່ມ Master Code ໃນພາຍຫຼັງ)'
    case 'master-code': return 'ເພີ່ມ Master Code ໃສ່ Master Type ທີ່ມີຢູ່ແລ້ວ'
    default: return ''
  }
}

const onModeChange = () => {
  resetAllForms()
  formatValidationMessage.value = null
  
  if (creationMode.value === 'master-code') {
    loadAvailableMasterTypes()
  }
}

const onMasterTypeNameChange = () => {
  // Auto-generate display order based on name
  if (masterTypeData.master_type_name && !masterTypeData.display_order) {
    masterTypeData.display_order = masterTypeData.master_type_name.length * 10
  }
}

const loadAvailableMasterTypes = async () => {
  try {
    loading.masterTypes = true
    const response = await $axios.get('/api/master-types/', {
      params: {
        is_active: true,
        ordering: 'master_type_name'
      },
      ...getAuthHeaders()
    })
    
    availableMasterTypes.value = response.data.results || response.data || []
    
  } catch (error) {
    console.error('Error loading master types:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ບໍ່ສາມາດໂຫຼດ Master Types ໄດ້'
    })
  } finally {
    loading.masterTypes = false
  }
}

const onMasterTypeSelect = () => {
  selectedMasterType.value = availableMasterTypes.value.find(mt => mt.id === selectedMasterTypeId.value)
  
  if (selectedMasterType.value) {
    // Auto-generate first master code suggestion
    generateCode()
  }
}

const validateCodeFormat = () => {
  if (!masterCodeData.master_code || !currentMasterType.value?.code_format_pattern) {
    formatValidationMessage.value = null
    return
  }
  
  try {
    const pattern = new RegExp(currentMasterType.value.code_format_pattern)
    const isValid = pattern.test(masterCodeData.master_code)
    
    if (isValid) {
      formatValidationMessage.value = {
        type: 'success',
        text: 'Master Code ຕົງຕາມຮູບແບບທີ່ກຳນົດ'
      }
    } else {
      formatValidationMessage.value = {
        type: 'warning',
        text: `Master Code ບໍ່ຕົງຕາມຮູບແບບ: ${currentMasterType.value.code_format_pattern}`
      }
    }
  } catch (error) {
    formatValidationMessage.value = {
      type: 'error',
      text: 'ຮູບແບບ RegEx ບໍ່ຖືກຕ້ອງ'
    }
  }
}

const generateCode = async () => {
  const masterType = currentMasterType.value
  if (!masterType) return
  
  try {
    // Generate code based on master type name
    const prefix = masterType.master_type_name
      ?.replace(/[^A-Z]/gi, '')
      .toUpperCase()
      .substring(0, 3) || 'DEF'
    
    // Get existing codes count for this master type
    let existingCount = 0
    if (masterType.id) {
      try {
        const response = await $axios.get('/api/master-codes/', {
          params: {
            master_type: masterType.id,
            ordering: '-id'
          },
          ...getAuthHeaders()
        })
        existingCount = (response.data.results || response.data || []).length
      } catch (error) {
        console.warn('Could not fetch existing codes count:', error)
      }
    }
    
    const nextNumber = existingCount + 1
    const generatedCode = `${prefix}${nextNumber.toString().padStart(3, '0')}`
    masterCodeData.master_code = generatedCode
    
    validateCodeFormat()
    
  } catch (error) {
    console.error('Error generating code:', error)
    $swal.fire({
      icon: 'warning',
      title: 'ແຈ້ງເຕືອນ',
      text: 'ບໍ່ສາມາດສ້າງລະຫັດອັດຕະໂນມັດໄດ້'
    })
  }
}

const createMasterType = async () => {
  try {
    const isValid = await masterTypeForm.value?.validate()
    if (!isValid.valid) return

    loading.masterType = true

    const payload = {
      master_type_name: masterTypeData.master_type_name.trim(),
      description: masterTypeData.description?.trim() || null,
      display_order: masterTypeData.display_order || null,
      is_active: masterTypeData.is_active,
      allow_duplicate_codes: masterTypeData.allow_duplicate_codes,
      require_description: masterTypeData.require_description,
      code_format_pattern: masterTypeData.code_format_pattern?.trim() || null
    }

    const response = await $axios.post('/api/master-types/', payload, getAuthHeaders())
    
    $swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ!',
      text: `ສ້າງ Master Type "${response.data.master_type_name}" ສຳເລັດແລ້ວ`,
      timer: 3000,
      showConfirmButton: false
    })

    // Redirect to list or reset form
    setTimeout(() => {
      navigateTo('/admin/master-text')
    }, 2000)

  } catch (error) {
    console.error('Error creating master type:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງ Master Type'
    if (error.response?.data?.master_type_name) {
      errorMessage = `ຊື່ Master Type: ${error.response.data.master_type_name.join(', ')}`
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    }

    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: errorMessage
    })
  } finally {
    loading.masterType = false
  }
}

const createMasterCode = async () => {
  try {
    const isValid = await masterCodeForm.value?.validate()
    if (!isValid.valid) return

    loading.masterCode = true

    const masterTypeId = creationMode.value === 'both' 
      ? createdMasterType.value?.id 
      : selectedMasterTypeId.value

    const payload = {
      master_type: masterTypeId,
      master_code: masterCodeData.master_code.trim().toUpperCase(),
      description_la: masterCodeData.description_la?.trim() || null,
      description_en: masterCodeData.description_en?.trim() || null,
      display_order: masterCodeData.display_order || null,
      is_active: masterCodeData.is_active,
      is_default: masterCodeData.is_default
    }

    const response = await $axios.post('/api/master-codes/', payload, getAuthHeaders())
    
    $swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ!',
      text: `ສ້າງ Master Code "${response.data.master_code}" ສຳເລັດແລ້ວ`,
      timer: 3000,
      showConfirmButton: false
    })

    // Redirect to list or reset form
    setTimeout(() => {
      navigateTo('/admin/master-text')
    }, 2000)

  } catch (error) {
    console.error('Error creating master code:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງ Master Code'
    if (error.response?.data?.master_code) {
      errorMessage = `Master Code: ${error.response.data.master_code.join(', ')}`
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    }

    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: errorMessage
    })
  } finally {
    loading.masterCode = false
  }
}

const createBoth = async () => {
  try {
    loading.both = true
    creationProgress.show = true
    creationProgress.value = 0
    creationProgress.color = 'primary'
    creationProgress.message = 'ກຳລັງສ້າງ Master Type...'

    // Step 1: Create Master Type
    const masterTypeIsValid = await masterTypeForm.value?.validate()
    if (!masterTypeIsValid.valid) {
      throw new Error('Master Type ຂໍ້ມູນບໍ່ຖືກຕ້ອງ')
    }

    creationProgress.value = 25

    const masterTypePayload = {
      master_type_name: masterTypeData.master_type_name.trim(),
      description: masterTypeData.description?.trim() || null,
      display_order: masterTypeData.display_order || null,
      is_active: masterTypeData.is_active,
      allow_duplicate_codes: masterTypeData.allow_duplicate_codes,
      require_description: masterTypeData.require_description,
      code_format_pattern: masterTypeData.code_format_pattern?.trim() || null
    }

    const masterTypeResponse = await $axios.post('/api/master-types/', masterTypePayload, getAuthHeaders())
    createdMasterType.value = masterTypeResponse.data

    creationProgress.value = 50
    creationProgress.message = 'ສ້າງ Master Type ສຳເລັດ! ກຳລັງສ້າງ Master Code...'

    // Step 2: Create Master Code
    const masterCodeIsValid = await masterCodeForm.value?.validate()
    if (!masterCodeIsValid.valid) {
      throw new Error('Master Code ຂໍ້ມູນບໍ່ຖືກຕ້ອງ')
    }

    creationProgress.value = 75

    const masterCodePayload = {
      master_type: createdMasterType.value.id,
      master_code: masterCodeData.master_code.trim().toUpperCase(),
      description_la: masterCodeData.description_la?.trim() || null,
      description_en: masterCodeData.description_en?.trim() || null,
      display_order: masterCodeData.display_order || null,
      is_active: masterCodeData.is_active,
      is_default: masterCodeData.is_default
    }

    const masterCodeResponse = await $axios.post('/api/master-codes/', masterCodePayload, getAuthHeaders())

    creationProgress.value = 100
    creationProgress.color = 'success'
    creationProgress.message = 'ສຳເລັດ! ສ້າງທັງ Master Type ແລະ Master Code ແລ້ວ'

    $swal.fire({
      icon: 'success',
      title: 'ສຳເລັດທັງໝົດ!',
      html: `
        <div style="text-align: left;">
          <p><strong>Master Type:</strong> ${createdMasterType.value.master_type_name}</p>
          <p><strong>Master Code:</strong> ${masterCodeResponse.data.master_code}</p>
          <p class="text-success">ສ້າງທັງສອງສຳເລັດແລ້ວ!</p>
        </div>
      `,
      timer: 4000,
      showConfirmButton: false
    })

    // Redirect after success
    setTimeout(() => {
      navigateTo('/admin/master-text')
    }, 3000)

  } catch (error) {
    console.error('Error creating both:', error)
    
    creationProgress.color = 'error'
    creationProgress.message = 'ເກີດຂໍ້ຜິດພາດ!'

    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງ'
    if (error.message) {
      errorMessage = error.message
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    }

    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: errorMessage
    })
  } finally {
    loading.both = false
    setTimeout(() => {
      creationProgress.show = false
    }, 2000)
  }
}

const createMultipleCodes = async () => {
  if (!createdMasterType.value || !multipleCodes.value?.length) return

  try {
    loading.multipleCodes = true

    const promises = multipleCodes.value.map(async (code, index) => {
      const payload = {
        master_type: createdMasterType.value.id,
        master_code: code.trim().toUpperCase(),
        description_la: `${createdMasterType.value.master_type_name} - ${code}`,
        is_active: true,
        is_default: false,
        display_order: (index + 2) * 10 // Start from 20 since first code is 10
      }

      return $axios.post('/api/master-codes/', payload, getAuthHeaders())
    })

    await Promise.all(promises)

    $swal.fire({
      icon: 'success',
      title: 'ສຳເລັດ!',
      text: `ສ້າງ Master Code ${multipleCodes.value.length} ລາຍການສຳເລັດແລ້ວ`,
      timer: 3000,
      showConfirmButton: false
    })

    multipleCodes.value = []

  } catch (error) {
    console.error('Error creating multiple codes:', error)
    $swal.fire({
      icon: 'error',
      title: 'ຂໍ້ຜິດພາດ',
      text: 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງ Master Code ຫຼາຍລາຍການ'
    })
  } finally {
    loading.multipleCodes = false
  }
}

const resetAllForms = () => {
  // Reset Master Type form
  Object.assign(masterTypeData, {
    master_type_name: '',
    description: '',
    display_order: null,
    is_active: true,
    allow_duplicate_codes: false,
    require_description: false,
    code_format_pattern: ''
  })

  // Reset Master Code form
  Object.assign(masterCodeData, {
    master_code: '',
    description_la: '',
    description_en: '',
    display_order: null,
    is_active: true,
    is_default: false
  })

  // Reset other state
  selectedMasterTypeId.value = null
  selectedMasterType.value = null
  createdMasterType.value = null
  multipleCodes.value = []
  formatValidationMessage.value = null
  creationProgress.show = false

  // Reset form validations
  nextTick(() => {
    masterTypeForm.value?.resetValidation()
    masterCodeForm.value?.resetValidation()
  })
}

// Watch for master code changes to validate format
watch(() => masterCodeData.master_code, () => {
  if (masterCodeData.master_code) {
    validateCodeFormat()
  } else {
    formatValidationMessage.value = null
  }
})

// Auto-generate display order for master code
watch(() => masterCodeData.master_code, (newCode) => {
  if (newCode && !masterCodeData.display_order) {
    masterCodeData.display_order = newCode.length * 10
  }
})

// Auto-generate master code when master type name changes in both mode
watch(() => masterTypeData.master_type_name, () => {
  if (creationMode.value === 'both' && masterTypeData.master_type_name && !masterCodeData.master_code) {
    nextTick(() => {
      generateCode()
    })
  }
})

// Lifecycle
onMounted(() => {
  if (creationMode.value === 'master-code') {
    loadAvailableMasterTypes()
  }
})

// SEO
useSeoMeta({
  title: 'Create Master Data - Admin Panel',
  description: 'Create new Master Types and Master Codes'
})
</script>

<style scoped>
.master-data-create {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.page-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.mode-selector {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e0e0e0;
}

.master-type-card {
  height: fit-content;
}

.master-code-card {
  height: fit-content;
}

.preview-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}

:deep(.v-expansion-panel) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-card-title) {
  border-radius: 8px 8px 0 0;
}

@media (max-width: 768px) {
  .master-data-create {
    padding: 12px;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  :deep(.v-card-title) {
    padding: 12px 16px;
    font-size: 1rem;
  }
  
  :deep(.v-card-text) {
    padding: 12px;
  }
}
</style>