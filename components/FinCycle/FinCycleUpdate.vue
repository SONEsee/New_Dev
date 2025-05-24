<template>
  <v-container>
    <v-card class="pa-6 max-w-2xl mx-auto">
      <v-card-title>Update Financial Cycle</v-card-title>
      <v-form @submit.prevent="updateForm" v-model="isValid">
        <v-text-field
          v-model="form.fin_cycle"
          label="Cycle Code"
          disabled
        />
        <v-text-field
          v-model="form.cycle_Desc"
          label="Description"
        />
        <v-text-field
          v-model="form.StartDate"
          label="Start Date"
          type="date"
        />
        <v-text-field
          v-model="form.EndDate"
          label="End Date"
          type="date"
        />
        <v-select
          v-model="form.Record_Status"
          label="Record Status"
          :items="['E','D']"
        />
        <v-select
          v-model="form.Auth_Status"
          label="Authorization Status"
          :items="['A','P','R']"
        />
        <v-select
          v-model="form.Once_Auth"
          label="Once Auth"
          :items="['Y','N']"
        />

        <v-btn
          color="primary"
          type="submit"
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
import { FinCycleModel } from '~/models'

const route = useRoute()
const id = route.query.id as string

const isValid = ref(false)
// Fully typed with your interface:
const form = ref<FinCycleModel.FinCycleResponse>({
  fin_cycle:      '',
  cycle_Desc:     '',
  StartDate:      '',   // will come back as ISO date strings
  EndDate:        '',
  Record_Status:  '',
  Maker_DT_Stamp: null,
  Checker_DT_Stamp:null,
  Auth_Status:    '',
  Once_Auth:      '',
  Maker_Id:       '',
  Checker_Id:     null,
})

async function loadData() {
  const res = await axios.get<FinCycleModel.FinCycleResponse>(`api/fin-cycles/${id}/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  form.value = res.data
}

async function updateForm() {
  await axios.put(`api/fin-cycles/${id}/`, form.value, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  alert('Cycle updated successfully')
}

onMounted(loadData)
</script>
