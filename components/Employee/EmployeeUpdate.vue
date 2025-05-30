<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="0" class="rounded-xl border">
          <v-card-title class="pa-8 pb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="28">mdi-account-edit</v-icon>
              <h2 class="text-h5 font-weight-bold mb-1 text-styles">
                ແກ້ໄຂພະນັກງານ
              </h2>
            </div>
          </v-card-title>
          <v-card-text class="pa-8 pt-0">
            <v-form v-model="formValid" ref="formRef" @submit.prevent="submitForm">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.employee_id"
                    label="ລະຫັດພະນັກງານ *"
                    variant="outlined"
                    :rules="[rules.required, rules.maxLength(20)]"
                    disabled
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.user_id"
                    :items="userOptions"
                    item-title="display"
                    item-value="user_id"
                    label="ຜູ້ໃຊ້"
                    variant="outlined"
                    clearable
                    :loading="loadingUsers"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <v-list-item-title>{{ item.raw.display }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.raw.user_email }}</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.employee_name_la"
                    label="ຊື່ພະນັກງານ (ລາວ) *"
                    variant="outlined"
                    :rules="[rules.required, rules.maxLength(250)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.employee_name_en"
                    label="ຊື່ພະນັກງານ (ອັງກິດ)"
                    variant="outlined"
                    :rules="[rules.maxLength(250)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.gender"
                    :items="genderOptions"
                    item-title="text"
                    item-value="value"
                    label="ເພດ"
                    variant="outlined"
                    clearable
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.date_of_birth"
                    label="ວັນເດືອນປີເກີດ"
                    type="date"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.national_id"
                    label="ເລກບັດປະຈຳຕົວ"
                    variant="outlined"
                    :rules="[rules.maxLength(20)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.phone_number"
                    label="ເບີໂທລະສັບ"
                    variant="outlined"
                    :rules="[rules.maxLength(15)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.email"
                    label="ອີເມວ"
                    variant="outlined"
                    :rules="[rules.email, rules.maxLength(100)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="form.div_id"
                    :items="divisionOptions"
                    item-title="display"
                    item-value="div_id"
                    label="ພະແນກ *"
                    variant="outlined"
                    :rules="[rules.required]"
                    :loading="loadingDivisions"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.position_code"
                    label="ລະຫັດຕຳແໜ່ງ"
                    variant="outlined"
                    :rules="[rules.maxLength(10)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.hire_date"
                    label="ວັນທີ່ເລີ່ມວຽກ"
                    type="date"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <div v-if="existingPhoto" class="mb-2">
                    <v-img
                      :src="`${baseUrl}${existingPhoto}`"
                      width="100"
                      height="100"
                      cover
                      class="rounded"
                    />
                    <v-btn
                      variant="text"
                      color="error"
                      @click="clearExistingPhoto"
                    >
                      ລຶບຮູບ
                    </v-btn>
                  </div>
                  <v-file-input
                    v-model="form.employee_photo"
                    label="ຮູບພະນັກງານ"
                    accept="image/*"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    :rules="[rules.imageSize]"
                    show-size
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <div v-if="existingSignature" class="mb-2">
                    <v-img
                      :src="`${baseUrl}${existingSignature}`"
                      width="100"
                      height="100"
                      cover
                      class="rounded"
                    />
                    <v-btn
                      variant="text"
                      color="error"
                      @click="clearExistingSignature"
                    >
                      ລຶບລາຍເຊັນ
                    </v-btn>
                  </div>
                  <v-file-input
                    v-model="form.employee_signature"
                    label="ລາຍເຊັນ"
                    accept="image/*"
                    variant="outlined"
                    prepend-icon="mdi-draw"
                    :rules="[rules.imageSize]"
                    show-size
                  />
                </v-col>
              </v-row>
              <div class="d-flex gap-3 justify-end mt-4">
                <v-btn
                  variant="outlined"
                  size="large"
                  prepend-icon="mdi-arrow-left"
                  @click="goBack"
                  class="text-none"
                >
                  ກັບຄືນ
                </v-btn>
                <v-btn
                  type="submit"
                  color="primary"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-content-save"
                  :loading="loading"
                  class="text-none"
                >
                  ບັນທຶກ
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const formValid = ref(true)
const loading = ref(false)
const loadingUsers = ref(false)
const loadingDivisions = ref(false)
const baseUrl = ref('http://localhost:8000') // Adjust to your backend URL
const existingPhoto = ref<string | null>(null)
const existingSignature = ref<string | null>(null)

const form = ref({
  employee_id: '',
  user_id: null,
  employee_name_la: '',
  employee_name_en: '',
  gender: null,
  date_of_birth: null,
  national_id: '',
  address_la: '',
  address_en: '',
  phone_number: '',
  email: '',
  position_code: '',
  div_id: null,
  employee_photo: null,
  employee_signature: null,
  hire_date: null,
  employment_status: 'A'
})

const userOptions = ref<any[]>([])
const divisionOptions = ref<any[]>([])
const genderOptions = [
  { text: 'ຊາຍ', value: 'M' },
  { text: 'ຍິງ', value: 'F' }
]

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle'
})

const rules = {
  required: (value: any) => !!value || 'ຈໍາເປັນຕ້ອງມີຂໍ້ມູນນີ້',
  maxLength: (max: number) => (value: string) => (!value || value.length <= max) || `ຕ້ອງບໍ່ເກີນ ${max} ຕົວອັກສອນ`,
  email: (value: string) => !value || /.+@.+\..+/.test(value) || 'ອີເມວບໍ່ຖືກຕ້ອງ',
  imageSize: (value: File[]) => !value || !value[0] || value[0].size < 2 * 1024 * 1024 || 'ຮູບຕ້ອງມີຂະໜາດນ້ອຍກວ່າ 2MB'
}
const fetchEmployee = async () => {
  loading.value = true
  try {
    // Use query instead of params
    const employeeId = route.query.employee_id
    if (!employeeId) {
      showSnackbar('ບໍ່ພົບລະຫັດພະນັກງານ', 'error', 'mdi-alert-circle')
      loading.value = false
      return
    }
    const res = await axios.get(`/api/employees/${employeeId}/`)
    if (res.status === 200) {
      form.value = {
        ...res.data,
        user_id: res.data.user_id || null,
        div_id: res.data.div_id || null,
        date_of_birth: res.data.date_of_birth ? res.data.date_of_birth.split('T')[0] : null,
        hire_date: res.data.hire_date ? res.data.hire_date.split('T')[0] : null,
        employee_photo: null,
        employee_signature: null
      }
      existingPhoto.value = res.data.employee_photo
      existingSignature.value = res.data.employee_signature
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນພະນັກງານ', 'error', 'mdi-alert-circle')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    const res = await axios.get('/api/users/')
    if (res.status === 200) {
      userOptions.value = res.data.map((user: any) => ({
        user_id: user.user_id,
        display: `${user.user_id} - ${user.user_name}`,
        user_email: user.user_email
      }))
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນຜູ້ໃຊ້', 'error', 'mdi-alert-circle')
  } finally {
    loadingUsers.value = false
  }
}

const fetchDivisions = async () => {
  loadingDivisions.value = true
  try {
    const res = await axios.get('/api/divisions/')
    if (res.status === 200) {
      divisionOptions.value = res.data.map((div: any) => ({
        div_id: div.div_id,
        display: `${div.div_id} - ${div.division_name_la}`
      }))
    }
  } catch (error) {
    showSnackbar('ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນພະແນກ', 'error', 'mdi-alert-circle')
  } finally {
    loadingDivisions.value = false
  }
}

const clearExistingPhoto = () => {
  existingPhoto.value = null
  form.value.employee_photo = null
}

const clearExistingSignature = () => {
  existingSignature.value = null
  form.value.employee_signature = null
}

const submitForm = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('employee_id', form.value.employee_id)
    if (form.value.user_id) formData.append('user_id', form.value.user_id)
    formData.append('employee_name_la', form.value.employee_name_la)
    if (form.value.employee_name_en) formData.append('employee_name_en', form.value.employee_name_en)
    if (form.value.gender) formData.append('gender', form.value.gender)
    if (form.value.date_of_birth) formData.append('date_of_birth', form.value.date_of_birth)
    if (form.value.national_id) formData.append('national_id', form.value.national_id)
    if (form.value.address_la) formData.append('address_la', form.value.address_la)
    if (form.value.address_en) formData.append('address_en', form.value.address_en)
    if (form.value.phone_number) formData.append('phone_number', form.value.phone_number)
    if (form.value.email) formData.append('email', form.value.email)
    if (form.value.position_code) formData.append('position_code', form.value.position_code)
    if (form.value.div_id) formData.append('div_id', form.value.div_id)
    if (form.value.employee_photo && form.value.employee_photo[0]) {
      formData.append('employee_photo', form.value.employee_photo[0])
    } else if (!existingPhoto.value) {
      formData.append('employee_photo', '')
    }
    if (form.value.employee_signature && form.value.employee_signature[0]) {
      formData.append('employee_signature', form.value.employee_signature[0])
    } else if (!existingSignature.value) {
      formData.append('employee_signature', '')
    }
    if (form.value.hire_date) formData.append('hire_date', form.value.hire_date)
    formData.append('employment_status', form.value.employment_status)

    const res = await axios.put(`/api/employees/${form.value.employee_id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.status === 200) {
      showSnackbar('ແກ້ໄຂພະນັກງານສຳເລັດ', 'success', 'mdi-check-circle')
      setTimeout(() => router.push({ name: 'employee-read' }), 1500)
    }
  } catch (error: any) {
    showSnackbar(
      error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂພະນັກງານ',
      'error',
      'mdi-alert-circle'
    )
  } finally {
    loading.value = false
  }
}

const showSnackbar = (message: string, color: string, icon: string) => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.icon = icon
  snackbar.value.show = true
}

const goBack = () => {
  router.push({ name: 'employee-read' })
}

onMounted(async () => {
  await Promise.all([fetchEmployee(), fetchUsers(), fetchDivisions()])
})
</script>

<style scoped>
.text-styles {
  font-family: 'Noto Sans Lao', sans-serif;
}

:deep(.v-field__outline) {
  border-radius: 8px;
}

:deep(.v-card) {
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}
</style>