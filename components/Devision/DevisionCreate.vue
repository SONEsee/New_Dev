<script setup lang="ts">
import { UseCategoryStore } from "~/stores/category";
import { onMounted } from "vue";
import { goPath } from "~/composables/global";
import { CallSwal } from "~/composables/global";
import { DefaultSwalError } from "~/composables/global";
const Headers = [
  { title: "ລຳດັບ", value: "index" },
  { title: "ລະຫັດພະແນກ", value: "div_id" },
  { title: "ຊື່ພາສາລາວ", value: "division_name_la" },
  { title: "ຊື່ພາສາອັງກິດ", value: "division_name_en" },
  { title: "ສະຖານະການໃຊ້ງານ", value: "Once_Auth" },
  // { title: "ສະຖານະການອານຸມັດ", value: "Auth_Status" },
  { title: "ອະນຸມັດ", value: "confirm", align: "center" },
  { title: "ຈັດການ", value: "Actions", align: "center" },
];
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
const categories = UseCategoryStore();
const response_data = computed(() => categories.categories);
console.log(response_data.value, "response_data");

onMounted(() => {
  initializeRole();
  roleStore.GetRoleDetail();
  categories.GetListData();
});
const onDeleteType = async (Div_Id: string) => {
  const result = await categories.DeleteCategory(Div_Id);

  if (result) {
    await CallSwal({
      icon: "success",
      title: "ສຳເລັດ",
      text: "ລົບຂໍ້ມູນສຳເລັດ",
      showConfirmButton: false,
      timer: 1500,
    });
    goPath("/devision");
  }
};
const title = "ຂໍ້ມູນພະແນກ";
</script>

<template>
  <div class="pa-4">
  <v-col cols="12" class="pt-5">
    <global-text-title-line
      :title="`ໜ້າຈັດການຂໍ້ມູນພະແນກ / Manage Department(${formatnumber(
        response_data?.length ?? 0
      )})`"
    />
    <div class="d-flex mt-2">
      <v-btn color="primary" @click="goPath('/devision/create')"
      v-if="canAdd"
        ><v-icon icon="mdi-plus"></v-icon> ເພີ່ມປະເພດ</v-btn
      >
    </div>
  </v-col>
  <v-data-table :items="response_data" :headers="Headers" class="text-no-wrap">
    <template v-slot:item.index="{ item, index }">
      {{ index + 1 }}
    </template>
 <template v-slot:item.confirm="{ item }">
  <div class="d-flex align-center">
    <v-btn
      v-if="(role1 as any)?.[0]?.Auth_Detail === 1"
      :color="item.Once_Auth === 'A' ? 'success' : 'warning'"
      :icon="
        item.Once_Auth === 'A'
          ? 'mdi-check-circle'
          : 'mdi-toggle-switch-off-outline'
      "
      variant="text"
      size="small"
      :loading="isUpdatingStatus"
      :disabled="item.Once_Auth === 'A'"
      @click="updateAdproveStatus(item.sub_menu_id)"
      :class="{
        'disabled-btn': item.Once_Auth === 'A'
      }"
      :title="item.Once_Auth === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ຄລິກເພື່ອອະນຸມັດ'"
    />
    
    <v-fade-transition>
      <v-icon
        v-if="item.Once_Auth === 'A'"
        color="success"
        size="small"
        class="ml-2"
      >
        mdi-shield-check
      </v-icon>
    </v-fade-transition>
  </div>
</template>


    <template v-slot:item.Once_Auth="{ item }">
      <div v-if="item.Once_Auth === 'A'">
        <v-chip color="green"><p>ເປີດໃຊ້ງານ</p> </v-chip>
      </div>
      <div v-else="item.Once_Auth === 'U'">
        <v-chip color="red"><p>ປີດໃຊ້ງານ</p> </v-chip>
      </div>
    </template>
    <template v-slot:item.Auth_Status="{ item }">
      <div v-if="item.Auth_Status === 'A'">
        <v-chip color="green"><p>ອານຸມັດແລ້ວ</p> </v-chip>
      </div>
      <div v-else="item.Auth_Status === 'U'">
        <v-chip color="yellow"><p>ຍັງບໍ່ທັນອານຸມັດ</p> </v-chip>
      </div>
    </template>

    <template v-slot:item.Actions="{ item }">
      <v-btn
      v-if="canView"
        small
        flat
        class="text-primary"
        icon="mdi-eye-outline"
        @click="goPath(`/devision/detail?div_id=${item.div_id}`)"
      />
      <v-btn
      v-if="canEdit"
        small
        flat
        class="text-info"
        icon="mdi-pen"
        @click="goPath(`/devision/update?div_id=${item.div_id}`)"
      />
      <v-btn
      v-if="canDelete"
        small
        flat
        class="text-error"
        icon="mdi-delete-outline"
        @click="onDeleteType(item.div_id)"
      />
    </template>
  </v-data-table></div>
</template>
