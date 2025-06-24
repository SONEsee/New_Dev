<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const faAssetStoreInstance = faAssetStore();
const res = computed(() => {
  return faAssetStoreInstance.response_fa_asset_detail;
});
const route = useRoute();

const router = useRouter();

const asset_id = route.query.id_faasset as string;
onMounted(() => {
  faAssetStoreInstance.GetFaAssetDetail(asset_id);
});
const title = ref("ລາຍລະອຽດຊັບສົມບັດຄົງທີ່");
const loading = ref(false);
</script>

<template>
  <div class="pa-2">
  <v-col cols="12">
    <GlobalTextTitleLine :title="title" />
  </v-col>
  <pre>
     {{ res }}
     <v-row>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ລະຫັດຊັບສິນ'" :text="res?.asset_list_id" />
      </v-col>
      <v-col cols="12" md="3">
        <GlobalCardTitle :title="'ລາຍການຊັບສິນ'" :text="res?.asset_id_detail.asset_name_la" />
      </v-col>
     </v-row>
  </pre></div>
</template>

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.v-timeline-item {
  min-height: 60px;
}

.v-card-title {
  word-break: break-word;
}

.d-flex.gap-2 > * {
  margin-right: 8px;
}

.d-flex.gap-2 > *:last-child {
  margin-right: 0;
}
</style>
