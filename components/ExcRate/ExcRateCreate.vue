<template>
  <v-container>
    <v-card class="pa-6 max-w-xl mx-auto">
      <v-card-title>Add Exchange Rate</v-card-title>
      <v-form @submit.prevent="submitForm" v-model="isValid">
        <v-text-field v-model="form.ccy_code" label="Currency Code" required />
        <v-text-field v-model="form.Buy_Rate" label="Buy Rate" type="number" required />
        <v-text-field v-model="form.Sale_Rate" label="Sale Rate" type="number" required />
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
        <v-btn type="submit" color="primary" :disabled="!isValid">Create</v-btn>
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
  Buy_Rate: '',
  Sale_Rate: '',
  INT_Auth_Status: '',
  Auth_Status: '',
})

const submitForm = async () => {
  await axios.post('api/exc-rate/', form.value)
  alert('Exchange rate added!')
}
</script>
