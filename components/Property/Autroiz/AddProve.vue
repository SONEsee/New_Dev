<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
const id = Number(route.query.id_autoriz);
const title = "ອະນຸມັດລາຍການ";
const mainStore = useFassetLidtDescription();
const datadetail = computed(() => {
  return mainStore.respons_data_driscription_main;
});

onMounted(() => {
  mainStore.getDataDetail(id);
});
</script>
<template>
  <div class="pa-4">
    <GlobalTextTitleLine :title="title" />
    <pre>{{ datadetail }}</pre>
    <v-card style="border: 1px #64b5f6 solid">
      <v-card-title style="background-color: #64b5f6">
        ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ
      </v-card-title>
      <v-col cols="12">
        <v-row>
          <v-col cols="4">
            <GlobalCardTitle
              :title="'ລະຫັດຊັບສິນ'"
              :text="datadetail?.asset_list_id_detail.asset_list_id"
            />
          </v-col>
          <v-col cols="4">
            <GlobalCardTitle
              :title="'ຊື່ຊັບສົມບັດ'"
              :text="datadetail?.asset_list_id_detail.asset_spec"
            />
          </v-col>
          <v-col cols="4">
            <GlobalCardTitle
              :title="'ຊື່ຊັບສົມບັດ'"
              :text="datadetail?.dpca_desc ?? ''"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-card>
  </div>
</template>
