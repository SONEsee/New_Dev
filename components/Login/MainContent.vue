<template style="background-color:#788593;">
  <section
    style="min-height: 100vh; width: 100vw; background-color:#788593; margin: 0; padding: 0;"
    class="d-flex flex-wrap justify-center align-center"
  >
   
    <v-form ref="form" @submit.prevent="handleLogin" style="background-color:#788593;">
      <v-card 
        elevation="24" 
        width="480px" 
        class="pa-8"
        style="
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px !important;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.8s ease-out;
        "
      >
        <v-row>
          <v-col cols="12" class="text-center mb-4">
            <div class="text-center">
              <img src="../../assets/img/logo.png" alt="" width="400">
            </div>
            <h2 style="
              background: linear-gradient(135deg, #788593, #5a6570);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-weight: 600;
              font-size: 24px;
              margin-bottom: 8px;
              text-align: center;
            ">ຍິນດີຕອ້ນຮັບ</h2>
            <p style="
              color: #666;
              font-size: 16px;
              margin: 0;
              line-height: 1.4;
            ">ລະບົບບັນຊີ ບໍລິສັດລັດ ບໍລິຫານໜີ້ ແລະ ຊັບສິນ</p>
          </v-col>

          <v-col cols="12" class="pb-4">
            <label style="
              color: #555;
              font-weight: 500;
              font-size: 14px;
              margin-bottom: 8px;
              display: block;
            ">ຊື່ຜູ້ໃຊ້ງານ / Username</label>
            <v-text-field
              v-model="user_name"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້ງານ']"
              style="
                --v-field-border-radius: 12px;
              "
              class="custom-input"
              prepend-inner-icon="mdi-account-outline"
            ></v-text-field>
          </v-col>

          <v-col cols="12" class="pb-4">
            <label style="
              color: #555;
              font-weight: 500;
              font-size: 14px;
              margin-bottom: 8px;
              display: block;
            ">ລະຫັດຜ່ານ / Password</label>
            <v-text-field
              v-model="user_password"
              :type="visible ? 'text' : 'password'"
              :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="visible = !visible"
              :rules="[(v) => !!v || 'Password is required']"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              style="
                --v-field-border-radius: 12px;
              "
              class="custom-input"
              prepend-inner-icon="mdi-lock-outline"
            ></v-text-field>
          </v-col>

          <v-col cols="12" class="pt-6">
            <v-btn
              type="submit"
              block
              height="50px"
              class="font-weight-bold custom-btn"
              :loading="loading"
              style="
                background: linear-gradient(135deg, #788593 0%, #5a6570 100%) !important;
                color: white !important;
                border-radius: 12px !important;
                box-shadow: 0 8px 25px rgba(120, 133, 147, 0.4) !important;
                text-transform: none !important;
                font-size: 16px !important;
                transition: all 0.3s ease !important;
              "
            >
              <v-icon left class="mr-2">mdi-login</v-icon>
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
import { Style } from "#build/components";

const user_name = ref(null);
const user_password = ref(null);
const visible = ref(false);
const loading = ref(false);
const form = ref();
const router = useRouter();

const goPath = (path:any) => {
  router.push(path);
};

const DefaultSwalError = (error:any) => {
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
        
        const response = await axiosInstance.post("http://127.0.0.1:8000/api/login/", loginPayload, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
       
        
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
      } catch (axiosError:any) {
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

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0 !important;
  padding: 0 !important;
  background-color: #788593 !important;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-input :deep(.v-field) {
  border-radius: 12px !important;
  transition: all 0.3s ease;
}

.custom-input :deep(.v-field:hover) {
  box-shadow: 0 4px 15px rgba(120, 133, 147, 0.2);
}

.custom-input :deep(.v-field--focused) {
  box-shadow: 0 4px 20px rgba(120, 133, 147, 0.3);
}

.custom-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 35px rgba(120, 133, 147, 0.5) !important;
}

.custom-btn:active {
  transform: translateY(0px) !important;
}
</style>