<script setup>
import { useStatusToggle } from '~/composables/useStatusToggle';

const { isUpdating, activeInactive } = useStatusToggle();
const agencyStore = UserStore();

const handleUserStatusToggle = async (user) => {
  await activeInactive(user, {
    entityName: 'ຜູ້ໃຊ້ງານ',
    confirmCallback: async (newStatus) => {
      return await agencyStore.UpdateUserStatus(user.user_id, newStatus);
    },
    onSuccess: async () => {
      await agencyStore.GetUser();
    }
  });
};
</script>

<template>
  <v-btn
    v-if="canToggleStatus"
    :color="item.Auth_Status === 'A' ? 'success' : 'warning'"
    :icon="item.Auth_Status === 'A' ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off-outline'"
    variant="text"
    size="small"
    :loading="isUpdating"
    @click="handleUserStatusToggle(item)"
    title="ປ່ຽນສະຖານະຜູ້ໃຊ້ງານ"
  />
</template>