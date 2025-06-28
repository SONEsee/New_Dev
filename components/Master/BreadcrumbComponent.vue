<template>
  <v-breadcrumbs
    :items="breadcrumbItems"
    class="pa-0"
    density="compact"
  >
    <template #prepend>
      <v-icon icon="mdi-home" size="small"></v-icon>
    </template>
    
    <template #item="{ item }">
      <v-breadcrumbs-item
        :to="item.disabled ? undefined : item.to"
        :disabled="item.disabled"
        class="text-body-2"
      >
        <v-icon 
          v-if="item.icon" 
          :icon="item.icon" 
          size="small" 
          class="mr-1"
        ></v-icon>
        {{ item.title }}
      </v-breadcrumbs-item>
    </template>

    <template #divider>
      <v-icon icon="mdi-chevron-right" size="small"></v-icon>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  current: {
    type: String,
    default: ''
  }
})

const route = useRoute()

const breadcrumbItems = computed(() => {
  const defaultItems = [
    {
      title: 'Admin',
      to: '/admin',
      icon: 'mdi-view-dashboard'
    }
  ]

  // Add custom items
  const customItems = props.items.map(item => ({
    ...item,
    disabled: item.disabled || false
  }))

  // Add current page if specified
  if (props.current) {
    customItems.push({
      title: props.current,
      disabled: true
    })
  }

  return [...defaultItems, ...customItems]
})
</script>

<style scoped>
:deep(.v-breadcrumbs-item) {
  font-size: 0.875rem;
}

:deep(.v-breadcrumbs-item--disabled) {
  color: #666 !important;
}

:deep(.v-breadcrumbs-divider) {
  margin: 0 8px;
  opacity: 0.6;
}
</style>