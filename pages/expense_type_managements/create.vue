<template>
  <section class="pa-6">
    <v-card class="pa-6" min-height="95vh" flat>
      <ExpenTypeManagementsCreateExpenseType />
    </v-card>
  </section>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
</script>
