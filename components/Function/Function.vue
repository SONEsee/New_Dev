<script setup lang="ts">
const title = "ຈັດການຂໍ້ມູນຟັງຊັ້ນ";
const menuStore = useMenuStore();
const router = useRouter();

const functionData = computed(() => {
  return menuStore.respons_function_menu_data || [];
});

const headers = [
  { title: "ລະຫັດຟັງຊັ້ນ", value: "function_id" },
  { title: "ຄຳອະທິບາຍ (ລາວ)", value: "description_la" },
  { title: "ຄຳອະທິບາຍ (ອັງກິດ)", value: "description_en" },
  { title: "ລຳດັບ", value: "function_order" },
  { title: "ສະຖານະ", value: "is_active" },

  { title: "ຈັດການ", value: "actions" },
];

onMounted(() => {
  menuStore.GetFuntionMenu();
});



const deleteFunction = async (item: any) => {
  try {
    
      await menuStore.DeleteFunctionMenu(item.function_id);
    }catch (error) {
      console.error("Failed to delete function:", error);
    }
  
};

const createNewFunction = () => {
  router.push("/funtion/create");
};
</script>

<template>
  <v-container fluid>
    <GlobalTextTitleLine :title="title" />

    <v-col cols="12">
        <div class="d-flex justify-end">
      <v-btn color="primary" class="mb-4" @click="createNewFunction">
        <v-icon icon="mdi-plus"></v-icon>
        ເພີ່ມຟັງຊັ້ນໃໝ່
      </v-btn></div></v-col
    >

    <v-data-table
      :headers="headers"
      :items="functionData"
      :items-per-page="10"
      density="compact"
    >
      <template v-slot:item.is_active="{ value }">
        <v-chip :color="value === 'Y' ? 'success' : 'error'" size="small">
          {{ value === "Y" ? "ໃຊ້ງານ" : "ປິດໃຊ້ງານ" }}
        </v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
                color="primary"
                icon="mdi-eye"
                variant="text"
                @click="goPath(`/funtion/detail?id=${item.function_id}`)"
                size="small"
              ></v-btn>
        <v-btn icon variant="text" color="primary" @click="goPath(`/funtion/edit?id=${item.function_id}`)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon variant="text" color="error" @click="deleteFunction(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>
