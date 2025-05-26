<template>
  <v-container>
    <v-card>
      <v-card-title>Exchange Rate List</v-card-title>
      <v-data-table :headers="headers" :items="items" class="elevation-1">
        <template #item.actions="{ item }">
          <v-btn color="primary" @click="goPath(`/excrate/update?id=${item.id}`)">Update</v-btn>
        </template>
      </v-data-table>
      <v-btn class="mt-4" color="primary" @click="fetchData">Refresh</v-btn>
     <v-btn color="primary" @click="goPath('/excrate/create')">Create</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/helpers/axios'
import { useRouter } from 'vue-router'
import { ExcRateModel } from '~/models'

const router = useRouter()
const items = ref<ExcRateModel.ExcRateResponse[]>([])

const headers = [
  { title: 'Currency', key: 'ccy_code' },
  { title: 'Buy Rate', key: 'Buy_Rate' },
  { title: 'Sale Rate', key: 'Sale_Rate' },
  { title: 'INT Status', key: 'INT_Auth_Status' },
  { title: 'Auth Status', key: 'Auth_Status' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const goPath = (path: string) => {
  router.push(path)
}

const fetchData = async () => {
  const res = await axios.get<ExcRateModel.ExcRateResponse[]>('api/exc-rate/', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  items.value = res.data
}

onMounted(fetchData)
</script>
