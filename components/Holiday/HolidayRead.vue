<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/helpers/axios'
import { useRouter } from 'vue-router'
import { HolidayModel } from '~/models'

const router = useRouter()
const items = ref<HolidayModel.HolidayResponse[]>([])

const headers = [
  { title: 'ID', key: 'lcl_holiday_id' },
  { title: 'Year', key: 'HYear' },
  { title: 'Month', key: 'HMonth' },
  { title: 'Date', key: 'HDate' },
  { title: 'Type', key: 'Holiday_List' },
  { title: 'Status', key: 'Record_Status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const goPath = (path: string) => {
  router.push(path)
}

const fetchData = async () => {
  const res = await axios.get<HolidayModel.HolidayResponse[]>('api/lcl_holiday/', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  items.value = res.data
}

onMounted(fetchData)
</script>
<template>
  <v-container>
    <v-card>
      <v-card-title>Holiday List</v-card-title>
      <v-data-table :headers="headers" :items="items" class="elevation-1">
        <template #item.actions="{ item }">
          <v-btn color="primary" @click="goPath(`/holiday/update?id=${item.lcl_holiday_id}`)">
            Update
          </v-btn>
        </template>
      </v-data-table>
      <v-btn class="mt-4" @click="fetchData" color="primary">Refresh</v-btn>
      <v-btn class="mt-4" color="primary" @click="goPath('/holiday/create')">Create</v-btn>
    </v-card>
  </v-container>
</template>
