<template>
    <div>
        <UpdateExpenseTypeManagemeents />
    </div>
</template>
<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
</script>