<script setup lang="ts">
const title = "ຂໍ້ມູນລາຍລະອຽດບັນຊີ GL Master";
</script>
<template>
  <GlobalTextTitleLine :title="title" />
  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ລະຫັດ GL'" />
        <GlobalCardTitle :title="'ຂັ້ນບັນຊີ'" />
        <GlobalCardTitle :title="'ໜວດບັນຊີ'" />
        <GlobalCardTitle :title="'ສາມາດໃຊ້ສະກຸນເງິນ'" />
        <GlobalCardTitle :title="'ອະນຸຍາດລົງຍ້ອນຫຼັງ'" />
        <GlobalCardTitle :title="'ສະຖານະໃຊ້ງານ'" />
        <GlobalCardTitle :title="'ລະຫັດຜູ້ອະນຸມັດ'" />
      </v-col>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ຊື່ເລກບັນຊີ'" />
        <GlobalCardTitle :title="'ປະເພດບັນຊີ'" />
        <GlobalCardTitle :title="'ການຕີມູນຄ່າທາງດ້ານບັນຊີ'" />
        <GlobalCardTitle :title="'ລະຫັດສະກຸນເງິນ'" />
        <GlobalCardTitle :title="'ກຳນົດການຕີມູນຄ່າແບບ 2 ຮູບແບບ'" />
        <GlobalCardTitle :title="'ສະຖານະອະນຸມັດ'" />
        <GlobalCardTitle :title="'ວັນທີອະນຸມັດ'" />
      </v-col>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ບັນຊີກຳໄລການຊື້ຂາຍ'" />
        <GlobalCardTitle :title="'ບັນຊີຂາດທຶນການຊື້ຂາຍ'" />
        <GlobalCardTitle :title="'ບັນຊີກຳໄລຈາກຍອດເຫຼືອທ້າຍມື້'" />
        <GlobalCardTitle :title="'ບັນຊີຂາດທຶນຈາກຍອດເຫຼືອທ້າຍມື້'" />
        <GlobalCardTitle :title="'ລະຫັດຜູ້ບັນທຶກ'" />
        <GlobalCardTitle :title="'ວັນທີບັນທຶກຂໍ້ມູນ'" />
        <GlobalCardTitle :title="'ສະຖານະເຄີຍຖືກອະນຸມັດ'" />
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-divider></v-divider>
        <h3 class="text-h6 mt-4 mb-2">ຂໍ້ມູນເພີ່ມເຕີມ</h3>
      </v-col>
      <v-col cols="12" md="6">
        <GlobalCardTitle :title="'ຈໍານວນຄັ້ງທີ່ແກ້ໄຂ (MOD_NO)'" />
        <GlobalCardTitle :title="'ວັນທີສ້າງບັນທຶກ'" />
      </v-col>
      <v-col cols="12" md="6">
        <GlobalCardTitle :title="'ວັນທີອັບເດດລ່າສຸດ'" />
        <GlobalCardTitle :title="'ສະຖານະການດໍາເນີນງານ'" />
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-divider></v-divider>
        <h3 class="text-h6 mt-4 mb-2">ການຈັດແບ່ງປະເພດບັນຊີ</h3>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-blue">Asset (ຊັບສິນ)</v-card-title>
          <v-card-text>ປະເພດ 1 - ຊັບສິນທັງໝົດຂອງອົງກອນ</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-red">Liability (ໜີ້ສິນ)</v-card-title>
          <v-card-text>ປະເພດ 2 - ໜີ້ສິນທັງໝົດຂອງອົງກອນ</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-green">Capital (ທຶນ)</v-card-title>
          <v-card-text>ປະເພດ 3 - ທຶນຂອງອົງກອນ</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-orange">Expense (ຄ່າໃຊ້ຈ່າຍ)</v-card-title>
          <v-card-text>ປະເພດ 4 - ຄ່າໃຊ້ຈ່າຍທັງໝົດ</v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-2">
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-purple">Income (ລາຍໄດ້)</v-card-title>
          <v-card-text>ປະເພດ 5 - ລາຍໄດ້ທັງໝົດ</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-teal">Position (ຕຳແໜ່ງ)</v-card-title>
          <v-card-text>ປະເພດ 6 - ຕຳແໜ່ງທາງການເງິນ</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-indigo">Position Equivalent</v-card-title>
          <v-card-text>ປະເພດ 7 - ຕຳແໜ່ງເທົ່າທຽມ</v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-divider></v-divider>
        <h3 class="text-h6 mt-4 mb-2">ການຕັ້ງຄ່າສະກຸນເງິນ</h3>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-primary">Single Currency (S)</v-card-title>
          <v-card-text>ໃຊ້ສະກຸນເງິນດຽວເທົ່ານັ້ນ</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-warning">Foreign Currencies (F)</v-card-title>
          <v-card-text>ໃຊ້ສະກຸນເງິນຕ່າງປະເທດທັງໝົດ</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-success">All Currencies (A)</v-card-title>
          <v-card-text>ໃຊ້ທຸກສະກຸນເງິນ (ທ້ອງຖິ່ນ + ຕ່າງປະເທດ)</v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-4">
     
    </v-row>
  </v-col>
</template>