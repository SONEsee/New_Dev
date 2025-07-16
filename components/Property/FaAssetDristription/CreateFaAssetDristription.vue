<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
const id = route.query.asset_list_id as string;
const title = "ຈັດການຂໍ້ມູນຫັກຄ່າຫຼູ້ຍຫຽ້ນຊັບສົມບັດ";
const fassetStore = faAssetStore();
const dataassets = computed(()=>{
    return fassetStore.response_fa_asset_detail || [];
})
onMounted(()=>{
    fassetStore.GetFaAssetDetail(id);
})
</script>
<template>
<div class="pa-4">
    <GlobalTextTitleLine :title="title" />
<pre>
    {{ dataassets }}
</pre>
</div>
</template>
