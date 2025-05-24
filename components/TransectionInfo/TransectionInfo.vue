<script setup lang="ts">
import axios from "@/helpers/axios";
const title = "ຈັດການຂໍ້ມູນປະເພດທຸລະກຳ";
const header = [
  { title: "ລະຫັດປະເພດທຸລະກຳ", value: "TRN_CODE" },
  { title: "ຊື່ປະເພດທຸລະກໍາ", value: "TRN_DESC" },
  { title: "ສະຖານະໃຊ້ງານ", value: "RECORD_STAT" },
  { title: "ສະຖານະອະນຸມັດ", value: "AUTH_STAT" },
  { title: "ລະຫັດຜູ້ບັນທຶກ", value: "MAKER_ID" },
  { title: "ຈັດການ", value: "action" },
];
const isloding = ref(false);
const item = ref([
  {
    TRN_CODE: "TRN001",
    TRN_DESC: "ສິນຄ້າ",
    RECORD_STAT: "Y",
    AUTH_STAT: "Y",
    MAKER_ID: "admin",
  },
  {
    TRN_CODE: "TRN002",
    TRN_DESC: "ບໍລິການ",
    RECORD_STAT: "Y",
    AUTH_STAT: "Y",
    MAKER_ID: "admin",
  },
  {
    TRN_CODE: "TRN003",
    TRN_DESC: "ສິນຄ້າ",
    RECORD_STAT: "Y",
    AUTH_STAT: "Y",
    MAKER_ID: "admin",
  },
  {
    TRN_CODE: "TRN004",
    TRN_DESC: "ບໍລິການ",
    RECORD_STAT: "Y",
    AUTH_STAT: "Y",
    MAKER_ID: "admin",
  },
  {
    TRN_CODE: "TRN005",
    TRN_DESC: "ສິນຄ້າ",
    RECORD_STAT: "Y",
    AUTH_STAT: "Y",
    MAKER_ID: "admin",
  },
  {
    TRN_CODE: "TRN006",
    TRN_DESC: "ບໍລິການ",
    RECORD_STAT: "Y",
    AUTH_STAT: "Y",
    MAKER_ID: "admin",
  },
  {
    TRN_CODE: "TRN007",
    TRN_DESC: "ສິນຄ້າ",
    RECORD_STAT: "Y",
    AUTH_STAT: "Y",
    MAKER_ID: "admin",
  },
  {
    TRN_CODE: "TRN008",
    TRN_DESC: "ບໍລິການ",
    RECORD_STAT: "Y",
    AUTH_STAT: "Y",
    MAKER_ID: "admin",
  },
]);
</script>

<template>
  <GlobalTextTitleLine :title="title" :loading="isloding" />
<div class="d-flex justify-end">
    <v-btn color="primary" @click="goPath('/transetioninfo/create')">
        <v-icon icon="mdi-plus" />
        ເພີ່ມຂໍ້ມູນ
    </v-btn>
</div>
  <v-col cols="12">
    <v-data-table :headers="header" :items="item">
      <template v-slot:item.action="{ item }">
        <v-icon
          icon="mdi-eye"
          @click="goPath(`/transetioninfo/detail?id=${item.AUTH_STAT}`)"
        ></v-icon>
        <v-icon
          icon="mdi-pencil"
          @click="goPath(`/transetioninfo/edit?id=${item.AUTH_STAT}`)"
        ></v-icon>
        <v-icon
          icon="mdi-delete"
          @click="goPath(`/transetioninfo/edit?id=${item.AUTH_STAT}`)"
        ></v-icon>
      </template>
    </v-data-table>
  </v-col>
</template>
