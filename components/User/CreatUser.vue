<script lang="ts" setup>
import axios from "@/helpers/axios";
import notfounfimages from "@/assets/img/404.png";
const notfoundref = ref(notfounfimages);
import { CallSwal } from "#build/imports";
const roleStore = RoleStore();
const userStore = UserStore();
const role = computed(() => roleStore.respons_data_role || []);
const devision = UseCategoryStore();

const globalStore = UseGlobalStore();
const title = ref("ສ້າງຂໍ້ມູນຜູ້ໃຊ້ງານໃໝ່");
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
    userStore.create_user_form.profile_image = value;
  }
};

// ຮັບປະກັນວ່າມີ user_id ກ່ອນສົ່ງຟອມ
const submitForm = async () => {
  // ກວດສອບວ່າມີທຸກຂໍ້ມູນທີ່ຈຳເປັນກ່ອນສົ່ງຟອມ
  if (
    !userStore.create_user_form.user_id ||
    !userStore.create_user_form.user_name ||
    !userStore.create_user_form.user_mobile ||
    !userStore.create_user_form.user_password ||
    !userStore.create_user_form.Div_Id ||
    !userStore.create_user_form.Role_ID ||
    !userStore.create_user_form.Auth_Status
  ) {
    await CallSwal({
      icon: "warning",
      title: "ປ້ອນຂໍ້ມູນ",
      text: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ",
    });
    return;
  }

  const isValid = await form.value.validate();
  if (isValid) {
    console.log("ສົ່ງຂໍ້ມູນໄປຫາ Store");
    // ແປງຄ່າ Auth_Status ຈາກ "ເປີດ"/"ປິດ" ເປັນ "A"/"I"
    if (userStore.create_user_form.Auth_Status === "ເປີດ") {
      userStore.create_user_form.Auth_Status = "A";
    } else if (userStore.create_user_form.Auth_Status === "ປິດ") {
      userStore.create_user_form.Auth_Status = "I";
    }

    // ຕັ້ງຄ່າ user_status ຈາກຄ່າ Auth_Status
    userStore.create_user_form.user_status = userStore.create_user_form.Auth_Status === "A";

    await userStore.CreatUser();
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
                  style="border: 1px solid black"
                    size="220"
                    class="mx-auto"
                    :image="
                      userStore.create_user_form.profile_image === null
                        ? notfoundref
                        : GetImageUrl(userStore.create_user_form.profile_image)
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
                    style="display: none "
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
                    v-model="userStore.create_user_form.user_id"
                    :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດຜູ້ໃຊ້']"
                    placeholder="ກະລຸນາປ້ອນລະຫັດຜູ້ໃຊ້"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>
                  
                  <label>ຊື່ຜູ້ໃຊ້ງານ / Username</label>
                  <v-text-field
                    @click:append-inner="visible = !visible"
                    :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ']"
                    v-model="userStore.create_user_form.user_name"
                    placeholder="ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>

                  <label>ພະແນກ / Department</label>
                  <v-autocomplete
                    v-model="userStore.create_user_form.Div_Id"
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
                    v-model="userStore.create_user_form.user_mobile"
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
                    v-model="userStore.create_user_form.user_email"
                    placeholder="ກະລຸນາປ້ອນອີເມວ"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>
                  
                  <label>ສະຖານະການໃຊ້ງານ / Status</label>
                  <v-autocomplete
                    v-model="userStore.create_user_form.Auth_Status"
                    :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະການໃຊ້ງານ']"
                    placeholder="ກະລຸນາເລືອກສະຖານະການໃຊ້ງານ"
                    density="compact"
                    :items="['ປິດ', 'ເປີດ']"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                    no-filter
                  ></v-autocomplete>
                  <label>ສິດການເຂົ້ານຳໃຊ້ / Role</label>
                  <v-autocomplete
                    v-model="userStore.create_user_form.Role_ID"
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
                    v-model="userStore.create_user_form.user_password"
                    hide-details="auto"
                    :rules="[(v) => !!v || 'ກະລຸນາປ້ອນລະຫັດຜ່ານ']"
                    placeholder="ກະລຸນາປ້ອນລະຫັດຜ່ານ"
                    density="compact"
                    variant="outlined"
                    class="pb-6"
                    :type="visible ? 'text' : 'password'"
                    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
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