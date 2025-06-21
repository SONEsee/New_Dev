<script setup lang="ts">
const title = "ສ້າງຂໍ້ມູນປະເພດທຸລະກຳ"
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
</script>
<template>
    <GlobalTextTitleLine :title="title"/>
    <CreateTransectioninfo   />
</template>