<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted } from "vue";
import { UseCategoryStore } from "~/stores/category";

const categoryStore = UseCategoryStore();
const route = useRoute();

definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
onMounted(() => {
  
  
});
</script>
<template>
    <div>
        <UpdateCategory/>
    </div>
</template>