<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const valid = ref(false);
const form = ref();
const router = useRouter();
const route = useRoute();
const glStore = useGlStore();


const subMasterId = route.query.id as string;


const currentSubMaster = computed(() => {
  return glStore.respons_gl_sub_detail || null;
});


const parentGlData = computed(() => {
  return glStore.respons_gl_sup && glStore.respons_gl_sup.length > 0
    ? glStore.respons_gl_sup[0]
    : null;
});

const rules = {
  required: (value: any) => !!value || "ຈຳເປັນຕ້ອງລະບຸ",
  maxLength250: (value: string) =>
    (value && value.length <= 250) || "ຄວາມຍາວບໍ່ເກີນ 250 ຕົວອັກສອນ",
};


onMounted(() => {
  if (subMasterId) {
  
    glStore.getGlDetailSub(Number(subMasterId));
  }
});


watch(
  currentSubMaster,
  (newData) => {
    if (newData) {
      glStore.update_form_gl.glsub_code = newData.glsub_code || "";
      glStore.update_form_gl.glsub_Desc_la = newData.glsub_Desc_la || "";
      glStore.update_form_gl.glsub_Desc_en = newData.glsub_Desc_en || "";

      glStore.create_form_glsup.glcode = newData.gl_code || "";
      glStore.create_form_glsup.gl_code =
        newData.gl_master_id || newData.gl_code || "";

      if (newData.gl_master_id) {
        glStore.glsup_filter_type.request.gl_code = newData.gl_master_id;
        glStore.getGlSupf();
      }
    }
  },
  { immediate: true }
);

const submitTransaction = async () => {
  const { valid: isValid } = await form.value.validate();
  if (isValid) {
    try {
      await glStore.updateGlsub(Number(subMasterId));
      console.log("อัปเดตสำเร็จ");
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
    }
  }
};

const goBack = () => {
  router.push("/gl/glsub/");
};

const title = computed(() => {
  if (currentSubMaster.value) {
    return `ແກ້ໄຂ GL SubMaster: ${currentSubMaster.value.glsub_code}`;
  }
  return "ແກ້ໄຂ GL SubMaster";
});
</script>

<template>
  <v-col cols="12">
    <global-text-title-line :title="title" />

    <v-card v-if="parentGlData" class="mb-4" variant="outlined">
      <v-card-title class="text-h6 bg-blue-lighten-5">
        ຂໍ້ມູນ GL ແມ່
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-1">ລະຫັດ GL:</div>
            <div class="text-body-1 font-weight-bold">
              {{ parentGlData.gl_code }}
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-1">ຊື່ບັນຊີ (ລາວ):</div>
            <div class="text-body-1">{{ parentGlData.gl_Desc_la }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-1">ຊື່ບັນຊີ (ອັງກິດ):</div>
            <div class="text-body-1">{{ parentGlData.gl_Desc_en }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 mb-1">ປະເພດບັນຊີ:</div>
            <div class="text-body-1">
              {{
                parentGlData.category === "1"
                  ? "ຊັບສິນ"
                  : parentGlData.category === "2"
                  ? "ໜີ້ສິນ"
                  : parentGlData.category === "3"
                  ? "ທືນ"
                  : parentGlData.category === "4"
                  ? "ລາຍຈ່າຍ"
                  : parentGlData.category === "5"
                  ? "ລາຍຮັບ"
                  : "ອື່ນໆ"
              }}
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-form ref="form" @submit.prevent="submitTransaction">
      <v-card variant="outlined">
        <v-card-title class="text-h6 bg-orange-lighten-5">
          <v-icon icon="mdi-pencil" class="mr-2"></v-icon>
          ແກ້ໄຂ GL SubMaster
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="glStore.create_form_glsup.glcode"
                density="compact"
                variant="outlined"
                label="ລະຫັດ GL ແມ່"
                readonly
                prepend-inner-icon="mdi-lock"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="glStore.update_form_gl.glsub_code"
                density="compact"
                label="ລະຫັດ GL SubMaster"
                variant="outlined"
                readonly
                prepend-inner-icon="mdi-lock"
                hint="ບໍ່ສາມາດແກ້ໄຂລະຫັດໄດ້"
                persistent-hint
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="glStore.update_form_gl.glsub_Desc_la"
                :rules="[rules.required, rules.maxLength250]"
                density="compact"
                variant="outlined"
                label="ຊື່ບັນຊີຍ່ອຍ (ພາສາລາວ)"
                maxlength="250"
                required
                counter="250"
                prepend-inner-icon="mdi-text"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="glStore.update_form_gl.glsub_Desc_en"
                :rules="[rules.maxLength250]"
                density="compact"
                variant="outlined"
                label="ຊື່ບັນຊີຍ່ອຍ (ພາສາອັງກິດ)"
                maxlength="250"
                counter="250"
                prepend-inner-icon="mdi-text"
              />
            </v-col>

            <v-col cols="12" v-if="currentSubMaster">
              <v-card variant="tonal" color="blue-grey-lighten-4">
                <v-card-text>
                  <div class="text-subtitle-2 mb-2">ຂໍ້ມູນເພີ່ມເຕີມ:</div>
                  <v-row>
                    <v-col cols="12" md="3">
                      <div class="text-caption text-grey">ສະຖານະ:</div>
                      <v-chip
                        :color="
                          currentSubMaster.Auth_Status === 'A'
                            ? 'success'
                            : currentSubMaster.Auth_Status === 'U'
                            ? 'warning'
                            : 'error'
                        "
                        size="small"
                        variant="flat"
                      >
                        {{
                          currentSubMaster.Auth_Status === "A"
                            ? "Approved"
                            : currentSubMaster.Auth_Status === "U"
                            ? "Pending"
                            : "Rejected"
                        }}
                      </v-chip>
                    </v-col>
                    <v-col cols="12" md="3">
                      <div class="text-caption text-grey">ຜູ້ສ້າງ:</div>
                      <div class="text-body-2">
                        {{ currentSubMaster.Maker_Id || "N/A" }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="3">
                      <div class="text-caption text-grey">ວັນທີສ້າງ:</div>
                      <div class="text-body-2">
                        {{
                          currentSubMaster.Maker_DT_Stamp
                            ? new Date(
                                currentSubMaster.Maker_DT_Stamp
                              ).toLocaleDateString("lo-LA")
                            : "N/A"
                        }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="3">
                      <div class="text-caption text-grey">ID:</div>
                      <div class="text-body-2">
                        {{ currentSubMaster.glsub_id || "N/A" }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" v-show="false">
              <v-text-field
                v-model="glStore.create_form_glsup.gl_code"
                density="compact"
                variant="outlined"
                label="gl_master_id"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row class="mt-4">
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            type="submit"
            color="primary"
            class="mr-2"
            prepend-icon="mdi-content-save-edit"
            :loading="glStore.isloading"
          >
            ບັນທຶກການແກ້ໄຂ
          </v-btn>
          <v-btn color="error" prepend-icon="mdi-cancel" @click="goBack">
            ຍົກເລີກ
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- <v-card v-if="currentSubMaster" class="mt-4" variant="outlined">
      <v-card-title class="text-subtitle-1">Debug Info</v-card-title>
      <v-card-text>
        <pre>{{ { currentSubMaster, formData: glStore.create_form_glsup } }}</pre>
      </v-card-text>
    </v-card> -->
  </v-col>
</template>
