<template>
  <v-container fluid class="pa-6">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="0" class="rounded-xl border">
          <v-card-title class="pa-8 pb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-3" size="28">mdi-account-plus</v-icon>
              <h2 class="text-h5 font-weight-bold mb-1 text-styles">
                ສ້າງພະນັກງານໃໝ່
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
                    placeholder="ຕົວຢ່າງ: EMP001"
                    variant="outlined"
                    :rules="[rules.required, rules.maxLength(20)]"
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
                  </v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.employee_name_la"
                    label="ຊື່ພະນັກງານ (ລາວ) *"
                    placeholder="ຕົວຢ່າງ: ສຸລິກາ ສຸລິນ"
                    variant="outlined"
                    :rules="[rules.required, rules.maxLength(250)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.employee_name_en"
                    label="ຊື່ພະນັກງານ (ອັງກິດ)"
                    placeholder="ຕົວຢ່າງ: Sulika Sulin"
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
                    placeholder="ຕົວຢ່າງ: 1234567890123"
                    variant="outlined"
                    :rules="[rules.maxLength(20)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.phone_number"
                    label="ເບີໂທລະສັບ"
                    placeholder="ຕົວຢ່າງ: 020 1234 5678"
                    variant="outlined"
                    :rules="[rules.maxLength(15)]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.email"
                    label="ອີເມວ"
                    placeholder="ຕົວຢ່າງ: 2T0Qw@example.com"
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
                    placeholder="ຕົວຢ່າງ: POS001"
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
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'

const router = useRouter()
const formRef = ref()
const formValid = ref(true)
const loading = ref(false)
const loadingUsers = ref(false)
const loadingDivisions = ref(false)

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
    }
    if (form.value.employee_signature && form.value.employee_signature[0]) {
      formData.append('employee_signature', form.value.employee_signature[0])
    }
    if (form.value.hire_date) formData.append('hire_date', form.value.hire_date)
    formData.append('employment_status', form.value.employment_status)

    const res = await axios.post('/api/employees/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.status === 201) {
      showSnackbar('ສ້າງພະນັກງານສຳເລັດ', 'success', 'mdi-check-circle')
      setTimeout(() => router.push({ name: 'employee' }), 1500)
    }
  } catch (error: any) {
    showSnackbar(
      error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງພະນັກງານ',
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
  router.push({ name: 'employee' })
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchDivisions()])
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