<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
</script>

<template>
  <section class="pa-6">
    <v-card class="pa-6" flat min-height="95vh">
      <ExpenTypeManagementsDetailExpense />
    </v-card>
  </section>
</template>
