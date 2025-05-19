<script lang="ts" setup>
import { useRoute } from 'vue-router';
const route = useRoute();
const user_id = route.query.user_id as string;
const agencyStore = UserStore();
const response_data = computed(() => {
   return agencyStore.userList || []; 
});
console.log(response_data.value);
onMounted(() => {
  agencyStore.GetUser();
  agencyStore.DeleteUser(user_id);
});
// const response_data = computed(() => {
//   return agencyStore.response_query_data;
// });

// const request = agencyStore.request_query_data;

// async function onSelectionChange(limit: number) {
//   request.limit = limit;
//   await agencyStore.GetListData();
// }

// async function onPageChange(page: number) {
//   request.page = page;
//   await agencyStore.GetListData();
// }

const headers = ref([
  { title: "ລຳດັບ", key: "no", sortable: false },
  { title: "ຮູບພາບ", key: "image", sortable: false },

  { title: "ຊື່ຜູ້ໃຊ້ງານ", key: "user_name", sortable: false },
  { title: "ອີເມວ", key: "user_email", sortable: false },
  { title: "ເບີ້ໂທ", key: "user_mobile", sortable: false },
  { title: "ສະຖານະ", key: "User_Status", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
]);

const onDeleteUser = async (user_id: string) => {
  // ຢືນຢັນກ່ອນລຶບຂໍ້ມູນ
  const confirmation = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຜູ້ໃຊ້ນີ້?",
    showCancelButton: true,
    confirmButtonText: "ຕົກລົງ",
    cancelButtonText: "ຍົກເລີກ",
  });

  // ຖ້າຜູ້ໃຊ້ຢືນຢັນການລຶບ
  if (confirmation.isConfirmed) {
    // ເອີ້ນໃຊ້ຟັງຊັນລຶບຂໍ້ມູນ
    const result = await agencyStore.DeleteUser(user_id);
    
    // ຖ້າລຶບສຳເລັດ, ໂຫລດຂໍ້ມູນໃໝ່
    if (result) {
      await agencyStore.GetUser(); // ໂຫລດລາຍການຜູ້ໃຊ້ໃໝ່ຫຼັງຈາກລຶບສຳເລັດ
    }
  }
};
// const onsetinput = async (input: string | null) => {
//   if (request !== null) {
//     request.q = input ?? null;
//     await agencyStore.GetListData();
//   }
// };
</script>
<template>
  <div class="pa-6">
    <v-card elevation="0" tile width="100%" min-height="95vh" class="pa-6">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine
            :title="`ໜ້າຈັດການຂໍ້ມູນຜູ້ໃຊ້ງານ / Mamage User (${formatnumber(
              response_data?.length ?? 0
            )})`"
          />
        </v-col>

        <v-col
          cols="12"
          class="d-flex flex-wrap justify-space-between align-center"
        >
          <div class="d-flex flex-wrap">
            <!-- <div style="width: 280px">
              <GlobalDebounceEventTextField
                :input="request.q"
                :label="'ຄົ້ນຫາ'"
                @setinput="onsetinput"
              />
            </div> -->

            <div class="ml-4 pt-6">
              <!-- <v-btn
                color="primary"
                flat
                :loading="request.loading"
                @click="agencyStore.GetListData()"
                >ຄົ້ນຫາ</v-btn
              > -->
            </div>
          </div>

          <div class="d-flex flex-wrap align-center">
            <v-btn
              color="primary"
              elevation="0"
              @click="goPath('/user/create')"
            >
              <v-icon class="mr-2"> mdi-plus</v-icon>
              ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້ງານ
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12">
          <v-data-table :headers="headers" :items="response_data">
            <template v-slot:item.no="{ item, index }">
              {{ index + 1 }}
            </template>

            <template v-slot:item.image="{ item }">
              <div class="pa-2">
                <GlobalMenuSpanImage :image="item.profile_image" />
              </div>
            </template>

            <!-- <template v-slot:item.status="{ item }">
              <GlobalDefaultStatusChip :status="item.status" />
            </template> -->

            <template v-slot:item.actions="{ item }">
              <!-- <v-btn
                color="primary"
                icon="mdi-pencil"
                variant="text"
                @click="goPath(`/agency/edit?id=${item.id}`)"
                size="small"
              ></v-btn> -->
              <v-btn
                color="primary"
                icon="mdi-pencil"
                variant="text"
                @click="goPath(`/user/edit?user_id=${item.user_id}`)"
                size="small"
              ></v-btn>

              <!-- <v-btn
                color="primary"
                icon="mdi-eye"
                variant="text"
                @click="goPath(`/agency/detail?id=${item.id}`)"
                size="small"
              ></v-btn> -->
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

            <!-- <template v-slot:bottom>
              <GlobalTablePaginations
                :page="request.page"
                :limit="request.limit"
                :totalpage="response_data?.pagination?.total_page ?? 1"
                @onSelectionChange="onSelectionChange"
                @onPagechange="onPageChange"
              />
            </template> -->
          </v-data-table>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
