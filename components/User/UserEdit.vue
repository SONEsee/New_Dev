<template>
  <section class="pa-6">
    <v-container fluid class="pa-0">
      <!-- Header Section -->
      <v-row no-gutters>
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-6">
            <div>
              <h2 class="text-h5 font-weight-medium text-primary">
                {{ title }}
              </h2>
              <p class="text-body-2 text-medium-emphasis mt-1">
                ແກ້ໄຂຂໍ້ມູນສ່ວນຕົວ ແລະ ການຕັ້ງຄ່າບັນຊີຜູ້ໃຊ້
              </p>
            </div>
            <v-btn
              color="primary"
              variant="elevated"
              :loading="userStore.loading"
              :disabled="!isFormValid"
              @click="submitForm"
              class="px-8"
            >
              <v-icon start>mdi-content-save</v-icon>
              ບັນທຶກການປ່ຽນແປງ
            </v-btn>
          </div>
          <v-divider class="mb-8" />
        </v-col>
      </v-row>

      <!-- Main Content -->
      <v-form ref="form" v-model="isFormValid" @submit.prevent="submitForm">
        <v-row>
          <!-- Profile Image Section -->
          <v-col cols="12" md="4">
            <v-card variant="outlined" class="pa-6 text-center h-100">
              <div class="profile-section">
                <h3 class="text-h6 mb-4">ຮູບໂປຣໄຟລ້</h3>
                
                <div class="profile-avatar-container mb-4">
                  <v-avatar
                    size="160"
                    class="profile-avatar"
                    :class="{ 'avatar-hover': !userStore.loading }"
                    @click="!userStore.loading && openFile()"
                  >
                    <v-img
                      :src="getProfileImageUrl()"
                      :alt="`ຮູບໂປຣໄຟລ້ຂອງ ${userForm.user_name || 'ຜູ້ໃຊ້'}`"
                      cover
                    >
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon size="80" color="grey-lighten-2">
                            mdi-account-circle
                          </v-icon>
                        </div>
                      </template>
                    </v-img>
                    
                    <!-- Upload overlay -->
                    <div class="avatar-overlay">
                      <v-icon color="white" size="24">mdi-camera-plus</v-icon>
                    </div>
                  </v-avatar>
                </div>

                <v-btn
                  variant="outlined"
                  color="primary"
                  :disabled="userStore.loading"
                  @click="openFile"
                  class="mb-3"
                >
                  <v-icon start>mdi-cloud-upload</v-icon>
                  ປ່ຽນຮູບພາບ
                </v-btn>

                <p class="text-caption text-medium-emphasis">
                  ສະໜັບສະໜູນໄຟລ້: JPG, PNG, JPEG<br>
                  ຂະໜາດສູງສຸດ: 5MB
                </p>

                <input
                  ref="fileInput"
                  type="file"
                  style="display: none"
                  accept="image/jpeg,image/jpg,image/png"
                  @change="onFileChange"
                />
              </div>
            </v-card>
          </v-col>

          <!-- Form Fields Section -->
          <v-col cols="12" md="8">
            <v-card variant="outlined" class="pa-6">
              <h3 class="text-h6 mb-6">ຂໍ້ມູນຜູ້ໃຊ້</h3>
              
              <v-row>
                <!-- User ID -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="userForm.user_id"
                    label="ລະຫັດຜູ້ໃຊ້ / User ID"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    prepend-inner-icon="mdi-identifier"
                    class="mb-2"
                  />
                </v-col>

                <!-- Username -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="userForm.user_name"
                    label="ຊື່ຜູ້ໃຊ້ງານ / Username"
                    variant="outlined"
                    density="comfortable"
                    :rules="validationRules.required"
                    prepend-inner-icon="mdi-account"
                    class="mb-2"
                    required
                  />
                </v-col>

                <!-- Email -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="userForm.user_email"
                    label="ອີເມວ / Email"
                    variant="outlined"
                    density="comfortable"
                    :rules="validationRules.email"
                    prepend-inner-icon="mdi-email"
                    type="email"
                    class="mb-2"
                  />
                </v-col>

                <!-- Mobile -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="userForm.user_mobile"
                    label="ເບີໂທລະສັບ / Phone"
                    variant="outlined"
                    density="comfortable"
                    :rules="validationRules.required"
                    prepend-inner-icon="mdi-phone"
                    class="mb-2"
                    required
                  />
                </v-col>

                <!-- Department -->
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="userForm.div_id"
                    label="ພະແນກ / Department"
                    variant="outlined"
                    density="comfortable"
                    :items="departmentItems"
                    item-value="div_id"
                    item-title="division_name_la"
                    :rules="validationRules.required"
                    prepend-inner-icon="mdi-office-building"
                    no-filter
                    clearable
                    class="mb-2"
                    required
                  />
                </v-col>

                <!-- Role -->
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="userForm.Role_ID"
                    label="ສິດການເຂົ້ານຳໃຊ້ / Role"
                    variant="outlined"
                    density="comfortable"
                    :items="roleItems"
                    item-value="role_id"
                    item-title="role_name_la"
                    :rules="validationRules.required"
                    prepend-inner-icon="mdi-shield-account"
                    no-filter
                    clearable
                    class="mb-2"
                    required
                  />
                </v-col>

                <!-- Status -->
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="userForm.Auth_Status"
                    label="ສະຖານະການໃຊ້ງານ / Status"
                    variant="outlined"
                    density="comfortable"
                    :items="statusItems"
                    item-title="title"
                    item-value="value"
                    :rules="validationRules.required"
                    prepend-inner-icon="mdi-account-check"
                    class="mb-2"
                    required
                  />
                </v-col>

                <!-- Password -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="userForm.user_password"
                    label="ລະຫັດຜ່ານໃໝ່ / New Password"
                    variant="outlined"
                    density="comfortable"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    prepend-inner-icon="mdi-lock"
                    placeholder="ປ່ອຍວ່າງຖ້າບໍ່ຕ້ອງການປ່ຽນ"
                    class="mb-2"
                    :rules="passwordRules"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-form>

      <!-- Loading Overlay -->
      <v-overlay
        :model-value="userStore.loading"
        contained
        class="d-flex align-center justify-center"
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        />
      </v-overlay>
    </v-container>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { VForm } from 'vuetify/components'

// Stores
const userStore = UserStore()
const roleStore = RoleStore()
const categoryStore = UseCategoryStore()

// Route
const route = useRoute()
const user_id = route.query.user_id as string

// Refs
const form = ref<VForm>()
const fileInput = ref<HTMLInputElement>()
const isFormValid = ref(false)
const showPassword = ref(false)

// Constants
const title = ref("ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ງານ")
const defaultImage = "/assets/img/404.png" // fallback image

// Computed
const departmentItems = computed(() => categoryStore.categories || [])
const roleItems = computed(() => roleStore.respons_data_role || [])

const statusItems = [
  { title: 'ເປີດໃຊ້ງານ', value: 'A' },
  { title: 'ປິດໃຊ້ງານ', value: 'U' }
]

const userForm = computed({
  get() {
    return userStore.update_user_form
  },
  set(value) {
    userStore.update_user_form = value
  }
})

// Validation Rules
const validationRules = {
  required: [
    (v: string) => !!v || 'ກະລຸນາປ້ອນຂໍ້ມູນ'
  ],
  email: [
    (v: string) => {
      if (!v) return true // Email is optional
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return pattern.test(v) || 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ'
    }
  ]
}

const passwordRules = computed(() => {
  if (!userForm.value.user_password) return [] // Password is optional for updates
  
  return [
    (v: string) => v.length >= 6 || 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'
  ]
})

// Methods
const getProfileImageUrl = (): string => {
  const profileImage = userForm.value.profile_picture
  
  if (profileImage instanceof File) {
    return URL.createObjectURL(profileImage)
  }
  
  // Handle API response format (profile_picture vs profile_picture)
  const userDetail = userStore.respone_data_detail
  if (userDetail?.profile_picture) {
    return userDetail.profile_picture
  }
  
  if (typeof profileImage === 'string' && profileImage) {
    return profileImage
  }
  
  return defaultImage
}

const openFile = (): void => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const onFileChange = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files[0]) {
    const file = files[0]
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      CallSwal({
        title: "ຜິດພາດ",
        text: "ຂະໜາດໄຟລ້ເກີນ 5MB",
        icon: "error"
      })
      return
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      CallSwal({
        title: "ຌິດພາດ",
        text: "ປະເພດໄຟລ້ບໍ່ຖືກຕ້ອງ ກະລຸນາເລືອກໄຟລ້ JPG, PNG ຫຼື JPEG",
        icon: "error"
      })
      return
    }
    
    userForm.value.profile_picture = file
  }
}

const submitForm = async (): Promise<void> => {
  if (!form.value) return
  
  const { valid } = await form.value.validate()
  
  if (valid) {
    const confirmation = await CallSwal({
      icon: "warning",
      title: "ຢືນຢັນການແກ້ໄຂ",
      text: "ທ່ານຕ້ອງການບັນທຶກການປ່ຽນແປງນີ້ແມ່ນບໍ່?",
      showCancelButton: true,
      confirmButtonText: "ບັນທຶກ",
      cancelButtonText: "ຍົກເລີກ"
    })
    
    if (confirmation.isConfirmed) {
      await userStore.UpdateUser(user_id)
    }
  }
}

// Watch for user detail changes
watch(
  () => userStore.respone_data_detail,
  (newVal) => {
    if (newVal) {
      // Map API response to form fields
      userForm.value.user_id = newVal.user_id || ""
      userForm.value.user_name = newVal.user_name || ""
      userForm.value.user_email = newVal.user_email || ""
      userForm.value.user_mobile = newVal.user_mobile || ""
      
      // Handle division mapping
      userForm.value.div_id = typeof newVal.division === "object" 
        ? newVal.division?.div_id || ""
        : newVal.division || ""
      
      // Handle role mapping  
      userForm.value.Role_ID = newVal.role?.role_id || ""
      
      // Handle auth status mapping
      userForm.value.Auth_Status = newVal.Auth_Status || ""
      
      // Don't populate password field for security
      userForm.value.user_password = ""
    }
  },
  { immediate: true }
)

// Lifecycle
onMounted(() => {
  if (user_id) {
    userStore.GetdatadetailUser(user_id)
  }
  categoryStore.GetListData()
  roleStore.GetRole()
})
</script>

<style scoped>
.profile-section {
  position: relative;
}

.profile-avatar-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  transition: all 0.3s ease;
  cursor: pointer;
  border: 3px solid transparent;
}

.avatar-hover:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: scale(1.02);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-text-field,
.v-autocomplete,
.v-select {
  transition: all 0.2s ease;
}

.text-primary {
  color: rgb(var(--v-theme-primary)) !important;
}

.text-medium-emphasis {
  opacity: 0.7;
}
</style>