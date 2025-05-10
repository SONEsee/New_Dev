<script setup lang="ts">
import { UseCategoryStore } from "~/stores/category";
import { onMounted } from "vue";
import { goPath } from "~/composables/global";
import { CallSwal } from "~/composables/global";
import { DefaultSwalError } from "~/composables/global";
const Headers = [
  { title: "ລຳດັບ", value: "index" },
  { title: "ລະຫັດພະແນກ", value: "Div_Id" },
  { title: "ຊື່ພາສາລາວ", value: "Div_NameL" },
  { title: "ຊື່ພາສາອັງກິດ", value: "Div_NameE" },
  { title: "ສະຖານະການໃຊ້ງານ", value: "Record_Status" },
  { title: "ສະຖານະການອານຸມັດ", value: "Auth_Status" },
  { title: "ຈັດການ", value: "Actions" },
];

const categories = UseCategoryStore();
const response_data = computed(() => categories.categories);
console.log(response_data.value);

onMounted(() => {
  categories.GetListData();
});
const onDeleteType = async (Div_Id: string) => {
  
  const result = await categories.DeleteCategory(Div_Id);
 
  if (result) {
    await CallSwal({
      icon: "success",
      title: "ສຳເລັດ",
      text: "ລົບຂໍ້ມູນສຳເລັດ",
      showConfirmButton: false,
      timer: 1500,
    });
    
    
  }
};
</script>

<template>
  <v-col cols="12">
    <div class="d-flex justify-end">
      <v-btn color="primary" @click="goPath('/devision/create')"
        ><v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດ</v-btn
      >
    </div>
  </v-col>

  <v-data-table :items="response_data" :headers="Headers" class="text-no-wrap">
    <template v-slot:item.index="{ item, index }">
      {{ index + 1 }}
    </template>

    <template v-slot:item.Record_Status="{ item }">
      <div v-if="item.Record_Status === 'O'">
        <v-chip color="green"><p>ເປີດໃຊ້ງານ</p> </v-chip>
      </div>
      <div v-else="item.Record_Status === 'C'">
        <v-chip color="red"><p>ປີດໃຊ້ງານ</p> </v-chip>
      </div>
    </template>
    <template v-slot:item.Auth_Status="{ item }">
      <div v-if="item.Auth_Status === 'A'">
        <v-chip color="green"><p>ອານຸມັດແລ້ວ</p> </v-chip>
      </div>
      <div v-else="item.Auth_Status === 'U'">
        <v-chip color="yellow"><p>ຍັງບໍ່ທັນອານຸມັດ</p> </v-chip>
      </div>
    </template>
    <!-- <template v-slot:item.UpdatedAt="{ item }">
      {{ new Date(item.UpdatedAt).toLocaleDateString() }}
    </template> -->

    <template v-slot:item.Actions="{ item }">
      <v-btn
        small
        flat
        class="text-primary"
        icon="mdi-eye-outline"
        @click="goPath(`/category/detail?id=${item.ID}`)"
      />
      <v-btn
        small
        flat
        class="text-info"
        icon="mdi-pen"
        @click="goPath(`/category/update?id=${item.ID}`)"
      />
      <v-btn
        small
        flat
        class="text-error"
        icon="mdi-delete-outline"
        @click="onDeleteType(item.Div_Id)"
      />
    </template>
  </v-data-table>
</template>
