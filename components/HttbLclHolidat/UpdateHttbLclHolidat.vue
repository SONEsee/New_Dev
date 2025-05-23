<script setup lang="ts">
import axios from "@/helpers/axios";
const title = "ສ້າງຂໍ້ມູນວັນພັກ";
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
          goPath("/holiday");
        }, 1500);
      }
    } catch (error) {}
  }
};
</script>
<template>
    
  <v-col cols="12">
     <GlobalTextTitleLine :title="title" />
    <v-form ref="form" @click.prevent="Submittarnsacto">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ປີຂອງວັນພັກ"
            type="number"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນປີ', (v) => v >= 2020 && v <= 2030 || 'ປີຕ້ອງຢູ່ລະຫວ່າງ 2020-2030']"
            required
          >
          </v-text-field>
          <v-autocomplete
            :items="[
              { title: 'ມັງກອນ', value: 1 },
              { title: 'ກຸມພາ', value: 2 },
              { title: 'ມີນາ', value: 3 },
              { title: 'ເມສາ', value: 4 },
              { title: 'ພຶດສະພາ', value: 5 },
              { title: 'ມິຖຸນາ', value: 6 },
              { title: 'ກໍລະກົດ', value: 7 },
              { title: 'ສິງຫາ', value: 8 },
              { title: 'ກັນຍາ', value: 9 },
              { title: 'ຕຸລາ', value: 10 },
              { title: 'ພະຈິກ', value: 11 },
              { title: 'ທັນວາ', value: 12 },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກເດືອນ']"
            label="ເລືອກເດືອນ"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ວັນທີ"
            type="date"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກວັນທີ']"
            required
          >
          </v-text-field>
          <v-autocomplete
            :items="[
              { title: 'ວັນພັກ (Holiday)', value: 'H' },
              { title: 'ວັນເຮັດວຽກ (Working Day)', value: 'W' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກປະເພດວັນ']"
            label="ເລືອກປະເພດວັນ"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-autocomplete
            :items="[
              { title: 'ເປິດໃຊ້ງານ', value: 'O' },
              { title: 'ປິດໃຊ້ງານ', value: 'C' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະໃຊ້ງານ']"
            label="ເລືອກສະຖານະໃຊ້ງານ"
            variant="outlined"
            required
          />
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ລະຫັດຜູ້ບັນທຶກ"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດຜູ້ບັນທຶກ']"
            required
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
          @click="goPath('/holiday')"
        />
      </v-col>
    </v-form>
  </v-col>
</template>