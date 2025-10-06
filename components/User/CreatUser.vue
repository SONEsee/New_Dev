<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

// Router
const router = useRouter()

// Stores
const categoryStore = UseCategoryStore()
const roleStore = RoleStore()

// Refs
const form = ref()
const fileInput = ref<HTMLInputElement>()
const isFormValid = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)

// Form data
const formData = ref({
  user_id: '',
  user_name: '',
  user_email: '',
  user_mobile: '',
  user_password: '',
  div_id: null as string | null,
  Role_ID: null as string | null,
  Auth_Status: 'U',
  profile_picture: null as File | null,
})

// Image preview
const imagePreview = ref<string>('')

// Computed
const departments = computed(() => categoryStore.categories || [])
const roles = computed(() => roleStore.respons_data_role || [])

// Validation Rules
const rules = {
  required: [(v: any) => !!v || 'ກະລຸນາປ້ອນຂໍ້ມູນ'],
  email: [
    (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'ຮູບແບບອີເມວບໍ່ຖືກຕ້ອງ'
  ],
  password: [
    (v: any) => !!v || 'ກະລຸນາປ້ອນລະຫັດຜ່ານ',
    (v: string) => (v && v.length >= 6) || 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ',
  ],
}

// Methods
const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      CallSwal({
        icon: 'error',
        title: 'ຜິດພາດ',
        text: 'ຂະໜາດໄຟລ້ເກີນ 5MB',
      })
      return
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      CallSwal({
        icon: 'error',
        title: 'ຜິດພາດ',
        text: 'ກະລຸນາເລືອກໄຟລ້ JPG, PNG ຫຼື JPEG',
      })
      return
    }
    
    formData.value.profile_picture = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const resetForm = () => {
  form.value?.reset()
  formData.value = {
    user_id: '',
    user_name: '',
    user_email: '',
    user_mobile: '',
    user_password: '',
    div_id: null,
    Role_ID: null,
    Auth_Status: 'U',
    profile_picture: null,
  }
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const goBack = () => {
  router.push('/user')
}

const submitForm = async () => {
  if (!form.value) return
  
  const { valid } = await form.value.validate()
  
  if (!valid) {
    CallSwal({
      icon: 'warning',
      title: 'ຂໍ້ມູນບໍ່ຄົບຖ້ວນ',
      text: 'ກະລຸນາກວດສອບແລະປ້ອນຂໍ້ມູນໃຫ້ຖືກຕ້ອງ',
    })
    return
  }
  
  const confirmation = await CallSwal({
    icon: 'question',
    title: 'ຢືນຢັນການສ້າງບັນຊີ',
    text: 'ທ່ານຕ້ອງການສ້າງບັນຊີຜູ້ໃຊ້ນີ້ແມ່ນບໍ່?',
    showCancelButton: true,
    confirmButtonText: 'ສ້າງບັນຊີ',
    cancelButtonText: 'ຍົກເລີກ',
  })
  
  if (confirmation.isConfirmed) {
    await createUser()
  }
}

const createUser = async () => {
  try {
    isLoading.value = true
    
    // Create FormData for file upload
    const data = new FormData()
    
    // Append all form fields
    data.append('user_id', formData.value.user_id)
    data.append('user_name', formData.value.user_name)
    data.append('user_password', formData.value.user_password)
    data.append('user_mobile', formData.value.user_mobile)
    data.append('Auth_Status', formData.value.Auth_Status)
    
    if (formData.value.user_email) {
      data.append('user_email', formData.value.user_email)
    }
    
    if (formData.value.div_id) {
      data.append('div_id', formData.value.div_id)
    }
    
    if (formData.value.Role_ID) {
      data.append('Role_ID', formData.value.Role_ID)
    }
    
    if (formData.value.profile_picture) {
      data.append('profile_picture', formData.value.profile_picture)
    }
    
    // Send request
    const response = await axios.post('/api/users/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    // Handle both response formats:
    // 1. Wrapped: { success: true, message: '...', data: {...} }
    // 2. Direct: { user_id: '...', user_name: '...', ... }
    const isSuccess = response.data.success !== false
    
    if (isSuccess) {
      await CallSwal({
        icon: 'success',
        title: 'ສຳເລັດ',
        text: response.data.message || 'ສ້າງບັນຊີຜູ້ໃຊ້ງານສຳເລັດແລ້ວ',
        timer: 2000,
        showConfirmButton: false,
      })
      
      resetForm()
      router.push('/user')
    } else {
      throw new Error(response.data.message || 'ເກີດຂໍ້ຜິດພາດ')
    }
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    let errorMessage = 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຜູ້ໃຊ້ງານ'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0]
      errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
    }
    
    await CallSwal({
      icon: 'error',
      title: 'ຜິດພາດ',
      text: errorMessage,
    })
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await categoryStore.GetListData()
  await roleStore.GetRole()
})
</script>

<template>
  <div class="create-user-page text-styles">
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="page-header">
          <h1 class="text-styles page-title">ສ້າງຂໍ້ມູນຜູ້ໃຊ້ງານໃໝ່</h1>
          <p class="text-styles page-subtitle">ສ້າງບັນຊີຜູ້ໃຊ້ງານໃໝ່ສຳລັບລະບົບບັນຊີ</p>
        </div>
      </v-col>
    </v-row>

    <!-- Main Form -->
    <v-form ref="form" v-model="isFormValid" @submit.prevent="submitForm">
      <v-row>
        <!-- Profile Picture Section -->
        <v-col cols="12" md="4">
          <v-card class="profile-card" elevation="0">
            <v-card-text class="text-center pa-6">
              <h3 class="text-styles card-title">ຮູບໂປຣໄຟລ້</h3>
              
              <div class="avatar-container" @click="openFileDialog">
                <v-avatar size="160" class="profile-avatar">
                  <v-img
                    v-if="imagePreview"
                    :src="imagePreview"
                    alt="ຮູບໂປຣໄຟລ້"
                    cover
                  />
                  <v-icon v-else size="80" color="grey-lighten-2">
                    mdi-account-circle
                  </v-icon>
                </v-avatar>
                <div class="avatar-overlay">
                  <v-icon color="white" size="32">mdi-camera</v-icon>
                </div>
              </div>

              <input
                ref="fileInput"
                type="file"
                hidden
                accept="image/jpeg,image/jpg,image/png"
                @change="onFileSelect"
              />

              <v-btn
                color="primary"
                variant="outlined"
                class="text-styles mt-4"
                @click="openFileDialog"
                :disabled="isLoading"
              >
                <v-icon start>mdi-upload</v-icon>
                ເລືອກຮູບພາບ
              </v-btn>

              <p class="text-styles upload-info">
                JPG, PNG, JPEG<br>
                ສູງສຸດ 5MB
              </p>

              <v-chip
                v-if="formData.profile_picture"
                color="success"
                size="small"
                class="text-styles mt-2"
              >
                <v-icon start size="small">mdi-check</v-icon>
                {{ formData.profile_picture.name }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Form Fields Section -->
        <v-col cols="12" md="8">
          <v-card class="form-card" elevation="0">
            <v-card-text class="pa-6">
              <h3 class="text-styles card-title">ຂໍ້ມູນຜູ້ໃຊ້</h3>
              
              <v-row class="mt-4">
                <!-- User ID -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.user_id"
                    label="ລະຫັດຜູ້ໃຊ້ *"
                    variant="outlined"
                    density="comfortable"
                    :rules="rules.required"
                    prepend-inner-icon="mdi-identifier"
                    :disabled="isLoading"
                    class="text-styles"
                    counter="20"
                    maxlength="20"
                  />
                </v-col>

                <!-- User Name -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.user_name"
                    label="ຊື່ຜູ້ໃຊ້ງານ *"
                    variant="outlined"
                    density="comfortable"
                    :rules="rules.required"
                    prepend-inner-icon="mdi-account"
                    :disabled="isLoading"
                    class="text-styles"
                  />
                </v-col>

                <!-- Email -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.user_email"
                    label="ອີເມວ"
                    variant="outlined"
                    density="comfortable"
                    :rules="rules.email"
                    prepend-inner-icon="mdi-email"
                    type="email"
                    :disabled="isLoading"
                    class="text-styles"
                  />
                </v-col>

                <!-- Mobile -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.user_mobile"
                    label="ເບີໂທລະສັບ *"
                    variant="outlined"
                    density="comfortable"
                    :rules="rules.required"
                    prepend-inner-icon="mdi-phone"
                    :disabled="isLoading"
                    class="text-styles"
                  />
                </v-col>

                <!-- Department -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="formData.div_id"
                    label="ພະແນກ *"
                    variant="outlined"
                    density="comfortable"
                    :items="departments"
                    item-value="div_id"
                    item-title="division_name_la"
                    :rules="rules.required"
                    prepend-inner-icon="mdi-office-building"
                    clearable
                    :disabled="isLoading"
                    class="text-styles"
                  />
                </v-col>

                <!-- Role -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="formData.Role_ID"
                    label="ສິດການນຳໃຊ້ *"
                    variant="outlined"
                    density="comfortable"
                    :items="roles"
                    item-value="role_id"
                    item-title="role_name_la"
                    :rules="rules.required"
                    prepend-inner-icon="mdi-shield-account"
                    clearable
                    :disabled="isLoading"
                    class="text-styles"
                  />
                </v-col>

                <!-- Auth Status -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.Auth_Status"
                    label="ສະຖານະອະນຸມັດ *"
                    variant="outlined"
                    density="comfortable"
                    :items="[
                      { value: 'A', title: 'ອະນຸມັດແລ້ວ' },
                      { value: 'U', title: 'ຍັງບໍ່ອະນຸມັດ' },
                    ]"
                    :rules="rules.required"
                    prepend-inner-icon="mdi-check-circle"
                    :disabled="isLoading"
                    class="text-styles"
                  />
                </v-col>

                <!-- Password -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.user_password"
                    label="ລະຫັດຜ່ານ *"
                    variant="outlined"
                    density="comfortable"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="rules.password"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                    :disabled="isLoading"
                    class="text-styles"
                  />
                </v-col>
              </v-row>
            </v-card-text>

            <!-- Actions -->
            <v-divider />
            <v-card-actions class="pa-6">
              <div class="text-styles required-note">
                * ຊ່ອງທີ່ຈຳເປັນຕ້ອງຕື້ມ
              </div>
              <v-spacer />
              <v-btn
                variant="text"
                @click="goBack"
                :disabled="isLoading"
                class="text-styles"
              >
                <v-icon start>mdi-arrow-left</v-icon>
                ກັບຄືນ
              </v-btn>
              <v-btn
                color="secondary"
                variant="outlined"
                @click="resetForm"
                :disabled="isLoading"
                class="text-styles"
              >
                <v-icon start>mdi-refresh</v-icon>
                ຣີເຊັດ
              </v-btn>
              <v-btn
                color="primary"
                :loading="isLoading"
                :disabled="!isFormValid"
                @click="submitForm"
                class="text-styles"
              >
                <v-icon start>mdi-content-save</v-icon>
                ບັນທຶກ
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<style scoped>
/* Text Styles */
.text-styles {
  font-family: 'Noto Sans Lao', 'Noto Sans', sans-serif;
  font-size: 0.95rem;
  color: #2c3e50;
  letter-spacing: 0.01em;
}

/* Page Layout */
.create-user-page {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 8px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

/* Cards */
.profile-card,
.form-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 16px;
}

/* Profile Section */
.avatar-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin: 24px 0;
}

.profile-avatar {
  border: 3px solid #e2e8f0;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.avatar-container:hover .profile-avatar {
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

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.upload-info {
  font-size: 0.85rem;
  color: #718096;
  margin-top: 12px;
  line-height: 1.6;
}

/* Form Elements */
.v-text-field,
.v-autocomplete,
.v-select {
  margin-bottom: 0;
}

.required-note {
  font-size: 0.85rem;
  color: #718096;
}

/* Buttons */
.v-btn {
  text-transform: none;
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 960px) {
  .create-user-page {
    padding: 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .profile-avatar {
    size: 140px;
  }
}

@media (max-width: 600px) {
  .create-user-page {
    padding: 12px;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .v-card-actions {
    flex-direction: column;
    gap: 8px;
  }

  .v-card-actions .v-btn {
    width: 100%;
  }

  .v-spacer {
    display: none;
  }
}

/* Smooth Transitions */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>