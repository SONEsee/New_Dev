<script setup lang="ts">
const rout = useRoute();
const id = rout.query.id as string;
const menuStore = useMenuStore();
onMounted(()=>{
    menuStore.getDetailMainMenu(id);
})
</script>
<template>
    <DetailMenu/>
</template>