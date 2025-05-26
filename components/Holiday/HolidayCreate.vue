<script setup lang="ts">
import { ref } from 'vue'
import axios from '@/helpers/axios'
import { HolidayModel } from '~/models'

const isValid = ref(true)
const form = ref<Omit<HolidayModel.HolidayResponse, 'Maker_DT_Stamp' | 'Checker_DT_Stamp' | 'Maker_Id' | 'Checker_Id'>>({
  lcl_holiday_id: '',
  HYear: '',
  HMonth: '',
  HDate: new Date(),
  Holiday_List: null,
  Record_Status: null,
  Auth_Status: null,
  Once_Auth: null,
})

const submitForm = async () => {
  await axios.post('api/lcl_holiday/', form.value)
  alert('Holiday added successfully')
}
</script>
<template>
  <v-container>
    <v-card class="pa-6 max-w-2xl mx-auto">
      <v-card-title>Add New Holiday</v-card-title>
      <v-form @submit.prevent="submitForm" v-model="isValid">
        <v-text-field v-model="form.lcl_holiday_id" label="Holiday ID" required />
        <v-text-field v-model="form.HYear" label="Year (YYYY)" maxlength="4" />
        <v-text-field v-model="form.HMonth" label="Month" />
        <v-text-field v-model="form.HDate" label="Holiday Date" type="date" />
        <v-select v-model="form.Holiday_List" label="Holiday Type" :items="['N', 'W']" />
        <v-select v-model="form.Record_Status" label="Record Status" :items="['E', 'D']" />
        <v-select v-model="form.Auth_Status" label="Authorization Status" :items="['A', 'P', 'R']" />
        <v-select v-model="form.Once_Auth" label="Once Auth" :items="['Y', 'N']" />
        <v-btn color="primary" type="submit" :disabled="!isValid">Submit</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>