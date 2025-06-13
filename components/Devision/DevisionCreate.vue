<script setup lang="ts">
import { UseCategoryStore } from "~/stores/category";
import { onMounted } from "vue";
import { goPath } from "~/composables/global";
import { CallSwal } from "~/composables/global";
import { DefaultSwalError } from "~/composables/global";
const Headers = [
  { title: "ລຳດັບ", value: "index" },
  { title: "ລະຫັດພະແນກ", value: "div_id" },
  { title: "ຊື່ພາສາລາວ", value: "division_name_la" },
  { title: "ຊື່ພາສາອັງກິດ", value: "division_name_en" },
  { title: "ສະຖານະການໃຊ້ງານ", value: "Once_Auth" },
  // { title: "ສະຖານະການອານຸມັດ", value: "Auth_Status" },
  { title: "ຈັດການ", value: "Actions" },
];

const categories = UseCategoryStore();
const response_data = computed(() => categories.categories);
console.log(response_data.value, "response_data");

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
    goPath("/devision");
  }
};
const title = "ຂໍ້ມູນພະແນກ";
</script>

<template>
  <div class="pa-4">
  <v-col cols="12" class="pt-5">
    <global-text-title-line
      :title="`ໜ້າຈັດການຂໍ້ມູນພະແນກ / Manage Department(${formatnumber(
        response_data?.length ?? 0
      )})`"
    />
    <div class="d-flex mt-2">
      <v-btn color="primary" @click="goPath('/devision/create')"
        ><v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດ</v-btn
      >
    </div>
  </v-col>
  <v-data-table :items="response_data" :headers="Headers" class="text-no-wrap">
    <template v-slot:item.index="{ item, index }">
      {{ index + 1 }}
    </template>

    <template v-slot:item.Once_Auth="{ item }">
      <div v-if="item.Once_Auth === 'A'">
        <v-chip color="green"><p>ເປີດໃຊ້ງານ</p> </v-chip>
      </div>
      <div v-else="item.Once_Auth === 'U'">
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

    <template v-slot:item.Actions="{ item }">
      <v-btn
        small
        flat
        class="text-primary"
        icon="mdi-eye-outline"
        @click="goPath(`/devision/detail?div_id=${item.div_id}`)"
      />
      <v-btn
        small
        flat
        class="text-info"
        icon="mdi-pen"
        @click="goPath(`/devision/update?div_id=${item.div_id}`)"
      />
      <v-btn
        small
        flat
        class="text-error"
        icon="mdi-delete-outline"
        @click="onDeleteType(item.div_id)"
      />
    </template>
  </v-data-table></div>
</template>
