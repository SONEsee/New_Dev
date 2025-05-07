<template>
  <section>
    <v-row>
      <v-col cols="12">
        <GlobalTextTitleLine :title="'ລາຍລະອຽດຂໍ້ມູນຜູ້ໃຊ້ງານ'" />
      </v-col>

      <v-col cols="12" v-if="datarespons !== null">
        <v-row>
          <v-col cols="12" md="4" class="d-flex align-center justify-center">
            <div class="d-flex text-center align-center">
              <v-col cols="12" class="d-flex justify-center align-center">
                <v-avatar
                  size="220"
                  class="mx-auto d-flex align-center"
                  color="grey lighten-2"
                >
                  <img
                    :src="`https://tery-api.phouservice.com/${datarespons.image_profile}`"
                    alt="Profile Picture"
                  />
                </v-avatar>
              </v-col>
            </div>
          </v-col>

          <v-col cols="12" md="8" class="mt-12 mb-12">
            <v-row>
              <v-col cols="12" md="4">
                <label for="name">ຊື່ ແລະ ນາມສະກຸນ / Fullname</label>
                <v-text-field readonly density="compact" variant="outlined">{{
                  datarespons.fullname
                }}</v-text-field>

                <label for="code">ລະຫັດຕົວແທນ / Agency code</label>
                <v-text-field readonly density="compact" variant="outlined">{{
                  datarespons.agent_code
                }}</v-text-field>

                <label for="districts">ເມືອງ / Districts</label>
                <v-text-field readonly density="compact" variant="outlined">{{
                  datarespons?.village?.district?.dr_name ?? ""
                }}</v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <label for="nickname">ຊື່ຫຼິ້ນ / Nickname</label>
                <v-text-field readonly density="compact" variant="outlined">{{
                  datarespons.nick_name
                }}</v-text-field>

                <label for="role">ສິດການເຂົ້າໃຊ້ງານ / Role access</label>
                <v-text-field readonly density="compact" variant="outlined">{{
                  datarespons.role
                }}</v-text-field>

                <label for="villages">ບ້ານ / Villages</label>
                <v-text-field readonly density="compact" variant="outlined">{{
                  datarespons.village?.vill_name ?? ""
                }}</v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <label for="phone">ເບີໂທລະສັບ / phone number</label>
                <v-text-field readonly density="compact" variant="outlined">{{
                  datarespons.phone_number
                }}</v-text-field>

                <label for="provinces">ແຂວງ / Provinces</label>
                <v-text-field readonly density="compact" variant="outlined"
                  >ນະຄອນຫຼວງວຽງຈັນ</v-text-field
                >

                <label for="username">ຊື້ຜູ້ໃຊ້ງານ / Username</label>
                <v-text-field readonly density="compact" variant="outlined">{{
                  datarespons.username
                }}</v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <GlobalOverlayLoading :loading="loading" />
  </section>
</template>

<script lang="ts" setup>
import axios from "@/helpers/axios";
import { UsermeModel } from "@/models/";
import { ref, onMounted } from "vue";
const globalStore = UseGlobalStore();

const datarespons = ref<UsermeModel.UserMeResponseItems | null>(null);
const loading = ref(false);

const getdata = async () => {
  try {
    loading.value = true;
    const res = await axios.get<UsermeModel.UserMeResponse>("/api/v1/users/me");

    if (res.status === 200) {
      let item = res.data.items;
      datarespons.value = item;
      if (item != null) {
        let imageProfile = item.image_profile;
        if (imageProfile && imageProfile != "" && imageProfile !== "N/A") {
          datarespons.value.image_profile = await globalStore.GetFileData(
            imageProfile
          );
        }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getdata();
});
</script>
