<template>
  <v-container>
    <v-card class="pa-6 max-w-2xl mx-auto">
      <v-card-title>Create Financial Cycle</v-card-title>
      <v-form @submit.prevent="submitForm" v-model="isValid">
        <v-text-field
          v-model="form.fin_cycle"
          label="Cycle Code"
          required
        />
        <v-text-field
          v-model="form.cycle_Desc"
          label="Description"
        />
        <v-text-field
          v-model="form.StartDate"
          label="Start Date"
          type="date"
          required
        />
        <v-text-field
          v-model="form.EndDate"
          label="End Date"
          type="date"
          required
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
import { FinCycleModel } from '~/models'

// For creation, we omit read-only and generated fields:
type CreateFinCyclePayload = Omit<
  FinCycleModel.FinCycleResponse,
  'Maker_DT_Stamp' | 'Checker_DT_Stamp' | 'Maker_Id' | 'Checker_Id'
>

const isValid = ref(false)
const form = ref<CreateFinCyclePayload>({
  fin_cycle:    '',
  cycle_Desc:   '',
  StartDate:    '',   // YYYY-MM-DD
  EndDate:      '',
  Record_Status:'',
  Auth_Status:  '',
  Once_Auth:    '',
})

async function submitForm() {
  await axios.post('api/fin-cycles/', form.value)
  alert('Cycle created successfully')
}
</script>
