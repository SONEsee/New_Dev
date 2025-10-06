<!-- components/DatePickerDMY.vue -->
<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ props }">
      <v-text-field
        :model-value="displayValue"
        :label="label"
        :placeholder="placeholder"
        :rules="rules"
        prepend-inner-icon="mdi-calendar"
        readonly
        density="compact"
        variant="outlined"
        hide-details="auto"
        v-bind="props"
        clearable
        @click:clear="clear"
      >
        <template v-slot:append-inner>
          <v-icon>mdi-calendar</v-icon>
        </template>
      </v-text-field>
    </template>
    
    <v-card>
      <v-date-picker
        v-model="internalDate"
        :max="max"
        :min="min"
        scrollable
        color="primary"
      ></v-date-picker>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="menu = false">
          Cancel
        </v-btn>
        <v-btn 
          color="primary" 
          variant="flat"
          @click="confirm"
        >
          Select
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  modelValue: string;  // YYYY-MM-DD
  label?: string;
  placeholder?: string;
  rules?: any[];
  min?: string;
  max?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'ເລືອກວັນທີ',
  placeholder: 'DD/MM/YYYY',
  rules: () => [],
  max: () => new Date().toISOString().split('T')[0]
});

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const menu = ref(false);
const internalDate = ref<Date | null>(null);

// Display as DD/MM/YYYY
const displayValue = computed(() => {
  if (!props.modelValue) return '';
  const [year, month, day] = props.modelValue.split('-');
  return `${day}/${month}/${year}`;
});

// Confirm selection
const confirm = () => {
  if (internalDate.value) {
    emit('update:modelValue', internalDate.value);
  }
  menu.value = false;
};

// Clear
const clear = () => {
  emit('update:modelValue', '');
  internalDate.value = null;
};

// Sync with modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      internalDate.value = new Date(newVal);
    }
  },
  { immediate: true }
);
</script>