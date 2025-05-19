<script setup lang="ts">
const valid = ref(false);
const form = ref();
const moduleStore = ModulesStore();
const module = computed(()=>{
    return moduleStore.response_data_module;

})
onMounted(()=>{
    moduleStore.getModule();
})
const Districtions = () => {
  valid.value = !valid.value;
};
const submitMainmenu = async () => {
  valid.value = await form.value.validate();
  if (valid) {
    await menuStore.CreateMainMenu();
  }
  console.log(valid.value);
};
const title = "ສ້າງຂໍ້ມູນເມນູຫຼັກ";
const menuStore = useMenuStore();
const request = computed(() => {
  return menuStore.create_form_mainmenu;
});
</script>
<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-col cols="12">
      <v-form ref="form" @submit.prevent="submitMainmenu">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              @click:append-inner="Districtions"
              density="compact"
              v-model="request.menu_name_la"
              label="ຊື່ເມນູພາສາລາວ"
              variant="outlined"
              required
            />
            <v-text-field
              density="compact"
              v-model="request.memu_id"
              label="ID ເມນູ"
              variant="outlined"
              required
            />
            <v-autocomplete
              :items="module ? module : []"
              item-title="module_name_la"
              item-value="module_Id"
              density="compact"
              v-model="request.module_Id"
              :rules="[(v) => !!v || 'ສະຖານະໃຊ້ງານ!']"
              label="ເລືອກເມນູສາຂາ"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              density="compact"
              v-model="request.menu_name_en"
              label="ຊື່ເມນູພາສາອັງກິດ"
              variant="outlined"
              required
            />
            <v-text-field
              density="compact"
              v-model="request.menu_order"
              label="ລຳດັບເມນູ"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              density="compact"
              v-model="request.menu_icon"
              label="ໄອຄອນ"
              variant="outlined"
              required
            />
            <v-autocomplete
              :items="[
                { title: 'ເປິດ', value: 'Y' },
                { title: 'ປິດ', value: 'N' },
              ]"
              item-title="title"
              item-value="value"
              density="compact"
              v-model="request.is_active"
              :rules="[(v) => !!v || 'ສະຖານະໃຊ້ງານ!']"
              label="ເລືອກສະຖານະໃຊ້ງານ"
              variant="outlined"
              required
            />
         
          </v-col>
        </v-row>
        <v-btn text="ບັນທຶກ" color="primary" type="submit"></v-btn>
        <p color="res">ເຈົ້າຍັງສ້ງບໍ່ທັນແລ້ວເດີ້</p>
      </v-form>
    </v-col>
  </v-container>
</template>
