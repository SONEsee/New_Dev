<script setup lang="ts">
const form = ref();
const valid = ref(false);
const menuStore = useMenuStore();
const request = computed(()=>{
return menuStore.create_form_function
})
const subMenuStore = useMenuStore();
const res = computed(() => {
  const data = subMenuStore.response_sub_menu_data  || null;

  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});
onMounted(() => {
  subMenuStore.GetMenuSubMenu();
});
const Dristricption =  ()=>{
valid.value= !valid.value
}
const  submitFunction = async ()=>{
    try {
        const {valid} =await form.value.validate();
        if(valid){
            await menuStore.CreateFunctionMenu()
        }
    } catch (error) {
        console.error("Menu creation failed:", error);
        
    }
}
const title = "ສ້າງຂໍ້ມູນຟັງຊັ້ນ";
</script>
<template>
<GlobalTextTitleLine :title="title" />
<v-col cols="12">
      <v-form ref="form" @submit.prevent="submitFunction">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              @click:append-inner="Dristricption"
              density="compact"
              v-model="request.description_la"
              label="ຊື່ຟັງຊັ້ນພາສາລາວ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນພາສາລາວ']"
              required
            />
            <v-text-field
              density="compact"
              v-model="request.function_id"
              label="ID ເມນູ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນ ID ເມນູ']"
              required
            />
            <v-autocomplete
              :items="res"
              item-title="sub_menu_name_la"
              item-value="sub_menu_id"
              density="compact"
              v-model="request.sub_menu_id"
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກເມນູຍອ່ຍ']"
              label="ເລືອກເມນູຍອ່ຍ"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              density="compact"
              v-model="request.description_en"
              label="ຊື່ຟັງຊັ້ນພາສາອັງກິດ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຟັງຊັ້ນພາສາອັງກິດ']"
              required
            />
            <v-text-field
              density="compact"
              v-model="request.function_order"
              label="ລຳດັບ"
              type="number"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລຳດັບ']"
              required
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              density="compact"
              v-model="request.created_by"
              label="ສ້າງໂດຍ"
              variant="outlined"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນສ້າງໂດຍ']"
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
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະໃຊ້ງານ']"
              label="ເລືອກສະຖານະໃຊ້ງານ"
              variant="outlined"
              required
            />
          </v-col>
          <v-col cols="12" class="d-flex justify-center">
            <v-btn type="submit" color="primary" class="mr-2"> ບັນທຶກ </v-btn>
            <v-btn color="error" @click="$router.push('/menu')">
              ຍົກເລີກ
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-col>

</template>