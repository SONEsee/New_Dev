<template>
  <v-container>
    <v-card>
      <v-card-title>Currency List</v-card-title>
      <v-data-table :headers="headers" :items="items" class="elevation-1">
        <template #item.actions="{ item }">
          <v-btn color="primary" @click="goPath(`/currency/update?code=${item.ccy_code}`)">
            Update
          </v-btn>
        </template>
      </v-data-table>
      <v-btn class="mt-4" @click="fetchData" color="primary">Refresh</v-btn>
      <v-btn class="mt-4" color="primary" @click="goPath('/currency/create')">Create</v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/helpers/axios'
import { useRouter } from 'vue-router'
import { CurrencyModel } from '~/models'

const router = useRouter()
const items = ref<CurrencyModel.CurrencyResponse[]>([])

const headers = [
  { title: 'Currency Code', key: 'ccy_code' },
  { title: 'Name (EN)', key: 'Ccy_Name_en' },
  { title: 'Country', key: 'Country' },
  { title: 'Decimals', key: 'Ccy_Decimals' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const goPath = (path: string) => {
  router.push(path)
}

const fetchData = async () => {
  const res = await axios.get<CurrencyModel.CurrencyResponse[]>('api/currencies/', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  items.value = res.data
}

onMounted(fetchData)
</script>
