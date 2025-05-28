<script lang="ts" setup>
import axios from "@/helpers/axios";
import notfounfimages from "@/assets/img/404.png";
const notfoundref = ref(notfounfimages);
import { CallSwal } from "#build/imports";
const roleStore = RoleStore();
const userStore = UserStore();
const role = computed(() => roleStore.respons_data_role || []);
const devision = UseCategoryStore();
import { useRoute } from "vue-router";

const route = useRoute();
const user_id = route.query.user_id as string;
onMounted(() => {
  if (user_id) {
    userStore.GetdatadetailUser(user_id);
  }
});

const request = computed({
  get() {
    return userStore.respone_data_detail;
  },
  set(value) {
    userStore.respone_data_detail = value;
  },
});

const res = computed(() => {
  return userStore.respone_data_detail;
});

const globalStore = UseGlobalStore();
const title = ref("ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ງານ");
const visible = ref(false);
const loading = ref(false);
const form = ref();
const file = ref();

const userItems = computed(() => devision.categories || []);
onMounted(() => {
  devision.GetListData();
  roleStore.GetRole();
});

const openFile = () => {
  file.value.click();
};

const onFileChange = (event: Event) => {
  //@ts-ignore
  const files = event.target.files;
  let file = files[0];
  if (file) {
    const value = file as File;
    userStore.update_user_form.profile_image = value;
  }
};

watch(
  () => userStore.respone_data_detail,
  (newVal) => {
    if (newVal) {
      
      userStore.update_user_form.user_id = newVal.user_id || "";
      userStore.update_user_form.user_name = newVal.user_name || "";
      userStore.update_user_form.user_email = newVal.user_email || "";
      userStore.update_user_form.user_mobile = newVal.user_mobile || "";
      userStore.update_user_form.div_id =
        typeof newVal.division === "object"
          ? newVal.division?.div_id || ""
          : newVal.division || "";
      userStore.update_user_form.Role_ID = newVal.role?.role_id || "";
      userStore.update_user_form.Auth_Status = newVal.Auth_Status === 'U' ? 'ເປີດ' : 'ປິດ';
    }
  },
  { immediate: true }
);


const submitForm = async () => {
  const isValid = await form.value.validate();
  if (isValid) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ຄຳເຕືອນ",
      text: `ທ່ານກຳລັງແກ້ໄຂຂໍ້ມູນທ່ານແນ່ໃຈແລ້ວບໍ່?`,
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });
    if (notification.isConfirmed) {
      await userStore.UpdateUser(user_id);
    }
  }
};
</script>

<template>
  <section class="pa-6">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>

        <v-col cols="12" class="d-flex flex-wrap justify-end">
          <v-btn color="primary" flat type="submit" :loading="userStore.loading"
            >ບັນທຶກ</v-btn
          >
        </v-col>

        <v-col cols="12" class="pt-12">
          <v-row>
            <v-col cols="4">
              <v-row>
                <v-col cols="12" class="d-flex flex-wrap justify-center">
                  <v-avatar
                    size="220"
                    class="mx-auto"
                    :image="
                      userStore.update_user_form.profile_image === null
                        ? notfoundref
                        : GetImageUrl(userStore.update_user_form.profile_image)
                    "
                  >
                  </v-avatar>
                </v-col>

                <v-col cols="12" class="d-flex flex-wrap justify-center">
                  <v-btn
                    class="mt-4 mb-7"
                    width="180px"
                    height="40px"
                    color="primary"
                    flat
                    prepend-icon="mdi-cloud-upload-outline"
                    text="ອັບໂຫຼດຮູບພາບ"
                    @click="openFile"
                  >
                  </v-btn>

                  <input
                    type="file"
                    ref="file"
                    style="display: none"
                    accept="image/jpg,image/png,image/jpeg"
                    @change="onFileChange"
                  />
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="8">
              <v-row>
                <v-col cols="12" md="6">
                  <label>ລະຫັດຜູ້ໃຊ້ / User ID</label>
                  <v-text-field
                    v-model="userStore.update_user_form.user_id"
                    :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດຜູ້ໃຊ້']"
                    placeholder="ກະລຸນາປ້ອນລະຫັດຜູ້ໃຊ້"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                    disabled
                  ></v-text-field>

                  <label>ຊື່ຜູ້ໃຊ້ງານ / Username</label>
                  <v-text-field
                    v-model="userStore.update_user_form.user_name"
                    :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ']"
                    placeholder="ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>

                  <label>ພະແນກ / Department</label>
                  <v-autocomplete
                    v-model="userStore.update_user_form.div_id"
                    :rules="[(v) => !!v || 'ກະລຸນາເລືອກພະແນກ']"
                    placeholder="ກະລຸນາເລືອກພະແນກ"
                    density="compact"
                    :items="userItems"
                    item-value="div_id"
                    item-title="division_name_la"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                    no-filter
                  ></v-autocomplete>

                  <label>ເບີໂທລະສັບ / Phone</label>
                  <v-text-field
                    v-model="userStore.update_user_form.user_mobile"
                    hide-details="auto"
                    :rules="[(v) => !!v || 'ກະລຸນາປ້ອນເບີໂທລະສັບ']"
                    placeholder="ກະລຸນາປ້ອນເບີໂທລະສັບ"
                    density="compact"
                    variant="outlined"
                    class="pb-6"
                  ></v-text-field>
                </v-col>

                <v-col cols="6">
                  <label>ອີເມວ / Email</label>
                  <v-text-field
                    v-model="userStore.update_user_form.user_email"
                    placeholder="ກະລຸນາປ້ອນອີເມວ"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>

                  <label>ສະຖານະການໃຊ້ງານ / Status</label>
                  <v-autocomplete
                    v-model="userStore.update_user_form.Auth_Status"
                    :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະການໃຊ້ງານ']"
                    placeholder="ກະລຸນາເລືອກສະຖານະການໃຊ້ງານ"
                    density="compact"
                    :items="[
                      { title: 'ເປີດ', value: 'A' },
                      { title: 'ປິດ', value: 'U' },
                    ]"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                    no-filter
                  ></v-autocomplete>

                  <label>ສິດການເຂົ້ານຳໃຊ້ / Role</label>
                  <v-autocomplete
                    v-model="userStore.update_user_form.Role_ID"
                    :rules="[(v) => !!v || 'ກະລຸນາເລືອກສິດເຂົ້ານຳໃຊ້']"
                    placeholder="ກະລຸນາເລືອກສິດເຂົ້ານຳໃຊ້"
                    density="compact"
                    :items="role"
                    item-value="role_id"
                    item-title="role_name_la"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                    no-filter
                  ></v-autocomplete>

                  <label>ລະຫັດຜ່ານ / Password</label>
                  <v-text-field
                    v-model="userStore.update_user_form.user_password"
                    hide-details="auto"
                    placeholder="ປ່ອຍວ່າງຖ້າບໍ່ຕ້ອງການປ່ຽນລະຫັດຜ່ານ"
                    density="compact"
                    variant="outlined"
                    class="pb-6"
                    :type="visible ? 'text' : 'password'"
                    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="visible = !visible"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>
