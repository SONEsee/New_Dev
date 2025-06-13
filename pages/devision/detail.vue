<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
</script>

<template>
  <section class="">
    <v-card min-height="95vh" flat class="pa-4">
      <Detail  />
    </v-card>
  </section>
</template>