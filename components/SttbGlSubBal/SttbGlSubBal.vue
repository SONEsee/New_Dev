<script setup lang="ts">
import axios from "@/helpers/axios";

const title = "ຈັດການຂໍ້ມູນຍອດເຫຼືອບັນຊີຍ່ອຍ GL Sub Balance";
const header = [
  { title: "ລະຫັດບັນຊີຍ່ອຍ", value: "GL_SUB" },
  { title: "ສະກຸນເງິນ", value: "CCY_CODE" },
  { title: "ປີບັນຊີ", value: "FIN_YEAR" },
  { title: "ເດືອນ", value: "PERIOD_CODE" },
  { title: "ຍອດເຫຼືອໜີ້ (LCY)", value: "DR_BAL_LCY" },
  { title: "ຍອດເຫຼືອມີ (LCY)", value: "CR_BAL_LCY" },
  { title: "ຈັດການ", value: "action" },
];
const isloding = ref(false);
const item = ref([
  {
    GL_SUB_BAL_ID: 1,
    GL_SUB: "1001001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "01",
    DR_MOV: 8000000.00,
    CR_MOV: 0.00,
    DR_MOV_LCY: 8000000.00,
    CR_MOV_LCY: 0.00,
    DR_BAL: 8000000.00,
    CR_BAL: 0.00,
    DR_BAL_LCY: 8000000.00,
    CR_BAL_LCY: 0.00,
    OPEN_DR_BAL: 5000000.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 5000000.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_SUB_BAL_ID: 2,
    GL_SUB: "1001001002",
    CCY_CODE: "USD",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "01",
    DR_MOV: 25000.00,
    CR_MOV: 2000.00,
    DR_MOV_LCY: 475000000.00,
    CR_MOV_LCY: 38000000.00,
    DR_BAL: 23000.00,
    CR_BAL: 0.00,
    DR_BAL_LCY: 437000000.00,
    CR_BAL_LCY: 0.00,
    OPEN_DR_BAL: 15000.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 285000000.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_SUB_BAL_ID: 3,
    GL_SUB: "2001001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "01",
    DR_MOV: 0.00,
    CR_MOV: 40000000.00,
    DR_MOV_LCY: 0.00,
    CR_MOV_LCY: 40000000.00,
    DR_BAL: 0.00,
    CR_BAL: 90000000.00,
    DR_BAL_LCY: 0.00,
    CR_BAL_LCY: 90000000.00,
    OPEN_DR_BAL: 0.00,
    OPEN_CR_BAL: 50000000.00,
    OPEN_DR_BAL_LCY: 0.00,
    OPEN_CR_BAL_LCY: 50000000.00
  },
  {
    GL_SUB_BAL_ID: 4,
    GL_SUB: "3001001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "02",
    DR_MOV: 0.00,
    CR_MOV: 200000000.00,
    DR_MOV_LCY: 0.00,
    CR_MOV_LCY: 200000000.00,
    DR_BAL: 0.00,
    CR_BAL: 200000000.00,
    DR_BAL_LCY: 0.00,
    CR_BAL_LCY: 200000000.00,
    OPEN_DR_BAL: 0.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 0.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_SUB_BAL_ID: 5,
    GL_SUB: "4001001001",
    CCY_CODE: "THB",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "02",
    DR_MOV: 12000.00,
    CR_MOV: 0.00,
    DR_MOV_LCY: 7200000.00,
    CR_MOV_LCY: 0.00,
    DR_BAL: 18000.00,
    CR_BAL: 0.00,
    DR_BAL_LCY: 10800000.00,
    CR_BAL_LCY: 0.00,
    OPEN_DR_BAL: 6000.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 3600000.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_SUB_BAL_ID: 6,
    GL_SUB: "5001001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "02",
    DR_MOV: 0.00,
    CR_MOV: 15000000.00,
    DR_MOV_LCY: 0.00,
    CR_MOV_LCY: 15000000.00,
    DR_BAL: 0.00,
    CR_BAL: 25000000.00,
    DR_BAL_LCY: 0.00,
    CR_BAL_LCY: 25000000.00,
    OPEN_DR_BAL: 0.00,
    OPEN_CR_BAL: 10000000.00,
    OPEN_DR_BAL_LCY: 0.00,
    OPEN_CR_BAL_LCY: 10000000.00
  },
  {
    GL_SUB_BAL_ID: 7,
    GL_SUB: "6001001001",
    CCY_CODE: "USD",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "03",
    DR_MOV: 8000.00,
    CR_MOV: 6000.00,
    DR_MOV_LCY: 152000000.00,
    CR_MOV_LCY: 114000000.00,
    DR_BAL: 4000.00,
    CR_BAL: 0.00,
    DR_BAL_LCY: 76000000.00,
    CR_BAL_LCY: 0.00,
    OPEN_DR_BAL: 2000.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 38000000.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_SUB_BAL_ID: 8,
    GL_SUB: "7001001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "03",
    DR_MOV: 2500000.00,
    CR_MOV: 4000000.00,
    DR_MOV_LCY: 2500000.00,
    CR_MOV_LCY: 4000000.00,
    DR_BAL: 0.00,
    CR_BAL: 1500000.00,
    DR_BAL_LCY: 0.00,
    CR_BAL_LCY: 1500000.00,
    OPEN_DR_BAL: 0.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 0.00,
    OPEN_CR_BAL_LCY: 0.00
  },
]);


const getCurrencyColor = (currency:any) => {
  const colors = {
    'LAK': 'success',
    'USD': 'primary',
    'THB': 'warning',
    'EUR': 'info',
    'JPY': 'secondary'
  };
  return  'grey';
};

const formatNumber = (value:any) => {
  if (!value || value === 0) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const deleteItem = (glSubBalId:any) => {
  console.log('Delete GL Sub Balance:', glSubBalId);
};
</script>

<template>
  <GlobalTextTitleLine :title="title" :loading="isloding" />
<div class="d-flex justify-end">
    <v-btn color="primary" @click="goPath('/glsubbalance/create')">
        <v-icon icon="mdi-plus" />
        ເພີ່ມຂໍ້ມູນ
    </v-btn>
</div>
  <v-col cols="12">
    <v-data-table :headers="header" :items="item">
      <template v-slot:item.GL_SUB="{ item }">
        <span class="font-weight-bold text-primary">{{ item.GL_SUB }}</span>
      </template>
      <template v-slot:item.CCY_CODE="{ item }">
        <v-chip 
          :color="getCurrencyColor(item.CCY_CODE)" 
          text-color="white" 
          size="small"
        >
          {{ item.CCY_CODE }}
        </v-chip>
      </template>
      <template v-slot:item.DR_BAL_LCY="{ item }">
        <span class="font-weight-bold" :class="item.DR_BAL_LCY > 0 ? 'text-red' : 'text-grey'">
          {{ formatNumber(item.DR_BAL_LCY) }}
        </span>
      </template>
      <template v-slot:item.CR_BAL_LCY="{ item }">
        <span class="font-weight-bold" :class="item.CR_BAL_LCY > 0 ? 'text-green' : 'text-grey'">
          {{ formatNumber(item.CR_BAL_LCY) }}
        </span>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon
          icon="mdi-eye"
          @click="goPath(`/glsubal/detail?id=${item.GL_SUB_BAL_ID}`)"
        ></v-icon>
        <v-icon
          icon="mdi-pencil"
          @click="goPath(`/glsubal/edit?id=${item.GL_SUB_BAL_ID}`)"
        ></v-icon>
        <v-icon
          icon="mdi-delete"
          @click="deleteItem(item.GL_SUB_BAL_ID)"
        ></v-icon>
      </template>
    </v-data-table>
  </v-col>
</template>