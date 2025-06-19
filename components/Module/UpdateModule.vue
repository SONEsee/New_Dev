<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";

const moduleStore = ModulesStore();
const route = useRoute();
const router = useRouter();

const id = computed(() => route.query.module_id as string | undefined);

const errorMessage = ref("");

onMounted(() => {
  if (id.value) {
    moduleStore.getModuleDetail(id.value).then(() => {
      if (moduleStore.respons_detail_module) {
        moduleStore.update_form_module = {
          module_name_la:
            moduleStore.respons_detail_module.module_name_la || "",
          module_name_en:
            moduleStore.respons_detail_module.module_name_en || "",
          module_icon: moduleStore.respons_detail_module.module_icon || "",
          module_order: moduleStore.respons_detail_module.module_order || "",
          is_active: moduleStore.respons_detail_module.is_active || "",
          created_by: moduleStore.respons_detail_module.created_by || "",
          module_Id: moduleStore.respons_detail_module.module_Id || "",
        };
      }
    });
  } else {
    moduleStore.getModule();
  }
});

const form = ref();
const title = "ສ້າງຂໍ້ມູນຟັງຊັ້ນ";

const Update = async () => {
  const { valid } = await form.value.validate();

  if (valid && id.value) {
    errorMessage.value = "";

    const result = await moduleStore.updateModule(id.value);
  }
};

const cancelUpdate = () => {
  router.push("/module");
};
</script>

<template>
  <v-container>
    <GlobalTextTitleLine :title="title" />

    <v-alert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-form ref="form" @submit.prevent="Update">
      <v-col cols="12">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.update_form_module.module_name_la"
              density="compact"
              variant="outlined"
              :rules="[(v) => !!v || 'ຊື່ຟັງຊັ້ນພາສາລາວຕ້ອງບໍ່ຫວ່າງ']"
              label="ຊື່ຟັງຊັ້ນ (ພາສາລາວ)"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.update_form_module.module_name_en"
              density="compact"
              variant="outlined"
              :rules="[(v) => !!v || 'ຊື່ຟັງຊັ້ນພາສາອັງກິດຕ້ອງບໍ່ຫວ່າງ']"
              label="ຊື່ຟັງຊັ້ນ (ພາສາອັງກິດ)"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.update_form_module.module_icon"
              density="compact"
              variant="outlined"
              label="ໄອຄອນຟັງຊັ້ນ (ເຊັ່ນ mdi-home)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.update_form_module.module_order"
              density="compact"
              variant="outlined"
              :rules="[(v) => !v || !isNaN(Number(v)) || 'ລຳດັບຕ້ອງເປັນຕົວເລກ']"
              label="ລຳດັບຟັງຊັ້ນ (ເຊັ່ນ 1, 2, 3)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="moduleStore.update_form_module.module_Id"
              density="compact"
              variant="outlined"
              label="ລະຫັດຟັງຊັ້ນ"
              required
            />
          </v-col>
          <!-- <v-col cols="12" md="6">
            <v-autocomplete
              :items="[
                { title: 'ເປີດໃຊ້ງານ', value: 'Y' },
                { title: 'ປິດໃຊ້ງານ', value: 'N' },
              ]"
              item-title="title"
              item-value="value"
              density="compact"
              v-model="moduleStore.update_form_module.is_active"
              :rules="[(v) => !!v || 'ກະລຸນາເລືອກສະຖານະ']"
              label="ສະຖານະໃຊ້ງານ"
              variant="outlined"
              required
            />
          </v-col> -->
        </v-row>

        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            type="submit"
            color="primary"
            class="d-flex justify-center mr-2"
          >
            ບັນທຶກ
          </v-btn>
          <v-btn
            color="error"
            class="d-flex justify-center"
            @click="cancelUpdate"
          >
            ຍົກເລີກ
          </v-btn>
        </v-col>
      </v-col>
    </v-form>
  </v-container>
</template>
