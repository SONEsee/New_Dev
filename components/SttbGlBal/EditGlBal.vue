<script setup lang="ts">
import axios from "@/helpers/axios";
const title = "ຈັດການຂໍ້ມູນຍອດເຫຼືອບັນຊີ GL Balance";
const valid = ref(false);
const form = ref();
const Destription = () => {
  valid.value = !valid.value;
};
const Submittarnsacto = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    try {
      const notification = await CallSwal({
        title: "ຄຳເຕືອນ",
        text: "ທ່ານຍັງບໍ່ທັນໄດ້ຕໍ່ api ໄປຕໍ່ໃຫ້ແລ້ວກອ່ນຄອ່ຍມາວ່າກັນ",
        icon: "warning",
        showCancelButton: false,
        showConfirmButton: true,
      });
      if (notification.isConfirmed) {
        setTimeout(() => {
          goPath("/glbalance");
        }, 1500);
      }
    } catch (error) {}
  }
};
</script>
<template>
 
  <v-col cols="12">
    <GlobalTextTitleLine
      :title="title"
      />
    <v-form ref="form" @click.prevent="Submittarnsacto">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ລະຫັດ GL"
            maxlength="20"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດ GL']"
            required
          >
          </v-text-field>
          <v-autocomplete
            :items="[
              { title: 'LAK - ກີບລາວ', value: 'LAK' },
              { title: 'USD - ໂດລາສະຫະລັດ', value: 'USD' },
              { title: 'THB - ບາດໄທ', value: 'THB' },
              { title: 'EUR - ເອີໂຣ', value: 'EUR' },
              { title: 'JPY - ເຢນຍີ່ປຸ່ນ', value: 'JPY' },
              { title: 'CNY - ຫຍວນຈີນ', value: 'CNY' },
              { title: 'VND - ດົງຫວຽດນາມ', value: 'VND' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະກຸນເງິນ']"
            label="ເລືອກສະກຸນເງິນ"
            variant="outlined"
            required
          />
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຮອບວຽນບັນຊີຂອງປີ"
            maxlength="9"
            placeholder="ເຊັ່ນ: 2024-2025"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຮອບວຽນບັນຊີ']"
            required
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-autocomplete
            :items="[
              { title: '01 - ມັງກອນ', value: '01' },
              { title: '02 - ກຸມພາ', value: '02' },
              { title: '03 - ມີນາ', value: '03' },
              { title: '04 - ເມສາ', value: '04' },
              { title: '05 - ພຶດສະພາ', value: '05' },
              { title: '06 - ມິຖຸນາ', value: '06' },
              { title: '07 - ກໍລະກົດ', value: '07' },
              { title: '08 - ສິງຫາ', value: '08' },
              { title: '09 - ກັນຍາ', value: '09' },
              { title: '10 - ຕຸລາ', value: '10' },
              { title: '11 - ພະຈິກ', value: '11' },
              { title: '12 - ທັນວາ', value: '12' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກເດືອນ']"
            label="ເລືອກຮອບວຽນເດືອນ"
            variant="outlined"
            required
          />
          <v-autocomplete
            :items="[
              { title: '1 = Asset (ຊັບສິນ)', value: '1' },
              { title: '2 = Liability (ໜີ້ສິນ)', value: '2' },
              { title: '3 = Capital (ທຶນ)', value: '3' },
              { title: '4 = Expense (ຄ່າໃຊ້ຈ່າຍ)', value: '4' },
              { title: '5 = Income (ລາຍໄດ້)', value: '5' },
              { title: '6 = Position (ຕຳແໜ່ງ)', value: '6' },
              { title: '7 = Position Equivalent (ຕຳແໜ່ງເທົ່າທຽມ)', value: '7' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            label="ປະເພດໜວດບັນຊີ (Optional)"
            variant="outlined"
          />
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດການເຄື່ອນໄຫວໜີ້ (ສະກຸນຕ່າງປະເທດ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດການເຄື່ອນໄຫວມີ (ສະກຸນຕ່າງປະເທດ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດການເຄື່ອນໄຫວໜີ້ (ສະກຸນກີບ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດການເຄື່ອນໄຫວມີ (ສະກຸນກີບ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດເຫຼືອໜີ້ (ສະກຸນຕ່າງປະເທດ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດເຫຼືອມີ (ສະກຸນຕ່າງປະເທດ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດເຫຼືອໜີ້ (ສະກຸນກີບ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດເຫຼືອມີ (ສະກຸນກີບ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດຍົກມາໜີ້ (ສະກຸນຕ່າງປະເທດ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດຍົກມາມີ (ສະກຸນຕ່າງປະເທດ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດຍົກມາໜີ້ (ສະກຸນກີບ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຍອດຍົກມາມີ (ສະກຸນກີບ)"
            type="number"
            step="0.01"
            placeholder="0.00"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-col cols="12" class="d-flex justify-center">
        <v-btn
          type="submit"
          color="primary"
          class="d-flex justify-center mr-2"
          text="ບັນທຶກ"
        />
        <v-btn
          color="error"
          class="d-flex justify-center"
          text="ຍົກເລີກ"
          @click="goPath('/glbalance')"
        />
      </v-col>
    </v-form>
  </v-col>
</template>