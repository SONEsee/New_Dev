<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted } from "vue";
import { UseCategoryStore } from "~/stores/category";

const categoryStore = UseCategoryStore();
const route = useRoute();


onMounted(() => {
  
  
});
</script>
<template>
    <div>
        <UpdateCategory/>
    </div>
</template>