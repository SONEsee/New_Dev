<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, onMounted } from "vue";
import { useMenuStore } from "~/stores/menu";
definePageMeta({
  middleware: ['auth'],
  requiresPermission: true,
  subMenuId: 5
})
const menuStore = useMenuStore();
const route = useRoute();

const user_id = localStorage.getItem("user");
let id = null;
if (user_id) {
  try {
    const userData = JSON.parse(user_id);
    id = userData.user_id;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
  }
}

const user_code = route.query.id as string | undefined;

const res = computed(() => {
  return menuStore.respone_menu_data;
});

onMounted(() => {
  const userIdToUse = user_code || id;

  if (userIdToUse) {
    menuStore.Getmenu(userIdToUse);
  } else {
    console.error("No user ID available for fetching menu data");
  }
});
</script>

<template>
  <div>
    <Dashboare />
  </div>
</template>
