<script setup lang="ts">
import axios from "@/helpers/axios";
const title = "ຈັດການຂໍ້ມູນວັນພັກ";
const header = [
  { title: "ປີ", value: "YEAR" },
  { title: "ເດືອນ", value: "MONTH" },
  { title: "ວັນທີ", value: "HDATE" },
  { title: "ລາຍການວັນພັກ", value: "HOLIDAY_LIST" },
  { title: "ສະຖານະໃຊ້ງານ", value: "RECORD_STAT" },
  { title: "ສະຖານະອະນຸມັດ", value: "AUTH_STAT" },
  { title: "ລະຫັດຜູ້ບັນທຶກ", value: "MAKER_ID" },
  { title: "ຈັດການ", value: "action" },
];
const isloding = ref(false);
const item = ref([
  {
    HOLIDAY_ID: "HOL001",
    YEAR: 2024,
    MONTH: 1,
    HDATE: "2024-01-01",
    HOLIDAY_LIST: "H",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-01-01",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-01-01",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    HOLIDAY_ID: "HOL002",
    YEAR: 2024,
    MONTH: 2,
    HDATE: "2024-02-14",
    HOLIDAY_LIST: "H",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-02-01",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-02-01",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    HOLIDAY_ID: "HOL003",
    YEAR: 2024,
    MONTH: 4,
    HDATE: "2024-04-13",
    HOLIDAY_LIST: "H",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-04-01",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-04-01",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    HOLIDAY_ID: "HOL004",
    YEAR: 2024,
    MONTH: 4,
    HDATE: "2024-04-14",
    HOLIDAY_LIST: "H",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-04-01",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-04-01",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    HOLIDAY_ID: "HOL005",
    YEAR: 2024,
    MONTH: 4,
    HDATE: "2024-04-15",
    HOLIDAY_LIST: "H",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-04-01",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-04-01",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    HOLIDAY_ID: "HOL006",
    YEAR: 2024,
    MONTH: 12,
    HDATE: "2024-12-02",
    HOLIDAY_LIST: "H",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-12-01",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-12-01",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    HOLIDAY_ID: "HOL007",
    YEAR: 2025,
    MONTH: 1,
    HDATE: "2025-01-01",
    HOLIDAY_LIST: "H",
    RECORD_STAT: "O",
    AUTH_STAT: "U",
    MAKER_ID: "user01",
    MAKER_DT_STAMP: "2024-12-15",
    CHECKER_ID: null,
    CHECKER_DT_STAMP: null,
    MOD_NO: 0,
    ONCE_AUTH: "N"
  },
  {
    HOLIDAY_ID: "HOL008",
    YEAR: 2025,
    MONTH: 4,
    HDATE: "2025-04-13",
    HOLIDAY_LIST: "W",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-12-01",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-12-01",
    MOD_NO: 1,
    ONCE_AUTH: "Y"
  },
]);
</script>

<template>
  <GlobalTextTitleLine :title="title" :loading="isloding" />
<div class="d-flex justify-end">
    <v-btn color="primary" @click="goPath('/holiday/create')">
        <v-icon icon="mdi-plus" />
        ເພີ່ມຂໍ້ມູນ
    </v-btn>
</div>
  <v-col cols="12">
    <v-data-table :headers="header" :items="item">
      <template v-slot:item.HOLIDAY_LIST="{ item }">
        <v-chip 
          :color="item.HOLIDAY_LIST === 'H' ? 'red' : 'green'" 
          text-color="white" 
          size="small"
        >
          {{ item.HOLIDAY_LIST === 'H' ? 'ວັນພັກ' : 'ວັນເຮັດວຽກ' }}
        </v-chip>
      </template>
      <template v-slot:item.RECORD_STAT="{ item }">
        <v-chip 
          :color="item.RECORD_STAT === 'O' ? 'success' : 'error'" 
          text-color="white" 
          size="small"
        >
          {{ item.RECORD_STAT === 'O' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ' }}
        </v-chip>
      </template>
      <template v-slot:item.AUTH_STAT="{ item }">
        <v-chip 
          :color="item.AUTH_STAT === 'A' ? 'primary' : 'warning'" 
          text-color="white" 
          size="small"
        >
          {{ item.AUTH_STAT === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ຍັງບໍ່ອະນຸມັດ' }}
        </v-chip>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon
          icon="mdi-eye"
          @click="goPath(`/holiday/detail?id=${item.HOLIDAY_ID}`)"
        ></v-icon>
        <v-icon
          icon="mdi-pencil"
          @click="goPath(`/holiday/edit?id=${item.HOLIDAY_ID}`)"
        ></v-icon>
        <v-icon
          icon="mdi-delete"
          @click="goPath(`/holiday/delete?id=${item.HOLIDAY_ID}`)"
        ></v-icon>
      </template>
    </v-data-table>
  </v-col>
</template>