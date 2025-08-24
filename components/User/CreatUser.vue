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
                ສ້າງບັນຊີຜູ້ໃຊ້ໃໝ່ສຳລັບລະບົບບັນຊີ
              </p>
            </div>
            <div class="d-flex ga-3">
              <v-btn
                variant="outlined"
                color="secondary"
                @click="resetForm"
                :disabled="userStore.loading"
                class="px-6"
              >
                <v-icon start>mdi-refresh</v-icon>
                ຣີເຊັດ
              </v-btn>
              <v-btn
                color="primary"
                variant="elevated"
                :loading="userStore.loading"
                :disabled="!isFormValid"
                @click="submitForm"
                class="px-8"
              >
                <v-icon start>mdi-account-plus</v-icon>
                ສ້າງບັນຊີ
              </v-btn>
            </div>
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
                    size="180"
                    class="profile-avatar"
                    :class="{ 'avatar-hover': !userStore.loading }"
                    @click="!userStore.loading && openFile()"
                  >
                    <v-img
                      :src="getProfileImageUrl()"
                      :alt="`ຮູບໂປຣໄຟລ້ຂອງ ${createForm.user_name || 'ຜູ້ໃຊ້ໃໝ່'}`"
                      cover
                    >
                      <template v-slot:placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon size="80" color="grey-lighten-2">
                            mdi-account-plus
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
                  ເລືອກຮູບພາບ
                </v-btn>

                <p class="text-caption text-medium-emphasis">
                  ສະໜັບສະໜູນໄຟລ້: JPG, PNG, JPEG<br>
                  ຂະໜາດສູງສຸດ: 5MB<br>
                  ແນະນຳ: 400x400 pixels
                </p>

                <input
                  ref="fileInput"
                  type="file"
                  style="display: none"
                  accept="image/jpeg,image/jpg,image/png"
                  @change="onFileChange"
                />

                <!-- File Info Display -->
                <v-chip
                  v-if="createForm.profile_image instanceof File"
                  color="success"
                  size="small"
                  class="mt-2"
                >
                  <v-icon start size="small">mdi-check</v-icon>
                  {{ createForm.profile_image.name }}
                </v-chip>
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
                    v-model="createForm.user_id"
                    label="ລະຫັດຜູ້ໃຊ້ / User ID *"
                    variant="outlined"
                    density="comfortable"
                    :rules="validationRules.required"
                    prepend-inner-icon="mdi-identifier"
                    class="mb-2"
                    required
                    :counter="20"
                    maxlength="20"
                    @input="createForm.user_id = $event.target.value.toUpperCase()"
                  />
                </v-col>

                <!-- Username -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="createForm.user_name"
                    label="ຊື່ຜູ້ໃຊ້ງານ / Username *"
                    variant="outlined"
                    density="comfortable"
                    :rules="validationRules.required"
                    prepend-inner-icon="mdi-account"
                    class="mb-2"
                    required
                    :counter="100"
                    maxlength="100"
                  />
                </v-col>

                <!-- Email -->
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="createForm.user_email"
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
                    v-model="createForm.user_mobile"
                    label="ເບີໂທລະສັບ / Phone *"
                    variant="outlined"
                    density="comfortable"
                    :rules="validationRules.mobile"
                    prepend-inner-icon="mdi-phone"
                    class="mb-2"
                    required
                    :counter="20"
                    maxlength="20"
                  />
                </v-col>

                <!-- Department -->
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="createForm.div_id"
                    label="ພະແນກ / Department *"
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
                    v-model="createForm.Role_ID"
                    label="ສິດການເຂົ້ານຳໃຊ້ / Role *"
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
                    v-model="createForm.Auth_Status"
                    label="ສະຖານະການໃຊ້ງານ / Status *"
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
                    v-model="createForm.user_password"
                    label="ລະຫັດຜ່ານ / Password *"
                    variant="outlined"
                    density="comfortable"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    prepend-inner-icon="mdi-lock"
                    class="mb-2"
                    :rules="passwordRules"
                    required
                    :counter="50"
                    maxlength="50"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </v-col>
              </v-row>

              <!-- Form Actions -->
              <v-divider class="my-4" />
              
              <div class="d-flex justify-space-between align-center">
                <div class="text-caption text-medium-emphasis">
                  * ຊ່ອງທີ່ຈຳເປັນຕ້ອງຕື້ມ
                </div>
                
                <div class="d-flex ga-3">
                  <v-btn
                    variant="text"
                    @click="goBack"
                    :disabled="userStore.loading"
                  >
                    <v-icon start>mdi-arrow-left</v-icon>
                    ກັບຄືນ
                  </v-btn>
                  
                  <v-btn
                    color="primary"
                    :loading="userStore.loading"
                    :disabled="!isFormValid"
                    @click="submitForm"
                  >
                    <v-icon start>mdi-content-save</v-icon>
                    ບັນທຶກ
                  </v-btn>
                </div>
              </div>
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
        <v-card class="pa-4 text-center" width="300">
          <v-progress-circular
            color="primary"
            indeterminate
            size="64"
            class="mb-4"
          />
          <h4 class="text-h6 mb-2">ກຳລັງສ້າງບັນຊີ</h4>
          <p class="text-body-2 text-medium-emphasis">
            ກະລຸນາລໍຖ້າ...
          </p>
        </v-card>
      </v-overlay>
    </v-container>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'

// Stores
const userStore = UserStore()
const roleStore = RoleStore()
const categoryStore = UseCategoryStore()

// Router
const router = useRouter()

// Refs
const form = ref<VForm>()
const fileInput = ref<HTMLInputElement>()
const isFormValid = ref(false)
const showPassword = ref(false)

// Constants
const title = ref("ສ້າງຂໍ້ມູນຜູ້ໃຊ້ງານໃໝ່")
const defaultImage = "/assets/img/404.png"

// Computed
const departmentItems = computed(() => categoryStore.categories || [])
const roleItems = computed(() => roleStore.respons_data_role || [])

const statusItems = [
  { title: 'ເປີດໃຊ້ງານ', value: 'A' },
  { title: 'ປິດໃຊ້ງານ', value: 'U' }
]

const createForm = computed({
  get() {
    return userStore.create_user_form
  },
  set(value) {
    userStore.create_user_form = value
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
  ],
  mobile: [
    (v: string) => !!v || 'ກະລຸນາປ້ອນເບີໂທລະສັບ',
    (v: string) => {
      if (!v) return true
      const pattern = /^[0-9+\-\s()]+$/
      return pattern.test(v) || 'ເບີໂທລະສັບບໍ່ຖືກຕ້ອງ'
    }
  ]
}

const passwordRules = computed(() => [
  (v: string) => !!v || 'ກະລຸນາປ້ອນລະຫັດຜ່ານ',
  (v: string) => (v && v.length >= 6) || 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ',
  (v: string) => (v && v.length <= 50) || 'ລະຫັດຜ່ານບໍ່ຄວນເກີນ 50 ຕົວອັກສອນ'
])

// Methods
const getProfileImageUrl = (): string => {
  const profileImage = createForm.value.profile_image
  
  if (profileImage instanceof File) {
    return URL.createObjectURL(profileImage)
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
        title: "ຜິດພາດ",
        text: "ປະເພດໄຟລ້ບໍ່ຖືກຕ້ອງ ກະລຸນາເລືອກໄຟລ້ JPG, PNG ຫຼື JPEG",
        icon: "error"
      })
      return
    }
    
    createForm.value.profile_image = file
  }
}

const resetForm = (): void => {
  form.value?.reset()
  userStore.resetCreateForm()
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const goBack = (): void => {
  router.push('/user')
}

const submitForm = async (): Promise<void> => {
  if (!form.value) return
  
  const { valid } = await form.value.validate()
  
  if (valid) {
    const confirmation = await CallSwal({
      icon: "question",
      title: "ຢືນຢັນການສ້າງບັນຊີ",
      text: "ທ່ານຕ້ອງການສ້າງບັນຊີຜູ້ໃຊ້ນີ້ແມ່ນບໍ່?",
      showCancelButton: true,
      confirmButtonText: "ສ້າງບັນຊີ",
      cancelButtonText: "ຍົກເລີກ"
    })
    
    if (confirmation.isConfirmed) {
      const success = await userStore.CreatUser()
      
      if (success) {
        resetForm()
      }
    }
  } else {
    CallSwal({
      title: "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ",
      text: "ກະລຸນາກວດສອບແລະປ້ອນຂໍ້ມູນໃຫ້ຖືກຕ້ອງ",
      icon: "warning"
    })
  }
}

// Lifecycle
onMounted(() => {
  categoryStore.GetListData()
  roleStore.GetRole()
  
  // Set default status to active
  if (!createForm.value.Auth_Status) {
    createForm.value.Auth_Status = 'A'
  }
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
  background-color: #f5f5f5;
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

/* Form field focus effects */
.v-field:focus-within {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

/* Required field indicator */
.v-label:after {
  content: " *";
  color: rgb(var(--v-theme-error));
}

/* File upload area */
.profile-avatar {
  position: relative;
  overflow: hidden;
}

.profile-avatar:hover {
  cursor: pointer;
}

/* Loading overlay customization */
.v-overlay .v-card {
  backdrop-filter: blur(4px);
  background-color: rgba(255, 255, 255, 0.95);
}

/* Success indicators */
.v-chip.success {
  animation: pulse-success 1s ease-in-out;
}

@keyframes pulse-success {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Form validation styles */
.v-input--error .v-field {
  border-color: rgb(var(--v-theme-error)) !important;
}

.v-input--error .v-field__input {
  background-color: rgba(var(--v-theme-error), 0.05);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .profile-avatar {
    size: 140px;
  }
  
  .d-flex.ga-3 {
    flex-direction: column;
    gap: 8px !important;
  }
  
  .d-flex.ga-3 .v-btn {
    width: 100%;
  }
}
</style>