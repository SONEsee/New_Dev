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
              v-model="user_name"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ']"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <label>ລະຫັດຜ່ານ / Password</label>
            <v-text-field
              v-model="user_password"
              :type="visible ? 'text' : 'password'"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="visible = !visible"
              :rules="[(v) => !!v || 'Password is required']"
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

import axiosBase from "axios";  
import { ref } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const user_name = ref(null);
const user_password = ref(null);
const visible = ref(false);
const loading = ref(false);
const form = ref();
const router = useRouter();

const goPath = (path) => {
  router.push(path);
};

const DefaultSwalError = (error) => {
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
      
      const loginPayload = {
        user_name: user_name.value,
        user_password: user_password.value
      };
      
      console.log("Attempting login with payload:", loginPayload);
      
      
      const axiosInstance = axiosBase.create();
      
      try {
        
        const response = await axiosInstance.post("http://192.168.10.35:35729/api/login/", loginPayload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Raw response:", response);
        
        if (response.status === 200) {
          const data = response.data;
          console.log("Login successful! Response data:", data);
          
          if (data.access && data.user) {
            localStorage.setItem("token", data.access);
            
            if (data.refresh) {
              localStorage.setItem("refreshToken", data.refresh);
            }
            
            localStorage.setItem("user", JSON.stringify(data.user));
            
           
            
            setTimeout(() => {
              goPath("/");
            }, 1500);
          } else {
            console.error("Response missing required fields:", data);
            throw new Error("ຮູບແບບຂໍ້ມູນທີ່ຕອບກັບມາບໍ່ຖືກຕ້ອງ");
          }
        }
      } catch (axiosError) {
        console.error("Axios error:", axiosError);
        
        if (axiosError.response) {
          console.error("Status code:", axiosError.response.status);
          console.error("Response data:", axiosError.response.data);
          
          if (axiosError.response.status === 401) {
            Swal.fire({
              icon: 'error',
              title: 'ການເຂົ້າສູ່ລະບົບລົ້ມເຫລວ',
              text: 'ຊື່ຜູ້ໃຊ້ຫຼືລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ'
            });
          } else {
            DefaultSwalError(axiosError);
          }
        } else if (axiosError.request) {
          
          console.error("No response received:", axiosError.request);
          Swal.fire({
            icon: 'error',
            title: 'ການເຊື່ອມຕໍ່ລົ້ມເຫລວ',
            text: 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີໄດ້. ກະລຸນາກວດສອບການເຊື່ອມຕໍ່ອິນເຕີເນັດຂອງທ່ານ.'
          });
        } else {
          
          console.error("Request setup error:", axiosError.message);
          DefaultSwalError(axiosError);
        }
      }
    }
  } catch (error) {
    console.error("Form validation error:", error);
    DefaultSwalError(error);
  } finally {
    loading.value = false;
  }
};
</script>