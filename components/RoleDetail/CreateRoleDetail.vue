<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8" xl="6">
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
                  ກໍານົດສິດການເຂົ້າເຖິງເມນູແລະຟັງຊັນຕ່າງໆໃນລະບົບ
                </p>
              </div>
            </div>
          </v-card-title>

          
          <v-card-text class="pa-8 pt-0">
            <v-form @submit.prevent="submitForm" v-model="isValid" ref="formRef">
              <!-- Module, Menu, Submenu Selection Section -->
              <v-card variant="tonal" class="mb-6 rounded-lg">
                <v-card-title class="pa-4 pb-2">
                  <v-icon color="info" class="mr-2">mdi-view-dashboard</v-icon>
                  <span class="text-h6 text-styles">ເລືອກໂມດູນ, ເມນູ, ແລະເມນູຍ່ອຍ</span>
                </v-card-title>
                <v-card-text class="pa-4 pt-2">
                  <!-- Module Selection -->
                  <v-row class="mb-4">
                    <v-col cols="12">
                      <v-select
                        v-model="form.module_id"
                        :items="moduleOptions"
                        item-title="display"
                        item-value="module_Id"
                        label="ເລືອກໂມດູນ *"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-filter"
                        :rules="[rules.required]"
                        :loading="loadingModules"
                        no-data-text="ບໍ່ມີຂໍ້ມູນໂມດູນ"
                        required
                        @update:model-value="onModuleChange"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>

                  <!-- Menu Selection -->
                  <v-row class="mb-4">
                    <v-col cols="12">
                      <v-select
                        v-model="form.menu_id"
                        :items="menuOptions"
                        item-title="display"
                        item-value="menu_id"
                        label="ເລືອກເມນູຫຼັກ *"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-menu"
                        :rules="[rules.required]"
                        :loading="loadingMenus"
                        no-data-text="ບໍ່ມີຂໍ້ມູນເມນູຫຼັກ"
                        :disabled="!form.module_id"
                        required
                        @update:model-value="onMenuChange"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                            <!-- <template #prepend>
                              <v-avatar size="32" color="secondary" variant="tonal">
                                <v-icon>{{ item.raw.menu_icon || 'mdi-menu-open' }}</v-icon>
                              </v-avatar>
                            </template>
                            <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.raw.menu_name_en }}</v-list-item-subtitle> -->
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>

                  <!-- Submenu Selection -->
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="form.sub_menu_id"
                      :items="subMenuOptions"
                      item-title="display"
                      item-value="sub_menu_id"
                      label="ເລືອກເມນູຍ່ອຍ *"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-menu-right"
                      :rules="[rules.required]"
                      :loading="loadingSubmenus"
                      no-data-text="ບໍ່ມີຂໍ້ມູນເມນູຍ່ອຍ"
                      :disabled="!form.menu_id"
                      required
                      @update:model-value="onSubMenuChange"
                    >
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props" class="py-3">
                          <!-- <template #prepend>
                            <v-avatar size="36" color="secondary" variant="tonal">
                              <v-icon>{{ item.raw.sub_menu_icon || 'mdi-menu-right' }}</v-icon>
                            </v-avatar>
                          </template>
                          <v-list-item-title class="font-weight-medium">
                            {{ item.raw.display }}
                          </v-list-item-title>
                          <v-list-item-subtitle>{{ item.raw.sub_menu_name_en }}</v-list-item-subtitle> -->
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>

                </v-card-text>
              </v-card>

              <!-- Role Selection -->
              <v-row v-if="form.sub_menu_id">
                <v-col cols="12">
                  <v-select
                    v-model="form.role_id"
                    :items="roleOptions"
                    item-title="display"
                    item-value="id"
                    label="ເລືອກບົດບາດ *"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-key"
                    :rules="[rules.required]"
                    :loading="loadingRoles"
                    no-data-text="ບໍ່ມີຂໍ້ມູນບົດບາດ"
                    required
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
              </v-row>
 <!-- Permissions Section -->
              <v-card variant="tonal" class="mb-6 rounded-lg" v-if="form.role_id && form.sub_menu_id">
                <v-card-title class="pa-4 pb-2">
                  <v-icon color="primary" class="mr-2">mdi-lock-outline</v-icon>
                  <span class="text-h6 text-styles">ການອະນຸຍາດ</span>
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
                            {{ form.Del_Detail === 1 ? 'ອະນຸຍາດ' : 'ບໍ່ອະນຸຯາດ' }}
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
                            <span class="font-weight-medium">ເບິ່ງ</span>
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
                  :disabled="!isValid || !form.sub_menu_id || !form.role_id"
                  :loading="loading"
                  class="text-none font-weight-medium px-8"
                >
                  ເພີ່ມສິດ
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
import axios from '@/helpers/axios'
import { RoleDetailModel } from '~/models'
import { useRouter } from 'vue-router'
const route = useRoute()

const router = useRouter()
const formRef = ref()
const isValid = ref(true)
const loading = ref(false)
const loadingRoles = ref(false)
const loadingModules = ref(false)
const loadingMenus = ref(false)
const loadingSubmenus = ref(false)

// Form data
const form = ref<RoleDetailModel.RoleDetailResponse & { module_id: string; menu_id: string }>({
  module_id: '',
  menu_id: '',
  role_id: '',
  sub_menu_id: '',
  New_Detail: 0,
  Del_Detail: 0,
  Edit_Detail: 0,
  Auth_Detail: 0,
  View_Detail: 0,
})

// Dropdown options
const roleOptions = ref<Array<{ id: string | number; display: string; role_name_la: string }>>([])
const sidebarData = ref<any[]>([])

// Permission switches
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

// Validation rules
const rules = {
  required: (value: any) => !!value || 'ຈໍາເປັນຕ້ອງມີຂໍ້ມູນນີ້',
}

// Computed options
const moduleOptions = computed(() => {
  return sidebarData.value.map(module => ({
    module_Id: module.module_Id,
    display: `${module.module_Id} - ${module.module_name_la}`,
    module_name_la: module.module_name_la,
    module_name_en: module.module_name_en,
    module_icon: module.module_icon
  }))
})

const menuOptions = computed(() => {
  if (!form.value.module_id) return []
  
  const module = sidebarData.value.find(m => m.module_Id === form.value.module_id)
  return module?.main_menus.map((menu: any) => ({
    menu_id: menu.menu_id,
    display: `${menu.menu_id} - ${menu.menu_name_la}`,
    menu_name_la: menu.menu_name_la,
    menu_name_en: menu.menu_name_en,
    menu_icon: menu.menu_icon
  })) || []
})

const subMenuOptions = computed(() => {
  if (!form.value.menu_id) return []
  
  const module = sidebarData.value.find(m => m.module_Id === form.value.module_id)
  const menu = module?.main_menus.find((m: any) => m.menu_id === form.value.menu_id)
  return menu?.sub_menus.map((submenu: any) => ({
    sub_menu_id: submenu.sub_menu_id,
    display: `${submenu.sub_menu_id} - ${submenu.sub_menu_name_la}`,
    sub_menu_name_la: submenu.sub_menu_name_la,
    sub_menu_name_en: submenu.sub_menu_name_en,
    sub_menu_icon: submenu.sub_menu_icon,
    functions: submenu.functions || []
  })) || []
})

// const functionOptions = computed(() => {
//   if (!form.value.sub_menu_id) return []
  
//   const module = sidebarData.value.find(m => m.module_Id === form.value.module_id)
//   const menu = module?.main_menus.find((m: any) => m.menu_id === form.value.menu_id)
//   const submenu = menu?.sub_menus.find((sm: any) => sm.sub_menu_id === form.value.sub_menu_id)
//   return submenu?.functions.map((func: any) => ({
//     function_id: func.function_id,
//     display: `${func.function_id} - ${func.description_la}`,
//     description_la: func.description_la,
//     description_en: func.description_en
//   })) || []
// })




// Event handlers
const onModuleChange = () => {
  form.value.menu_id = ''
  form.value.sub_menu_id = ''
  form.value.role_id = ''
  resetPermissions()
}

const onMenuChange = () => {
  form.value.sub_menu_id = ''
  form.value.role_id = ''
  resetPermissions()
}

const onSubMenuChange = () => {
  form.value.role_id = ''
  resetPermissions()
}

const resetPermissions = () => {
  permissions.new = false
  permissions.delete = false
  permissions.edit = false
  permissions.auth = false
  permissions.view = false
  form.value.New_Detail = 0
  form.value.Del_Detail = 0
  form.value.Edit_Detail = 0
  form.value.Auth_Detail = 0
  form.value.View_Detail = 0
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
        id: role.role_id,
        display: `${role.role_id} - ${role.role_name_la}`,
        role_name_la: role.role_name_la
      }))
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນບົດບາດ', 'error', 'mdi-alert-circle')
  } finally {
    loadingRoles.value = false
  }
}

// Fetch sidebar data
const fetchSidebarData = async () => {
  loadingModules.value = true
  loadingMenus.value = true
  loadingSubmenus.value = true
  try {
    const res = await axios.get('/api/module/all/', {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 200) {
      sidebarData.value = res.data
    }
  } catch (error) {
    console.error('Error fetching sidebar data:', error)
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນໂມດູນ', 'error', 'mdi-alert-circle')
  } finally {
    loadingModules.value = false
    loadingMenus.value = false
    loadingSubmenus.value = false
  }
}

// Update permission values
const updatePermission = (field: keyof RoleDetailModel.RoleDetailResponse, value: boolean) => {
  form.value[field] = value ? 1 : 0
}

// Submit form
const submitForm = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const payload = {
      role_id: form.value.role_id,
      sub_menu_id: form.value.sub_menu_id,
      New_Detail: form.value.New_Detail,
      Del_Detail: form.value.Del_Detail,
      Edit_Detail: form.value.Edit_Detail,
      Auth_Detail: form.value.Auth_Detail,
      View_Detail: form.value.View_Detail,
    }

    const res = await axios.post('/api/role-details/', payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    
    if (res.status === 201) {
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
        showSnackbar('ສ້າງສິດຜູ້ນໍາໃຊ້ສໍາເລັດແລ້ວ!', 'success', 'mdi-check-circle')
        setTimeout(() => {
          resetForm()
        }, 1500)
      }
    }
  } catch (error: any) {
    console.error('Error creating role detail:', error)
    
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
    module_id: '',
    menu_id: '',
    role_id: '',
    sub_menu_id: '',
    New_Detail: 0,
    Del_Detail: 0,
    Edit_Detail: 0,
    Auth_Detail: 0,
    View_Detail: 0,
  }
  resetPermissions()
  formRef.value?.resetValidation()
}

// Go back
const goBack = () => {
  router.back()
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    fetchRoles(),
    fetchSidebarData()
  ])
  // Set default role_id from query if present
  if (route.query.role_id) {
    form.value.role_id = String(route.query.role_id)
  }
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

:deep(.v-list-item) {
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.08);
}

:deep(.v-list-item:last-child) {
  border-bottom: none;
}

:deep(.v-list-item:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.v-card[variant="tonal"] {
  background-color: rgba(var(--v-theme-surface-variant), 0.3) !important;
}
</style>