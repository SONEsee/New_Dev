<script lang="ts" setup>
import { useRoute } from "vue-router";
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

const route = useRoute();
const user_id = route.query.user_id as string;
const agencyStore = UserStore();
const response_data = computed(() => {
  return agencyStore.userList || [];
});


const searchUsers = () => {
 
  agencyStore.reqest_get_user.query.div_id = selectedDivision.value?.div_id || null;
  agencyStore.reqest_get_user.query.role_id = selectedRole.value?.role_id || null;
  

  agencyStore.GetUser();
};

onMounted(() => {
  agencyStore.GetUser();
  if (user_id) {
    agencyStore.DeleteUser(user_id);
  }
  devision.GetListData();
  roleStore.GetRole();
});

const headers = ref([
  // { title: "ລຳດັບ", key: "no", sortable: false },
  { title: "ລຳດັບຜູ້ໃຊ້ງານ", key: "user_id", sortable: false },
  // { title: "ຮູບພາບ", key: "image", sortable: false },
  { title: "ຊື່ຜູ້ໃຊ້ງານ", key: "user_name", sortable: false },
  { title: "ອີເມວ", key: "user_email", sortable: false },
  { title: "ເບີ້ໂທ", key: "user_mobile", sortable: false },
  { title: "ສະຖານະ", key: "User_Status", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
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

// ຟັງຊັນລຶບ filter
const clearFilters = () => {
  selectedDivision.value = null;
  selectedRole.value = null;
  
  // ລຶບ filter ໃນ store ແລະໂຫລດຂໍ້ມູນໃໝ່
  agencyStore.reqest_get_user.query.div_id = null;
  agencyStore.reqest_get_user.query.role_id = null;
  agencyStore.GetUser();
};
</script>

<template>
  <div class="">
    <v-card elevation="0" tile width="100%" min-height="95vh" class="" >
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
             <v-col cols="12" >
              <div class="d-flex flex-wrap align-center ">
                <v-btn
                  color="primary"
                  elevation="0"
                  @click="goPath('/user/create')"
                >
                  <v-icon class="mr-2">mdi-plus</v-icon>
                  ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້ງານ
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12" >
              <v-row>
                <v-col cols="12" md="5" style="font-size: 80%;">
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
                  style="font-size: 80%;"
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
              {{ item.raw.division_name_la}}-{{ item.raw.div_id }}
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
              {{ item.raw.role_name_la}}-{{ item.raw.role_id }}
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
            <template v-slot:item.User_Status="{ item}">
              <div v-if="item.User_Status === 'E'">
                <v-chip color="green"><p>ເປີດໃຊ້ງານ</p> </v-chip>
              </div>
              <div v-else-if="item.User_Status === 'D'">
                <v-chip color="red"><p>ປິດໃຊ້ງານ</p> </v-chip>
              </div>
            </template>

            <!-- <template v-slot:item.image="{ item }">
              <div class="pa-2">
                <GlobalMenuSpanImage :image="item.profile_image" />
              </div>
            </template> -->

            <template v-slot:item.actions="{ item }">
              <v-btn
                color="primary"
                icon="mdi-pencil"
                variant="text"
                @click="goPath(`/user/edit?user_id=${item.user_id}`)"
                size="small"
              ></v-btn>

              <v-btn
                color="primary"
                icon="mdi-eye"
                variant="text"
                @click="goPath(`/user/detail?user_id=${item.user_id}`)"
                size="small"
              ></v-btn>

              <v-btn
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