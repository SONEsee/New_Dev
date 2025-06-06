<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
const id = Number(route.query.id) || 0;

</script>
<template>
    <section style="height: 100vh;" class="d-flex justify-center align-center">
        ກຳລັງພັດທະນາ...  
    </section>
</template>