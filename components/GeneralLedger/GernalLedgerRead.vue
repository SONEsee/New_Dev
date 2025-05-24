<template>
  <v-container>
    <v-card>
      <v-card-title>
        GL Master Records
        <v-spacer />
        <v-btn color="success" variant="elevated" @click="goPath('/glmaster/create')">
          <v-icon left>mdi-plus</v-icon>
          Create New
        </v-btn>
      </v-card-title>

      <!-- Filters -->
      <v-card-subtitle>
        <v-row align="center" class="px-4">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filter.gl_code"
              label="GL Code contains"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filter.glType"
              :items="typeOptions"
              label="Type"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filter.category"
              :items="categoryOptions"
              label="Category"
              clearable
            />
          </v-col>
          <v-col cols="12" md="3" class="text-right">
            <v-btn color="primary" @click="fetchData">
              Apply Filter
            </v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <v-data-table
        :headers="headers"
        :items="items"
        class="elevation-1"
      >
        <!-- GL Code -->
        <template #item.gl_code="{ item }">
          {{ item.gl_code }}
        </template>

        <!-- Description (English) -->
        <template #item.gl_Desc_en="{ item }">
          {{ item.gl_Desc_en }}
        </template>

        <!-- Type -->
        <template #item.glType="{ item }">
          {{ item.glType }}
        </template>

        <!-- Category -->
        <template #item.category="{ item }">
          {{ item.category }}
        </template>

        <!-- Record Status Chip -->
        <template #item.Record_Status="{ item }">
          <v-chip
            small
            :color="item.Record_Status === 'E' ? 'green' : 'grey'"
            class="text-white"
            title="Status"
          >
            {{ item.Record_Status === 'E' ? 'Enabled' : 'Disabled' }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn icon variant="text" @click="goPath(`/glmaster/update?id=${item.glid}`)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" @click="deleteRecord(item.glid)">
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/helpers/axios'
import { GLMasterResponse } from '~/models/glmaster'

const router = useRouter()
const items = ref<GLMasterResponse[]>([])

// Filter state
const filter = ref({ gl_code: '', glType: '', category: '' })

// Compute select options from loaded data
const typeOptions = computed<string[]>(() =>
  Array.from(new Set(items.value.map(i => i.glType).filter(v => v !== null))) as string[]
)
const categoryOptions = computed<string[]>(() =>
  Array.from(new Set(items.value.map(i => i.category).filter(v => v !== null))) as string[]
)

const headers = [
  { title: 'Code',       key: 'gl_code'      },
  { title: 'Description',key: 'gl_Desc_en'   },
  { title: 'Type',       key: 'glType'       },
  { title: 'Category',   key: 'category'     },
  { title: 'Status',     key: 'Record_Status'},
  { title: 'Actions',    key: 'actions', sortable: false }
]

function goPath(path: string) {
  router.push(path)
}

async function fetchData() {
  // Build query params
  const params: Record<string, string> = {}
  if (filter.value.gl_code) params.gl_code = filter.value.gl_code
  if (filter.value.glType)  params.glType = filter.value.glType
  if (filter.value.category) params.category = filter.value.category

  const { data } = await axios.get<GLMasterResponse[]>('api/gl-master/', {
    params,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  items.value = data
}

async function deleteRecord(id: number) {
  if (!window.confirm(`Delete GL Master #${id}?`)) return
  await axios.delete(`api/gl-master/${id}/`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  await fetchData()
}

onMounted(fetchData)
</script>