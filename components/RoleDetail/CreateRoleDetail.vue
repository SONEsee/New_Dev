<template>
  <v-container>
    <v-card class="pa-6 max-w-xl mx-auto">
      <v-card-title>Create Role Detail</v-card-title>
      <v-form @submit.prevent="submitForm" v-model="isValid">
        <v-text-field v-model="form.role_id" label="Role ID" required />
        <v-text-field v-model="form.function_id" label="Function ID" required />
        <v-text-field v-model="form.New_Detail" label="New" type="number" />
        <v-text-field v-model="form.Del_Detail" label="Delete" type="number" />
        <v-text-field v-model="form.Edit_Detail" label="Edit" type="number" />
        <v-text-field v-model="form.Auth_Detail" label="Authorize" type="number" />
        <v-btn type="submit" color="primary" :disabled="!isValid">Create</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from '@/helpers/axios'
import { RoleDetailModel } from '~/models'

const isValid = ref(true)

const form = ref<RoleDetailModel.RoleDetailResponse>({
  role_id: '',
  function_id: '',
  New_Detail: 0,
  Del_Detail: 0,
  Edit_Detail: 0,
  Auth_Detail: 0,
})

const submitForm = async () => {
  const res = await axios.post('api/role-details', form.value, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (res.status === 201) {
    alert('Created successfully')
  }
}
</script>
