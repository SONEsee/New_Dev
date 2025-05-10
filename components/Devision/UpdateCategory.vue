<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { UseCategoryStore } from "~/stores/category";

const store = UseCategoryStore();
const route = useRoute();
const loading = ref(false);
const form = ref<any>(null);

// Computed property ສຳລັບຂໍ້ມູນໝວດໝູ່
const categoryData = computed(() => {
  return store.response_detail_query_data.length > 0
    ? store.response_detail_query_data[0]
    : null;
});


const updatedName = ref("");


onMounted(async () => {
  const id = route.query.id?.toString() ?? null;
  if (id) {
    loading.value = true;
    await store.GetDetailCategory(id);
    if (categoryData.value) {
      updatedName.value = categoryData.value.Name; 
      store.form_update_data.ID = categoryData.value.ID; 
    }
    loading.value = false;
  }
});

// ຟັງຊັນ submit ສຳລັບການອັບເດດ
const submit = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    loading.value = true;
    store.form_update_data.Name = updatedName.value; 
    await store.UpdateCategory(route.query.id?.toString() ?? null);
    loading.value = false;
  }
};
</script>

<template>
  <section class="bg-gray-50 min-h-screen py-8 px-4">
    <v-container>
      <v-card class="mx-auto rounded-lg shadow-lg" max-width="800" elevation="3">
        <v-card-title class="font-weight-bold pa-6 bg-primary text-white">
          <v-icon icon="mdi-view-list" class="mr-2" />
          ລາຍລະອຽດໝວດໝູ່
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Loading State -->
          <div v-if="loading" class="d-flex justify-center align-center py-8">
            <v-progress-circular indeterminate color="primary" size="64" />
          </div>

          <!-- Form ສຳລັບການແກ້ໄຂ -->
          <template v-else-if="categoryData">
            <v-form ref="form" @submit.prevent="submit">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="updatedName"
                    label="ຊື່ໝວດໝູ່"
                    variant="outlined"
                    item="hi"
                    density="comfortable"
                    prepend-inner-icon="mdi-format-title"
                    :rules="[v => !!v.trim() || 'ກະລຸນາປ້ອນຊື່ໝວດໝູ່']"
                    class="mb-4"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="categoryData.ID"
                    label="ລະຫັດ"
                    readonly
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-identifier"
                    class="mb-4"
                  />
                </v-col>
              </v-row>
              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                class="mt-4"
              >
                ບັນທຶກການແກ້ໄຂ
              </v-btn>
            </v-form>
          </template>

          <!-- No Data State -->
          <div v-else class="text-center py-8">
            <v-icon size="64" color="grey" class="mb-4">
              mdi-folder-off-outline
            </v-icon>
            <div class="text-h6 text-grey">ບໍ່ພົບຂໍ້ມູນໝວດໝູ່</div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </section>
</template>

<style scoped>
.shadow-lg {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>