<template>
  <v-container>
    <v-card>
      <v-card-title>
        ຈັດການຮອບວຽນບັນຊີ
        <v-spacer />
        <v-btn color="success" variant="elevated" @click="goPath('/fincycle/create')">
          <v-icon left>mdi-plus</v-icon>
          ເພີ່ມຮອບວຽນບັນຊີ
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="items"
        class="elevation-1"
      >
        <!-- StartDate as YYYY-MM-DD -->
        <template #item.StartDate="{ item }">
          {{ formatDate(item.StartDate) }}
        </template>

        <!-- EndDate as YYYY-MM-DD -->
        <template #item.EndDate="{ item }">
          {{ formatDate(item.EndDate) }}
        </template>

        <!-- Record_Status with title & dynamic text -->
        <template #item.Record_Status="{ item }">
          <v-chip
            small
            :color="item.Record_Status === 'A' ? 'green' : 'grey'"
            class="text-white"
            :title="'ສະຖານະການໃຊ້ງານ / Status'"
          >
            {{ item.Record_Status === 'A' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
          </v-chip>
        </template>

        <!-- Actions: update/delete icons without border -->
        <template #item.actions="{ item }">
          <v-btn icon variant="text" @click="goPath(`/fincycle/update?id=${item.fin_cycle}`)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" @click="deleteCycle(item.fin_cycle)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <v-btn
        class="mt-4"
        color="primary"
        variant="elevated"
        @click="fetchData"
      >
        Refresh
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import { FinCycleModel } from '~/models'

const router = useRouter()
const items = ref<FinCycleModel.FinCycleResponse[]>([])

const headers = [
  { title: 'ລະຫັດຮອບວຽນບັນຊີ',        key: 'fin_cycle'     },
  { title: 'ເນື້ອຫາ', key: 'cycle_Desc'    },
  { title: 'ເລີ່ມວັນເດືອນປີ',  key: 'StartDate'     },
  { title: 'ໝົດວັນເດືອນປີ',    key: 'EndDate'       },
  { title: 'ສະຖານະ',      key: 'Record_Status' },
  { title: 'Actions',     key: 'actions', sortable: false }
]

function goPath(path: string) {
  router.push(path)
}

async function fetchData() {
  const { data } = await axios.get<FinCycleModel.FinCycleResponse[]>('api/fin-cycles/', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  items.value = data
}

async function deleteCycle(id: string) {
  if (!window.confirm(`Delete cycle "${id}"?`)) return
  await axios.delete(`api/fin-cycles/${id}/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  await fetchData()
}

/** Format ISO date or Date object to "YYYY-MM-DD" */
function formatDate(d: string | Date | null): string {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

onMounted(fetchData)
</script>
