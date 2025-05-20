<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/helpers/axios';

// ໂຕແປອ້າງອີງຟອມ
const valid = ref(false);
const form = ref();
const title = "ສ້າງຂໍ້ມູນຟັງຊັ້ນ";
const errorMessage = ref('');

// ໂຕແປຄວບຄຸມຟອມ
const functionForm = ref({
  function_id: '',
  description_la: '',
  description_en: '',
  eod_function: 'N', // ຄ່າເລີ່ມຕົ້ນ
  function_order: 1,
  is_active: 'Y', // ຄ່າເລີ່ມຕົ້ນ
  created_by: '',
  sub_menu_id: ''
});

// ສ້າງ Router
const router = useRouter();

// ຟັງຊັ່ນສ້າງຟັງຊັ້ນ
const createFunction = async () => {
  try {
    // ກວດສອບຟອມ
    const { valid: isValid } = await form.value.validate();
    
    if (isValid) {
      errorMessage.value = '';
      
      // ກຽມຂໍ້ມູນສົ່ງ
      const dataToSend = {
        ...functionForm.value,
        created_date: new Date().toISOString(),
        modified_date: null
      };

      // ສົ່ງຂໍ້ມູນໄປ API
      const response = await axios.post('/api/functions', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // ກວດສອບຄວາມສຳເລັດ
      if (response.status === 201) {
        // ສະແດງຂໍ້ຄວາມສຳເລັດ
        await CallSwal({
          title: "ສຳເລັດ",
          text: "ສ້າງຟັງຊັ້ນສຳເລັດ",
          icon: "success",
          showCancelButton: false
        });

        // ນຳທາງໄປຫນ້າລາຍການ
        router.push('/functions');
      }
    }
  } catch (error) {
    // ຈັດການຂໍ້ຜິດພາດ
    errorMessage.value = 'ເກີດຂໍ້ຜິດພາດໃນການສ້າງຟັງຊັ້ນ';
    
    // ສະແດງຂໍ້ຄວາມຜິດພາດ
    await CallSwal({
      title: "ບໍ່ສຳເລັດ",
      text: "ບໍ່ສາມາດສ້າງຟັງຊັ້ນ: " + error,
      icon: "error"
    });

    console.error(error);
  }
};

// ຟັງຊັ່ນຍົກເລີກ
const cancelCreate = () => {
  router.push('/functions');
};
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />

    <!-- ສະແດງຂໍ້ຄວາມຜິດພາດ -->
    <v-alert 
      v-if="errorMessage" 
      type="error" 
      class="mb-4"
    >
      {{ errorMessage }}
    </v-alert>

    <v-form ref="form" @submit.prevent="createFunction">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            density="compact"
            v-model="functionForm.function_id"
            label="ລະຫັດຟັງຊັ້ນ"
            variant="outlined"
            :rules="[v => !!v || 'ລະຫັດຟັງຊັ້ນຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="functionForm.description_la"
            label="ຄຳອະທິບາຍ (ພາສາລາວ)"
            variant="outlined"
            :rules="[v => !!v || 'ຄຳອະທິບາຍຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="functionForm.sub_menu_id"
            label="ລະຫັດເມນູຍ່ອຍ"
            variant="outlined"
            :rules="[v => !!v || 'ລະຫັດເມນູຍ່ອຍຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            density="compact"
            v-model="functionForm.function_order"
            type="number"
            label="ລຳດັບຟັງຊັ້ນ"
            variant="outlined"
            :rules="[v => !!v || 'ລຳດັບຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-text-field
            density="compact"
            v-model="functionForm.description_en"
            label="ຄຳອະທິບາຍ (ພາສາອັງກິດ)"
            variant="outlined"
            :rules="[v => !!v || 'ຄຳອະທິບາຍຕ້ອງບໍ່ຫວ່າງ']"
            required
          />
          <v-autocomplete
            :items="[
              { title: 'ໃຊ່', value: 'Y' },
              { title: 'ບໍ່ໃຫ່', value: 'N' },
            ]"
            density="compact"
            v-model="functionForm.eod_function"
            label="ຟັງຊັ້ນປິດບັນຊີປະຈຳວັນ"
            variant="outlined"
            :rules="[v => !!v || 'ກະລຸນາເລືອກ']"
            required
          />
        </v-col>
        <v-col cols="12">
          <v-autocomplete
            :items="[
              { title: 'ເປີດໃຊ້ງານ', value: 'Y' },
              { title: 'ປິດໃຊ້ງານ', value: 'N' },
            ]"
            density="compact"
            v-model="functionForm.is_active"
            label="ສະຖານະການໃຊ້ງານ"
            variant="outlined"
            :rules="[v => !!v || 'ກະລຸນາເລືອກສະຖານະ']"
            required
          />
        </v-col>
      </v-row>
      
      <!-- ປຸ່ມດຳເນີນການ -->
      <v-col cols="12" class="d-flex justify-center">
        <v-btn 
          type="submit" 
          color="primary" 
          class="mr-2"
        >
          ບັນທຶກ
        </v-btn>
        <v-btn 
          color="error" 
          @click="cancelCreate"
        >
          ຍົກເລີກ
        </v-btn>
      </v-col>
    </v-form>
  </v-container>
</template>