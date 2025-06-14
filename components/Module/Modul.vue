<script setup lang="ts">
import dayjs from "#build/dayjs.imports.mjs";
const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canAuthorize,
  hasPermission,
  initializeRole,

} = useRolePermissions();
const isUpdatingStatus = ref(false);
const updateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;

    const res = await axios.post(
      `api/users/${id}/authorize/`,
      {},
      {
        // ເພີ່ມ {} ສຳລັບ body
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (res.status === 200) {
      // ສຳເລັດ - refresh data
      await agencyStore.GetUser();

      await CallSwal({
        icon: "success",
        title: "ສຳເລັດ",
        text: "ອະນຸມັດຜູ້ໃຊ້ງານແລ້ວ",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  } catch (error) {
    console.error("Error updating approve status:", error);

    await CallSwal({
      icon: "error",
      title: "ເກີດຂໍ້ຜິດພາດ",
      text: "ບໍ່ສາມາດອະນຸມັດຜູ້ໃຊ້ງານໄດ້",
    });
  } finally {
    isUpdatingStatus.value = false;
  }
};

// ຫຼື ຖ້າຢາກໃຫ້ມີ confirmation dialog
const toggleUserStatus = async (user: any) => {
  try {
    const result = await CallSwal({
      icon: "question",
      title: "ຢືນຢັນການອະນຸມັດ",
      text: `ທ່ານຕ້ອງການອະນຸມັດຜູ້ໃຊ້ງານ "${user.user_name}" ບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ອະນຸມັດ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#4CAF50",
    });

    if (result.isConfirmed) {
      await updateAdproveStatus(user.user_id);
    }
  } catch (error) {
    console.error("Error in toggleUserStatus:", error);
  }
};
const roleStore = RoleStore();
const role1 = computed(() => {
  return roleStore.responst_data_detail;
});
const moduleStore = ModulesStore();
const res = computed(() => {
  const data = moduleStore.response_data_module;

  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
});
onMounted(() => {
  moduleStore.getModule();
  initializeRole();
  roleStore.GetRoleDetail();
});
const onDeleteType = async (module_Id: string) => {
  await moduleStore.deleteModule(module_Id);
  moduleStore.getModule();
};
const title = "ຂໍ້ມູນໂມດູນຂອງລະບົບ";
const header = [
  { title: "ລະຫັດ", value: "module_Id" },
  { title: "ຊື່ໂມດູນພາສາລາວ", value: "module_name_la" },
  { title: "ຊື່ໂມດູນພາສາອັງກິດ", value: "module_name_en" },
  { title: "ລຳດັບ", value: "module_order" },
  { title: "ສະຖານະການໃຊ້ງານ", value: "is_active" },
  // { title: "ມື້ສ້າງຂໍ້ມູນ", value: "created_date" },
  { title: "ອານຸມັດ", value: "confirm",align: "center" },
  { title: "ຈັດການ", value: "action" , align: "center" },
];
</script>
<template>
  <div class="pa-5 mt-2">
    <GlobalTextTitleLine :title="title" />
    <v-col cols="12">
      <div class="d-flex">
        <v-btn color="primary" @click="goPath('/module/create')"
        v-if="canAdd"
          ><v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດ</v-btn
        >
      </div>
    </v-col>

    <v-data-table :headers="header" :items="res || []" class="elevation-1">
      <template v-slot:item.created_date="{ item }">
        {{ dayjs(item.created_date).format("DD/MM/YYYY") }}
      </template>
      <template v-slot:item.is_active="{ item }">
        <v-chip :color="item.is_active ? 'green' : 'red'">
          {{ item.is_active ? "ໃຊ້ງານ" : "ບໍ່ໃຊ້ງານ" }}</v-chip
        >
      </template>

       <template v-slot:item.confirm="{ item }">
  <div class="d-flex align-center">
    <v-btn
      v-if="(role1 as any)?.[0]?.Auth_Detail === 1"
      :color="item.is_active === 'Y' ? 'success' : 'warning'"
      :icon="
        item.is_active === 'Y'
          ? 'mdi-check-circle'
          : 'mdi-toggle-switch-off-outline'
      "
      variant="text"
      size="small"
      :loading="isUpdatingStatus"
      :disabled="item.is_active === 'Y'"
      @click="updateAdproveStatus(item.sub_menu_id)"
      :class="{
        'disabled-btn': item.is_active === 'Y'
      }"
      :title="item.is_active === 'Y' ? 'ອະນຸມັດແລ້ວ' : 'ຄລິກເພື່ອອະນຸມັດ'"
    />
    
    <v-fade-transition>
      <v-icon
        v-if="item.is_active === 'Y'"
        color="success"
        size="small"
        class="ml-2"
      >
        mdi-shield-check
      </v-icon>
    </v-fade-transition>
  </div>
</template>


      <template v-slot:item.action="{ item }">
        <v-btn
        v-if="canView"
          small
          flat
          class="text-primary"
          icon="mdi-eye-outline"
          @click="goPath(`/module/detail?id=${item.module_Id}`)"
        />
        <v-btn
        v-if="canEdit"
          small
          flat
          class="text-info"
          icon="mdi-pen"
          @click="goPath(`/module/edit?id=${item.module_Id}`)"
        />
        <v-btn
        v-if="canDelete"
          small
          flat
          class="text-error"
          icon="mdi-delete-outline"
          @click="onDeleteType(item.module_Id)"
        />
      </template>
    </v-data-table>
  </div>
</template>
