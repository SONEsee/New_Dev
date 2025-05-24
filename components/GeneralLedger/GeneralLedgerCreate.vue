<template>
  <v-container>
    <v-card class="pa-6 max-w-2xl mx-auto">
      <v-card-title>ເລກບັນຊີ GL</v-card-title>
      <v-form @submit.prevent="submitForm" v-model="isValid">
        <v-text-field v-model="form.gl_code" label="ເລກບັນຊີ GL" maxlength="7" required />
        <v-text-field v-model="form.gl_Desc_la" label="ຊື່ເລກບັນຊີ (LA)" />
        <v-text-field v-model="form.gl_Desc_en" label="ຊື່ເລກບັນຊີ (EN)" />
        <v-select v-model="form.glType" label="ຂັ້ນບັນຊີ" 
        :items="[
            {title:'ຂັ້ນ I',value:'1'},
            {title:'ຂັ້ນ II',value:'2'},
            {title:'ຂັ້ນ III',value:'3'},
            {title:'ຂັ້ນ IV',value:'4'},
            {title:'ຂັ້ນ V',value:'5'}
        ]"

        />
        <v-select v-model="form.category" label="ປະເພດໝວດບັນຊີ"
             :items="[
            {title:'ຊັບສິນ',value:'1'},
            {title:'ໜີ້ສິນ',value:'2'},
            {title:'ທຶນ',value:'3'},
            {title:'ລາຍຈ່າຍ',value:'4'},
            {title:'ລາຍຮັບ',value:'5'},
            {title:'ນອກພັງ',value:'6'},
            {title:'ບັນຊີເງົາ',value:'8'},
            {title:'ບັນຊີນອກພັງ',value:'9'},

        ]" />
        <v-select v-model="form.retal" label="ກໍານົດການຕີມູນຄ່າທາງດ້ານບັນຊີ" :items="['Y','N']" />
        <v-select v-model="form.ccy_Res" label="ສາມາດໃຊ້ສະກຸນ" :items="['S','F','A']" />
        <v-select v-model="form.Res_ccy" label="ລະຫັດສະກຸນເງິນທີ່ຈະໃຊ້ກໍລະນີ" :items="['LAK','USD','THB']" />
        <v-select v-model="form.Allow_BackPeriodEntry" label="ເລືອກໃຫ້ສາມາດລົງຍ້ອນຫຼັງໄດ້" :items="['Y','N']" />
        <v-select v-model="form.pl_Split_ReqD" label="ກຳນົດການຕີມູນຄ່າແບບ2ຮູບແບບ" :items="['Y','N']" />
        <v-select v-model="form.Record_Status" label="ສະຖານະໃຊ້ງານ" :items="['O','C']" />
        <v-select v-model="form.Auth_Status" label="ສະຖານະອະນຸມັດ" :items="['A','U']" />
        <v-select v-model="form.Once_Auth" label="ສະຖານະເຄີຍຖືກອະນຸມັດ " :items="['Y','N']" />

        <v-btn
          type="submit"
          color="primary"
          :disabled="!isValid"
        >
          Create
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from '@/helpers/axios'
import { GLMasterResponse } from '~/models/glmaster'

// Omit server-generated fields
type CreateGLMaster = Omit<
  GLMasterResponse,
  'glid' | 'Maker_DT_Stamp' | 'Checker_DT_Stamp' | 'Maker_Id' | 'Checker_Id'
>

const isValid = ref(false)
const form = ref<CreateGLMaster>({
  gl_code: '',
  gl_Desc_la: '',
  gl_Desc_en: '',
  glType: '',
  category: '',
  retal: '',
  ccy_Res: '',
  Res_ccy: '',
  Allow_BackPeriodEntry: '',
  pl_Split_ReqD: '',
  Record_Status: '',
  Auth_Status: '',
  Once_Auth: '',
})

async function submitForm() {
  await axios.post('api/gl-master/', form.value)
  alert('GL Master created successfully')
}
</script>