<script setup lang="ts">
const menuStore = useMenuStore();
const title = "ລາຍລະອຽດເມນູ";
const res = computed(() => {
  return menuStore.respone_menu_detail_data;
});
</script>
<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />
    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="4">
          <GlobalCardTitle
            :title="'ຊື່ເມນູພາສາລາວ'"
            :text="res?.menu_name_la"
          />
          <GlobalCardTitle
            :title="'ໄອດີເມນູ'"
            :text="res?.menu_id"
          />
        </v-col>
        <v-col cols="12" md="4">
          <GlobalCardTitle
            :title="'ຊື່ເມນູພາສາອັງກິດ'"
            :text="res?.menu_name_en"
          />
          <GlobalCardTitle
            :title="'ລຳດັບເມນູ'"
            :text="res?.menu_order"
          />
        </v-col>
        <v-col cols="12" md="4">
          <GlobalCardTitle
            :title="'ຊື່ເມນູພາສາລາວ'"
            :text="res?.menu_icon"
          />
          <GlobalCardTitle
            :title="'ສະນະໃຊ້ງານ'"
            :text="res?.is_active"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-container>
  
</template>
