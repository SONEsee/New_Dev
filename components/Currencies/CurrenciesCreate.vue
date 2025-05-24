<template>
  <v-container>
    <v-card class="pa-6 max-w-2xl mx-auto">
      <v-card-title>Add New Currency</v-card-title>
      <v-form @submit.prevent="submitForm" v-model="isValid">
        <v-text-field v-model="form.ccy_code" label="Currency Code" required />
        <v-text-field v-model="form.Ccy_Name_la" label="Currency Name (Lao)" />
        <v-text-field v-model="form.Ccy_Name_en" label="Currency Name (English)" />
        <v-text-field v-model="form.Country" label="Country" />
        <v-text-field v-model="form.Ccy_Decimals" label="Decimal Places" type="number" required />
        <v-text-field v-model="form.ALT_Ccy_Code" label="ALT Code (e.g. $)" maxlength="2" />
        <v-select v-model="form.Record_Status" label="Record Status" :items="['E', 'D']" />
        <v-select v-model="form.Auth_Status" label="Authorization Status" :items="['A', 'P', 'R']" />
        <v-select v-model="form.Once_Auth" label="Once Auth" :items="['Y', 'N']" />
        <v-btn color="primary" type="submit" :disabled="!isValid">Submit</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from '@/helpers/axios'

const isValid = ref(true)
const form = ref({
  ccy_code: '',
  Ccy_Name_la: '',
  Ccy_Name_en: '',
  Country: '',
  Ccy_Decimals: '',
  ALT_Ccy_Code: '',
  Record_Status: null,
  Auth_Status: '',
  Once_Auth: ''
})

const submitForm = async () => {
  await axios.post('api/currencies/', form.value)
  alert('Currency added successfully')
}
</script>
