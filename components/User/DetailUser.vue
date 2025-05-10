<script lang="ts" setup>
import axios from "@/helpers/axios";
import notfounfimages from "@/assets/img/404.png";
const notfoundref = ref(notfounfimages);
import { AgencyModel } from "@/models/";

const agencyStore = UseAgencyStore();
const globalStore = UseGlobalStore();
const title = ref("ລາຍລະອຽດຂໍ້ມູນຜູ້ໃຊ້ງານ");
const visible = ref(false);
const loading = ref(false);
const form = ref();
const file = ref();

const request = agencyStore.form_create_data;

const provinceChange = async (province_id: number | null) => {
  await globalStore.GetDistrictData(province_id, null);
  request.district_id = null;
  request.village_id = null;
};

const districtChange = async (district_id: string | null) => {
  await globalStore.GetVillagesData(district_id, null);
  request.village_id = null;
};

const onDebounceVillage = useDebounceFn(async (value: string) => {
  await globalStore.GetVillagesData(request.district_id, value ?? null);
}, 1000);

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
    request.profile_image = value;
  }
};

const submitForm = async () => {
  try {
    const { valid } = await form.value.validate();
    if (valid) {
      loading.value = true;
      var formData = new FormData();
      let allowFileKey = ["profile_image"];
      for (const [key, value] of Object.entries(request)) {
        if (allowFileKey.includes(key)) {
          if (Array.isArray(value)) {
            //looping for upload
            const files = value as unknown as File[];
            if (files) {
              for (let i = 0; i < files.length; i++) {
                let file = files[i];
                formData.append(key, file, file.name);
              }
            }
          } else {
            let file = (value as File) ?? null;
            if (file !== null) {
              formData.append(key, file, file.name);
            }
          }
        } else if (key === "identities") {
          formData.append("identities", JSON.stringify(value));
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              const identity = value[i];
              if (identity.file !== null) {
                console.log(`iden`, identity.file.type);
                formData.append(
                  "identities_files",
                  identity.file,
                  `${i}.${identity.file.type.split("/")[1]}`
                );
              }
            }
          }
        } else {
          formData.append(key, value?.toString() ?? "");
        }
      }

      const res = await axios.post("/api/v1/agency/new", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        const notification = await CallSwal({
          icon: "success",
          title: "ສຳເລັດ",
          text: "ບັນທຶກຂໍ້ມູນສຳເລັດ",
        });
        if (notification.isConfirmed) {
          setTimeout(() => {
            goPath("/agency");
          }, 1200);
        } else {
          setTimeout(() => {
            goPath("/agency");
          }, 1200);
        }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
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
        <v-col cols="12" class="pt-12">
          <v-row>
            <v-col cols="4">
              <v-row>
                <v-col cols="12" class="d-flex flex-wrap justify-center">
                  <v-avatar
                    size="220"
                    class="mx-auto"
                    :image="
                      request.profile_image === null
                        ? notfoundref
                        : GetImageUrl(request.profile_image)
                    "
                  >
                  </v-avatar>
                </v-col>

                <v-col cols="12" class="d-flex flex-wrap justify-center">
                  

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
                  readonly
                    @click:append-inner="visible = !visible"
                    
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>

                  <label>ພະແນກ / Department</label>
                  <v-autocomplete
                  readonly
                    v-model="request.village_id"
                   
                    density="compact"
                    :items="[
                      'ຄະນະຜູ້ບໍລິຫານ',
                      'ບໍລິຫານ',
                      'ການຕະຫຼາດ',
                      'ນຳໜີ້',
                      'ໄອທີ',
                      'ກົດໝາຍ',
                    ]"
                    item-value="id"
                    item-title="vill_name"
                    variant="outlined"
                    hide-details="auto"
                    @update:search="onDebounceVillage"
                    class="pb-6"
                    no-filter
                  ></v-autocomplete>
                  <label>ເບີໂທລະສັບ / Phone</label>
                  <v-text-field
                  readonly
                    v-model="request.phone_number"
                    hide-details="auto"
                    
                    density="compact"
                    variant="outlined"
                    class="pb-6"
                  ></v-text-field>
                </v-col>

                <v-col cols="6">
                  <label>ອີເມວ / Email</label>
                  <v-text-field
                  readonly
                    v-model="request.nick_name"
                   
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    class="pb-6"
                  ></v-text-field>

                  <label>ສະຖານະການໃຊ້ງານ / Status</label>
                  <v-autocomplete
                  readonly
                    
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
                  readonly
                    hide-details="auto"
                    
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
