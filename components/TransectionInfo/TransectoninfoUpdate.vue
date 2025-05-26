<script setup lang="ts">

const title = "ອັບເດດຂໍ້ມູນປະເພດທຸລະກຳ";
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
          goPath("/transetioninfo");
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
            label="ຊື່ຟັງຊັ້ນ (ພາສາລາວ)"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນ']"
            required
          >
          </v-text-field>
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຊື່ປະເພດຖຸລະກຳ"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນ']"
            required
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຊື່ຟັງຊັ້ນ (ພາສາລາວ)"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນ']"
            required
          >
          </v-text-field>
          <v-text-field
            @click:append-inner="Destription"
            density="compact"
            variant="outlined"
            label="ຊື່ປະເພດຖຸລະກຳ"
            :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນ']"
            required
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-autocomplete
            :items="[
              { title: 'ເປິດ', value: 'O' },
              { title: 'ປິດ', value: 'C' },
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
          @click="goPath('/transetioninfo')"
        />
      </v-col>
    </v-form>
  </v-col>
</template>
