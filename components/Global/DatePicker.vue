<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ props: menuProps }">
      <v-text-field
        :model-value="formattedDate"
        :label="label"
        :placeholder="placeholder"
        :rules="rules"
        :disabled="disabled"
        prepend-inner-icon="mdi-calendar"
        readonly
        density="compact"
        variant="outlined"
        hide-details="auto"
        v-bind="menuProps"
        clearable
        @click:clear="clearDate"
      ></v-text-field>
    </template>
    
    <v-date-picker
      v-model="pickerDate"
      @update:model-value="selectDate"
      :min="min"
      :max="max"
      :title="pickerTitle"
      scrollable
      color="primary"
    ></v-date-picker>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  modelValue: string;  
  label?: string;
  placeholder?: string;
  rules?: any[];
  disabled?: boolean;
  min?: string;
  max?: string;
  pickerTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'ເລືອກວັນທີ',
  placeholder: 'DD-MM-YYYY',
  rules: () => [],
  disabled: false,
  max: () => new Date().toISOString().split('T')[0],
  pickerTitle: 'ເລືອກວັນທີ'
});

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>();

const menu = ref(false);
const pickerDate = ref<Date | null>(null);


const formattedDate = computed(() => {
  if (!props.modelValue) return '';
  const [year, month, day] = props.modelValue.split('-');
  return `${day}-${month}-${year}`;
});


const selectDate = (date: any) => {
  if (date) {
    emit('update:modelValue', date);
    pickerDate.value = new Date(date);
  }
  menu.value = false;
};


const clearDate = () => {
  emit('update:modelValue', '');
  pickerDate.value = null;
};


watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      pickerDate.value = new Date(newVal);
    }
  },
  { immediate: true }
);
</script>