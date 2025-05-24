<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/helpers/axios'
import { HolidayModel } from '~/models'

const route = useRoute()
const id = route.query.id as string

const isValid = ref(true)
const form = ref<HolidayModel.HolidayResponse>({
  lcl_holiday_id: '',
  HYear: '',
  HMonth: '',
  HDate: new Date(),
  Holiday_List: null,
  Record_Status: null,
  Maker_DT_Stamp: null,
  Checker_DT_Stamp: null,
  Auth_Status: null,
  Once_Auth: null,
  Maker_Id: null,
  Checker_Id: null,
})

const loadData = async () => {
  const res = await axios.get<HolidayModel.HolidayResponse>(`api/lcl_holiday/${id}/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  form.value = res.data
}

const updateForm = async () => {
  await axios.put(`api/lcl_holiday/${id}/`, form.value, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  alert('Holiday updated successfully')
}

onMounted(loadData)
</script>
<template>
  <v-container>
    <v-card class="pa-6 max-w-2xl mx-auto">
      <v-card-title>Update Holiday</v-card-title>
      <v-form @submit.prevent="updateForm" v-model="isValid">
        <v-text-field v-model="form.lcl_holiday_id" label="Holiday ID" disabled />
        <v-text-field v-model="form.HYear" label="Year" />
        <v-text-field v-model="form.HMonth" label="Month" />
        <v-text-field v-model="form.HDate" label="Holiday Date" type="date" />
        <v-select v-model="form.Holiday_List" label="Holiday Type" :items="['N', 'W']" />
        <v-select v-model="form.Record_Status" label="Record Status" :items="['E', 'D']" />
        <v-select v-model="form.Auth_Status" label="Authorization Status" :items="['A', 'P', 'R']" />
        <v-select v-model="form.Once_Auth" label="Once Auth" :items="['Y', 'N']" />
        <v-btn color="primary" type="submit" :disabled="!isValid">Update</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
