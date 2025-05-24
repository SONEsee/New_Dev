<script setup lang="ts">
const title = "ຂໍ້ມູນລາຍລະອຽດຍອດເຫຼືອບັນຊີຍ່ອຍ GL Sub Balance";
</script>
<template>
  <GlobalTextTitleLine :title="title" />
  <v-col cols="12">
    <v-row>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ລະຫັດບັນຊີຍ່ອຍ'" />
        <GlobalCardTitle :title="'ສະກຸນເງິນ'" />
        <GlobalCardTitle :title="'ຮອບວຽນບັນຊີຂອງປີ'" />
        <GlobalCardTitle :title="'ຮອບວຽນບັນຊີຂອງເດືອນ'" />
      </v-col>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ຍອດການເຄື່ອນໄຫວໜີ້ (ສະກຸນຕ່າງປະເທດ)'" />
        <GlobalCardTitle :title="'ຍອດການເຄື່ອນໄຫວມີ (ສະກຸນຕ່າງປະເທດ)'" />
        <GlobalCardTitle :title="'ຍອດການເຄື່ອນໄຫວໜີ້ (ສະກຸນກີບ)'" />
        <GlobalCardTitle :title="'ຍອດການເຄື່ອນໄຫວມີ (ສະກຸນກີບ)'" />
      </v-col>
      <v-col cols="12" md="4">
        <GlobalCardTitle :title="'ຍອດເຫຼືອໜີ້ (ສະກຸນຕ່າງປະເທດ)'" />
        <GlobalCardTitle :title="'ຍອດເຫຼືອມີ (ສະກຸນຕ່າງປະເທດ)'" />
        <GlobalCardTitle :title="'ຍອດເຫຼືອໜີ້ (ສະກຸນກີບ)'" />
        <GlobalCardTitle :title="'ຍອດເຫຼືອມີ (ສະກຸນກີບ)'" />
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-divider></v-divider>
        <h3 class="text-h6 mt-4 mb-2">ຍອດຍົກມາ (Opening Balance)</h3>
      </v-col>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ຍອດຍົກມາໜີ້ (ສະກຸນຕ່າງປະເທດ)'" />
      </v-col>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ຍອດຍົກມາມີ (ສະກຸນຕ່າງປະເທດ)'" />
      </v-col>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ຍອດຍົກມາໜີ້ (ສະກຸນກີບ)'" />
      </v-col>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ຍອດຍົກມາມີ (ສະກຸນກີບ)'" />
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12">
        <v-divider></v-divider>
        <h3 class="text-h6 mt-4 mb-2">ຂໍ້ມູນເພີ່ມເຕີມ</h3>
      </v-col>
      <v-col cols="12" md="6">
        <GlobalCardTitle :title="'ID ບັນທຶກຂໍ້ມູນ'" />
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
        <h3 class="text-h6 mt-4 mb-2">ຄໍາອະທິບາຍຂໍ້ມູນບັນຊີຍ່ອຍ</h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-blue">ບັນຊີຍ່ອຍ (Sub Account)</v-card-title>
          <v-card-text>
            ເປັນບັນຊີລະອຽດພາຍໃຕ້ບັນຊີຫຼັກ GL ທີ່ໃຊ້ສໍາລັບແຍກແຍງການບັນທຶກທາງການເງິນໃຫ້ລະອຽດຂຶ້ນ
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-green">ການຈັດການຍອດເຫຼືອ</v-card-title>
          <v-card-text>
            ຍອດເຫຼືອບັນຊີຍ່ອຍຈະຖືກອັບເດດແບບອັດຕະໂນມັດຕາມການເຄື່ອນໄຫວທາງການເງິນປະຈຳເດືອນ
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-red">ດີບິດ (Debit)</v-card-title>
          <v-card-text>ການບັນທຶກທາງຝັ່ງຊ້າຍ ສໍາລັບຊັບສິນແລະຄ່າໃຊ້ຈ່າຍ</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-green">ເຄຣດິດ (Credit)</v-card-title>
          <v-card-text>ການບັນທຶກທາງຝັ່ງຂວາ ສໍາລັບໜີ້ສິນ, ທຶນ ແລະລາຍໄດ້</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-3" elevation="2">
          <v-card-title class="text-subtitle-1 text-purple">ຍອດຍົກມາ</v-card-title>
          <v-card-text>ຍອດເຫຼືອທີ່ຍົກມາຈາກເດືອນກ່ອນໜ້າ</v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
  </v-col>
</template>