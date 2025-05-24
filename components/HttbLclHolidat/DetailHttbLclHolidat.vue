<script setup lang="ts">
const title = "ຂໍ້ມູນລາຍລະອຽດຂໍ້ມູນວັນພັກ";
</script>
<template>
  <GlobalTextTitleLine :title="title" />
  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ລະຫັດວັນພັກ'" />
        <GlobalCardTitle :title="'ເດືອນ'" />
        <GlobalCardTitle :title="'ສະຖານະໃຊ້ງານ'" />
        <GlobalCardTitle :title="'ລະຫັດຜູ້ອະນຸມັດ'" />
      </v-col>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ປີ'" />
        <GlobalCardTitle :title="'ວັນທີ'" />
        <GlobalCardTitle :title="'ສະຖານະອະນຸມັດ'" />
        <GlobalCardTitle :title="'ວັນທີອະນຸມັດ'" />
      </v-col>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ລາຍການວັນພັກ'" />
        <GlobalCardTitle :title="'ລະຫັດຜູ້ບັນທຶກ'" />
        <GlobalCardTitle :title="'ວັນທີບັນທຶກຂໍ້ມູນ'" />
        <GlobalCardTitle :title="'ສະຖານະເຄີຍຖືກອະນຸມັດ'" />
      </v-col>
    </v-row>
  </v-col>
</template>