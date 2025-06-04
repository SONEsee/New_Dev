<script setup lang="ts">
const glStore = useGlStore();
const res = computed((): any[] => {
  return (glStore.respons_gl_sup as any) || [];
});
onMounted(() => {
  glStore.getGlsup();
});
const header = [
  { title: "ລະຫັດ", value: "gl_code" },
  { title: "ຊື່ Gl sup", value: "gl_Desc_la" },
  { title: "ຊື່ Gl sup (EN)", value: "gl_Desc_en" },
  { title: "Gl Type", value: "glType" },
  { title: "Category", value: "category" },
  { title: "Retal", value: "retal" },
  { title: "CCY Res", value: "ccy_Res" },
  { title: "Res Ccy", value: "Res_ccy" },
  { title: "Allow Back Period Entry", value: "Allow_BackPeriodEntry" },
  { title: "PL Split ReqD", value: "pl_Split_ReqD" },
  { title: "ຈັດການ", value: "action" },
];
const title = "ຈັດການຂໍ້ມູນ Gl sup";
</script>
<template>
  <GlobalTextTitleLine :title="title" />
  <v-data-table
    :items="res"
    :loading="glStore.isloading"
    :headers="header"
    class="elevation-1"
  >
  </v-data-table>
</template>
