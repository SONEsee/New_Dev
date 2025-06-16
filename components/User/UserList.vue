<script lang="ts" setup>
import { useRoute } from "vue-router";
import axios from "@/helpers/axios";
import { useRolePermissions } from "@/composables/useRolePermissions";
const {
  canEdit,
  canDelete,
  canView,
  canAdd,
  canRecordStatus,
  canAuthorize,
  hasPermission,
  initializeRole,
} = useRolePermissions();
interface Userparam {
  div_id: string;
  role_id: string;
}
const selectedDivision = ref<any | null>(null);
const selectedRole = ref<any | null>(null);
const roleStore = RoleStore();
const devision = UseCategoryStore();
const role = computed(() => roleStore.respons_data_role || []);
const userItems = computed(() => devision.categories || []);
const isUpdatingStatus = ref(false);
const isUpdateinRecordStatus = ref(false);
const updaterecordstatus = async (id: string) => {
  isUpdateinRecordStatus.value = true;
  try {
    const notification = await CallSwal({
      icon: "question",
      title: "ບໍ່ທັນໄດ້ຕໍ່ api ກັບ backend ເທື່ອ",
      text: `ໄປຕໍ່ api ກອ່ນເພືອ່ໃຫ້ສາມາດໃຊ້ງານໄດ້`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#4CAF50",
    });
    if (notification.isConfirmed) {
      await CallSwal({
        icon: "info",
        title: "ໄປແປງສາເດີ້",
        text: `5555555555`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
    // const req = await axios.post(`api/users/${id}/record-status/`, {}, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //   },
    // });if(req.status ===200){
    //   await agencyStore.GetUser();
    //   await CallSwal({
    //     icon: "success",
    //     title: "ສຳເລັດ",
    //     text: "ປ່ອນສະຖານະຜູ້ໃຊ້ງານແລ້ວ",
    //     timer: 2000,
    //     showConfirmButton: false,
    //   });
    // }
  } catch (error) {}
};
const handleApproval = async (user: any) => {
  try {
    const notification = await CallSwal({
      icon: "question",
      title: "ຢືນຢັນການປຽ່ນສະຖານະ",
      text: `ທ່ານຕ້ອງການປຽ່ນສະຖານະຜູ້ໃຊ້ "${user.user_name}" ບໍ?`,
      showCancelButton: true,
      confirmButtonText: "ອະນຸມັດ",
      cancelButtonText: "ຍົກເລີກ",
      confirmButtonColor: "#4CAF50",
    });
    if (notification.isConfirmed) {
      await updaterecordstatus(user.user_id);
    }
  } catch (error) {
    console.error("Error in handleApproval:", error);
  }
};

const updateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;

    const res = await axios.post(
      `api/users/${id}/authorize/`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (res.status === 200) {
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
const route = useRoute();
const user_id = route.query.user_id as string;
const agencyStore = UserStore();
const response_data = computed(() => {
  return agencyStore.userList || [];
});

const searchUsers = () => {
  agencyStore.reqest_get_user.query.div_id =
    selectedDivision.value?.div_id || null;
  agencyStore.reqest_get_user.query.role_id =
    selectedRole.value?.role_id || null;

  agencyStore.GetUser();
};
const role1 = computed(() => {
  return roleStore.responst_data_detail;
});
onMounted(() => {
  initializeRole();
  roleStore.GetRoleDetail();
  agencyStore.GetUser();
  if (user_id) {
    agencyStore.DeleteUser(user_id);
  }
  devision.GetListData();
  roleStore.GetRole();
});

import { computed, ref } from "vue";

const headers = computed((any) => [
  { title: "ລຳດັບຜູ້ໃຊ້ງານ", key: "user_id", sortable: false },
  { title: "ຊື່ຜູ້ໃຊ້ງານ", key: "user_name", sortable: false },
  { title: "ອີເມວ", key: "user_email", sortable: false },
  { title: "ເບີ້ໂທ", key: "user_mobile", sortable: false },
  { title: "ພະແນກ", key: "division", sortable: false, align: "center" },
  {
    title: "ສິດເຂົ້ານຳໃຊ້ລະບົບ",
    key: "role",
    sortable: false,
    align: "center",
  },

  ...(canView.value
    ? [{ title: "ເບິ່ງ", key: "detail", sortable: false, align: "center" }]
    : []),
  ...(canEdit.value
    ? [{ title: "ແກ້ໄຂ", key: "edit", sortable: false, align: "center" }]
    : []),
  ...(canDelete.value
    ? [{ title: "ລົບ", key: "delete", sortable: false, align: "center" }]
    : []),
  ...(canAuthorize.value
    ? [{ title: "ອານຸມັດ", key: "consfirm", sortable: false, align: "center" }]
    : []),
  ...(canRecordStatus.value
    ? [{ title: "ສະຖານະ", key: "Record_Status", sortable: false }]
    : []),
]);

const onDeleteUser = async (user_id: string) => {
  const confirmation = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຜູ້ໃຊ້ນີ້?",
    showCancelButton: true,
    confirmButtonText: "ຕົກລົງ",
    cancelButtonText: "ຍົກເລີກ",
  });

  if (confirmation.isConfirmed) {
    const result = await agencyStore.DeleteUser(user_id);
    if (result) {
      await agencyStore.GetUser();
    }
  }
};
const clearFilters = () => {
  selectedDivision.value = null;
  selectedRole.value = null;

  agencyStore.reqest_get_user.query.div_id = null;
  agencyStore.reqest_get_user.query.role_id = null;
  agencyStore.GetUser();
};
</script>

<template>
  <div class="pa-4">
    <v-card elevation="0" tile width="100%" min-height="95vh" class="">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine
            :title="`ໜ້າຈັດການຂໍ້ມູນຜູ້ໃຊ້ງານ / Manage User (${formatnumber(
              response_data?.length ?? 0
            )})`"
          />
        </v-col>

        <v-col
          cols="12"
          class="d-flex flex-wrap justify-space-between align-center"
        >
          <v-row>
            <v-col cols="12">
              <div class="d-flex flex-wrap align-center">
                <v-btn
                  v-if="canAdd"
                  color="primary"
                  elevation="0"
                  @click="goPath('/user/create')"
                >
                  <v-icon class="mr-2">mdi-plus</v-icon>
                  ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້ງານ
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-col cols="12" md="5" style="font-size: 80%">
                  <!-- <v-autocomplete
                    v-model="selectedDivision"
                    density="compact"
                    label="ເລືອກພະແນກ"
                    :items="userItems"
                    item-value="div_id"
                    item-title="division_name_la"
                    variant="outlined"
                    clearable
                    placeholder="ເລືອກພະແນກເພື່ອກັ່ນຕອງຂໍ້ມູນ"
                    return-object
                  ></v-autocomplete> -->
                  <v-autocomplete
                    style="font-size: 80%"
                    v-model="selectedDivision"
                    density="compact"
                    label="ເລືອກພະແນກ"
                    :items="userItems"
                    item-value="div_id"
                    item-title="division_name_la"
                    variant="outlined"
                    clearable
                    placeholder="ເລືອກພະແນກເພື່ອກັ່ນຕອງຂໍ້ມູນ"
                    return-object
                  >
                    <template v-slot:selection="{ item }">
                      {{ item.raw.division_name_la }}-{{ item.raw.div_id }}
                    </template>

                    <template v-slot:item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        :subtitle="`ID: ${item.raw.div_id}`"
                        :title="item.raw.division_name_la"
                      />
                    </template>
                  </v-autocomplete>
                </v-col>

                <v-col cols="12" md="4">
                  <v-autocomplete
                    v-model="selectedRole"
                    density="compact"
                    label="ເລືອກສິດການນຳໃຊ້ລະບົບ"
                    :items="role"
                    item-value="role_id"
                    item-title="role_name_la"
                    variant="outlined"
                    clearable
                    placeholder="ເລືອກສິດການນຳໃຊ້ລະບົບ"
                    return-object
                  >
                    <template v-slot:selection="{ item }">
                      {{ item.raw.role_name_la }}-{{ item.raw.role_id }}
                    </template>

                    <template v-slot:item="{ props, item }">
                      <v-list-item
                        v-bind="props"
                        :subtitle="`ID: ${item.raw.role_id}`"
                        :title="item.raw.role_name_la"
                      />
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="12" md="2">
                  <div class="d-flex gap-2">
                    <v-btn
                      color="primary"
                      variant="flat"
                      @click="searchUsers"
                      :loading="agencyStore.loading"
                    >
                      <v-icon class="mr-2">mdi-magnify</v-icon>
                      ຄົ້ນຫາ
                    </v-btn>
                    <v-btn
                      color="secondary"
                      variant="outlined"
                      @click="clearFilters"
                    >
                      <v-icon class="mr-2">mdi-filter-remove</v-icon>
                      ລຶບຕົວກັ່ນ
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-data-table
            :headers="headers"
            :items="response_data"
            class="text-no-wrap  "
          >
            <template v-slot:header.user_id="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.user_name="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.user_email="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.user_mobile="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.division="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.role="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.Record_Status="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>

            <template v-slot:header.detail="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.edit="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.delete="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>
            <template v-slot:header.consfirm="{ column }">
              <span class="text-uppercase text-primary">{{
                column.title
              }}</span>
            </template>

            <template v-slot:item.no="{ item, index }">
              {{ index + 1 }}
            </template>
            <template v-slot:item.Record_Status="{ item }">
              <div v-if="canRecordStatus">
                <v-btn
                  flat
                  size="small"
                  @click="handleApproval(item)"
                  v-if="canRecordStatus && item.Record_Status === 'O'"
                >
                  <v-icon icon="mdi-toggle-switch" color="info"></v-icon>
                </v-btn>
                <v-btn
                  flat
                  size="small"
                  @click="handleApproval(item)"
                  v-if="canRecordStatus && item.Record_Status === 'C'"
                >
                  <v-icon
                    icon="mdi-toggle-switch-off-outline"
                    color="error"
                  ></v-icon>
                </v-btn>
              </div>
              <div v-else>
                <div v-if="item.Record_Status === 'O'">
                  <v-chip color="info">
                    <v-icon icon="mdi-check-decagra" color="info"></v-icon>
                  </v-chip>
                </div>
                <div v-else="item.Record_Status === 'C'">
                  <v-chip color="error">
                    <v-icon
                      icon="mdi-file-excel-box-outline"
                      color="error"
                    ></v-icon>
                  </v-chip>
                </div>
              </div>
            </template>
            <template v-slot:item.division="item" class="text-center">
              <div class="text-center">
                <p>{{ item.item.division?.div_id || "No Data" }}</p>

                <p>
                  {{ item.item.division?.division_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
                </p>
              </div>
            </template>
            <template v-slot:item.role="item" class="text-center">
              <div class="text-center">
                <p>{{ item.item.role?.role_id || "No Data" }}</p>

                <p>
                  {{ item.item.role?.role_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
                </p>
              </div>
            </template>

            <!-- <template v-slot:item.image="{ item }">
              <div class="pa-2">
                <GlobalMenuSpanImage :image="item.profile_image" />
              </div>
            </template> -->
            <!-- <template v-slot:item.consfirm="{ item }">
  <div class="d-flex align-center">
    <v-btn
      v-if="(role1 as any)?.[0]?.Auth_Detail === 1"
      :color="item.Auth_Status === 'A' ? 'success' : 'warning'"
      :icon="
        item.Auth_Status === 'A'
          ? 'mdi-check-circle'
          : 'mdi-toggle-switch-off-outline'
      "
      variant="text"
      size="small"
      :loading="isUpdatingStatus"
      :disabled="item.Auth_Status === 'A'"
      @click="toggleUserStatus(item)"
      :class="{
        'disabled-btn': item.Auth_Status === 'A'
      }"
      :title="item.Auth_Status === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ຄລິກເພື່ອອະນຸມັດ'"
    />
    
  
    <v-fade-transition>
      <v-icon
        v-if="item.Auth_Status === 'A'"
        color="success"
        size="small"
        class="ml-2"
      >
        mdi-shield-check
      </v-icon>
    </v-fade-transition>
  </div>
</template> -->
            <template v-slot:item.consfirm="{ item }">
              <GlobalUserApproval
                v-if="canAuthorize"
                :item="item"
                :role-permissions="role1"
                :loading="isUpdatingStatus"
                @approve="toggleUserStatus"
              />
              <div v-else>
                <v-chip v-if="item.Auth_Status === 'A'" color="info">
                  <v-icon icon="mdi-toggle-switch" color="info"></v-icon>
                </v-chip>
                <v-chip v-else color="error">
                  <v-icon icon="mdi-toggle-switch" color="error"></v-icon>
                </v-chip>
              </div>
            </template>
            <!-- <template v-slot:item.consfirm="{ item }">
             
              <v-btn
                v-if="(role1 as any)?.[0]?.Auth_Detail === 1 "
                color="success"
                icon="mdi-check-circle"
                variant="text"
                size="small"
                :loading="isUpdatingStatus"
                @click="approveUser(item)"
                title="ອະນຸມັດຢູ້ໃຊ້ງານ"
              />

              
              <v-btn
                v-if="(role1 as any)?.[0]?.Auth_Detail === 1"
                :color="item.Auth_Status === 'A' ? 'error' : 'primary'"
                :icon="
                  item.Auth_Status === 'A'
                    ? 'mdi-toggle-switch'
                    : 'mdi-toggle-switch-off-outline'
                "
                variant="text"
                size="small"
                :loading="isUpdatingStatus"
                @click="toggleUserStatus(item)"
                :title="item.Auth_Status === 'A' ? 'ປິດໃຊ້ງານ' : 'ເປີດໃຊ້ງານ'"
              />

             
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-chip
                    v-bind="props"
                    :color="item.Auth_Status === 'A' ? 'success' : 'warning'"
                    size="small"
                    variant="flat"
                  >
                    {{
                      item.Auth_Status === "A" ? "ອະນຸມັດແລ້ວ" : "ລໍຖ້າອະນຸມັດ"
                    }}
                  </v-chip>
                </template>
                <span>{{
                  item.Auth_Status === "A"
                    ? "ຜູ້ໃຊ້ງານນີ້ໄດ້ຮັບການອະນຸມັດແລ້ວ"
                    : "ຜູ້ໃຊ້ງານນີ້ລໍຖ້າການອະນຸມັດ"
                }}</span>
              </v-tooltip>
            </template> -->

            <template v-slot:item.detail="{ item }">
              <!-- <v-btn
                v-if="canEdit"
                color="primary"
                icon="mdi-pencil"
                variant="text"
                @click="goPath(`/user/edit?user_id=${item.user_id}`)"
                size="small"
              ></v-btn> -->

              <v-btn
                v-if="canView"
                color="primary"
                icon="mdi-eye"
                variant="text"
                @click="goPath(`/user/detail?user_id=${item.user_id}`)"
                size="small"
              ></v-btn>

              <!-- <v-btn
                v-if="canDelete"
                color="error"
                icon="mdi-delete"
                variant="text"
                size="small"
                @click="onDeleteUser(item.user_id)"
              ></v-btn> -->
            </template>
            <template v-slot:item.edit="{ item }">
              <v-btn
                v-if="canEdit"
                color="primary"
                icon="mdi-pencil"
                variant="text"
                @click="goPath(`/user/edit?user_id=${item.user_id}`)"
                size="small"
              ></v-btn>
            </template>
            <template v-slot:item.delete="{ item }">
              <v-btn
                v-if="canDelete"
                color="error"
                icon="mdi-delete"
                variant="text"
                size="small"
                @click="onDeleteUser(item.user_id)"
              ></v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<style scoped>
.disabled-btn {
  opacity: 0.6;
  pointer-events: none;
  filter: grayscale(20%);
}

.v-data-table thead th {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
  color: #1976d2 !important;
  font-weight: 600 !important;
  border-bottom: 2px solid #2196f3 !important;
  position: relative;
}

.v-data-table thead th::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2196f3, #21cbf3, #2196f3);
}

.v-data-table thead th .text-uppercase {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
}
</style>
