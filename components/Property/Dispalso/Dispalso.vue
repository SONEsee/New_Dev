<script setup lang="ts">
const dispalsoStore = useDispoalStore();
const dataDispalso = computed(() => {
  const data = dispalsoStore.from_create_disposal;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
});
onMounted(() => {
  dispalsoStore.getDispalso();
});
</script>
<template>
    <div><pre>{{ dataDispalso }}</pre></div>
</template>
