<template>
  <v-container>
    <v-card class="pa-6 max-w-xl mx-auto">
      <v-card-title>Update Exchange Rate</v-card-title>
      <v-form @submit.prevent="updateForm" v-model="isValid">
        <v-text-field v-model="form.ccy_code" label="Currency Code" disabled />
        <v-text-field v-model="form.Buy_Rate" label="Buy Rate" type="number" />
        <v-text-field v-model="form.Sale_Rate" label="Sale Rate" type="number" />
        <v-select
          v-model="form.INT_Auth_Status"
          :items="['A', 'P', 'R']"
          label="Internal Auth Status"
          clearable
        />
        <v-select
          v-model="form.Auth_Status"
          :items="['A', 'P', 'R']"
          label="Final Auth Status"
          clearable
        />
        <v-btn type="submit" color="primary" :disabled="!isValid">Update</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/helpers/axios'
import { ExcRateModel } from '~/models'

const route = useRoute()
const id = route.query.id as string

const isValid = ref(true)
const form = ref<ExcRateModel.ExcRateResponse>({
  id: 0,
  ccy_code: '',
  Buy_Rate: '',
  Sale_Rate: '',
  INT_Auth_Status: '',
  Auth_Status: '',
  Maker_Id: '',
  Checker_Id: null,
  Maker_DT_Stamp: new Date(),
  Checker_DT_Stamp: null,
})

const loadData = async () => {
  const res = await axios.get<ExcRateModel.ExcRateResponse>(`api/exc-rate/${id}/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  form.value = res.data
}

const updateForm = async () => {
  await axios.put(`api/exc-rate/${id}/`, form.value, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  alert('Exchange rate updated!')
}

onMounted(loadData)
</script>
