<script setup lang="ts">
import axios from "@/helpers/axios";
const title = "ຈັດການຂໍ້ມູນບັນຊີ GL Master";
const header = [
  { title: "ລະຫັດ GL", value: "GL_CODE" },
  { title: "ຊື່ເລກບັນຊີ", value: "GL_DESC" },
  { title: "ຂັ້ນບັນຊີ", value: "TYPE" },
  { title: "ປະເພດບັນຊີ", value: "CATEGORY" },
  { title: "ສະກຸນເງິນ", value: "CCY_RES" },
  { title: "ສະຖານະໃຊ້ງານ", value: "RECORD_STAT" },
  { title: "ສະຖານະອະນຸມັດ", value: "AUTH_STAT" },
  { title: "ລະຫັດຜູ້ບັນທຶກ", value: "MAKER_ID" },
  { title: "ຈັດການ", value: "action" },
];
const isloding = ref(false);
const item = ref([
  {
    GL_ID: 1,
    GL_CODE: "1001001",
    GL_DESC: "ເງິນສົດໃນມື",
    TYPE: "1",
    CATEGORY: "1",
    CATEGORY_TYPE: "A",
    REVAL: "N",
    CCY_RES: "S",
    RES_CCY: "LAK",
    ALLOW_BACK_PERIOD_ENTRY: "N",
    PL_SPLIT_REQD: "N",
    TRADING_PROFIT_ACCOUNT: null,
    TRADING_LOSS_ACCOUNT: null,
    PROFIT_GL: null,
    LOSS_GL: null,
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
    GL_ID: 2,
    GL_CODE: "1002001",
    GL_DESC: "ເງິນຝາກທະນາຄານ",
    TYPE: "2",
    CATEGORY: "1",
    CATEGORY_TYPE: "A",
    REVAL: "Y",
    CCY_RES: "A",
    RES_CCY: null,
    ALLOW_BACK_PERIOD_ENTRY: "Y",
    PL_SPLIT_REQD: "Y",
    TRADING_PROFIT_ACCOUNT: "5001001",
    TRADING_LOSS_ACCOUNT: "4001001",
    PROFIT_GL: "5001002",
    LOSS_GL: "4001002",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-01-02",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-01-02",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    GL_ID: 3,
    GL_CODE: "2001001",
    GL_DESC: "ເງິນກູ້ຢືມລູກຄ້າ",
    TYPE: "3",
    CATEGORY: "2",
    CATEGORY_TYPE: "L",
    REVAL: "N",
    CCY_RES: "F",
    RES_CCY: null,
    ALLOW_BACK_PERIOD_ENTRY: "N",
    PL_SPLIT_REQD: "N",
    TRADING_PROFIT_ACCOUNT: null,
    TRADING_LOSS_ACCOUNT: null,
    PROFIT_GL: null,
    LOSS_GL: null,
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "user01",
    MAKER_DT_STAMP: "2024-01-03",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-01-03",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    GL_ID: 4,
    GL_CODE: "3001001",
    GL_DESC: "ທຶນຈົດທະບຽນ",
    TYPE: "4",
    CATEGORY: "3",
    CATEGORY_TYPE: "C",
    REVAL: "N",
    CCY_RES: "S",
    RES_CCY: "LAK",
    ALLOW_BACK_PERIOD_ENTRY: "N",
    PL_SPLIT_REQD: "N",
    TRADING_PROFIT_ACCOUNT: null,
    TRADING_LOSS_ACCOUNT: null,
    PROFIT_GL: null,
    LOSS_GL: null,
    RECORD_STAT: "O",
    AUTH_STAT: "U",
    MAKER_ID: "user02",
    MAKER_DT_STAMP: "2024-01-04",
    CHECKER_ID: null,
    CHECKER_DT_STAMP: null,
    MOD_NO: 0,
    ONCE_AUTH: "N"
  },
  {
    GL_ID: 5,
    GL_CODE: "4001001",
    GL_DESC: "ຄ່າໃຊ້ຈ່າຍດໍາເນີນງານ",
    TYPE: "5",
    CATEGORY: "4",
    CATEGORY_TYPE: "E",
    REVAL: "N",
    CCY_RES: "A",
    RES_CCY: null,
    ALLOW_BACK_PERIOD_ENTRY: "Y",
    PL_SPLIT_REQD: "N",
    TRADING_PROFIT_ACCOUNT: null,
    TRADING_LOSS_ACCOUNT: null,
    PROFIT_GL: null,
    LOSS_GL: null,
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-01-05",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-01-05",
    MOD_NO: 1,
    ONCE_AUTH: "Y"
  },
  {
    GL_ID: 6,
    GL_CODE: "5001001",
    GL_DESC: "ລາຍໄດ້ດອກເບ້ຍ",
    TYPE: "6",
    CATEGORY: "5",
    CATEGORY_TYPE: "I",
    REVAL: "Y",
    CCY_RES: "F",
    RES_CCY: null,
    ALLOW_BACK_PERIOD_ENTRY: "Y",
    PL_SPLIT_REQD: "Y",
    TRADING_PROFIT_ACCOUNT: "5002001",
    TRADING_LOSS_ACCOUNT: "4002001",
    PROFIT_GL: "5002002",
    LOSS_GL: "4002002",
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-01-06",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-01-06",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
  {
    GL_ID: 7,
    GL_CODE: "6001001",
    GL_DESC: "ບັນຊີເງິນຕາຕ່າງປະເທດ",
    TYPE: "7",
    CATEGORY: "6",
    CATEGORY_TYPE: "P",
    REVAL: "Y",
    CCY_RES: "F",
    RES_CCY: null,
    ALLOW_BACK_PERIOD_ENTRY: "N",
    PL_SPLIT_REQD: "Y",
    TRADING_PROFIT_ACCOUNT: "5003001",
    TRADING_LOSS_ACCOUNT: "4003001",
    PROFIT_GL: "5003002",
    LOSS_GL: "4003002",
    RECORD_STAT: "C",
    AUTH_STAT: "A",
    MAKER_ID: "user03",
    MAKER_DT_STAMP: "2024-01-07",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-01-07",
    MOD_NO: 2,
    ONCE_AUTH: "Y"
  },
  {
    GL_ID: 8,
    GL_CODE: "7001001",
    GL_DESC: "ບັນຊີສົມດູນ",
    TYPE: "1",
    CATEGORY: "7",
    CATEGORY_TYPE: "P",
    REVAL: "N",
    CCY_RES: "S",
    RES_CCY: "LAK",
    ALLOW_BACK_PERIOD_ENTRY: "N",
    PL_SPLIT_REQD: "N",
    TRADING_PROFIT_ACCOUNT: null,
    TRADING_LOSS_ACCOUNT: null,
    PROFIT_GL: null,
    LOSS_GL: null,
    RECORD_STAT: "O",
    AUTH_STAT: "A",
    MAKER_ID: "admin",
    MAKER_DT_STAMP: "2024-01-08",
    CHECKER_ID: "supervisor",
    CHECKER_DT_STAMP: "2024-01-08",
    MOD_NO: 0,
    ONCE_AUTH: "Y"
  },
]);
</script>

<template>
  <GlobalTextTitleLine :title="title" :loading="isloding" />
<div class="d-flex justify-end">
    <v-btn color="primary" @click="goPath('/gl/create')">
        <v-icon icon="mdi-plus" />
        ເພີ່ມຂໍ້ມູນ
    </v-btn>
</div>
  <v-col cols="12">
    <v-data-table :headers="header" :items="item">
      <template v-slot:item.CATEGORY="{ item }">
       
      </template>
      <template v-slot:item.CCY_RES="{ item }">
        <v-chip 
          :color="item.CCY_RES === 'S' ? 'primary' : item.CCY_RES === 'F' ? 'warning' : 'success'" 
          text-color="white" 
          size="small"
        >
          {{ item.CCY_RES === 'S' ? 'ສະກຸນດຽວ' : item.CCY_RES === 'F' ? 'ຕ່າງປະເທດ' : 'ທຸກສະກຸນ' }}
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
          @click="goPath(`/glmaster/detail?id=${item.GL_ID}`)"
        ></v-icon>
        <v-icon
          icon="mdi-pencil"
          @click="goPath(`/glmaster/edit?id=${item.GL_ID}`)"
        ></v-icon>
        <v-icon
          icon="mdi-delete"
          
        ></v-icon>
      </template>
    </v-data-table>
  </v-col>
</template>

