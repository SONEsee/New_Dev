<template>
  <v-container>
    <v-card class="pa-6 max-w-2xl mx-auto">
      <v-card-title>Update GL Master</v-card-title>
      <v-form @submit.prevent="updateForm" v-model="isValid">
        <v-text-field v-model="form.glid" label="ID" disabled />
        <v-text-field v-model="form.gl_code" label="ເລກບັນຊີ GL" required />
        <v-text-field v-model="form.gl_Desc_la" label="ຊື່ເລກບັນຊີ (LA)" />
        <v-text-field v-model="form.gl_Desc_en" label="ຊື່ເລກບັນຊີ (EN)" />
        <v-text-field v-model="form.glType" label="ຂັ້ນບັນຊີ" maxlength="1" />
        <v-text-field v-model="form.category" label="ປະເພດໝວດບັນຊີ" maxlength="1" />
        <v-text-field v-model="form.retal" label="ກໍານົດການຕີມູນຄ່າທາງດ້ານບັນຊີ" maxlength="1" />
        <v-text-field v-model="form.ccy_Res" label="ສາມາດໃຊ້ສະກຸນ" maxlength="1" />
        <v-text-field v-model="form.Res_ccy" label="ລະຫັດສະກຸນເງິນທີ່ຈະໃຊ້ກໍລະນີ" maxlength="1" />
        <v-text-field v-model="form.Allow_BackPeriodEntry" label="ເລືອກໃຫ້ສາມາດລົງຍ້ອນຫຼັງໄດ້" maxlength="1" />
        <v-text-field v-model="form.pl_Split_ReqD" label="ກຳນົດການຕີມູນຄ່າແບບ2ຮູບແບບ" maxlength="1" />
        <v-select v-model="form.Record_Status" label="ສະຖານະໃຊ້ງານ" :items="['E','D']" />
        <v-select v-model="form.Auth_Status" label="ສະຖານະອະນຸມັດ" :items="['A','P','R']" />
        <v-select v-model="form.Once_Auth" label="ສະຖານະເຄີຍຖືກອະນຸມັດ " :items="['Y','N']" />

        <v-btn
          type="submit"
          color="primary"
          :disabled="!isValid"
        >
          Update
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/helpers/axios'
import { GLMasterResponse } from '~/models/glmaster'

const route = useRoute()
const id = route.query.id as string

const isValid = ref(false)
const form = ref<GLMasterResponse>({
  glid: 0,
  gl_code: null,
  gl_Desc_la: null,
  gl_Desc_en: null,
  glType: null,
  category: null,
  retal: null,
  ccy_Res: null,
  Res_ccy: null,
  Allow_BackPeriodEntry: null,
  pl_Split_ReqD: null,
  Record_Status: null,
  Maker_DT_Stamp: null,
  Checker_DT_Stamp: null,
  Auth_Status: null,
  Once_Auth: null,
  Maker_Id: null,
  Checker_Id: null,
})

async function loadData() {
  const res = await axios.get<GLMasterResponse>(`api/gl-master/${id}/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  form.value = res.data
}

async function updateForm() {
  await axios.put(`api/gl-master/${id}/`, form.value, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  alert('GL Master updated successfully')
}

onMounted(loadData)
</script>
