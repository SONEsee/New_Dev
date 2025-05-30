<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6" xl="5">
        <v-card elevation="0" class="rounded-xl border">
          <!-- Header -->
          <v-card-title class="pa-8 pb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="28">
                mdi-shield-plus
              </v-icon>
              <div>
                <h2 class="text-h5 font-weight-bold mb-1 text-styles">
                  ສ້າງສິດຜູ້ນໍາໃຊ້ໃໝ່
                </h2>
                <p class="text-body-2 text-medium-emphasis mb-0 text-styles">
                  ກໍານົດສິດການເຂົ້າເຖິງຟັງຊັນຕ່າງໆໃນລະບົບ
                </p>
              </div>
            </div>
          </v-card-title>

          
          <v-card-text class="pa-8 pt-0">
            <v-form @submit.prevent="submitForm" v-model="isValid" ref="formRef">
              <v-row>
              
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.role_id"
                    :items="roleOptions"
                    item-title="display"
                    item-value="id"
                    label="ເລືອກບົດບາດ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-key"
                    :rules="[rules.required]"
                    :loading="loadingRoles"
                    no-data-text="ບໍ່ມີຂໍ້ມູນບົດບາດ"
                    required
                    class="mb-2"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar size="32" color="primary" variant="tonal">
                            <v-icon>mdi-account-circle</v-icon>
                          </v-avatar>
                        </template>
                        <!-- <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.raw.role_name_la }}</v-list-item-subtitle> -->
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>

                <!-- Function ID -->
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.function_id"
                    :items="functionOptions"
                    item-title="display"
                    item-value="id"
                    label="ເລືອກຟັງຊັນ"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-function"
                    :rules="[rules.required]"
                    :loading="loadingFunctions"
                    no-data-text="ບໍ່ມີຂໍ້ມູນຟັງຊັນ"
                    required
                    class="mb-2"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar size="32" color="secondary" variant="tonal">
                            <v-icon>mdi-cog</v-icon>
                          </v-avatar>
                        </template>
                        <!-- <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.raw.description_la }}</v-list-item-subtitle> -->
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>

              <!-- Permissions Section -->
              <v-card variant="tonal" class="mb-6 rounded-lg">
                <v-card-title class="pa-4 pb-2">
                  <v-icon color="primary" class="mr-2">mdi-lock-outline</v-icon>
                  <span class="text-h6 text-styles">ການອະນຸຍາດ</span>
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
                  ບັນທຶກ
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
import { ref, reactive, onMounted } from 'vue'
import axios from '@/helpers/axios'
import { RoleDetailModel } from '~/models'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref()
const isValid = ref(true)
const loading = ref(false)
const loadingRoles = ref(false)
const loadingFunctions = ref(false)

// Dropdown options
const roleOptions = ref<Array<{ id: string | number; name: string }>>([])
const functionOptions = ref<Array<{ id: string | number; name: string }>>([])

// Form data
const form = ref<RoleDetailModel.RoleDetailResponse>({
  role_id: '',
  function_id: '',
  New_Detail: 0,
  Del_Detail: 0,
  Edit_Detail: 0,
  Auth_Detail: 0,
})

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

// Validation rules
const rules = {
  required: (value: any) => !!value || 'ຈໍາເປັນຕ້ອງມີຂໍ້ມູນນີ້',
}

// Fetch roles
const fetchRoles = async () => {
  loadingRoles.value = true
  try {
    const res = await axios.get('/api/roles/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 200) {
      roleOptions.value = res.data.map((role: any) => ({
        id: role.id || role.role_id,
        display: `${role.id || role.role_id} - ${role.role_name_la || role.name || 'Unknown Role'}`,
        role_name_la: role.role_name_la || role.name || 'Unknown Role'
      }))
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນບົດບາດ', 'error', 'mdi-alert-circle')
  } finally {
    loadingRoles.value = false
  }
}

// Fetch functions
const fetchFunctions = async () => {
  loadingFunctions.value = true
  try {
    const res = await axios.get('/api/functions/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 200) {
      functionOptions.value = res.data.map((func: any) => ({
        id: func.id || func.function_id,
        display: `${func.id || func.function_id} - ${func.description_la || func.name || 'Unknown Function'}`,
        description_la: func.description_la || func.name || 'Unknown Function'
      }))
    }
  } catch (error) {
    console.error('Error fetching functions:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນຟັງຊັນ', 'error', 'mdi-alert-circle')
  } finally {
    loadingFunctions.value = false
  }
}

// Update permission values
const updatePermission = (field: keyof RoleDetailModel.RoleDetailResponse, value: boolean) => {
  form.value[field] = value ? 1 : 0
}

// Submit form
const submitForm = async () => {
  // Validate form first
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const res = await axios.post('api/role-details/', form.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 201) {
      // Show SweetAlert success message
      if (window.Swal) {
        window.Swal.fire({
          title: 'ສຳເລັດ!',
          text: 'ສ້າງສິດຜູ້ນໍາໃຊ້ສໍາເລັດແລ້ວ!',
          icon: 'success',
          confirmButtonText: 'ຕົກລົງ',
          confirmButtonColor: '#4CAF50',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            content: 'swal-content'
          }
        }).then(() => {
          resetForm()
        })
      } else {
        // Fallback to snackbar if SweetAlert is not available
        showSnackbar('ສ້າງສິດຜູ້ນໍາໃຊ້ສໍາເລັດແລ້ວ!', 'success', 'mdi-check-circle')
        setTimeout(() => {
          resetForm()
        }, 1500)
      }
    }
  } catch (error: any) {
    console.error('Error creating role detail:', error)
    
    // Show SweetAlert error message
    if (window.Swal) {
      window.Swal.fire({
        title: 'ເກີດຂໍ້ຜິດພາດ!',
        text: error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງສິດຜູ້ນໍາໃຊ້',
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
        error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງສິດຜູ້ນໍາໃຊ້',
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

// Reset form
const resetForm = () => {
  form.value = {
    role_id: '',
    function_id: '',
    New_Detail: 0,
    Del_Detail: 0,
    Edit_Detail: 0,
    Auth_Detail: 0,
  }
  permissions.new = false
  permissions.delete = false
  permissions.edit = false
  permissions.auth = false
  formRef.value?.resetValidation()
}

// Go back
const goBack = () => {
  router.back()
}

// Initialize data on component mount
onMounted(async () => {
  await Promise.all([fetchRoles(), fetchFunctions()])
})
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
