<script setup lang="ts">
import axios from "@/helpers/axios";
const title = "ແກ້ໄຂຂໍ້ມູນບັນຊີ GL Master";
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
          goPath("/glmaster");
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
            label="ລະຫັດ GL (ສູງສຸດ 7 ຕົວເລກ)"
            type="text"
            maxlength="7"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດ GL', (v) => /^\d{1,7}$/.test(v) || 'ຕ້ອງເປັນຕົວເລກ 1-7 ຕົວ']"
            required
          >
          </v-text-field>
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຊື່ເລກບັນຊີ"
            maxlength="250"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ເລກບັນຊີ']"
            required
          >
          </v-text-field>
          <v-autocomplete
            :items="[
              { title: 'ຂັ້ນທີ 1', value: '1' },
              { title: 'ຂັ້ນທີ 2', value: '2' },
              { title: 'ຂັ້ນທີ 3', value: '3' },
              { title: 'ຂັ້ນທີ 4', value: '4' },
              { title: 'ຂັ້ນທີ 5', value: '5' },
              { title: 'ຂັ້ນທີ 6', value: '6' },
              { title: 'ຂັ້ນທີ 7', value: '7' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກຂັ້ນບັນຊີ']"
            label="ເລືອກຂັ້ນບັນຊີ (1-7)"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
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
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກປະເພດບັນຊີ']"
            label="ເລືອກປະເພດບັນຊີ"
            variant="outlined"
            required
          />
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ໜວດບັນຊີ"
            maxlength="1"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນໜວດບັນຊີ']"
            required
          >
          </v-text-field>
          <v-autocomplete
            :items="[
              { title: 'Y = Yes (ມີການຕີມູນຄ່າ)', value: 'Y' },
              { title: 'N = No (ບໍ່ມີການຕີມູນຄ່າ)', value: 'N' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກການຕີມູນຄ່າ']"
            label="ການຕີມູນຄ່າທາງດ້ານບັນຊີ"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-autocomplete
            :items="[
              { title: 'S = Single Currency (ສະກຸນດຽວ)', value: 'S' },
              { title: 'F = All Foreign Currencies (ສະກຸນຕ່າງປະເທດທັງໝົດ)', value: 'F' },
              { title: 'A = All Currencies (ທຸກສະກຸນ)', value: 'A' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະກຸນເງິນ']"
            label="ສາມາດໃຊ້ສະກຸນເງິນ"
            variant="outlined"
            required
          />
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ລະຫັດສະກຸນເງິນ (ສໍາລັບ Single Currency)"
            maxlength="20"
            placeholder="ເຊັ່ນ: LAK, USD, THB"
          >
          </v-text-field>
          <v-autocomplete
            :items="[
              { title: 'Y = Yes (ສາມາດລົງຍ້ອນຫຼັງໄດ້)', value: 'Y' },
              { title: 'N = No (ບໍ່ສາມາດລົງຍ້ອນຫຼັງ)', value: 'N' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກສິດລົງຍ້ອນຫຼັງ']"
            label="ອະນຸຍາດລົງຍ້ອນຫຼັງ"
            variant="outlined"
            required
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="3">
          <v-autocomplete
            :items="[
              { title: 'Y = Yes (ຕ້ອງການແບ່ງ P&L)', value: 'Y' },
              { title: 'N = No (ບໍ່ຕ້ອງການແບ່ງ P&L)', value: 'N' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກການແບ່ງ P&L']"
            label="ກຳນົດການຕີມູນຄ່າແບບ 2 ຮູບແບບ"
            variant="outlined"
            required
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ບັນຊີກຳໄລການຊື້ຂາຍ"
            maxlength="50"
            placeholder="ເຊັ່ນ: 5001001"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ບັນຊີຂາດທຶນການຊື້ຂາຍ"
            maxlength="50"
            placeholder="ເຊັ່ນ: 4001001"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ລະຫັດຜູ້ບັນທຶກ"
            maxlength="20"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດຜູ້ບັນທຶກ']"
            required
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ບັນຊີກຳໄລຈາກຍອດເຫຼືອທ້າຍມື້"
            maxlength="50"
            placeholder="ເຊັ່ນ: 5001002"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ບັນຊີຂາດທຶນຈາກຍອດເຫຼືອທ້າຍມື້"
            maxlength="50"
            placeholder="ເຊັ່ນ: 4001002"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="12">
          <v-autocomplete
            :items="[
              { title: 'O = Open (ເປີດໃຊ້ງານ)', value: 'O' },
              { title: 'C = Close (ປິດໃຊ້ງານ)', value: 'C' },
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະໃຊ້ງານ']"
            label="ເລືອກສະຖານະໃຊ້ງານ"
            variant="outlined"
            required
          />
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
          @click="goPath('/glmaster')"
        />
      </v-col>
    </v-form>
  </v-col>
</template>