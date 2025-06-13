<script lang="ts" setup>
import { useRoute } from "vue-router";
import axios from "@/helpers/axios";

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
const updateAdproveStatus = async (id: string) => {
  try {
    isUpdatingStatus.value = true;
    
    const res = await axios.post(`api/users/${id}/authorize/`, {}, {  // ເພີ່ມ {} ສຳລັບ body
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

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
  roleStore.GetRoleDetail();
  agencyStore.GetUser();
  if (user_id) {
    agencyStore.DeleteUser(user_id);
  }
  devision.GetListData();
  roleStore.GetRole();
});

const headers = ref([
 
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
  { title: "ສະຖານະ", key: "Auth_Status", sortable: false },
  { title: "ອານຸມັດ", key: "consfirm", sortable: false, align: "center" },
  { title: "ຈັດການ", key: "actions", sortable: false, align: "center" },
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
  <div class="">
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
                  v-if="(role1 as any)?.[0]?.View_Detail === 1"
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
          <v-data-table :headers="headers" :items="response_data">
            <template v-slot:item.no="{ item, index }">
              {{ index + 1 }}
            </template>
            <template v-slot:item.Auth_Status="{ item }">
              <div v-if="item.Auth_Status === 'A'">
                <v-chip color="green"><p>ເປີດໃຊ້ງານ</p> </v-chip>
              </div>
              <div v-else-if="item.Auth_Status === 'U'">
                <v-chip color="red"><p>ປິດໃຊ້ງານ</p> </v-chip>
              </div>
            </template>
            <template v-slot:item.division="item" class="text-center">
              <div class="text-center">
                <h3>{{ item.item.division?.div_id || "No Data" }}</h3>

                <p>
                  {{ item.item.division?.division_name_la || "ບໍ່ມີຂໍ້ມູນ" }}
                </p>
              </div>
            </template>
            <template v-slot:item.role="item" class="text-center">
              <div class="text-center">
                <h3>{{ item.item.role?.role_id || "No Data" }}</h3>

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
<template v-slot:item.consfirm="{ item }">
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

            <template v-slot:item.actions="{ item }">
              <v-btn
                v-if="(role1 as any)?.[0]?.Edit_Detail === 1"
                color="primary"
                icon="mdi-pencil"
                variant="text"
                @click="goPath(`/user/edit?user_id=${item.user_id}`)"
                size="small"
              ></v-btn>

              <v-btn
                v-if="(role1 as any)?.[0]?.View_Detail === 1"
                color="primary"
                icon="mdi-eye"
                variant="text"
                @click="goPath(`/user/detail?user_id=${item.user_id}`)"
                size="small"
              ></v-btn>

              <v-btn
                v-if="(role1 as any)?.[0]?.Del_Detail === 1"
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
</style>