<template>
  <v-container>
    <v-card>
      <v-card-title>All Role Details</v-card-title>
      <v-btn @click="goPath('/roledetail/create')" color="primary">Create</v-btn>

      <v-data-table
        :headers="headers"
        :items="items"
        class="elevation-1"
        item-value="role_id"
      >
        <template #item.actions="{ item }">
          <v-btn
            color="primary"
            @click="goPath(`/roledetail/update?role_id=${item.role_id}&fun_id=${item.function_id}`)"
          >
            Update
          </v-btn>
          
        </template>
      </v-data-table>

      <v-btn @click="fetchData" class="mt-4" color="primary">Refresh</v-btn>

    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/helpers/axios'
import { RoleDetailModel } from '~/models'
import { useRouter } from 'vue-router'

const router = useRouter()
const items = ref<RoleDetailModel.RoleDetailResponse[]>([])

const headers = [
  { title: 'Role ID', key: 'role_id' },
  { title: 'Function ID', key: 'function_id' },
  { title: 'New', key: 'New_Detail' },
  { title: 'Del', key: 'Del_Detail' },
  { title: 'Edit', key: 'Edit_Detail' },
  { title: 'Auth', key: 'Auth_Detail' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchData = async () => {
  const res = await axios.get<RoleDetailModel.RoleDetailResponse[]>('api/role-details', {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  if (res.status === 200) {
    items.value = res.data
  }
}

const goPath = (path: string) => {
  router.push(path)
}

onMounted(fetchData)
</script>
