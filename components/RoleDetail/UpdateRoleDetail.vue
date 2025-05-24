<template>
  <v-container>
    <v-card class="pa-6 max-w-xl mx-auto">
      <v-card-title>Update Role Detail</v-card-title>
      <v-form @submit.prevent="updateForm" v-model="isValid">
        <v-text-field v-model="form.role_id" label="Role ID" disabled />
        <v-text-field v-model="form.function_id" label="Function ID" disabled />
        <v-text-field v-model="form.New_Detail" label="New" type="number" />
        <v-text-field v-model="form.Del_Detail" label="Delete" type="number" />
        <v-text-field v-model="form.Edit_Detail" label="Edit" type="number" />
        <v-text-field v-model="form.Auth_Detail" label="Authorize" type="number" />
        <v-btn type="submit" color="primary" :disabled="!isValid">Update</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>



<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/helpers/axios'
import { RoleDetailModel } from '~/models'

const route = useRoute()
const role_id = route.query.role_id as string
const function_id = route.query.fun_id as string

const form = ref<RoleDetailModel.RoleDetailResponse>({
  role_id: '',
  function_id: '',
  New_Detail: 0,
  Del_Detail: 0,
  Edit_Detail: 0,
  Auth_Detail: 0,
})

const isValid = ref(true)

const loadData = async () => {
  const res = await axios.get<RoleDetailModel.RoleDetailResponse>(
    `api/role-details/single?role_id=${role_id}&function_id=${function_id}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  )
  if (res.status === 200) {
    form.value = res.data
  }
}

const updateForm = async () => {
  await axios.put(
  `api/v1/role-details/update/?role_id=${role_id}&function_id=${function_id}`,
  form.value,
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
)
  alert('Role detail updated successfully')
}

onMounted(loadData)
</script>
