<script lang="ts" setup>
import axios from "@/helpers/axios";
import notfounfimages from "@/assets/img/404.png";
const notfoundref = ref(notfounfimages);
import { CallSwal } from "#build/imports";

const userStore = UserStore();

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
});

const openFile = () => {
  file.value.click();
};

const onFileChange = (event: Event) => {
  console.log(`event`, event);
  //@ts-ignore
  const files = event.target.files;
  let file = files[0];
  console.log(`file`, file);
  if (file) {
    const value = file as File;
    userStore.create_user_form.profile_image = value;
  }
};
onMounted(() => {});
const submitForm = async () => {
  if (!userStore) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ປອ້ນຂໍ້ມູນ",
      text: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ",
    });
    return;
  }

  const isValid = await form.value.validate();
  console.log(`isValid`, isValid);
  if (isValid) {
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
          <v-btn color="primary" flat type="submit" :loading="loading"
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
                  <label>ຊື່ຜູ້ໃຊ້ງານ / Username</label>
                  <v-text-field
                    @click:append-inner="visible = !visible"
                    :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ']"
                    v-model="userStore.create_user_form.User_Name"
                    placeholder="ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>

                  <label>ພະແນກ / Department</label>
                  <v-autocomplete
                    v-model="userStore.create_user_form.Div_Id"
                    :rules="[(v: string) => !!v || 'ກະລຸນາເລືອກພະແນກ']"
                    placeholder="ກະລຸນາເລືອກພະແນກ"
                    density="compact"
                    :items="userItems"
                    item-value="Div_Id"
                    item-title="Div_NameL"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                    no-filter
                  ></v-autocomplete>
                  <label>ເບີໂທລະສັບ / Phone</label>
                  <v-text-field
                    v-model="userStore.create_user_form.User_Mobile"
                    hide-details="auto"
                    :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນເບີໂທລະສັບ']"
                    placeholder="ກະລຸນາປ້ອນເບີໂທລະສັບ"
                    density="compact"
                    variant="outlined"
                    class="pb-6"
                  ></v-text-field>
                </v-col>

                <v-col cols="6">
                  <label>ອີເມວ / Email</label>
                  <v-text-field
                    v-model="userStore.create_user_form.User_Email"
                    :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນຊື່ຫຼິນ']"
                    placeholder="ກະລຸນາປ້ອນຊື່ຫຼິນ"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>

                  <label>ສະຖານະການໃຊ້ງານ / Status</label>
                  <v-autocomplete
                    v-model="userStore.create_user_form.User_Status"
                    :rules="[(v: string) => !!v || 'ກະລຸນາເລືອກສະຖານະການໃຊ້ງານ']"
                    placeholder="ກະລຸນາເລືອກສະຖານະການໃຊ້ງານ"
                    density="compact"
                    :items="['ປິດ', 'ເປີດ']"
                    item-value="id"
                    item-title="vill_name"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                    no-filter
                  ></v-autocomplete>

                  <label>ລະຫັດຜ່ານ / Password</label>
                  <v-text-field
                    v-model="userStore.create_user_form.User_Password"
                    hide-details="auto"
                    :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນລະຫັດຜ່ານ']"
                    placeholder="ກະລຸນາປ້ອນລະຫັດຜ່ານ"
                    density="compact"
                    variant="outlined"
                    class="pb-6"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-row>
            <v-col cols="6"></v-col>
            <v-col cols="6">
              <v-row> </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>
