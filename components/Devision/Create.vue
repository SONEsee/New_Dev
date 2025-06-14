<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { UseCategoryStore } from "~/stores/category";
import { CallSwal } from "~/composables/global";

const title = "ເພີ່ມຂໍ້ມູນພະແນກ";
const devisionStore = UseCategoryStore();
const categoryStore = UseCategoryStore();

const suggestedId = computed(() => {
  const categories = categoryStore.categories || [];

  if (categories.length === 0) return "D001";

  const validIds = categories
    .map((item) => item.div_id)
    .filter((id) => /^D\d+$/.test(id))
    .map((id) => parseInt(id.slice(1)))
    .filter((num) => !isNaN(num))
    .sort((a, b) => b - a);

  if (validIds.length === 0) return "D001";

  const lastNumber = validIds[0];
  const nextNumber = lastNumber + 1;
  return "D" + nextNumber.toString().padStart(3, "0");
});

const form = ref<any>(null);

const rules = {
  name: [
    (v: string) => !!v || "ກະລຸນາປ້ອນຊື່ປະເພດ",
    (v: string) => v.length >= 2 || "ຊື່ປະເພດຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ",
  ],
};

onMounted(async () => {
  await devisionStore.GetListData();

  if (!categoryStore.form_create_data.div_id) {
    categoryStore.form_create_data.div_id = suggestedId.value;
  }
});

const onSubmit = async () => {
  if (!categoryStore.form_create_data.div_id) {
    const notification = await CallSwal({
      icon: "warning",
      title: "ປອ້ນຂໍ້ມູນ",
      text: "ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ",
    });
    return;
  }

  const isValid = await form.value.validate();
  if (isValid) {
    await categoryStore.CreateCategory();
  }
};
</script>

<template>
  <v-container>
    <v-section style="height: 100vh" class="">
      <GlobalTextTitleLine :title="title" />

      <v-alert color="info" variant="tonal" class="mb-4" density="compact">
        <strong>ID ແນະນຳ:</strong> {{ suggestedId }}
      </v-alert>

      <v-form ref="form" @submit.prevent="onSubmit" class="">
        <v-col cols="12">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.div_id"
                :rules="[(v) => !!v || 'ກະລຸນາປອ້ນ ID!']"
                :placeholder="suggestedId"
                label="ເພິ່ມ ID"
                variant="outlined"
                required
              />
              <v-text-field
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.division_name_la"
                :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ພາສາລາວ!']"
                label="ເພີ່ມຊື່ພາສາລາວ"
                variant="outlined"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                class="mt-4"
                density="compact"
                v-model="categoryStore.form_create_data.division_name_en"
                :rules="[(v) => !!v || 'ກະລຸນາປ້ອນຊື່ພາສາອັງກິດ!']"
                label="ຊື່ພາສາອັງກິດ"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12">
          <v-row>
            <v-col cols="12" class="text-center">
              <v-btn
                type="submit"
                color="primary"
                class="mt-4 mr-3"
                text="ບັນທຶກ"
              />
              <v-btn @click="goPath('/devision')" color="error" class="mt-4">
                ຍົກເລີກ
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-form>
    </v-section>
  </v-container>
</template>
