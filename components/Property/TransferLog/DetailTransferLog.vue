<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, onMounted } from "vue";

const route = useRoute();
const id = route.query.asset_list_id as string;
const title = "ລາຍລະອຽດການເຄື່ອນຍ້າຍຊັບສົມບັດ";
const transactionLog = useTransactionLogStore();

const res = computed(() => {
  const data = transactionLog.responst_transaction_log;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    return [data];
  }

  return [];
});

const items = computed(() => {
  return transactionLog.responst_transaction_log || [];
});

onMounted(() => {
  transactionLog.filter_asset_list.query.asset_list_id = id;
  transactionLog.getDatadetail();
});
</script>

<template>
  <div class="pa-4">
   <GlobalTextTitleLine :title="title" />

    <v-data-table v-if="res.length > 0" :items="res" />
    <v-card v-else class="pa-4 text-center">
      <v-card-text>
        <v-icon size="64" color="grey">mdi-database-off</v-icon>
        <p class="mt-2">ບໍ່ມີຂໍ້ມູນການເຄື່ອນຍ້າຍສຳລັບ Asset ID: {{ id }}</p>
      </v-card-text>
    </v-card>
  </div>
</template>
