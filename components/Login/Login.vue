<template>
  <v-container>
    <div class="text-center mb-5">
      <v-avatar size="150" class="login-avatar">
        <v-img
          src="@/public/image/S2.png"
          alt="Login logo"
          cover
          :eager="true"
        ></v-img>
      </v-avatar>
      <img src="../../public/image/S2.png" alt="">
    </div>
    <h2 class="text-center mb-5">ເຂົ້າສູ່ລະບົບ 32 Lottery</h2>
    <div class="d-flex justify-center">
      <v-form
        style="width: 50%"
        ref="form"
        class="text-center"
        @submit.prevent="handleLogin"
      >
        <label class="d-flex text-start">ຊື່ຜູ້ໃຊ້ງານ / Username</label>
        <v-text-field
          class="rounded-lg"
          id="username"
          v-model="username"
          label="ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ"
          density="compact"
          variant="outlined"
          :rules="[(v: string) => !!v || 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ']"
        ></v-text-field>

        <label class="d-flex text-start">ລະຫັດຜ່ານ / Password</label>
        <v-text-field
          class="rounded-lg text-start"
          id="password"
          v-model="password"
          :type="visible ? 'text' : 'password'"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="toggleVisibility"
          :rules="[(v: string) => !!v || 'Password is required']"
          label="ກະລຸນາປ້ອນລະຫັດຜ່ານ"
          density="compact"
          variant="outlined"
        ></v-text-field>

        <v-btn class="mt-4 rounded-lg" color="primary" type="submit" flat>
          ເຂົ້າສູ່ລະບົບ
        </v-btn>
      </v-form>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import axios from "@/helpers/axios";
import { UserModel } from "@/models/";
import { ref } from "vue";

const username = ref(null);
const password = ref(null);
const visible = ref(false);
const form = ref();

const toggleVisibility = () => {
  visible.value = !visible.value;
};

const handleLogin = async () => {
  try {
    const { valid } = await form.value.validate();
    if (valid) {
      console.log("form password");
      const res = await axios.post<UserModel.UserLoginResponse>(
        "/api/v1/users/login",
        {
          username: username.value,
          password: password.value,
        }
      );

      if (res.status === 200) {
        localStorage.setItem("token", res.data.items.token);
        localStorage.setItem("user", JSON.stringify(res.data.items.user));

        setTimeout(() => {
          goPath("/home");
        }, 1500);
      }
    }
  } catch (error) {
    console.error(error);
  }

  
};
</script>

<style scoped>
.text-center {
  text-align: center;
}
.d-flex {
  display: flex;
}
.text-start {
  text-align: start;
}
</style>
