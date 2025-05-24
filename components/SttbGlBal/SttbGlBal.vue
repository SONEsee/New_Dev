<script setup lang="ts">
import axios from "@/helpers/axios";

const title = "ຈັດການຂໍ້ມູນຍອດເຫຼືອບັນຊີ GL Balance";
const header = [
  { title: "ລະຫັດ GL", value: "GL_CODE" },
  { title: "ສະກຸນເງິນ", value: "CCY_CODE" },
  { title: "ປີບັນຊີ", value: "FIN_YEAR" },
  { title: "ເດືອນ", value: "PERIOD_CODE" },
  { title: "ປະເພດບັນຊີ", value: "CATEGORY" },
  { title: "ຍອດເຫຼືອໜີ້ (LCY)", value: "DR_BAL_LCY" },
  { title: "ຍອດເຫຼືອມີ (LCY)", value: "CR_BAL_LCY" },
  { title: "ຈັດການ", value: "action" },
];
const isloding = ref(false);
const item = ref([
  {
    GL_BAL_ID: 1,
    GL_CODE: "1001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "01",
    CATEGORY: "1",
    DR_MOV: 15000000.00,
    CR_MOV: 0.00,
    DR_MOV_LCY: 15000000.00,
    CR_MOV_LCY: 0.00,
    DR_BAL: 15000000.00,
    CR_BAL: 0.00,
    DR_BAL_LCY: 15000000.00,
    CR_BAL_LCY: 0.00,
    OPEN_DR_BAL: 12000000.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 12000000.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_BAL_ID: 2,
    GL_CODE: "1002001",
    CCY_CODE: "USD",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "01",
    CATEGORY: "1",
    DR_MOV: 50000.00,
    CR_MOV: 5000.00,
    DR_MOV_LCY: 950000000.00,
    CR_MOV_LCY: 95000000.00,
    DR_BAL: 45000.00,
    CR_BAL: 0.00,
    DR_BAL_LCY: 855000000.00,
    CR_BAL_LCY: 0.00,
    OPEN_DR_BAL: 30000.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 570000000.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_BAL_ID: 3,
    GL_CODE: "2001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "01",
    CATEGORY: "2",
    DR_MOV: 0.00,
    CR_MOV: 80000000.00,
    DR_MOV_LCY: 0.00,
    CR_MOV_LCY: 80000000.00,
    DR_BAL: 0.00,
    CR_BAL: 180000000.00,
    DR_BAL_LCY: 0.00,
    CR_BAL_LCY: 180000000.00,
    OPEN_DR_BAL: 0.00,
    OPEN_CR_BAL: 100000000.00,
    OPEN_DR_BAL_LCY: 0.00,
    OPEN_CR_BAL_LCY: 100000000.00
  },
  {
    GL_BAL_ID: 4,
    GL_CODE: "3001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "02",
    CATEGORY: "3",
    DR_MOV: 0.00,
    CR_MOV: 500000000.00,
    DR_MOV_LCY: 0.00,
    CR_MOV_LCY: 500000000.00,
    DR_BAL: 0.00,
    CR_BAL: 500000000.00,
    DR_BAL_LCY: 0.00,
    CR_BAL_LCY: 500000000.00,
    OPEN_DR_BAL: 0.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 0.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_BAL_ID: 5,
    GL_CODE: "4001001",
    CCY_CODE: "THB",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "02",
    CATEGORY: "4",
    DR_MOV: 25000.00,
    CR_MOV: 0.00,
    DR_MOV_LCY: 15000000.00,
    CR_MOV_LCY: 0.00,
    DR_BAL: 35000.00,
    CR_BAL: 0.00,
    DR_BAL_LCY: 21000000.00,
    CR_BAL_LCY: 0.00,
    OPEN_DR_BAL: 10000.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 6000000.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_BAL_ID: 6,
    GL_CODE: "5001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "02",
    CATEGORY: "5",
    DR_MOV: 0.00,
    CR_MOV: 25000000.00,
    DR_MOV_LCY: 0.00,
    CR_MOV_LCY: 25000000.00,
    DR_BAL: 0.00,
    CR_BAL: 45000000.00,
    DR_BAL_LCY: 0.00,
    CR_BAL_LCY: 45000000.00,
    OPEN_DR_BAL: 0.00,
    OPEN_CR_BAL: 20000000.00,
    OPEN_DR_BAL_LCY: 0.00,
    OPEN_CR_BAL_LCY: 20000000.00
  },
  {
    GL_BAL_ID: 7,
    GL_CODE: "6001001",
    CCY_CODE: "USD",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "03",
    CATEGORY: "6",
    DR_MOV: 15000.00,
    CR_MOV: 12000.00,
    DR_MOV_LCY: 285000000.00,
    CR_MOV_LCY: 228000000.00,
    DR_BAL: 8000.00,
    CR_BAL: 0.00,
    DR_BAL_LCY: 152000000.00,
    CR_BAL_LCY: 0.00,
    OPEN_DR_BAL: 5000.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 95000000.00,
    OPEN_CR_BAL_LCY: 0.00
  },
  {
    GL_BAL_ID: 8,
    GL_CODE: "7001001",
    CCY_CODE: "LAK",
    FIN_YEAR: "2024-2025",
    PERIOD_CODE: "03",
    CATEGORY: "7",
    DR_MOV: 5000000.00,
    CR_MOV: 8000000.00,
    DR_MOV_LCY: 5000000.00,
    CR_MOV_LCY: 8000000.00,
    DR_BAL: 0.00,
    CR_BAL: 3000000.00,
    DR_BAL_LCY: 0.00,
    CR_BAL_LCY: 3000000.00,
    OPEN_DR_BAL: 0.00,
    OPEN_CR_BAL: 0.00,
    OPEN_DR_BAL_LCY: 0.00,
    OPEN_CR_BAL_LCY: 0.00
  },
]);


const getCategoryColor = (category:any) => {
  const colors = {
    '1': 'blue',     
    '2': 'red',       
    '3': 'green',    
    '4': 'orange',  
    '5': 'purple',  
    '6': 'teal',     
    '7': 'indigo'    
  };
  return   'grey';
};

const getCategoryText = (category:any) => {
  const texts = {
    '1': 'ຊັບສິນ',
    '2': 'ໜີ້ສິນ', 
    '3': 'ທຶນ',
    '4': 'ຄ່າໃຊ້ຈ່າຍ',
    '5': 'ລາຍໄດ້',
    '6': 'ຕຳແໜ່ງ',
    '7': 'ຕຳແໜ່ງເທົ່າທຽມ'
  };
  return   'ບໍ່ຮູ້ຈັກ';
};

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

const deleteItem = (glBalId:any) => {
  console.log('Delete GL Balance:', glBalId);
};
</script>

<template>
  <GlobalTextTitleLine :title="title" :loading="isloding" />
<div class="d-flex justify-end">
    <v-btn color="primary" @click="goPath('/glbal/create')">
        <v-icon icon="mdi-plus" />
        ເພີ່ມຂໍ້ມູນ
    </v-btn>
</div>
  <v-col cols="12">
    <v-data-table :headers="header" :items="item">
      <template v-slot:item.CATEGORY="{ item }">
        <v-chip 
          :color="getCategoryColor(item.CATEGORY)" 
          text-color="white" 
          size="small"
        >
          {{ getCategoryText(item.CATEGORY) }}
        </v-chip>
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
          @click="goPath(`/glbal/detail?id=${item.GL_BAL_ID}`)"
        ></v-icon>
        <v-icon
          icon="mdi-pencil"
          @click="goPath(`/glbal/edit?id=${item.GL_BAL_ID}`)"
        ></v-icon>
        <v-icon
          icon="mdi-delete"
          @click="deleteItem(item.GL_BAL_ID)"
        ></v-icon>
      </template>
    </v-data-table>
  </v-col>
</template>

