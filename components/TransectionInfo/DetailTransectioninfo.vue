<script setup lang="ts">
const title = "ຂໍ້ມູນລາຍລະອຽດຂໍ້ມູນປະເພດທຸລະກຳ";
</script>
<template>
  <GlobalTextTitleLine :title="title" />
  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ລະຫັດປະເພດທຸລະກໍາ'" />
        <GlobalCardTitle :title="'ສະຖານະໃຊ້ງານ'" />
        <GlobalCardTitle :title="'ລະຫັດຜູ້ອະນຸມັດ'" />
      </v-col>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ຊື່ປະເພດທຸລະກໍາ'" />
        <GlobalCardTitle :title="'ສະຖານະອະນຸມັດ'" />
        <GlobalCardTitle :title="'ວັນທີອະນຸມັດ'" />
      </v-col>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ລະຫັດຜູ້ບັນທຶກ'" />
        <GlobalCardTitle :title="'ວັນທີບັນທຶກຂໍ້ມູນ'" />
        <GlobalCardTitle :title="'ສະຖານະເຄີຍຖືກອະນຸມັດ '" />
      </v-col>
    </v-row>
  </v-col>
</template>
