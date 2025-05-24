<template>
  <v-container>
    <v-card class="pa-6 max-w-2xl mx-auto">
      <v-card-title>Update Currency</v-card-title>
      <v-form @submit.prevent="updateForm" v-model="isValid">
        <v-text-field v-model="form.ccy_code" label="Currency Code" disabled />
        <v-text-field v-model="form.Ccy_Name_la" label="Currency Name (Lao)" />
        <v-text-field v-model="form.Ccy_Name_en" label="Currency Name (English)" />
        <v-text-field v-model="form.Country" label="Country" />
        <v-text-field v-model="form.Ccy_Decimals" label="Decimal Places" type="number" />
        <v-text-field v-model="form.ALT_Ccy_Code" label="ALT Code" maxlength="2" />
        <v-select v-model="form.Record_Status" label="Record Status" :items="['E', 'D']" />
        <v-select v-model="form.Auth_Status" label="Authorization Status" :items="['A', 'P', 'R']" />
        <v-select v-model="form.Once_Auth" label="Once Auth" :items="['Y', 'N']" />
        <v-btn color="primary" type="submit" :disabled="!isValid">Update</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/helpers/axios'
import { CurrencyModel } from '@/models'

const route = useRoute()
const code = route.query.code as string

const isValid = ref(true)
const form = ref<CurrencyModel.CurrencyResponse>({
  ccy_code: '',
  Ccy_Name_la: '',
  Ccy_Name_en: '',
  Country: '',
  Ccy_Decimals: '',
  ALT_Ccy_Code: '',
  Record_Status: null,
  Auth_Status: '',
  Once_Auth: '',
  Maker_DT_Stamp: new Date(),
  Checker_DT_Stamp: null,
  Maker_Id: '',
  Checker_Id: null,
})

const loadData = async () => {
  const res = await axios.get<CurrencyModel.CurrencyResponse>(`api/currencies/${code}/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  form.value = res.data
}

const updateForm = async () => {
  await axios.put(`api/currencies/${code}/`, form.value, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  alert('Currency updated successfully')
}

onMounted(loadData)
</script>
