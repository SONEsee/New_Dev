<script lang="ts" setup>
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
</script>

<template>
  <section
    style="min-height: 100vh"
    class="d-flex flex-column justify-center align-center"
  >
    <Home />
  </section>
</template>
