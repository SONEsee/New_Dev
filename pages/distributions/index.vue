<template>
    <section
    style="min-height: 100vh"
    class=" d-flex justify-center align-center" 
  >
    <DeviceDistributions />
  </section>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
</script>