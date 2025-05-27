<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" xl="5">
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
                  ປັບປຸງສິດການເຂົ້າເຖິງຟັງຊັນຕ່າງໆໃນລະບົບ
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
                <!-- Role ID (Display Only) -->
                <v-col cols="12" sm="6">
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

                <!-- Function ID (Display Only) -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="selectedFunctionDisplay"
                    label="ຟັງຊັນ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-function"
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

              <!-- Permissions Section -->
              <v-card variant="tonal" class="mb-6 rounded-lg">
                <v-card-title class="pa-4 pb-2">
                  <v-icon color="primary" class="mr-2">mdi-lock-outline</v-icon>
                  <span class="text-h6">ການອະນຸຍາດ</span>
                </v-card-title>
                <v-card-text class="pa-4 pt-2">
                  <v-row>
                    <!-- New Permission -->
                    <v-col cols="12" sm="6" md="3">
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
                    <v-col cols="12" sm="6" md="3">
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
                    <v-col cols="12" sm="6" md="3">
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

                    <!-- Auth Permission -->
                    <v-col cols="12" sm="6" md="3">
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

// Route parameters
const role_id = route.query.role_id as string
const function_id = route.query.fun_id as string

// State
const isValid = ref(true)
const loading = ref(false)
const initialLoading = ref(true)

// Data
const form = ref<RoleDetailModel.RoleDetailResponse>({
  role_id: '',
  function_id: '',
  New_Detail: 0,
  Del_Detail: 0,
  Edit_Detail: 0,
  Auth_Detail: 0,
})

const roleData = ref<any>(null)
const functionData = ref<any>(null)

// Permission switches (for better UX)
const permissions = reactive({
  new: false,
  delete: false,
  edit: false,
  auth: false,
})

// Snackbar state
const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
})

// SweetAlert instance
declare global {
  interface Window {
    Swal: any;
  }
}

// Computed properties for display
const selectedRoleDisplay = computed(() => {
  if (roleData.value) {
    return `${roleData.value.id || roleData.value.role_id} - ${roleData.value.role_name_la || roleData.value.name || 'Unknown Role'}`
  }
  return form.value.role_id
})

const selectedFunctionDisplay = computed(() => {
  if (functionData.value) {
    return `${functionData.value.id || functionData.value.function_id} - ${functionData.value.description_la || functionData.value.name || 'Unknown Function'}`
  }
  return form.value.function_id
})

// Load current role detail data
const loadData = async () => {
  initialLoading.value = true
  try {
    const res = await axios.get<RoleDetailModel.RoleDetailResponse>(
      `api/role-details/single?role_id=${role_id}&function_id=${function_id}`,
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
    }

    // Load role and function details for display
    await Promise.all([loadRoleDetails(), loadFunctionDetails()])
    
  } catch (error) {
    console.error('Error loading data:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ', 'error', 'mdi-alert-circle')
  } finally {
    initialLoading.value = false
  }
}

// Load role details for display
const loadRoleDetails = async () => {
  try {
    const res = await axios.get('/api/roles/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 200) {
      roleData.value = res.data.find((role: any) => 
        (role.id || role.role_id) == role_id
      )
    }
  } catch (error) {
    console.error('Error loading role details:', error)
  }
}

// Load function details for display
const loadFunctionDetails = async () => {
  try {
    const res = await axios.get('/api/functions/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 200) {
      functionData.value = res.data.find((func: any) => 
        (func.id || func.function_id) == function_id
      )
    }
  } catch (error) {
    console.error('Error loading function details:', error)
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
      `api/v1/role-details/update/?role_id=${role_id}&function_id=${function_id}`,
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

<!-- SweetAlert2 CDN -->
