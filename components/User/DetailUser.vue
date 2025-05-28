<script lang="ts" setup>

import { useRoute } from "vue-router";

const userStore = UserStore();
const route = useRoute();
const user_id = route.query.user_id as string;
onMounted(() => {
  if (user_id) {
    userStore.GetdatadetailUser(user_id);
  }
});

const res = computed(() => {
  return userStore.respone_data_detail;
});
const title = ref("ລາຍລະອຽດຜູ້ໃຊງານ / Detail of User");
</script>

<template>
  
  <section class="pa-6">
    
    <v-form ref="form" >
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>

     

        <v-col cols="12" class="pt-12">
          <v-row>
            <v-col cols="4">
              <v-row>
                <v-col cols="12" class="d-flex flex-wrap justify-center align-center mt-7">
                   <div>
              <GlobalAvatarProfileImage
                
              />
              <!-- :image_url="res?.profile_image ?? 'N/A'" -->
            </div>
                </v-col>

               
              </v-row>
            </v-col>

            <v-col cols="8">
              <v-row>
                <v-col cols="12" md="6">
                  
                  <GlobalCardTitle
                  :title="'ລະຫັດຜູ້ໃຊ້ / User ID'"
                  :text="res?.user_id ?? 'N/A'"
                />
                 
                  
                  
                  <GlobalCardTitle
                  :title="'ຊື່ຜູ້ໃຊ້ງານ / Username'"
                  :text="res?.user_name ?? 'N/A'"
                />

                  
                  <GlobalCardTitle
                  :title="'ພະແນກ / Department'"
                  :text="res?.division?.division_name_la ?? 'N/A'"
                />
                 
                  <GlobalCardTitle
                  :title="'ເບີໂທລະສັບ / Phone'"
                  :text="res?.user_mobile ?? 'N/A'"
                />
                </v-col>

                <v-col cols="6">
                  
                    <GlobalCardTitle
                  :title= "'ອີເມວ / Email'"
                  :text="res?.user_email ?? 'N/A'"
                />
                  
                  
                    <GlobalCardTitle
                  :title="'ສະຖານະການໃຊ້ງານ / Status'"
                  :text="res?.Auth_Status ?? 'N/A'"
                />
                 
                    <GlobalCardTitle
                  :title="'ສິດການເຂົ້ານຳໃຊ້ / Role'"
                  :text="res?.role?.role_name_la ?? 'N/A'"
                />

                 
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>
