<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
</script>
<template>
  <section>
    <DeviceBackOffice />
  </section>
</template>
