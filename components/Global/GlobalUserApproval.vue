<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  item: {
    user_id: string;
    user_name: string;
    Auth_Status: "A" | "U" | string;
  };
  rolePermissions?: any;
  loading?: boolean;
  onApprove?: (item: any) => Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rolePermissions: null,
  onApprove: undefined,
});

const emit = defineEmits<{
  approve: [item: any];
}>();

const isApproved = computed(() => props.item.Auth_Status === "A");

const hasPermission = computed(() => {
  if (!props.rolePermissions) return true;
  return props.rolePermissions?.[0]?.Auth_Detail === 1;
});

const buttonColor = computed(() => {
  return isApproved.value ? "success" : "warning";
});

const buttonIcon = computed(() => {
  if (!isApproved.value) {
    return "mdi-toggle-switch-off-outline";
  }
  // return isApproved.value
});

const buttonTitle = computed(() => {
  return isApproved.value ? "ອະນຸມັດແລ້ວ" : "ຄລິກເພື່ອອະນຸມັດ";
});

// Methods
const handleApproval = async () => {
  if (props.onApprove) {
    await props.onApprove(props.item);
  } else {
    emit("approve", props.item);
  }
};
</script>

<template>
  <v-btn
  class="d-flex align-center"
    v-if="hasPermission"
    :color="buttonColor"
    :icon="buttonIcon"
    variant="text"
    size="small"
    :loading="loading"
    :disabled="isApproved"
    @click="handleApproval"
    :class="{
      'disabled-btn': isApproved,
    }"
    :title="buttonTitle"
  />

  <v-icon v-if="isApproved" color="success" size="small" class="d-flex ml-3 align-center">
    mdi-toggle-switch
  </v-icon>
</template>

<style scoped>
.disabled-btn {
  opacity: 0.6;
  pointer-events: none;
  filter: grayscale(20%);
}
</style>
