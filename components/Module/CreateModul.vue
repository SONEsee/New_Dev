<script setup lang="ts">
const title = "ສ້າງຂໍ້ມູນຟັງຊັ້ນ";
const moduleStore = ModulesStore();
const valid = ref(false);
const form = ref();
const DeviceDistributins = ()=>{
    valid.value = !valid.value;
}
const Create = async ()=>{
    const valid = await form.value.validate();
    if(valid){
        console.log("success")
    }
}
</script>
<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-form ref="form" @submit.privent="Create">
      <v-col cols="12">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
            @click:append-inner="DeviceDistributins"
              v-model="moduleStore.create_form_module.module_name_la"
              density="compact"
              variant="outlined"
              label="ຊື່ຟັງຊັ້ນ (ພາສາລາວ)"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.create_form_module.module_name_en"
              density="compact"
              variant="outlined"
              label="ຊື່ຟັງຊັ້ນ (ພາສາອັງກິດ)"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.create_form_module.module_icon"
              density="compact"
              variant="outlined"
              label="ໄອຄອນຟັງຊັ້ນ (ເຊັ່ນ mdi-home)"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.create_form_module.module_order"
              density="compact"
              variant="outlined"
              label="ລຳດັບຟັງຊັ້ນ (ເຊັ່ນ 1, 2, 3)"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.create_form_module.module_icon"
              density="compact"
              variant="outlined"
              label="ໄອຄອນຟັງຊັ້ນ (ເຊັ່ນ mdi-home)"
            >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-autocomplete
              :items="[
                { title: 'ເປິດ', value: 'Y' },
                { title: 'ປິດ', value: 'N' },
              ]"
              item-title="title"
              item-value="value"
              density="compact"
              v-model="moduleStore.create_form_module.is_active"
              :rules="[(v) => !!v || 'ສະຖານະໃຊ້ງານ!']"
              label="ເລືອກສະຖານະໃຊ້ງານ"
              variant="outlined"
              required
          /></v-col>
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
            @click="goPath('/module')"
          />
        </v-col>
      </v-col>
    </v-form>
  </v-container>
</template>
