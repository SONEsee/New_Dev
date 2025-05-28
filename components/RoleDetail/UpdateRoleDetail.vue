<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8" xl="6">
        <v-card elevation="0" class="rounded-xl border">
          <!-- Header -->
          <v-card-title class="pa-8 pb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="28">
                mdi-shield-edit
              </v-icon>
              <div>
                <h2 class="text-h5 font-weight-bold mb-1 text-styles">
                  ແກ້ໄຂສິດຜູ້ນໍາໃຊ້
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
                  ປັບປຸງສິດການເຂົ້າເຖິງເມນູແລະຟັງຊັນຕ່າງໆໃນລະບົບ
                </p>
              </div>
            </div>
          </v-card-title>

          <!-- Loading State -->
          <v-card-text v-if="initialLoading" class="pa-8 pt-0">
            <div class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              />
              <p class="text-h6 text-medium-emphasis">
                ກໍາລັງໂຫຼດຂໍ້ມູນ...
              </p>
            </div>
          </v-card-text>

          <!-- Form -->
          <v-card-text v-else class="pa-8 pt-0">
            <v-form @submit.prevent="updateForm" v-model="isValid" ref="formRef">
              <v-row>
                <!-- Role Selection (Read-only) -->
                <v-col cols="12">
                  <v-text-field
                    v-model="selectedRoleDisplay"
                    label="ບົດບາດ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-key"
                    readonly
                    class="mb-2"
                  >
                    <template #append-inner>
                      <v-chip color="primary" variant="tonal" size="small">
                        ບໍ່ສາມາດແກ້ໄຂ
                      </v-chip>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>

              <!-- Module/Menu Selection Section (Read-only for existing data) -->
              <v-card variant="tonal" class="mb-6 rounded-lg">
                <v-card-title class="pa-4 pb-2">
                  <v-icon color="info" class="mr-2">mdi-view-dashboard</v-icon>
                  <span class="text-h6 text-styles">ຂໍ້ມູນໂມດູນແລະເມນູ</span>
                </v-card-title>
                <v-card-text class="pa-4 pt-2">
                  <v-row>
                    <!-- Module Display -->
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="selectedModuleDisplay"
                        label="ໂມດູນ"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-view-module"
                        readonly
                      >
                        <template #append-inner>
                          <v-chip color="info" variant="tonal" size="small">
                            ບໍ່ສາມາດແກ້ໄຂ
                          </v-chip>
                        </template>
                      </v-text-field>
                    </v-col>

                    <!-- Main Menu Display -->
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="selectedMainMenuDisplay"
                        label="ເມນູຫຼັກ"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-menu"
                        readonly
                      >
                        <template #append-inner>
                          <v-chip color="secondary" variant="tonal" size="small">
                            ບໍ່ສາມາດແກ້ໄຂ
                          </v-chip>
                        </template>
                      </v-text-field>
                    </v-col>

                    <!-- Sub Menu Display -->
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="selectedSubMenuDisplay"
                        label="ເມນູຍ່ອຍ"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-menu-down"
                        readonly
                      >
                        <template #append-inner>
                          <v-chip color="warning" variant="tonal" size="small">
                            ບໍ່ສາມາດແກ້ໄຂ
                          </v-chip>
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>

                  <!-- Function Display (if available) -->
                  <v-row v-if="selectedFunctionDisplay">
                    <v-col cols="12">
                      <v-text-field
                        v-model="selectedFunctionDisplay"
                        label="ຟັງຊັນ"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-function"
                        readonly
                      >
                        <template #append-inner>
                          <v-chip color="purple" variant="tonal" size="small">
                            ບໍ່ສາມາດແກ້ໄຂ
                          </v-chip>
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Current Data Display Card -->
              <v-card variant="outlined" class="mb-6 rounded-lg">
                <v-card-title class="pa-4 pb-2">
                  <v-icon color="info" class="mr-2">mdi-information</v-icon>
                  <span class="text-h6 text-styles">ຂໍ້ມູນປັດຈຸບັນ</span>
                </v-card-title>
                <v-card-text class="pa-4 pt-2">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="primary" class="mr-2">mdi-account-key</v-icon>
                        <span class="font-weight-medium">ບົດບາດ:</span>
                        <v-spacer />
                        <span>{{ currentRoleData?.role_name_la || form.role_id }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon color="info" class="mr-2">mdi-menu</v-icon>
                        <span class="font-weight-medium">ເມນູຍ່ອຍ:</span>
                        <v-spacer />
                        <span>{{ currentSubMenuData?.sub_menu_name_la || form.sub_menu_id }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="success" class="mr-2">mdi-identifier</v-icon>
                        <span class="font-weight-medium">ລະຫັດບົດບາດ:</span>
                        <v-spacer />
                        <span>{{ form.role_id }}</span>
                      </div>
                      <div class="d-flex align-center mb-2">
                        <v-icon color="warning" class="mr-2">mdi-menu-right</v-icon>
                        <span class="font-weight-medium">ລະຫັດເມນູຍ່ອຍ:</span>
                        <v-spacer />
                        <span>{{ form.sub_menu_id }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Permissions Section -->
              <v-card variant="tonal" class="mb-6 rounded-lg">
                <v-card-title class="pa-4 pb-2">
                  <v-icon color="primary" class="mr-2">mdi-lock-outline</v-icon>
                  <span class="text-h6 text-styles">ການອະນຸຍາດ</span>
                  <v-spacer />
                  <v-chip color="success" variant="tonal" size="small">
                    ສາມາດແກ້ໄຂໄດ້
                  </v-chip>
                </v-card-title>
                <v-card-text class="pa-4 pt-2">
                  <v-row>
                    <!-- New Permission -->
                    <v-col cols="12" sm="6" lg="4">
                      <div class="permission-card">
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon color="success" class="mr-2">mdi-plus-circle</v-icon>
                            <span class="font-weight-medium">ເພີ່ມ</span>
                          </div>
                          <v-chip
                            :color="form.New_Detail === 1 ? 'success' : 'default'"
                            variant="tonal"
                            size="small"
                          >
                            {{ form.New_Detail === 1 ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                          </v-chip>
                        </div>
                        <v-switch
                          v-model="permissions.new"
                          color="success"
                          density="compact"
                          hide-details
                          @update:model-value="updatePermission('New_Detail', $event)"
                        />
                      </div>
                    </v-col>

                    <!-- Delete Permission -->
                    <v-col cols="12" sm="6" lg="4">
                      <div class="permission-card">
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon color="error" class="mr-2">mdi-delete-circle</v-icon>
                            <span class="font-weight-medium">ລົບ</span>
                          </div>
                          <v-chip
                            :color="form.Del_Detail === 1 ? 'success' : 'default'"
                            variant="tonal"
                            size="small"
                          >
                            {{ form.Del_Detail === 1 ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                          </v-chip>
                        </div>
                        <v-switch
                          v-model="permissions.delete"
                          color="success"
                          density="compact"
                          hide-details
                          @update:model-value="updatePermission('Del_Detail', $event)"
                        />
                      </div>
                    </v-col>

                    <!-- Edit Permission -->
                    <v-col cols="12" sm="6" lg="4">
                      <div class="permission-card">
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon color="primary" class="mr-2">mdi-pencil-circle</v-icon>
                            <span class="font-weight-medium">ແກ້ໄຂ</span>
                          </div>
                          <v-chip
                            :color="form.Edit_Detail === 1 ? 'success' : 'default'"
                            variant="tonal"
                            size="small"
                          >
                            {{ form.Edit_Detail === 1 ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                          </v-chip>
                        </div>
                        <v-switch
                          v-model="permissions.edit"
                          color="success"
                          density="compact"
                          hide-details
                          @update:model-value="updatePermission('Edit_Detail', $event)"
                        />
                      </div>
                    </v-col>

                    <!-- View Permission -->
                    <v-col cols="12" sm="6" lg="4">
                      <div class="permission-card">
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon color="info" class="mr-2">mdi-eye-check</v-icon>
                            <span class="font-weight-medium">ກວດສອບ</span>
                          </div>
                          <v-chip
                            :color="form.View_Detail === 1 ? 'success' : 'default'"
                            variant="tonal"
                            size="small"
                          >
                            {{ form.View_Detail === 1 ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                          </v-chip>
                        </div>
                        <v-switch
                          v-model="permissions.view"
                          color="success"
                          density="compact"
                          hide-details
                          @update:model-value="updatePermission('View_Detail', $event)"
                        />
                      </div>
                    </v-col>

                    <!-- Auth Permission -->
                    <v-col cols="12" sm="6" lg="4">
                      <div class="permission-card">
                        <div class="d-flex align-center justify-space-between mb-3">
                          <div class="d-flex align-center">
                            <v-icon color="warning" class="mr-2">mdi-check-circle</v-icon>
                            <span class="font-weight-medium">ອະນຸມັດ</span>
                          </div>
                          <v-chip
                            :color="form.Auth_Detail === 1 ? 'success' : 'default'"
                            variant="tonal"
                            size="small"
                          >
                            {{ form.Auth_Detail === 1 ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຍາດ' }}
                          </v-chip>
                        </div>
                        <v-switch
                          v-model="permissions.auth"
                          color="success"
                          density="compact"
                          hide-details
                          @update:model-value="updatePermission('Auth_Detail', $event)"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Action Buttons -->
              <div class="d-flex gap-3 justify-end">
                <v-btn
                  variant="outlined"
                  size="large"
                  prepend-icon="mdi-arrow-left"
                  @click="goBack"
                  class="text-none font-weight-medium"
                >
                  ກັບຄືນ
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-content-save"
                  :disabled="!isValid"
                  :loading="loading"
                  class="text-none font-weight-medium px-8"
                >
                  ບັນທຶກການປ່ຽນແປງ
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import { RoleDetailModel } from '~/models'

const route = useRoute()
const router = useRouter()
const formRef = ref()

// Route parameters - Updated to use sub_menu_id instead of fun_id
const role_id = route.query.role_id as string
const sub_menu_id = route.query.sub_menu_id as string

// State
const isValid = ref(true)
const loading = ref(false)
const initialLoading = ref(true)

// Data
const form = ref<RoleDetailModel.RoleDetailResponse>({
  role_id: '',
  function_id: '',
  sub_menu_id: '',
  New_Detail: 0,
  Del_Detail: 0,
  Edit_Detail: 0,
  Auth_Detail: 0,
  View_Detail: 0,
})

// Current data for display
const currentRoleData = ref<any>(null)
const currentSubMenuData = ref<any>(null)
const currentFunctionData = ref<any>(null)
const sidebarData = ref<any[]>([])

// Permission switches (for better UX)
const permissions = reactive({
  new: false,
  delete: false,
  edit: false,
  auth: false,
  view: false
})

// Snackbar state
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
})

// Computed properties for display
const selectedRoleDisplay = computed(() => {
  if (currentRoleData.value) {
    return `${currentRoleData.value.role_id} - ${currentRoleData.value.role_name_la}`
  }
  return form.value.role_id
})

const selectedModuleDisplay = computed(() => {
  if (sidebarData.value.length > 0 && currentSubMenuData.value) {
    // Find the module that contains this sub menu
    for (const module of sidebarData.value) {
      for (const mainMenu of module.main_menus) {
        if (mainMenu.sub_menus.some((sm: any) => sm.sub_menu_id === currentSubMenuData.value.sub_menu_id)) {
          return `${module.module_Id} - ${module.module_name_la}`
        }
      }
    }
  }
  return 'ກໍາລັງໂຫຼດ...'
})

const selectedMainMenuDisplay = computed(() => {
  if (sidebarData.value.length > 0 && currentSubMenuData.value) {
    // Find the main menu that contains this sub menu
    for (const module of sidebarData.value) {
      for (const mainMenu of module.main_menus) {
        if (mainMenu.sub_menus.some((sm: any) => sm.sub_menu_id === currentSubMenuData.value.sub_menu_id)) {
          return `${mainMenu.menu_id} - ${mainMenu.menu_name_la}`
        }
      }
    }
  }
  return 'ກໍາລັງໂຫຼດ...'
})

const selectedSubMenuDisplay = computed(() => {
  if (currentSubMenuData.value) {
    return `${currentSubMenuData.value.sub_menu_id} - ${currentSubMenuData.value.sub_menu_name_la}`
  }
  return form.value.sub_menu_id
})

const selectedFunctionDisplay = computed(() => {
  if (currentFunctionData.value) {
    return `${currentFunctionData.value.function_id} - ${currentFunctionData.value.description_la}`
  }
  return form.value.function_id || null
})

// Load current role detail data
const loadData = async () => {
  initialLoading.value = true
  try {
    // Load role detail data
    const res = await axios.get<RoleDetailModel.RoleDetailResponse>(
      `api/role-details/single?role_id=${role_id}&sub_menu_id=${sub_menu_id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    
    if (res.status === 200) {
      form.value = res.data
      // Set permission switches based on loaded data
      permissions.new = form.value.New_Detail === 1
      permissions.delete = form.value.Del_Detail === 1
      permissions.edit = form.value.Edit_Detail === 1
      permissions.auth = form.value.Auth_Detail === 1
      permissions.view = form.value.View_Detail === 1
    }

    // Load additional data for display
    await Promise.all([
      loadRoleDetails(),
      loadSidebarData(),
      loadSubMenuDetails()
    ])
    
  } catch (error) {
    console.error('Error loading data:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ', 'error', 'mdi-alert-circle')
  } finally {
    initialLoading.value = false
  }
}

// Load role details
const loadRoleDetails = async () => {
  try {
    const res = await axios.get('/api/roles/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 200) {
      currentRoleData.value = res.data.find((role: any) => role.role_id === role_id)
    }
  } catch (error) {
    console.error('Error loading role details:', error)
  }
}

// Load sidebar data for navigation context
const loadSidebarData = async () => {
  try {
    const res = await axios.get(`/api/role/${role_id}/sidebar/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 200) {
      sidebarData.value = res.data
    }
  } catch (error) {
    console.error('Error loading sidebar data:', error)
  }
}

// Load sub menu details
const loadSubMenuDetails = async () => {
  try {
    // Find sub menu data from sidebar data
    if (sidebarData.value.length > 0) {
      for (const module of sidebarData.value) {
        for (const mainMenu of module.main_menus) {
          const subMenu = mainMenu.sub_menus.find((sm: any) => sm.sub_menu_id === sub_menu_id)
          if (subMenu) {
            currentSubMenuData.value = subMenu
            // If there are functions, get the first one (or find the matching one)
            if (subMenu.functions && subMenu.functions.length > 0 && form.value.function_id) {
              currentFunctionData.value = subMenu.functions.find((f: any) => f.function_id === form.value.function_id)
            }
            break
          }
        }
      }
    }
  } catch (error) {
    console.error('Error loading sub menu details:', error)
  }
}

// Update permission values
const updatePermission = (field: keyof RoleDetailModel.RoleDetailResponse, value: boolean) => {
  form.value[field] = value ? 1 : 0
}

// Update form
const updateForm = async () => {
  // Validate form first
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await axios.put(
      `api/role-details/update/?role_id=${role_id}&sub_menu_id=${sub_menu_id}`,
      form.value,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )

    // Show SweetAlert success message
    if (window.Swal) {
      window.Swal.fire({
        title: 'ສຳເລັດ!',
        text: 'ອັບເດດສິດຜູ້ນໍາໃຊ້ສໍາເລັດແລ້ວ!',
        icon: 'success',
        confirmButtonText: 'ຕົກລົງ',
        confirmButtonColor: '#4CAF50',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          content: 'swal-content'
        }
      })
    } else {
      // Fallback to snackbar if SweetAlert is not available
      showSnackbar('ອັບເດດສິດຜູ້ນໍາໃຊ້ສໍາເລັດແລ້ວ!', 'success', 'mdi-check-circle')
    }

  } catch (error: any) {
    console.error('Error updating role detail:', error)
    
    // Show SweetAlert error message
    if (window.Swal) {
      window.Swal.fire({
        title: 'ເກີດຂໍ້ຜິດພາດ!',
        text: error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສິດຜູ້ນໍາໃຊ້',
        icon: 'error',
        confirmButtonText: 'ຕົກລົງ',
        confirmButtonColor: '#f44336',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          content: 'swal-content'
        }
      })
    } else {
      // Fallback to snackbar if SweetAlert is not available
      showSnackbar(
        error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສິດຜູ້ນໍາໃຊ້',
        'error',
        'mdi-alert-circle'
      )
    }
  } finally {
    loading.value = false
  }
}

// Show snackbar notification
const showSnackbar = (message: string, color: string, icon: string) => {
  snackbar.message = message
  snackbar.color = color
  snackbar.icon = icon
  snackbar.show = true
}

// Go back
const goBack = () => {
  router.back()
}

// Initialize data on component mount
onMounted(loadData)
</script>

<style scoped>
.permission-card {
  padding: 16px;
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  transition: all 0.2s ease;
}

.permission-card:hover {
  background-color: rgba(var(--v-theme-surface), 0.8);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

:deep(.v-field__outline) {
  border-radius: 8px;
}

:deep(.v-card) {
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

:deep(.v-switch .v-selection-control__input) {
  border-radius: 16px;
}

.border {
  border: 1px solid rgba(var(--v-theme-outline), 0.12) !important;
}

/* SweetAlert Custom Styles */
:global(.swal-popup) {
  font-family: 'Noto Sans Lao', sans-serif !important;
  border-radius: 12px !important;
}

:global(.swal-title) {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
}

:global(.swal-content) {
  font-size: 1rem !important;
}
</style>