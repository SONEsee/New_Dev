<script setup lang="ts">

definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})


</script>

<template>
    <section style="height: 100vh;" >
        <div >
             <DevisionCreate/>
            
        </div>
    </section>
</template>