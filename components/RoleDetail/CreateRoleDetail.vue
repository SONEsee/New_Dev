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

          <!-- Form -->
          <v-card-text class="pa-8 pt-0">
            <v-form @submit.prevent="submitForm" v-model="isValid" ref="formRef">
              <v-row>
                <!-- Role Selection -->
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
                    class="mb-2"
                    @update:model-value="onRoleChange"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar size="32" color="primary" variant="tonal">
                            <v-icon>mdi-account-circle</v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.raw.role_name_la }}</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>

              <!-- Module/Menu Selection Section -->
              <v-card variant="tonal" class="mb-6 rounded-lg" v-if="form.role_id">
                <v-card-title class="pa-4 pb-2">
                  <v-icon color="info" class="mr-2">mdi-view-dashboard</v-icon>
                  <span class="text-h6 text-styles">ເລືອກໂມດູນແລະເມນູ</span>
                </v-card-title>
                <v-card-text class="pa-4 pt-2">
                  <v-row>
                    <!-- Module Selection -->
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="selectedModule"
                        :items="moduleOptions"
                        item-title="display"
                        item-value="module_Id"
                        label="ເລືອກໂມດູນ *"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-view-module"
                        :rules="[rules.required]"
                        :loading="loadingSidebar"
                        no-data-text="ບໍ່ມີຂໍ້ມູນໂມດູນ"
                        required
                        clearable
                        @update:model-value="onModuleChange"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template #prepend>
                              <v-avatar size="32" color="info" variant="tonal">
                                <v-icon>{{ item.raw.module_icon || 'mdi-cube' }}</v-icon>
                              </v-avatar>
                            </template>
                            <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.raw.module_name_en }}</v-list-item-subtitle>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>

                    <!-- Main Menu Selection -->
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="selectedMainMenu"
                        :items="mainMenuOptions"
                        item-title="display"
                        item-value="menu_id"
                        label="ເລືອກເມນູຫຼັກ *"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-menu"
                        :rules="[rules.required]"
                        :disabled="!selectedModule"
                        no-data-text="ກະລຸນາເລືອກໂມດູນກ່ອນ"
                        required
                        clearable
                        @update:model-value="onMainMenuChange"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template #prepend>
                              <v-avatar size="32" color="secondary" variant="tonal">
                                <v-icon>{{ item.raw.menu_icon || 'mdi-menu-open' }}</v-icon>
                              </v-avatar>
                            </template>
                            <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.raw.menu_name_en }}</v-list-item-subtitle>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>

                    <!-- Sub Menu Selection -->
                    <v-col cols="12" md="4">
                      <v-select
                        v-model="selectedSubMenu"
                        :items="subMenuOptions"
                        item-title="display"
                        item-value="sub_menu_id"
                        label="ເລືອກເມນູຍ່ອຍ *"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-menu-down"
                        :rules="[rules.required]"
                        :disabled="!selectedMainMenu"
                        no-data-text="ກະລຸນາເລືອກເມນູຫຼັກກ່ອນ"
                        required
                        clearable
                        @update:model-value="onSubMenuChange"
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template #prepend>
                              <v-avatar size="32" color="warning" variant="tonal">
                                <v-icon>{{ item.raw.sub_menu_icon || 'mdi-menu-right' }}</v-icon>
                              </v-avatar>
                            </template>
                            <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.raw.sub_menu_name_en }}</v-list-item-subtitle>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>

                  <!-- Function Selection (if available) -->
                  <v-row v-if="functionOptions.length > 0">
                    <v-col cols="12">
                      <v-select
                        v-model="form.function_id"
                        :items="functionOptions"
                        item-title="display"
                        item-value="function_id"
                        label="ເລືອກຟັງຊັນ (ຖ້າມີ)"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-function"
                        no-data-text="ບໍ່ມີຟັງຊັນໃນເມນູນີ້"
                        clearable
                      >
                        <template #item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template #prepend>
                              <v-avatar size="32" color="purple" variant="tonal">
                                <v-icon>mdi-cog</v-icon>
                              </v-avatar>
                            </template>
                            <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                            <v-list-item-subtitle>{{ item.raw.description_en }}</v-list-item-subtitle>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Permissions Section -->
              <v-card variant="tonal" class="mb-6 rounded-lg" v-if="selectedSubMenu">
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
                  :disabled="!isValid || !selectedSubMenu"
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
import { ref, reactive, onMounted, computed } from 'vue'
import axios from '@/helpers/axios'
import { RoleDetailModel } from '~/models'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref()
const isValid = ref(true)
const loading = ref(false)
const loadingRoles = ref(false)
const loadingSidebar = ref(false)

// Selection states
const selectedModule = ref('')
const selectedMainMenu = ref('')
const selectedSubMenu = ref('')

// Dropdown options
const roleOptions = ref<Array<{ id: string | number; display: string; role_name_la: string }>>([])
const sidebarData = ref<any[]>([])

// Form data
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

// Validation rules
const rules = {
  required: (value: any) => !!value || 'ຈໍາເປັນຕ້ອງມີຂໍ້ມູນນີ້',
}

// Computed options for dropdowns
const moduleOptions = computed(() => {
  return sidebarData.value.map(module => ({
    module_Id: module.module_Id,
    display: `${module.module_Id} - ${module.module_name_la}`,
    module_name_la: module.module_name_la,
    module_name_en: module.module_name_en,
    module_icon: module.module_icon,
    main_menus: module.main_menus
  }))
})

const mainMenuOptions = computed(() => {
  if (!selectedModule.value) return []
  
  const module = sidebarData.value.find(m => m.module_Id === selectedModule.value)
  if (!module) return []
  
  return module.main_menus.map((menu: any) => ({
    menu_id: menu.menu_id,
    display: `${menu.menu_id} - ${menu.menu_name_la}`,
    menu_name_la: menu.menu_name_la,
    menu_name_en: menu.menu_name_en,
    menu_icon: menu.menu_icon,
    sub_menus: menu.sub_menus
  }))
})

const subMenuOptions = computed(() => {
  if (!selectedModule.value || !selectedMainMenu.value) return []
  
  const module = sidebarData.value.find(m => m.module_Id === selectedModule.value)
  if (!module) return []
  
  const mainMenu = module.main_menus.find((m: any) => m.menu_id === selectedMainMenu.value)
  if (!mainMenu) return []
  
  return mainMenu.sub_menus.map((subMenu: any) => ({
    sub_menu_id: subMenu.sub_menu_id,
    display: `${subMenu.sub_menu_id} - ${subMenu.sub_menu_name_la}`,
    sub_menu_name_la: subMenu.sub_menu_name_la,
    sub_menu_name_en: subMenu.sub_menu_name_en,
    sub_menu_icon: subMenu.sub_menu_icon,
    functions: subMenu.functions
  }))
})

const functionOptions = computed(() => {
  if (!selectedModule.value || !selectedMainMenu.value || !selectedSubMenu.value) return []
  
  const module = sidebarData.value.find(m => m.module_Id === selectedModule.value)
  if (!module) return []
  
  const mainMenu = module.main_menus.find((m: any) => m.menu_id === selectedMainMenu.value)
  if (!mainMenu) return []
  
  const subMenu = mainMenu.sub_menus.find((s: any) => s.sub_menu_id === selectedSubMenu.value)
  if (!subMenu || !subMenu.functions) return []
  
  return subMenu.functions.map((func: any) => ({
    function_id: func.function_id,
    display: `${func.function_id} - ${func.description_la}`,
    description_la: func.description_la,
    description_en: func.description_en
  }))
})

// Event handlers
const onRoleChange = (roleId: string) => {
  // Reset selections when role changes
  selectedModule.value = ''
  selectedMainMenu.value = ''
  selectedSubMenu.value = ''
  form.value.function_id = ''
  form.value.sub_menu_id = ''
  
  if (roleId) {
    fetchSidebarData(roleId)
  }
}

const onModuleChange = () => {
  selectedMainMenu.value = ''
  selectedSubMenu.value = ''
  form.value.function_id = ''
  form.value.sub_menu_id = ''
}

const onMainMenuChange = () => {
  selectedSubMenu.value = ''
  form.value.function_id = ''
  form.value.sub_menu_id = ''
}

const onSubMenuChange = (subMenuId: string) => {
  form.value.sub_menu_id = subMenuId
  form.value.function_id = ''
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

// Fetch sidebar data based on selected role
const fetchSidebarData = async (roleId: string) => {
  loadingSidebar.value = true
  try {
    const res = await axios.get(`/api/role/${roleId}/sidebar/`, {
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
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນເມນູ', 'error', 'mdi-alert-circle')
  } finally {
    loadingSidebar.value = false
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
          text: 'ສ້າງສິດຼູ້ນໍາໃຊ້ສໍາເລັດແລ້ວ!',
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
    sub_menu_id: '',
    New_Detail: 0,
    Del_Detail: 0,
    Edit_Detail: 0,
    Auth_Detail: 0,
    View_Detail: 0,
  }
  
  selectedModule.value = ''
  selectedMainMenu.value = ''
  selectedSubMenu.value = ''
  
  permissions.new = false
  permissions.delete = false
  permissions.edit = false
  permissions.auth = false
  permissions.view = false
  
  sidebarData.value = []
  formRef.value?.resetValidation()
}

// Go back
const goBack = () => {
  router.back()
}

// Initialize data on component mount
onMounted(async () => {
  await fetchRoles()
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