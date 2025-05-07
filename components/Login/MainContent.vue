<template>
  <section
    style="min-height: 100vh"
    class="d-flex flex-wrap justify-center align-center"
  >
    <v-form ref="form" @submit.prevent="handleLogin">
      <v-card elevation="0" width="560px" class="pa-6">
        <v-row>
          <v-col cols="12">
            <div class="text-center">
              <v-avatar color="" size="150" style="border: 1px black solid;">
                <!-- <img src="" alt="" width="200"> -->
              </v-avatar>
            </div>
            <h3 class="text-center">ຍິນດີຕອ້ນຮັບເຂົ້ສາສູ່ລະບົບ</h3>
          </v-col>

          <v-col cols="12">
            <label>ຊື່ຜູ້ໃຊ້ງານ / Username</label>
            <v-text-field
              v-model="username"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ']"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <label>ລະຫັດຜ່ານ / Password</label>
            <v-text-field
              v-model="password"
              :type="visible ? 'text' : 'password'"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="visible = !visible"
              :rules="[(v: string) => !!v || 'Password is required']"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-btn
              color="primary"
              type="submit"
              flat
              block
              height="40px"
              class="font-weight-black"
              :loading="loading"
            >
              ເຂົ້າສູ່ລະບົບ
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-form>
  </section>
</template>

<script lang="ts" setup>
import axios from "@/helpers/axios";
import { UserModel } from "@/models/";
import { ref } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const username = ref(null);
const password = ref(null);
const visible = ref(false);
const loading = ref(false);
const form = ref();
const router = useRouter();

const goPath = (path: string) => {
  router.push(path);
};

const DefaultSwalError = (error: any) => {
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: error.message || 'Something went wrong!',
  });
};

const handleLogin = async () => {
  try {
    const { valid } = await form.value.validate();
    if (valid) {
      loading.value = true;
      const res = await axios.post<UserModel.UserLoginResponse>(
        "/login",
        {
          username: username.value,
          password: password.value,
        }
      );

      console.log("Response:", res);

      if (res.status === 200 && res.data.token && res.data.user) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setTimeout(() => {
          goPath("/");
        }, 1500);
      } else {
        throw new Error("Invalid response structure");
      }
    }
  } catch (error) {
    console.error(error);
    DefaultSwalError(error);
  } finally {
    loading.value = false;
  }
};
</script>