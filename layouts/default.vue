<script lang="ts" setup></script>

<template>
  <v-layout>
    <AppHeader />
    <v-main>
      <slot />
    </v-main>
  </v-layout>
</template>
<script lang="ts" setup>
useHead({
  titleTemplate: 'SAMC ',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'ລາຍລະອຽດລະບົບ' }
  ]
});
</script>